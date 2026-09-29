const express = require('express');
const router = express.Router();
const cpnsCtrl = require('./cpns.controller');

router.get('/dokumen-pengadaan', cpnsCtrl.getDokumenPengadaan);
router.get('/list-pengadaan-instansi', cpnsCtrl.getListPengadaan);

module.exports = router;
