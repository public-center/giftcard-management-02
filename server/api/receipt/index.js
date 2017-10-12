'use strict';

const express = require('express');
const controller = require('./receipt.controller');
const auth = require('../auth/auth.service');

const router = express.Router();

// Get receipt
router.get('/:receiptId', auth.hasRole('employee'), controller.getReceipt);

module.exports = router;
