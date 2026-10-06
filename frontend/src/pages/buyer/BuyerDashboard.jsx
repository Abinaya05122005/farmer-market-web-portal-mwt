import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  Heart, 
  ShoppingCart, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  FileDown, 
  Compass, 
  Tag, 
  ChevronRight, 
  Sprout, 
  MapPin,
  ExternalLink,
  Layers,
  Loader2,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useProducts } from '../../context/ProductContext';
import { useLanguage } from '../../context/LanguageContext';
import { handleImageError, getCategoryFallbackImage } from '../../utils/imageFallback';
import ProductCard from '../../components/ProductCard';

export default function BuyerDashboard() {
  const { currentUser, token: authToken, openLoginModal } = useAuth();
  const { orders, cartCount, addToCart } = useCart();
  const { wishlist, wishlistCount, toggleWishlist, isInWishlist } = useWishlist();
  const { products, recentlyViewed = [], fetchRecentlyViewed } = useProducts();
  const { t, language } = useLanguage();
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (typeof fetchRecentlyViewed === 'function') {
      fetchRecentlyViewed();
    }
  }, [fetchRecentlyViewed]);

  // Filter orders belonging to this buyer
  const myBuyerOrders = orders;

  const totalOrdersCount = myBuyerOrders.length;
  const pendingOrders = myBuyerOrders.filter((o) => 
    o.status === 'Pending' || o.status === 'Placed' || o.status === 'Processing' || o.status === 'Accepted' || o.status === 'Ready for Pickup' || o.status === 'Picked Up' || o.status === 'Out for Delivery'
  );
  const deliveredOrders = myBuyerOrders.filter((o) => o.status === 'Delivered');

  // Most active order in-flight
  const activeOrder = myBuyerOrders.find((o) => 
    o.status !== 'Delivered' && o.status !== 'Rejected' && o.status !== 'Cancelled'
  );

  // Recent Orders (last 4)
  const recentOrders = [...myBuyerOrders]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 4);

  // Recently added or recommended products
  const recommendedProducts = [...products]
    .slice(0, 4);

  // Product categories for quick browsing
  const categories = [
    { name: 'Vegetables', icon: '🥕', count: products.filter(p => p.category === 'Vegetables').length },
    { name: 'Fruits', icon: '🍎', count: products.filter(p => p.category === 'Fruits').length },
    { name: 'Greens', icon: '🌿', count: products.filter(p => p.category === 'Greens' || p.category === 'Herbs').length },
    { name: 'Dairy', icon: '🥛', count: products.filter(p => p.category === 'Dairy').length },
    { name: 'Grains & Pulses', icon: '🌾', count: products.filter(p => p.category === 'Grains' || p.category === 'Pulses').length },
    { name: 'Spices', icon: '🌶️', count: products.filter(p => p.category === 'Spices').length },
  ];

  const handleDownloadReceipt = async (orderId) => {
    try {
      setDownloadingId(orderId);
      const token =
        authToken ||
        currentUser?.token ||
        (typeof localStorage !== 'undefined'
          ? localStorage.getItem('token') || localStorage.getItem('farmstore_token')
          : null);

      if (!token) {
        alert('Please sign in to download your receipt.');
        openLoginModal?.('buyer');
        return;
      }

      const response = await fetch(`/api/orders/${orderId}/receipt`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
          Authorization: `Bearer ${token}`,
          'X-User-Id': currentUser?.id || '',
          'X-User-Email': currentUser?.email || '',
        },
      });

      if (!response.ok) {
        let errorMsg = 'Failed to download receipt';
        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
        } catch (e) {
          errorMsg = `Server error (Status: ${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FarmerMarket_Receipt_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      alert(err.message || 'Could not download receipt.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      
      {/* 1. WELCOME MESSAGE WITH BUYER NAME & QUICK ACTIONS */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-farm-700 dark:text-farm-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-farm-600 animate-pulse" />
            Verified Buyer Account • Farm-to-Table Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">
            Welcome back, {currentUser?.name || 'Shopper'} 👋
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Delivering 100% natural, pesticide-free harvest directly from local Tamil Nadu farms to your doorstep.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Link
            to="/marketplace"
            className="px-4 py-2.5 rounded-2xl bg-farm-700 hover:bg-farm-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>

          <Link
            to="/orders"
            className="px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({totalOrdersCount})</span>
          </Link>

          <Link
            to="/wishlist"
            className="px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-stone-800 hover:bg-rose-100 dark:hover:bg-stone-700 text-rose-700 dark:text-rose-400 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({wishlistCount})</span>
          </Link>

          <Link
            to="/cart"
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart ({cartCount})</span>
          </Link>
        </div>
      </div>

      {/* 2. CURRENT ACTIVE ORDER STATUS (Highlighted if an order is active) */}
      {activeOrder && (
        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-sky-950/40 dark:to-emerald-950/40 rounded-3xl p-6 border border-sky-200/80 dark:border-sky-800/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-sky-100 dark:border-sky-800/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl shadow-xs">
                🚚
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900 px-2 py-0.5 rounded-md">
                  Active In-Flight Order
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-white mt-0.5">
                  Order Ref: #{activeOrder.id}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-600 text-white animate-pulse">
                {activeOrder.status}
              </span>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(activeOrder.id)}
                disabled={downloadingId === activeOrder.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs transition cursor-pointer"
              >
                {downloadingId === activeOrder.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-farm-600" />
                )}
                <span>Receipt</span>
              </button>
              <Link
                to="/orders"
                className="text-xs font-bold text-sky-700 dark:text-sky-300 hover:underline flex items-center gap-1"
              >
                <span>Track Live</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-white/80 dark:bg-stone-900/80 rounded-2xl border border-sky-100 dark:border-stone-800">
              <span className="text-[10px] text-stone-400 font-bold uppercase">Estimated Delivery</span>
              <p className="font-bold text-stone-900 dark:text-white text-sm mt-0.5">
                {activeOrder.estimatedDelivery || 'Today, Express Harvest'}
              </p>
            </div>
            <div className="p-3 bg-white/80 dark:bg-stone-900/80 rounded-2xl border border-sky-100 dark:border-stone-800">
              <span className="text-[10px] text-stone-400 font-bold uppercase">Farm Source</span>
              <p className="font-bold text-stone-900 dark:text-white text-sm mt-0.5">
                {activeOrder.farmerName || 'Verified Regional Farm'}
              </p>
            </div>
            <div className="p-3 bg-white/80 dark:bg-stone-900/80 rounded-2xl border border-sky-100 dark:border-stone-800">
              <span className="text-[10px] text-stone-400 font-bold uppercase">Drop-Off Destination</span>
              <p className="font-bold text-stone-900 dark:text-white text-sm mt-0.5 line-clamp-1">
                {activeOrder.deliveryAddress || activeOrder.deliveryCity || 'Coimbatore'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. BUYER METRICS GRID (Total Orders, Pending Orders, Delivered Orders, Wishlist Count, Cart Count) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-farm-50 dark:bg-stone-800 text-farm-700 dark:text-farm-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {totalOrdersCount}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            Lifetime purchases
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Orders</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-stone-800 text-sky-700 dark:text-sky-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {pendingOrders.length}
          </div>
          <div className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold">
            {pendingOrders.length > 0 ? 'Harvest & transit' : 'No pending orders'}
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {deliveredOrders.length}
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
            Successfully received
          </div>
        </div>

        {/* Wishlist Count */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Wishlist</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-stone-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {wishlistCount}
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
            Saved favorites
          </div>
        </div>

        {/* Cart Count */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cart Items</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-stone-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {cartCount}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
            Ready to checkout
          </div>
        </div>
      </div>

      {/* 4. PRODUCT CATEGORIES FOR QUICK BROWSING */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
          <div>
            <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
              Farm Categories
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Instant harvest filtering from local regional farms
            </p>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-farm-700 dark:text-farm-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
              className="p-4 rounded-2xl bg-stone-50 hover:bg-farm-50 dark:bg-stone-800/70 dark:hover:bg-farm-950/60 border border-stone-150 dark:border-stone-800 hover:border-farm-200 dark:hover:border-farm-800 transition flex flex-col items-center text-center group cursor-pointer"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-farm-800 dark:group-hover:text-farm-300">
                {cat.name}
              </span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                {cat.count} listings
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. RECENT ORDERS WITH STATUS, DETAILS LINK & DOWNLOAD RECEIPT */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5">
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
              Recent Orders
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Review order progress or download official tax receipts
            </p>
          </div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-farm-700 dark:text-farm-400 hover:underline"
          >
            <span>All Orders ({myBuyerOrders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              You haven't placed any orders yet. Discover fresh harvests in the marketplace!
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center px-4 py-2 bg-farm-700 text-white rounded-xl text-xs font-bold hover:bg-farm-800 transition"
            >
              Explore Produce
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((ord) => {
              const isDelivered = ord.status === 'Delivered';
              return (
                <div
                  key={ord.id}
                  className="p-4 sm:p-5 rounded-2xl bg-stone-50/70 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-stone-100/60 dark:hover:bg-stone-800 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 dark:text-white text-sm">
                        #{ord.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDelivered
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                          : 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 animate-pulse'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      Ordered on <strong>{ord.date}</strong> • {ord.items?.length || 1} items from <strong>{ord.farmerName || 'Local Farm'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right mr-2">
                      <span className="text-xs text-stone-400">Total:</span>
                      <div className="text-base font-extrabold text-farm-900 dark:text-farm-400">
                        ₹{Number(ord.total || 0).toFixed(2)}
                      </div>
                    </div>

                    {/* Download Receipt Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadReceipt(ord.id)}
                      disabled={downloadingId === ord.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-900 hover:bg-farm-50 dark:hover:bg-stone-750 text-farm-700 dark:text-farm-400 text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs transition cursor-pointer disabled:opacity-50"
                      title="Download PDF Receipt"
                    >
                      {downloadingId === ord.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </>
                      )}
                    </button>

                    <Link
                      to="/orders"
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-farm-700 hover:bg-farm-800 text-white text-xs font-bold rounded-xl transition"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5B. RECENTLY VIEWED PRODUCTS */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5">
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-farm-600 dark:text-farm-400" />
              <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                {language === 'ta' ? 'சமீபத்தில் பார்த்த விளைபொருட்கள்' : 'Recently Viewed Products'}
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {language === 'ta' 
                ? 'நீங்கள் அண்மையில் பார்வையிட்ட பயிர்கள்' 
                : 'Items you recently inspected in the marketplace'}
            </p>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-farm-700 dark:text-farm-400 hover:underline flex items-center gap-1"
          >
            <span>{language === 'ta' ? 'அனைத்தையும் காண்க' : 'Browse All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentlyViewed && recentlyViewed.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyViewed.slice(0, 8).map((product) => (
              <ProductCard key={`rv-dash-${product.id}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-2 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
              {language === 'ta' ? 'சமீபத்தில் பார்த்த விளைபொருட்கள் எதுவும் இல்லை.' : 'No recently viewed products.'}
            </p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              {language === 'ta'
                ? 'சந்தைப்பகுதியில் விளைபொருட்களைப் பார்வையிடும்போது அவை இங்கே தோன்றும்.'
                : 'When you view products in the marketplace, they will appear here.'}
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1 text-xs font-bold text-farm-700 dark:text-farm-400 hover:underline pt-1"
            >
              <span>{language === 'ta' ? 'சந்தைப்பகுதிக்குச் செல்க' : 'Browse Marketplace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* 6. RECENTLY ADDED / RECOMMENDED PRODUCE */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5">
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                Fresh Farm Recommendations
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Crisp morning harvests direct from organic growers
            </p>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-farm-700 dark:text-farm-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedProducts.map((product) => {
            const isFav = isInWishlist(product.id);
            return (
              <div
                key={product.id}
                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-150 dark:border-stone-800 flex flex-col justify-between group hover:shadow-md transition duration-200"
              >
                <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3 bg-stone-200 dark:bg-stone-700">
                  <img
                    src={product.image || getCategoryFallbackImage(product.category)}
                    alt={product.name}
                    onError={(e) => handleImageError(e, product.category)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-300 hover:text-rose-600 transition shadow-xs cursor-pointer"
                    title="Toggle Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-600 text-rose-600' : ''}`} />
                  </button>
                  {Boolean(product.is_organic !== undefined ? product.is_organic : product.isOrganic) ? (
                    <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                      🌱 Organic
                    </span>
                  ) : (
                    <span className="absolute top-2 left-2 text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-stone-700/80 text-white backdrop-blur-xs">
                      Non-Organic
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-[10px] text-farm-700 dark:text-farm-400 font-semibold uppercase tracking-wider">
                    {product.category}
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-white line-clamp-1 mt-0.5">
                    {product.name}
                  </h4>
                  <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 flex items-center gap-1">
                    <Sprout className="w-3 h-3 text-emerald-600" />
                    <span className="line-clamp-1">{product.farmerName || 'Local Farm'}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-200/60 dark:border-stone-700">
                    <span className="text-sm font-extrabold text-stone-900 dark:text-white">
                      ₹{Number(product.price).toFixed(2)}
                      <span className="text-[10px] font-normal text-stone-400">/{product.unit || 'kg'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => addToCart(product, 1)}
                      className="px-2.5 py-1.5 bg-farm-700 hover:bg-farm-800 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
