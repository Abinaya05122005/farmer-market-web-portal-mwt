import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Sparkles, Check, Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AddProduct() {
  const { addProduct } = useProducts();
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    subCategory: 'Tomatoes',
    price: '',
    unit: 'kg',
    stock: '50',
    harvestDate: new Date().toISOString().split('T')[0],
    isOrganic: true,
    is_organic: true,
    description: '',
    image: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Handle local image file upload & convert to base64 Data URL
  const processImageFile = (file) => {
    setImageError('');
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setImageError(language === 'ta' ? 'தயவுசெய்து ஒரு படத்தை (Image file) தேர்ந்தெடுக்கவும்' : 'Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError(language === 'ta' ? 'படத்தின் அளவு 5MB-க்கு குறைவாக இருக்க வேண்டும்' : 'Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setImagePreview(base64Data);
      setImageFileName(file.name);
      setFormData((prev) => ({ ...prev, image: base64Data }));
    };
    reader.onerror = () => {
      setImageError(language === 'ta' ? 'படத்தை ஏற்றுவதில் பிழை ஏற்பட்டது' : 'Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setImageFileName('');
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) return;

    // Fallback default image if none chosen
    const finalImage = formData.image || `/images/products/veg-1.jpg`;

    const farmerCity = currentUser?.city || currentUser?.farmLocation?.split(',')?.[0]?.trim() || 'Coimbatore';
    const farmerLat = currentUser?.latitude || currentUser?.lat || 11.0168;
    const farmerLng = currentUser?.longitude || currentUser?.lng || 76.9558;

    const isOrg = Boolean(formData.is_organic !== undefined ? formData.is_organic : formData.isOrganic);
    addProduct({
      ...formData,
      isOrganic: isOrg,
      is_organic: isOrg,
      image: finalImage,
      price: parseFloat(formData.price),
      farmerId: currentUser?.id || 'farmer-1',
      farmerName: currentUser?.name || currentUser?.farmName || 'Selvam Organic Farms',
      farmLocation: currentUser?.farmLocation || `${farmerCity}, Tamil Nadu`,
      city: farmerCity,
      district: currentUser?.district || farmerCity,
      latitude: farmerLat,
      longitude: farmerLng,
      lat: farmerLat,
      lng: farmerLng,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      navigate('/farmer/my-products');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Link
          to="/farmer/dashboard"
          className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-stone-600 dark:text-stone-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">
            {language === 'ta' ? 'புதிய பயிர் / விளைபொருள் சேர்க்கவும்' : 'List New Produce'}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {language === 'ta' 
              ? 'உங்கள் அறுவடை செய்த புதிய பயிர்களை நேரடியாக சந்தையில் வெளியிடவும்'
              : 'Post your newly harvested produce directly to the consumer marketplace'}
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          {language === 'ta' ? 'பயிர் வெற்றிகரமாக சேர்க்கப்பட்டது! தயாரிப்பு பக்கத்திற்கு செல்கிறது...' : 'Produce successfully listed! Redirecting to inventory...'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              {language === 'ta' ? 'பயிரின் பெயர் (Crop Name)' : 'Produce Title / Crop Name'}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={language === 'ta' ? 'எ.கா. நாட்டு தக்காளி (Country Tomatoes)' : 'e.g. Fresh Country Tomatoes'}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              {language === 'ta' ? 'பிரிவு (Category)' : 'Category'}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
            >
              <option value="Vegetables">{language === 'ta' ? 'காய்கறிகள் (Vegetables)' : 'Vegetables'}</option>
              <option value="Fruits">{language === 'ta' ? 'பழங்கள் (Fruits)' : 'Fruits'}</option>
              <option value="Grains & Cereals">{language === 'ta' ? 'தானியங்கள் (Grains & Cereals)' : 'Grains & Cereals'}</option>
              <option value="Pulses & Legumes">{language === 'ta' ? 'பருப்பு வகைகள் (Pulses & Legumes)' : 'Pulses & Legumes'}</option>
              <option value="Dairy Products">{language === 'ta' ? 'பால் & பண்ணை பொருட்கள் (Dairy Products)' : 'Dairy Products'}</option>
              <option value="Herbs & Spices">{language === 'ta' ? 'மூலிகைகள் & மசாலாக்கள் (Herbs & Spices)' : 'Herbs & Spices'}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {language === 'ta' ? 'விலை (₹ INR)' : 'Price (₹ INR)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500 dark:text-stone-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="40"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {language === 'ta' ? 'அளவு அலகு (Per Unit)' : 'Per Unit'}
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
              >
                <option value="kg">per kg (கிலோ)</option>
                <option value="litre">per litre (லிட்டர்)</option>
                <option value="bunch">per bunch (கட்டு)</option>
                <option value="piece">per piece (எண்ணிக்கை)</option>
                <option value="pack">per pack (பாக்கெட்)</option>
                <option value="bundle">per bundle (மூட்டை)</option>
                <option value="box">per box (பெட்டி)</option>
                <option value="dozen">per dozen (டஜன்)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {language === 'ta' ? 'இருப்பு அளவு (Available Stock)' : 'Available Stock'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {language === 'ta' ? 'அறுவடை தேதி (Harvest Date)' : 'Harvest Date'}
              </label>
              <input
                type="date"
                required
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
              />
            </div>
          </div>
        </div>

        {/* Organic Produce Toggle */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <span>{language === 'ta' ? 'இயற்கை வேளாண்மை சான்றிதழ் (Certified Organic)' : 'Organic Produce Specification'}</span>
                {formData.isOrganic ? (
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">🌱 Organic</span>
                ) : (
                  <span className="text-[10px] bg-stone-500 text-white font-bold px-2 py-0.5 rounded-full">Non-Organic</span>
                )}
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                {formData.isOrganic 
                  ? (language === 'ta' ? 'இயற்கை முறையில் விளைவிக்கப்பட்டது - நுகர்வோருக்கு "🌱 Organic" என காட்டப்படும்' : 'Cultivated organically without synthetic pesticides - Marked as "🌱 Organic" in marketplace')
                  : (language === 'ta' ? 'இயற்கை சாரா முறையில் விளைவிக்கப்பட்டது - நுகர்வோருக்கு "Non-Organic" என காட்டப்படும்' : 'Standard cultivation - Marked as "Non-Organic" in marketplace')
                }
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={formData.isOrganic}
            onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked, is_organic: e.target.checked })}
            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
          />
        </div>

        {/* Product Image File Upload (Direct from Device) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
            {language === 'ta' ? 'பயிரின் புகைப்படத்தை பதிவேற்றவும் (Upload Product Image)' : 'Upload Product Image'}
          </label>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!imagePreview ? (
            /* Upload Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-farm-600 bg-farm-50/60 dark:bg-farm-950/30 scale-[1.01]'
                  : 'border-stone-300 dark:border-stone-700 hover:border-farm-500 bg-stone-50/50 dark:bg-stone-800/50 hover:bg-stone-100/60 dark:hover:bg-stone-800'
              }`}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-farm-100 dark:bg-farm-900/50 text-farm-700 dark:text-farm-300 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {language === 'ta' ? 'புகைப்படத்தை தேர்வு செய்ய கிளிக் செய்யவும்' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                PNG, JPG, JPEG, WEBP (Max 5MB)
              </p>
            </div>
          ) : (
            /* Image Preview Card */
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={imagePreview}
                  alt="Produce Preview"
                  className="w-20 h-20 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    {language === 'ta' ? 'படம் பதிவேற்றப்பட்டது' : 'Image Uploaded'}
                  </div>
                  <p className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate mt-0.5 max-w-[220px] sm:max-w-xs">
                    {imageFileName || 'produce_photo.jpg'}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-farm-600 dark:text-farm-400 hover:underline font-semibold mt-1 inline-block"
                  >
                    {language === 'ta' ? 'படத்தை மாற்றவும் (Change Photo)' : 'Change Photo'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-2 rounded-xl bg-stone-200/80 dark:bg-stone-700 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 text-stone-500 transition cursor-pointer shrink-0"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {imageError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{imageError}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
            {language === 'ta' ? 'விளைபொருள் விவரம் (Harvest Description & Care)' : 'Harvest Description & Care'}
          </label>
          <textarea
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={language === 'ta' ? 'அறுவடை தரம், நன்மைகள் மற்றும் சமையல் குறிப்புகளை விவரிக்கவும்...' : 'Describe tenderness, flavor profile, morning picking time, or recipe ideas...'}
            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-farm-700 hover:bg-farm-800 dark:bg-farm-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'ta' ? 'சந்தையில் வெளியிடவும்' : 'Publish Crop to Marketplace'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
