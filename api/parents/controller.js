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
let randomise = require('randomatic');

//Link a carer
let addCarer = (req, res) => {
  let user = req.body.user
  let carerId = req.body.carerId
  let patientId = req.body.patientId

  if (user.email && user.token && patientId && carerId) {
    users.userLoggedInAndValidToken(user).then(db_user => {
      users.userCanAccessPatientData(db_user, patientId).then( _ =>{
        addPotentialMatch(patientId, carerId).then(combination =>{
          res.json({combination})
        }, err => {
          res.status(500)
          res.json(err)
        })

      }, _ => {
        res.status(403)
        res.json({err: "user cannot access patient data"})
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

let addPotentialMatch = (patientId, carerId) => {
  return new Promise((resolve, reject) => {
    let combination = randomise('0', 4)
    let potentialMatch = {patientId, carerId, combination}
    let db = db_object.use("potential_matches")
    db.find({selector:{patientId: patientId, carerId: carerId}}, function(err, result){
      if (err) {
        return reject(err)
      } else if (result.docs && result.docs.length === 0) {
        db.insert(potentialMatch, function(err, result){
          if (err) {
            return reject(err)
          } else if (result.ok) {
            return resolve(combination)
          } else {
            return reject({err: "Error inserting potential match into database"})
          }
        })
      } else {
        let combination = result.docs[0].combination
        return reject({err: "Match already exists and the ID is: " + combination, combination: combination})
      }
    })
  })
}

module.exports = {
  addCarer
}