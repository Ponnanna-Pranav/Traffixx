import React, { useState, useEffect } from 'react';
import client from '../api/client';
import PaymentModal from '../components/PaymentModal';
import MapComponent from '../components/MapComponent';
import { MapPin, Navigation, Clock, CreditCard, CheckCircle2, ChevronRight, Bike, Car, Truck, LocateFixed } from 'lucide-react';

export default function RiderDashboard() {
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');

    // Coordinates and interactive map state
    const [pickupCoords, setPickupCoords] = useState(null);
    const [dropoffCoords, setDropoffCoords] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [selectingMode, setSelectingMode] = useState('pickup'); // 'pickup' or 'dropoff' or null
    const [locationLoading, setLocationLoading] = useState(false);
    const [distance, setDistance] = useState(0);
    const [routeGeometry, setRouteGeometry] = useState(null);

    const [selectedVehicle, setSelectedVehicle] = useState('BIKE'); // Default vehicle
    const [rides, setRides] = useState([]);
    const [activeTab, setActiveTab] = useState('BOOK'); // BOOK or HISTORY

    const email = localStorage.getItem('email');

    // Helper for reverse geocoding
    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            return data.display_name;
        } catch (error) {
            console.error("Geocoding failed", error);
            return null;
        }
    };

    // Fetch user location on mount
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation({ lat, lng });
                    setPickupCoords({ lat, lng });

                    const address = await reverseGeocode(lat, lng);
                    if (address) setPickup(address);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Fallback to default mock locations
                    const lat = 12.9716;
                    const lng = 77.5946;
                    setUserLocation({ lat, lng });
                    setPickupCoords({ lat, lng });
                    setPickup("Bangalore, India");
                }
            );
        }
    }, []);

    const handleMapClick = async ({ lat, lng }) => {
        if (activeTab !== 'BOOK') return;
        if (!selectingMode) return;

        setLocationLoading(true);
        const address = await reverseGeocode(lat, lng);

        if (selectingMode === 'pickup') {
            setPickupCoords({ lat, lng });
            if (address) setPickup(address);
            setSelectingMode('dropoff');
            calculateDistance({ lat, lng }, dropoffCoords);
        } else if (selectingMode === 'dropoff') {
            setDropoffCoords({ lat, lng });
            if (address) setDropoff(address);
            setSelectingMode(null);
            calculateDistance(pickupCoords, { lat, lng });
        }
        setLocationLoading(false);
    };

    // Haversine formula to calculate distance in km
    const calculateDistance = (pickup, dropoff) => {
        if (!pickup || !dropoff) {
            setDistance(0);
            return;
        }

        const toRad = (value) => value * Math.PI / 180;
        const R = 6371; // Earth's radius in km

        const dLat = toRad(dropoff.lat - pickup.lat);
        const dLon = toRad(dropoff.lng - pickup.lng);
        const lat1 = toRad(pickup.lat);
        const lat2 = toRad(dropoff.lat);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;

        setDistance(dist);
        setRouteGeometry(null); // Clear route geometry if falling back to Haversine
    };

    const fetchRouteData = async (pickup, dropoff) => {
        if (!pickup || !dropoff) {
            setDistance(0);
            setRouteGeometry(null);
            return;
        }
        try {
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?geometries=geojson`);
            const data = await res.json();

            if (data && data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                // Convert coordinates from [lng, lat] (GeoJSON) to [lat, lng] (Leaflet)
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                setRouteGeometry(coordinates);
                // We use OSRM's actual distance for better accuracy if available
                if (route.distance) {
                    setDistance(route.distance / 1000); // meters to kilometers
                }
            } else {
                // Fallback to Haversine if OSRM fails to find a route
                console.warn("OSRM failed to find a route, falling back to Haversine distance.");
                calculateDistance(pickup, dropoff);
            }
        } catch (error) {
            console.error("Failed to fetch route from OSRM:", error);
            // Fallback to Haversine on network error
            calculateDistance(pickup, dropoff);
        }
    };

    // Effect to fetch route data whenever pickup or dropoff coordinates change
    useEffect(() => {
        if (pickupCoords && dropoffCoords) {
            fetchRouteData(pickupCoords, dropoffCoords);
        } else {
            setDistance(0);
            setRouteGeometry(null);
        }
    }, [pickupCoords, dropoffCoords]);

    // Calculate dynamic prices
    // Base fares in INR: Bike = ₹20, Auto = ₹30, Cab = ₹50
    // Per km in INR: Bike = ₹8, Auto = ₹15, Cab = ₹22
    const getPrice = (type) => {
        if (distance === 0) return null;

        let base = 0;
        let perKm = 0;

        switch (type) {
            case 'BIKE': base = 20; perKm = 8; break;
            case 'AUTO': base = 30; perKm = 15; break;
            case 'CAB': base = 50; perKm = 22; break;
            default: return 0;
        }

        // Return rounded to nearest integer for INR
        return Math.round(base + (distance * perKm));
    };

    const fetchHistory = async () => {
        try {
            const res = await client.get(`/rides/history?email=${email}`);
            setRides(res.data);
        } catch (err) {
            console.error('Failed to fetch history', err);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleBook = async (e) => {
        e.preventDefault();

        const pLat = pickupCoords ? pickupCoords.lat : 12.9716;
        const pLng = pickupCoords ? pickupCoords.lng : 77.5946;
        const dLat = dropoffCoords ? dropoffCoords.lat : 12.9352;
        const dLng = dropoffCoords ? dropoffCoords.lng : 77.6245;

        try {
            await client.post(`/rides/request?email=${email}`, {
                pickupLocation: pickup,
                dropoffLocation: dropoff,
                pickupLat: pLat,
                pickupLng: pLng,
                dropoffLat: dLat,
                dropoffLng: dLng,
                vehicleType: selectedVehicle
            });
            alert('Ride requested successfully!');
            setPickup('');
            setDropoff('');
            setPickupCoords(null);
            setDropoffCoords(null);
            setSelectingMode('pickup');
            setActiveTab('HISTORY');
            fetchHistory();
        } catch (err) {
            alert('Error requesting ride');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'REQUESTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'COMPLETED': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const activeRide = rides.find(r => ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status));

    return (
        <div className="relative w-full min-h-[calc(100vh-4rem)] bg-gray-100 flex justify-center sm:justify-start">

            {/* Background Map Component */}
            <div className="fixed top-[4rem] left-0 right-0 bottom-0 z-0 pointer-events-auto">
                <MapComponent
                    userLocation={userLocation}
                    pickupCoords={pickupCoords}
                    dropoffCoords={dropoffCoords}
                    onMapClick={handleMapClick}
                    routeGeometry={routeGeometry}
                />
            </div>

            {/* Desktop View Constraint - Map Full Screen + Side/Bottom Panel */}
            <div className="relative z-10 w-full max-w-sm mx-auto sm:ml-4 sm:my-4 shadow-2xl sm:rounded-3xl flex flex-col pointer-events-none self-end sm:self-auto sm:h-auto sm:max-h-[calc(100vh-8rem)]">

                {/* Top spacer handles visual alignment */}
                <div className="flex-1 min-h-[45vh] sm:min-h-0"></div>

                {/* Floating Card UI Container */}
                <div className="pointer-events-auto flex flex-col mt-auto bg-white sm:rounded-3xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">

                    {/* Handle bar for bottom sheet visual (mobile only) */}
                    <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                    </div>

                    <div className="px-6 pb-6 pt-4 flex flex-col flex-grow bg-white sm:rounded-b-3xl">
                        {/* Tabs */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setActiveTab('BOOK')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'BOOK' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Book a Ride
                            </button>
                            <button
                                onClick={() => setActiveTab('HISTORY')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'HISTORY' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                My Rides
                            </button>
                        </div>

                        {activeTab === 'BOOK' && (
                            <form onSubmit={handleBook} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

                                <div className="space-y-3 relative">
                                    {/* Location Selecting Mode Indicator */}
                                    {locationLoading && (
                                        <div className="text-xs text-center text-[#F9C935] font-bold animate-pulse">
                                            Fetching address...
                                        </div>
                                    )}
                                    {selectingMode && !locationLoading && (
                                        <div className="text-xs text-center bg-blue-100 text-blue-800 py-1 rounded-md font-bold">
                                            Tap on the map to set {selectingMode}
                                        </div>
                                    )}

                                    {/* Vertical connecting line */}
                                    <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200 z-0 hidden sm:block"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-1 focus-within:border-[#F9C935] focus-within:ring-2 focus-within:ring-[#F9C935]/20 transition-all">
                                            <div className="p-3">
                                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Pickup location"
                                                value={pickup}
                                                onChange={(e) => setPickup(e.target.value)}
                                                onFocus={() => setSelectingMode('pickup')}
                                                className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-900 placeholder-gray-400 py-3 pr-4 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-1 focus-within:border-[#F9C935] focus-within:ring-2 focus-within:ring-[#F9C935]/20 transition-all">
                                            <div className="p-3">
                                                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></div>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Where to?"
                                                value={dropoff}
                                                onChange={(e) => setDropoff(e.target.value)}
                                                onFocus={() => setSelectingMode('dropoff')}
                                                className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-900 placeholder-gray-400 py-3 pr-4 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Selection Row */}
                                <div className="mt-6 mb-2">
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Ride Type</p>
                                        {distance > 0 && (
                                            <p className="text-xs font-bold text-gray-800 bg-[#F9C935]/20 border border-[#F9C935]/50 px-2 py-1 rounded-md">
                                                {distance.toFixed(1)} km
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {/* Bike Option */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedVehicle('BIKE')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${selectedVehicle === 'BIKE' ? 'border-[#F9C935] bg-[#F9C935]/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                        >
                                            <Bike className={`w-8 h-8 mb-2 ${selectedVehicle === 'BIKE' ? 'text-black' : 'text-gray-400'}`} />
                                            <span className="text-xs font-bold text-gray-900">Bike</span>
                                            {distance > 0 ? (
                                                <span className="text-sm font-black mt-1">₹{getPrice('BIKE')}</span>
                                            ) : (
                                                <span className="text-[10px] text-gray-500 font-bold mt-1">Select route</span>
                                            )}
                                        </button>

                                        {/* Auto Option */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedVehicle('AUTO')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${selectedVehicle === 'AUTO' ? 'border-[#F9C935] bg-[#F9C935]/10 shadow-[0_4px_12px_rgba(249,201,53,0.2)]' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                        >
                                            <Truck className={`w-8 h-8 mb-2 ${selectedVehicle === 'AUTO' ? 'text-black' : 'text-gray-400'}`} />
                                            <span className="text-xs font-bold text-gray-900">Auto</span>
                                            {distance > 0 ? (
                                                <span className="text-sm font-black mt-1">₹{getPrice('AUTO')}</span>
                                            ) : (
                                                <span className="text-[10px] text-gray-500 font-bold mt-1">Select route</span>
                                            )}
                                        </button>

                                        {/* Cab Option */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedVehicle('CAB')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${selectedVehicle === 'CAB' ? 'border-[#F9C935] bg-[#F9C935]/10 shadow-[0_4px_12px_rgba(249,201,53,0.2)]' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                        >
                                            <Car className={`w-8 h-8 mb-2 ${selectedVehicle === 'CAB' ? 'text-black' : 'text-gray-400'}`} />
                                            <span className="text-xs font-bold text-gray-900">Cab</span>
                                            {distance > 0 ? (
                                                <span className="text-sm font-black mt-1">₹{getPrice('CAB')}</span>
                                            ) : (
                                                <span className="text-[10px] text-gray-500 font-bold mt-1">Select route</span>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#F9C935] hover:bg-[#ebbb25] text-black font-black text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(249,201,53,0.3)] transition-all transform tracking-wide mt-4"
                                    disabled={!pickup || !dropoff}
                                >
                                    {activeRide ? 'Ride in Progress' : 'Book Ride'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'HISTORY' && (
                            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {rides.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <MapPin className="w-12 h-12 text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">No rides booked yet.</p>
                                    </div>
                                ) : (
                                    rides.slice().reverse().map(ride => (
                                        <div key={ride.rideId} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-[#F9C935] transition-colors">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center space-x-2">
                                                    {ride.vehicleType === 'BIKE' && <Bike className="w-5 h-5 text-gray-700" />}
                                                    {ride.vehicleType === 'AUTO' && <Truck className="w-5 h-5 text-gray-700" />}
                                                    {(!ride.vehicleType || ride.vehicleType === 'CAB') && <Car className="w-5 h-5 text-gray-700" />}
                                                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${getStatusColor(ride.status)}`}>
                                                        {ride.status}
                                                    </span>
                                                </div>
                                                <span className="font-black text-gray-900">₹{ride.fare?.toFixed(2) || '0.00'}</span>
                                            </div>

                                            <div className="flex items-center text-sm font-medium text-gray-600 space-x-2">
                                                <span className="truncate flex-1">{ride.pickupLocation}</span>
                                                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                                                <span className="truncate flex-1 text-right">{ride.dropoffLocation}</span>
                                            </div>

                                            {ride.status === 'COMPLETED' && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                                    <PaymentModal ride={ride} onSuccess={fetchHistory} />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div >
            </div >

            {/* Removed duplicate global PaymentModal that used undefined states. It is now handled inline per ride history item. */}
        </div >
    );
}
