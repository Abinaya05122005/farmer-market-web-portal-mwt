import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Sprout, 
  LogOut, 
  ShieldCheck, 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ClipboardList,
  Phone,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Globe,
  Heart,
  Truck,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { 
    currentUser, 
    logout, 
    isAuthenticated, 
    isFarmer, 
    isBuyer, 
    isDelivery,
    isAdmin, 
    openLoginModal,
    switchUserRole
  } = useAuth();
  
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [registerDropdownOpen, setRegisterDropdownOpen] = useState(false);

  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);
  const registerMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
      if (registerMenuRef.current && !registerMenuRef.current.contains(event.target)) {
        setRegisterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
    setRegisterDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/');
  };

  const handleRoleSwitch = async (targetRole) => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await switchUserRole(targetRole);
    if (targetRole === 'delivery') {
      navigate('/delivery/dashboard');
    } else if (targetRole === 'farmer') {
      navigate('/farmer/dashboard');
    } else if (targetRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/marketplace');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-xs border-b border-stone-100 dark:border-stone-800 transition-colors duration-200">
      {/* Top Notification / Announcement Bar */}
      <div className="bg-amber-400 dark:bg-amber-500 text-stone-950 text-xs font-semibold py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline">📍 Coimbatore & Nilgiris Farms</span>
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3 h-3 inline" /> {t('nav.helpline')}: +91 (800) 420-FARM
            </span>
          </div>

          <div className="text-center font-bold tracking-wide text-[11px] sm:text-xs">
            {t('nav.announcement')}
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-stone-900">
            <span>Direct Farm Delivery • 100% Pesticide Free</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo (FarmStore) */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-farm-700 dark:bg-farm-600 text-white flex items-center justify-center shadow-md group-hover:bg-farm-800 transition">
              <Sprout className="w-6 h-6 text-lime-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-2xl tracking-tight text-farm-900 dark:text-white">
                FarmStore
              </span>
              <span className="text-[10px] tracking-widest text-farm-600 dark:text-farm-400 font-semibold uppercase -mt-1">
                Farm To Table
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition ${
                isActive('/') ? 'text-farm-700 dark:text-farm-400 font-bold border-b-2 border-farm-600 dark:border-farm-400 pb-1' : 'text-stone-600 dark:text-stone-300 hover:text-farm-700 dark:hover:text-farm-400'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/marketplace"
              className={`text-sm font-medium transition ${
                isActive('/marketplace') ? 'text-farm-700 dark:text-farm-400 font-bold border-b-2 border-farm-600 dark:border-farm-400 pb-1' : 'text-stone-600 dark:text-stone-300 hover:text-farm-700 dark:hover:text-farm-400'
              }`}
            >
              {t('nav.marketplace')}
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition ${
                isActive('/about') ? 'text-farm-700 dark:text-farm-400 font-bold border-b-2 border-farm-600 dark:border-farm-400 pb-1' : 'text-stone-600 dark:text-stone-300 hover:text-farm-700 dark:hover:text-farm-400'
              }`}
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition ${
                isActive('/contact') ? 'text-farm-700 dark:text-farm-400 font-bold border-b-2 border-farm-600 dark:border-farm-400 pb-1' : 'text-stone-600 dark:text-stone-300 hover:text-farm-700 dark:hover:text-farm-400'
              }`}
            >
              {t('nav.contact')}
            </Link>

            {/* Role-specific Nav Links */}
            {isBuyer && (
              <div className="flex items-center space-x-5 pl-4 border-l border-stone-200 dark:border-stone-700">
                <Link
                  to="/buyer/dashboard"
                  className={`text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/buyer/dashboard') ? 'text-farm-700 dark:text-farm-400 font-bold border-b-2 border-farm-600 dark:border-farm-400 pb-1' : 'text-stone-600 dark:text-stone-300 hover:text-farm-700 dark:hover:text-farm-400'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/wishlist"
                  className={`text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/wishlist') ? 'text-rose-600 dark:text-rose-400 font-bold border-b-2 border-rose-600 pb-1' : 'text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>{t('nav.wishlist')}</span>
                  {wishlistCount > 0 && (
                    <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/orders"
                  className={`text-sm font-medium transition ${
                    isActive('/orders') ? 'text-farm-700 dark:text-farm-400 font-bold border-b-2 border-farm-600 dark:border-farm-400 pb-1' : 'text-stone-600 dark:text-stone-300 hover:text-farm-700 dark:hover:text-farm-400'
                  }`}
                >
                  {t('nav.myOrders')}
                </Link>
              </div>
            )}

            {isFarmer && (
              <div className="flex items-center space-x-3 pl-4 border-l border-stone-200 dark:border-stone-700">
                <Link
                  to="/farmer/dashboard"
                  className={`text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg transition ${
                    isActive('/farmer/dashboard') ? 'bg-farm-800 text-white' : 'bg-farm-100 dark:bg-farm-900/60 text-farm-800 dark:text-farm-300 hover:bg-farm-200'
                  }`}
                >
                  {t('nav.farmerPortal')}
                </Link>
                <Link
                  to="/farmer/orders"
                  className="text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-farm-700 dark:hover:text-farm-400"
                >
                  Orders
                </Link>
              </div>
            )}

            {isDelivery && (
              <div className="flex items-center space-x-3 pl-4 border-l border-stone-200 dark:border-stone-700">
                <Link
                  to="/delivery/dashboard"
                  className={`text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    isActive('/delivery/dashboard')
                      ? 'bg-sky-700 text-white'
                      : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 hover:bg-sky-200'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{t('nav.deliveryPortal') || 'DELIVERY PORTAL'}</span>
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="flex items-center space-x-4 pl-4 border-l border-stone-200 dark:border-stone-700">
                <Link
                  to="/admin/dashboard"
                  className={`text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg transition ${
                    isActive('/admin/dashboard') ? 'bg-purple-800 text-white' : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 hover:bg-purple-200'
                  }`}
                >
                  {t('nav.adminPanel')}
                </Link>
              </div>
            )}
          </nav>

          {/* Right Action Icons: Language, Theme, Wishlist, Cart (Buyers only), User Profile / Login Modal Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* 1. Language Selector Dropdown (English & Tamil) */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition cursor-pointer"
                title="Change Language / மொழியை மாற்றுக"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-4 h-4 text-farm-600 dark:text-farm-400" />
                <span className="hidden sm:inline">{language === 'ta' ? 'தமிழ்' : 'EN'}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-36 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800 py-1 text-xs text-stone-700 dark:text-stone-200 z-50 animate-in fade-in"
                >
                  <button
                    type="button"
                    onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-farm-50 dark:hover:bg-stone-800 cursor-pointer ${
                      language === 'en' ? 'font-bold text-farm-700 dark:text-farm-400 bg-farm-50/50 dark:bg-stone-800/50' : ''
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-farm-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setLanguage('ta'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-farm-50 dark:hover:bg-stone-800 cursor-pointer ${
                      language === 'ta' ? 'font-bold text-farm-700 dark:text-farm-400 bg-farm-50/50 dark:bg-stone-800/50' : ''
                    }`}
                  >
                    <span>🇮🇳 தமிழ் (Tamil)</span>
                    {language === 'ta' && <span className="w-1.5 h-1.5 rounded-full bg-farm-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* 2. Instant Theme Switcher Pill (Light ☀️ | Dark 🌙 | System 💻) */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-2xl border border-stone-200/80 dark:border-stone-700/80">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-xl transition flex items-center justify-center cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-amber-500 shadow-sm font-bold scale-105'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
                title="Light Mode / பகல் பயன்முறை"
              >
                <Sun className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-xl transition flex items-center justify-center cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-stone-900 text-sky-400 shadow-sm font-bold scale-105 ring-1 ring-stone-700'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
                title="Dark Mode / இரவு பயன்முறை"
              >
                <Moon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-xl transition flex items-center justify-center cursor-pointer ${
                  theme === 'system'
                    ? 'bg-white dark:bg-stone-900 text-farm-700 dark:text-farm-400 shadow-sm font-bold scale-105'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
                title="System Default / கணினி இயல்புநிலை"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            {/* 3. Buyer Wishlist (STRICTLY HIDDEN for Farmers, Delivery Partners and Admins) */}
            {!isFarmer && !isAdmin && !isDelivery && (
              <Link
                to="/wishlist"
                className="relative p-2 text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-stone-800 rounded-full transition"
                title="Buyer Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* 4. Buyer Cart (STRICTLY HIDDEN for Farmers, Delivery Partners and Admins) */}
            {!isFarmer && !isAdmin && !isDelivery && (
              <Link
                to="/cart"
                className="relative p-2 text-stone-700 dark:text-stone-300 hover:text-farm-700 dark:hover:text-farm-400 hover:bg-farm-50 dark:hover:bg-stone-800 rounded-full transition"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* 4. User Profile Dropdown OR Login Modal Trigger Button */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-100">{currentUser.name}</span>
                  <span className="text-[10px] text-farm-600 dark:text-farm-400 capitalize font-medium">
                    {currentUser.role} {currentUser.farmName ? `• ${currentUser.farmName}` : ''}
                  </span>
                </div>

                {/* Profile Avatar & Interactive Clickable Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center rounded-full ring-2 ring-farm-500/40 hover:ring-farm-600 p-0.5 focus:outline-none cursor-pointer transition active:scale-95"
                    aria-expanded={userMenuOpen}
                    aria-label="User Account Menu"
                  >
                    <img
                      src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover pointer-events-none"
                    />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
                      role="menu"
                    >
                      {/* User Header Info */}
                      <div className="px-4 py-2.5 border-b border-stone-100 dark:border-stone-800">
                        <p className="text-xs font-bold text-stone-900 dark:text-white leading-tight">{currentUser.name}</p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">{currentUser.email}</p>
                        <div className="mt-1.5">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            isFarmer 
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' 
                              : isAdmin 
                              ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300' 
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                          }`}>
                            {currentUser.role}
                          </span>
                        </div>
                      </div>

                      {/* Farmer Menu Items */}
                      {isFarmer && (
                        <div className="py-1">
                          <Link
                            to="/farmer/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-farm-50 dark:hover:bg-stone-800 hover:text-farm-800 dark:hover:text-farm-300 transition cursor-pointer"
                            role="menuitem"
                          >
                            <LayoutDashboard className="w-4 h-4 text-farm-600 dark:text-farm-400 shrink-0" />
                            <span>{t('nav.farmDashboard')}</span>
                          </Link>

                          <Link
                            to="/farmer/add-product"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-farm-50 dark:hover:bg-stone-800 hover:text-farm-800 dark:hover:text-farm-300 transition cursor-pointer"
                            role="menuitem"
                          >
                            <PlusCircle className="w-4 h-4 text-farm-600 dark:text-farm-400 shrink-0" />
                            <span>List New Produce</span>
                          </Link>

                          <Link
                            to="/farmer/my-products"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-farm-50 dark:hover:bg-stone-800 hover:text-farm-800 dark:hover:text-farm-300 transition cursor-pointer"
                            role="menuitem"
                          >
                            <Package className="w-4 h-4 text-farm-600 dark:text-farm-400 shrink-0" />
                            <span>Manage My Crops</span>
                          </Link>

                          <Link
                            to="/farmer/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-farm-50 dark:hover:bg-stone-800 hover:text-farm-800 dark:hover:text-farm-300 transition cursor-pointer"
                            role="menuitem"
                          >
                            <ClipboardList className="w-4 h-4 text-farm-600 dark:text-farm-400 shrink-0" />
                            <span>Customer Orders</span>
                          </Link>
                        </div>
                      )}

                      {/* Buyer Menu Items */}
                      {isBuyer && (
                        <div className="py-1">
                          <Link
                            to="/buyer/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-farm-50 dark:hover:bg-stone-800 hover:text-farm-800 dark:hover:text-farm-300 transition cursor-pointer"
                            role="menuitem"
                          >
                            <LayoutDashboard className="w-4 h-4 text-farm-600 dark:text-farm-400 shrink-0" />
                            <span>Buyer Dashboard</span>
                          </Link>
                          <Link
                            to="/marketplace"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-farm-50 dark:hover:bg-stone-800 hover:text-farm-800 dark:hover:text-farm-300 transition cursor-pointer"
                            role="menuitem"
                          >
                            <ShoppingBag className="w-4 h-4 text-farm-600 dark:text-farm-400 shrink-0" />
                            <span>Browse Marketplace</span>
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-rose-50 dark:hover:bg-stone-800 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                            role="menuitem"
                          >
                            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>My Wishlist ({wishlistCount})</span>
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-farm-50 dark:hover:bg-stone-800 hover:text-farm-800 dark:hover:text-farm-300 transition cursor-pointer"
                            role="menuitem"
                          >
                            <ClipboardList className="w-4 h-4 text-farm-600 dark:text-farm-400 shrink-0" />
                            <span>{t('nav.myOrders')}</span>
                          </Link>
                        </div>
                      )}

                      {/* Delivery Partner Menu Items */}
                      {isDelivery && (
                        <div className="py-1">
                          <Link
                            to="/delivery/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-sky-50 dark:hover:bg-stone-800 hover:text-sky-800 dark:hover:text-sky-300 transition cursor-pointer"
                            role="menuitem"
                          >
                            <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                            <span>{t('nav.deliveryDashboard') || 'Delivery Dashboard'}</span>
                          </Link>
                        </div>
                      )}

                      {/* Admin Menu Items */}
                      {isAdmin && (
                        <div className="py-1">
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-farm-50 dark:hover:bg-stone-800 hover:text-farm-800 dark:hover:text-farm-300 transition cursor-pointer"
                            role="menuitem"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span>{t('nav.adminPanel')}</span>
                          </Link>
                        </div>
                      )}

                      {/* Quick Role Switcher for Seamless Testing & Multi-Role Demo */}
                      <div className="border-t border-stone-100 dark:border-stone-800 my-1 pt-2 pb-1.5 px-3">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                          Switch Mode
                        </span>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => handleRoleSwitch('buyer')}
                            className={`px-1.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer text-center ${
                              currentUser.role === 'buyer'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            🛒 Buyer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRoleSwitch('farmer')}
                            className={`px-1.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer text-center ${
                              currentUser.role === 'farmer'
                                ? 'bg-farm-700 text-white shadow-xs'
                                : 'bg-stone-100 dark:bg-stone-800 hover:bg-farm-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            👨‍🌾 Farmer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRoleSwitch('delivery')}
                            className={`px-1.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer text-center ${
                              currentUser.role === 'delivery'
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-stone-100 dark:bg-stone-800 hover:bg-sky-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            🚚 Delivery
                          </button>
                        </div>
                      </div>

                      {/* Sign Out Action */}
                      <div className="border-t border-stone-100 dark:border-stone-800 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer text-left"
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>{t('nav.signOut')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Direct Register Dropdown */}
                <div className="relative" ref={registerMenuRef}>
                  <button
                    type="button"
                    onClick={() => setRegisterDropdownOpen(!registerDropdownOpen)}
                    className="text-xs font-bold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 px-3 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-farm-600 dark:text-farm-400" />
                    <span>{language === 'ta' ? 'பதிவு செய்க' : 'Register'}</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </button>

                  {registerDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800 py-2 z-50 text-xs animate-in fade-in">
                      <Link
                        to="/delivery/register"
                        onClick={() => setRegisterDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-sky-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition"
                      >
                        <span className="text-lg">🚚</span>
                        <div>
                          <p className="font-bold text-sky-700 dark:text-sky-400">
                            {language === 'ta' ? 'விநியோக பங்குதாரர்' : 'Delivery Partner'}
                          </p>
                          <p className="text-[10px] text-stone-500">Join logistics fleet</p>
                        </div>
                      </Link>

                      <Link
                        to="/farmer/register"
                        onClick={() => setRegisterDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-emerald-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition"
                      >
                        <span className="text-lg">👨‍🌾</span>
                        <div>
                          <p className="font-bold text-emerald-700 dark:text-emerald-400">
                            {language === 'ta' ? 'விவசாயி பதிவு' : 'Farmer / Producer'}
                          </p>
                          <p className="text-[10px] text-stone-500">Sell fresh crops</p>
                        </div>
                      </Link>

                      <Link
                        to="/buyer/register"
                        onClick={() => setRegisterDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition"
                      >
                        <span className="text-lg">🛒</span>
                        <div>
                          <p className="font-bold text-amber-700 dark:text-amber-400">
                            {language === 'ta' ? 'வாங்குபவர் பதிவு' : 'Buyer / Consumer'}
                          </p>
                          <p className="text-[10px] text-stone-500">Shop organic harvests</p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Unified Login Modal Button */}
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="text-xs font-bold text-white bg-farm-700 hover:bg-farm-800 dark:bg-farm-600 dark:hover:bg-farm-700 px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Sign In with Role Selection"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t('nav.signIn')}</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-stone-800 dark:text-stone-100"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-stone-800 dark:text-stone-100"
          >
            {t('nav.marketplace')}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-stone-800 dark:text-stone-100"
          >
            {t('nav.about')}
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-stone-800 dark:text-stone-100"
          >
            {t('nav.contact')}
          </Link>

          {isFarmer && (
            <div className="border-t border-stone-100 dark:border-stone-800 pt-3 space-y-2">
              <span className="text-xs font-bold text-farm-700 dark:text-farm-400 uppercase">{t('nav.farmerPortal')}</span>
              <Link to="/farmer/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm text-stone-600 dark:text-stone-300">{t('nav.farmDashboard')}</Link>
              <Link to="/farmer/add-product" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm text-stone-600 dark:text-stone-300">List New Produce</Link>
              <Link to="/farmer/my-products" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm text-stone-600 dark:text-stone-300">Manage My Crops</Link>
              <Link to="/farmer/orders" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm text-stone-600 dark:text-stone-300">Customer Orders</Link>
            </div>
          )}

          {isBuyer && (
            <div className="border-t border-stone-100 dark:border-stone-800 pt-3 space-y-2">
              <Link to="/buyer/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm font-semibold text-farm-700 dark:text-farm-400 flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Buyer Dashboard</span>
              </Link>
              <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm text-stone-600 dark:text-stone-300">{t('nav.marketplace')}</Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm text-stone-600 dark:text-stone-300 flex items-center justify-between">
                <span>{t('nav.wishlist')}</span>
                {wishlistCount > 0 && <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs font-bold">{wishlistCount}</span>}
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm text-stone-600 dark:text-stone-300 flex items-center justify-between">
                <span>{t('nav.cart')}</span>
                {cartCount > 0 && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">{cartCount}</span>}
              </Link>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm text-stone-600 dark:text-stone-300">{t('nav.myOrders')}</Link>
            </div>
          )}

          {isDelivery && (
            <div className="border-t border-stone-100 dark:border-stone-800 pt-3 space-y-2">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase">Delivery Logistics</span>
              <Link to="/delivery/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm text-stone-600 dark:text-stone-300">{t('nav.deliveryDashboard') || 'Delivery Dashboard'}</Link>
            </div>
          )}

          {isAuthenticated ? (
            <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-center py-2.5 bg-rose-600 text-white font-bold rounded-xl block text-xs cursor-pointer shadow-sm"
              >
                {t('nav.signOut')}
              </button>
            </div>
          ) : (
            <div className="border-t border-stone-100 dark:border-stone-800 pt-3 space-y-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                {language === 'ta' ? 'புதிய கணக்கு பதிவு' : 'Create New Account'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  to="/delivery/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-1 text-center bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 rounded-xl text-[11px] font-bold border border-sky-200 dark:border-sky-800 flex flex-col items-center gap-1"
                >
                  <span className="text-base">🚚</span>
                  <span>Delivery</span>
                </Link>
                <Link
                  to="/farmer/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-1 text-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 flex flex-col items-center gap-1"
                >
                  <span className="text-base">👨‍🌾</span>
                  <span>Farmer</span>
                </Link>
                <Link
                  to="/buyer/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-1 text-center bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-xl text-[11px] font-bold border border-amber-200 dark:border-amber-800 flex flex-col items-center gap-1"
                >
                  <span className="text-base">🛒</span>
                  <span>Buyer</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLoginModal();
                }}
                className="w-full text-center py-3 bg-farm-700 dark:bg-farm-600 text-white font-bold rounded-xl block text-xs cursor-pointer shadow-md"
              >
                {t('nav.signIn')} (Choose Role)
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
