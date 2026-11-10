const mongoose = require('mongoose');

const maintenanceTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: [true, 'Please provide ticket ID'],
      unique: true,
      uppercase: true,
    },
    deviceId: {
      type: String,
      required: [true, 'Please provide target device ID'],
    },
    deviceName: {
      type: String,
      default: 'Smart Energy Meter',
    },
    building: {
      type: String,
      required: [true, 'Please specify building'],
      trim: true,
    },
    problemDescription: {
      type: String,
      required: [true, 'Please provide problem description'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assignedTechnician: {
      type: String,
      default: 'Unassigned',
    },
    status: {
      type: String,
      enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days default
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      default: 'System Monitor',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);

