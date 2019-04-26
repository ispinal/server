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

var db_object = require('../../app').db_object;
var users = require('../users/controller.js');
let config = require('../../config/config.js');

let matchCarer = (req, res) => {
let user = req.body.user
let combination = req.body.combination
  if (user.email && user.token && combination) {
    users.userLoggedInAndValidToken(user).then(db_user => { 
      let db = db_object.use("potential_matches")
      db.find({selector:{combination: combination, carerId: user.email}}, function(err, match) {
        if (err) {
          return res.json(err)
        } else if (match.docs && match.docs.length > 0) {
          let patientId = match.docs[0].patientId
          db = db_object.use("users")
          db.find({selector: {email: user.email}}, function(err, result) {
            if (err) {
              return res.json(err)
            } else if (result.docs && result.docs.length === 1) {
              let db_user = result.docs[0]
              db_user.patients.push(patientId)
              db.insert(db_user, function(err, result) {
                if (err) {
                  return res.json(err)
                } else if (result.ok) {
                  deletePotentialMatch(match.docs[0]).then(_ => {
                    return res.json({ok: true})
                  }, err => {
                    return res.json(err)
                  })
                } else {
                  return res.json({err: "Could not update carer information"})
                }
              })
            } else {
              return res.json({err: "Can't find carer"})
            }
          })
        } else {
          return res.json({err: "Combination not found for this carer"})
        }
      })         
    }, err => {
      res.status(403)
      res.json(err)
    })
  } else {
    res.status(400)
    res.json({err: "Please ensure you pass all parameters in correctly"})
  }
}

let deletePotentialMatch = (match) => {
  return new Promise((resolve, reject) => {
    let db = db_object.use("potential_matches")
    console.log(match._id, match._rev)
    db.destroy(match._id, match._rev, function(err, result){
      if(err){
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

module.exports = {
  matchCarer
}