import React from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, StarIcon, HeartIcon, ClockIcon } from '@heroicons/react/outline';

const About = () => {
  const values = [
    {
      icon: <HeartIcon className="h-8 w-8" />,
      title: 'Quality First',
      description: 'We use only the freshest ingredients in all our dishes'
    },
    {
      icon: <StarIcon className="h-8 w-8" />,
      title: 'Authentic Flavors',
      description: 'Traditional recipes passed down through generations'
    },
    {
      icon: <ClockIcon className="h-8 w-8" />,
      title: 'Fast Service',
      description: 'Quick preparation and delivery without compromising quality'
    },
    {
      icon: <UsersIcon className="h-8 w-8" />,
      title: 'Customer Focus',
      description: 'Your satisfaction is our top priority'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            About Spice Corner
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-orange-100"
          >
            Serving authentic Pakistani cuisine with love since 2020
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Spice Corner was born from a simple idea: to bring the authentic, 
              soul-warming flavors of Pakistani home cooking to everyone. 
              What started as a small family kitchen has grown into a beloved 
              local restaurant known for its commitment to quality and tradition.
            </p>
            <p>
              Our chefs use time-honored recipes and the freshest ingredients 
              to create dishes that remind you of home. From our signature 
              Chicken Karahi to our mouth-watering desserts, every dish is 
              crafted with care and passion.
            </p>
            <p>
              Today, we're proud to serve our community with both dine-in 
              and delivery options, bringing the taste of Pakistan to your table.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="text-orange-500 flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">4+</div>
              <div className="text-sm text-orange-200 mt-1">Years of Service</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50+</div>
              <div className="text-sm text-orange-200 mt-1">Delicious Dishes</div>
            </div>
            <div>
              <div className="text-4xl font-bold">10k+</div>
              <div className="text-sm text-orange-200 mt-1">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold">4.9⭐</div>
              <div className="text-sm text-orange-200 mt-1">Average Rating</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;