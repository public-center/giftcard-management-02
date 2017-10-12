'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logs = require('../api/log/logs.model');

var _logs2 = _interopRequireDefault(_logs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Target methods to log
var methods = ['POST', 'DELETE', 'PUT', 'PATCH', 'GET'];

exports.default = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res, next) {
    var path, method, _req$body, body, _req$params, params, _req$query, query, statusCode, statusMessage, logParams, optionalTypes;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (!(methods.indexOf(req.method) > -1)) {
              _context.next = 9;
              break;
            }

            path = req.path, method = req.method, _req$body = req.body, body = _req$body === undefined ? {} : _req$body, _req$params = req.params, params = _req$params === undefined ? {} : _req$params, _req$query = req.query, query = _req$query === undefined ? {} : _req$query;
            statusCode = res.statusCode, statusMessage = res.statusMessage;
            logParams = { path: path, method: method, statusCode: statusCode, statusMessage: statusMessage };
            optionalTypes = { body: body, params: params, query: query };
            // Store optionally query, body, params

            _lodash2.default.forEach(optionalTypes, function (value, name) {
              if (Object.keys(value).length) {
                logParams[name] = value;
              }
            });
            _context.next = 9;
            return _logs2.default.create(logParams);

          case 9:
            _context.next = 15;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context['catch'](0);

            console.log('**************ERR IN LOGGER**********');
            console.log(_context.t0);

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 11]]);
  }));

  function logger(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  }

  return logger;
}();
//# sourceMappingURL=logger.js.map
