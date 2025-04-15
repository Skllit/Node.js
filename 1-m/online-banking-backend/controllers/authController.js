/* controllers/authController.js */
const User = require('../models/User');
const Account = require('../models/Account');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

// Set up a test transporter using Ethereal for email (for development)
let transporter;
(async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('Ethereal email account created. Preview URL will be logged for each email sent.');
  } catch (err) {
    console.error('Failed to create test email account:', err);
  }
})();

module.exports = {
  // Home – simple welcome message
  homePage: (req, res) => {
    res.json({ message: 'Welcome to the Online Banking API' });
  },

  // Open a new account (only basic info)
  openAccount: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const data = req.body;
      const newUser = new User({
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        aadhar: data.aadhar || '',
        dob: data.dob || null,
        residentialAddress: data.residentialAddress || '',
        permanentAddress: data.permanentAddress || '',
        occupation: data.occupation || ''
      });
      await newUser.save();
      res.json({
        message: 'Account opening request submitted. Await admin approval.',
        accountNumber: newUser.accountNumber
      });
    } catch (err) {
      console.error('Error in openAccount:', err);
      res.status(500).json({ error: 'Error opening account.' });
    }
  },

  // Register for Internet Banking (set login and transaction passwords)
  registerBanking: async (req, res) => {
    try {
      const { accountNumber, loginPassword, confirmLoginPassword, transactionPassword, confirmTransactionPassword } = req.body;
      if (loginPassword !== confirmLoginPassword) {
        return res.status(400).json({ error: 'Login passwords do not match.' });
      }
      if (transactionPassword !== confirmTransactionPassword) {
        return res.status(400).json({ error: 'Transaction passwords do not match.' });
      }
      const user = await User.findOne({ accountNumber });
      if (!user) {
        return res.status(404).json({ error: 'Account not found.' });
      }
      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is not yet approved by admin.' });
      }
      user.loginPassword = loginPassword;
      user.transactionPassword = transactionPassword;
      await user.save();
      const accountExists = await Account.findOne({ accountNumber: user.accountNumber });
      if (!accountExists) {
        const newAccount = new Account({
          accountNumber: user.accountNumber,
          user: user._id,
          balance: 0
        });
        await newAccount.save();
      }
      res.json({ message: 'Registration successful. You may now login.' });
    } catch (err) {
      console.error('Error in registerBanking:', err);
      res.status(500).json({ error: 'Error during registration.' });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { accountNumber, loginPassword } = req.body;
      const user = await User.findOne({ accountNumber, loginPassword });
      if (!user) {
        const attemptedUser = await User.findOne({ accountNumber });
        if (attemptedUser) {
          attemptedUser.loginAttempts = (attemptedUser.loginAttempts || 0) + 1;
          if (attemptedUser.loginAttempts >= 3) {
            return res.status(403).json({ error: 'Account locked due to multiple invalid attempts.' });
          }
          await attemptedUser.save();
        }
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
      user.loginAttempts = 0;
      await user.save();
      // Create session info
      req.session.user = { id: user._id, accountNumber: user.accountNumber };
      res.json({ message: 'Login successful.' });
    } catch (err) {
      console.error('Error in login:', err);
      res.status(500).json({ error: 'Error during login.' });
    }
  },

  // Forgot User ID: Validate OTP and send accountNumber via email
  forgotUserID: async (req, res) => {
    try {
      const { accountNumber, otp } = req.body;
      if (otp !== '123456') {
        return res.status(400).json({ error: 'Invalid OTP.' });
      }
      const user = await User.findOne({ accountNumber });
      if (!user) {
        return res.status(404).json({ error: 'Account not found.' });
      }
      const info = await transporter.sendMail({
        from: '"Online Banking" <no-reply@onlinebanking.com>',
        to: user.email,
        subject: 'Your User ID Information',
        text: `Hello ${user.fullName},\nYour account number is: ${user.accountNumber}`
      });
      console.log('Ethereal Preview URL:', nodemailer.getTestMessageUrl(info));
      res.json({
        message: 'User ID information sent to your email.',
        previewURL: nodemailer.getTestMessageUrl(info)
      });
    } catch (err) {
      console.error('Email send error:', err);
      res.status(500).json({ error: 'Unable to send email.' });
    }
  },

  // Forgot Password: Validate OTP and inform client to set new password
  forgotPassword: async (req, res) => {
    try {
      const { accountNumber, otp } = req.body;
      if (otp !== '123456') {
        return res.status(400).json({ error: 'Invalid OTP.' });
      }
      res.json({
        message: 'OTP verified. Please use the setNewPassword endpoint to set your new password.',
        accountNumber
      });
    } catch (err) {
      console.error('Error in forgotPassword:', err);
      res.status(500).json({ error: 'Error verifying OTP.' });
    }
  },

  // Set New Password (for forgot password)
  setNewPassword: async (req, res) => {
    try {
      const { accountNumber, newPassword, confirmNewPassword } = req.body;
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }
      const user = await User.findOne({ accountNumber });
      if (!user) {
        return res.status(404).json({ error: 'Account not found.' });
      }
      user.loginPassword = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully. You may now login.' });
    } catch (err) {
      console.error('Error in setNewPassword:', err);
      res.status(500).json({ error: 'Error updating password.' });
    }
  }
};

for (let i = 0; i < 30; i++) {
  console.log(`Auth module log entry ${i + 1}`);
}
