const express = require('express');
const router = express.Router();
const talentaCtrl = require('./talenta.controller');

router.get('/profesi-instansi', talentaCtrl.getProfesiInstansi);
router.get('/list-pg-instansi', talentaCtrl.getListPgInstansi);

module.exports = router;
