'use strict';

var express = require('express');
var controller = require('./card.controller');
var config = require('../../config/environment');
var auth = require('../auth/auth.service');
var multer = require('multer');
var upload = multer({ dest: __dirname + '/uploads/' });

var router = express.Router();

// Retrieve existing cards for this customer
router.get('/:customerId', auth.isAuthenticated(), controller.getExistingCards);
// Retrieve cards for receipt this customer
router.get('/:customerId/receipt', auth.isAuthenticated(), controller.getExistingCardsReceipt);
// Check a card balance
router.post('/balance', auth.isAuthenticated(), controller.checkBalance);
// Update card balance
router.post('/balance/update', auth.isAuthenticated(), controller.updateBalance);
// Input a new card
router.post('/newCard', auth.isAuthenticated(), controller.newCard);
// Upload cards file
router.post('/upload', auth.hasRole('employee'), upload.array('file', 1), controller.uploadCards);
// Upload fixes file
router.post('/upload/fixes', auth.hasRole('employee'), upload.array('file', 1), controller.uploadFixes);
// Edit existing card
router.post('/edit', auth.isAuthenticated(), controller.editCard);
// Add to inventory
router.post('/addToInventory', auth.isAuthenticated(), controller.addToInventory);
// Delete an existing card
router.delete('/:cardId', auth.isAuthenticated(), controller.deleteCard);

/**
 * Admin functions
 */
router.post('/modify', auth.hasRole('admin'), controller.modifyInventory);
// Change any kind of information about a card
router.post('/updateDetails', auth.hasRole('admin'), controller.updateDetails);
// Create fake cards
router.post('/fake', auth.hasRole('employee'), controller.createFakeCards);
// Run BI on cards
router.post('/runBi', auth.hasRole('employee'), controller.runBi);
// Move cards for sale
router.post('/moveForSale', auth.hasRole('employee'), controller.moveForSale);
// Edit balance
router.post('/edit/balance', auth.hasRole('admin'), controller.editBalance);
// Set ship status
if (config.isStaging) {
  router.post('/edit/setCardValue', auth.hasRole('employee'), controller.setCardValue);
} else {
  router.post('/edit/setCardValue', auth.hasRole('admin'), controller.setCardValue);
}
// Mass update catch
router.post('/massUpdate', auth.hasRole('admin'), controller.massUpdate);
// Reject inventories
router.post('/reject', auth.hasRole('admin'), controller.rejectCards);
// Resell cards
router.post('/resell', auth.hasRole('admin'), controller.resellCards);

/**
 * Corporate admin functions
 */
// Set card value from corporate activity page
router.post('/company/:companyId/edit/setCardValue', auth.hasRole('corporate-admin'), controller.setCardValue);
// Mass update inventories from corporate activity page
router.post('/company/:companyId/massUpdate', auth.hasRole('corporate-admin'), controller.massUpdate);

module.exports = router;
//# sourceMappingURL=index.js.map
