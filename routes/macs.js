var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Macs']);

/* GET Macs listing. */
router.get('/', function (req, res, next) {
    db.Macs.find({}).sort({ timestamp: -1 }).skip(0, function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    })
});

//Get Single Task
router.get('/sensor/:sensorid', function (req, res, next) {
    var id = parseInt(req.params.sensorid);
    db.Macs.findOne({ "sensorid": id }, function (err, sensors) {
        if (err) {
            res.send(err);
        }
        res.json(sensors);
    })
});

//Get Single Task
router.get('/mac/:mac', function (req, res, next) {
    var mac = req.params.mac;
    var result = [];
    db.Macs.find().forEach(function (err, doc) {
        if (!doc) {
            res.json(result);
            return;
        }
        if (doc.mac == mac) {
            result.push(doc);
        }
    });
});

//Set Limit
router.get('/limit/:limit', function (req, res, next) {
    var setlimit = parseInt(req.params.limit);
    db.Macs.find({}).sort({ timestamp: -1 }).limit(setlimit).skip(0, function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    })
})

//Get Macs By Date
router.get('/filter/:sensorID/startDate/:startDate/endDate/:endDate', function (req, res, next) {
    var startDate = parseInt(req.params.startDate);
    var endDate = parseInt(req.params.endDate);
    var sensorID = parseInt(req.params.sensorID);
    var result = [];
    db.Macs.find().forEach(function (err, doc) {
        if (!doc) {
            res.json(result);
            return;
        }
        if (doc.timestamp >= startDate && doc.timestamp <= endDate && doc.sensorID == sensorID) {
            result.push(doc);
        }
    });
});


module.exports = router;