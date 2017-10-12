'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const authTypes = ['github', 'twitter', 'facebook', 'google'];
import createIndexes from '../../config/indexDb';

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: (value) => /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(
        value),
      message: 'Invalid email'
    }
  },
  // Whether employee is active
  enabled: {type: Boolean, default: true, get: function (enabled) {return !!enabled;}},
  role: {
    type: String,
    default: 'employee'
  },
  // Company this user belongs to, if any
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  // Store this user belongs to, if any
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  created: {
    type: Date,
    default: Date.now
  },
  hashedPassword: {
    type: String,
    required: true
  },
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {}
});

// Indexes
const indexes = [
  [{firstName: 1}],
  [{lastName: 1}],
  [{email: 1}, {unique: true}],
  [{store: 1}],
];
createIndexes(UserSchema, indexes);

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema
  .virtual('fullName')
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function () {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

UserSchema
  .virtual('profile')
  .get(function () {
    return {
      '_id': this.id,
      apis: this.apis,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    }
  });

/**
 * Validations
 */

  // Validate empty email
UserSchema
  .path('email')
  .validate(function (email) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return email.length;
  }, 'Email cannot be blank');

// Validate role in type user or admin
UserSchema
  .path('role')
  .validate(function (role) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return ['employee', 'corporate-admin', 'manager', 'admin'].indexOf(role) !== -1;
  }, 'User type must be employee, corporate-admin, manager, or admin');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function (hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function (value, respond) {
    const self = this;
    this.constructor.findOne({email: value}, function (err, user) {
      if (err) {
        throw err;
      }
      if (user) {
        if (self.id === user.id) {
          return respond(true);
        }
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified email address is already in use.');

const validatePresenceOf = function (value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function (next) {
    if (!this.isNew) {
      return next();
    }

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1) {
      next(new Error('Invalid password'));
    } else {
      next();
    }
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function (password) {
    if (!password || !this.salt) {
      return '';
    }
    const salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'SHA1').toString('base64');
  }
};

// Return virtuals
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    delete ret.hashedPassword;
    delete ret.salt;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);
