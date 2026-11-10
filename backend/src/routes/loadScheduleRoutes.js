const express = require('express');
const router = express.Router();
const {
  getLoadSchedules,
  getLoadScheduleById,
  createLoadSchedule,
  updateLoadSchedule,
  deleteLoadSchedule,
  toggleScheduleEnabled,
} = require('../controllers/loadScheduleController');
const {
  protect,
  authorize,
  requireWriteAccess,
} = require('../middleware/auth');
const { loadScheduleValidationRules } = require('../middleware/validator');

router.use(protect);

router
  .route('/')
  .get(getLoadSchedules)
  .post(
    requireWriteAccess,
    authorize('admin', 'manager'),
    loadScheduleValidationRules,
    createLoadSchedule
  );

router
  .route('/:id')
  .get(getLoadScheduleById)
  .put(
    requireWriteAccess,
    authorize('admin', 'manager'),
    loadScheduleValidationRules,
    updateLoadSchedule
  )
  .delete(
    requireWriteAccess,
    authorize('admin', 'manager'),
    deleteLoadSchedule
  );

router.patch(
  '/:id/toggle',
  requireWriteAccess,
  authorize('admin', 'manager'),
  toggleScheduleEnabled
);

module.exports = router;
