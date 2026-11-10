const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const { logAction } = require('../utils/auditLogger');

// Resilient fallback alert cache
const initialAlerts = [
  {
    _id: '666a00010001000100010001',
    title: 'High Peak Demand Alert',
    message: 'Main Facility power draw hit 48.2 kW, exceeding the 45.0 kW warning threshold.',
    severity: 'warning',
    type: 'threshold_exceeded',
    metricValue: 48.2,
    thresholdValue: 45.0,
    deviceName: 'Main Feeder 3-Phase Energy Meter',
    building: 'Main Facility',
    isAcknowledged: false,
    isResolved: false,
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    _id: '666a00010001000100010002',
    title: 'Voltage Fluctuation Anomaly',
    message: 'Cold Storage sub-meter registered voltage sag of 204.2 V (-11.2% nominal).',
    severity: 'critical',
    type: 'voltage_fluctuation',
    metricValue: 204.2,
    thresholdValue: 220.0,
    deviceName: 'Cold Storage & Refrigeration Sub-Meter',
    building: 'Logistics & Warehousing Hub',
    isAcknowledged: false,
    isResolved: false,
    timestamp: new Date(Date.now() - 50 * 60 * 1000),
  },
  {
    _id: '666a00010001000100010003',
    title: 'Daily Budget Exceeded Warning',
    message: 'Logistics Hub daily consumption (546.2 kWh) exceeded daily budget target of 500 kWh.',
    severity: 'warning',
    type: 'budget_warning',
    metricValue: 546.2,
    thresholdValue: 500.0,
    deviceName: 'Logistics Primary Infeed',
    building: 'Logistics & Warehousing Hub',
    isAcknowledged: true,
    acknowledgedAt: new Date(Date.now() - 10 * 60 * 1000),
    acknowledgedBy: 'Marcus Vance',
    isResolved: false,
    timestamp: new Date(Date.now() - 120 * 60 * 1000),
  },
];

const offlineAlerts = new Map();
initialAlerts.forEach((a) => offlineAlerts.set(a._id, a));

// @desc    Get all alerts with building, severity and status filters
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { isResolved, isAcknowledged, severity, building } = req.query;

    let alerts = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const filter = {};
        if (req.user.role !== 'admin' && req.user.role !== 'analyst' && req.user.role !== 'operator') {
          filter.$or = [{ userId }, { building: { $in: req.user.assignedBuildings || ['Main Facility'] } }];
        }
        if (isResolved !== undefined) filter.isResolved = isResolved === 'true';
        if (isAcknowledged !== undefined) filter.isAcknowledged = isAcknowledged === 'true';
        if (severity && severity !== 'ALL') filter.severity = severity;
        if (building && building !== 'ALL' && building !== 'All Buildings') filter.building = building;

        alerts = await Alert.find(filter).sort({ timestamp: -1 }).limit(50).maxTimeMS(2000);
      } catch (err) {
        alerts = [];
      }
    }

    if (alerts.length === 0) {
      // Use fallback store
      let fallbackList = Array.from(offlineAlerts.values());

      // Filter by assigned buildings for facility managers and building users
      if (req.user.role === 'manager' || req.user.role === 'building_user' || req.user.role === 'viewer') {
        const assigned = req.user.assignedBuildings || ['Main Facility'];
        if (!assigned.includes('All Buildings')) {
          fallbackList = fallbackList.filter((a) =>
            assigned.some((b) => b.toLowerCase() === (a.building || '').toLowerCase())
          );
        }
      }

      if (isResolved !== undefined) {
        const targetResolved = isResolved === 'true';
        fallbackList = fallbackList.filter((a) => a.isResolved === targetResolved);
      }
      if (isAcknowledged !== undefined) {
        const targetAck = isAcknowledged === 'true';
        fallbackList = fallbackList.filter((a) => a.isAcknowledged === targetAck);
      }
      if (severity && severity !== 'ALL') {
        fallbackList = fallbackList.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
      }
      if (building && building !== 'ALL' && building !== 'All Buildings') {
        fallbackList = fallbackList.filter((a) => a.building.toLowerCase() === building.toLowerCase());
      }

      alerts = fallbackList;
    }

    const unreadCount = alerts.filter((a) => !a.isResolved).length;

    res.status(200).json({
      success: true,
      unreadCount,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Acknowledge alert
// @route   PATCH /api/alerts/:id/acknowledge
// @access  Private (Admin, Facility Manager, Energy Analyst)
const acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const now = new Date();

    const offlineItem = offlineAlerts.get(id);
    if (offlineItem) {
      offlineItem.isAcknowledged = true;
      offlineItem.acknowledgedAt = now;
      offlineItem.acknowledgedBy = req.user.name;
    }

    let alert = null;
    if (mongoose.connection.readyState === 1) {
      try {
        alert = await Alert.findByIdAndUpdate(
          id,
          { isAcknowledged: true, acknowledgedAt: now, acknowledgedBy: req.user.name },
          { new: true }
        );
      } catch (err) {
        alert = offlineItem;
      }
    } else {
      alert = offlineItem;
    }

    if (!alert && !offlineItem) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    await logAction({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ALERT_ACKNOWLEDGED',
      entityType: 'alert',
      entityId: id,
      building: alert?.building || 'Main Facility',
      details: { title: alert?.title, acknowledgedBy: req.user.name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully.',
      data: alert || offlineItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve alert
// @route   PATCH /api/alerts/:id/resolve
// @access  Private (Admin, Facility Manager, Energy Analyst)
const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const now = new Date();

    const offlineItem = offlineAlerts.get(id);
    if (offlineItem) {
      offlineItem.isResolved = true;
      offlineItem.resolvedAt = now;
      offlineItem.resolvedBy = req.user.name;
    }

    let alert = null;
    if (mongoose.connection.readyState === 1) {
      try {
        alert = await Alert.findByIdAndUpdate(
          id,
          { isResolved: true, resolvedAt: now, resolvedBy: req.user.name },
          { new: true }
        );
      } catch (err) {
        alert = offlineItem;
      }
    } else {
      alert = offlineItem;
    }

    if (!alert && !offlineItem) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    await logAction({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ALERT_RESOLVED',
      entityType: 'alert',
      entityId: id,
      building: alert?.building || 'Main Facility',
      details: { title: alert?.title, resolvedBy: req.user.name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Alert marked as resolved.',
      data: alert || offlineItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      title,
      message,
      severity = 'warning',
      type = 'threshold_exceeded',
      metricValue,
      thresholdValue,
      deviceId,
      deviceName = 'System',
      building = 'Main Facility',
    } = req.body;

    const newAlert = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId,
      deviceId,
      deviceName,
      building,
      title,
      message,
      severity,
      type,
      metricValue,
      thresholdValue,
      isAcknowledged: false,
      isResolved: false,
      timestamp: new Date(),
    };

    offlineAlerts.set(newAlert._id, newAlert);

    if (mongoose.connection.readyState === 1) {
      try {
        await Alert.create(newAlert);
      } catch (err) {
        console.warn('MongoDB alert deferred:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Alert generated successfully.',
      data: newAlert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / dismiss alert
// @route   DELETE /api/alerts/:id
// @access  Private
const deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    offlineAlerts.delete(id);

    if (mongoose.connection.readyState === 1) {
      try {
        await Alert.findByIdAndDelete(id);
      } catch (err) {
        // pass
      }
    }

    res.status(200).json({
      success: true,
      message: 'Alert dismissed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  createAlert,
  deleteAlert,
};
