const compile = new Map();
const sym = Symbol();
/**
 * Company setting
 */
export class companySetting {
  constructor($compile) {
    'ngInject';
    this.templateUrl = 'app/components/companySetting/setting.html';
    this.restrict = 'E';
    this.transclude = true;
    this.scope = {
      prop: '=',
      toggleSetting: '&',
      buttonText: '@',
      description: '@'
    };

    compile.set(sym, $compile);
  }

  // Compile description and inject it
  link($scope, elem) {
    $(elem).find('.desc').replaceWith(compile.get(sym)($scope.description)($scope));
  }
}
