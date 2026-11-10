import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle,
  ShieldAlert,
  Edit2,
  Trash2,
  Activity,
  Cpu,
  RefreshCw,
} from 'lucide-react';

const MaintenanceView = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isViewer = user?.role === 'viewer';
  const canManageTickets = isAdmin || isManager || user?.role === 'operator';

  const [tickets, setTickets] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    building: 'Main Facility',
    problemDescription: '',
    priority: 'medium',
    assignedTechnician: 'Carlos Mendez (Senior Electrician)',
    dueDate: '',
  });

  const [statusFormData, setStatusFormData] = useState({
    status: 'Open',
    assignedTechnician: '',
    resolutionNotes: '',
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, diagRes] = await Promise.allSettled([
        api.get('/maintenance/tickets', {
          params: { status: statusFilter, priority: priorityFilter, search },
        }),
        api.get('/maintenance/diagnostics'),
      ]);

      if (ticketsRes.status === 'fulfilled' && ticketsRes.value.data?.data) {
        setTickets(ticketsRes.value.data.data);
      }
      if (diagRes.status === 'fulfilled' && diagRes.value.data?.data) {
        setDiagnostics(diagRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter]);

  const handleOpenCreate = () => {
    setFormData({
      deviceId: 'DEV-MTR-102',
      deviceName: 'Substation Transformer Feeder',
      building: 'Main Facility',
      problemDescription: '',
      priority: 'medium',
      assignedTechnician: 'Carlos Mendez (Senior Electrician)',
      dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    });
    setMsg({ type: '', text: '' });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTicket(t);
    setStatusFormData({
      status: t.status || 'Open',
      assignedTechnician: t.assignedTechnician || '',
      resolutionNotes: t.resolutionNotes || '',
    });
    setMsg({ type: '', text: '' });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/maintenance/tickets', formData);
      setMsg({ type: 'success', text: 'Maintenance ticket created successfully.' });
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create ticket' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!editingTicket) return;
    setSaving(true);
    try {
      await api.put(`/maintenance/tickets/${editingTicket.ticketId}`, statusFormData);
      setMsg({ type: 'success', text: `Ticket '${editingTicket.ticketId}' updated.` });
      setEditingTicket(null);
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update ticket' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete ticket ${t.ticketId}?`)) return;
    try {
      await api.delete(`/maintenance/tickets/${t.ticketId}`);
      setMsg({ type: 'success', text: `Ticket '${t.ticketId}' removed.` });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete ticket' });
    }
  };

  const priorityColor = (p) => {
    switch (p) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const statusColor = (s) => {
    switch (s) {
      case 'Resolved':
      case 'Closed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'In Progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Assigned':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Wrench className="w-6 h-6 text-emerald-400" />
            <span>Predictive Maintenance & Work Orders</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time IoT equipment diagnostics, pre-fault condition monitoring, and maintenance ticket tracking.
          </p>
        </div>

        {canManageTickets && !isViewer && (
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-dark-950 font-bold rounded-xl flex items-center space-x-1.5 transition text-xs shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        )}
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

      {/* Read-Only Viewer Alert */}
      {isViewer && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-slate-500" />
          <span>Viewer Mode Active: Maintenance records and diagnostics are read-only. Modification controls are disabled.</span>
        </div>
      )}

      {/* SECTION 1: Predictive Maintenance Diagnostic Findings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Predictive Equipment Health Scanner (IoT Pre-Fault Analysis)</span>
          </h2>
          <span className="text-[10px] text-slate-400">
            Health Index: <strong className="text-emerald-400">{diagnostics?.stats?.equipmentHealthScore || 89}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(diagnostics?.findings || []).map((f, i) => (
            <div
              key={i}
              className={`bg-dark-900 border rounded-2xl p-4 shadow-lg flex flex-col justify-between ${
                f.riskLevel.includes('Critical')
                  ? 'border-rose-500/30'
                  : f.riskLevel.includes('High')
                  ? 'border-amber-500/30'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {f.deviceId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      f.riskLevel.includes('Critical')
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : f.riskLevel.includes('High')
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {f.riskLevel}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{f.deviceName}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{f.building}</p>

                {/* Clear distinction between warning vs confirmed hardware fault */}
                <div className="mt-2.5 p-2 rounded-xl bg-dark-950 border border-slate-800/80 text-[11px]">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-300">
                    <span className={f.isHardwareFault ? 'text-rose-400' : 'text-amber-400'}>●</span>
                    <span>{f.classification}</span>
                  </div>
                  <p className="text-slate-400 mt-1 leading-relaxed">{f.anomalyDetail}</p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Action: <strong className="text-slate-300">{f.actionRecommendation}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Maintenance Work Orders Table */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-6">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Active Maintenance Tickets & Work Orders</h2>
            <p className="text-xs text-slate-400">Track assigned technicians, resolution notes, and SLA deadlines.</p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-dark-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Target Device & Building</th>
                <th className="py-3 px-4">Problem Description</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tickets.map((t) => (
                <tr key={t.ticketId} className="hover:bg-dark-850/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {t.ticketId}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{t.deviceName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{t.deviceId} • {t.building}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="line-clamp-2 text-slate-300">{t.problemDescription}</div>
                    {t.resolutionNotes && (
                      <div className="text-[10px] text-emerald-400 mt-0.5 line-clamp-1">
                        Note: {t.resolutionNotes}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${priorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{t.assignedTechnician}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {!isViewer && (
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-dark-850 rounded-lg transition"
                          title="Update Status / Resolution Notes"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(t)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-dark-850 rounded-lg transition"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-dark-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Create Maintenance Work Order</h2>
            <p className="text-xs text-slate-400 mb-4">
              Dispatch a technician and log issue parameters for monitored equipment.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Device ID</label>
                  <input
                    type="text"
                    required
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value.toUpperCase() })}
                    placeholder="DEV-MTR-102"
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Device Equipment Name</label>
                  <input
                    type="text"
                    required
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    placeholder="Chiller Substation Feeder"
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Building Location</label>
                  <select
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Main Facility">Main Facility</option>
                    <option value="Research & Development Center">Research & Development Center</option>
                    <option value="Logistics & Warehousing Hub">Logistics & Warehousing Hub</option>
                    <option value="Executive Office Tower">Executive Office Tower</option>
                    <option value="Manufacturing & Assembly Plant">Manufacturing & Assembly Plant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ticket Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical (Immediate SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Problem Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                  placeholder="Detail symptoms, harmonic spikes, trip occurrences, or inspection requirements..."
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    value={formData.assignedTechnician}
                    onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                    placeholder="Technician Name"
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  {saving ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Update Ticket Status & Resolution Notes Modal */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">
              Update Ticket: {editingTicket.ticketId}
            </h2>
            <p className="text-xs text-slate-400 mb-4">{editingTicket.deviceName} ({editingTicket.building})</p>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Workflow Status</label>
                <select
                  value={statusFormData.status}
                  onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value })}
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Open">Open</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Technician</label>
                <input
                  type="text"
                  value={statusFormData.assignedTechnician}
                  onChange={(e) => setStatusFormData({ ...statusFormData, assignedTechnician: e.target.value })}
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resolution & Diagnostic Notes</label>
                <textarea
                  rows="3"
                  value={statusFormData.resolutionNotes}
                  onChange={(e) => setStatusFormData({ ...statusFormData, resolutionNotes: e.target.value })}
                  placeholder="Record findings, component replacements, torque values, or testing verification..."
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="px-4 py-2 bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold rounded-xl transition"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceView;

