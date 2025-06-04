const express = require('express');
const { 
  getWalletByOwnerId, 
  createTopupOrder, 
  walletVerifyPayment,
  //handleWebhook 
} = require('../controllers/WalletControllers');

const WalletRouter = express.Router();

// GET /wallet/:ownerId - Get wallet by owner ID
WalletRouter.get('/:ownerId', getWalletByOwnerId);

// POST /wallet/create-order - Create Razorpay order for wallet top-up
WalletRouter.post('/create-order', createTopupOrder);

// POST /wallet/verify-payment - Verify payment and update wallet
WalletRouter.post('/verify-payment', walletVerifyPayment);

// POST /wallet/webhook - Handle Razorpay webhook events
//WalletRouter.post('/wallet-webhook', handleWebhook);

module.exports = WalletRouter;
