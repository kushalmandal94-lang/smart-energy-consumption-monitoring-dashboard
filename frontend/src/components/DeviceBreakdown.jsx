import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899'];

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-dark-900 border border-slate-700 p-2.5 rounded-xl text-xs shadow-xl backdrop-blur-md">
        <p className="font-bold text-white mb-1">{data.name}</p>
        <p className="text-slate-300">
          Consumption: <span className="font-mono font-bold text-emerald-400">{data.consumptionKWh} kWh</span>
        </p>
        <p className="text-slate-300">
          Share: <span className="font-mono font-bold text-cyan-400">{data.percentage}%</span>
        </p>
        <p className="text-slate-300">
          Cost: <span className="font-mono font-bold text-amber-400">${data.cost}</span>
        </p>
      </div>
    );
  }
  return null;
};

const DeviceBreakdown = ({ breakdown = [], currency = '$' }) => {
  const totalKWh = breakdown.reduce((sum, item) => sum + (item.consumptionKWh || 0), 0);

  return (
    <div className="energy-card p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <PieChartIcon className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Load Distribution by Subsystem
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Total: {totalKWh.toFixed(0)} kWh
        </span>
      </div>

      {/* Donut Chart */}
      <div className="h-52 w-full relative my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdown}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="consumptionKWh"
            >
              {breakdown.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                  stroke="#0B0F19"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-400">Largest Load</span>
          <span className="text-sm font-bold text-white">
            {breakdown[0]?.percentage || 38}%
          </span>
          <span className="text-[10px] text-emerald-400 font-medium">
            {breakdown[0]?.name || 'HVAC'}
          </span>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-2 mt-1">
        {breakdown.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-dark-850/60 transition"
          >
            <div className="flex items-center space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color || COLORS[idx % COLORS.length] }}
              />
              <span className="text-slate-300 font-medium">{item.name}</span>
            </div>

            <div className="flex items-center space-x-3 font-mono">
              <span className="text-slate-400">{item.consumptionKWh} kWh</span>
              <span className="px-1.5 py-0.5 rounded bg-dark-950 text-slate-200 text-[11px] font-semibold border border-slate-800">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceBreakdown;

