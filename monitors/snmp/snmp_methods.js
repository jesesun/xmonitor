var snmp = require('snmp-native');
require("./additions.js");

SnmpMonitorMethods = {};
SnmpMonitorMethods.fetchSystemDescr = function(session, callback){
  session.get({ oid: '.1.3.6.1.2.1.1.1.0' }, function (err, result) {
    if(err) return callback(err, result);
    var desc = result[0].value;
    var matches = desc.match(/^Linux.* ([\d\.]+-[^ ]+).*(x86_64|x86_32)$/);
    if (matches) desc = "Linux "+ matches[1] + " " + matches[2];
    return callback(null, desc);
  });
};

SnmpMonitorMethods.fetchDeviceInfos = function(session, callback){
  session.getSubtree({ oid: ".1.3.6.1.2.1.25.3.2.1.2" }, function (err, varbind) {
    if(err) return callback(err, varbind);
    var oids = [];
    var deviceTypes = [];
    for (var i = 0; i < varbind.length; i++) {
      switch(varbind[i].value[varbind[i].value.length-1]){
      case 3: // hrDeviceProcessor
      oids.push(".1.3.6.1.2.1.25.3.2.1.3."+varbind[i].oid[varbind[i].oid.length-1]);
      deviceTypes.push('cpu');
      break;
      case 4: // hrDeviceNetwork
      oids.push(".1.3.6.1.2.1.25.3.2.1.3."+varbind[i].oid[varbind[i].oid.length-1]);
      deviceTypes.push('network');
      break;
      case 6: // hrDeviceDiskStorage
      oids.push(".1.3.6.1.2.1.25.3.2.1.3."+varbind[i].oid[varbind[i].oid.length-1]);
      deviceTypes.push('disk');
      break;
      case 12: // hrDeviceCoprocessor
      break;
      }
    }
    session.getAllParallell({ oids: oids }, function (err, varbind) {
      if(err) return callback(err, varbind);
      var result = {cpus:[], disks:[], networks:[]};
      if(varbind.length === deviceTypes.length){
        for (var i = 0; i < varbind.length; i++) {
          var type = deviceTypes[i];
          if(type==='cpu'){
            result.cpus.push(varbind[i].value);
          }else if(type==='network'){
            result.networks.push(varbind[i].value);
          }else if(type==='disk'){
            result.disks.push(varbind[i].value);
          }
        }
      }
      callback(err, result);
    });
  });
};


SnmpMonitorMethods.fetchCpuUsage = function(session, callback){
  var fetchCpuRawUsage = function(callback){
    var oids = [
        '.1.3.6.1.4.1.2021.11.50.0', // ssCpuRawUser
        '.1.3.6.1.4.1.2021.11.51.0', // ssCpuRawNice
        '.1.3.6.1.4.1.2021.11.52.0', // ssCpuRawSystem
        '.1.3.6.1.4.1.2021.11.53.0', // ssCpuRawIdle
        '.1.3.6.1.4.1.2021.11.54.0', // ssCpuRawWait
        '.1.3.6.1.4.1.2021.11.55.0', // ssCpuRawKernel
        '.1.3.6.1.4.1.2021.11.56.0', // ssCpuRawInterrupt
        '.1.3.6.1.4.1.2021.11.64.0'  // ssCpuRawSteal
    ];
    session.getAllParallell({oids:oids}, function(err, result){
      if(err) return callback(err);
      var cpuUsages = [];
      for (var i = 0; i < result.length; i++) {
        if(result[i].type===65){
          cpuUsages.push(result[i].value);
        }else cpuUsages.push(0);
      }
      return callback(null, cpuUsages);
    });
  };
  fetchCpuRawUsage(function(err, usages){
    if(err) return callback(err);
    var previousCpuUsages = usages;
    setTimeout(function(){
      fetchCpuRawUsage(function(err, usages){
        if(err) return callback(err);
        var currentCpuUsages = usages;
        if(currentCpuUsages.length !== previousCpuUsages.length) return callback("falied to fetch cpu usage");
        var cpuTimes = [];
        var sumCpuTime = 0;
        for (var i = 0; i < currentCpuUsages.length; i++) {
          cpuTimes.push(currentCpuUsages[i]-previousCpuUsages[i]);
          sumCpuTime += cpuTimes[i];
        }
        if(sumCpuTime===0) return callback("falied to fetch cpu usage");
        return callback(null, {
          user: cpuTimes[0] / sumCpuTime,
          nice: cpuTimes[1] / sumCpuTime,
          system: cpuTimes[2] / sumCpuTime,
          idle: cpuTimes[3] / sumCpuTime,
          wait: cpuTimes[4] / sumCpuTime,
          kernel: cpuTimes[5] / sumCpuTime,
          interrupt: cpuTimes[6] / sumCpuTime,
          steal: cpuTimes[7] / sumCpuTime
        });
      });
    }, 5000); // refetch cpu usage data after five seconds, to wait snmp server refresh data
  });
};


