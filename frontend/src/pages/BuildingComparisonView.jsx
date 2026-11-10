import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  BarChart3,
  Flame,
  Leaf,
  DollarSign,
  Zap,
  TrendingUp,
  AlertTriangle,
  Award,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const BuildingComparisonView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('monthlyKWh'); // monthlyKWh, monthlyCost, carbonEmissionsKg, efficiencyScore

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await api.get('/buildings/performance/comparison');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch building comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  const metricConfig = {
    monthlyKWh: { label: 'Monthly Energy (kWh)', barColor: '#10B981', unit: 'kWh' },
    monthlyCost: { label: 'Monthly Cost ($)', barColor: '#06B6D4', unit: '$' },
    carbonEmissionsKg: { label: 'Carbon Emissions (kg CO₂)', barColor: '#F59E0B', unit: 'kg' },
    efficiencyScore: { label: 'Efficiency Score (0-100)', barColor: '#8B5CF6', unit: 'pts' },
  };

  const buildings = data?.buildings || [];
  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Multi-Building Performance Comparison</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comparative energy consumption rankings, cost analysis, carbon intensity, and building efficiency scoring.
          </p>
        </div>

        <button
          onClick={fetchComparison}
          className="p-2 bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition self-start sm:self-auto"
          title="Refresh comparison metrics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highest Consuming Alert Card */}
        <div className="bg-dark-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Highest Consuming</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Rank #1</span>
          </div>
          <div className="text-base font-black text-white mt-1 truncate">
            {summary.highestConsumingBuilding || 'Analyzing...'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Top demand driver in facility portfolio
          </p>
        </div>

        {/* Portfolio Total kWh */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Portfolio Monthly Energy</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white mt-1">
            {Number(summary.totalPortfolioMonthlyKWh || 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">kWh</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">
            Across {summary.totalBuildings || 0} monitored facilities
          </p>
        </div>

        {/* Portfolio Monthly Cost */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Monthly Expenditure</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-400 mt-1">
            ${Number(summary.totalPortfolioMonthlyCost || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Effective blended tariff: $0.15/kWh
          </p>
        </div>

        {/* Portfolio Average Efficiency */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Average Green Score</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-400 mt-1">
            {summary.portfolioAverageEfficiency || 86}/100
          </div>
          <p className="text-[11px] text-purple-400/80 mt-1">
            Portfolio Energy Star Benchmark
          </p>
        </div>
      </div>

      {/* Interactive Metric Comparison Bar Chart */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Facility Comparison by Metric
            </h2>
            <p className="text-xs text-slate-400">
              Select an attribute below to dynamically re-rank and evaluate facilities.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-dark-950 p-1 rounded-xl border border-slate-800 text-xs">
            {Object.keys(metricConfig).map((key) => (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeMetric === key
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-500 text-dark-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {metricConfig[key].label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buildings} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                unit={activeMetric === 'monthlyCost' ? '$' : ''}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val) => [`${Number(val).toLocaleString()} ${metricConfig[activeMetric].unit}`, metricConfig[activeMetric].label]}
              />
              <Bar
                dataKey={activeMetric}
                fill={metricConfig[activeMetric].barColor}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Building Comparison Table */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white">Full Comparative Matrix & Rankings</h2>
          <p className="text-xs text-slate-400 mt-0.5">Ranked from highest to lowest monthly consumption.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Building Name</th>
                <th className="py-3 px-4">Daily Usage</th>
                <th className="py-3 px-4">Monthly Energy</th>
                <th className="py-3 px-4">Monthly Cost</th>
                <th className="py-3 px-4">Carbon (CO₂)</th>
                <th className="py-3 px-4">Energy Intensity</th>
                <th className="py-3 px-4">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {buildings.map((b) => (
                <tr
                  key={b.code}
                  className={`hover:bg-dark-850/50 transition ${
                    b.isHighestConsuming ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-400">
                    #{b.rank}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span>{b.name}</span>
                      {b.isHighestConsuming && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/30">
                          Highest Load
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{b.code}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{b.dailyKWh} kWh</td>
                  <td className="py-3.5 px-4 font-bold text-white font-mono">
                    {Number(b.monthlyKWh).toLocaleString()} kWh
                  </td>
                  <td className="py-3.5 px-4 font-bold text-cyan-400 font-mono">
                    ${Number(b.monthlyCost).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">
                    {Number(b.carbonEmissionsKg).toLocaleString()} kg
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {b.energyIntensityKWhPerSqFt} kWh/ft²
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            b.efficiencyScore >= 85
                              ? 'bg-emerald-400'
                              : b.efficiencyScore >= 75
                              ? 'bg-cyan-400'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${b.efficiencyScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-white">{b.efficiencyScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BuildingComparisonView;

