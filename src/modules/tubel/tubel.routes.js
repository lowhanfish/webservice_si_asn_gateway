const express = require('express');
const router = express.Router();
const tubelCtrl = require('./tubel.controller');

router.post('/save', tubelCtrl.save);

module.exports = router;
