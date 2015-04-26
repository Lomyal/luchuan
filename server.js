var settings = require('./settings');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var favicon = require('express-favicon');
var assert = require('assert');

var db = require('./server/db');

// 设置网站小图标
app.use(favicon('app/img/favicon.ico'));

// 静态资源加载目录
app.use(express.static('app'));

// request body parser FOR JSON
app.use(bodyParser.json());

// 处理 bid 验证请求
app.post('/bid', function(req, res) {
  var bid = req.body.bid;

  db.findBrowser(bid, function(err, username, lastVisitDate) {
    llog('USER ' + username +' found in database.');

    res.send({
      username: username,
      lastVisitDate: lastVisitDate
    });
  });

});

// 处理注册请求
app.post('/reg', function(req, res) {
  db.bindUser(req.body.bid, req.body.username, function(err) {
    assert.equal(null, err);

    res.send('registered successfully');
  });
});

// socket 处理
io.on('connection', function(socket) {

  // 连接成功后，请求客户端发来用户信息
  socket.emit('connection success');

  var bid = '';
  var username = '';

  // 处理登录
  socket.on('log in', function(info) {
    bid = info.bid;

    // 获取用户名
    db.findBrowser(bid, function(err, un, lastVisitDate) {

      // TODO: 设备尚未绑定时（un 未定义）的处理

      username = un;
      llog('USER: [' + username + '] logged in.');

      // 获取历史消息
      db.getHistoryMessages('luchuan', lastVisitDate, function(err, docs) { // 目前只有‘luchuan’这一个聊天室
        var msgs = [];
        docs.forEach(function(doc) {
          msgs.push({
            username: doc.username,
            content: doc.message
          });
        });

        // 回送用户名，以及发送用户未接收过的历史消息
        socket.emit('login commit', {
          username: username,
          msgs: msgs
        });
      });

    });
  });

  // 处理消息
  socket.on('chat message', function(msg) {

    // 存储此消息
    db.saveMsg('luchuan', msg.username, msg.content, function(err, r) {  // 目前只有‘luchuan’这一个聊天室

      // 向发起此消息的用户之外的用户广播此消息
      socket.broadcast.emit('chat message', msg);
      llog('MSG: [' + msg.username + '] ' + msg.content);
    });

  });

  // 处理离线
  socket.on('disconnect', function() {

    // 修改该用户的最后登录时间
    db.updateLastVisitDate(username, function() {

      llog('USER: [' + username + '] logged out.');
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