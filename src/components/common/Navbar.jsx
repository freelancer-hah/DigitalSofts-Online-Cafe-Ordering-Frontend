// frontend/src/components/common/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  UserCircleIcon,
  MenuIcon,
  XIcon,
  ShieldCheckIcon,
  HomeIcon,
  ClipboardListIcon,
  UsersIcon,
  CakeIcon,
  ChartBarIcon,
  LogoutIcon,
  SearchIcon,
  PhoneIcon,
  InformationCircleIcon,
  CogIcon,
} from '@heroicons/react/outline';
import { FaMotorcycle } from 'react-icons/fa';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAdmin, isRider, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
    setIsAdminMenuOpen(false);
  };

  // Normal user navigation links
  const userNavLinks = [
    { to: '/', label: 'Home', icon: <HomeIcon className="h-5 w-5" /> },
    { to: '/menu', label: 'Menu', icon: <CakeIcon className="h-5 w-5" /> },
    { to: '/about', label: 'About', icon: <InformationCircleIcon className="h-5 w-5" /> },
    { to: '/contact', label: 'Contact', icon: <PhoneIcon className="h-5 w-5" /> },
    { to: '/track', label: 'Track', icon: <SearchIcon className="h-5 w-5" /> },
  ];

  // Admin navigation links
  const adminNavLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <ChartBarIcon className="h-5 w-5" /> },
    { to: '/admin/menu', label: 'Menu', icon: <CakeIcon className="h-5 w-5" /> },
    { to: '/admin/kitchen', label: 'Kitchen', icon: <ClipboardListIcon className="h-5 w-5" /> },
    { to: '/admin/orders', label: 'Orders', icon: <ClipboardListIcon className="h-5 w-5" /> },
    { to: '/admin/users', label: 'Users', icon: <UsersIcon className="h-5 w-5" /> },
  ];

  // Rider navigation (just a single link to dashboard)
  const riderNavLinks = [
    { to: '/rider/dashboard', label: 'Rider Dashboard', icon: <FaMotorcycle className="h-5 w-5" /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-gradient-to-r from-orange-600 to-orange-700 shadow-2xl' 
          : 'bg-gradient-to-r from-orange-600 to-orange-700'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to={isAdmin ? "/admin/dashboard" : isRider ? "/rider/dashboard" : "/"} 
            className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
          >
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              🍽️ Spice
            </span>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white hidden xs:inline">
              Corner
            </span>
            {isAdmin && (
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-yellow-400 text-gray-900 px-1.5 sm:px-2.5 py-0.5 rounded-full font-bold shadow-lg">
                Admin
              </span>
            )}
            {isRider && (
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-green-400 text-gray-900 px-1.5 sm:px-2.5 py-0.5 rounded-full font-bold shadow-lg">
                Rider
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {isAdmin ? (
              adminNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 flex items-center gap-1 lg:gap-2 ${
                    isActive(link.to)
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-white/60">{link.icon}</span>
                  <span className="hidden lg:inline">{link.label}</span>
                  {isActive(link.to) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                    />
                  )}
                </Link>
              ))
            ) : isRider ? (
              riderNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 flex items-center gap-1 lg:gap-2 ${
                    isActive(link.to)
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-white/60">{link.icon}</span>
                  <span className="hidden lg:inline">{link.label}</span>
                  {isActive(link.to) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                    />
                  )}
                </Link>
              ))
            ) : (
              userNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 flex items-center gap-1 lg:gap-2 ${
                    isActive(link.to)
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-white/60">{link.icon}</span>
                  <span className="hidden lg:inline">{link.label}</span>
                  {isActive(link.to) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                    />
                  )}
                </Link>
              ))
            )}

            {/* Cart - only for normal users (not admin or rider) */}
            {!isAdmin && !isRider && (
              <Link 
                to="/cart" 
                className="relative p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white/90" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-lg ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Admin / Rider Section */}
            <div className="flex items-center space-x-1 lg:space-x-2">
              {isAdmin ? (
                <div className="relative">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold transition-all flex items-center gap-1 lg:gap-2 shadow-lg"
                  >
                    <ShieldCheckIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="hidden sm:inline">Admin</span>
                    <span className="ml-0.5 lg:ml-1">▼</span>
                  </button>
                  <AnimatePresence>
                    {isAdminMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl py-1 border border-gray-100 overflow-hidden z-50"
                      >
                        {adminNavLinks.map((link) => (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsAdminMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
                          >
                            <span className="text-gray-400">{link.icon}</span>
                            {link.label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                          >
                            <LogoutIcon className="h-5 w-5 text-red-400" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : isRider ? (
                <>
                  <Link
                    to="/rider/dashboard"
                    className="bg-green-500 hover:bg-green-600 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold transition-all flex items-center gap-1 lg:gap-2 shadow-lg"
                  >
                    <FaMotorcycle className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="hidden sm:inline">Rider</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/20 hover:bg-red-500/30 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/admin/login"
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-bold transition-all flex items-center gap-1 shadow-lg"
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span className="hidden xs:inline">Admin</span>
                  </Link>
                  <Link
                    to="/rider/login"
                    className="bg-green-500 hover:bg-green-600 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-bold transition-all flex items-center gap-1 shadow-lg"
                  >
                    <FaMotorcycle className="h-4 w-4" />
                    <span className="hidden xs:inline">Rider</span>
                  </Link>
                </>
              )}
            </div>

            {/* User Section - only for normal users */}
            {!isAdmin && !isRider && (
              <div className="flex items-center space-x-1 lg:space-x-2">
                {user ? (
                  <>
                    <Link to="/profile" className="p-1.5 lg:p-2 rounded-lg hover:bg-white/10 transition-all">
                      <UserCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white/90" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-white/10 hover:bg-white/20 text-white px-2 lg:px-3 py-1 rounded-full text-xs font-medium transition-all"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-white/90 hover:text-white px-2 lg:px-3 py-1 rounded-full text-xs font-medium transition-all hover:bg-white/10"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-white text-orange-600 hover:bg-orange-50 px-3 lg:px-4 py-1 rounded-full text-xs font-bold transition-all shadow-lg"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition-all"
          >
            {isMobileMenuOpen ? <XIcon className="h-6 w-6 text-white" /> : <MenuIcon className="h-6 w-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gradient-to-b from-orange-700 to-orange-800 px-4 py-3 overflow-hidden border-t border-white/10 max-h-[80vh] overflow-y-auto"
          >
            {isAdmin ? (
              <div className="space-y-1">
                <div className="px-3 py-2 mb-2 border-b border-white/10">
                  <p className="text-xs text-yellow-300 font-medium flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4" />
                    Admin Panel
                  </p>
                </div>
                {adminNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all ${
                      isActive(link.to) ? 'bg-white/20 text-white' : ''
                    }`}
                  >
                    <span className="text-white/60">{link.icon}</span>
                    {link.label}
                    {isActive(link.to) && (
                      <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </Link>
                ))}
                <div className="border-t border-white/10 mt-3 pt-3">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-300 hover:text-red-200 hover:bg-white/10 transition-all"
                  >
                    <LogoutIcon className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </div>
            ) : isRider ? (
              <div className="space-y-1">
                <div className="px-3 py-2 mb-2 border-b border-white/10">
                  <p className="text-xs text-green-300 font-medium flex items-center gap-2">
                    <FaMotorcycle className="h-4 w-4" />
                    Rider Panel
                  </p>
                </div>
                {riderNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all ${
                      isActive(link.to) ? 'bg-white/20 text-white' : ''
                    }`}
                  >
                    <span className="text-white/60">{link.icon}</span>
                    {link.label}
                    {isActive(link.to) && (
                      <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </Link>
                ))}
                <div className="border-t border-white/10 mt-3 pt-3">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-300 hover:text-red-200 hover:bg-white/10 transition-all"
                  >
                    <LogoutIcon className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {userNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all ${
                      isActive(link.to) ? 'bg-white/20 text-white' : ''
                    }`}
                  >
                    <span className="text-white/60">{link.icon}</span>
                    {link.label}
                    {isActive(link.to) && (
                      <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </Link>
                ))}
                <div className="border-t border-white/10 mt-3 pt-3">
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/admin/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-all font-medium"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    Admin Login
                  </Link>
                  <Link
                    to="/rider/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-all font-medium"
                  >
                    <FaMotorcycle className="h-5 w-5" />
                    Rider Login
                  </Link>
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <UserCircleIcon className="h-5 w-5" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-300 hover:text-red-200 hover:bg-white/10 transition-all"
                      >
                        <LogoutIcon className="h-5 w-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all font-medium"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;