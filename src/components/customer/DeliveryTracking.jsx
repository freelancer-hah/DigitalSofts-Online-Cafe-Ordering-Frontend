import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom rider icon
const riderIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const res = await api.get(`/deliveries/order/${orderId}`);
        setDelivery(res.data);
        
        if (res.data.riderId?.location?.coordinates) {
          const [lng, lat] = res.data.riderId.location.coordinates;
          setRiderLocation({ lat, lng });
        }

        // Destination (customer address) — agar order mein coordinates hain
        if (res.data.orderId?.deliveryAddress?.coordinates) {
          const [lng, lat] = res.data.orderId.deliveryAddress.coordinates;
          setDestination({ lat, lng });
        }
      } catch (error) {
        toast.error('Could not load delivery details');
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();

    // ✅ Socket for live location
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socketRef.current.emit('track-order', orderId);

    socketRef.current.on('rider-location-update', (data) => {
      console.log('📍 Rider location update:', data);
      setRiderLocation({ lat: data.lat, lng: data.lng });
    });

    return () => {
      socketRef.current.emit('leave-order', orderId);
      socketRef.current.disconnect();
    };
  }, [orderId]);

  if (loading) return <div className="flex justify-center py-20">Loading tracking...</div>;
  if (!delivery) return <div className="text-center py-20 text-gray-500">No delivery found.</div>;

  const rider = delivery.riderId;
  const mapCenter = riderLocation || { lat: 24.8607, lng: 67.0011 }; // Default Karachi

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">📦 Track Your Order</h2>

      {/* Order Info */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Order #</p>
            <p className="font-semibold">{delivery.orderId?.orderNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              delivery.status === 'delivered' ? 'bg-green-100 text-green-600' :
              delivery.status === 'on_way' ? 'bg-blue-100 text-blue-600' :
              'bg-yellow-100 text-yellow-600'
            }`}>
              {delivery.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        {rider && (
          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="font-medium">🏍️ {rider.name}</span>
            <span className="text-gray-500">📱 {rider.phone}</span>
            <span className="text-xs text-gray-400">⭐ {rider.rating || 0}</span>
          </div>
        )}
      </div>

      {/* ✅ Map with Rider & Destination */}
      <div className="bg-white rounded-xl shadow-sm border p-2 h-96">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Rider Marker — Live */}
          {riderLocation && (
            <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold">🏍️ {rider?.name || 'Rider'}</p>
                  <p className="text-sm text-gray-500">📍 Moving to you</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Destination Marker */}
          {destination && (
            <Marker 
              position={[destination.lat, destination.lng]} 
              icon={new L.Icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
                className: 'leaflet-marker-green', // Optional CSS class
              })}
            >
              <Popup>📍 Your Delivery Address</Popup>
            </Marker>
          )}

          {/* ✅ Route Line — Rider se Destination tak */}
          {riderLocation && destination && (
            <Polyline
              positions={[
                [riderLocation.lat, riderLocation.lng],
                [destination.lat, destination.lng]
              ]}
              color="blue"
              weight={3}
              opacity={0.7}
              dashArray="5, 10" // Dashed line
            />
          )}
        </MapContainer>
      </div>

      {delivery.status === 'delivered' && (
        <div className="text-center text-green-600 font-semibold py-4 mt-4 bg-green-50 rounded-xl border border-green-200">
          ✅ Your order has been delivered! Thank you.
        </div>
      )}
    </div>
  );
};

export default DeliveryTracking;