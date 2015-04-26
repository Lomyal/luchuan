var settings = require('./settings');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var favicon = require('express-favicon');

var db = require('./server/db');

// 设置网站小图标
app.use(favicon('app/img/favicon.ico'));

// 静态资源加载目录
app.use(express.static('app'));

//app.get('/', function(req, res){
//  res.sendFile(__dirname + '/app/index.html');
//});

// socket 处理
io.on('connection', function(socket) {
  llog('A user connected');

  // 处理登录信息
  socket.on('log in', function(info) {
    llog('BID: ' + info.bid);
    llog('USR: ' + info.username);

    // insert
    db.bindUser(info.bid, info.username, function() {

      // 处理消息
      socket.on('chat message', function(msg) {

        // 向发起此消息的用户之外的用户广播此消息
        socket.broadcast.emit('chat message', msg);
        llog('MSG: ' + msg.name + ' - ' + msg.content);
      });

      // 处理离线
      socket.on('disconnect', function() {
        llog('A user disconnected');
      });
    });
  });
});

// 打开 HTTP 监听
http.listen(settings.port, function() {
  lllog('Listening on ' + settings.host + ':' + settings.port);
});




// 日志输出函数
function llog(msg) {
  console.log((new Date()).toTimeString() + ' ### ' + msg);
}

function lllog(msg) {
  console.log('====================== START UP! ======================');
  llog(msg);
}