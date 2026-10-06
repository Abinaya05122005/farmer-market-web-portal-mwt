import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Truck, 
  ShieldCheck, 
  ArrowLeft, 
  Check,
  Sprout,
  Navigation,
  Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { handleImageError, getCategoryFallbackImage } from '../../utils/imageFallback';
import { TAMIL_NADU_HUBS, findNearestFarmer } from '../../utils/distance';

export default function Checkout() {
  const { cart, cartSubtotal, deliveryFee, cartTotal, placeOrder, primaryFarmDistance } = useCart();
  const { currentUser, allUsers } = useAuth();
  const { buyerLocation, setManualLocation, openLocationModal, getProductDeliveryInfo } = useLocation();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState(
    buyerLocation?.city || currentUser?.city || ''
  );
  const [address, setAddress] = useState(
    currentUser?.address || buyerLocation?.address || ''
  );
  const [deliverySlot, setDeliverySlot] = useState('Tomorrow Morning (7:00 AM - 10:00 AM)');
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Payment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Dynamically resolve nearest registered / local farmer for buyer's village/address
  const nearestFarmerMatch = useMemo(() => {
    const locInput = address || selectedCity || buyerLocation?.city || buyerLocation?.address || 'Guruvarpatti';
    return findNearestFarmer(locInput, allUsers, cart.map((i) => i.product));
  }, [address, selectedCity, buyerLocation, allUsers, cart]);

  useEffect(() => {
    if (buyerLocation?.city) {
      setSelectedCity(buyerLocation.city);
    }
    if (buyerLocation?.address && !address) {
      setAddress(buyerLocation.address);
    }
  }, [buyerLocation?.city, buyerLocation?.address]);

  if (cart.length === 0 && !orderSuccess) {
    navigate('/cart');
    return null;
  }

  const primaryItem = cart[0]?.product;
  const primaryDeliveryInfo = primaryItem ? getProductDeliveryInfo(primaryItem) : null;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const order = await placeOrder({
        buyer: currentUser,
        deliveryAddress: address,
        deliveryCity: selectedCity || buyerLocation?.city || 'Local Village/Town',
        paymentMethod: paymentMethod,
      });
      setIsProcessing(false);
      setOrderSuccess(order);
    } catch (err) {
      console.error('Error in handlePlaceOrder:', err);
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center bg-[#fcfbf7] dark:bg-stone-950 transition-colors">
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 sm:p-12 border border-stone-200/80 dark:border-stone-800 shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-farm-700 dark:text-farm-400 bg-farm-50 dark:bg-stone-800 px-3 py-1 rounded-full uppercase tracking-wider">
              Harvest Dispatched to Local Farm
            </span>
            <h2 className="text-3xl font-display font-bold text-stone-900 dark:text-white">
              {t('checkout.orderConfirmed')}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Your order <strong className="text-stone-800 dark:text-stone-200">{orderSuccess.id}</strong> has been transmitted directly to <strong>{orderSuccess.farmerName}</strong> in <strong>{orderSuccess.farmLocation}</strong>.
            </p>
          </div>

          <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-5 border border-stone-200 dark:border-stone-700 text-left text-xs space-y-2 text-stone-800 dark:text-stone-200">
            <div className="flex justify-between">
              <span className="text-stone-500 dark:text-stone-400">Target Region:</span>
              <span className="font-bold text-farm-800 dark:text-farm-400">{orderSuccess.deliveryCity || selectedCity || 'Local Region'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 dark:text-stone-400">Assigned Local Farm:</span>
              <span className="font-semibold">{orderSuccess.farmerName} ({orderSuccess.farmLocation})</span>
            </div>
            {orderSuccess.farmDistanceKm !== undefined && (
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Farm Distance:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">📍 {orderSuccess.farmDistanceKm} km</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500 dark:text-stone-400">Delivery Address:</span>
              <span className="font-semibold text-right max-w-[220px] truncate">{address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 dark:text-stone-400">Payment Option:</span>
              <span className="font-semibold">{paymentMethod}</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 dark:border-stone-700 pt-2">
              <span className="text-stone-500 dark:text-stone-400">Total Paid/Payable:</span>
              <span className="font-bold text-farm-800 dark:text-farm-400 text-sm">₹{orderSuccess.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/orders"
              className="flex-1 py-3.5 bg-farm-700 hover:bg-farm-800 dark:bg-farm-600 text-white text-xs font-bold rounded-xl transition shadow-md"
            >
              Track Order Live
            </Link>
            <Link
              to="/marketplace"
              className="flex-1 py-3.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold rounded-xl transition"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Link to="/cart" className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-stone-600 dark:text-stone-300 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">{t('checkout.title')}</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">Location-based direct harvest routing & delivery</p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Location & Village/City Selection */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-stone-900 dark:text-white font-display font-bold text-base">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-farm-700 dark:text-farm-400" />
                <span>1. Choose Delivery Location (Village / Town / City)</span>
              </div>
              <button
                type="button"
                onClick={openLocationModal}
                className="text-xs text-farm-700 dark:text-farm-400 hover:underline font-bold"
              >
                Change GPS / City 📍
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Village / Town / City Name
                </label>
                <input
                  type="text"
                  required
                  value={selectedCity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCity(val);
                    setManualLocation(val);
                  }}
                  placeholder="e.g. Guruvarpatti, Kovilpatti, Pollachi..."
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-bold text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Select Regional Hub (Optional)
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCity(val);
                    setManualLocation(val);
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-bold text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 cursor-pointer"
                >
                  <option value="">-- Choose or type above --</option>
                  {TAMIL_NADU_HUBS.map((r) => (
                    <option key={r.city} value={r.city}>
                      {r.city} ({r.district})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Drop-off Village / Street Address
              </label>
              <textarea
                rows="3"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Door/House No, Street name, Village / Area, District, Pincode (e.g. 2/264, West Street, Guruvarpatti, Thoothukudi)"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 focus:bg-white dark:focus:bg-stone-750"
              />
            </div>

            {/* Dynamic Smart Local Farm Match Callout */}
            <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Smart Local Farm Match:</span>
                </div>
                {nearestFarmerMatch?.distanceKm !== undefined && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 shadow-2xs">
                    📍 ~{nearestFarmerMatch.distanceKm} km away
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-stone-900 dark:text-white">
                {nearestFarmerMatch?.farmer?.farmName || nearestFarmerMatch?.farmer?.fullName || nearestFarmerMatch?.farmer?.name || 'Local Farm'} ({nearestFarmerMatch?.farmer?.farmLocation || nearestFarmerMatch?.farmer?.city || 'Tamil Nadu'})
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Direct village harvest routing assigned to {nearestFarmerMatch?.farmer?.farmName || 'closest certified organic grower'} for {selectedCity || address || 'your location'}
              </div>
            </div>
          </div>

          {/* 2. Delivery Slot */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-stone-900 dark:text-white font-display font-bold text-base">
              <Truck className="w-5 h-5 text-farm-700 dark:text-farm-400" />
              <span>2. {t('checkout.slot')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { title: 'Tomorrow Morning', time: '7:00 AM - 10:00 AM', badge: 'Fresh Harvest' },
                { title: 'Tomorrow Afternoon', time: '1:00 PM - 4:00 PM', badge: 'Standard' },
                { title: 'Tomorrow Evening', time: '5:00 PM - 8:00 PM', badge: 'Evening Drop' },
              ].map((slot) => {
                const label = `${slot.title} (${slot.time})`;
                const isSelected = deliverySlot === label;
                return (
                  <button
                    key={slot.title}
                    type="button"
                    onClick={() => setDeliverySlot(label)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-farm-600 bg-farm-50/50 dark:bg-farm-950/30 text-farm-900 dark:text-farm-300 ring-2 ring-farm-600/30'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300 hover:border-farm-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs">{slot.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-stone-800 text-farm-700 dark:text-farm-400">
                        {slot.badge}
                      </span>
                    </div>
                    <span className="text-stone-500 dark:text-stone-400 text-[11px] mt-1">{slot.time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-stone-900 dark:text-white font-display font-bold text-base">
              <CreditCard className="w-5 h-5 text-farm-700 dark:text-farm-400" />
              <span>3. {t('checkout.payment')}</span>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'UPI / QR Payment', name: 'Instant UPI / GPay / PhonePe', icon: QrCode, desc: 'Zero gateway charges, direct farm settlement' },
                { id: 'Credit / Debit Card', name: 'Credit or Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                { id: 'Cash on Delivery (COD)', name: 'Pay on Doorstep Delivery', icon: Banknote, desc: 'Pay via cash or UPI to driver on arrival' },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'border-farm-600 bg-farm-50/50 dark:bg-farm-950/30 text-farm-900 dark:text-farm-300 ring-2 ring-farm-600/30'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300 hover:border-farm-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-stone-800 flex items-center justify-center text-farm-700 dark:text-farm-400 shadow-2xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-stone-900 dark:text-white">{method.name}</div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">{method.desc}</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-farm-600 bg-farm-600 text-white' : 'border-stone-300'}`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5">
            <h3 className="font-display font-bold text-base text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-800 pb-3">
              {t('checkout.orderSummary')} ({cart.length} Harvests)
            </h3>

            {/* Sourced Items list */}
            <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.product.image || getCategoryFallbackImage(item.product.category)}
                      alt={item.product.name}
                      onError={(e) => handleImageError(e, item.product.category)}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <div className="font-bold text-stone-800 dark:text-stone-200">{item.product.name}</div>
                      <div className="text-stone-400 dark:text-stone-500 text-[10px]">
                        Qty: {item.quantity} {item.product.unit} • Sourced from {item.product.farmerName}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 dark:text-white">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
              <div className="flex justify-between text-stone-500 dark:text-stone-400">
                <span>{t('cart.subtotal')}:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500 dark:text-stone-400">
                <span>{t('cart.deliveryFee')}:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-900 dark:text-white pt-2 border-t border-stone-100 dark:border-stone-800">
                <span>{t('cart.total')}:</span>
                <span className="text-base text-farm-800 dark:text-farm-400 font-display">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-farm-700 hover:bg-farm-800 dark:bg-farm-600 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-farm-700/20 active:scale-98 cursor-pointer"
            >
              {isProcessing ? (
                <span>Transmitting Order to Local Farm...</span>
              ) : (
                <>
                  <span>Confirm Order & Dispatch (₹{cartTotal.toFixed(2)})</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
