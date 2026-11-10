import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Edit2, AlertCircle, Clock } from 'lucide-react';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const LoadScheduleModal = ({
  isOpen,
  onClose,
  onSave,
  scheduleToEdit = null,
  loads = [],
}) => {
  const [formData, setFormData] = useState({
    name: '',
    smartLoadId: '',
    startTime: '08:00',
    endTime: '18:00',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    isEnabled: true,
    peakHourShedding: false,
    action: 'TURN_ON',
    notes: '',
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (scheduleToEdit) {
      setFormData({
        name: scheduleToEdit.name || '',
        smartLoadId: scheduleToEdit.smartLoadId?._id || scheduleToEdit.smartLoadId || (loads[0]?._id || ''),
        startTime: scheduleToEdit.startTime || '08:00',
        endTime: scheduleToEdit.endTime || '18:00',
        daysOfWeek: scheduleToEdit.daysOfWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        isEnabled: scheduleToEdit.isEnabled !== undefined ? scheduleToEdit.isEnabled : true,
        peakHourShedding: !!scheduleToEdit.peakHourShedding,
        action: scheduleToEdit.action || 'TURN_ON',
        notes: scheduleToEdit.notes || '',
      });
    } else {
      setFormData({
        name: '',
        smartLoadId: loads[0]?._id || '',
        startTime: '08:00',
        endTime: '18:00',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        isEnabled: true,
        peakHourShedding: false,
        action: 'TURN_ON',
        notes: '',
      });
    }
    setFormError('');
  }, [scheduleToEdit, isOpen, loads]);

  if (!isOpen) return null;

  const toggleDay = (day) => {
    if (formData.daysOfWeek.includes(day)) {
      if (formData.daysOfWeek.length === 1) {
        setFormError('At least one operating day must remain selected.');
        return;
      }
      setFormData({
        ...formData,
        daysOfWeek: formData.daysOfWeek.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        daysOfWeek: [...formData.daysOfWeek, day],
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter a schedule name.');
      return;
    }
    if (!formData.smartLoadId) {
      setFormError('Please select a target smart load.');
      return;
    }
    if (formData.daysOfWeek.length === 0) {
      setFormError('Please select at least one operating day.');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {scheduleToEdit ? 'Edit Operating Schedule' : 'Create Operating Schedule'}
              </h3>
              <p className="text-xs text-slate-400">
                Automate load power state by time-of-day and tariff windows
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
              Schedule Description / Name <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Weekday Office HVAC Comfort Cycle"
              className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Smart Load <span className="text-blue-400">*</span>
              </label>
              <select
                required
                value={formData.smartLoadId}
                onChange={(e) => setFormData({ ...formData, smartLoadId: e.target.value })}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Select Smart Load --</option>
                {loads.map((l) => (
                  <option key={l._id || l.id} value={l._id || l.id}>
                    {l.name} ({l.type} - {l.ratedPowerKW}kW)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Scheduled Action
              </label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="TURN_ON">TURN ON (Energize)</option>
                <option value="TURN_OFF">TURN OFF (Cut Power)</option>
                <option value="DIM_50">DIM / THROTTLE 50%</option>
                <option value="STANDBY">SWITCH TO STANDBY</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Time (24h)</span>
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>End Time (24h)</span>
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Operating Days Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Operating Days of Week
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((day) => {
                const selected = formData.daysOfWeek.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                      selected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-dark-950 text-slate-500 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-dark-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Peak-Hour Tariff Shedding</span>
              <span className="text-[11px] text-slate-400">
                Override schedule to turn OFF if running during peak tariff periods
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.peakHourShedding}
              onChange={(e) => setFormData({ ...formData, peakHourShedding: e.target.checked })}
              className="w-4 h-4 rounded bg-dark-900 border-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-dark-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Schedule Status</span>
              <span className="text-[11px] text-slate-400">
                Enable or temporarily disable this automation rule
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="w-4 h-4 rounded bg-dark-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Schedule Notes
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g., Saves ~18 kWh per week"
              className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-dark-950 font-bold rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center space-x-1.5"
            >
              {scheduleToEdit ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{scheduleToEdit ? 'Save Changes' : 'Create Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoadScheduleModal;

