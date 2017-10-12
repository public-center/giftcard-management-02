const Resource = new WeakMap();
/**
 * New employee service
 */
export class CorpNewEmployeeService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);
  }

  /**
   * Register a new store
   */
  newEmployee(params) {
    return Resource.get(this).resource('Store:newEmployee', params);
  }
}
