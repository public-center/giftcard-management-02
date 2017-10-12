'use strict';

const express = require('express');
const passport = require('passport');
const config = require('../../config/environment');
const User = require('../user/user.model');
const auth = require('./auth.service');

import controller from './local';

// Passport Configuration
require('./local/passport').setup(User, config);
//require('./facebook/passport').setup(User, config);
//require('./google/passport').setup(User, config);
//require('./twitter/passport').setup(User, config);

const router = express.Router();

router.use('/local', controller);
// router.use('/local', require('./local'));
//router.use('/facebook', require('./facebook'));
//router.use('/twitter', require('./twitter'));
//router.use('/google', require('./google'));

router.use('/logout', auth.isAuthenticated(), require('./logout'));

router.use('/forgot-password', require('./forgot'));
router.use('/reset-password', require('./reset'));

module.exports = router;
