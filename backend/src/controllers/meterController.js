const mongoose = require('mongoose');
const Device = require('../models/Device');
const { logAction } = require('../utils/auditLogger');

// Resilient in-memory fallback for meters
const initialMeters = [
  {
    _id: '663c00010001000100010001',
    meterId: 'MTR-HQ-MAIN-01',
    deviceId: 'MTR-HQ-MAIN-01',
    name: 'Main Feeder 3-Phase Energy Meter',
    type: 'Smart Energy Meter',
    building: 'Main Facility',
    location: 'Main Electrical Room - Basement Substation',
    powerRatingKW: 75.0,
    currentPowerKW: 42.8,
    dailyConsumptionKWh: 388.4,
    monthlyConsumptionKWh: 9420.0,
    status: 'online',
    voltage: 238.4,
    currentAmps: 104.2,
    powerFactor: 0.96,
    frequencyHz: 60.0,
    installationDate: new Date('2024-01-15'),
    lastCommunication: new Date(),
    notes: 'Primary revenue-grade meter for HQ campus grid connection',
  },
  {
    _id: '663c00010001000100010002',
    meterId: 'MTR-HQ-HVAC-02',
    deviceId: 'MTR-HQ-HVAC-02',
    name: 'HVAC Chiller Plant Sub-Meter',
    type: 'Smart Energy Meter',
    building: 'Main Facility',
    location: 'Rooftop Mechanical Penthouse',
    powerRatingKW: 45.0,
    currentPowerKW: 24.6,
    dailyConsumptionKWh: 198.2,
    monthlyConsumptionKWh: 4850.0,
    status: 'online',
    voltage: 236.8,
    currentAmps: 58.6,
    powerFactor: 0.94,
    frequencyHz: 59.9,
    installationDate: new Date('2024-02-01'),
    lastCommunication: new Date(),
    notes: 'Monitors centrifugal chillers and primary circulation pumps',
  },
  {
    _id: '663c00010001000100010003',
    meterId: 'MTR-RD-LAB-01',
    deviceId: 'MTR-RD-LAB-01',
    name: 'R&D Cleanroom Clean Power Meter',
    type: 'Smart Energy Meter',
    building: 'Research & Development Center',
    location: 'Floor 2 - High Precision Labs',
    powerRatingKW: 40.0,
    currentPowerKW: 28.4,
    dailyConsumptionKWh: 245.0,
    monthlyConsumptionKWh: 6100.0,
    status: 'online',
    voltage: 240.1,
    currentAmps: 68.2,
    powerFactor: 0.98,
    frequencyHz: 60.0,
    installationDate: new Date('2024-03-10'),
    lastCommunication: new Date(),
    notes: 'Harmonics-filtered power distribution for research equipment',
  },
  {
    _id: '663c00010001000100010004',
    meterId: 'MTR-LOG-COLD-01',
    deviceId: 'MTR-LOG-COLD-01',
    name: 'Cold Storage & Refrigeration Sub-Meter',
    type: 'Smart Energy Meter',
    building: 'Logistics & Warehousing Hub',
    location: 'Dock 4 - Refrigeration Bay',
    powerRatingKW: 60.0,
    currentPowerKW: 38.2,
    dailyConsumptionKWh: 340.5,
    monthlyConsumptionKWh: 8900.0,
    status: 'online',
    voltage: 234.5,
    currentAmps: 92.4,
    powerFactor: 0.92,
    frequencyHz: 60.1,
    installationDate: new Date('2024-04-12'),
    lastCommunication: new Date(),
    notes: 'Sub-meter for blast chillers and temperature controlled storage',
  },
  {
    _id: '663c00010001000100010005',
    meterId: 'MTR-TWR-DATA-01',
    deviceId: 'MTR-TWR-DATA-01',
    name: 'Server Room UPS Energy Meter',
    type: 'Smart Energy Meter',
    building: 'Executive Office Tower',
    location: 'Floor 3 - Server Room',
    powerRatingKW: 30.0,
    currentPowerKW: 16.5,
    dailyConsumptionKWh: 148.0,
    monthlyConsumptionKWh: 3700.0,
    status: 'online',
    voltage: 239.5,
    currentAmps: 39.8,
    powerFactor: 0.99,
    frequencyHz: 60.0,
    installationDate: new Date('2024-05-18'),
    lastCommunication: new Date(),
    notes: 'Dedicated online dual-conversion UPS input/output monitor',
  },
];

const offlineMeters = new Map();
initialMeters.forEach((m) => offlineMeters.set(m.meterId, m));

