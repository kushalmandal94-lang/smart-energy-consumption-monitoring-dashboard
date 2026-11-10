const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userStore = require('../utils/userStore');

// 1. Authentication Middleware
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_energy_dashboard_2026_change_in_production'
      );

      // Fetch user from DB if actively connected
      let user = null;
      if (mongoose.connection.readyState === 1) {
        try {
          user = await User.findById(decoded.id).select('-password').maxTimeMS(1500);
        } catch (dbErr) {
          user = null;
        }
      }

      if (!user) {
        // Look up in resilient local user registry
        const localUser = userStore.getUserById(decoded.id) || userStore.getUserByEmail(decoded.email);
        if (localUser) {
          user = {
            _id: localUser._id || localUser.id,
            id: localUser._id || localUser.id,
            name: localUser.name,
            email: localUser.email,
            role: localUser.role || 'manager',
            status: localUser.status || 'active',
            assignedBuildings: localUser.assignedBuildings || ['Main Facility'],
            department: localUser.department || 'Operations',
            phone: localUser.phone || '',
            preferences: localUser.preferences || {
              currency: '$',
              ratePerKWh: 0.15,
              monthlyBudgetLimit: 500,
              dailyTargetKWh: 100,
            },
          };
        } else {
          // Fallback constructed from JWT decoded payload
          user = {
            _id: decoded.id,
            id: decoded.id,
            name: decoded.name || 'Energy Operator',
            email: decoded.email || 'operator@energydashboard.io',
            role: decoded.role || 'manager',
            status: 'active',
            assignedBuildings: ['Main Facility'],
            department: 'Operations',
            phone: '',
            preferences: {
              currency: '$',
              ratePerKWh: 0.15,
              monthlyBudgetLimit: 500,
              dailyTargetKWh: 100,
            },
          };
        }
      }

      // Check if user account is deactivated
      if (user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Your account has been deactivated. Please contact your System Administrator.',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Authentication Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid or expired session token.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No authentication token provided.',
    });
  }
};

// 2. Role-Based Authorization Middleware
const normalizeRole = (r) => {
  if (r === 'operator') return 'analyst';
  if (r === 'viewer') return 'building_user';
  return r;
};

const authorize = (...roles) => {
  const normalizedAllowedRoles = roles.map(normalizeRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    const userNormalizedRole = normalizeRole(req.user.role);

    if (!roles.includes(req.user.role) && !normalizedAllowedRoles.includes(userNormalizedRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource. Required: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

// 3. Prevent Mutations for Read-Only Viewer / Building User Roles
const requireWriteAccess = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'viewer' || role === 'building_user') {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: The Viewer/Building User role has strictly read-only permissions and cannot create, modify, or delete records.',
    });
  }
  next();
};

// 4. Building-Level Access Restriction Middleware
const enforceBuildingAccess = (buildingField = 'building') => {
  return (req, res, next) => {
    if (!req.user) return next();

    const userRole = req.user.role;

    // Admin has unrestricted access to all buildings
    if (userRole === 'admin') return next();

    // Check if target building is specified in params, query, or body
    const targetBuilding =
      req.params[buildingField] ||
      req.query[buildingField] ||
      req.body[buildingField];

    // If no specific building requested, allow query through (controllers scope results automatically)
    if (!targetBuilding || targetBuilding === 'ALL' || targetBuilding === 'All Buildings') {
      return next();
    }

    const assigned = req.user.assignedBuildings || [];
    const hasAccess =
      assigned.includes('All Buildings') ||
      assigned.some((b) => b.toLowerCase() === targetBuilding.toLowerCase());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: You do not have permission to access building '${targetBuilding}'. Authorized buildings: [${assigned.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
  requireWriteAccess,
  enforceBuildingAccess,
};
