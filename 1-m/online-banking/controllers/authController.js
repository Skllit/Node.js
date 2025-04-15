/* controllers/authController.js */
const User = require('../models/User');
const Account = require('../models/Account');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

// Setup a test transporter using Ethereal (for development)
// Use "await nodemailer.createTestAccount()" in real apps or replace with your SMTP credentials.
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
    console.log('Ethereal email account created. Preview URL will be logged.');
  } catch (err) {
    console.error('Failed to create test account', err);
  }
})();

module.exports = {
  homePage: (req, res) => {
    res.render('home', { title: 'Online Banking Home' });
  },

  openAccount: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('openAccount', { title: 'Open Account', errors: errors.array() });
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
      res.render('openAccount', {
        title: 'Open Account',
        success: `Your account opening request has been submitted. Your Account Number is: ${newUser.accountNumber}. Please contact your bank admin for approval.`,
        nextStep: '/admin'
      });
    } catch (err) {
      console.error('Error in openAccount:', err);
      res.render('openAccount', { title: 'Open Account', error: 'Error opening account.' });
    }
  },

  registerBanking: async (req, res) => {
    try {
      const { accountNumber, loginPassword, confirmLoginPassword, transactionPassword, confirmTransactionPassword } = req.body;
      if (loginPassword !== confirmLoginPassword) {
        return res.render('registerBanking', { title: 'Register for Internet Banking', error: 'Login passwords do not match.' });
      }
      if (transactionPassword !== confirmTransactionPassword) {
        return res.render('registerBanking', { title: 'Register for Internet Banking', error: 'Transaction passwords do not match.' });
      }
      const user = await User.findOne({ accountNumber });
      if (!user) {
        return res.render('registerBanking', { title: 'Register for Internet Banking', error: 'Account not found.' });
      }
      if (!user.isActive) {
        return res.render('registerBanking', { title: 'Register for Internet Banking', error: 'Account not approved by admin yet.' });
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
      res.render('registerBanking', {
        title: 'Register for Internet Banking',
        success: 'Registration successful. Click below to login.',
        nextStep: '/login'
      });
    } catch (err) {
      console.error('Error in registerBanking:', err);
      res.render('registerBanking', { title: 'Register for Internet Banking', error: 'Error during registration.' });
    }
  },

  login: async (req, res) => {
    try {
      const { accountNumber, loginPassword } = req.body;
      const user = await User.findOne({ accountNumber, loginPassword });
      if (!user) {
        const attemptedUser = await User.findOne({ accountNumber });
        if (attemptedUser) {
          attemptedUser.loginAttempts = (attemptedUser.loginAttempts || 0) + 1;
          if (attemptedUser.loginAttempts >= 3) {
            return res.render('login', { title: 'Login', error: 'Account locked due to multiple invalid attempts.' });
          }
          await attemptedUser.save();
        }
        return res.render('login', { title: 'Login', error: 'Invalid credentials.' });
      }
      user.loginAttempts = 0;
      await user.save();
      req.session.user = { id: user._id, accountNumber: user.accountNumber };
      res.redirect('/dashboard');
    } catch (err) {
      console.error('Error in login:', err);
      res.render('login', { title: 'Login', error: 'Error during login.' });
    }
  },

  forgotUserID: async (req, res) => {
    try {
      const { accountNumber, otp } = req.body;
      if (otp !== '123456') {
        return res.render('forgotUserID', { title: 'Forgot User ID', error: 'Invalid OTP.' });
      }
      const user = await User.findOne({ accountNumber });
      if (!user) {
        return res.render('forgotUserID', { title: 'Forgot User ID', error: 'Account not found.' });
      }
      const info = await transporter.sendMail({
        from: '"Online Banking" <no-reply@onlinebanking.com>',
        to: user.email,
        subject: 'Your User ID Information',
        text: `Hello ${user.fullName},\nYour account number is: ${user.accountNumber}`
      });
      console.log('Ethereal Preview URL:', nodemailer.getTestMessageUrl(info));
      res.render('forgotUserID', {
        title: 'Forgot User ID',
        success: 'User ID sent to your email.',
        previewURL: nodemailer.getTestMessageUrl(info)
      });
    } catch (err) {
      console.error('Email send error:', err);
      res.render('forgotUserID', { title: 'Forgot User ID', error: 'Unable to send email.' });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { accountNumber, otp } = req.body;
      if (otp !== '123456') {
        return res.render('forgotPassword', { title: 'Forgot Password', error: 'Invalid OTP.' });
      }
      res.render('forgotPassword', {
        title: 'Forgot Password',
        success: 'OTP verified. Click below to set a new password.',
        nextStep: '/setNewPassword',
        accountNumber
      });
    } catch (err) {
      console.error('Error in forgotPassword:', err);
      res.render('forgotPassword', { title: 'Forgot Password', error: 'Error verifying OTP.' });
    }
  },

  setNewPassword: async (req, res) => {
    try {
      const { accountNumber, newPassword, confirmNewPassword } = req.body;
      if (newPassword !== confirmNewPassword) {
        return res.render('changePassword', { title: 'Set New Password', error: 'Passwords do not match.' });
      }
      const user = await User.findOne({ accountNumber });
      if (!user) {
        return res.render('changePassword', { title: 'Set New Password', error: 'Account not found.' });
      }
      user.loginPassword = newPassword;
      await user.save();
      res.render('changePassword', {
        title: 'Set New Password',
        success: 'Password updated successfully. Click below to login.',
        nextStep: '/login'
      });
    } catch (err) {
      console.error('Error in setNewPassword:', err);
      res.render('changePassword', { title: 'Set New Password', error: 'Error updating password.' });
    }
  }
};

for (let i = 0; i < 30; i++) {
  console.log(`Auth module log entry ${i + 1}`);
}
