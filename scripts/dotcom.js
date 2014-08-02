/*global angular*/
(function () {
  "use strict";

  var app = angular.module("dotcom", [ "ngSanitize", "ngRoute", "themer" ]);

  app.config(([ "$routeProvider", function ($routeProvider) {
    $routeProvider.
    when("/edit", {
      templateUrl: "tpl/edit.html",
      controller: "EditCtrl"
    }).
    when("/", {
      templateUrl: "tpl/home.html",
      controller: "DotcomCtrl"
    });
  } ]));

  app.factory("pageConfig", [ "$q", "$http", function ($q, $http) {
    return {
      get: function () {
        var deferred = $q.defer(),
            result;

        result = localStorage.getItem("dotcomConfig");
        if (result) {
          result = angular.fromJson(result);
          deferred.resolve(result);
        } else {
          $http.get("config.json").then(function (response) {
            deferred.resolve(response.data);
          });
        }

        return deferred.promise;
      },

      set: function (pageConfig) {
        var val = angular.toJson(pageConfig);
        localStorage.setItem("dotcomConfig", val);
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

  app.directive("ngEnter", function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    };
  });

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

    pageLinkSvc.get().then(function (cfg) {
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

  app.controller("EditCtrl", [ "$scope", "pageConfig", "themerSvc", "$location", function ($scope, pageConfigSvc, themerSvc, $location) {
    $scope.pageConfig = {};

    pageConfigSvc.get().then(function (data) {
      $scope.pageConfig = data;
    });

    $scope.themerSvc = themerSvc;

    $scope.submit = function () {
      $scope.pageConfig.Theme = $scope.themerSvc.selectedTheme.Name;
      pageConfigSvc.set($scope.pageConfig);
      $location.path("/");
    };

    $scope.addLink = function (box) {
      if(box === undefined || box.newName === undefined || box.newUrl === undefined) {
        return;
      }

      box.Links.push({Name: box.newName, Link: box.newUrl});
      box.newName = "";
      box.newUrl = "";
    };

    $scope.addLinkBox = function () {
      $scope.pageConfig.Groups.unshift({Name: undefined, Links: []});
    };

    $scope.removeFromBox = function (box, index) {
      box.Links.splice(index, 1);
    };

    $scope.removeLinkBox = function (index) {
      $scope.pageConfig.Groups.splice(index, 1);
    };

  } ]);
}());
