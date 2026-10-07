/**
 * Google Identity Services (GIS) OAuth 2.0 Authentication Helper
 * Standard official popup integration using Google Identity Services Token Client
 */

let gsiScriptLoadedPromise = null;

export function loadGoogleScript() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google);
  }

  if (!gsiScriptLoadedPromise) {
    gsiScriptLoadedPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google));
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services.')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK. Please check your internet connection.'));
      document.head.appendChild(script);
    });
  }

  return gsiScriptLoadedPromise;
}

/**
 * Triggers the official Google Account Chooser / Sign-In popup
 * @returns {Promise<{accessToken: string, email: string, name: string, picture: string, sub: string, emailVerified: boolean}>}
 */
export async function promptGoogleSignIn() {
  const clientId =
    (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim() ||
    '847648540079-o77jgiio50ninflrbm76kj417ph51bvu.apps.googleusercontent.com';

  await loadGoogleScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services SDK is not loaded. Please check your internet connection.');
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.error) {
            console.error('Google OAuth error:', tokenResponse.error);
            reject(new Error(`Google Sign-In failed: ${tokenResponse.error}`));
            return;
          }

          if (!tokenResponse?.access_token) {
            reject(new Error('Google Sign-In cancelled or no token received.'));
            return;
          }

          try {
            // Fetch authentic user profile directly from Google's official endpoint
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              reject(new Error('Failed to retrieve user profile from Google.'));
              return;
            }

            const userInfo = await res.json();
            resolve({
              accessToken: tokenResponse.access_token,
              email: userInfo.email,
              name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || 'Google User',
              picture: userInfo.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || 'Google User')}&background=15803d&color=fff&bold=true`,
              sub: userInfo.sub,
              emailVerified: userInfo.email_verified,
            });
          } catch (profileErr) {
            console.error('Google profile fetch error:', profileErr);
            reject(profileErr);
          }
        },
        error_callback: (err) => {
          console.error('Google popup error callback:', err);
          reject(new Error(err?.message || 'Google popup was closed or access was denied.'));
        },
      });

      // Open official Google Account Chooser popup
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('Google tokenClient init error:', err);
      reject(err);
    }
  });
}
