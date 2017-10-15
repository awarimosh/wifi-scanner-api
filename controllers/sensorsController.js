var util = require('../helpers/controllerUtil');
var mongojs = require('mongojs');
var db = mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Sensors', 'Macs']);
var sensor;

exports.read = function (req, res, next) {
    db.Sensors.find(function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    });
};

exports.readSensor = function (req, res, next) {
    var id = req.params.deviceID;
    db.Sensors.findOne({ "ID": id }, function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    });
};

exports.readUser = function (req, res, next) {
    var email = req.params.email;
    db.Sensors.find({ "Email": email }, function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    });
};

exports.readLimit = function (req, res, next) {
    var setlimit = parseInt(req.params.limit);
    db.Sensors.find({}).limit(setlimit).skip(0, function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    });
};

exports.create = function (req, res, next) {
    sensor = req.body;
    sensor.createdAt = Date.now();
    console.log('sensor', req.body);
    db.Sensors.save(sensor, function (err, res) {
        if (err)
            console.log('err', err);

        console.log('Save Sensor', sensor);
    });
    res.send('added sensor');
};