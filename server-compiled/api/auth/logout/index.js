'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

/**
 * Log the user out
 */
router.get('/', function (req, res) {
  req.user = null;
  return res.json({});
});

module.exports = router;
//# sourceMappingURL=index.js.map
