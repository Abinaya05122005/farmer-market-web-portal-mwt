import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sprout, 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  Phone, 
  AlertCircle, 
  ArrowRight, 
  Navigation, 
  Loader2,
  CheckCircle2,
  Sparkles,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TAMIL_NADU_HUBS, calculateDistanceKm, getCoordinatesForCity } from '../../utils/distance';

export default function FarmerRegister() {
  const [formData, setFormData] = useState({
    name: '',
    farmName: '',
    address: '12 Alagesan Road, Saibaba Colony',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641011',
    latitude: 11.0168,
    longitude: 76.9558,
    farmLocation: 'Coimbatore, Tamil Nadu',
    hectares: '10',
    experienceYears: '12',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredInfo, setRegisteredInfo] = useState(null);

  const { register, openLoginModal } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Detect GPS location
  const handleDetectGps = () => {
    setGpsMessage('');
    if (!navigator.geolocation) {
      setError(language === 'ta' ? 'உங்கள் உலாவியில் GPS ஆதரிக்கப்படவில்லை.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));

        let nearest = TAMIL_NADU_HUBS[0];
        let minD = Infinity;
        TAMIL_NADU_HUBS.forEach((hub) => {
          const d = calculateDistanceKm(lat, lng, hub.lat, hub.lng);
          if (d !== null && d < minD) {
            minD = d;
            nearest = hub;
          }
        });

        const detectedCity = minD < 25 ? nearest.city : 'Tamil Nadu';
        const detectedDistrict = nearest.district || 'Coimbatore';
        const locString = `${detectedCity}, ${detectedDistrict}, Tamil Nadu`;

        setFormData((prev) => ({
          ...prev,
          city: detectedCity,
          district: detectedDistrict,
          pincode: nearest.pincode || prev.pincode,
          latitude: lat,
          longitude: lng,
          farmLocation: locString,
        }));

        setIsDetectingGps(false);
        setGpsMessage(language === 'ta' ? `📍 GPS இடம் கண்டறியப்பட்டது: ${detectedCity} (${lat}, ${lng})` : `📍 GPS coordinates detected: ${detectedCity} (${lat}, ${lng})`);
      },
      (err) => {
        setIsDetectingGps(false);
        setError(language === 'ta' ? 'GPS அணுகல் மறுக்கப்பட்டது. நீங்கள் நேரடியாக உள்ளிடலாம்.' : 'GPS access was denied. You can fill location manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // City change helper
  const handleCityChange = (e) => {
    const cityName = e.target.value;
    const hub = getCoordinatesForCity(cityName);
    setFormData((prev) => ({
      ...prev,
      city: cityName,
      district: hub.district,
      pincode: hub.pincode || prev.pincode,
      latitude: hub.lat,
      longitude: hub.lng,
      farmLocation: `${cityName}, ${hub.district}, Tamil Nadu`,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'ta' ? 'கடவுச்சொற்கள் பொருந்தவில்லை.' : 'Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError(language === 'ta' ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்.' : 'Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      name: formData.name,
      farmName: formData.farmName,
      address: formData.address,
      city: formData.city,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode,
      lat: parseFloat(formData.latitude) || 11.0168,
      lng: parseFloat(formData.longitude) || 76.9558,
      latitude: parseFloat(formData.latitude) || 11.0168,
      longitude: parseFloat(formData.longitude) || 76.9558,
      farmLocation: formData.farmLocation || `${formData.city}, Tamil Nadu`,
      hectares: parseFloat(formData.hectares) || 10,
      experienceYears: parseInt(formData.experienceYears, 10) || 5,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      role: 'farmer',
      verified: true,
    }, false); // false = register and then sign in

    setIsLoading(false);

    if (res && res.success) {
      setRegisteredInfo({
        name: formData.name,
        farmName: formData.farmName,
        email: formData.email,
        city: formData.city,
      });
      setIsSuccess(true);
    } else {
      setError(res?.message || 'Registration failed. Please try again.');
    }
  };

  const handleProceedToSignIn = () => {
    if (registeredInfo?.email) {
      openLoginModal('farmer', registeredInfo.email);
    } else {
      openLoginModal('farmer');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#fcfbf7] dark:bg-stone-950 transition-colors duration-200">
      <div className="max-w-2xl w-full bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
        
        {/* ========================================================= */}
        {/* SUCCESS CONFIRMATION STATE                                */}
        {/* ========================================================= */}
        {isSuccess ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'ta' ? 'விவசாயி பதிவு முடிந்தது' : 'Farmer Registered Successfully'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">
                {language === 'ta' ? 'பண்ணைக் கணக்கு செயல்படுத்தப்பட்டது!' : 'Farm Account Activated!'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                {language === 'ta'
                  ? `வணக்கம் ${registeredInfo?.name || ''} (${registeredInfo?.farmName || ''}), உங்கள் கணக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது. இப்போது உள்நுழையலாம்.`
                  : `Welcome ${registeredInfo?.name || ''} (${registeredInfo?.farmName || ''})! Your farm account has been created. Please sign in to manage your crops and harvest.`}
              </p>
            </div>

            {/* Registration Summary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 text-left space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 dark:text-stone-400">{language === 'ta' ? 'பங்கு' : 'Role'}</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Farmer / Producer</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 dark:text-stone-400">{language === 'ta' ? 'பண்ணை' : 'Farm Name'}</span>
                <span className="font-bold text-stone-900 dark:text-white">{registeredInfo?.farmName}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 dark:text-stone-400">{language === 'ta' ? 'மின்னஞ்சல்' : 'Email'}</span>
                <span className="font-bold text-stone-900 dark:text-white">{registeredInfo?.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">{language === 'ta' ? 'நகரம்' : 'Location'}</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{registeredInfo?.city}, Tamil Nadu</span>
              </div>
            </div>

            {/* Direct Sign In CTA Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleProceedToSignIn}
                className="w-full py-4 px-6 rounded-2xl bg-farm-700 hover:bg-farm-800 text-white font-bold text-sm sm:text-base transition duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <LogIn className="w-5 h-5" />
                <span>{language === 'ta' ? 'விவசாயியாக உள்நுழைக (Sign In Now)' : 'Sign In as Farmer'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
              >
                {language === 'ta' ? 'முகப்பு பக்கத்திற்கு செல்ல' : 'Return to Home Page'}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* REGISTRATION FORM STATE                                   */
          /* ========================================================= */
          <>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Sprout className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-display font-bold text-stone-900 dark:text-white">
                {language === 'ta' ? 'விவசாயி பதிவு & பண்ணை போர்டல்' : 'Farmer Registration'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === 'ta'
                  ? 'இடைத்தரகர்கள் இன்றி 85% வருமானத்தை நேரடியாகப் பெறுங்கள்'
                  : 'Join over 450+ regional farmers and sell directly to nearby consumers at fair prices'}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {gpsMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <span>{gpsMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'விவசாயி பெயர்' : 'Farmer Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kumar Selvam"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 focus:bg-white dark:focus:bg-stone-750"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'பண்ணை பெயர்' : 'Farm / Cooperative Name'}
                  </label>
                  <div className="relative">
                    <Sprout className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={formData.farmName}
                      onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                      placeholder="e.g. Kumar Farm Organics"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 focus:bg-white dark:focus:bg-stone-750"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'மின்னஞ்சல்' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="kumar@organicfarm.in"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 focus:bg-white dark:focus:bg-stone-750"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'தொலைபேசி எண்' : 'Contact Phone'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98450 12345"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 focus:bg-white dark:focus:bg-stone-750"
                    />
                  </div>
                </div>
              </div>

              {/* Location Details Box */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-farm-600" />
                    <span>{language === 'ta' ? 'பண்ணை இருப்பிட விவரங்கள்' : 'Farm Geographic Location'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="px-3 py-1.5 rounded-xl bg-farm-100 hover:bg-farm-200 dark:bg-farm-900/60 dark:hover:bg-farm-900 text-farm-800 dark:text-farm-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {isDetectingGps ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                    <span>{language === 'ta' ? 'GPS கண்டறி' : 'Use GPS'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                    {language === 'ta' ? 'பண்ணை முகவரி' : 'Farm Address / Street'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 18 Main Road, Kovilpatti"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                      {language === 'ta' ? 'நகரம்' : 'City / Hub'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleCityChange}
                      placeholder="Coimbatore"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                      {language === 'ta' ? 'மாவட்டம்' : 'District'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Coimbatore"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                      {language === 'ta' ? 'பின்கோடு' : 'Pincode'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="641011"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                      {language === 'ta' ? 'மாநிலம்' : 'State'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Tamil Nadu"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 focus:bg-white dark:focus:bg-stone-750"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'கடவுச்சொல்லை உறுதிசெய்' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 focus:bg-white dark:focus:bg-stone-750"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-farm-700 hover:bg-farm-800 dark:bg-farm-600 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>{language === 'ta' ? 'பதிவு செய்யப்படுகிறது...' : 'Registering Farm...'}</span>
                ) : (
                  <>
                    <Sprout className="w-4 h-4" />
                    <span>{language === 'ta' ? 'விவசாயியாக பதிவு செய்' : 'Register as Farmer'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-stone-100 dark:border-stone-800 pt-4 text-center">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === 'ta' ? 'ஏற்கனவே பதிவு செய்துள்ளீர்களா?' : 'Already registered?'}{' '}
                <button
                  type="button"
                  onClick={() => openLoginModal('farmer')}
                  className="font-bold text-farm-700 dark:text-farm-400 hover:underline cursor-pointer"
                >
                  {language === 'ta' ? 'விவசாயி உள்நுழைவு' : 'Farmer Sign In'}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
