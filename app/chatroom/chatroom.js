'use strict';

angular.module('myApp.chatroom', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/chatroom', {
        templateUrl: 'chatroom/chatroom.html',
        controller: 'ChatroomCtrl'
      });
    }])

    .controller('ChatroomCtrl', ['$scope', '$location', 'bidGen', function($scope, $location, bidGen) {
      $scope.msgs = [];

      var bid = bidGen.fingerprint.get();
      var username = '';

      // 获取客户端 socket 对象
      var socket = io();

      // 处理连接成功消息
      socket.on('connection success', function() {
        //console.log('connection success');

        // 报告登录
        socket.emit('log in', {
          bid: bid
        });
      });

      // 获取用户名和历史消息
      socket.on('login commit', function(info) {

        // 若设备尚未绑定用户，属于非法进入，退回欢迎页面（不保证像session那样每次进入页面都触发检查）
        if (!info.username) {
          alert('你的设备尚未注册');
          return $location.path('/welcome');
        }

        $scope.msgs = info.msgs;
        $scope.$apply();  // 刷新页面显示
        username = info.username;
      });

      // 接收信息
      socket.on('chat message', function(msg) {
        $scope.msgs.push(msg);
        $scope.$apply();  // 刷新页面显示
      });

      // 发送信息
      $scope.sendSelfMessage = function() {

        // 若设备尚未绑定用户，属于非法进入
        if (!username) {
          alert('你的设备尚未注册');
          return $location.path('/welcome');
        }

        var content = $scope.content;

        if (content) {  // 不处理空白内容
          var msg = {
            username: username,
            content: content
          };
          var selfMsg = {
            username: username,
            content: content,
            self: true  // TODO: 这种方式有待修改
          };
          socket.emit('chat message', msg);
          $scope.msgs.push(selfMsg);  // 更新自己的 model
          $scope.content = '';
        }
      };

      // 滚动到最后一条消息
      $scope.$watch("msgs", function () {
        $scope.$evalAsync(function () {
          scrollToWellBottom();
        });
      }, true);

      // 滚动到信息最底端
      function scrollToWellBottom() {
        var elem = document.getElementsByClassName('chat-display')[0];
        elem.scrollTop = elem.scrollHeight;
      }

    }]);


