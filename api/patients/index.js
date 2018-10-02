var express = require('express');
var controller = require('./controller');
var bodyParser = require('body-parser');

var router = express.Router();
router.use(bodyParser.json());

router.get('/:email/:token/:patient_id/summary', controller.summary);
router.post('/create', controller.create);
router.post('/addObservation', controller.addObservation);

module.exports = router;