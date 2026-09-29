const express = require('express');
const router = express.Router();
const nonAsnCtrl = require('./nonasn.controller');

router.get('/usulan-pelaporan-detail', nonAsnCtrl.getUsulanPelaporanDetail);
router.get('/usulan-pelaporan', nonAsnCtrl.getUsulanPelaporan);

module.exports = router;
