const express = require('express');
const WalletRouter = express.Router();
const {topUpWallet, getTopUpWallet, deductFromWallet} = require('../controllers/WalletTopupControllers.js');

// Route for wallet top-up
WalletRouter.post('/top-up', topUpWallet);


//  Wallet get call 
WalletRouter.get('/get-top-up/:ownerId',getTopUpWallet)

// Route for wallet debit
WalletRouter.post('/deduct', deductFromWallet);

module.exports = WalletRouter;
