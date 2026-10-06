import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Heart, Star, MapPin, Sparkles, ShoppingBag, Truck, Eye, X, ShieldCheck, Scale } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { useProducts } from '../context/ProductContext';
import { handleImageError, getCategoryFallbackImage } from '../utils/imageFallback';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isFarmer, isBuyer, isAdmin, isAuthenticated, openLoginModal } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { getProductDeliveryInfo } = useLocation();
  const { recordProductView } = useProducts();
  const { t, language } = useLanguage();
  
  const [added, setAdded] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const isLiked = isInWishlist(product.id);
  const isOrganic = Boolean(product?.is_organic !== undefined ? product.is_organic : product?.isOrganic);
  const deliveryInfo = getProductDeliveryInfo(product);
  const distanceKm = deliveryInfo.distanceKm;

  const handleOpenDetails = (e) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (product?.id && recordProductView) {
      recordProductView(product.id);
    }
    setShowDetailModal(true);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    if (product?.id && recordProductView) {
      recordProductView(product.id);
    }
    if (!isAuthenticated) {
      openLoginModal('buyer');
      return;
    }
    if (isFarmer || isAdmin) {
      return;
    }
    toggleWishlist(product);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (product?.id && recordProductView) {
      recordProductView(product.id);
    }
    
    // If not authenticated, prompt login modal for Buyer
    if (!isAuthenticated) {
      openLoginModal('buyer');
      return;
    }

    // Farmers and Admins cannot add to cart
    if (isFarmer || isAdmin) {
      return;
    }

    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <div 
        onClick={handleOpenDetails}
        className="group bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-xl dark:hover:shadow-stone-950/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer"
      >
        {/* Top Badges & Wishlist */}
        <div className="flex justify-between items-start mb-2 z-10">
          <div className="flex flex-col gap-1">
            {isOrganic ? (
              <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 w-fit shadow-xs">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {t('card.organicSuggested')}
              </span>
            ) : (
              <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit">
                {t('card.nonOrganic')}
              </span>
            )}
            {product.badge && (
              <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit">
                {product.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Quick View Button */}
            <button
              type="button"
              onClick={handleOpenDetails}
              className="p-2 rounded-full bg-white/80 dark:bg-stone-800/80 text-stone-400 hover:text-farm-600 hover:bg-white dark:hover:bg-stone-700 backdrop-blur-md transition cursor-pointer"
              title="Quick View Details"
              aria-label="Quick View Details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Heart Wishlist Button - Only for Buyers / Guests */}
            {!isFarmer && !isAdmin && (
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`p-2 rounded-full backdrop-blur-md transition cursor-pointer active:scale-90 ${
                  isLiked
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500 fill-rose-500 shadow-xs'
                    : 'bg-white/80 dark:bg-stone-800/80 text-stone-400 hover:text-rose-500 hover:bg-white dark:hover:bg-stone-700'
                }`}
                title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
              </button>
            )}
          </div>
        </div>

      {/* Product Image */}
      <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-800 mb-3 group-hover:scale-[1.02] transition duration-300">
        <img
          src={product.image || getCategoryFallbackImage(product.category)}
          alt={product.name}
          onError={(e) => handleImageError(e, product.category)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {t('card.soldOut')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Farmer & Location Info + Real Distance Badge */}
          <div className="flex items-center justify-between text-[11px] text-farm-700 dark:text-farm-400 font-medium mb-1">
            <div className="flex items-center min-w-0">
              <MapPin className="w-3 h-3 mr-1 text-farm-600 dark:text-farm-400 shrink-0" />
              <span className="truncate">{product.farmerName || 'Local Farm'}</span>
              <span className="text-stone-400 dark:text-stone-500 text-[10px] ml-1">
                ({product.farmLocation?.split(',')?.[0] || 'Farm'})
              </span>
            </div>
            {distanceKm !== null && (
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/80 ml-1">
                📍 {distanceKm} km away
              </span>
            )}
          </div>

          <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-base leading-snug group-hover:text-farm-700 dark:group-hover:text-farm-400 transition line-clamp-1">
            {product.name}
          </h3>

          <p className="text-stone-500 dark:text-stone-400 text-xs line-clamp-2 mt-1 mb-2 font-normal leading-relaxed">
            {product.description}
          </p>

          {/* Rating, Harvest Date & Delivery Status */}
          <div className="flex items-center gap-1 mb-1.5 flex-wrap">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{product.rating}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500">({product.reviewsCount || 24})</span>
            <span className="text-stone-300 dark:text-stone-700 mx-1">•</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {t('card.harvest')}: {product.harvestDate || 'Today'}
            </span>
          </div>

          {/* Location Delivery Availability Pill */}
          {distanceKm !== null && (
            <div className="mb-2 text-[10px] font-semibold">
              {deliveryInfo.status === 'local' ? (
                <span className="text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                  <Truck className="w-3 h-3" /> Local Farm Delivery (Available)
                </span>
              ) : deliveryInfo.status === 'extended' ? (
                <span className="text-amber-700 dark:text-amber-300 inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                  <Truck className="w-3 h-3" /> Delivery Available (+₹30)
                </span>
              ) : (
                <span className="text-stone-600 dark:text-stone-400 inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">
                  <Truck className="w-3 h-3" /> Regional Transit ({distanceKm} km)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Action Section */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-extrabold text-stone-900 dark:text-white">
                ₹{product.price}
              </span>
              <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">/{product.unit}</span>
            </div>
            <div className="text-[10px] text-stone-400 dark:text-stone-500">
              {product.stock > 0 ? `${product.stock} ${t('card.inStock')}` : t('card.outOfStock')}
            </div>
          </div>

          {/* Action button: Strictly restricted based on role */}
          {isFarmer ? (
            <span className="text-[11px] font-bold text-farm-700 dark:text-farm-400 bg-farm-50 dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-farm-200/80 dark:border-stone-700 cursor-default">
              Producer View
            </span>
          ) : isAdmin ? (
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-purple-200/80 dark:border-stone-700 cursor-default">
              Admin View
            </span>
          ) : (
            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className={`flex items-center justify-center gap-1 px-4 py-2 rounded-2xl font-bold text-xs transition duration-200 shadow-xs active:scale-95 cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white'
                  : product.stock <= 0
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 dark:bg-amber-500 dark:hover:bg-amber-400 text-stone-900'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{t('card.added')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{t('card.add')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Product Quick View / Detail Modal */}
    {showDetailModal && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs animate-in fade-in"
        onClick={(e) => { e.stopPropagation(); setShowDetailModal(false); }}
      >
        <div 
          className="bg-white dark:bg-stone-900 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button 
            type="button"
            onClick={() => setShowDetailModal(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Image */}
          <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 mb-5">
            <img 
              src={product.image || getCategoryFallbackImage(product.category)}
              alt={product.name}
              onError={(e) => handleImageError(e, product.category)}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {isOrganic ? (
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 🌱 Organic Suggested
                </span>
              ) : (
                <span className="bg-stone-700/90 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  Non-Organic
                </span>
              )}
              {product.badge && (
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-farm-700 dark:text-farm-400 uppercase tracking-wider bg-farm-50 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
                {product.category} {product.subCategory ? `• ${product.subCategory}` : ''}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{product.rating}</span>
                <span className="text-xs text-stone-400">({product.reviewsCount || 24} reviews)</span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
              {product.name}
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {product.description}
            </p>

            {/* Organic Food Suggestion Notice */}
            {isOrganic && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Organic Food Suggestion:</strong> Verified natural produce grown sustainably without chemical pesticides.
                </span>
              </div>
            )}

            {/* Farm & Mandi Specifications */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Farm & Location:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-farm-600" />
                  {product.farmerName || 'Local Farm'} ({product.farmLocation || product.city || 'Tamil Nadu'})
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Cultivation:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 mt-0.5 flex items-center gap-1">
                  {isOrganic ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">🌱 Organic Suggested</span>
                  ) : (
                    <span className="text-stone-500 dark:text-stone-400 font-medium">Non-Organic</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Distance from You:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                  📍 {distanceKm !== null ? `${distanceKm} km away` : 'Within delivery range'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Harvest Date:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 mt-0.5 block">
                  🌱 {product.harvestDate || 'Harvested Today'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Stock Available:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 mt-0.5 block">
                  {product.stock > 0 ? `${product.stock} ${product.unit}` : 'Sold Out'}
                </span>
              </div>
              {product.mandiSource && (
                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700">
                  <span className="text-stone-400 block text-[10px]">Mandi Price Benchmark:</span>
                  <span className="font-medium text-[11px] text-stone-700 dark:text-stone-300">
                    📊 {product.mandiSource} ({product.mandiMarket || 'APMC Mandi'})
                  </span>
                </div>
              )}
            </div>

            {/* Modal Price & Add to Cart */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800">
              <div>
                <div className="text-2xl font-black text-stone-900 dark:text-white">
                  ₹{product.price}
                  <span className="text-xs font-normal text-stone-400">/{product.unit}</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Direct farmer price (Zero middlemen)
                </div>
              </div>

              {!isFarmer && !isAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    handleAdd(e);
                  }}
                  disabled={product.stock <= 0}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition duration-200 shadow-md flex items-center gap-1.5 cursor-pointer ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : product.stock <= 0
                      ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                      : 'bg-amber-400 hover:bg-amber-300 text-stone-900'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Basket</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Basket</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
