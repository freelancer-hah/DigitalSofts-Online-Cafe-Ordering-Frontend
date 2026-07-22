import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/api';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyRupeeIcon,
  ClipboardListIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  TruckIcon  // ✅ Import TruckIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';
import ForecastDashboard from './ForecastDashboard';
import AbandonedCarts from './AbandonedCarts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalMenuItems: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [showForecast, setShowForecast] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStats();

    if (socket) {
      socket.on('new-order', () => fetchStats());
      socket.on('order-updated', () => fetchStats());
      socket.on('payment-confirmed', () => {
        toast.success('💳 Payment confirmed!');
        fetchStats();
      });
    }

    return () => {
      if (socket) {
        socket.off('new-order');
        socket.off('order-updated');
        socket.off('payment-confirmed');
      }
    };
  }, [socket]);

  const fetchStats = async () => {
    try {
      const [dashboardRes, ordersRes] = await Promise.all([
        api.get('/admin/stats/dashboard'),
        api.get('/admin/orders/recent')
      ]);

      setStats({
        totalOrders: dashboardRes.data.totalOrders || 0,
        totalUsers: dashboardRes.data.totalUsers || 0,
        pendingOrders: dashboardRes.data.pendingOrders || 0,
        paidOrders: dashboardRes.data.paidOrders || 0,
        totalMenuItems: dashboardRes.data.totalMenuItems || 0,
        totalRevenue: 0,
        recentOrders: ordersRes.data || []
      });
    } catch (error) {
      console.error('❌ Fetch stats error:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingBagIcon className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Paid Orders',
      value: stats.paidOrders,
      icon: <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: 'bg-emerald-500'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">📊 Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, Admin!</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate('/admin/kitchen')}
              className="bg-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition text-sm flex-1 sm:flex-none text-center"
            >
              🍳 Kitchen
            </button>
            <button
              onClick={() => navigate('/admin/menu')}
              className="bg-green-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-600 transition text-sm flex-1 sm:flex-none text-center"
            >
              📋 Menu
            </button>
            <button
              onClick={() => navigate('/admin/deliveries')}  // ✅ New button
              className="bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-orange-600 transition text-sm flex-1 sm:flex-none text-center flex items-center justify-center gap-1"
            >
              <TruckIcon className="h-4 w-4" />
              Deliveries
            </button>
            <button
              onClick={() => setShowForecast(!showForecast)}
              className="bg-purple-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-purple-600 transition text-sm flex-1 sm:flex-none text-center flex items-center justify-center gap-1"
            >
              <ChartBarIcon className="h-4 w-4" />
              {showForecast ? 'Hide Forecast' : 'AI Forecast'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-red-600 transition text-sm flex-1 sm:flex-none text-center"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards - Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-2 sm:p-3 rounded-full`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Sales Forecast Section */}
        {showForecast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-purple-500" />
                  AI Sales Forecast
                </h3>
                <span className="text-xs text-gray-400">Powered by AI</span>
              </div>
              <ForecastDashboard />
            </div>
          </motion.div>
        )}

        {/* Abandoned Carts Section */}
        <div className="mt-6">
          <AbandonedCarts />
        </div>

        {/* Recent Orders - Mobile Friendly Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-semibold">🆕 Recent Orders</h2>
            <span className="text-xs sm:text-sm text-gray-500">Real-time</span>
          </div>
          
          {/* Mobile: Card View */}
          <div className="block sm:hidden divide-y divide-gray-100">
            {stats.recentOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No orders yet
              </div>
            ) : (
              stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">Rs {order.totalAmount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-600' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1">
                    {order.paymentStatus === 'paid' ? (
                      <span className="text-xs text-green-600 font-semibold">✅ Paid</span>
                    ) : (
                      <span className="text-xs text-yellow-600 font-semibold">⏳ Pending</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.slice(0, 10).map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 sm:px-6 py-3 font-mono text-xs sm:text-sm font-semibold">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm">
                        {order.customerName}
                      </td>
                      <td className="px-4 sm:px-6 py-3 font-semibold text-sm">
                        Rs {order.totalAmount}
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-600' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                          order.status === 'Ready' ? 'bg-blue-100 text-blue-600' :
                          order.status === 'Preparing' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;