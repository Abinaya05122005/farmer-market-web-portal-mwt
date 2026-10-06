import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Mail, Phone, MapPin, Heart, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { t } = useLanguage();
  const { openLoginModal } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#153422] dark:bg-[#0c1c13] text-stone-200 border-t border-emerald-900/40 transition-colors">
      {/* Newsletter Section */}
      <div className="border-b border-emerald-800/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-block px-3 py-1 bg-emerald-800/80 text-lime-300 text-xs font-semibold rounded-full uppercase tracking-wider">
            Direct From Soil To Spoon
          </span>
          <h3 className="text-3xl sm:text-4xl font-display font-bold text-white">
            {t('home.newsletterTitle')}
          </h3>
          <p className="text-stone-300 text-sm max-w-xl mx-auto">
            {t('home.newsletterSubtitle')}
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('home.enterEmail')}
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white/95 dark:bg-stone-800 text-stone-800 dark:text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-lime-500 hover:bg-lime-400 text-farm-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" /> {t('home.subscribe')}
            </button>
          </form>

          {subscribed && (
            <p className="text-lime-300 text-xs flex items-center justify-center gap-1.5 pt-1">
              <CheckCircle2 className="w-4 h-4" /> Thank you for subscribing to weekly harvest deals!
            </p>
          )}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-lime-400 text-farm-950 flex items-center justify-center font-bold">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-2xl text-white tracking-tight">
                FarmStore
              </span>
            </Link>
            <p className="text-stone-300 text-sm leading-relaxed max-w-sm">
              {t('footer.mission')}
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
                Agricultural Tech Hub, Coimbatore, Tamil Nadu, India
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-lime-400 shrink-0" />
                Farmer Toll-Free Support: +91 1800-420-3276
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-lime-400 shrink-0" />
                contact@farmstore-agri.org
              </p>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">{t('footer.shopFresh')}</h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li><Link to="/marketplace?category=Vegetables" className="hover:text-lime-300 transition">{t('cat.vegetables')}</Link></li>
              <li><Link to="/marketplace?category=Fruits" className="hover:text-lime-300 transition">{t('cat.fruits')}</Link></li>
              <li><Link to="/marketplace?category=Herbs%20%26%20Greens" className="hover:text-lime-300 transition">{t('cat.herbs')}</Link></li>
              <li><Link to="/marketplace?category=Farm%20Bundles" className="hover:text-lime-300 transition">{t('cat.bundles')}</Link></li>
            </ul>
          </div>

          {/* Portals Column */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">{t('footer.portals')}</h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="hover:text-lime-300 transition text-left cursor-pointer"
                >
                  Sign In (Choose Role)
                </button>
              </li>
              <li><Link to="/farmer/register" className="hover:text-lime-300 transition">Register as Producer</Link></li>
              <li><Link to="/buyer/register" className="hover:text-lime-300 transition">Create Buyer Account</Link></li>
              <li><Link to="/delivery/register" className="hover:text-lime-300 transition">Join Delivery Fleet (Logistics)</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => openLoginModal('admin')}
                  className="hover:text-lime-300 transition text-left cursor-pointer"
                >
                  Admin Portal Access
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Trust */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">{t('footer.promise')}</h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li><Link to="/about" className="hover:text-lime-300 transition">{t('home.organicCertified')}</Link></li>
              <li><Link to="/about" className="hover:text-lime-300 transition">{t('home.zeroMiddlemen')}</Link></li>
              <li><Link to="/contact" className="hover:text-lime-300 transition">Customer Help & FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-800/50 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-400">
          <p>© {new Date().getFullYear()} FarmStore Agri Portal. {t('footer.rights')} Handcrafted with <Heart className="w-3 h-3 inline text-rose-400 fill-rose-400" /> for Indian Farmers.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition">Terms of Produce</span>
            <span className="hover:text-white cursor-pointer transition">Organic Certification</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
