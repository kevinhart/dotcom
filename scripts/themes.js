/*global angular*/
(function () {
  "use strict";

  var module = angular.module("themer", []);

  module.config([ "$logProvider", function ($logProvider) {
    $logProvider.debugEnabled(true);
  } ]);

  module.factory("themeConfigFactory", [ "$http", function ($http) {
    return {
      get: function () {
        return $http.get("themes.json");
      }
    };
  } ]);

  module.controller("themerCtrl", [ "$scope", "themeConfigFactory", "$timeout",
                                    function ($scope, themeConfigFactory, $timeout) {
    var ctrl = this;

    ctrl.themes = [];
    ctrl.selectedTheme = {};
    ctrl.selectedTheme.src = "";

    themeConfigFactory.get().
      success(function (themeList) {
        var i = 0;

        for (i = 0; i < themeList.length; i += 1) {
          ctrl.addTheme(themeList[i]);
        }
      });

    ctrl.addTheme = function (theme) {
      ctrl.themes.push(theme);

      if (ctrl.themes.length === 1) {
        ctrl.selectTheme(theme);
      }
    };

    ctrl.selectTheme = function (theme) {
      $timeout(function () {
          ctrl.selectedTheme = theme;
      });
    };

    ctrl.selectThemeByIndex = function (idx) {
      if (idx >= 0 && idx < ctrl.themes.length) {
        ctrl.selectTheme(ctrl.themes[idx]);
      }
    };

  } ]);

  module.directive("themer", function ($log, $compile) {
    return {
      restrict: "A",
      // scope: true,
      replace: true,
      controller: "themerCtrl",
      controllerAs: "themer",
      link: function (scope, element, attrs, themer) {
        element.attr("ng-href", "{{themer.selectedTheme.src}}");
        element.attr("rel", "stylesheet");
        element.attr("type", "text/css");

        //infite loop happens if 'themer' is not removed from the element.
        element.removeAttr("themer");
        element.removeAttr("data-themer");

        $compile(element)(scope);
        $log.debug("linked");
      }
    };
  });

}());
