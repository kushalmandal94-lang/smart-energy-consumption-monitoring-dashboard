import React, { useState } from 'react';
import ConsumptionChart from '../components/ConsumptionChart';
import {
  Activity,
  Zap,
  TrendingUp,
  Download,
  ShieldCheck,
  Clock,
  Gauge,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsView = ({ chartData, activeRange, onRangeChange, currency = '$' }) => {
  const [downloadNotice, setDownloadNotice] = useState(false);

  const handleExportCSV = () => {
    // Generate CSV content from chartData
    const headers = ['Time', 'Power (kW)', 'Energy (kWh)', 'Cost'];
    const rows = chartData.map((d) => [
      d.time || d.label,
      d.powerKW || 0,
      d.energyKWh || 0,
      d.cost || 0,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `energy_telemetry_${activeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="energy-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Advanced Telemetry & Power Quality Analysis</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Harmonic distortion, voltage stability, and time-of-use demand profiles
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 px-3 py-2 bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>{downloadNotice ? 'Exported CSV!' : 'Export Telemetry CSV'}</span>
        </button>
      </div>

      {/* Main Historical Chart */}
      <ConsumptionChart
        data={chartData}
        activeRange={activeRange}
        onRangeChange={onRangeChange}
        currency={currency}
      />

      {/* Power Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="energy-card p-5 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Voltage Stability</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            231.2 <span className="text-xs font-normal text-slate-400">V RMS</span>
          </div>
          <p className="text-xs text-slate-400">
            Phase fluctuation is within IEEE 519 allowable tolerance (±1.8%).
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full w-[96%]"></div>
          </div>
        </div>

        <div className="energy-card p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Gauge className="w-4 h-4" />
            <span>Power Factor (cos φ)</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            0.96 <span className="text-xs font-normal text-slate-400">Lagging</span>
          </div>
          <p className="text-xs text-slate-400">
            High efficiency. No low power factor penalty surcharge applied by utility.
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[96%]"></div>
          </div>
        </div>

        <div className="energy-card p-5 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Peak Demand Hour</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            14:00 - 16:00 <span className="text-xs font-normal text-slate-400">Daily</span>
          </div>
          <p className="text-xs text-slate-400">
            Cooling loads reach crest during afternoon thermal peaks.
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full w-[78%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;

