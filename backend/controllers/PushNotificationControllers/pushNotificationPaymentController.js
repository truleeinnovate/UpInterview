const PushNotification = require('../../models/PushNotifications');

/**
 * Create payment success notification
 */
const createPaymentSuccessNotification = async (ownerId, tenantId, paymentDetails) => {
  try {
    const { amount, planName, billingCycle, paymentCode } = paymentDetails;
    
    const notification = await PushNotification.create({
      ownerId,
      tenantId,
      title: "Payment Successful 💳",
      message: `Your payment of ₹${amount} for ${planName || 'subscription'} (${billingCycle || 'plan'}) has been successfully processed.`,
      type: "payment",
      category: "payment_success",
      unread: true,
      metadata: {
        amount,
        planName: planName || 'Subscription',
        billingCycle: billingCycle || 'N/A',
        paymentCode: paymentCode || 'N/A',
        paymentDate: new Date(),
        status: 'success'
      }
    });

    console.log(`[PAYMENT NOTIFICATION] Success notification created for ${ownerId}:`, notification._id);
    return notification;
  } catch (error) {
    console.error('[PAYMENT NOTIFICATION] Error creating payment success notification:', error);
    return null;
  }
};

/**
 * Create payment failed notification
 */
const createPaymentFailedNotification = async (ownerId, tenantId, failureDetails) => {
  try {
    const { amount, reason, planName, nextRetryDate } = failureDetails;
    
    let message = `Your payment of ₹${amount || 'N/A'} for ${planName || 'subscription'} has failed.`;
    if (reason) {
      message += ` Reason: ${reason}.`;
    }
    if (nextRetryDate) {
      message += ` Next retry: ${new Date(nextRetryDate).toLocaleDateString()}.`;
    }
    
    const notification = await PushNotification.create({
      ownerId,
      tenantId,
      title: "Payment Failed ❌",
      message,
      type: "payment",
      category: "payment_failed",
      unread: true,
      metadata: {
        amount: amount || 0,
        planName: planName || 'Subscription',
        reason: reason || 'Unknown',
        nextRetryDate: nextRetryDate || null,
        failureDate: new Date(),
        status: 'failed'
      }
    });

    console.log(`[PAYMENT NOTIFICATION] Failed notification created for ${ownerId}:`, notification._id);
    return notification;
  } catch (error) {
    console.error('[PAYMENT NOTIFICATION] Error creating payment failed notification:', error);
    return null;
  }
};

/**
 * Create subscription charged/renewed notification
 */
const createSubscriptionChargedNotification = async (ownerId, tenantId, subscriptionDetails) => {
  try {
    const { amount, planName, billingCycle, nextBillingDate, receiptCode } = subscriptionDetails;
    
    const notification = await PushNotification.create({
      ownerId,
      tenantId,
      title: "Subscription Renewed ✅",
      message: `Your ${planName || 'subscription'} has been renewed for ₹${amount}. Next billing date: ${new Date(nextBillingDate).toLocaleDateString()}.`,
      type: "payment",
      category: "subscription_renewed",
      unread: true,
      metadata: {
        amount,
        planName: planName || 'Subscription',
        billingCycle: billingCycle || 'monthly',
        nextBillingDate,
        receiptCode: receiptCode || 'N/A',
        renewalDate: new Date(),
        status: 'success'
      }
    });

    console.log(`[PAYMENT NOTIFICATION] Subscription charged notification created for ${ownerId}:`, notification._id);
    return notification;
  } catch (error) {
    console.error('[PAYMENT NOTIFICATION] Error creating subscription charged notification:', error);
    return null;
  }
};

/**
 * Create subscription cancelled notification
 */
