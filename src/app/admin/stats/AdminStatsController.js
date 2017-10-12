const Service = new WeakMap();
const scope = new WeakMap();

/**
 * Admin stats controller
 */
export class AdminStatsController {
  constructor(AdminStatsService, $scope) {
    'ngInject';
    Service.set(this, AdminStatsService);
    scope.set(this, $scope);

    this.displayData = AdminStatsService.displayData;
    $scope.displayData = {
      safe: [],
      retailers: [],
      perPage: 100
    };

    // Retrieve stats
    this.getStats();
  }

  /**
   * Retrieve relevant stats
   */
  getStats() {
    Service.get(this).getRetailerStats()
    .then(() => {
      scope.get(this).displayData.safe = this.displayData.retailers;
    });
  }
}
