const log = require('log4js').getLogger();

const returnResponse = (code, res, promiseBody) => {
    return promiseBody.then(body => {
        log.info(`Result: [${code}] ${JSON.stringify(body)}`);
        return res.status(code).json(body);
    })
};

module.exports = {

    ok: (res, promiseBody) => {
        return returnResponse(200, res, promiseBody);
    },

    created: (res, promiseBody) => {
        return returnResponse(201, res, promiseBody);
    },

    handleError: (res, err) => {
        if (err.handled) {
            log.info(`Handled error: ${JSON.stringify(err)}`);
            return Promise.resolve(res.status(err.response.error.code).json(err.response));
        }
        else {
            log.info(`Unhandled error: ${JSON.stringify(err)}`);
            console.log(err);
            return Promise.resolve(res.status(500).json({
                code: 500,
                message: 'Internal server error'
            }));
        }
    }
};