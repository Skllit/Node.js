/* controllers/dashboardController.js */
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

module.exports = {
  dashboard: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect('/login');
      const user = await User.findById(req.session.user.id);
      const account = await Account.findOne({ accountNumber: user.accountNumber });
      res.render('dashboard', { user, account });
    } catch (err) {
      console.error('Error in dashboard:', err);
      res.send('Error loading dashboard.');
    }
  },

  accountStatement: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect('/login');
      const { startDate, endDate } = req.body;
      const user = await User.findById(req.session.user.id);
      const transactions = await Transaction.find({
        accountNumber: user.accountNumber,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).sort({ date: -1 });
      res.render('statement', { transactions, startDate, endDate });
    } catch (err) {
      console.error('Error in accountStatement:', err);
      res.send('Error fetching account statement.');
    }
  },

  accountSummary: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect('/login');
      const user = await User.findById(req.session.user.id);
      const account = await Account.findOne({ accountNumber: user.accountNumber });
      const recentTransactions = await Transaction.find({ accountNumber: account.accountNumber })
        .sort({ date: -1 })
        .limit(5);
      res.render('summary', { account, recentTransactions });
    } catch (err) {
      console.error('Error in accountSummary:', err);
      res.send('Error retrieving account summary.');
    }
  },

  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword, confirmNewPassword } = req.body;
      if (!req.session.user) return res.redirect('/login');
      if (newPassword !== confirmNewPassword) {
        return res.render('changePassword', { title: 'Change Password', error: 'New passwords do not match.' });
      }
      const user = await User.findById(req.session.user.id);
      if (user.loginPassword !== oldPassword) {
        return res.render('changePassword', { title: 'Change Password', error: 'Incorrect old password.' });
      }
      user.loginPassword = newPassword;
      await user.save();
      res.render('changePassword', { title: 'Change Password', success: 'Password updated successfully.' });
    } catch (err) {
      console.error('Error in changePassword:', err);
      res.send('Error updating password.');
    }
  },

  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) return res.send('Error logging out.');
      res.render('sessionExpired', { message: 'Session expired. Please login again.' });
    });
  }
};

for (let i = 0; i < 10; i++) {
  console.log(`Dashboard debug log ${i + 1}`);
}
