const mongoose = require('mongoose');

const energySourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide energy source name'],
      trim: true,
    },
    sourceType: {
      type: String,
      required: [true, 'Please specify energy source type'],
      enum: ['Solar', 'Grid', 'Wind', 'Generator'],
      default: 'Solar',
    },
    category: {
      type: String,
      enum: ['renewable', 'non-renewable'],
      default: 'renewable',
    },
    building: {
      type: String,
      required: [true, 'Please assign source to building or facility'],
      default: 'All Buildings',
    },
    capacityKW: {
      type: Number,
      required: [true, 'Please specify rated capacity in kW'],
      min: 0,
      default: 50.0,
    },
    currentGenerationKW: {
      type: Number,
      default: 0,
      min: 0,
    },
    todayGenerationKWh: {
      type: Number,
      default: 0,
      min: 0,
    },
    monthlyGenerationKWh: {
      type: Number,
      default: 0,
      min: 0,
    },
    efficiencyPercent: {
      type: Number,
      default: 92,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'standby', 'maintenance', 'offline'],
      default: 'active',
    },
    carbonIntensityKgPerKWh: {
      type: Number,
      default: 0,
    },
    fuelOrTechnology: {
      type: String,
      default: 'Monocrystalline Solar PV',
    },
    installationDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-set category based on source type
energySourceSchema.pre('save', function (next) {
  if (['Solar', 'Wind'].includes(this.sourceType)) {
    this.category = 'renewable';
    this.carbonIntensityKgPerKWh = 0;
  } else {
    this.category = 'non-renewable';
    if (this.sourceType === 'Grid') this.carbonIntensityKgPerKWh = 0.42;
    if (this.sourceType === 'Generator') this.carbonIntensityKgPerKWh = 0.76;
  }
  next();
});

module.exports = mongoose.model('EnergySource', energySourceSchema);