const createSubscriptionCancelledNotification = async (ownerId, tenantId, cancellationDetails) => {
  try {
    const { planName, endDate, reason } = cancellationDetails;
    
    const notification = await PushNotification.create({
      ownerId,
      tenantId,
      title: "Subscription Cancelled 🚫",
      message: `Your ${planName || 'subscription'} has been cancelled and will end on ${new Date(endDate).toLocaleDateString()}.`,
      type: "payment",
      category: "subscription_cancelled",
      unread: true,
      metadata: {
        planName: planName || 'Subscription',
        endDate,
        reason: reason || 'User initiated',
        cancellationDate: new Date(),
        status: 'cancelled'
      }
    });

    console.log(`[PAYMENT NOTIFICATION] Subscription cancelled notification created for ${ownerId}:`, notification._id);
    return notification;
  } catch (error) {
    console.error('[PAYMENT NOTIFICATION] Error creating subscription cancelled notification:', error);
    return null;
  }
};

/**
 * Create wallet top-up notification
 */
const createWalletTopupNotification = async (ownerId, tenantId, topupDetails) => {
  try {
    const { amount, walletCode, newBalance, invoiceCode } = topupDetails;
    
    const notification = await PushNotification.create({
      ownerId,
      tenantId,
      title: "Wallet Top-up Successful 💰",
      message: `₹${amount} has been added to your wallet. New balance: ₹${newBalance}.`,
      type: "payment",
      category: "wallet_topup",
      unread: true,
      metadata: {
        amount,
        walletCode: walletCode || 'N/A',
        previousBalance: newBalance - amount,
        newBalance,
        invoiceCode: invoiceCode || 'N/A',
        topupDate: new Date(),
        status: 'success'
      }
    });

    console.log(`[PAYMENT NOTIFICATION] Wallet top-up notification created for ${ownerId}:`, notification._id);
    return notification;
  } catch (error) {
    console.error('[PAYMENT NOTIFICATION] Error creating wallet top-up notification:', error);
    return null;
  }
};

/**
 * Create refund notification
 */
const createRefundNotification = async (ownerId, tenantId, refundDetails) => {
  try {
    const { amount, reason, refundCode, originalPaymentCode } = refundDetails;
    
    const notification = await PushNotification.create({
      ownerId,
      tenantId,
      title: "Refund Processed 💸",
      message: `A refund of ₹${amount} has been initiated. It will be credited to your account within 5-7 business days.`,
      type: "payment",
      category: "refund",
      unread: true,
      metadata: {
        amount,
        reason: reason || 'N/A',
        refundCode: refundCode || 'N/A',
        originalPaymentCode: originalPaymentCode || 'N/A',
        refundDate: new Date(),
        status: 'processing'
      }
    });

    console.log(`[PAYMENT NOTIFICATION] Refund notification created for ${ownerId}:`, notification._id);
    return notification;
  } catch (error) {
    console.error('[PAYMENT NOTIFICATION] Error creating refund notification:', error);
    return null;
  }
};

/**
 * Create subscription halted notification
 */
const createSubscriptionHaltedNotification = async (ownerId, tenantId, haltDetails) => {
  try {
    const { planName, reason, nextRetryDate } = haltDetails;
    
    let message = `Your ${planName || 'subscription'} has been halted due to payment issues.`;
    if (reason) {
      message += ` Reason: ${reason}.`;
    }
    message += ` Please update your payment method to continue.`;
    
    const notification = await PushNotification.create({
      ownerId,
      tenantId,
      title: "Subscription Halted ⚠️",
      message,
      type: "payment",
      category: "subscription_halted",
      unread: true,
      metadata: {
        planName: planName || 'Subscription',
        reason: reason || 'Payment failure',
        nextRetryDate: nextRetryDate || null,
        haltDate: new Date(),
        status: 'halted'
      }
    });

    console.log(`[PAYMENT NOTIFICATION] Subscription halted notification created for ${ownerId}:`, notification._id);
    return notification;
  } catch (error) {
    console.error('[PAYMENT NOTIFICATION] Error creating subscription halted notification:', error);
    return null;
  }
};

