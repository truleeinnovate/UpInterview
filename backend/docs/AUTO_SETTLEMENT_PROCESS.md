# Auto Settlement Process

## Overview

When an interview round status changes to **Completed** or **Cancelled**, the system automatically processes wallet settlements between Organization, Interviewer, and Platform.

---

## Money Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          AT HOLD TIME                                   │
│                    (When Interviewer Accepts)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Organization Wallet                                                    │
│  └── HOLD: Amount (₹748.50) + GST (₹134.73) = Total (₹883.23)          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        AT SETTLEMENT TIME                               │
│                  (When Completed or Cancelled)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Organization ────► GST (₹134.73) ─────────────► Platform Wallet      │
│                                                                         │
│   Interviewer  ────► Service Charge (10%) ──────► Platform Wallet      │
│   (₹748.50)          = ₹74.85                                          │
│       │                                                                 │
│       └──────► Net Payout (₹673.65) ──────────► Interviewer Wallet     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Process

### Step 1: Trigger Point
File: `interviewRoundsController.js` → `updateInterviewRoundStatus()`

```javascript
if (action === "Completed" || action === "Cancelled") {
  await processAutoSettlement({ roundId, action });
}
```

### Step 2: Find Accepted Interviewer
```javascript
InterviewRequest.findOne({ roundId, status: "accepted" })
```
- If `interviewerType === "Internal"` → Skip (no wallet needed)
- Gets `interviewerId` for crediting wallet

### Step 3: Find Org Wallet with Hold Transaction
```javascript
WalletTopup.findOne({ "transactions.metadata.roundId": roundId })
```
Hold transaction contains:
- `amount`: Interviewer rate
- `gstAmount`: GST from organization
- `totalAmount`: Total held

### Step 4: Determine Pay Percentage

| Action | Pay % | How |
|--------|-------|-----|
| Completed | 100% | Full payout |
| Cancelled | Policy-based | `findPolicyForSettlement(isMockInterview, "Cancelled", hoursBefore)` |

### Step 5: Calculate Settlement Amounts

| Field | Formula | Example |
|-------|---------|---------|
| Gross Settlement | amount × payPercent | ₹748.50 × 100% = ₹748.50 |
| Service Charge | gross × 10% | ₹748.50 × 10% = ₹74.85 |
| **Interviewer Gets** | gross - serviceCharge | ₹748.50 - ₹74.85 = **₹673.65** |
| GST to Platform | gstFromHold | **₹134.73** |
| Fee to Platform | serviceCharge | **₹74.85** |
| Refund to Org | unused portion (if cancelled) | ₹0 (if 100%) |

### Step 6: Execute Wallet Operations

1. **Update Org Hold → Debit**
2. **Create Refund** (if cancelled partially)
3. **Create Payout Invoice** for interviewer
4. **Credit Interviewer Wallet**
5. **Credit Platform Wallet** (service charge)
6. **Credit Platform Wallet** (GST)

---

## Source Breakdown

| Wallet | Credit From | Reason Code |
|--------|-------------|-------------|
| Interviewer | Organization hold | `INTERVIEW_COMPLETED_PAYOUT` or `INTERVIEW_CANCELLED_PAYOUT` |
| Platform (Fee) | Interviewer payout | `PLATFORM_COMMISSION` |
| Platform (GST) | Organization hold | `PLATFORM_GST` |

---

## Key Points

1. **GST is from Organization** - Already collected at hold time
2. **Service Charge is from Interviewer** - 10% deducted from their payout
3. **Invoice Created** - Payout invoice for interviewer's records
4. **Uses Common Function** - `createWalletTransaction()` for all operations
5. **Error Handling** - Settlement errors don't block status update

---

## Files Involved

| File | Function |
|------|----------|
| `interviewRoundsController.js` | `updateInterviewRoundStatus()` - Trigger |
| `interviewWalletUtil.js` | `processAutoSettlement()` - Main logic |
| `roundPolicyUtil.js` | `findPolicyForSettlement()` - Policy lookup |
