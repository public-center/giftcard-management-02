'use strict';

var _user = require('../../user/user.model');

var _user2 = _interopRequireDefault(_user);

var _environment = require('../../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

router.post('/', function (req, res, next) {
  var _req$body = req.body,
      forced = _req$body.forced,
      type = _req$body.type,
      password = _req$body.password,
      email = _req$body.email;

  var isDev = _environment2.default.env === 'development';
  var forceLogin = isDev && forced;
  var emailRegex = void 0;
  // Normal login
  if (!forceLogin) {
    emailRegex = new RegExp(email, 'i');
  } else {
    emailRegex = new RegExp(defaultAccounts[type], 'i');
  }
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
});

module.exports = router;
//# sourceMappingURL=index.js.map
