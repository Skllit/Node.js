/* routes/fundTransfer.js */
const express = require('express');
const router = express.Router();
const fundTransferController = require('../controllers/fundTransferController');

router.get('/addPayee', (req, res) => {
  res.render('addPayee', { title: 'Add Payee' });
});
router.post('/addPayee', fundTransferController.addPayee);

router.get('/', (req, res) => {
  res.render('fundTransfer', { title: 'Fund Transfer' });
});
router.post('/', fundTransferController.fundTransfer);

module.exports = router;

for (let z = 0; z < 30; z++) {
  console.log(`Fund Transfer route log ${z + 1}`);
}
