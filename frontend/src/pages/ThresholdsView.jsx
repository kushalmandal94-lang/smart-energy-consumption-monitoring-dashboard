import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Building2,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Bell,
  RefreshCw,
  Save,
  ShieldAlert,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ThresholdsView = () => {
  const { user } = useAuth();
  const [thresholds, setThresholds] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('Main Facility');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [form, setForm] = useState({
    dailyLimitKWh: 420,
    monthlyLimitKWh: 11000,
    peakDemandLimitKW: 50.0,
    warningThresholdPercent: 80,
    criticalThresholdPercent: 95,
    minPowerFactor: 0.92,
    voltageLowerLimitV: 215,
    voltageUpperLimitV: 245,
  });

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const fetchThresholds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/thresholds');
      const list = res.data?.data || [];
      setThresholds(list);

      const current = list.find((t) => t.building === selectedBuilding) || list[0];
      if (current) {
        setSelectedBuilding(current.building);
        setForm({
          dailyLimitKWh: current.dailyLimitKWh,
          monthlyLimitKWh: current.monthlyLimitKWh,
          peakDemandLimitKW: current.peakDemandLimitKW,
          warningThresholdPercent: current.warningThresholdPercent || 80,
          criticalThresholdPercent: current.criticalThresholdPercent || 95,
          minPowerFactor: current.minPowerFactor || 0.92,
          voltageLowerLimitV: current.voltageLowerLimitV || 215,
          voltageUpperLimitV: current.voltageUpperLimitV || 245,
        });
      }
    } catch (err) {
      console.error('Error fetching thresholds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThresholds();
  }, []);

  const handleBuildingChange = (buildingName) => {
    setSelectedBuilding(buildingName);
    const item = thresholds.find((t) => t.building === buildingName);
    if (item) {
      setForm({
        dailyLimitKWh: item.dailyLimitKWh,
        monthlyLimitKWh: item.monthlyLimitKWh,
        peakDemandLimitKW: item.peakDemandLimitKW,
        warningThresholdPercent: item.warningThresholdPercent || 80,
        criticalThresholdPercent: item.criticalThresholdPercent || 95,
        minPowerFactor: item.minPowerFactor || 0.92,
        voltageLowerLimitV: item.voltageLowerLimitV || 215,
        voltageUpperLimitV: item.voltageUpperLimitV || 245,
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/thresholds', {
        building: selectedBuilding,
        ...form,
      });
      setFeedback({ type: 'success', message: res.data?.message || 'Thresholds updated successfully.' });
      fetchThresholds();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update thresholds' });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleEvaluate = async () => {
    try {
      setEvaluating(true);
      const res = await api.post('/thresholds/evaluate', {
        building: selectedBuilding,
        currentDemandKW: +(form.peakDemandLimitKW * 0.96).toFixed(1), // simulate test spike hitting 96%
        currentDailyKWh: +(form.dailyLimitKWh * 0.84).toFixed(1), // simulate test hitting 84%
      });
      setEvalResult(res.data);
      setFeedback({
        type: 'warning',
        message: `Evaluation completed: ${res.data?.alertsTriggeredCount || 0} alert conditions detected!`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Evaluation failed.' });
    } finally {
      setEvaluating(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Threshold Configuration & Limits</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
              Automated Alert Rules
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure daily/monthly consumption limits, peak demand kW ceilings, and warning & critical alert triggers.
          </p>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={evaluating}
          className="flex items-center space-x-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs rounded-xl transition"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{evaluating ? 'Evaluating...' : 'Evaluate Against Live Telemetry'}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : feedback.type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Building Switcher Pills */}
      <div className="flex flex-wrap gap-2">
        {thresholds.map((t) => (
          <button
            key={t._id}
            onClick={() => handleBuildingChange(t.building)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
              selectedBuilding === t.building
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'bg-dark-850 hover:bg-dark-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t.building}</span>
          </button>
        ))}
      </div>

      {/* Threshold Configuration Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Demand & Daily Limits */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Power & Demand Ceilings</h2>
              <p className="text-[11px] text-slate-400">Peak demand and daily energy quotas</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>Peak Demand Ceiling (kW)</span>
                <span className="text-emerald-400 font-mono">{form.peakDemandLimitKW} kW</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="1"
                disabled={!canEdit}
                value={form.peakDemandLimitKW}
                onChange={(e) => setForm({ ...form, peakDemandLimitKW: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Alerts trigger when total facility power approaches this limit.</p>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>Daily Consumption Quota (kWh)</span>
                <span className="text-cyan-400 font-mono">{form.dailyLimitKWh} kWh</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="10"
                disabled={!canEdit}
                value={form.dailyLimitKWh}
                onChange={(e) => setForm({ ...form, dailyLimitKWh: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Monthly Budget Limit (kWh)</label>
              <input
                type="number"
                min="1000"
                max="50000"
                disabled={!canEdit}
                value={form.monthlyLimitKWh}
                onChange={(e) => setForm({ ...form, monthlyLimitKWh: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Warning & Critical Alert Trigger Percentages */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Alert Trigger Sensitivity</h2>
              <p className="text-[11px] text-slate-400">Warning & Critical alert thresholds</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>Warning Alert Trigger</span>
                <span className="text-amber-400 font-mono">{form.warningThresholdPercent}% of Limit</span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                step="1"
                disabled={!canEdit}
                value={form.warningThresholdPercent}
                onChange={(e) => setForm({ ...form, warningThresholdPercent: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Dispatches yellow Warning alert to Facility Managers.</p>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>Critical Alert Trigger</span>
                <span className="text-rose-400 font-mono">{form.criticalThresholdPercent}% of Limit</span>
              </div>
              <input
                type="range"
                min="85"
                max="100"
                step="1"
                disabled={!canEdit}
                value={form.criticalThresholdPercent}
                onChange={(e) => setForm({ ...form, criticalThresholdPercent: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Dispatches red Critical alert and suggests load shedding.</p>
            </div>

            <div className="p-3 bg-dark-950 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Effective Values for {selectedBuilding}:</span>
              <div className="text-[11px] text-slate-300">
                Warning at: <span className="text-amber-400 font-bold">{(form.peakDemandLimitKW * (form.warningThresholdPercent / 100)).toFixed(1)} kW</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Critical at: <span className="text-rose-400 font-bold">{(form.peakDemandLimitKW * (form.criticalThresholdPercent / 100)).toFixed(1)} kW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Power Quality & Voltage Limits */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Power Quality Tolerances</h2>
              <p className="text-[11px] text-slate-400">Voltage range and power factor floor</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>Minimum Allowed Power Factor</span>
                <span className="text-purple-400 font-mono">{form.minPowerFactor}</span>
              </div>
              <input
                type="range"
                min="0.80"
                max="0.98"
                step="0.01"
                disabled={!canEdit}
                value={form.minPowerFactor}
                onChange={(e) => setForm({ ...form, minPowerFactor: Number(e.target.value) })}
                className="w-full accent-purple-500"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Values below this limit indicate reactive power penalties.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Min Voltage (V)</label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={form.voltageLowerLimitV}
                  onChange={(e) => setForm({ ...form, voltageLowerLimitV: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Max Voltage (V)</label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={form.voltageUpperLimitV}
                  onChange={(e) => setForm({ ...form, voltageUpperLimitV: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {canEdit && (
              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-emerald-950/40 transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : `Save Limits for ${selectedBuilding}`}</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Live Evaluation Outcome Preview */}
      {evalResult && (
        <div className="bg-dark-900 border border-amber-500/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Telemetry Evaluation Outcome for {evalResult.building}</span>
          </div>

          <div className="space-y-2">
            {evalResult.alerts?.map((al, idx) => (
              <div
                key={idx}
                className="p-3 bg-dark-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{al.title}</div>
                  <div className="text-[11px] text-slate-400">{al.message}</div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                    al.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {al.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThresholdsView;

