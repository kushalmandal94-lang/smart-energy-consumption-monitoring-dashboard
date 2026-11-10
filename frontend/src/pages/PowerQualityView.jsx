import React, { useState } from 'react';
import {
  Flame,
  Activity,
  Zap,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const PowerQualityView = () => {
  const [observations, setObservations] = useState([
    {
      id: 'OBS-01',
      date: 'Today, 14:32',
      auditor: 'Dr. Elena Rostova',
      building: 'Research & Development Center',
      text: 'Phase B current unbalance measured at 4.2% during heavy autoclave run. Verified within IEEE 519 compliance limit (<5%).',
      severity: 'Normal',
    },
    {
      id: 'OBS-02',
      date: 'Yesterday, 18:10',
      auditor: 'Dr. Elena Rostova',
      building: 'Main Facility',
      text: 'Capacitor bank stage 3 failed to step in when power factor dipped to 0.88. Recommend relay contact inspection.',
      severity: 'Warning',
    },
  ]);

  const [newObs, setNewObs] = useState('');
  const [obsBuilding, setObsBuilding] = useState('Main Facility');

  // Simulated 24-hr Power Factor & Voltage stability readings
  const qualityReadings = [
    { time: '00:00', powerFactor: 0.97, voltageA: 231.2, voltageB: 230.8, voltageC: 231.0, thdHarmonics: 3.1 },
    { time: '04:00', powerFactor: 0.98, voltageA: 232.0, voltageB: 231.5, voltageC: 231.8, thdHarmonics: 2.8 },
    { time: '08:00', powerFactor: 0.94, voltageA: 229.4, voltageB: 228.6, voltageC: 229.1, thdHarmonics: 4.2 },
    { time: '12:00', powerFactor: 0.91, voltageA: 227.8, voltageB: 226.9, voltageC: 227.5, thdHarmonics: 5.8 },
    { time: '14:00', powerFactor: 0.89, voltageA: 226.5, voltageB: 225.4, voltageC: 226.0, thdHarmonics: 6.4 },
    { time: '16:00', powerFactor: 0.92, voltageA: 228.1, voltageB: 227.5, voltageC: 227.9, thdHarmonics: 5.1 },
    { time: '20:00', powerFactor: 0.95, voltageA: 230.4, voltageB: 229.8, voltageC: 230.1, thdHarmonics: 3.9 },
    { time: '23:00', powerFactor: 0.97, voltageA: 231.5, voltageB: 231.0, voltageC: 231.2, thdHarmonics: 3.2 },
  ];

  const handleAddObservation = (e) => {
    e.preventDefault();
    if (!newObs.trim()) return;
    setObservations([
      {
        id: `OBS-${Math.floor(10 + Math.random() * 90)}`,
        date: 'Just now',
        auditor: 'Dr. Elena Rostova',
        building: obsBuilding,
        text: newObs.trim(),
        severity: 'Normal',
      },
      ...observations,
    ]);
    setNewObs('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <Flame className="w-6 h-6 text-amber-400" />
          <span>Power Quality, Harmonics & Grid Stability</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          In-depth electrical auditor telemetry: Power factor analysis, 3-phase voltage regulation, and harmonic distortion (THD).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Average Power Factor</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">0.95</div>
          <p className="text-[11px] text-slate-400 mt-1">Target ≥ 0.90 (Penalty-free)</p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Voltage Deviation</div>
          <div className="text-2xl font-black text-white mt-1">±1.4%</div>
          <p className="text-[11px] text-emerald-400 mt-1">Within ANSI C84.1 standard</p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Harmonics Distortion (THD-V)</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">4.2%</div>
          <p className="text-[11px] text-slate-400 mt-1">Below IEEE 519 5.0% threshold</p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Capacitor Bank Status</div>
          <div className="text-lg font-black text-emerald-400 mt-1">4/4 Stages Active</div>
          <p className="text-[11px] text-slate-400 mt-1">Automatic kVAR compensation</p>
        </div>
      </div>

      {/* Power Factor Trend Chart */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Power Factor Diurnal Profile</h2>
            <p className="text-xs text-slate-400">Values above 0.90 avoid utility reactive demand surcharges.</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 font-mono">
            Utility Penalty Limit: 0.90
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={qualityReadings} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0.8, 1.0]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="powerFactor" stroke="#10b981" fill="#10b981" fillOpacity={0.15} name="Power Factor (cos φ)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit Observations Section */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
          <FileCheck className="w-4 h-4 text-amber-400" />
          <span>Auditor Field Observations & Engineering Notes</span>
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Record on-site findings, infrared thermal scan results, and harmonic mitigation notes.
        </p>

        {/* Add Observation Form */}
        <form onSubmit={handleAddObservation} className="flex flex-col sm:flex-row gap-2 mb-4">
          <select
            value={obsBuilding}
            onChange={(e) => setObsBuilding(e.target.value)}
            className="bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="Main Facility">Main Facility</option>
            <option value="Research & Development Center">R&D Center</option>
            <option value="Logistics & Warehousing Hub">Logistics Hub</option>
            <option value="Manufacturing & Assembly Plant">Manufacturing Plant</option>
          </select>
          <input
            type="text"
            required
            value={newObs}
            onChange={(e) => setNewObs(e.target.value)}
            placeholder="Record harmonic anomaly, neutral current, or power quality observation..."
            className="flex-1 bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold rounded-xl text-xs transition"
          >
            Add Observation
          </button>
        </form>

        {/* Observations List */}
        <div className="space-y-2.5">
          {observations.map((obs) => (
            <div
              key={obs.id}
              className="bg-dark-950 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] font-bold text-amber-400">{obs.id}</span>
                  <span className="text-[10px] text-slate-500">• {obs.building} •</span>
                  <span className="text-[10px] text-slate-400">{obs.auditor} ({obs.date})</span>
                </div>
                <p className="text-slate-300 mt-1">{obs.text}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold self-start sm:self-center border ${
                  obs.severity === 'Warning'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {obs.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PowerQualityView;

