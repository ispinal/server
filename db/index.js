var Cloudant = require('@cloudant/cloudant');
var username = process.env.CLOUDANT_USERNAME;
var password = process.env.CLOUDANT_PASSWORD;

let connect = function() {
  return new Promise((resolve, reject) => {
    var cloudant = Cloudant({account:username, password:password});

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
