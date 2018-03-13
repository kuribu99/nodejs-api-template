const hash = require('../utils/hash');
const conf = require('../conf');
const log = require('log4js').getLogger();

const Admin = require('./Admin');
const Session = require('./Session');


Promise.resolve()
// .then(() => sequelize.dropAllSchemas()) // Use this to clear all database tables
    .then(() => Session.sync())
    .then(() => Admin.sync().then(createSuperAdmin))
    .catch(console.log);


function createSuperAdmin() {
    return Admin.count({
        where: {
            username: 'admin'
        }
    }).then(count => {
        if (count === 0) {
            log.info('Creating super admin');
            let salt = hash.rand();
            let password = hash.hashPassword(conf.default_admin_password, salt);

            let admin = new Admin({
                username: 'admin',
                password: password,
                password_salt: salt,
                type: Admin.types.SuperAdmin
            });
            return admin.save()
                .then(() => log.info('Super admin created successfully'))
                .catch(err => log.error('Unable to create super admin due to ' + JSON.stringify(err)));
        }
    });
}
