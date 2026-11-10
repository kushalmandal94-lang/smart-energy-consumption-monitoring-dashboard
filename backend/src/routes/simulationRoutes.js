const express = require('express');
const router = express.Router();
const {
  getSimulationStatus,
  startSimulation,
  pauseSimulation,
  stopSimulation,
  triggerPulse,
  injectAnomaly,
} = require('../controllers/simulationController');
const {
  protect,
  authorize,
  requireWriteAccess,
} = require('../middleware/auth');

router.use(protect);

router.get('/status', getSimulationStatus);
router.post('/start', requireWriteAccess, startSimulation);
router.post('/pause', requireWriteAccess, pauseSimulation);
router.post('/stop', requireWriteAccess, stopSimulation);
router.post('/pulse', triggerPulse);
router.post('/inject-anomaly', requireWriteAccess, injectAnomaly);

module.exports = router;

