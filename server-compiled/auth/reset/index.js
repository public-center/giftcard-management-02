'use strict';

var _user = require('../../api/user/user.model');

var _user2 = _interopRequireDefault(_user);

var _resetPasswordToken = require('../../api/user/resetPasswordToken.model');

var _resetPasswordToken2 = _interopRequireDefault(_resetPasswordToken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  }).catch(function (err) {
    console.log(err);
    if (err === 'notFound') {
      return res.status(400).json({ error: 'Token not found.' });
    }

    if (err === 'invalidToken') {
      return res.status(400).json({ error: 'Invalid token.' });
    }

    console.log('*******************ERROR IN RESET PASSWORD*******************');
    console.log(err);

    return res.status(500).json({ error: 'Something went wrong.' });
  });
});

module.exports = router;
//# sourceMappingURL=index.js.map
