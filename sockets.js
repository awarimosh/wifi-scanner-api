var net = require('net');
var mongojs = require('mongojs');
var cron = require('node-cron');
var nodemailer = require('./helpers/mailHelper');
var log = require('./helpers/logHelper');
var db = mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Entries', 'Macs', 'Routers']);
var entry = {};
var dataCache = '';
var tryCount = 0;

var HOST0 = '61.6.173.48'
var HOST1 = '175.138.59.249';
var HOST2 = 'sensor2845.ddns.net';
// var HOST2 = '61.6.4.157';

var PORT0 = '21470'
var PORT1 = '21471'

var client = new net.Socket();
var client1 = new net.Socket();
var client2 = new net.Socket();

var clientStatus = client1Status = client2Status = false;

var timeout, timeout1, timeout2;
var today = new Date().setHours(0, 0, 0, 0) / 1000;
var restartCount0 = 0, restartCount1 = 0, restartCount2 = 0;

var clientConnect = function () {
    if (!clientStatus) {
        client.connect(PORT0, HOST0, clientStatus = function () {
            console.log('CONNECTED TO: ' + HOST0 + ':' + PORT0, new Date().toLocaleString());
            return true
        });

    }
    else {
        console.log(">>>Refused Connection at " + PORT0, new Date().toLocaleString())
    }

};

var client1Connect = function () {
    if (!client1Status) {
        client1.connect(PORT0, HOST1, client1Status = function () {
            console.log('CONNECTED TO: ' + HOST1 + ':' + PORT1, new Date().toLocaleString());
            return true;
        });
    }
    else {
        console.log(">>>Refused Connection at " + PORT1, new Date().toLocaleString())
    }

};

var client2Connect = function () {
    if (!client2Status) {
        client2.connect(PORT1, HOST2, client1Status = function () {
            console.log('CONNECTED TO: ' + HOST2 + ':' + PORT1, new Date().toLocaleString());
            return true;
        });
    }
    else {
        console.log(">>>Refused Connection at " + PORT1, new Date().toLocaleString())
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
                            console.log("Created Entry @ " + timeNow, element.mac);
                        });
                    }
                })
            }
        })
    }, this);
}

var passData = function (data) {
    today = new Date().setHours(0, 0, 0, 0) / 1000;
    try {
        if (dataCache.length > 0) {
            data = dataCache.concat(data);
            entry = JSON.parse(data);
            dataCache = '';
            tryCount = 0;
            console.log('pass 1');
        } else {
            entry = JSON.parse(data);
            console.log('pass 0');
        }
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
    catch (err) {
        if (tryCount < 5) {
            dataCache = dataCache.concat(data);
            tryCount++;
            //console.error('err count : ' + tryCount.toString(), data.toString());
        }
        else {
            console.log('count failed ', tryCount.toString());
            dataCache = '';
            tryCount = 0;
        }
    }
}

function timeConverter(timestamp) {
    const time = new Date(timestamp * 1000);
    return time.toLocaleString();
}

function sockets() {
    //clientConnect();

    client1Connect();

    //client2Connect();

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
        console.log(PORT0, e.code);
        //log.write(restartCount2,e.code,"client2");
    });

    client1.on('error', function (e) {
        console.log(PORT0, e.code);
        //log.write(restartCount2,e.code,"client2");
    });

    client2.on('error', function (e) {
        console.log(PORT1, e.code);
        //log.write(restartCount2,e.code,"client2");
    });

    // Add a 'close' event handler for the client socket
    client.on('close', function () {
        if (restartCount0 < 5) {
            console.log('Connection closed ' + HOST0 + " : Count : " + restartCount0 + " : " + PORT0, new Date().toLocaleString());
            //log.write(restartCount0,"closed","client0");
            restartCount0++;
            client.destroy();
            clearTimeout(timeout);
            timeout = setTimeout(clientConnect, 12000);
            clientStatus = false;
        }
        else if (restartCount0 == 10) {
            var msg = {
                msg: "Connection Closed",
                host: HOST0,
                port: PORT0,
                restartCount: restartCount0
            }
            nodemailer.send_mail('moshood@awaribags.com', HOST0.toString() + ":" + PORT0.toString() + "Connection Closed", JSON.stringify(msg));
        }
        else if (restartCount0 >= 50) {
            restartCount0 = 0;
        }
    });

    client1.on('close', function () {
        if (restartCount1 < 5) {
            console.log('Connection closed ' + HOST1 + " : Count : " + restartCount1 + " : " + PORT0, new Date().toLocaleString());
            //log.write(restartCount1,"closed","client1");
            restartCount1++;
            client1.destroy();
            clearTimeout(timeout1);
            timeout1 = setTimeout(client1Connect, 12000);
            client1Status = false;
        }
        else if (restartCount1 == 10) {
            var msg = {
                msg: "Connection Closed",
                host: HOST1,
                port: PORT1,
                restartCount: restartCount1
            }
            nodemailer.send_mail('moshood@awaribags.com', HOST1.toString() + ":" + PORT0.toString() + "Connection Closed", JSON.stringify(msg));
        }
        else if (restartCount1 >= 50) {
            restartCount1 = 0;
        }
    });

    client2.on('close', function () {
        if (restartCount2 < 5) {
            console.log('Connection closed', HOST2 + " : Count : " + restartCount2 + ":" + PORT1, new Date().toLocaleString());
            //log.write(restartCount2,"closed","client2");
            restartCount2++;
            client2.destroy();
            clearTimeout(timeout2);
            timeout2 = setTimeout(client2Connect, 12000);
            client2Status = false;
        }
        else if (restartCount2 == 10) {
            var msg = {
                msg: "Connection Closed",
                host: HOST2,
                port: PORT2,
                restartCount: restartCount2
            }
            nodemailer.send_mail('moshood@awaribags.com', HOST2.toString() + ":" + PORT2.toString() + "Connection Closed", JSON.stringify(msg));
        }
        else if (restartCount2 >= 50) {
            restartCount2 = 0;
        }
    });

}

module.exports = sockets;