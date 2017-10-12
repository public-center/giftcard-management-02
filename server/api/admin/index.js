'use strict';

const express = require('express');
const controller = require('./admin.controller');
const config = require('../../config/environment');
const auth = require('../auth/auth.service');

const router = express.Router();

import validationRules from './validationRules'

// Get denials since the last time reconciliation was completed
router.get('/denials/begin/:begin/end/:end/:pageSize/:page', auth.hasRole('admin'), controller.getDenials);
// Set card status
router.post('/setCardStatus', auth.hasRole('admin'), controller.setCardStatus);
// Recreate rejection history
router.post('/recreateRejectionHistory', auth.hasRole('admin'), controller.recreateRejectionHistory);
// Add deduction
router.post('/addDeduction', auth.hasRole('admin'), controller.addDeduction);
// Fill in system time
router.post('/systemTime', auth.hasRole('admin'), controller.systemTime);
router.post('/testCallback', controller.testCallback);
// Fix BI log duplications
router.post('/biLog/fixDuplications', auth.hasRole('admin'), controller.fixBiLogDuplications);
// Fix inventory duplications
router.post('/inventory/fixDuplications', auth.hasRole('admin'), controller.fixInventoryDuplications);
// Recalculate transactions
router.post('/recalculate/transactions', auth.hasRole('admin'), controller.recalculateTransactions);
// Seperate out API customers by company
router.post('/lq/customer/fix', auth.hasRole('admin'), controller.fixLqApiCustomerCompany);
// Send payment initiated callbacks
router.put('/callbacks/:type', auth.hasRole('admin', true, validationRules), controller.sendCallbackFromActivity);
// Clean up BI request logs
router.put('/cleanUpBILogs', auth.hasRole('admin'), controller.cleanUpBILogs);
// Send emails
router.post('/sendAccountingEmail/:companyId', auth.hasRole('admin', true, validationRules), controller.sendAccountingEmail);

module.exports = router;
