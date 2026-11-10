const express = require('express');
const router = express.Router();
const {
  getMeters,
  getMeterById,
  createMeter,
  updateMeter,
  toggleMeterStatus,
  deleteMeter,
} = require('../controllers/meterController');
const {
  protect,
  authorize,
  requireWriteAccess,
  enforceBuildingAccess,
} = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getMeters)
  .post(
    requireWriteAccess,
    authorize('admin', 'manager'),
    enforceBuildingAccess('building'),
    createMeter
  );

router
  .route('/:id')
  .get(getMeterById)
  .put(
    requireWriteAccess,
    authorize('admin', 'manager'),
    updateMeter
  )
  .delete(
    requireWriteAccess,
    authorize('admin'),
    deleteMeter
  );

router.patch(
  '/:id/status',
  requireWriteAccess,
  authorize('admin', 'manager'),
  toggleMeterStatus
);

module.exports = router;

