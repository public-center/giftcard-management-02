const q = new Map();
const rootScope = new Map();
const classSymbol = Symbol();
/**
 * Handle backend errors
 */
export class CqErrorInterceptor{
  constructor($q, $rootScope) {
    'ngInject';
    q.set(classSymbol, $q);
    rootScope.set(classSymbol, $rootScope);
  }

  /**
   * Display backend errors
   * @param reject
   * @returns {*|Promise}
   */
  responseError(reject) {
    // Notify each backend error
    try {
      angular.forEach(reject.data.errors, (error) => {
        rootScope.get(classSymbol).$broadcast('backend-error', {
          id: error.path,
          message: error.message
        });
      });
    } catch (e) {
      rootScope.get(classSymbol).$broadcast('backend-error', {
        message: 'Unknown error'
      });
    }
    // Continue rejection
    return q.get(classSymbol).reject(reject);
  }
}
