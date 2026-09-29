const express = require('express');
const router = express.Router();
const dashboardCtrl = require('./dashboard.controller');

router.post('/aktivity/save', dashboardCtrl.saveAktivitas);
router.delete('/aktivity/delete/:idAktivitas', dashboardCtrl.deleteAktivitas);

module.exports = router;
