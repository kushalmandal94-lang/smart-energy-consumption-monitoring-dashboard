const mongoose = require('mongoose');
const MaintenanceTicket = require('../models/MaintenanceTicket');
const { logAction } = require('../utils/auditLogger');

// Resilient in-memory store for maintenance tickets
const initialTickets = [
  {
    _id: '663c00010001000100010001',
    ticketId: 'TKT-2026-101',
    deviceId: 'DEV-MTR-101',
    deviceName: 'HVAC Chiller Main Feeder',
    building: 'Main Facility',
    problemDescription: 'Frequent current spikes detected during thermal ramp; power factor fluctuating between 0.81 and 0.94.',
    priority: 'high',
    assignedTechnician: 'Carlos Mendez (Senior Electrician)',
    status: 'In Progress',
    dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
    resolutionNotes: 'Inspected capacitor bank; detected faulty phase B contactor. Replacement scheduled for tomorrow.',
    createdBy: 'Marcus Vance',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    updatedAt: new Date(),
  },
  {
    _id: '663c00010001000100010002',
    ticketId: 'TKT-2026-102',
    deviceId: 'DEV-MTR-104',
    deviceName: 'Server Room UPS Feed B',
    building: 'Research & Development Center',
    problemDescription: 'Intermittent telemetry communication dropouts (3 packet losses in past 6 hours).',
    priority: 'medium',
    assignedTechnician: 'Sarah Jenkins (IoT Systems Tech)',
    status: 'Assigned',
    dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000),
    resolutionNotes: 'Signal strength is -78 dBm. Checking RS-485 Modbus gateway wiring.',
    createdBy: 'Marcus Vance',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    updatedAt: new Date(),
  },
  {
    _id: '663c00010001000100010003',
    ticketId: 'TKT-2026-103',
    deviceId: 'DEV-MTR-108',
    deviceName: 'Hydraulic Press Sub-Meter',
    building: 'Manufacturing & Assembly Plant',
    problemDescription: 'Overload warning: load reached 108% of rated 45 kW capacity during second shift production cycle.',
    priority: 'critical',
    assignedTechnician: 'Dmitri Volkov (Plant Engineer)',
    status: 'Open',
    dueDate: new Date(Date.now() + 1 * 24 * 3600 * 1000),
    resolutionNotes: '',
    createdBy: 'Dr. Elena Rostova',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000),
    updatedAt: new Date(),
  },
  {
    _id: '663c00010001000100010004',
    ticketId: 'TKT-2026-104',
    deviceId: 'DEV-MTR-105',
    deviceName: 'Rooftop Solar Inverter Array',
    building: 'Main Facility',
    problemDescription: 'Routine 6-month calibration and terminal torque inspection.',
    priority: 'low',
    assignedTechnician: 'Carlos Mendez (Senior Electrician)',
    status: 'Resolved',
    dueDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    resolutionNotes: 'All terminals retorqued to 3.5 Nm. Cleaned air filters and confirmed DC-AC efficiency at 97.8%.',
    createdBy: 'Alex Rivera',
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
    resolvedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    updatedAt: new Date(),
  },
];

const offlineTickets = new Map();
initialTickets.forEach((t) => offlineTickets.set(t.ticketId, t));

// Filter tickets by building accessibility
const getScopedTickets = (user) => {
  const all = Array.from(offlineTickets.values());
  if (user.role === 'admin' || user.role === 'operator') return all;
  const assigned = user.assignedBuildings || [];
  if (assigned.includes('All Buildings')) return all;
  return all.filter((t) => assigned.some((a) => a.toLowerCase() === t.building.toLowerCase()));
};

