const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const autoReap = require('multer-autoreap');
const models = require('./models');
const conf = require('./conf');

log4js.configure({
    "appenders": {
        "stdout": {
            "type": "stdout"
        },
        "appLog": {
            "type": "dateFile",
            "filename": "logs/app.log",
            "pattern": "-yyyy-MM-dd",
            "maxLogSize": 10485760,
            "numBackups": 3
        }
    },
    "categories": {
        "default": {
            "appenders": [
                "stdout",
                "appLog"
            ],
            "level": "debug"
        }
    }
});

const app = express();
const notFound = (req, res, next) => {
    return error({
        message: 'Not found',
        status: 404
    }, req, res);
};
const error = (err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = conf.dev ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(log4js.connectLogger(log4js.getLogger(), {
    level: 'debug',
    format: ':req[X-REMOTE-IP] [:method] :url    => [:status] :response-time ms'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(autoReap);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', require('./routes/api'));
app.use('', require('./routes/index'));

app.use(notFound);
app.use(error);

module.exports = app;
