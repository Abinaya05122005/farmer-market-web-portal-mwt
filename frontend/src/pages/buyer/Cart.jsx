import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, ShieldCheck, ArrowLeft, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import { handleImageError, getCategoryFallbackImage } from '../../utils/imageFallback';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal, deliveryFee, cartTotal, freeDeliveryThreshold } = useCart();
  const { buyerLocation, getProductDistance } = useLocation();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const deliveryProgress = Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-[#fcfbf7] dark:bg-stone-950 transition-colors">
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 border border-stone-200/80 dark:border-stone-800 shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 bg-farm-50 dark:bg-stone-800 text-farm-700 dark:text-farm-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-display font-bold text-stone-900 dark:text-white">{t('cart.empty')}</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {language === 'ta'
              ? 'உங்கள் பகுதிக்கு அருகிலுள்ள விவசாயிகளிடம் இருந்து காய்கறிகள் மற்றும் பழங்களை கூடையில் சேர்க்கவும்.'
              : 'Support our local farmers by adding some pesticide-free vegetables and seasonal fruits to your basket.'}
          </p>
          <div className="pt-2">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-farm-700 hover:bg-farm-800 text-white text-xs font-bold transition shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> {t('cart.startShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-white">{t('cart.title')}</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {language === 'ta' ? 'உங்கள் கூடை மற்றும் பண்ணை டெலிவரி விவரங்கள்' : 'Review your fresh farm selections & delivery distance'}
          </p>
        </div>
        <Link
          to="/marketplace"
          className="text-xs font-bold text-farm-700 dark:text-farm-400 hover:text-farm-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> {language === 'ta' ? 'தொடர்ந்து வாங்க' : 'Continue Shopping'}
        </Link>
      </div>

      {/* Free Delivery Bar */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-emerald-900 dark:text-emerald-300">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            {amountNeededForFreeDelivery === 0
              ? (language === 'ta' ? 'இலவச டெலிவரி தகுதி பெறப்பட்டது! (Free Delivery Unlocked)' : 'Free Delivery Unlocked (Orders > ₹500)!')
              : (language === 'ta' ? `இலவச டெலிவரிக்கு இன்னும் ₹${amountNeededForFreeDelivery} சேர்க்கவும்` : `Add ₹${amountNeededForFreeDelivery} more for Free Delivery`)}
          </span>
          <span>{Math.round(deliveryProgress)}%</span>
        </div>
        <div className="w-full bg-emerald-200/70 dark:bg-emerald-900/60 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${deliveryProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const dist = getProductDistance(item.product);
            return (
              <div
                key={item.product.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.product.image || getCategoryFallbackImage(item.product.category)}
                    alt={item.product.name}
                    onError={(e) => handleImageError(e, item.product.category)}
                    className="w-20 h-20 rounded-2xl object-cover bg-stone-50 dark:bg-stone-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-farm-700 dark:text-farm-400 tracking-wider">
                        {item.product.farmerName || 'Partner Farm'}
                      </span>
                      {dist !== null && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          📍 {dist} km
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-stone-900 dark:text-white text-sm sm:text-base">
                      {item.product.name}
                    </h3>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      ₹{item.product.price} per {item.product.unit} • {item.product.farmLocation || `${buyerLocation.city}, Tamil Nadu`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 dark:border-stone-800">
                  <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800 p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-stone-800 dark:text-stone-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-stone-900 dark:text-white">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-stone-400 dark:text-stone-500">
                      {item.quantity} {item.product.unit}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                    title="Remove from basket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-6 sticky top-28">
            <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">{t('cart.summary')}</h3>

            <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300 border-b border-stone-100 dark:border-stone-800 pb-4">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-bold text-stone-900 dark:text-white">₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span>{language === 'ta' ? 'டெலிவரி கட்டணம்' : 'Delivery Charges'}</span>
                </span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    {t('cart.free')}
                  </span>
                ) : (
                  <span className="font-bold text-stone-900 dark:text-white">₹{deliveryFee.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-farm-600" />
                  <span>Delivering to:</span>
                </span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{buyerLocation.city}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{t('cart.totalPayable')}</span>
              <span className="text-2xl font-extrabold text-farm-900 dark:text-farm-400 font-display">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-farm-700 hover:bg-farm-800 dark:bg-farm-600 dark:hover:bg-farm-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-farm-800/20 cursor-pointer"
            >
              <span>{t('cart.checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[11px] text-stone-400 dark:text-stone-500 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% Direct Farm Freshness Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
