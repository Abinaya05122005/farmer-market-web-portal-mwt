import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, isAuthenticated, openLoginModal, switchUserRole } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      if (allowedRoles && allowedRoles.includes('admin')) {
        return;
      }
      // Prompt login modal with the required role hint if applicable
      const roleHint = allowedRoles && allowedRoles.length === 1 ? allowedRoles[0] : null;
      openLoginModal(roleHint);
    }
  }, [isAuthenticated, allowedRoles, openLoginModal]);

  if (!isAuthenticated || !currentUser) {
    if (allowedRoles && allowedRoles.includes('admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // Redirect to home where Login Modal is presented
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Role Validation
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Admin routes strictly DENY non-admin accounts without role switching
    if (allowedRoles.includes('admin')) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100">
          <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl p-8 border border-red-200 dark:border-red-900/40 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
              🛡️
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-bold text-stone-900 dark:text-white">
                Access Denied (403 Forbidden)
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                You are currently logged in as <strong className="text-stone-800 dark:text-stone-200">{currentUser.name || currentUser.email}</strong> with role <span className="uppercase font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px]">{currentUser.role}</span>.
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                This portal is strictly restricted to platform administrators. Your role does not have authorization to view or manage administrative controls.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="/admin/login"
                className="w-full py-2.5 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Sign in with Administrator Account
              </a>
              <a
                href="/marketplace"
                className="w-full py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold rounded-xl text-xs transition flex items-center justify-center cursor-pointer"
              >
                Return to Marketplace
              </a>
            </div>
          </div>
        </div>
      );
    }

    const targetRole = allowedRoles[0];
    const roleIcon = targetRole === 'delivery' ? '🚚' : targetRole === 'farmer' ? '👨‍🌾' : '🛒';
    const roleLabel = targetRole === 'delivery' ? 'Delivery Partner' : targetRole === 'farmer' ? 'Farmer' : 'Buyer';
    const btnColor = targetRole === 'delivery' ? 'bg-sky-700 hover:bg-sky-800' : 'bg-farm-700 hover:bg-farm-800';

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
            {roleIcon}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold text-stone-900 dark:text-white">
              Switch to {roleLabel} Mode
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              You are currently logged in as <strong className="text-stone-800 dark:text-stone-200">{currentUser.name || currentUser.email}</strong> with role <span className="uppercase font-bold text-farm-600 dark:text-farm-400 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px]">{currentUser.role}</span>.
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Click below to switch your role to <strong>{roleLabel}</strong> and view this portal.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await switchUserRole(targetRole);
            }}
            className={`w-full py-3 ${btnColor} text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95`}
          >
            <span>Switch to {roleLabel} & Open Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return children;
}
