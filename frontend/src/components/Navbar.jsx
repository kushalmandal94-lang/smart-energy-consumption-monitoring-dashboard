import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  LogOut,
  RefreshCw,
  Activity,
  Building2,
  ChevronDown,
  Shield,
  ShieldCheck,
  UserCheck,
  Eye,
} from 'lucide-react';

const Navbar = ({ unreadAlerts = 0, onRefresh, isRefreshing = false }) => {
  const { user, logout, switchRole } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleChange = async (targetRole) => {
    setShowRoleMenu(false);
    setSwitching(true);
    await switchRole(targetRole);
    setSwitching(false);
    if (onRefresh) onRefresh();
  };

  const roleStyles = {
    admin: { label: 'Admin', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    manager: { label: 'Facility Manager', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    analyst: { label: 'Energy Analyst', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    operator: { label: 'Energy Analyst', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    building_user: { label: 'Building User', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    viewer: { label: 'Building User', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  };

  const currentRoleStyle = roleStyles[user?.role] || roleStyles.admin;
  const assignedBuildings = user?.assignedBuildings || ['Main Facility'];
  const displayBuildings =
    assignedBuildings.includes('All Buildings')
      ? 'All Buildings'
      : assignedBuildings.join(', ');

  return (
    <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-dark-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black tracking-tight text-white">
                VoltPulse
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full tracking-wider">
                RBAC LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Smart Energy & IoT Load Monitor
            </p>
          </div>
        </div>

        {/* Center: Live Grid Telemetry & Assigned Building Scope */}
        <div className="hidden lg:flex items-center space-x-4 text-xs text-slate-300 bg-dark-950/70 border border-slate-800/80 rounded-full px-4 py-1.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-400">Grid:</span>
            <span className="font-semibold text-emerald-400">50.02 Hz Nominal</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Scope:</span>
            <span className="font-semibold text-cyan-300 max-w-[200px] truncate" title={displayBuildings}>
              {displayBuildings}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-slate-300">
              {currentTime.toLocaleTimeString([], { hour12: false })}
            </span>
          </div>
        </div>

        {/* Right: Quick Role Switcher, Refresh & Profile */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Role Switcher Pill for instant demonstration */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              disabled={switching}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${currentRoleStyle.color} hover:brightness-110 shadow-sm`}
              title="Click to switch role and test RBAC permissions"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentRoleStyle.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-dark-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 text-xs">
                <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1">
                  Switch Active Role (RBAC Demo)
                </p>

                <button
                  onClick={() => handleRoleChange('admin')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-dark-850 flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-semibold text-slate-200">1. Admin</div>
                      <div className="text-[10px] text-slate-500">Complete access to all modules</div>
                    </div>
                  </div>
                  {user?.role === 'admin' && <span className="text-purple-400 font-bold">✓</span>}
                </button>

                <button
                  onClick={() => handleRoleChange('manager')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-dark-850 flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-slate-200">2. Facility Manager</div>
                      <div className="text-[10px] text-slate-500">Assigned facilities, loads & devices</div>
                    </div>
                  </div>
                  {user?.role === 'manager' && <span className="text-emerald-400 font-bold">✓</span>}
                </button>

                <button
                  onClick={() => handleRoleChange('analyst')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-dark-850 flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold text-slate-200">3. Energy Analyst</div>
                      <div className="text-[10px] text-slate-500">Analytics, forecasting & reports</div>
                    </div>
                  </div>
                  {(user?.role === 'analyst' || user?.role === 'operator') && <span className="text-amber-400 font-bold">✓</span>}
                </button>

                <button
                  onClick={() => handleRoleChange('building_user')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-dark-850 flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-semibold text-slate-200">4. Building User</div>
                      <div className="text-[10px] text-slate-500">Assigned building consumption only</div>
                    </div>
                  </div>
                  {(user?.role === 'building_user' || user?.role === 'viewer') && <span className="text-cyan-400 font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh active telemetry"
            className="p-2 text-slate-400 hover:text-white bg-dark-850 hover:bg-dark-800 border border-slate-800 rounded-xl transition duration-150"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* User Account Capsule */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-200 truncate max-w-[150px]">
                {user?.name || 'VoltPulse Lead'}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                {user?.email || 'user@voltenergy.io'}
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 bg-dark-850 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-800/40 rounded-xl transition duration-150"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
