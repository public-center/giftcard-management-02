'use strict';

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var BuyRateSchema = new Schema({
  // Retailer ID
  retailerId: { type: Schema.Types.ObjectId, ref: 'Retailer' },
  // Store ID
  storeId: { type: Schema.Types.ObjectId, ref: 'Store' },
  // Store buy rate (default to 60%)
  buyRate: { type: Number, default: 0.6 }
});

BuyRateSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('BuyRate', BuyRateSchema);
//# sourceMappingURL=buyRate.model.js.map
