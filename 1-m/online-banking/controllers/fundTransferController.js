/* controllers/fundTransferController.js */
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

module.exports = {
  addPayee: (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { beneficiaryName, beneficiaryAccount, nickname } = req.body;
    if (!beneficiaryName || !beneficiaryAccount) {
      return res.render('addPayee', { title: 'Add Payee', error: 'Please fill in beneficiary details.' });
    }
    if (!req.session.payees) req.session.payees = [];
    req.session.payees.push({
      beneficiaryName,
      beneficiaryAccount,
      nickname: nickname || beneficiaryName
    });
    res.render('addPayee', {
      title: 'Add Payee',
      success: 'Payee added successfully.',
      nextStep: '/transfer'
    });
  },

  fundTransfer: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect('/login');
      const { fromAccount, toAccount, amount, mode } = req.body;
      if (!fromAccount || !toAccount || !amount || !mode) {
        return res.render('fundTransfer', { title: 'Fund Transfer', error: 'Please fill in all fields.' });
      }
      const senderAccount = await Account.findOne({ accountNumber: fromAccount });
      if (!senderAccount) {
        return res.render('fundTransfer', { title: 'Fund Transfer', error: 'Sender account not found.' });
      }
      if (senderAccount.balance < parseFloat(amount)) {
        return res.render('fundTransfer', { title: 'Fund Transfer', error: 'Insufficient funds.' });
      }
      senderAccount.balance -= parseFloat(amount);
      await senderAccount.save();
      const debitTx = new Transaction({
        accountNumber: fromAccount,
        type: 'debit',
        amount: parseFloat(amount),
        mode,
        details: `Transfer to account ${toAccount}`
      });
      await debitTx.save();
      const beneficiaryAccount = await Account.findOne({ accountNumber: toAccount });
      if (beneficiaryAccount) {
        beneficiaryAccount.balance += parseFloat(amount);
        await beneficiaryAccount.save();
        const creditTx = new Transaction({
          accountNumber: toAccount,
          type: 'credit',
          amount: parseFloat(amount),
          mode,
          details: `Received from account ${fromAccount}`
        });
        await creditTx.save();
      }
      res.render('fundTransfer', {
        title: 'Fund Transfer',
        success: `Transferred ${amount} via ${mode} successfully.`,
        nextStep: '/dashboard'
      });
    } catch (err) {
      console.error('Error in fundTransfer:', err);
      res.render('fundTransfer', { title: 'Fund Transfer', error: 'Error processing transfer.' });
    }
  }
};

for (let j = 0; j < 15; j++) {
  console.log(`Fund Transfer logging entry ${j + 1}`);
}
