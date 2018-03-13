const express = require('express');
const misc = require('../../utils/misc');
const hash = require('../../utils/hash');
const mapper = require('../../utils/mapper');
const response = require('../../utils/response');
const middlewares = require('../../utils/middlewares');
const adminService = require('../../services/admin');
const sessionService = require('../../services/session');

const log = require('log4js').getLogger();
const router = express.Router();

router.post('/login/admin', (req, res) => {
    return adminService.login(req.body)
        .then(admin => {
            return sessionService.createAdminToken(admin.id).then(session => {
                return response.ok(res, mapper.mapAdmin(admin).then(body => {
                    body.access_token = session.access_token;
                    body.expires_at = session.expires_at;
                    return body;
                }));
            })
        })
        .catch(err => response.handleError(res, err));
});

router.post('/logout', middlewares.requiresAdminToken, (req, res) => {
    return req.session.destroy()
        .then(() => response.ok(res, Promise.resolve({
            code: 200,
            message: 'Logged out successfully'
        })))
        .catch(misc.logAndThrowDatabaseError)
        .catch(err => response.handleError(res, err));
});

router.post('/change-password/admin', middlewares.requiresAdminToken, (req, res) => {
    return adminService.changePassword(req.admin, req.body)
        .then(admin => response.ok(res, Promise.resolve({
            code: 200,
            message: 'Password changed successfully'
        })))
        .catch(err => response.handleError(res, err))
});

module.exports = router;