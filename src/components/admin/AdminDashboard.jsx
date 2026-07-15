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
  ClockIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalMenuItems: 0,
    dailyOrders: [],
    categorySales: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
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
      console.log('🔄 Fetching dashboard stats...');
      
      const [dashboardRes, salesRes, ordersRes] = await Promise.all([
        api.get('/admin/stats/dashboard'),
        api.get('/admin/stats/sales'),
        api.get('/admin/orders/recent')
      ]);

      console.log('📊 Dashboard data:', dashboardRes.data);
      console.log('💰 Sales data:', salesRes.data);
      console.log('📋 Recent orders:', ordersRes.data);

      setStats({
        totalOrders: dashboardRes.data.totalOrders || 0,
        totalUsers: dashboardRes.data.totalUsers || 0,
        pendingOrders: dashboardRes.data.pendingOrders || 0,
        paidOrders: dashboardRes.data.paidOrders || 0,
        totalMenuItems: dashboardRes.data.totalMenuItems || 0,
        totalRevenue: salesRes.data.totalRevenue || 0,
        dailyOrders: salesRes.data.dailyOrders || [],
        categorySales: salesRes.data.categorySales || [],
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
      <div className="flex items-center justify-center h-screen">
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
      icon: <ShoppingBagIcon className="h-8 w-8" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Revenue',
      value: `Rs ${stats.totalRevenue.toLocaleString()}`,
      icon: <CurrencyRupeeIcon className="h-8 w-8" />,
      color: 'bg-green-500'
    },
    {
      title: 'Paid Orders',
      value: stats.paidOrders,
      icon: <CheckCircleIcon className="h-8 w-8" />,
      color: 'bg-emerald-500'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <ClockIcon className="h-8 w-8" />,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">📊 Dashboard</h1>
            <p className="text-gray-500">Welcome back, Admin!</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/kitchen')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              🍳 Kitchen Board
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-full`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold">🆕 Recent Orders</h2>
            <span className="text-sm text-gray-500">Real-time updates</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-sm font-semibold">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        Rs {order.totalAmount}
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' :
                          order.paymentStatus === 'refunded' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.paymentStatus === 'paid' ? '✅ Paid' :
                           order.paymentStatus === 'refunded' ? '🔄 Refunded' :
                           '⏳ Pending'}
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