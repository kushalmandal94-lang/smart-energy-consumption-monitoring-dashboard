const express = require('express');
const router = express.Router();
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getDiagnostics,
} = require('../controllers/maintenanceController');
const { protect, authorize, requireWriteAccess, enforceBuildingAccess } = require('../middleware/auth');

router.use(protect);

router.get('/diagnostics', getDiagnostics);

router.route('/tickets')
  .get(getTickets)
  .post(requireWriteAccess, createTicket);

router.route('/tickets/:id')
  .get(getTicketById)
  .put(requireWriteAccess, updateTicket)
  .delete(authorize('admin'), deleteTicket);

module.exports = router;

