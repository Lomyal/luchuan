'use strict';

angular.module('myApp.chatroom', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/chatroom', {
        templateUrl: 'chatroom/chatroom.html',
        controller: 'ChatroomCtrl'
      });
    }])

    .controller('ChatroomCtrl', ['$scope', function($scope) {
      var socket = io();
      $scope.msgs = [];

      // 接收信息
      socket.on('chat message', function(msg) {
        $scope.msgs.push(msg);
        $scope.$apply();
        scrollToWellBottom();
      });

      // 发送信息
      $scope.sendSelfMessage = function() {
        socket.emit('chat message', $scope.content);
        $scope.content = '';
      };

      // 滚动到信息最底端
      function scrollToWellBottom() {
        document.getElementById('well-bottom').scrollIntoView();
      }
    }]);


