'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;
import moment from 'moment';

const InventoryParamCache = new Schema({
  // When original record is created
  created: {
    type: Date,
    default: Date.now
  },
  // Begin date for search
  beginDate: String,
  // End date for search
  endDate: String,
  // User role (since params are different for different views)
  userRole: String,
  // Batches
  batches: Array,
  // Companies
  companies: Array,
  // Stores
  stores: Array
});

InventoryParamCache.statics = {
  /**
   * Retrieve cache if valid
   * @param params
   */
  getCache(params) {
    let removed = false;
    return this.findOne({
      beginDate: params.beginDate,
      endDate: params.endDate,
      userRole: params.userRole
    })
    .then(cache => {
      if (cache && cache.created) {
        const now = moment();
        const then = moment(cache.created);
        const diffHours = moment.duration(now.diff(then)).asHours();
        // Clear cache after 8 hours
        if (diffHours > 8) {
          removed = true;
          return cache.remove();
        }
      }
      return cache;
    })
    .then(cache => {
      if (cache && !removed) {
        return cache;
      }
      return null;
    });
  },
  // Store cache if we don't have one
  storeCache(params, values) {
    const cache = new this({
      beginDate: params.beginDate,
      endDate: params.endDate,
      userRole: params.userRole,
      batches: values.batches,
      companies: values.companies,
      stores: values.stores
    });
    return cache.save();
  }
};

module.exports = mongoose.model('InventoryParamCache', InventoryParamCache);
