var Promise = require('promise');
var util = require('../helpers/controllerUtil');
var mongojs = require('mongojs');
var db = mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Entries']);

exports.read = function (req, res, next) {
    db.Entries.find(function (err, entries) {
        if (err) {
            console.log(err)
            res.send(err);
        }
        console.log(entries)
        res.json(entries);
    })
};

exports.readSensor = function (req, res, next) {
    var id = parseInt(req.params.sensorid);
    db.Entries.findOne({ "sensorid": id }, function (err, sensors) {
        if (err) {
            res.send(err);
        }
        res.json(sensors);
    })
};

exports.readMac = function (req, res, next) {
    var mac = req.params.mac;
    var result = [];
    db.Entries.find().forEach(function (err, doc) {
        if (!doc) {
            res.json(result);
            return;
        }

        doc.data.forEach(function (curentData) {
            if (curentData.mac == mac) {
                result.push(doc);
            }
        });
    });
};

exports.readLimit = function (req, res, next) {
    var setlimit = parseInt(req.params.limit);
    db.Entries.find({}).sort({ dateTime: -1 }).limit(setlimit).skip(0, function (err, result) {
        if (err) {
            console.error(err)
            res.send(err);
        }
        res.json(result);
    })
}

exports.readSensorLimit = function (req, res, next) {
    var limit = parseInt(req.query.limit);
    var sensors = req.query.sensors.split(',');
    var array = [];
    sensors.forEach(function (element, index) {
        db.Entries.find({ "sensorid": parseInt(element) }).sort({ dateTime: -1 }).limit(limit).skip(0, function (err, result) {
            if (err) {
                console.error(err)
                res.send(err);
            }
            array.push(result)
            if (sensors.length - 1 == index) {
                res.status(200).json(util.returnResultObject(array));
            }
        })
    })
}