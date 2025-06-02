
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

      existingSubscription.subscriptionPlanId = subscriptionPlanId;
      existingSubscription.selectedBillingCycle = userDetails.membershipType;
      existingSubscription.price = pricing;
      existingSubscription.discount = discount;
      existingSubscription.startDate = new Date();
      existingSubscription.totalAmount = calculatedTotalAmount,

        existingSubscription.status = 'active';
      await existingSubscription.save();

      // const plan = await SubscriptionPlan.findById(subscriptionPlanId);
      const existingInvoice = await Invoicemodels.findOne({ ownerId: userDetails.ownerId });
      if (existingInvoice) {
        existingInvoice.subscriptionId = subscriptionPlanId;
        existingInvoice.totalAmount = calculatedTotalAmount;
        existingInvoice.startDate = new Date();
        existingInvoice.status = "pending",
          existingInvoice.lineItems = {
            description: `${userDetails.membershipType} - Updated Plan`,
            amount: calculatedTotalAmount,
          };
        await existingInvoice.save();
      }

      return res.status(200).json({
        message: 'Subscription and invoice successfully updated.',
        subscription: existingSubscription,
        invoiceId: existingInvoice._id
      });
    }

    if (status === "pending") {

      const invoice = await createInvoice(
        userDetails.tenantId,
        userDetails.ownerId,
        planDetails.subscriptionPlanId,
        numericTotalAmount,
        userDetails,
        status,
        discount
      );

      const subscription = await createSubscriptionRecord(
        userDetails,
        planDetails,
        pricing,
        discount,
        totalAmount,
        invoice._id
      );

      // console.log( { subscription,
      //   invoiceId: invoice._id});

      return res.status(200).json({
        message: 'Subscription successfully created and payment processed.',
        subscription,
        invoiceId: invoice._id,
      });
    }
    return res.status(400).json({ message: 'Invalid payment status.' });
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
        invoice.amountPaid = totalPaid
        invoice.endDate = endDate;
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
          subscription.endDate = endDate;
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
      return res.status(404).json({ message: 'No matching subscription plans found.' });
    }

    // Extract subscriptionPlanIds from customerSubscriptions
    const subscriptionPlanIds = customerSubscriptions.map((sub) => sub.subscriptionPlanId);


    // Fetch the corresponding subscription plans
    const subscriptionPlans = await SubscriptionPlan.find({ _id: { $in: subscriptionPlanIds } }).lean();

    if (!subscriptionPlans || subscriptionPlans.length === 0) {
      return res.status(404).json({ message: 'Subscription plan details not found.' });
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