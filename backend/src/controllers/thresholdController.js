const mongoose = require('mongoose');
const Threshold = require('../models/Threshold');
const Alert = require('../models/Alert');
const { logAction } = require('../utils/auditLogger');

// Resilient in-memory store pre-seeded with facility thresholds
const initialThresholds = [
  {
    _id: '665a00010001000100010001',
    building: 'Main Facility',
    dailyLimitKWh: 420,
    monthlyLimitKWh: 11000,
    peakDemandLimitKW: 50.0,
    warningThresholdPercent: 80,
    criticalThresholdPercent: 95,
    voltageLowerLimitV: 215,
    voltageUpperLimitV: 245,
    minPowerFactor: 0.92,
    alertRecipients: ['admin', 'manager'],
    status: 'active',
    lastTriggeredAt: new Date(Date.now() - 7200000),
  },
  {
    _id: '665a00010001000100010002',
    building: 'Research & Development Center',
    dailyLimitKWh: 360,
    monthlyLimitKWh: 9500,
    peakDemandLimitKW: 42.0,
    warningThresholdPercent: 80,
    criticalThresholdPercent: 95,
    voltageLowerLimitV: 220,
    voltageUpperLimitV: 242,
    minPowerFactor: 0.94,
    alertRecipients: ['admin', 'manager', 'analyst'],
    status: 'active',
    lastTriggeredAt: null,
  },
  {
    _id: '665a00010001000100010003',
    building: 'Logistics & Warehousing Hub',
    dailyLimitKWh: 600,
    monthlyLimitKWh: 15500,
    peakDemandLimitKW: 70.0,
    warningThresholdPercent: 85,
    criticalThresholdPercent: 95,
    voltageLowerLimitV: 210,
    voltageUpperLimitV: 248,
    minPowerFactor: 0.90,
    alertRecipients: ['admin', 'manager'],
    status: 'active',
    lastTriggeredAt: new Date(Date.now() - 86400000),
  },
  {
    _id: '665a00010001000100010004',
    building: 'Executive Office Tower',
    dailyLimitKWh: 480,
    monthlyLimitKWh: 12500,
    peakDemandLimitKW: 58.0,
    warningThresholdPercent: 80,
    criticalThresholdPercent: 95,
    voltageLowerLimitV: 218,
    voltageUpperLimitV: 244,
    minPowerFactor: 0.93,
    alertRecipients: ['admin'],
    status: 'active',
    lastTriggeredAt: null,
  },
];

const offlineThresholds = new Map();
initialThresholds.forEach((t) => offlineThresholds.set(t.building, t));

