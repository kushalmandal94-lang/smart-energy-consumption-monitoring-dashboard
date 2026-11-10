import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Power,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sun,
  Moon,
  Info,
  Radio,
  Sliders,
  Zap,
} from 'lucide-react';

const LoadControlAndScheduling = ({
  loads = [],
  schedules = [],
  onToggleLoadStatus,
  onToggleSchedule,
  onOpenAddScheduleModal,
  onOpenEditScheduleModal,
  onOpenDeleteScheduleConfirm,
}) => {
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  const controllableLoads = loads.filter((l) => l.isControllable);

  const displayedSchedules = filterActiveOnly
    ? schedules.filter((s) => s.isEnabled)
    : schedules;

  return (
    <div className="space-y-6">
      {/* Simulation / Demo Mode Banner (Requirement 3) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-dark-900 to-dark-850 border border-cyan-500/30 flex items-start space-x-3 text-xs shadow-lg">
        <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shrink-0 mt-0.5">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-wide">
              DEMO / SIMULATION MODE ACTIVE
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
              Virtual Relay Bridge
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            All relay actuation commands, time-of-use scheduling sequences, and peak-hour load shedding are executed in real-time simulation. No physical high-voltage contactor is energized. The control architecture uses standardized REST payload contracts ready for direct <strong>MQTT / Modbus TCP</strong> industrial IoT integration.
          </p>
        </div>
      </div>

      {/* Grid: Left Column Quick Relay Switchboard, Right Column Operating Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Instantaneous Load Actuation Console */}
        <div className="energy-card p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Power className="w-4 h-4 text-emerald-400" />
                <span>Remote Relay Switchboard</span>
              </h4>
              <p className="text-[11px] text-slate-400">Controllable electrical sub-panels</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-900/60 px-2 py-0.5 rounded-md">
              {controllableLoads.filter((l) => l.status === 'ON').length} ON
            </span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {controllableLoads.map((load) => {
              const isOn = load.status === 'ON';
              return (
                <div
                  key={load._id || load.id}
                  className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2 ${
                    isOn
                      ? 'bg-dark-950/90 border-emerald-500/30 shadow-md shadow-emerald-950/20'
                      : 'bg-dark-950/40 border-slate-800/80 opacity-75'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-white text-xs truncate">
                      {load.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 font-mono">
                      <span>{load.type}</span>
                      <span>•</span>
                      <span className={isOn ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {load.currentPowerKW?.toFixed(1) || '0.0'} kW
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleLoadStatus(load._id || load.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                      isOn
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-dark-950 hover:brightness-110 shadow-sm shadow-emerald-500/30'
                        : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isOn ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Automated Operating Schedules & Peak-Hour Shedding */}
        <div className="energy-card p-5 space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Automated Operating Schedules & Peak Shedding</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Time-based load cycling to capture off-peak tariff savings and prevent surge penalties
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterActiveOnly(!filterActiveOnly)}
                className={`text-xs px-2.5 py-1.5 rounded-xl border transition ${
                  filterActiveOnly
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold'
                    : 'bg-dark-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {filterActiveOnly ? 'Active Only' : 'All Schedules'}
              </button>

              <button
                onClick={onOpenAddScheduleModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-dark-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Schedule</span>
              </button>
            </div>
          </div>

          {/* Schedule Cards Feed */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {displayedSchedules.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-400">No schedules configured</p>
                <p>Click "New Schedule" above to add time-based operating rules</p>
              </div>
            ) : (
              displayedSchedules.map((schedule) => {
                const isEnabled = schedule.isEnabled;
                const loadName = schedule.smartLoadId?.name || 'Assigned Smart Load';
                const loadCategory = schedule.smartLoadId?.type || 'General';

                return (
                  <div
                    key={schedule._id || schedule.id}
                    className={`p-4 rounded-xl border transition duration-150 ${
                      isEnabled
                        ? 'bg-dark-950/80 border-slate-800 hover:border-slate-700'
                        : 'bg-dark-950/30 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left Details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-bold text-white text-sm">
                            {schedule.name}
                          </span>
                          {schedule.peakHourShedding && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              ⚡ Peak Shedding
                            </span>
                          )}
                          <span
                            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              schedule.action === 'TURN_OFF'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {schedule.action || 'TURN_ON'}
                          </span>
                        </div>

                        {/* Associated Load */}
                        <div className="text-xs text-slate-400 flex items-center space-x-2">
                          <span className="text-cyan-400 font-semibold">{loadName}</span>
                          <span>•</span>
                          <span className="text-slate-500">{loadCategory}</span>
                        </div>

                        {/* Time & Days */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                          {/* Time window */}
                          <div className="flex items-center space-x-1.5 font-mono text-slate-200 bg-dark-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>

                          {/* Operating Days */}
                          <div className="flex items-center space-x-1">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                              const isDayActive = schedule.daysOfWeek?.includes(day);
                              return (
                                <span
                                  key={day}
                                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                    isDayActive
                                      ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                                      : 'bg-dark-900 text-slate-600'
                                  }`}
                                >
                                  {day}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {schedule.notes && (
                          <p className="text-[11px] text-slate-500 italic pt-1">
                            {schedule.notes}
                          </p>
                        )}
                      </div>

                      {/* Right Controls */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        {/* Enable/Disable Toggle */}
                        <button
                          onClick={() => onToggleSchedule(schedule._id || schedule.id)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition ${
                            isEnabled
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-dark-850 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </button>

                        {/* Edit Schedule */}
                        <button
                          onClick={() => onOpenEditScheduleModal(schedule)}
                          className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-800 text-slate-400 hover:text-white transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Schedule */}
                        <button
                          onClick={() => onOpenDeleteScheduleConfirm(schedule)}
                          className="p-2 rounded-xl bg-dark-850 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadControlAndScheduling;

