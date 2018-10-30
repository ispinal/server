var db_object = require('../../app').db_object;

const bcrypt = require('bcrypt');
const saltRounds = 10;
const uuidv1 = require('uuid/v1');

let register = (req, res) => {
  let user = req.body;

  if (userRegistrationObjectIsValid(user)) {
    if (user.password === user.confirm_password) {
      bcrypt.hash(user.password, saltRounds, function(err, hash) {

        // Store in database
        user.password = hash
        delete user.confirm_password

        let db = db_object.use('users')

        //Does user already exist?
        db.find({selector:{email:user.email}}, function(err, body) {
          if (err) {
            return res.json({err: err});
          } else if (body.docs.length === 0) {
            db.insert(user, function(err,result) {
              if (err) {
                return res.json({err: err});
              }
              if (result.ok) {
                res.sendStatus(200)
              } else {
                return res.json({err: "Error registering"})
              }
            });
          } else {
            return res.json({err: "user already registered"});
          }
        });

      });
    } else {
      return res.json({err: "Passwords do not match"})
    }
  } else {
    return res.json({err: "Invalid User Object"});
  }
}

let login = (req, res) => {


  let user = req.body; //store request body in user variable

  //call function that returns true if username and password exist in the user variable (request body)
  if (userLoginObjectIsValid(user)) {

    let db = db_object.use('users'); // databse of 'users' variable set to db variable from cloudant
    //use find method on database to match requets email
    db.find({selector:{email: user.email}}, function(err, body) {
      //check if there is an error with the request
      console.log(body);
      if (err) {
        return res.json(err) //return error in the response body
      }
      // check if the body exists and it contains the required fields
      if (body.docs.length === 1) {

        let db_user = body.docs[0]; //set variable db_user to be the object in the body of the response

        //use bcrpyt to compare passwords
        bcrypt.compare(user.password, db_user.password, function(err, password_check) {
          //check to see if password_check is true
          if (password_check) {
            // if the user is arlready logged in
            if (db_user.logged_in && db_user.logged_in.status) {
              user.logged_in = db_user.logged_in
              return res.json(user);
            } else {
              //generate token and store in database (use uuidv1 to generate the token)
              db_user.logged_in = {status: true, token: uuidv1()}
              //inset into the database the token and status in an object
              db.insert(db_user, function(err, result) {
                if (err) {
                  //if error return error
                  return res.json({err: err});
                }
                //if result is ok then delete the rev no and password from the body and return the variable db_user on response
                if (result.ok) {
                  delete db_user._rev
                  delete db_user.password
                  res.json(db_user);
                } else {
                  return res.json({err: "Error logging in"})
                }
              })
            }
          } else {
            return res.json({err:"error logging in"})
          }
        });

      } else {
        return res.json({err:"error logging in"})
      }
    })
  }
}

let logout = (req, res) => {
  let user = req.body
  if (userTokenObjectIsValid(user)) {
    userLoggedInAndValidToken(user).then(db_user => {

      // Update database to say user is logged out
      let db = db_object.use('users');
      db_user.logged_in = {status: false, token: null}
      db.insert(db_user, function(err, result) {
        if (err) {
          return res.json({err: err});
        }
        if (result.ok) {
          res.sendStatus(200)
        } else {
          return res.json({err: "Error logging out"})
        }
      })
    }, err => {
      return res.json(err)
    })
  } else {
    return res.json({err: "User object not valid"})
  }

}

let isLoggedIn = (req, res) => {
  let user = {
    email: req.params.email,
    token: req.params.token
  }
  if (userTokenObjectIsValid(user)) {
    userLoggedInAndValidToken(user).then(db_user => {
      res.json({"status": true})
    }, err => {
      return res.json({"status": false})
    });
  } else {
    return res.json({"status": false})
  }
}

let userRegistrationObjectIsValid = (user) => {
  let name = user.name
  let email = user.email
  let password = user.password
  let confirm = user.confirm_password
  let role = user.role
  return name && email && password && confirm && role
}

let userLoginObjectIsValid = (user) => {
  let email = user.email
  let password = user.password
  return email && password
}

let userTokenObjectIsValid = (user) => {
  let email = user.email
  let token = user.token
  return email && token
}

let userLoggedInAndValidToken = (user) => {
  // console.log('fired promise 1');
  return new Promise((resolve, reject) => {
    let db = db_object.use('users');
    db.find({selector:{email: user.email}}, function(err, body) {
      if (err) {
        return reject(err)
      }
      if (body.docs.length === 1) {

        // Check user is logged in and token matches
        let db_user = body.docs[0]
        if (db_user.logged_in && db_user.logged_in.status && user.token === db_user.logged_in.token) {
          resolve(db_user)
        } else {
          return reject({err: "user not logged in or token is invalid"})
        }
      } else {
        return reject(err)
      }
    });
  });
}


//============== IN CASE I MESS UP I HAVE A COPY =================//
// let findObservationObject = (patient_id, observation) => {
//   return new Promise((resolve, reject) => {
//
//     let db = db_object.use('observations_data_store');
//
//     if(){
//
//     }
//
//     db.find({selector:{patient_id: patient_id}}, function(err, body){
//
//       if(body.docs[0].patient_id === patient_id){
//         let observations_data_store = body.docs[0];
//
//         if(err){
//           return reject()
//         } else{
//           //return the whole database object
//           return resolve(observations_data_store);
//         }
//
//       } else {
//         return reject();
//       }
//
//     })
//
// })
// }

let userCanAccessPatientData = (user, patient_id) => {
  return new Promise((resolve, reject) => {
    let allowed = false
    user.patients.forEach(patient => {
      if (patient === patient_id) {
        allowed = true;
      }
    })
    if (allowed) {
      resolve()
    } else {
      reject()
    }
  })
}

module.exports = {
  register,
  login,
  logout,
  isLoggedIn,
  userLoggedInAndValidToken,
  userCanAccessPatientData
}
