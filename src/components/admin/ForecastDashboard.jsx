import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api';
import toast from 'react-hot-toast';
import {
  FaChartLine,
  FaClock,
  FaFire,
  FaCalendarDay,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaSpinner
} from 'react-icons/fa';

const ForecastDashboard = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      const res = await api.get('/forecast/sales');
      setForecast(res.data);
      console.log('📊 Forecast:', res.data);
    } catch (error) {
      console.error('❌ Forecast error:', error);
      toast.error('Failed to load forecast data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <FaSpinner className="animate-spin h-8 w-8 text-purple-500" />
        <span className="ml-2 text-gray-500">Loading forecast...</span>
      </div>
    );
  }

  if (!forecast || !forecast.success) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-yellow-600 text-lg">📊 Not enough data for forecasting</p>
        <p className="text-sm text-yellow-500 mt-1">Collect more orders to see predictions</p>
        <p className="text-xs text-yellow-400 mt-2">Need at least 7 days of order data</p>
      </div>
    );
  }

  const { summary, next7Days, recommendations, dailyPatterns, hourPatterns } = forecast;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaChartLine className="text-purple-500" />
            AI Sales Forecast
          </h2>
          <p className="text-sm text-gray-500">
            Predictions based on {forecast.dataPoints || 0} days of data
          </p>
        </div>
        <span className="text-xs text-gray-400 mt-1 sm:mt-0">
          Updated: {new Date(forecast.forecastDate).toLocaleDateString()}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{summary.totalOrders}</p>
          <p className="text-xs text-gray-400">Last 30 days</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Avg Daily</p>
          <p className="text-2xl font-bold">{summary.averageDailyOrders}</p>
          <p className="text-xs text-gray-400">Orders/day</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Best Day</p>
          <p className="text-2xl font-bold">{summary.bestDay?.day || 'N/A'}</p>
          <p className="text-xs text-gray-400">{summary.bestDay?.value || 0} orders</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Trend</p>
          <div className="flex items-center gap-1">
            {summary.trend?.direction === 'increasing' && (
              <FaArrowUp className="text-green-500" />
            )}
            {summary.trend?.direction === 'decreasing' && (
              <FaArrowDown className="text-red-500" />
            )}
            {summary.trend?.direction === 'stable' && (
              <FaMinus className="text-yellow-500" />
            )}
            <span className="text-xl font-bold">
              {summary.trend?.percentage || 0}%
            </span>
          </div>
          <p className="text-xs text-gray-400 capitalize">{summary.trend?.direction || 'No data'}</p>
        </div>
      </div>

      {/* Top Items */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <FaFire className="text-orange-500" />
          Top Selling Items
        </h3>
        <div className="flex flex-wrap gap-2">
          {summary.topItems.map(([name, count]) => (
            <span key={name} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm">
              {name} ({count})
            </span>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <FaCalendarDay className="text-purple-500" />
          7-Day Forecast
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {next7Days.map((day) => (
            <div key={day.date} className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium">{day.day}</p>
              <p className="text-lg font-bold text-purple-600">{day.predictedOrders}</p>
              <p className="text-xs text-gray-400">{day.confidence}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <FaClock className="text-blue-500" />
          Peak Hours
        </h3>
        <div className="flex flex-wrap gap-2">
          {hourPatterns.map(([hour, count]) => (
            <span key={hour} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
              {hour} ({count} orders)
            </span>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            💡 AI Recommendations
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-sm ${
                  rec.priority === 'high'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}
              >
                {rec.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastDashboard;