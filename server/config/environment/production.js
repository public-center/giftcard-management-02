'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port: process.env.PORT || 9000,

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://172.31.1.78,172.31.11.167,172.31.4.16,172.31.13.246/gcmanager',
    debug: false
  },

  frontendBaseUrl: 'https://gcmgr.cardquiry.com/',
  backendBaseUrl : 'https://gcmgr-backend-https.cardquiry.com/api/',
  serverApiUrl   : 'http://SERVER_IP/api/',
  // GCMGR BI
  gcmgrBiIp      : '35.161.219.185',
  gcmgrBiPort    : '8080',
  gcmgrBiMethod  : 'https://'
};
