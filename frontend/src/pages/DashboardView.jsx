import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import RealtimeGauge from '../components/RealtimeGauge';
import ConsumptionChart from '../components/ConsumptionChart';
import DeviceBreakdown from '../components/DeviceBreakdown';
import AlertsList from '../components/AlertsList';
import DeviceManager from '../components/DeviceManager';
import IoTSimulationWidget from '../components/IoTSimulationWidget';
import api from '../api/axios';
import {
  Zap,
  DollarSign,
  Activity,
  Leaf,
  Users,
  Building2,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Award,
  Clock,
  Wrench,
  Flame,
  ShieldAlert,
  Sun,
  Wind,
  CheckCircle2,
  Eye,
} from 'lucide-react';

const DashboardView = ({
  summary,
  chartData,
  activeRange,
  onRangeChange,
  breakdown,
  alerts,
  devices,
  livePulse,
  isLiveActive,
  onToggleLive,
  onResolveAlert,
  onToggleDevice,
  onAddDevice,
  onDeleteDevice,
  onNavigateTab,
}) => {
  const { user } = useAuth();
  const rawRole = user?.role || 'admin';
  const role = rawRole === 'operator' ? 'analyst' : rawRole === 'viewer' ? 'building_user' : rawRole;
  const currency = summary?.currency || '$';
  const assignedBuildings = (user?.assignedBuildings || ['Main Facility']).join(', ');

  const [sourcesBreakdown, setSourcesBreakdown] = useState(null);
  const [metersSummary, setMetersSummary] = useState(null);

  const fetchDashboardExtras = async () => {
    try {
      const [sbRes, mRes] = await Promise.all([
        api.get('/energy-sources/breakdown'),
        api.get('/meters'),
      ]);
      setSourcesBreakdown(sbRes.data?.data || null);
      setMetersSummary(mRes.data?.metrics || null);
    } catch (err) {
      console.warn('Dashboard auxiliary fetch notice:', err.message);
    }
  };

  useEffect(() => {
    fetchDashboardExtras();
  }, []);

  return (
    <div className="space-y-6">
      {/* IoT Simulation Engine Control & Status Banner */}
      <IoTSimulationWidget onPulse={fetchDashboardExtras} />

      {/* Role-Specific Dashboard Welcome Banners */}
      {role === 'admin' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-dark-900 to-dark-900 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  System Administrator Overview Console
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Full Authority
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full system privileges: 4 role tiers, 5 managed buildings, energy sources (Solar, Grid, Wind, Generator), and zero-trust audit logging active.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-300">
              System Health: <strong className="text-emerald-400">100% Operational</strong>
            </span>
          </div>
        </div>
      )}

      {role === 'manager' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-dark-900 to-dark-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Facility Manager Control Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Assigned Scope
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized Buildings: <strong className="text-emerald-400">{assignedBuildings}</strong> • Score: 91/100
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-dark-950 border border-slate-800 text-slate-300 self-start md:self-auto">
            Target: 420 kWh/day
          </span>
        </div>
      )}

      {role === 'analyst' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-dark-900 to-dark-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Energy Analyst Operations Console
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Engineering & Auditing
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-facility electrical audit: Power factor 0.95 (Optimal), Peak demand 48.2 kW, THD Harmonics 4.2%, and 4 Mandatory Reports ready.
              </p>
            </div>
          </div>
        </div>
      )}

      {role === 'building_user' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-dark-900 to-dark-900 border border-cyan-500/30 flex items-center justify-between text-xs text-slate-300 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Building User Workspace (Occupant Portal)</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Scoped strictly to assigned facility: <strong className="text-cyan-400">{assignedBuildings}</strong>. Real-time consumption & conservation tips.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
            Read-Only Scope
          </span>
        </div>
      )}

      {/* 4 Primary KPI Summary Cards tailored to role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {role === 'admin' ? (
          <>
            <StatCard
              title="System Users"
              value="4 Active"
              unit=""
              subtitle="1 Admin, 1 Mgr, 1 Op, 1 View"
              icon={Users}
              trend="+100%"
              trendPositive={true}
              color="purple"
            />
            <StatCard
              title="Managed Buildings"
              value="5"
              unit="Sites"
              subtitle="285,000 sq.ft Portfolio"
              icon={Building2}
              trend="Nominal"
              trendPositive={true}
              color="blue"
            />
            <StatCard
              title="Monitored IoT Devices"
              value="12 Total"
              unit=""
              subtitle="11 Online • 1 Maintenance"
              icon={Cpu}
              trend="91.6%"
              trendPositive={true}
              color="green"
            />
            <StatCard
              title="Monthly Consumption"
              value="26,500"
              unit="kWh"
              subtitle="Cost: $3,975.00"
              icon={Zap}
              trend="-4.2%"
              trendPositive={true}
              color="amber"
            />
          </>
        ) : role === 'manager' ? (
          <>
            <StatCard
              title="Assigned Buildings"
              value="2 Sites"
              unit=""
              subtitle="Main Facility + R&D"
              icon={Building2}
              trend="Active"
              trendPositive={true}
              color="green"
            />
            <StatCard
              title="Today's Electricity"
              value="388.4"
              unit="kWh"
              subtitle="Target: 420.0 kWh (-7.5%)"
              icon={Activity}
              trend="-7.5%"
              trendPositive={true}
              color="blue"
            />
            <StatCard
              title="Monthly Energy Cost"
              value={`$${summary?.estimatedMonthlyCost || '1,413.00'}`}
              unit=""
              subtitle="Budget: $1,800.00"
              icon={DollarSign}
              trend="-8.3%"
              trendPositive={true}
              color="amber"
            />
            <StatCard
              title="Efficiency Score"
              value="91 / 100"
              unit=""
              subtitle="2 Active Maintenance Tkts"
              icon={Award}
              trend="+3 pts"
              trendPositive={true}
              color="purple"
            />
          </>
        ) : role === 'operator' ? (
          <>
            <StatCard
              title="Total Demand"
              value={summary?.realtimePowerKW?.toFixed(2) || '14.65'}
              unit="kW"
              subtitle="Peak Demand: 48.2 kW"
              icon={Zap}
              trend="-2.4%"
              trendPositive={true}
              color="green"
            />
            <StatCard
              title="Power Factor"
              value="0.95"
              unit="cos φ"
              subtitle="Capacitor banks online"
              icon={Flame}
              trend="Optimal"
              trendPositive={true}
              color="amber"
            />
            <StatCard
              title="Carbon Emissions"
              value="7,700.5"
              unit="kg CO₂"
              subtitle="Factor: 0.385 kg/kWh"
              icon={Leaf}
              trend="-18.4%"
              trendPositive={true}
              color="purple"
            />
            <StatCard
              title="Audit Efficiency"
              value="88%"
              unit=""
              subtitle="4 Recommendations Ready"
              icon={Activity}
              trend="+5.1%"
              trendPositive={true}
              color="blue"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Real-Time Demand"
              value={summary?.realtimePowerKW?.toFixed(2) || '14.65'}
              unit="kW"
              subtitle="Instantaneous active load"
              icon={Zap}
              trend="-2.4%"
              trendPositive={true}
              color="green"
            />
            <StatCard
              title="Energy Today"
              value={summary?.todayKWh?.toFixed(1) || '84.4'}
              unit="kWh"
              subtitle={`Cost: ${currency}${summary?.todayCost || '12.66'}`}
              icon={Activity}
              trend="+5.1%"
              trendPositive={false}
              color="blue"
            />
            <StatCard
              title="Monthly Projection"
              value={`${currency}${summary?.estimatedMonthlyCost || '186.87'}`}
              unit=""
              subtitle={`Budget: ${currency}${summary?.monthlyBudget || '500'}`}
              icon={DollarSign}
              trend="-8.3%"
              trendPositive={true}
              color="amber"
            />
            <StatCard
              title="Carbon Footprint"
              value={summary?.carbonFootprintKg || '479.6'}
              unit="kg CO₂"
              subtitle="Green Efficiency Score: 92/100"
              icon={Leaf}
              trend="-11.2%"
              trendPositive={true}
              color="purple"
            />
          </>
        )}
      </div>

      {/* Row 2: Instantaneous Gauge + Consumption & Generation Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RealtimeGauge
            currentKW={summary?.realtimePowerKW || 14.65}
            peakKW={summary?.peakDemandKW || 22.8}
            livePulse={livePulse}
            isLiveActive={isLiveActive}
            onToggleLive={onToggleLive}
          />
        </div>

        <div className="lg:col-span-2">
          <ConsumptionChart
            data={chartData}
            activeRange={activeRange}
            onRangeChange={onRangeChange}
            currency={currency}
          />
        </div>
      </div>

      {/* Row 2.5: Energy Source Contribution & Meter Connectivity Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Source Contribution Breakdown */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Source Generation Share</h3>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {sourcesBreakdown?.renewableSharePercent || 31.3}% Clean Energy
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {sourcesBreakdown?.sourceBreakdown?.map((src) => (
              <div key={src.sourceType} className="space-y-1">
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span className="font-semibold flex items-center space-x-1">
                    <span>{src.sourceType}</span>
                    {src.category === 'renewable' && <span className="text-[9px] text-emerald-400 font-bold">🌿</span>}
                  </span>
                  <span className="font-mono text-slate-400">
                    {src.currentGenerationKW} kW ({src.sharePercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      src.sourceType === 'Solar'
                        ? 'bg-amber-400'
                        : src.sourceType === 'Wind'
                        ? 'bg-cyan-400'
                        : src.sourceType === 'Grid'
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, src.sharePercent || 25)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meter Connectivity Widget */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">IoT Meter Connectivity</h3>
            </div>
            <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
              5 Energy Meters
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-dark-950 p-3 rounded-xl border border-slate-800">
              <div className="text-2xl font-black text-emerald-400">{metersSummary?.onlineCount || 5}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Online & Streaming</div>
            </div>
            <div className="bg-dark-950 p-3 rounded-xl border border-slate-800">
              <div className="text-2xl font-black text-slate-500">{metersSummary?.offlineCount || 0}</div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Offline / Standby</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Instantaneous Feed:</span>
            <span className="font-mono font-bold text-emerald-400">
              {metersSummary?.totalInstantaneousKW || 147.3} kW
            </span>
          </div>
        </div>

        {/* Peak Demand & Efficiency Summary Card */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Peak Demand Spike Log</h3>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
              Max Today
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-white">
              64.8 <span className="text-sm font-normal text-slate-400">kW</span>
            </div>
            <div className="text-xs text-rose-400 font-semibold mt-1">
              Recorded at 14:35:00 during industrial shift overlap
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Utility Limit: 70.0 kW</span>
            <span className="text-emerald-400 font-semibold">5.2 kW Buffer</span>
          </div>
        </div>
      </div>

      {/* Row 3: Subsystem Breakdown & Live Alarms Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DeviceBreakdown breakdown={breakdown} currency={currency} />
        </div>

        <div className="lg:col-span-2">
          <AlertsList alerts={alerts} onResolveAlert={role === 'viewer' ? null : onResolveAlert} />
        </div>
      </div>

      {/* Row 4: Connected Smart Load Relays */}
      <div>
        <DeviceManager
          devices={devices}
          onToggleDevice={role === 'viewer' ? null : onToggleDevice}
          onAddDevice={role === 'viewer' ? null : onAddDevice}
          onDeleteDevice={role === 'admin' ? onDeleteDevice : null}
        />
      </div>
    </div>
  );
};

export default DashboardView;
