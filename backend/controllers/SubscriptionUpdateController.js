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

// console.log('Razorpay initialized with key_id:', razorpay.key_id);

/**
 * Controller to update an existing Razorpay subscription to a new plan
 */

const updateSubscriptionPlan = async (req, res) => {
  console.log('Request body:', req.body);
  const { tenantId, ownerId, razorpaySubscriptionId, newPlanId, newBillingCycle } = req.body;
  let planIdToUse;

  console.log('Received request to update subscriptionupadcontroller:', req.body);
    
  // Simple validation - essential fields
  if (!razorpaySubscriptionId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required parameter: razorpaySubscriptionId' 
    });
  }
  
  
  // If new plan ID is provided, look it up in the database
  if (newPlanId) {
    try {
      console.log(`Looking up Razorpay plan ID for ${newPlanId} with ${newBillingCycle} billing`);
      
      // Find the subscription plan in the database
      const SubscriptionPlan = require('../models/Subscriptionmodels');
      const plan = await SubscriptionPlan.findById(newPlanId).lean();
      
      if (!plan) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subscription plan not found in database' 
        });
      }
      // console.log("plan",plan);
      // console.log("annual",plan.razorpayPlanIds?.annual);
      // console.log("monthly",plan.razorpayPlanIds?.monthly);
      
      // Try to get the razorpayPlanId from the plan based on membership type
      if (plan.razorpayPlanIds && typeof plan.razorpayPlanIds === 'object') {
        if (newBillingCycle === 'annual' && plan.razorpayPlanIds?.annual) {
          planIdToUse = plan.razorpayPlanIds?.annual;
        } else if (newBillingCycle === 'monthly' && plan.razorpayPlanIds?.monthly) {
          planIdToUse = plan.razorpayPlanIds?.monthly;
        }
      }
      
      console.log(`Found plan ID from database: ${planIdToUse}`);
      
      if (!planIdToUse) {
        return res.status(400).json({ 
          success: false, 
          message: `No Razorpay plan ID found for ${newBillingCycle} billing cycle` 
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

    // Immediate upgrade path: cancel old, create new subscription, create order, update invoice
    try {
      // Ensure plan exists before proceeding
      if (!newPlan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
      }

      // 1) Determine pricing and final amount for invoice/order
      const selectedPricing = Array.isArray(newPlan.pricing) ? newPlan.pricing.find(p => p.billingCycle === newBillingCycle) : null;
      if (!selectedPricing) {
        return res.status(400).json({
          success: false,
          message: `No pricing configured for billing cycle: ${newBillingCycle}`
        });
      }
      const basePrice = Number(selectedPricing.price) || 0;
      const discount = Number(selectedPricing.discount) || 0;
      const discountType = selectedPricing.discountType || null;
      let finalPrice = basePrice;
      if (discount > 0) {
        if (discountType === 'percentage') {
          finalPrice = Math.max(0, basePrice - (basePrice * discount / 100));
        } else if (discountType === 'flat') {
          finalPrice = Math.max(0, basePrice - discount);
        }
      }

      // 2) Capture Razorpay customer and old references before cancellation (webhook may null it)
      const existingRpCustomerId = customerSubscription.razorpayCustomerId;
      const oldInvoiceId = customerSubscription.invoiceId;
      const oldRpSubscriptionId = customerSubscription.razorpaySubscriptionId;

      // 3) Cancel existing Razorpay subscription immediately
      try {
        await razorpay.subscriptions.cancel(razorpaySubscriptionId);
        console.log('Cancelled old Razorpay subscription (immediate):', razorpaySubscriptionId);
      } catch (cancelErr) {
        console.error('Error cancelling old Razorpay subscription:', cancelErr);
        return res.status(400).json({ success: false, message: 'Failed to cancel existing Razorpay subscription' });
      }

      // Best-effort: cancel previous invoice locally to prevent stale pending invoices
      try {
        if (oldInvoiceId) {
          const oldInvoice = await Invoice.findById(oldInvoiceId);
          if (oldInvoice) {
            oldInvoice.status = 'cancelled';
            await oldInvoice.save();
            console.log('Cancelled previous invoice:', oldInvoiceId);
          }
        }
      } catch (cancelInvErr) {
        console.error('Error marking previous invoice cancelled:', cancelInvErr);
      }

      // 4) Create new Razorpay subscription with new plan
      if (!existingRpCustomerId) {
        console.warn('No existing Razorpay customer ID found on subscription; new subscription may fail');
      }
      let newRpSubscription;
      try {
        newRpSubscription = await razorpay.subscriptions.create({
          plan_id: planIdToUse,
          customer_id: existingRpCustomerId,
          total_count: newBillingCycle === 'monthly' ? 12 : 12,
          quantity: 1,
          notes: {
            ownerId,
            tenantId: tenantId || '',
            planId: newPlanId || '',
            membershipType: newBillingCycle
          }
        });
        console.log('Created new Razorpay subscription for upgrade:', newRpSubscription.id);
      } catch (createErr) {
        console.error('Error creating new Razorpay subscription:', createErr);
        return res.status(500).json({ success: false, message: 'Failed to create new Razorpay subscription' });
      }

      // 5) Create Razorpay order for checkout authorization
      const orderAmount = Math.round(finalPrice * 100); // in paise
      let order;
      try {
        order = await razorpay.orders.create({
          amount: orderAmount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            subscriptionId: newRpSubscription.id,
            ownerId,
            tenantId: tenantId || '',
            planId: newPlanId || '',
            membershipType: newBillingCycle
          }
        });
        console.log('Created Razorpay order for new subscription authorization:', order.id);
      } catch (orderErr) {
        console.error('Error creating Razorpay order for authorization:', orderErr);
        return res.status(500).json({ success: false, message: 'Failed to create Razorpay order for authorization' });
      }

      // 6) Update local subscription record with new details
      try {
        customerSubscription.razorpaySubscriptionId = newRpSubscription.id;
        customerSubscription.razorpayCustomerId = existingRpCustomerId || customerSubscription.razorpayCustomerId;
        customerSubscription.subscriptionPlanId = newPlanId;
        customerSubscription.selectedBillingCycle = newBillingCycle;
        customerSubscription.price = finalPrice;
        customerSubscription.totalAmount = finalPrice;
        customerSubscription.status = 'created';
        customerSubscription.autoRenew = true;
        customerSubscription.planName = newPlan.name;
        customerSubscription.endDate = calculateEndDate(newBillingCycle);
        if (!customerSubscription.metadata) customerSubscription.metadata = {};
        customerSubscription.metadata.razorpayPlanId = planIdToUse;
        await customerSubscription.save();
        console.log('Updated local subscription with new Razorpay subscription ID');
      } catch (saveSubErr) {
        console.error('Error updating local subscription after upgrade:', saveSubErr);
        // Not fatal to payment flow; continue to attempt invoice creation
      }

      // 7) Create a pending invoice for the new subscription
      try {
        const lastInvoice = await Invoice.findOne({}).sort({ _id: -1 }).select('invoiceCode').lean();
        let nextNumber = 1;
        if (lastInvoice && lastInvoice.invoiceCode) {
          const match = lastInvoice.invoiceCode.match(/INV-(\d+)/);
          if (match) nextNumber = parseInt(match[1], 10) + 1;
        }
        const invoiceCode = `INV-${String(nextNumber).padStart(5, '0')}`;

        const newInvoice = new Invoice({
          tenantId: tenantId,
          ownerId: ownerId,
          customerSubscriptionId: customerSubscription._id,
          planName: newPlan.name || 'Updated Plan',
          membershipType: newBillingCycle,
          price: finalPrice,
          type: 'subscription',
          totalAmount: finalPrice,
          status: 'pending',
          startDate: new Date(),
          endDate: customerSubscription.endDate,
          lineItems: [{ description: `${newBillingCycle} Plan Upgrade`, amount: finalPrice }],
          invoiceCode: invoiceCode,
          outstandingAmount: finalPrice
        });

        await newInvoice.save();
        customerSubscription.invoiceId = newInvoice._id;
        await customerSubscription.save();
        console.log('Created invoice and linked to subscription');
      } catch (invErr) {
        console.error('Error creating invoice for upgraded subscription:', invErr);
        // Continue; invoice can be retried later
      }

      // 8) Update tenant limits for UX (bandwidth/users)
      try {
        const subscriptionPlanDoc = await SubscriptionPlan.findById(customerSubscription.subscriptionPlanId);
        const features = subscriptionPlanDoc?.features || [];
        const tenant = await Tenant.findById(customerSubscription.tenantId);
        if (tenant) {
          const bw = features.find(f => f.name === 'Bandwidth');
          const users = features.find(f => f.name === 'Users');
          tenant.status = 'active';
          if (bw) tenant.usersBandWidth = bw.limit;
          if (users) tenant.totalUsers = users.limit;
          await tenant.save();
        }
      } catch (tenantErr) {
        console.error('Error updating tenant post-upgrade:', tenantErr);
      }

      // 9) Respond with checkout fields for frontend
      return res.status(200).json({
        success: true,
        message: 'Subscription upgraded successfully. Authorize the new plan payment.',
        subscriptionId: newRpSubscription.id,
        planId: planIdToUse,
        authLink: newRpSubscription.short_url || '#',
        orderId: order.id,
        razorpayKeyId: razorpay.key_id
      });
    } catch (upgradeErr) {
      console.error('Immediate upgrade flow failed, falling back to legacy update flow:', upgradeErr);
      // Intentionally continue to legacy path below
    }

  } catch (err) {
    console.error('Error updating subscription:', err);
    return res.status(500).json({ success: false, message: 'Failed to update subscription' });
  }
};
      


module.exports = { updateSubscriptionPlan };
