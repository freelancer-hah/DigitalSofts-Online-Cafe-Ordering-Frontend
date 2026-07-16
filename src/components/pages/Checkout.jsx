import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import api from "../../api/api.js";
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const [form, setForm] = useState({
    customerName: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    orderType: "Pickup",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  // ✅ Format phone number
  const formatPhone = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\s/g, '');
    if (cleaned.startsWith('03')) {
      cleaned = '+92' + cleaned.slice(1);
    }
    return cleaned;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isProcessing) {
      toast.warning('Order is already being processed');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setSubmitting(true);
    setError("");

    try {
      // ✅ Format phone before sending
      const formattedPhone = formatPhone(form.phone);
      
      const payload = {
        customerName: form.customerName,
        phone: formattedPhone,  // ✅ Send formatted phone
        address: form.address,
        orderType: form.orderType,
        notes: form.notes,
        items: cart.map((i) => ({
          menuItem: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      };
      
      console.log('📦 Creating order with payload:', payload);
      console.log('📱 Phone being sent:', formattedPhone);
      
      const res = await api.post("/orders", payload);
      console.log('✅ Order created:', res.data);
      console.log('📱 Phone saved in order:', res.data.phone);
      
      if (paymentMethod === 'stripe') {
        navigate('/payment', { 
          state: { 
            orderData: { 
              ...payload, 
              orderNumber: res.data.orderNumber, 
              totalAmount: cartTotal 
            },
            orderId: res.data._id
          } 
        });
      } else {
        clearCart();
        toast.success('✅ Order placed successfully!');
        navigate(`/track/${res.data.orderNumber}`, { state: { justPlaced: true } });
      }
    } catch (err) {
      console.error('❌ Order error:', err);
      setError(err.response?.data?.message || "Could not place order. Please try again.");
      toast.error(err.response?.data?.message || "Could not place order");
    } finally {
      setSubmitting(false);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-xl">Your cart is empty.</p>
        <p className="text-sm mt-2">Add items before checking out.</p>
        <button
          onClick={() => navigate('/menu')}
          className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-2">Order Summary</h2>
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between text-sm py-1">
              <span>{item.name} × {item.quantity}</span>
              <span>Rs {item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>Rs {cartTotal}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              required
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              required
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="03XX-XXXXXXX"
            />
            <p className="text-xs text-gray-400 mt-1">Orders are linked to this phone number</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Order Type</label>
            <select
              name="orderType"
              value={form.orderType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Pickup">Pickup</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>

          {form.orderType === "Delivery" && (
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Address *</label>
              <textarea
                required
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows="2"
                placeholder="House #, street, area, city"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="2"
              placeholder="Less spicy, no onions, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'stripe' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <div className="text-2xl">💳</div>
                <div className="text-sm font-medium">Card Payment</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'cod' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <div className="text-2xl">💵</div>
                <div className="text-sm font-medium">Cash on Delivery</div>
              </button>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-60"
          >
            {submitting ? "Processing..." : paymentMethod === 'stripe' ? "Pay Now" : "Place Order"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Checkout;