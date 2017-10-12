'use strict';

require('../company/autoBuyRate.model');

require('../company/companySettings.model');

require('../inventory/InventoryCache.model');

require('../inventory/inventoryParamCache.model');

require('../log/logs.model');

require('../company/company.model');

require('../card/card.model');

require('../stores/store.model');

require('../reserve/reserve.model');

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../helpers/errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var User = require('./user.model');
var Company = require('../company/company.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');


var validationError = function validationError(res, err) {
  return res.status(422).json(err);
};

// General errors
var generalError = function generalError(err, res) {
  return res.status(500).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {
  var _this = this;

  User.find({}).populate('company').populate('store').then(function (users) {
    return res.status(200).json(users);
  }).catch(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _errorLog2.default.create({
                method: 'index',
                controller: 'user.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context.abrupt('return', res.status(500).json(err));

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
};

/**
 * Creates a new user
 */
exports.create = function (req, res) {
  var _this2 = this;

  var newUser = new User(req.body);
  var token = void 0;
  newUser.provider = 'local';
  newUser.role = req.body.role || 'user';
  newUser.save().then(function (user) {
    return res.json({ token: token });
  }).catch(function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(err) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _errorLog2.default.create({
                method: 'create',
                controller: 'user.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context2.abrupt('return', res.status(500).json(err));

            case 3:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
};

/**
 * Display user details
 */
exports.show = function (req, res) {
  var _this3 = this;

  User.findById(req.params.id).then(function (employee) {
    return res.json(employee);
  }).catch(function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(err) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _errorLog2.default.create({
                method: 'show',
                controller: 'user.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context3.abrupt('return', res.status(500).json(err));

            case 3:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this3);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
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
exports.changePassword = function (req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function (err) {
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
exports.modifyUser = function (req, res) {
  var thisUser = req.user;
  var _req$body = req.body,
      firstName = _req$body.firstName,
      lastName = _req$body.lastName,
      email = _req$body.email,
      password = _req$body.password;
  // Get user

  return User.findById(req.params.id).then(function (employee) {
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
  }).then(function (employee) {
    return res.json(employee);
  }).catch(function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(err) {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              console.log('**************ERROR IN MODIFY USER**********');
              console.log(err);

              if (!(err === 'no-found')) {
                _context4.next = 4;
                break;
              }

              return _context4.abrupt('return', res.status(400).json({
                message: 'Employee not found'
              }));

            case 4:
              if (!(err === 'permissions')) {
                _context4.next = 6;
                break;
              }

              return _context4.abrupt('return', res.status(401).json({
                message: 'Invalid permissions'
              }));

            case 6:
              _context4.next = 8;
              return _errorLog2.default.create({
                method: 'modifyUser',
                controller: 'user.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 8:
              return _context4.abrupt('return', res.status(err).json(err));

            case 9:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    }));

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  }());
};

/**
 * Change a user's role
 */
exports.changeRole = function (req, res) {
  var id = req.params.id;
  var role = req.params.role;
  User.findById(id, function (err, user) {
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
    user.save(function (err) {
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
exports.employee = function (req, res, next) {
  var _this4 = this;

  var userId = req.user._id;
  User.findById(userId).populate('company').populate('store').then(function (employee) {
    return res.json(employee);
  }).catch(function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(err) {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _errorLog2.default.create({
                method: 'employee',
                controller: 'user.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context5.abrupt('return', res.status(400).json(err));

            case 3:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this4);
    }));

    return function (_x5) {
      return _ref5.apply(this, arguments);
    };
  }());
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
  res.redirect('/');
};
//# sourceMappingURL=user.controller.js.map
