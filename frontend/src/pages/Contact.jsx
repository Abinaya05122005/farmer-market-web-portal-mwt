import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-farm-600 dark:text-farm-400 uppercase tracking-widest">Reach Out</span>
        <h1 className="text-4xl font-display font-bold text-stone-900 dark:text-white">
          We'd Love to Hear From You
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Have a question about your order, interested in enrolling your farm, or want wholesale bulk supply? Contact our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">Contact Information</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Our regional agricultural desk is available Monday through Saturday from 6:00 AM to 8:00 PM IST.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-farm-50 dark:bg-stone-800 text-farm-700 dark:text-farm-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-stone-400 font-medium">Customer & Farmer Hotline</div>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-200">+91 1800-420-3276</div>
                  <div className="text-xs text-farm-600 dark:text-farm-400 font-semibold">Toll-free across India</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-stone-400 font-medium">Support & Farmer Onboarding</div>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-200">support@farmstore.org</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Replies within 2 business hours</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-stone-800 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-stone-400 font-medium">Regional Fulfillment Hub</div>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-200">Agri Logistics Park, Pollachi Main Rd</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Coimbatore, Tamil Nadu 641021</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-farm-800 dark:bg-farm-900 text-white rounded-3xl p-6 space-y-3">
            <h4 className="font-bold text-base">Are you a Certified Farmer?</h4>
            <p className="text-xs text-stone-200 leading-relaxed">
              We provide free digital scale calibration, soil certification testing, and next-morning payment guarantee for all registered growers.
            </p>
            <a
              href="/farmer/register"
              className="inline-block text-xs font-bold bg-lime-400 text-farm-950 px-4 py-2 rounded-xl hover:bg-lime-300 transition"
            >
              Enroll Your Farm Today →
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <h3 className="font-display font-bold text-xl text-stone-900 dark:text-white mb-6">Send Us a Message</h3>

            {submitted ? (
              <div className="p-8 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="font-bold text-lg text-emerald-900 dark:text-emerald-300">Message Dispatched!</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-sm mx-auto">
                  Thank you! Our regional agriculture coordination officer will get back to you within 2-4 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kannan"
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-farm-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-farm-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Topic / Inquiry Type</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-farm-600"
                  >
                    <option>General Consumer Inquiry</option>
                    <option>Farmer Registration & Soil Test</option>
                    <option>Order Delivery Support</option>
                    <option>Wholesale & Community Bulk Buying</option>
                    <option>Quality or Packaging Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Your Message</label>
                  <textarea
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-farm-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-farm-700 hover:bg-farm-800 dark:bg-farm-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
