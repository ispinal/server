var express = require('express');
var controller = require('./controller');

var router = express.Router();

router.get('/:id/summary', controller.summary);

module.exports = router;