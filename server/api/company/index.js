'use strict';

const express = require('express');
const controller = require('./company.controller');
const config = require('../../config/environment');
const auth = require('../auth/auth.service');

const router = express.Router();

// Get all companies
router.get('/', auth.hasRole('admin'), controller.getAll);
// Get settings for a company
router.get('/:companyId', auth.hasRole('employee'), controller.getCompany);
// Retrieve stores for a company
router.get('/:companyId/store', auth.hasRole('corporate-admin'), controller.getStores);
// Retrieve store details
router.get('/:companyId/store/:storeId', auth.hasRole('employee'), controller.getStoreDetails);
// Get a store with buy rates
router.get('/:companyId/store/:storeId/buyRates', auth.hasRole('employee'), controller.getStoreWithBuyRates);
// Get cards in inventory since the last time added to reconciliation
router.get('/:companyId/store/:storeId/inventory', auth.hasRole('employee'),
  controller.getCardsInInventory);
// Get cards in inventory for corporate admin
router.get('/:companyId/inventory', auth.hasRole('corporate-admin'), controller.getCardsInInventory);
// Get cards in inventory since the last time added to reconciliation
router.get('/:companyId/store/:storeId/reconciliation/current', auth.hasRole('employee'), controller.getCardsInReconciliation);
// Get last reconciliation time for this store
router.get('/:companyId/store/:storeId/reconciliationTime', auth.hasRole('employee'), controller.getLastReconciliationTime);
// Get time reconciliation was last completed for this store
router.get('/:companyId/store/:storeId/reconciliationCompleteTime', auth.hasRole('employee'),
  controller.reconciliationCompleteTime);
// Get denials since the last time reconciliation was completed
router.get('/:companyId/store/:storeId/denials', auth.hasRole('admin'), controller.getDenials);
// Get reconciliation for today
router.get('/:companyId/store/:storeId/reconciliationToday/:today', auth.hasRole('employee'), controller.getReconciliationToday);
/**
 * Admin activity
 */
// Get activity date range
router.get('/activity/begin/:beginDate/end/:endDate/:perPage/:offset', auth.hasRole('employee'), controller.getAllActivityRevised);
// Batches in range
router.get('/activity/getParamsInRange', auth.hasRole('employee'), controller.getParamsInRange);
// Get if there is inventory for this company which needs to be reconciled
router.get('/:companyId/store/:storeId/checkInventoryNeedsReconciled', auth.hasRole('employee'), controller.checkInventoryNeedsReconciled);
// Get store totals for a company
router.get('/:companyId/storeTotals/:begin/:end', auth.hasRole('employee'), controller.getCompanySummary);
// Get receipts
router.get('/:companyId/receipts', auth.hasRole('employee'), controller.getReceipts);
// Search companies
router.post('/', auth.hasRole('admin'), controller.search);
// Create a new company
router.post('/create', auth.hasRole('admin'), controller.create);
// Set API access for a company
router.post('/:companyId/api/:api', auth.hasRole('admin'), controller.setApiAccess);
// Create a new store for a company
router.post('/:companyId/store/new', auth.hasRole('corporate-admin'), controller.newStore);
// Reconcile available cards
router.post('/:companyId/store/:storeId/reconcile', auth.hasRole('employee'), controller.reconcile);
// Mark cards currently in reconciliation as reconciled
router.post('/:companyId/store/:storeId/markAsReconciled', auth.hasRole('employee'), controller.markAsReconciled);
// Perform a manager override
router.post('/:companyId/managerOverride', auth.hasRole('employee'), controller.managerOverride);
// Sell a card which is not auto-sell
router.post('/:companyId/store/:storeId/inventory/:inventoryId/sell', auth.hasRole('employee'), controller.sellNonAutoCard);
// Update company details
router.put('/:companyId', auth.hasRole('corporate-admin'), controller.updateCompany);
// Update a store's details
router.put('/:companyId/store/:storeId/update', auth.hasRole('corporate-admin'), controller.updateStore);
// Update a store's buy rates for a retailer
router.put('/:companyId/store/:storeId/buyRates/:retailerId', auth.hasRole('employee'), controller.updateStoreBuyRates);
// Create a new employee
router.post('/:companyId/store/:storeId/newEmployee', auth.hasRole('manager'), controller.newEmployee);
// Update a company
router.post('/:companyId', auth.hasRole('admin'), controller.updateProfile);
// Update a company's settings
router.post('/:companyId/settings', auth.hasRole('corporate-admin'), controller.updateSettings);
// Delete one or more inventories
router.post('/inventory/delete', auth.hasRole('corporate-admin'), controller.deleteInventories);
// Update a company's auto-buy rates
router.post('/:companyId/settings/autoBuyRates', auth.hasRole('corporate-admin'), controller.updateAutoBuyRates);
// Delete a store
router.delete('/:companyId/store/:storeId', auth.hasRole('corporate-admin'), controller.deleteStore);
// Delete an employee from a store
router.delete('/:companyId/store/:storeId/employee/:employeeId', auth.hasRole('manager'), controller.deleteEmployee);
// Delete an inventory (@todo: Protect this route, currently any inventory can be deleted!)
router.delete('/:companyId/store/:storeId/inventory/:inventoryId', auth.hasRole('employee'), controller.deleteInventory);
// Delete any inventory
router.delete('/inventory/:inventoryId', auth.hasRole('admin'), controller.deleteInventory);
// Change users role
router.put('/:companyId/employee/:userId/:userRole', auth.hasRole('corporate-admin'), controller.updateRole);
module.exports = router;
