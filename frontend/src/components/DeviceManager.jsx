import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Power,
  Trash2,
  Check,
  X,
  Sliders,
  Server,
  Zap,
} from 'lucide-react';

const DeviceManager = ({
  devices = [],
  onToggleDevice,
  onAddDevice,
  onDeleteDevice,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'HVAC',
    location: '',
    ratedPowerWatts: '',
    alertThresholdKW: '',
    ipAddress: '192.168.1.100',
  });
  const [formError, setFormError] = useState('');

  const deviceTypes = [
    'HVAC',
    'Lighting',
    'Refrigeration',
    'EV Charger',
    'Server Room',
    'Machinery',
    'Office Equipment',
    'Solar / Inverter',
    'Other',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDevice.name.trim() || !newDevice.ratedPowerWatts) {
      setFormError('Please enter device name and rated power.');
      return;
    }
    setFormError('');
    onAddDevice({
      ...newDevice,
      ratedPowerWatts: Number(newDevice.ratedPowerWatts),
      alertThresholdKW: Number(newDevice.alertThresholdKW) || 5.0,
    });
    setIsModalOpen(false);
    setNewDevice({
      name: '',
      type: 'HVAC',
      location: '',
      ratedPowerWatts: '',
      alertThresholdKW: '',
      ipAddress: '192.168.1.100',
    });
  };

  return (
    <div className="energy-card p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Monitored Loads & Smart Appliances</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry, relay states, and overload protection thresholds
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-dark-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Smart Device</span>
        </button>
      </div>

      {/* Device Table / Grid */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Device / Subsystem</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Demand (kW)</th>
              <th className="py-2.5 px-3">Daily (kWh)</th>
              <th className="py-2.5 px-3">Threshold</th>
              <th className="py-2.5 px-3 text-right">Relay Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {devices.map((device) => {
              const isOnline = device.status === 'online';
              return (
                <tr
                  key={device._id || device.id}
                  className="hover:bg-dark-850/50 transition duration-150"
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-white text-sm">
                      {device.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {device.ipAddress || '192.168.1.100'}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-dark-950 border border-slate-800 text-slate-300 font-medium">
                      {device.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {device.location || 'Facility'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isOnline
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                      <span>{device.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">
                    {device.currentPowerKW?.toFixed(2) || '0.00'} kW
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {device.dailyConsumptionKWh?.toFixed(1) || '0.0'} kWh
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-400/90 font-medium">
                    &lt; {device.alertThresholdKW || 5.0} kW
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onToggleDevice(device._id || device.id)}
                        title={isOnline ? 'Switch to Standby/Off' : 'Power On Device'}
                        className={`p-1.5 rounded-lg border transition ${
                          isOnline
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-dark-950 border-slate-800 text-slate-500 hover:text-white'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteDevice && (
                        <button
                          onClick={() => onDeleteDevice(device._id || device.id)}
                          title="Remove Device"
                          className="p-1.5 rounded-lg bg-dark-950 border border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-800/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Device Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Register Monitored Device</span>
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Central Heat Pump B"
                  value={newDevice.name}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, name: e.target.value })
                  }
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={newDevice.type}
                    onChange={(e) =>
                      setNewDevice({ ...newDevice, type: e.target.value })
                    }
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {deviceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Zone / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Roof East"
                    value={newDevice.location}
                    onChange={(e) =>
                      setNewDevice({ ...newDevice, location: e.target.value })
                    }
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Rated Power (Watts)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 5500"
                    value={newDevice.ratedPowerWatts}
                    onChange={(e) =>
                      setNewDevice({
                        ...newDevice,
                        ratedPowerWatts: e.target.value,
                      })
                    }
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Alert Threshold (kW)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 6.5"
                    value={newDevice.alertThresholdKW}
                    onChange={(e) =>
                      setNewDevice({
                        ...newDevice,
                        alertThresholdKW: e.target.value,
                      })
                    }
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-dark-850 hover:bg-dark-800 border border-slate-800 text-slate-300 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-dark-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  Save Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManager;

