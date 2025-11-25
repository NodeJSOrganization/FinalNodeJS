// routes/auth.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { register, login, verifyEmail,forgotPassword, resetPassword, changePassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verifyemail/:token', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.put('/changepassword', protect, changePassword);

module.exports = router;