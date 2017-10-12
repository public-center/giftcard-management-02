'use strict';

const express = require('express');
const controller = require('./batch.controller');
const config = require('../../config/environment');
const auth = require('../auth/auth.service');

const router = express.Router();

// All customers
router.get('/all', auth.hasRole('admin'), controller.getAllBatches);

module.exports = router;
