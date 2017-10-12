'use strict';

// Development specific configuration
// ==================================

module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/gcmanager',
    debug: typeof process.env.debug === 'string' && process.env.debug.toLowerCase() === 'true'
  },

  seedDB: false,

  frontendBaseUrl: 'http://localhost:3000/',
  backendBaseUrl: 'http://localhost:9000/api/',
  serverApiUrl: 'http://localhost:9000/api/',
  // GCMGR BI
  gcmgrBiIp: 'localhost',
  gcmgrBiPort: '8080',
  gcmgrBiMethod: 'http://'
};
//# sourceMappingURL=development.js.map
