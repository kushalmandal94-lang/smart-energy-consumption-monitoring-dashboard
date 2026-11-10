const Device = require('../models/Device');
const SmartLoad = require('../models/SmartLoad');

// @desc    Get all devices for current user with search and filtering
// @route   GET /api/devices
// @access  Private
const getDevices = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { search, status, building } = req.query;

    const filter = { userId };

    // Search by device name or device ID
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { deviceId: searchRegex }, { location: searchRegex }];
    }

    // Filter by status
    if (status && status !== 'ALL') {
      filter.status = status.toLowerCase();
    }

    // Filter by building
    if (building && building !== 'ALL') {
      filter.building = building;
    }

    const devices = await Device.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single device by MongoDB _id or deviceId
// @route   GET /api/devices/:id
// @access  Private
const getDeviceById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);

    const query = isObjectId
      ? { _id: req.params.id, userId }
      : { deviceId: req.params.id.toUpperCase(), userId };

    const device = await Device.findOne(query);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    // Fetch smart loads connected to this device
    const connectedLoads = await SmartLoad.find({ deviceId: device._id, userId });

    res.status(200).json({
      success: true,
      data: {
        ...device.toObject(),
        connectedLoads,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new monitored device
// @route   POST /api/devices
// @access  Private
const createDevice = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      deviceId,
      name,
      type,
      building,
      location,
      powerRatingKW,
      ratedPowerWatts,
      alertThresholdKW,
      status,
      ipAddress,
      installationDate,
      notes,
    } = req.body;

    // Generate unique deviceId if not passed
    const generatedDeviceId =
      deviceId && deviceId.trim() !== ''
        ? deviceId.trim().toUpperCase()
        : `DEV-MTR-${Math.floor(100 + Math.random() * 900)}`;

    // Check if deviceId already exists for this user
    const existing = await Device.findOne({ userId, deviceId: generatedDeviceId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Device with ID '${generatedDeviceId}' already exists. Please choose a unique Device ID.`,
      });
    }

    const calculatedKW = Number(powerRatingKW) || (Number(ratedPowerWatts) ? Number(ratedPowerWatts) / 1000 : 10.0);
    const initialPowerKW = status === 'offline' ? 0 : +(calculatedKW * 0.65).toFixed(2);

    const device = await Device.create({
      userId,
      deviceId: generatedDeviceId,
      name,
      type: type || 'Smart Energy Meter',
      building: building || 'Main Facility',
      location: location || 'Floor 1',
      powerRatingKW: calculatedKW,
      ratedPowerWatts: calculatedKW * 1000,
      alertThresholdKW: alertThresholdKW ? Number(alertThresholdKW) : +(calculatedKW * 1.25).toFixed(1),
      status: status || 'online',
      ipAddress: ipAddress || '192.168.1.100',
      installationDate: installationDate ? new Date(installationDate) : new Date(),
      lastCommunication: new Date(),
      currentPowerKW: initialPowerKW,
      dailyConsumptionKWh: +(calculatedKW * 4.2).toFixed(1),
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'IoT device registered successfully',
      data: device,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update device
// @route   PUT /api/devices/:id
// @access  Private
const updateDevice = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      name,
      type,
      building,
      location,
      powerRatingKW,
      ratedPowerWatts,
      alertThresholdKW,
      status,
      ipAddress,
      installationDate,
      notes,
    } = req.body;

    const device = await Device.findOne({
      _id: req.params.id,
      userId,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    if (name) device.name = name;
    if (type) device.type = type;
    if (building) device.building = building;
    if (location) device.location = location;
    if (ipAddress) device.ipAddress = ipAddress;
    if (installationDate) device.installationDate = new Date(installationDate);
    if (notes !== undefined) device.notes = notes;

    if (powerRatingKW !== undefined) {
      device.powerRatingKW = Number(powerRatingKW);
      device.ratedPowerWatts = Number(powerRatingKW) * 1000;
    } else if (ratedPowerWatts !== undefined) {
      device.ratedPowerWatts = Number(ratedPowerWatts);
      device.powerRatingKW = Number(ratedPowerWatts) / 1000;
    }

    if (alertThresholdKW !== undefined) {
      device.alertThresholdKW = Number(alertThresholdKW);
    }

    if (status) {
      device.status = status;
      if (status === 'offline') {
        device.currentPowerKW = 0;
      } else if (device.currentPowerKW === 0) {
        device.currentPowerKW = +(device.powerRatingKW * 0.65).toFixed(2);
      }
    }

    device.lastCommunication = new Date();
    await device.save();

    res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      data: device,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete device
// @route   DELETE /api/devices/:id
// @access  Private
const deleteDevice = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const device = await Device.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    // Clean up or reassign connected smart loads
    await SmartLoad.deleteMany({ deviceId: device._id, userId });

    res.status(200).json({
      success: true,
      message: `Device '${device.name}' (${device.deviceId}) and connected loads removed successfully`,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle device status (online / offline / standby)
// @route   PATCH /api/devices/:id/toggle
// @access  Private
const toggleDeviceStatus = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const device = await Device.findOne({
      _id: req.params.id,
      userId,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    // Cycle between online and offline
    device.status = device.status === 'online' ? 'offline' : 'online';
    if (device.status === 'offline') {
      device.currentPowerKW = 0;
    } else {
      device.currentPowerKW = +(device.powerRatingKW * 0.68).toFixed(2);
      device.lastCommunication = new Date();
    }

    await device.save();

    res.status(200).json({
      success: true,
      message: `Device status changed to ${device.status}`,
      data: device,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregate performance & health statistics across devices and loads
// @route   GET /api/devices/stats/summary
// @access  Private
const getDevicePerformance = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const [devices, loads] = await Promise.all([
      Device.find({ userId }),
      SmartLoad.find({ userId }),
    ]);

    const totalDevices = devices.length;
    const onlineDevices = devices.filter((d) => d.status === 'online').length;
    const offlineDevices = devices.filter((d) => d.status === 'offline').length;
    const standbyDevices = devices.filter((d) => d.status === 'standby').length;
    const maintenanceDevices = devices.filter((d) => d.status === 'maintenance').length;

    const totalLoads = loads.length;
    const activeLoads = loads.filter((l) => l.status === 'ON').length;
    const totalConnectedLoadKW = +devices.reduce((acc, d) => acc + (d.powerRatingKW || 0), 0).toFixed(1);
    const activeLoadDemandKW = +loads
      .filter((l) => l.status === 'ON')
      .reduce((acc, l) => acc + (l.currentPowerKW || 0), 0)
      .toFixed(2);

    // Communication failures: devices with status offline or no communication in last 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 3600 * 1000);
    const communicationFailures = devices.filter(
      (d) => d.status === 'offline' || (d.lastCommunication && new Date(d.lastCommunication) < sixHoursAgo)
    ).length;

    // Status breakdown for Recharts donut
    const statusDistribution = [
      { name: 'Online', value: onlineDevices, color: '#10B981' },
      { name: 'Offline', value: offlineDevices, color: '#EF4444' },
      { name: 'Standby', value: standbyDevices, color: '#F59E0B' },
      { name: 'Maintenance', value: maintenanceDevices, color: '#3B82F6' },
    ];

    // Building breakdown
    const buildingMap = {};
    devices.forEach((d) => {
      const b = d.building || 'Main Facility';
      if (!buildingMap[b]) {
        buildingMap[b] = { building: b, deviceCount: 0, powerRatingKW: 0 };
      }
      buildingMap[b].deviceCount += 1;
      buildingMap[b].powerRatingKW = +(buildingMap[b].powerRatingKW + (d.powerRatingKW || 0)).toFixed(1);
    });

    res.status(200).json({
      success: true,
      data: {
        totalDevices,
        onlineDevices,
        offlineDevices,
        standbyDevices,
        maintenanceDevices,
        totalLoads,
        activeLoads,
        totalConnectedLoadKW,
        activeLoadDemandKW,
        communicationFailures,
        statusDistribution,
        buildingDistribution: Object.values(buildingMap),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  toggleDeviceStatus,
  getDevicePerformance,
};
