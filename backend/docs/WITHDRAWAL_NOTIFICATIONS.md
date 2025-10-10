# Withdrawal Push Notifications Documentation

## Overview
This system provides real-time push notifications for wallet withdrawal requests, keeping users informed about the status of their withdrawal transactions.

## Features Implemented

### 1. Push Notifications for Withdrawal Status

The system creates push notifications for the following withdrawal events:

#### **Pending Status (Request Created)**
- **Trigger**: When a user creates a new withdrawal request
- **Title**: "Withdrawal Request Created"
- **Message**: Details about the request including withdrawal code and amount
- **Metadata**: Contains withdrawalRequestId, amount, netAmount, bank details

#### **Completed Status (Successful Withdrawal)**
- **Trigger**: When admin marks withdrawal as completed
- **Title**: "Withdrawal Completed"
- **Message**: Confirmation of successful transfer with bank account details
- **Metadata**: Transaction reference, processed by admin, completion timestamp

#### **Failed Status (Withdrawal Failed)**
- **Trigger**: When admin marks withdrawal as failed
- **Title**: "Withdrawal Failed"
- **Message**: Failure notification with reason and refund confirmation
- **Metadata**: Failure reason, admin notes, refund details

#### **Canceled Status (User Cancellation)**
- **Trigger**: When user cancels their withdrawal request
- **Title**: "Withdrawal Canceled"
- **Message**: Cancellation confirmation with refund details
- **Metadata**: Cancellation reason, timestamp

## Backend Implementation

### Files Modified:

#### 1. `/backend/controllers/WalletControllers.js`
```javascript
// Added PushNotification import
const PushNotification = require("../models/PushNotifications");

// In createWithdrawalRequest function:
await PushNotification.create({
  ownerId,
  tenantId,
  title: "Withdrawal Request Created",
  message: `Your withdrawal request ${withdrawalCode} for ₹${amount.toFixed(2)} has been submitted...`,
  type: "wallet",
  category: "withdrawal_status",
  unread: true,
  metadata: {
    withdrawalRequestId: withdrawalRequest._id.toString(),
    withdrawalCode,
    amount,
    netAmount,
    status: "pending",
    // ... other metadata
  }
});

// Similar implementations for:
// - processManualWithdrawal (completed status)
// - failManualWithdrawal (failed status)
// - cancelWithdrawalRequest (canceled status)
```

#### 2. `/backend/routes/WalletRoutes.js`
```javascript
// Added route for marking withdrawal as failed
WalletRouter.post('/withdrawals/:withdrawalRequestId/fail', failManualWithdrawal);
```

### Notification Data Structure:
```javascript
{
  ownerId: "user_id",
  tenantId: "tenant_id",
  title: "Withdrawal Status Title",
  message: "Detailed message about withdrawal",
  type: "wallet",
  category: "withdrawal_status",
  unread: true,
  metadata: {
    withdrawalRequestId: "withdrawal_id",
    withdrawalCode: "WD-000001",
    amount: 1000.00,
    netAmount: 970.00,
    status: "pending|completed|failed|canceled",
    bankAccount: "****1234",
    bankName: "Bank Name",
    transactionReference: "ref_123",
    failureReason: "reason if failed",
    cancellationReason: "reason if canceled"
  }
}
```

## Frontend Implementation

### New Components:

#### 1. `/frontend/src/Pages/Dashboard-Part/Accountsettings/account/wallet/WithdrawalNotifications.jsx`

A dedicated component for displaying withdrawal notifications with:
- Real-time notification updates (auto-refresh every 30 seconds)
- Status-based color coding and icons
- Detailed modal view for each notification
- Unread notification badge
- Filtering for withdrawal-specific notifications

Features:
- **Status Icons**: Different icons for pending, completed, failed, and canceled
- **Color Coding**: Visual indication based on status
- **Metadata Display**: Shows withdrawal code, amounts, bank details
- **Time Display**: Relative time using `date-fns`
- **Mark as Read**: Automatic when notification is clicked

#### 2. **Wallet.jsx Integration**

Added notification bell button with:
- Unread notification badge count
- Click to open WithdrawalNotifications component
- Real-time badge updates

## API Endpoints

### Backend Endpoints Used:

1. **Get Notifications**
   - `GET /push-notifications/:ownerId`
   - Fetches all notifications for a user

2. **Mark as Read**
   - `PATCH /push-notifications/:id/read`
   - Marks a single notification as read

3. **Withdrawal Operations** (trigger notifications):
   - `POST /wallet/withdrawals` - Create withdrawal (pending notification)
   - `POST /wallet/withdrawals/:id/process` - Complete withdrawal (completed notification)
   - `POST /wallet/withdrawals/:id/fail` - Fail withdrawal (failed notification)
   - `POST /wallet/withdrawals/:id/cancel` - Cancel withdrawal (canceled notification)

## User Experience Flow

1. **User creates withdrawal request** 
   - System sends "pending" notification
   - Notification appears with yellow indicator
   - Badge count increases on wallet page

2. **Admin processes withdrawal**
   - If successful: "completed" notification (green)
   - If failed: "failed" notification (red) with refund
   - User sees real-time update

3. **User cancels withdrawal**
   - "canceled" notification (orange)
   - Amount refunded to wallet
   - Notification confirms refund

4. **Notification Interaction**
   - Click bell icon to see all withdrawal notifications
   - Click notification to view details
   - Automatic mark as read
   - Badge count updates

## Testing Instructions

### Test Pending Notification:
```bash
# Create a withdrawal request via UI
# Check for "Withdrawal Request Created" notification
```

### Test Completed Notification (Admin):
```bash
POST /wallet/withdrawals/:withdrawalRequestId/process
{
  "transactionReference": "TXN123",
  "processedBy": "admin_id",
  "adminNotes": "Processed successfully"
}
```

### Test Failed Notification (Admin):
```bash
POST /wallet/withdrawals/:withdrawalRequestId/fail
{
  "failureReason": "Bank account verification failed",
  "failedBy": "admin_id",
  "adminNotes": "Invalid account details"
}
```

### Test Canceled Notification:
```bash
POST /wallet/withdrawals/:withdrawalRequestId/cancel
{
  "reason": "User requested cancellation"
}
```

## Benefits

1. **Real-time Updates**: Users stay informed about withdrawal status
2. **Transparency**: Clear communication about each stage
3. **Audit Trail**: All notifications stored with metadata
4. **User Trust**: Builds confidence with clear status updates
5. **Reduced Support**: Users don't need to contact support for status

## Future Enhancements

1. **Email Notifications**: Send email along with push notifications
2. **SMS Alerts**: Critical status updates via SMS
3. **Webhook Integration**: Allow external systems to subscribe
4. **Notification Preferences**: User settings for notification types
5. **Batch Operations**: Handle multiple withdrawals together
6. **Push to Mobile**: Integration with mobile push notification services

## Troubleshooting

### Notifications Not Appearing:
- Check user has permission to view notifications
- Verify ownerId is correctly set
- Check notification category filter

### Badge Count Wrong:
- Ensure notifications are marked as read
- Check filter for withdrawal_status category
- Verify unread flag is being updated

### Real-time Updates Not Working:
- Check WebSocket connection (if implemented)
- Verify auto-refresh interval (currently 30 seconds)
- Check API response format

## Security Considerations

1. **User Isolation**: Notifications only visible to owner
2. **Data Sanitization**: All user inputs sanitized
3. **Metadata Encryption**: Sensitive data should be encrypted
4. **Rate Limiting**: Prevent notification spam
5. **Audit Logging**: Track all notification events
