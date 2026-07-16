import React from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  StarIcon, 
  HeartIcon, 
  ClockIcon,
  SparklesIcon,
  AcademicCapIcon,
  GlobeIcon,
  FireIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/outline';
import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    {
      icon: <HeartIcon className="h-8 w-8" />,
      title: 'Quality First',
      description: 'We use only the freshest ingredients in all our dishes',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <StarIcon className="h-8 w-8" />,
      title: 'Authentic Flavors',
      description: 'Traditional recipes passed down through generations',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: <ClockIcon className="h-8 w-8" />,
      title: 'Fast Service',
      description: 'Quick preparation and delivery without compromising quality',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <UsersIcon className="h-8 w-8" />,
      title: 'Customer Focus',
      description: 'Your satisfaction is our top priority',
      color: 'from-green-500 to-green-600'
    }
  ];

  const achievements = [
    { icon: '🏆', label: 'Best Restaurant 2023' },
    { icon: '⭐', label: '5-Star Rating 2024' },
    { icon: '📰', label: 'Featured in Food Magazine' },
    { icon: '🏅', label: 'Excellence in Service' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
<section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 text-white min-h-[50vh] flex items-center overflow-hidden">
  {/* Background Decorations */}
  <div className="absolute inset-0 overflow-hidden z-0">
    <motion.div
      animate={{ 
        x: [0, 60, 0],
        y: [0, -40, 0],
      }}
      transition={{ duration: 20, repeat: Infinity }}
      className="absolute top-10 left-10 text-7xl opacity-10"
    >
      🕌
    </motion.div>
    <motion.div
      animate={{ 
        x: [0, -60, 0],
        y: [0, 40, 0],
      }}
      transition={{ duration: 18, repeat: Infinity }}
      className="absolute bottom-10 right-10 text-7xl opacity-10"
    >
      🌙
    </motion.div>
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center max-w-4xl mx-auto"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="text-5xl sm:text-6xl mb-4"
      >
        🌟
      </motion.div>
      
      <motion.h1 
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        About <span className="text-yellow-300">Spice Corner</span>
      </motion.h1>
      
      <motion.p 
        className="text-base sm:text-lg md:text-xl text-orange-100 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        Serving authentic Pakistani cuisine with love
        <span className="block text-yellow-200 mt-1">since 2020 ❤️</span>
      </motion.p>
    </motion.div>
  </div>

  {/* Wave Divider */}
  <div className="absolute bottom-0 left-0 right-0 z-0 leading-[0] pointer-events-none">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 80"
      className="w-full h-[50px] sm:h-[70px] md:h-[90px]"
      preserveAspectRatio="none"
    >
      <path
        fill="#ffffff"
        d="M0,32 C360,80 720,0 1080,48 C1260,64 1380,32 1440,48 L1440,80 L0,80 Z"
      />
    </svg>
  </div>
</section>

      {/* Story Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="h-8 w-8 text-orange-500" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Our Story</h2>
            </div>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p className="text-base sm:text-lg">
                <span className="text-2xl mr-2">🏡</span> 
                Spice Corner was born from a simple idea: to bring the authentic, 
                soul-warming flavors of Pakistani home cooking to everyone. 
                What started as a small family kitchen has grown into a beloved 
                local restaurant known for its commitment to quality and tradition.
              </p>
              <p className="text-base sm:text-lg">
                <span className="text-2xl mr-2">👨‍🍳</span> 
                Our chefs use time-honored recipes passed down through generations, 
                combined with the freshest ingredients to create dishes that remind you of home. 
                From our signature Chicken Karahi to our mouth-watering desserts, 
                every dish is crafted with care and passion.
              </p>
              <p className="text-base sm:text-lg">
                <span className="text-2xl mr-2">🌍</span> 
                Today, we're proud to serve our community with both dine-in 
                and delivery options, bringing the taste of Pakistan to your table. 
                Our mission is to make every meal an unforgettable experience.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
              Our <span className="text-orange-500">Achievements</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
              Recognized for excellence in food and service
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6"
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="text-3xl sm:text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-800">{achievement.label}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
              Our <span className="text-orange-500">Core Values</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
              The principles that guide everything we do at Spice Corner
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-gray-50 rounded-2xl p-5 sm:p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100"
              >
                <div className={`bg-gradient-to-r ${value.color} text-white w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {value.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">{value.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 sm:py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-0 left-0 text-7xl opacity-10"
          >
            ✨
          </motion.div>
          <motion.div
            animate={{ 
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute bottom-0 right-0 text-7xl opacity-10"
          >
            ✨
          </motion.div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center"
          >
            {[
              { value: '4+', label: 'Years of Service' },
              { value: '50+', label: 'Delicious Dishes' },
              { value: '10k+', label: 'Happy Customers' },
              { value: '4.9⭐', label: 'Average Rating' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.2, type: 'spring' }}
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-orange-200 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Wave Divider - Fixed Bottom */}
        <div className="absolute bottom-0 left-0 right-0 rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none" style={{ height: '60px' }}>
            <path 
              fill="#ffffff" 
              d="M0,40 C360,0 720,40 1080,20 C1260,10 1380,30 1440,20 L1440,80 L0,80 Z"
              fillOpacity="1"
            />
          </svg>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
              Ready to Taste <span className="text-orange-500">The Difference</span>?
            </h2>
            <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
              Come experience the authentic flavors of Pakistan at Spice Corner
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                View Our Menu
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-gray-200 transition-all duration-300"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;