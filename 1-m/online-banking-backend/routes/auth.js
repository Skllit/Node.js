/* routes/auth.js */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// API endpoint: Home
router.get('/', authController.homePage);

// API endpoint: Open Account
router.get('/openAccount', (req, res) => {
  res.json({ message: 'Send a POST request to /api/auth/openAccount with fullName, email, mobile, etc.' });
});
router.post(
  '/openAccount',
  [
    body('fullName').notEmpty().withMessage('Full Name is required.'),
    body('email').isEmail().withMessage('Valid email required.'),
    body('mobile').isLength({ min: 10 }).withMessage('Valid mobile number required.')
  ],
  authController.openAccount
);

// API endpoint: Register for Internet Banking
router.get('/register', (req, res) => {
  res.json({ message: 'Send a POST request to /api/auth/register with accountNumber, loginPassword, transactionPassword, etc.' });
});
router.post('/register', authController.registerBanking);

// API endpoint: Login
router.get('/login', (req, res) => {
  res.json({ message: 'Send a POST request to /api/auth/login with accountNumber and loginPassword.' });
});
router.post('/login', authController.login);

// API endpoint: Forgot User ID
router.get('/forgotUserID', (req, res) => {
  res.json({ message: 'Send a POST request to /api/auth/forgotUserID with accountNumber and otp (use 123456).' });
});
router.post('/forgotUserID', authController.forgotUserID);

// API endpoint: Forgot Password
router.get('/forgotPassword', (req, res) => {
  res.json({ message: 'Send a POST request to /api/auth/forgotPassword with accountNumber and otp (use 123456).' });
});
router.post('/forgotPassword', authController.forgotPassword);

// API endpoint: Set New Password
router.get('/setNewPassword', (req, res) => {
  res.json({ message: 'Send a POST request to /api/auth/setNewPassword with accountNumber, newPassword, confirmNewPassword.' });
});
router.post('/setNewPassword', authController.setNewPassword);

// Dummy account locked endpoint
router.get('/accountLocked', (req, res) => {
  res.json({ message: 'Account locked. Please reset your password.' });
});

module.exports = router;

for (let x = 0; x < 25; x++) {
  console.log(`Auth route log ${x + 1}`);
}