// @desc    Get all maintenance tickets
// @route   GET /api/maintenance/tickets
// @access  Private
const getTickets = async (req, res, next) => {
  try {
    const { status, priority, building, search } = req.query;
    let tickets = getScopedTickets(req.user);

    if (status && status !== 'ALL') tickets = tickets.filter((t) => t.status === status);
    if (priority && priority !== 'ALL') tickets = tickets.filter((t) => t.priority === priority);
    if (building && building !== 'ALL') tickets = tickets.filter((t) => t.building === building);
    if (search && search.trim() !== '') {
      const s = search.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.ticketId.toLowerCase().includes(s) ||
          t.deviceName.toLowerCase().includes(s) ||
          t.problemDescription.toLowerCase().includes(s) ||
          t.assignedTechnician.toLowerCase().includes(s)
      );
    }

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket
// @route   GET /api/maintenance/tickets/:id
// @access  Private
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scoped = getScopedTickets(req.user);
    const ticket = scoped.find((t) => t._id === id || t.ticketId === id.toUpperCase());

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Maintenance ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new maintenance ticket
// @route   POST /api/maintenance/tickets
// @access  Private (Admin, Manager, Operator)
const createTicket = async (req, res, next) => {
  try {
    const { deviceId, deviceName, building, problemDescription, priority, assignedTechnician, dueDate } = req.body;

    const newTicketId = `TKT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket = {
      _id: new mongoose.Types.ObjectId().toString(),
      ticketId: newTicketId,
      deviceId: deviceId || 'DEV-MTR-GEN',
      deviceName: deviceName || 'Monitored Energy Equipment',
      building: building || 'Main Facility',
      problemDescription,
      priority: priority || 'medium',
      assignedTechnician: assignedTechnician || 'Unassigned',
      status: 'Open',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 3 * 24 * 3600 * 1000),
      resolutionNotes: '',
      createdBy: req.user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    offlineTickets.set(newTicket.ticketId, newTicket);

    if (mongoose.connection.readyState === 1) {
      try {
        await MaintenanceTicket.create(newTicket);
      } catch (err) {
        console.warn('MongoDB ticket create notice:', err.message);
      }
    }

    await logAction({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'MAINTENANCE_TICKET_CREATED',
      entityType: 'maintenance',
      entityId: newTicketId,
      building: newTicket.building,
      details: { ticketId: newTicketId, priority: newTicket.priority, problem: newTicket.problemDescription },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Maintenance Ticket '${newTicketId}' created successfully.`,
      data: newTicket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status, technician, or notes
// @route   PUT /api/maintenance/tickets/:id
// @access  Private (Admin, Manager, Operator)
const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = Array.from(offlineTickets.values()).find((t) => t._id === id || t.ticketId === id.toUpperCase());

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Maintenance ticket not found' });
    }

    const { status, assignedTechnician, priority, resolutionNotes, dueDate } = req.body;

    if (status) {
      ticket.status = status;
      if (status === 'Resolved' || status === 'Closed') {
        ticket.resolvedAt = new Date();
      }
    }
    if (assignedTechnician) ticket.assignedTechnician = assignedTechnician;
    if (priority) ticket.priority = priority;
    if (resolutionNotes !== undefined) ticket.resolutionNotes = resolutionNotes;
    if (dueDate) ticket.dueDate = new Date(dueDate);
    ticket.updatedAt = new Date();

    offlineTickets.set(ticket.ticketId, ticket);

    await logAction({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'MAINTENANCE_TICKET_UPDATED',
      entityType: 'maintenance',
      entityId: ticket.ticketId,
      building: ticket.building,
      details: { status: ticket.status, technician: ticket.assignedTechnician },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Ticket '${ticket.ticketId}' updated successfully.`,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ticket (Admin only)
// @route   DELETE /api/maintenance/tickets/:id
// @access  Private (Admin only)
const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = Array.from(offlineTickets.values()).find((t) => t._id === id || t.ticketId === id.toUpperCase());

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    offlineTickets.delete(ticket.ticketId);

    res.status(200).json({
      success: true,
      message: `Maintenance ticket '${ticket.ticketId}' removed.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Predictive Maintenance Health Diagnostics Scanner
// @route   GET /api/maintenance/diagnostics
// @access  Private
const getDiagnostics = async (req, res, next) => {
  try {
    const diagnosticFindings = [
      {
        deviceId: 'DEV-MTR-101',
        deviceName: 'HVAC Chiller Main Feeder',
        building: 'Main Facility',
        riskLevel: 'High Risk',
        diagnosticType: 'Transient Harmonic Distortion & Thermal Drift',
        anomalyDetail: 'Detected 4 repetitive phase angle deviations in 12 hours. Current harmonics THD-I reached 7.8% (standard is < 5%).',
        isHardwareFault: false, // clearly distinguished
        classification: 'Operational Warning (Pre-Fault Indication)',
        actionRecommendation: 'Inspect cooling fan and capacitor banks within 48 hours to avoid compressor lockout.',
        suggestedTicketPriority: 'high',
      },
      {
        deviceId: 'DEV-MTR-108',
        deviceName: 'Hydraulic Press Sub-Meter',
        building: 'Manufacturing & Assembly Plant',
        riskLevel: 'Critical Risk',
        diagnosticType: 'Repeated Overload & Current Saturation',
        anomalyDetail: 'Overcurrent threshold (120A) exceeded 6 times during heavy stamping cycles.',
        isHardwareFault: false,
        classification: 'Process Overload Warning',
        actionRecommendation: 'Distribute mechanical load cycle or stagger duty schedule during shift start.',
        suggestedTicketPriority: 'critical',
      },
      {
        deviceId: 'DEV-MTR-104',
        deviceName: 'Server Room UPS Feed B',
        building: 'Research & Development Center',
        riskLevel: 'Medium Risk',
        diagnosticType: 'Modbus RS-485 Communication Packet Loss',
        anomalyDetail: 'Repeated telemetry packet timeouts (99.1% packet success instead of 99.99%).',
        isHardwareFault: true, // confirmed hardware wire issue
        classification: 'Confirmed Communication Hardware Issue',
        actionRecommendation: 'Replace terminating resistor or inspect shielded twisted-pair grounding cable.',
        suggestedTicketPriority: 'medium',
      },
      {
        deviceId: 'DEV-MTR-105',
        deviceName: 'Rooftop Solar Inverter Array',
        building: 'Main Facility',
        riskLevel: 'Low Risk',
        diagnosticType: 'Healthy Baseline',
        anomalyDetail: 'All voltage, frequency, and MPPT tracking parameters within optimal IEEE 1547 tolerances.',
        isHardwareFault: false,
        classification: 'Nominal Condition',
        actionRecommendation: 'No maintenance action needed. Next scheduled visual inspection in 90 days.',
        suggestedTicketPriority: 'low',
      },
    ];

    const stats = {
      monitoredEquipments: 12,
      criticalRisks: 1,
      highRisks: 1,
      mediumRisks: 1,
      healthyEquipments: 9,
      equipmentHealthScore: 89,
    };

    res.status(200).json({
      success: true,
      data: {
        stats,
        findings: diagnosticFindings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getDiagnostics,
};

