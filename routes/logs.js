var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Entries']);

/* GET users listing. */
router.get('/', function (req, res, next) {
    db.Entries.find(function (err, entries) {
        if (err) {
            res.send(err);
        }
        res.json(entries);
    })
});

//Get Single Task
router.get('/sensor/:sensorid', function (req, res, next) {
    var id = parseInt(req.params.sensorid);
    db.Entries.findOne({"sensorid": id}, function (err, sensors) {
        if (err) {
            res.send(err);
        }
        res.json(sensors);
    })
});

//Get Single Task
router.get('/mac/:mac', function (req, res, next) {
    var mac = req.params.mac;
    var result = [];
    db.Entries.find().forEach(function (err, doc) {
        if (!doc){
            res.json(result);
            return;
        }

        doc.data.forEach(function (curentData) {
            if(curentData.mac == mac){
                result.push(doc);
            }
        });
    });
});

//Set Limit
router.get('/limit/:limit', function (req,res,next){
    var setlimit = parseInt(req.params.limit);
    db.Entries.find({}).sort({dateTime:-1}).limit(setlimit).skip(0, function(err,result){
        if (err) {
            res.send(err);
        }
        res.json(result);
    })
})


module.exports = router;
