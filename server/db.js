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
 * 某设备（由BID标识）第一次登录时，绑定该设备和用户名
 * @param bid
 * @param username
 * @param callback
 */
methods.bindUser = function(bid, username, callback) {
  var doc = {
    bid: bid,
    username: username,
  };
  coll_user.updateOne({bid: bid}, {$setOnInsert: doc}, {upsert: true}, function(err, r) {
    callback(err, r);
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

module.exports = methods;