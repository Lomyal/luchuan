'use strict';

angular.module('myApp.chatroom', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/chatroom/:name', {
        templateUrl: 'chatroom/chatroom.html',
        controller: 'ChatroomCtrl'
      });
    }])

    .controller('ChatroomCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
      $scope.msgs = [];
      var bid = getCanvasFingerprint();

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

      // 获取浏览器 canvas 指纹
      function getCanvasFingerprint() {

        // 方法来源于 https://github.com/Valve/fingerprintjs/blob/master/fingerprint.js
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        // https://www.browserleaks.com/canvas#how-does-it-work
        var txt = 'http://valve.github.io';
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText(txt, 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText(txt, 4, 17);

        var b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
        var bin = atob(b64);

        return bin2hex(bin.slice(-16,-12));

        function bin2hex(s) {
          //  discuss at: http://phpjs.org/functions/bin2hex/
          // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
          // bugfixed by: Onno Marsman
          // bugfixed by: Linuxworld
          // improved by: ntoniazzi (http://phpjs.org/functions/bin2hex:361#comment_177616)
          //   example 1: bin2hex('Kev');
          //   returns 1: '4b6576'
          //   example 2: bin2hex(String.fromCharCode(0x00));
          //   returns 2: '00'

          var i, l, o = '', n;
          s += '';
          for (i = 0, l = s.length; i < l; i++) {
            n = s.charCodeAt(i).toString(16);
            o += n.length < 2 ? '0' + n : n;
          }
          return o;
        }
      }



    }]);


