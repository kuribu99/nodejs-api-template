const multer = require('multer');
const conf = require('../conf');
const upload = multer({dest: conf.folders.temp});

module.exports = upload;