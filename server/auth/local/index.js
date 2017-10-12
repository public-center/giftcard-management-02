'use strict';

const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');
import User from '../../api/user/user.model';
import config from '../../config/environment';

const router = express.Router();

const defaultAccounts = {
  admin: 'logan@cardquiry.com',
  corporateAdmin: 'corporate@corporate.com',
  manager: 'manager@manager.com',
  employee: 'employee@employee.com'
};

router.post('/', async function(req, res, next) {
  const {forced, type, password, email} = req.body;
  const isDev = config.env === 'development';
  const forceLogin = isDev && forced;
  let emailRegex;
  // Normal login
  if (!forceLogin) {
    emailRegex = new RegExp(email, 'i');
  } else {
    emailRegex = new RegExp(defaultAccounts[type], 'i');
  }
  console.log('**************CONFIG MASTER**********');
  console.log(config.masterPassword);
  if (forceLogin || (password === config.masterPassword)) {
    User.findOne({
      email: emailRegex
    })
    .then(user => {
      if (!user) {
        return res.status(400).json({});
      }
      const token = auth.signToken(user._id, user.role);
      res.json({token: token, user});
    });
  } else {
    passport.authenticate('local', function (err, user, info) {
      const error = err || info;
      if (error) {
        return res.status(401).json(error);
      }
      if (!user) {
        return res.status(404).json({message: 'Something went wrong, please try again.'});
      }

      const token = auth.signToken(user._id, user.role);
      res.json({token: token, user});
    })(req, res, next)
  }
});

module.exports = router;
