/**
 * Ensure valid dates on calendars
 *
 * @todo!
 */
export class calendarValid {
  constructor() {
    this.require = 'ngModel';
  }

  link(scope, element, attrs, modelCtrl) {
    // Add to parsers
    modelCtrl.$parsers.push(function (inputValue) {

      return inputValue;
    });
  }
}
