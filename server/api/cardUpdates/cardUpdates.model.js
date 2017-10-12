'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const CardUpdateSchema = new Schema({
  // Card
  card: {type: Schema.Types.ObjectId, ref: 'Card', required: true},
  // Card number
  number: String,
  // Pin
  pin: String,
  // When original record is created
  created: {
    type: Date,
    default: Date.now
  },
  // Must be one of the strings listed below
  balanceStatus: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(unchecked|deferred|received|bad|manual)$/.test(v);
      },
      message: 'Balance status must be "unchecked," "deferred," or "received"'
    }
  },
  // Whether a card is valid or not. Assumed to be valid until BI returns invalid
  valid: Boolean,
  // Balance
  balance: Number,
  // Store adding the card
  user: [{type: Schema.Types.ObjectId, ref: 'User'}],
  // User checking the card
  customer: {type: Schema.Types.ObjectId, ref: 'Customer'},
  // Retailer
  retailer: {type: Schema.Types.ObjectId, ref: 'Retailer'}
});

module.exports = mongoose.model('CardUpdate', CardUpdateSchema);
