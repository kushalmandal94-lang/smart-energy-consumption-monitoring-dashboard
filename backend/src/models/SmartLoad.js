const mongoose = require('mongoose');

const smartLoadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: [true, 'Please assign load to a registered IoT device/meter'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide smart load name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify load category'],
      enum: [
        'HVAC',
        'Lighting Systems',
        'Computers & IT',
        'Industrial Motors',
        'Water Pumps',
        'Electric Vehicle Chargers',
        'Other Electrical Equipment',
      ],
      default: 'HVAC',
      index: true,
    },
    building: {
      type: String,
      required: [true, 'Please specify building name'],
      trim: true,
      default: 'Main Facility',
    },
    location: {
      type: String,
      required: [true, 'Please specify location/room/zone'],
      trim: true,
      default: 'Zone A',
    },
    ratedPowerKW: {
      type: Number,
      required: [true, 'Please specify rated power in kW'],
      min: [0.05, 'Rated power must be positive'],
    },
    currentPowerKW: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxLimitKW: {
      type: Number,
      required: [true, 'Please specify maximum power consumption limit in kW'],
      min: [0.1, 'Max limit must be positive'],
    },
    status: {
      type: String,
      enum: ['ON', 'OFF', 'STANDBY', 'TRIPPED'],
      default: 'ON',
      index: true,
    },
    isControllable: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: String,
      enum: ['critical', 'normal', 'sheddable'],
      default: 'normal',
    },
    peakHourShedding: {
      type: Boolean,
      default: false,
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

// Compound index for user and load queries
smartLoadSchema.index({ userId: 1, building: 1 });
smartLoadSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('SmartLoad', smartLoadSchema);

