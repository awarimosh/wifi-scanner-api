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
                if((inner.timestamp - inner.createdAt) > 0){
                    duration += (inner.timestamp - inner.createdAt);
                }
                if(index == (element.data.length - 1)){
                    res.push({
                        sensorID: element.id,
                        data: Math.round(duration/60000) 
                    })
                }
            }, this);
        }else{
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
