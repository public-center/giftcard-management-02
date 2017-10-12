'use strict';

const express = require('express');
const auth = require('../auth/auth.service');
const controller = require('./tango.controller');

const router = express.Router();

// Authenticate
router.post('/login', controller.authenticate);

// Create tango customer and account
router.post('/create/:companyId', auth.hasRole('admin'), controller.createTangoPair);

// Get retailers
router.get('/retailers', auth.hasRole('employee'), controller.getRetailers);
// Get retailer's cards
router.get('/retailers/:retailerId/cards', auth.hasRole('employee'), controller.getRetailerCards);

// Add a credit card
router.post('/companies/:companyId/cards', auth.hasRole('admin'), controller.addCards);
// Fund an account
router.post('/companies/:companyId/fund', auth.hasRole('admin'), controller.fund);

// Get orders
router.get('/orders', auth.hasRole('employee'), controller.getOrders);
// Create a new order
router.post('/orders', auth.hasRole('employee'), controller.newOrder);
// Get an order by ID
router.get('/orders/:orderId', auth.hasRole('employee'), controller.getOrder);

module.exports = router;
