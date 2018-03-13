const express = require('express');
const middlewares = require('../../utils/middlewares');
const conf = require('../../conf');
const log = require('log4js').getLogger();

const router = express.Router();
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

    log.error(`Error: ${JSON.stringify(err)}`);

    res.status(err.status || 500).json({
        error: {
            code: err.status || 500,
            message: err.message || 'Internal server error'
        }
    })
};

router.use('/v1/auth', require('./auth'));
router.use('/v1/admins', middlewares.requiresAdminToken, require('./admin'));

router.use(notFound);
router.use(error);

module.exports = router;
