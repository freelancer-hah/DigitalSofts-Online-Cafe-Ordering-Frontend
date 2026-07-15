import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  LocationMarkerIcon, 
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/outline';
import api from '../../api/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    
    fetchUserOrders();
  }, [user]);

  const fetchUserOrders = async () => {
    setOrdersLoading(true);
    try {
      const phone = user?.phone || '';
      console.log('📋 Fetching orders for phone:', phone);
      
      if (!phone) {
        console.log('⚠️ No phone number found');
        setOrders([]);
        setOrdersLoading(false);
        return;
      }
      
      const res = await api.get(`/orders/track/all?phone=${phone}`);
      console.log('📋 Orders found:', res.data?.length || 0);
      
      const userOrders = res.data || [];
      setOrders(userOrders);
      
      const total = userOrders.length;
      const spent = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pending = userOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
      const completed = userOrders.filter(o => o.status === 'Completed').length;
      
      setStats({
        totalOrders: total,
        totalSpent: spent,
        pendingOrders: pending,
        completedOrders: completed
      });
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
      setOrders([]);
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        completedOrders: 0
      });
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put('/users/profile', formData);
      toast.success('Profile updated successfully!');
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'bg-yellow-100 text-yellow-600',
      'Preparing': 'bg-blue-100 text-blue-600',
      'Ready': 'bg-purple-100 text-purple-600',
      'Completed': 'bg-green-100 text-green-600',
      'Cancelled': 'bg-red-100 text-red-600'
    };
    return badges[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status) => {
    if (status === 'Completed') return <CheckCircleIcon className="h-4 w-4" />;
    if (status === 'Cancelled') return <XCircleIcon className="h-4 w-4" />;
    return <ClockIcon className="h-4 w-4" />;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">👤 My Profile</h1>
            <p className="text-gray-500 text-sm">Manage your account and view orders</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
              toast.success('Logged out successfully');
            }}
            className="mt-2 sm:mt-0 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <UserIcon className="h-10 w-10 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold mt-3">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
                    placeholder="House #, street, area, city"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">Rs {stats.totalSpent}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold">📦 Recent Orders</h2>
                <Link to="/orders" className="text-sm text-orange-600 hover:text-orange-700">
                  View All
                </Link>
              </div>
              
              {ordersLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-2">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No orders yet</p>
                  <p className="text-sm">Start ordering some delicious food!</p>
                  <Link to="/menu" className="mt-3 inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition text-sm">
                    Browse Menu
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div className="flex-1 min-w-[150px]">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{order.orderNumber}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${getStatusBadge(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-PK', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                            {' • '}
                            {order.items?.length || 0} items
                          </p>
                          {order.notes && (
                            <p className="text-xs text-gray-400 italic mt-1">Note: {order.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">Rs {order.totalAmount}</p>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            {order.paymentStatus === 'paid' ? (
                              <span className="text-xs text-green-600 font-semibold">✅ Paid</span>
                            ) : order.paymentStatus === 'refunded' ? (
                              <span className="text-xs text-red-600 font-semibold">🔄 Refunded</span>
                            ) : (
                              <span className="text-xs text-yellow-600 font-semibold">⏳ Pending</span>
                            )}
                            <Link 
                              to={`/track/${order.orderNumber}`}
                              className="text-blue-500 hover:text-blue-700 text-xs flex items-center gap-1"
                            >
                              <EyeIcon className="h-3 w-3" /> Track
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;