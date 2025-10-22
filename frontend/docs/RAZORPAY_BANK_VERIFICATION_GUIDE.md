# Razorpay Bank Account Verification Guide

## Overview
This guide explains how to validate and verify bank account details using Razorpay's Penny Drop verification method in the UpInterview application.

## What is Penny Drop Verification?
Penny Drop is a bank account verification method where Razorpay deposits a small amount (₹1) into the bank account to verify:
1. The account exists
2. The account is active
3. The account holder name matches

## Complete Verification Flow

### Step 1: Collect Bank Account Details

#### Required Fields for Indian Banks:
```javascript
{
  "accountHolderName": "John Doe",      // Must match bank records exactly
  "accountNumber": "1234567890",        // Bank account number
  "ifscCode": "HDFC0001234",           // 11-character IFSC code
  "bankName": "HDFC Bank"              // Bank name
}
```

#### Required Fields for US Banks:
```javascript
{
  "accountHolderName": "John Doe",      // Must match bank records exactly
  "accountNumber": "123456789012",      // Bank account number
  "routingNumber": "021000021",        // 9-digit ACH routing number
  "bankName": "Chase Bank"             // Bank name
}
```

### Step 2: Frontend Validation

The frontend performs validation before sending to backend:

```javascript
// In BankAccountValidation.js
const validateBankAccount = (account) => {
  const errors = {};
  
  // Account holder name validation
  if (!account.accountHolderName || account.accountHolderName.length < 2) {
    errors.accountHolderName = "Account holder name is required (min 2 characters)";
  }
  
  // Account number validation (8-17 digits)
  const accountNumberRegex = /^\d{8,17}$/;
  if (!accountNumberRegex.test(account.accountNumber)) {
    errors.accountNumber = "Account number must be 8-17 digits";
  }
  
  // IFSC Code validation (Indian banks)
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (account.ifscCode && !ifscRegex.test(account.ifscCode)) {
    errors.ifscCode = "Invalid IFSC code format";
  }
  
  // US Routing number validation
  const routingRegex = /^\d{9}$/;
  if (account.routingNumber && !routingRegex.test(account.routingNumber)) {
    errors.routingNumber = "Routing number must be 9 digits";
  }
  
  return errors;
};
```

### Step 3: Backend Processing

#### 3.1 Create Razorpay Contact
First, create a contact in Razorpay for the account holder:

```javascript
// In WalletControllers.js - verifyBankAccount function
const contact = await razorpay.contacts.create({
  name: bankAccount.accountHolderName,
  email: userEmail,              // User's email
  contact: phoneNumber,          // User's phone (required)
  type: "customer",
  reference_id: ownerId
});
```

#### 3.2 Create Fund Account
Link the bank account to the Razorpay contact:

```javascript
const fundAccount = await razorpay.fundAccount.create({
  contact_id: contact.id,
  account_type: "bank_account",
  bank_account: {
    name: bankAccount.accountHolderName,
    ifsc: bankAccount.ifscCode,           // For Indian banks
    account_number: bankAccount.accountNumber
  }
});
```

#### 3.3 Initiate Penny Drop Verification
Send verification request to Razorpay:

```javascript
const payload = {
  account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,  // Your RazorpayX account
  fund_account: { 
    id: fundAccount.id 
  },
  amount: 100,            // ₹1 in paise
  currency: "INR",
  notes: {
    bankAccountId: bankAccount._id.toString()
  }
};

// Make API call to Razorpay
const options = {
  hostname: "api.razorpay.com",
  path: "/v1/fund_accounts/validations",
  method: "POST",
  headers: {
    "Authorization": "Basic " + Buffer.from(`${key_id}:${key_secret}`).toString("base64"),
    "Content-Type": "application/json"
  }
};
```

### Step 4: Handle Verification Response

#### Success Response:
```javascript
{
  "status": "completed",
  "results": {
    "account_status": "valid",
    "name_at_bank": "JOHN DOE"
  }
}
// Mark account as verified
bankAccount.isVerified = true;
bankAccount.verificationStatus = "verified";
```

#### Failed Response:
```javascript
{
  "status": "completed",
  "results": {
    "account_status": "invalid",
    "reason": "Account does not exist"
  }
}
// Mark account as failed
bankAccount.isVerified = false;
bankAccount.verificationStatus = "failed";
```

#### Pending Response:
```javascript
{
  "status": "created"  // or "initiated"
}
// Keep as pending, check status later
bankAccount.verificationStatus = "pending";
```

### Step 5: Frontend Handling

