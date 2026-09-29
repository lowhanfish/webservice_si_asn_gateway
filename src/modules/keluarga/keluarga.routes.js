const express = require('express');
const router = express.Router();
const keluargaCtrl = require('./keluarga.controller');

router.post('/pasangan/save', keluargaCtrl.savePasangan);
router.post('/anak/save', keluargaCtrl.saveAnak);

module.exports = router;
