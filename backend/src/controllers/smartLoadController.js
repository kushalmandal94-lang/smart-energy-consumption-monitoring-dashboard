const SmartLoad = require('../models/SmartLoad');
const Device = require('../models/Device');
const LoadSchedule = require('../models/LoadSchedule');

// @desc    Get all smart electrical loads with filtering and search
// @route   GET /api/smart-loads
// @access  Private
const getSmartLoads = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { search, type, building, status, deviceId } = req.query;

    const filter = { userId };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { location: searchRegex }, { notes: searchRegex }];
    }

    if (type && type !== 'ALL') {
      filter.type = type;
    }

    if (building && building !== 'ALL') {
      filter.building = building;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (deviceId && deviceId !== 'ALL') {
      filter.deviceId = deviceId;
    }

    const loads = await SmartLoad.find(filter)
      .populate('deviceId', 'deviceId name building location status powerRatingKW')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: loads.length,
      data: loads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single smart load with its schedules
// @route   GET /api/smart-loads/:id
// @access  Private
const getSmartLoadById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const load = await SmartLoad.findOne({ _id: req.params.id, userId }).populate(
      'deviceId',
      'deviceId name building location status'
    );

    if (!load) {
      return res.status(404).json({
        success: false,
        message: 'Smart load not found',
      });
    }

    const schedules = await LoadSchedule.find({ smartLoadId: load._id, userId });

    res.status(200).json({
      success: true,
      data: {
        ...load.toObject(),
        schedules,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new electrical smart load
// @route   POST /api/smart-loads
// @access  Private
const createSmartLoad = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      deviceId,
      name,
      type,
      building,
      location,
      ratedPowerKW,
      maxLimitKW,
      status,
      isControllable,
      priority,
      peakHourShedding,
      notes,
    } = req.body;

    // Verify parent IoT device exists
    const device = await Device.findOne({ _id: deviceId, userId });
    if (!device) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assigned IoT device. Device does not exist.',
      });
    }

    const ratedKW = Number(ratedPowerKW);
    const maxKW = Number(maxLimitKW) || +(ratedKW * 1.1).toFixed(1);
    const initialStatus = status || 'ON';
    const currentKW = initialStatus === 'ON' ? +(ratedKW * 0.72).toFixed(2) : 0;

    const smartLoad = await SmartLoad.create({
      userId,
      deviceId: device._id,
      name,
      type: type || 'HVAC',
      building: building || device.building || 'Main Facility',
      location: location || device.location || 'Zone A',
      ratedPowerKW: ratedKW,
      currentPowerKW: currentKW,
      maxLimitKW: maxKW,
      status: initialStatus,
      isControllable: isControllable !== undefined ? isControllable : true,
      priority: priority || 'normal',
      peakHourShedding: !!peakHourShedding,
      notes: notes || '',
    });

    const populated = await SmartLoad.findById(smartLoad._id).populate(
      'deviceId',
      'deviceId name building location status'
    );

    res.status(201).json({
      success: true,
      message: 'Smart load registered successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update smart load details
// @route   PUT /api/smart-loads/:id
// @access  Private
const updateSmartLoad = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      name,
      type,
      building,
      location,
      ratedPowerKW,
      maxLimitKW,
      status,
      isControllable,
      priority,
      peakHourShedding,
      deviceId,
      notes,
    } = req.body;

    const load = await SmartLoad.findOne({ _id: req.params.id, userId });

    if (!load) {
      return res.status(404).json({
        success: false,
        message: 'Smart load not found',
      });
    }

    if (deviceId && deviceId !== load.deviceId.toString()) {
      const device = await Device.findOne({ _id: deviceId, userId });
      if (!device) {
        return res.status(400).json({
          success: false,
          message: 'Specified IoT device does not exist.',
        });
      }
      load.deviceId = device._id;
    }

    if (name) load.name = name;
    if (type) load.type = type;
    if (building) load.building = building;
    if (location) load.location = location;
    if (ratedPowerKW !== undefined) load.ratedPowerKW = Number(ratedPowerKW);
    if (maxLimitKW !== undefined) load.maxLimitKW = Number(maxLimitKW);
    if (isControllable !== undefined) load.isControllable = isControllable;
    if (priority) load.priority = priority;
    if (peakHourShedding !== undefined) load.peakHourShedding = peakHourShedding;
    if (notes !== undefined) load.notes = notes;

    if (status) {
      load.status = status;
      if (status === 'OFF') {
        load.currentPowerKW = 0;
      } else if (load.currentPowerKW === 0) {
        load.currentPowerKW = +(load.ratedPowerKW * 0.72).toFixed(2);
      }
    }

    await load.save();

    const populated = await SmartLoad.findById(load._id).populate(
      'deviceId',
      'deviceId name building location status'
    );

    res.status(200).json({
      success: true,
      message: 'Smart load updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete smart load
// @route   DELETE /api/smart-loads/:id
// @access  Private
const deleteSmartLoad = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const load = await SmartLoad.findOneAndDelete({ _id: req.params.id, userId });

    if (!load) {
      return res.status(404).json({
        success: false,
        message: 'Smart load not found',
      });
    }

    // Clean up associated schedules
    await LoadSchedule.deleteMany({ smartLoadId: load._id, userId });

    res.status(200).json({
      success: true,
      message: `Smart load '${load.name}' and associated schedules deleted successfully`,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actuate / toggle smart load relay state (DEMO/Simulation Mode)
// @route   PATCH /api/smart-loads/:id/toggle
// @access  Private
const toggleSmartLoadStatus = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const load = await SmartLoad.findOne({ _id: req.params.id, userId });

    if (!load) {
      return res.status(404).json({
        success: false,
        message: 'Smart load not found',
      });
    }

    if (!load.isControllable) {
      return res.status(400).json({
        success: false,
        message: `Load '${load.name}' is flagged as non-controllable (critical infrastructure lock).`,
      });
    }

    // Toggle status
    const newStatus = load.status === 'ON' ? 'OFF' : 'ON';
    load.status = newStatus;

    if (newStatus === 'OFF') {
      load.currentPowerKW = 0;
    } else {
      // Simulate realistic active power draw around 75% of rated capacity
      const jitter = (Math.random() - 0.5) * 0.1 * load.ratedPowerKW;
      load.currentPowerKW = +Math.max(0.1, load.ratedPowerKW * 0.75 + jitter).toFixed(2);
    }

    await load.save();

    const populated = await SmartLoad.findById(load._id).populate(
      'deviceId',
      'deviceId name building location status'
    );

    res.status(200).json({
      success: true,
      message: `[SIMULATION] Smart load '${load.name}' switched ${newStatus}`,
      isSimulation: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSmartLoads,
  getSmartLoadById,
  createSmartLoad,
  updateSmartLoad,
  deleteSmartLoad,
  toggleSmartLoadStatus,
};

