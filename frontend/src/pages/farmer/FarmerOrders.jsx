import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Truck, 
  Package, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Sprout,
  Navigation
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { handleImageError, getCategoryFallbackImage } from '../../utils/imageFallback';
import { isFarmerOrderLocationMatch } from '../../utils/distance';

export default function FarmerOrders() {
  const { 
    orders, 
    acceptOrderAsFarmer, 
    markOrderReadyForPickup, 
    rejectOrder,
    isLoadingOrders
  } = useCart();
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();

  const [notification, setNotification] = useState('');

  // Orders are authenticated and filtered for this farm / regional location hub
  const farmerOrders = orders.filter((order) => isFarmerOrderLocationMatch(currentUser, order));

  const handleFarmerAction = async (actionFn, orderId, msg) => {
    await actionFn(orderId);
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      {/* Header with Navigation & Farm Identity */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            to="/farmer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-farm-700 dark:text-farm-400 hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Farm Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">
              {t('nav.customerOrders')}
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-farm-100 dark:bg-farm-950 text-farm-800 dark:text-farm-300">
              {farmerOrders.length} Routed Orders
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-farm-600" />
            <span>
              Orders specifically containing harvest from <strong>{currentUser?.farmName || currentUser?.name || 'Your Farm'}</strong> ({currentUser?.farmLocation || currentUser?.city || 'Local Region'})
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span>Local Cold-Chain Logistics Hub</span>
        </div>
      </div>

      {/* Action Notification Alert */}
      {notification && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-300 dark:border-emerald-700 p-4 rounded-2xl flex items-center gap-3 text-sm text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-bold">{notification}</span>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-6">
        {farmerOrders.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-10 sm:p-12 text-center border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
            <div className="w-16 h-16 bg-farm-50 dark:bg-stone-800 text-farm-700 dark:text-farm-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              📦
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                No Customer Orders for {currentUser?.farmName || currentUser?.name} Yet
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                Orders placed by buyers for produce listed by <strong>{currentUser?.farmName || currentUser?.name || 'your farm'}</strong> will appear exclusively here.
              </p>
            </div>
          </div>
        ) : (
          farmerOrders.map((order) => {
            const myItems = order.items?.filter(item => 
              item.farmerId === currentUser?.id || 
              item.farmerId === currentUser?._id ||
              item.farmerName === currentUser?.name ||
              (currentUser?.farmName && item.farmerName === currentUser?.farmName) ||
              !currentUser || currentUser.role === 'admin'
            );
            const displayItems = (myItems && myItems.length > 0) ? myItems : (order.items || []);

            const isPending = order.status === 'Pending' || order.status === 'Placed';
            const isAccepted = order.status === 'Accepted' || order.status === 'Processing';
            const isReadyForPickup = order.status === 'Ready for Pickup';
            const isPickedUp = order.status === 'Picked Up';
            const isOutForDelivery = order.status === 'Out for Delivery';
            const isDelivered = order.status === 'Delivered';
            const isRejected = order.status === 'Rejected';

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-stone-900 dark:text-white font-display">{order.id}</span>
                      <span className="text-xs text-stone-400 dark:text-stone-500">• Placed on {order.date}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        📍 Region: {order.deliveryCity || order.farmLocation}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Fulfillment Window: <strong className="text-farm-800 dark:text-farm-400">{order.estimatedDelivery}</strong>
                    </div>
                  </div>

                  {/* Status Indicator Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 ${
                        isDelivered
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                          : isOutForDelivery
                          ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300'
                          : isPickedUp
                          ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                          : isReadyForPickup
                          ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300'
                          : isAccepted
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-400/40'
                          : isRejected
                          ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 animate-pulse'
                      }`}
                    >
                      <span>●</span>
                      <span>{order.status}</span>
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-farm-100 dark:bg-farm-950 text-farm-700 dark:text-farm-400 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-stone-400 dark:text-stone-500 text-[10px]">Customer Name</div>
                      <div className="font-bold text-stone-800 dark:text-stone-200">{order.buyerName}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-stone-400 dark:text-stone-500 text-[10px]">Customer Contact</div>
                      <a href={`tel:${order.buyerPhone}`} className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                        {order.buyerPhone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-stone-400 dark:text-stone-500 text-[10px]">Destination ({order.deliveryCity || 'Tamil Nadu'})</div>
                      <div className="font-bold text-stone-800 dark:text-stone-200 truncate max-w-[200px]" title={order.deliveryAddress}>
                        {order.deliveryAddress}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Delivery Partner Card (Visible once Farmer Accepts) */}
                {order.assignedDeliveryPartner && !isRejected && (
                  <div className="bg-sky-50/80 dark:bg-sky-950/40 p-4 sm:p-5 rounded-2xl border border-sky-200/80 dark:border-sky-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                        🚚
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200 uppercase tracking-wider">
                            Assigned Regional Delivery Partner
                          </span>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500">
                            Service Hub: {order.assignedDeliveryPartner.serviceArea}
                          </span>
                        </div>
                        <h4 className="font-bold text-stone-900 dark:text-white text-sm mt-0.5">
                          {order.assignedDeliveryPartner.name}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400">
                          Vehicle: <strong>{order.assignedDeliveryPartner.vehicleType}</strong>
                        </p>
                      </div>
                    </div>

                    <a
                      href={`tel:${order.assignedDeliveryPartner.phone}`}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-stone-800 text-sky-700 dark:text-sky-300 font-bold text-xs rounded-xl border border-sky-200 dark:border-sky-700 shadow-2xs hover:bg-sky-50 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Driver ({order.assignedDeliveryPartner.phone})</span>
                    </a>
                  </div>
                )}

                {/* Harvested Items Required to Pack */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                    Your Harvest Items to Pack & Hand Over ({displayItems.length})
                  </h4>
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {displayItems.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || getCategoryFallbackImage(item.category)}
                            alt={item.name}
                            onError={(e) => handleImageError(e, item.category)}
                            className="w-12 h-12 rounded-xl object-cover bg-stone-100 dark:bg-stone-800 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-stone-900 dark:text-white text-sm">{item.name}</div>
                            <div className="text-[11px] text-farm-700 dark:text-farm-400 font-medium">
                              Price: ₹{Number(item.price || 0).toFixed(2)} / {item.unit}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-extrabold text-stone-900 dark:text-white text-sm">
                            Quantity: <span className="text-farm-800 dark:text-farm-400 font-display text-base">{item.quantity} {item.unit}</span>
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400">
                            Total: ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STEP-BY-STEP WORKFLOW ACTIONS FOR FARMER */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    Payment: <strong className="text-stone-800 dark:text-stone-200">{order.paymentMethod}</strong> ({order.paymentStatus})
                  </div>

                  <div className="flex items-center flex-wrap gap-2.5">
                    {/* Stage 1: Pending -> FARMER ACTION: Accept Order */}
                    {isPending && (
                      <>
                        <button
                          onClick={() =>
                            handleFarmerAction(
                              acceptOrderAsFarmer,
                              order.id,
                              `Order ${order.id} Accepted! Local Delivery Partner assigned for ${order.deliveryCity || order.farmLocation}.`
                            )
                          }
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Order (Assign Delivery)</span>
                        </button>
                        <button
                          onClick={() =>
                            handleFarmerAction(
                              rejectOrder,
                              order.id,
                              `Order ${order.id} declined.`
                            )
                          }
                          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-800"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {/* Stage 2: Accepted / Processing -> FARMER ACTION: Hand Over / Ready for Pickup */}
                    {isAccepted && (
                      <button
                        onClick={() =>
                          handleFarmerAction(
                            markOrderReadyForPickup,
                            order.id,
                            `Order ${order.id} marked Ready for Pickup! Delivery Partner notified.`
                          )
                        }
                        className="px-5 py-2.5 bg-farm-700 hover:bg-farm-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer ring-2 ring-lime-400/60"
                      >
                        <Package className="w-4 h-4" />
                        <span>Hand Over to Delivery Partner (Ready for Pickup)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* Stage 3: Ready for Pickup */}
                    {isReadyForPickup && (
                      <div className="px-4 py-2 bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 rounded-xl text-xs font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span>Ready for Pickup • Waiting for Delivery Partner to Collect</span>
                      </div>
                    )}

                    {/* Stage 4: Picked Up */}
                    {isPickedUp && (
                      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span>Picked Up by Delivery Partner ({order.assignedDeliveryPartner?.name})</span>
                      </div>
                    )}

                    {/* Stage 5: Out for Delivery */}
                    {isOutForDelivery && (
                      <div className="px-4 py-2 bg-sky-50 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 rounded-xl text-xs font-bold border border-sky-200 dark:border-sky-800 flex items-center gap-1.5 animate-pulse">
                        <Truck className="w-4 h-4 text-sky-600" />
                        <span>Out for Delivery to Customer</span>
                      </div>
                    )}

                    {/* Stage 6: Delivered ✅ */}
                    {isDelivered && (
                      <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Delivered to Customer Doorstep ✅</span>
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
