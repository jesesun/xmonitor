var snmp = require("snmp-native");
var util = require('util');
var SnmpMonitorMethods = require("./snmp_methods.js");
var SnmpMonitor = {};

SnmpMonitor.config = {
  "name": "snmp server",
};

// called when plugin installed
SnmpMonitor.onInstall = function(app){
  var sql = "create table if not exists monitor_items_snmp("
  +"id primary key not null default 0,"
  +"system_descr varchar(255) not null default '',"
  +"host varchar(255) not null default '',"
  +"port varchar(255) not null default '161',"
  +"community varchar(255) not null default ''"
  +")";
  app.dbPool.getConnection(function(err, db){
    if(err) util.error(err);
    db.query(sql);
  });
};

// called when plugin uninstalled
SnmpMonitor.onUninstall = function(app){};

// called when application started
SnmpMonitor.onStart = function(app){};

// called when plugin disabled
SnmpMonitor.onDisable = function(app){};

// called when the user pause a mointor item
SnmpMonitor.onPause = function(app){};


// called to fetch data for a mointor item
SnmpMonitor.fetch = function(app, itemId){
  var session = new snmp.Session({ host: '222.73.254.95', port: 161, community: 'tcmonitor' });
  SnmpMonitorMethods.fetchSystemDescr(session, function(err, result){
    console.log(result);
  });
  SnmpMonitorMethods.fetchLoadAverage(session, function(err, result){
    console.log(result);
  });
};


module.exports = SnmpMonitor;


