import React, { useState } from 'react';
import { MapPin, Navigation, X, Check, Search, Compass, AlertCircle, Loader2 } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';

export default function LocationModal() {
  const {
    buyerLocation,
    isLocationModalOpen,
    setIsLocationModalOpen,
    requestCurrentLocation,
    setManualLocation,
    isLocating,
    locationError,
    TAMIL_NADU_HUBS,
  } = useLocation();

  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [customCity, setCustomCity] = useState('');

  if (!isLocationModalOpen) return null;

  const filteredHubs = TAMIL_NADU_HUBS.filter(
    (hub) =>
      hub.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hub.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hub.pincode.includes(searchQuery)
  );

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customCity.trim()) return;
    setManualLocation(customCity.trim());
    setCustomCity('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-farm-100 dark:bg-farm-900/60 text-farm-700 dark:text-farm-300 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-stone-900 dark:text-white">
                {language === 'ta' ? 'உங்கள் இடத்தை தேர்வு செய்யவும்' : 'Select Your Delivery Location'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === 'ta'
                  ? 'அருகிலுள்ள விவசாயிகளின் புதிய விளைபொருட்களை கண்டறியவும்'
                  : 'Discover fresh produce from farmers closest to you'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Location Badge */}
        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-farm-600 dark:text-farm-400 shrink-0" />
            <span className="text-stone-500 dark:text-stone-400 shrink-0">Current:</span>
            <strong className="text-stone-800 dark:text-stone-200 truncate">
              {buyerLocation.city}, {buyerLocation.district}
            </strong>
          </div>
          {buyerLocation.isGps && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              GPS Active
            </span>
          )}
        </div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={requestCurrentLocation}
          disabled={isLocating}
          className="w-full py-3 px-4 rounded-2xl bg-farm-700 hover:bg-farm-800 dark:bg-farm-600 dark:hover:bg-farm-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-75"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{language === 'ta' ? 'இடத்தை கண்டறிகிறது...' : 'Detecting GPS Location...'}</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>{language === 'ta' ? '📍 தானியங்கி GPS இருப்பிடத்தைப் பயன்படுத்தவும்' : '📍 Use My Exact GPS Location'}</span>
            </>
          )}
        </button>

        {locationError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Search / Filter Cities */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ta' ? 'நகரம் அல்லது பின்கோடைத் தேடுங்கள்...' : 'Search city, district, or pincode (e.g. Kovilpatti, Coimbatore)...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
          />
        </div>

        {/* Quick Regional City Hubs Grid */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {language === 'ta' ? 'பிரபலமான வேளாண் மையங்கள் (Select City / Hub)' : 'Popular Agricultural Hubs in Tamil Nadu'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredHubs.map((hub) => {
              const isSelected = buyerLocation.city.toLowerCase() === hub.city.toLowerCase();
              return (
                <button
                  key={hub.city}
                  type="button"
                  onClick={() => setManualLocation(hub)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-farm-50 dark:bg-farm-950/60 border-farm-500 text-farm-800 dark:text-farm-200 font-bold shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800/70 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-farm-400 hover:bg-white dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{hub.city}</div>
                    <div className="text-[10px] text-stone-400 truncate">{hub.district}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-farm-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Location input */}
        <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-stone-100 dark:border-stone-800 flex gap-2">
          <input
            type="text"
            value={customCity}
            onChange={(e) => setCustomCity(e.target.value)}
            placeholder={language === 'ta' ? 'பிற ஊர் பெயர் (எ.கா. பொள்ளாச்சி, கோவில்பட்டி)...' : 'Other town/village name (e.g. Kovilpatti)...'}
            className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white text-xs font-bold transition cursor-pointer"
          >
            {language === 'ta' ? 'அமை' : 'Set'}
          </button>
        </form>
      </div>
    </div>
  );
}
