'use strict';

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;


var InventoryParamCache = new Schema({
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
  getCache: function getCache(params) {
    var removed = false;
    return this.findOne({
      beginDate: params.beginDate,
      endDate: params.endDate,
      userRole: params.userRole
    }).then(function (cache) {
      if (cache && cache.created) {
        var now = (0, _moment2.default)();
        var then = (0, _moment2.default)(cache.created);
        var diffHours = _moment2.default.duration(now.diff(then)).asHours();
        // Clear cache after 8 hours
        if (diffHours > 8) {
          removed = true;
          return cache.remove();
        }
      }
      return cache;
    }).then(function (cache) {
      if (cache && !removed) {
        return cache;
      }
      return null;
    });
  },

  // Store cache if we don't have one
  storeCache: function storeCache(params, values) {
    var cache = new this({
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
//# sourceMappingURL=inventoryParamCache.model.js.map
