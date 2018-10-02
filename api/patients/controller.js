var db_object = require('../../app').db_object;
var users = require('../users/controller.js');
let config = require('../../config/config.js');

let summary = (req, res) => {
  let user = {
    email: req.params.email,
    token: req.params.token,
  }
  let patient_id = req.params.patient_id

  if (user.email && user.token && patient_id) {
    users.userLoggedInAndValidToken(user).then(db_user => {
      users.userCanAccessPatientData(db_user, patient_id).then( _ =>{
        db = db_object.use('observations');
        db.find({selector:{patient_id:patient_id}}, function(er, result) {
          if (er) {
            return res.json(err)
          }
          res.json(result.docs)
        });
      }, _ => {
        return res.json({err: "user cannot access patient data"})
      })
    }, err => {
      return res.json(err)
    })
  } else {
    return res.json({err: "please specify user id, user token and patient id"});
  }
}

// Create a patient
let create = (req,res) => {
  let user = req.body.user
  let patient = req.body.patient

  if (user.email && user.token) {
    users.userLoggedInAndValidToken(user).then(db_user => {

      if (db_user.role === 'parent' || db_user.role === 'carer') {
        if (validPatientObject(patient)) {
          patient.role = 'patient'

          // Create observations object with default metrics
          let observations = config.observations
          let observations_data_store_object = {
            patient_id: patient.email,
            metrics: []
          }
          observations.forEach(obsv => {
            obsv.patient_id = patient.email
            observations_data_store_object.metrics.push({
              name: obsv.name,
              values: []
            })
          })

          // Add patient to users list of allowed patients for this user
          patientDoesNotExist(patient).then(_ => {
            db_user.patients.push(patient.email);

            // Save to database
            // Insert Observations
            let db = db_object.use('observations')
            db.bulk({docs: observations}, function(err, result) {
              if (err) {
                return res.json({err: err});
              }
              if (result) { 

                // Insert Observations Data Store
                let db = db_object.use('observations_data_store');
                db.insert(observations_data_store_object, function(err, result) {
                   if (err) {
                     return res.json({err: err});
                   }
                   if (result.ok) {

                    // Update User
                    let db = db_object.use('users');
                    let users_to_insert = [db_user, patient]
                    db.bulk({docs: users_to_insert}, function(err, result) {
                      if (err) {
                        return res.json({err: err});
                      }
                      if (result) {
                        return res.sendStatus(200)
                      } else {
                        return res.json({err: "Error updating user", result: result})
                      }
                    });

                   } else {
                    return res.json({err: "Error inserting observations data store"})
                   }
                })
              } else {
                return res.json({err: "Error inserting observations"})
              }
            })
          }, err => {
            return res.json({err: "patient already exists"})
          })          
        } else {
          return res.json({err: "invalid patient object"});
        }
      } else {
        return res.json({err: "only parent's and carer's can create patients"});
      }
    }, err => {
      return res.json(err)
    });
  } else {
    return res.json({err: "please specify user id and user token"});
  }
}

let patientDoesNotExist = (patient) => {
  return new Promise((resolve, reject) => {
    db = db_object.use('users');
    db.find({selector:{email:patient.email}}, function(er, result) {
      if (er) {
        return res.json(err)
      } else if (result.docs.length === 0) {
        resolve()
      } else if (result.docs.length > 0) {
        reject()
      }
    });
  })
}

let addObservation = (req, res) => {
  let user = req.body.user
  let patient_id = req.body.patient_id
  let observation = req.body.observation




}

let validPatientObject = (patient) => {
  return patient.name && patient.dob && patient.email
}

module.exports = {
  summary,
  addObservation,
  create
}