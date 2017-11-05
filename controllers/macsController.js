var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = require('../helpers/dbUtil');
var util = require('../helpers/controllerUtil');

exports.read = function (req, res, next) {
    db.macs().Macs.find({}).sort({ timestamp: -1 }).skip(0, function (err, result) {
        if (err) {
            res.send(err);
        }
        res.json(result);
    })
};

exports.readSensor = function (req, res, next) {
    var id = parseInt(req.params.sensorid);
    db.macs().Macs.findOne({ "sensorID": id }, function (err, sensors) {
        if (err) {
            res.send(err);
        }
        res.json(sensors);
    });
};

exports.readMac = function (req, res, next) {
    var mac = req.params.mac;
    db.macs().Macs.find({
        mac: mac
    }).skip(0, function (err, result) {
        if (err) {
            console.log(err, typeof (err));
            reject(err);
        }
        if (result) {
            res.json(result);
        }
    })
    // var result = [];
    // db.macs().Macs.find().forEach(function (err, doc) {
    //     if (!doc) {
    //         res.json(result);
    //         return;
    //     }
    //     if (doc.mac == mac) {
    //         result.push(doc);
    //     }
    // });
};

exports.readLimit = function (req, res, next) {
    var setlimit = parseInt(req.params.limit);
    db.macs().Macs.find({}).sort({ timestamp: -1 }).limit(setlimit).skip(0, function (err, result) {
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
    db.macs().Macs.find({
        timestamp: {
            $gte : startDate,
            $lte: endDate
        },
        sensorID: sensorID
    }).skip(0, function (err, result) {
        if (err) {
            console.log(err, typeof (err));
            reject(err);
        }
        if (result) {
            res.json(result);
        }
    })
    //var result = [];
    // db.macs().Macs.find().forEach(function (err, doc) {
    //     if (!doc) {
    //         res.json(result);
    //         return;
    //     }
    //     if (doc.timestamp >= startDate && doc.timestamp <= endDate && doc.sensorID == sensorID) {
    //         result.push(doc);
    //     }
    // });
};

exports.readHourChart = function (req, res, next) {
    function resResult(result) {
        res.status(200).json(util.returnResultObject(result));
    }

    function resError(err) {
        res.status(500).json(util.returnErrorObject(err));
    }
    var date = req.query.date;
    var sensors = req.query.sensors.split(',');
    var resData = {};
    sensors = sensors.toString().split(',').map(function (item) {
        return parseInt(item, 10);
    });

    getHourData(util.getTimestampFromDate(date), sensors)
        .then(
        function (data) {
            return new Promise(function (resolve, reject) {
                var result = formatHourData(data, util.getTimestampFromDate(date), sensors);
                if (result === undefined)
                    reject()
                resolve(result);
            });
        }, resError)
        .then(resResult, resError)
        .catch(resResult);
};

var getHourData = function (date, sensors) {
    return new Promise(function (resolve, reject) {
        db.macs().Macs.find({
            timestamp: {
                $gte: date.start,
                $lt: date.end
            },
            sensorID: { $in: sensors }
        }).skip(0, function (err, result) {
            if (err) {
                console.log(err, typeof (err));
                reject(err);
            }
            if (result) {
                resolve(result);
            }
        })
    })
}

var formatHourData = function (data, date, sensors) {
    var json = {}, array = [], current = date.start;
    for (var i = 0; i < 24; i++) {
        json = {}; value = {};
        json.name = i + 1 + ":00";
        sensors.forEach(function (sensor) {
            json[sensor] = data.filter(function (element) {
                return ((element.timestamp >= current && element.timestamp < current + 3600) && element.sensorID == sensor.toString());
            }).length;
        }, this);
        array.push(json);
        current = current + 3600;
    }
    return array;
}