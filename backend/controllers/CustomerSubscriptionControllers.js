
const SubscriptionPlan = require('../models/Subscriptionmodels.js');
const CustomerSubscription = require('../models/CustomerSubscriptionmodels.js');
const Invoicemodels = require('../models/Invoicemodels.js');
const Wallet = require('../models/WalletTopup.js');
const { createInvoice, createSubscriptionRecord, createReceipt, calculateEndDate } = require('./CustomerSubscriptionInvoiceContollers.js');


// Function to handle subscription creation
const createSubscriptionControllers = async (req, res) => {
  try {
    const { planDetails, userDetails, status, totalAmount } = req.body;

    if (!planDetails || !userDetails || !status) {
      return res.status(400).json({ message: 'Missing required details cretateSubscriptionControllers.' });
    }
    console.log("planDetails ----", planDetails);
    console.log("userDetails ----", userDetails);
    console.log("status create----", status);
    console.log("totalAmount ----", totalAmount);
   

    const { subscriptionPlanId } = planDetails;

    const numericTotalAmount = Number(totalAmount);
    if (isNaN(numericTotalAmount)) {
      return res.status(400).json({ message: 'Total amount must be a valid number.' });
    }

    const plan = await SubscriptionPlan.findById(subscriptionPlanId);
    // const plan = await SubscriptionPlan.findById({ _id: subscriptionPlanId });

    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found.' });
    }

    // Debug logging to verify correct plan is found
    // console.log("Found plan details:", {
    //   id: plan._id,
    //   name: plan.name,
    //   subscriptionPlanId: subscriptionPlanId
    // });

    let wallet = await Wallet.findOne({ ownerId: userDetails.ownerId });

    if (!wallet) {
        // ✅ Create a new Wallet only if it doesn't exist
        wallet = new Wallet({
            tenantId: userDetails.tenantId,
            ownerId: userDetails.ownerId,
            balance: 0, // Initial balance
            transactions: [] // Empty transactions
        });
    
        await wallet.save(); // Save the new wallet to the database
    } else {
        console.log("Wallet already exists:", wallet);
    }
    

    const pricing = parseInt(userDetails.membershipType === 'monthly' ? planDetails.monthlyPrice : planDetails.annualPrice) || 0;
    const discount = parseInt(userDetails.membershipType === 'monthly' ? planDetails.monthDiscount : planDetails.annualDiscount) || 0;


    // Ensure pricing and discount result in a valid total amount
    const calculatedTotalAmount = Math.max(pricing - discount, 0);


    const existingSubscription = await CustomerSubscription.findOne({ ownerId: userDetails.ownerId });

    if (existingSubscription) {
      // Update subscription details
      existingSubscription.subscriptionPlanId = subscriptionPlanId;
      existingSubscription.selectedBillingCycle = userDetails.membershipType;
      existingSubscription.price = pricing;
      existingSubscription.discount = discount;
      existingSubscription.startDate = new Date();
      existingSubscription.totalAmount = calculatedTotalAmount;
      existingSubscription.endDate = null;
      existingSubscription.features = [];
      //existingSubscription.razorpayCustomerId = null;
      //existingSubscription.razorpaySubscriptionId = null;
      existingSubscription.receiptId = null;
      existingSubscription.nextBillingDate = null;
      
      
      // Use the provided status instead of hardcoding to 'active'
      // This allows flexibility in subscription status management
      existingSubscription.status = status;
      await existingSubscription.save();

      // const plan = await SubscriptionPlan.findById(subscriptionPlanId);
      const existingInvoice = await Invoicemodels.findOne({ ownerId: userDetails.ownerId });
      if (existingInvoice) {
        existingInvoice.subscriptionId = subscriptionPlanId;
        existingInvoice.planName = plan.name || "Unknown Plan";  // Update plan name to match the current plan
        existingInvoice.totalAmount = calculatedTotalAmount;
        existingInvoice.startDate = new Date();
        existingInvoice.status = "pending",
          existingInvoice.lineItems = {
            description: `${userDetails.membershipType} - Updated Plan`,
            amount: calculatedTotalAmount,
          };
        await existingInvoice.save();
        //console.log("Updated existing invoice with plan name:", existingInvoice.planName);
      }

      return res.status(200).json({
        message: 'Subscription and invoice successfully updated.',
        subscription: existingSubscription,
        invoiceId: existingInvoice._id
      });
    }

    // Accept 'pending', 'created', and 'active' statuses for new subscriptions
    if (status === "pending" || status === "created" || status === "active" || (userDetails.userType === "individual" && (userDetails.membershipType === "monthly" || userDetails.membershipType === "annual"))) {
      console.log(`Processing subscription with status: ${status}`);

      // For active status (free plans), set invoice status to paid
      const invoiceStatus = status === "active" ? "paid" : status;
      
      // Use plan.name directly since planName field doesn't exist in SubscriptionPlan model
      const planNameForInvoice = plan.name || "Unknown Plan";
      //console.log("Creating invoice with plan name:", planNameForInvoice);

      const invoice = await createInvoice(
        userDetails.tenantId,
        userDetails.ownerId,
        planNameForInvoice,
        planDetails.subscriptionPlanId,
        numericTotalAmount,
        userDetails,
        invoiceStatus,
        discount
      );

      const subscription = await createSubscriptionRecord(
        userDetails,
        planDetails,
        pricing,
        discount,
        totalAmount,
        invoice._id,
        status
      );

      if (status === "active" && plan.name === "Free") {
        try {
          const Usage = require('../models/Usage.js');
          const features = plan.features || [];
          
          const usageAttributes = features.filter(f => ['Assessments', 'Internal_Interviews', 'Question_Bank_Access', 'Bandwidth'].includes(f?.name))
                                    .map(f => ({
                                        entitled: Number(f?.limit) || 0,
                                        type: f?.name === 'Internal_Interviews' ? 'Internal Interviews' : 
                                              f?.name === 'Question_Bank_Access' ? 'Question Bank Access' :
                                              f?.name === 'Bandwidth' ? 'User Bandwidth' : f?.name,
                                        utilized: 0,
                                        remaining: Number(f?.limit) || 0,
                                    }));

          // const endDate = new Date();
          // if (userDetails.membershipType === 'annual') {
          //   endDate.setFullYear(endDate.getFullYear() + 1);
          // } else {
          //   endDate.setMonth(endDate.getMonth() + 1);
          // }

          await Usage.findOneAndUpdate(
            { tenantId: userDetails.tenantId, ownerId: userDetails.ownerId },
            {
              $setOnInsert: {
                tenantId: userDetails.tenantId,
                ownerId: userDetails.ownerId,
                usageAttributes,
                fromDate: new Date(),
                toDate: null,
              }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );
        } catch (usageErr) {
          console.warn('Usage creation failed:', usageErr?.message);
        }
      }

      console.log(`Created subscription with status: ${status}`);
      console.log({ invoiceId: invoice._id });

      return res.status(200).json({
        message: `Subscription successfully created with status: ${status}`,
        subscription,
        invoiceId: invoice._id,
      });
    }
    
    // Provide more informative error for invalid status
    return res.status(400).json({ 
      message: 'Invalid payment status. Allowed values are "pending", "created", or "active".' 
    });
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    res.status(500).json({ message: 'An error occurred.', error });
  }
};

