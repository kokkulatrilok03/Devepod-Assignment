const { requireRole } = require('./auth');
const requireAdmin = requireRole('admin');
const requireFinanceManager = requireRole('admin', 'finance_manager');
const requireProjectManager = requireRole('admin', 'finance_manager', 'project_manager');

module.exports = {
  requireAdmin,
  requireFinanceManager,
  requireProjectManager
};

