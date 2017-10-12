/**
 * Capitalize first letter
 * @returns {Function}
 */
export function capitalize() {
  return function (input) {
    // Some error handling
    if (angular.isUndefined(input)) {
      return '';
    }
    return input.charAt(0).toUpperCase() + input.slice(1);
  };
}
