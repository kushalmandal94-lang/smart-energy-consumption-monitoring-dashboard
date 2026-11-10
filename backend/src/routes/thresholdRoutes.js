const express = require('express');
const router = express.Router();
const {
  getThresholds,
  upsertThreshold,
  evaluateThresholds,
} = require('../controllers/thresholdController');
const {
  protect,
  authorize,
  requireWriteAccess,
  enforceBuildingAccess,
} = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getThresholds)
  .post(
    requireWriteAccess,
    authorize('admin', 'manager'),
    enforceBuildingAccess('building'),
    upsertThreshold
  );

router.post('/evaluate', evaluateThresholds);

module.exports = router;

