import React, { useState } from 'react';
import AlertsList from '../components/AlertsList';
import { Bell, Filter, ShieldCheck } from 'lucide-react';

const AlertsView = ({ alerts = [], onResolveAlert }) => {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity =
      filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && !a.isResolved) ||
      (filterStatus === 'RESOLVED' && a.isResolved);
    return matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="energy-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Bell className="w-4 h-4 text-rose-400" />
            <span>Alarms & Protection Event Logs</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time notifications for threshold surges, voltage anomalies, and load faults
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-dark-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings Only</option>
            <option value="info">Info Only</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-dark-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Alarms</option>
            <option value="RESOLVED">Resolved History</option>
          </select>
        </div>
      </div>

      <AlertsList alerts={filteredAlerts} onResolveAlert={onResolveAlert} />
    </div>
  );
};

export default AlertsView;

