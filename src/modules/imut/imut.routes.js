const express = require('express');
const router = express.Router();
const imutCtrl = require('./imut.controller');

// GET /imut/simpeg/usulan/list
router.get('/simpeg/usulan/list', imutCtrl.getListUsulan);

module.exports = router;
