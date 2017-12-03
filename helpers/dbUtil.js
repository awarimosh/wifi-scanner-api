exports.macs = function () {
    var mongojs = require('mongojs');
    return mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Macs']);
}

exports.logs = function () {
    var mongojs = require('mongojs');
    return mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Entries']);
}

exports.users = function () {
    var mongojs = require('mongojs');
    return mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Users']);
}

exports.visitors = function () {
    var mongojs = require('mongojs');
    return mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Data']);
}