'use strict';
var gulp = require('gulp');
var gls = require('gulp-live-server');
var conf = require('./conf');
var path = require('path');
var server;

gulp.task('express:dev', ['babel', 'copy_server_files'], function() {
  server = gls.new(['--harmony', 'server-compiled/app.js']);
  server.start();
});

gulp.task('express:prod', function() {
  server = gls('server-compiled/app.js', {env: {NODE_ENV: 'production'}});
  server.start();
});

gulp.task('express:watch', function () {
  gulp.watch(path.join(conf.paths.server, '/**/*.js'), ['express:reload']);
});

gulp.task('express:reload', ['babel', 'copy_server_files'], function () {
  server.stop();
  server.start();
});
