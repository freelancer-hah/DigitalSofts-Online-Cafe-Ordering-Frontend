import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api';
import toast from 'react-hot-toast';

const ChurnDashboard = () => {
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/churn/stats');
      setStats(res.data);
      setPredictions(res.data.predictions || []);
    } catch (error) {
      console.error('Error fetching churn data:', error);
      toast.error('Failed to load churn data');
    } finally {
      setLoading(false);
    }
  };

  const sendReengagement = async () => {
    setSending(true);
    try {
      const res = await api.post('/churn/send-reengagement', {
        riskThreshold: 70,
        offerType: 'percentage',
        offerValue: 10
      });
      toast.success(`✅ Sent ${res.data.sentCount} re-engagement emails!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to send re-engagement emails');
    } finally {
      setSending(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk > 70) return 'text-red-600 bg-red-50';
    if (risk > 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🤖 AI Churn Prediction
          </h2>
          <p className="text-gray-500 text-sm">ML model predicts customer churn with {stats?.accuracy || 85}% accuracy</p>
        </div>
        <button
          onClick={sendReengagement}
          disabled={sending || predictions.length === 0}
          className="mt-2 sm:mt-0 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2"
        >
          {sending ? '⏳ Sending...' : '📧 Send Re-engagement'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold">{stats?.totalCustomers || 0}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">High Risk</p>
          <p className="text-2xl font-bold text-red-600">{stats?.highRisk || 0}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Medium Risk</p>
          <p className="text-2xl font-bold text-yellow-600">{stats?.mediumRisk || 0}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Avg Risk Score</p>
          <p className="text-2xl font-bold text-green-600">{stats?.avgRisk || 0}%</p>
        </div>
      </div>

      {/* Predictions List */}
      {predictions.length > 0 ? (
        <div className="border rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="font-semibold">📊 Customer Predictions</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {predictions.slice(0, 20).map((pred, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div>
                  <p className="font-medium">Customer #{pred.customer_id?.slice(-6) || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">
                    Risk: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(pred.churn_risk)}`}>
                      {pred.risk_level || 'Low'} ({Math.round(pred.churn_risk)}%)
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block w-24 h-2 rounded-full ${pred.churn_risk > 70 ? 'bg-red-500' : pred.churn_risk > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}>
                    <span className="block h-full" style={{ width: `${Math.min(pred.churn_risk, 100)}%` }}></span>
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {pred.prediction || 'Active'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-green-600">
          ✅ No customers at risk! Great job!
        </div>
      )}
    </div>
  );
};

export default ChurnDashboard;