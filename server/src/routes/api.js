const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');
const employeeController = require('../controllers/employeeController');
const dashboardController = require('../controllers/dashboardController');
const financeController = require('../controllers/financeController');
const accountController = require('../controllers/accountController');
const inventoryController = require('../controllers/inventoryController');
const taskController = require('../controllers/taskController');
const salesController = require('../controllers/salesController');
const notificationController = require('../controllers/notificationController');
const partnerController = require('../controllers/partnerController');
const paymentController = require('../controllers/paymentController');
const aiController = require('../controllers/aiController');
const settingsController = require('../controllers/settingsController');
const organizationController = require('../controllers/organizationController');
const crmController = require('../controllers/crmController');
const marketingController = require('../controllers/marketingController');
const procurementController = require('../controllers/procurementController');
const expenseController = require('../controllers/expenseController');
const payrollController = require('../controllers/payrollController');
const notificationSettingsController = require('../controllers/notificationSettingsController');
const integrationController = require('../controllers/integrationController');
const teamMemberController = require('../controllers/teamMemberController');
const knowledgeController = require('../controllers/knowledgeController');
const approvalsController = require('../controllers/approvalsController');
const authenticateToken = require('../middleware/auth');
const { checkPermission, isAdmin } = require('../middleware/checkPermission');

// ------------------------------------------
// PUBLIC ROUTES
// ------------------------------------------

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
// Protected auth routes (after authenticateToken middleware)
// router.get('/auth/me', authController.getMe); // Added below after auth middleware

// Partner request (public form)
router.post('/partner', partnerController.submitRequest);

// Testimonials (public)
const testimonialController = require('../controllers/testimonialController');
router.get('/testimonials/random', testimonialController.getTestimonials);

// Public AI Chat (no authentication required)
router.post('/ai/public-chat', aiController.publicAiRateLimiter, ...aiController.publicChat);

// Chapa Webhook (public - no auth required)
router.post('/payments/webhook', paymentController.handleWebhook);

// M-Pesa Callback (public - no auth required)
router.post('/payments/mpesa-callback', paymentController.handleMpesaCallback);

// M-Pesa C2B Validation & Confirmation (public - no auth required)
router.post('/payments/mpesa-validation', paymentController.handleMpesaValidation);
router.post('/payments/mpesa-confirmation', paymentController.handleMpesaConfirmation);

// M-Pesa Account Balance Result Callbacks (public - no auth required)
router.post('/payments/mpesa-balance-result', paymentController.handleMpesaBalanceResult);
router.post('/payments/mpesa-balance-timeout', paymentController.handleMpesaBalanceTimeout);

// M-Pesa Transaction Reversal Result Callbacks (public - no auth required)
router.post('/payments/mpesa-reversal-result', paymentController.handleMpesaReversalResult);
router.post('/payments/mpesa-reversal-timeout', paymentController.handleMpesaReversalTimeout);

// M-Pesa Transaction Status Result Callbacks (public - no auth required)
router.post('/payments/mpesa-status-result', paymentController.handleMpesaStatusResult);
router.post('/payments/mpesa-timeout', paymentController.handleMpesaTimeout);

// Quick Payment (public - no auth required for subscription payments)
router.post('/payments/quick-initialize', paymentController.initializePayment);

// Development only - simulate payment (public for testing)
if (process.env.NODE_ENV !== 'production') {
  router.post('/payments/simulate', paymentController.simulatePayment);
  router.post('/payments/simulate-customer', paymentController.simulateCustomerPayment);
}

// Payment verification (public - no auth required for guest payments)
router.get('/payments/verify/:tx_ref', paymentController.verifyPayment);
router.post('/payments/verify-registration', paymentController.verifyPaymentForRegistration);

// M-Pesa Connection Test (public - no auth required for testing)
router.get('/payments/test-mpesa-connection', paymentController.testMpesaConnection);

// ------------------------------------------
// PROTECTED ROUTES
// ------------------------------------------

