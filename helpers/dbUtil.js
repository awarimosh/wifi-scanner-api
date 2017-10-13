exports.macs = function () {
    var mongojs = require('mongojs');
    return mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Macs','Entries']);
}

exports.logs = function () {
    var mongojs = require('mongojs');
    return mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Entries']);
}