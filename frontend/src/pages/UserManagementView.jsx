import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Users,
  UserPlus,
  Shield,
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Edit2,
  RefreshCw,
  UserX,
  Mail,
  Phone,
} from 'lucide-react';

const UserManagementView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager',
    status: 'active',
    assignedBuildings: ['Main Facility'],
    department: 'Operations',
    phone: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const availableBuildings = [
    'Main Facility',
    'Research & Development Center',
    'Logistics & Warehousing Hub',
    'Executive Office Tower',
    'Manufacturing & Assembly Plant',
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: { search, role: roleFilter, status: statusFilter },
      });
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'manager',
      status: 'active',
      assignedBuildings: ['Main Facility'],
      department: 'Operations',
      phone: '',
    });
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'manager',
      status: user.status || 'active',
      assignedBuildings: user.assignedBuildings || ['Main Facility'],
      department: user.department || 'Operations',
      phone: user.phone || '',
    });
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleToggleBuilding = (building) => {
    setFormData((prev) => {
      const exists = prev.assignedBuildings.includes(building);
      if (exists) {
        if (prev.assignedBuildings.length === 1) return prev; // keep at least one
        return {
          ...prev,
          assignedBuildings: prev.assignedBuildings.filter((b) => b !== building),
        };
      } else {
        return {
          ...prev,
          assignedBuildings: [...prev.assignedBuildings, building],
        };
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editingUser._id || editingUser.id}`, payload);
        setSuccessMsg(`User '${formData.name}' updated successfully.`);
      } else {
        await api.post('/users', formData);
        setSuccessMsg(`User '${formData.name}' created successfully.`);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/users/${id}/status`);
      setSuccessMsg(res.data?.message || 'Status updated');
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove user '${name}'? This action is permanent.`)) {
      return;
    }
    try {
      await api.delete(`/users/${id}`);
      setSuccessMsg(`User '${name}' removed successfully.`);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const roleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Admin</span>;
      case 'manager':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Manager</span>;
      case 'operator':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Auditor / Operator</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">Viewer</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-purple-400" />
            <span>User Management & Role Permissions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System Administrator console for managing user accounts, assigning roles, and scoping building access.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-purple-500/20 text-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department..."
            className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </form>

        <div className="flex items-center space-x-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="manager">Facility Manager</option>
            <option value="operator">Energy Auditor</option>
            <option value="viewer">Viewer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive / Deactivated</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-2 bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition"
            title="Refresh user list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Buildings</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => {
                const id = u._id || u.id;
                const isActive = u.status !== 'inactive';
                return (
                  <tr key={id} className="hover:bg-dark-850/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-600" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{roleBadge(u.role)}</td>
                    <td className="py-3.5 px-4 text-slate-400">{u.department || 'Operations'}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(u.assignedBuildings || ['Main Facility']).map((b, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[10px] rounded-md bg-dark-950 border border-slate-800 text-slate-300"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(id)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-emerald-500/10 hover:text-emerald-400'
                        }`}
                        title="Click to toggle active/inactive status"
                      >
                        {isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Deactivated</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-950/20 rounded-lg border border-transparent hover:border-purple-800/40 transition"
                          title="Edit user & roles"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(id, u.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg border border-transparent hover:border-rose-800/40 transition"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    No users found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-dark-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-lg font-bold text-white mb-1">
              {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User Account'}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Configure credentials, role permissions, and assigned building scopes.
            </p>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jordan Hayes"
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jordan.hayes@facility.com"
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Password {editingUser && <span className="text-slate-500 font-normal">(Leave blank to keep)</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? '••••••••' : 'Min 6 characters'}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="admin">System Administrator (Full Access)</option>
                    <option value="manager">Facility Manager (Assigned Buildings)</option>
                    <option value="operator">Energy Auditor / Operator</option>
                    <option value="viewer">Viewer (Read-Only)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Operations & Engineering"
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive (Deactivated)</option>
                  </select>
                </div>
              </div>

              {/* Building Scoping Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Assigned Buildings (RBAC Scope Restriction)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-dark-950 p-3 rounded-xl border border-slate-800">
                  {availableBuildings.map((b) => {
                    const isSelected = formData.assignedBuildings.includes(b);
                    return (
                      <button
                        type="button"
                        key={b}
                        onClick={() => handleToggleBuilding(b)}
                        className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                            : 'bg-dark-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{b}</span>
                        {isSelected && <span className="font-bold text-purple-400">✓</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Facility Managers can only monitor and control equipment located in their assigned buildings.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white bg-dark-850 hover:bg-dark-800 border border-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-purple-500/20"
                >
                  {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;

