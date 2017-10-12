'use strict';

var express = require('express');
var controller = require('./retailer.controller');
var config = require('../../config/environment');
var auth = require('../auth/auth.service');
var multer = require('multer');
var upload = multer({ dest: __dirname + '/rates/' });

var router = express.Router();

/**
 * Helpers
 */
// Import retailers
router.get('/import-csv', controller.importCsv);
// Get retailer images
router.get('/retailer-images', controller.retailerImages);
// Save images type to retailer objects
router.get('/retailer-image-types', controller.retailerImageTypes);
// Import URL/phone
router.get('/import-url', controller.addRetailerUrl);

/**
 * Real API calls
 */
// Get retailers associated with a store
router.get('/store/:storeId', auth.isAuthenticated(), controller.getRetailersNew);
// Get retailers associated with a store, with a min value set
router.get('/store/:storeId/min/:minVal', auth.isAuthenticated(), controller.getRetailersNew);
// Get store buy/sell rates as CSV
router.post('/store/:storeId/min/:minVal/csv', auth.isAuthenticated(), function (req, res, next) {
  req.csv = true;
  next();
}, controller.getRetailersNew);
// Query retailers
router.get('/', auth.isAuthenticated(), controller.queryRetailers);
// Get all retailers
router.get('/all', auth.isAuthenticated(), controller.getAllRetailers);
// Get all rates
router.get('/rates', auth.hasRole('admin'), controller.getAllRates);
// BI info
router.get('/biInfo', auth.hasRole('admin'), controller.getBiInfo);
router.post('/biInfo', auth.hasRole('admin'), controller.updateBiInfo);
router.get('/biInfo/csv', auth.hasRole('admin'), controller.biInfoCsv);
// Count the number of retailers by card
router.get('/salesStats', auth.hasRole('admin'), controller.salesStats);
// Create new retailer based on an old one
router.post('/createLike', auth.hasRole('admin'), controller.createNewRetailerBasedOnOldOne);
// Update rates ON LQ API
router.post('/rates/update', auth.hasRole('admin'), controller.updateRates);
// Upload CC doc
router.post('/settings/cc/rates', auth.hasRole('admin'), upload.array('ccRates', 1), controller.uploadCcRatesDoc);
// Upload CardPool doc
router.post('/settings/cp/rates', auth.hasRole('admin'), upload.array('cpRates', 1), controller.uploadCpRatesDoc);
// Upload CardPool electronic/physical retailers doc
router.post('/settings/cp/electronicPhysical', auth.hasRole('admin'), upload.array('cpElectronicPhysical', 1), controller.uploadElectronicPhysical);
// Upload Giftcard Rescue rates
router.post('/settings/gcr/rates', auth.hasRole('admin'), upload.array('rates', 1), controller.uploadGcrRates);
// Upload Giftcard Rescue physical retailers
router.post('/settings/gcr/physical', auth.hasRole('admin'), upload.array('physical', 1), controller.uploadGcrPhysical);
// Upload Giftcard Rescue electronic retailers
router.post('/settings/gcr/electronic', auth.hasRole('admin'), upload.array('electronic', 1), controller.uploadGcrElectronic);
// Change GiftSquirrel ID
router.post('/:retailerId/gsId', auth.hasRole('admin'), controller.setGsId);
// Set retailer prop
router.post('/:retailerId/setProp', auth.hasRole('admin'), controller.setProp);
// Sync GCMGR with BI
router.post('/syncWithBi', auth.hasRole('admin'), controller.syncWithBi);
// Disable retailers for a specific company
router.post('/toggleDisableForCompany', auth.hasRole('admin'), controller.toggleDisableForCompany);
router.post('/createRetailer', auth.hasRole('admin'), controller.createRetailer);

module.exports = router;
//# sourceMappingURL=index.js.map
