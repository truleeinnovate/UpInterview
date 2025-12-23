# Interview Settlement Process

## 1. Overview

This document explains how UpInterview settles payments for interview rounds (normal and mock), including how holds are created, when settlements are triggered, and how much is paid to the interviewer versus refunded to the organization/candidate.

It reflects the business policy for:

- Booking modes: **Instant** vs **Schedule Later**
- **Normal** vs **Mock** interviews
- Candidate **reschedules**, **cancellations**, and **no-shows**
- **Interviewer no-show** handling

The core implementation lives in:

- `backend/controllers/InterviewRequestController.js` → creates the **hold** transaction
- `backend/controllers/WalletControllers.js` → `settleInterviewPayment` performs **settlement**
- `backend/models/Interview/InterviewRounds.js` and `backend/models/Mockinterview/mockinterviewRound.js` → store round type, status and timing

---

## 2. Booking Modes

Each round has an `interviewType` field:

- `"instant"` – **Instant Interview**
  - Can only be scheduled to start within the **next 15 minutes** from now.
- `"schedule later"` – **Schedule Later**
  - Can only be scheduled to start at least **2 hours** from now.

These rules apply to:

- Normal interviews
- Mock interviews
- First-time scheduling
- Rescheduling after cancellation or no-show

> Note: The booking window rules are enforced at the round scheduling / rescheduling level (Interview round controllers + UI), not inside the settlement function itself.

---

## 3. Hold Creation (When a Request Is Accepted)

File: `backend/controllers/InterviewRequestController.js` → `acceptInterviewRequest`

When an external interviewer request is accepted:

1. The organization wallet is checked to ensure sufficient balance.
2. A **`hold` transaction** is pushed into `WalletTopup.transactions` for the organization wallet:

   ```js
   const holdTransaction = {
     type: "hold",
     amount: totalAmount,
     description: `Hold for ${request.isMockInterview ? 'mock ' : ''}interview round ${round?.roundTitle}`,
     relatedInvoiceId: holdID,
     status: "pending",
     metadata: {
       interviewId: String(request.isMockInterview ? round?.mockInterviewId : round?.interviewId || ""),
       roundId: String(roundId),
       requestId: String(requestId),
       interviewerContactId: String(contact._id),
       rate,
       experienceLevel,
       duration: String(duration),
       durationInMinutes,
       isMockInterview: Boolean(request.isMockInterview),
       // ...pricing and previous balance/holdAmount snapshot
     },
     createdDate: new Date(),
     createdAt: new Date(),
   };
   ```

3. Wallet balances are updated:

   - `balance` decreased by `totalAmount`
   - `holdAmount` increased by `totalAmount`

4. No transaction IDs are stored on the round document; the link is via `metadata.roundId` and `metadata.interviewId`.

---

## 4. Round Statuses and Events

Each round stores lifecycle status and (optionally) an action:

- Round models:
  - `InterviewRounds.status`
  - `MockInterviewRound.status`
- Example statuses: `Draft`, `RequestSent`, `Scheduled`, `InProgress`, `Completed`, `Cancelled`, `NoShow`, `InCompleted`, `Incomplete`, `Rescheduled`, etc.
- For interviewer/candidate events:
  - `InterviewRounds.currentAction` (string)
  - `MockInterviewRound.currentAction` with values like:
    - `"Candidate_NoShow"`
    - `"Interviewer_NoShow"`
    - `"Technical_Issue"`

Frontends (e.g. `InterviewActions.jsx`) update these statuses when the interviewer marks a round as completed, cancelled, or no-show.

---

## 5. Policy Tables (Business Rules)

### 5.1 Normal Interview – Candidate Actions

Time before scheduled start vs fees:

| Time Before Interview | Reschedule Fee           | Cancellation Fee | **Paid to Interviewer** | UpInterview Service Charge |
|-----------------------|--------------------------|------------------|-------------------------|----------------------------|
| **> 24 hours**        | 0%                       | 0%               | **0%**                  | 0                          |
| **12 to 24 hours**    | 1st reschedule free, 25% from 2nd | 25%             | **25%**                 | 10% of 25% (excl. GST)     |
| **2 to 12 hours**     | 50%                      | 50%              | **50%**                 | 10% of 50% (excl. GST)     |
| **< 2 hours / No-show** | 100%                   | 100%             | **100%**                | 10% of 100% (excl. GST)    |

- Each interview allows **one free reschedule** if requested at least **12 hours** before the start.
- The table is interpreted at **settlement time** for the final outcome (completed, cancelled, no-show): the **“Paid to Interviewer”** column defines how much of the held amount is transferred.

### 5.2 Mock Interview – Candidate Actions

| Time Before Interview | Reschedule Fee | Cancellation Fee | **Paid to Interviewer** |
|-----------------------|----------------|------------------|-------------------------|
| **> 12 hours**        | 0%             | 0%               | **0%**                  |
| **2 to 12 hours**     | 25%            | 25%              | **25%**                 |
| **< 2 hours / No-show** | 50%          | 50%              | **50%**                 |

### 5.3 Interviewer No-Show

If the **interviewer** is a no-show (or > 15 minutes late without notice):

- **Candidate action**: Full refund or free reschedule
- **Interviewer payout**: **0%** (no payment)
- **System behaviour**: the hold is released and fully refunded; no credit is made to the interviewer wallet.

---

## 6. Settlement Logic in Code

File: `backend/controllers/WalletControllers.js` → `settleInterviewPayment`

### 6.1 Inputs

The API `/wallet/settle-interview` receives:

- `roundId` – interview round id
- `transactionId` – `_id` of the **hold** transaction in the organization wallet
- `interviewerContactId` – owner of the interviewer wallet
- `companyName`, `roundTitle`, `positionTitle`, `interviewerTenantId` – metadata for descriptions & notifications

