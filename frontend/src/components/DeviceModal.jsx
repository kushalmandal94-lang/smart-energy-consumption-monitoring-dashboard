import React, { useState, useEffect } from 'react';
import { X, Cpu, Plus, Edit2, AlertCircle } from 'lucide-react';

const DeviceModal = ({ isOpen, onClose, onSave, deviceToEdit = null }) => {
  const [formData, setFormData] = useState({
    deviceId: '',
    name: '',
    type: 'Smart Energy Meter',
    building: 'Headquarters Tower',
    location: 'Floor 1',
    powerRatingKW: 10.0,
    alertThresholdKW: 15.0,
    status: 'online',
    ipAddress: '192.168.1.100',
    installationDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [formError, setFormError] = useState('');

  const deviceTypes = [
    'Smart Energy Meter',
    'Sub-station Feeder',
    'CT Clamp Gateway',
    'Power Quality Analyzer',
    'Smart IoT Plug / Relay',
    'Solar Inverter Gateway',
    'HVAC Unit Controller',
    'Other Telemetry Gateway',
  ];

  const buildings = [
    'Headquarters Tower',
    'Technology Wing',
    'Manufacturing Plant',
    'Logistics Hub',
    'Data Center Facility',
    'Research Lab',
  ];

  useEffect(() => {
    if (deviceToEdit) {
      setFormData({
        deviceId: deviceToEdit.deviceId || '',
        name: deviceToEdit.name || '',
        type: deviceToEdit.type || 'Smart Energy Meter',
        building: deviceToEdit.building || 'Headquarters Tower',
        location: deviceToEdit.location || 'Floor 1',
        powerRatingKW: deviceToEdit.powerRatingKW || +(deviceToEdit.ratedPowerWatts / 1000).toFixed(1) || 10.0,
        alertThresholdKW: deviceToEdit.alertThresholdKW || 15.0,
        status: deviceToEdit.status || 'online',
        ipAddress: deviceToEdit.ipAddress || '192.168.1.100',
        installationDate: deviceToEdit.installationDate
          ? new Date(deviceToEdit.installationDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        notes: deviceToEdit.notes || '',
      });
    } else {
      setFormData({
        deviceId: `DEV-MTR-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        type: 'Smart Energy Meter',
        building: 'Headquarters Tower',
        location: 'Floor 1',
        powerRatingKW: 10.0,
        alertThresholdKW: 15.0,
        status: 'online',
        ipAddress: '192.168.1.100',
        installationDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setFormError('');
  }, [deviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter device name.');
      return;
    }
    if (!formData.deviceId.trim()) {
      setFormError('Please enter unique Device ID.');
      return;
    }
    if (!formData.powerRatingKW || Number(formData.powerRatingKW) <= 0) {
      setFormError('Power rating must be greater than 0 kW.');
      return;
    }

    onSave({
      ...formData,
      powerRatingKW: Number(formData.powerRatingKW),
      alertThresholdKW: Number(formData.alertThresholdKW) || +(Number(formData.powerRatingKW) * 1.25).toFixed(1),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {deviceToEdit ? 'Edit IoT Energy Meter' : 'Register New IoT Meter'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure physical or virtual power meter parameters
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Device ID <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!!deviceToEdit}
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                placeholder="e.g., MTR-HQ-01"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-emerald-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Device Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Central Chiller Plant Feeder"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Device Hardware Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {deviceTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Building Facility <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                list="building-suggestions"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="e.g., Headquarters Tower"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
              <datalist id="building-suggestions">
                {buildings.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Location / Floor / Room <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Roof Level Mech Room"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Power Rating (kW) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.powerRatingKW}
                onChange={(e) => setFormData({ ...formData, powerRatingKW: e.target.value })}
                placeholder="e.g., 25.0"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Alert Threshold (kW)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.alertThresholdKW}
                onChange={(e) => setFormData({ ...formData, alertThresholdKW: e.target.value })}
                placeholder="e.g., 30.0"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Connection Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="standby">Standby</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                IP Address
              </label>
              <input
                type="text"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                placeholder="192.168.1.100"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Installation Date
              </label>
              <input
                type="date"
                value={formData.installationDate}
                onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Technical Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Modbus ID 0x01, CT Ratio 400:5"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
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
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-dark-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
            >
              {deviceToEdit ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{deviceToEdit ? 'Save Changes' : 'Register Device'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceModal;

