var snmp = require("snmp-native");
var util = require('util');
var async = require('async');
var SnmpMonitorMethods = require("./snmp_methods.js");
var SnmpMonitor = {};

SnmpMonitor.config = {
  "name": "snmp server",
};

// called when plugin installed
SnmpMonitor.onInstall = function(app){
  var sqls = [
    "create table if not exists monitor_items_snmp("
    +"id integer not null primary key  auto_increment,"
    +"system_descr varchar(255) not null default '',"
    +"host varchar(255) not null default '',"
    +"port varchar(255) not null default '161',"
    +"community varchar(255) not null default ''"
    +")",
    
    "create table if not exists monitor_items_snmp_cpu_usage("
    +"id integer not null primary key  auto_increment,"
    +"monitor_item_id integer not null,"
    +"user smallint unsigned not null default 0,"
    +"nice smallint unsigned not null default 0,"
    +"system smallint unsigned not null default 0,"
    +"idle smallint unsigned not null default 0,"
    +"wait smallint unsigned not null default 0,"
    +"kernel smallint unsigned not null default 0,"
    +"interrupt smallint unsigned not null default 0,"
    +"steal smallint unsigned not null default 0,"
    +"created_at timestamp not null default current_timestamp,"
    +"unique key monitor_item_id_created_at(monitor_item_id, created_at)"
    +")",
    
    "create table if not exists monitor_items_snmp_load_average("
    +"id integer not null primary key  auto_increment,"
    +"monitor_item_id integer not null,"
    +"load_1 smallint unsigned not null default 0,"
    +"load_5 smallint unsigned not null default 0,"
    +"load_15 smallint unsigned not null default 0,"
    +"created_at timestamp not null default current_timestamp,"
    +"unique key monitor_item_id_created_at(monitor_item_id, created_at)"
    +")",
    
    "create table if not exists monitor_items_snmp_memory_usage("
    +"id integer not null primary key  auto_increment,"
    +"monitor_item_id integer not null,"
    +"total_swap integer unsigned not null default 0,"
    +"avail_swap integer unsigned not null default 0,"
    +"total_real integer unsigned not null default 0,"
    +"avial_real integer unsigned not null default 0,"
    +"shared integer unsigned not null default 0,"
    +"buffer integer unsigned not null default 0,"
    +"cached integer unsigned not null default 0,"
    +"created_at timestamp not null default current_timestamp,"
    +"unique key monitor_item_id_created_at(monitor_item_id, created_at)"
    +")",
    
    "create table if not exists monitor_items_snmp_names("
    +"id smallint unsigned not null primary key  auto_increment,"
    +"name varchar(255) not null,"
    +"unique key name(name)"
    +") engine myisam auto_increment=101",
    
    "insert ignore into monitor_items_snmp_names(id, name) values"
    +"(1, 'lo'), (2, 'eth0'), (3, 'eth1'), (4, 'eth2'), (5, 'eth3'), (6, 'eth4')"
    +", (11, '/'), (12, '/boot')",
    
    "create table if not exists monitor_items_snmp_network_usage("
    +"id smallint unsigned not null primary key  auto_increment,"
    +"monitor_item_id integer not null,"
    +"name_id tinyint unsigned not null,"
    +"`in` integer unsigned not null comment 'Bytes per second',"
    +"`out` integer unsigned not null comment 'Bytes per second',"
    +"created_at timestamp not null default current_timestamp,"
    +"unique key monitor_item_id_created_at(monitor_item_id, created_at, name_id)"
    +")",
    
    "create table if not exists monitor_items_snmp_disk_usage("
    +"id smallint unsigned not null primary key  auto_increment,"
    +"monitor_item_id integer not null,"
    +"name_id tinyint unsigned not null,"
    +"`size` integer unsigned not null comment 'disk size in MB',"
    +"`used` integer unsigned not null comment 'disk size used in MB',"
    +"created_at timestamp not null default current_timestamp,"
    +"unique key monitor_item_id_created_at(monitor_item_id, created_at, name_id)"
    +")",
    
    "insert ignore into monitor_items_snmp values (1, '', '222.73.254.95', 161, 'tcmonitor')",
  ];
  app.dbPool.getConnectionAndQueryAllParallell(sqls, function(err, rows){});
};

// called when plugin uninstalled
SnmpMonitor.onUninstall = function(app){};

// called when application started
SnmpMonitor.onStart = function(app){};

// called when plugin disabled
SnmpMonitor.onDisable = function(app){};

// called when the user pause a mointor item
SnmpMonitor.onPause = function(app){};


var getIdOfName = function(app, name, callback){
  var preDefinedIds = {'lo':1, 'eth0':2, 'eth1':3, 'eth2':4, 'eth3':5, 'eth4':6
  , '/':11, '/boot':12};
  if(preDefinedIds[name]) return callback(null, preDefinedIds[name]);
  var sql = "insert into monitor_items_snmp_names (name) values (?) on duplicate key update id=last_insert_id(id)";
  app.dbPool.getConnectionAndQuery(sql, [name], function(err, result){
    if(err) return callback(err);
    else return callback(null, result.insertId);
  });
};
var getIdsOfNames = function(app, names, callback){
  async.map(names, function(name, callback){
    getIdOfName(app, name, function(err, result){
      return callback(err, result);
    });
  }, function(err, result){
    return callback(err, result);
  });
};




