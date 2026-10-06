import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Truck, 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  Phone, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Sparkles,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function DeliveryRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Coimbatore',
    vehicleType: 'Electric Cargo Van',
    vehicleNumber: 'TN-38-AF-2024',
    serviceArea: 'Coimbatore & Regional Farms',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredInfo, setRegisteredInfo] = useState(null);

  const { register, openLoginModal } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

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
    const vehicleFull = `${formData.vehicleType} (${formData.vehicleNumber || 'Standard'})`;

    const res = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      vehicleType: vehicleFull,
      serviceArea: formData.serviceArea || `${formData.city} Hub`,
      region: formData.city,
      password: formData.password,
      role: 'delivery',
    }, false); // false = do not auto-login, allow user to sign in explicitly

    setIsLoading(false);

    if (res && res.success) {
      setRegisteredInfo({
        name: formData.name,
        email: formData.email,
        city: formData.city,
        vehicleType: vehicleFull,
      });
      setIsSuccess(true);
    } else {
      setError(res?.message || 'Registration failed. Please try again.');
    }
  };

  const handleProceedToSignIn = () => {
    if (registeredInfo?.email) {
      openLoginModal('delivery', registeredInfo.email);
    } else {
      openLoginModal('delivery');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#fcfbf7] dark:bg-stone-950 transition-colors duration-200">
      <div className="max-w-xl w-full bg-white dark:bg-stone-900 rounded-3xl p-8 sm:p-10 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
        
        {/* ========================================================= */}
        {/* SUCCESS CONFIRMATION STATE (Sign In after registration)   */}
        {/* ========================================================= */}
        {isSuccess ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'ta' ? 'பதிவு வெற்றிகரமாக முடிந்தது' : 'Registration Successful'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">
                {language === 'ta' ? 'விநியோகக் கணக்கு உருவாக்கப்பட்டது!' : 'Delivery Account Activated!'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                {language === 'ta'
                  ? `வணக்கம் ${registeredInfo?.name || ''}, உங்கள் விநியோக பங்குதாரர் கணக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டுவிட்டது. இப்போது உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல் மூலம் உள்நுழையலாம்.`
                  : `Welcome ${registeredInfo?.name || ''}! Your delivery partner account is successfully registered. You can now sign in using your credentials.`}
              </p>
            </div>

            {/* Registration Summary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 text-left space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 dark:text-stone-400">{language === 'ta' ? 'பங்கு' : 'Role'}</span>
                <span className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Delivery Partner (Logistics)</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 dark:text-stone-400">{language === 'ta' ? 'மின்னஞ்சல்' : 'Email'}</span>
                <span className="font-bold text-stone-900 dark:text-white">{registeredInfo?.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 dark:text-stone-400">{language === 'ta' ? 'வாகனம்' : 'Vehicle'}</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{registeredInfo?.vehicleType}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">{language === 'ta' ? 'மையம்' : 'Operating Hub'}</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{registeredInfo?.city} Hub</span>
              </div>
            </div>

            {/* Direct Sign In CTA Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleProceedToSignIn}
                className="w-full py-4 px-6 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm sm:text-base transition duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <LogIn className="w-5 h-5" />
                <span>{language === 'ta' ? 'இப்போதே உள்நுழைக (Sign In Now)' : 'Sign In as Delivery Partner'}</span>
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
            {/* Top Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Truck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">
                {language === 'ta' ? 'விநியோக பங்குதாரர் பதிவு' : 'Join as Delivery Partner'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                {language === 'ta'
                  ? 'பண்ணைகளிலிருந்து புத்தம் புதிய இயற்கை விளைபொருட்களை பிக்கப் செய்து வாடிக்கையாளர்களுக்கு விநியோகிக்கவும்'
                  : 'Pick up organic farm harvests and complete cold-chain doorstep fulfillment'}
              </p>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {language === 'ta' ? 'முழுப் பெயர்' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Karthik Raja (EcoRider Logistics)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white dark:focus:bg-stone-750"
                  />
                </div>
              </div>

              {/* Email & Phone */}
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
                      placeholder="karthik.delivery@gmail.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white dark:focus:bg-stone-750"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'தொலைபேசி எண்' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98412 34567"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white dark:focus:bg-stone-750"
                    />
                  </div>
                </div>
              </div>

              {/* City / Operating Hub & Vehicle Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'செயல்படும் நகரம் / மையம்' : 'Operating Hub / City'}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value, serviceArea: `${e.target.value} & Regional Hub` })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white dark:focus:bg-stone-750"
                    >
                      <option value="Coimbatore">Coimbatore (கோவை)</option>
                      <option value="Pollachi">Pollachi (பொள்ளாச்சி)</option>
                      <option value="Kovilpatti">Kovilpatti (கோவில்பட்டி)</option>
                      <option value="Salem">Salem (சேலம்)</option>
                      <option value="Erode">Erode (ஈரோடு)</option>
                      <option value="Ooty">Ooty / Nilgiris (நீலகிரி)</option>
                      <option value="Madurai">Madurai (மதுரை)</option>
                      <option value="Tiruppur">Tiruppur (திருப்பூர்)</option>
                      <option value="Tirunelveli">Tirunelveli (திருநெல்வேலி)</option>
                      <option value="Chennai">Chennai (சென்னை)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'வாகன வகை' : 'Vehicle Type'}
                  </label>
                  <div className="relative">
                    <Truck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white dark:focus:bg-stone-750"
                    >
                      <option value="Electric Cargo Van">Electric Cargo Van (மின்னணு வேன்)</option>
                      <option value="Refrigerated Two-Wheeler">Refrigerated Two-Wheeler (குளிரூட்டப்பட்ட பைக்)</option>
                      <option value="Cold Cargo Van">Cold Cargo Van (குளிரூட்டப்பட்ட வேன்)</option>
                      <option value="Three-Wheeler Cargo Auto">Three-Wheeler Cargo Auto (ஆட்டோ)</option>
                      <option value="Standard Motorbike">Standard Motorbike (இருசக்கர வாகனம்)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vehicle Number & Service Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'வாகன பதிவு எண்' : 'Vehicle Registration No.'}
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    placeholder="e.g. TN-38-AF-2024"
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white dark:focus:bg-stone-750"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'சேவை பகுதி / பாதை' : 'Primary Service Area'}
                  </label>
                  <input
                    type="text"
                    value={formData.serviceArea}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    placeholder="e.g. Coimbatore & Pollachi Hub"
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white dark:focus:bg-stone-750"
                  />
                </div>
              </div>

              {/* Passwords */}
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white dark:focus:bg-stone-750"
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white dark:focus:bg-stone-750"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>{language === 'ta' ? 'பதிவு செய்யப்படுகிறது...' : 'Registering Partner...'}</span>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>{language === 'ta' ? 'விநியோக பங்குதாரராக பதிவு செய்' : 'Register as Delivery Partner'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Login Link */}
            <div className="text-center pt-2 border-t border-stone-100 dark:border-stone-800">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already registered as Delivery Partner?'}{' '}
                <button
                  type="button"
                  onClick={() => openLoginModal('delivery')}
                  className="font-bold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  {language === 'ta' ? 'உள்நுழைக' : 'Sign In'}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
