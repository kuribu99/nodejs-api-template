const Session = require('../models/Session');
const sessionType = require('../models/Session').types;
const hash = require('../utils/hash');
const misc = require('../utils/misc');
const log = require('log4js').getLogger();

const interval = 30000; // 30 seconds
const tokenDuration = 36000000; // 1 hour

const create = (type, id, duration) => {
    let accessToken = hash.md5(`${type}:${id}:${Date.now()}:${hash.rand()}`);
    let expiredDate = Date.now() + duration;
    let session = new Session({
        target_id: id,
        type,
        access_token: accessToken,
        expires_at: expiredDate
    });
    return session.save().then(() => session).catch(misc.logAndThrowDatabaseError);
};

const deleteExpired = () => {
    let now = new Date();
    log.info('Deleting expired sessions. Now = ' + now);
    try {
        Session.destroy({
            where: {
                expires_at: {
                    $lte: now
                }
            }
        }).then(count => log.info('Deleted ' + count))
            .catch(err => log.error('Error deleting ' + err));
    }
    catch (e) {
        log.error('Error: ' + e);
    }
};

setInterval(deleteExpired, interval);

module.exports = {

    createAdminToken: (id) => {
        return create(sessionType.Admin, id, tokenDuration);
    },

    createUserToken: (id) => {
        return create(sessionType.User, id, tokenDuration);
    },

    find: (token) => {
        return Session.findOne({
            where: {
                access_token: token,
                expires_at: {
                    $gt: new Date()
                }
            }
        }).then(session => {
            if (session === null) {
                log.info('Session not found');
                misc.throwUnauthorizedError();
            }
            else
                return session;
        })
    },

};
