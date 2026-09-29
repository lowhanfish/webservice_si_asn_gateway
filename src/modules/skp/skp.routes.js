const express = require('express');
const router = express.Router();
const skpCtrl = require('./skp.controller');

// SKP Umum / 2021
router.get('/id/:idRiwayatSkp', skpCtrl.getById);
router.post('/save', skpCtrl.save);
router.post('/2021/save', skpCtrl.save2021);

module.exports = router;
