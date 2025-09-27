const express = require('express');
const router = express.Router();
const ExchangeRateController = require('../controllers/exchangeRateController');

// Get current exchange rate (USD to INR)
router.get('/rate/current', ExchangeRateController.getCurrentRate);

// Get exchange rate for a specific date
router.get('/rate/date', ExchangeRateController.getRateByDate);

// Convert amount from USD to INR
router.get('/convert', ExchangeRateController.convertAmount);

module.exports = router;
