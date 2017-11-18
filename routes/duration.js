var express = require('express');
var router = express.Router();
var durationController = require('../controllers/durationController');

router.get('/', durationController.read);
router.get('/week', durationController.readWeek);
router.get('/unique', durationController.readUnique);
router.get('/weekUnique', durationController.readWeekUnique);

module.exports = router;