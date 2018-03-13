const conf = require('../conf');
const misc = require('./misc');

const toUploadURL = (req, filePath) => {
    if (!filePath) return '';
    else
        return conf.dev ? `http://localhost:3000/${filePath}` : `https://${req.hostname}/${filePath}`
};

module.exports = {

    mapValidationError: (validationError) => {
        return validationError.errors.map(err => {
            return {
                field: err.path,
                validation: err.validatorKey,
                message: err.message
            };
        });
    },

    mapAdmin: (admin) => {
        return Promise.resolve({
            id: admin.id,
            type: admin.type,
            username: admin.username,
            created_at: admin.created_at
        })
    },

};