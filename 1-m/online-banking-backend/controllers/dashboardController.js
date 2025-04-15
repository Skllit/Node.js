/* controllers/dashboardController.js */
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

module.exports = {
  // Dashboard – returns user and account info
  dashboard: async (req, res) => {
    try {
      if (!req.session.user) return res.status(401).json({ error: 'Please login.' });
      const user = await User.findById(req.session.user.id);
      const account = await Account.findOne({ accountNumber: user.accountNumber });
      res.json({ user, account });
    } catch (err) {
      console.error('Error in dashboard:', err);
      res.status(500).json({ error: 'Error loading dashboard.' });
    }
  },

  // Account Statement – returns transactions within the date range
  accountStatement: async (req, res) => {
    try {
      if (!req.session.user) return res.status(401).json({ error: 'Please login.' });
      const { startDate, endDate } = req.body;
      const user = await User.findById(req.session.user.id);
      const transactions = await Transaction.find({
        accountNumber: user.accountNumber,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).sort({ date: -1 });
      res.json({ transactions });
    } catch (err) {
      console.error('Error in accountStatement:', err);
      res.status(500).json({ error: 'Error fetching account statement.' });
    }
  },

  // Account Summary – returns account details and recent transactions
  accountSummary: async (req, res) => {
    try {
      if (!req.session.user) return res.status(401).json({ error: 'Please login.' });
      const user = await User.findById(req.session.user.id);
      const account = await Account.findOne({ accountNumber: user.accountNumber });
      const recentTransactions = await Transaction.find({ accountNumber: account.accountNumber })
        .sort({ date: -1 })
        .limit(5);
      res.json({ account, recentTransactions });
    } catch (err) {
      console.error('Error in accountSummary:', err);
      res.status(500).json({ error: 'Error retrieving account summary.' });
    }
  },

  // Change Password – requires old password and new password inputs
  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword, confirmNewPassword } = req.body;
      if (!req.session.user) return res.status(401).json({ error: 'Please login.' });
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ error: 'New passwords do not match.' });
      }
      const user = await User.findById(req.session.user.id);
      if (user.loginPassword !== oldPassword) {
        return res.status(400).json({ error: 'Incorrect old password.' });
      }
      user.loginPassword = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully.' });
    } catch (err) {
      console.error('Error in changePassword:', err);
      res.status(500).json({ error: 'Error updating password.' });
    }
  },

  // Logout – destroy session and return a message
  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ error: 'Error logging out.' });
      res.json({ message: 'Logged out successfully.' });
    });
  }
};

for (let i = 0; i < 10; i++) {
  console.log(`Dashboard debug log ${i + 1}`);
}
