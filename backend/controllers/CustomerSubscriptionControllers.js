
const SubscriptionPlan = require('../models/Subscriptionmodels.js');
const CustomerSubscription = require('../models/CustomerSubscriptionmodels.js');
const Invoicemodels = require('../models/Invoicemodels.js');
const Wallet = require('../models/WalletTopup.js');
const { createInvoice, createSubscriptionRecord, createReceipt, calculateEndDate } = require('./CustomerSubscriptionInvoiceContollers.js');
const { Users } = require('../models/Users.js');
const Tenant = require('../models/Tenant.js');
const { CreateOrGetVideoCallingSettings } = require('./VideoCallingSettingControllers/VideoCallingSettingController.js');


// Function to handle subscription creation
const createSubscriptionControllers = async (req, res) => {

  //   // Set up logging context
  // res.locals.loggedByController = true;
  // res.locals.processName = "Create Subscription";

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
    const discount = 0; //parseInt(userDetails.membershipType === 'monthly' ? planDetails.monthDiscount : planDetails.annualDiscount) || 0;


    // Ensure pricing and discount result in a valid total amount
    const calculatedTotalAmount = Math.max(pricing - discount, 0);


    const existingSubscription = await CustomerSubscription.findOne({ ownerId: userDetails.ownerId });

    if (existingSubscription) {
      // Calculate dates for all plans including free
      const startDate = new Date();
      let endDate = null;
      let nextBillingDate = null;
      
      // For free plans with active status, set endDate and nextBillingDate
      if (status === 'active') {
        endDate = new Date();
        if (userDetails.membershipType === 'annual') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }
        nextBillingDate = new Date(endDate);
      }


        // Update subscription details
      const subscriptionChanges = [];
      
      // // Track changes for logging
      // const trackChange = (field, oldValue, newValue) => {
      //   if (oldValue !== newValue) {
      //     subscriptionChanges.push({
      //       fieldName: field,
      //       oldValue,
      //       newValue
      //     });
      //   }
      // };

      //  trackChange('subscriptionPlanId', existingSubscription.subscriptionPlanId, subscriptionPlanId);
      // trackChange('selectedBillingCycle', existingSubscription.selectedBillingCycle, userDetails.membershipType);
      // trackChange('price', existingSubscription.price, pricing);
      // trackChange('discount', existingSubscription.discount, discount);
      // trackChange('startDate', existingSubscription.startDate, startDate);
      // trackChange('totalAmount', existingSubscription.totalAmount, calculatedTotalAmount);
      // trackChange('endDate', existingSubscription.endDate, endDate);
      // trackChange('nextBillingDate', existingSubscription.nextBillingDate, nextBillingDate);
      // trackChange('status', existingSubscription.status, status);
      
      // Update subscription details
      existingSubscription.subscriptionPlanId = subscriptionPlanId;
      existingSubscription.selectedBillingCycle = userDetails.membershipType;
      existingSubscription.price = pricing;
      existingSubscription.discount = discount;
      existingSubscription.startDate = startDate;
      existingSubscription.totalAmount = calculatedTotalAmount;
      existingSubscription.endDate = endDate;
      existingSubscription.nextBillingDate = nextBillingDate;
      existingSubscription.features = [];
      //existingSubscription.razorpayCustomerId = null;
      //existingSubscription.razorpaySubscriptionId = null;
      existingSubscription.receiptId = null;
      
      
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

      // Add log data for subscription update
      // res.locals.logData = {
      //   tenantId: userDetails?.tenantId || "",
      //   ownerId: userDetails?.ownerId || "",
      //   processName: "Update Subscription",
      //   requestBody: req.body,
      //   status: "success",
      //   message: "Subscription updated successfully",
      //   responseBody: {
      //     subscription: existingSubscription,
      //     invoiceId: existingInvoice?._id
      //   },
      //   changes: subscriptionChanges
      // };

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

          // active tenant
          const tenant = await Tenant.findById(userDetails.tenantId);
            if (tenant) {
                tenant.status = 'active';
                                  
                // Handle bandwidth limit - convert "unlimited" to 0 (which represents unlimited in the system)
                const bandwidthFeature = features.find(feature => feature?.name === 'Bandwidth');
                let bandwidthLimit = bandwidthFeature?.limit ?? tenant.usersBandWidth ?? 0;
                if (bandwidthLimit === 'unlimited' || bandwidthLimit === 'Unlimited') {
                    bandwidthLimit = 0; // 0 represents unlimited bandwidth
                }
                  tenant.usersBandWidth = Number(bandwidthLimit) || 0;
                                  
                // Handle users limit - convert "unlimited" to 0 (which represents unlimited in the system)
                  const usersFeature = features.find(feature => feature?.name === 'Users');
                  let usersLimit = usersFeature?.limit ?? tenant.totalUsers ?? 0;
                  if (usersLimit === 'unlimited' || usersLimit === 'Unlimited') {
                        usersLimit = 0; // 0 represents unlimited users
                                  }
                  tenant.totalUsers = Number(usersLimit) || 0;
                                  
                      await tenant.save();
          
                  const user = await Users.findById(userDetails.ownerId);
                  // active user
                  if (user) {
                        user.status ='active'
                        await user.save();
                  }
          
                  // 2️⃣ Call function to create or get default Zoom settings
                  const videoSettingsResponse = await CreateOrGetVideoCallingSettings(userDetails.tenantId, userDetails.ownerId); 
                  console.log(videoSettingsResponse);
          }


          
          
          const usageAttributes = features.filter(f => ['Assessments', 'Internal_Interviews', 'Question_Bank_Access', 'Bandwidth'].includes(f?.name))
                                    .map(f => ({
                                        entitled: Number(f?.limit) || 0,
                                        type: f?.name === 'Internal_Interviews' ? 'Internal Interviews' : 
                                              f?.name === 'Question_Bank_Access' ? 'Question Bank Access' :
                                              f?.name === 'Bandwidth' ? 'User Bandwidth' : f?.name,
                                        utilized: 0,
                                        remaining: Number(f?.limit) || 0,
                                    }));

          const endDate = new Date();
          if (userDetails.membershipType === 'annual') {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }

          await Usage.findOneAndUpdate(
            { tenantId: userDetails.tenantId, ownerId: userDetails.ownerId },
            {
              $setOnInsert: {
                tenantId: userDetails.tenantId,
                ownerId: userDetails.ownerId,
                usageAttributes,
                fromDate: new Date(),
                toDate: endDate,
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


       // Add log data for new subscription creation
      // res.locals.logData = {
      //   tenantId: userDetails?.tenantId || "",
      //   ownerId: userDetails?.ownerId || "",
      //   processName: "Create Subscription",
      //   requestBody: req.body,
      //   status: "success",
      //   message: `Subscription successfully created with status: ${status}`,
      //   responseBody: {
      //     subscription,
      //     invoiceId: invoice._id
      //   },
      //   responseBody: {
      //     subscription,
      //     invoiceId: invoice._id
      //   },
      // };

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
   // Set up logging context
  // res.locals.loggedByController = true;
  // res.locals.processName = "Update Customer Subscription";

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


         // Track invoice changes
        // const invoiceChanges = [];
        // const trackInvoiceChange = (field, oldValue, newValue) => {
        //   if (oldValue !== newValue) {
        //     invoiceChanges.push({
        //       fieldName: field,
        //       oldValue,
        //       newValue
        //     });
        //   }
        // };

        // // Update the invoice
        // trackInvoiceChange('status', invoice.status, status);
        // trackInvoiceChange('planName', invoice.planName, planDetails.planName);
        // trackInvoiceChange('amountPaid', invoice.amountPaid, totalPaid);
        // trackInvoiceChange('endDate', invoice.endDate, endDate);
        // trackInvoiceChange('startDate', invoice.startDate, new Date());
        // trackInvoiceChange('outstandingAmount', invoice.outstandingAmount, 0);

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


            // Track subscription changes
          // const subscriptionChanges = [];
          // const trackSubscriptionChange = (field, oldValue, newValue) => {
          //   if (oldValue !== newValue) {
          //     subscriptionChanges.push({
          //       fieldName: field,
          //       oldValue,
          //       newValue
          //     });
          //   }
          // };

          // trackSubscriptionChange('endDate', subscription.endDate, endDate);
          // trackSubscriptionChange('receiptId', subscription.receiptId, receipt._id);
          // trackSubscriptionChange('status', subscription.status, 'active');
          // trackSubscriptionChange('startDate', subscription.startDate, new Date());
          // trackSubscriptionChange('features', JSON.stringify(subscription.features), JSON.stringify(features));



          subscription.endDate = endDate ? endDate : null;
          subscription.receiptId = receipt._id;
          subscription.status = 'active';
          subscription.startDate = new Date();

          subscription.features = features;
          await subscription.save();


             // Combine all changes for logging
          const allChanges = [...invoiceChanges, ...subscriptionChanges];
          console.log("all changes",allChanges);

          // Add log data for successful subscription update
        //  let response = res.locals.logData = {
        //     tenantId: cardDetails?.tenantId || "",
        //     ownerId: cardDetails?.ownerId || "",
        //     processName: "Update Customer Subscription",
        //     requestBody: req.body,
        //     status: "success",
        //     message: "Subscription successfully updated and payment processed",
        //     responseBody: {
        //       subscription,
        //       invoice,
        //       receipt
        //     },
        //     changes: allChanges
        //   };
        //   console.log("response",response);

          return res.status(200).json({
          message: 'Subscription successfully updated and payment processed.',
          subscription,
          invoice,
          receipt,
        });

        } else {
          // Add log data for subscription not found
          // res.locals.logData = {
          //   tenantId: cardDetails?.tenantId || "",
          //   ownerId: cardDetails?.ownerId || "",
          //   processName: "Update Customer Subscription",
          //   requestBody: req.body,
          //   status: "error",
          //   message: "Subscription not found for user"
          // };

          return res.status(404).json({ message: 'Subscription not found for user.' });
        }

        
      } else {
       
         // Add log data for insufficient payment
        // res.locals.logData = {
        //   tenantId: cardDetails?.tenantId || "",
        //   ownerId: cardDetails?.ownerId || "",
        //   processName: "Update Customer Subscription",
        //   requestBody: req.body,
        //   status: "error",
        //   message: `Insufficient payment. Required: ${requiredPayment}, Paid: ${totalPaid}`
        // };
       
        return res.status(400).json({ message: 'Insufficient payment. Payment failed.' });
      }
    } else {

        // Add log data for invalid payment status
      // res.locals.logData = {
      //   tenantId: cardDetails?.tenantId || "",
      //   ownerId: cardDetails?.ownerId || "",
      //   processName: "Update Customer Subscription",
      //   requestBody: req.body,
      //   status: "error",
      //   message: `Invalid payment status: ${status}`
      // };

      return res.status(400).json({ message: 'Invalid payment status.' });
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
     // Log error details
    res.locals.logData = {
      tenantId: req.body?.cardDetails?.tenantId || "",
      ownerId: req.body?.cardDetails?.ownerId || "",
      processName: "Update Customer Subscription",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };
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
      // Log error details
    res.locals.logData = {
      tenantId: req.body?.userDetails?.tenantId || "",
      ownerId: req.body?.userDetails?.ownerId || "",
      processName: "Create Subscription",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };
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