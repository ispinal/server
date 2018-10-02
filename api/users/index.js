var express = require('express');
var controller = require('./controller');
var bodyParser = require('body-parser');

var router = express.Router();
router.use(bodyParser.json());

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/:email/:token/isLoggedIn', controller.isLoggedIn)

module.exports = router;