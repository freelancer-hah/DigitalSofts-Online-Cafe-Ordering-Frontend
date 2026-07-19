import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export const useCartTracking = (cart) => {
  const { user } = useAuth();
  const lastSavedRef = useRef(null);

  useEffect(() => {
    if (!cart || cart.length === 0) return;

    // Save cart when items change
    const saveCart = async () => {
      // Debounce: only save if last save was more than 5 seconds ago
      const now = Date.now();
      if (lastSavedRef.current && now - lastSavedRef.current < 5000) {
        return;
      }
      lastSavedRef.current = now;

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

        console.log('💾 Cart saved:', cart.length, 'items');
      } catch (error) {
        console.error('❌ Failed to save cart:', error);
      }
    };

    // Save cart when items change
    saveCart();

    // Save cart when user leaves the page
    const handleBeforeUnload = () => {
      if (cart.length > 0) {
        // Send sync request (navigator.sendBeacon)
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
};