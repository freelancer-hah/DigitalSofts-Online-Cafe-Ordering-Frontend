import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import api from '../../api/api';
import { motion } from 'framer-motion';
import { SearchIcon, ShoppingBagIcon, CheckCircleIcon } from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const CATEGORY_ORDER = ["All", "Starters", "Main Course", "Fast Food", "Beverages", "Desserts"];

const Menu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get("/menu");
        setItems(res.data);
      } catch (err) {
        setError("Could not load the menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (item) => {
    addToCart(item);
    setJustAdded(item._id);
    toast.success(`${item.name} added to cart!`);
    setTimeout(() => setJustAdded(null), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading our delicious menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Oops!</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-gray-500">Fresh, hot, and made to order with love</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <span className="text-orange-600 font-bold">
                      Rs {item.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                    <button
                      disabled={!item.available}
                      onClick={() => handleAdd(item)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                        !item.available
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : justAdded === item._id
                          ? "bg-green-500 text-white"
                          : "bg-orange-600 text-white hover:bg-orange-700"
                      }`}
                    >
                      {justAdded === item._id ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBagIcon className="h-4 w-4" />
                          <span>{item.available ? 'Add' : 'Unavailable'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;