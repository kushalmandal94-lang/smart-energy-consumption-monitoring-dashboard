import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Lock,
  User,
  Clock,
  Globe,
  FileCode,
  AlertTriangle,
} from 'lucide-react';

const AuditLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.allSettled([
        api.get('/audit-logs', {
          params: { search, action: actionFilter, role: roleFilter },
        }),
        api.get('/audit-logs/stats'),
      ]);

      if (logsRes.status === 'fulfilled' && logsRes.value.data?.data) {
        setLogs(logsRes.value.data.data.logs || []);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.data?.data) {
        setStats(statsRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuditLogs();
  };

  const actionBadgeColor = (action) => {
    if (action.includes('DELETED') || action.includes('DEACTIVATED')) {
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
    if (action.includes('CREATED') || action.includes('INITIALIZATION') || action.includes('ACTIVATED')) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('UPDATED') || action.includes('LOAD_SCHEDULE')) {
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
    return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <span>Activity & Security Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System Administrator security ledger logging user actions, role changes, building modifications, and command dispatches.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="p-2 bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition self-start sm:self-auto"
          title="Refresh audit logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Total Audit Events</div>
          <div className="text-2xl font-black text-white mt-1">
            {stats?.totalLoggedEvents || logs.length}
          </div>
          <p className="text-[11px] text-purple-400 mt-1 font-semibold">Active Rolling Ledger</p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Security Critical Events</div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {stats?.securityAlertsCount || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Deletions & Deactivations</p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Compliance Retention Policy</div>
          <div className="text-lg font-black text-emerald-400 mt-1">
            90-Day Standard
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tamper-Evident Records</p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Authorization Protocol</div>
          <div className="text-lg font-black text-cyan-400 mt-1">
            Server-Side RBAC
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero-Trust Token Enforced</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, user, building, or entity..."
            className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </form>

        <div className="flex items-center space-x-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Actions</option>
            <option value="USER_CREATED">User Created</option>
            <option value="USER_UPDATED">User Updated</option>
            <option value="USER_DEACTIVATED">User Deactivated</option>
            <option value="BUILDING_CREATED">Building Created</option>
            <option value="LOAD_SCHEDULE_UPDATED">Load Schedule Updated</option>
            <option value="MAINTENANCE_TICKET_CREATED">Maintenance Created</option>
            <option value="REPORT_GENERATED">Report Generated</option>
            <option value="REPORT_EXPORTED">Report Exported</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="operator">Operator</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Building Scope</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((log, i) => (
                <tr key={log._id || i} className="hover:bg-dark-850/50 transition">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${actionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-semibold font-sans">{log.userName}</td>
                  <td className="py-3 px-4">
                    <span className="capitalize px-1.5 py-0.2 rounded text-[10px] bg-dark-950 text-slate-300 border border-slate-800">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300">{log.building || 'Global'}</td>
                  <td className="py-3 px-4 font-sans text-slate-400 max-w-xs truncate" title={JSON.stringify(log.details)}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-left text-purple-400 hover:underline truncate max-w-xs block font-mono text-[10px]"
                    >
                      {JSON.stringify(log.details)}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 font-sans">
                    No audit logs match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-1">
              Audit Event Details: {selectedLog.action}
            </h2>
            <p className="text-xs text-slate-400 mb-4">{new Date(selectedLog.timestamp).toISOString()}</p>

            <div className="bg-dark-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-60">
              <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-dark-850 hover:bg-dark-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsView;

