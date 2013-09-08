/*
 * This file is used to create tables for xmonitor
 * 
*/
require("../additions.js");
var express = require('express');

var app = express();
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

app.dbPool = require('mysql').createPool(require('../config.js').db);
app.dbPool.getConnectionAndQueryAllParallell(sqls, function(err, rows){});
console.log("generate tables complete!");
