'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

/**
 * Keep track of all edits to customers
 */
const CustomerEditSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  // Store relationship
  user: [{type: Schema.Types.ObjectId, ref: 'User'}],
  // Edits
  customer: [{type: Schema.Types.ObjectId, ref: 'Customer'}]
});

module.exports = mongoose.model('CustomerEdit', CustomerEditSchema);
