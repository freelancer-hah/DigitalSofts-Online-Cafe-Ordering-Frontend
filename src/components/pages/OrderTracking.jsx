import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import DeliveryTracking from '../customer/DeliveryTracking';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// ✅ Kitchen steps (Completed ko hata diya — ab isko end mein daalenge)
const KITCHEN_STEPS = ['Pending', 'Preparing', 'Ready'];

// ✅ Delivery steps map (backend keys ke saath)
const DELIVERY_STEP_MAP = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'on_way', label: 'On The Way' },
  { key: 'delivered', label: 'Delivered' },
];

// ✅ Full status list for order completion check
const ORDER_STATUS_LIST = ['Pending', 'Preparing', 'Ready', 'Completed'];

const OrderTracking = () => {
  const { orderNumber: paramOrderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [orderNumberInput, setOrderNumberInput] = useState(paramOrderNumber || '');
  const [phoneInput, setPhoneInput] = useState('');
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOrder = async (num, phone) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/track/${num}`, {
        params: phone ? { phone } : {},
      });
      setOrder(res.data);

      if (res.data.orderType === 'Delivery') {
        try {
          const deliveryRes = await api.get(`/deliveries/order/${res.data._id}`);
          setDelivery(deliveryRes.data);
        } catch (err) {
          console.log('No delivery record yet');
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
    if (paramOrderNumber) {
      fetchOrder(paramOrderNumber);
    }
  }, [paramOrderNumber]);

  // ✅ Live socket updates — FIXED (no reload needed)
  useEffect(() => {
    if (!order) return;

    const socket = io(socketUrl);

    socket.on('order-updated', (updated) => {
      if (updated.orderNumber === order.orderNumber) {
        setOrder(updated);
        toast.info(`📦 Order status: ${updated.status}`);

        // ✅ Agar order delivery hai aur delivery state null hai toh refetch karein
        if (updated.orderType === 'Delivery' && !delivery) {
          api.get(`/deliveries/order/${updated._id}`)
            .then(res => setDelivery(res.data))
            .catch(() => console.log('Delivery not found yet'));
        }
      }
    });

    socket.on('delivery-status-update', (data) => {
      console.log('📡 Delivery status update received:', data);

      // ✅ Agar delivery exist karti hai aur match karti hai toh update karein
      if (delivery && data.deliveryId === delivery._id) {
        setDelivery(prev => ({ ...prev, status: data.status }));
        toast.info(`🚚 Delivery status: ${data.status}`);
      } 
      // ✅ Agar delivery null hai (page load ke waqt) toh fetch karke laayein
      else if (!delivery) {
        api.get(`/deliveries/order/${order._id}`)
          .then(res => {
            setDelivery(res.data);
            toast.info(`🚚 Delivery status: ${res.data.status}`);
          })
          .catch(() => console.log('Delivery not found yet'));
      }
    });

    return () => socket.disconnect();
  }, [order, delivery]); // ✅ dependency array mein order aur delivery dono hain

  const handleSearch = (e) => {
    e.preventDefault();
    if (!orderNumberInput) {
      toast.error('Please enter an order number');
      return;
    }
    navigate(`/track/${orderNumberInput.trim()}`);
    fetchOrder(orderNumberInput.trim(), phoneInput.trim());
  };

  // ✅ FIXED: Combined steps logic (Completed ko end mein le gaye)
  const getCombinedSteps = () => {
    if (!order) return [];

    const orderStatusIdx = ORDER_STATUS_LIST.indexOf(order.status);

    // 1. Kitchen steps: Pending, Preparing, Ready
    const kitchenSteps = KITCHEN_STEPS.map((label, idx) => ({
      label: label,
      completed: orderStatusIdx >= idx,
      active: order.status === label,
    }));

    let allSteps = [...kitchenSteps];

    // 2. Delivery steps (sirf tab dikhayein jab order 'Ready' ho aur Delivery ho)
    if (order.orderType === 'Delivery' && delivery && orderStatusIdx >= 2) {
      const deliveryIdx = DELIVERY_STEP_MAP.findIndex(
        (step) => step.key === delivery.status
      );

      const deliverySteps = DELIVERY_STEP_MAP.map((step, idx) => ({
        label: step.label,
        key: step.key,
        completed: deliveryIdx >= idx,
        active: delivery.status === step.key,
      }));

      allSteps = [...allSteps, ...deliverySteps];
    }

    // 3. ✅ Completed ko SAB SE AKHRI STEP banayein (sirf tab jab order Completed ho)
    if (order.status === 'Completed') {
      allSteps.push({
        label: 'Completed',
        key: 'completed',
        completed: true,
        active: false,
      });
    }

    return allSteps;
  };

  const steps = getCombinedSteps();

  if (loading) {
    return <div className="flex justify-center py-20">Loading...</div>;
  }

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

          {/* Delivery specific info */}
          {order.orderType === 'Delivery' && delivery && (
            <div className="mb-4 text-sm">
              <p className="text-gray-500">🚚 Rider: {delivery.riderId?.name || 'Not assigned yet'}</p>
              <p className="text-gray-500">📱 {delivery.riderId?.phone || '—'}</p>
            </div>
          )}

          {/* Stepper - combined */}
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

          {/* Embedded Real-Time Delivery Tracking Map for Customers (InDrive style) */}
          {order.orderType === 'Delivery' && (
            <div className="my-6">
              <DeliveryTracking orderIdProp={order.orderNumber} deliveryProp={delivery} />
            </div>
          )}

          {/* Order items */}
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
        </motion.div>
      )}
    </div>
  );
};

export default OrderTracking;