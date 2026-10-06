import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  Phone, 
  AlertCircle, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function BuyerRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
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
    const res = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      password: formData.password,
      role: 'buyer',
    }, false); // false = register and then sign in

    setIsLoading(false);

    if (res && res.success) {
      setRegisteredInfo({
        name: formData.name,
        email: formData.email,
      });
      setIsSuccess(true);
    } else {
      setError(res?.message || 'Registration failed. Please try again.');
    }
  };

  const handleProceedToSignIn = () => {
    if (registeredInfo?.email) {
      openLoginModal('buyer', registeredInfo.email);
    } else {
      openLoginModal('buyer');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#fcfbf7] dark:bg-stone-950 transition-colors duration-200">
      <div className="max-w-lg w-full bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
        
        {/* ========================================================= */}
        {/* SUCCESS CONFIRMATION STATE                                */}
        {/* ========================================================= */}
        {isSuccess ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'ta' ? 'பதிவு முடிந்தது' : 'Account Created Successfully'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">
                {language === 'ta' ? 'வாங்குபவர் கணக்கு தயார்!' : 'Buyer Account Ready!'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                {language === 'ta'
                  ? `வணக்கம் ${registeredInfo?.name || ''}! உங்கள் வாங்குபவர் கணக்கு உருவாக்கப்பட்டது. இப்போது உள்நுழைந்து இயற்கை விளைபொருட்களை ஆர்டர் செய்யலாம்.`
                  : `Welcome ${registeredInfo?.name || ''}! Your buyer account has been created. Please sign in to browse fresh harvests and order.`}
              </p>
            </div>

            {/* Registration Summary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 text-left space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 dark:text-stone-400">{language === 'ta' ? 'பங்கு' : 'Role'}</span>
                <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buyer / Consumer</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">{language === 'ta' ? 'மின்னஞ்சல்' : 'Email'}</span>
                <span className="font-bold text-stone-900 dark:text-white">{registeredInfo?.email}</span>
              </div>
            </div>

            {/* Direct Sign In CTA Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleProceedToSignIn}
                className="w-full py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base transition duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <LogIn className="w-5 h-5" />
                <span>{language === 'ta' ? 'வாங்குபவராக உள்நுழைக (Sign In Now)' : 'Sign In as Buyer'}</span>
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
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-display font-bold text-stone-900 dark:text-white">
                {language === 'ta' ? 'வாங்குபவர் கணக்கு உருவாக்கம்' : 'Create Buyer Account'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === 'ta' 
                  ? 'பண்ணைகளிலிருந்து நேரடியாக புதிய விளைபொருட்களை வீட்டிற்குப் பெறுங்கள்'
                  : 'Get fresh, direct-from-farm produce delivered to your doorstep'}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
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
                    placeholder="e.g. Priya Sundaram"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-stone-750"
                  />
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
                      placeholder="priya@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-stone-750"
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
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-stone-750"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {language === 'ta' ? 'டெலிவரி முகவரி' : 'Delivery Address'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <textarea
                    rows="2"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Door/Flat No, Apartment, Street, Coimbatore"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-stone-750"
                  />
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-stone-750"
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-stone-750"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>{language === 'ta' ? 'பதிவு செய்யப்படுகிறது...' : 'Creating Account...'}</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{language === 'ta' ? 'வாங்குபவராக பதிவு செய்' : 'Register as Buyer'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-stone-100 dark:border-stone-800 pt-4 text-center">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => openLoginModal('buyer')}
                  className="font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {language === 'ta' ? 'வாங்குபவர் உள்நுழைவு' : 'Buyer Sign In'}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
