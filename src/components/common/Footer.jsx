import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';
import { MdRestaurant } from 'react-icons/md';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { to: '/menu', label: 'Menu' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
    { to: '/track', label: 'Track Order' },
    { to: '/admin/login', label: 'Admin Login' }
  ];

  const socialLinks = [
    { icon: <FaFacebook className="h-5 w-5" />, label: 'Facebook', href: '#' },
    { icon: <FaInstagram className="h-5 w-5" />, label: 'Instagram', href: '#' },
    { icon: <FaTwitter className="h-5 w-5" />, label: 'Twitter', href: '#' },
    { icon: <FaYoutube className="h-5 w-5" />, label: 'YouTube', href: '#' }
  ];

  const workingHours = [
    { day: 'Monday - Friday', hours: '11:00 AM - 11:00 PM' },
    { day: 'Saturday - Sunday', hours: '12:00 PM - 12:00 AM' }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl">🍽️</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Spice Corner
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Authentic flavors delivered to your doorstep. Fresh, hot, and made with love. ❤️
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
                Open Now
              </span>
              <span className="text-xs text-gray-500">|</span>
              <span className="text-xs text-gray-400">Order Online</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <span className="h-6 w-0.5 bg-orange-500 rounded-full"></span>
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Hours */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <span className="h-6 w-0.5 bg-orange-500 rounded-full"></span>
              Contact & Hours
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400 text-sm hover:text-white transition-colors">
                <FaPhone className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-300">Call Us</p>
                  <p>+92 300 1234567</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm hover:text-white transition-colors">
                <FaEnvelope className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-300">Email</p>
                  <p>info@spicecorner.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm hover:text-white transition-colors">
                <FaMapMarkerAlt className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-300">Address</p>
                  <p>123 Food Street, Lahore</p>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* Social & Newsletter */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <span className="h-6 w-0.5 bg-orange-500 rounded-full"></span>
              Follow Us
            </h4>
            
            {/* Social Icons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 bg-gray-800 hover:bg-orange-500 rounded-xl text-gray-400 hover:text-white transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <span className="group-hover:scale-110 transition-transform inline-block">
                    {social.icon}
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Working Hours */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <FaClock className="h-4 w-4 text-orange-500" />
                Working Hours
              </h5>
              <div className="space-y-1 text-xs text-gray-400">
                {workingHours.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.day}</span>
                    <span className="text-gray-300">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-sm text-gray-400">
              © {currentYear} Spice Corner. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Link to="#" className="hover:text-gray-300 transition">Privacy Policy</Link>
              <span className="w-px h-3 bg-gray-700"></span>
              <Link to="#" className="hover:text-gray-300 transition">Terms of Service</Link>
              <span className="w-px h-3 bg-gray-700"></span>
              <Link to="#" className="hover:text-gray-300 transition">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;