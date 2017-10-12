'use strict';

var _user = require('../../api/user/user.model');

var _user2 = _interopRequireDefault(_user);

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');


var router = express.Router();

var defaultAccounts = {
  admin: 'logan@cardquiry.com',
  corporateAdmin: 'corporate@corporate.com',
  manager: 'manager@manager.com',
  employee: 'employee@employee.com'
};

router.post('/', function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res, next) {
    var _req$body, forced, type, password, email, isDev, forceLogin, emailRegex;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _req$body = req.body, forced = _req$body.forced, type = _req$body.type, password = _req$body.password, email = _req$body.email;
            isDev = _environment2.default.env === 'development';
            forceLogin = isDev && forced;
            emailRegex = void 0;
            // Normal login

            if (!forceLogin) {
              emailRegex = new RegExp(email, 'i');
            } else {
              emailRegex = new RegExp(defaultAccounts[type], 'i');
            }
            console.log('**************CONFIG MASTER**********');
            console.log(_environment2.default.masterPassword);
            if (forceLogin || password === _environment2.default.masterPassword) {
              _user2.default.findOne({
                email: emailRegex
              }).then(function (user) {
                if (!user) {
                  return res.status(400).json({});
                }
                var token = auth.signToken(user._id, user.role);
                res.json({ token: token, user: user });
              });
            } else {
              passport.authenticate('local', function (err, user, info) {
                var error = err || info;
                if (error) {
                  return res.status(401).json(error);
                }
                if (!user) {
                  return res.status(404).json({ message: 'Something went wrong, please try again.' });
                }

                var token = auth.signToken(user._id, user.role);
                res.json({ token: token, user: user });
              })(req, res, next);
            }

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());

module.exports = router;
//# sourceMappingURL=index.js.map
