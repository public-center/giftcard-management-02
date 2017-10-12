'use strict';

const express = require('express');
const router = express.Router();

// Search customers
router.get('/', function (req, res) {
  return res.json('test');
});

module.exports = router;
