import React, { createContext, useContext, useState, useEffect } from 'react';
import { promptGoogleSignIn } from '../utils/googleAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [allUsers, setAllUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('farmstore_all_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('farmstore_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalInitialRole, setLoginModalInitialRole] = useState(null);
  const [loginModalInitialEmail, setLoginModalInitialEmail] = useState('');

  useEffect(() => {
    localStorage.setItem('farmstore_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Sync registered farmers from MySQL backend on mount
  useEffect(() => {
    const fetchBackendFarmers = async () => {
      try {
        const res = await fetch('/api/auth/farmers');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.farmers)) {
            setAllUsers((prev) => {
              const map = new Map();
              [...prev, ...data.farmers].forEach((u) => {
                if (u?.email) map.set(u.email.toLowerCase(), u);
              });
              return Array.from(map.values());
            });
          }
        }
      } catch (e) {}
    };
    fetchBackendFarmers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('farmstore_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('farmstore_user');
    }
  }, [currentUser]);

  const openLoginModal = (role = null, emailHint = '') => {
    setLoginModalInitialRole(role);
    setLoginModalInitialEmail(emailHint || '');
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginModalInitialRole(null);
    setLoginModalInitialEmail('');
  };

  const saveToken = (newToken) => {
    if (newToken) {
      setToken(newToken);
      try {
        localStorage.setItem('farmstore_token', newToken);
        localStorage.setItem('token', newToken);
      } catch (e) {}
    }
  };

  const removeToken = () => {
    setToken(null);
    try {
      localStorage.removeItem('farmstore_token');
      localStorage.removeItem('token');
    } catch (e) {}
  };

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('farmstore_token') || localStorage.getItem('token') || null;
    } catch (e) {
      return null;
    }
  });

  const getStoredUsersList = () => {
    let list = [];
    try {
      const stored = localStorage.getItem('farmstore_all_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) list = parsed;
      }
    } catch (e) {}

    // Combine with allUsers state ensuring uniqueness
    const combined = [...list];
    for (const u of allUsers) {
      if (u?.email && !combined.some((x) => x.email?.trim().toLowerCase() === u.email.trim().toLowerCase())) {
        combined.push(u);
      }
    }
    return combined;
  };

  const login = async (email, password, selectedRole) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();
    const usersList = getStoredUsersList();

    // 1. Try backend API FIRST to get real MySQL authenticated session and JWT token
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass, selectedRole }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const userObj = { ...data.user, token: data.token };
          const updated = [...usersList.filter((u) => u.email?.toLowerCase() !== cleanEmail), userObj];
          localStorage.setItem('farmstore_all_users', JSON.stringify(updated));
          setAllUsers(updated);
          setCurrentUser(userObj);
          saveToken(data.token);
          closeLoginModal();
          return { success: true, user: userObj };
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        // If password was incorrect, directly return the error
        if (errData.message && errData.message.includes('Incorrect password')) {
          return { success: false, message: errData.message };
        }

        // If not in MySQL, check local storage before failing
        const localUser = usersList.find(
          (u) => u.email?.trim().toLowerCase() === cleanEmail
        );

        if (localUser) {
          if (localUser.password !== cleanPass) {
            return {
              success: false,
              message: 'Incorrect password. Please check your password and try again.',
            };
          }

          const userToken = localUser.token || `token-${localUser.id || Date.now()}`;
          const userObj = { ...localUser, token: userToken };
          setCurrentUser(userObj);
          saveToken(userToken);
          localStorage.setItem('farmstore_user', JSON.stringify(userObj));
          closeLoginModal();
          return { success: true, user: userObj };
        }

        return {
          success: false,
          message: errData.message || `No account found with email "${cleanEmail}". Please register first or check your email address.`,
        };
      }
    } catch (apiError) {
      console.warn('Backend login fallback to local:', apiError.message);
    }

    // 2. Fallback to local persistent store if offline
    const localUser = usersList.find(
      (u) => u.email?.trim().toLowerCase() === cleanEmail
    );

    if (localUser) {
      if (localUser.password !== cleanPass) {
        return {
          success: false,
          message: 'Incorrect password. Please check your password and try again.',
        };
      }

      const userToken = localUser.token || `token-${localUser.id || Date.now()}`;
      const userObj = { ...localUser, token: userToken };
      setCurrentUser(userObj);
      saveToken(userToken);
      localStorage.setItem('farmstore_user', JSON.stringify(userObj));
      closeLoginModal();
      return { success: true, user: userObj };
    }

    return {
      success: false,
      message: `No account found with email "${cleanEmail}". Please register first or check your email address.`,
    };
  };

  const loginWithGoogle = async (selectedRole = 'buyer') => {
    try {
      // 1. Launch official Google Account Chooser popup & get authenticated Google profile
      const googleProfile = await promptGoogleSignIn();

      // 2. Send verified Google profile to backend API for MySQL database insertion & JWT token
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedRole,
          email: googleProfile.email,
          name: googleProfile.name,
          picture: googleProfile.picture,
          accessToken: googleProfile.accessToken,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.user) {
        throw new Error(data.message || 'Failed to authenticate Google user on backend.');
      }

      const userObj = { ...data.user, token: data.token };

      // 3. Store session properly in state & localStorage for page refresh persistence
      const usersList = getStoredUsersList();
      const updatedUsers = [
        ...usersList.filter((u) => u.email?.toLowerCase() !== userObj.email?.toLowerCase()),
        userObj,
      ];
      localStorage.setItem('farmstore_all_users', JSON.stringify(updatedUsers));
      setAllUsers(updatedUsers);

      setCurrentUser(userObj);
      localStorage.setItem('farmstore_user', JSON.stringify(userObj));
      if (data.token) {
        saveToken(data.token);
      }

      closeLoginModal();
      return { success: true, user: userObj };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return {
        success: false,
        message: error.message || 'Google Sign-In failed or was cancelled.',
      };
    }
  };

  const register = async (userData, autoLogin = false) => {
    const cleanEmail = String(userData.email || '').trim().toLowerCase();
    const cleanPass = String(userData.password || '').trim();
    const cleanUser = {
      ...userData,
      email: cleanEmail,
      password: cleanPass,
      id: userData.id || `${userData.role || 'user'}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const usersList = getStoredUsersList();
    const existing = usersList.find(
      (u) => u.email?.trim().toLowerCase() === cleanEmail
    );

    if (existing) {
      return {
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      };
    }

    let createdUser = cleanUser;
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanUser),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          createdUser = { ...data.user, token: data.token, password: cleanUser.password };
          if (data.token && autoLogin) {
            saveToken(data.token);
          }
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        if (errData.message && errData.message.includes('already exists')) {
          return {
            success: false,
            message: 'An account with this email address already exists. Please sign in.',
          };
        }
      }
    } catch (apiError) {}

    // ALWAYS store the newly registered account locally in farmstore_all_users
    const updatedUsers = [...usersList.filter((u) => u.email?.toLowerCase() !== cleanEmail), createdUser];
    localStorage.setItem('farmstore_all_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);

    if (autoLogin) {
      setCurrentUser(createdUser);
      localStorage.setItem('farmstore_user', JSON.stringify(createdUser));
      closeLoginModal();
    }

    return { success: true, user: createdUser };
  };

  const switchUserRole = async (targetRole) => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('farmstore_token');
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ targetRole }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('farmstore_user', JSON.stringify(data.user));
          if (data.token) {
            saveToken(data.token);
          }
          return data.user;
        }
      }
    } catch (e) {
      console.warn('Switch role API fallback:', e.message);
    }
    // Local fallback
    const updated = { ...currentUser, role: targetRole };
    setCurrentUser(updated);
    localStorage.setItem('farmstore_user', JSON.stringify(updated));
    return updated;
  };

  const logout = () => {
    setCurrentUser(null);
    removeToken();
    try {
      localStorage.removeItem('farmstore_user');
    } catch (e) {}
  };

  const value = {
    currentUser,
    allUsers,
    token: token || currentUser?.token || (typeof localStorage !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('farmstore_token')) : null),
    login,
    loginWithGoogle,
    register,
    logout,
    switchUserRole,
    isAuthenticated: !!currentUser,
    isFarmer: currentUser?.role === 'farmer',
    isBuyer: currentUser?.role === 'buyer',
    isDelivery: currentUser?.role === 'delivery',
    isAdmin: currentUser?.role === 'admin',
    isLoginModalOpen,
    loginModalInitialRole,
    loginModalInitialEmail,
    openLoginModal,
    closeLoginModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