// @desc    Get all threshold rules
// @route   GET /api/thresholds
// @access  Private
const getThresholds = async (req, res, next) => {
  try {
    const { building } = req.query;
    let list = Array.from(offlineThresholds.values());

    if (building && building !== 'ALL' && building !== 'All Buildings') {
      list = list.filter((t) => t.building.toLowerCase() === building.toLowerCase());
    }

    res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update threshold for a building
// @route   POST /api/thresholds
// @access  Private (Admin, Facility Manager)
const upsertThreshold = async (req, res, next) => {
  try {
    const {
      building,
      dailyLimitKWh,
      monthlyLimitKWh,
      peakDemandLimitKW,
      warningThresholdPercent,
      criticalThresholdPercent,
      voltageLowerLimitV,
      voltageUpperLimitV,
      minPowerFactor,
      alertRecipients,
      status,
    } = req.body;

    if (!building) {
      return res.status(400).json({ success: false, message: 'Please specify building name' });
    }

    const existing = offlineThresholds.get(building);
    const thresholdRecord = {
      _id: existing?._id || new mongoose.Types.ObjectId().toString(),
      building,
      dailyLimitKWh: Number(dailyLimitKWh) || existing?.dailyLimitKWh || 450,
      monthlyLimitKWh: Number(monthlyLimitKWh) || existing?.monthlyLimitKWh || 12000,
      peakDemandLimitKW: Number(peakDemandLimitKW) || existing?.peakDemandLimitKW || 55.0,
      warningThresholdPercent: Number(warningThresholdPercent) || existing?.warningThresholdPercent || 80,
      criticalThresholdPercent: Number(criticalThresholdPercent) || existing?.criticalThresholdPercent || 95,
      voltageLowerLimitV: Number(voltageLowerLimitV) || existing?.voltageLowerLimitV || 215,
      voltageUpperLimitV: Number(voltageUpperLimitV) || existing?.voltageUpperLimitV || 245,
      minPowerFactor: Number(minPowerFactor) || existing?.minPowerFactor || 0.90,
      alertRecipients: alertRecipients || existing?.alertRecipients || ['admin', 'manager'],
      status: status || existing?.status || 'active',
      lastTriggeredAt: existing?.lastTriggeredAt || null,
      updatedAt: new Date(),
    };

    offlineThresholds.set(building, thresholdRecord);

    await logAction({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'THRESHOLD_CONFIGURED',
      entityType: 'threshold',
      entityId: thresholdRecord._id,
      building,
      details: {
        dailyLimitKWh: thresholdRecord.dailyLimitKWh,
        peakDemandLimitKW: thresholdRecord.peakDemandLimitKW,
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Threshold limits for '${building}' configured successfully.`,
      data: thresholdRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate current consumption against thresholds and trigger alerts if exceeded
// @route   POST /api/thresholds/evaluate
// @access  Private
const evaluateThresholds = async (req, res, next) => {
  try {
    const { building = 'Main Facility', currentDemandKW = 48.5, currentDailyKWh = 398.0 } = req.body;
    const threshold = offlineThresholds.get(building) || offlineThresholds.get('Main Facility');

    const alertsGenerated = [];

    // Check Peak Demand Limit
    const demandWarningVal = threshold.peakDemandLimitKW * (threshold.warningThresholdPercent / 100);
    const demandCriticalVal = threshold.peakDemandLimitKW * (threshold.criticalThresholdPercent / 100);

    if (currentDemandKW >= demandCriticalVal) {
      alertsGenerated.push({
        title: `CRITICAL PEAK DEMAND: ${building}`,
        message: `Demand of ${currentDemandKW} kW exceeded critical threshold (${demandCriticalVal.toFixed(1)} kW, 95% of ${threshold.peakDemandLimitKW} kW limit).`,
        severity: 'critical',
        type: 'threshold_exceeded',
        metricValue: currentDemandKW,
        thresholdValue: threshold.peakDemandLimitKW,
        building,
      });
    } else if (currentDemandKW >= demandWarningVal) {
      alertsGenerated.push({
        title: `WARNING PEAK DEMAND: ${building}`,
        message: `Demand of ${currentDemandKW} kW approaching capacity limit (${demandWarningVal.toFixed(1)} kW, 80% of ${threshold.peakDemandLimitKW} kW limit).`,
        severity: 'warning',
        type: 'threshold_exceeded',
        metricValue: currentDemandKW,
        thresholdValue: threshold.peakDemandLimitKW,
        building,
      });
    }

    // Check Daily Consumption Limit
    const dailyWarningVal = threshold.dailyLimitKWh * (threshold.warningThresholdPercent / 100);
    if (currentDailyKWh >= dailyWarningVal) {
      alertsGenerated.push({
        title: `DAILY TARGET WARNING: ${building}`,
        message: `Daily consumption (${currentDailyKWh} kWh) reached 80%+ of daily target (${threshold.dailyLimitKWh} kWh).`,
        severity: 'warning',
        type: 'budget_warning',
        metricValue: currentDailyKWh,
        thresholdValue: threshold.dailyLimitKWh,
        building,
      });
    }

    res.status(200).json({
      success: true,
      building,
      evaluatedLimits: {
        peakDemandLimitKW: threshold.peakDemandLimitKW,
        dailyLimitKWh: threshold.dailyLimitKWh,
      },
      alertsTriggeredCount: alertsGenerated.length,
      alerts: alertsGenerated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getThresholds,
  upsertThreshold,
  evaluateThresholds,
};

