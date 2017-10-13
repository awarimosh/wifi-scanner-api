var express = require('express');
var router = express.Router();
var logsController = require('../controllers/logsController');

/* GET users listing. */
router.get('/', logsController.read);
router.get('/sensor/:sensorid', logsController.readSensor);
router.get('/mac/:mac', logsController.readMac);
router.get('/limit/sensor/', logsController.readSensorLimit);
router.get('/limit/:limit', logsController.readLimit);

module.exports = router;
