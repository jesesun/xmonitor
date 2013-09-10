
/*
 * route for pages of monitors
 */

exports.index = function(req, res){
  res.render('index', { title: 'xmonitor' });
};


/*
 * the page to list monitor items of type, just like list all snmp monitor items
 */
exports.list = function(req, res){
  var monitorType = req.params[0];
  require('../monitors/'+monitorType+'/controller.js').list(require('../app.js'), req, res);
}