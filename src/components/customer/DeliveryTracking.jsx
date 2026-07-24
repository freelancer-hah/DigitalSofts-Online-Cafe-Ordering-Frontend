// frontend/src/components/customer/DeliveryTracking.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { FaStar, FaPhone } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const captainIcon = L.divIcon({
  className: 'captain-marker',
  html: `<div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
    <div style="position: absolute; width: 44px; height: 44px; background: rgba(37, 99, 235, 0.3); border-radius: 50%; animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
    <div style="position: relative; width: 34px; height: 34px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); border: 2px solid white;">🏍️</div>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

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

const DeliveryTracking = ({ orderIdProp, deliveryProp }) => {
  const { orderId: paramOrderId } = useParams();
  const orderId = orderIdProp || paramOrderId;

  const [delivery, setDelivery] = useState(deliveryProp || null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [customerDropCoords, setCustomerDropCoords] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [loading, setLoading] = useState(!deliveryProp);
  const socketRef = useRef(null);

  // Sync prop updates
  useEffect(() => {
    if (deliveryProp) {
      setDelivery(deliveryProp);
      if (deliveryProp.riderId?.location?.coordinates) {
        const [lng, lat] = deliveryProp.riderId.location.coordinates;
        if (lat !== 0 && lng !== 0) {
          setRiderLocation({ lat, lng });
        }
      }
      setLoading(false);
    }
  }, [deliveryProp]);

  // Fetch delivery details & rider initial position
  const fetchDelivery = async () => {
    try {
      if (!orderId) return;
      const res = await api.get(`/deliveries/order/${orderId}`);
      if (res.data) {
        setDelivery(res.data);

        if (res.data.riderId?.location?.coordinates) {
          const [lng, lat] = res.data.riderId.location.coordinates;
          if (lat !== 0 && lng !== 0) {
            setRiderLocation({ lat, lng });
          }
        }

        if (res.data.locationHistory && res.data.locationHistory.length > 0) {
          const lastLoc = res.data.locationHistory[res.data.locationHistory.length - 1];
          if (lastLoc.lat && lastLoc.lng && lastLoc.lat !== 0 && lastLoc.lng !== 0) {
            setRiderLocation({ lat: lastLoc.lat, lng: lastLoc.lng });
          }
        }
      }
    } catch (error) {
      console.log('Delivery details fetch info:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();

    // Setup Socket.IO listener for real-time location stream
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socketRef.current = socket;

    socket.emit('track-order', orderId);

    const handleLocationUpdate = (data) => {
      if (data && data.lat && data.lng) {
        console.log('⚡ Real-time rider location update:', data);
        setRiderLocation({ lat: data.lat, lng: data.lng });
      }
    };

    socket.on('rider-location-update', handleLocationUpdate);
    socket.on('global-rider-location-update', (data) => {
      if (data.orderNumber === orderId || data.orderId === orderId) {
        handleLocationUpdate(data);
      }
    });

    // 🔄 HTTP Polling Fallback (Every 3.5s)
    const pollInterval = setInterval(() => {
      fetchDelivery();
    }, 3500);

    return () => {
      clearInterval(pollInterval);
      socket.emit('leave-order', orderId);
      socket.disconnect();
    };
  }, [orderId]);

  // Geocode customer drop-off address if coordinates not available
  useEffect(() => {
    const rawCoords = delivery?.orderId?.deliveryAddress?.coordinates || delivery?.deliveryAddress?.coordinates;
    if (rawCoords && (rawCoords[0] !== 0 || rawCoords[1] !== 0)) {
      setCustomerDropCoords({ lat: rawCoords[1], lng: rawCoords[0] });
    } else {
      const addressText = delivery?.orderId?.address || delivery?.address;
      if (addressText) {
        // Try searching raw address first (matches rider query format)
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressText)}&limit=1`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.length > 0) {
              setCustomerDropCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
            } else {
              // Try with "Pakistan" suffix fallback
              const queryText = addressText.toLowerCase().includes('pakistan') ? addressText : `${addressText}, Pakistan`;
              fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}&limit=1`)
                .then((res) => res.json())
                .then((dataPk) => {
                  if (dataPk && dataPk.length > 0) {
                    setCustomerDropCoords({ lat: parseFloat(dataPk[0].lat), lng: parseFloat(dataPk[0].lon) });
                  }
                })
                .catch((err) => console.log('Pakistan fallback geocoding error:', err));
            }
          })
          .catch((err) => console.log('Drop-off geocoding error:', err));
      }
    }
  }, [delivery]);

  // Unified drop-off coordinates (Static fallback to Faisalabad if not resolved)
  const dropLat = customerDropCoords?.lat || 31.4187;
  const dropLng = customerDropCoords?.lng || 73.0791;

  // Fetch OSRM road shortest path when riderLocation or drop coordinates update
  useEffect(() => {
    if (riderLocation?.lat && riderLocation?.lng && dropLat && dropLng) {
      fetch(`https://router.project-osrm.org/route/v1/driving/${riderLocation.lng},${riderLocation.lat};${dropLng},${dropLat}?overview=full&geometries=geojson`)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
            setRoutePolyline(coords);
          } else {
            setRoutePolyline([[riderLocation.lat, riderLocation.lng], [dropLat, dropLng]]);
          }
        })
        .catch(() => {
          setRoutePolyline([[riderLocation.lat, riderLocation.lng], [dropLat, dropLng]]);
        });
    }
  }, [riderLocation, dropLat, dropLng]);

  if (loading) return <div className="flex justify-center py-20">Loading tracking...</div>;
  if (!delivery) return <div className="text-center py-20 text-gray-500">No delivery found.</div>;

  const rider = delivery.riderId;
  const currentRiderLat = (riderLocation && riderLocation.lat !== 0) ? riderLocation.lat : (dropLat - 0.012);
  const currentRiderLng = (riderLocation && riderLocation.lng !== 0) ? riderLocation.lng : (dropLng - 0.012);
  const displayOrderNum = delivery.orderId?.orderNumber || (typeof orderId === 'string' && orderId.startsWith('ORD-') ? orderId : 'N/A');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">📦 Track Your Order</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Order #</p>
            <p className="font-semibold text-orange-600">{displayOrderNum}</p>
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

      {delivery && delivery.status !== 'delivered' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 relative">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-t-lg flex items-center justify-between shadow-sm mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-bounce">🏍️</span>
              <div>
                <p className="font-bold text-sm">
                  {delivery.status === 'on_way'
                    ? `Captain ${rider?.name || 'Rider'} is on the way!`
                    : `Captain ${rider?.name || 'Rider'} assigned to your order`}
                </p>
                <p className="text-xs text-blue-100">Live GPS tracking active (InDrive mode)</p>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-mono font-medium animate-pulse">● LIVE</span>
          </div>

          <div className="h-96 relative">
            <MapContainer
              center={[currentRiderLat, currentRiderLng]}
              zoom={14}
              style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {/* Rider Live Captain Marker with Pulsing Aura */}
              <Marker position={[currentRiderLat, currentRiderLng]} icon={captainIcon}>
                <Popup>🏍️ Captain {rider?.name || 'Rider'} (Live Location)</Popup>
              </Marker>

              {/* Customer Drop-off Marker */}
              <Marker position={[dropLat, dropLng]}>
                <Popup>🏠 Your Drop-off Location</Popup>
              </Marker>

              {/* Road Shortest Path Polyline */}
              {routePolyline.length > 0 && (
                <Polyline
                  positions={routePolyline}
                  color="#2563eb"
                  weight={6}
                  opacity={0.85}
                />
              )}

              <MapAutoBounds
                riderLat={currentRiderLat}
                riderLng={currentRiderLng}
                dropLat={dropLat}
                dropLng={dropLng}
              />
            </MapContainer>
          </div>
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