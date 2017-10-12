'use strict';

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();

// Determine if in development environment
router.get('/', function (req, res) {
  return res.json({ isDev: _environment2.default.env === 'development' });
});

module.exports = router;
//# sourceMappingURL=index.js.map
