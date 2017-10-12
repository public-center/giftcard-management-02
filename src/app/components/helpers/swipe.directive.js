const sym = Symbol('cqModal');
const document = new Map();
const rootScope = new Map();
const timeout = new Map();
/**
 * Swipe directive
 */
export class swipe {
  constructor($document, $rootScope, $timeout) {
    'ngInject';
    document.set(sym, $document);
    rootScope.set(sym, $rootScope);
    timeout.set(sym, $timeout);
  }

  link() {
    const doc = document.get(sym);
    const rs = rootScope.get(sym);
    // Listen for key press
    doc.on('keypress', onKeyPress);
    // Stop listening when leaving the page
    rs.$on('stopSwipe', function () {
      doc.off('keypress', onKeyPress);
    });

    let complete = '';
    let time = null;

    function onKeyPress(e) {
      // Add to string
      complete += e.key;
      if (time) {
        timeout.get(sym).cancel(time);
      }
      time = timeout.get(sym)(() => {
        time = null;
        // If greater than ten, broadcast
        if (complete.length >10) {
          rs.$broadcast('cqSwipe', complete);
        }
        // Reset string
        complete = '';
      }, 100);
    }
  }
}
