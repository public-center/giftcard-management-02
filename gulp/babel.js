var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');

var path = require('path');

var paths = {
  es6: ['server/**/*.js'],
  es5: 'server-compiled',
  // Must be absolute or relative to source map
  sourceRoot: path.join(__dirname, 'es6'),
};
gulp.task('babel', function () {
  return gulp.src(paths.es6)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ["babel-preset-env"].map(require.resolve),
    }))
    .pipe(sourcemaps.write('.',
      { sourceRoot: paths.sourceRoot }))
    .pipe(gulp.dest(paths.es5));
});

/**
 * Copy non-JS server files
 */
gulp.task('copy_server_files', function () {
  gulp.src('server/**/*.{png,gif,pem}')
    .pipe(gulp.dest('server-compiled/'));
});
