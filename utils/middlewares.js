const REGEX_AUTH = /Bearer .{32}/i;
const AUTH_HEADER = 'Authorization';

const response = require('./response');
const misc = require('../utils/misc');
const adminTypes = require('../models/Admin').types;
const sessionTypes = require('../models/Session').types;
const adminService = require('../services/admin');
const sessionService = require('../services/session');
const log = require('log4js').getLogger();

const requireBearerToken = (req) => {
    let authorization = req.header(AUTH_HEADER);
    if (authorization && REGEX_AUTH.test(authorization))
        return sessionService.find(authorization.substring(7)).then(session => {
            req.session = session;
            return session;
        });
    else
        return Promise.resolve().then(misc.throwUnauthorizedError);
};

module.exports = {

    requiresAdminToken: (req, res, next) => {
        if (req.method === 'OPTIONS')
            next();

        return requireBearerToken(req)
            .then(session => adminService.find(session.target_id))
            .then(admin => {
                if (admin === null)
                    misc.throwUnauthorizedError();

                log.info('Admin access token validated successfully');
                req.admin = admin;
                req.tokenType = sessionTypes.Admin;
                next();
            })
            .catch(err => response.handleError(res, err));
    },

    denyNormalAdmin: (req, res, next) => {
        if (req.method === 'OPTIONS')
            next();

        return Promise.resolve()
            .then(() => {
                if (req.tokenType === sessionTypes.Admin)
                    return misc.throwHandledError({
                        code: 403,
                        message: 'Only super admin can do this'
                    });

                next();
            })
            .catch(err => response.handleError(res, err));
    },

};