### 6.2 Steps

1. **Find organization wallet** containing the `hold` transaction.
2. **Find hold transaction** in `orgWallet.transactions` and validate:
   - `type === "hold"`
   - `status` is not already `"completed"`
3. **Compute policy-based payout**:

   - `baseAmount = holdTransaction.amount` (full held amount)
   - Load round document:
     - Try `InterviewRounds.findById(roundId)` (normal)
     - If not found, try `MockInterviewRound.findById(roundId)` (mock)
   - Determine if this is a **mock interview** using:
     - `holdTransaction.metadata.isMockInterview` or
     - presence of a `MockInterviewRound` document
   - Read:
     - `roundStatus = roundDoc.status`
     - `currentAction = roundDoc.currentAction` (for interviewer no-show)
     - `scheduledTime = new Date(roundDoc.dateTime)`
     - `actionTime = updatedAt` (round `updatedAt` or now)
     - `hoursBefore = max(0, (scheduledTime - actionTime) / 3600000)`

4. **Derive payout percentage `payPercent`**:

   - **Interviewer no-show** (`currentAction === "Interviewer_NoShow"`):

     ```text
     payPercent = 0
     scenario   = "interviewer_no_show"
     ```

   - **Completed** round (`status === "Completed"`):

     ```text
     payPercent = 100
     scenario   = "completed"
     ```

   - **Cancelled / NoShow / InCompleted / Incomplete**:

     - If `hoursBefore` cannot be computed → conservative default:

       ```text
       payPercent = 0
       ```

     - **Mock Interviews**:

       ```text
       if hoursBefore > 12   → payPercent = 0
       else if hoursBefore > 2 → payPercent = 25
       else                    → payPercent = 50
       ```

     - **Normal Interviews**:

       ```text
       if hoursBefore > 24   → payPercent = 0
       else if hoursBefore > 12 → payPercent = 25
       else if hoursBefore > 2  → payPercent = 50
       else                     → payPercent = 100
       ```

5. **Calculate monetary amounts**:

   ```js
   const settlementAmount = roundTo2Decimals(baseAmount * payPercent / 100);
   const refundAmount     = Math.max(0, baseAmount - settlementAmount);

   const serviceChargePercent = 10;
   const serviceCharge = roundTo2Decimals(
     (settlementAmount * serviceChargePercent) / 100
   );
   ```

   - `settlementAmount` – what the interviewer receives
   - `refundAmount` – what is returned to the organization (and can be used to refund the candidate)
   - `serviceCharge` – 10% of interviewer payout, captured in metadata for reporting

6. **Update organization wallet**:

   - Mark the hold transaction as `debit` and `completed`.
   - Attach settlement metadata:

     ```js
     "transactions.$.metadata.settlementBaseAmount" = baseAmount
     "transactions.$.metadata.settlementPayPercent" = payPercent
     "transactions.$.metadata.settlementAmountPaidToInterviewer" = settlementAmount
     "transactions.$.metadata.settlementRefundAmount" = refundAmount
     "transactions.$.metadata.settlementServiceCharge" = serviceCharge
     "transactions.$.metadata.settlementScenario" = settlementScenario
     ```

   - Adjust wallet totals:

     ```js
     $inc: {
       holdAmount: -baseAmount,   // release full hold
       balance:   refundAmount,   // credit back unused portion
     }
     ```

7. **Update interviewer wallet (only if payout > 0)**:

   - If `settlementAmount > 0`:
     - Create a `credit` transaction for `settlementAmount` with metadata linking to the original hold and round.
     - Increment interviewer wallet `balance` by `settlementAmount`.
   - If `settlementAmount === 0`:
     - No transaction is created in interviewer wallet (interviewer receives nothing).

8. **Notifications**:

   - If `settlementAmount > 0`, `createInterviewSettlementNotification` is called to notify the interviewer of the payment.

9. **Round settlement status**:

   - The round (normal or mock) is updated with:

     ```js
     settlementStatus: "completed",
     settlementDate: new Date(),
     ```

10. **Response payload**:

    The API returns:

    ```json
    {
      "success": true,
      "message": "Interview payment settled successfully",
      "data": {
        "settlementAmount": <number>,
        "refundAmount": <number>,
        "payPercent": <number>,
        "serviceCharge": <number>,
        "settlementScenario": "completed|cancelled|noshow|interviewer_no_show|…",
        "organizationWallet": { "ownerId": "…", "balance": <number>, "holdAmount": <number> },
        "interviewerWallet": { "ownerId": "…", "balance": <number>, "creditTransactionId": "…" } | null,
        "roundId": "…",
        "originalTransactionId": "…"
      }
    }
    ```

---

## 7. Frontend Integration (Super Admin)

File: `frontend/src/Pages/SuperAdmin-Part/Interviews/InterviewDetailsSidebar.jsx`

- Super Admin can view the **hold transaction** and trigger manual settlement.
- `handleSettlement` currently uses the full hold amount for the confirmation message, but the **actual payout** is determined by the backend policy above.
- After settlement, the UI should ideally use the response (`settlementAmount`, `refundAmount`, `payPercent`) to show an accurate summary of how much was paid vs refunded.

---

## 8. Edge Cases & Notes

- If the round document cannot be found or the scheduled time is invalid, settlement falls back to conservative defaults (typically **no payout**).
- "Exceptional circumstances" such as genuine emergencies or technical failures can be handled operationally by support (e.g. manual adjustments or offline refunds).
- Assessment policy (validity and extensions) is independent of interview settlement and is handled by assessment controllers.

This document should be kept in sync with any future changes to `settleInterviewPayment` or interview booking rules.
