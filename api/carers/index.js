var express = require('express');
var controller = require('./controller');
var bodyParser = require('body-parser');

var router = express.Router();
router.use(bodyParser.json());

router.get('/', controller.getAll);

module.exports = router;