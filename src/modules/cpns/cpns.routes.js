const express = require('express');
const router = express.Router();
const cpnsCtrl = require('./cpns.controller');

router.post('/save', cpnsCtrl.save);
router.post('/document/save', cpnsCtrl.saveDocument);

module.exports = router;
