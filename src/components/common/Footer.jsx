import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneIcon, 
  MailIcon, 
  LocationMarkerIcon
} from '@heroicons/react/outline';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">🍽️ Spice Corner</h3>
            <p className="text-gray-400 text-sm">
              Authentic flavors delivered to your doorstep. Fresh, hot, and made with love.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/menu" className="hover:text-white transition">Menu</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link to="/track" className="hover:text-white transition">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MailIcon className="h-4 w-4" />
                <span>info@spicecorner.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <LocationMarkerIcon className="h-4 w-4" />
                <span>123 Food Street, Lahore</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-orange-400 transition">
                <span className="text-2xl">📘</span>
              </a>
              <a href="#" className="hover:text-orange-400 transition">
                <span className="text-2xl">📸</span>
              </a>
              <a href="#" className="hover:text-orange-400 transition">
                <span className="text-2xl">🐦</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          © 2024 Spice Corner. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;