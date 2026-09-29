const express = require('express');
const router = express.Router();
const diklatCtrl = require('./diklat.controller');

router.post('/document/save', diklatCtrl.saveDiklatDocument);

module.exports = router;
