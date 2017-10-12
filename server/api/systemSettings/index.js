const express = require('express');
const router = express.Router();

import config from '../../config/environment';

// Determine if in development environment
router.get('/', function (req, res) {
  return res.json({isDev: config.env === 'development'});
});

module.exports = router;
