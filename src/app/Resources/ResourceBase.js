/**
 * Base class for resources
 */
class ResourceBase {
  constructor($resource) {
    this.url = 'http://localhost:9000';
    this.$resource = $resource;
  }

  query(url, params, headers) {
    if (!headers) {
      return this.$resource(`${this.url}/${url}`).query(params).$promise;
    }
    return new (this.$resource(`${this.url}/${url}`, params, {
      getWithHeaders: {method: 'GET', headers: headers, isArray: true}
    }))().$getWithHeaders();
  }

  get(url, params, headers) {
    if (!headers) {
      return this.$resource(`${this.url}/${url}`).get(params).$promise;
    }
    return new (this.$resource(`${this.url}/${url}`, params, {
      getWithHeaders: {method: 'GET', headers: headers}
    }))().$getWithHeaders();
  }

  /**
   * General post request
   */
  post (url, params, body, headers) {
    if (!headers) {
      return new (this.$resource(`${this.url}/${url}`, params))(body).$save();
    }
    // Specify put request with potential custom headers
    return new (this.$resource(url, params, {
      postWithHeaders: {method: 'POST', headers: headers}
    }))(body).$postWithHeaders();
  }

  /**
   * Put request
   */
  put(url, params, body, headers) {
    // Specify put request with potential custom headers
    return new (this.$resource(`${this.url}/${url}`, params, {
      update: {method: 'PUT', headers: headers}
    }))(body).$update();
  }

  /**
   * Patch request
   */
  patch(url, params, body, headers) {
    return new (this.$resource(`${this.url}/${url}`, params, {
      update: {method: 'PATCH', headers: headers}
    }))(body).$update();
  }

  /**
   * Delete request
   */
  delete(url, params, headers) {
    return new (this.$resource(`${this.url}/${url}`, params, {
      doDelete: {method: 'DELETE', headers: headers}
    }))().$doDelete();
  }
}

export default ResourceBase;
