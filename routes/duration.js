var express = require('express');
var router = express.Router();
var durationController = require('../controllers/durationController');

router.get('/', durationController.read);
router.get('/unique', durationController.readUnique);

module.exports = router;