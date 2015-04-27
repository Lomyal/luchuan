var settings = require('../settings');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var methods = {};  // 数据库相关方法汇总
var coll_user = null;  // 用户信息，主要记录 BID 向 username 的映射
var coll_record = null;  // 聊天记录，扁平结构

// Connection URL
var url = 'mongodb://' + settings.host + ':' + settings.db.port + '/' + settings.db.name;

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log('Connected correctly to server ' + url);

  coll_user = db.collection('user');
  coll_record = db.collection('record');

  coll_user.createIndex({bid: 1}, {unique: true}, function() {
    console.log('index of bid created!')
  });

});

/**
 * 判断某设备是否注册过。若注册过，则返回用户名
 * @param bid
 * @param callback
 */
methods.findBrowser = function(bid, callback) {
  coll_user.findOne({bid: bid}, function(err, doc) {
    var username = doc && doc.username;
    var lastVisitDate = doc && doc.lastVisitDate;

    callback(err, username, lastVisitDate);
  });
};

/**
 * 某设备（由BID标识）第一次登录时，绑定该设备和用户名
 * @param bid
 * @param username
 * @param callback
 */
methods.bindUser = function(bid, username, callback) {

  coll_user.findOne({username: username}, function(err, doc) {

    // 若用户名存在，则返回错误
    if (doc) {
      return callback('duplicate username', null);
    }

    // 用户名不存在
    var newDoc = {
      bid: bid,
      username: username,
      lastVisitDate: new Date()
    };
    coll_user.updateOne({bid: bid}, {$setOnInsert: newDoc}, {upsert: true}, function(err, r) {
      return callback(err, r);
    });

  });
};

/**
 * 修改用户名
 * @param bid
 * @param username
 * @param callback
 */
methods.updateUsername = function(bid, username, callback) {
  coll_user.updateOne({bid: bid}, {$set: {username: username}}, function(err, r) {
    callback(err, r);
  });
};

methods.updateLastVisitDate = function(username, callback) {
  coll_user.updateOne({username: username}, {$set: {lastVisitDate: new Date()}}, function(err, r) {
    callback(err, r);
  });
};

/**
 * 存储单条聊天消息
 * @param room
 * @param username
 * @param message
 * @param callback
 */
methods.saveMsg = function(room, username, message, callback) {
  var record = {
    room: room,
    username: username,
    message: message,
    date: new Date()
  };

  coll_record.insertOne(record, function(err, r) {
    assert.equal(null, err);
    assert.equal(1, r.insertedCount);

    callback(err, r);
  });
};

/**
 * 获取历史聊天消息
 * @param room
 * @param username
 * @param startDate
 * @param callback
 */
methods.getHistoryMessages = function(room, startDate, callback) {
  var query = {
    room: room,
    date: {$gt: startDate}
  };

  coll_record.find(query).toArray(function(err, docs) {
    callback(err, docs);
  });
};

module.exports = methods;