// called to fetch data for a mointor item
SnmpMonitor.fetch = function(app, itemId){
  var sql = "select * from monitor_items_snmp where id=?";
  app.dbPool.getConnectionAndQuery(sql, [itemId], function(err, rows){
    if(err || !rows[0]) return;
    var snmpConfig = rows[0];
    
    var session = new snmp.Session({ host:snmpConfig.host, port:snmpConfig.port, community:snmpConfig.community});
    var currentSystemDescr = "";
    var currentTimestamp = new Date().getTime();;
    SnmpMonitorMethods.fetchSystemDescr(session, function(err, descr){
      if(currentSystemDescr !== descr){
        var sql = "update monitor_items_snmp set system_descr=? where id=?";
        app.dbPool.getConnectionAndQuery(sql, [descr, itemId]);
      }
    });
    SnmpMonitorMethods.fetchCpuUsage(session, function(err, result){
      if(err) return;
      var sql = "insert into monitor_items_snmp_cpu_usage "
      +"(monitor_item_id, user, nice, system, idle, wait, kernel, interrupt, steal, created_at)"
      +"values (?, ?, ?, ?, ?, ?, ?, ?, ?, from_unixtime(?))";
      app.dbPool.getConnectionAndQuery(sql, [itemId, result.user*10000, result.nice*10000, result.system*10000, 
        result.idle*10000, result.wait*10000, result.kernel*10000, result.interrupt*10000, result.steal*10000, 
        currentTimestamp]);
    });
    SnmpMonitorMethods.fetchLoadAverage(session, function(err, result){
      if(err) return;
      var sql = "insert into monitor_items_snmp_load_average "
      +"(monitor_item_id, load_1, load_5, load_15, created_at)"
      +"values (?, ?, ?, ?, from_unixtime(?))";
      app.dbPool.getConnectionAndQuery(sql, [itemId, result.load_1*100, result.load_5*100, result.load_15*100, 
        currentTimestamp]);
    });
    SnmpMonitorMethods.fetchMemoryUsage(session, function(err, result){
      if(err) return;
      var sql = "insert into monitor_items_snmp_memory_usage "
      +"(monitor_item_id, total_swap, avail_swap, total_real, avial_real, shared, buffer, cached, created_at)"
      +"values (?, ?, ?, ?, ?, ?, ?, ?, from_unixtime(?))";
      app.dbPool.getConnectionAndQuery(sql, [itemId, result.total_swap, result.avail_swap, result.total_real,
        result.avial_real, result.shared, result.buffer, result.cached, currentTimestamp]);
    });
    SnmpMonitorMethods.fetchDiskUsage(session, function(err, result){
      var diskNames = [];
      for(var name in result) diskNames.push(name);
      getIdsOfNames(app, diskNames, function(err, diskIds){
        if(err || diskIds.length==0) return;
        var sql = "insert ignore into monitor_items_snmp_disk_usage "
        +"(monitor_item_id, name_id, size, used, created_at) values (?, ?, ?, ?, from_unixtime(?))";
        for(var i=1; i<diskIds.length; i++) sql += ", (?, ?, ?, ?, from_unixtime(?))";
        var params = [];
        for(var i=0; i<diskIds.length; i++){
          params.push(itemId);
          params.push(diskIds[i]);
          params.push(Math.round(result[diskNames[i]].size/1024/1024*result[diskNames[i]].units));
          params.push(Math.round(result[diskNames[i]].used/1024/1024*result[diskNames[i]].units));
          params.push(currentTimestamp);
        }
        app.dbPool.getConnectionAndQuery(sql, params);
      });
    });
    SnmpMonitorMethods.fetchNetworkTraffic(session, function(err, result){
      var networkNames = [];
      for(var name in result) networkNames.push(name);
      getIdsOfNames(app, networkNames, function(err, networkIds){
        if(err || networkIds.length==0) return;
        var sql = "insert ignore into monitor_items_snmp_network_usage "
        +"(monitor_item_id, name_id, `in`, `out`, created_at) values (?, ?, ?, ?, from_unixtime(?))";
        for(var i=1; i<networkIds.length; i++) sql += ", (?, ?, ?, ?, from_unixtime(?))";
        var params = [];
        for(var i=0; i<networkIds.length; i++){
          params.push(itemId);
          params.push(networkIds[i]);
          params.push(result[networkNames[i]].in);
          params.push(result[networkNames[i]].out);
          params.push(currentTimestamp);
        }
        app.dbPool.getConnectionAndQuery(sql, params);
      });
    });
  });
};


module.exports = SnmpMonitor;


