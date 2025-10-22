# Payment Push Notifications Documentation

## Overview
The payment push notification system sends real-time notifications to users for all payment-related events in the UpInterview platform.

## Notification Types

### 1. Payment Success
- **Event**: When a payment is successfully processed
- **Trigger**: `verifyPayment()` in RazorpayController
- **Category**: `payment_success`
- **Data Included**:
  - Amount paid
  - Plan name
  - Billing cycle
  - Payment code

### 2. Payment Failed
- **Event**: When a payment fails
- **Trigger**: `handlePaymentFailed()` webhook handler
- **Category**: `payment_failed`
- **Data Included**:
  - Amount attempted
  - Failure reason
  - Plan name
  - Next retry date (if applicable)

### 3. Subscription Renewed/Charged
- **Event**: When a subscription is successfully renewed
- **Trigger**: `handleSubscriptionCharged()` webhook handler
- **Category**: `subscription_renewed`
- **Data Included**:
  - Amount charged
  - Plan name
  - Billing cycle
  - Next billing date
  - Receipt code

### 4. Subscription Cancelled
- **Event**: When a subscription is cancelled
- **Trigger**: `handleSubscriptionCancelled()` webhook handler
- **Category**: `subscription_cancelled`
- **Data Included**:
  - Plan name
  - End date
  - Cancellation reason

### 5. Subscription Halted
- **Event**: When a subscription is halted due to payment issues
- **Trigger**: `handleSubscriptionHalted()` webhook handler
- **Category**: `subscription_halted`
- **Data Included**:
  - Plan name
  - Halt reason
  - Next retry date

### 6. Wallet Top-up
- **Event**: When wallet is successfully topped up
- **Trigger**: `verifyPayment()` in WalletControllers
- **Category**: `wallet_topup`
- **Data Included**:
  - Amount added
  - New wallet balance
  - Wallet code
  - Invoice code

### 7. Payment Method Updated
- **Event**: When a new payment method is added
- **Trigger**: Card details processing in RazorpayController
- **Category**: `payment_method`
- **Data Included**:
  - Last 4 digits of card
  - Card brand
  - Default status

### 8. Invoice Generated
- **Event**: When a new invoice is generated
- **Category**: `invoice`
- **Data Included**:
  - Invoice code
  - Amount
  - Due date
  - Plan name

### 9. Payment Reminder
- **Event**: Reminder for upcoming payment
- **Category**: `payment_reminder`
- **Data Included**:
  - Amount due
  - Days until due
  - Plan name

### 10. Refund Processed
- **Event**: When a refund is initiated
- **Category**: `refund`
- **Data Included**:
  - Refund amount
  - Refund code
  - Original payment code
  - Reason

## Implementation Details

### Files Modified

1. **backend/controllers/PushNotificationControllers/pushNotificationPaymentController.js**
   - Central file containing all payment notification functions
   - Each function creates a specific type of notification

2. **backend/controllers/RazorpayController.js**
   - Added notifications for:
     - Payment verification success
     - Payment failures
     - Subscription charged events
     - Subscription cancelled events
     - Subscription halted events
     - Payment method updates

3. **backend/controllers/WalletControllers.js**
   - Added notifications for wallet top-ups
   - Integrated with withdrawal notifications (existing)

## Notification Schema

All payment notifications follow this structure:
```javascript
{
  ownerId: String,      // User ID
  tenantId: String,     // Organization ID
  title: String,        // Notification title with emoji
  message: String,      // Detailed message
  type: "payment",      // Always "payment" for these notifications
  category: String,     // Specific category (see list above)
  unread: Boolean,      // Default: true
  metadata: {           // Additional data specific to each type
    amount: Number,
    planName: String,
    // ... other fields
  },
  timestamp: Date       // Auto-generated
}
```

## Usage Example

```javascript
// Creating a payment success notification
await createPaymentSuccessNotification(ownerId, tenantId, {
  amount: 999,
  planName: 'Premium Plan',
  billingCycle: 'monthly',
  paymentCode: 'PMT-50001'
});
```

## Frontend Integration

The frontend can:
1. Filter notifications by `type: "payment"`
2. Use `category` to show specific icons/colors
3. Access detailed information from `metadata`
4. Mark notifications as read via API

## API Endpoints

- `GET /api/pushnotifications/:ownerId` - Get all notifications including payment ones
- `PUT /api/pushnotifications/:id/read` - Mark notification as read
- `PUT /api/pushnotifications/:ownerId/read-all` - Mark all as read
- `DELETE /api/pushnotifications/:ownerId/clear` - Clear all notifications

## Testing

To test payment notifications:
1. Make test payments in Razorpay test mode
2. Trigger webhook events from Razorpay dashboard
3. Check notifications in user's notification panel

## Error Handling

- All notification creation is wrapped in try-catch blocks
- Failures to create notifications don't affect payment processing
- Errors are logged but don't break the payment flow

## Future Enhancements

1. Add email notifications alongside push notifications
2. Add SMS notifications for critical payment events
3. Add notification preferences for users to opt-in/out
4. Add notification scheduling for reminders
5. Add notification grouping for multiple similar events