router.use(authenticateToken);

// ------------------------------------------
// AUTH - GET CURRENT USER
// ------------------------------------------

router.get('/auth/me', authController.getMe);

// ------------------------------------------
// AI ASSISTANT (Backend-secured Gemini Chat)
// ------------------------------------------

router.post('/ai/chat', aiController.aiRateLimiter, ...aiController.chat);


// ------------------------------------------
// DASHBOARD
// ------------------------------------------

router.get('/dashboard/stats', dashboardController.getStats);

// ------------------------------------------
// SETTINGS
// ------------------------------------------

router.get('/settings/modules', settingsController.getModuleSettings);
router.put('/settings/modules', settingsController.updateModuleSettings);
router.post('/settings/modules/toggle', settingsController.toggleModule);

router.get('/settings/organization', organizationController.getSettings);
router.put('/settings/organization', organizationController.updateSettings);

router.get('/settings/notifications', notificationSettingsController.getSettings);
router.put('/settings/notifications', notificationSettingsController.updateSettings);

router.get('/settings/integrations', integrationController.getIntegrations);
router.post('/settings/integrations', integrationController.connectIntegration);
router.delete('/settings/integrations/:name', integrationController.disconnectIntegration);

// ------------------------------------------
// TEAM MEMBERS (Admin/Manager can manage)
// ------------------------------------------

router.get('/team-members', checkPermission('User Management'), teamMemberController.getTeamMembers);
router.post('/team-members', checkPermission('User Management'), teamMemberController.inviteTeamMember);
router.put('/team-members/:id', checkPermission('User Management'), teamMemberController.updateTeamMember);
router.delete('/team-members/:id', checkPermission('User Management'), teamMemberController.removeTeamMember);

// ------------------------------------------
// ROLES (Admin only)
// ------------------------------------------

router.get('/roles', teamMemberController.getRoles); // Anyone can view roles
router.post('/roles', isAdmin, teamMemberController.createRole);
router.put('/roles/:id', isAdmin, teamMemberController.updateRole);
router.delete('/roles/:id', isAdmin, teamMemberController.deleteRole);
router.get('/team-members/roles', teamMemberController.getRolePermissions); // Legacy

// ------------------------------------------
// KNOWLEDGE BASE
// ------------------------------------------

router.get('/knowledge/articles', knowledgeController.getArticles);
router.get('/knowledge/articles/:id', knowledgeController.getArticle);
router.post('/knowledge/articles', knowledgeController.createArticle);
router.put('/knowledge/articles/:id', knowledgeController.updateArticle);
router.delete('/knowledge/articles/:id', knowledgeController.deleteArticle);
router.get('/knowledge/categories', knowledgeController.getCategories);
router.get('/knowledge/stats', knowledgeController.getStats);

// ------------------------------------------
// APPROVALS (Admin)
// ------------------------------------------

router.get('/approvals/pending', approvalsController.getPendingApprovals);
router.post('/approvals/:id/approve', approvalsController.approveItem);
router.post('/approvals/:id/reject', approvalsController.rejectItem);

// ------------------------------------------
// CRM
// ------------------------------------------

router.get('/crm/leads', crmController.getLeads);
router.post('/crm/leads', crmController.createLead);
router.put('/crm/leads/:id', crmController.updateLead);
router.delete('/crm/leads/:id', crmController.deleteLead);
router.get('/crm/stats', crmController.getStats);

// ------------------------------------------
// MARKETING
// ------------------------------------------

router.get('/marketing/campaigns', marketingController.getCampaigns);
router.post('/marketing/campaigns', marketingController.createCampaign);
router.put('/marketing/campaigns/:id', marketingController.updateCampaign);
router.get('/marketing/stats', marketingController.getStats);

// ------------------------------------------
// PROCUREMENT
// ------------------------------------------

