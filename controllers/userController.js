var Promise = require('promise');
var bcrypt = require('bcryptjs');
var util = require('../helpers/controllerUtil');
var mongojs = require('mongojs');
var db = mongojs('mongodb://moshood:mosh1234@ds053972.mlab.com:53972/suretouch', ['Users']);

exports.login = function (req, res, next) {
    function resResult(result) {
        console.log(result)
        res.status(200).json(util.returnResultObject(result));
    }

    function resError(err) {
        res.status(500).json(util.returnErrorObject(err));
    }

    var email = req.query.email;
    var password = req.query.password;
    db.Users.findOne({ "email": email }, function (err, result) {
        if (err) {
            res.send(err);
        }
        if (result === undefined || result === null) {
            resResult({
                success: false,
                message: 'User with Email Address Not found',
                result: result
            })
        }
        else {
            resResult({
                success: bcrypt.compareSync(password, result.password),
                message: 'User found',
                result: {
                    email : result.email,
                    firstName : result.firstName,
                    lastName : result.lastName,
                    sensors : result.sensors !== undefined ? result.sensors : "2845"
                }
            })
        }
    })
};

exports.register = function (req, res, next) {
    function resResult(result) {
        res.status(200).json(util.returnResultObject(result));
    }

    function resError(err) {
        res.status(500).json(util.returnErrorObject(err));
    }

    var password = req.query.password;
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    var user = {
        email: req.query.email,
        firstName: req.query.firstName,
        lastName: req.query.lastName,
        password: hash,
        salt: salt
    };

    db.Users.save(user, function (err, res) {
        if (err) {
            resError({
                success: false,
                message: err
            })
            console.log('err', err);
        }
        resResult({
            success: true,
            message: 'User Added'
        });
    });
};

