const express = require('express');
const router = express.Router();
const {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  toggleDeviceStatus,
  getDevicePerformance,
} = require('../controllers/deviceController');
const {
  protect,
  authorize,
  requireWriteAccess,
  enforceBuildingAccess,
} = require('../middleware/auth');
const { deviceValidationRules } = require('../middleware/validator');

router.use(protect);

router.get('/stats/summary', getDevicePerformance);

router
  .route('/')
  .get(getDevices)
  .post(
    requireWriteAccess,
    authorize('admin', 'manager'),
    enforceBuildingAccess('building'),
    deviceValidationRules,
    createDevice
  );

router
  .route('/:id')
  .get(getDeviceById)
  .put(
    requireWriteAccess,
    authorize('admin', 'manager'),
    enforceBuildingAccess('building'),
    deviceValidationRules,
    updateDevice
  )
  .delete(
    requireWriteAccess,
    authorize('admin'), // Only system admin can delete devices
    deleteDevice
  );

router.patch(
  '/:id/toggle',
  requireWriteAccess,
  authorize('admin', 'manager'),
  toggleDeviceStatus
);

module.exports = router;
