// v1.0.0 - Venkatesh - Added settle-interview route for processing interview payment settlements

const express = require('express');
const { 
  getWalletByOwnerId, 
  createTopupOrder, 
  walletVerifyPayment,
  addBankAccount,
  getBankAccounts,
  deleteBankAccount,
  verifyBankAccount,
  createWithdrawalRequest,
  getWithdrawalRequests,
  getWithdrawalRequestById,
  cancelWithdrawalRequest,
  handlePayoutWebhook,
  fixVerifiedBankAccounts,
  settleInterviewPayment,
  // Manual processing endpoints
  processManualWithdrawal,
  failManualWithdrawal,
  getAllWithdrawalRequests
} = require('../controllers/WalletControllers');

const WalletRouter = express.Router();

// Wallet Top-up Routes
// POST /wallet/create-order - Create Razorpay order for wallet top-up
WalletRouter.post('/create-order', createTopupOrder);

// POST /wallet/verify-payment - Verify payment and update wallet
WalletRouter.post('/verify-payment', walletVerifyPayment);

// Bank Account Routes
// POST /wallet/bank-accounts - Add a new bank account
WalletRouter.post('/bank-accounts', addBankAccount);

// DELETE /wallet/bank-accounts/:bankAccountId - Delete a bank account
WalletRouter.delete('/bank-accounts/:bankAccountId', deleteBankAccount);

// Withdrawal Routes
// POST /wallet/withdrawals - Create a new withdrawal request
WalletRouter.post('/withdrawals', createWithdrawalRequest);

// GET /wallet/get-all-withdrawals-requests - Get all withdrawal requests (superadmin) - MOVED BEFORE parameterized routes
WalletRouter.get('/get-all-withdrawals-requests', getAllWithdrawalRequests);

// GET /wallet/withdrawal-request/:withdrawalRequestId - Get single withdrawal request by ID (superadmin)
WalletRouter.get('/withdrawal-request/:withdrawalRequestId', getWithdrawalRequestById);

// Webhook Routes
// POST /wallet/payout-webhook - Handle Razorpay payout webhook events
WalletRouter.post('/payout-webhook', handlePayoutWebhook);

// Settlement Routes
// POST /wallet/settle-interview - Settle interview payment from hold to interviewer
WalletRouter.post('/settle-interview', settleInterviewPayment);

// Utility Routes
// POST /wallet/fix-verified-accounts - Fix verified bank accounts that are not marked as active
WalletRouter.post('/fix-verified-accounts', fixVerifiedBankAccounts);

// Manual Processing Routes (for Superadmin)
// POST /wallet/withdrawals/:withdrawalRequestId/process - Manually process a withdrawal
WalletRouter.post('/withdrawals/:withdrawalRequestId/process', processManualWithdrawal);

// POST /wallet/withdrawals/:withdrawalRequestId/fail - Manually mark a withdrawal as failed
WalletRouter.post('/withdrawals/:withdrawalRequestId/fail', failManualWithdrawal);

// POST /wallet/withdrawals/:withdrawalRequestId/cancel - Cancel a withdrawal request
WalletRouter.post('/withdrawals/:withdrawalRequestId/cancel', cancelWithdrawalRequest);

// PARAMETERIZED ROUTES SHOULD BE LAST - These catch-all routes go at the end
// GET /wallet/bank-accounts/:ownerId - Get all bank accounts for an owner
WalletRouter.get('/bank-accounts/:ownerId', getBankAccounts);

// POST /wallet/bank-accounts/:bankAccountId/verify - Verify a bank account
WalletRouter.post('/bank-accounts/:bankAccountId/verify', verifyBankAccount);

// GET /wallet/withdrawals/:ownerId - Get withdrawal requests for an owner
WalletRouter.get('/withdrawals/:ownerId', getWithdrawalRequests);

// GET /wallet/:ownerId - Get wallet by owner ID - THIS MUST BE LAST as it catches everything
WalletRouter.get('/:ownerId', getWalletByOwnerId);

module.exports = WalletRouter;
