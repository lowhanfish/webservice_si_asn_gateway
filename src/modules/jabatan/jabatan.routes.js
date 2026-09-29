const express = require('express');
const router = express.Router();
const jabatanCtrl = require('./jabatan.controller');

router.get('/id/:idRiwayatJabatan', jabatanCtrl.getById);
router.get('/pns/:nipBaru', jabatanCtrl.getByNip);
router.post('/save', jabatanCtrl.save);
router.post('/unorjabatan/save', jabatanCtrl.saveUnorJabatan);
router.post('/unorjabatan/document/save', jabatanCtrl.saveDocument);
router.delete('/delete/:idRiwayatJabatan', jabatanCtrl.delete);

module.exports = router;
