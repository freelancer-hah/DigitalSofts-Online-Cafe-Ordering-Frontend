import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRightIcon, 
  ClockIcon, 
  TruckIcon, 
  StarIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  FireIcon,
  ShoppingBagIcon,
  CalendarIcon
} from '@heroicons/react/outline';
import { useCart } from '../../context/CartContext';
import api from '../../api/api';
import toast from 'react-hot-toast';
import Recommendations from '../Recommendations/Recommendations';

const Home = () => {
  const { addToCart } = useCart();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [testimonials] = useState([
    {
      id: 1,
      name: 'Ahmed Khan',
      role: 'Regular Customer',
      comment: 'The best biryani I\'ve ever had! Spice Corner never disappoints. 🔥',
      rating: 5,
      image: '👨‍🍳',
      date: '2 days ago'
    },
    {
      id: 2,
      name: 'Sara Ali',
      role: 'Food Lover',
      comment: 'Amazing food quality and fast delivery. Their karahi is to die for! ❤️',
      rating: 5,
      image: '👩‍🍳',
      date: '1 week ago'
    },
    {
      id: 3,
      name: 'Usman Malik',
      role: 'Chef',
      comment: 'Authentic Pakistani flavors. The spices are perfectly balanced. ⭐',
      rating: 5,
      image: '👨‍🍳',
      date: '3 days ago'
    }
  ]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/menu');
        setFeaturedItems(res.data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching featured items:', error);
      }
    };
    fetchFeatured();
  }, []);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  const features = [
    {
      icon: <TruckIcon className="h-7 w-7" />,
      title: 'Fast Delivery',
      description: 'Hot and fresh food delivered to your doorstep within 30 minutes',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      icon: <HeartIcon className="h-7 w-7" />,
      title: 'Quality Ingredients',
      description: 'We use only the freshest and highest quality ingredients',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      icon: <ShieldCheckIcon className="h-7 w-7" />,
      title: '100% Halal',
      description: 'All our food is certified halal and prepared with care',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      icon: <UserGroupIcon className="h-7 w-7" />,
      title: 'Expert Chefs',
      description: 'Our experienced chefs bring authentic flavors to your table',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers', icon: '😊', bgColor: 'bg-orange-100' },
    { value: '50+', label: 'Delicious Dishes', icon: '🍛', bgColor: 'bg-red-100' },
    { value: '4.9⭐', label: 'Average Rating', icon: '⭐', bgColor: 'bg-yellow-100' },
    { value: '30min', label: 'Avg. Delivery Time', icon: '⏱️', bgColor: 'bg-green-100' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
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

  const handleAddToCart = async (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart! 🛒`, {
      duration: 2000,
      style: {
        background: '#f97316',
        color: '#fff',
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 text-white overflow-hidden min-h-[95vh] flex items-center pb-28 sm:pb-36 lg:pb-44">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 text-8xl animate-bounce">🍽️</div>
          <div className="absolute bottom-24 right-10 text-8xl animate-pulse">🌶️</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl opacity-30">🍲</div>
          <div className="absolute top-20 right-20 text-6xl animate-spin-slow">✨</div>
          <div className="absolute bottom-24 left-20 text-6xl animate-float">⭐</div>
        </div>

        <motion.div 
          style={{ opacity, scale }}
          className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30"
        />

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-8 sm:pt-28 sm:pb-12 lg:pt-32 lg:pb-16 w-full z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="text-6xl mb-6 inline-block"
              >
                🍛
              </motion.div>
              
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Welcome to{' '}
                <span className="text-yellow-300 relative inline-block">
                  Spice Corner
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-300"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl mb-8 text-orange-100 max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Experience the authentic flavors of Pakistan, 
                <span className="block text-yellow-200 font-medium mt-2">where every bite tells a story 🕌</span>
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Link
                  to="/menu"
                  className="inline-flex items-center justify-center bg-white text-orange-600 px-8 py-4 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl group text-lg"
                >
                  Order Now
                  <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm border-2 border-white/40 px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 text-lg"
                >
                  Learn More
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div 
                className="flex flex-wrap gap-4 mt-10 justify-center lg:justify-start relative z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-2 bg-black/15 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-md">
                  <div className="bg-white/20 rounded-full p-1.5 flex items-center justify-center">
                    <ShieldCheckIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide">100% Halal</span>
                </div>
                <div className="flex items-center gap-2 bg-black/15 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-md">
                  <div className="bg-white/20 rounded-full p-1.5 flex items-center justify-center">
                    <StarIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide">4.9 Rating</span>
                </div>
                <div className="flex items-center gap-2 bg-black/15 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-md">
                  <div className="bg-white/20 rounded-full p-1.5 flex items-center justify-center">
                    <ClockIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide">30 min Delivery</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image/Animation with Updated Real Food Emojis */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex justify-center items-center relative"
            >
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
                      <div className="text-4xl mb-2">🍛</div>
                      <div className="text-sm font-medium">Biryani</div>
                    </div>
                    <div className="bg-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
                      <div className="text-4xl mb-2">🥘</div>
                      <div className="text-sm font-medium">Karahi</div>
                    </div>
                    <div className="bg-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
                      <div className="text-4xl mb-2">🍢</div>
                      <div className="text-sm font-medium">Kebab</div>
                    </div>
                    <div className="bg-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
                      <div className="text-4xl mb-2">🍚</div>
                      <div className="text-sm font-medium">Pulao</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider with height and position fixes */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] pointer-events-none z-0">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 260" 
            className="relative block w-[calc(100%+1.3px)] h-[80px] sm:h-[130px] md:h-[160px]"
            preserveAspectRatio="none"
          >
            <path 
              fill="#fef3c7" 
              fillOpacity="1" 
              d="M0,160L60,149.3C120,139,240,117,360,112C480,107,600,117,720,133.3C840,149,960,171,1080,165.3C1200,160,1320,128,1380,112L1440,96L1440,260L1380,260C1320,260,1200,260,1080,260C960,260,840,260,720,260C600,260,480,260,360,260C240,260,120,260,60,260L0,260Z"
            ></path>
          </svg>
        </div>
      </section>

      
{/* Recommendations Section */}
<div className="max-w-7xl mx-auto px-4">
  <Recommendations />
</div>


      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-b from-orange-50 to-white relative -mt-1">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${stat.bgColor} rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer`}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-medium mb-4">
              Why Us
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-orange-500">Spice Corner</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              We bring the authentic taste of Pakistan to your doorstep with love and care
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-3xl p-8 text-center shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className={`${feature.bgColor} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`${feature.textColor}`}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Menu Items */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4"
          >
            <div>
              <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-medium mb-3">
                Popular Dishes
              </div>
              <h2 className="text-4xl font-bold flex items-center gap-3">
                <FireIcon className="h-9 w-9 text-orange-500" />
                Featured Dishes
              </h2>
              <p className="text-gray-500 mt-1">Our most popular and loved dishes</p>
            </div>
            <Link to="/menu" className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2 group bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all">
              View All Menu
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredItems.map((item) => (
              <motion.div
                key={item._id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="h-56 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  <span className="text-7xl transform group-hover:scale-110 transition-transform duration-300">🍽️</span>
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-red-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                        Currently Unavailable
                      </span>
                    </div>
                  )}
                  {item.available && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Available
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl group-hover:text-orange-600 transition-colors">{item.name}</h3>
                    <span className="text-orange-600 font-bold text-lg bg-orange-50 px-3 py-1 rounded-full">
                      Rs {item.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-full text-gray-600 font-medium">
                      {item.category}
                    </span>
                    {item.available && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(item)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <ShoppingBagIcon className="h-4 w-4" />
                        Add to Cart
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-medium mb-4">
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our <span className="text-orange-500">Customers Say</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Real reviews from real food lovers who have tasted the Spice Corner experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-orange-100 relative"
              >
                <div className="absolute top-4 right-4 text-orange-200 text-6xl opacity-20">"</div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-3xl shadow-lg">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-3 text-lg">
                  {'⭐'.repeat(testimonial.rating)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{testimonial.comment}"</p>
                <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {testimonial.date}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 text-9xl animate-float">🍛</div>
          <div className="absolute bottom-0 right-0 text-9xl animate-float-delayed">🌶️</div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center text-white relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🎉
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Experience the <span className="text-yellow-300">Flavors of Pakistan</span>?
            </h2>
            <p className="text-orange-100 mb-8 text-xl max-w-2xl mx-auto">
              Order now and get 10% off on your first order! 
              <span className="block text-yellow-200 font-medium mt-2">Limited time offer 🎁</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="inline-flex items-center gap-3 bg-white text-orange-600 px-10 py-4 rounded-full font-bold hover:bg-orange-50 transition-all duration-300 hover:scale-105 shadow-xl text-lg group"
              >
                <span>Order Now</span>
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/40 px-10 py-4 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 text-lg"
              >
                View Menu
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;