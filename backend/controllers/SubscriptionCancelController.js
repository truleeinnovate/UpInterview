require('dotenv').config();

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
    const { subscriptionId, razorpaySubscriptionId } = req.body;
    
    if (!subscriptionId || !razorpaySubscriptionId) {
      return res.status(400).json({ message: 'Missing required subscription information' });
    }
    
    // Step 1: Cancel subscription in Razorpay
    try {
      await razorpay.subscriptions.cancel(razorpaySubscriptionId);
      console.log('Razorpay subscription cancelled:', razorpaySubscriptionId);
    } catch (razorpayError) {
      console.error('Error cancelling Razorpay subscription:', razorpayError);
      return res.status(400).json({ message: 'Failed to cancel Razorpay subscription' });
    }
    
    
    // Return success response
    return res.status(200).json({
      message: 'Subscription cancelled successfully',
      cancelled: true
    });
    
  } catch (error) {
    console.error('Error in subscription cancellation:', error);
    return res.status(500).json({ message: 'Error cancelling subscription', error: error.message });
  }
};

module.exports = {
  cancelSubscription
};
