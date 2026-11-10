const express = require('express');
const router = express.Router();
const { getDemandResponseAnalysis } = require('../controllers/demandResponseController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/analysis', getDemandResponseAnalysis);

module.exports = router;

