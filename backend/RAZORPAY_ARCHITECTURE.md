# Razorpay & RazorpayX Architecture for Wallet System

## Overview

This document explains how we use Razorpay and RazorpayX for the wallet system in UpInterview.

## Key Concepts

### 1. Razorpay vs RazorpayX
- **Razorpay**: Payment Gateway for accepting payments (collecting money)
- **RazorpayX**: Banking solution for payouts (sending money)
- **Your Database**: Stores actual wallet balance (not stored in Razorpay/RazorpayX)

### 2. Money Flow Architecture

```
USER WALLET FLOW:
================

TOP-UP (Money In):
User → Razorpay Payment Gateway → Your Database (credit balance)
        ↓
    Uses: RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET

WITHDRAWAL (Money Out):
Your Database (debit balance) → RazorpayX Payout → User's Bank
        ↓
    Uses: RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET
    Requires: RAZORPAY_ACCOUNT_NUMBER (your RazorpayX account)

PENNY DROP VERIFICATION:
RazorpayX → Validates Bank Account → Updates verification status
        ↓
    Uses: Same credentials + RAZORPAY_ACCOUNT_NUMBER
```

### 3. Important Points

1. **Wallet Balance Storage**: 
   - Stored in YOUR MongoDB database (`WalletTopup` model)
   - NOT stored in Razorpay or RazorpayX
   - Razorpay/RazorpayX are just payment processors

2. **Credentials**:
   - Both services use same KEY_ID
   - Same KEY_SECRET works for both (unless you have separate secrets)
   - RazorpayX requires additional ACCOUNT_NUMBER

3. **Settlement**:
   - Razorpay collects payments → settles to your bank account
   - You maintain wallet balance in database
   - RazorpayX debits from your account for payouts

## Environment Variables Setup

```env
# Razorpay Credentials (used for both payment collection & payouts)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# RazorpayX Specific (your RazorpayX account number)
RAZORPAY_ACCOUNT_NUMBER=2323230012345678

# IMPORTANT: Each webhook endpoint has its own secret!
# Get these from Razorpay Dashboard > Webhooks > Your Webhook > Secret

# For wallet top-up payments (Razorpay Payment Gateway)
RAZORPAY_WALLET_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# For payouts/withdrawals (RazorpayX)
RAZORPAY_PAYOUT_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# For regular payments (non-wallet)
RAZORPAY_PAYMENT_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# For subscriptions
RAZORPAY_SUBSCRIPTION_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### How to Get Webhook Secrets:
1. **Razorpay Dashboard** → Settings → Webhooks
2. Create separate webhook endpoints for:
   - `/wallet/webhook` → for wallet top-ups (payment.captured)
   - `/wallet/payout-webhook` → for withdrawals (payout.processed, payout.failed)
3. Each webhook shows its unique secret after creation

## API Usage

### 1. Wallet Top-up (Razorpay)
```javascript
// Uses regular Razorpay for payment collection
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order for payment collection
const order = await razorpay.orders.create({
  amount: 10000, // ₹100 in paise
  currency: "INR"
});
```

### 2. Bank Account Verification (RazorpayX)
```javascript
// Uses RazorpayX Fund Account Validation API
// Same credentials, but requires account_number
const validation = {
  account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
  fund_account: { id: fundAccountId },
  amount: 100, // ₹1 penny drop
  currency: "INR"
};

// Call RazorpayX API
POST https://api.razorpay.com/v1/fund_accounts/validations
```

### 3. Withdrawal/Payout (RazorpayX)
```javascript
// Uses RazorpayX Payouts API
const payout = await razorpay.payouts.create({
  account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
  fund_account_id: bankAccount.razorpayFundAccountId,
  amount: 50000, // ₹500 in paise
  currency: "INR",
  mode: "IMPS",
  purpose: "payout"
});
```

## Database Schema

### WalletTopup Model
```javascript
{
  ownerId: String,
  balance: Number, // Current wallet balance
  transactions: [{
    type: "credit" | "debit" | "hold",
    amount: Number,
    description: String,
    status: "completed" | "pending" | "failed"
  }]
}
```

### Key Operations

1. **Top-up**: 
   - User pays via Razorpay
   - On success, increase `balance` in database
   - Add transaction record

2. **Withdrawal**:
   - Check sufficient balance in database
   - Deduct from `balance` (or put on hold)
   - Trigger RazorpayX payout
   - Update status based on payout result

## Common Issues & Solutions

### Issue 1: "Do I store money in RazorpayX?"
**No.** RazorpayX is just for sending payouts. Your wallet balance is in your database.

### Issue 2: "Different credentials for Razorpay vs RazorpayX?"
Usually same KEY_ID and KEY_SECRET. RazorpayX additionally needs ACCOUNT_NUMBER.

### Issue 3: "How does settlement work?"
- **Incoming**: Razorpay collects → settles to your bank (T+2 days)
- **Outgoing**: You trigger payout → RazorpayX debits your account → sends to user

### Issue 4: "Webhook handling?"
- Payment webhooks: Handle `payment.captured` for top-ups
- Payout webhooks: Handle `payout.processed`, `payout.failed` for withdrawals

## Testing

### Test Mode
```env
# Test credentials (no real money)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_ACCOUNT_NUMBER=2323230012345678
```

### Live Mode
- Requires KYC completion
- RazorpayX activation needed for payouts
- Real money transactions

## Security Best Practices

1. **Never expose credentials** in frontend code
2. **Verify webhook signatures** in production
3. **Always validate amounts** before processing
4. **Use idempotency keys** for critical operations
5. **Log all transactions** for audit trail
6. **Implement rate limiting** on payout endpoints

## Support & Documentation

- Razorpay Docs: https://razorpay.com/docs/api/
- RazorpayX Docs: https://razorpay.com/docs/razorpayx/api/
- Fund Account Validation: https://razorpay.com/docs/api/razorpayx/account-validation/
- Payouts API: https://razorpay.com/docs/api/razorpayx/payouts/

## Contact for Issues
- Razorpay Support: support@razorpay.com
- Dashboard: https://dashboard.razorpay.com
