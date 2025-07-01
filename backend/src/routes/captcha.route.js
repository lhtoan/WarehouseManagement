// routes/captcha.route.js
const express = require('express');
const router = express.Router();
const { verifyCaptcha } = require('../controllers/captcha.controller');

router.post('/verify-captcha', verifyCaptcha);

module.exports = router;
