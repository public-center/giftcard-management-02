import config from './environment';

/**
 * Debug mongoose queries if we have environment variable "debug=true"
 * @param mongoose Mongoose instance
 */
export default function debugMongo(mongoose) {
  mongoose.set('debug', config.mongo.debug);
}
