// frontend/src/components/pages/OrderTracking.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const KITCHEN_STEPS = ['Pending', 'Preparing', 'Ready'];
const DELIVERY_STEP_MAP = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'on_way', label: 'On The Way' },
  { key: 'delivered', label: 'Delivered' },
];
const ORDER_STATUS_LIST = ['Pending', 'Preparing', 'Ready', 'Completed'];

const OrderTracking = () => {
  const { orderNumber: paramOrderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [orderNumberInput, setOrderNumberInput] = useState(paramOrderNumber || '');
  const [phoneInput, setPhoneInput] = useState('');
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const mapRef = useRef(null);

  const fetchOrder = async (num, phone) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/track/${num}`, { params: phone ? { phone } : {} });
      setOrder(res.data);

      if (res.data.orderType === 'Delivery') {
        try {
          const deliveryRes = await api.get(`/deliveries/order/${res.data._id}`);
          setDelivery(deliveryRes.data);
          if (deliveryRes.data.riderId?.location?.coordinates) {
            const [lng, lat] = deliveryRes.data.riderId.location.coordinates;
            setRiderLocation({ lat, lng });
          }
        } catch (err) {
          if (err.response?.status === 404) console.log('ℹ️ No delivery record yet');
          else console.error('Error fetching delivery:', err);
          setDelivery(null);
        }
      }
    } catch (err) {
      setOrder(null);
      setDelivery(null);
      setError(err.response?.data?.message || 'Order not found');
      toast.error(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrderNumber) fetchOrder(paramOrderNumber);
  }, [paramOrderNumber]);

  // Socket for live updates
  useEffect(() => {
    if (!order) return;
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('order-updated', (updated) => {
      if (updated.orderNumber === order.orderNumber) {
        setOrder(updated);
        toast.info(`📦 Order status: ${updated.status}`);
        // If order becomes Ready and delivery not yet fetched, fetch it
        if (updated.orderType === 'Delivery' && !delivery && updated.status === 'Ready') {
          api.get(`/deliveries/order/${updated._id}`)
            .then(res => setDelivery(res.data))
            .catch(() => console.log('Delivery not found yet'));
        }
      }
    });

    socket.on('delivery-status-update', (data) => {
      if (delivery && data.deliveryId === delivery._id) {
        setDelivery(prev => ({ ...prev, status: data.status }));
        toast.info(`🚚 Delivery status: ${data.status}`);
      } else if (!delivery) {
        api.get(`/deliveries/order/${order._id}`)
          .then(res => setDelivery(res.data))
          .catch(() => console.log('Delivery not found yet'));
      }
    });

    socket.on('rider-location-update', (data) => {
      setRiderLocation({ lat: data.lat, lng: data.lng });
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [order, delivery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!orderNumberInput) { toast.error('Please enter an order number'); return; }
    navigate(`/track/${orderNumberInput.trim()}`);
    fetchOrder(orderNumberInput.trim(), phoneInput.trim());
  };

  const getCombinedSteps = () => {
    if (!order) return [];
    const orderStatusIdx = ORDER_STATUS_LIST.indexOf(order.status);

    const kitchenSteps = KITCHEN_STEPS.map((label, idx) => ({
      label,
      completed: orderStatusIdx >= idx,
      active: order.status === label,
    }));
    let allSteps = [...kitchenSteps];

    if (order.orderType === 'Delivery' && delivery && orderStatusIdx >= 2) {
      const deliveryIdx = DELIVERY_STEP_MAP.findIndex(step => step.key === delivery.status);
      const deliverySteps = DELIVERY_STEP_MAP.map((step, idx) => ({
        label: step.label,
        completed: deliveryIdx >= idx,
        active: delivery.status === step.key,
      }));
      allSteps = [...allSteps, ...deliverySteps];
    }

    if (order.status === 'Completed') {
      allSteps.push({ label: 'Completed', completed: true, active: false });
    }

    return allSteps;
  };

  const steps = getCombinedSteps();

  const showMap = delivery && (delivery.status === 'on_way' || delivery.status === 'picked_up') && riderLocation;

  if (loading) return <div className="flex justify-center py-20">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>

      {location.state?.justPlaced && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm">
          ✅ Order placed successfully! Save your order number to track it anytime.
        </div>
      )}

      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Order Number</label>
          <input
            type="text"
            value={orderNumberInput}
            onChange={(e) => setOrderNumberInput(e.target.value)}
            placeholder="e.g. ORD-4F82A1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number (optional)</label>
          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="03XX-XXXXXXX"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Track Order'}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Order</p>
              <p className="font-bold text-lg">{order.orderNumber}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
              order.status === 'Completed' ? 'bg-green-100 text-green-600' :
              'bg-orange-100 text-orange-700'
            }`}>
              {order.status}
            </span>
          </div>

          {order.orderType === 'Delivery' && delivery && (
            <div className="mb-4 text-sm">
              <p className="text-gray-500">🚚 Rider: {delivery.riderId?.name || 'Not assigned yet'}</p>
              <p className="text-gray-500">📱 {delivery.riderId?.phone || '—'}</p>
            </div>
          )}

          {order.status !== 'Cancelled' && (
            <div className="mb-6">
              <div className="flex items-center justify-between overflow-x-auto">
                {steps.map((step, idx) => (
                  <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center flex-1 min-w-[60px]">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.completed
                            ? 'bg-green-500 text-white'
                            : step.active
                            ? 'bg-orange-500 text-white animate-pulse'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <span className="text-[10px] mt-1 text-gray-500 text-center whitespace-nowrap">{step.label}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 -mt-4 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-3 space-y-1 text-sm">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>Rs {item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>Rs {order.totalAmount}</span>
          </div>

          {showMap && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">📍 Rider's Live Location</h4>
              <div className="h-60 rounded-lg overflow-hidden">
                <MapContainer
                  center={[riderLocation.lat, riderLocation.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={[riderLocation.lat, riderLocation.lng]}>
                    <Popup>Rider is here 🏍️</Popup>
                  </Marker>
                </MapContainer>
              </div>
              <p className="text-xs text-gray-400 mt-1">Map updates every 5 seconds</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OrderTracking;