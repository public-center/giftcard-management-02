'use strict';

var _user = require('../../user/user.model');

var _user2 = _interopRequireDefault(_user);

var _resetPasswordToken = require('../../user/resetPasswordToken.model');

var _resetPasswordToken2 = _interopRequireDefault(_resetPasswordToken);

var _mailer = require('../../mailer');

var _mailer2 = _interopRequireDefault(_mailer);

var _errorLog = require('../../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../../helpers/errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express');
var router = express.Router();
var config = require('../../../config/environment');

// Token lifespan in milliseconds
var tokenLifespan = 60 * 60 * 1000;

router.post('/', function (req, res, next) {
  var email = req.body.email;


  _user2.default.findOne({ email: email }).then(function (user) {
    if (!user) {
      throw 'notFound';
    }

    var resetPassword = new _resetPasswordToken2.default({
      user: user._id
    });

    var token = resetPassword.generateToken(function () {
      resetPassword.save();
    });

    var resetLink = config.frontendBaseUrl;
    resetLink += 'auth/reset-password?id=' + resetPassword._id;
    resetLink += '&token=' + token;

    _mailer2.default.sendResetPasswordEmail(email, { resetLink: resetLink }, function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(error, response) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!error) {
                  _context.next = 12;
                  break;
                }

                console.log('*****************ERROR WITH SENDGRID*****************');
                console.log(error);

                if (!(error.response && error.response.body && error.response.body.errors)) {
                  _context.next = 10;
                  break;
                }

                console.log('**************ERROR OBJECT**********');
                console.log(error.response.body.errors);
                _context.next = 8;
                return _errorLog2.default.create({
                  method: 'sendResetPasswordEmail',
                  controller: 'auth.forgot',
                  revision: (0, _errors.getGitRev)(),
                  stack: error.stack,
                  error: error.response.body.errors,
                  user: req.user._id
                });

              case 8:
                _context.next = 12;
                break;

              case 10:
                _context.next = 12;
                return _errorLog2.default.create({
                  method: 'sendResetPasswordEmail',
                  controller: 'auth.forgot',
                  revision: (0, _errors.getGitRev)(),
                  stack: error.stack,
                  error: error,
                  user: req.user._id
                });

              case 12:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    setTimeout(function () {
      resetPassword.remove();
    }, tokenLifespan);

    return res.json({});
  }).catch(function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(err) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!(err === 'notFound')) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt('return', res.status(400).json({ error: 'User not found.' }));

            case 2:
              _context2.next = 4;
              return _errorLog2.default.create({
                method: 'forgotpassword',
                controller: 'auth.forgot',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:

              console.log('*****************ERROR IN FORGOTPASSWORD*****************');
              console.log(err);

              return _context2.abrupt('return', res.status(500).json({ error: 'Something went wrong.' }));

            case 7:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x3) {
      return _ref2.apply(this, arguments);
    };
  }());
});

module.exports = router;
//# sourceMappingURL=index.js.map
