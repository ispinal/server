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

        db.find({selector:{email:user.email}}, function(err, body) {
          if (err) {
            return res.json({err: err});
          }
          if (body.docs.length === 0) {
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
        })
      });
    } else {
      return res.json({err: "Passwords do not match"})
    }
  } else {
    return res.json({err: "Invalid User Object"});
  }
}

let login = (req, res) => {
  let user = req.body;

  if (userLoginObjectIsValid(user)) {

    // Check if user exists
    let db = db_object.use('users')
    db.find({selector:{email: user.email}}, function(err, body) {
      if (err) {
        return res.json(err)
      } 
      if (body.docs.length === 1) {
        //continue
        let db_user = body.docs[0]

        bcrypt.compare(user.password, db_user.password, function(err, password_check) {
          if (password_check) {
            // Update database to say user is logged in
            if (db_user.logged_in && db_user.logged_in.status) {
              user.logged_in = db_user.logged_in
              return res.json(user)
            } else {

              //generate token and store in database
              db_user.logged_in = {status: true, token: uuidv1()}
              db.insert(db_user, function(err, result) {
                if (err) {
                  return res.json({err: err});
                }
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

module.exports = {
  register,
  login,
  logout,
  isLoggedIn
}