/**
 * Main application file
 */

'use strict';

require('babel-polyfill');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _logger = require('./config/logger');

var _logger2 = _interopRequireDefault(_logger);

var _debugMongo = require('./config/debugMongo');

var _debugMongo2 = _interopRequireDefault(_debugMongo);

var _runDefers = require('./api/deferredBalanceInquiries/runDefers');

var _runDefers2 = _interopRequireDefault(_runDefers);

var _autoRecon = require('./api/reconciliation/autoRecon');

var _autoRecon2 = _interopRequireDefault(_autoRecon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('source-map-support').install();

// // Register models
// // Company references
// import './api/company/autoBuyRate.model';
// import './api/company/companySettings.model';
// // Inventory references
// import './api/inventory/InventoryCache.model';
// import './api/inventory/inventoryParamCache.model';
// import './api/log/logs.model';
// import './api/company/company.model';
// import './api/card/card.model';
// import './api/stores/store.model';
// import './api/reserve/reserve.mode


// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var config = require('./config/environment');
// Basic logger

// Debug mongoose

(0, _debugMongo2.default)(mongoose);
// Run defers

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function (err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

// Setup server
var app = express();

var server = void 0;
// Run PS without a load balancer, self-signed cert
if (process.env.IS_PS === 'true') {
  var options = {
    key: _fs2.default.readFileSync('./ssl/server.key'),
    cert: _fs2.default.readFileSync('./ssl/server.crt'),
    requestCert: false,
    rejectUnauthorized: false
  };
  server = require('https').createServer(options, app);
} else {
  server = require('http').createServer(app);
}
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});

// Log all requests and responses
app.use(function (req, res, next) {
  res.on('finish', _logger2.default.bind(null, req, res, next));
  next();
});

// Init app
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Run defer if in development or
if (process.env.RUN_DEFER === 'true' || process.env.NODE_ENV === 'development') {
  (0, _runDefers2.default)();
}

if (process.env.AUTO_RECON === 'true' || process.env.NODE_ENV === 'development') {
  (0, _autoRecon2.default)();
}

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
module.exports = app;
//# sourceMappingURL=app.js.map
