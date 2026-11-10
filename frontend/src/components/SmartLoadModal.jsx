import React, { useState, useEffect } from 'react';
import { X, Zap, Plus, Edit2, AlertCircle } from 'lucide-react';

const SmartLoadModal = ({
  isOpen,
  onClose,
  onSave,
  loadToEdit = null,
  devices = [],
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'HVAC',
    deviceId: '',
    building: 'Headquarters Tower',
    location: 'Floor 1',
    ratedPowerKW: 10.0,
    maxLimitKW: 12.0,
    status: 'ON',
    isControllable: true,
    priority: 'normal',
    peakHourShedding: false,
    notes: '',
  });

  const [formError, setFormError] = useState('');

  const loadTypes = [
    'HVAC',
    'Lighting Systems',
    'Computers & IT',
    'Industrial Motors',
    'Water Pumps',
    'Electric Vehicle Chargers',
    'Other Electrical Equipment',
  ];

  useEffect(() => {
    if (loadToEdit) {
      setFormData({
        name: loadToEdit.name || '',
        type: loadToEdit.type || 'HVAC',
        deviceId: loadToEdit.deviceId?._id || loadToEdit.deviceId || (devices[0]?._id || ''),
        building: loadToEdit.building || 'Headquarters Tower',
        location: loadToEdit.location || 'Floor 1',
        ratedPowerKW: loadToEdit.ratedPowerKW || 10.0,
        maxLimitKW: loadToEdit.maxLimitKW || 12.0,
        status: loadToEdit.status || 'ON',
        isControllable: loadToEdit.isControllable !== undefined ? loadToEdit.isControllable : true,
        priority: loadToEdit.priority || 'normal',
        peakHourShedding: !!loadToEdit.peakHourShedding,
        notes: loadToEdit.notes || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'HVAC',
        deviceId: devices[0]?._id || '',
        building: devices[0]?.building || 'Headquarters Tower',
        location: 'Zone A',
        ratedPowerKW: 10.0,
        maxLimitKW: 12.0,
        status: 'ON',
        isControllable: true,
        priority: 'normal',
        peakHourShedding: false,
        notes: '',
      });
    }
    setFormError('');
  }, [loadToEdit, isOpen, devices]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter smart load name.');
      return;
    }
    if (!formData.deviceId) {
      setFormError('Please assign this load to a registered IoT device/meter.');
      return;
    }
    if (!formData.ratedPowerKW || Number(formData.ratedPowerKW) <= 0) {
      setFormError('Rated power must be positive.');
      return;
    }
    if (!formData.maxLimitKW || Number(formData.maxLimitKW) <= 0) {
      setFormError('Maximum power threshold limit must be positive.');
      return;
    }

    onSave({
      ...formData,
      ratedPowerKW: Number(formData.ratedPowerKW),
      maxLimitKW: Number(formData.maxLimitKW),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {loadToEdit ? 'Edit Electrical Smart Load' : 'Add New Smart Load'}
              </h3>
              <p className="text-xs text-slate-400">
                Map electrical load to monitoring meter and set consumption thresholds
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Load Equipment Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Rooftop Chiller Unit 1"
              className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Load Category <span className="text-cyan-400">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {loadTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Assign to IoT Meter <span className="text-cyan-400">*</span>
              </label>
              <select
                required
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Select IoT Meter --</option>
                {devices.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.deviceId} - {d.name} ({d.building})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Building Facility
              </label>
              <input
                type="text"
                required
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="Headquarters Tower"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Location / Room / Zone
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Mech Room Penthouse"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Rated Power (kW) <span className="text-cyan-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.ratedPowerKW}
                onChange={(e) => setFormData({ ...formData, ratedPowerKW: e.target.value })}
                placeholder="15.0"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Max Limit Threshold (kW) <span className="text-cyan-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.maxLimitKW}
                onChange={(e) => setFormData({ ...formData, maxLimitKW: e.target.value })}
                placeholder="18.0"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Initial Relay State
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ON">ON</option>
                <option value="OFF">OFF</option>
                <option value="STANDBY">Standby</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Load Shedding Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="normal">Normal</option>
                <option value="sheddable">Sheddable (Non-critical)</option>
                <option value="critical">Critical (Never Shed)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isControllable}
                  onChange={(e) => setFormData({ ...formData, isControllable: e.target.checked })}
                  className="rounded bg-dark-950 border-slate-800 text-cyan-500 focus:ring-0"
                />
                <span className="font-semibold text-xs">Allow Remote Actuation</span>
              </label>
            </div>
          </div>

          <div className="p-3 bg-dark-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Auto Peak-Hour Load Shedding</span>
              <span className="text-[11px] text-slate-400">
                Automatically de-energize or throttle during utility peak tariff hours (14:00 - 18:00)
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.peakHourShedding}
              onChange={(e) => setFormData({ ...formData, peakHourShedding: e.target.checked })}
              className="w-4 h-4 rounded bg-dark-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Notes & Equipment Specs
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g., Feeder Breaker CB-14, 3-Phase 415V"
              className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end space-x-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-850 hover:bg-dark-800 border border-slate-800 text-slate-300 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-dark-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center space-x-1.5"
            >
              {loadToEdit ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{loadToEdit ? 'Save Changes' : 'Create Smart Load'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmartLoadModal;

