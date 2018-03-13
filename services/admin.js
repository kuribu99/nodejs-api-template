const Admin = require('../models/Admin');
const adminTypes = require('../models/Admin').types;
const hash = require('../utils/hash');
const misc = require('../utils/misc');
const mapper = require('../utils/mapper');
const log = require('log4js').getLogger();

const mapAndValidate = (body) => {
    log.info('Validate admin body');

    body.username = body.username || '';
    body.password = body.password || '';
    body.password_salt = hash.rand();

    let admin = new Admin(body);
    return admin.validate()
        .catch(err => misc.throwHandledError({
            code: 400,
            validations: mapper.mapValidationError(err)
        }))
        .then(() => ensureAdminUsernameNotUsed(body.username))
        .then(() => {
            admin.password = hash.hashPassword(body.password, admin.password_salt);
            return admin;
        });
};

const ensureAdminUsernameNotUsed = (username) => {
    return Admin.count({
        where: {
            username
        }
    }).then(count => {
        log.info('Count = ' + count);
        if (count !== 0)
            misc.throwHandledError({
                code: 409,
                message: 'Admin username already used'
            });
    });
};

const findByUsername = (username) => {
    return Admin.findOne({
        where: {
            username
        }
    });
};

const findById = (id) => {
    return Admin.findOne({
        where: {
            id
        }
    }).then(admin => {
        if (!admin)
            return misc.throwHandledError({
                code: 404,
                message: 'Invalid admin ID'
            });
        else
            return admin;
    });
};

module.exports = {

    login: (body) => {
        log.info('Logging in');

        body.username = body.username || '';
        body.password = body.password || '';

        if (body.username === '' || body.password === '')
            return Promise.resolve().then(() => misc.throwHandledError({
                code: 401,
                message: 'Invalid username or password'
            }));
        else {
            return findByUsername(body.username).then(admin => {
                if (admin === null)
                    return misc.throwHandledError({
                        code: 401,
                        message: 'Invalid username or password'
                    });
                else {
                    let password = hash.hashPassword(body.password, admin.password_salt);

                    if (password === admin.password) {
                        return admin;
                    }
                    else
                        return misc.throwHandledError({
                            code: 401,
                            message: 'Invalid username or password'
                        })
                }
            });
        }
    },

    changePassword: (me, body) => {
        log.info('Entering changePassword');

        if (hash.hashPassword(body.current_password, me.password_salt) !== me.password) {
            log.info('Invalid password');
            return Promise.resolve().then(() => misc.throwHandledError({
                code: 409,
                message: 'Current password is invalid'
            }));
        }
        log.info('Current password is correct');

        me.password = body.new_password;
        return me.validate()
            .catch(err => misc.throwHandledError({
                code: 400,
                validations: mapper.mapValidationError(err)
            }))
            .then(() => {
                me.password_salt = hash.rand();
                me.password = hash.hashPassword(me.password, me.password_salt);
                return me.save().catch(misc.logAndThrowDatabaseError)
            })
            .then(() => me);
    },

    create: (me, body) => {
        if (me.type === adminTypes.Admin) {
            return Promise.resolve().then(() => misc.throwHandledError({
                code: 403,
                message: 'Only super admin can create admin account'
            }));
        }

        return mapAndValidate({
            username: body.username,
            password: body.password,
            type: adminTypes.Admin
        }).then(admin => ensureAdminUsernameNotUsed(body.username).then(() => admin))
            .then(admin => admin.save().then(() => admin).catch(misc.logAndThrowDatabaseError));
    },

    findAll: (me, page, pageSize, keyword) => {
        let where = {};
        if (keyword) {
            keyword = `%${keyword.toLowerCase()}%`;

            where = {
                username: {
                    $like: keyword
                }
            };
        }

        return Admin.count({
            where,
            col: 'id'
        }).then(totalElements => {
            return Admin.findAll({
                where,
                offset: page === 1 ? 0 : (page - 1) * pageSize,
                limit: pageSize,
                order: [
                    ['created_at', 'DESC']
                ]
            }).then(admins => {
                return {
                    page,
                    page_size: pageSize,
                    total_elements: totalElements,
                    total_pages: Math.ceil(totalElements / pageSize),
                    admins
                };
            });
        });
    },

    find: findById,

    delete: (me, id) => {
        if (me.type !== adminTypes.SuperAdmin)
            return Promise.resolve().then(() => misc.throwHandledError({
                code: 403,
                message: 'You are not allowed to delete admin'
            }));
        if (me.id == id)
            return Promise.resolve().then(() => misc.throwHandledError({
                code: 409,
                message: 'Cannot delete yourself'
            }));

        return findById(id).then(admin => {
            return admin.destroy().catch(misc.logAndThrowDatabaseError);
        })
    }

};