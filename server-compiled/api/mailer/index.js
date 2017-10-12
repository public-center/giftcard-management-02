'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _mailer = require('./mailer');

var _mailer2 = _interopRequireDefault(_mailer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mailer2.default.setApiKey(_environment2.default.sgToken);

exports.default = _mailer2.default;
//# sourceMappingURL=index.js.map
