import React, { useState, useEffect } from 'react';
import client from '../api/client';
import MapComponent from '../components/MapComponent';
import { Radio, Car, Navigation, CheckCircle2, ChevronRight, Play, Check, Bike, Truck } from 'lucide-react';

export default function DriverDashboard() {
    const [availableRides, setAvailableRides] = useState([]);
    const [myRides, setMyRides] = useState([]);
    const [activeTab, setActiveTab] = useState('AVAILABLE');
    const [hoveredRide, setHoveredRide] = useState(null);
    const [routeGeometry, setRouteGeometry] = useState(null);

    const fetchData = async () => {
        try {
            const [availableRes, historyRes] = await Promise.all([
                client.get('/rides/available'),
                client.get('/rides/history')
            ]);
            setAvailableRides(availableRes.data);
            setMyRides(historyRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleAccept = async (rideId) => {
        try {
            await client.post(`/rides/${rideId}/accept`);
            fetchData();
            setActiveTab('MY_RIDES');
        } catch (err) {
            alert("Error accepting ride, it might be taken.");
        }
    };

    const handleUpdateStatus = async (rideId, status) => {
        try {
            await client.put(`/rides/${rideId}/status?status=${status}`);
            fetchData();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'COMPLETED': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const activeCurrentRide = myRides.find(r => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status));
    const focusedRide = hoveredRide || activeCurrentRide || (availableRides.length > 0 ? availableRides[0] : null);

    const pickupCoords = focusedRide && focusedRide.pickupLat ? { lat: focusedRide.pickupLat, lng: focusedRide.pickupLng } : null;
    const dropoffCoords = focusedRide && focusedRide.dropoffLat ? { lat: focusedRide.dropoffLat, lng: focusedRide.dropoffLng } : null;

    const fetchRouteData = async (pickup, dropoff) => {
        if (!pickup || !dropoff || !pickup.lat || !dropoff.lat) {
            setRouteGeometry(null);
            return;
        }
        try {
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?geometries=geojson`);
            const data = await res.json();

            if (data && data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                setRouteGeometry(coordinates);
            }
        } catch (error) {
            console.error("Failed to fetch route:", error);
        }
    };

    useEffect(() => {
        if (pickupCoords && dropoffCoords) {
            fetchRouteData(pickupCoords, dropoffCoords);
        } else {
            setRouteGeometry(null);
        }
    }, [pickupCoords?.lat, pickupCoords?.lng, dropoffCoords?.lat, dropoffCoords?.lng]);

    return (
        <div className="relative w-full min-h-[calc(100vh-4rem)] bg-gray-100 flex justify-center sm:justify-start">

            {/* Background Map Component */}
            <div className="fixed top-[4rem] left-0 right-0 bottom-0 z-0 pointer-events-auto">
                <MapComponent
                    pickupCoords={pickupCoords}
                    dropoffCoords={dropoffCoords}
                    routeGeometry={routeGeometry}
                />
            </div>

            {/* Desktop View Constraint - Map Full Screen + Side/Bottom Panel */}
            <div className="relative z-10 w-full max-w-md mx-auto sm:ml-4 sm:my-4 shadow-2xl sm:rounded-3xl flex flex-col pointer-events-none self-end sm:self-auto sm:h-auto sm:max-h-[calc(100vh-8rem)]">

                {/* Header Overlay */}
                <div className="p-4 pointer-events-auto mt-4 px-6 fixed top-16 left-0 right-0 max-w-md mx-auto z-20">
                    <div className="bg-black/90 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center shadow-lg border border-gray-800">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                            <span className="text-white font-bold text-sm tracking-wide">You're Online</span>
                        </div>
                        <div className="bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300">
                            {availableRides.length} Requests
                        </div>
                    </div>
                </div>

                {/* Top spacer handles visual alignment */}
                <div className="flex-1 min-h-[45vh] sm:min-h-0"></div>

                {/* Floating Card UI Container */}
                <div className="pointer-events-auto flex flex-col mt-auto bg-white sm:rounded-3xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">

                    {/* Handle bar */}
                    <div className="w-full flex justify-center pt-3 pb-1">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                    </div>

                    <div className="px-6 pb-6 pt-2 flex flex-col flex-grow">
                        {/* Tabs */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setActiveTab('AVAILABLE')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'AVAILABLE' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Available
                            </button>
                            <button
                                onClick={() => setActiveTab('MY_RIDES')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'MY_RIDES' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                My Rides
                            </button>
                        </div>

                        {activeTab === 'AVAILABLE' && (
                            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {availableRides.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Radio className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Scanning...</h3>
                                        <p className="text-gray-500 font-medium text-sm">Waiting for rider requests nearby.</p>
                                    </div>
                                ) : (
                                    availableRides.map(ride => (
                                        <div
                                            key={ride.rideId}
                                            onMouseEnter={() => setHoveredRide(ride)}
                                            onMouseLeave={() => setHoveredRide(null)}
                                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-[#F9C935] transition-all transform hover:-translate-y-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-2xl font-black text-gray-900">₹{ride.fare?.toFixed(2) || '0.00'}</span>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-sm font-bold text-gray-500">{ride.distance || '0'} km</span>
                                                        <span className="text-xs font-bold text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-md flex items-center">
                                                            {ride.vehicleType === 'BIKE' && <Bike className="w-3 h-3 mr-1" />}
                                                            {ride.vehicleType === 'AUTO' && <Truck className="w-3 h-3 mr-1" />}
                                                            {(!ride.vehicleType || ride.vehicleType === 'CAB') && <Car className="w-3 h-3 mr-1" />}
                                                            {ride.vehicleType || 'CAB'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAccept(ride.rideId)}
                                                    className="bg-[#F9C935] hover:bg-[#ebbb25] text-black font-black py-2 px-6 rounded-xl shadow-lg shadow-[#F9C935]/30 transition-all flex items-center active:scale-95"
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                                                <div className="flex items-center text-sm font-semibold text-gray-700">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                                                    <span className="truncate">{ride.pickupLocation}</span>
                                                </div>
                                                <div className="pl-[3px] border-l-2 border-gray-200 ml-1 py-1 h-2 my-1"></div>
                                                <div className="flex items-center text-sm font-semibold text-gray-700">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
                                                    <span className="truncate">{ride.dropoffLocation}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'MY_RIDES' && (
                            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {myRides.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <Car className="w-12 h-12 text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">Accept a ride request to see it here.</p>
                                    </div>
                                ) : (
                                    myRides.map(ride => (
                                        <div
                                            key={ride.rideId}
                                            onMouseEnter={() => setHoveredRide(ride)}
                                            onMouseLeave={() => setHoveredRide(null)}
                                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-colors">
                                            <div className="flex flex-col justify-between h-full">
                                                <div className="mb-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className={`px-2.5 py-1 text-[11px] font-black tracking-wider uppercase rounded-lg border shadow-sm ${getStatusColor(ride.status)}`}>
                                                            {ride.status}
                                                        </span>
                                                        <span className="text-base font-black text-gray-900">₹{ride.fare?.toFixed(2) || '0.00'}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-700 font-semibold space-x-2">
                                                        <span className="truncate flex-1">{ride.pickupLocation}</span>
                                                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                                                        <span className="truncate flex-1 text-right">{ride.dropoffLocation}</span>
                                                    </div>
                                                </div>

                                                <div className="flex space-x-3 mt-2 border-t border-gray-50 pt-4">
                                                    {ride.status === 'ACCEPTED' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(ride.rideId, 'IN_PROGRESS')}
                                                            className="flex-1 flex justify-center items-center bg-black text-white font-bold px-4 py-3 rounded-xl shadow-lg hover:bg-gray-800 transition-colors active:scale-95"
                                                        >
                                                            <Play className="w-4 h-4 mr-2" /> Start Trip
                                                        </button>
                                                    )}
                                                    {ride.status === 'IN_PROGRESS' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(ride.rideId, 'COMPLETED')}
                                                            className="flex-1 flex justify-center items-center bg-[#F9C935] text-black font-black px-4 py-3 rounded-xl shadow-lg shadow-[#F9C935]/30 hover:bg-[#ebbb25] transition-colors active:scale-95"
                                                        >
                                                            <Check className="w-4 h-4 mr-2" /> Complete Trip
                                                        </button>
                                                    )}
                                                    {(ride.status === 'COMPLETED' || ride.status === 'PAID') && (
                                                        <div className="text-center w-full text-sm font-bold text-gray-500 bg-gray-50 py-3 rounded-xl border border-gray-200">
                                                            Trip Finished
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
