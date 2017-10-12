'use strict';

var _user = require('../../user/user.model');

var _user2 = _interopRequireDefault(_user);

var _resetPasswordToken = require('../../user/resetPasswordToken.model');

var _resetPasswordToken2 = _interopRequireDefault(_resetPasswordToken);

var _errorLog = require('../../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../../helpers/errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

router.post('/', function (req, res) {
  var _req$body = req.body,
      id = _req$body.id,
      token = _req$body.token,
      password = _req$body.password,
      confirm = _req$body.confirm;


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID.' });
  }

  if (!token) {
    return res.status(400).json({ error: 'Missing token.' });
  }

  if (password !== confirm) {
    return res.status(400).json({ error: 'Password confirmation does not match.' });
  }

  _resetPasswordToken2.default.findById(id).then(function (resetPasswordToken) {
    if (!resetPasswordToken) {
      throw 'notFound';
    }

    return resetPasswordToken.compareToken(token).then(function (match) {
      if (match) {
        _user2.default.findById(resetPasswordToken.user).then(function (user) {
          user.password = password;
          user.save();

          resetPasswordToken.remove();

          return res.json();
        });
      } else {
        throw 'invalidToken';
      }
    }).catch(function (err) {
      return Promise.reject(err);
    });
  }).catch(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(err === 'notFound')) {
                _context.next = 2;
                break;
              }

              return _context.abrupt('return', res.status(400).json({ error: 'Token not found.' }));

            case 2:
              if (!(err === 'invalidToken')) {
                _context.next = 4;
                break;
              }

              return _context.abrupt('return', res.status(400).json({ error: 'Invalid token.' }));

            case 4:
              _context.next = 6;
              return _errorLog2.default.create({
                method: 'ResetPasswordToken',
                controller: 'auth.reset',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 6:

              console.log('*******************ERROR IN RESET PASSWORD*******************');
              console.log(err);

              return _context.abrupt('return', res.status(500).json({ error: 'Something went wrong.' }));

            case 9:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
});

module.exports = router;
//# sourceMappingURL=index.js.map
