const LoadSchedule = require('../models/LoadSchedule');
const SmartLoad = require('../models/SmartLoad');

// @desc    Get all load operating schedules
// @route   GET /api/load-schedules
// @access  Private
const getLoadSchedules = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { smartLoadId, isEnabled } = req.query;

    const filter = { userId };
    if (smartLoadId) filter.smartLoadId = smartLoadId;
    if (isEnabled !== undefined) filter.isEnabled = isEnabled === 'true';

    const schedules = await LoadSchedule.find(filter)
      .populate('smartLoadId', 'name type building location status ratedPowerKW isControllable')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single load schedule
// @route   GET /api/load-schedules/:id
// @access  Private
const getLoadScheduleById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const schedule = await LoadSchedule.findOne({ _id: req.params.id, userId }).populate(
      'smartLoadId',
      'name type building location status ratedPowerKW'
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Load schedule not found',
      });
    }

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new operating schedule for smart load
// @route   POST /api/load-schedules
// @access  Private
const createLoadSchedule = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      smartLoadId,
      name,
      startTime,
      endTime,
      daysOfWeek,
      isEnabled,
      peakHourShedding,
      action,
      notes,
    } = req.body;

    // Verify target smart load belongs to user
    const smartLoad = await SmartLoad.findOne({ _id: smartLoadId, userId });
    if (!smartLoad) {
      return res.status(400).json({
        success: false,
        message: 'Target smart load does not exist.',
      });
    }

    const schedule = await LoadSchedule.create({
      userId,
      smartLoadId: smartLoad._id,
      name,
      startTime,
      endTime,
      daysOfWeek: daysOfWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      isEnabled: isEnabled !== undefined ? isEnabled : true,
      peakHourShedding: !!peakHourShedding,
      action: action || 'TURN_ON',
      notes: notes || '',
    });

    const populated = await LoadSchedule.findById(schedule._id).populate(
      'smartLoadId',
      'name type building location status ratedPowerKW'
    );

    res.status(201).json({
      success: true,
      message: 'Operating schedule created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update load schedule
// @route   PUT /api/load-schedules/:id
// @access  Private
const updateLoadSchedule = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      smartLoadId,
      name,
      startTime,
      endTime,
      daysOfWeek,
      isEnabled,
      peakHourShedding,
      action,
      notes,
    } = req.body;

    const schedule = await LoadSchedule.findOne({ _id: req.params.id, userId });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Load schedule not found',
      });
    }

    if (smartLoadId && smartLoadId !== schedule.smartLoadId.toString()) {
      const smartLoad = await SmartLoad.findOne({ _id: smartLoadId, userId });
      if (!smartLoad) {
        return res.status(400).json({
          success: false,
          message: 'Target smart load does not exist.',
        });
      }
      schedule.smartLoadId = smartLoad._id;
    }

    if (name) schedule.name = name;
    if (startTime) schedule.startTime = startTime;
    if (endTime) schedule.endTime = endTime;
    if (daysOfWeek) schedule.daysOfWeek = daysOfWeek;
    if (isEnabled !== undefined) schedule.isEnabled = isEnabled;
    if (peakHourShedding !== undefined) schedule.peakHourShedding = peakHourShedding;
    if (action) schedule.action = action;
    if (notes !== undefined) schedule.notes = notes;

    await schedule.save();

    const populated = await LoadSchedule.findById(schedule._id).populate(
      'smartLoadId',
      'name type building location status ratedPowerKW'
    );

    res.status(200).json({
      success: true,
      message: 'Operating schedule updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete load schedule
// @route   DELETE /api/load-schedules/:id
// @access  Private
const deleteLoadSchedule = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const schedule = await LoadSchedule.findOneAndDelete({ _id: req.params.id, userId });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Load schedule not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Schedule '${schedule.name}' deleted successfully`,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle schedule enabled / disabled
// @route   PATCH /api/load-schedules/:id/toggle
// @access  Private
const toggleScheduleEnabled = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const schedule = await LoadSchedule.findOne({ _id: req.params.id, userId });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Load schedule not found',
      });
    }

    schedule.isEnabled = !schedule.isEnabled;
    await schedule.save();

    const populated = await LoadSchedule.findById(schedule._id).populate(
      'smartLoadId',
      'name type building location status ratedPowerKW'
    );

    res.status(200).json({
      success: true,
      message: `Schedule '${schedule.name}' ${schedule.isEnabled ? 'enabled' : 'disabled'}`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLoadSchedules,
  getLoadScheduleById,
  createLoadSchedule,
  updateLoadSchedule,
  deleteLoadSchedule,
  toggleScheduleEnabled,
};

