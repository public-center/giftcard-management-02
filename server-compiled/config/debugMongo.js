'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = debugMongo;

var _environment = require('./environment');

var _environment2 = _interopRequireDefault(_environment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug mongoose queries if we have environment variable "debug=true"
 * @param mongoose Mongoose instance
 */
function debugMongo(mongoose) {
  mongoose.set('debug', _environment2.default.mongo.debug);
}
//# sourceMappingURL=debugMongo.js.map
