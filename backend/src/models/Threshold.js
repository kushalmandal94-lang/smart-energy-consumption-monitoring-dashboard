const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema(
  {
    building: {
      type: String,
      required: [true, 'Please specify building for threshold rule'],
      trim: true,
      default: 'Main Facility',
    },
    dailyLimitKWh: {
      type: Number,
      required: [true, 'Daily consumption limit (kWh) is required'],
      min: 1,
      default: 450,
    },
    monthlyLimitKWh: {
      type: Number,
      required: [true, 'Monthly consumption limit (kWh) is required'],
      min: 1,
      default: 12000,
    },
    peakDemandLimitKW: {
      type: Number,
      required: [true, 'Peak demand threshold (kW) is required'],
      min: 1,
      default: 55,
    },
    warningThresholdPercent: {
      type: Number,
      default: 80, // Warning generated at 80% of limit
      min: 50,
      max: 95,
    },
    criticalThresholdPercent: {
      type: Number,
      default: 95, // Critical alert generated at 95% of limit
      min: 75,
      max: 100,
    },
    voltageLowerLimitV: {
      type: Number,
      default: 215,
    },
    voltageUpperLimitV: {
      type: Number,
      default: 245,
    },
    minPowerFactor: {
      type: Number,
      default: 0.90,
      min: 0.5,
      max: 1.0,
    },
    alertRecipients: {
      type: [String],
      default: ['admin', 'manager'],
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
    lastTriggeredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Threshold', thresholdSchema);

