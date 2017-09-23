var express = require('express');
var router = express.Router();
var visitorsController = require('../controllers/visitorsController');

router.get('/', visitorsController.read);

module.exports = router;