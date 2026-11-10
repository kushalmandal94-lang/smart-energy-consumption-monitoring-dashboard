import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Building2,
  Plus,
  MapPin,
  Cpu,
  Zap,
  Leaf,
  Sun,
  BarChart3,
  Edit2,
  Trash2,
  RefreshCw,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';

const BuildingsView = ({ onNavigateComparison }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isViewer = user?.role === 'viewer';

  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    totalAreaSqFt: 30000,
    floorCount: 4,
    capacity: 500,
    assignedManagers: ['Marcus Vance'],
    baselineDemandKW: 30.0,
    dailyTargetKWh: 300.0,
    monthlyBudgetLimit: 1500.0,
    solarCapacityKW: 15.0,
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/buildings');
      if (res.data?.data) {
        setBuildings(res.data.data);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to fetch buildings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleOpenCreate = () => {
    setEditingBuilding(null);
    setFormData({
      name: '',
      code: '',
      location: '',
      totalAreaSqFt: 30000,
      floorCount: 4,
      capacity: 500,
      assignedManagers: ['Marcus Vance'],
      baselineDemandKW: 30.0,
      dailyTargetKWh: 300.0,
      monthlyBudgetLimit: 1500.0,
      solarCapacityKW: 15.0,
    });
    setMsg({ type: '', text: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBuilding(b);
    setFormData({
      name: b.name,
      code: b.code,
      location: b.location,
      totalAreaSqFt: b.totalAreaSqFt,
      floorCount: b.floorCount || 4,
      capacity: b.capacity || 500,
      assignedManagers: b.assignedManagers || [],
      baselineDemandKW: b.baselineDemandKW,
      dailyTargetKWh: b.dailyTargetKWh,
      monthlyBudgetLimit: b.monthlyBudgetLimit,
      solarCapacityKW: b.solarCapacityKW,
    });
    setMsg({ type: '', text: '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBuilding) {
        await api.put(`/buildings/${editingBuilding._id || editingBuilding.name}`, formData);
        setMsg({ type: 'success', text: `Building '${formData.name}' updated successfully.` });
      } else {
        await api.post('/buildings', formData);
        setMsg({ type: 'success', text: `Building '${formData.name}' registered successfully.` });
      }
      setShowModal(false);
      fetchBuildings();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save building' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Are you sure you want to delete building '${b.name}'?`)) return;
    try {
      await api.delete(`/buildings/${b._id || b.name}`);
      setMsg({ type: 'success', text: `Building '${b.name}' deleted.` });
      fetchBuildings();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete building' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <span>Facility Buildings & Energy Infrastructure</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'manager'
              ? `Authorized scope for Facility Manager: ${buildings.map(b => b.name).join(', ')}`
              : 'Enterprise portfolio management, baseline power demands, and building efficiency ratings.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {onNavigateComparison && (
            <button
              onClick={onNavigateComparison}
              className="px-3.5 py-2 bg-dark-850 hover:bg-dark-800 text-slate-200 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs font-semibold transition"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Comparative Analytics</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold rounded-xl flex items-center space-x-1.5 transition text-xs shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Building</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {msg.text && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg({ type: '', text: '' })} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Read-Only Viewer Banner */}
      {isViewer && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-slate-500" />
          <span>Viewer Mode Active: Building records are displayed in read-only format. Modifications are restricted.</span>
        </div>
      )}

      {/* Building Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {buildings.map((b) => (
          <div
            key={b.name}
            className="bg-dark-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-950 text-cyan-400 border border-cyan-500/30">
                      {b.code}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      Score: {b.efficiencyScore}/100
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-2 tracking-tight">{b.name}</h3>
                </div>

                {isAdmin && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-dark-850 rounded-lg transition"
                      title="Edit Building"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-dark-850 rounded-lg transition"
                      title="Delete Building"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{b.location}</span>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 font-medium">Daily Target</div>
                  <div className="text-sm font-bold text-white mt-0.5">{b.dailyTargetKWh} kWh</div>
                </div>
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 font-medium">Monthly Cost</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">${b.monthlyCost || 1200}</div>
                </div>
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 font-medium">Base Demand</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{b.baselineDemandKW} kW</div>
                </div>
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 font-medium">Solar Capacity</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">{b.solarCapacityKW || 15} kWp</div>
                </div>
              </div>
            </div>

            {/* Footer Equipment Counts & Building Dimensions */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <Cpu className="w-3 h-3 text-slate-500" />
                  <span>{b.metersCount} Meters</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-slate-500" />
                  <span>{b.smartLoadsCount} Loads</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{b.floorCount || 4} Floors</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{b.capacity || 500} Cap</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{Number(b.totalAreaSqFt).toLocaleString()} sq.ft</span>
            </div>
          </div>
        ))}
      </div>

      {/* Building Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-dark-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">
              {editingBuilding ? `Edit ${editingBuilding.name}` : 'Register New Facility Building'}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Configure physical parameters, area, baseline electrical loads, and solar capacity.
            </p>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Building Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    disabled={!!editingBuilding}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Logistics Hub B"
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Building Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    disabled={!!editingBuilding}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="BLD-LOG-02"
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location / Campus Address</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="300 Logistics Pkwy, Austin, TX"
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Area (sq. ft)</label>
                  <input
                    type="number"
                    required
                    value={formData.totalAreaSqFt}
                    onChange={(e) => setFormData({ ...formData, totalAreaSqFt: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Base Demand (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.baselineDemandKW}
                    onChange={(e) => setFormData({ ...formData, baselineDemandKW: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Floor Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.floorCount}
                    onChange={(e) => setFormData({ ...formData, floorCount: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Occupant Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Daily Target (kWh)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.dailyTargetKWh}
                    onChange={(e) => setFormData({ ...formData, dailyTargetKWh: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Solar PV Capacity (kWp)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.solarCapacityKW}
                    onChange={(e) => setFormData({ ...formData, solarCapacityKW: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold rounded-xl transition"
                >
                  {saving ? 'Saving...' : editingBuilding ? 'Update Building' : 'Register Building'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingsView;

