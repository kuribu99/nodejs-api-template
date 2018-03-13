const Sequelize = require('./Sequelize').Sequelize;
const define = require('./Sequelize').define;

const Session = define('session', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    target_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    type: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    access_token: {
        type: Sequelize.STRING(32),
        allowNull: false
    },
    expires_at: {
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            fields: ['access_token', 'expires_at']
        },
    ]
});

Session.types = {
    Admin: 1,
    User: 2
};

module.exports = Session;