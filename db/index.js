/*******************************************************************************
 * Copyright 2019 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/
 
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
