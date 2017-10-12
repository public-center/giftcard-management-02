const pendingRequest = new WeakMap();
const timeout = new WeakMap();
const _window = new WeakMap();
/**
 * Insipia functions
 */
export class insipia {
  constructor(PendingRequest, $timeout, $window) {
    'ngInject';
    pendingRequest.set(this, PendingRequest);
    timeout.set(this, $timeout);
    _window.set(this, $window);
  }

  link() {
    const that = this;
    pendingRequest.get(this).load()
    .then(() => {
      // Add body-small class if window less than 768px
      if (angular.element(_window.get(that)).width() < 769) {
        angular.element('body').addClass('body-small')
      } else {
        angular.element('body').removeClass('body-small')
      }

      // Collapse ibox function
      angular.element('.collapse-link').click(function () {
        var ibox = angular.element(this).closest('div.ibox');
        var button = angular.element(this).find('i');
        var content = ibox.find('div.ibox-content');
        content.slideToggle(200);
        button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        ibox.toggleClass('').toggleClass('border-bottom');
        timeout.get(that)(function () {
          ibox.resize();
          ibox.find('[id^=map-]').resize();
        }, 50);
      });

      // Close ibox function
      angular.element('.close-link').click(function () {
        var content = angular.element(this).closest('div.ibox');
        content.remove();
      });

      // Fullscreen ibox function
      angular.element('.fullscreen-link').click(function() {
        var ibox = angular.element(this).closest('div.ibox');
        var button = angular.element(this).find('i');
        angular.element('body').toggleClass('fullscreen-ibox-mode');
        button.toggleClass('fa-expand').toggleClass('fa-compress');
        ibox.toggleClass('fullscreen');
        timeout.get(that)(function() {
          angular.element(_window.get(that)).trigger('resize');
        }, 100);
      });

      // Close menu in canvas mode
      angular.element('.close-canvas-menu').click(function () {
        angular.element("body").toggleClass("mini-navbar");
        SmoothlyMenu();
      });

      // Open close right sidebar
      angular.element('.right-sidebar-toggle').click(function () {
        angular.element('#right-sidebar').toggleClass('sidebar-open');
      });

      // Initialize slimscroll for right sidebar
      angular.element('.sidebar-container').slimScroll({
        height: '100%',
        railOpacity: 0.4,
        wheelStep: 10
      });

      // Open close small chat
      angular.element('.open-small-chat').click(function () {
        angular.element(this).children().toggleClass('fa-comments').toggleClass('fa-remove');
        angular.element('.small-chat-box').toggleClass('active');
      });

      // Initialize slimscroll for small chat
      angular.element('.small-chat-box .content').slimScroll({
        height: '234px',
        railOpacity: 0.4
      });

      // Small todo handler
      angular.element('.check-link').click(function () {
        var button = angular.element(this).find('i');
        var label = angular.element(this).next('span');
        button.toggleClass('fa-check-square').toggleClass('fa-square-o');
        label.toggleClass('todo-completed');
        return false;
      });

      // Minimalize menu
      angular.element('.navbar-minimalize').click(function () {
        angular.element("body").toggleClass("mini-navbar");
        SmoothlyMenu();
      });

      // Tooltips demo
      angular.element('.tooltip-demo').tooltip({
        selector: "[data-toggle=tooltip]",
        container: "body"
      });

      // Move modal to body
      // Fix Bootstrap backdrop issu with animation.css
      angular.element('.modal').appendTo("body");

      // Full height of sidebar
      function fix_height() {
        var heightWithoutNavbar = angular.element("body > #wrapper").height() - 61;
        angular.element(".sidebard-panel").css("min-height", heightWithoutNavbar + "px");

        var navbarHeigh = angular.element('nav.navbar-default').height();
        var wrapperHeigh = angular.element('#page-wrapper').height();

        if (navbarHeigh > wrapperHeigh) {
          angular.element('#page-wrapper').css("min-height", navbarHeigh + "px");
        }

        if (navbarHeigh < wrapperHeigh) {
          angular.element('#page-wrapper').css("min-height", angular.element(_window.get(that)).height() + "px");
        }

        if (angular.element('body').hasClass('fixed-nav')) {
          angular.element('#page-wrapper').css("min-height", angular.element(_window.get(that)).height() - 60 + "px");
        }

      }

      fix_height();

      // Fixed Sidebar
      angular.element(_window.get(that)).bind("load", function () {
        if (angular.element("body").hasClass('fixed-sidebar')) {
          angular.element('.sidebar-collapse').slimScroll({
            height: '100%',
            railOpacity: 0.9
          });
        }
      });

      // Move right sidebar top after scroll
      angular.element(_window.get(that)).scroll(function () {
        if (angular.element(_window.get(that)).scrollTop() > 0 && !angular.element('body').hasClass('fixed-nav')) {
          angular.element('#right-sidebar').addClass('sidebar-top');
        } else {
          angular.element('#right-sidebar').removeClass('sidebar-top');
        }
      });

      angular.element(_window.get(that)).bind("load resize scroll", function () {
        if (!angular.element("body").hasClass('body-small')) {
          fix_height();
        }
      });

      angular.element("[data-toggle=popover]")
        .popover();

      // Add slimscroll to element
      angular.element('.full-height-scroll').slimscroll({
        height: '100%'
      })
    });


    // Minimalize menu when screen is less than 768px
    angular.element(_window.get(that)).bind("resize", function () {
      if (angular.element(this).width() < 769) {
        angular.element('body').addClass('body-small')
      } else {
        angular.element('body').removeClass('body-small')
      }
    });

    // Local Storage functions
    // Set proper body class and plugins based on user configuration
    angular.element(document).ready(function () {
      if (localStorageSupport) {

        var collapse = localStorage.getItem("collapse_menu");
        var fixedsidebar = localStorage.getItem("fixedsidebar");
        var fixednavbar = localStorage.getItem("fixednavbar");
        var boxedlayout = localStorage.getItem("boxedlayout");
        var fixedfooter = localStorage.getItem("fixedfooter");

        var body = angular.element('body');

        if (fixedsidebar == 'on') {
          body.addClass('fixed-sidebar');
          angular.element('.sidebar-collapse').slimScroll({
            height: '100%',
            railOpacity: 0.9
          });
        }

        if (collapse == 'on') {
          if (body.hasClass('fixed-sidebar')) {
            if (!body.hasClass('body-small')) {
              body.addClass('mini-navbar');
            }
          } else {
            if (!body.hasClass('body-small')) {
              body.addClass('mini-navbar');
            }

          }
        }

        if (fixednavbar == 'on') {
          angular.element(".navbar-static-top").removeClass('navbar-static-top').addClass('navbar-fixed-top');
          body.addClass('fixed-nav');
        }

        if (boxedlayout == 'on') {
          body.addClass('boxed-layout');
        }

        if (fixedfooter == 'on') {
          angular.element(".footer").addClass('fixed');
        }
      }
    });

    // check if browser support HTML5 local storage
    function localStorageSupport() {
      return (('localStorage' in _window.get(that)) && _window.get(that)['localStorage'] !== null)
    }

    // For demo purpose - animation css script
    //function animationHover(element, animation) {
    //  element = angular.element(element);
    //  element.hover(
    //    function () {
    //      element.addClass('animated ' + animation);
    //    },
    //    function () {
    //      //wait for animation to finish before removing classes
    //      timeout.get(that)(function () {
    //        element.removeClass('animated ' + animation);
    //      }, 2000);
    //    });
    //}

    function SmoothlyMenu() {
      if (!angular.element('body').hasClass('mini-navbar') || angular.element('body').hasClass('body-small')) {
        // Hide menu in order to smoothly turn on when maximize menu
        angular.element('#side-menu').hide();
        // For smoothly turn on menu
        timeout.get(that)(
          function () {
            angular.element('#side-menu').fadeIn(500);
          }, 100);
      } else if (angular.element('body').hasClass('fixed-sidebar')) {
        angular.element('#side-menu').hide();
        timeout.get(that)(
          function () {
            angular.element('#side-menu').fadeIn(500);
          }, 300);
      } else {
        // Remove all inline style from jquery fadeIn function to reset menu state
        angular.element('#side-menu').removeAttr('style');
      }
    }

    // Dragable panels
    //function WinMove() {
    //  var element = "[class*=col]";
    //  var handle = ".ibox-title";
    //  var connect = "[class*=col]";
    //  angular.element(element).sortable(
    //    {
    //      handle: handle,
    //      connectWith: connect,
    //      tolerance: 'pointer',
    //      forcePlaceholderSize: true,
    //      opacity: 0.8
    //    })
    //    .disableSelection();
    //}
  }
}
