const express = require('express');
const router = express.Router();
const penghargaanCtrl = require('./penghargaan.controller');

router.get('/id/:idRiwayatPenghargaan', penghargaanCtrl.getById);
router.post('/save', penghargaanCtrl.save);
router.post('/document/save', penghargaanCtrl.saveDocument);
router.delete('/delete/:idRiwayatPenghargaan', penghargaanCtrl.delete);

module.exports = router;
