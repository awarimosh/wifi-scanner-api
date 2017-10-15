var express = require('express');
var router = express.Router();
var macsController = require('../controllers/macsController');

router.get('/sensor/:sensorid', macsController.readSensor);
router.get('/mac/:mac', macsController.readMac);
router.get('/limit/:limit', macsController.readLimit);
router.get('/filter/:sensorID/startDate/:startDate/endDate/:endDate', macsController.readFilter);
router.get('/', macsController.read);

module.exports = router;