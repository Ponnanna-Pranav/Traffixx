import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for better visual distinction
const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


// Component to dynamically update map center
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

// Component to handle map clicks
const LocationSelector = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            if (onMapClick) {
                onMapClick(e.latlng);
            }
        },
    });
    return null;
};

export default function MapComponent({ userLocation, pickupCoords, dropoffCoords, onMapClick, routeGeometry }) {
    // Default center (e.g., center of India / local city usually)
    const defaultCenter = [12.9716, 77.5946]; // Bangalore coordinates as default
    const center = userLocation || pickupCoords || defaultCenter;

    return (
        <MapContainer
            center={defaultCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Rapido-esque clean bright map style
            />

            <ChangeView center={center} zoom={15} />

            <LocationSelector onMapClick={onMapClick} />

            {/* Render pickup marker */}
            {pickupCoords && (
                <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={pickupIcon}>
                    <Popup>Pickup Location</Popup>
                </Marker>
            )}

            {/* Render dropoff marker */}
            {dropoffCoords && (
                <Marker position={[dropoffCoords.lat, dropoffCoords.lng]} icon={dropoffIcon}>
                    <Popup>Dropoff Location</Popup>
                </Marker>
            )}

            {/* Render route path if geometry is available */}
            {routeGeometry && (
                <Polyline positions={routeGeometry} color="green" weight={5} opacity={0.8} />
            )}

            {/* Render user location if no pickup set */}
            {userLocation && !pickupCoords && (
                <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>Your Current Location</Popup>
                </Marker>
            )}

        </MapContainer>
    );
}
