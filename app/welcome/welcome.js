'use strict';

angular.module('myApp.welcome', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/welcome', {
        templateUrl: 'welcome/welcome.html',
        controller: 'WelcomeCtrl'
      });
    }])

    .controller('WelcomeCtrl', ['$scope', '$location', '$http', 'bidGen', function($scope, $location, $http, bidGen) {
      $scope.usernameTaken = false;
      $scope.msgSent = false;

      // 判断该设备是否已经注册过
      var bid = bidGen.fingerprint.get();

      $http({
        method: 'POST',
        url: '/bid',
        data: {
          bid: bid
        }
      })
      .success(function(data, status, headers, config) {
        $scope.registered = data.username;
      });


      //$scope.boats = ['聚点儿撸串儿'];
      //$scope.selectedboat = '聚点儿撸串儿';

      $scope.enterChatRoom = function() {
        if ($scope.username) {  // 不允许空白用户名

          // 注册该设备
          $http({
            method: 'POST',
            url: '/reg',
            data: {
              bid: bid,
              username: $scope.username
            }
          })
              .success(function(msg) {
                if (msg === 'duplicate username') {

                  // 用户名已存在
                  $scope.msgSent = false;
                  $scope.usernameTaken = true;

                } else {

                  // 注册成功，跳转到聊天室
                  $scope.msgSent = false;
                  $location.path('/chatroom');  // 日后扩展到多聊天室时，可用路径区分不同聊天室（由于不使用session）
                }
              });

          $scope.msgSent = true;
        }
      };

      $scope.enterChatRoomAgain = function() {
        $location.path('/chatroom');
      };

      ///**
      // * 利用shareFactory服务，向聊天室页面传递参数
      // * @param bid
      // * @param username
      // */
      //function sendParams(bid, username) {
      //  shareFactory.setVal({
      //    bid: bid,
      //    username: username
      //  });
      //}

    }]);