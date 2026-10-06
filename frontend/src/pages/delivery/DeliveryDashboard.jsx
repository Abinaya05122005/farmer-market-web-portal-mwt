import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  DollarSign, 
  ShieldCheck, 
  User, 
  Sprout, 
  Navigation,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Layers,
  RefreshCw,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { handleImageError, getCategoryFallbackImage } from '../../utils/imageFallback';
import { isDeliveryPartnerLocationMatch } from '../../utils/distance';

export default function DeliveryDashboard() {
  const { currentUser } = useAuth();
  const { 
    orders, 
    fetchOrders,
    acceptDelivery,
    markOrderPickedUp, 
    markOrderOutForDelivery, 
    markOrderDelivered 
  } = useCart();
  const { t, language } = useLanguage();

  // Tabs: 'assigned' (New & Assigned) | 'active' (Picked Up / Out for Delivery) | 'history' (Delivered) | 'all'
  const [activeTab, setActiveTab] = useState('assigned');
  const [successNotice, setSuccessNotice] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentUserId = String(currentUser?.id || currentUser?._id || 'delivery-1');

  // Trigger live backend fetch on mount and on user switch
  useEffect(() => {
    fetchOrders();
  }, [currentUserId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Orders strictly isolated by Farmer Handover & Location Matching (Buyer ↔ Farmer ↔ Delivery Partner)
  const myAssignedOrders = orders.filter((order) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const assignedId = String(order.assignedDeliveryPartner?.id || order.assignedDeliveryPartner?._id || '');
    const assignedEmail = String(order.assignedDeliveryPartner?.email || '').toLowerCase().trim();
    if (assignedId === currentUserId || (currentUser.email && assignedEmail === currentUser.email.toLowerCase().trim())) {
      return true;
    }
    return isDeliveryPartnerLocationMatch(currentUser, order);
  });

  // Today's date string
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. New Assigned Orders (Handed over by Farmer: Ready for Pickup / Accepted)
  const newAssignedOrders = myAssignedOrders.filter((ord) => 
    ['Ready for Pickup', 'Accepted', 'Processing'].includes(ord.status)
  );

  // 2. Active Deliveries (Picked Up / Out for Delivery)
  const activeDeliveries = myAssignedOrders.filter((ord) => 
    ['Picked Up', 'Out for Delivery'].includes(ord.status)
  );

  // 3. Out for Delivery
  const outForDeliveryOrders = myAssignedOrders.filter((ord) => 
    ord.status === 'Out for Delivery'
  );

  // Robust Helpers for nested / JSON string fields from MySQL
  const getOrderItems = (order) => {
    if (!order) return [];
    if (Array.isArray(order.items)) return order.items;
    if (typeof order.items === 'string') {
      try {
        const parsed = JSON.parse(order.items);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  };

  const getOrderTimestamps = (order) => {
    if (!order || !order.timestamps) return {};
    if (typeof order.timestamps === 'object') return order.timestamps;
    if (typeof order.timestamps === 'string') {
      try {
        const parsed = JSON.parse(order.timestamps);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {}
    }
    return {};
  };

  const formatAmount = (val, decimals = 2) => {
    const num = Number(val);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  // 4. Delivered (Total Completed)
  const completedDeliveries = myAssignedOrders.filter((ord) => 
    ord.status === 'Delivered'
  );

  // 5. Today's Deliveries
  const todayDeliveries = completedDeliveries.filter((ord) => {
    const ts = getOrderTimestamps(ord);
    return ord.date === todayStr || (ts?.delivered && String(ts.delivered).includes(todayStr));
  });

  // 6. Total Earnings Calculation (₹50 Base + ₹2/km)
  const calculateOrderEarning = (order) => {
    if (order.deliveryEarnings) return Number(order.deliveryEarnings) || 0;
    const dist = Number(order.farmDistanceKm) || 5;
    return 50.0 + Math.round(dist * 2.0);
  };

  const totalEarnings = completedDeliveries.reduce((sum, ord) => sum + calculateOrderEarning(ord), 0);
  const todayEarnings = todayDeliveries.reduce((sum, ord) => sum + calculateOrderEarning(ord), 0);

  // Tab Filtering
  const displayedOrders = 
    activeTab === 'assigned'
      ? newAssignedOrders
      : activeTab === 'active'
      ? activeDeliveries
      : activeTab === 'history'
      ? completedDeliveries
      : myAssignedOrders;

  // Action Handler
  const handleAction = async (actionFn, orderId, msg) => {
    await actionFn(orderId);
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(''), 5000);
    fetchOrders();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-300 uppercase tracking-wider">
            <Truck className="w-4 h-4 text-sky-400" />
            <span>FarmStore Hyperlocal Cold-Chain Logistics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">
            {currentUser?.name || 'Ramesh Kumar (SpeedyFarm Express)'}
          </h1>
          <p className="text-xs text-sky-200 max-w-xl">
            Vehicle: <strong>{currentUser?.vehicleType || 'Electric Cargo Van (TN-38-AF-2024)'}</strong> • Hub: <strong>{currentUser?.serviceArea || 'Coimbatore & Regional Farms'}</strong> • Partner ID: <code className="bg-sky-950/60 px-2 py-0.5 rounded text-lime-300">{currentUserId}</code>
          </p>
        </div>

        {/* Live Partner Quick Stats */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20">
          <div className="w-10 h-10 rounded-xl bg-lime-400 text-stone-900 flex items-center justify-center font-extrabold text-lg shrink-0">
            🚚
          </div>
          <div>
            <div className="text-[11px] text-sky-200 uppercase font-semibold">Today's Earnings</div>
            <div className="text-xl font-bold font-display text-lime-300">
              ₹{formatAmount(todayEarnings, 2)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Success Notification Alert */}
      {successNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-300 dark:border-emerald-700 p-4 rounded-2xl flex items-center gap-3 text-sm text-emerald-900 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-bold">{successNotice}</span>
        </div>
      )}

      {/* 3. 6 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: New Assigned Orders */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">New Assigned</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {newAssignedOrders.length}
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
            Ready for Accept
          </div>
        </div>

        {/* Card 2: Active Deliveries */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Tasks</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {activeDeliveries.length}
          </div>
          <div className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">
            In Progress
          </div>
        </div>

        {/* Card 3: Out for Delivery */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">On Route</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {outForDeliveryOrders.length}
          </div>
          <div className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold">
            Out for Delivery
          </div>
        </div>

        {/* Card 4: Total Delivered */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {completedDeliveries.length}
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
            Total Completed
          </div>
        </div>

        {/* Card 5: Today's Deliveries */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today Done</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {todayDeliveries.length}
          </div>
          <div className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold">
            Delivered Today
          </div>
        </div>

        {/* Card 6: Total Earnings */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-stone-400 dark:text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Earned</span>
            <div className="w-7 h-7 rounded-lg bg-lime-50 dark:bg-lime-950 text-lime-700 dark:text-lime-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            ₹{formatAmount(totalEarnings, 0)}
          </div>
          <div className="text-[10px] text-lime-700 dark:text-lime-400 font-semibold">
            Base + Dist. Fees
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation and Manual Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab 1: New Assigned Orders */}
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'assigned'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Assigned Orders ({newAssignedOrders.length})</span>
          </button>

          {/* Tab 2: Active Deliveries */}
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>On Delivery ({activeDeliveries.length})</span>
          </button>

          {/* Tab 3: Delivery History */}
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivery History ({completedDeliveries.length})</span>
          </button>

          {/* Tab 4: All */}
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All ({myAssignedOrders.length})</span>
          </button>
        </div>

        {/* Live Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-2 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer active:scale-95"
          title="Refresh Live Deliveries from MongoDB Atlas"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Refresh Deliveries'}</span>
        </button>
      </div>

      {/* 5. Orders Manifest & Action Flow */}
      <div className="space-y-6">
        {displayedOrders.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
            <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              🚚
            </div>
            <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
              {activeTab === 'history' 
                ? 'No Completed Deliveries Yet' 
                : activeTab === 'active' 
                ? 'No Active Deliveries in Transit' 
                : 'No New Assigned Pickups Right Now'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              {activeTab === 'history'
                ? 'Completed doorstep deliveries and their earnings will appear here after fulfillment.'
                : activeTab === 'assigned' && completedDeliveries.length > 0
                ? `You have ${completedDeliveries.length} completed delivery in your records, but no active pickups waiting at the moment.`
                : 'When buyers place orders in your service hub and local farmers accept them, they will appear here ready for pickup.'}
            </p>

            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              {completedDeliveries.length > 0 && activeTab !== 'history' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-200 transition cursor-pointer"
                >
                  View Delivery History ({completedDeliveries.length})
                </button>
              )}
              {myAssignedOrders.length > 0 && activeTab !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold hover:bg-stone-200 transition cursor-pointer"
                >
                  View All Orders ({myAssignedOrders.length})
                </button>
              )}
              <button
                type="button"
                onClick={handleRefresh}
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Live Orders</span>
              </button>
            </div>
          </div>
        ) : (
          displayedOrders.map((order) => {
            const isPending = order.status === 'Pending' || order.status === 'Placed';
            const isFarmerAccepted = order.status === 'Accepted' || order.status === 'Processing';
            const isReadyForPickup = order.status === 'Ready for Pickup';
            const isPickedUp = order.status === 'Picked Up';
            const isOutForDelivery = order.status === 'Out for Delivery';
            const isDelivered = order.status === 'Delivered';

            const earningAmount = calculateOrderEarning(order);
            const distanceKm = Number(order.farmDistanceKm) || 5.0;
            const orderItems = getOrderItems(order);
            const orderTimestamps = getOrderTimestamps(order);

            return (
              <div
                key={order.id || order._id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-6 transition hover:border-sky-300 dark:hover:border-sky-800"
              >
                {/* 5.1 Order Header & Badges */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-extrabold text-stone-900 dark:text-white font-display">
                        {order.id}
                      </span>
                      <span className="text-xs text-stone-400 dark:text-stone-500">• {order.date}</span>
                      <span className="text-xs font-bold text-farm-700 dark:text-farm-400 bg-farm-50 dark:bg-farm-950/80 px-2.5 py-0.5 rounded-md">
                        {orderItems.length || 1} Product(s)
                      </span>
                      <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/80 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        <span>{distanceKm} km transit</span>
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Fulfillment Target: <strong className="text-sky-800 dark:text-sky-400">{order.estimatedDelivery || 'Direct Farm-to-Doorstep'}</strong>
                    </div>
                  </div>

                  {/* Status and Earnings Badge */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 ${
                        isDelivered
                          ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300'
                          : isOutForDelivery
                          ? 'bg-sky-100 dark:bg-sky-950/90 text-sky-800 dark:text-sky-300 animate-pulse'
                          : isPickedUp
                          ? 'bg-blue-100 dark:bg-blue-950/90 text-blue-800 dark:text-blue-300'
                          : isReadyForPickup
                          ? 'bg-amber-100 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 ring-2 ring-amber-400/50'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span>●</span>
                      <span>{order.status}</span>
                    </span>

                    <div className="text-right">
                      <span className="text-xs text-stone-400 block">Delivery Earning</span>
                      <span className="text-base font-extrabold text-lime-700 dark:text-lime-400 font-display">
                        ₹{formatAmount(earningAmount, 2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5.2 Visual Route & Location Map Visualizer */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* Point 1: Farmer Pickup Location */}
                  <div className="md:col-span-5 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>1. Farm Pickup Point</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/70 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
                        {isPickedUp || isOutForDelivery || isDelivered ? 'Collected ✓' : 'Pickup Pending'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-stone-900 dark:text-white text-sm">
                        {order.farmerName || orderItems[0]?.farmerName || 'Selvam Organic Farms'}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <span>{order.farmLocation || orderItems[0]?.farmLocation || 'Coimbatore, Tamil Nadu'}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <a
                        href={`tel:${orderItems[0]?.farmerPhone || '+919845012345'}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline bg-white dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-2xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Farmer</span>
                      </a>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500">
                        Farmer Contact
                      </span>
                    </div>
                  </div>

                  {/* Route & Distance Indicator Badge */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-2">
                    <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs shadow-inner">
                      ➔
                    </div>
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 mt-1">
                      {distanceKm} km
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Est. ~{Math.round(distanceKm * 2.5 + 5)} mins
                    </span>
                  </div>

                  {/* Point 2: Buyer Delivery Location */}
                  <div className="md:col-span-5 bg-sky-50/70 dark:bg-sky-950/40 p-4 sm:p-5 rounded-2xl border border-sky-200/80 dark:border-sky-800/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <span>2. Customer Destination</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-200/70 dark:bg-sky-900/80 text-sky-900 dark:text-sky-200">
                        {isDelivered ? 'Delivered ✓' : 'Doorstep Drop-off'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-stone-900 dark:text-white text-sm">
                        {order.buyerName || 'Valued Customer'}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5">
                        <Navigation className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
                        <span>{order.deliveryAddress || `${order.deliveryCity || 'Tamil Nadu'}`}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <a
                        href={`tel:${order.buyerPhone || '+919710067890'}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline bg-white dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-700 shadow-2xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Customer</span>
                      </a>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500">
                        Phone: {order.buyerPhone || '+91 97100 67890'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5.3 Products Manifest */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider flex justify-between">
                    <span>Package Contents ({orderItems.length} Items)</span>
                    <span>Order Value: <strong>₹{formatAmount(order.total, 2)}</strong> ({order.paymentStatus || 'Paid'})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {orderItems.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800"
                      >
                        <img
                          src={item.image || getCategoryFallbackImage(item.category)}
                          alt={item.name || 'Produce'}
                          onError={(e) => handleImageError(e, item.category)}
                          className="w-12 h-12 rounded-xl object-cover bg-stone-200 dark:bg-stone-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-stone-900 dark:text-white text-xs truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-farm-700 dark:text-farm-400 font-semibold">
                            Qty: {item.quantity || 1} {item.unit || 'item'} (₹{formatAmount(item.price, 2)} / {item.unit || 'item'})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5.4 5-STAGE PROGRESSIVE WORKFLOW ACTION BUTTONS */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    Payment Method: <strong className="text-stone-800 dark:text-stone-200">{order.paymentMethod || 'Online / UPI'}</strong>
                  </div>

                  <div className="flex items-center flex-wrap gap-2.5">
                    
                    {/* BUTTON 1: Accept Delivery (When Placed / Pending / Ready for Pickup) */}
                    {(isPending || order.status === 'Placed') && (
                      <button
                        onClick={() =>
                          handleAction(
                            acceptDelivery,
                            order.id || order._id,
                            `Delivery Task for Order ${order.id} Accepted!`
                          )
                        }
                        className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Accept Delivery Task</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* Stage A: Farmer Still Preparing */}
                    {isFarmerAccepted && (
                      <button
                        onClick={() =>
                          handleAction(
                            markOrderPickedUp,
                            order.id || order._id,
                            `Order ${order.id} marked as Picked Up from Farm!`
                          )
                        }
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <Package className="w-4 h-4" />
                        <span>Mark as Picked Up from Farm</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* BUTTON 2: Mark as Picked Up */}
                    {isReadyForPickup && (
                      <button
                        onClick={() =>
                          handleAction(
                            markOrderPickedUp,
                            order.id || order._id,
                            `Order ${order.id} marked as Picked Up from Farm!`
                          )
                        }
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <Package className="w-4 h-4" />
                        <span>Mark as Picked Up from Farm</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* BUTTON 3: Start Delivery (Out for Delivery) */}
                    {isPickedUp && (
                      <button
                        onClick={() =>
                          handleAction(
                            markOrderOutForDelivery,
                            order.id || order._id,
                            `Order ${order.id} is now Out for Delivery to ${order.buyerName}!`
                          )
                        }
                        className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Start Delivery (Out for Delivery)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* BUTTON 4: Mark as Delivered */}
                    {isOutForDelivery && (
                      <button
                        onClick={() =>
                          handleAction(
                            markOrderDelivered,
                            order.id || order._id,
                            `Order ${order.id} marked as Delivered! ₹${formatAmount(earningAmount, 2)} added to your earnings.`
                          )
                        }
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer ring-2 ring-emerald-400/50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Delivered ✅</span>
                      </button>
                    )}

                    {/* Stage 5: Completed Delivery Status Pill */}
                    {isDelivered && (
                      <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Delivered to Customer Doorstep ({orderTimestamps?.delivered || 'Completed'})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
