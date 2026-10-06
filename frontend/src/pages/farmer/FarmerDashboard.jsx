import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  TrendingUp, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Sparkles,
  Package,
  Clock,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  ArrowRight,
  PlusCircle,
  Calendar,
  IndianRupee,
  BarChart3,
  Boxes
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { handleImageError, getCategoryFallbackImage } from '../../utils/imageFallback';
import { isFarmerOrderLocationMatch } from '../../utils/distance';

export default function FarmerDashboard() {
  const { currentUser } = useAuth();
  const { products } = useProducts();
  const { orders } = useCart();
  const { t, language } = useLanguage();

  // 1. ISOLATE PRODUCTS TO LOGGED-IN FARMER
  const farmerProducts = products.filter(
    (p) => p.farmerId === currentUser?.id || 
           p.farmerName === currentUser?.name || 
           (currentUser?.farmName && p.farmerName === currentUser?.farmName)
  );

  // 2. ISOLATE ORDERS TO LOGGED-IN FARMER (DIRECT ASSIGNMENT OR REGIONAL LOCATION-BASED MATCH)
  const myFarmerOrders = orders.filter((order) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return isFarmerOrderLocationMatch(currentUser, order);
  });

  // Calculate order revenue specifically belonging to this farmer
  const getOrderFarmerRevenue = (order) => {
    if (!order.items || !Array.isArray(order.items)) {
      return Number(order.total) || 0;
    }
    const farmerItems = order.items.filter(
      (it) => it.farmerId === currentUser?.id || 
              it.farmerId === currentUser?._id ||
              it.farmerName === currentUser?.name || 
              (currentUser?.farmName && it.farmerName === currentUser?.farmName)
    );
    if (farmerItems.length > 0) {
      return farmerItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || item.qty || 1)), 0);
    }
    if (isFarmerOrderLocationMatch(currentUser, order)) {
      return Number(order.subtotal || order.total || 0);
    }
    return 0;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // METRICS COMPUTATION (REAL DATA ONLY)
  const totalProductsCount = farmerProducts.length;

  const todayOrders = myFarmerOrders.filter((order) => {
    const orderDate = order.date || order.createdAt?.split('T')[0];
    return orderDate === todayStr;
  });
  const todayOrdersCount = todayOrders.length;
  const todaySales = todayOrders.reduce((sum, order) => sum + getOrderFarmerRevenue(order), 0);

  const totalSales = myFarmerOrders.reduce((sum, order) => sum + getOrderFarmerRevenue(order), 0);

  const pendingOrders = myFarmerOrders.filter((order) => 
    order.status === 'Pending' || order.status === 'Placed' || order.status === 'Processing'
  );
  const pendingOrdersCount = pendingOrders.length;

  const lowStockProducts = farmerProducts.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 20);
  const outOfStockProducts = farmerProducts.filter((p) => Number(p.stock) === 0);

  // RECENT ORDERS (Last 5)
  const recentOrders = [...myFarmerOrders]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 5);

  // TOP SELLING PRODUCTS
  const productSalesMap = {};
  myFarmerOrders.forEach((order) => {
    if (Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const isThisFarmer = item.farmerId === currentUser?.id || 
                             item.farmerId === currentUser?._id ||
                             item.farmerName === currentUser?.name || 
                             (currentUser?.farmName && item.farmerName === currentUser?.farmName) || 
                             order.farmerId === currentUser?.id ||
                             isFarmerOrderLocationMatch(currentUser, order);
        if (isThisFarmer) {
          const key = item.productId || item.id || item.name;
          if (!productSalesMap[key]) {
            productSalesMap[key] = {
              id: item.productId || item.id,
              name: item.name,
              category: item.category || 'Produce',
              image: item.image,
              unit: item.unit || 'kg',
              price: Number(item.price || 0),
              soldCount: 0,
              revenue: 0,
            };
          }
          const qty = Number(item.quantity || item.qty || 1);
          productSalesMap[key].soldCount += qty;
          productSalesMap[key].revenue += qty * Number(item.price || 0);
        }
      });
    }
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 4);

  // 7-DAY DYNAMIC SALES CHART
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isoDate = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric' });
    
    const dayOrders = myFarmerOrders.filter((order) => {
      const orderDate = order.date || order.createdAt?.split('T')[0];
      return orderDate === isoDate;
    });
    const amount = dayOrders.reduce((sum, order) => sum + getOrderFarmerRevenue(order), 0);

    return {
      isoDate,
      dayName,
      formattedDate,
      amount,
      ordersCount: dayOrders.length,
    };
  });

  const maxDayAmount = Math.max(...last7Days.map((d) => d.amount), 500);
  const sevenDayTotal = last7Days.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      
      {/* Top Welcome & Farm Profile Header */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-farm-700 dark:text-farm-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Verified Producer Portal • {currentUser?.farmName || 'Green Valley Organics'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">
            Hey {currentUser?.name?.split(' ')[0] || 'Farmer'} 👋, {t('farmer.welcome')}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Farm Location: <strong className="text-stone-700 dark:text-stone-200">{currentUser?.farmLocation || currentUser?.city || 'Coimbatore, Tamil Nadu'}</strong> • {currentUser?.hectares || 12.5} Acres Cultivated
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Link
            to="/farmer/add-product"
            className="px-4 py-2.5 rounded-2xl bg-farm-700 hover:bg-farm-800 dark:bg-farm-600 dark:hover:bg-farm-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>

          <Link
            to="/farmer/my-products"
            className="px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Boxes className="w-4 h-4" />
            <span>Manage Products</span>
          </Link>

          <Link
            to="/farmer/orders"
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer ring-2 ring-emerald-400/40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>View Orders ({myFarmerOrders.length})</span>
          </Link>

          <Link
            to="/marketplace"
            className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs transition cursor-pointer"
            title="Live Marketplace"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Primary 6 Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Total Products */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Products</span>
            <div className="w-7 h-7 rounded-xl bg-farm-50 dark:bg-stone-800 text-farm-700 dark:text-farm-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {totalProductsCount}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            Active in catalog
          </div>
        </div>

        {/* 2. Today's Orders */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Orders</span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 dark:bg-stone-800 text-sky-700 dark:text-sky-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {todayOrdersCount}
          </div>
          <div className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold">
            {todayOrdersCount > 0 ? 'Fresh orders received' : 'No orders today yet'}
          </div>
        </div>

        {/* 3. Today's Sales */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Sales</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            ₹{todaySales.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
            Today's farm earnings
          </div>
        </div>

        {/* 4. Total Sales */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-stone-800 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            ₹{totalSales.toFixed(2)}
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
            Lifetime farm revenue
          </div>
        </div>

        {/* 5. Pending Orders */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Orders</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-stone-800 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {pendingOrdersCount}
          </div>
          <div className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold">
            {pendingOrdersCount > 0 ? 'Action required' : 'All up to date'}
          </div>
        </div>

        {/* 6. Stock Alerts */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stock Alerts</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-stone-800 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {lowStockProducts.length + outOfStockProducts.length}
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
            {outOfStockProducts.length} out • {lowStockProducts.length} low
          </div>
        </div>
      </div>

      {/* Middle Row: 7-Day Dynamic Sales Chart & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 7-DAY DYNAMIC SALES CHART */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-farm-600 dark:text-farm-400" />
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                  7-Day Sales Performance
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Dynamic daily farm sales from verified buyer orders
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-stone-400 font-medium">7-Day Total:</span>
              <div className="text-lg font-bold text-farm-700 dark:text-farm-400">
                ₹{sevenDayTotal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Responsive Bar Chart Visualization */}
          <div className="space-y-3">
            <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
              {last7Days.map((day) => {
                const heightPercent = maxDayAmount > 0 
                  ? Math.max(Math.round((day.amount / maxDayAmount) * 100), 8) 
                  : 8;
                const isToday = day.isoDate === todayStr;

                return (
                  <div key={day.isoDate} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
                      ₹{day.amount.toFixed(2)} ({day.ordersCount} orders)
                    </div>

                    {/* Bar Container */}
                    <div className="w-full max-w-[48px] bg-stone-100 dark:bg-stone-800/80 rounded-2xl p-1 flex items-end h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-xl transition-all duration-500 flex items-center justify-center ${
                          isToday
                            ? 'bg-gradient-to-t from-farm-700 to-emerald-500 shadow-md ring-2 ring-emerald-400/50'
                            : day.amount > 0
                            ? 'bg-gradient-to-t from-farm-600 to-farm-400 group-hover:from-farm-700 group-hover:to-farm-500'
                            : 'bg-stone-200 dark:bg-stone-700'
                        }`}
                      >
                        {day.amount > 0 && (
                          <span className="text-[9px] font-bold text-white transform -rotate-90 hidden sm:inline">
                            ₹{Math.round(day.amount)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="text-center mt-2">
                      <span className={`text-[11px] font-bold block ${isToday ? 'text-farm-700 dark:text-farm-400' : 'text-stone-600 dark:text-stone-300'}`}>
                        {day.dayName}
                      </span>
                      <span className="text-[9px] text-stone-400 dark:text-stone-500 block">
                        {day.formattedDate.split(' ')[1] || day.formattedDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-stone-400 dark:text-stone-500 text-center pt-2 flex items-center justify-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Today's Harvest Sales
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-farm-600" /> Past Harvest Days
              </span>
            </div>
          </div>
        </div>

        {/* TOP SELLING PRODUCTS */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                Top Selling Produce
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Most ordered items from your farm
              </p>
            </div>
            <Link
              to="/farmer/my-products"
              className="text-xs font-bold text-farm-700 dark:text-farm-400 hover:underline"
            >
              All Items →
            </Link>
          </div>

          {topSellingProducts.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                <Sprout className="w-6 h-6" />
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Produce sales will appear here once buyers place orders.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {topSellingProducts.map((prod, idx) => (
                <div
                  key={prod.id || idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-150 dark:border-stone-800 hover:bg-stone-100/60 dark:hover:bg-stone-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-farm-100 dark:bg-stone-700 text-farm-800 dark:text-farm-300 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <img
                      src={prod.image || getCategoryFallbackImage(prod.category)}
                      alt={prod.name}
                      onError={(e) => handleImageError(e, prod.category)}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1">
                        {prod.name}
                      </h4>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        {prod.soldCount} {prod.unit} delivered
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-farm-700 dark:text-farm-400">
                      ₹{prod.revenue.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-stone-400">Revenue</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Alerts Section (Low Stock & Out of Stock) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Low Stock Alerts (≤ 20 units)
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {lowStockProducts.length} Items
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-xs text-stone-500 dark:text-stone-400 py-4 text-center">
              ✅ All active crops have healthy inventory reserves above 20 units.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-56 overflow-y-auto">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.image || getCategoryFallbackImage(p.category)}
                      alt={p.name}
                      onError={(e) => handleImageError(e, p.category)}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-bold text-stone-800 dark:text-stone-200">{p.name}</div>
                      <span className="text-[10px] text-stone-400">{p.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {p.stock} {p.unit} left
                    </span>
                    <Link
                      to="/farmer/my-products"
                      className="text-[10px] font-bold px-2 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg transition"
                    >
                      Update
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Out of Stock Products */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Out of Stock Products (0 units)
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
              {outOfStockProducts.length} Items
            </span>
          </div>

          {outOfStockProducts.length === 0 ? (
            <div className="text-xs text-stone-500 dark:text-stone-400 py-4 text-center">
              🌱 No out-of-stock items. All listed crops are currently available for order.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-56 overflow-y-auto">
              {outOfStockProducts.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.image || getCategoryFallbackImage(p.category)}
                      alt={p.name}
                      onError={(e) => handleImageError(e, p.category)}
                      className="w-8 h-8 rounded-lg object-cover grayscale"
                    />
                    <div>
                      <div className="font-bold text-stone-800 dark:text-stone-200">{p.name}</div>
                      <span className="text-[10px] text-stone-400">{p.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md text-[10px]">
                      Out of Stock
                    </span>
                    <Link
                      to="/farmer/my-products"
                      className="text-[10px] font-bold px-2 py-1 bg-farm-100 hover:bg-farm-200 dark:bg-stone-800 text-farm-800 dark:text-farm-300 rounded-lg transition"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5">
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
              Recent Customer Orders
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Latest incoming harvest orders requiring packing and dispatch
            </p>
          </div>
          <Link
            to="/farmer/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-farm-700 dark:text-farm-400 hover:underline"
          >
            <span>View All ({myFarmerOrders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              No orders received yet. Produce listings are active on the live marketplace.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800 text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Order Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Harvest Items</th>
                  <th className="py-3 px-4">Farmer Share</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {recentOrders.map((ord) => {
                  const rev = getOrderFarmerRevenue(ord);
                  const isDelivered = ord.status === 'Delivered';
                  const isPending = ord.status === 'Pending' || ord.status === 'Placed';
                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition">
                      <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white font-mono">
                        {ord.id}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                        {ord.date}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-800 dark:text-stone-200">
                        {ord.buyerName || 'Local Buyer'}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                        {ord.items?.length || 1} produce items
                      </td>
                      <td className="py-3.5 px-4 font-bold text-farm-800 dark:text-farm-400">
                        ₹{rev.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          isDelivered
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                            : isPending
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            : 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to="/farmer/orders"
                          className="px-3 py-1 bg-farm-50 hover:bg-farm-100 dark:bg-stone-800 text-farm-700 dark:text-farm-400 rounded-lg font-bold text-[11px] transition"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
