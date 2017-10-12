'use strict';

var _user = require('../../api/user/user.model');

var _user2 = _interopRequireDefault(_user);

var _resetPasswordToken = require('../../api/user/resetPasswordToken.model');

var _resetPasswordToken2 = _interopRequireDefault(_resetPasswordToken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();
var mailer = require('./mailer');
var config = require('../../config/environment');

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

    mailer.sendResetPasswordEmail(email, { resetLink: resetLink }, function (error, response) {
      if (error) {
        console.log('*****************ERROR WITH SENDGRID*****************');
        console.log(error);
        if (error.response && error.response.body && error.response.body.errors) {
          console.log('**************ERROR OBJECT**********');
          console.log(error.response.body.errors);
        }
      }
    });

    setTimeout(function () {
      resetPassword.remove();
    }, tokenLifespan);

    return res.json();
  }).catch(function (err) {
    if (err === 'notFound') {
      return res.status(400).json({ error: 'User not found.' });
    }

    console.log('*****************ERROR IN FORGOTPASSWORD*****************');
    console.log(err);

    return res.status(500).json({ error: 'Something went wrong.' });
  });
});

module.exports = router;
//# sourceMappingURL=index.js.map