```javascript
// In BankAccountsPopup.jsx
const handleVerifyAccount = async (accountId) => {
  try {
    const result = await verifyBankAccount(accountId);
    
    if (result.status === 202) {
      // Verification pending
      toast.info("Verification initiated. Please check back in a few minutes.");
    } else if (result.status === 200) {
      // Verification complete
      toast.success("Bank account verified successfully!");
      refetchBankAccounts();  // Refresh the list
    }
  } catch (error) {
    toast.error(error.message);
  }
};
```

## Error Handling

### Common Errors and Solutions:

#### 1. RazorpayX Not Enabled
```javascript
// Auto-verify for testing if RazorpayX not available
if (errorMessage.includes("not enabled") || errorMessage.includes("RazorpayX")) {
  bankAccount.isVerified = true;
  bankAccount.verificationMethod = "manual";
  bankAccount.metadata.note = "Auto-verified: RazorpayX not enabled";
}
```

#### 2. Missing Contact Information
```javascript
// Fallback values if user info not available
const email = user?.email || `${ownerId}@wallet.com`;
const phone = user?.phone || "+919999999999";
```

#### 3. Invalid IFSC Code
```javascript
if (!ifscRegex.test(bankAccount.ifscCode)) {
  return res.status(400).json({
    error: "Invalid IFSC code format"
  });
}
```

## Testing Without RazorpayX

For development/testing without RazorpayX:

```javascript
// In .env file - leave these empty or don't set
# RAZORPAY_KEY_ID=
# RAZORPAY_KEY_SECRET=
# RAZORPAY_ACCOUNT_NUMBER=

// Backend will auto-verify accounts
if (!keyId || !keySecret) {
  bankAccount.isVerified = true;
  bankAccount.verificationMethod = "manual";
  bankAccount.metadata.note = "Auto-verified for testing";
}
```

## Required Environment Variables

```env
# Razorpay API Credentials
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# RazorpayX Account Number (for payouts)
RAZORPAY_ACCOUNT_NUMBER=2323230000000000

# Webhook Secret (optional)
RAZORPAY_PAYOUT_WEBHOOK_SECRET=xxxxxxxxxxxxx
```

## API Endpoints

### Add Bank Account
```http
POST /api/wallet/bank-accounts
```

### Verify Bank Account
```http
POST /api/wallet/bank-accounts/:bankAccountId/verify
```

### Get Bank Accounts
```http
GET /api/wallet/bank-accounts/:ownerId
```

### Delete Bank Account
```http
DELETE /api/wallet/bank-accounts/:bankAccountId
```

## Database Schema

```javascript
// BankAccount Model
{
  ownerId: String,                    // User ID
  accountHolderName: String,          // Name as per bank
  bankName: String,                   // Bank name
  accountNumber: String,              // Account number
  ifscCode: String,                   // IFSC (India)
  routingNumber: String,              // Routing (US)
  
  // Verification fields
  isVerified: Boolean,                // Verification status
  verificationStatus: String,         // pending/verified/failed
  verificationDate: Date,             // When verified
  verificationMethod: String,         // penny_drop/manual
  
  // Razorpay fields
  razorpayContactId: String,          // Razorpay contact ID
  razorpayFundAccountId: String,      // Razorpay fund account ID
  
  // Display
  maskedAccountNumber: String,        // ••••1234
  isDefault: Boolean,                 // Default account flag
  isActive: Boolean                   // Active status
}
```

## Best Practices

1. **Always validate on both frontend and backend**
2. **Store sensitive data securely** - Never log account numbers
3. **Use masked account numbers** for display (••••1234)
4. **Handle all error scenarios** gracefully
5. **Provide clear user feedback** at each step
6. **Test thoroughly** in sandbox before production
7. **Keep verification status updated** in database
8. **Implement retry logic** for failed verifications

## Troubleshooting

### Issue: Verification always fails
- Check if account holder name matches exactly with bank records
- Verify IFSC code is correct
- Ensure RazorpayX is enabled on your account

### Issue: Contact creation fails
- Ensure phone number is provided in correct format
- Check if email is valid

### Issue: Fund account creation fails
- Verify bank details are correct
- Check if contact was created successfully
- Ensure IFSC code format is valid

## Support

For Razorpay specific issues:
- Documentation: https://razorpay.com/docs/api/razorpayx/account-validation/
- Support: https://dashboard.razorpay.com/support

For application specific issues:
- Check backend logs for detailed error messages
- Verify environment variables are set correctly
- Ensure database connection is stable
