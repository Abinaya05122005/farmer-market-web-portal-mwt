import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoginModal from './components/LoginModal';
import VoiceAssistant from './components/VoiceAssistant';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

// Buyer Pages
import BuyerRegister from './pages/buyer/BuyerRegister';
import Marketplace from './pages/buyer/Marketplace';
import Wishlist from './pages/buyer/Wishlist';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import MyOrders from './pages/buyer/MyOrders';
import BuyerDashboard from './pages/buyer/BuyerDashboard';

// Farmer Pages
import FarmerRegister from './pages/farmer/FarmerRegister';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AddProduct from './pages/farmer/AddProduct';
import MyProducts from './pages/farmer/MyProducts';
import FarmerOrders from './pages/farmer/FarmerOrders';

// Delivery Partner Pages
import DeliveryRegister from './pages/delivery/DeliveryRegister';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <ProductProvider>
              <CartProvider>
                <WishlistProvider>
                  <Router>
                    <div className="min-h-screen flex flex-col justify-between bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 selection:bg-lime-200 dark:selection:bg-farm-700 selection:text-stone-900 dark:selection:text-white transition-colors duration-200">
                      {/* Persistent Navbar with Login Modal Trigger, Theme Switcher & Wishlist */}
                      <Navbar />

                      {/* Global In-Page Login Modal (4-Role Selection -> Role Login Form) */}
                      <LoginModal />

                      {/* Voice Assistant (🎤 Web Speech API Assistant) */}
                      <VoiceAssistant />

                    <div className="flex-grow">
                      <Routes>
                        {/* Public Information Pages */}
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />

                        {/* Dedicated Admin Login */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                        {/* Legacy /login routes redirected to home */}
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="/buyer/login" element={<Navigate to="/" replace />} />
                        <Route path="/farmer/login" element={<Navigate to="/" replace />} />
                        <Route path="/delivery/login" element={<Navigate to="/" replace />} />

                        {/* Buyer Experience */}
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/buyer/register" element={<BuyerRegister />} />

                        {/* Wishlist: STRICTLY BUYERS ONLY */}
                        <Route
                          path="/wishlist"
                          element={
                            <ProtectedRoute allowedRoles={['buyer']}>
                              <Wishlist />
                            </ProtectedRoute>
                          }
                        />

                        {/* Cart & Checkout: STRICTLY BUYERS ONLY */}
                        <Route
                          path="/cart"
                          element={
                            <ProtectedRoute allowedRoles={['buyer']}>
                              <Cart />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute allowedRoles={['buyer']}>
                              <Checkout />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute allowedRoles={['buyer']}>
                              <MyOrders />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/buyer/orders"
                          element={
                            <ProtectedRoute allowedRoles={['buyer']}>
                              <MyOrders />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/buyer/my-orders"
                          element={
                            <ProtectedRoute allowedRoles={['buyer']}>
                              <MyOrders />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/buyer/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={['buyer']}>
                              <BuyerDashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* Farmer Experience: STRICTLY FARMERS ONLY */}
                        <Route path="/farmer/register" element={<FarmerRegister />} />
                        <Route
                          path="/farmer/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={['farmer']}>
                              <FarmerDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/farmer/add-product"
                          element={
                            <ProtectedRoute allowedRoles={['farmer']}>
                              <AddProduct />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/farmer/my-products"
                          element={
                            <ProtectedRoute allowedRoles={['farmer']}>
                              <MyProducts />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/farmer/orders"
                          element={
                            <ProtectedRoute allowedRoles={['farmer']}>
                              <FarmerOrders />
                            </ProtectedRoute>
                          }
                        />

                        {/* Delivery Partner Experience: STRICTLY DELIVERY & ADMIN */}
                        <Route path="/delivery/register" element={<DeliveryRegister />} />
                        <Route
                          path="/delivery/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={['delivery', 'admin']}>
                              <DeliveryDashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* Admin Experience: STRICTLY ADMIN ONLY */}
                        <Route
                          path="/admin/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* Catch-all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </div>

                    <Footer />
                  </div>
                  </Router>
                </WishlistProvider>
              </CartProvider>
            </ProductProvider>
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
