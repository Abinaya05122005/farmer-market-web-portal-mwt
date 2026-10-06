import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, logout, currentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in as admin, provide quick redirect
  const isAlreadyAdmin = currentUser && currentUser.role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setError('Please provide both administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      // Attempt login with explicit role = 'admin'
      const res = await login(cleanEmail, cleanPass, 'admin');

      if (!res.success) {
        setError(res.message || 'Authentication failed. Please verify your administrator credentials.');
        setLoading(false);
        return;
      }

      // Strictly verify that the authenticated user possesses the admin role
      if (res.user?.role !== 'admin') {
        logout();
        setError('Access Denied: This account does not possess administrator privileges.');
        setLoading(false);
        return;
      }

      // Successfully authenticated as administrator
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during administrator authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-purple-950 via-stone-900 to-stone-950 text-stone-100">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Farmer Marketplace</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-stone-900/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-purple-900/60 border border-purple-500/40 text-purple-300 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60">
                Security Gateway
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-2">
                Admin Control Login
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Authorized Personnel Only &bull; Database & Platform Moderation
              </p>
            </div>
          </div>

          {/* If already logged in as admin */}
          {isAlreadyAdmin && (
            <div className="bg-purple-950/60 border border-purple-600/40 rounded-2xl p-4 text-xs space-y-3 text-purple-200">
              <div className="flex items-center gap-2 font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Active Administrator Session Detected</span>
              </div>
              <p className="text-[11px] text-stone-300">
                You are currently signed in as <strong>{currentUser.email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                Go to Admin Dashboard &rarr;
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-950/60 border border-red-700/50 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Administrator Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  className="w-full pl-10 pr-4 py-3 bg-stone-950/60 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Secure Master Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-10 py-3 bg-stone-950/60 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-purple-700 hover:bg-purple-600 disabled:bg-purple-900/60 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-purple-950 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Enter Admin Panel</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Security Notice */}
          <div className="border-t border-stone-800/80 pt-4 text-center space-y-2">
            <p className="text-[11px] text-stone-400">
              Protected by JWT Authorization & Server-side Role Verification.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Live MySQL Database Connection Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