const updateCustomerSubscriptionControllers = async (req, res) => {
  try {
    const { planDetails, cardDetails, totalPaid, status, transactionId } = req.body;

    if (!planDetails || !cardDetails || !totalPaid || !status || !transactionId) {
      return res.status(400).json({ message: 'Missing required details.' });
    }

    const { planId, invoiceId } = planDetails;

    // console.log( planDetails );

    // Find the existing invoice
    const invoice = await Invoicemodels.findOne({ _id: invoiceId });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }




    const subscriptionPlan = await SubscriptionPlan.findById(planId);

    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription plan not found.' });
    }


    const features = subscriptionPlan.features || [];

    // const nextBillingDate = calculateNextBillingDate(cardDetails.membershipType);
    const endDate = calculateEndDate(cardDetails.membershipType);
    const pricing = parseInt(cardDetails.membershipType === 'monthly' ? planDetails.monthlyPrice : planDetails.annualPrice);
    const discount = parseInt(cardDetails.membershipType === 'monthly' ? planDetails.monthlyDiscount || 0 : planDetails.annualDiscount || 0);

    if (status === "paid") {
      const requiredPayment = pricing - discount;
      if (totalPaid >= (pricing - discount)) {

        // console.log("status",status);
        // Update the invoice
        invoice.status = status;
        invoice.planName = planDetails.planName;
        invoice.amountPaid = totalPaid
        invoice.endDate = endDate ? endDate : null;
        invoice.startDate = new Date();
        invoice.lineItems = {
          description: `${cardDetails.membershipType} Subscription Plan`,
          amount: pricing - discount,
        };

        invoice.outstandingAmount = 0;
        await invoice.save();

        // Create a receipt
        const receipt = await createReceipt(
          cardDetails.tenantId,
          cardDetails.ownerId,
          invoice._id,
          totalPaid,
          transactionId,
          cardDetails
        );

        // Update the customer subscription
        const subscription = await CustomerSubscription.findOne({ ownerId: cardDetails.ownerId });

        if (subscription) {
          subscription.endDate = endDate ? endDate : null;
          subscription.receiptId = receipt._id;
          subscription.status = 'active';
          subscription.startDate = new Date();

          subscription.features = features;
          await subscription.save();
        }

        return res.status(200).json({
          message: 'Subscription successfully updated and payment processed.',
          subscription,
          invoice,
          receipt,
        });
      } else {
        return res.status(400).json({ message: 'Insufficient payment. Payment failed.' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid payment status.' });
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'An error occurred.', error });
  }
};

