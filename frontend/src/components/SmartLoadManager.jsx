import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  Filter,
  Layers,
  MapPin,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  Shield,
} from 'lucide-react';

const categoryBadges = {
  HVAC: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Lighting Systems': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  'Computers & IT': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Industrial Motors': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Water Pumps': 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  'Electric Vehicle Chargers': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Other Electrical Equipment': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

const SmartLoadManager = ({
  loads = [],
  devices = [],
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteConfirm,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadTypes = [
    'HVAC',
    'Lighting Systems',
    'Computers & IT',
    'Industrial Motors',
    'Water Pumps',
    'Electric Vehicle Chargers',
    'Other Electrical Equipment',
  ];

  // Filtering
  const filteredLoads = loads.filter((load) => {
    const matchesSearch =
      load.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.building?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || load.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || load.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="energy-card p-5 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Electrical Smart Loads & Subsystems</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Heavy mechanical, IT, and auxiliary loads mapped to monitoring hardware with power limits
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-dark-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Smart Load</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search load name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Category Type Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition"
          >
            <option value="ALL">All Categories ({loads.length})</option>
            {loadTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition"
          >
            <option value="ALL">All States (ON / OFF / Standby)</option>
            <option value="ON">ON Only</option>
            <option value="OFF">OFF Only</option>
            <option value="STANDBY">Standby</option>
            <option value="TRIPPED">Tripped Overload</option>
          </select>
        </div>
      </div>

      {/* Loads Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-dark-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5">Smart Load Name</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Building & Zone</th>
              <th className="py-3 px-3">Assigned Meter</th>
              <th className="py-3 px-3">Current Draw vs Max Limit</th>
              <th className="py-3 px-3">Relay State</th>
              <th className="py-3 px-3">Priority / Shedding</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-dark-900/40">
            {filteredLoads.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-500">
                  <Zap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-400">No smart loads found</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Click "Add Smart Load" above to register electrical loads</p>
                </td>
              </tr>
            ) : (
              filteredLoads.map((load) => {
                const isOn = load.status === 'ON';
                const isOff = load.status === 'OFF';
                const percent = Math.min(
                  100,
                  Math.round(((load.currentPowerKW || 0) / (load.maxLimitKW || 1)) * 100)
                );
                const badgeStyle = categoryBadges[load.type] || 'bg-slate-800 text-slate-300';

                return (
                  <tr
                    key={load._id || load.id}
                    className="hover:bg-dark-850/60 transition duration-150"
                  >
                    {/* Name */}
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-white text-sm">
                        {load.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Rated: <span className="text-slate-200 font-mono font-semibold">{load.ratedPowerKW} kW</span>
                        {!load.isControllable && (
                          <span className="ml-2 text-[10px] text-amber-400 font-semibold">
                            🔒 Non-Controllable
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md border font-medium text-[11px] ${badgeStyle}`}>
                        {load.type}
                      </span>
                    </td>

                    {/* Building & Zone */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">
                        {load.building}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{load.location}</span>
                      </div>
                    </td>

                    {/* Assigned Meter */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-cyan-400 text-xs font-semibold">
                        {load.deviceId?.deviceId || 'DEV-MTR'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        {load.deviceId?.name || 'Assigned Feeder'}
                      </div>
                    </td>

                    {/* Current vs Max Limit Bar */}
                    <td className="py-3 px-3 min-w-[160px]">
                      <div className="flex justify-between items-center text-xs font-mono mb-1">
                        <span className={`font-bold ${isOn ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {load.currentPowerKW?.toFixed(2) || '0.00'} kW
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Max: {load.maxLimitKW} kW
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percent > 90
                              ? 'bg-rose-500'
                              : percent > 75
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${isOn ? percent : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        {isOn ? `${percent}% of maximum threshold` : 'De-energized'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isOn
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isOff
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                        <span>{load.status}</span>
                      </span>
                    </td>

                    {/* Priority & Peak Shedding */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="capitalize text-slate-300 text-[11px] font-medium">
                          {load.priority || 'Normal'}
                        </span>
                        {load.peakHourShedding && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                            Peak-Shed
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Relay Toggle Switch */}
                        <button
                          onClick={() => onToggleStatus(load._id || load.id)}
                          disabled={!load.isControllable}
                          title={
                            !load.isControllable
                              ? 'Load is locked from remote actuation'
                              : isOn
                              ? 'Switch OFF (Simulated Relay)'
                              : 'Switch ON (Simulated Relay)'
                          }
                          className={`p-1.5 rounded-lg border transition ${
                            !load.isControllable
                              ? 'bg-dark-950 border-slate-800 text-slate-600 cursor-not-allowed'
                              : isOn
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-dark-950 border-slate-800 text-slate-500 hover:text-white'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Load */}
                        <button
                          onClick={() => onOpenEditModal(load)}
                          title="Edit Smart Load"
                          className="p-1.5 rounded-lg bg-dark-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Load */}
                        <button
                          onClick={() => onOpenDeleteConfirm(load)}
                          title="Delete Smart Load"
                          className="p-1.5 rounded-lg bg-dark-950 border border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-900 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SmartLoadManager;

