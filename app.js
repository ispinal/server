/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// Load environment variables
require('dotenv').config()

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = module.exports = express();

// Connect to database
var db = require('./db/index.js');
db.connect().then(db_object => {

  // Load routes
  app.db_object = db_object
  require('./api/routes.js')(app)

  // get the app environment from Cloud Foundry
  var appEnv = cfenv.getAppEnv();

  // start server on the specified port and binding host
  app.listen(appEnv.port, '0.0.0.0', function() {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
  });


}, err => {
  console.log('error - can\'t connect to cloudant database. Server not running')
})


