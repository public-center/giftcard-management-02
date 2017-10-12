'use strict';

var _local = require('./local');

var _local2 = _interopRequireDefault(_local);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var passport = require('passport');
var config = require('../../config/environment');
var User = require('../user/user.model');
var auth = require('./auth.service');

// Passport Configuration
require('./local/passport').setup(User, config);
//require('./facebook/passport').setup(User, config);
//require('./google/passport').setup(User, config);
//require('./twitter/passport').setup(User, config);

var router = express.Router();

router.use('/local', _local2.default);
// router.use('/local', require('./local'));
//router.use('/facebook', require('./facebook'));
//router.use('/twitter', require('./twitter'));
//router.use('/google', require('./google'));

router.use('/logout', auth.isAuthenticated(), require('./logout'));

router.use('/forgot-password', require('./forgot'));
router.use('/reset-password', require('./reset'));

module.exports = router;
//# sourceMappingURL=index.js.map
