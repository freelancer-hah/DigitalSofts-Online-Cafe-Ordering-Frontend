import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  ClockIcon, 
  TruckIcon, 
  StarIcon,
  HeartIcon 
} from '@heroicons/react/outline';

const Home = () => {
  const features = [
    {
      icon: <ClockIcon className="h-8 w-8" />,
      title: 'Fast Delivery',
      description: 'Hot and fresh food delivered to your doorstep within 30 minutes'
    },
    {
      icon: <HeartIcon className="h-8 w-8" />,
      title: 'Quality Ingredients',
      description: 'We use only the freshest and highest quality ingredients'
    },
    {
      icon: <StarIcon className="h-8 w-8" />,
      title: "Chef's Special",
      description: 'Our expert chefs create unique flavors you\'ll love'
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-r from-orange-500 to-orange-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Welcome to Spice Corner
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Experience the authentic flavors of Pakistan, delivered to your doorstep
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center bg-white text-orange-600 px-8 py-4 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 transform hover:scale-105"
              >
                Order Now
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center bg-orange-600/30 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-full font-semibold hover:bg-orange-600/50 transition"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="text-orange-500 flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Today's Special</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-white text-4xl">🍽️</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">Special Combo {item}</h3>
                  <p className="text-gray-600 text-sm mb-3">Delicious combination of our best dishes</p>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-600 font-bold text-xl">Rs. 999</span>
                    <Link to="/menu" className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-700 transition">
                      Order Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;