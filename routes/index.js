const path = require('path');
const express = require('express');
const router = express.Router();

router.get(/^(?!\/uploads\/).*$/, function (req, res) {
    res.render('index', {
        title: 'NodeJs API Template'
    });
});

module.exports = router;
