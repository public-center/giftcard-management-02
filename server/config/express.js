/**
 * Express configuration
 */

'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const compression = require('compression');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const errorHandler = require('errorhandler');
const path = require('path');
const config = require('./environment');
const passport = require('passport');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const cors = require('cors');

module.exports = function(app) {
  app.use(cors());
  const env = app.get('env');

  //app.set('views', config.root + '/server/views');
  //app.engine('html', require('ejs').renderFile);
  //app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(passport.initialize());

  // // Persist sessions with mongoStore
  // // We need to enable sessions for passport twitter because its an oauth 1.0 strategy
  // app.use(session({
  //   secret: config.secrets.session,
  //   resave: true,
  //   saveUninitialized: true,
  //   store: new mongoStore({
  //     mongooseConnection: mongoose.connection,
  //     db: 'test'
  //   })
  // }));

  if ('production' === env) {
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    //app.set('appPath', path.join(config.root, 'client'));
    app.use(errorHandler()); // Error handler - has to be last
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    //app.set('appPath', path.join(config.root, 'client'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};
