var express = require('express');
var router = express.Router();
var visitorsController = require('../controllers/visitorsController');

router.get('/', visitorsController.read);
router.get('/unique', visitorsController.readUnique);
router.get('/week', visitorsController.readWeek);
router.get('/weekUnique', visitorsController.readWeekUnique);

module.exports = router;