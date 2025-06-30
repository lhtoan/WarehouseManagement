const express = require('express');
const router = express.Router();
const { getRevenueByDay, getTotalBillsToday } = require('../controllers/statistics.controller');

router.get('/revenuebyday', getRevenueByDay);
router.get('/totalbillstoday', getTotalBillsToday);


module.exports = router;
