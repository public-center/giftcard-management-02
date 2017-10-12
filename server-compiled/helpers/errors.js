'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGitRev = getGitRev;

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get current git revision
 */
function getGitRev() {
  return _child_process2.default.execSync('git rev-parse HEAD').toString().trim();
}
//# sourceMappingURL=errors.js.map
