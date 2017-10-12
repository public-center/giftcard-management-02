/**
 * Numbers only directive
 */
export class numbersOnly {
  constructor() {
    this.require = 'ngModel';
  }

  link(scope, element, attrs, modelCtrl) {
    // Add to parsers
    modelCtrl.$parsers.push(function (inputValue) {
      // Prevent error on rollback
      if (angular.isUndefined(inputValue)) {
        return '';
      }
      var transformedInput, split;
      // Decimal input
      if (attrs.numbersOnly === 'decimal') {
        transformedInput = inputValue.replace(/[^0-9.]/g, '');
        split = transformedInput.split('.');
        // If more than two decimals, remove the second and everything following
        if (split.length > 2) {
          split.pop();
          transformedInput = split.join('.');
        }
      } else {
        // Remove non-digits
        transformedInput = inputValue.replace(/[^0-9]/g, '');
      }
      // Zip code or other digit limiter
      if (angular.isDefined(attrs.zipCode) || attrs.digits) {
        // Only allow specific number of characters
        var regex = new RegExp('(.{0,' + (attrs.digits || 5) + '})', 'g');
        var matched = transformedInput.match(regex);
        transformedInput = matched[0];
      }
      // Don't violate max
      if (attrs.max) {
        const max = parseFloat(attrs.max);
        if (!isNaN(max)) {
          if (inputValue > max) {
            transformedInput = String(max);
          }
        }
      }
      // Min
      if (attrs.min) {
        const min = parseFloat(attrs.min);
        if (!isNaN(min)) {
          if (inputValue < min) {
            transformedInput = String(min);
          }
        }
      }
      // If regex change, update view
      if (transformedInput !== inputValue) {
        modelCtrl.$setViewValue(transformedInput);
        modelCtrl.$render();
      }

      return transformedInput;
    });
  }
}
