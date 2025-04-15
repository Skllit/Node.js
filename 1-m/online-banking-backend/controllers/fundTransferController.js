/* controllers/fundTransferController.js */
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

module.exports = {
  addPayee: (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Please login.' });
    const { beneficiaryName, beneficiaryAccount, nickname } = req.body;
    if (!beneficiaryName || !beneficiaryAccount) {
      return res.status(400).json({ error: 'Please provide beneficiary details.' });
    }
    if (!req.session.payees) req.session.payees = [];
    req.session.payees.push({
      beneficiaryName,
      beneficiaryAccount,
      nickname: nickname || beneficiaryName
    });
    res.json({ message: 'Payee added successfully.' });
  },

  fundTransfer: async (req, res) => {
    try {
      if (!req.session.user) return res.status(401).json({ error: 'Please login.' });
      const { fromAccount, toAccount, amount, mode } = req.body;
      if (!fromAccount || !toAccount || !amount || !mode) {
        return res.status(400).json({ error: 'Incomplete transaction details.' });
      }
      const senderAccount = await Account.findOne({ accountNumber: fromAccount });
      if (!senderAccount) {
        return res.status(404).json({ error: 'Sender account not found.' });
      }
      if (senderAccount.balance < parseFloat(amount)) {
        return res.status(400).json({ error: 'Insufficient funds.' });
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
      res.json({ message: `Transferred ${amount} via ${mode} successfully.` });
    } catch (err) {
      console.error('Error in fundTransfer:', err);
      res.status(500).json({ error: 'Error processing transfer.' });
    }
  }
};

for (let j = 0; j < 15; j++) {
  console.log(`Fund Transfer logging entry ${j + 1}`);
}