/**
 * Create payment method updated notification
 */
const createPaymentMethodUpdatedNotification = async (ownerId, tenantId, paymentMethodDetails) => {
  try {
    const { cardLast4, cardBrand, isDefault } = paymentMethodDetails;
    
    let message = `Payment method ending in ${cardLast4 || 'XXXX'} (${cardBrand || 'Card'}) has been added`;
    if (isDefault) {
      message += ' and set as default';
    }
    message += '.';
    
    const notification = await PushNotification.create({
      ownerId,
      tenantId,
      title: "Payment Method Updated 💳",
      message,
      type: "payment",
      category: "payment_method",
      unread: true,
      metadata: {
        cardLast4: cardLast4 || 'XXXX',
        cardBrand: cardBrand || 'Unknown',
        isDefault: isDefault || false,
        updateDate: new Date(),
        status: 'updated'
      }
    });

    console.log(`[PAYMENT NOTIFICATION] Payment method notification created for ${ownerId}:`, notification._id);
    return notification;
  } catch (error) {
    console.error('[PAYMENT NOTIFICATION] Error creating payment method notification:', error);
    return null;
  }
};

/**
 * Create invoice generated notification
 */
const createInvoiceGeneratedNotification = async (ownerId, tenantId, invoiceDetails) => {
  try {
    const { invoiceCode, amount, planName, dueDate } = invoiceDetails;
    
    const notification = await PushNotification.create({
      ownerId,
      tenantId,
      title: "Invoice Generated 📄",
      message: `Invoice ${invoiceCode} for ₹${amount} has been generated for ${planName || 'your subscription'}. Due date: ${new Date(dueDate).toLocaleDateString()}.`,
      type: "payment",
      category: "invoice",
      unread: true,
      metadata: {
        invoiceCode: invoiceCode || 'N/A',
        amount,
        planName: planName || 'Subscription',
        dueDate,
        generatedDate: new Date(),
        status: 'pending'
      }
    });

    console.log(`[PAYMENT NOTIFICATION] Invoice notification created for ${ownerId}:`, notification._id);
    return notification;
  } catch (error) {
    console.error('[PAYMENT NOTIFICATION] Error creating invoice notification:', error);
    return null;
  }
};

/**
 * Create payment reminder notification
 */
const createPaymentReminderNotification = async (ownerId, tenantId, reminderDetails) => {
  try {
    const { amount, planName, dueDate, daysUntilDue } = reminderDetails;
    
    let message = `Payment of ₹${amount} for ${planName || 'your subscription'} is due `;
    if (daysUntilDue === 0) {
      message += 'today';
    } else if (daysUntilDue === 1) {
      message += 'tomorrow';
    } else {
      message += `in ${daysUntilDue} days`;
    }
    message += `. Please ensure sufficient funds or update payment method.`;
    
    const notification = await PushNotification.create({
      ownerId,
      tenantId,
      title: "Payment Reminder 🔔",
      message,
      type: "payment",
      category: "payment_reminder",
      unread: true,
      metadata: {
        amount,
        planName: planName || 'Subscription',
        dueDate,
        daysUntilDue,
        reminderDate: new Date(),
        status: 'pending'
      }
    });

    console.log(`[PAYMENT NOTIFICATION] Payment reminder notification created for ${ownerId}:`, notification._id);
    return notification;
  } catch (error) {
    console.error('[PAYMENT NOTIFICATION] Error creating payment reminder notification:', error);
    return null;
  }
};

module.exports = {
  createPaymentSuccessNotification,
  createPaymentFailedNotification,
  createSubscriptionChargedNotification,
  createSubscriptionCancelledNotification,
  createWalletTopupNotification,
  createRefundNotification,
  createSubscriptionHaltedNotification,
  createPaymentMethodUpdatedNotification,
  createInvoiceGeneratedNotification,
  createPaymentReminderNotification
};
