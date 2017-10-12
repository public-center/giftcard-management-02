'use strict';

var express = require('express');
var controller = require('./store.controller');
var config = require('../../config/environment');
var auth = require('../auth/auth.service');

var router = express.Router();
// Get store receipts
router.get('/:storeId/receipts', auth.hasRole('employee'), controller.getReceipts);

module.exports = router;
//# sourceMappingURL=index.js.map
