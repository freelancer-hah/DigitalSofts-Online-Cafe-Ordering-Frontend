// frontend/src/components/rider/RiderDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { FaMotorcycle, FaMapMarkerAlt, FaPhone, FaStar } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RiderDashboard = () => {
  const navigate = useNavigate();
  const { user, isRider, loading: authLoading } = useAuth();

  const [deliveries, setDeliveries] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riderStatus, setRiderStatus] = useState('offline');
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [currentDeliveryId, setCurrentDeliveryId] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null); // for map destination
  const watchIdRef = React.useRef(null);
  const socketRef = React.useRef(null);

  // Redirect if not a rider
  useEffect(() => {
    if (!authLoading && !isRider) {
      navigate('/rider/login');
    }
  }, [authLoading, isRider, navigate]);

  // Fetch data and connect socket
  useEffect(() => {
    if (isRider) {
      fetchData();
      if (!socketRef.current) {
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
      }
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isRider]);

  // Start/stop location sharing
  useEffect(() => {
    if (riderStatus === 'online' && currentDeliveryId) {
      startLocationSharing();
    } else {
      stopLocationSharing();
    }
    return () => stopLocationSharing();
  }, [riderStatus, currentDeliveryId]);

  const fetchData = async () => {
    try {
      const deliveriesRes = await api.get('/deliveries/my');
      setDeliveries(deliveriesRes.data);
      const assigned = deliveriesRes.data.filter(d => d.status === 'assigned');
      setAssignedOrders(assigned);

      // Find active delivery (on_way or picked_up)
      const active = deliveriesRes.data.find(d => d.status === 'on_way' || d.status === 'picked_up');
      if (active) {
        setCurrentDeliveryId(active._id);
        setCurrentOrder(active.orderId); // contains address
      } else {
        setCurrentDeliveryId(null);
        setCurrentOrder(null);
      }

      const profileRes = await api.get('/riders/profile');
      setRiderStatus(profileRes.data.status || 'offline');
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const startLocationSharing = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    if (watchIdRef.current) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        api.put('/riders/location', { lat: latitude, lng: longitude }).catch(console.error);
        // Emit via socket for live tracking
        if (socketRef.current && currentDeliveryId) {
          const order = deliveries.find(d => d._id === currentDeliveryId);
          socketRef.current.emit('rider-location', {
            deliveryId: currentDeliveryId,
            orderId: order?.orderId?._id,
            lat: latitude,
            lng: longitude
          });
        }
      },
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true, interval: 5000 }
    );
    setIsSharingLocation(true);
  };

  const stopLocationSharing = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsSharingLocation(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await api.put('/riders/status', { status });
      setRiderStatus(status);
      toast.success(`Status updated to ${status}`);
      if (status === 'offline') stopLocationSharing();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const acceptDelivery = async (deliveryId) => {
    try {
      await api.put(`/deliveries/${deliveryId}/accept`);
      toast.success('Delivery accepted');
      fetchData();
    } catch (error) {
      toast.error('Failed to accept');
    }
  };

  const updateDeliveryStatus = async (deliveryId, action) => {
    try {
      await api.put(`/deliveries/${deliveryId}/${action}`);
      toast.success(`Delivery ${action} successfully`);
      fetchData();
      if (action === 'start') {
        setCurrentDeliveryId(deliveryId);
        toast.info('Location sharing started');
      }
      if (action === 'complete') {
        stopLocationSharing();
        setCurrentDeliveryId(null);
        setCurrentOrder(null);
        await updateStatus('online');
      }
    } catch (error) {
      toast.error(`Failed to ${action}`);
    }
  };

  // Show map only if there is an active delivery (on_way or picked_up)
  const showMap = currentOrder && (riderStatus === 'online' || riderStatus === 'busy') && currentDeliveryId;

  if (authLoading || loading) {
    return <div className="flex justify-center py-10">Loading...</div>;
  }

  if (!isRider) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <FaMotorcycle className="text-orange-500" /> Rider Dashboard
      </h1>

      {/* Rider Info */}
      {user && user.name && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <p className="font-semibold">👤 {user.name}</p>
          <p className="text-sm text-gray-500">📧 {user.email}</p>
          <p className="text-sm text-gray-500">📱 {user.phone}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm">Location sharing:</span>
            {isSharingLocation ? (
              <span className="text-green-600 font-medium">🟢 On</span>
            ) : (
              <span className="text-gray-400">🔴 Off</span>
            )}
            <span className="text-xs text-gray-400 ml-2">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      {/* Status Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-medium">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            riderStatus === 'online' ? 'bg-green-100 text-green-600' :
            riderStatus === 'busy' ? 'bg-yellow-100 text-yellow-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {riderStatus}
          </span>
          <div className="flex gap-2">
            <button onClick={() => updateStatus('online')} className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 transition">
              Go Online
            </button>
            <button onClick={() => updateStatus('offline')} className="bg-gray-500 text-white px-4 py-1 rounded-lg hover:bg-gray-600 transition">
              Go Offline
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Orders */}
      {assignedOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <h3 className="font-semibold mb-3">📦 New Orders Assigned to You</h3>
          {assignedOrders.map(delivery => (
            <div key={delivery._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-2">
              <div>
                <p className="font-medium">{delivery.orderId?.orderNumber}</p>
                <p className="text-sm text-gray-600">{delivery.orderId?.customerName}</p>
                <p className="text-xs text-gray-400">{delivery.orderId?.address}</p>
              </div>
              <button onClick={() => acceptDelivery(delivery._id)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Map for active delivery */}
      {showMap && currentOrder && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <h3 className="font-semibold mb-3">📍 Live Delivery Map</h3>
          <div className="h-64 rounded-lg overflow-hidden">
            <MapContainer
              center={[location.lat || 0, location.lng || 0]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {/* Rider marker */}
              {location.lat !== 0 && location.lng !== 0 && (
                <Marker position={[location.lat, location.lng]}>
                  <Popup>You are here 🏍️</Popup>
                </Marker>
              )}
              {/* Customer destination marker */}
              {currentOrder.address && (
                // We'll place a generic marker at the restaurant location for demo.
                // In production, you'd geocode the address.
                // For now, we'll use a placeholder offset from rider.
                <Marker position={[location.lat + 0.01, location.lng + 0.01]}>
                  <Popup>📍 {currentOrder.address}</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
          <p className="text-xs text-gray-400 mt-1">Your location updates every 5 seconds. Destination: {currentOrder.address || 'N/A'}</p>
        </div>
      )}

      {/* Active Deliveries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold mb-3">🚚 Active Deliveries</h3>
        {deliveries.filter(d => ['accepted', 'picked_up', 'on_way'].includes(d.status)).length === 0 ? (
          <p className="text-gray-500 text-sm">No active deliveries</p>
        ) : (
          deliveries.filter(d => ['accepted', 'picked_up', 'on_way'].includes(d.status)).map(delivery => (
            <div key={delivery._id} className="border-b border-gray-100 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{delivery.orderId?.orderNumber}</p>
                  <p className="text-sm text-gray-600">{delivery.orderId?.customerName}</p>
                  <p className="text-xs text-gray-400">Status: {delivery.status}</p>
                  {delivery.orderId?.address && (
                    <p className="text-xs text-gray-400">📍 {delivery.orderId.address}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {delivery.status === 'accepted' && (
                    <button onClick={() => updateDeliveryStatus(delivery._id, 'pickup')} className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition text-sm">
                      Picked Up
                    </button>
                  )}
                  {delivery.status === 'picked_up' && (
                    <button onClick={() => updateDeliveryStatus(delivery._id, 'start')} className="bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 transition text-sm">
                      Start Delivery
                    </button>
                  )}
                  {delivery.status === 'on_way' && (
                    <button onClick={() => updateDeliveryStatus(delivery._id, 'complete')} className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition text-sm">
                      Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RiderDashboard;