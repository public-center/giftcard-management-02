'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const ResetPasswordTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ResetPasswordTokenSchema.methods = {
  /**
   * Generates a token for the current instance
   *
   * @return {String}
   */
  generateToken: function (callback) {
    const token = require('crypto').randomBytes(30).toString('hex');
    const saltRounds = 10;

    bcrypt.hash(token, saltRounds).then(hash => {
      this.token = hash;
      callback();
    });

    return token;
  },

  /**
   * Compares the given token with the stored hash
   *
   * @param {String} token
   * @return {Promise}
   */
  compareToken: function (token) {
    return bcrypt.compare(token, this.token);
  }
};

module.exports = mongoose.model('ResetPasswordToken', ResetPasswordTokenSchema);
