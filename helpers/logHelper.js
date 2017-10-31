var fs = require('fs')

exports.write = function (count, status, client) {
    var data = {date:  new Date().toLocaleString(), count: count , status : status, client : client};
    fs.appendFile('logs.json', JSON.stringify(data) + ',\n');
}

exports.flush = function () {
    fs.writeFileSync('logs.json', '');
}