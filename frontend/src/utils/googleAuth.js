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
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

  if (
    !clientId ||
    clientId.includes('your_google_client_id') ||
    clientId.includes('YOUR_GOOGLE_CLIENT_ID') ||
    clientId.startsWith('your_') ||
    !clientId.includes('.apps.googleusercontent.com')
  ) {
    throw new Error(
      'Google Client ID is not configured yet. Please add your real Google Client ID from Google Cloud Console to the .env file (VITE_GOOGLE_CLIENT_ID).'
    );
  }

  await loadGoogleScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services is not available. Please refresh the page.');
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error || 'Google Sign-In was cancelled or failed.'));
            return;
          }

          if (!tokenResponse?.access_token) {
            reject(new Error('No access token received from Google.'));
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
              throw new Error('Failed to retrieve user profile from Google.');
            }

            const userInfo = await res.json();
            resolve({
              accessToken: tokenResponse.access_token,
              email: userInfo.email,
              name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || 'Google User',
              picture: userInfo.picture || '',
              sub: userInfo.sub,
              emailVerified: userInfo.email_verified,
            });
          } catch (profileErr) {
            reject(new Error('Could not fetch Google profile details: ' + profileErr.message));
          }
        },
        error_callback: (err) => {
          const errMsg = err?.message || (typeof err === 'string' ? err : 'Google popup was closed or blocked.');
          reject(new Error(errMsg));
        },
      });

      // Open Google Account Chooser popup
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      reject(new Error('Failed to initialize Google Sign-In popup: ' + err.message));
    }
  });
}
