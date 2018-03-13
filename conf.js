const conf = {
    dev: process.env.dev,
    database: {
        dialect: process.env.db_dialect,
        name: process.env.db_name,
        host: process.env.db_host,
        user: process.env.db_user,
        password: process.env.db_password
    },
    folders: {
        temp: process.env.temp_folder || 'temp/',
        upload: process.env.upload_folder || 'uploads/'
    },
    default_admin_password: '----HIDDEN----'
};

// Remove this line when testing done
console.log(`Configuration: ${JSON.stringify(conf, 4)}`);
conf.default_admin_password = process.env.default_admin_password;

module.exports = conf;