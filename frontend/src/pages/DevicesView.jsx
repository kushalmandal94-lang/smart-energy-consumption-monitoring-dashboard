import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import DevicePerformanceWidget from '../components/DevicePerformanceWidget';
import DeviceListTable from '../components/DeviceListTable';
import SmartLoadManager from '../components/SmartLoadManager';
import LoadControlAndScheduling from '../components/LoadControlAndScheduling';
import DeviceModal from '../components/DeviceModal';
import SmartLoadModal from '../components/SmartLoadModal';
import LoadScheduleModal from '../components/LoadScheduleModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import {
  Cpu,
  Zap,
  Calendar,
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Activity,
} from 'lucide-react';

const DevicesView = () => {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'devices' | 'loads' | 'schedules'
  
  // Data States
  const [devices, setDevices] = useState([]);
  const [loads, setLoads] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }

  // Modals States
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null);

  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [loadToEdit, setLoadToEdit] = useState(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    item: null,
    type: '', // 'device' | 'load' | 'schedule'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch all module data in parallel
  const fetchModuleData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [devicesRes, loadsRes, schedulesRes, statsRes] = await Promise.allSettled([
        api.get('/devices'),
        api.get('/smart-loads'),
        api.get('/load-schedules'),
        api.get('/devices/stats/summary'),
      ]);

      if (devicesRes.status === 'fulfilled') setDevices(devicesRes.value.data.data || []);
      if (loadsRes.status === 'fulfilled') setLoads(loadsRes.value.data.data || []);
      if (schedulesRes.status === 'fulfilled') setSchedules(schedulesRes.value.data.data || []);
      if (statsRes.status === 'fulfilled') setPerformanceStats(statsRes.value.data.data || null);
    } catch (err) {
      console.error('Error fetching devices and smart loads data:', err);
      showToast('Failed to sync device telemetry from server', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchModuleData();
  }, [fetchModuleData]);

  // ==========================================
  // Device CRUD Operations
  // ==========================================
  const handleSaveDevice = async (deviceFormData) => {
    try {
      if (deviceToEdit) {
        const res = await api.put(`/devices/${deviceToEdit._id || deviceToEdit.id}`, deviceFormData);
        setDevices((prev) =>
          prev.map((d) => ((d._id === deviceToEdit._id || d.id === deviceToEdit.id) ? res.data.data : d))
        );
        showToast(`Device '${res.data.data.name}' updated successfully!`);
      } else {
        const res = await api.post('/devices', deviceFormData);
        setDevices((prev) => [res.data.data, ...prev]);
        showToast(`IoT Meter '${res.data.data.name}' registered successfully!`);
      }
      setIsDeviceModalOpen(false);
      setDeviceToEdit(null);
      fetchModuleData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save device';
      showToast(msg, 'error');
    }
  };

  const handleToggleDeviceStatus = async (id) => {
    try {
      const res = await api.patch(`/devices/${id}/toggle`);
      setDevices((prev) =>
        prev.map((d) => (d._id === id || d.id === id ? res.data.data : d))
      );
      showToast(res.data.message || 'Device status updated');
      fetchModuleData();
    } catch (err) {
      showToast('Failed to toggle device connection', 'error');
    }
  };

  // ==========================================
  // Smart Load CRUD Operations
  // ==========================================
  const handleSaveSmartLoad = async (loadFormData) => {
    try {
      if (loadToEdit) {
        const res = await api.put(`/smart-loads/${loadToEdit._id || loadToEdit.id}`, loadFormData);
        setLoads((prev) =>
          prev.map((l) => ((l._id === loadToEdit._id || l.id === loadToEdit.id) ? res.data.data : l))
        );
        showToast(`Smart Load '${res.data.data.name}' updated successfully!`);
      } else {
        const res = await api.post('/smart-loads', loadFormData);
        setLoads((prev) => [res.data.data, ...prev]);
        showToast(`Smart Load '${res.data.data.name}' added successfully!`);
      }
      setIsLoadModalOpen(false);
      setLoadToEdit(null);
      fetchModuleData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save smart load';
      showToast(msg, 'error');
    }
  };

  const handleToggleSmartLoadStatus = async (id) => {
    try {
      const res = await api.patch(`/smart-loads/${id}/toggle`);
      setLoads((prev) =>
        prev.map((l) => (l._id === id || l.id === id ? res.data.data : l))
      );
      showToast(res.data.message || 'Relay status switched [SIMULATION]');
      fetchModuleData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to toggle relay state';
      showToast(msg, 'error');
    }
  };

  // ==========================================
  // Load Schedule CRUD Operations
  // ==========================================
  const handleSaveSchedule = async (scheduleFormData) => {
    try {
      if (scheduleToEdit) {
        const res = await api.put(`/load-schedules/${scheduleToEdit._id || scheduleToEdit.id}`, scheduleFormData);
        setSchedules((prev) =>
          prev.map((s) => ((s._id === scheduleToEdit._id || s.id === scheduleToEdit.id) ? res.data.data : s))
        );
        showToast(`Operating schedule '${res.data.data.name}' updated successfully!`);
      } else {
        const res = await api.post('/load-schedules', scheduleFormData);
        setSchedules((prev) => [res.data.data, ...prev]);
        showToast(`Operating schedule '${res.data.data.name}' created successfully!`);
      }
      setIsScheduleModalOpen(false);
      setScheduleToEdit(null);
      fetchModuleData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save load schedule';
      showToast(msg, 'error');
    }
  };

  const handleToggleScheduleEnabled = async (id) => {
    try {
      const res = await api.patch(`/load-schedules/${id}/toggle`);
      setSchedules((prev) =>
        prev.map((s) => (s._id === id || s.id === id ? res.data.data : s))
      );
      showToast(res.data.message || 'Schedule updated');
    } catch (err) {
      showToast('Failed to toggle schedule state', 'error');
    }
  };

  // ==========================================
  // Unified Delete Confirmation Handler
  // ==========================================
  const handleExecuteDelete = async () => {
    const { item, type } = deleteConfirm;
    if (!item) return;

    try {
      if (type === 'device') {
        await api.delete(`/devices/${item._id || item.id}`);
        setDevices((prev) => prev.filter((d) => d._id !== item._id && d.id !== item.id));
        showToast(`Device '${item.name}' (${item.deviceId}) removed.`);
      } else if (type === 'load') {
        await api.delete(`/smart-loads/${item._id || item.id}`);
        setLoads((prev) => prev.filter((l) => l._id !== item._id && l.id !== item.id));
        showToast(`Smart load '${item.name}' removed.`);
      } else if (type === 'schedule') {
        await api.delete(`/load-schedules/${item._id || item.id}`);
        setSchedules((prev) => prev.filter((s) => s._id !== item._id && s.id !== item.id));
        showToast(`Operating schedule '${item.name}' removed.`);
      }

      setDeleteConfirm({ isOpen: false, item: null, type: '' });
      fetchModuleData();
    } catch (err) {
      showToast(`Failed to delete ${type}: ${err.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-cyan-400">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-300">
          Loading Devices, Smart Loads & Telemetry Hub...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-3.5 rounded-2xl border text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-bounce-short ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-300 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Module Title Banner & Sub-Tabs Navigation */}
      <div className="energy-card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black text-white tracking-tight">
                Devices & Smart Loads Management
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                IoT TELEMETRY HUB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Unified control center for smart energy meters, connected electrical loads, and automated load-shedding schedules
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchModuleData}
              disabled={isRefreshing}
              className="p-2 text-slate-300 hover:text-white bg-dark-950 hover:bg-dark-850 border border-slate-800 rounded-xl transition"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Section Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'overview'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-dark-950/60 border border-transparent'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview & Health</span>
          </button>

          <button
            onClick={() => setActiveSubTab('devices')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'devices'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-dark-950/60 border border-transparent'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>IoT Energy Meters</span>
            <span className="px-1.5 py-0.2 rounded-md bg-dark-950 text-[10px] font-mono font-bold text-slate-300 border border-slate-800">
              {devices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('loads')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'loads'
                ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-dark-950/60 border border-transparent'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Electrical Smart Loads</span>
            <span className="px-1.5 py-0.2 rounded-md bg-dark-950 text-[10px] font-mono font-bold text-slate-300 border border-slate-800">
              {loads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('schedules')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'schedules'
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/10 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-dark-950/60 border border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Load Control & Schedules</span>
            <span className="px-1.5 py-0.2 rounded-md bg-dark-950 text-[10px] font-mono font-bold text-slate-300 border border-slate-800">
              {schedules.length}
            </span>
          </button>
        </div>
      </div>

      {/* Render Active Sub-Tab View */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <DevicePerformanceWidget
            stats={performanceStats}
            devices={devices}
            loads={loads}
          />
          {/* Quick preview of devices and loads */}
          <DeviceListTable
            devices={devices}
            onOpenAddModal={() => {
              setDeviceToEdit(null);
              setIsDeviceModalOpen(true);
            }}
            onOpenEditModal={(device) => {
              setDeviceToEdit(device);
              setIsDeviceModalOpen(true);
            }}
            onOpenDeleteConfirm={(device) => {
              setDeleteConfirm({
                isOpen: true,
                item: device,
                type: 'device',
              });
            }}
            onToggleStatus={handleToggleDeviceStatus}
          />
        </div>
      )}

      {activeSubTab === 'devices' && (
        <DeviceListTable
          devices={devices}
          onOpenAddModal={() => {
            setDeviceToEdit(null);
            setIsDeviceModalOpen(true);
          }}
          onOpenEditModal={(device) => {
            setDeviceToEdit(device);
            setIsDeviceModalOpen(true);
          }}
          onOpenDeleteConfirm={(device) => {
            setDeleteConfirm({
              isOpen: true,
              item: device,
              type: 'device',
            });
          }}
          onToggleStatus={handleToggleDeviceStatus}
        />
      )}

      {activeSubTab === 'loads' && (
        <SmartLoadManager
          loads={loads}
          devices={devices}
          onOpenAddModal={() => {
            setLoadToEdit(null);
            setIsLoadModalOpen(true);
          }}
          onOpenEditModal={(load) => {
            setLoadToEdit(load);
            setIsLoadModalOpen(true);
          }}
          onOpenDeleteConfirm={(load) => {
            setDeleteConfirm({
              isOpen: true,
              item: load,
              type: 'load',
            });
          }}
          onToggleStatus={handleToggleSmartLoadStatus}
        />
      )}

      {activeSubTab === 'schedules' && (
        <LoadControlAndScheduling
          loads={loads}
          schedules={schedules}
          onToggleLoadStatus={handleToggleSmartLoadStatus}
          onToggleSchedule={handleToggleScheduleEnabled}
          onOpenAddScheduleModal={() => {
            setScheduleToEdit(null);
            setIsScheduleModalOpen(true);
          }}
          onOpenEditScheduleModal={(schedule) => {
            setScheduleToEdit(schedule);
            setIsScheduleModalOpen(true);
          }}
          onOpenDeleteScheduleConfirm={(schedule) => {
            setDeleteConfirm({
              isOpen: true,
              item: schedule,
              type: 'schedule',
            });
          }}
        />
      )}

      {/* ======================================================== */}
      {/* Interactive Action Modals */}
      {/* ======================================================== */}

      {/* Device Add / Edit Modal */}
      <DeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => {
          setIsDeviceModalOpen(false);
          setDeviceToEdit(null);
        }}
        onSave={handleSaveDevice}
        deviceToEdit={deviceToEdit}
      />

      {/* Smart Load Add / Edit Modal */}
      <SmartLoadModal
        isOpen={isLoadModalOpen}
        onClose={() => {
          setIsLoadModalOpen(false);
          setLoadToEdit(null);
        }}
        onSave={handleSaveSmartLoad}
        loadToEdit={loadToEdit}
        devices={devices}
      />

      {/* Load Schedule Add / Edit Modal */}
      <LoadScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setScheduleToEdit(null);
        }}
        onSave={handleSaveSchedule}
        scheduleToEdit={scheduleToEdit}
        loads={loads}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null, type: '' })}
        onConfirm={handleExecuteDelete}
        title={
          deleteConfirm.type === 'device'
            ? 'Delete Registered IoT Meter'
            : deleteConfirm.type === 'load'
            ? 'Delete Smart Electrical Load'
            : 'Delete Operating Schedule'
        }
        message={
          deleteConfirm.type === 'device'
            ? `Are you sure you want to delete this IoT meter? Any electrical smart loads assigned to this meter will be deleted.`
            : deleteConfirm.type === 'load'
            ? `Are you sure you want to remove this smart load? Any associated operating schedules will also be removed.`
            : `Are you sure you want to delete this operating schedule?`
        }
        itemName={deleteConfirm.item?.name || deleteConfirm.item?.deviceId}
        itemType={deleteConfirm.type}
      />
    </div>
  );
};

export default DevicesView;
