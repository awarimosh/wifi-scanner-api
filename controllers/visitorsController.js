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
    var weeksDate = {
        start: util.getTimestampFromWeek(week - 1, year),
        end: util.getTimestampFromWeek(week + 1, year)
    };
    var resData = {};

    getMacs(thisWeekdates, sensors)
    .then(function (data) {
        resData.thisweek = data;
        return getMacs(lastWeekdates, sensors)
    }, resError)
    .then(function (data) {
        resData.lastweek = data;
        return getMacs(nextWeekdates, sensors)
    }, resError)
    .then(function (data) {
        resData.nextweek = data;
        return resData
    }, resError)
    .then(resResult, resError)
    .catch(resResult);
};

exports.readWeek = function (req,res, next) {   
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

exports.readWeekUnique = function (req,res, next) {   
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

var getMacs = function (dates, sensors) {
    sensors = sensors.toString().split(',').map(function (item) {
        return parseInt(item, 10);
    });
    return new Promise(function (resolve, reject) {
        db.macs().Macs.find({
            timestamp: {
                $gte: dates.start,
                $lt: dates.end
            },
            sensorID: { $in: sensors }
        }).skip(0, function (err, result) {
            if (err) {
                console.log(err, typeof (err));
                reject(err);
            }
            if (result) {
                var rr = formatResult(sensors, result);
                if (rr) {
                    resolve(rr)
                }
            }
        })
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
    data.forEach(function (element) {
        res.push({
            sensorID: element.id,
            data: element.data.length
        })
    }, this);
    return {
        res
    }
}

var formatResult = function (sensors, result) {
    var res = [];
    var jsonVar = {};
    sensors.forEach(function (element, index) {
        jsonVar = {};
        jsonVar.sensorID = element;
        jsonVar.data = result.filter(function (el) { return el.sensorID == element }).length;
        res.push(jsonVar);
        if (index + 1 == sensors.length) {
            return res;
        }
    });
    return res;
}