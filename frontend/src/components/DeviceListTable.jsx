import React, { useState } from 'react';
import {
  Cpu,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Power,
  Wifi,
  WifiOff,
  Building,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Never';
  const diffSec = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const DeviceListTable = ({
  devices = [],
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteConfirm,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Extract unique building names for dynamic filter dropdown
  const uniqueBuildings = Array.from(
    new Set(devices.map((d) => d.building).filter(Boolean))
  );

  // Filter & Search logic
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBuilding =
      buildingFilter === 'ALL' || device.building === buildingFilter;

    const matchesStatus =
      statusFilter === 'ALL' || device.status === statusFilter;

    return matchesSearch && matchesBuilding && matchesStatus;
  });

  return (
    <div className="energy-card p-5 space-y-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>IoT Energy Meters & Telemetry Devices</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical CT meters, sub-station gateways, and edge monitors connected to VoltPulse
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-dark-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Device</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Device Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Building Filter */}
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="ALL">All Buildings ({devices.length})</option>
            {uniqueBuildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="online">Online Only</option>
            <option value="offline">Offline Only</option>
            <option value="standby">Standby</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Devices Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-dark-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5">Device ID & Name</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Building & Zone</th>
              <th className="py-3 px-3">Rating (kW)</th>
              <th className="py-3 px-3">Connection</th>
              <th className="py-3 px-3">Last Comm</th>
              <th className="py-3 px-3">Installed</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-dark-900/40">
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-500">
                  <Cpu className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-400">No IoT devices match your criteria</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Try clearing your search query or building filter</p>
                </td>
              </tr>
            ) : (
              filteredDevices.map((device) => {
                const isOnline = device.status === 'online';
                const isOffline = device.status === 'offline';
                const isStandby = device.status === 'standby';

                return (
                  <tr
                    key={device._id || device.id}
                    className="hover:bg-dark-850/60 transition duration-150"
                  >
                    {/* Device ID & Name */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                          {device.deviceId || 'DEV-MTR'}
                        </span>
                        <span className="font-bold text-white text-sm">
                          {device.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 pl-0.5">
                        IP: {device.ipAddress || '192.168.1.100'}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-dark-950 border border-slate-800 text-slate-300 font-medium">
                        {device.type}
                      </span>
                    </td>

                    {/* Building & Zone */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">
                        {device.building || 'Main Facility'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{device.location || 'Floor 1'}</span>
                      </div>
                    </td>

                    {/* Power Rating */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-200">
                        {device.powerRatingKW || +(device.ratedPowerWatts / 1000).toFixed(1) || 10.0} kW
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Threshold: &lt; {device.alertThresholdKW || 15} kW
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isOnline
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isOffline
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? 'bg-emerald-400 animate-pulse' : isOffline ? 'bg-rose-400' : 'bg-amber-400'
                          }`}
                        />
                        <span>{device.status}</span>
                      </span>
                    </td>

                    {/* Last Comm */}
                    <td className="py-3 px-3">
                      <div className="text-slate-300 font-mono flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{formatTimeAgo(device.lastCommunication)}</span>
                      </div>
                    </td>

                    {/* Installation Date */}
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {device.installationDate
                        ? new Date(device.installationDate).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '2025-01-15'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Status Toggle */}
                        <button
                          onClick={() => onToggleStatus(device._id || device.id)}
                          title={isOnline ? 'Simulate Disconnect' : 'Simulate Connect'}
                          className={`p-1.5 rounded-lg border transition ${
                            isOnline
                              ? 'bg-dark-950 border-slate-800 text-slate-400 hover:text-rose-400'
                              : 'bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onOpenEditModal(device)}
                          title="Edit Device"
                          className="p-1.5 rounded-lg bg-dark-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onOpenDeleteConfirm(device)}
                          title="Delete Device"
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

      <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
        <span>Showing {filteredDevices.length} of {devices.length} registered meters</span>
        <span className="font-mono">Real-time sampling rate: 10s</span>
      </div>
    </div>
  );
};

export default DeviceListTable;

