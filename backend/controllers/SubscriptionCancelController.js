require('dotenv').config();
const Tenant = require('../models/Tenant');
const CustomerSubscription = require('../models/CustomerSubscriptionmodels');
const Invoice = require('../models/Invoicemodels');

// Initialize Razorpay
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Cancel a subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelSubscription = async (req, res) => {
  try {
    // Extract request data
    const { subscriptionId, razorpaySubscriptionId, ownerId } = req.body;
    
    if (!subscriptionId || !razorpaySubscriptionId || !ownerId) {
      return res.status(400).json({ message: 'Missing required subscription information' });
    }
    
    // Step 1: Cancel subscription in Razorpay
    try {
      await razorpay.subscriptions.cancel(razorpaySubscriptionId);
      console.log('Razorpay subscription cancelled in subscriptioncancelcontroller:', razorpaySubscriptionId);
    } catch (razorpayError) {
      console.error('Error cancelling Razorpay subscription:', razorpayError);
      return res.status(400).json({ message: 'Failed to cancel Razorpay subscription' });
    }
    
    // Step 2: Update local subscription status and related records
    let updatedSubscription = null;
    try {
      updatedSubscription = await CustomerSubscription.findById(subscriptionId);
      if (!updatedSubscription) {
        // Fallback: try by owner and RP subscription id
        updatedSubscription = await CustomerSubscription.findOne({ ownerId, razorpaySubscriptionId });
      }

      if (updatedSubscription) {
        updatedSubscription.status = 'cancelled';
        updatedSubscription.autoRenew = false;
        updatedSubscription.endDate = new Date();
        updatedSubscription.endReason = 'cancelled';
        await updatedSubscription.save();

        // Optionally mark any pending invoice as cancelled
        if (updatedSubscription.invoiceId) {
          try {
            const invoice = await Invoice.findById(updatedSubscription.invoiceId);
            if (invoice && invoice.status !== 'paid' && invoice.status !== 'cancelled') {
              invoice.status = 'cancelled';
              await invoice.save();
            }
          } catch (invErr) {
            console.warn('Failed to update related invoice status on cancel:', invErr?.message);
          }
        }
      }
    } catch (subErr) {
      console.error('Failed to update local subscription after RP cancel:', subErr);
      // Continue, as RP cancel succeeded
    }

    // Step 3: Update tenant status to cancelled (best effort)
    try {
      const tenant = await Tenant.findOne({ ownerId });
      if (tenant) {
        tenant.status = 'cancelled';
        await tenant.save();
      }
    } catch (tenantErr) {
      console.warn('Failed to update tenant status on cancel:', tenantErr?.message);
    }

    // Return success response with updated subscription (if available)
    return res.status(200).json({
      message: 'Subscription cancelled successfully',
      cancelled: true,
      subscription: updatedSubscription || null
    });
    
  } catch (error) {
    console.error('Error in subscription cancellation:', error);
    return res.status(500).json({ message: 'Error cancelling subscription', error: error.message });
  }
};

module.exports = {
  cancelSubscription
};
