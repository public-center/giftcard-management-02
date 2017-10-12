export default function PrettyScroll() {
  'ngInject';
  return function () {
    angular.element(document).ready(function () {
      // Page scrolling feature
      angular.element('a.page-scroll').bind('click', function(event) {
        try {
          var link = angular.element(this);
          angular.element('html, body').stop().animate({
            scrollTop: angular.element(link.attr('href')).offset().top - 50
          }, 500);
          event.preventDefault();
          // Catch unrecognized ui-sref expressions
        } catch (e) {
          console.log(e);
        }
      });
    });

    var cbpAnimatedHeader = (function() {
      var docElem = document.documentElement,
        header = document.querySelector( '.navbar-default' ),
        didScroll = false,
        changeHeaderOn = 200;
      function init() {
        window.addEventListener( 'scroll', function( event ) {
          if( !didScroll ) {
            didScroll = true;
            setTimeout( scrollPage, 250 );
          }
        }, false );
      }
      function scrollPage() {
        var sy = scrollY();
        if ( sy >= changeHeaderOn ) {
          angular.element(header).addClass('navbar-scroll')
        }
        else {
          angular.element(header).removeClass('navbar-scroll')
        }
        didScroll = false;
      }
      function scrollY() {
        return window.pageYOffset || docElem.scrollTop;
      }
      init();

    })();
  };
}
