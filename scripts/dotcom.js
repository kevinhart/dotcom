/*global angular*/
(function () {
  "use strict";

  var app = angular.module("dotcom", []);

  app.config(["$sceDelegateProvider", function($sceDelegateProvider) {
     $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from outer templates domain.
    'https://www.google.com/search**'
    ]);
  }]);

  app.factory("pageConfig", ["$http", function($http) {
    return {
      get: function (callback) {
        $http.get("config.json").success(function (data) {
          callback(data);
        });
      }
    };
  }]);

  app.factory("currentDateString", function () {
    var curDate = new Date();
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return days[curDate.getDay()] + ", " + months[curDate.getMonth()] + " " + curDate.getDate() + " " + curDate.getFullYear();
  });

  app.controller("DotcomCtrl", ["$scope", "pageConfig", "currentDateString", function($scope, pageLinkSvc, dateFactory) {
    $scope.pageConfig = {};

    $scope.pageTitle = "dotcom";
    $scope.pageSubtitle = "";
    $scope.currentDate = "";
    $scope.linkBoxes = [];
    $scope.linkRows = [];
    $scope.searchInfo = {};
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

      if(isPresent($scope.pageConfig.Title)) {
        $scope.pageTitle = $scope.pageConfig.Title;
      }

      if(isPresent($scope.pageConfig.Subtitle)) {
        $scope.pageSubtitle = $scope.pageConfig.Subtitle;
      }

      $scope.currentDate = dateFactory;
    };

    $scope.refreshLinks = function () {
      var i = 0,
          g;

      if(!isArray($scope.pageConfig.Groups)) {
        return;
      }

      for( i = 0; i < $scope.pageConfig.Groups.length; i += 1) {
        $scope.linkBoxes.push($scope.pageConfig.Groups[i]);
      }

      if(isPresent($scope.pageConfig.GroupsPerRow)) {
        $scope.rowSize = $scope.pageConfig.GroupsPerRow;
      }

      $scope.numRows = Math.ceil($scope.linkBoxes.length/$scope.rowSize);
      $scope.linkRows = $scope.createLinkRows();
    };

    $scope.refreshSearchInfo = function () {
      if(isPresent($scope.pageConfig.Search)) {
        $scope.searchInfo = $scope.pageConfig.Search;
      }
    };

    $scope.createLinkRows = function () {
      var r = [],
          i = 0,
          j = 0;

      for( i = 0; i < $scope.numRows; i += 1) {
        var entry = [];

        for( j = 0; j < $scope.rowSize && (i*$scope.rowSize)+j < $scope.linkBoxes.length; j += 1) {
          entry.push($scope.linkBoxes[(i*$scope.rowSize)+j]);
        }

        r.push(entry);
      }

      return r;
    };

    function isArray (val) {
      if(val === undefined) {
        return false;
      }

      if(Object.prototype.toString.call(val) == '[object Array]') {
        return true;
      }

      return false;
    }

    function isPresent(val) {
      if(val === undefined) {
        return false;
      }

      return true;
    }

  }]);
}());
