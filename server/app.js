/**
 * Main application file
 */

'use strict';

require('source-map-support').install();

import 'babel-polyfill'

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

const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const config = require('./config/environment');
import fs from 'fs';
// Basic logger
import logger from './config/logger';
// Debug mongoose
import debugMongo from './config/debugMongo';
debugMongo(mongoose);
// Run defers
import runDefers from './api/deferredBalanceInquiries/runDefers';
import autoRecon from './api/reconciliation/autoRecon';
// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
	console.error('MongoDB connection error: ' + err);
	process.exit(-1);
	}
);

// Setup server
const app = express();

let server;
// Run PS without a load balancer, self-signed cert
if (process.env.IS_PS === 'true') {
  const options = {
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/server.crt'),
    requestCert: false,
    rejectUnauthorized: false
  };
  server = require('https').createServer(options, app);
} else {
  server = require('http').createServer(app);
}
const socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});

// Log all requests and responses
app.use(function(req, res, next){
  res.on('finish', logger.bind(null, req, res, next));
  next();
});

// Init app
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Run defer if in development or
if (process.env.RUN_DEFER === 'true' || process.env.NODE_ENV === 'development') {
  runDefers();
}

if (process.env.AUTO_RECON === 'true' || process.env.NODE_ENV === 'development') {
  autoRecon();
}

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
module.exports = app;
