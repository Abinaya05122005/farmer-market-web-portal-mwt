import React from 'react';
import { Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useLanguage } from '../context/LanguageContext';

export default function SearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    isOrganicOnly,
    setIsOrganicOnly,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    filteredProducts
  } = useProducts();

  const { t } = useLanguage();

  const getCategoryLabel = (cat) => {
    if (cat === 'All') return t('cat.all');
    if (cat === 'Vegetables') return t('cat.vegetables');
    if (cat === 'Fruits') return t('cat.fruits');
    if (cat === 'Grains & Cereals') return t('cat.grains') || 'Grains & Cereals';
    if (cat === 'Pulses & Legumes') return t('cat.pulses') || 'Pulses & Legumes';
    if (cat === 'Dairy Products') return t('cat.dairy') || 'Dairy Products';
    if (cat === 'Herbs & Spices') return t('cat.spices') || 'Herbs & Spices';
    return cat;
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm border border-stone-200/80 dark:border-stone-800 mb-8 space-y-4 transition-colors">
      {/* Top row: Search input & sort dropdown */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('market.searchPlaceholder')}
            className="w-full pl-12 pr-10 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-farm-600 focus:bg-white dark:focus:bg-stone-750 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Quick Organic Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Organic Only Toggle */}
          <button
            onClick={() => setIsOrganicOnly(!isOrganicOnly)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition border ${
              isOrganicOnly
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('market.organicOnly')}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-stone-400 dark:text-stone-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-farm-600"
            >
              <option value="featured">{t('market.sortFeatured')}</option>
              <option value="price-low">{t('market.sortPriceLow')}</option>
              <option value="price-high">{t('market.sortPriceHigh')}</option>
              <option value="rating">{t('market.sortRating')}</option>
              <option value="newest">{t('market.sortNewest')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-farm-800 dark:bg-farm-600 text-white shadow-sm scale-105'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Results Counter & Price Filter */}
        <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 font-medium ml-auto">
          <div className="hidden sm:flex items-center gap-2">
            <span>{t('market.maxPrice')}: <strong className="text-stone-900 dark:text-white">₹{priceRange}</strong></span>
            <input
              type="range"
              min="10"
              max="1000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-24 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg accent-farm-700 dark:accent-farm-500 cursor-pointer"
            />
          </div>
          <span className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-full font-bold">
            {filteredProducts.length} {t('market.itemsFound')}
          </span>
        </div>
      </div>
    </div>
  );
}
