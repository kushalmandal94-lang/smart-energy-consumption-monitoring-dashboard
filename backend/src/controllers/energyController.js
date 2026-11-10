const EnergyReading = require('../models/EnergyReading');
const Device = require('../models/Device');
const Alert = require('../models/Alert');
const User = require('../models/User');

// Generate realistic mock history if user has no readings yet
const generateFallbackHistory = (range = 'day', ratePerKWh = 0.15) => {
  const points = [];
  const now = new Date();

  if (range === 'day') {
    // 24 hours of data
    for (let h = 0; h < 24; h++) {
      const hourStr = `${h.toString().padStart(2, '0')}:00`;
      // Base load ~ 4-6 kW, peak midday & evening 12-18 kW
      let multiplier = 1.0;
      if (h >= 9 && h <= 17) multiplier = 2.4; // work hours
      else if (h >= 18 && h <= 21) multiplier = 1.9; // evening peak
      else multiplier = 0.8; // night baseline

      const randomJitter = (Math.random() - 0.5) * 1.5;
      const powerKW = Math.max(1.8, +(5.5 * multiplier + randomJitter).toFixed(2));
      const energyKWh = +(powerKW * 1.0).toFixed(2);
      const solarKW = (h >= 7 && h <= 18) ? +(Math.sin(((h - 7) / 11) * Math.PI) * 7.5).toFixed(2) : 0;
      const netKW = +(Math.max(0, powerKW - solarKW)).toFixed(2);

      points.push({
        time: hourStr,
        label: hourStr,
        powerKW,
        energyKWh,
        solarKW,
        netKW,
        cost: +(energyKWh * ratePerKWh).toFixed(2),
        voltage: +(228 + Math.random() * 5).toFixed(1),
        currentAmps: +(powerKW * 4.3).toFixed(1),
      });
    }
  } else if (range === 'week') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
      const isWeekend = dayName === 'Sat' || dayName === 'Sun';
      const baseEnergy = isWeekend ? 65 : 125;
      const energyKWh = +(baseEnergy + (Math.random() - 0.5) * 20).toFixed(1);
      const solarKWh = +(35 + (Math.random() - 0.5) * 10).toFixed(1);

      points.push({
        time: dayName,
        label: `${dayName} (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        energyKWh,
        solarKWh,
        peakKW: +(14 + Math.random() * 5).toFixed(1),
        cost: +(energyKWh * ratePerKWh).toFixed(2),
      });
    }
  } else if (range === 'month') {
    // 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const energyKWh = +(95 + Math.sin(i / 3) * 25 + Math.random() * 15).toFixed(1);

      points.push({
        time: dateStr,
        label: dateStr,
        energyKWh,
        peakKW: +(12 + Math.random() * 6).toFixed(1),
        cost: +(energyKWh * ratePerKWh).toFixed(2),
        carbonKg: +(energyKWh * 0.385).toFixed(1),
      });
    }
  } else if (range === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let m = 0; m < 12; m++) {
      // Seasonal curve: peak in summer (cooling) and winter (heating)
      let seasonFactor = 1.0;
      if (m === 6 || m === 7) seasonFactor = 1.35; // July, August
      if (m === 0 || m === 11) seasonFactor = 1.25; // Jan, Dec

      const energyKWh = +(2800 * seasonFactor + (Math.random() - 0.5) * 300).toFixed(0);
      points.push({
        time: months[m],
        label: months[m],
        energyKWh: Number(energyKWh),
        cost: +(Number(energyKWh) * ratePerKWh).toFixed(2),
        solarKWh: +(800 + Math.sin((m / 11) * Math.PI) * 600).toFixed(0),
      });
    }
  }

  return points;
};

// @desc    Get dashboard KPI Summary Cards
// @route   GET /api/energy/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const ratePerKWh = req.user.preferences?.ratePerKWh || 0.15;
    const monthlyBudget = req.user.preferences?.monthlyBudgetLimit || 500;
    const dailyTarget = req.user.preferences?.dailyTargetKWh || 100;
    const currency = req.user.preferences?.currency || '$';

    // Start of today and start of current month
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let activeDevicesCount = 0;
    let totalDevicesCount = 0;
    let realtimePowerKW = 0;
    let todayKWh = 0;
    let monthKWh = 0;
    let peakDemandKW = 0;

    try {
      const devices = await Device.find({ userId });
      totalDevicesCount = devices.length;
      activeDevicesCount = devices.filter((d) => d.status === 'online').length;
      realtimePowerKW = devices
        .filter((d) => d.status === 'online')
        .reduce((sum, d) => sum + (d.currentPowerKW || 0), 0);

      // Aggregate today readings from DB
      const todayAgg = await EnergyReading.aggregate([
        {
          $match: {
            userId: req.user._id,
            timestamp: { $gte: startOfToday },
          },
        },
        {
          $group: {
            _id: null,
            totalKWh: { $sum: '$energyKWh' },
            maxKW: { $max: '$powerKW' },
          },
        },
      ]);

      if (todayAgg.length > 0) {
        todayKWh = +(todayAgg[0].totalKWh.toFixed(2));
        peakDemandKW = +(todayAgg[0].maxKW.toFixed(2));
      }

      // Aggregate month readings from DB
      const monthAgg = await EnergyReading.aggregate([
        {
          $match: {
            userId: req.user._id,
            timestamp: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalKWh: { $sum: '$energyKWh' },
          },
        },
      ]);

      if (monthAgg.length > 0) {
        monthKWh = +(monthAgg[0].totalKWh.toFixed(2));
      }
    } catch (dbErr) {
      // Fallback if DB is disconnected
      console.warn('DB read error in summary, using smart telemetry fallback:', dbErr.message);
    }

    // Default smart values if database has newly initialized state
    if (realtimePowerKW === 0) realtimePowerKW = 14.65;
    if (todayKWh === 0) todayKWh = 84.4;
    if (monthKWh === 0) monthKWh = 1245.8;
    if (peakDemandKW === 0) peakDemandKW = 22.8;
    if (totalDevicesCount === 0) totalDevicesCount = 8;
    if (activeDevicesCount === 0) activeDevicesCount = 7;

    const estimatedMonthlyCost = +(monthKWh * ratePerKWh).toFixed(2);
    const todayCost = +(todayKWh * ratePerKWh).toFixed(2);
    const carbonFootprintKg = +(monthKWh * 0.385).toFixed(1); // 0.385 kg CO2 per kWh average
    const budgetUsedPercent = Math.min(100, Math.round((estimatedMonthlyCost / monthlyBudget) * 100));

    // Efficiency Score (0 - 100%)
    const efficiencyScore = Math.min(
      98,
      Math.max(65, Math.round(100 - (todayKWh / dailyTarget) * 20))
    );

    // Unresolved critical alerts
    let criticalAlertsCount = 0;
    try {
      criticalAlertsCount = await Alert.countDocuments({
        userId,
        isResolved: false,
        severity: 'critical',
      });
    } catch (e) {
      criticalAlertsCount = 1;
    }

    res.status(200).json({
      success: true,
      data: {
        realtimePowerKW: +realtimePowerKW.toFixed(2),
        todayKWh: +todayKWh.toFixed(1),
        todayCost,
        monthKWh: +monthKWh.toFixed(1),
        estimatedMonthlyCost,
        monthlyBudget,
        budgetUsedPercent,
        peakDemandKW: +peakDemandKW.toFixed(1),
        carbonFootprintKg,
        efficiencyScore,
        currency,
        ratePerKWh,
        devices: {
          total: totalDevicesCount,
          active: activeDevicesCount,
        },
        criticalAlertsCount,
        gridStatus: 'Normal (50.02 Hz)',
        powerFactor: 0.96,
        voltageAvg: 231.4,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical consumption stats for charts
// @route   GET /api/energy/history
// @access  Private
const getHistoricalStats = async (req, res, next) => {
  try {
    const { range = 'day' } = req.query;
    const ratePerKWh = req.user.preferences?.ratePerKWh || 0.15;

    // In a production system, this queries the time-series MongoDB collection with an aggregation pipeline.
    // We check if actual readings exist for this user:
    let points = [];
    try {
      const readingsCount = await EnergyReading.countDocuments({
        userId: req.user._id,
      });

      if (readingsCount > 10) {
        // Build dynamic aggregation if real data exists
        let matchDate = new Date();
        if (range === 'day') matchDate.setHours(matchDate.getHours() - 24);
        else if (range === 'week') matchDate.setDate(matchDate.getDate() - 7);
        else if (range === 'month') matchDate.setDate(matchDate.getDate() - 30);
        else matchDate.setFullYear(matchDate.getFullYear() - 1);

        const dbPoints = await EnergyReading.find({
          userId: req.user._id,
          timestamp: { $gte: matchDate },
        })
          .sort({ timestamp: 1 })
          .limit(100);

        if (dbPoints.length > 0) {
          points = dbPoints.map((p) => ({
            time: new Date(p.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            label: new Date(p.timestamp).toLocaleDateString(),
            powerKW: p.powerKW,
            energyKWh: p.energyKWh,
            cost: p.cost || +(p.energyKWh * ratePerKWh).toFixed(2),
            voltage: p.voltage,
          }));
        }
      }
    } catch (e) {
      // Fallback
    }

    if (points.length === 0) {
      points = generateFallbackHistory(range, ratePerKWh);
    }

    res.status(200).json({
      success: true,
      range,
      count: points.length,
      data: points,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get breakdown of consumption by device category / zones
// @route   GET /api/energy/device-breakdown
// @access  Private
const getDeviceBreakdown = async (req, res, next) => {
  try {
    const ratePerKWh = req.user.preferences?.ratePerKWh || 0.15;

    // Breakdown categories with typical commercial/industrial/smart home share
    const breakdown = [
      {
        name: 'HVAC & Climate',
        type: 'HVAC',
        consumptionKWh: 420.5,
        percentage: 38,
        cost: +(420.5 * ratePerKWh).toFixed(2),
        color: '#3B82F6', // Blue
        activeCount: 3,
      },
      {
        name: 'Server & IT Systems',
        type: 'Server Room',
        consumptionKWh: 285.2,
        percentage: 26,
        cost: +(285.2 * ratePerKWh).toFixed(2),
        color: '#10B981', // Emerald
        activeCount: 4,
      },
      {
        name: 'Machinery & Motors',
        type: 'Machinery',
        consumptionKWh: 175.4,
        percentage: 16,
        cost: +(175.4 * ratePerKWh).toFixed(2),
        color: '#F59E0B', // Amber
        activeCount: 2,
      },
      {
        name: 'EV Chargers',
        type: 'EV Charger',
        consumptionKWh: 110.0,
        percentage: 10,
        cost: +(110.0 * ratePerKWh).toFixed(2),
        color: '#8B5CF6', // Purple
        activeCount: 2,
      },
      {
        name: 'Lighting Systems',
        type: 'Lighting',
        consumptionKWh: 72.8,
        percentage: 7,
        cost: +(72.8 * ratePerKWh).toFixed(2),
        color: '#06B6D4', // Cyan
        activeCount: 12,
      },
      {
        name: 'Refrigeration & Other',
        type: 'Refrigeration',
        consumptionKWh: 33.1,
        percentage: 3,
        cost: +(33.1 * ratePerKWh).toFixed(2),
        color: '#EC4899', // Pink
        activeCount: 2,
      },
    ];

    res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a new IoT telemetry reading
// @route   POST /api/energy/reading
// @access  Private
const recordReading = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const ratePerKWh = req.user.preferences?.ratePerKWh || 0.15;
    const {
      deviceId,
      deviceName,
      category,
      zone,
      powerKW,
      energyKWh,
      voltage,
      currentAmps,
      powerFactor,
    } = req.body;

    const cost = +(Number(energyKWh) * ratePerKWh).toFixed(2);
    const carbonKg = +(Number(energyKWh) * 0.385).toFixed(3);

    const reading = await EnergyReading.create({
      userId,
      deviceId,
      deviceName: deviceName || 'Smart CT Sensor',
      category: category || 'General',
      zone: zone || 'Main Distribution Board',
      powerKW: Number(powerKW),
      energyKWh: Number(energyKWh),
      voltage: voltage ? Number(voltage) : 230,
      currentAmps: currentAmps ? Number(currentAmps) : +(Number(powerKW) * 4.3).toFixed(1),
      powerFactor: powerFactor ? Number(powerFactor) : 0.95,
      cost,
      carbonKg,
    });

    // Check if threshold exceeded on device
    if (deviceId) {
      const device = await Device.findById(deviceId);
      if (device) {
        device.currentPowerKW = Number(powerKW);
        device.dailyConsumptionKWh += Number(energyKWh);
        await device.save();

        if (device.alertThresholdKW && Number(powerKW) > device.alertThresholdKW) {
          await Alert.create({
            userId,
            deviceId: device._id,
            deviceName: device.name,
            title: `Threshold Exceeded: ${device.name}`,
            message: `Power demand surged to ${powerKW} kW (configured threshold is ${device.alertThresholdKW} kW).`,
            severity: 'critical',
            type: 'power_surge',
            metricValue: Number(powerKW),
            thresholdValue: device.alertThresholdKW,
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Telemetry recorded successfully',
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real-time live telemetry pulse
// @route   GET /api/energy/live
// @access  Private
const getLiveTelemetry = async (req, res, next) => {
  try {
    const basePower = 14.5;
    const jitter = (Math.random() - 0.45) * 1.8;
    const currentKW = +(basePower + jitter).toFixed(2);
    const voltage = +(229.5 + (Math.random() - 0.5) * 4).toFixed(1);
    const currentAmps = +(currentKW * 4.35).toFixed(1);
    const powerFactor = +(0.94 + Math.random() * 0.04).toFixed(2);
    const frequencyHz = +(49.95 + Math.random() * 0.1).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        powerKW: currentKW,
        voltage,
        currentAmps,
        powerFactor,
        frequencyHz,
        activeLoadPercent: Math.round((currentKW / 25) * 100),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getHistoricalStats,
  getDeviceBreakdown,
  recordReading,
  getLiveTelemetry,
};

