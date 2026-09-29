const express = require('express');
const router = express.Router();
const diklatCtrl = require('./diklat.controller');

router.get('/id/:idRiwayatKursus', diklatCtrl.getKursusById);
router.post('/save', diklatCtrl.saveKursus);
router.post('/document/save', diklatCtrl.saveKursusDocument);
router.delete('/delete/:idRiwayatKursus', diklatCtrl.deleteKursus);

module.exports = router;
