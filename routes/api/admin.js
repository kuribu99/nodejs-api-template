const express = require('express');
const misc = require('../../utils/misc');
const mapper = require('../../utils/mapper');
const response = require('../../utils/response');
const adminService = require('../../services/admin');

const log = require('log4js').getLogger();

const router = express.Router();

router.get('', (req, res) => {
    let page = Number.parseInt(req.query.page) || 1;
    let pageSize = Number.parseInt(req.query.page_size) || 10;
    let keyword = req.query.keyword || '';

    return adminService.findAll(req.admin, page, pageSize, keyword)
        .then(adminResponse => {
            return Promise.all(adminResponse.admins.map(mapper.mapAdmin))
                .then(admins => {
                    adminResponse.admins = admins;
                    return response.ok(res, Promise.resolve(adminResponse));
                });
        })
        .catch(err => response.handleError(res, err));
});

router.post('', (req, res) => {
    return adminService.create(req.admin, req.body)
        .then(admin => response.created(res, mapper.mapAdmin(admin)))
        .catch(err => response.handleError(res, err));
});

router.get('/:id', (req, res) => {
    let id = Number.parseInt(req.params.id);

    return adminService.find(id)
        .then(admin => response.ok(res, mapper.mapAdmin(admin)))
        .catch(err => response.handleError(res, err));
});

router.delete('/:id', (req, res) => {
    let id = Number.parseInt(req.params.id);

    return adminService.delete(req.admin, id)
        .then(admin => response.ok(res, Promise.resolve({
            code: 200,
            message: 'Admin deleted'
        })))
        .catch(err => response.handleError(res, err));
});

module.exports = router;