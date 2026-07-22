import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const RiderDashboard = () => {
  const [riderStatus, setRiderStatus] = useState('offline');
  const [currentDeliveryId, setCurrentDeliveryId] = useState(null);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [deliveries, setDeliveries] = useState([]);
  const watchIdRef = useRef(null);

  // ==========================================
  // 📡 FETCH DATA
  // ==========================================
  const fetchData = async () => {
    try {
      // ✅ 1. Rider profile
      const profileRes = await api.get('/riders/profile');
      setRiderStatus(profileRes.data.status);

      // ✅ 2. Rider deliveries
      const deliveriesRes = await api.get('/deliveries/my');
      setDeliveries(deliveriesRes.data);

      // ✅ 3. Active delivery — FIXED: 'accepted' bhi shamil kiya
      const active = deliveriesRes.data.find(
        (d) => d.status === 'accepted' || d.status === 'picked_up' || d.status === 'on_way'
      );
      if (active) {
        setCurrentDeliveryId(active._id);
        toast.success(`📦 Active: ${active.orderId?.orderNumber || 'Delivery'}`);
      } else {
        setCurrentDeliveryId(null);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load dashboard');
    }
  };

  // ==========================================
  // 📍 LOCATION SHARING
  // ==========================================
  useEffect(() => {
    if (currentDeliveryId) {
      console.log('📍 Active delivery. Starting location sharing...');
      startLocationSharing();
    } else {
      console.log('📍 No active delivery. Stopping location sharing.');
      stopLocationSharing();
    }
    return () => stopLocationSharing();
  }, [currentDeliveryId]);

  // ==========================================
  // 📡 GPS FUNCTIONS
  // ==========================================
  const startLocationSharing = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        try {
          await api.put(`/deliveries/${currentDeliveryId}/location`, {
            lat: latitude,
            lng: longitude,
          });
          console.log(`📍 Sent: ${latitude}, ${longitude}`);
        } catch (err) {
          console.error('Location send failed:', err);
        }
      },
      (error) => {
        console.error('GPS Error:', error);
        toast.error(`GPS Error: ${error.message}`);
        stopLocationSharing();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const stopLocationSharing = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log('📍 Location sharing stopped.');
    }
  };

  // ==========================================
  // 🚚 DELIVERY ACTIONS
  // ==========================================

  const acceptDelivery = async (deliveryId) => {
    try {
      await api.put(`/deliveries/${deliveryId}/accept`);
      toast.success('✅ Delivery accepted!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept');
    }
  };

  const pickUpDelivery = async (deliveryId) => {
    try {
      await api.put(`/deliveries/${deliveryId}/pickup`);
      toast.success('📦 Picked up!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to pickup');
    }
  };

  const startDelivery = async (deliveryId) => {
    try {
      await api.put(`/deliveries/${deliveryId}/start`, {
        lat: location.lat || 0,
        lng: location.lng || 0,
      });
      toast.success('🚀 On the way!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start');
    }
  };

  const completeDelivery = async (deliveryId) => {
    try {
      await api.put(`/deliveries/${deliveryId}/complete`);
      toast.success('🎉 Delivery completed!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete');
    }
  };

  // ==========================================
  // 🧹 LIFECYCLE
  // ==========================================
  useEffect(() => {
    fetchData();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.on('new-delivery-assigned', () => {
      toast.info('🆕 New delivery assigned!');
      fetchData();
    });

    return () => {
      socket.disconnect();
      stopLocationSharing();
    };
  }, []);

  // ==========================================
  // 🖥️ UI RENDER
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🏍️ Rider Dashboard</h1>

      {/* Status + Location */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <span
            className={`font-semibold ${
              riderStatus === 'online'
                ? 'text-green-600'
                : riderStatus === 'busy'
                ? 'text-orange-600'
                : 'text-gray-500'
            }`}
          >
            {riderStatus.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Live Location</p>
          <p
            className={`font-mono text-sm ${
              location.lat !== 0 ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {location.lat !== 0
              ? `🟢 ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
              : '🔴 Off (0.000000)'}
          </p>
        </div>
      </div>

      {/* Active Delivery Actions */}
      {currentDeliveryId && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-blue-800">🚚 Active Delivery</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => pickUpDelivery(currentDeliveryId)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600"
            >
              📦 Pick Up
            </button>
            <button
              onClick={() => startDelivery(currentDeliveryId)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              ▶️ Start Delivery
            </button>
            <button
              onClick={() => completeDelivery(currentDeliveryId)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              ✅ Complete
            </button>
          </div>
        </div>
      )}

      {/* Assigned Deliveries List */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h3 className="font-semibold mb-3">📋 Assigned Deliveries</h3>
        {deliveries.length === 0 ? (
          <p className="text-gray-500 text-sm">No assigned deliveries.</p>
        ) : (
          <div className="space-y-2">
            {deliveries.map((delivery) => (
              <div
                key={delivery._id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border"
              >
                <div>
                  <p className="font-medium">
                    {delivery.orderId?.orderNumber || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">Status: {delivery.status}</p>
                </div>
                {delivery.status === 'assigned' && (
                  <button
                    onClick={() => acceptDelivery(delivery._id)}
                    className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-600"
                  >
                    Accept
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDashboard;