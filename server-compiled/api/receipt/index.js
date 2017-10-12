'use strict';

var express = require('express');
var controller = require('./receipt.controller');
var auth = require('../auth/auth.service');

var router = express.Router();

// Get receipt
router.get('/:receiptId', auth.hasRole('employee'), controller.getReceipt);

module.exports = router;
//# sourceMappingURL=index.js.map
