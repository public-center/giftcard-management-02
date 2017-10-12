'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _exceptions = require('../exceptions/exceptions');

var _validation = require('../helpers/validation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var validateJwt = expressJwt({ secret: config.secrets.session });

var isValid = mongoose.Types.ObjectId.isValid;


/**
 * Check to make sure all ObjectIds are valid
 */
function validateObjectIds(req, res, next) {
  // No params
  if (!req || !req.params) {
    return next();
  }
  var valid = true;
  // Check valid object IDs
  _lodash2.default.forEach(req.params, function (val, key) {
    key = key.toLowerCase();
    var idLength = 2;
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
    return res.status(_exceptions.invalidObjectId.code).json(_exceptions.invalidObjectId.res);
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
  var ignoreObjectIdValidation = false;
  var structuredValidation = null;
  // Both types of validation
  if (args.length === 2) {
    var _args = _slicedToArray(args, 2);

    ignoreObjectIdValidation = _args[0];
    structuredValidation = _args[1];
  }
  // A single type of validation
  if (args.length) {
    // Just skipping object validation
    if (typeof args[0] === 'boolean') {
      ignoreObjectIdValidation = args[0];
    } else if (_lodash2.default.isPlainObject(args[0])) {
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
  var _getValidationType = getValidationType(arguments),
      _getValidationType2 = _slicedToArray(_getValidationType, 2),
      ignoreObjectIdValidation = _getValidationType2[0],
      structuredValidation = _getValidationType2[1];

  var valFn = ignoreObjectIdValidation ? skipObjectIdValidation : validateObjectIds;
  return compose()
  // Validate jwt
  .use(function (req, res, next) {
    // allow access_token to be passed through query parameter as well
    if (req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    }
    if (!req.headers.authorization) {
      res.status(401).send('Unauthorized');
      return next();
    }
    try {
      validateJwt(req, res, next);
    } catch (e) {
      next();
    }
  })
  // Attach user to request
  .use(function (req, res, next) {
    var id = req.user ? req.user._id : null;
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
  }).use(valFn).use((0, _validation.checkStructuredValidation)(structuredValidation));
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  var _getValidationType3 = getValidationType(Array.prototype.slice.call(arguments, 1)),
      _getValidationType4 = _slicedToArray(_getValidationType3, 2),
      ignoreObjectIdValidation = _getValidationType4[0],
      structuredValidation = _getValidationType4[1];

  var valFn = ignoreObjectIdValidation ? skipObjectIdValidation : validateObjectIds;

  return compose().use(isAuthenticated()).use(function meetsRequirements(req, res, next) {
    if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
      next();
    } else {
      res.status(403).send('Forbidden');
    }
  })
  // Make sure that corporate admins and employees only modify the companies or stores they're related to
  .use(function (req, res, next) {
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
  }).use(valFn).use((0, _validation.checkStructuredValidation)(structuredValidation));
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
  if (!req.user) return res.status(404).json({ message: 'Something went wrong, please try again.' });
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
//# sourceMappingURL=auth.service.js.map
