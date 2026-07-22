// frontend/src/components/rider/RiderLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaMotorcycle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RiderLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const { user } = result;
      if (user.role === 'rider') {
        toast.success('Welcome Rider!');
        navigate('/rider/dashboard');
      } else {
        toast.error('This account is not a rider account.');
        navigate('/login');
      }
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center">
          <FaMotorcycle className="text-5xl mx-auto text-green-600 mb-4" />
          <h2 className="text-2xl font-bold">Rider Login</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to start delivering</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="rider@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-center text-sm text-gray-500">
            Use your regular account credentials if you are a rider.
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default RiderLogin;