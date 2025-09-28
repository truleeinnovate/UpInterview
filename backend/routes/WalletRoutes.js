const express = require('express');
const { 
  getWalletByOwnerId, 
  createTopupOrder, 
  walletVerifyPayment,
  addBankAccount,
  getBankAccounts,
  verifyBankAccount,
  createWithdrawalRequest,
  getWithdrawalRequests,
  cancelWithdrawalRequest,
  handlePayoutWebhook
} = require('../controllers/WalletControllers');

const WalletRouter = express.Router();

// Wallet Balance Routes
// GET /wallet/:ownerId - Get wallet by owner ID
WalletRouter.get('/:ownerId', getWalletByOwnerId);

// Wallet Top-up Routes
// POST /wallet/create-order - Create Razorpay order for wallet top-up
WalletRouter.post('/create-order', createTopupOrder);

// POST /wallet/verify-payment - Verify payment and update wallet
WalletRouter.post('/verify-payment', walletVerifyPayment);

// Bank Account Routes
// POST /wallet/bank-accounts - Add a new bank account
WalletRouter.post('/bank-accounts', addBankAccount);

// GET /wallet/bank-accounts/:ownerId - Get all bank accounts for an owner
WalletRouter.get('/bank-accounts/:ownerId', getBankAccounts);

// POST /wallet/bank-accounts/:bankAccountId/verify - Verify a bank account
WalletRouter.post('/bank-accounts/:bankAccountId/verify', verifyBankAccount);

// Withdrawal Routes
// POST /wallet/withdrawals - Create a new withdrawal request
WalletRouter.post('/withdrawals', createWithdrawalRequest);

// GET /wallet/withdrawals/:ownerId - Get withdrawal requests for an owner
WalletRouter.get('/withdrawals/:ownerId', getWithdrawalRequests);

// POST /wallet/withdrawals/:withdrawalRequestId/cancel - Cancel a withdrawal request
WalletRouter.post('/withdrawals/:withdrawalRequestId/cancel', cancelWithdrawalRequest);

// Webhook Routes
// POST /wallet/payout-webhook - Handle Razorpay payout webhook events
WalletRouter.post('/payout-webhook', handlePayoutWebhook);

module.exports = WalletRouter;
