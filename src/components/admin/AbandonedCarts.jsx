import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { FaShoppingBag, FaEnvelope, FaSpinner, FaUndo } from 'react-icons/fa';
import { MdShoppingCart } from 'react-icons/md';

const AbandonedCarts = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentCarts, setRecentCarts] = useState([]);
  const [sending, setSending] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/cart/abandoned-stats');
      setStats(res.data.stats);
      setRecentCarts(res.data.recentAbandoned || []);
    } catch (error) {
      console.error('❌ Error fetching abandoned carts:', error);
      toast.error('Failed to load abandoned cart stats');
    } finally {
      setLoading(false);
    }
  };

  const sendRecoveryEmail = async (cartId) => {
    setSending(prev => ({ ...prev, [cartId]: true }));
    try {
      await api.post(`/cart/send-recovery/${cartId}`);
      toast.success('Recovery email sent!');
      fetchStats();
    } catch (error) {
      console.error('❌ Error sending recovery email:', error);
      toast.error('Failed to send recovery email');
    } finally {
      setSending(prev => ({ ...prev, [cartId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin h-6 w-6 text-orange-500" />
        <span className="ml-2 text-gray-500">Loading abandoned carts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MdShoppingCart className="text-orange-500" />
          Abandoned Cart Recovery
        </h3>
        <span className="text-xs text-gray-400">Auto-recovery enabled</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Abandoned</p>
          <p className="text-2xl font-bold text-red-600">{stats?.totalAbandoned || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Recovered</p>
          <p className="text-2xl font-bold text-green-600">{stats?.totalRecovered || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active Carts</p>
          <p className="text-2xl font-bold text-blue-600">{stats?.totalActive || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Recovery Rate</p>
          <p className="text-2xl font-bold text-purple-600">{stats?.recoveryRate || 0}%</p>
        </div>
      </div>

      {/* Recent Abandoned Carts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <h4 className="font-semibold">Recent Abandoned Carts</h4>
          <span className="text-xs text-gray-400">
            {recentCarts.length} carts
          </span>
        </div>
        {recentCarts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <FaShoppingBag className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p>No abandoned carts found</p>
            <p className="text-sm text-gray-400">Customers with carts will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {recentCarts.map((cart) => (
              <div key={cart._id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold">{cart.customerName || 'Guest'}</p>
                    <p className="text-sm text-gray-500">{cart.customerEmail}</p>
                    <p className="text-sm text-gray-500">
                      Items: {cart.items?.length || 0} · Total: Rs {cart.totalAmount || 0}
                    </p>
                    <p className="text-xs text-gray-400">
                      Abandoned: {cart.abandonedAt ? new Date(cart.abandonedAt).toLocaleString() : 'Unknown'}
                    </p>
                    {cart.items && cart.items.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cart.items.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            {item.name} × {item.quantity}
                          </span>
                        ))}
                        {cart.items.length > 3 && (
                          <span className="text-xs text-gray-400">+{cart.items.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => sendRecoveryEmail(cart._id)}
                    disabled={sending[cart._id]}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2 text-sm whitespace-nowrap disabled:opacity-50"
                  >
                    {sending[cart._id] ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaEnvelope />
                    )}
                    Send Recovery Email
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-blue-700">
        <p className="font-medium">💡 How it works:</p>
        <ul className="list-disc list-inside mt-1 text-xs text-blue-600 space-y-1">
          <li>Carts are automatically detected after 15 minutes of inactivity</li>
          <li>Recovery emails are sent automatically</li>
          <li>Customers get a personalized email with their cart items</li>
          <li>10% discount code is included in the recovery email</li>
        </ul>
      </div>
    </div>
  );
};

export default AbandonedCarts;