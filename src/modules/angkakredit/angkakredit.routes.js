const express = require('express');
const router = express.Router();
const akCtrl = require('./angkakredit.controller');

router.get('/id/:idRiwayatAngkaKredit', akCtrl.getById);
router.post('/save', akCtrl.save);
router.post('/document/save', akCtrl.saveDocument);
router.delete('/delete/:idRiwayatAngkaKredit', akCtrl.delete);

module.exports = router;
