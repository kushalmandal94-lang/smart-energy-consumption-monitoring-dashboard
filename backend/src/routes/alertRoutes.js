const express = require('express');
const router = express.Router();
const {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  createAlert,
  deleteAlert,
} = require('../controllers/alertController');
const { protect, authorize, requireWriteAccess } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getAlerts)
  .post(requireWriteAccess, authorize('admin', 'manager', 'analyst', 'operator'), createAlert);

router.patch(
  '/:id/acknowledge',
  requireWriteAccess,
  authorize('admin', 'manager', 'analyst', 'operator'),
  acknowledgeAlert
);

router.patch(
  '/:id/resolve',
  requireWriteAccess,
  authorize('admin', 'manager', 'analyst', 'operator'),
  resolveAlert
);

router.delete(
  '/:id',
  requireWriteAccess,
  authorize('admin'),
  deleteAlert
);

module.exports = router;
