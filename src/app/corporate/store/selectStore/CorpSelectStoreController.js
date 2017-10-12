const Service = new WeakMap();
const authService = new WeakMap();
/**
 * Sub company controller
 */
export class CorpSelectStoreController {
  constructor(CorpSelectStoreService, $state, AuthService) {
    'ngInject';
    Service.set(this, CorpSelectStoreService);
    authService.set(this, AuthService);
    // Get the currently selected store
    this.getStore({
      storeId: $state.params.storeId,
      companyId: $state.params.companyId
    });
  }

  /**
   * Get the currently selected store
   * @param params storeId and companyId
   */
  getStore(params) {
    if (!params.storeId) {
      return;
    }
    Service.get(this).getStore(params)
      .then(res => {
        authService.get(this).corpSelectedStore = res;
      });
  }
}
