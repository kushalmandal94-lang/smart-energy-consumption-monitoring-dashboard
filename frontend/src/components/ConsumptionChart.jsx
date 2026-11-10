import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, SunMedium, Zap, DollarSign } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[140px]">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-3">
            <span className="flex items-center space-x-1.5" style={{ color: entry.color }}>
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300">{entry.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">
              {entry.value} {entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ConsumptionChart = ({ data = [], activeRange = 'day', onRangeChange, currency = '$' }) => {
  const [chartType, setChartType] = useState('area'); // 'area' or 'bar'
  const [showSolar, setShowSolar] = useState(true);

  const ranges = [
    { id: 'day', label: '24 Hours' },
    { id: 'week', label: '7 Days' },
    { id: 'month', label: '30 Days' },
    { id: 'year', label: '12 Months' },
  ];

  return (
    <div className="energy-card p-5">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Energy Consumption & Generation Trend</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical load profiles and renewable solar generation offset
          </p>
        </div>

        {/* Range selectors & View Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pill tabs */}
          <div className="flex bg-dark-950 p-1 rounded-xl border border-slate-800 text-xs">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => onRangeChange(r.id)}
                className={`px-3 py-1 rounded-lg font-medium transition duration-150 ${
                  activeRange === r.id
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-dark-950 p-1 rounded-xl border border-slate-800 text-slate-400">
            <button
              onClick={() => setChartType('area')}
              title="Area Curve"
              className={`p-1.5 rounded-lg transition ${
                chartType === 'area'
                  ? 'bg-dark-800 text-emerald-400'
                  : 'hover:text-white'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Bar Chart"
              className={`p-1.5 rounded-lg transition ${
                chartType === 'bar'
                  ? 'bg-dark-800 text-emerald-400'
                  : 'hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
              />
              <Area
                type="monotone"
                dataKey={activeRange === 'day' ? 'powerKW' : 'energyKWh'}
                name={activeRange === 'day' ? 'Load Demand (kW)' : 'Consumption (kWh)'}
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorConsumption)"
                unit={activeRange === 'day' ? 'kW' : 'kWh'}
              />
              {showSolar && (
                <Area
                  type="monotone"
                  dataKey={activeRange === 'day' ? 'solarKW' : 'solarKWh'}
                  name="Solar Inverter Output"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSolar)"
                  unit={activeRange === 'day' ? 'kW' : 'kWh'}
                />
              )}
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
              />
              <Bar
                dataKey={activeRange === 'day' ? 'powerKW' : 'energyKWh'}
                name={activeRange === 'day' ? 'Power (kW)' : 'Energy (kWh)'}
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="cost"
                name={`Cost (${currency})`}
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConsumptionChart;

