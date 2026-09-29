const express = require('express');
const router = express.Router();
const sertifikasiCtrl = require('./sertifikasi.controller');

router.post('/save', sertifikasiCtrl.save);
router.delete('/delete/:idRiwayatSertifikasi', sertifikasiCtrl.delete);

module.exports = router;