const getAllCustomerSubscription = async (req, res) => {
  try {
    const CustSubscription = await CustomerSubscription.find();
    if (!CustSubscription) {
      return res.status(404).json({ message: 'Subscription plan not found.' });
    }
    return res.status(200).json(
      CustSubscription
    );

  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    res.status(500).json({ message: 'An error occurred.', error });
  }
}

const getBasedTentIdCustomerSubscription = async (req, res) => {
  try {

    // console.log(req.params);

    const { ownerId } = req.params;
    // console.log("ownerId", ownerId)

    if (!ownerId) {
      return res.status(400).json({ message: 'ownerId ID is required.' });
    }

    // Fetch all subscriptions for the given tenant ID
    const customerSubscriptions = await CustomerSubscription.find({ ownerId: ownerId }).lean();

    if (!customerSubscriptions || customerSubscriptions.length === 0) {
      // Return a 200 with empty array to simplify frontend handling
      return res.status(200).json({ customerSubscription: [] });
    }

    // Extract subscriptionPlanIds from customerSubscriptions
    const subscriptionPlanIds = customerSubscriptions.map((sub) => sub.subscriptionPlanId);


    // Fetch the corresponding subscription plans
    const subscriptionPlans = await SubscriptionPlan.find({ _id: { $in: subscriptionPlanIds } }).lean();

    if (!subscriptionPlans || subscriptionPlans.length === 0) {
      // Return a 200 with empty array to simplify frontend handling
      return res.status(200).json({ customerSubscription: [] });
    }


    const subscriptionsWithPlanNames = customerSubscriptions.map((sub) => {
      const plan = subscriptionPlans.find((plan) => String(plan._id) === String(sub.subscriptionPlanId));
      // console.log("plan", plan);
      
      return {
        ...sub,
        ...plan,
        planName: plan ? plan.name : null,
        Sub_Plan_features: plan.features,
        // maxUsers:plan.maxUsers || 0
         maxUsers: plan?.maxUsers ?? 0,
      };
    });


    return res.status(200).json({

      customerSubscription: subscriptionsWithPlanNames,
    });

  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return res.status(500).json({ message: 'An error occurred.', error });
  }
};

module.exports = { createSubscriptionControllers, updateCustomerSubscriptionControllers, getAllCustomerSubscription, getBasedTentIdCustomerSubscription }