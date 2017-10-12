'use strict';

import User from '../../api/user/user.model';
import ResetPasswordToken from '../../api/user/resetPasswordToken.model';

const express = require('express');
const router = express.Router();
const mailer = require('./mailer');
const config = require('../../config/environment');

// Token lifespan in milliseconds
const tokenLifespan = 60 * 60 * 1000;

router.post('/', (req, res, next) => {
  const {email} = req.body;

  User.findOne({email})
  .then(user => {
    if (! user) {
      throw 'notFound';
    }

    const resetPassword = new ResetPasswordToken({
      user: user._id
    });

    const token = resetPassword.generateToken(function () {
      resetPassword.save();
    });

    let resetLink = config.frontendBaseUrl;
    resetLink += 'auth/reset-password?id=' + resetPassword._id;
    resetLink += '&token=' + token;

    mailer.sendResetPasswordEmail(email, {resetLink}, function (error, response) {
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
  })
  .catch(err => {
    if (err === 'notFound') {
      return res.status(400).json({error: 'User not found.'});
    }

    console.log('*****************ERROR IN FORGOTPASSWORD*****************');
    console.log(err);

    return res.status(500).json({error: 'Something went wrong.'});
  });
});

module.exports = router;
