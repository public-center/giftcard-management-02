const sym = Symbol();
const corpSettings = new Map();
const rootScope = new Map();
const Auth = new Map();
/**
 * Basic footer
 */
export class corporateStoreSwitcher {
  constructor(CorpService, $rootScope, AuthService) {
    'ngInject';
    this.templateUrl = 'app/components/corporateStoreSwitcher/switcher.html';
    corpSettings.set(sym, CorpService);
    rootScope.set(sym, $rootScope);
    Auth.set(sym, AuthService);
  }

  link(scope) {
    let allStores = [];
    // Change selected store
    scope.changeStore = () => {
      const store = scope.displayData.selectedStore;
      corpSettings.get(sym).changeStore(store);
      Auth.get(sym).store = {_id: store};
      rootScope.get(sym).$broadcast('corpStoreSelected', store);
    };
    scope.displayData = {
      selectedStore: null,
      stores: []
    };
    rootScope.get(sym).$on('$stateChangeSuccess',(event, toState) => {
      handleUpdate(toState.url);
    });
    /**
     * Handle update for route or stores
     * @param url Current URL
     */
    function handleUpdate(url) {
      /**
       * Coming in from collection update
       */
      // Card intake, buy rates, store details
      const mustHaveStore = /intake|buyRates|(storeId|all)\/details|\/customer/.test(url);
      const stores = allStores.slice();
      // Add in all
      if (!mustHaveStore || !stores.length) {
        stores.unshift({name: 'All', _id: 'all'});
      }
      scope.displayData.stores = stores;
      if (!scope.displayData.selectedStore || (mustHaveStore && scope.displayData.selectedStore === 'all')) {
        const id = stores[0]._id;
        scope.displayData.selectedStore = id;
        corpSettings.get(sym).changeStore(id);
        // Store it in auth
        Auth.get(sym).store = stores[0];
        rootScope.get(sym).$broadcast('corpStoreSelected', id);
      }
    }
    // Watch stores
    scope.$watchCollection(function () {
      return corpSettings.get(sym).displayData.stores;
    }, (newVal) => {
      if (angular.isUndefined(newVal) || !newVal.length) {
        return;
      }
      allStores = newVal.slice();
      handleUpdate(window.location.href);
    });
  }
}
