const express = require('express');
const router = express.Router();
const authCtrl = require('./auth.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

// Public Auth Endpoints
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', authCtrl.logout);

// Protected Auth Endpoints
router.get('/me', authMiddleware, authCtrl.getProfile);
router.get('/logs', authMiddleware, authCtrl.getLogs);

module.exports = router;
