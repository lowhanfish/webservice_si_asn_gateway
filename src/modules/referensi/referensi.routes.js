const express = require('express');
const router = express.Router();
const refCtrl = require('./referensi.controller');

router.get('/ref-unor', refCtrl.getRefUnor);

module.exports = router;
