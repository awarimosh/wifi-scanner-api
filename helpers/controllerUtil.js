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