const express = require('express');
const router = express.Router();
const kgbCtrl = require('./kgb.controller');

router.post('/save', kgbCtrl.save);
router.delete('/delete/:idRiwayatKgb', kgbCtrl.delete);

module.exports = router;
