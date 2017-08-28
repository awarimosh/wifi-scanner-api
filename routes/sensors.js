var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Sensors', 'Macs']);
var sensor;
/* GET users listing. */
router.get('/', function (req, res, next) {
    db.Sensors.find(function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    })
});

router.get('/sensors', function (req, res, next) {
    db.Sensors.find(function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    })
});

//Get Single Task
router.get('/sensor/:deviceID', function (req, res, next) {
    var id = req.params.deviceID;
    db.Sensors.findOne({ "deviceID": id }, function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    })
});


//Set Limit
router.get('/limit/:limit', function (req, res, next) {
    var setlimit = parseInt(req.params.limit);
    db.Sensors.find({}).limit(setlimit).skip(0, function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    })
})

//post sensors

router.post('/create', function (req, res) {
    sensor = req.body;
    sensor.createdAt = Date.now();
    console.log('sensor', req.body);
    db.Sensors.save(sensor, function (err, res) {
        if (err)
            console.log('err', err);

        console.log('Save Sensor', sensor);
    });
    res.send('added sensor');
})

module.exports = router;
