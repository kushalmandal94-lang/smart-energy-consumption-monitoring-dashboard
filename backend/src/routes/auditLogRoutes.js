const express = require('express');
const router = express.Router();
const { fetchAuditLogs, getAuditStats } = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/auth');

// Audit logs are strictly restricted to System Administrators
router.use(protect);
router.use(authorize('admin'));

router.get('/', fetchAuditLogs);
router.get('/stats', getAuditStats);

module.exports = router;

