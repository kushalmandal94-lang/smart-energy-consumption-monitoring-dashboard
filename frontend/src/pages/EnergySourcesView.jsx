import React, { useState, useEffect } from 'react';
import {
  Sun,
  Zap,
  Wind,
  Flame,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  Leaf,
  BarChart2,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EnergySourcesView = () => {
  const { user } = useAuth();
  const [sources, setSources] = useState([]);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    sourceType: 'Solar',
    capacityKW: 50,
    building: 'All Buildings',
    fuelOrTechnology: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sourcesRes, breakdownRes] = await Promise.all([
        api.get('/energy-sources'),
        api.get('/energy-sources/breakdown'),
      ]);
      setSources(sourcesRes.data?.data || []);
      setBreakdown(breakdownRes.data?.data || null);
    } catch (err) {
      console.error('Error fetching energy sources:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!newSource.name || !newSource.capacityKW) return;

    try {
      setSubmitting(true);
      const res = await api.post('/energy-sources', newSource);
      setFeedback({ type: 'success', message: res.data?.message || 'Energy Source registered!' });
      setShowAddModal(false);
      setNewSource({
        name: '',
        sourceType: 'Solar',
        capacityKW: 50,
        building: 'All Buildings',
        fuelOrTechnology: '',
        status: 'active',
      });
      fetchData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to register source',
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDeleteSource = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove energy source '${name}'?`)) return;
    try {
      await api.delete(`/energy-sources/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete energy source');
    }
  };

  const getSourceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'solar':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'wind':
        return <Wind className="w-5 h-5 text-cyan-400" />;
      case 'generator':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'grid':
      default:
        return <Zap className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Energy Source Management</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              Solar • Grid • Wind • Generator
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Monitor source-wise instantaneous generation, daily supply, and renewable vs non-renewable share.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-dark-850 hover:bg-dark-800 border border-slate-800 rounded-xl text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register Energy Source</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Renewable vs Non-Renewable Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Renewable Energy Share</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">
                {breakdown?.renewableSharePercent || 31.3}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden flex">
            <div
              className="bg-emerald-400 h-full"
              style={{ width: `${breakdown?.renewableSharePercent || 31.3}%` }}
            ></div>
            <div
              className="bg-slate-600 h-full"
              style={{ width: `${breakdown?.nonRenewableSharePercent || 68.7}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2">
            <span>Renewable: {breakdown?.renewableTodayKWh || 279.8} kWh</span>
            <span>Non-Renewable: {breakdown?.nonRenewableTodayKWh || 615.4} kWh</span>
          </div>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Generation</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {breakdown?.totalCurrentGenerationKW || 165.3} <span className="text-sm font-normal text-slate-400">kW</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Instantaneous supply across all campus grid & clean energy assets.
          </p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Total Supply</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {breakdown?.totalTodayGenerationKWh || 895.2} <span className="text-sm font-normal text-slate-400">kWh</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Solar + Wind + Utility Grid cumulative day output.
          </p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Sources</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {sources.length} <span className="text-sm font-normal text-slate-400">Assets</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Solar PV, Utility Grid, Micro-Wind & Standby Diesel Gensets.
          </p>
        </div>
      </div>

      {/* Source Breakdown Table */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Source-wise Generation & Contribution</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time telemetry breakdown across energy source classes</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Energy Source</th>
                <th className="px-4 py-3">Type & Category</th>
                <th className="px-4 py-3">Assigned Facility</th>
                <th className="px-4 py-3">Rated Capacity</th>
                <th className="px-4 py-3">Current Power (kW)</th>
                <th className="px-4 py-3">Today Output (kWh)</th>
                <th className="px-4 py-3">Status</th>
                {canManage && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {sources.map((src) => (
                <tr key={src._id} className="hover:bg-dark-850 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-dark-950 border border-slate-800">
                        {getSourceIcon(src.sourceType)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{src.name}</div>
                        <div className="text-[11px] text-slate-400">{src.fuelOrTechnology}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-white">{src.sourceType}</span>
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase ${
                          src.category === 'renewable'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {src.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-300 font-medium">{src.building}</td>
                  <td className="px-4 py-4 font-mono font-semibold text-slate-200">{src.capacityKW} kW</td>
                  <td className="px-4 py-4 font-mono font-bold text-emerald-400">{src.currentGenerationKW} kW</td>
                  <td className="px-4 py-4 font-mono text-cyan-300 font-semibold">{src.todayGenerationKWh} kWh</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                        src.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : src.status === 'standby'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {src.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-4 text-right">
                      {src.sourceType !== 'Grid' && (
                        <button
                          onClick={() => handleDeleteSource(src._id, src.name)}
                          className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Energy Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-dark-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Register New Energy Source</h3>
            <p className="text-xs text-slate-400">
              Add Solar, Wind, Grid interconnect, or Backup Generator to monitor on campus.
            </p>

            <form onSubmit={handleAddSource} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Source Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. West Campus Rooftop Solar Array"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Source Type</label>
                  <select
                    value={newSource.sourceType}
                    onChange={(e) => setNewSource({ ...newSource, sourceType: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Solar">Solar (Renewable)</option>
                    <option value="Wind">Wind (Renewable)</option>
                    <option value="Grid">Utility Grid</option>
                    <option value="Generator">Backup Generator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Capacity (kW)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSource.capacityKW}
                    onChange={(e) => setNewSource({ ...newSource, capacityKW: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Facility</label>
                <input
                  type="text"
                  placeholder="e.g. Main Facility or All Buildings"
                  value={newSource.building}
                  onChange={(e) => setNewSource({ ...newSource, building: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Technology / Fuel Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Bifacial 500W PV Panels"
                  value={newSource.fuelOrTechnology}
                  onChange={(e) => setNewSource({ ...newSource, fuelOrTechnology: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-dark-850 hover:bg-dark-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  {submitting ? 'Registering...' : 'Register Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergySourcesView;

