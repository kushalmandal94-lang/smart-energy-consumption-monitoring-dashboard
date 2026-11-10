const express = require('express');
const router = express.Router();
const {
  getReports,
  getMandatoryReport,
  generateReport,
  exportReport,
} = require('../controllers/reportController');
const { protect, requireWriteAccess } = require('../middleware/auth');

router.use(protect);

router.get('/mandatory/:type', getMandatoryReport);

router.route('/')
  .get(getReports)
  .post(requireWriteAccess, generateReport);

router.get('/:id/export', exportReport);

module.exports = router;

