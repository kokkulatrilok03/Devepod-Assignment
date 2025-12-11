const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireFinanceManager, requireAdmin } = require('../middleware/roleCheck');

const financeController = require('../controllers/financeController');
const insightController = require('../controllers/insightController');
const dashboardController = require('../controllers/dashboardController');
const adminController = require('../controllers/adminController');

router.use(authenticateToken);

router.get('/dashboard', dashboardController.getDashboardData);

router.get('/finance/accounts', financeController.getAccounts);
router.get('/finance/accounts/:id', financeController.getAccount);
router.post('/finance/accounts', requireFinanceManager, financeController.createAccount);
router.put('/finance/accounts/:id', requireFinanceManager, financeController.updateAccount);

router.get('/finance/journal-entries', financeController.getJournalEntries);
router.get('/finance/journal-entries/:id', financeController.getJournalEntry);
router.post('/finance/journal-entries', requireFinanceManager, financeController.createJournalEntry);
router.put('/finance/journal-entries/:id/approve', requireFinanceManager, financeController.approveJournalEntry);

router.get('/finance/invoices', financeController.getInvoices);
router.get('/finance/invoices/:id', financeController.getInvoice);
router.post('/finance/invoices', requireFinanceManager, financeController.createInvoice);

router.get('/finance/payments', financeController.getPayments);
router.post('/finance/payments', requireFinanceManager, financeController.createPayment);

router.get('/finance/reports/balance-sheet', requireFinanceManager, financeController.getBalanceSheet);
router.get('/finance/reports/profit-loss', requireFinanceManager, financeController.getProfitAndLoss);
router.get('/finance/reports/cash-flow', requireFinanceManager, financeController.getCashFlow);

router.get('/finance/customers', financeController.getCustomers);
router.post('/finance/customers', requireFinanceManager, financeController.createCustomer);
router.get('/finance/vendors', financeController.getVendors);
router.post('/finance/vendors', requireFinanceManager, financeController.createVendor);

router.get('/insights/risk/:project_id', insightController.calculateRiskScore);
router.get('/insights/risk', insightController.getAllRiskScores);
router.get('/insights/cash-flow-forecast', insightController.getCashFlowForecast);
router.get('/insights/project-health/:project_id', insightController.getProjectHealth);
router.get('/insights/project-health', insightController.getAllProjectsHealth);

router.get('/admin/users', requireAdmin, adminController.getUsers);
router.get('/admin/users/:id', requireAdmin, adminController.getUser);
router.put('/admin/users/:id', requireAdmin, adminController.updateUser);
router.delete('/admin/users/:id', requireAdmin, adminController.deleteUser);
router.get('/admin/audit-logs', requireAdmin, adminController.getAuditLogs);
router.get('/admin/projects', requireAdmin, adminController.getProjects);
router.post('/admin/projects', requireAdmin, adminController.createProject);
router.put('/admin/projects/:id', requireAdmin, adminController.updateProject);

module.exports = router;

