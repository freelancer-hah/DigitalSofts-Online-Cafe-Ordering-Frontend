import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SearchIcon, 
  ShoppingBagIcon, 
  CheckCircleIcon,
  StarIcon,
  HeartIcon,
  FireIcon,
  ClockIcon,
  XIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const CATEGORY_ORDER = ["All", "Starters", "Main Course", "Fast Food", "Beverages", "Desserts"];

// Category Images
const categoryImages = {
  'Starters': 'https://images.unsplash.com/photo-1625938144755-652e08e359b4?w=400&h=300&fit=crop',
  'Main Course': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
  'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
  'Desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
};

// Food Emojis/Images for items without images
const foodEmojis = {
  'Starters': '🍤',
  'Main Course': '🍛',
  'Fast Food': '🍔',
  'Beverages': '🥤',
  'Desserts': '🍰',
};

const Menu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
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
    toast.success(`${item.name} added to cart!`, {
      icon: '🛒',
      duration: 2000,
    });
    setTimeout(() => setJustAdded(null), 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-gray-600 text-lg font-medium"
          >
            Loading our delicious menu...
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-400 text-sm"
          >
            Get ready to explore amazing flavors! 🍽️
          </motion.p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-6xl mb-4"
          >
            😅
          </motion.div>
          <p className="text-xl font-semibold text-red-600">Oops!</p>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 pt-6 pb-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16 mb-8"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-4"
          >
            🍽️
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Menu</h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Fresh, hot, and made to order with love ❤️
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Search & Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500 font-medium">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {CATEGORY_ORDER.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                }`}
              >
                {cat === 'All' ? '📋 All' : cat}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Menu Grid */}
        <AnimatePresence mode="wait">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16 bg-white rounded-2xl shadow-sm"
            >
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-medium text-gray-600">No items found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or category</p>
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
              >
                Clear filters →
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Image Section */}
                  <div 
                    className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {foodEmojis[item.category] || '🍽️'}
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>

                    {/* Availability Badge */}
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                          Currently Unavailable
                        </span>
                      </div>
                    )}

                    {/* Quick Add Button */}
                    {item.available && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAdd(item); }}
                        className={`absolute bottom-3 right-3 p-3 rounded-full shadow-lg transition-all duration-300 ${
                          justAdded === item._id
                            ? 'bg-green-500 text-white scale-110'
                            : 'bg-white text-orange-500 hover:bg-orange-500 hover:text-white hover:scale-110'
                        }`}
                      >
                        {justAdded === item._id ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <ShoppingBagIcon className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-orange-600 transition">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full">
                        <StarIcon className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-semibold text-orange-600">4.5</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 min-h-[40px]">
                      {item.description || 'Delicious dish prepared with love ❤️'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-gray-400">Rs</span>
                        <span className="text-xl font-bold text-orange-600">{item.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          15-20 min
                        </span>
                      </div>
                    </div>

                    {/* Mobile Add Button */}
                    {item.available && (
                      <button
                        onClick={() => handleAdd(item)}
                        className={`w-full mt-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          justAdded === item._id
                            ? 'bg-green-500 text-white'
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-200'
                        }`}
                      >
                        {justAdded === item._id ? (
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircleIcon className="h-4 w-4" />
                            Added to Cart
                          </span>
                        ) : (
                          'Add to Cart'
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                {selectedItem.image ? (
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    {foodEmojis[selectedItem.category] || '🍽️'}
                  </div>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-lg"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                  <span className="text-2xl font-bold text-orange-600">Rs {selectedItem.price}</span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">{selectedItem.category}</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                    4.5 (120 reviews)
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{selectedItem.description || 'A delicious dish prepared with love and the finest ingredients.'}</p>
                {selectedItem.available ? (
                  <button
                    onClick={() => {
                      handleAdd(selectedItem);
                      setSelectedItem(null);
                    }}
                    className={`w-full py-3 rounded-xl text-white font-semibold transition ${
                      justAdded === selectedItem._id
                        ? 'bg-green-500'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-200'
                    }`}
                  >
                    {justAdded === selectedItem._id ? 'Added to Cart ✅' : 'Add to Cart 🛒'}
                  </button>
                ) : (
                  <button className="w-full py-3 rounded-xl bg-gray-200 text-gray-500 font-semibold cursor-not-allowed">
                    Currently Unavailable
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;