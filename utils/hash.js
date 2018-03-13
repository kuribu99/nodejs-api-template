const utility = require('utility');

module.exports = {

    rand(len) {
        let random = utility.md5(Date.now() + utility.randomString(16));
        if (len) {
            random = random.substring(0, len);
        }
        return random;
    },

    md5(msg) {
        return utility.md5(msg);
    },

    sha256(msg) {
        return utility.sha256(msg);
    },

    sha1(msg) {
        return utility.sha1(msg);
    },

    hashPassword(password, salt) {
        return utility.sha256(salt + password);
    }

};