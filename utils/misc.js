const fs = require('fs');
const mkdirp = require('mkdirp');
const conf = require('../conf');

const log = require('log4js').getLogger();
const filesToCleanUp = []; // Files to be removed
const cleanUpInterval = 30000; // 30 seconds

const cleanUp = () => {
    filesToCleanUp.forEach(file => fs.unlink(file, err => {
        if (err)
            log.warn(`Unable to remove ${file} due to: ${JSON.stringify(err)}`);
        else {
            log.info(`Removed ${file}`);
        }
        filesToCleanUp.splice(filesToCleanUp.indexOf(file), 1);
    }));
};

const throwError = (innerError) => {
    throw {
        handled: true,
        response: {
            error: innerError
        }
    };
};

mkdirp(conf.folders.upload, err => {
    if (err)
        log.warn(`Unable to create upload folder due to: ${JSON.stringify(err)}`);
    else
        log.info('Upload folder ready');
});

setInterval(cleanUp, cleanUpInterval);

module.exports = {

    throwHandledError: throwError,

    throwUnauthorizedError: () => {
        throw {
            handled: true,
            response: {
                error: {
                    code: 401,
                    message: 'Missing, invalid or expired bearer token'
                }
            }
        };
    },

    throwIfNotHandled: (innerError) => {
        return err => {
            if (err.handled)
                throw err;
            else
                throwError(innerError)
        }
    },

    logAndThrowDatabaseError: (err) => {
        log.error(`Database error: ${JSON.stringify(err)}`);
        throwError({
            code: 500,
            message: 'Database error occurred. Please try again'
        })
    },

    moveFile: (source, dest) => {
        return new Promise((resolve, reject) => {
            log.info(`Moving ${source} to ${dest}`);

            fs.copyFile(source, dest, err => {
                if (err) {
                    log.warn(`Error: ${JSON.stringify(err)}`);
                    reject(err);
                }
                else {
                    log.info('File moved');
                    resolve();
                }
            });
        })
    },

    removeFileLater: (file) => filesToCleanUp.push(file),

};