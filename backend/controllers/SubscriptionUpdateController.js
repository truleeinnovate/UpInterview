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
 * Controller to update a subscription plan.
 * Handles both free (price 0) and paid plans.
 * - Free plans: skip all Razorpay calls
 * - Paid plans without existing Razorpay subscription: create pending invoice and instruct frontend to proceed to payment.
 * - Paid plans with an existing Razorpay subscription: cancel old RP sub, create new RP sub + order, update local records.
 */

const updateSubscriptionPlan = async (req, res) => {
  console.log('Request body:', req.body);
  const { tenantId, ownerId, subscriptionId, razorpaySubscriptionId, newPlanId, newBillingCycle } = req.body;

  console.log('Received request to update subscriptionupadcontroller:', req.body);

  try {
    // 1) Load new plan
    const plan = await SubscriptionPlan.findById(newPlanId).lean();
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found in database' });
    }

    // 2) Determine pricing for selected cycle
    const selectedPricing = Array.isArray(plan.pricing) ? plan.pricing.find(p => p.billingCycle === newBillingCycle) : null;
    if (!selectedPricing) {
      return res.status(400).json({ success: false, message: `No pricing configured for billing cycle: ${newBillingCycle}` });
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

    // 3) Determine Razorpay plan ID only for paid plans
    let planIdToUse = null;
    if (finalPrice > 0 && plan.razorpayPlanIds && typeof plan.razorpayPlanIds === 'object') {
      if (newBillingCycle === 'annual' && plan.razorpayPlanIds?.annual) {
        planIdToUse = plan.razorpayPlanIds.annual;
      } else if (newBillingCycle === 'monthly' && plan.razorpayPlanIds?.monthly) {
        planIdToUse = plan.razorpayPlanIds.monthly;
      }
    }

    // 4) Locate subscription record
    let customerSubscription = null;
    if (razorpaySubscriptionId) {
      customerSubscription = await CustomerSubscription.findOne({ razorpaySubscriptionId });
    }
    if (!customerSubscription && subscriptionId) {
      customerSubscription = await CustomerSubscription.findById(subscriptionId);
    }
    if (!customerSubscription && ownerId) {
      customerSubscription = await CustomerSubscription.findOne({ ownerId }).sort({ _id: -1 });
    }
    if (!customerSubscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // 5) Free plan path (price = 0): skip all Razorpay calls
    if (finalPrice === 0) {
      // If there is an existing Razorpay subscription, best-effort cancel
      if (customerSubscription.razorpaySubscriptionId) {
        try {
          await razorpay.subscriptions.cancel(customerSubscription.razorpaySubscriptionId);
          console.log('Cancelled old Razorpay subscription (moving to free):', customerSubscription.razorpaySubscriptionId);
        } catch (cancelErr) {
          console.warn('Failed to cancel existing Razorpay subscription while moving to free plan:', cancelErr?.message);
        }
      }

      // Cancel previous pending invoice if any
      try {
        if (customerSubscription.invoiceId) {
          const oldInvoice = await Invoice.findById(customerSubscription.invoiceId);
          if (oldInvoice && oldInvoice.status !== 'paid' && oldInvoice.status !== 'cancelled') {
            oldInvoice.status = 'cancelled';
            await oldInvoice.save();
          }
        }
      } catch (invErr) {
        console.warn('Failed to cancel previous invoice (free plan switch):', invErr?.message);
      }

      // Update local subscription
      customerSubscription.subscriptionPlanId = newPlanId;
      customerSubscription.selectedBillingCycle = newBillingCycle;
      customerSubscription.price = 0;
      customerSubscription.discount = 0;
      customerSubscription.totalAmount = 0;
      customerSubscription.status = 'active';
      customerSubscription.autoRenew = false;
      customerSubscription.planName = plan.name;
      customerSubscription.razorpaySubscriptionId = undefined;
      customerSubscription.razorpayPaymentId = undefined;
      customerSubscription.lastPaymentId = undefined;
      customerSubscription.endDate = calculateEndDate(newBillingCycle);

      // Create zero-value paid invoice for bookkeeping
      try {
        const lastInvoice = await Invoice.findOne({}).sort({ _id: -1 }).select('invoiceCode').lean();
        let nextNumber = 1;
        if (lastInvoice && lastInvoice.invoiceCode) {
          const match = lastInvoice.invoiceCode.match(/INVC-(\d+)/);
          if (match) nextNumber = parseInt(match[1], 10) + 1;
        }
        const invoiceCode = `INVC-${String(nextNumber).padStart(5, '0')}`;

        const newInvoice = new Invoice({
          tenantId: tenantId || customerSubscription.tenantId,
          ownerId: ownerId || customerSubscription.ownerId,
          planId: newPlanId,
          planName: plan.name || 'Free Plan',
          type: 'subscription',
          price: 0,
          discount: 0,
          totalAmount: 0,
          amountPaid: 0,
          outstandingAmount: 0,
          status: 'paid',
          startDate: new Date(),
          endDate: customerSubscription.endDate,
          lineItems: [{ description: `${newBillingCycle} Plan (Free)`, amount: 0 }],
          invoiceCode
        });
        await newInvoice.save();
        customerSubscription.invoiceId = newInvoice._id;
      } catch (freeInvErr) {
        console.warn('Failed to create invoice for free plan:', freeInvErr?.message);
      }

      await customerSubscription.save();

      // Update tenant UX limits
      // try {
      //   const features = plan?.features || [];
      //   const tenant = await Tenant.findById(customerSubscription.tenantId);
      //   if (tenant) {
      //     const bw = features.find(f => f.name === 'Bandwidth');
      //     const users = features.find(f => f.name === 'Users');
      //     tenant.status = 'active';
      //     if (bw) tenant.usersBandWidth = bw.limit;
      //     if (users) tenant.totalUsers = users.limit;
      //     await tenant.save();
      //   }
      // } catch (tenantErr) {
      //   console.warn('Failed to update tenant on free plan switch:', tenantErr?.message);
      // }

      return res.status(200).json({
        success: true,
        message: 'Subscription updated to free plan',
        requiresPayment: false,
        invoiceId: customerSubscription.invoiceId || null
      });
    }

    // 6) Paid plan path
    if (!planIdToUse) {
      return res.status(400).json({ success: false, message: `No Razorpay plan ID found for ${newBillingCycle} billing cycle` });
    }

    // If no existing Razorpay subscription (e.g., upgrading from free), create a pending invoice and instruct checkout
    if (!customerSubscription.razorpaySubscriptionId) {
      let invoiceId = null;
      try {
        const lastInvoice = await Invoice.findOne({}).sort({ _id: -1 }).select('invoiceCode').lean();
        let nextNumber = 1;
        if (lastInvoice && lastInvoice.invoiceCode) {
          const match = lastInvoice.invoiceCode.match(/INVC-(\d+)/);
          if (match) nextNumber = parseInt(match[1], 10) + 1;
        }
        const invoiceCode = `INVC-${String(nextNumber).padStart(5, '0')}`;

        const newInvoice = new Invoice({
          tenantId: tenantId || customerSubscription.tenantId,
          ownerId: ownerId || customerSubscription.ownerId,
          planId: newPlanId,
          planName: plan.name || 'Updated Plan',
          type: 'subscription',
          price: basePrice,
          discount: basePrice - finalPrice,
          totalAmount: finalPrice,
          amountPaid: 0,
          outstandingAmount: finalPrice,
          status: 'pending',
          startDate: new Date(),
          endDate: null,
          lineItems: [{ description: `${newBillingCycle} Plan`, amount: finalPrice }],
          invoiceCode
        });
        await newInvoice.save();
        invoiceId = newInvoice._id;
      } catch (invErr) {
        console.error('Error creating invoice for paid upgrade (no existing RP sub):', invErr);
      }

      // Update local subscription stub
      try {
        customerSubscription.subscriptionPlanId = newPlanId;
        customerSubscription.selectedBillingCycle = newBillingCycle;
        customerSubscription.price = finalPrice;
        customerSubscription.totalAmount = finalPrice;
        customerSubscription.status = 'created';
        customerSubscription.autoRenew = true;
        customerSubscription.planName = plan.name;
        customerSubscription.endDate = calculateEndDate(newBillingCycle);
        if (invoiceId) customerSubscription.invoiceId = invoiceId;
        if (!customerSubscription.metadata) customerSubscription.metadata = {};
        customerSubscription.metadata.razorpayPlanId = planIdToUse;
        await customerSubscription.save();
      } catch (saveErr) {
        console.error('Error updating local subscription for paid upgrade (no RP sub):', saveErr);
      }

      return res.status(200).json({
        success: true,
        message: 'Proceed to payment to activate the new plan',
        requiresPayment: true,
        invoiceId,
        planId: planIdToUse,
        razorpayKeyId: razorpay.key_id
      });
    }

    // Existing Razorpay subscription: verify plan, cancel old, create new, create order
    try {
      const planDetails = await razorpay.plans.fetch(planIdToUse);
      console.log('Verified plan details with Razorpay:', { id: planDetails.id, period: planDetails.period });
    } catch (error) {
      console.error('Error verifying plan with Razorpay:', error);
      return res.status(400).json({ success: false, message: 'Invalid Razorpay plan ID', error: error.message });
    }

    const existingRpCustomerId = customerSubscription.razorpayCustomerId;
    const oldInvoiceId = customerSubscription.invoiceId;

    try {
      await razorpay.subscriptions.cancel(customerSubscription.razorpaySubscriptionId);
      console.log('Cancelled old Razorpay subscription (immediate):', customerSubscription.razorpaySubscriptionId);
    } catch (cancelErr) {
      console.error('Error cancelling old Razorpay subscription:', cancelErr);
      return res.status(400).json({ success: false, message: 'Failed to cancel existing Razorpay subscription' });
    }

    try {
      if (oldInvoiceId) {
        const oldInvoice = await Invoice.findById(oldInvoiceId);
        if (oldInvoice) {
          oldInvoice.status = 'cancelled';
          await oldInvoice.save();
        }
      }
    } catch (cancelInvErr) {
      console.error('Error marking previous invoice cancelled:', cancelInvErr);
    }

    let newRpSubscription;
    try {
      newRpSubscription = await razorpay.subscriptions.create({
        plan_id: planIdToUse,
        customer_id: existingRpCustomerId,
        total_count: newBillingCycle === 'monthly' ? 12 : 12,
        quantity: 1,
        notes: { ownerId, tenantId: tenantId || '', planId: newPlanId || '', membershipType: newBillingCycle }
      });
      console.log('Created new Razorpay subscription for upgrade:', newRpSubscription.id);
    } catch (createErr) {
      console.error('Error creating new Razorpay subscription:', createErr);
      return res.status(500).json({ success: false, message: 'Failed to create new Razorpay subscription' });
    }

    const orderAmount = Math.round(finalPrice * 100); // in paise
    let order;
    try {
      order = await razorpay.orders.create({
        amount: orderAmount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: { subscriptionId: newRpSubscription.id, ownerId, tenantId: tenantId || '', planId: newPlanId || '', membershipType: newBillingCycle }
      });
      console.log('Created Razorpay order for new subscription authorization:', order.id);
    } catch (orderErr) {
      console.error('Error creating Razorpay order for authorization:', orderErr);
      return res.status(500).json({ success: false, message: 'Failed to create Razorpay order for authorization' });
    }

    try {
      customerSubscription.razorpaySubscriptionId = newRpSubscription.id;
      customerSubscription.razorpayCustomerId = existingRpCustomerId || customerSubscription.razorpayCustomerId;
      customerSubscription.subscriptionPlanId = newPlanId;
      customerSubscription.selectedBillingCycle = newBillingCycle;
      customerSubscription.price = finalPrice;
      customerSubscription.totalAmount = finalPrice;
      customerSubscription.status = 'created';
      customerSubscription.autoRenew = true;
      customerSubscription.planName = plan.name;
      customerSubscription.endDate = calculateEndDate(newBillingCycle);
      if (!customerSubscription.metadata) customerSubscription.metadata = {};
      customerSubscription.metadata.razorpayPlanId = planIdToUse;
      await customerSubscription.save();
      console.log('Updated local subscription with new Razorpay subscription ID');
    } catch (saveSubErr) {
      console.error('Error updating local subscription after upgrade:', saveSubErr);
    }

    try {
      const lastInvoice = await Invoice.findOne({}).sort({ _id: -1 }).select('invoiceCode').lean();
      let nextNumber = 1;
      if (lastInvoice && lastInvoice.invoiceCode) {
        const match = lastInvoice.invoiceCode.match(/INVC-(\d+)/);
        if (match) nextNumber = parseInt(match[1], 10) + 1;
      }
      const invoiceCode = `INVC-${String(nextNumber).padStart(5, '0')}`;

      const newInvoice = new Invoice({
        tenantId: tenantId,
        ownerId: ownerId,
        planId: newPlanId,
        planName: plan.name || 'Updated Plan',
        type: 'subscription',
        price: basePrice,
        discount: basePrice - finalPrice,
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
    }

    // Update tenant limits for UX (bandwidth/users)
    // try {
    //   const features = plan?.features || [];
    //   const tenant = await Tenant.findById(customerSubscription.tenantId);
    //   if (tenant) {
    //     const bw = features.find(f => f.name === 'Bandwidth');
    //     const users = features.find(f => f.name === 'Users');
    //     tenant.status = 'active';
    //     if (bw) tenant.usersBandWidth = bw.limit;
    //     if (users) tenant.totalUsers = users.limit;
    //     await tenant.save();
    //   }
    // } catch (tenantErr) {
    //   console.error('Error updating tenant post-upgrade:', tenantErr);
    // }

    return res.status(200).json({
      success: true,
      message: 'Subscription upgraded successfully. Authorize the new plan payment.',
      subscriptionId: customerSubscription.razorpaySubscriptionId,
      planId: planIdToUse,
      authLink: '#',
      orderId: order.id,
      razorpayKeyId: razorpay.key_id
    });
  } catch (err) {
    console.error('Error updating subscription:', err);
    return res.status(500).json({ success: false, message: 'Failed to update subscription' });
  }
};


module.exports = { updateSubscriptionPlan };
