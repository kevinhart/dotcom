/*global angular*/
(function () {
  "use strict";

  var app = angular.module("dotcom", [ "ngSanitize", "ngRoute", "themer" ]);

  app.config(([ "$routeProvider", function($routeProvider) {
    $routeProvider.
    when("/edit", {
      templateUrl: "tpl/edit.html",
    }).
    when("/", {
      templateUrl: "tpl/home.html",
      controller: "DotcomCtrl",
    });
  } ]));

  app.factory("pageConfig", [ "$http", function ($http) {
    return {
      get: function (callback) {
        $http.get("custom.json").
        success(function (data) {
            callback(data);
          }).
        error(function (data, statuscode) {
          if (statuscode == 404) {
            $http.get("config.json")
              .success(function (data) {
                callback(data);
              });
          }
        });
      }
    };
  } ]);

  app.factory("currentDateString", function () {
    var curDate = new Date(),
        days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
        months = [ "January", "February", "March", "April", "May", "June", "July",
                   "August", "September", "October", "November", "December" ];

    return days[curDate.getDay()] + ", " +
            months[curDate.getMonth()] + " " +
            curDate.getDate() + " " +
            curDate.getFullYear();
  });

  app.directive("linkBox", [ function () {
    return {
      restrict: "A",
      link: function (scope, element, attrs) {
        var btstrapSize = "12",
            gridClass = "";

        switch (scope.rowSize) {
          case 1:
            btstrapSize = "12";
            break;

          case 2:
            btstrapSize = "6";
            break;

          case 3:
            btstrapSize = "4";
            break;

          case 4:
            btstrapSize = "3";
            break;

          default:
            btstrapSize = "3";
        }

        gridClass = "col-md-" + btstrapSize;
        element.addClass(gridClass);
      }
    };
  } ]);

  app.controller("DotcomCtrl", [ "$scope", "$sce", "pageConfig", "currentDateString", "themerSvc",
                                  function ($scope, $sce, pageLinkSvc, dateFactory, themerSvc) {
    $scope.pageConfig = {};

    $scope.pageTitle = "dotcom";
    $scope.pageSubtitle = "";
    $scope.currentDate = "";
    $scope.linkBoxes = [];
    $scope.linkRows = [];
    $scope.searchInfo = {};
    $scope.searchInfo.Url = "#";
    $scope.rowSize = 0;
    $scope.numRows = 0;

    pageLinkSvc.get(function (cfg) {
      $scope.pageConfig = cfg;
      $scope.refreshDotcom();
    });

    $scope.refreshDotcom = function () {
      $scope.refreshHeader();
      $scope.refreshLinks();
      $scope.refreshSearchInfo();
    };

    $scope.refreshHeader = function () {

      if (isPresent($scope.pageConfig.Title)) {
        $scope.pageTitle = $scope.pageConfig.Title;
      }

      if (isPresent($scope.pageConfig.Subtitle)) {
        $scope.pageSubtitle = $scope.pageConfig.Subtitle;
      }

      if (isPresent($scope.pageConfig.Theme)) {
        themerSvc.selectThemeByName($scope.pageConfig.Theme);
      }

      $scope.currentDate = dateFactory;
    };

    $scope.refreshLinks = function () {
      var i = 0,
          g;

      if (!isArray($scope.pageConfig.Groups)) {
        return;
      }

      for (i = 0; i < $scope.pageConfig.Groups.length; i += 1) {
        $scope.linkBoxes.push($scope.pageConfig.Groups[i]);
      }

      if (isPresent($scope.pageConfig.GroupsPerRow)) {
        $scope.rowSize = $scope.pageConfig.GroupsPerRow;
      }

      $scope.numRows = Math.ceil($scope.linkBoxes.length / $scope.rowSize);
      $scope.linkRows = $scope.createLinkRows();
    };

    $scope.refreshSearchInfo = function () {
      if (isPresent($scope.pageConfig.Search)) {
        $scope.searchInfo = $scope.pageConfig.Search;

        //have to specifically trust this resource url, or angular won't let this value be interpolated.
        $scope.searchInfo.Url = $sce.trustAsResourceUrl($scope.searchInfo.Url);
      }
    };

    $scope.createLinkRows = function () {
      var r = [],
          i = 0,
          j = 0,
          entry = [];

      for (i = 0; i < $scope.numRows; i += 1) {
        entry = [];
        for (j = 0; j < $scope.rowSize && (i * $scope.rowSize) + j < $scope.linkBoxes.length; j += 1) {
          entry.push($scope.linkBoxes[(i * $scope.rowSize) + j]);
        }

        r.push(entry);
      }

      return r;
    };

    function isArray (val) {
      if (val === undefined) {
        return false;
      }

      if (Object.prototype.toString.call(val) == "[object Array]") {
        return true;
      }

      return false;
    }

    function isPresent (val) {
      if (val === undefined) {
        return false;
      }

      return true;
    }

  } ]);
}());
