const CustomerSubscription = require('../models/CustomerSubscriptionmodels.js');
const SubscriptionPlan = require('../models/Subscriptionmodels.js');
const Invoice = require('../models/Invoicemodels.js');
const Razorpay = require('razorpay');
const { calculateEndDate } = require('./CustomerSubscriptionInvoiceContollers.js');
const Tenant = require('../models/Tenant');

// Initialize Razorpay with the same keys used in RazorpayController.js
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET // Note this is KEY_SECRET not SECRET_KEY
});

console.log('Razorpay initialized with key_id:', razorpay.key_id);

/**
 * Controller to update an existing Razorpay subscription to a new plan
 */

const updateSubscriptionPlan = async (req, res) => {
  console.log('Request body:', req.body);
  const { tenantId, ownerId, userId, razorpaySubscriptionId, newPlanId, membershipType, price, totalAmount, razorpayPlanId } = req.body;

  console.log('Received request to update subscriptionupadcontroller:', req.body);
    
  // Simple validation - essential fields
  if (!razorpaySubscriptionId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required parameter: razorpaySubscriptionId' 
    });
  }
  
  // First use razorpayPlanId from frontend if available
  let planIdToUse = razorpayPlanId;
  console.log('Using razorpayPlanId from frontend:', planIdToUse);
  
  // If no plan ID was provided by the frontend, look it up in the database
  if (!planIdToUse) {
    try {
      console.log(`Looking up Razorpay plan ID for ${newPlanId} with ${membershipType} billing`);
      
      // Find the subscription plan in the database
      const SubscriptionPlan = require('../models/Subscriptionmodels');
      const plan = await SubscriptionPlan.findById(newPlanId);
      
      if (!plan) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subscription plan not found in database' 
        });
      }
      
      // Try to get the razorpayPlanId from the plan based on membership type
      if (plan.razorpayPlanIds && typeof plan.razorpayPlanIds === 'object') {
        if (membershipType === 'annual' && plan.razorpayPlanIds.annual) {
          planIdToUse = plan.razorpayPlanIds.annual;
        } else if (membershipType === 'monthly' && plan.razorpayPlanIds.monthly) {
          planIdToUse = plan.razorpayPlanIds.monthly;
        }
      }
      
      console.log(`Found plan ID from database: ${planIdToUse}`);
      
      if (!planIdToUse) {
        return res.status(400).json({ 
          success: false, 
          message: `No Razorpay plan ID found for ${membershipType} billing cycle` 
        });
      }
    } catch (error) {
      console.error('Error finding Razorpay plan ID:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error finding Razorpay plan ID', 
        error: error.message 
      });
    }
  }
  
  // Verify the plan ID with Razorpay
  try {
    const planDetails = await razorpay.plans.fetch(planIdToUse);
    console.log('Verified plan details with Razorpay:', {
      id: planDetails.id,
      period: planDetails.period
    });
  } catch (error) {
    console.error('Error verifying plan with Razorpay:', error);
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid Razorpay plan ID', 
      error: error.message 
    });
  }

  try {
    // Find the customer subscription
    const customerSubscription = await CustomerSubscription.findOne({ razorpaySubscriptionId });
    
    if (!customerSubscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    
    // Find the new plan
    const newPlan = await SubscriptionPlan.findById(newPlanId);
    
    if (!newPlan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    console.log('Using Razorpay Plan ID directly from frontend:', razorpayPlanId);

    // Make the Razorpay API call
    try {
      console.log(`Making Razorpay API call to update subscription ${razorpaySubscriptionId} with plan ID ${planIdToUse}`);
      
      // Get the current subscription details from Razorpay to check its period
      const currentSubscription = await razorpay.subscriptions.fetch(razorpaySubscriptionId);
      console.log('Current subscription details:', {
        id: currentSubscription.id,
        plan_id: currentSubscription.plan_id,
        current_period: currentSubscription.period
      });
      
      // Get the new plan details to compare periods
      const newPlanDetails = await razorpay.plans.fetch(planIdToUse);
      console.log('New plan details:', {
        id: newPlanDetails.id,
        period: newPlanDetails.period
      });
      
      // Check if we're changing between different periods (monthly/yearly)
      const isDifferentPeriod = currentSubscription.period !== newPlanDetails.period;
      
      // Prepare parameters for the update call
      const updateParams = {
        plan_id: planIdToUse,
        schedule_change_at: 'cycle_end'
      };
      
      // If changing between different periods, add the remaining_count parameter
      if (isDifferentPeriod) {
        console.log('Changing between different periods, adding remaining_count');
        // Set remaining_count based on the target membership type
        if (membershipType === 'annual') {
          updateParams.remaining_count = 12; // 12 months for annual plan
          console.log('Setting remaining_count to 1 for annual plan');
        } else {
          updateParams.remaining_count = 12; // 1 month for monthly plan
          console.log('Setting remaining_count to 1 for monthly plan');
        }
      }
      
      console.log('Update parameters:', updateParams);

      // Make the API call with the appropriate parameters
      const razorpayResponse = await razorpay.subscriptions.update(
        razorpaySubscriptionId,
        updateParams
      );
      
      console.log('Razorpay API success - updated subscription:', razorpayResponse.id);
      
      // Update subscription in our database with complete information
      customerSubscription.subscriptionPlanId = newPlanId;
      customerSubscription.membershipType = membershipType;
      customerSubscription.selectedBillingCycle = membershipType; // Ensure this is set for webhook processing
      customerSubscription.price = price;
      customerSubscription.totalAmount = totalAmount;
      
      // Save the razorpayPlanId for reference
      if (!customerSubscription.metadata) {
        customerSubscription.metadata = {};
      }
      customerSubscription.metadata.razorpayPlanId = planIdToUse;
      customerSubscription.planName = newPlan.planName;
      // Set the end date based on membership type
      customerSubscription.endDate = calculateEndDate(membershipType);
      
      await customerSubscription.save();
      console.log('Updated customer subscription with new plan');
      
      // Generate invoice code
        const lastInvoice = await Invoice.findOne({})
          .sort({ _id: -1 })
          .select('invoiceCode')
          .lean();
        let nextNumber = 1;
        if (lastInvoice && lastInvoice.invoiceCode) {
          const match = lastInvoice.invoiceCode.match(/INV-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
          }
        }
        const invoiceCode = `INV-${String(nextNumber).padStart(5, '0')}`;
      // Create invoice with all required fields
      const newInvoice = new Invoice({
        tenantId: tenantId,
        ownerId: ownerId,
        customerSubscriptionId: customerSubscription._id,
        planName: newPlan.planName || 'Updated Plan',
        membershipType: membershipType,
        price: price,
        type: 'subscription',  // Required field
        totalAmount: totalAmount,  // Required field
        status: 'pending',
        startDate: new Date(),
        endDate: customerSubscription.endDate,
        lineItems: { description: `${membershipType} Plan Update`, amount: price },
        invoiceCode:invoiceCode,
        outstandingAmount: price
      });
      
      // Save invoice with error handling
      try {
        await newInvoice.save();
        console.log('Created new invoice:', newInvoice._id);
        
        // Update subscription with invoice reference
        customerSubscription.invoiceId = newInvoice._id;
        await customerSubscription.save();
        console.log('Updated subscription with invoice ID');
        
        
        // Update the tenant record
        const subscriptionPlan = await SubscriptionPlan.findById(customerSubscription.subscriptionPlanId);
        
        const features = subscriptionPlan.features;

        if (res.status === 200 || res.status === 201){
          const tenant = await Tenant.findById(customerSubscription.tenantId);
          if(tenant){
            tenant.status = 'active';
            tenant.usersBandWidth = features.find(feature => feature.name === 'Bandwidth').limit;
            tenant.totalUsers = features.find(feature => feature.name === 'Users').limit;
            await tenant.save();
        }
      }

        
        // Success response
        return res.status(200).json({
          success: true,
          message: 'Subscription plan updated successfully',
          subscriptionId: razorpaySubscriptionId,
          planId: planIdToUse
        });
        
      } catch (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        return res.status(400).json({
          success: false,
          message: 'Error creating invoice for subscription update',
          error: invoiceError.message
        });
      }
    } catch (error) {
      // Detailed Razorpay API error handling
      console.error('Razorpay API error:', error);
      // Extract useful error information from Razorpay
      let errorMessage = 'Failed to update subscription';
      if (error.error && error.error.description) {
        errorMessage = error.error.description;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage,
        error: error.message || 'Unknown error'
      });
    }
  } catch (razorpayError) {
    console.error('Error updating Razorpay subscription:', razorpayError);
    return res.status(400).json({
      success: false,
      message: 'Error updating subscription in Razorpay',
      error: razorpayError.message
    });
  }
};

module.exports = { updateSubscriptionPlan };
