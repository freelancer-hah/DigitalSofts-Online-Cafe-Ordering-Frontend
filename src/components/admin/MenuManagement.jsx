import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MenuManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    available: true
  });
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/menu');
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, data);
        toast.success('Item updated successfully!');
      } else {
        await api.post('/menu', data);
        toast.success('Item added successfully!');
      }
      
      fetchItems();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await api.put(`/menu/${id}`, { available: !currentStatus });
      toast.success(`Item ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchItems();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Main Course',
      available: true
    });
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      available: item.available
    });
    setShowModal(true);
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading menu items...</p>
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
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Menu Management</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">Add, edit, or delete menu items</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-orange-700 transition text-sm"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden xs:inline">Add Item</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/admin/login');
                }}
                className="text-red-500 hover:text-red-700 text-xs sm:text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Stats - Mobile Friendly */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500">Total</p>
            <p className="text-lg sm:text-2xl font-bold">{items.length}</p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500">Available</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">
              {items.filter(i => i.available).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500">Unavailable</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600">
              {items.filter(i => !i.available).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500">Categories</p>
            <p className="text-lg sm:text-2xl font-bold">
              {[...new Set(items.map(item => item.category))].length}
            </p>
          </div>
        </div>

        {/* Menu Items - Mobile Friendly */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500">No menu items found</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="mt-3 text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                Add your first item
              </button>
            </div>
          ) : (
            <>
              {/* Mobile: Card View */}
              <div className="block sm:hidden divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item._id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
                          <span className="text-sm font-bold text-orange-600">Rs {item.price}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <button
                          onClick={() => handleToggleAvailability(item._id, item.available)}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            item.available 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {item.available ? '✅' : '❌'}
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
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
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 sm:px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 font-medium text-sm">
                          Rs {item.price}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <button
                            onClick={() => handleToggleAvailability(item._id, item.available)}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                              item.available 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {item.available ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            >
                              <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            >
                              <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal - Mobile Friendly */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm"
                  placeholder="e.g., Chicken Karahi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none text-sm"
                  rows="3"
                  placeholder="Describe your dish..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm"
                >
                  <option value="Starters">Starters</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Fast Food">Fast Food</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({...formData, available: e.target.checked})}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                  Available for ordering
                </label>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 text-sm"
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
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

export default MenuManagement;