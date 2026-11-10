const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
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
    },
    deviceName: {
      type: String,
      default: 'Main Facility',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning',
    },
    type: {
      type: String,
      enum: [
        'power_surge',
        'high_consumption',
        'threshold_exceeded',
        'voltage_fluctuation',
        'budget_warning',
        'device_offline',
      ],
      default: 'threshold_exceeded',
    },
    metricValue: {
      type: Number,
    },
    thresholdValue: {
      type: Number,
    },
    isAcknowledged: {
      type: Boolean,
      default: false,
      index: true,
    },
    acknowledgedAt: {
      type: Date,
    },
    acknowledgedBy: {
      type: String,
    },
    isResolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: String,
    },
    building: {
      type: String,
      default: 'Main Facility',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Alert', alertSchema);

