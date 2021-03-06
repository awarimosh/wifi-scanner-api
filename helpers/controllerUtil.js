exports.mergeModelsData = function(results){
    var mergedResult = results.reduce(function (x, y)
    {
        x.data.push(y.data[1]);

        var result = {request: x.request, data: x.data};
        return result;
    });
    return mergedResult;
}

exports.returnErrorObject = function(err){
    return {
        result: 'error',
        details: err
    };
}

exports.returnResultObject = function(result){
    return {"response": result};
}

exports.getTimestampFromWeek = function (weekNo, year) {
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

exports.getTimestampFromDate = function (date) {
    var start = new Date(date);
    start.setHours(0,0,0,0);
    
    var end = new Date(date);
    end.setHours(23,59,59,999);

    return {
        start: Math.round(start / 1000),
        end: Math.round(end / 1000)
    }
}

exports.getTimestampFromDates = function (startDate, endDate) {
    var start = new Date(startDate);
    start.setHours(0,0,0,0);
    
    var end = new Date(endDate);
    end.setHours(23,59,59,999);

    return {
        start: Math.round(start / 1000),
        end: Math.round(end / 1000)
    }
}