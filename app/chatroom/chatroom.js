'use strict';

angular.module('myApp.chatroom', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/chatroom/:name', {
        templateUrl: 'chatroom/chatroom.html',
        controller: 'ChatroomCtrl'
      });
    }])

    .controller('ChatroomCtrl', ['$scope', '$routeParams', 'bidGen', function($scope, $routeParams, bidGen) {
      $scope.msgs = [];
      var bid = bidGen.getCanvasFingerprint();

      var socket = io();
      socket.emit('log in', {
        bid: bid,
        username: $routeParams.name
      });

      // 接收信息
      socket.on('chat message', function(msg) {
        $scope.msgs.push(msg);
        $scope.$apply();
        //scrollToWellBottom();
      });

      // 发送信息
      $scope.sendSelfMessage = function() {
        var content = $scope.content;

        if (content) {  // 不处理空白内容
          var msg = {
            name: $routeParams.name,
            content: content
          };
          var selfMsg = {
            name: $routeParams.name,
            content: content,
            self: true
          };
          socket.emit('chat message', msg);
          $scope.msgs.push(selfMsg);  // 更新自己的 model
          //scrollToWellBottom();
          $scope.content = '';
        }
      };

      // 滚动到最后一条消息
      $scope.$watch("msgs", function () {
        $scope.$evalAsync(function () {
          scrollToWellBottom();
        });
      }, true);

      //$scope.bid = getCanvasFingerprint();

      // 滚动到信息最底端
      function scrollToWellBottom() {
        var elem = document.getElementsByClassName('chat-display')[0];
        elem.scrollTop = elem.scrollHeight;
      }

    }]);


