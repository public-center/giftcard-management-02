'use strict';

var Mocha = require('mocha');
var fs = require('fs');
require('babel-polyfill');
require('babel-core/register');
var mocha = new Mocha();
require('./app');

// Filter tests based on string
var testFilter = process.env.TEST;

var walkSync = function walkSync(dir, filelist) {
  var theseFiles = fs.readdirSync(dir);
  filelist = filelist || [];
  theseFiles.forEach(function (file) {
    // Iterate sub-directories
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    } else {
      // Add tests
      if (/controller.test/.test(file)) {
        if (typeof testFilter === 'string') {
          var filter = new RegExp(testFilter, 'i');
          if (filter.test(file)) {
            filelist.push(dir + '/' + file);
          }
        } else {
          filelist.push(dir + '/' + file);
        }
      }
    }
  });
  return filelist;
};

// Compile list of tests
var fileList = walkSync('server/api');

// Add tests to mocha
fileList.forEach(function (file) {
  mocha.addFile(file);
});

// Run the tests.
var runner = mocha.run(function (failures) {
  process.on('exit', function () {
    process.exit(failures); // exit with non-zero status if there were failures
  });
});

runner.on('end', function () {
  process.exit(1);
});
//# sourceMappingURL=mocha.js.map
