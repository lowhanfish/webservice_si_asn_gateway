const express = require('express');
const router = express.Router();
const docCtrl = require('./dokumen.controller');

router.get('/download-dok', docCtrl.downloadDok);
router.post('/upload-photo', docCtrl.uploadPhoto);
router.post('/upload-dok', docCtrl.uploadDok);
router.post('/upload-dok-rw', docCtrl.uploadDokRw);
router.post('/upload-dok-sk-kp', docCtrl.uploadDokSkKp);
router.post('/upload-dok-sk-nip', docCtrl.uploadDokSkNip);

module.exports = router;
