import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBagIcon, 
  SparklesIcon
} from '@heroicons/react/outline';
import api from '../../api/api';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('🎯 Recommended for You');
  const [reason, setReason] = useState('');
  const [stats, setStats] = useState(null);
  const { addToCart } = useCart();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      setRecommendations([]);
      return;
    }
    fetchRecommendations();
  }, [user, isAdmin]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // If user is logged in, use their ID
      if (user?.id) {
        console.log('👤 Logged in user:', user.email);
        const res = await api.get('/recommendations/personalized');
        console.log('📊 Recommendations:', res.data);
        
        setRecommendations(res.data.items || []);
        setTitle(res.data.title || '🎯 Recommended for You');
        setReason(res.data.reason || '');
        setStats(res.data.stats || null);
        setLoading(false);
        return;
      }

      // For guest users: try to get phone from localStorage
      const guestPhone = localStorage.getItem('guestPhone');
      if (guestPhone) {
        const cleanPhone = guestPhone.replace(/\+/g, '').replace(/\s/g, '');
        const res = await api.get(`/recommendations/personalized/${cleanPhone}`);
        console.log('📊 Guest recommendations:', res.data);
        
        setRecommendations(res.data.items || []);
        setTitle(res.data.title || '🎯 Recommended for You');
        setReason(res.data.reason || '');
        setStats(res.data.stats || null);
        setLoading(false);
        return;
      }

      // No user and no guest phone - show popular items
      console.log('🆕 New visitor - showing popular items');
      const res = await api.get('/recommendations/personalized');
      setRecommendations(res.data.items || []);
      setTitle(res.data.title || '🔥 Most Popular Dishes');
      setReason(res.data.reason || '');
      setStats(res.data.stats || null);
      
    } catch (error) {
      console.error('❌ Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`✅ Added ${item.name} to cart!`);
  };

  if (isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="my-8 bg-gradient-to-r from-orange-50/50 to-white rounded-2xl p-4 sm:p-6 border border-orange-100/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
            {title}
          </h2>
          {reason && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{reason}</p>
          )}
        </div>
        {stats && stats.totalOrders > 0 && (
          <div className="flex flex-wrap gap-3 mt-2 sm:mt-0 text-xs text-gray-500">
            <span>📦 {stats.totalOrders} orders</span>
            <span>📂 {stats.favoriteCategory}</span>
            <span>💰 Avg Rs {stats.averageOrder}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {recommendations.map((item, index) => (
          <motion.div
            key={item._id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-orange-600 transition">
                  {item.name}
                </h4>
                <span className="text-orange-500 font-bold text-sm whitespace-nowrap ml-2">
                  Rs {item.price}
                </span>
              </div>
              
              {item.category && (
                <span className="text-[10px] text-gray-400 mb-1">
                  {item.category}
                </span>
              )}
              
              {item.reason && (
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 flex-1">
                  {item.reason}
                </p>
              )}
              
              <button
                onClick={() => handleAddToCart(item)}
                className="w-full mt-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs py-1.5 sm:py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition transform group-hover:scale-105 flex items-center justify-center gap-1"
              >
                <ShoppingBagIcon className="h-3 w-3" />
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;