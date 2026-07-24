import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to auto-fit map bounds around Rider and Drop-off
function MapAutoBounds({ riderLat, riderLng, dropLat, dropLng }) {
  const map = useMap();
  useEffect(() => {
    if (riderLat && riderLng && dropLat && dropLng) {
      const bounds = L.latLngBounds([
        [riderLat, riderLng],
        [dropLat, dropLng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, riderLat, riderLng, dropLat, dropLng]);
  return null;
}

const RiderDashboard = () => {
  const [riderStatus, setRiderStatus] = useState('offline');
  const [currentDeliveryId, setCurrentDeliveryId] = useState(null);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [deliveries, setDeliveries] = useState([]);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [geocodedDrop, setGeocodedDrop] = useState(null);
  const watchIdRef = useRef(null);

  // Active delivery object
  const activeDelivery = deliveries.find(
    (d) => d._id === currentDeliveryId
  );

  // Drop-off coordinates: Use saved coords or geocoded fallback
  const dropCoordsRaw = activeDelivery?.orderId?.deliveryAddress?.coordinates;
  const hasSavedCoords = dropCoordsRaw && (dropCoordsRaw[0] !== 0 || dropCoordsRaw[1] !== 0);

  const dropLat = hasSavedCoords
    ? dropCoordsRaw[1]
    : geocodedDrop
    ? geocodedDrop.lat
    : 31.4187;

  const dropLng = hasSavedCoords
    ? dropCoordsRaw[0]
    : geocodedDrop
    ? geocodedDrop.lng
    : 73.0791;

  // Geocode address text if saved coordinates are missing
  useEffect(() => {
    if (activeDelivery?.orderId?.address && !hasSavedCoords) {
      const addressQuery = activeDelivery.orderId.address;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            setGeocodedDrop({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
          } else {
            // Try with "Pakistan" suffix fallback
            const queryText = addressQuery.toLowerCase().includes('pakistan') ? addressQuery : `${addressQuery}, Pakistan`;
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}&limit=1`)
              .then((res) => res.json())
              .then((dataPk) => {
                if (dataPk && dataPk.length > 0) {
                  setGeocodedDrop({ lat: parseFloat(dataPk[0].lat), lng: parseFloat(dataPk[0].lon) });
                }
              })
              .catch((err) => console.error('Pakistan fallback geocoding error:', err));
          }
        })
        .catch((err) => console.error('Geocoding error:', err));
    }
  }, [activeDelivery, hasSavedCoords]);

  // Fetch actual Road Shortest Path from OSRM Routing Engine
  useEffect(() => {
    const rLat = location.lat;
    const rLng = location.lng;

    if (rLat && rLng && dropLat && dropLng) {
      const fetchShortestPath = async () => {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${rLng},${rLat};${dropLng},${dropLat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
            setRoutePolyline(coords);

            const distanceKm = (route.distance / 1000).toFixed(1);
            const durationMins = Math.round(route.duration / 60);
            setRouteInfo({ distanceKm, durationMins });
          } else {
            setRoutePolyline([[rLat, rLng], [dropLat, dropLng]]);
          }
        } catch (err) {
          console.error('OSRM route fetch failed:', err);
          setRoutePolyline([[rLat, rLng], [dropLat, dropLng]]);
        }
      };
      fetchShortestPath();
    }
  }, [location.lat, location.lng, dropLat, dropLng]);

  // Initial GPS detection on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.log('Initial GPS error:', err.message),
        { enableHighAccuracy: true }
      );
    }
  }, []);

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

      {/* Active Delivery Actions & Interactive Route Map */}
      {currentDeliveryId && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-blue-800 flex items-center gap-2">
              🚚 Active Delivery: <span className="font-bold text-blue-900">{activeDelivery?.orderId?.orderNumber || 'N/A'}</span>
            </h3>
            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full uppercase font-medium">
              {activeDelivery?.status}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold">Customer:</span> {activeDelivery?.orderId?.customerName || 'N/A'}<br />
            <span className="font-semibold">Drop-off Address:</span> {activeDelivery?.orderId?.address || 'N/A'}
          </p>

          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            <button
              onClick={() => pickUpDelivery(currentDeliveryId)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 font-medium shadow-sm transition"
            >
              📦 Pick Up
            </button>
            <button
              onClick={() => startDelivery(currentDeliveryId)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium shadow-sm transition"
            >
              ▶️ Start Delivery
            </button>
            <button
              onClick={() => completeDelivery(currentDeliveryId)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 font-medium shadow-sm transition"
            >
              ✅ Complete
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${dropLat},${dropLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 font-medium shadow-sm transition flex items-center gap-1"
            >
              🧭 Open Google Maps Navigation
            </a>
          </div>

          {/* Distance & ETA Info Badge */}
          {routeInfo && (
            <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-t-lg flex justify-between items-center shadow-sm">
              <span>🛣️ Shortest Road Navigation Path</span>
              <span>📏 {routeInfo.distanceKm} km | ⏱️ ~{routeInfo.durationMins} mins</span>
            </div>
          )}

          {/* Rider Live Map & Shortest Road Route Polyline */}
          <div className="bg-white rounded-b-xl shadow-sm border border-blue-100 p-2 h-96 relative">
            <MapContainer
              center={location.lat !== 0 ? [location.lat, location.lng] : [dropLat, dropLng]}
              zoom={14}
              style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Rider Live Position Marker */}
              {location.lat !== 0 && (
                <Marker position={[location.lat, location.lng]}>
                  <Popup>🚴 Rider (Your current location)</Popup>
                </Marker>
              )}

              {/* Customer Drop-off Marker */}
              <Marker position={[dropLat, dropLng]}>
                <Popup>🏠 Customer Drop-off Destination</Popup>
              </Marker>

              {/* OSRM Shortest Road Path Polyline (Google Maps Blue Style) */}
              {routePolyline.length > 0 && (
                <Polyline
                  positions={routePolyline}
                  color="#2563eb"
                  weight={6}
                  opacity={0.85}
                />
              )}

              {/* Auto fit map bounds to show both Rider & Drop-off */}
              <MapAutoBounds
                riderLat={location.lat || dropLat - 0.01}
                riderLng={location.lng || dropLng - 0.01}
                dropLat={dropLat}
                dropLng={dropLng}
              />
            </MapContainer>
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