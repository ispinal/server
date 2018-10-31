var Cloudant = require('@cloudant/cloudant');
var vcapServices = require('vcap_services');
var credentials = vcapServices.getCredentials('cloudantNoSQLDB');

let connect = function() {
  return new Promise((resolve, reject) => {
    var cloudant = Cloudant({account:credentials.username, password:credentials.password});

    cloudant.db.list(function(err, allDbs) {
      if (!err) {
        console.log('Connected to ispinal Cloudant Database');
        db_object = cloudant.db;
        resolve(db_object);
      } else {
        reject();
      }
    });
  });
}

module.exports = {
  connect
}
