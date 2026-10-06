import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  CheckCircle2, 
  ShoppingBag, 
  Truck, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar, 
  Sprout, 
  User,
  ShieldCheck,
  FileText,
  FileDown,
  Loader2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { handleImageError, getCategoryFallbackImage } from '../../utils/imageFallback';

const formatAmount = (val, decimals = 2) => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
};

const getOrderItems = (order) => {
  if (!order || !order.items) return [];
  if (Array.isArray(order.items)) return order.items;
  if (typeof order.items === 'string') {
    try {
      const parsed = JSON.parse(order.items);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

const getOrderTrackingSteps = (order) => {
  if (!order || !order.trackingSteps) return [];
  if (Array.isArray(order.trackingSteps)) return order.trackingSteps;
  if (typeof order.trackingSteps === 'string') {
    try {
      const parsed = JSON.parse(order.trackingSteps);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

const getAssignedPartner = (order) => {
  if (!order || !order.assignedDeliveryPartner) return null;
  if (typeof order.assignedDeliveryPartner === 'object') return order.assignedDeliveryPartner;
  if (typeof order.assignedDeliveryPartner === 'string') {
    try {
      const parsed = JSON.parse(order.assignedDeliveryPartner);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export default function MyOrders() {
  const { orders, isLoadingOrders } = useCart();
  const { currentUser, token: authToken, openLoginModal } = useAuth();
  const { t, language } = useLanguage();
  const [downloadingId, setDownloadingId] = useState(null);

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
      alert(err.message || 'Could not download receipt. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-[#fcfbf7] dark:bg-stone-950 transition-colors">
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 border border-stone-200/80 dark:border-stone-800 shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-farm-50 dark:bg-stone-800 text-farm-700 dark:text-farm-400 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-stone-900 dark:text-white">Sign in to view orders</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Please sign in to your Buyer account to track your orders in real-time.
          </p>
          <button
            onClick={() => openLoginModal('buyer')}
            className="inline-flex items-center justify-center px-6 py-3 bg-farm-700 hover:bg-farm-800 text-white font-bold rounded-2xl text-xs transition cursor-pointer"
          >
            <User className="w-4 h-4 mr-2" />
            <span>Sign In as Buyer</span>
          </button>
        </div>
      </div>
    );
  }

  const myOrders = orders;

  if (myOrders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-[#fcfbf7] dark:bg-stone-950 transition-colors">
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 border border-stone-200/80 dark:border-stone-800 shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-farm-50 dark:bg-stone-800 text-farm-700 dark:text-farm-400 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-stone-900 dark:text-white">No orders placed yet</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Order crisp, freshly harvested fruits and vegetables directly from local farmers today.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center justify-center px-6 py-3 bg-farm-700 hover:bg-farm-800 text-white font-bold rounded-2xl text-xs transition"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            <span>Explore Marketplace</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      <div>
        <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-white">{t('orders.title')}</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Track morning harvests and real-time delivery workflow from farm to your kitchen
        </p>
      </div>

      <div className="space-y-6">
        {myOrders.map((order) => {
          const isDelivered = order.status === 'Delivered';
          const isOutForDelivery = order.status === 'Out for Delivery';
          const isPickedUp = order.status === 'Picked Up';
          const isReadyForPickup = order.status === 'Ready for Pickup';
          const isAccepted = order.status === 'Accepted';
          const isPending = order.status === 'Pending' || order.status === 'Placed';

          const orderItems = getOrderItems(order);
          const trackingSteps = getOrderTrackingSteps(order);
          const assignedPartner = getAssignedPartner(order);

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-6"
            >
              {/* Header info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 font-semibold">{t('orders.ref')}:</span>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-white font-display">{order.id}</h3>
                  </div>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {t('orders.placedOn')}: {order.date}
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(order.id)}
                    disabled={downloadingId === order.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-farm-50 hover:bg-farm-100 dark:bg-stone-800 dark:hover:bg-stone-750 text-farm-700 dark:text-farm-400 hover:text-farm-800 dark:hover:text-farm-300 text-xs font-bold rounded-xl border border-farm-205 dark:border-stone-700 shadow-2xs transition cursor-pointer disabled:opacity-50"
                    title="Download Official PDF Receipt / Invoice"
                  >
                    {downloadingId === order.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download Receipt</span>
                      </>
                    )}
                  </button>

                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                      isDelivered
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : isOutForDelivery
                        ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 animate-pulse'
                        : isPickedUp
                        ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                        : isReadyForPickup
                        ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300'
                        : isAccepted
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    <span>●</span>
                    <span>{order.status}</span>
                  </span>
                  <span className="text-base font-extrabold text-farm-900 dark:text-farm-400">
                    ₹{formatAmount(order.total)}
                  </span>
                </div>
              </div>

              {/* 7-STAGE LIVE ORDER TRACKING TIMELINE */}
              <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-5 sm:p-6 border border-stone-100 dark:border-stone-700 space-y-5">
                <div className="text-xs font-bold text-stone-700 dark:text-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span>
                    {t('orders.estimatedArrival')}:{' '}
                    <strong className="text-farm-800 dark:text-farm-400">{order.estimatedDelivery || 'In Progress'}</strong>
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Drop-off: {order.deliveryAddress ? order.deliveryAddress.split(',')[0] : 'Your Address'}
                  </span>
                </div>

                {/* 7-Stage Visual Timeline Progress Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                  {trackingSteps.map((step, idx) => {
                    const isCurrent = step.current;
                    const isDone = step.done;

                    return (
                      <div
                        key={step.key || idx}
                        className={`flex flex-col items-center text-center p-2.5 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-500 scale-105 shadow-xs'
                            : isDone
                            ? 'bg-white/60 dark:bg-stone-800/40'
                            : 'opacity-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCurrent
                              ? 'bg-sky-600 text-white animate-pulse shadow-md'
                              : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>

                        <div className="text-[11px] font-bold text-stone-800 dark:text-stone-200 mt-2 leading-tight">
                          {step.title}
                        </div>

                        <div className="text-[9px] text-stone-400 dark:text-stone-500 mt-1">
                          {step.time}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Delivery Partner Details (Visible once Farmer Accepts) */}
              {assignedPartner && (
                <div className="bg-sky-50/70 dark:bg-sky-950/40 p-4 sm:p-5 rounded-2xl border border-sky-200/80 dark:border-sky-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                      🚚
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200 uppercase tracking-wider">
                          Assigned Delivery Executive
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">
                          {isDelivered ? 'Delivery Completed' : 'Assigned to your order'}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 dark:text-white text-sm mt-0.5">
                        {assignedPartner.name}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        Vehicle: <strong>{assignedPartner.vehicleType}</strong>
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${assignedPartner.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 text-sky-700 dark:text-sky-300 font-bold text-xs rounded-xl border border-sky-200 dark:border-sky-700 shadow-2xs hover:bg-sky-50 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact Driver ({assignedPartner.phone})</span>
                  </a>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Harvested Items from Farms ({orderItems.length})
                </h4>
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {orderItems.map((item, itemIdx) => (
                    <div key={item.id || itemIdx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || getCategoryFallbackImage(item.category)}
                          alt={item.name}
                          onError={(e) => handleImageError(e, item.category)}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <div className="font-bold text-stone-800 dark:text-stone-200">{item.name}</div>
                          <div className="text-stone-400 dark:text-stone-500 text-[11px]">
                            Farmer: <span className="text-farm-700 dark:text-farm-400 font-semibold">{item.farmerName || 'Local Farm'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-stone-900 dark:text-white">
                          ₹{formatAmount(Number(item.price || 0) * Number(item.quantity || 1))}
                        </div>
                        <div className="text-stone-400 dark:text-stone-500 text-[10px]">
                          {item.quantity} x ₹{formatAmount(item.price)} / {item.unit || 'kg'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
