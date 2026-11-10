const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

// Resilient in-memory audit logs store
const offlineAuditLogs = [];

// Seed initial audit log history
const initialLogs = [
  {
    _id: '663a00010001000100010001',
    userId: '662f1a2b3c4d5e6f7a8b9c01',
    userName: 'Alex Rivera',
    userRole: 'admin',
    action: 'SYSTEM_INITIALIZATION',
    entityType: 'system',
    entityId: 'VOLTPULSE-CORE',
    building: 'Global',
    details: { event: 'VoltPulse RBAC Security Framework and Telemetry Hub initialized' },
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000),
  },
  {
    _id: '663a00010001000100010002',
    userId: '662f1a2b3c4d5e6f7a8b9c01',
    userName: 'Alex Rivera',
    userRole: 'admin',
    action: 'USER_ROLE_ASSIGNED',
    entityType: 'user',
    entityId: '662f1a2b3c4d5e6f7a8b9c02',
    building: 'Main Facility',
    details: { user: 'Marcus Vance', assignedRole: 'manager', buildings: ['Main Facility', 'Research & Development Center'] },
    ipAddress: '192.168.1.15',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000),
  },
  {
    _id: '663a00010001000100010003',
    userId: '662f1a2b3c4d5e6f7a8b9c02',
    userName: 'Marcus Vance',
    userRole: 'manager',
    action: 'LOAD_SCHEDULE_UPDATED',
    entityType: 'load_schedule',
    entityId: 'SCHED-HVAC-01',
    building: 'Main Facility',
    details: { scheduleName: 'HVAC Eco Mode', operatingHours: '08:00 - 18:00' },
    ipAddress: '192.168.1.42',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000),
  },
  {
    _id: '663a00010001000100010004',
    userId: '662f1a2b3c4d5e6f7a8b9c03',
    userName: 'Dr. Elena Rostova',
    userRole: 'operator',
    action: 'AUDIT_OBSERVATION_RECORDED',
    entityType: 'audit',
    entityId: 'AUD-2026-08',
    building: 'Logistics & Warehousing Hub',
    details: { observation: 'Off-peak power factor below 0.90 threshold; recommended capacitor bank inspection' },
    ipAddress: '192.168.2.10',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000),
  },
];

initialLogs.forEach((l) => offlineAuditLogs.unshift(l));

const logAction = async ({
  userId,
  userName = 'System User',
  userRole = 'system',
  action,
  entityType = 'general',
  entityId = '',
  building = 'Global',
  details = {},
  ipAddress = '127.0.0.1',
}) => {
  const logEntry = {
    _id: new mongoose.Types.ObjectId().toString(),
    userId: userId ? userId.toString() : 'system',
    userName,
    userRole,
    action,
    entityType,
    entityId: entityId ? entityId.toString() : '',
    building,
    details,
    ipAddress,
    timestamp: new Date(),
  };

  // Add to local buffer (keep last 500 entries)
  offlineAuditLogs.unshift(logEntry);
  if (offlineAuditLogs.length > 500) {
    offlineAuditLogs.pop();
  }

  // Attempt database persistence if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await AuditLog.create(logEntry);
    } catch (err) {
      console.warn('AuditLog database write notice:', err.message);
    }
  }

  return logEntry;
};

const getAuditLogs = async ({ search, action, role, building, limit = 50, page = 1 } = {}) => {
  // If connected, query DB
  if (mongoose.connection.readyState === 1) {
    try {
      const query = {};
      if (action && action !== 'ALL') query.action = action;
      if (role && role !== 'ALL') query.userRole = role;
      if (building && building !== 'ALL') query.building = building;
      if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ action: regex }, { userName: regex }, { entityType: regex }, { building: regex }];
      }

      const total = await AuditLog.countDocuments(query).maxTimeMS(2500);
      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .maxTimeMS(2500);

      if (logs && logs.length > 0) {
        return { total, page: Number(page), limit: Number(limit), logs };
      }
    } catch (err) {
      console.warn('AuditLog query notice, using active buffer:', err.message);
    }
  }

  // Memory buffer query
  let filtered = [...offlineAuditLogs];
  if (action && action !== 'ALL') filtered = filtered.filter((l) => l.action === action);
  if (role && role !== 'ALL') filtered = filtered.filter((l) => l.userRole === role);
  if (building && building !== 'ALL') filtered = filtered.filter((l) => l.building === building);
  if (search && search.trim() !== '') {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        (l.action && l.action.toLowerCase().includes(s)) ||
        (l.userName && l.userName.toLowerCase().includes(s)) ||
        (l.entityType && l.entityType.toLowerCase().includes(s)) ||
        (l.building && l.building.toLowerCase().includes(s))
    );
  }

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const logs = filtered.slice(startIndex, startIndex + Number(limit));

  return { total, page: Number(page), limit: Number(limit), logs };
};

module.exports = {
  logAction,
  getAuditLogs,
};

