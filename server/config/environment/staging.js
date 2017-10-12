'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/gcmanager',
    debug: false
  },

  seedDB: false,

  frontendBaseUrl: 'http://gcmgr-staging.cardquiry.com/',
  backendBaseUrl: 'http://gcmgr-staging.cardquiry.com/api/',
  serverApiUrl: 'http://localhost:9000/api/',
  // GCMGR BI
  gcmgrBiIp: 'localhost',
  gcmgrBiPort: '8080',
  gcmgrBiMethod: 'http://',
  // BI
  biCallbackKeyHeader: 'x-bi-key-5etqeeW76V',
  biCallbackKey: 'URwCAYaA4CjUBHQDah3JFeweBNoYkGkpYuuURkosR3jVJAUWZHS4YhHRk2TrK9daFTWgkp99PmeTvmov',
  vistaBiUser: ['593889061cd79a014c3d460f'],
};
