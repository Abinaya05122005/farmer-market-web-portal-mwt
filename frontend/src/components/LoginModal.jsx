import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  X, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  Sprout, 
  ShoppingBag, 
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginModal() {
  const { 
    isLoginModalOpen, 
    closeLoginModal, 
    loginModalInitialRole,
    loginModalInitialEmail,
    login, 
    loginWithGoogle 
  } = useAuth();
  
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Step: 'select-role' or 'login-form'
  const [step, setStep] = useState('select-role');
  const [selectedRole, setSelectedRole] = useState('buyer'); // 'farmer' | 'buyer' | 'delivery' | 'admin'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isLoginModalOpen) {
      setError('');
      setShowForgot(false);
      setForgotSent(false);
      if (loginModalInitialEmail) {
        setEmail(loginModalInitialEmail);
      }
      if (loginModalInitialRole) {
        setSelectedRole(loginModalInitialRole);
        setStep('login-form');
      } else {
        setStep('select-role');
      }
    }
  }, [isLoginModalOpen, loginModalInitialRole, loginModalInitialEmail]);

  if (!isLoginModalOpen) return null;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    setStep('login-form');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(language === 'ta' ? 'மின்னஞ்சல் மற்றும் கடவுச்சொல் தேவை' : 'Please enter email and password.');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password, selectedRole);
    setIsLoading(false);

    if (res && res.success) {
      const activeRole = res.user?.role || selectedRole;
      if (activeRole === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (activeRole === 'delivery') {
        navigate('/delivery/dashboard');
      } else if (activeRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/marketplace');
      }
    } else {
      setError(res?.message || 'Login failed. Please check credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const res = await loginWithGoogle(selectedRole, email);
    setIsLoading(false);

    if (res && res.success) {
      const activeRole = res.user?.role || selectedRole;
      if (activeRole === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (activeRole === 'delivery') {
        navigate('/delivery/dashboard');
      } else if (activeRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/marketplace');
      }
    } else {
      setError(res?.message || 'Google Login failed.');
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Ribbon */}
        <div className={`h-2.5 w-full ${
          selectedRole === 'farmer'
            ? 'bg-gradient-to-r from-emerald-600 via-farm-600 to-lime-500'
            : selectedRole === 'delivery'
            ? 'bg-gradient-to-r from-sky-600 via-blue-600 to-teal-500'
            : selectedRole === 'admin'
            ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-500'
            : 'bg-gradient-to-r from-amber-500 via-farm-600 to-emerald-600'
        }`} />

        {/* Modal Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition z-10 cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* ========================================================= */}
          {/* STEP 1: ROLE SELECTION CARDS (4 Distinct Roles)           */}
          {/* ========================================================= */}
          {step === 'select-role' && (
            <div className="space-y-5">
              <div className="text-center space-y-2 pt-1">
                <div className="w-13 h-13 rounded-2xl bg-farm-100 dark:bg-farm-950 text-farm-700 dark:text-farm-400 flex items-center justify-center mx-auto shadow-sm">
                  <Sprout className="w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">
                  {language === 'ta' ? 'கணக்கு வகையைத் தேர்ந்தெடுக்கவும்' : 'Select Account Type'}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  {language === 'ta' 
                    ? 'உள்நுழைய உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்'
                    : 'Choose your role to sign in to the Farmer Market Web Portal'}
                </p>
              </div>

              {/* Four Modern Role Cards */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {/* 1. Farmer Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('farmer')}
                  className="group w-full p-3.5 sm:p-4 rounded-2xl border-2 border-stone-200/90 dark:border-stone-800 hover:border-farm-600 dark:hover:border-farm-500 bg-white dark:bg-stone-850 hover:bg-farm-50/40 dark:hover:bg-farm-950/30 transition-all duration-200 text-left flex items-center justify-between shadow-xs hover:shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-300">
                      <span className="text-xl">👨‍🌾</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white group-hover:text-farm-700 dark:group-hover:text-farm-400 transition">
                          {language === 'ta' ? 'விவசாயி (Farmer)' : 'Farmer / Producer'}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 uppercase">
                          Producer
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-tight">
                        {language === 'ta'
                          ? 'விளைபொருட்களை விற்க, பயிர்களை நிர்வகிக்க & ஆர்டர்களை ஏற்க'
                          : 'List crops, accept buyer orders & hand over to delivery'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-farm-600 dark:group-hover:text-farm-400 group-hover:translate-x-1 transition shrink-0 ml-2" />
                </button>

                {/* 2. Buyer Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('buyer')}
                  className="group w-full p-3.5 sm:p-4 rounded-2xl border-2 border-stone-200/90 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-400 bg-white dark:bg-stone-850 hover:bg-amber-50/40 dark:hover:bg-amber-950/30 transition-all duration-200 text-left flex items-center justify-between shadow-xs hover:shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-300">
                      <span className="text-xl">🛒</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                          {language === 'ta' ? 'வாங்குபவர் (Buyer)' : 'Buyer / Consumer'}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 uppercase">
                          Consumer
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-tight">
                        {language === 'ta'
                          ? 'இயற்கை விளைபொருட்களை வாங்க & வீட்டுக்கே டெலிவரி பெற'
                          : 'Browse local farm harvest, track orders & get doorstep delivery'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 ml-2" />
                </button>

                {/* 3. Delivery Partner Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('delivery')}
                  className="group w-full p-3.5 sm:p-4 rounded-2xl border-2 border-stone-200/90 dark:border-stone-800 hover:border-sky-500 dark:hover:border-sky-400 bg-white dark:bg-stone-850 hover:bg-sky-50/40 dark:hover:bg-sky-950/30 transition-all duration-200 text-left flex items-center justify-between shadow-xs hover:shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-300">
                      <span className="text-xl">🚚</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 transition">
                          {language === 'ta' ? 'விநியோக பங்குதாரர் (Delivery)' : 'Delivery Partner / Logistics'}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 uppercase">
                          Logistics
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-tight">
                        {language === 'ta'
                          ? 'பண்ணையிலிருந்து பிக்கப் செய்து வாடிக்கையாளருக்கு விநியோகிக்க'
                          : 'Pick up assigned orders from farms & complete doorstep deliveries'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition shrink-0 ml-2" />
                </button>

                {/* 4. Admin Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className="group w-full p-3.5 sm:p-4 rounded-2xl border-2 border-stone-200/90 dark:border-stone-800 hover:border-purple-600 dark:hover:border-purple-400 bg-white dark:bg-stone-850 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition-all duration-200 text-left flex items-center justify-between shadow-xs hover:shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-300">
                      <span className="text-xl">👨‍💼</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition">
                          {language === 'ta' ? 'நிர்வாகி (Admin)' : 'Admin / Supervisor'}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 uppercase">
                          System
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-tight">
                        {language === 'ta'
                          ? 'தள மேலாண்மை, மண் சான்றிதழ் & தரக் கட்டுப்பாடு'
                          : 'Platform moderation, farmer verification & logistics supervision'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition shrink-0 ml-2" />
                </button>
              </div>

              {/* Registration Quick Links */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400 space-x-2">
                <span>{language === 'ta' ? 'புதியவரா? கணக்கு தொடங்க:' : 'New user? Register here:'}</span>
                <Link
                  to="/farmer/register"
                  onClick={closeLoginModal}
                  className="font-bold text-farm-700 dark:text-farm-400 hover:underline"
                >
                  {language === 'ta' ? 'விவசாயி' : 'Farmer'}
                </Link>
                <span>•</span>
                <Link
                  to="/buyer/register"
                  onClick={closeLoginModal}
                  className="font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  {language === 'ta' ? 'வாங்குபவர்' : 'Buyer'}
                </Link>
                <span>•</span>
                <Link
                  to="/delivery/register"
                  onClick={closeLoginModal}
                  className="font-bold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  {language === 'ta' ? 'விநியோகஸ்தர்' : 'Delivery'}
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: LOGIN FORM FOR SELECTED ROLE                      */}
          {/* ========================================================= */}
          {step === 'login-form' && (
            <div className="space-y-4">
              {/* Back to Role Selection button */}
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
                <button
                  type="button"
                  onClick={() => { setStep('select-role'); setError(''); }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'ta' ? 'பங்கு தேர்வுக்கு திரும்பு' : 'Change Role'}</span>
                </button>

                {/* Selected Role Badge */}
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                  selectedRole === 'farmer'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : selectedRole === 'delivery'
                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                    : selectedRole === 'admin'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                }`}>
                  <span>
                    {selectedRole === 'farmer' ? '👨‍🌾' : selectedRole === 'delivery' ? '🚚' : selectedRole === 'admin' ? '👨‍💼' : '🛒'}
                  </span>
                  <span className="capitalize">{selectedRole === 'delivery' ? 'Delivery Partner' : selectedRole}</span>
                </div>
              </div>

              {/* Form Heading */}
              <div className="text-center space-y-1 pt-0.5">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-white">
                  {selectedRole === 'farmer'
                    ? (language === 'ta' ? 'விவசாயி உள்நுழைவு' : 'Farmer Login')
                    : selectedRole === 'delivery'
                    ? (language === 'ta' ? 'விநியோக பங்குதாரர் உள்நுழைவு' : 'Delivery Partner Login')
                    : selectedRole === 'admin'
                    ? (language === 'ta' ? 'நிர்வாகி உள்நுழைவு' : 'Admin Login')
                    : (language === 'ta' ? 'வாங்குபவர் உள்நுழைவு' : 'Buyer Login')}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {language === 'ta' 
                    ? 'உங்கள் சான்றுகளை உள்ளிட்டு தொடரவும்' 
                    : `Enter your credentials to access the ${selectedRole === 'delivery' ? 'Logistics' : selectedRole} portal`}
                </p>
              </div>

              {/* Error Message Box */}
              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Authentication Notice: </span>
                    {error}
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        selectedRole === 'farmer' 
                          ? 'farmer@example.com' 
                          : selectedRole === 'delivery'
                          ? 'delivery@example.com'
                          : selectedRole === 'admin' 
                          ? 'admin@example.com' 
                          : 'buyer@example.com'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 focus:bg-white dark:focus:bg-stone-750 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-[11px] font-semibold text-farm-700 dark:text-farm-400 hover:underline cursor-pointer"
                    >
                      {language === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 focus:bg-white dark:focus:bg-stone-750 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 text-white font-bold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99] cursor-pointer ${
                    selectedRole === 'farmer'
                      ? 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600'
                      : selectedRole === 'delivery'
                      ? 'bg-sky-700 hover:bg-sky-800 dark:bg-sky-600'
                      : selectedRole === 'admin'
                      ? 'bg-purple-800 hover:bg-purple-900 dark:bg-purple-700'
                      : 'bg-farm-700 hover:bg-farm-800 dark:bg-farm-600'
                  }`}
                >
                  {isLoading ? (
                    <span>{language === 'ta' ? 'சரிபார்க்கிறது...' : 'Verifying Credentials...'}</span>
                  ) : (
                    <>
                      <span>
                        {selectedRole === 'farmer'
                          ? (language === 'ta' ? 'விவசாயியாக உள்நுழைக' : 'Sign In as Farmer')
                          : selectedRole === 'delivery'
                          ? (language === 'ta' ? 'விநியோகஸ்தராக உள்நுழைக' : 'Sign In as Delivery Partner')
                          : selectedRole === 'admin'
                          ? (language === 'ta' ? 'நிர்வாகியாக உள்நுழைக' : 'Sign In as Admin')
                          : (language === 'ta' ? 'வாங்குபவராக உள்நுழைக' : 'Sign In as Buyer')}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* OR Separator */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-stone-200 dark:border-stone-700 w-full" />
                <span className="bg-white dark:bg-stone-900 px-3 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider relative z-10">
                  {language === 'ta' ? 'அல்லது' : 'OR'}
                </span>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2.5 shadow-xs hover:shadow-sm active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>{language === 'ta' ? 'Google கணக்குடன் தொடரவும்' : 'Continue with Google'}</span>
              </button>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center mt-1">
                {language === 'ta'
                  ? '💡 உதவி: மேலே மின்னஞ்சலை உள்ளிட்டால் உடனடியாக 1-Click உள்நுழையலாம்.'
                  : '💡 Tip: Enter your Google or College email above for instant 1-click Sign-In.'}
              </p>

              {/* Bottom Register Link */}
              <div className="border-t border-stone-100 dark:border-stone-800 pt-3 text-center">
                {selectedRole === 'farmer' ? (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {language === 'ta' ? 'புதிய விவசாயியா?' : "Don't have an account?"}{' '}
                    <Link
                      to="/farmer/register"
                      onClick={closeLoginModal}
                      className="font-bold text-farm-700 dark:text-farm-400 hover:underline"
                    >
                      {language === 'ta' ? 'விவசாயியாக பதிவு செய்யவும்' : 'Register as Farmer'}
                    </Link>
                  </p>
                ) : selectedRole === 'buyer' ? (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {language === 'ta' ? 'புதிய வாங்குபவரா?' : "Don't have an account?"}{' '}
                    <Link
                      to="/buyer/register"
                      onClick={closeLoginModal}
                      className="font-bold text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      {language === 'ta' ? 'வாங்குபவராக பதிவு செய்யவும்' : 'Register as Buyer'}
                    </Link>
                  </p>
                ) : selectedRole === 'delivery' ? (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {language === 'ta' ? 'புதிய விநியோகஸ்தரா?' : "New Delivery Partner?"}{' '}
                    <Link
                      to="/delivery/register"
                      onClick={closeLoginModal}
                      className="font-bold text-sky-700 dark:text-sky-400 hover:underline"
                    >
                      {language === 'ta' ? 'இப்போதே பதிவு செய்யவும்' : 'Register as Delivery Partner'}
                    </Link>
                  </p>
                ) : (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Admin accounts require supervisor pre-clearance.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FORGOT PASSWORD IN-MODAL VIEW                             */}
          {/* ========================================================= */}
          {showForgot && (
            <div className="absolute inset-0 bg-white dark:bg-stone-900 p-6 sm:p-8 flex flex-col justify-between z-20 animate-in fade-in">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                    {language === 'ta' ? 'கடவுச்சொல் மீட்டெடுப்பு' : 'Reset Password'}
                  </h3>
                  <button
                    onClick={() => setShowForgot(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {forgotSent ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/60 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                      {language === 'ta' ? 'மீட்டெடுப்பு இணைப்பு அனுப்பப்பட்டது!' : 'Reset Link Sent!'}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      We have sent password reset instructions to <strong>{forgotEmail}</strong>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Enter your account email address. We will send a secure link to reset your password.
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="your.email@domain.com"
                        className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-farm-700 hover:bg-farm-800 text-white font-bold rounded-2xl text-xs sm:text-sm transition cursor-pointer"
                    >
                      Send Password Recovery Link
                    </button>
                  </form>
                )}
              </div>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="text-xs font-bold text-farm-700 dark:text-farm-400 hover:underline cursor-pointer"
                >
                  ← Back to Login Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
