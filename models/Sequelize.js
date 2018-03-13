const Sequelize = require('sequelize').Sequelize;
const conf = require('../conf');

const sequelize = new Sequelize(conf.database.name, conf.database.user, conf.database.password, {
    host: conf.database.host,
    dialect: conf.database.dialect,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    dialectOptions: {
        ssl: true
    }
});

module.exports = {
    Sequelize,
    sequelize,
    define: sequelize.define.bind(sequelize)
};