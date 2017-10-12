'use strict';

const express = require('express');
const controller = require('./user.controller');
const config = require('../../config/environment');
const auth = require('../auth/auth.service');

const router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/me', auth.isAuthenticated(), controller.employee);
router.get('/employee', auth.isAuthenticated(), controller.employee);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id', auth.hasRole('manager'), controller.modifyUser);
router.post('/', auth.hasRole('admin'), controller.create);
router.post('/:id/role/:role', auth.hasRole('admin'), controller.changeRole);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
