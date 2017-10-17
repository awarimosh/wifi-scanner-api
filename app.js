var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var logs = require('./routes/logs');
var sensors = require('./routes/sensors');
var macs = require('./routes/macs');
var visitors = require('./routes/visitors');
var duration = require('./routes/duration');
var user = require('./routes/user');

var app = express();

app.use(function (req, res, next) {

    var allowedOrigins = ['http://localhost:3021', 'http://128.199.154.60:3020', 'http://192.168.0.175:3020'];
    var origin = req.headers.origin;
    // Website you wish to allow to connect
    if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    else {
        res.setHeader('Access-Control-Allow-Origin', 'http://128.199.154.60:3020');
    }
    
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
app.use('/logs', logs);
app.use('/sensors', sensors);
app.use('/macs', macs);
app.use('/visitors', visitors);
app.use('/duration', duration);
app.use('/user', user);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.send({
        'error': {
            message: "Not found",
            error: {}
        }
    });
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send({
        'error': {
            message: "ups, something unexpected happening.",
            error: {}
        }
    })
});




module.exports = app;
