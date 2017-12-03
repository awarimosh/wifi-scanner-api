var Promise = require('promise');
var util = require('../helpers/controllerUtil');
var db = require('../helpers/dbUtil');

exports.read = function (req, res, next) {
    function resResult(result) {
        res.status(200).json(util.returnResultObject(result));
    }

    function resError(err) {
        res.status(500).json(util.returnErrorObject(err));
    }

    var week = parseInt(req.query.week);
    var year = parseInt(req.query.year);
    var sensors = req.query.sensors.split(',');
    var thisWeekdates = util.getTimestampFromWeek(week, year);
    var lastWeekdates = util.getTimestampFromWeek(week - 1, year);
    var nextWeekdates = util.getTimestampFromWeek(week + 1, year);
    var resData = {};

    getMacs(thisWeekdates, sensors)
        .then(
        function (data) {
            return new Promise(function (resolve, reject) {
                var result = formatData(data, thisWeekdates);
                if (result === undefined)
                    reject()
                resolve(result);
            });
        }, resError)
        .then(function (data) {
            resData.thisweek = data.res;
            return getMacs(lastWeekdates, sensors)
        }, resError)
        .then(function (data) {
            return new Promise(function (resolve, reject) {
                var result = formatData(data, lastWeekdates);
                if (result === undefined)
                    reject()
                resolve(result);
            });
        }, resError)
        .then(function (data) {
            resData.lastweek = data.res;
            return getMacs(nextWeekdates, sensors)
        }, resError)
        .then(function (nxt) {
            return new Promise(function (resolve, reject) {
                var result = formatData(nxt, nextWeekdates);
                if (result === undefined)
                    reject()
                resData.nextweek = result.res;
                resolve(resData);
            });
        }, resError)
        .then(resResult, resError)
        .catch(resResult);
};

exports.readUnique = function (req, res, next) {
    function resResult(result) {
        res.status(200).json(util.returnResultObject(result));
    }

    function resError(err) {
        res.status(500).json(util.returnErrorObject(err));
    }

    var week = parseInt(req.query.week);
    var year = parseInt(req.query.year);
    var sensors = req.query.sensors.split(',');
    var thisWeekdates = util.getTimestampFromWeek(week, year);
    var lastWeekdates = util.getTimestampFromWeek(week - 1, year);
    var nextWeekdates = util.getTimestampFromWeek(week + 1, year);
    var resData = {};

    getUniqueMacs(thisWeekdates, sensors)
        .then(
        function (data) {
            return new Promise(function (resolve, reject) {
                var result = formatData(data, thisWeekdates);
                if (result === undefined)
                    reject()
                resolve(result);
            });
        }, resError)
        .then(function (data) {
            resData.thisweek = data.res;
            return getUniqueMacs(lastWeekdates, sensors)
        }, resError)
        .then(function (data) {
            return new Promise(function (resolve, reject) {
                var result = formatData(data, lastWeekdates);
                if (result === undefined)
                    reject()
                resolve(result);
            });
        }, resError)
        .then(function (data) {
            resData.lastweek = data.res;
            return getUniqueMacs(nextWeekdates, sensors)
        }, resError)
        .then(function (nxt) {
            return new Promise(function (resolve, reject) {
                var result = formatData(nxt, nextWeekdates);
                if (result === undefined)
                    reject()
                resData.nextweek = result.res;
                resolve(resData);
            });
        }, resError)
        .then(resResult, resError)
        .catch(resResult);
}

exports.readWeek = function (req, res, next) {
    function resResult(result) {
        res.status(200).json(util.returnResultObject(result));
    }

    function resError(err) {
        res.status(500).json(util.returnErrorObject(err));
    }
    var week = parseInt(req.query.week);
    var year = parseInt(req.query.year);
    var sensors = req.query.sensors.toString().split(',').map(function (item) {
        return parseInt(item, 10);
    });
    var dates = util.getTimestampFromWeek(week, year);
    db.macs().Macs.find({
        timestamp: {
            $gte: dates.start,
            $lt: dates.end
        },
        sensorID: { $in: sensors }
    }).skip(0, function (err, result) {
        if (err) {
            console.log(err, typeof (err));
            resError(err);
        }
        if (result) {
            var rr = formatResult(sensors, result);
            if (rr) {
                resResult(rr);
            }
        }
    })
}

exports.readWeekUnique = function (req, res, next) {
    function resResult(result) {
        res.status(200).json(util.returnResultObject(result));
    }

    function resError(err) {
        res.status(500).json(util.returnErrorObject(err));
    }
    var week = parseInt(req.query.week);
    var year = parseInt(req.query.year);
    var sensors = req.query.sensors.toString().split(',').map(function (item) {
        return parseInt(item, 10);
    });
    var dates = util.getTimestampFromWeek(week, year);
    db.macs().Macs.find({
        timestamp: {
            $gte: dates.start,
            $lt: dates.end
        },
        sensorID: { $in: sensors },
        unique: true
    }).skip(0, function (err, result) {
        if (err) {
            console.log(err, typeof (err));
            resError(err);
        }
        if (result) {
            var rr = formatResult(sensors, result);
            if (rr) {
                resResult(rr);
            }
        }
    })
}

var getMacs = function (dates, sensors) {
    var res = [];
    var jsonVar = {};
    return new Promise(function (resolve, reject) {
        sensors.forEach(function (element, index, array) {
            db.macs().Macs.find({
                timestamp: {
                    $gte: dates.start,
                    $lt: dates.end
                },
                sensorID: parseInt(element)
            }).skip(0, function (err, result) {
                if (err) {
                    reject(err);
                }
                jsonVar = {};
                jsonVar.id = element;
                jsonVar.data = result;
                res.push(jsonVar);
                if (res.length === array.length) {
                    resolve(res);
                }
            })
        }, this);
    })
}

var getUniqueMacs = function (dates, sensors) {
    var res = [];
    var jsonVar = {};
    return new Promise(function (resolve, reject) {
        sensors.forEach(function (element, index, array) {
            db.macs().Macs.find({
                timestamp: {
                    $gte: dates.start,
                    $lt: dates.end
                },
                sensorID: parseInt(element),
                unique: true
            }).skip(0, function (err, result) {
                if (err) {
                    reject(err);
                }
                jsonVar = {};
                jsonVar.id = element;
                jsonVar.data = result;
                res.push(jsonVar);
                if (res.length === array.length) {
                    resolve(res);
                }
            })
        }, this);
    })
}

var formatData = function (data, dates) {
    var res = [];
    var duration = 0;
    data.forEach(function (element) {
        if (element.data[0] != undefined && element.data[0] != null) {
            element.data.forEach(function (inner, index) {
                if ((inner.timestamp - inner.createdAt) > 0) {
                    duration += (inner.timestamp - inner.createdAt);
                }
                if (index == (element.data.length - 1)) {
                    res.push({
                        sensorID: element.id,
                        data: Math.round(duration / 60000)
                    })
                }
            }, this);
        } else {
            res.push({
                sensorID: element.id,
                data: 0
            })
        }
    }, this);
    return {
        res
    }
}

var formatResult = function (sensors, data) {
    var json = {};
    var array = [];
    sensors.forEach(function (sensor) {
        json[sensor] = 0;
    });
    data.forEach(function (element){
        json[element.sensorID] += (element.timestamp - element.createdAt);
        json[element.sensorID] += 120000;
    })
    sensors.forEach(function (sensor) {
        var js = {};
        js.sensorID = sensor;
        js.data = (json[sensor]/60000).toFixed(2);
        array.push(js);
    });
    return array;
}