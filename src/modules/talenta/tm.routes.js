const express = require('express');
const router = express.Router();
const talentaCtrl = require('./talenta.controller');

router.post('/talentmapping-save', talentaCtrl.saveTalentMapping);
router.get('/detail-nilai-sumbu-tm', talentaCtrl.getDetailNilaiSumbuTm);

module.exports = router;
