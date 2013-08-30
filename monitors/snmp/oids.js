// from
// http://richie.blog.51cto.com/2051544/382828
// http://net-snmp.sourceforge.net/docs/mibs/host.html
module.exports = {
  "load": {
    "1":   ".1.3.6.1.4.1.2021.10.1.3.1",
    "5":   ".1.3.6.1.4.1.2021.10.1.3.2",
    "15":  ".1.3.6.1.4.1.2021.10.1.3.3",
  },
  "cpu": {
    "system":  ".1.3.6.1.4.1.2021.11.10.0",
    "idle":    ".1.3.6.1.4.1.2021.11.11.0",
    "user":    ".1.3.6.1.4.1.2021.11.9.0",
    
    "percentage_system": ".1.3.6.1.4.1.2021.11.10.0",
    "percentage_idle":   ".1.3.6.1.4.1.2021.11.11.0",
    "percentage_user":   ".1.3.6.1.4.1.2021.11.9.0",
  },
  "swap": {
    "total":     ".1.3.6.1.4.1.2021.4.3.0",
    "available": ".1.3.6.1.4.1.2021.4.4.0",
  },
  "memory": {
    "total_swap": ".1.3.6.1.4.1.2021.4.3.0",
    "avai_swap":  ".1.3.6.1.4.1.2021.4.4.0",
    "total_real": ".1.3.6.1.4.1.2021.4.5.0",
    "avai_real":  ".1.3.6.1.4.1.2021.4.6.0",
    "shared":     ".1.3.6.1.4.1.2021.4.13.0",
    "buffer":     ".1.3.6.1.4.1.2021.4.14.0",
    "cached":     ".1.3.6.1.4.1.2021.4.15.0",
  },
  "network": { // http://www.alvestrand.no/objectid/1.3.6.1.2.1.2.2.1.html
    "index":      ".1.3.6.1.2.1.2.2.1.1.",
    "descr":      ".1.3.6.1.2.1.2.2.1.2.",
    "in_octets":  ".1.3.6.1.2.1.2.2.1.10.",
    "out_octets": ".1.3.6.1.2.1.2.2.1.16",
  },
  "system":{
    "descr":     ".1.3.6.1.2.1.1.1.0",
    "object_id": ".1.3.6.1.2.1.1.2.0",
    "uptime":    ".1.3.6.1.2.1.1.3.0",
    "contact":   ".1.3.6.1.2.1.1.4.0",
    "name":      ".1.3.6.1.2.1.1.5.0",
    "location":  ".1.3.6.1.2.1.1.6.0",
    "services":  ".1.3.6.1.2.1.1.7.0",
  }
};

// .1.3.6.1.2.1.25.4.2.1.2  列举所有运行中的进程
// snmpwalk -v2c -c tcmonitor 222.73.254.95 hrStorageTable
// snmpwalk -v2c -c tcmonitor 222.73.254.95 hrDeviceTable
// snmpwalk -v2c -c tcmonitor 222.73.254.95 hrFSTable
// snmpwalk -v2c -c tcmonitor 222.73.254.95 hrSWRunTable
// snmpwalk -v2c -c tcmonitor 222.73.254.95 hrSWRunPerfTable  每个进程的CPU、内存占用数据

