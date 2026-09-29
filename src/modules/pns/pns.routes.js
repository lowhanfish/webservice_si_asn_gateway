const express = require('express');
const router = express.Router();
const pnsCtrl = require('./pns.controller');

// Data Utama
router.get('/data-utama/:nipBaru', pnsCtrl.getDataUtama);

// Riwayat Kepegawaian (GET /pns/rw-...)
router.get('/rw-jabatan/:nipBaru', pnsCtrl.getRwJabatan);
router.get('/rw-golongan/:nipBaru', pnsCtrl.getRwGolongan);
router.get('/rw-pendidikan/:nipBaru', pnsCtrl.getRwPendidikan);
router.get('/rw-diklat/:nipBaru', pnsCtrl.getRwDiklat);
router.get('/rw-kursus/:nipBaru', pnsCtrl.getRwKursus);
router.get('/rw-hukdis/:nipBaru', pnsCtrl.getRwHukdis);
router.get('/rw-skp/:nipBaru', pnsCtrl.getRwSkp);
router.get('/rw-skp22/:nipBaru', pnsCtrl.getRwSkp22);
router.get('/rw-kinerjaperiodik/:nipBaru', pnsCtrl.getRwKinerjaPeriodik);
router.get('/rw-angkakredit/:nipBaru', pnsCtrl.getRwAngkaKredit);
router.get('/rw-cltn/:nipBaru', pnsCtrl.getRwCltn);
router.get('/rw-kontrak/:nipBaru', pnsCtrl.getRwKontrak);
router.get('/rw-potensi/:nipBaru', pnsCtrl.getRwPotensi);
router.get('/rw-kompetensi/:nipBaru', pnsCtrl.getRwKompetensi);
router.get('/rw-dp3/:nipBaru', pnsCtrl.getRwDp3);
router.get('/rw-sertifikasi/:nipBaru', pnsCtrl.getRwSertifikasi);
router.get('/rw-masakerja/:nipBaru', pnsCtrl.getRwMasaKerja);
router.get('/rw-kgb/:nipBaru', pnsCtrl.getRwKgb);
router.get('/rw-pemberhentian/:nipBaru', pnsCtrl.getRwPemberhentian);
router.get('/rw-tubel/:nipBaru', pnsCtrl.getRwTubel);
router.get('/rw-penghargaan/:nipBaru', pnsCtrl.getRwPenghargaan);
router.get('/rw-pindahinstansi/:nipBaru', pnsCtrl.getRwPindahInstansi);
router.get('/rw-pnsunor/:nipBaru', pnsCtrl.getRwPnsUnor);
router.get('/rw-pwk/:nipBaru', pnsCtrl.getRwPwk);
router.get('/nilaiipasn/:nipBaru', pnsCtrl.getNilaiIpAsn);

// Pensiun & KP di bawah path /pns/...
router.get('/list-pensiun-instansibynip', pnsCtrl.getListPensiunByNip);
router.get('/list-pensiun-instansi', pnsCtrl.getListPensiunInstansi);
router.get('/kp-instansi-byId', pnsCtrl.getKpInstansiById);
router.get('/list-kp-instansi', pnsCtrl.getListKpInstansi);

module.exports = router;
