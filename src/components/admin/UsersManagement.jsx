import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { 
  PlusIcon, 
  TrashIcon, 
  UserAddIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/outline';
import { FaMotorcycle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'riders'
  
  // Staff modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'kitchen'
  });

  // Rider modal state
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [riderForm, setRiderForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleType: 'bike'
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
    fetchRiders();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchRiders = async () => {
    try {
      const res = await api.get('/riders/all');
      setRiders(res.data);
    } catch (error) {
      console.error('Error fetching riders:', error);
      toast.error('Failed to load riders');
    } finally {
      setLoading(false);
    }
  };

  // Staff creation
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/staff', formData);
      toast.success('Staff member created successfully! ✅');
      fetchUsers();
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'kitchen' });
    } catch (error) {
      console.error('Error creating staff:', error);
      toast.error(error.response?.data?.message || 'Failed to create staff');
    }
  };

  // Rider creation
  const handleCreateRider = async (e) => {
    e.preventDefault();
    try {
      await api.post('/riders/create', riderForm);
      toast.success('Rider created successfully! 🏍️');
      fetchRiders();
      setShowRiderModal(false);
      setRiderForm({ name: '', email: '', password: '', phone: '', vehicleType: 'bike' });
    } catch (error) {
      console.error('Error creating rider:', error);
      toast.error(error.response?.data?.message || 'Failed to create rider');
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Delete rider
  const handleDeleteRider = async (id) => {
    if (!confirm('Are you sure you want to delete this rider?')) return;
    try {
      await api.delete(`/riders/${id}`);
      toast.success('Rider deleted successfully');
      fetchRiders();
    } catch (error) {
      console.error('Error deleting rider:', error);
      toast.error('Failed to delete rider');
    }
  };

  // Toggle user status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/users/${id}`, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-14 sm:top-16 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-wrap justify-between items-center py-3 sm:py-4 gap-2">
            <div className="flex items-center space-x-3">
              <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">User Management</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                  Manage customers, staff, and riders
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Add Staff Button */}
              <button
                onClick={() => setShowModal(true)}
                className="bg-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-orange-700 transition text-sm font-medium shadow-md hover:shadow-lg"
              >
                <UserAddIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Add Staff</span>
              </button>

              {/* Add Rider Button */}
              <button
                onClick={() => setShowRiderModal(true)}
                className="bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-green-700 transition text-sm font-medium shadow-md hover:shadow-lg"
              >
                <FaMotorcycle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Add Rider</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👤 Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('riders')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'riders'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏍️ Riders ({riders.length})
          </button>
        </div>

        {activeTab === 'users' ? (
          // ---- USERS TABLE ----
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <p className="text-xs sm:text-sm text-gray-500">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold">{users.length}</p>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <p className="text-xs sm:text-sm text-gray-500">Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {users.filter(u => u.role === 'customer').length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <p className="text-xs sm:text-sm text-gray-500">Kitchen Staff</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {users.filter(u => u.role === 'kitchen').length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <p className="text-xs sm:text-sm text-gray-500">Admins</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {users.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500">No users found</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-3 text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    Create your first staff member
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile: Card View */}
                  <div className="block sm:hidden divide-y divide-gray-100">
                    {users.map((user) => (
                      <div key={user._id} className="p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">{user.phone || 'No phone'}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                              user.role === 'kitchen' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {user.role}
                            </span>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="ml-2 text-red-500 hover:text-red-700"
                              disabled={user.role === 'admin'}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 sm:px-6 py-4 font-medium text-sm">{user.name}</td>
                            <td className="px-4 sm:px-6 py-4 text-sm">{user.email}</td>
                            <td className="px-4 sm:px-6 py-4 text-sm">{user.phone || '-'}</td>
                            <td className="px-4 sm:px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                                user.role === 'kitchen' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <button
                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                                  user.isActive 
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                }`}
                              >
                                {user.isActive ? '✅ Active' : '❌ Inactive'}
                              </button>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                                disabled={user.role === 'admin'}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          // ---- RIDERS TABLE ----
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <p className="text-xs sm:text-sm text-gray-500">Total Riders</p>
                <p className="text-xl sm:text-2xl font-bold">{riders.length}</p>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <p className="text-xs sm:text-sm text-gray-500">Online</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {riders.filter(r => r.status === 'online').length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <p className="text-xs sm:text-sm text-gray-500">Busy</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                  {riders.filter(r => r.status === 'busy').length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <p className="text-xs sm:text-sm text-gray-500">Offline</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-500">
                  {riders.filter(r => r.status === 'offline').length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {riders.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500">No riders found</p>
                  <button
                    onClick={() => setShowRiderModal(true)}
                    className="mt-3 text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Create your first rider
                  </button>
                </div>
              ) : (
                <>
                  <div className="block sm:hidden divide-y divide-gray-100">
                    {riders.map((rider) => (
                      <div key={rider._id} className="p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">{rider.name}</p>
                            <p className="text-xs text-gray-500">{rider.email}</p>
                            <p className="text-xs text-gray-400">{rider.phone}</p>
                            <p className="text-xs text-gray-400">🚗 {rider.vehicleType}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rider.status === 'online' ? 'bg-green-100 text-green-600' :
                              rider.status === 'busy' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {rider.status}
                            </span>
                            <button
                              onClick={() => handleDeleteRider(rider._id)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deliveries</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {riders.map((rider) => (
                          <tr key={rider._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 sm:px-6 py-4 font-medium text-sm">{rider.name}</td>
                            <td className="px-4 sm:px-6 py-4 text-sm">{rider.email}</td>
                            <td className="px-4 sm:px-6 py-4 text-sm">{rider.phone}</td>
                            <td className="px-4 sm:px-6 py-4 text-sm capitalize">{rider.vehicleType}</td>
                            <td className="px-4 sm:px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                rider.status === 'online' ? 'bg-green-100 text-green-600' :
                                rider.status === 'busy' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {rider.status}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm">{rider.totalDeliveries || 0}</td>
                            <td className="px-4 sm:px-6 py-4">
                              <button
                                onClick={() => handleDeleteRider(rider._id)}
                                className="text-red-500 hover:text-red-700 transition"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Staff Modal (unchanged) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <UserAddIcon className="h-6 w-6 text-orange-500" />
                Add Staff Member
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ name: '', email: '', password: '', phone: '', role: 'kitchen' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              {/* ... same as before ... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm"
                  placeholder="staff@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm"
                >
                  <option value="kitchen">👨‍🍳 Kitchen Staff</option>
                  <option value="admin">🛡️ Admin</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button type="submit" className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition font-medium text-sm">
                  👤 Create Staff
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', email: '', password: '', phone: '', role: 'kitchen' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rider Modal (unchanged) */}
      {showRiderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <FaMotorcycle className="h-6 w-6 text-green-500" />
                Create Rider
              </h2>
              <button
                onClick={() => {
                  setShowRiderModal(false);
                  setRiderForm({ name: '', email: '', password: '', phone: '', vehicleType: 'bike' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateRider} className="space-y-4">
              {/* ... same as before ... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={riderForm.name}
                  onChange={(e) => setRiderForm({...riderForm, name: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                  placeholder="Rider Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={riderForm.email}
                  onChange={(e) => setRiderForm({...riderForm, email: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                  placeholder="rider@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={riderForm.password}
                  onChange={(e) => setRiderForm({...riderForm, password: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={riderForm.phone}
                  onChange={(e) => setRiderForm({...riderForm, phone: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select
                  value={riderForm.vehicleType}
                  onChange={(e) => setRiderForm({...riderForm, vehicleType: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                >
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium text-sm">
                  🏍️ Create Rider
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRiderModal(false);
                    setRiderForm({ name: '', email: '', password: '', phone: '', vehicleType: 'bike' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;