const http = new WeakMap();
const interval = new WeakMap();

/**
 * Check for pending Http requests or digests (in essence, a hacky way to tell if DOM is loaded)
 */
export class PendingRequest {
  constructor($http, $interval) {
    'ngInject';
    http.set(this, $http);
    interval.set(this, $interval);
  }

  load() {
    return new Promise((resolve) => {
      var complete = interval.get(this)(() => {
        // If no requests remain, resolve promise
        if (!http.get(this).pendingRequests.length) {
          resolve();
          interval.get(this).cancel(complete);
        }
      }, 25);
    });
  }
}

//PendingRequest.$inject = ['$http', '$interval'];
