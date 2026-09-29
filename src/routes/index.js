const express = require('express');
const router = express.Router();
const bknClient = require('../helpers/bknClient');

// Import modul routes
const pnsRoutes = require('../modules/pns/pns.routes');
const jabatanRoutes = require('../modules/jabatan/jabatan.routes');
const skpRoutes = require('../modules/skp/skp.routes');
const skp22Routes = require('../modules/skp/skp22.routes');
const kinerjaperiodikRoutes = require('../modules/skp/kinerjaperiodik.routes');
const angkakreditRoutes = require('../modules/angkakredit/angkakredit.routes');
const cpnsRoutes = require('../modules/cpns/cpns.routes');
const pengadaanRoutes = require('../modules/cpns/pengadaan.routes');
const diklatRoutes = require('../modules/diklat/diklat.routes');
const kursusRoutes = require('../modules/diklat/kursus.routes');
const hukdisRoutes = require('../modules/hukdis/hukdis.routes');
const kgbRoutes = require('../modules/kgb/kgb.routes');
const keluargaRoutes = require('../modules/keluarga/keluarga.routes');
const kompetensiRoutes = require('../modules/kompetensi/kompetensi.routes');
const penghargaanRoutes = require('../modules/penghargaan/penghargaan.routes');
const sertifikasiRoutes = require('../modules/sertifikasi/sertifikasi.routes');
const tubelRoutes = require('../modules/tubel/tubel.routes');
const partitionRoutes = require('../modules/talenta/partition.routes');
const tmRoutes = require('../modules/talenta/tm.routes');
const nonasnRoutes = require('../modules/nonasn/nonasn.routes');
const idisRoutes = require('../modules/nonasn/idis.routes');
const referensiRoutes = require('../modules/referensi/referensi.routes');
const imutRoutes = require('../modules/imut/imut.routes');
const dokumenRoutes = require('../modules/dokumen/dokumen.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');

// Pendaftaran route per prefix modul
router.use('/pns', pnsRoutes);
router.use('/jabatan', jabatanRoutes);
router.use('/skp', skpRoutes);
router.use('/skp22', skp22Routes);
router.use('/kinerjaperiodik', kinerjaperiodikRoutes);
router.use('/angkakredit', angkakreditRoutes);
router.use('/cpns', cpnsRoutes);
router.use('/pengadaan', pengadaanRoutes);
router.use('/diklat', diklatRoutes);
router.use('/kursus', kursusRoutes);
router.use('/hukdis', hukdisRoutes);
router.use('/kgb', kgbRoutes);
router.use('/keluarga', keluargaRoutes);
router.use('/kompetensi', kompetensiRoutes);
router.use('/penghargaan', penghargaanRoutes);
router.use('/sertifikasi', sertifikasiRoutes);
router.use('/tubel', tubelRoutes);
router.use('/partition', partitionRoutes);
router.use('/tm', tmRoutes);
router.use('/nonasn', nonasnRoutes);
router.use('/idis', idisRoutes);
router.use('/referensi', referensiRoutes);
router.use('/imut', imutRoutes);
router.use('/dashboard', dashboardRoutes);

// Dokumen & Berkas (root level: /download-dok, /upload-dok, dsb.)
router.use('/', dokumenRoutes);

// Fallback Proxy: Jika BKN menambahkan endpoint baru di masa depan
router.use((req, res) => {
  bknClient.forward(req, res);
});

module.exports = router;
