const express = require('express');
const router = express.Router();
const nonAsnCtrl = require('./nonasn.controller');

router.get('/data/:nik', nonAsnCtrl.getByNik);

module.exports = router;
