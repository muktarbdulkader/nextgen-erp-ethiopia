// Request Validation Middleware
const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Common validation rules
const validations = {
  // User validations
  register: [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    validate
  ],

  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],

  // Employee validations
  createEmployee: [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('position').trim().notEmpty().withMessage('Position is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('salary').isFloat({ min: 0 }).withMessage('Valid salary is required'),
    body('hireDate').isISO8601().withMessage('Valid hire date is required'),
    validate
  ],

  // Transaction validations
  createTransaction: [
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    validate
  ],

  // Inventory validations
  createInventoryItem: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Valid quantity is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('cost').isFloat({ min: 0 }).withMessage('Valid cost is required'),
    validate
  ],

  // Order validations
  createOrder: [
    body('client').trim().notEmpty().withMessage('Client name is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
    validate
  ],

  // ID parameter validation
  idParam: [
    param('id').isMongoId().withMessage('Invalid ID format'),
    validate
  ]
};

module.exports = { validate, validations };
