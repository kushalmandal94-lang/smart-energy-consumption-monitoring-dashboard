const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const userStore = require('../utils/userStore');

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'super_secret_jwt_key_energy_dashboard_2026_change_in_production',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    // Check if user already exists in local registry first
    const existingLocalUser = userStore.getUserByEmail(normalizedEmail);
    if (existingLocalUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    if (isDbConnected) {
      try {
        // Check if user already exists in MongoDB Atlas
        const existingUser = await User.findOne({ email: normalizedEmail }).maxTimeMS(2500);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'A user with this email address already exists.',
          });
        }

        // Create user in MongoDB Atlas
        const user = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password,
          role: role || 'manager',
        });

        const token = generateToken(user);

        // Also save to resilient local registry
        userStore.saveUser({
          _id: user._id.toString(),
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences,
        });

        return res.status(201).json({
          success: true,
          message: 'User registered successfully!',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            preferences: user.preferences,
          },
        });
      } catch (dbErr) {
        console.warn('MongoDB Atlas write notice during registration, using resilient active registry:', dbErr.message);
        // Fall through to resilient user creation below
      }
    }

    // Resilient registration (when MongoDB Atlas is offline, reconnecting, or buffering)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUserId = new mongoose.Types.ObjectId().toString();

    const newUser = {
      _id: newUserId,
      id: newUserId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'manager',
      preferences: {
        currency: '$',
        ratePerKWh: 0.15,
        monthlyBudgetLimit: 500,
        dailyTargetKWh: 100,
        alertNotifications: true,
        theme: 'dark',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userStore.saveUser(newUser);
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        preferences: newUser.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login existing user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        const user = await User.findOne({ email: normalizedEmail }).select('+password').maxTimeMS(2500);

        if (user) {
          const isMatch = await user.comparePassword(password);
          if (isMatch) {
            const token = generateToken(user);
            userStore.saveUser(user);

            return res.status(200).json({
              success: true,
              message: 'Logged in successfully',
              token,
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                preferences: user.preferences,
              },
            });
          } else {
            return res.status(401).json({
              success: false,
              message: 'Invalid email or password',
            });
          }
        }
      } catch (dbErr) {
        console.warn('MongoDB Atlas query notice during login, checking active registry:', dbErr.message);
      }
    }

    // Check local resilient store
    const localUser = userStore.getUserByEmail(normalizedEmail);
    if (localUser && localUser.password) {
      const isMatch = await bcrypt.compare(password, localUser.password);
      if (isMatch) {
        const token = generateToken(localUser);
        return res.status(200).json({
          success: true,
          message: 'Logged in successfully',
          token,
          user: {
            id: localUser._id || localUser.id,
            name: localUser.name,
            email: localUser.email,
            role: localUser.role,
            preferences: localUser.preferences,
          },
        });
      }
    }

    // Standard demo credentials fallback: admin@energydashboard.io / Password123!
    if (normalizedEmail === 'admin@energydashboard.io' && password === 'Password123!') {
      const demoUser = userStore.getUserByEmail('admin@energydashboard.io') || {
        _id: '662f1a2b3c4d5e6f7a8b9c0d',
        id: '662f1a2b3c4d5e6f7a8b9c0d',
        name: 'Alex Rivera (Facility Lead)',
        email: 'admin@energydashboard.io',
        role: 'admin',
        preferences: {
          currency: '$',
          ratePerKWh: 0.15,
          monthlyBudgetLimit: 500,
          dailyTargetKWh: 100,
          alertNotifications: true,
          theme: 'dark',
        },
      };

      const token = generateToken(demoUser);
      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: demoUser._id || demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          preferences: demoUser.preferences,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & energy budget preferences
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id || '').toString();
    const isDbConnected = mongoose.connection.readyState === 1;
    const { name, preferences } = req.body;

    let updatedUser = null;

    if (isDbConnected) {
      try {
        const user = await User.findById(userId).maxTimeMS(2500);
        if (user) {
          if (name) user.name = name;
          if (preferences) {
            user.preferences = {
              ...user.preferences.toObject(),
              ...preferences,
            };
          }
          await user.save();
          updatedUser = user;
        }
      } catch (dbErr) {
        console.warn('MongoDB Atlas profile update notice:', dbErr.message);
      }
    }

    // Update in local store
    const localUser = userStore.getUserById(userId) || userStore.getUserByEmail(req.user.email);
    if (localUser) {
      if (name) localUser.name = name;
      if (preferences) {
        localUser.preferences = {
          ...localUser.preferences,
          ...preferences,
        };
      }
      userStore.saveUser(localUser);
      if (!updatedUser) updatedUser = localUser;
    }

    const finalPreferences =
      updatedUser?.preferences || {
        ...req.user.preferences,
        ...preferences,
      };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name: name || updatedUser?.name || req.user.name,
        email: updatedUser?.email || req.user.email,
        role: updatedUser?.role || req.user.role,
        preferences: finalPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
