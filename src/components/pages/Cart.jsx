import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from '@heroicons/react/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ Save cart to backend for abandoned cart recovery
  useEffect(() => {
    const saveCart = async () => {
      if (cart.length === 0) return;

      try {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        await api.post('/cart/save', {
          items: cart.map(item => ({
            menuItem: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          totalAmount: total,
          customerName: user?.name || '',
          customerEmail: user?.email || '',
          customerPhone: user?.phone || ''
        });

        console.log('💾 Cart saved for recovery');
      } catch (error) {
        console.error('❌ Failed to save cart:', error);
      }
    };

    // Save cart when items change
    if (cart.length > 0) {
      saveCart();
    }

    // Save cart when user leaves the page
    const handleBeforeUnload = () => {
      if (cart.length > 0) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const data = JSON.stringify({
          items: cart.map(item => ({
            menuItem: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          totalAmount: total,
          customerName: user?.name || '',
          customerEmail: user?.email || '',
          customerPhone: user?.phone || ''
        });

        navigator.sendBeacon('/api/cart/save', new Blob([data], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [cart, user]);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some delicious items from the menu first.</p>
          <Link
            to="/menu"
            className="inline-block bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition"
          >
            Browse Menu
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="space-y-3">
        <AnimatePresence>
          {cart.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">Rs {item.price} each</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center transition"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center transition"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 transition ml-2"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>Rs {cartTotal}</span>
        </div>
        <button
          onClick={() => navigate("/checkout")}
          className="mt-4 w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;