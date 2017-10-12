'use strict';

const express = require('express');
const controller = require('./customer.controller');
const config = require('../../config/environment');
const auth = require('../auth/auth.service');

const router = express.Router();

// Search customers
router.get('/', auth.isAuthenticated(), controller.searchCustomers);
// All customers
router.get('/all', auth.hasRole('admin'), controller.getAllCustomers);
// Retrieve customer by ID
router.get('/:customerId', auth.isAuthenticated(), controller.findCustomerById);
// Retrieve customers this company
router.get('/company/:companyId', auth.isAuthenticated(), controller.findCustomersThisCompany);
// Retrieve customers this company
router.get('/store/:storeId', auth.isAuthenticated(), controller.getCustomersThisStore);
// Retrieve all customers with denials
router.get('/denials/all', auth.hasRole('admin'), controller.findCustomersWithDenials);
// New customer
router.post('/', auth.isAuthenticated(), controller.newCustomer);
// Assign a customer to an inventory
router.post('/assignCustomer', auth.isAuthenticated(), controller.assignCustomerToCard);
// Update customer
router.post('/:customerId', auth.isAuthenticated(), controller.updateCustomer);
// Update customer total
router.post('/denials/updateTotal', auth.hasRole('admin'), controller.updateCustomerDenialTotal);
// Make a cash payment against denials
router.post('/:customerId/denials/cashPayment', auth.hasRole('employee'), controller.cashPayment);

module.exports = router;
