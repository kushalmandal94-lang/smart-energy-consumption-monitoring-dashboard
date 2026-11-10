const mongoose = require('mongoose');

const energyReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'Daily Energy Consumption',
        'Weekly Energy Summary',
        'Monthly Energy Summary',
        'Building-wise Consumption',
        'Peak Demand Report',
        'Carbon Emissions Report',
        'Energy Efficiency Report',
        'Device Health Report',
        'Maintenance Report',
      ],
      required: true,
    },
    building: {
      type: String,
      default: 'All Buildings',
    },
    dateRange: {
      type: String,
      default: 'Current Month',
    },
    metrics: {
      totalKWh: Number,
      totalCost: Number,
      peakKW: Number,
      avgPowerFactor: Number,
      carbonKg: Number,
      efficiencyScore: Number,
      activeDevices: Number,
    },
    summaryText: {
      type: String,
      default: '',
    },
    generatedBy: {
      type: String,
      default: 'Administrator',
    },
    format: {
      type: String,
      enum: ['PDF', 'CSV', 'JSON'],
      default: 'PDF',
    },
    status: {
      type: String,
      default: 'Ready',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EnergyReport', energyReportSchema);

