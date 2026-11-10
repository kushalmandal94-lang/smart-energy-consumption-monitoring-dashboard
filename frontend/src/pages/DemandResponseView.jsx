import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Clock,
  Zap,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  RefreshCw,
  Sliders,
  Cpu,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const DemandResponseView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDemandResponse = async () => {
    setLoading(true);
    try {
      const res = await api.get('/demand-response/analysis');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load demand response analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandResponse();
  }, []);

  const curve = data?.curve || [];
  const summary = data?.summary || {};
  const recommendations = data?.recommendations || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Clock className="w-6 h-6 text-amber-400" />
            <span>Demand Response & Peak Load Shifting</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated peak shaving analytics, flexible load scheduling, and tariff arbitrage optimization.
          </p>
        </div>

        <button
          onClick={fetchDemandResponse}
          className="p-2 bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition self-start sm:self-auto"
          title="Refresh Demand Response analysis"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Simulation Mode Clear Label Banner (Strict Requirement 8) */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-3 text-xs text-amber-300">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-amber-300">
            DEMO / SIMULATION MODE (Hardware In-Loop Ready)
          </div>
          <p className="text-amber-400/90 mt-0.5 leading-relaxed">
            All projected demand reductions and schedules represent thermodynamic and electrical simulations. Physical contactors and breaker actuators will remain unchanged until authorized IoT gateway integration is activated.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Critical Peak Window</div>
          <div className="text-lg font-black text-amber-400 mt-1">
            {summary.peakPeriodWindow || '13:00 – 18:00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Rate: {summary.peakTariffRate || '$0.28/kWh'}
          </p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Peak Demand Shaved</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {summary.maxPeakDemandReductionKW || 4.2} <span className="text-xs text-slate-400 font-normal">kW</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">
            -28.4% Peak Load Reduction
          </p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Projected Monthly Savings</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            ${summary.estimatedMonthlyCostSavings || 505.5}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tariff Arbitrage Delta
          </p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Carbon Emissions Avoided</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {summary.totalCo2AvoidedKg || 1062} <span className="text-xs text-slate-400 font-normal">kg CO₂</span>
          </div>
          <p className="text-[11px] text-cyan-400 mt-1">
            Avoided peaker-plant intensity
          </p>
        </div>
      </div>

      {/* Before vs After Load Curve Comparison Chart */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Baseline vs Demand-Response Shifted Load Curve</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                Peak Shaved
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Reduces stress on the municipal grid during critical afternoon hours by pre-cooling and shifting industrial pumps to off-peak slots.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span className="text-slate-300">Baseline Demand (kW)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">Optimized Demand (kW)</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" kW" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="baselineKW"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f43f5e' }}
                name="Baseline Demand (Unmanaged)"
              />
              <Line
                type="monotone"
                dataKey="optimizedKW"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10b981' }}
                name="Optimized Shifted Load"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Flexible Load Shifting Opportunities Cards */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-1">
          Identified Flexible Load Opportunities
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Non-critical thermal, pumping, and charging equipment that can be modulated during high-demand windows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-dark-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/30 transition shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {rec.id}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">
                    Save ${rec.monthlySavingsUSD}/mo
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-1.5">{rec.name}</h3>
                <p className="text-[11px] text-slate-400">{rec.building} • {rec.ratedPowerKW} kW</p>

                <div className="mt-3 space-y-2 text-[11px] bg-dark-900 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 font-medium">Current Window: </span>
                    <span className="text-rose-400">{rec.currentSchedule}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Recommended: </span>
                    <span className="text-emerald-400 font-semibold">{rec.recommendedSchedule}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                    Impact: {rec.comfortImpact}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-bold">-{rec.peakShavingKW} kW Peak</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                  {rec.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemandResponseView;

