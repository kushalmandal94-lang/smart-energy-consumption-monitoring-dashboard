const { getAuditLogs } = require('../utils/auditLogger');

// @desc    Get audit logs (Admin only)
// @route   GET /api/audit-logs
// @access  Private (Admin only)
const fetchAuditLogs = async (req, res, next) => {
  try {
    const { search, action, role, building, limit = 50, page = 1 } = req.query;
    const result = await getAuditLogs({ search, action, role, building, limit, page });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit activity summary metrics
// @route   GET /api/audit-logs/stats
// @access  Private (Admin only)
const getAuditStats = async (req, res, next) => {
  try {
    const result = await getAuditLogs({ limit: 500 });
    const logs = result.logs || [];

    const actionCounts = {};
    const roleCounts = {};

    logs.forEach((l) => {
      actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
      roleCounts[l.userRole] = (roleCounts[l.userRole] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        totalLoggedEvents: result.total,
        actionDistribution: actionCounts,
        roleDistribution: roleCounts,
        securityAlertsCount: logs.filter((l) => l.action.includes('DEACTIVATED') || l.action.includes('DELETED')).length,
        retentionPolicy: '90-Day Rolling Audit Trail',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchAuditLogs,
  getAuditStats,
};

