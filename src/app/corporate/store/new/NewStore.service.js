const Resource = new WeakMap();
/**
 * Company service
 */
export class CorpNewStoreService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);
  }

  /**
   * Register a new store
   */
  register(params) {
    return Resource.get(this).resource('Store:newStore', params);
  }
}
