var async = require('async');


/*
 * the page to list snmp monitor items
 */
exports.list = function(app, req, res){
  var sql = "select * from monitor_items_snmp";
  app.dbPool.getConnectionAndQuery(sql, function(err, rows){
    if(err) return res.send(500, err);
    var items = rows;
    var loadCpuForItems = function(callback){
      var sqls = [];
      for(var i=0; i<items.length; i++){
        sqls.push("select idle from monitor_items_snmp_cpu_usage where monitor_item_id="+items[i].id
        +" order by created_at desc limit 1");
      }
      app.dbPool.getConnectionAndQueryAllParallell(sqls, function(err, result){
        if(err) return callback(err);
        var usages = [];
        for(var i=0; i<result.length; i++){
          if(result[i][0]) usages.push(10000-result[i][0].idle);
          else usages.push(0);
        }
        return callback(null, usages);
      });
    }
    var loadMemoryForItems = function(callback){
      var sqls = [];
      for(var i=0; i<items.length; i++){
        sqls.push("select * from monitor_items_snmp_memory_usage where monitor_item_id="+items[i].id
        +" order by created_at desc limit 1");
      }
      app.dbPool.getConnectionAndQueryAllParallell(sqls, function(err, result){
        if(err) return callback(err);
        var usages = [];
        for(var i=0; i<result.length; i++){
          var memoryUsed = result[i][0].total_real-result[i][0].avial_real-result[i][0].buffer-result[i][0].cached;
          if(result[i][0]) usages.push(Math.round(10000*memoryUsed/result[i][0].total_real));
          else usages.push(0);
        }
        return callback(null, usages);
      });
    }
    var loadLoadAverageForItems = function(callback){
      var sqls = [];
      for(var i=0; i<items.length; i++){
        sqls.push("select load_1 from monitor_items_snmp_load_average where monitor_item_id="+items[i].id
        +" order by created_at desc limit 1");
      }
      app.dbPool.getConnectionAndQueryAllParallell(sqls, function(err, result){
        if(err) return callback(err);
        var usages = [];
        for(var i=0; i<result.length; i++){
          if(result[i][0]) usages.push(result[i][0].load_1);
          else usages.push(0);
        }
        return callback(null, usages);
      });
    }
    async.parallel([loadCpuForItems, loadMemoryForItems, loadLoadAverageForItems], function(err, result){
      if(err) return res.send(500, err);
      for(var i=0; i<items.length; i++){
        items[i].cpu = result[0][i];
        items[i].memory = result[1][i];
        items[i].load = result[2][i];
      }
      console.log(items);
      res.render('../monitors/snmp/views/list', {items:items, title:'snmp monitor items list' });
    });
  });
}
