const mongoose = require('mongoose');

const loadScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    smartLoadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SmartLoad',
      required: [true, 'Please associate schedule with a smart load'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide schedule name'],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time (HH:MM)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide a valid 24-hour time format (HH:MM)'],
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time (HH:MM)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide a valid 24-hour time format (HH:MM)'],
    },
    daysOfWeek: {
      type: [String],
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    isEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    peakHourShedding: {
      type: Boolean,
      default: false,
    },
    action: {
      type: String,
      enum: ['TURN_ON', 'TURN_OFF', 'DIM_50', 'STANDBY'],
      default: 'TURN_ON',
    },
    lastExecutedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

loadScheduleSchema.index({ userId: 1, isEnabled: 1 });

module.exports = mongoose.model('LoadSchedule', loadScheduleSchema);

