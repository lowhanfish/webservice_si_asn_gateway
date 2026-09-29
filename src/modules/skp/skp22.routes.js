const express = require('express');
const router = express.Router();
const skpCtrl = require('./skp.controller');

router.get('/id/:idRiwayatSkp22', skpCtrl.getSkp22ById);
router.post('/save', skpCtrl.saveSkp22);
router.post('/document/save', skpCtrl.saveSkp22Document);

module.exports = router;
