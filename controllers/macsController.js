var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Macs']);

exports.read = function (req, res, next) {
    db.Macs.find({}).sort({ timestamp: -1 }).skip(0, function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    })
};

exports.readSensor = function (req, res, next) {
    var id = parseInt(req.params.sensorid);
    db.Macs.findOne({ "sensorID": id }, function (err, sensors) {
        if (err) {
            res.send(err);
        }
        res.json(sensors);
    });
};

exports.readMac = function (req, res, next) {
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
};

exports.readLimit = function (req, res, next) {
    var setlimit = parseInt(req.params.limit);
    console.log('readLimit', setlimit);
    db.Macs.find({}).sort({ timestamp: -1 }).limit(setlimit).skip(0, function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    });
};

exports.readFilter = function (req, res, next) {
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
};