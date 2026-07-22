// frontend/src/components/customer/DeliveryTracking.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
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
      } catch (error) {
        toast.error('Could not load delivery details');
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socketRef.current.emit('track-order', orderId);

    socketRef.current.on('rider-location-update', (data) => {
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">📦 Track Your Order</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
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
              {delivery.status}
            </span>
          </div>
        </div>
      </div>

      {rider && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">🏍️</div>
            <div>
              <p className="font-semibold">{rider.name}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaStar className="text-yellow-400" /> {rider.rating || 0} ({rider.totalDeliveries || 0} deliveries)
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaPhone className="text-gray-400" /> {rider.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {riderLocation && delivery.status !== 'delivered' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 h-80">
          <MapContainer
            center={[riderLocation.lat, riderLocation.lng]}
            zoom={14}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={[riderLocation.lat, riderLocation.lng]}>
              <Popup>Rider is here 🚴</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {delivery.status === 'delivered' && (
        <div className="text-center text-green-600 font-semibold py-8">
          ✅ Your order has been delivered! Thank you.
        </div>
      )}
    </div>
  );
};

export default DeliveryTracking;