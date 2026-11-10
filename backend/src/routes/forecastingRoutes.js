const express = require('express');
const router = express.Router();
const { getForecast, getModelAccuracy } = require('../controllers/forecastingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/predict', getForecast);
router.get('/accuracy', getModelAccuracy);

module.exports = router;

