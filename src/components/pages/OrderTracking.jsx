import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/api.js";
import { io } from "socket.io-client";
import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const STATUS_STEPS = ["Pending", "Preparing", "Ready", "Completed"];

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const OrderTracking = () => {
  const { orderNumber: paramOrderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [orderNumberInput, setOrderNumberInput] = useState(paramOrderNumber || "");
  const [phoneInput, setPhoneInput] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchOrder = async (num, phone) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/orders/track/${num}`, {
        params: phone ? { phone } : {},
      });
      setOrder(res.data);
    } catch (err) {
      setOrder(null);
      setError(err.response?.data?.message || "Order not found");
      toast.error(err.response?.data?.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrderNumber) {
      fetchOrder(paramOrderNumber);
    }
  }, [paramOrderNumber]);

  useEffect(() => {
    if (!order) return;
    const socket = io(socketUrl);
    socket.on("order-updated", (updated) => {
      if (updated.orderNumber === order.orderNumber) {
        setOrder(updated);
        toast.info(`Order status updated to: ${updated.status}`);
      }
    });
    return () => socket.disconnect();
  }, [order?.orderNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!orderNumberInput) {
      toast.error('Please enter an order number');
      return;
    }
    navigate(`/track/${orderNumberInput.trim()}`);
    fetchOrder(orderNumberInput.trim(), phoneInput.trim());
  };

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>

      {location.state?.justPlaced && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm"
        >
          ✅ Order placed successfully! Save your order number to track it anytime.
        </motion.div>
      )}

      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Order Number</label>
          <input
            type="text"
            value={orderNumberInput}
            onChange={(e) => setOrderNumberInput(e.target.value)}
            placeholder="e.g. ORD-4F82A1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number (optional, for verification)</label>
          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="03XX-XXXXXXX"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-60"
        >
          {loading ? "Searching..." : "Track Order"}
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
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                order.status === "Cancelled"
                  ? "bg-red-100 text-red-600"
                  : order.status === "Completed"
                  ? "bg-green-100 text-green-600"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {order.status}
            </span>
          </div>

          {order.status !== "Cancelled" && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, idx) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx <= currentStepIndex
                            ? "bg-orange-600 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {idx <= currentStepIndex ? (
                          <CheckCircleIcon className="h-4 w-4" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className="text-[10px] mt-1 text-gray-500 text-center">{step}</span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 -mt-4 ${
                          idx < currentStepIndex ? "bg-orange-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-3 space-y-1 text-sm">
            <p className="text-gray-500 text-xs mb-1">Items:</p>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
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