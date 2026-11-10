import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Cpu,
  Zap,
  Activity,
  Bell,
  Calculator,
  TrendingUp,
  FileText,
  Wrench,
  ShieldCheck,
  Settings,
  Flame,
  Leaf,
  BarChart3,
  Clock,
  Lightbulb,
  Sun,
  Sliders,
  Radio,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, unreadAlerts = 0 }) => {
  const { user } = useAuth();
  const rawRole = user?.role || 'admin';
  const role = rawRole === 'operator' ? 'analyst' : rawRole === 'viewer' ? 'building_user' : rawRole;

  // Role-Specific Navigation Definitions aligned to University Requirements
  const navigationByRole = {
    admin: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'users', label: 'User Management', icon: Users, badge: 'RBAC', badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
      { id: 'buildings', label: 'Buildings (CRUD)', icon: Building2 },
      { id: 'energy-sources', label: 'Energy Sources', icon: Sun, badge: 'Eco', badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
      { id: 'devices', label: 'Meters & Smart Loads', icon: Cpu },
      { id: 'simulation', label: 'IoT Simulation Engine', icon: Radio, badge: 'Live', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
      { id: 'thresholds', label: 'Thresholds & Limits', icon: Sliders },
      { id: 'alerts', label: 'Alerts & Anomalies', icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : null, badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
      { id: 'analytics', label: 'Telemetry Trends', icon: Activity },
      { id: 'reports', label: '4 Mandatory Reports', icon: FileText, badge: 'Export', badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
      { id: 'tariff', label: 'Tariff & Cost Calculator', icon: Calculator },
      { id: 'forecasting', label: 'AI Forecasting', icon: TrendingUp },
      { id: 'maintenance', label: 'Maintenance Management', icon: Wrench },
      { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck, badge: 'Admin', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    ],
    manager: [
      { id: 'dashboard', label: 'Facility Dashboard', icon: LayoutDashboard },
      { id: 'buildings', label: 'Assigned Buildings', icon: Building2 },
      { id: 'energy-sources', label: 'Energy Sources', icon: Sun },
      { id: 'devices', label: 'Meters & Smart Loads', icon: Cpu },
      { id: 'simulation', label: 'IoT Telemetry Status', icon: Radio },
      { id: 'thresholds', label: 'Threshold Limits', icon: Sliders },
      { id: 'alerts', label: 'Alerts & Anomalies', icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : null, badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
      { id: 'analytics', label: 'Telemetry Trends', icon: Activity },
      { id: 'maintenance', label: 'Maintenance Requests', icon: Wrench },
      { id: 'reports', label: 'Energy Reports', icon: FileText },
    ],
    analyst: [
      { id: 'dashboard', label: 'Analyst Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Telemetry Trends', icon: Activity },
      { id: 'reports', label: '4 Mandatory Reports', icon: FileText, badge: 'PDF/CSV', badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
      { id: 'building-comparison', label: 'Building Comparison', icon: BarChart3 },
      { id: 'forecasting', label: 'Predictive Forecasting', icon: TrendingUp },
      { id: 'demand-response', label: 'Peak Demand Analysis', icon: Clock },
      { id: 'sustainability', label: 'Carbon & Renewables', icon: Leaf },
      { id: 'alerts', label: 'Anomaly History', icon: Bell },
      { id: 'simulation', label: 'IoT Simulation Feed', icon: Radio },
    ],
    building_user: [
      { id: 'dashboard', label: 'My Building Consumption', icon: LayoutDashboard },
      { id: 'buildings', label: 'Building Details', icon: Building2 },
      { id: 'analytics', label: 'My Energy Usage', icon: Activity },
      { id: 'alerts', label: 'Building Alerts', icon: Bell },
      { id: 'sustainability', label: 'Sustainability & Tips', icon: Leaf },
    ],
  };

  const menuItems = navigationByRole[role] || navigationByRole.admin;

  const roleTitles = {
    admin: 'Admin (Complete Access)',
    manager: 'Facility Manager',
    analyst: 'Energy Analyst',
    building_user: 'Building User (Assigned Facility)',
  };

  return (
    <aside className="w-full md:w-64 bg-dark-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-4rem)]">
        {/* Role Badge Indicator */}
        <div className="px-3 py-2 bg-dark-950/80 rounded-xl border border-slate-800/80">
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Active Role Workspace
          </p>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                role === 'admin'
                  ? 'bg-purple-400'
                  : role === 'manager'
                  ? 'bg-emerald-400'
                  : role === 'analyst' || role === 'operator'
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
            />
            <span className="text-xs font-semibold text-slate-200 truncate">
              {roleTitles[role] || 'System Administrator'}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Links */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Navigation Menu
          </p>
          <nav className="mt-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sustainability Mini-Footer Card */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-gradient-to-br from-dark-950 to-dark-850 border border-emerald-900/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <Leaf className="w-3.5 h-3.5" />
              <span>Green Factor</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">0.385 kg/kWh</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Solar avoidance: <strong className="text-slate-200">2,499 kg CO₂</strong> this month
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[84%]"></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Portfolio Target: 100</span>
            <span className="text-emerald-400 font-semibold">91 Score</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
