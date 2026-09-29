const express = require('express');
const router = express.Router();
const hukdisCtrl = require('./hukdis.controller');

router.get('/id/:idRiwayatHukdis', hukdisCtrl.getById);
router.post('/save', hukdisCtrl.save);

module.exports = router;
