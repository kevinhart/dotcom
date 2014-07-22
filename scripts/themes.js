/*global angular*/
(function () {
  "use strict";

  var module = angular.module("themer", []);

  module.config([ "$logProvider", function ($logProvider) {
    $logProvider.debugEnabled(true);
  } ]);

  module.factory("themeCfgFactory", [ "$http", function ($http) {
    function getThemes () {
      return $http.get("themes.json");
    }

    return getThemes;
  } ]);

  module.service("themerSvc", [ "$log", "$timeout", "themeCfgFactory",
                                function ($log, $timeout, themeCfgFactory) {
    var svc = this;

    svc.themes = [];
    svc.selectedTheme = {
      name: "",
      href: ""
    };

    themeCfgFactory().
      success(function (themeList) {
        var i = 0;
        for (i = 0; i < themeList.length; i += 1) {
          svc.addTheme(themeList[i]);
        }
      });

    svc.addTheme = function (theme) {
      svc.themes.push(theme);
      if (svc.themes.length === 1) {
        svc.selectTheme(theme);
      }
    };

    svc.selectTheme = function (theme) {
      $timeout( function () {
        svc.selectedTheme = theme;
      });
    };

    svc.selectThemeByIndex = function (idx) {
      if (idx >= 0 && idx < svc.themes.length) {
        svc.selectTheme(svc.themes[idx]);
      }
    };
  } ]);

  module.directive("themer", function ($log, $compile, themerSvc) {
    return {
      restrict: "A",
      scope: true,
      replace: true,
      link: function (scope, element, attrs) {
        scope.themerSvc = themerSvc;
        element.attr("ng-href", "{{themerSvc.selectedTheme.href}}");
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

  module.directive("themerChooser", function () {
    return {
      restrict: "E",
      scope: true,
      templateUrl: "../tpl/themes.html",
      controller: "ThemerCtrl",
      controllerAs: "themer"
    };
  });

  module.controller("ThemerCtrl", [ "$scope", "themerSvc", function ($scope, themerSvc) {
    this.themes = themerSvc.themes;
    this.svc = themerSvc;

    // this.switchTheme = function (idx) {
    //   themerSvc.selectThemeByIndex(idx);
    // };
  } ]);

}());
