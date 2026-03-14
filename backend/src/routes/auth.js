const express = require('express');
const authController = require('../controllers/authController.js');
const rateLimiter = require('../middleware/rateLimiter.js');

const router = express.Router();
router.post('/tokens', authController.getJWTs);
router.post('/google-login', authController.googleLogin);
router.post('/resets', rateLimiter.resetRequestRateLimiter, authController.getResetToken);
router.post('/resets/:resetToken', authController.resetPassword);

module.exports = router;