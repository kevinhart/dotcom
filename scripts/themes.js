/*global angular*/
(function () {
  "use strict";

  // Need to rethink how this works. We need to expose a series of themes via a scope.
  // And given the selected theme, update a link element on the <head> element.
  //
  // Create a .json file to store the themes
  // {
  //   "Dark": "dark.css",
  //   "Light": "light.css"
  // }
  //
  // Load this .json file and create a container for the list of styles
  // then show this list of styles to the user, allowing them to change the style


  var module = angular.module("themer", []);

  module.config([ "$logProvider", function ($logProvider) {
    $logProvider.debugEnabled(true);
  } ]);

  module.factory("themeConfigFactory", ["$http", function($http) {
    return {
      get: function () {
        return $http.get("themes.json");
      }
    };
  } ]);

  module.controller("themerCtrl", ["$scope", "themeConfigFactory", function($scope, themeConfigFactory) {
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
      ctrl.selectedTheme = theme;
    };

    ctrl.selectThemeByIndex = function (idx) {
      if (idx > 0 && idx < ctrl.themes.length) {
        ctrl.selectTheme(ctrl.themes[idx]);
      }
    };

  } ]);

  module.directive("themer", function($log, $compile) {
    return {
      restrict: "A",
      scope: true,
      controller: "themerCtrl",
      controllerAs: "$themer",
      compile: function (telement, tattrs, transclude) {

        tattrs.$set("src", "$themer.selectedTheme.src");

        return function link (scope, element, attrs, $themer) {
          $log.debug("linked themer");
        };
      }
    };
  });

}());
