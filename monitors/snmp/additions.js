var snmp = require('snmp-native');
var async = require('async');
var util = require('util');

if(snmp.Session.prototype.getAllParallell==undefined){
  // get info of some oids parallell
  snmp.Session.prototype.getAllParallell = function(options, callback){
    var _this = this;
    var itemOptions = [];
    for (var i = 0; i < options.oids.length; i++) {
      itemOptions.push({oid:options.oids[i]});
    }
    async.map(itemOptions, function(options, callback){
      snmp.Session.prototype.get.call(_this, options, callback);
    }, function(err, result){
      if (err) return callback(err, result);
      var items = [];
      for (var i = 0; i < result.length; i++) {
        if(util.isArray(result[i]) && result[i].length===1){
          items.push(result[i][0]);
        }
      }
      return callback(err, items);
    });
  };
}