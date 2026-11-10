const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: [true, 'Please provide unique Device ID'],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide device name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify device category/type'],
      default: 'Smart Energy Meter',
    },
    building: {
      type: String,
      required: [true, 'Please specify building name'],
      trim: true,
      default: 'Main Facility',
    },
    location: {
      type: String,
      required: [true, 'Please specify location or zone within building'],
      trim: true,
      default: 'Floor 1',
    },
    powerRatingKW: {
      type: Number,
      required: [true, 'Please specify power rating in kW'],
      min: [0.1, 'Power rating must be greater than 0'],
      default: 10.0,
    },
    ratedPowerWatts: {
      type: Number,
      default: function () {
        return (this.powerRatingKW || 10) * 1000;
      },
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'standby', 'maintenance'],
      default: 'online',
      index: true,
    },
    currentPowerKW: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyConsumptionKWh: {
      type: Number,
      default: 0,
      min: 0,
    },
    alertThresholdKW: {
      type: Number,
      default: 15.0,
      min: 0.1,
    },
    ipAddress: {
      type: String,
      default: '192.168.1.100',
    },
    installationDate: {
      type: Date,
      default: Date.now,
    },
    lastCommunication: {
      type: Date,
      default: Date.now,
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

// Compound index for user and deviceId
deviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

// Pre-save hook to keep ratedPowerWatts in sync with powerRatingKW
deviceSchema.pre('save', function (next) {
  if (this.isModified('powerRatingKW')) {
    this.ratedPowerWatts = this.powerRatingKW * 1000;
  } else if (this.isModified('ratedPowerWatts') && !this.isModified('powerRatingKW')) {
    this.powerRatingKW = +(this.ratedPowerWatts / 1000).toFixed(2);
  }
  next();
});

module.exports = mongoose.model('Device', deviceSchema);
