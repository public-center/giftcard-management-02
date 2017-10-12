'use strict';

// Test specific configuration
// ===========================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/gcmgrtest',
    debug: typeof process.env.debug === 'string' && process.env.debug.toLowerCase() === 'true'
  },
  debug: false,
  isTest: true
};
