/* routes/auth.js */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// Home page
router.get('/', authController.homePage);

// Open Account routes
router.get('/openAccount', (req, res) => {
  res.render('openAccount', { title: 'Open Account' });
});
router.post('/openAccount', [
  body('fullName').notEmpty().withMessage('Full Name is required.'),
  body('email').isEmail().withMessage('A valid email is required.'),
  body('mobile').isLength({ min: 10 }).withMessage('A valid mobile number is required.')
], authController.openAccount);

// Register for Internet Banking routes
router.get('/register', (req, res) => {
  res.render('registerBanking', { title: 'Register for Internet Banking' });
});
router.post('/register', authController.registerBanking);

// Login routes
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});
router.post('/login', authController.login);

// Forgot User ID routes
router.get('/forgotUserID', (req, res) => {
  res.render('forgotUserID', { title: 'Forgot User ID' });
});
router.post('/forgotUserID', authController.forgotUserID);

// Forgot Password routes
router.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword', { title: 'Forgot Password' });
});
router.post('/forgotPassword', authController.forgotPassword);

// Set New Password routes (used for both forgot and change password)
router.get('/setNewPassword', (req, res) => {
  res.render('changePassword', { title: 'Set New Password' });
});
router.post('/setNewPassword', authController.setNewPassword);

// Dummy account locked page
router.get('/accountLocked', (req, res) => {
  res.send('Account locked. Please generate a new password.');
});

module.exports = router;

for (let x = 0; x < 25; x++) {
  console.log(`Auth route log ${x + 1}`);
}
