var Promise = require('promise');
var util = require('../helpers/controllerUtil');
var db = require('../helpers/dbUtil');

exports.read = function (req, res, next) {

    function resResult(result) {
        // console.log(result);
        res.status(200).json(util.returnResultObject(result));
    }

    function resError(err) {
        console.log(err);
        res.status(500).json(util.returnErrorObject(err));
    }

    var week = parseInt(req.query.week);
    var year = parseInt(req.query.year);
    var sensors = req.query.sensors.split(',');
    var thisWeekdates = getTimestampFromWeek(week, year);
    var lastWeekdates = getTimestampFromWeek(week - 1, year);
    var nextWeekdates = getTimestampFromWeek(week + 1, year);
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

var getTimestampFromWeek = function (weekNo, year) {
    weekNo = weekNo - 1;
    var dayMilliseconds = 86400000;
    var firstJan = new Date(year, 0, 1, 0, 0, 0);
    var firstJanDay = (firstJan.getDay() == 0) ? 7 : firstJan.getDay();
    var daysFormNextMon = (8 - firstJanDay);
    var firstJanNextMonTime = firstJan.getTime() + (daysFormNextMon * dayMilliseconds);
    var firstMonYearTime = (firstJanDay > 1) ? firstJanNextMonTime : firstJan.getTime();
    var currentMon = firstMonYearTime + weekNo * (dayMilliseconds * 7);
    var currentSun = currentMon + (dayMilliseconds * 7) - 1;

    return {
        start: Math.round(currentMon / 1000),
        end: Math.round(currentSun / 1000)
    }
}

var getMacs = function (dates, sensors) {
    var res = [];
    return new Promise(function (resolve, reject) {
        sensors.forEach(function (element) {
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
                if (element !== sensors[sensors.length - 1]) {
                    var jsonVar = {};
                    jsonVar.id = element;
                    jsonVar.data = result;
                    res.push(jsonVar);
                }
                else {
                    console.log('sensors',sensors);
                    var jsonVar = {};
                    jsonVar.id = element;
                    jsonVar.data = result;
                    res.push(jsonVar);
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
            visitors: element.data.length
        })
    }, this);
    return {
        res
    }
}