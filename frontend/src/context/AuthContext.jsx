import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Auth state on load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.warn('Failed to verify token on startup, resetting session');
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role = 'manager') => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, message: res.data.message || 'User registered successfully!' };
    } catch (err) {
      const firstValidationError = err.response?.data?.errors?.[0]?.message;
      const message =
        firstValidationError ||
        err.response?.data?.message ||
        'Registration failed. Please check your details and try again.';
      setError(message);
      return { success: false, message };
    }
  };

  // Demo auto-login helper for instant out-of-the-box exploration
  const loginAsDemo = async () => {
    // Attempt standard login first
    const res = await login('admin@energydashboard.io', 'Password123!');
    if (!res.success) {
      // Create local session directly if backend DB was not seeded yet
      const fallbackUser = {
        id: 'demo-user-101',
        name: 'Alex Rivera (Facility Lead)',
        email: 'admin@energydashboard.io',
        role: 'admin',
        preferences: {
          currency: '$',
          ratePerKWh: 0.15,
          monthlyBudgetLimit: 500,
          dailyTargetKWh: 120,
          alertNotifications: true,
        },
      };
      const mockToken = 'demo-jwt-token-smart-energy';
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      setUser(fallbackUser);
      return { success: true };
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Instant 1-Click Role Switcher for RBAC evaluation
  const switchRole = async (targetRole) => {
    const roleCredentials = {
      admin: { email: 'admin@energydashboard.io', password: 'Password123!' },
      manager: { email: 'manager@energydashboard.io', password: 'Password123!' },
      analyst: { email: 'analyst@energydashboard.io', password: 'Password123!' },
      operator: { email: 'analyst@energydashboard.io', password: 'Password123!' },
      building_user: { email: 'user@energydashboard.io', password: 'Password123!' },
      viewer: { email: 'user@energydashboard.io', password: 'Password123!' },
    };
    const creds = roleCredentials[targetRole];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      const res = await api.put('/auth/profile', { preferences });
      if (res.data?.user) {
        setUser((prev) => ({
          ...prev,
          preferences: res.data.user.preferences,
        }));
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update preferences',
      };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    error,
    login,
    register,
    loginAsDemo,
    logout,
    switchRole,
    updatePreferences,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

