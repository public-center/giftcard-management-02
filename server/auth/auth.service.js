'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const passport = require('passport');
const config = require('../config/environment');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const compose = require('composable-middleware');
const User = require('../api/user/user.model');
const validateJwt = expressJwt({ secret: config.secrets.session });
import _ from 'lodash';
const isValid = mongoose.Types.ObjectId.isValid;
import {invalidObjectId} from '../exceptions/exceptions';
import {checkStructuredValidation} from '../helpers/validation';

/**
 * Check to make sure all ObjectIds are valid
 */
function validateObjectIds(req, res, next) {
  // No params
  if (!req || !req.params) {
    return next();
  }
  let valid = true;
  // Check valid object IDs
  _.forEach(req.params, (val, key) => {
    key = key.toLowerCase();
    const idLength = 2;
    try {
      // Make sure we have a valid object ID
      if (key.substring(key.length - idLength) === 'id') {
        // All is an exception for corporate admin
        if (!isValid(val) && val.toLowerCase() !== 'all') {
          valid = false;
        }
      }
    } catch (e) {
      return next();
    }
  });
  // Invalid ObjectID passed in
  if (!valid) {
    return res.status(invalidObjectId.code).json(invalidObjectId.res);
  }
  next();
}

/**
 * Skip validation of object IDs
 */
function skipObjectIdValidation(req, res, next) {
  next();
}

/**
 * Get validation type for middleware
 * @param args
 * @return {[*,*]}
 */
function getValidationType(args) {
  let ignoreObjectIdValidation = false;
  let structuredValidation = null;
  // Both types of validation
  if (args.length === 2) {
    [ignoreObjectIdValidation, structuredValidation] = args;
  }
  // A single type of validation
  if (args.length) {
    // Just skipping object validation
    if (typeof args[0] === 'boolean') {
      ignoreObjectIdValidation = args[0];
    } else if (_.isPlainObject(args[0])) {
      structuredValidation = args[0];
    }
  }
  return [ignoreObjectIdValidation, structuredValidation];
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  const [ignoreObjectIdValidation, structuredValidation] = getValidationType(arguments);
  const valFn = ignoreObjectIdValidation ? skipObjectIdValidation : validateObjectIds;
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      if (!req.headers.authorization) {
        res.status(401).send('Unauthorized');
        return next();
      }
      try {
        validateJwt(req, res, next)
      } catch (e) {
        next();
      }
    })
    // Attach user to request
    .use(function(req, res, next) {
      const id = req.user ? req.user._id : null;
      User.findById(id, function (err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).send('Unauthorized');
        }
        req.user = user;
        next();
      });
    })
    .use(valFn)
    .use(checkStructuredValidation(structuredValidation));
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }
  const [ignoreObjectIdValidation, structuredValidation] = getValidationType(Array.prototype.slice.call(arguments, 1));
  const valFn = ignoreObjectIdValidation ? skipObjectIdValidation : validateObjectIds;

  return compose()
  .use(isAuthenticated())
  .use(function meetsRequirements(req, res, next) {
    if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
      next();
    } else {
      res.status(403).send('Forbidden');
    }
  })
  // Make sure that corporate admins and employees only modify the companies or stores they're related to
  .use((req, res, next) => {
    // If a corporate admin is requested, and the company is in the request, check to make sure it's the right company
    if (roleRequired === 'corporate-admin' && req.user.role === 'corporate-admin' && req.params.companyId) {
      // Compare requested company with user company
      if (req.user.company.toString() === req.params.companyId) {
        return next();
      } else {
        return res.status(403).send('Incorrect company');
      }
    }
    // Check to make sure the employee is requesting the store they work for
    if (roleRequired === 'employee' && req.user.role === 'employee' && req.params.storeId) {
      if (req.user.store.toString() === req.params.storeId) {
        return next();
      } else {
        return res.status(403).send('Invalid store');
      }
    }
    next();
  })
  .use(valFn)
  .use(checkStructuredValidation(structuredValidation));
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresIn: 86400 });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.status(404).json({ message: 'Something went wrong, please try again.'});
  const token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
