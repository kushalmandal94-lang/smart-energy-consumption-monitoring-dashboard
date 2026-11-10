const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide building name'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide unique building code'],
      uppercase: true,
      trim: true,
      unique: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide building location / address'],
      trim: true,
    },
    totalAreaSqFt: {
      type: Number,
      required: [true, 'Please specify total area in square feet'],
      default: 25000,
    },
    floorCount: {
      type: Number,
      default: 4,
      min: 1,
    },
    capacity: {
      type: Number,
      default: 500,
      min: 1,
    },
    assignedManagers: [
      {
        type: String,
        trim: true,
      },
    ],
    metersCount: {
      type: Number,
      default: 4,
    },
    smartLoadsCount: {
      type: Number,
      default: 6,
    },
    baselineDemandKW: {
      type: Number,
      default: 35.0,
    },
    dailyTargetKWh: {
      type: Number,
      default: 350.0,
    },
    monthlyBudgetLimit: {
      type: Number,
      default: 1800.0,
    },
    efficiencyScore: {
      type: Number,
      default: 88,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'offline'],
      default: 'active',
    },
    solarCapacityKW: {
      type: Number,
      default: 15.0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Building', buildingSchema);

