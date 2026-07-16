import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STATUS_ORDER = ['Pending', 'Preparing', 'Ready', 'Completed'];

const KitchenBoard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchOrders();

    if (socket) {
      socket.on('new-order', (order) => {
        setOrders(prev => [order, ...prev]);
        toast.success(`🆕 New order #${order.orderNumber}`);
        // Play notification sound
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {});
        } catch (e) {}
      });

      socket.on('order-updated', (updated) => {
        setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
        toast.info(`📦 Order #${updated.orderNumber} → ${updated.status}`);
      });

      socket.on('payment-confirmed', (order) => {
        setOrders(prev => prev.map(o => o._id === order._id ? order : o));
        toast.success(`💳 Payment confirmed for #${order.orderNumber}`);
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

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  // ✅ FIXED: Mark as Paid with better feedback
  const handleMarkPaid = async (orderId) => {
    try {
      const res = await api.post(`/orders/${orderId}/mark-paid`, {
        paymentId: 'manual_' + Date.now()
      });
      if (res.data.success) {
        toast.success('✅ Order marked as paid successfully!');
        fetchOrders();
      }
    } catch (error) {
      console.error('Mark paid error:', error);
      toast.error('Failed to mark as paid');
    }
  };

  // ✅ NEW: Cancel order with confirmation
  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'Cancelled' });
      toast.success('❌ Order cancelled');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  // ✅ NEW: Get payment status display
  const getPaymentStatusDisplay = (order) => {
    if (order.paymentStatus === 'paid') {
      return {
        label: '✅ PAID',
        color: 'bg-green-100 text-green-600',
        icon: '💰'
      };
    } else if (order.orderType === 'Delivery' && order.paymentStatus !== 'paid') {
      return {
        label: '💵 COD - Pending',
        color: 'bg-blue-100 text-blue-600',
        icon: '💵'
      };
    } else {
      return {
        label: '⏳ Pending',
        color: 'bg-yellow-100 text-yellow-600',
        icon: '⏳'
      };
    }
  };

  // ✅ NEW: Get order type display
  const getOrderTypeDisplay = (order) => {
    if (order.orderType === 'Delivery') {
      return `🚚 ${order.address || 'Delivery'}`;
    }
    return '🏪 Pickup';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">🍳 Kitchen Board</h1>
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
              Live
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500">
            <span>{orders.filter(o => o.status !== 'Completed').length} active orders</span>
            <span className="w-px h-4 bg-gray-300"></span>
            <span>{orders.filter(o => o.paymentStatus === 'paid').length} paid</span>
          </div>
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="block sm:hidden overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex gap-3 min-w-max px-1">
            {STATUS_ORDER.map((status) => {
              const colOrders = orders.filter(o => o.status === status);
              return (
                <div key={status} className="w-80 flex-shrink-0 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-sm">{status}</h2>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {colOrders.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                    <AnimatePresence>
                      {colOrders.map((order) => {
                        const paymentStatus = getPaymentStatusDisplay(order);
                        return (
                          <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition"
                          >
                            {/* Order Header */}
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <p className="font-bold text-xs">{order.orderNumber}</p>
                                <p className="text-xs text-gray-500">{order.customerName}</p>
                                <p className="text-[10px] text-gray-400">{getOrderTypeDisplay(order)}</p>
                              </div>
                              <span className="text-xs font-bold text-orange-600">Rs {order.totalAmount}</span>
                            </div>

                            {/* Payment Status */}
                            <div className="mb-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${paymentStatus.color}`}>
                                {paymentStatus.label}
                              </span>
                            </div>

                            {/* Items */}
                            <div className="text-[10px] text-gray-600 mb-1 line-clamp-1">
                              {order.items.map((item, idx) => (
                                <span key={idx}>
                                  {item.name} × {item.quantity}
                                  {idx < order.items.length - 1 && ', '}
                                </span>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {STATUS_ORDER.filter(s => s !== status).map((nextStatus) => (
                                <button
                                  key={nextStatus}
                                  onClick={() => updateStatus(order._id, nextStatus)}
                                  className="text-[10px] bg-white border border-gray-300 rounded-full px-1.5 py-0.5 hover:bg-orange-50 hover:border-orange-500 transition"
                                >
                                  → {nextStatus}
                                </button>
                              ))}
                              
                              {/* ✅ Mark Paid - Shows for all pending payments */}
                              {order.paymentStatus !== 'paid' && (
                                <button
                                  onClick={() => handleMarkPaid(order._id)}
                                  className="text-[10px] bg-green-500 text-white rounded-full px-1.5 py-0.5 hover:bg-green-600 transition"
                                >
                                  💵 Mark Paid
                                </button>
                              )}
                              
                              {/* Cancel Button */}
                              {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="text-[10px] bg-red-50 text-red-600 border border-red-200 rounded-full px-1.5 py-0.5 hover:bg-red-100 transition"
                                >
                                  ❌ Cancel
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop: Grid View */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STATUS_ORDER.map((status) => {
            const colOrders = orders.filter(o => o.status === status);
            return (
              <div key={status} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="font-semibold text-sm sm:text-base">{status}</h2>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs sm:text-sm">
                    {colOrders.length}
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-3 min-h-[100px] max-h-[70vh] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {colOrders.map((order) => {
                      const paymentStatus = getPaymentStatusDisplay(order);
                      return (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 hover:shadow-md transition"
                        >
                          {/* Order Header */}
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="font-bold text-xs sm:text-sm">{order.orderNumber}</p>
                              <p className="text-xs text-gray-500">{order.customerName}</p>
                              <p className="text-[10px] text-gray-400">{getOrderTypeDisplay(order)}</p>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-orange-600">Rs {order.totalAmount}</span>
                          </div>

                          {/* Payment Status */}
                          <div className="mb-1">
                            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold ${paymentStatus.color}`}>
                              {paymentStatus.label}
                            </span>
                          </div>

                          {/* Items */}
                          <div className="text-[10px] sm:text-xs text-gray-600 mb-1 line-clamp-2">
                            {order.items.map((item, idx) => (
                              <span key={idx}>
                                {item.name} × {item.quantity}
                                {idx < order.items.length - 1 && ', '}
                              </span>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {STATUS_ORDER.filter(s => s !== status).map((nextStatus) => (
                              <button
                                key={nextStatus}
                                onClick={() => updateStatus(order._id, nextStatus)}
                                className="text-[10px] sm:text-xs bg-white border border-gray-300 rounded-full px-1.5 sm:px-2 py-0.5 hover:bg-orange-50 hover:border-orange-500 transition"
                              >
                                → {nextStatus}
                              </button>
                            ))}
                            
                            {/* ✅ Mark Paid - Shows for all pending payments */}
                            {order.paymentStatus !== 'paid' && (
                              <button
                                onClick={() => handleMarkPaid(order._id)}
                                className="text-[10px] sm:text-xs bg-green-500 text-white rounded-full px-1.5 sm:px-2 py-0.5 hover:bg-green-600 transition"
                              >
                                💵 Mark Paid
                              </button>
                            )}
                            
                            {/* Cancel Button */}
                            {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="text-[10px] sm:text-xs bg-red-50 text-red-600 border border-red-200 rounded-full px-1.5 sm:px-2 py-0.5 hover:bg-red-100 transition"
                              >
                                ❌ Cancel
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KitchenBoard;