router.get('/procurement/orders', procurementController.getPurchaseOrders);
router.post('/procurement/orders', procurementController.createPurchaseOrder);
router.put('/procurement/orders/:id', procurementController.updatePurchaseOrder);

// ------------------------------------------
// EXPENSES
// ------------------------------------------

router.get('/expenses', expenseController.getExpenses);
router.post('/expenses', expenseController.createExpense);
router.put('/expenses/:id', expenseController.updateExpense);
router.get('/expenses/stats', expenseController.getStats);

// ------------------------------------------
// PAYROLL
// ------------------------------------------

router.get('/payroll', payrollController.getPayrolls);
router.post('/payroll', payrollController.createPayroll);
router.put('/payroll/:id', payrollController.updatePayroll);
router.get('/payroll/stats', payrollController.getStats);

// ------------------------------------------
// EMPLOYEES
// ------------------------------------------

router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/:id', employeeController.getEmployeeById);
router.post('/employees', employeeController.createEmployee);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

// ------------------------------------------
// FINANCE
// ------------------------------------------

router.get('/finance/transactions', financeController.getTransactions);
router.post('/finance/transactions', financeController.createTransaction);
router.put('/finance/transactions/:id', financeController.updateTransaction);
router.delete('/finance/transactions/:id', financeController.deleteTransaction);

// ACCOUNTS
router.get('/finance/accounts', accountController.getAccounts);
router.post('/finance/accounts', accountController.createAccount);
router.put('/finance/accounts/:id', accountController.updateAccount);
router.delete('/finance/accounts/:id', accountController.deleteAccount);

// ------------------------------------------
// INVENTORY
// ------------------------------------------

router.get('/inventory/items', inventoryController.getItems);
router.post('/inventory/items', inventoryController.createItem);

// ------------------------------------------
// TASKS (Todo / Project Management)
// ------------------------------------------

router.get('/tasks', taskController.getTasks);
router.post('/tasks', taskController.createTask);
router.patch('/tasks/:id/status', taskController.updateTaskStatus);

// ------------------------------------------
// SALES
// ------------------------------------------

router.get('/sales/orders', salesController.getOrders);
router.post('/sales/orders', salesController.createOrder);

// ------------------------------------------
// NOTIFICATIONS
// ------------------------------------------

router.get('/notifications', notificationController.getNotifications);
router.post('/notifications/read', notificationController.markRead);

// ------------------------------------------
// PAYMENTS (CHAPA)
// ------------------------------------------

router.get('/payments/config', paymentController.getChapaConfig);
router.post('/payments/initialize', paymentController.initializePayment);
router.get('/payments/history', paymentController.getPaymentHistory);
router.get('/payments/subscription', paymentController.getSubscription);
router.get('/payments/mpesa-stats', paymentController.getMpesaStats);
router.get('/payments/c2b-stats', paymentController.getC2BStats);
router.post('/payments/query-status', paymentController.queryMpesaTransactionStatus);
router.post('/payments/query-balance', paymentController.queryMpesaAccountBalance);
router.post('/payments/reverse-transaction', paymentController.reverseMpesaTransaction);
router.post('/payments/register-urls', paymentController.registerMpesaUrls);
router.post('/payments/simulate-customer-payment', paymentController.simulateCustomerPayment);
router.get('/payments/mpesa-config', paymentController.getMpesaConfiguration);

// ------------------------------------------
// BILLING & SUBSCRIPTIONS
// ------------------------------------------

const billingController = require('../controllers/billingController');

router.get('/billing/overview', billingController.getBillingOverview);
router.post('/billing/upgrade', billingController.upgradePlan);
router.post('/billing/confirm-upgrade', billingController.confirmUpgrade);
router.get('/billing/invoices', billingController.getInvoices);
router.get('/billing/subscription', billingController.getSubscription);
router.post('/billing/cancel', billingController.cancelSubscription);
router.put('/billing/payment-method', billingController.updatePaymentMethod);
router.get('/billing/history', billingController.getBillingHistory);

module.exports = router;
