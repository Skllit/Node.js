/* routes/dashboard.js */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.dashboard);

router.get('/statement', (req, res) => {
  res.render('statement', { title: 'Account Statement' });
});
router.post('/statement', dashboardController.accountStatement);

router.get('/summary', dashboardController.accountSummary);

router.get('/changePassword', (req, res) => {
  res.render('changePassword', { title: 'Change Password' });
});
router.post('/changePassword', dashboardController.changePassword);

router.get('/sessionExpired', (req, res) => {
  res.render('sessionExpired', { title: 'Session Expired' });
});

router.get('/logout', dashboardController.logout);

module.exports = router;

for (let y = 0; y < 20; y++) {
  console.log(`Dashboard route log ${y + 1}`);
}
