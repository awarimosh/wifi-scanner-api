var net = require('net');
var mongojs = require('mongojs');
var db = mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Entries', 'Macs', 'Routers']);
var entry = {};

var HOST = '61.6.23.70';
//var HOST = '175.144.126.54';

var PORT1 = 21471;
var PORT = 21470;

var client = new net.Socket();
var client1 = new net.Socket();

var clientStatus = false;
var client1Status = false;
var timeout, timeout1;
var today = new Date().setHours(0, 0, 0, 0) / 1000;

var clientConnect = function () {
    if (!clientStatus) {
        client.connect(PORT, HOST, clientStatus = function () {
            console.log('CONNECTED TO: ' + HOST + ':' + PORT);
            return true
        });

    }
    else {
        console.log("Refused Connection at ", PORT)
    }

};

var client1Connect = function () {
    if (!client1Status) {
        client1.connect(PORT1, HOST, client1Status = function () {
            console.log('CONNECTED TO: ' + HOST + ':' + PORT1);
            return true;
        });
    }
    else {
        console.log("Refused Connection at ", PORT1)
    }

};

var passMacs = function (data) {
    var sensorID = data.sensorid;
    data.data.forEach(function (element) {
        var mac = {
            sensorID: sensorID,
            mac: element.mac,
            rssi: element.rssi,
            timestamp: element.timestamp,
            createdAt: element.timestamp
        }
        db.Routers.findOne({
            sensorID: mac.sensorID,
            mac: mac.mac,
        }, function (err, doc) {
            if (doc == null) {
                db.Macs.findOne({
                    sensorID: mac.sensorID,
                    mac: mac.mac,
                    timestamp: {
                        $gte: today
                    }
                }, function (err, doc) {
                    if (doc != null) {
                        db.Macs.update(
                            {
                                sensorID: mac.sensorID,
                                mac: mac.mac,
                                timestamp: {
                                    $gte: today
                                }
                            },
                            {
                                $set: {
                                    rssi: mac.rssi,
                                    timestamp: mac.timestamp
                                }
                            },
                            {
                                upsert: true,
                                multi: true
                            }
                        )
                        // console.log("Updated Entry " + mac.sensorID + " mac: " + mac.mac);
                    }
                    else {
                        db.Macs.save(mac, function (err, res) {
                            if (err)
                                console.log('err', err);
                            // console.log("Created Entry " + mac.sensorID + " mac: " + mac.mac);
                        });
                    }
                })
            }
        })
    }, this);
}

function timeConverter(timestamp) {
    const time = new Date(timestamp * 1000);
    return time.toLocaleString();
}

function sockets() {
    clientConnect();

    client1Connect();

    client.on('data', function (data) {
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
            })

            pass.then((data) => {
                passMacs(data)
            })
        });
    });

    client1.on('data', function (data) {
        today = new Date().setHours(0, 0, 0, 0) / 1000;
        entry = JSON.parse(data);
        entry.dateTime = Date.now();
        db.Entries.save(entry, function (err, entry) {
            if (err)
                console.log('err', err);

            var pass = new Promise((resolve, reject) => {
                var sensorID = data.sensorid;
                if (entry.ssid != undefined && entry.ssid.length > 0) {
                    entry.ssid.forEach(function (element, index) {
                        var mac = {
                            ssid: entry.sensorID,
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
                                    ssid: mac.rssi,
                                    rssi: mac.rssi,
                                    timestamp: mac.timestamp
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
            })

            pass.then((data) => {
                passMacs(data)
            })
        });
    });

    client.on('error', function (e) {
        if (e.code == 'ECONNREFUSED' && clientStatus) {
            client.destroy();
            clearTimeout(timeout);
            timeout = setTimeout(clientConnect, 10000);
            clientStatus = false;
            console.log('Timeout for 4 seconds before trying port:' + PORT + ' again');
        }
    });

    client1.on('error', function (e) {
        if (e.code == 'ECONNREFUSED' && client1Status) {
            client1.destroy();
            clearTimeout(timeout1);
            timeout1 = setTimeout(client1Connect, 10000);
            client1Status = false;
            console.log('Timeout for 4 seconds before trying port:' + PORT + ' again');
        }
    });

    // Add a 'close' event handler for the client socket
    client.on('close', function () {
        console.log('Connection closed', PORT);
        client.destroy();
        clearTimeout(timeout);
        timeout = setTimeout(clientConnect, 12000);
        clientStatus = false;
    });

    client1.on('close', function () {
        console.log('Connection closed', PORT1);
        client1.destroy();
        clearTimeout(timeout1);
        timeout1 = setTimeout(client1Connect, 12000);
        client1Status = false;
    });
}

module.exports = sockets;




