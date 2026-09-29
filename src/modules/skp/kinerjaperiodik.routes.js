const express = require('express');
const router = express.Router();
const skpCtrl = require('./skp.controller');

router.post('/save', skpCtrl.saveKinerjaPeriodik);
router.delete('/delete/:idRiwayatKinerjaPeriodik', skpCtrl.deleteKinerjaPeriodik);

module.exports = router;
