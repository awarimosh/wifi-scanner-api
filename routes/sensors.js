var express = require('express');
var router = express.Router();
var sensorsController = require('../controllers/sensorsController');

router.get('/sensors/:deviceID', sensorsController.readSensor);
router.get('/user/:email', sensorsController.readUser);
router.get('/limit/:limit', sensorsController.readLimit);
router.post('/create', sensorsController.create);
router.get('/', sensorsController.read);

module.exports = router;
