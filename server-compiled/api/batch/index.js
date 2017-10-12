'use strict';

var express = require('express');
var controller = require('./batch.controller');
var config = require('../../config/environment');
var auth = require('../auth/auth.service');

var router = express.Router();

// All customers
router.get('/all', auth.hasRole('admin'), controller.getAllBatches);

module.exports = router;
//# sourceMappingURL=index.js.map
