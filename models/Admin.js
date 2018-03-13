const Sequelize = require('./Sequelize').Sequelize;
const define = require('./Sequelize').define;

const Admin = define('admin', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING(32),
        unique: 'username',
        allowNull: false,
        validate: {
            len: {
                args: [3, 20],
                msg: 'Username must be between 3 and 20 characters'
            },
        }
    },
    password: {
        type: Sequelize.STRING(64),
        allowNull: false,
        validate: {
            passswordLength: (value, next) => {
                if (value !== null && ((value.length >= 6 && value.length <= 20) || value.length === 64))
                    next();
                else
                    next('Password must be between 6 and 20 characters');
            }
        }
    },
    password_salt: {
        type: Sequelize.STRING(32),
        allowNull: false
    },
    type: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['username']
        },
        {
            fields: ['created_at']
        }
    ]
});

Admin.types = {
    SuperAdmin: 1,
    Admin: 2
};

module.exports = Admin;