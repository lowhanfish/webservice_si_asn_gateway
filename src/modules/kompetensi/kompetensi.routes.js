const express = require('express');
const router = express.Router();
const kompetensiCtrl = require('./kompetensi.controller');

router.get('/refkegiatan', kompetensiCtrl.getRefKegiatan);
router.get('/refinstitusipenkom', kompetensiCtrl.getRefInstitusi);
router.post('/refkegiataninstansi/save', kompetensiCtrl.saveKegiatanInstansi);
router.post('/potensi/save', kompetensiCtrl.savePotensi);
router.post('/kompetensi/save', kompetensiCtrl.saveKompetensi);

module.exports = router;
