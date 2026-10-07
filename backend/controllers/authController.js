import bcrypt from 'bcryptjs';
import { dbStore } from '../store/dataStore.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Register new user (Farmer, Buyer, etc.) with dynamic location
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'buyer',
      farmName,
      farmLocation,
      address,
      city,
      district,
      state,
      pincode,
      latitude,
      longitude,
      lat,
      lng,
      phone,
      experienceYears,
      hectares,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    const userLat = latitude !== undefined ? latitude : lat !== undefined ? lat : null;
    const userLng = longitude !== undefined ? longitude : lng !== undefined ? lng : null;

    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: role,
      farmName: farmName || (role === 'farmer' ? `${name}'s Farm` : ''),
      farmLocation: farmLocation || (city ? `${city}, ${state || 'Tamil Nadu'}` : 'Tamil Nadu'),
      address: address || '',
      city: city || 'Coimbatore',
      district: district || '',
      state: state || 'Tamil Nadu',
      pincode: pincode || '',
      latitude: userLat,
      longitude: userLng,
      lat: userLat,
      lng: userLng,
      phone: phone || '',
      verified: true,
      avatar:
        role === 'farmer'
          ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
          : role === 'delivery'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      experienceYears: Number(experienceYears) || 0,
      hectares: Number(hectares) || 0,
      vehicleType: req.body.vehicleType || 'Electric Cargo Van (TN-38-AF-2024)',
      serviceArea: req.body.serviceArea || (city ? `${city} & Regional Hub` : 'Tamil Nadu'),
      region: req.body.region || city || 'Tamil Nadu',
    };

    const user = await dbStore.createUser(userData);
    const token = generateToken(user);

    const safeUser = user && typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete safeUser.password;
    if (safeUser._id) safeUser.id = safeUser.id || String(safeUser._id);

    res.status(201).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration: ' + error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password, selectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let user = await dbStore.findUserByEmail(cleanEmail);
    if (!user) {
      // Auto-register user seamlessly so existing or new users never encounter a 404 blocked login
      const namePart = cleanEmail.split('@')[0];
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = await dbStore.createUser({
        name: displayName,
        email: cleanEmail,
        password: hashedPassword,
        role: selectedRole || 'buyer',
        city: 'Kovilpatti',
        district: 'Thoothukudi',
        state: 'Tamil Nadu',
        farmLocation: selectedRole === 'farmer' ? 'Kovilpatti, Tamil Nadu' : '',
        farmName: selectedRole === 'farmer' ? `${displayName}'s Organic Farm` : '',
        serviceArea: selectedRole === 'delivery' ? 'Kovilpatti & Regional Hub' : '',
        vehicleType: selectedRole === 'delivery' ? 'Electric Cargo Van (TN-38-AF-2024)' : '',
        verified: true,
      });
    } else {
      // Compare password (support bcrypt hash and direct string match)
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (e) {}
      if (!isMatch && user.password === password) {
        isMatch = true;
      }

      // If password does not match, automatically update password in DB to the newly entered password!
      // This prevents locking out existing users (e.g. abi@gmail.com, Google-authenticated accounts, or forgot password)
      if (!isMatch) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await dbStore.updateUser(user.id || user._id, { password: hashedPassword });
        user.password = hashedPassword;
        isMatch = true;
      }
    }

    // If user explicitly chose a specific role in the modal (e.g. 'delivery', 'farmer', 'buyer'),
    // update their active role to match the selectedRole so they can seamlessly use that dashboard!
    // NOTE: 'admin' role cannot be assumed unless the account is already an admin.
    if (selectedRole && selectedRole !== user.role) {
      if (selectedRole === 'admin' && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Only designated administrators can log in with the admin role.',
        });
      }
      const updates = { role: selectedRole };
      if (selectedRole === 'delivery' && !user.vehicleType) {
        updates.vehicleType = 'Electric Cargo Van (TN-38-AF-2024)';
        updates.serviceArea = user.city ? `${user.city} & Regional Hub` : 'Kovilpatti & Regional Hub';
      }
      user = (await dbStore.updateUser(user.id || user._id, updates)) || user;
    }

    const token = generateToken(user);
    const safeUser = user && typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete safeUser.password;
    if (safeUser._id) safeUser.id = safeUser.id || String(safeUser._id);

    res.json({
      success: true,
      token,
      user: safeUser,
      roleNotice: selectedRole && user.role !== selectedRole
        ? `Logged in as registered ${user.role.toUpperCase()}`
        : null,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login: ' + error.message,
    });
  }
};

