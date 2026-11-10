const mongoose = require('mongoose');

const energyReadingSchema = new mongoose.Schema(
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
      index: true,
    },
    deviceName: {
      type: String,
      default: 'Main Meter',
    },
    category: {
      type: String,
      default: 'General',
    },
    zone: {
      type: String,
      default: 'Building A',
    },
    powerKW: {
      type: Number,
      required: true,
      min: 0,
    },
    energyKWh: {
      type: Number,
      required: true,
      min: 0,
    },
    voltage: {
      type: Number,
      default: 230,
    },
    currentAmps: {
      type: Number,
      default: 10,
    },
    powerFactor: {
      type: Number,
      default: 0.95,
      min: 0,
      max: 1.0,
    },
    frequencyHz: {
      type: Number,
      default: 50,
    },
    cost: {
      type: Number,
      default: 0,
    },
    carbonKg: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for time-series queries
energyReadingSchema.index({ userId: 1, timestamp: -1 });
energyReadingSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('EnergyReading', energyReadingSchema);

