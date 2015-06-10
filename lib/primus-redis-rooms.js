var redis = require('redis');
var sentinel = require('redis-sentinel');
var rCluster = require('redis-node-cluster');
var Rooms = require('./rooms');
var Spark = require('./spark');

var PrimusRedisRooms = module.exports = function (primus, options) {
  var self = this;
  var sub, pub, channel;

  function getClient() {
    if (options.redis.sentinel) {
      return sentinel.createClient(
        options.redis.endpoints,
        options.redis.masterName,
        options.redis
      );
    }
    if (options.redis.cluster) {
      return rCluster.createClient(
        options.redis.nodes,
        options.redis.options
      );
    }

    return redis.createClient(options.redis);
  }

  channel = options.redis.channel || 'primus';

  pub = getClient();
  sub = getClient();

  self.rooms = new Rooms({
    redis: {
      pub: pub,
      sub: sub,
      channel: channel
    }
  });

  primus.room = function (name) {
    return self.rooms.room(name);
  };

  Spark(primus.Spark);
};

// Hack so that you can `primus.use(require('primus-redis-rooms'))`.
PrimusRedisRooms.server = PrimusRedisRooms;
