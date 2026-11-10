const express = require('express');
const router = express.Router();
const {
  getSmartLoads,
  getSmartLoadById,
  createSmartLoad,
  updateSmartLoad,
  deleteSmartLoad,
  toggleSmartLoadStatus,
} = require('../controllers/smartLoadController');
const {
  protect,
  authorize,
  requireWriteAccess,
  enforceBuildingAccess,
} = require('../middleware/auth');
const { smartLoadValidationRules } = require('../middleware/validator');

router.use(protect);

router
  .route('/')
  .get(getSmartLoads)
  .post(
    requireWriteAccess,
    authorize('admin', 'manager'),
    enforceBuildingAccess('building'),
    smartLoadValidationRules,
    createSmartLoad
  );

router
  .route('/:id')
  .get(getSmartLoadById)
  .put(
    requireWriteAccess,
    authorize('admin', 'manager'),
    enforceBuildingAccess('building'),
    smartLoadValidationRules,
    updateSmartLoad
  )
  .delete(
    requireWriteAccess,
    authorize('admin', 'manager'),
    deleteSmartLoad
  );

router.patch(
  '/:id/toggle',
  requireWriteAccess,
  authorize('admin', 'manager'),
  toggleSmartLoadStatus
);

module.exports = router;
