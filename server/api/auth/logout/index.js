'use strict';

const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');

const router = express.Router();

/**
 * Log the user out
 */
router.get('/', function(req, res) {
  req.user = null;
  return res.json({});
});

module.exports = router;
