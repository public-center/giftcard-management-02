'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getActiveSmps = getActiveSmps;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _environment = require('../config/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getActiveSmps() {
  var enabledIds = _lodash2.default.difference(_lodash2.default.keys(_environment.smpNames), _lodash2.default.keys(_environment.disabledSmps));
  return _lodash2.default.values(_lodash2.default.pick(_environment.smpNames, enabledIds));
}
//# sourceMappingURL=smp.js.map
