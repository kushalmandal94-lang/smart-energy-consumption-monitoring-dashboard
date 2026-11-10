import React from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  Radio,
  WifiOff,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const STATUS_COLORS = {
  Online: '#10B981',
  Offline: '#EF4444',
  Standby: '#F59E0B',
  Maintenance: '#3B82F6',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-dark-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs">
        <p className="font-bold text-white mb-1">{data.name}</p>
        <p className="text-slate-300">
          Value: <span className="font-mono font-bold text-emerald-400">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const DevicePerformanceWidget = ({
  stats,
  devices = [],
  loads = [],
}) => {
  // Compute fallback stats if not loaded from API yet
  const totalDevices = stats?.totalDevices ?? devices.length;
  const onlineDevices = stats?.onlineDevices ?? devices.filter((d) => d.status === 'online').length;
  const offlineDevices = stats?.offlineDevices ?? devices.filter((d) => d.status === 'offline').length;
  const totalLoads = stats?.totalLoads ?? loads.length;
  const activeLoads = stats?.activeLoads ?? loads.filter((l) => l.status === 'ON').length;
  const totalConnectedLoadKW = stats?.totalConnectedLoadKW ?? +devices.reduce((acc, d) => acc + (d.powerRatingKW || 0), 0).toFixed(1);
  const communicationFailures = stats?.communicationFailures ?? offlineDevices;

  // Status donut data
  const statusData = stats?.statusDistribution || [
    { name: 'Online', value: onlineDevices, color: '#10B981' },
    { name: 'Offline', value: offlineDevices, color: '#EF4444' },
    { name: 'Standby', value: devices.filter((d) => d.status === 'standby').length, color: '#F59E0B' },
    { name: 'Maintenance', value: devices.filter((d) => d.status === 'maintenance').length, color: '#3B82F6' },
  ];

  // Load by category data
  const loadCategoryMap = {};
  loads.forEach((l) => {
    const cat = l.type || 'Other';
    if (!loadCategoryMap[cat]) loadCategoryMap[cat] = 0;
    if (l.status === 'ON') loadCategoryMap[cat] += l.currentPowerKW || 0;
  });

  const categoryData = Object.keys(loadCategoryMap).map((cat) => ({
    name: cat.length > 12 ? cat.substring(0, 10) + '..' : cat,
    fullName: cat,
    powerKW: +loadCategoryMap[cat].toFixed(1),
  }));

  return (
    <div className="space-y-5">
      {/* 6 Top KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Devices */}
        <div className="energy-card p-3.5 border-t-2 border-t-blue-500">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total IoT Meters</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1.5">
            {totalDevices}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Hardware endpoints</p>
        </div>

        {/* Online Devices */}
        <div className="energy-card p-3.5 border-t-2 border-t-emerald-500">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Online Meters</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1.5">
            {onlineDevices}
          </div>
          <p className="text-[11px] text-emerald-500/80 mt-0.5">
            {totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 100}% Operational
          </p>
        </div>

        {/* Offline Devices */}
        <div className="energy-card p-3.5 border-t-2 border-t-rose-500">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Offline Meters</span>
            <WifiOff className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1.5">
            {offlineDevices}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Requires inspection</p>
        </div>

        {/* Active Loads */}
        <div className="energy-card p-3.5 border-t-2 border-t-cyan-500">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Smart Loads</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1.5">
            {activeLoads} <span className="text-xs text-slate-500 font-sans">/ {totalLoads}</span>
          </div>
          <p className="text-[11px] text-cyan-400 mt-0.5">Relays energized</p>
        </div>

        {/* Total Connected Load */}
        <div className="energy-card p-3.5 border-t-2 border-t-amber-500">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Connected Load</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1.5">
            {totalConnectedLoadKW} <span className="text-xs text-slate-400 font-sans">kW</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Total capacity</p>
        </div>

        {/* Comm Failures */}
        <div className="energy-card p-3.5 border-t-2 border-t-purple-500">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Comm Failures</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1.5">
            {communicationFailures}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Ping timeouts</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Donut Chart: Device Status */}
        <div className="energy-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>IoT Device Status Health</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">{totalDevices} Units</span>
          </div>

          <div className="h-44 w-full relative my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || STATUS_COLORS[entry.name] || '#3B82F6'}
                      stroke="#0B0F19"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-white">
                {onlineDevices}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                Online
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
            {statusData.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between px-2 py-1 bg-dark-950/60 rounded-lg">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-300">{s.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Active Load Demand by Subsystem */}
        <div className="energy-card p-4 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active Demand by Electrical Subsystem</span>
              </h4>
              <p className="text-[11px] text-slate-400">Current instantaneous load demand in kW across energized smart loads</p>
            </div>
            <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-lg">
              {categoryData.reduce((acc, c) => acc + c.powerKW, 0).toFixed(1)} kW Live
            </span>
          </div>

          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  formatter={(val, name, item) => [`${val} kW`, item.payload.fullName]}
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Bar dataKey="powerKW" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicePerformanceWidget;

