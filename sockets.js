var net = require('net');
var mongojs = require('mongojs');
var db = mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Entries', 'Macs', 'Routers']);
var entry = {};

var HOST = '61.6.4.157';
// var HOST2 = '175.138.59.232';
var HOST2 = '175.143.246.165';

var PORT1 = 21471;
var PORT = 21470;

var client = new net.Socket();
var client1 = new net.Socket();
var client2 = new net.Socket();

var clientStatus = client1Status = client2Status = false;

var timeout, timeout1, timeout2;
var today = new Date().setHours(0, 0, 0, 0) / 1000;

var clientConnect = function () {
    if (!clientStatus) {
        client.connect(PORT, HOST, clientStatus = function () {
            console.log('CONNECTED TO: ' + HOST + ':' + PORT, new Date().toLocaleString());
            return true
        });

    }
    else {
        console.log(">>>Refused Connection at " + PORT, new Date().toLocaleString())
    }

};

var client1Connect = function () {
    if (!client1Status) {
        client1.connect(PORT1, HOST, client1Status = function () {
            console.log('CONNECTED TO: ' + HOST + ':' + PORT1, new Date().toLocaleString());
            return true;
        });
    }
    else {
        console.log(">>>Refused Connection at "+ PORT1, new Date().toLocaleString())
    }

};

var client2Connect = function () {
    if (!client2Status) {
        client2.connect(PORT, HOST2, client1Status = function () {
            console.log('CONNECTED TO: ' + HOST2 + ':' + PORT, new Date().toLocaleString());
            return true;
        });
    }
    else {
        console.log(">>>Refused Connection at "+ PORT, new Date().toLocaleString())
    }

};

var passMacs = function (data) {
    today = new Date().setHours(0, 0, 0, 0) / 1000;
    var timeNow = new Date().toLocaleString();
    var sensorID = data.sensorid;
    data.macs.forEach(function (element) {
        db.Routers.findOne({
            mac: element.mac,
        }, function (err, doc) {
            if (doc == null) {
                db.Macs.findOne({
                    sensorID: element.sensorID,
                    mac: element.mac,
                    timestamp: {
                        $gte: today
                    }
                }, function (err, doc) {
                    if (doc != null) {
                        db.Macs.update(
                            {
                                sensorID: element.sensorID,
                                mac: element.mac,
                                timestamp: {
                                    $gte: today
                                }
                            },
                            {
                                $set: {
                                    rssi: element.rssi,
                                    timestamp: element.timestamp
                                }
                            },
                            {
                                upsert: true,
                                multi: true
                            }
                        )
                        console.log("Updated Entry @ " + timeNow, element.mac);
                    }
                    else {
                        db.Macs.save(element, function (err, res) {
                            if (err)
                                console.log('err', err);
                            console.log("Created Entry @ "+ timeNow, element.mac);
                        });
                    }
                })
            }
        })
    }, this);
}

var passData = function (data) {
    today = new Date().setHours(0, 0, 0, 0) / 1000;
    entry = JSON.parse(data);
    entry.dateTime = Date.now();
    db.Entries.save(entry, function (err, entry) {
        if (err)
            console.log('err', err);

        var pass = new Promise((resolve, reject) => {
            var sensorID = entry.sensorid;
            if (entry.ssid != undefined && entry.ssid.length > 0) {
                entry.ssid.forEach(function (element, index) {
                    var mac = {
                        ssid: element.ssid,
                        mac: element.mac,
                        rssi: element.rssi,
                        timestamp: element.timestamp,
                        createdAt: element.timestamp
                    }
                    db.Routers.update(
                        {
                            mac: mac.mac
                        },
                        {
                            $set: {
                                rssi: mac.rssi,
                                timestamp: mac.timestamp,
                                ssid: mac.ssid
                            }
                        },
                        {
                            upsert: true,
                            multi: true
                        }
                    )
                    if (index >= entry.ssid.length - 1) {
                        resolve(entry);
                    }

                }, this);
            }
            else {
                resolve(entry);
            }
        }).then((out1) => {
            return new Promise((resolve, reject) => {
                var macs = [];
                var sensorID = out1.sensorid;
                var out = {
                    sensorID: sensorID,
                    macs: ""
                }
                out1.data.forEach(function (element, index) {
                    var mac = {
                        sensorID: sensorID,
                        mac: element.mac,
                        rssi: element.rssi,
                        timestamp: element.timestamp,
                        createdAt: element.timestamp
                    }
                    db.Macs.findOne({
                        mac: mac.mac,
                    }, function (err, doc) {
                        if (doc == null) {
                            mac.unique = true;
                        }
                        else {
                            mac.unique = false;
                        }
                        macs.push(mac);
                        if (index >= out1.data.length - 1) {
                            out.macs = macs;
                            resolve(out);
                        }
                    })
                }, this);
            });
        }).then((out2) => {
            passMacs(out2)
        })
    });
}

function timeConverter(timestamp) {
    const time = new Date(timestamp * 1000);
    return time.toLocaleString();
}

function sockets() {
    clientConnect();

    client1Connect();

    client2Connect();

    client.on('data', function (data) {
        passData(data);
    });

    client1.on('data', function (data) {
        passData(data);
    });

    client2.on('data', function (data) {
        passData(data);
    });

    client.on('error', function (e) {
        console.log(PORT, e.code);
    });

    client1.on('error', function (e) {
        console.log(PORT1, e.code);
    });

    client2.on('error', function (e) {
        console.log(PORT, e.code);
    });

    // Add a 'close' event handler for the client socket
    client.on('close', function () {
        console.log('Connection closed ' + HOST + " : " +  PORT, new Date().toLocaleString());
        client.destroy();
        clearTimeout(timeout);
        timeout = setTimeout(clientConnect, 12000);
        clientStatus = false;
    });

    client1.on('close', function () {
        console.log('Connection closed ' + HOST + " : " + PORT1, new Date().toLocaleString());
        client1.destroy();
        clearTimeout(timeout1);
        timeout1 = setTimeout(client1Connect, 12000);
        client1Status = false;
    });

    client2.on('close', function () {
        console.log('Connection closed',HOST2 +":"+ PORT);
        client2.destroy();
        clearTimeout(timeout2);
        timeout2 = setTimeout(client2Connect, 12000);
        client2Status = false;
    });
}

module.exports = sockets;




