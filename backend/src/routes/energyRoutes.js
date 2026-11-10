const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getHistoricalStats,
  getDeviceBreakdown,
  recordReading,
  getLiveTelemetry,
} = require('../controllers/energyController');
const { protect } = require('../middleware/auth');
const { readingValidationRules } = require('../middleware/validator');

router.get('/summary', protect, getDashboardSummary);
router.get('/history', protect, getHistoricalStats);
router.get('/device-breakdown', protect, getDeviceBreakdown);
router.get('/live', protect, getLiveTelemetry);
router.post('/reading', protect, readingValidationRules, recordReading);

module.exports = router;

