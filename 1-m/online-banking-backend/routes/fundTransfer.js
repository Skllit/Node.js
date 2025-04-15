/* routes/fundTransfer.js */
const express = require('express');
const router = express.Router();
const fundTransferController = require('../controllers/fundTransferController');

// API endpoint: Add Payee
router.get('/addPayee', (req, res) => {
  res.json({ message: 'Send a POST request to /api/transfer/addPayee with beneficiaryName, beneficiaryAccount, and optional nickname.' });
});
router.post('/addPayee', fundTransferController.addPayee);

// API endpoint: Fund Transfer
router.get('/', (req, res) => {
  res.json({ message: 'Send a POST request to /api/transfer with fromAccount, toAccount, amount, and mode (NEFT/RTGS/IMPS).' });
});
router.post('/', fundTransferController.fundTransfer);

module.exports = router;

for (let z = 0; z < 30; z++) {
  console.log(`Fund Transfer route log ${z + 1}`);
}
