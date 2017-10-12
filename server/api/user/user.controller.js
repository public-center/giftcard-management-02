'use strict';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

const User = require('./user.model');
const Company = require('../company/company.model');
const passport = require('passport');
const config = require('../../config/environment');
const jwt = require('jsonwebtoken');
import * as _ from 'lodash';

import ErrorLog from '../errorLog/errorLog.model';
import {getGitRev} from '../../helpers/errors';

const validationError = function(res, err) {
  return res.status(422).json(err);
};

// General errors
const generalError = (err, res) => {
  return res.status(500).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({})
    .populate('company')
    .populate('store')
    .then(users => {
      return res.status(200).json(users);
    })
    .catch(async err => {
      await ErrorLog.create({
        method: 'index',
        controller: 'user.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err
      });
      return res.status(500).json(err);
    });
};

/**
 * Creates a new user
 */
exports.create = function (req, res) {
  const newUser = new User(req.body);
  let token;
  newUser.provider = 'local';
  newUser.role = req.body.role || 'user';
  newUser.save()
  .then(user => {
    return res.json({token: token});
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'create',
      controller: 'user.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json(err);
  });
};

/**
 * Display user details
 */
exports.show = function (req, res) {
  User.findById(req.params.id)
  .then((employee) => {
    return res.json(employee);
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'show',
      controller: 'user.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json(err);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function (err, user) {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(204).send();
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  const userId = req.user._id;
  const oldPass = String(req.body.oldPassword);
  const newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) {
          return validationError(res, err);
        }
        return res.status(200).send('');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
 * Modify a user
 * @param req
 * @param res
 */
exports.modifyUser = (req, res) => {
  const thisUser = req.user;
  const {firstName, lastName, email, password} = req.body;
  // Get user
  return User.findById(req.params.id)
  .then(employee => {
    // No employee
    if (!employee) {
      throw 'not-found';
    }
    // Permissions
    if (thisUser.role !== 'admin') {
      if (thisUser.role === 'corporate-admin' && thisUser.company.toString() !== employee.company.toString()) {
        throw 'permissions';
      }
      if (thisUser.role === 'manager' && thisUser.store.toString() !== employee.store.toString()) {
        throw 'permissions';
      }
    }
    // Update props
    employee.firstName = firstName;
    employee.lastName = lastName;
    employee.email = email;
    if (password) {
      delete employee.hashedPassword;
      employee.password = password;
    }
    return employee.save();
  })
  .then((employee) => {
    return res.json(employee);
  })
  .catch(async err => {
    console.log('**************ERROR IN MODIFY USER**********');
    console.log(err);
    if (err === 'no-found') {
      return res.status(400).json({
        message: 'Employee not found'
      });
    }
    // permissions error
    if (err === 'permissions') {
      return res.status(401).json({
        message: 'Invalid permissions'
      });
    }
    await ErrorLog.create({
      method: 'modifyUser',
      controller: 'user.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(err).json(err);
  });
};

/**
 * Change a user's role
 */
exports.changeRole = (req, res) => {
  const id = req.params.id;
  const role = req.params.role;
  User.findById(id, (err, user) => {
    // No user
    if (!user) {
      return res.status(500).json({
        error: 'User not found'
      });
    }
    // Error
    if (err) {
      return res.json(err);
    }
    // Update role and save
    user.role = role;
    user.save((err) => {
      if (err) {
        return validationError(res, err);
      }
      return res.status(200).send();
    });
  });
};

/**
 * Retrieve employee info
 */
exports.employee = function(req, res, next) {
  const userId = req.user._id;
  User.findById(userId)
  .populate('company')
  .populate('store')
  .then((employee) => {
    return res.json(employee);
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'employee',
      controller: 'user.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(400).json(err);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
