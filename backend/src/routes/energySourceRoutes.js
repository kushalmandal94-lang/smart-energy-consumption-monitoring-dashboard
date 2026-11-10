const express = require('express');
const router = express.Router();
const {
  getEnergySources,
  getEnergyBreakdown,
  createEnergySource,
  updateEnergySource,
  deleteEnergySource,
} = require('../controllers/energySourceController');
const {
  protect,
  authorize,
  requireWriteAccess,
  enforceBuildingAccess,
} = require('../middleware/auth');

router.use(protect);

router.get('/breakdown', getEnergyBreakdown);

router
  .route('/')
  .get(getEnergySources)
  .post(
    requireWriteAccess,
    authorize('admin', 'manager'),
    enforceBuildingAccess('building'),
    createEnergySource
  );

router
  .route('/:id')
  .put(
    requireWriteAccess,
    authorize('admin', 'manager'),
    updateEnergySource
  )
  .delete(
    requireWriteAccess,
    authorize('admin'),
    deleteEnergySource
  );

module.exports = router;

