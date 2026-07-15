import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { EyeIcon } from '@heroicons/react/outline';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/track/all?phone=${user.phone}`);
      setOrders(res.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
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

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const statusFilters = ['all', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📋 My Orders</h1>
          <Link to="/profile" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Profile
          </Link>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === status 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status === 'all' ? 'All Orders' : status}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">No orders found</p>
            <Link to="/menu" className="mt-3 inline-block text-orange-600 hover:text-orange-700">
              Start ordering →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                <div className="flex flex-wrap justify-between items-start">
                  <div>
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <div className="mt-2 text-sm">
                      {order.items.map((item, idx) => (
                        <span key={idx}>
                          {item.name} × {item.quantity}
                          {idx < order.items.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                    {order.notes && (
                      <p className="text-xs text-gray-400 italic mt-1">Note: {order.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="font-bold mt-2">Rs {order.totalAmount}</p>
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
                        className="text-orange-600 hover:text-orange-700 text-sm flex items-center gap-1"
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
    </div>
  );
};

// ✅ Make sure this export is present
export default Orders;