SnmpMonitorMethods.fetchMemoryUsage = function(session, callback){
  var oids = [
      '.1.3.6.1.4.1.2021.4.3.0',  // memTotalSwap
      '.1.3.6.1.4.1.2021.4.4.0',  // memAvailSwap
      '.1.3.6.1.4.1.2021.4.5.0',  // memTotalReal
      '.1.3.6.1.4.1.2021.4.6.0',  // memAvailReal
      '.1.3.6.1.4.1.2021.4.13.0', // memShared
      '.1.3.6.1.4.1.2021.4.14.0', // memBuffer
      '.1.3.6.1.4.1.2021.4.15.0', // memCached
  ];
  session.getAllParallell({oids:oids}, function(err, result){
    if(err) return callback(err);
    var usages = [];
    for (var i = 0; i < result.length; i++) {
      if(result[i].type===2){
        usages.push(result[i].value);
      }else usages.push(0);
    }
    return callback(null, {
      total_swap: usages[0],
      avail_swap: usages[1],
      total_real: usages[2],
      avial_real: usages[3],
      shared: usages[4],
      buffer: usages[5],
      cached: usages[6],
    });
  });
};


SnmpMonitorMethods.fetchNetworkTraffic = function(session, callback){
  var fetchNetworkTrafficOctets = function(oids, callback){
    session.getAllParallell({oids:oids}, function(err, result){
      if(err) return callback(err);
      var octes = [];
      for (var i = 0; i < result.length; i++) {
        octes.push(result[i].value);
      }
      return callback(null, octes);
    });
  };
  session.get({oid:'.1.3.6.1.4.1.8072.1.5.3.1.2.1.3.6.1.2.1.2.2'}, function(err, result){
    if(err) return callback(err);
    if(result.length===0) return callback("failed to get ifTable update frequency");
    var frequency = result[0].value;
    console.debug("%s:%s ifTable update frequency is %d", session.options.host, session.options.port, frequency);
    session.getSubtree({oid:'.1.3.6.1.2.1.2.2.1.2'}, function(err, result){ // get network devices
      if(err) return callback(err);
      var deviceNames = [];
      var oids = [];
      for (var i = 0; i < result.length; i++) {
        deviceNames.push(result[i].value);
        oids.push(".1.3.6.1.2.1.2.2.1.10."+result[i].oid[result[i].oid.length-1]);
        oids.push(".1.3.6.1.2.1.2.2.1.16."+result[i].oid[result[i].oid.length-1]);
      }
      fetchNetworkTrafficOctets(oids, function(err, octes){
        if(err) return callback(err);
        var previousNetworkOctes = octes;
        setTimeout(function(){
          fetchNetworkTrafficOctets(oids, function(err, octes){
            if(err) return callback(err);
            var currentNetworkOctes = octes;
            // console.log(currentNetworkOctes);
            // console.log(previousNetworkOctes);
            var result = {};
            for (var i = 0; i < deviceNames.length; i++) {
              var inOctes = currentNetworkOctes[i*2] - previousNetworkOctes[i*2];
              var outOctes = currentNetworkOctes[i*2+1] - previousNetworkOctes[i*2+1];
              result[deviceNames[i]] = {
                in: Math.round(inOctes/frequency),
                out: Math.round(outOctes/frequency),
              }
            }
            return callback(null, result);
          });
        }, frequency*1000);
      });
    });
  });
};


SnmpMonitorMethods.fetchDiskUsage = function(session, callback){
  session.getSubtree({oid:'.1.3.6.1.2.1.25.2.3.1.2‎'}, function(err, result){ // get network devices
    if(err) return callback(err);
    var diskSuffixes = []; // get the disk oid suffix
    for(var i=0; i<result.length; i++){
      if(result[i].value[result[i].value.length-1] === 4){
        diskSuffixes.push(result[i].oid[result[i].oid.length-1]);
      }
    }
    var oids = [];
    for(var i=0; i<diskSuffixes.length; i++){
      oids.push(".1.3.6.1.2.1.25.2.3.1.3."+diskSuffixes[i]); // hrStorageDescr
      oids.push(".1.3.6.1.2.1.25.2.3.1.4."+diskSuffixes[i]); // hrStorageAllocationUnits
      oids.push(".1.3.6.1.2.1.25.2.3.1.5."+diskSuffixes[i]); // hrStorageSize
      oids.push(".1.3.6.1.2.1.25.2.3.1.6."+diskSuffixes[i]); // hrStorageUsed
    }
    session.getAllParallell({oids:oids}, function(err, result){
      if(err) return callback(err);
      var diskUsages = {};
      for(var i=0; i<diskSuffixes.length; i++){
        diskUsages[result[i*4].value] = {units:result[i*4+1].value, size:result[i*4+2].value, used:result[i*4+3].value};
      }
      return callback(null, diskUsages);
    });
  });
};



SnmpMonitorMethods.fetchLoadAverage = function(session, callback){
  var oids = ['.1.3.6.1.4.1.2021.10.1.3.1', '.1.3.6.1.4.1.2021.10.1.3.2', '.1.3.6.1.4.1.2021.10.1.3.3'];
  session.getAllParallell({oids:oids}, function(err, result){
    if(err) return callback(err);
    return callback(null, {
      load_1: result[0].value,
      load_5: result[1].value,
      load_15: result[2].value,
    });
  });
}





module.exports = SnmpMonitorMethods;