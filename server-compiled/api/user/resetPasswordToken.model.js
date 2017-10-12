'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var ResetPasswordTokenSchema = new Schema({
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
  generateToken: function generateToken(callback) {
    var _this = this;

    var token = require('crypto').randomBytes(30).toString('hex');
    var saltRounds = 10;

    bcrypt.hash(token, saltRounds).then(function (hash) {
      _this.token = hash;
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
  compareToken: function compareToken(token) {
    return bcrypt.compare(token, this.token);
  }
};

module.exports = mongoose.model('ResetPasswordToken', ResetPasswordTokenSchema);
//# sourceMappingURL=resetPasswordToken.model.js.map
