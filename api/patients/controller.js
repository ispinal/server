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

      if (db_user.role === 'parent') {
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
        return res.json({err: "only parent's can create patients"});
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

  //1) Check that the user (parent/carer) is logged in and their token is valid. We created a helper function to do this in the users controller. Look at the create patient function for reference. [x]
  if (user.email && user.token) {
    users.userLoggedInAndValidToken(user).then(db_user => {

    //2) Using the callback response from the function in 1. - we need to ensure the user's role is a parent or carer. Again the create patient function can be used for reference.
      if (db_user.role === 'parent' || db_user.role === 'carer') {
        //3) We then need to validate that the observation object is valid. We currently don't have a validator function for this, so one will have to be created. It can go in the patients controller for now, look at validPatientObject for reference.

        if(validObservationObject(observation)){
          users.findObservationObject(patient_id, observation)
          .then(observations_data_store => {
            //4a) Then we need to find the observation object from the database that matches the patient id and also the type of observation (given by the 'name' field).
            observations_data_store.metrics.forEach((el, index) => {

              if(observation.metric_name === el.name){
                observation.values.time = Date.now();
                let newValue = observations_data_store.metrics[index];
                let newObservation = observation.values;

                console.log(newObservation);
                newValue.values.push(newObservation);
                //4b) Then we need to update the observation object with the current observation value and the current timestamp.
                let db = db_object.use('observations_data_store');
                //5) We also need to add the observation to the 'observations_data_store' for the correct patient. Ensure to append to the array here (i.e. add to existing values) as oppose to overwriting them.
                db.insert(observations_data_store, function(err, result) {
                  if(err){
                    return res.json({err: err});
                  }
                  if (result.ok){
                      console.log('observation added');
                      return res.json(200);
                  } else {
                    return res.json({err: "Updating reading"});
                  }
                });
              }
            });
          })
          .catch(error => {
            console.log(`${error}: ===========================================`);
            return res.sendStatus(400);
          })
            //TODO
            //6) At some point we will also need to publish a new observation alert to a message broker so that any connected UI's can be notified of the update. For now we can skip this step.

            //7) Then we need to return ok to the user
        } else {
          return res.json({err: "incorrect observation"});
        }
      } else {
        return res.json({err: "you are not a parent or a carer"});
      }
    }, err => {
      return res.json(err)
    });
  } else {
    return res.json({err: "please specify user id and user token"});
  }
}

let validPatientObject = (patient) => {
  return patient.name && patient.dob && patient.email
}

let validObservationObject = (observation) => {
  let metric = observation.metric_name;
  let values = observation.values;
  if(!values.length > 1 || !isNaN(values[1])){
    return 'object not valid';
  } else {
    let measurement = values.measurement;
    return metric && measurement;
  }
}

module.exports = {
  summary,
  addObservation,
  create
}

//TODO
//3.there is a neater way to use forEach to iterate over the item and index, e.g. according to the documentation (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach):
