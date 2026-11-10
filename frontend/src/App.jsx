import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './pages/DashboardView';
import AnalyticsView from './pages/AnalyticsView';
import DevicesView from './pages/DevicesView';
import AlertsView from './pages/AlertsView';
import TariffView from './pages/TariffView';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserManagementView from './pages/UserManagementView';
import BuildingsView from './pages/BuildingsView';
import BuildingComparisonView from './pages/BuildingComparisonView';
import ForecastingView from './pages/ForecastingView';
import MaintenanceView from './pages/MaintenanceView';
import SustainabilityView from './pages/SustainabilityView';
import ReportsView from './pages/ReportsView';
import AuditLogsView from './pages/AuditLogsView';
import DemandResponseView from './pages/DemandResponseView';
import PowerQualityView from './pages/PowerQualityView';
import AccessDeniedView from './pages/AccessDeniedView';
import EnergySourcesView from './pages/EnergySourcesView';
import ThresholdsView from './pages/ThresholdsView';
import SimulationView from './pages/SimulationView';
import api from './api/axios';

function App() {
  const { user, isAuthenticated, loading: authLoading, updatePreferences } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Application Data States
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [activeRange, setActiveRange] = useState('day');
  const [breakdown, setBreakdown] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [livePulse, setLivePulse] = useState(null);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(true);

  // Role-Based Allowed Tabs Matrix Aligned with 4 University Roles
  const roleAllowedTabs = {
    admin: [
      'dashboard',
      'users',
      'buildings',
      'energy-sources',
      'devices',
      'simulation',
      'thresholds',
      'live-dashboard',
      'analytics',
      'alerts',
      'tariff',
      'forecasting',
      'reports',
      'maintenance',
      'audit-logs',
      'settings',
      'building-comparison',
      'demand-response',
      'power-quality',
      'sustainability',
      'recommendations',
    ],
    manager: [
      'dashboard',
      'buildings',
      'energy-sources',
      'devices',
      'simulation',
      'thresholds',
      'live-dashboard',
      'analytics',
      'alerts',
      'maintenance',
      'reports',
      'recommendations',
      'building-comparison',
      'sustainability',
    ],
    analyst: [
      'dashboard',
      'forecasting',
      'analytics',
      'power-quality',
      'building-comparison',
      'demand-response',
      'sustainability',
      'reports',
      'alerts',
      'simulation',
      'recommendations',
      'devices',
    ],
    operator: [
      'dashboard',
      'forecasting',
      'analytics',
      'power-quality',
      'building-comparison',
      'demand-response',
      'sustainability',
      'reports',
      'alerts',
      'simulation',
      'recommendations',
      'devices',
    ],
    building_user: [
      'dashboard',
      'buildings',
      'analytics',
      'devices',
      'alerts',
      'sustainability',
    ],
    viewer: [
      'dashboard',
      'buildings',
      'analytics',
      'devices',
      'alerts',
      'sustainability',
    ],
  };

  const rawUserRole = user?.role || 'admin';
  const userRole = rawUserRole === 'operator' ? 'analyst' : rawUserRole === 'viewer' ? 'building_user' : rawUserRole;
  const allowedTabs = roleAllowedTabs[userRole] || roleAllowedTabs.admin;
  const isTabAllowed = allowedTabs.includes(activeTab);

  // Fetch summary & telemetry data
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsRefreshing(true);
    try {
      const [summaryRes, historyRes, breakdownRes, alertsRes, devicesRes] =
        await Promise.allSettled([
          api.get('/energy/summary'),
          api.get(`/energy/history?range=${activeRange}`),
          api.get('/energy/device-breakdown'),
          api.get('/alerts'),
          api.get('/devices'),
        ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data.data);
      if (historyRes.status === 'fulfilled') setChartData(historyRes.value.data.data);
      if (breakdownRes.status === 'fulfilled') setBreakdown(breakdownRes.value.data.data);
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data.data || []);
      if (devicesRes.status === 'fulfilled') setDevices(devicesRes.value.data.data || []);
    } catch (err) {
      console.warn('Data sync warning:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated, activeRange]);

  // Initial load when user logs in or changes history range
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Reset active tab if current tab is not allowed for updated user role
  useEffect(() => {
    if (isAuthenticated && !isTabAllowed) {
      setActiveTab('dashboard');
    }
  }, [userRole, isAuthenticated, isTabAllowed]);

  // Real-time live polling effect
  useEffect(() => {
    if (!isAuthenticated || !isLiveActive) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get('/energy/live');
        if (res.data?.data) {
          setLivePulse(res.data.data);
          setSummary((prev) =>
            prev ? { ...prev, realtimePowerKW: res.data.data.powerKW } : prev
          );
        }
      } catch (e) {
        // quiet fallback
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isLiveActive]);

  // Device actions
  const handleToggleDevice = async (id) => {
    try {
      const res = await api.patch(`/devices/${id}/toggle`);
      if (res.data?.data) {
        setDevices((prev) =>
          prev.map((d) => (d._id === id || d.id === id ? res.data.data : d))
        );
        fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle device:', err);
    }
  };

  const handleAddDevice = async (newDeviceData) => {
    try {
      const res = await api.post('/devices', newDeviceData);
      if (res.data?.data) {
        setDevices((prev) => [res.data.data, ...prev]);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add device:', err);
      throw err;
    }
  };

  const handleDeleteDevice = async (id) => {
    try {
      await api.delete(`/devices/${id}`);
      setDevices((prev) => prev.filter((d) => d._id !== id && d.id !== id));
      fetchData();
    } catch (err) {
      console.error('Failed to delete device:', err);
      throw err;
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      const res = await api.patch(`/alerts/${id}/resolve`);
      if (res.data?.data) {
        setAlerts((prev) =>
          prev.map((a) => (a._id === id ? { ...a, isResolved: true } : a))
        );
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const handleRangeChange = (range) => {
    setActiveRange(range);
  };

  const unreadAlerts = alerts.filter((a) => !a.isResolved).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 animate-pulse flex items-center justify-center">
          <span className="text-dark-950 font-black text-xl">⚡</span>
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Initializing VoltPulse RBAC Security & Energy Hub...
        </p>
      </div>
    );
  }

  // Not authenticated: Show Login or Register
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        unreadAlerts={unreadAlerts}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />

      {/* Main Workspace with Responsive Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadAlerts={unreadAlerts}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* RBAC Access Denied Fallback */}
          {!isTabAllowed ? (
            <AccessDeniedView
              attemptedTab={activeTab}
              onGoHome={() => setActiveTab('dashboard')}
            />
          ) : (
            <>
              {(activeTab === 'dashboard' || activeTab === 'live-dashboard') && (
                <DashboardView
                  summary={summary}
                  chartData={chartData}
                  activeRange={activeRange}
                  onRangeChange={handleRangeChange}
                  breakdown={breakdown}
                  alerts={alerts}
                  devices={devices}
                  livePulse={livePulse}
                  isLiveActive={isLiveActive}
                  onToggleLive={() => setIsLiveActive(!isLiveActive)}
                  onResolveAlert={handleResolveAlert}
                  onToggleDevice={handleToggleDevice}
                  onAddDevice={handleAddDevice}
                  onDeleteDevice={handleDeleteDevice}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'users' && <UserManagementView />}

              {activeTab === 'buildings' && (
                <BuildingsView
                  onNavigateComparison={() => setActiveTab('building-comparison')}
                />
              )}

              {activeTab === 'building-comparison' && <BuildingComparisonView />}

              {activeTab === 'devices' && <DevicesView />}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  chartData={chartData}
                  activeRange={activeRange}
                  onRangeChange={handleRangeChange}
                  currency={summary?.currency || '$'}
                />
              )}

              {activeTab === 'alerts' && (
                <AlertsView alerts={alerts} onResolveAlert={handleResolveAlert} />
              )}

              {activeTab === 'tariff' && (
                <TariffView
                  summary={summary}
                  onSavePreferences={updatePreferences}
                />
              )}

              {activeTab === 'forecasting' && <ForecastingView />}

              {activeTab === 'maintenance' && <MaintenanceView />}

              {(activeTab === 'sustainability' || activeTab === 'recommendations') && (
                <SustainabilityView />
              )}

              {activeTab === 'reports' && <ReportsView />}

              {activeTab === 'energy-sources' && <EnergySourcesView />}

              {activeTab === 'thresholds' && <ThresholdsView />}

              {activeTab === 'simulation' && <SimulationView />}

              {activeTab === 'audit-logs' && <AuditLogsView />}

              {activeTab === 'demand-response' && <DemandResponseView />}

              {activeTab === 'power-quality' && <PowerQualityView />}

              {activeTab === 'settings' && (
                <TariffView
                  summary={summary}
                  onSavePreferences={updatePreferences}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
