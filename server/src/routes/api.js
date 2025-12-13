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
const authenticateToken = require('../middleware/auth');

// ------------------------------------------
// PUBLIC ROUTES
// ------------------------------------------

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Partner request (public form)
router.post('/partner', partnerController.submitRequest);

// Testimonials (public)
const testimonialController = require('../controllers/testimonialController');
router.get('/testimonials/random', testimonialController.getTestimonials);

// Public AI Chat (no authentication required)
router.post('/ai/public-chat', aiController.publicAiRateLimiter, ...aiController.publicChat);

// Chapa Webhook (public - no auth required)
router.post('/payments/webhook', paymentController.handleWebhook);

// Development only - simulate payment (public for testing)
if (process.env.NODE_ENV !== 'production') {
  router.post('/payments/simulate', paymentController.simulatePayment);
}

// ------------------------------------------
// PROTECTED ROUTES
// ------------------------------------------

router.use(authenticateToken);

// ------------------------------------------
// AI ASSISTANT (Backend-secured Gemini Chat)
// ------------------------------------------

router.post('/ai/chat', aiController.aiRateLimiter, ...aiController.chat);


// ------------------------------------------
// DASHBOARD
// ------------------------------------------

router.get('/dashboard/stats', dashboardController.getStats);

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

router.post('/payments/initialize', paymentController.initializePayment);
router.get('/payments/verify/:tx_ref', paymentController.verifyPayment);

module.exports = router;
