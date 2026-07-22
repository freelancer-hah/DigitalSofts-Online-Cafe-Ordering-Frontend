// frontend/src/components/admin/DeliveryManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { FaTruck, FaMotorcycle } from 'react-icons/fa';

const DeliveryManagement = () => {
  const [readyOrders, setReadyOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch ready orders
      const ordersRes = await api.get('/orders?status=Ready');
      setReadyOrders(ordersRes.data.filter(o => o.deliveryStatus !== 'delivered'));

      // 2. Fetch all riders
      console.log('🔍 Fetching riders...');
      const ridersRes = await api.get('/riders/all');
      console.log('📦 All riders response:', ridersRes.data);

      // 3. Filter online/busy riders
      const available = ridersRes.data.filter(r => r.status === 'online' || r.status === 'busy');
      console.log('🟢 Available riders:', available);

      // If no online riders, show all riders as fallback (for debugging)
      if (available.length === 0 && ridersRes.data.length > 0) {
        console.warn('⚠️ No online riders found, but showing all riders for debugging.');
        setRiders(ridersRes.data);
        toast.info('No online riders. Showing all riders for assignment (debug mode).');
      } else {
        setRiders(available);
      }

      // 4. Active deliveries
      const deliveriesRes = await api.get('/deliveries/all');
      setActiveDeliveries(deliveriesRes.data.filter(d =>
        ['assigned', 'accepted', 'picked_up', 'on_way'].includes(d.status)
      ));
      setError('');
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError('Failed to load delivery data. Please check console.');
      toast.error('Failed to load delivery data');
    } finally {
      setLoading(false);
    }
  };

  const assignDelivery = async (orderId, riderId) => {
    try {
      await api.post('/deliveries/assign', { orderId, riderId });
      toast.success('Delivery assigned successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign');
    }
  };

  if (loading) return <div className="flex justify-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <FaTruck className="text-orange-500" /> Delivery Management
      </h2>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">{error}</div>}

      {/* Ready Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold mb-3">📋 Ready for Delivery ({readyOrders.length})</h3>
        {readyOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders ready for delivery</p>
        ) : (
          <div className="space-y-2">
            {readyOrders.map(order => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.customerName} • Rs {order.totalAmount}</p>
                  <p className="text-xs text-gray-400">{order.address || 'No address'}</p>
                </div>
                <div>
                  {riders.length === 0 ? (
                    <span className="text-xs text-red-500">No riders available</span>
                  ) : (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          assignDelivery(order._id, e.target.value);
                        }
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-orange-500"
                      defaultValue=""
                    >
                      <option value="">Assign Rider</option>
                      {riders.map(rider => (
                        <option key={rider._id} value={rider._id}>
                          {rider.name} ({rider.phone}) {rider.status === 'busy' ? '🔴' : '🟢'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold mb-3">🚚 Active Deliveries ({activeDeliveries.length})</h3>
        {activeDeliveries.length === 0 ? (
          <p className="text-gray-500 text-sm">No active deliveries</p>
        ) : (
          <div className="space-y-2">
            {activeDeliveries.map(delivery => (
              <div key={delivery._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium">{delivery.orderId?.orderNumber || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    Rider: {delivery.riderId?.name || 'Unassigned'} • Status: {delivery.status}
                  </p>
                  {delivery.status === 'on_way' && (
                    <p className="text-xs text-gray-500">
                      📍 Last location: {delivery.locationHistory?.slice(-1)?.[0]?.lat || 'N/A'}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  delivery.status === 'on_way' ? 'bg-green-100 text-green-600' :
                  delivery.status === 'picked_up' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {delivery.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryManagement;