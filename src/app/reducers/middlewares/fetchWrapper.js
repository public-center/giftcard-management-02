import _ from 'lodash';

export default class FetchWrapper {
  constructor(client) {
    this.url = 'http://localhost:9000';
    this.client = client;
  }

  get(url, params = {}, headers = {}) {
    const qs = this.queryString(params);

    return this.client(`${this.url}/${url}?${qs}`, {
      method: 'GET',
      headers: this.injectToken(headers)
    });
  }

  post(url, body = {}, headers = {}) {
    return this.client(`${this.url}/${url}`, {
      method: 'POST',
      headers: this.injectToken(headers),
      body
    });
  }

  put(url, body = {}, headers = {}) {
    return this.client(`${this.url}/${url}`, {
      method: 'PUT',
      headers: this.injectToken(headers),
      body
    });
  }

  patch(url, body = {}, headers = {}) {
    return this.client(`${this.url}/${url}`, {
      method: 'PATCH',
      headers: this.injectToken(headers),
      body
    });
  }

  delete(url, headers = {}) {
    return this.client(`${this.url}/${url}`, {
      method: 'DELETE',
      headers: this.injectToken(headers)
    });
  }

  /**
   * Turns an object into a query string
   *
   * @param {Object} obj
   * @return {String}
   */
  queryString(obj) {
    return Object.keys(obj).map(k => {
      return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
    }).join('&');
  }

  /**
   * Inserts a token from the localStorage into the headers object for a request
   *
   * @param {Object} obj
   * @return {Object}
   */
  injectToken(obj) {
    const token = localStorage.satellizer_token;

    if (!token) {
      return obj;
    }

    obj.Authorization = 'Bearer ' + token;

    return obj;
  }
}
