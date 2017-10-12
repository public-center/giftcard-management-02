// Get URL
import ResourceBase from 'Resources/ResourceBase';
const resourceBase = new ResourceBase();

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
async function parseJSON(response) {
  const thisResponse = {};
  const json = response.json();
  if (response.status >= 200 && response.status < 300) {
    thisResponse.body = json;
  } else {
    thisResponse.errors = json;
  }
  return !thisResponse.errors ? await thisResponse.body : await thisResponse.errors;
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 * response object
 * {
 *  body: {}
 * }
 * error object
 * {
 *  errors: []
 * }
 */
function checkStatus(response) {
  if (response.errors) {
    const error = new Error(response.statusText);
    error.errors = response.errors;
    throw error;
  } else {
    return response;
  }
}

/**
 * Populate options to make requests
 * @param  {string} options       The URL we want to request
 * @param  {string} options.method    Request method
 * @param  {object} options.body    The options we want to pass to "fetch"
 * @param  {object} options.headers    Any headers to include
 *
 * @return {*}
 */
function populateOptions(options) {
  // Gotta have a URL and headers
  if (!('url' in options)) {
    throw 'A URL must be specified with each request';
  }
  // Basic headers
  if (!('headers' in options)) {
    options.headers = {};
  }
  // Default to GET
  if (!('method' in options)) {
    options.method = 'GET';
  }
  options.url = `${resourceBase.url}/api/${options.url}`;
  // Assume POST if no method but we have a body
  const methodIsObject = typeof options.method === 'undefined' && Object.getPrototypeOf(options.body) === Object.prototype;
  // Default to post when there's a body
  if (methodIsObject) {
    options.method = 'POST';
  }
  // Content-type
  options.headers['Content-Type'] = 'application/json';
  // Body
  if (options.body) {
    options.body = JSON.stringify(options.body);
  }
  // Auth
  const token = localStorage.getItem('satellizer_token') || localStorage.getItem('token');
  if (token) {
    options.headers.Authorization = 'bearer ' + token;
  }
  return options;
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} options       The URL we want to request
 * @param  {string} options.method    Request method
 * @param  {object} options.body    The options we want to pass to "fetch"
 * @param  {object} options.headers    Any headers to include
 *
 * @return {object}           The response data
 */
export default async function request(options) {
  options = populateOptions(options);
  const res = await fetch(options.url, options);
  const parsed = await parseJSON(res);
  return await checkStatus(parsed);
}
