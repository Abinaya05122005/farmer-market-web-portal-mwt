import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Filter, CheckSquare, Square, MapPin, Navigation, ArrowUpDown, Compass, Sparkles, SlidersHorizontal, ChevronRight, Clock } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import ProductCard from '../../components/ProductCard';
import SearchBar from '../../components/SearchBar';
import LocationModal from '../../components/LocationModal';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const { currentUser, isAuthenticated } = useAuth();
  const {
    products = [],
    filteredProducts = [],
    recentlyViewed = [],
    fetchRecentlyViewed,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    isOrganicOnly,
    setIsOrganicOnly,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    radiusFilter,
    setRadiusFilter,
    getDistanceForProduct,
    computeProductDistance,
  } = useProducts();

  const { buyerLocation, setIsLocationModalOpen, getProductDistance } = useLocation();
  const { t, language } = useLanguage();

  const calcDistance = getProductDistance || computeProductDistance || getDistanceForProduct || (() => 5);

  // Pagination state (default: 9 produce items per page, perfectly fitting 3-column grid)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const productsGridRef = useRef(null);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, setSelectedCategory]);

  useEffect(() => {
    if (typeof fetchRecentlyViewed === 'function') {
      fetchRecentlyViewed();
    }
  }, [fetchRecentlyViewed]);

  // Compute nearby products (< 25km) safely
  const nearbyProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products
      .map((p) => ({ ...p, distanceKm: typeof calcDistance === 'function' ? calcDistance(p) : 5 }))
      .filter((p) => (p.distanceKm !== null && p.distanceKm !== undefined ? p.distanceKm <= 25 : true))
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
      .slice(0, 4);
  }, [products, calcDistance]);

  // Reset page to 1 when any filter, search, or sorting parameter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedSubCategory,
    isOrganicOnly,
    priceRange,
    sortBy,
    radiusFilter,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Safe page correction if currentPage exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Paginated slice of filtered & sorted products
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (productsGridRef.current) {
      productsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const subCategories = [
    { label: 'All Items', value: 'All' },
    ...(selectedCategory === 'All'
      ? [
          { label: 'Root Vegetables', value: 'Root Vegetables' },
          { label: 'Tropical Fruits', value: 'Tropical' },
          { label: 'Native Millets', value: 'Millets' },
          { label: 'Desi Dals (Lentils)', value: 'Lentils' },
          { label: 'Pure A2 Milk', value: 'Milk' },
          { label: 'Vedic Ghee', value: 'Ghee' },
          { label: 'Whole Spices', value: 'Whole Spices' },
        ]
      : selectedCategory === 'Vegetables'
      ? [
          { label: 'Tomatoes & Solanums', value: 'Tomatoes' },
          { label: 'Root Vegetables', value: 'Root Vegetables' },
          { label: 'Cruciferous', value: 'Cruciferous' },
          { label: 'Pod Vegetables', value: 'Pod Vegetables' },
          { label: 'Peppers', value: 'Peppers' },
        ]
      : selectedCategory === 'Fruits'
      ? [
          { label: 'Tropical Fruits', value: 'Tropical' },
          { label: 'Citrus & Melons', value: 'Citrus' },
          { label: 'Mountain Apples', value: 'Temperate' },
          { label: 'Grapes & Berries', value: 'Berries' },
        ]
      : selectedCategory === 'Grains & Cereals'
      ? [
          { label: 'Aged Rice', value: 'Rice' },
          { label: 'Ancient Millets', value: 'Millets' },
          { label: 'Whole Wheat', value: 'Wheat' },
          { label: 'Oats & Barley', value: 'Oats' },
        ]
      : selectedCategory === 'Pulses & Legumes'
      ? [
          { label: 'Desi Dals (Split)', value: 'Lentils' },
          { label: 'Whole Beans & Grams', value: 'Beans' },
        ]
      : selectedCategory === 'Dairy Products'
      ? [
          { label: 'Fresh Milk', value: 'Milk' },
          { label: 'Curd & Yogurt', value: 'Yogurt' },
          { label: 'Paneer & Cheese', value: 'Cheese' },
          { label: 'Desi Ghee & Butter', value: 'Ghee' },
          { label: 'Lassi & Beverages', value: 'Beverage' },
        ]
      : [
          { label: 'Fresh Cut Herbs', value: 'Fresh Herbs' },
          { label: 'Whole Spices', value: 'Whole Spices' },
          { label: 'Roots (Ginger/Garlic)', value: 'Roots' },
        ]),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      {/* Location Selector Modal */}
      <LocationModal />

      {/* Banner / Headline with Location Switcher */}
      <div className="bg-gradient-to-r from-farm-800 to-farm-900 dark:from-farm-900 dark:to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-lime-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Direct Regional Marketplace
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mt-1">
            {t('market.title')}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
            {language === 'ta'
              ? 'உங்கள் பகுதிக்கு அருகிலுள்ள விவசாயிகளிடம் இருந்து நேரடியாக புத்தம் புதிய விளைபொருட்களை பெறுங்கள்'
              : 'Discover farm-fresh organic harvest sourced directly from nearby local farms'}
          </p>
        </div>

        {/* Location Display & Change Button */}
        <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-xs text-stone-200 shadow-xs">
          <MapPin className="w-4 h-4 text-lime-300 shrink-0" />
          <div className="min-w-0">
            <span className="text-stone-300 text-[11px] block">
              {language === 'ta' ? 'டெலிவரி செய்யும் இடம்:' : 'Delivering to:'}
            </span>
            <strong className="text-white text-xs truncate block">
              {buyerLocation?.city || 'Local Region'}, {buyerLocation?.district || 'Tamil Nadu'}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="ml-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            {language === 'ta' ? 'மாற்று / GPS' : 'Change Location'}
          </button>
        </div>
      </div>

      {/* Main Search Component */}
      <SearchBar />

      {/* "Nearby Products" Highlights Section (Shown if nearby products exist) */}
      {nearbyProducts.length > 0 && (
        <section className="bg-emerald-50/70 dark:bg-stone-900/90 rounded-3xl p-6 border border-emerald-200/70 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'ta' ? 'அருகிலுள்ள பண்ணை அறுவடைகள்' : 'Nearby Products (< 25 km)'}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {nearbyProducts.length} {language === 'ta' ? 'பொருட்கள்' : 'items'}
                  </span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {language === 'ta' 
                    ? `உங்கள் இருப்பிடமான ${buyerLocation?.city || 'உள்ளூர் பகுதி'}-க்கு மிக அருகில் உள்ள விவசாயிகளின் விளைபொருட்கள்` 
                    : `Fresh harvest from farmers nearest to ${buyerLocation?.city || 'your area'}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSortBy('nearest');
                setRadiusFilter(25);
              }}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'ta' ? 'அனைத்தையும் காண்க' : 'View All Nearby'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyProducts.map((p) => (
              <ProductCard key={`nearby-${p.id}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Main Content Layout with Sidebar & Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-display font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-farm-700 dark:text-farm-400" /> {t('market.filters')}
              </h3>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedSubCategory('All');
                  setIsOrganicOnly(false);
                  setPriceRange(1000);
                  setRadiusFilter('all');
                  setSortBy('nearest');
                }}
                className="text-[11px] font-bold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> {t('market.reset')}
              </button>
            </div>

            {/* Nearby Radius Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-farm-600" />
                <span>{language === 'ta' ? 'அருகிலுள்ள விவசாயிகள் (Radius)' : 'Nearby Farmers'}</span>
              </h4>
              <div className="space-y-1">
                {[
                  { label: 'All Locations (முழு தமிழகம்)', value: 'all' },
                  { label: 'Within 5 km (5 கி.மீ வரை)', value: 5 },
                  { label: 'Within 10 km (10 கி.மீ வரை)', value: 10 },
                  { label: 'Within 25 km (25 கி.மீ வரை)', value: 25 },
                  { label: 'Within 50 km (50 கி.மீ வரை)', value: 50 },
                ].map((rad) => (
                  <button
                    key={String(rad.value)}
                    type="button"
                    onClick={() => setRadiusFilter(rad.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      String(radiusFilter) === String(rad.value)
                        ? 'bg-farm-100 dark:bg-farm-900/60 text-farm-800 dark:text-farm-300 font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>{rad.label}</span>
                    {String(radiusFilter) === String(rad.value) && (
                      <span className="w-2 h-2 rounded-full bg-farm-600 dark:bg-farm-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Category Filter */}
            <div className="border-t border-stone-100 dark:border-stone-800 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                {language === 'ta' ? 'விளைபொருள் வகை' : 'Produce Type'}
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {subCategories.map((sub) => (
                  <button
                    key={sub.value}
                    onClick={() => setSelectedSubCategory(sub.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      selectedSubCategory === sub.value
                        ? 'bg-farm-100 dark:bg-farm-900/60 text-farm-800 dark:text-farm-300 font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>{sub.label}</span>
                    {selectedSubCategory === sub.value && (
                      <span className="w-2 h-2 rounded-full bg-farm-600 dark:bg-farm-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Organic Verification Checkbox */}
            <div className="border-t border-stone-100 dark:border-stone-800 pt-4">
              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-3">
                {language === 'ta' ? 'வேளாண் முறை' : 'Farming Practice'}
              </h4>
              <button
                type="button"
                onClick={() => setIsOrganicOnly(!isOrganicOnly)}
                className="w-full flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 font-medium hover:text-stone-900 dark:hover:text-white text-left cursor-pointer"
              >
                {isOrganicOnly ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0" />
                )}
                <span>100% Certified Organic Only</span>
              </button>
            </div>

            {/* Price Filter Slider */}
            <div className="border-t border-stone-100 dark:border-stone-800 pt-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-stone-800 dark:text-stone-200">
                <span>{t('market.maxPrice')}:</span>
                <span className="text-farm-700 dark:text-farm-400">₹{priceRange} / unit</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg accent-farm-700 dark:accent-farm-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>₹10</span>
                <span>₹1000</span>
              </div>
            </div>

            {/* Direct Farm Transparency Note */}
            <div className="bg-lime-50 dark:bg-stone-800/80 rounded-2xl p-4 border border-lime-200/80 dark:border-stone-700 text-[11px] text-lime-950 dark:text-stone-300 space-y-1">
              <div className="font-bold flex items-center gap-1 text-lime-900 dark:text-lime-300">
                🌱 Freshness Guarantee
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-tight">
                All crops display real farm distance in km, harvest date, and farmer profile. Picked within 24 hours of dispatch.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Products Grid */}
        <main className="lg:col-span-9 space-y-5">
          {/* Recently Viewed Produce Shelf */}
          {isAuthenticated && (currentUser?.role === 'buyer' || currentUser?.role === 'admin') && recentlyViewed && recentlyViewed.length > 0 && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-farm-50 dark:bg-stone-800 text-farm-700 dark:text-farm-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white">
                      {language === 'ta' ? 'சமீபத்தில் பார்த்த விளைபொருட்கள்' : 'Recently Viewed Produce'}
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {language === 'ta' ? 'நீங்கள் அண்மையில் பார்வையிட்ட பயிர்கள்' : 'Items you recently inspected in the marketplace'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-farm-700 dark:text-farm-400 bg-farm-50 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
                  {recentlyViewed.length} {language === 'ta' ? 'பொருட்கள்' : 'viewed'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentlyViewed.slice(0, 3).map((item) => (
                  <ProductCard key={`rv-market-${item.id}`} product={item} />
                ))}
              </div>
            </div>
          )}

          {/* Sorting & Result Counts Bar */}
          <div 
            ref={productsGridRef}
            className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 scroll-mt-24"
          >
            <div className="text-xs text-stone-600 dark:text-stone-400 font-medium">
              <span>{language === 'ta' ? 'காட்டப்படும் பயிர்கள்:' : 'Showing'} </span>
              <strong className="text-stone-900 dark:text-white font-bold">
                {filteredProducts.length > 0 ? startIndex + 1 : 0}–{Math.min(endIndex, filteredProducts.length)}
              </strong>
              <span> {language === 'ta' ? 'மொத்தம்' : 'of'} </span>
              <strong className="text-stone-900 dark:text-white font-bold">{filteredProducts.length}</strong>
              <span> {language === 'ta' ? 'விளைபொருட்கள்' : 'produce listings'}</span>
              <span className="text-stone-400 dark:text-stone-500 ml-1">
                ({t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages})
              </span>
              {radiusFilter !== 'all' && (
                <span className="ml-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md font-bold">
                  Within {radiusFilter} km of {buyerLocation?.city || 'Your Location'}
                </span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 shrink-0 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'வரிசைப்படுத்து:' : 'Sort By:'}</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 cursor-pointer"
              >
                <option value="nearest">📍 Nearest First (அருகில் உள்ளவை)</option>
                <option value="farthest">📍 Farthest First (தொலைவில் உள்ளவை)</option>
                <option value="price-low">Price: Low to High (குறைந்த விலை)</option>
                <option value="price-high">Price: High to Low (அதிக விலை)</option>
                <option value="rating">Top Rated (உயர்ந்த மதிப்பீடு)</option>
                <option value="newest">Newest Harvest (புதிய அறுவடை)</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto text-3xl">
                🥬
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white font-display">{t('market.noItems')}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                {language === 'ta'
                  ? 'தேர்ந்தெடுக்கப்பட்ட தொலைவு அல்லது வடிகட்டிகளுக்குள் பொருட்கள் எதுவும் இல்லை. தொலைவை அதிகரித்து முயற்சிக்கவும்.'
                  : 'No items match your selected radius, category, or search criteria. Try expanding your radius or adjusting filters.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedSubCategory('All');
                  setIsOrganicOnly(false);
                  setPriceRange(1000);
                  setRadiusFilter('all');
                  setSortBy('nearest');
                }}
                className="px-5 py-2.5 bg-farm-700 hover:bg-farm-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {t('market.clearFilters')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Bottom Pagination Controls */}
              {filteredProducts.length > 0 && (
                <div className="pt-2">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={(newLimit) => {
                      setItemsPerPage(newLimit);
                      setCurrentPage(1);
                    }}
                    pageSizeOptions={[6, 9, 12, 24]}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