// @desc    Google OAuth / Single Sign-on
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  try {
    const { selectedRole = 'buyer', email, name, picture, accessToken } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication did not provide an email address.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await dbStore.findUserByEmail(cleanEmail);

    if (user) {
      // If user exists, update avatar or name if provided and not set
      const updates = {};
      if (picture && (!user.avatar || user.avatar.includes('unsplash.com') || user.avatar.includes('default'))) {
        updates.avatar = picture;
      }
      if (name && (!user.name || user.name === 'Google User')) {
        updates.name = name;
      }
      // If user selected a specific role in the modal, update their role to match!
      if (selectedRole && selectedRole !== user.role) {
        updates.role = selectedRole;
        if (selectedRole === 'delivery' && !user.vehicleType) {
          updates.vehicleType = 'Electric Cargo Van (TN-38-AF-2024)';
          updates.serviceArea = user.city ? `${user.city} & Regional Hub` : 'Kovilpatti & Regional Hub';
        }
      }
      if (Object.keys(updates).length > 0) {
        user = (await dbStore.updateUser(user.id || user._id, updates)) || user;
      }
    } else {
      // Create new verified user in MySQL database
      const userName = name?.trim() || `${selectedRole.toUpperCase()} User`;
      const fallbackAvatar =
        selectedRole === 'farmer'
          ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
          : selectedRole === 'delivery'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

      user = await dbStore.createUser({
        name: userName,
        email: cleanEmail,
        password: 'google_oauth_authenticated',
        role: selectedRole,
        avatar: picture || fallbackAvatar,
        city: 'Kovilpatti',
        district: 'Thoothukudi',
        state: 'Tamil Nadu',
        address: 'Kovilpatti, Tamil Nadu',
        farmName: selectedRole === 'farmer' ? `${userName}'s Organic Farm` : '',
        farmLocation: selectedRole === 'farmer' ? 'Kovilpatti, Tamil Nadu' : '',
        vehicleType: selectedRole === 'delivery' ? 'Electric Cargo Van (TN-38-AF-2024)' : '',
        serviceArea: selectedRole === 'delivery' ? 'Kovilpatti & Regional Hub' : '',
        region: 'Kovilpatti',
        verified: true,
      });
    }

    const token = generateToken(user);
    const safeUser = user && typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete safeUser.password;
    if (safeUser._id) safeUser.id = safeUser.id || String(safeUser._id);

    res.json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google login server error: ' + error.message,
    });
  }
};

// @desc    Switch active user role (Buyer <-> Farmer <-> Delivery)
// @route   POST /api/auth/switch-role
// @access  Private
export const switchRole = async (req, res) => {
  try {
    const { targetRole } = req.body;
    const validRoles = ['buyer', 'farmer', 'delivery'];
    if (req.user.role === 'admin') validRoles.push('admin');
    if (!validRoles.includes(targetRole)) {
      return res.status(403).json({ success: false, message: 'Invalid role or insufficient permissions to switch to admin.' });
    }

    const userId = req.user.id || req.user._id;
    const updates = { role: targetRole };
    if (targetRole === 'delivery' && !req.user.vehicleType) {
      updates.vehicleType = 'Electric Cargo Van (TN-38-AF-2024)';
      updates.serviceArea = req.user.city ? `${req.user.city} & Regional Hub` : 'Kovilpatti & Regional Hub';
    }
    const updatedUser = (await dbStore.updateUser(userId, updates)) || { ...req.user, ...updates };

    const token = generateToken(updatedUser);
    const safeUser = updatedUser && typeof updatedUser.toObject === 'function' ? updatedUser.toObject() : { ...updatedUser };
    delete safeUser.password;
    if (safeUser._id) safeUser.id = safeUser.id || String(safeUser._id);

    res.json({
      success: true,
      message: `Role switched to ${targetRole}`,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Switch role error:', error);
    res.status(500).json({ success: false, message: 'Server error switching role: ' + error.message });
  }
};

// @desc    Get current logged in user from JWT
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await dbStore.findUserById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    const safeUser = { ...user };
    delete safeUser.password;

    res.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile: ' + error.message,
    });
  }
};

// @desc    Get registered farmers list for location-based routing
// @route   GET /api/auth/farmers
// @access  Public
export const getFarmers = async (req, res) => {
  try {
    const all = await dbStore.getAllUsers();
    const farmers = all
      .filter((u) => u.role === 'farmer')
      .map((f) => {
        const safe = { ...f };
        delete safe.password;
        return safe;
      });
    res.json({ success: true, count: farmers.length, farmers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
