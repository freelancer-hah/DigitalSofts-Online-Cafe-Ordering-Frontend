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

  const handleMarkPaid = async (orderId) => {
    try {
      const res = await api.post(`/orders/${orderId}/mark-paid`, {
        paymentId: 'manual_' + Date.now()
      });
      if (res.data.success) {
        toast.success('✅ Order marked as paid');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to mark as paid');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">🍳 Kitchen Board</h1>
          </div>
          <div className="text-sm text-gray-500">
            {orders.filter(o => o.status !== 'Completed').length} active orders
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {STATUS_ORDER.map((status) => {
            const colOrders = orders.filter(o => o.status === status);
            return (
              <div key={status} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">{status}</h2>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  <AnimatePresence>
                    {colOrders.map((order) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-sm">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{order.customerName}</p>
                          </div>
                          <span className="text-sm font-bold text-orange-600">
                            Rs {order.totalAmount}
                          </span>
                        </div>

                        {/* Payment Status */}
                        <div className="mb-2">
                          {order.paymentStatus === 'paid' ? (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                              ✅ PAID
                            </span>
                          ) : order.paymentStatus === 'refunded' ? (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                              🔄 Refunded
                            </span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full font-semibold">
                              ⏳ Pending Payment
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-600 mb-2">
                          {order.items.map((item, idx) => (
                            <span key={idx}>
                              {item.name} × {item.quantity}
                              {idx < order.items.length - 1 && ', '}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {STATUS_ORDER.filter(s => s !== status).map((nextStatus) => (
                            <button
                              key={nextStatus}
                              onClick={() => updateStatus(order._id, nextStatus)}
                              className="text-xs bg-white border border-gray-300 rounded-full px-2 py-1 hover:bg-orange-50 hover:border-orange-500 transition"
                            >
                              → {nextStatus}
                            </button>
                          ))}
                          
                          {/* Debug: Mark Paid button */}
                          {order.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => handleMarkPaid(order._id)}
                              className="text-xs bg-green-500 text-white rounded-full px-2 py-1 hover:bg-green-600 transition"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
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