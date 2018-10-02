var db_object = require('../../app').db_object;

let summary = (req, res) => {
  let id = req.params.id;
  db = db_object.use('metrics');
  db.find({selector:{patient_id:id}}, function(er, result) {
    if (er) {
      throw er;
    }
    res.json(result.docs)
  });
}


module.exports = {
  summary
}