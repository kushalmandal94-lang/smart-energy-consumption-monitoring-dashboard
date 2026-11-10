const express = require('express');
const router = express.Router();
const { getSustainabilitySummary } = require('../controllers/sustainabilityController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/summary', getSustainabilitySummary);

module.exports = router;

