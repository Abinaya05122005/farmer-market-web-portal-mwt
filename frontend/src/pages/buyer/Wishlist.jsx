import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  Check, 
  Star 
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { handleImageError, getCategoryFallbackImage } from '../../utils/imageFallback';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();
  const { addToCart } = useCart();
  const { getProductDeliveryInfo } = useLocation();
  const { t, language } = useLanguage();

  const [movedId, setMovedId] = useState(null);

  const handleMoveToCart = (product) => {
    moveToCart(product);
    setMovedId(product.id);
    setTimeout(() => setMovedId(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200 min-h-[75vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
            <span>{language === 'ta' ? 'வாங்குபவர் சேமித்தவை' : 'Buyer Saved Produce'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-stone-900 dark:text-white">
            {language === 'ta' ? 'என் விருப்பப்பட்டியல்' : 'My Wishlist'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {language === 'ta' 
              ? 'உங்கள் விருப்பமான பண்ணை விளைபொருட்களை ஒரே இடத்தில் நிர்வகியுங்கள்'
              : 'Keep track of your favorite organic harvest and easily transfer items into your fresh cart'}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 px-4 py-2 rounded-2xl shadow-xs text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
          <span>{language === 'ta' ? 'சேமிக்கப்பட்டவை:' : 'Total Saved:'}</span>
          <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-2.5 py-0.5 rounded-full font-extrabold">
            {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
      </div>

      {/* Wishlist Items Grid or Empty State */}
      {wishlist.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 sm:p-16 text-center border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-display font-bold text-stone-900 dark:text-white">
            {language === 'ta' ? 'விருப்பப்பட்டியல் காலியாக உள்ளது' : 'Your Wishlist is Empty'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
            {language === 'ta'
              ? 'சந்தையில் உள்ள விளைபொருட்களின் இதயக் குறியீட்டை (♡) கிளிக் செய்து உங்கள் விருப்பப்பட்டியலில் சேர்த்துக்கொள்ளுங்கள்.'
              : 'Explore the daily marketplace and tap the heart icon (♡) on any organic crops to save them here for later.'}
          </p>
          <div className="pt-2">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-farm-700 hover:bg-farm-800 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <span>{language === 'ta' ? 'சந்தையை உலாவுக' : 'Explore Marketplace'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 mb-4">
                  <img
                    src={product.image || getCategoryFallbackImage(product.category)}
                    alt={product.name}
                    onError={(e) => handleImageError(e, product.category)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {Boolean(product.is_organic !== undefined ? product.is_organic : product.isOrganic) ? (
                      <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        🌱 Organic
                      </span>
                    ) : (
                      <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        Non-Organic
                      </span>
                    )}
                    <span className="bg-stone-900/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md w-fit">
                      {product.category}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-stone-850/90 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-full shadow-md transition cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                {(() => {
                  const deliveryInfo = getProductDeliveryInfo(product);
                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-farm-700 dark:text-farm-400 font-medium">
                        <div className="flex items-center truncate">
                          <MapPin className="w-3 h-3 mr-1 text-farm-600 dark:text-farm-400 shrink-0" />
                          <span className="truncate">{product.farmerName} • {product.farmLocation || 'Local Farm'}</span>
                        </div>
                        {deliveryInfo.distance !== null && (
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 ml-1">
                            📍 {deliveryInfo.distance} km
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-stone-900 dark:text-white text-base leading-snug">
                        {product.name}
                      </h3>

                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-1 pt-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{product.rating}</span>
                        <span className="text-stone-300 dark:text-stone-700 mx-1">•</span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          In Stock: {product.stock} {product.unit}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Price & Transfer Action */}
              <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-stone-400 dark:text-stone-500 font-medium">Direct Farm Price</div>
                  <div className="text-lg font-extrabold text-stone-900 dark:text-white">
                    ₹{Number(product.price || 0).toFixed(2)}{' '}
                    <span className="text-xs font-normal text-stone-500 dark:text-stone-400">/{product.unit}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                      movedId === product.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-400 hover:bg-amber-300 dark:bg-amber-500 dark:hover:bg-amber-400 text-stone-950'
                    }`}
                  >
                    {movedId === product.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Moved!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Move to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
