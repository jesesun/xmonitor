var Mysql = require('mysql');
var Pool = require('mysql/lib/Pool');
var fs = require('fs');
var async = require('async');


if(String.prototype.md5==undefined){
	String.prototype.md5 = function(){
		var hash = require('crypto').createHash('md5');
		return hash.update(this+"").digest('hex');
	};
}
if(String.prototype.isNumeric==undefined){
  String.prototype.isNumeric = function(){
    return (this - 0) == this && (this+'').replace(/^\s+|\s+$/g, "").length > 0;
  };
}
if(String.prototype.startsWith==undefined){
  String.prototype.startsWith = function(str){
    return this.indexOf(str) == 0;
  };
}
if(String.prototype.format==undefined){
	Date.prototype.format = function(format){
		if(format==undefined) format = "Y-m-d H:i:s";
		var year = this.getFullYear();
		var month = this.getMonth()+1;
		var day = this.getDate();
		var hour = this.getHours();
		var minute = this.getMinutes();
		var second = this.getSeconds();
		var result = format.replace('Y', year);
		result = result.replace('m', (month<10?"0"+month:month));
		result = result.replace('d', (day<10?"0"+day:day));
		result = result.replace('H', (hour<10?"0"+hour:hour));
		result = result.replace('i', (minute<10?"0"+minute:minute));
		result = result.replace('s', (second<10?"0"+second:second));
		return result;
	};
}
if(String.prototype.capitalize==undefined){
  String.prototype.capitalize = function () {
    return this[0].toUpperCase() + this.slice(1);
  };
}
if(String.prototype.trim==undefined){
  String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
  };
}
if(String.prototype.replaceAll==undefined){
  String.prototype.replaceAll = function(search, replacement) {
    return this.split(search).join(replacement);
  };
}
if(console.debug==undefined){
	if(1){
		console.debug = function(message){
			var now = new Date();
			var millisecond = now.getTime()%1000;
			var millisecond_s = millisecond;
			if(millisecond<10) millisecond_s = '00'+millisecond;
			else if(millisecond<100) millisecond_s = '0'+millisecond;
      arguments[0] = "["+now.format()+'.'+millisecond_s+"] " + arguments[0];
      console.log.apply(null, arguments);
		};
	}else console.debug = function(){};
}




if(fs.mkdirs==undefined){
  fs.mkdirs = function(path, mode, callback){
    if (typeof mode === 'function'){
      callback = mode;
      mode = 0777;
    }
    var dirs = path.split("/");
    var confirmed_dirs = [dirs.shift()]; 
    var walk = function(){
      if(dirs.length==0) callback();
      else{
        confirmed_dirs.push(dirs.shift());
        var folder_path = confirmed_dirs.join('/');
        fs.stat(folder_path, function(err, stat){
          if(err){
            fs.mkdir(folder_path, function(){
              walk();
            });
          }else{
            walk();
          }
        });
      }
    };
    walk();
  };
}

if(Pool.prototype.getConnectionAndQuery==undefined){
  Pool.prototype.getConnectionAndQuery = function(sql, params, callback){
    if(params && typeof params=='function'){
      callback = params;
      params = [];
    }
    self = this;
    self.getConnection(function(err, connection) {
      if(err && callback) return callback(err);
      connection.query(sql, params, function(err, rows){
        self.releaseConnection(connection);
        if(callback) return callback(err, rows);
      });
    });
  }
}
if(Pool.prototype.getConnectionAndQueryAllParallell==undefined){
  Pool.prototype.getConnectionAndQueryAllParallell = function(sqls, callback){
    self = this;
    async.map(sqls, function(sql, callback){
      if(!sql || sql=="") return callback();
      self.getConnectionAndQuery(sql, function(err, rows){
        return callback(err, rows);
      });
    }, function(err, results){
      return callback(err, results);
    });
  }
}








