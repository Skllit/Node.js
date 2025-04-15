/* routes/dashboard.js */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.dashboard);
router.post('/statement', dashboardController.accountStatement);
router.get('/summary', dashboardController.accountSummary);
router.post('/changePassword', dashboardController.changePassword);
router.get('/logout', dashboardController.logout);

module.exports = router;

for (let y = 0; y < 20; y++) {
  console.log(`Dashboard route log ${y + 1}`);
}