// @desc    Get all registered energy meters
// @route   GET /api/meters
// @access  Private
const getMeters = async (req, res, next) => {
  try {
    const { building, status, search } = req.query;
    let list = Array.from(offlineMeters.values());

    if (building && building !== 'ALL' && building !== 'All Buildings') {
      list = list.filter((m) => m.building.toLowerCase() === building.toLowerCase());
    }
    if (status && status !== 'ALL') {
      list = list.filter((m) => m.status.toLowerCase() === status.toLowerCase());
    }
    if (search && search.trim() !== '') {
      const term = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.meterId.toLowerCase().includes(term) ||
          m.location.toLowerCase().includes(term)
      );
    }

    // Calculate aggregated metrics
    const totalInstantaneousKW = list.reduce((sum, m) => sum + (m.status === 'online' ? m.currentPowerKW || 0 : 0), 0);
    const totalDailyKWh = list.reduce((sum, m) => sum + (m.dailyConsumptionKWh || 0), 0);
    const onlineCount = list.filter((m) => m.status === 'online').length;
    const offlineCount = list.filter((m) => m.status === 'offline').length;

    res.status(200).json({
      success: true,
      count: list.length,
      metrics: {
        totalInstantaneousKW: +totalInstantaneousKW.toFixed(2),
        totalDailyKWh: +totalDailyKWh.toFixed(2),
        onlineCount,
        offlineCount,
      },
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meter by ID
// @route   GET /api/meters/:id
// @access  Private
const getMeterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meter =
      offlineMeters.get(id.toUpperCase()) ||
      Array.from(offlineMeters.values()).find((m) => m._id === id || m.meterId === id.toUpperCase());

    if (!meter) {
      return res.status(404).json({ success: false, message: 'Energy meter not found' });
    }

    res.status(200).json({ success: true, data: meter });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new energy meter
// @route   POST /api/meters
// @access  Private (Admin, Facility Manager)
const createMeter = async (req, res, next) => {
  try {
    const {
      meterId,
      name,
      building = 'Main Facility',
      location = 'Main Switchboard',
      powerRatingKW = 25.0,
      status = 'online',
      notes = '',
    } = req.body;

    const formattedMeterId = (meterId || `MTR-${Math.floor(1000 + Math.random() * 9000)}`).trim().toUpperCase();

    if (offlineMeters.has(formattedMeterId)) {
      return res.status(400).json({
        success: false,
        message: `Energy meter with ID '${formattedMeterId}' is already registered. Meter IDs must be unique.`,
      });
    }

    const newMeter = {
      _id: new mongoose.Types.ObjectId().toString(),
      meterId: formattedMeterId,
      deviceId: formattedMeterId,
      name: name || `Energy Meter ${formattedMeterId}`,
      type: 'Smart Energy Meter',
      building,
      location,
      powerRatingKW: Number(powerRatingKW) || 25.0,
      currentPowerKW: +(Number(powerRatingKW) * 0.45).toFixed(2),
      dailyConsumptionKWh: +(Number(powerRatingKW) * 2.8).toFixed(2),
      monthlyConsumptionKWh: +(Number(powerRatingKW) * 75.0).toFixed(1),
      status,
      voltage: 238.0,
      currentAmps: +(Number(powerRatingKW) * 2.1).toFixed(1),
      powerFactor: 0.95,
      frequencyHz: 60.0,
      installationDate: new Date(),
      lastCommunication: new Date(),
      notes,
    };

    offlineMeters.set(formattedMeterId, newMeter);

    // Also persist into MongoDB Device collection if ready
    if (mongoose.connection.readyState === 1) {
      try {
        await Device.create({
          userId: req.user._id,
          deviceId: formattedMeterId,
          name: newMeter.name,
          type: 'Smart Energy Meter',
          building,
          location,
          powerRatingKW: newMeter.powerRatingKW,
          status,
          currentPowerKW: newMeter.currentPowerKW,
          dailyConsumptionKWh: newMeter.dailyConsumptionKWh,
          notes,
        });
      } catch (err) {
        console.warn('MongoDB meter mirror deferred:', err.message);
      }
    }

    await logAction({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'METER_REGISTERED',
      entityType: 'meter',
      entityId: formattedMeterId,
      building,
      details: { meterId: formattedMeterId, name: newMeter.name, building },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Energy Meter '${newMeter.name}' (${formattedMeterId}) registered successfully.`,
      data: newMeter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update energy meter
// @route   PUT /api/meters/:id
// @access  Private (Admin, Facility Manager)
const updateMeter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meter =
      offlineMeters.get(id.toUpperCase()) ||
      Array.from(offlineMeters.values()).find((m) => m._id === id || m.meterId === id.toUpperCase());

    if (!meter) {
      return res.status(404).json({ success: false, message: 'Energy meter not found' });
    }

    const { name, building, location, powerRatingKW, status, notes } = req.body;

    if (name) meter.name = name;
    if (building) meter.building = building;
    if (location) meter.location = location;
    if (powerRatingKW !== undefined) meter.powerRatingKW = Number(powerRatingKW);
    if (status) meter.status = status;
    if (notes !== undefined) meter.notes = notes;
    meter.lastCommunication = new Date();

    offlineMeters.set(meter.meterId, meter);

    res.status(200).json({
      success: true,
      message: `Energy Meter '${meter.name}' updated successfully.`,
      data: meter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle meter online / offline status
// @route   PATCH /api/meters/:id/status
// @access  Private (Admin, Facility Manager)
const toggleMeterStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meter =
      offlineMeters.get(id.toUpperCase()) ||
      Array.from(offlineMeters.values()).find((m) => m._id === id || m.meterId === id.toUpperCase());

    if (!meter) {
      return res.status(404).json({ success: false, message: 'Energy meter not found' });
    }

    meter.status = meter.status === 'online' ? 'offline' : 'online';
    meter.lastCommunication = new Date();
    offlineMeters.set(meter.meterId, meter);

    res.status(200).json({
      success: true,
      message: `Meter '${meter.name}' status changed to ${meter.status}.`,
      data: meter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete energy meter
// @route   DELETE /api/meters/:id
// @access  Private (Admin only)
const deleteMeter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meter =
      offlineMeters.get(id.toUpperCase()) ||
      Array.from(offlineMeters.values()).find((m) => m._id === id || m.meterId === id.toUpperCase());

    if (!meter) {
      return res.status(404).json({ success: false, message: 'Energy meter not found' });
    }

    offlineMeters.delete(meter.meterId);

    res.status(200).json({
      success: true,
      message: `Energy Meter '${meter.name}' (${meter.meterId}) removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeters,
  getMeterById,
  createMeter,
  updateMeter,
  toggleMeterStatus,
  deleteMeter,
  offlineMeters,
};

