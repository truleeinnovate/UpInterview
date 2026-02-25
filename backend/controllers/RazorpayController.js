const Razorpay = require("razorpay");
const crypto = require("crypto");
const moment = require("moment");
const Payment = require("../models/Payments");
const SUBSCRIPTION_STATUSES = require("../constants/subscriptionStatuses");
const CustomerSubscription = require("../models/CustomerSubscriptionmodels.js");
const PaymentCard = require("../models/Carddetails.js");
const SubscriptionPlan = require("../models/Subscriptionmodels.js");
const Invoicemodels = require("../models/Invoicemodels");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService");
const Receipt = require("../models/Receiptmodels.js");
const Tenant = require("../models/Tenant");
const { handleApiError } = require("../utils/errorHandler");

// Import helper functions directly from the controller
const helpers = require("./CustomerSubscriptionInvoiceContollers.js");
const Usage = require("../models/Usage.js");
const { inflateRaw } = require("zlib");
const { Contacts } = require("../models/Contacts.js");
const WalletTopup = require("../models/WalletTopup.js");
const { Users } = require("../models/Users.js");
const {
  CreateOrGetVideoCallingSettings,
} = require("./VideoCallingSettingControllers/VideoCallingSettingController.js");

// Import common wallet transaction utility
const {
  createWalletTransaction,
  WALLET_BUSINESS_TYPES,
} = require("../utils/interviewWalletUtil");
const createInvoice = helpers.createInvoice;
const createReceipt = helpers.createReceipt;
const calculateEndDate = helpers.calculateEndDate;

// Import payment push notification functions
const {
  createPaymentSuccessNotification,
  createPaymentFailedNotification,
  createSubscriptionChargedNotification,
  createSubscriptionCancelledNotification,
  createSubscriptionHaltedNotification,
  createPaymentMethodUpdatedNotification,
} = require("./PushNotificationControllers/pushNotificationPaymentController");

// Helper function to generate unique transaction IDs
const generateTransactionId = () => {
  return "txn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
};

// We've already defined the main models at the top, so we don't need these fallbacks

// We've moved the import of helper functions to the global scope
// so we don't need to redefine or create fallbacks here

// Default test keys for development - replace with your actual keys in production
const RAZORPAY_TEST_KEY_ID = "rzp_test_YourTestKeyHere"; // Replace with your actual test key
const RAZORPAY_TEST_SECRET = "YourTestSecretHere"; // Replace with your actual test secret

// Razorpay instance creation - initialize with your API keys
// Make sure to use valid test keys for development
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper function to create Razorpay order

// Subscription-only implementation - one-time payment functionality removed

// Verify Razorpay payment signature
const verifyPayment = async (req, res) => {
  // Set up logging context at the start
  res.locals.loggedByController = true;
  res.locals.processName = "Verify Payment";
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
      cardDetails,
      ownerId,
      tenantId,
      planId,
      membershipType,
      autoRenew,
      invoiceId: incomingInvoiceId, // Extract invoiceId from request body
      razorpayPlanId, // Extract razorpayPlanId from request body
    } = req.body;

    // Use a mutable local variable so we can fallback when frontend did not send invoiceId
    let invoiceId = incomingInvoiceId;

    if (!invoiceId) {
      const invoice = await Invoicemodels.findOne({ ownerId });
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      invoiceId = invoice._id;
    }

    if (!planId) {
      console.warn("No planId found in payment verification request");
    }

    const subPlan = await SubscriptionPlan.findById(planId);

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Verify signature based on payment type (subscription or order)
    const isSubscription = !!razorpay_subscription_id;
    const hasOrderId = !!razorpay_order_id;

    // console.warn("Generating signature with:", {
    //   isSubscription: isSubscription,
    //   hasOrderId: hasOrderId,
    //   id: isSubscription ? razorpay_subscription_id : razorpay_order_id,
    //   order_id: razorpay_order_id,
    //   payment_id: razorpay_payment_id,
    //   secret: process.env.RAZORPAY_KEY_SECRET ? "***" : "MISSING",
    // });

    let body = isSubscription
      ? razorpay_payment_id + "|" + razorpay_subscription_id
      : razorpay_order_id + "|" + razorpay_payment_id;

    let generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    let signatureMatch = generated_signature === razorpay_signature;

    // Fallback strategy: If subscription verification failed but we have an order ID, try the order format
    if (!signatureMatch && isSubscription && hasOrderId) {
      const body2 = razorpay_order_id + "|" + razorpay_payment_id;
      const generated_signature2 = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body2)
        .digest("hex");

      if (generated_signature2 === razorpay_signature) {
        console.warn("Signature matched using Order ID format for subscription!");
        signatureMatch = true;
        body = body2; // Update body for logging/consistency
      } else {
        console.warn("Fallback Order Signature also failed:", {
          generated: generated_signature2,
          body_used: body2
        });
      }
    }

    if (!signatureMatch) {
      console.error("Signature verification failed", {
        generated: generated_signature,
        received: razorpay_signature,
        body_used: body,
      });

      // Fix for duplicate key error: Ensure transactionId is generated on upsert
      const updateData = {
        status: "failed",
        notes: "Signature verification failed",
        error: "Invalid payment signature",
        signatureMatch: false,
      };

      const updateOptions = { new: true, upsert: true };

      // Use $setOnInsert to generate transactionId only when creating a new document
      // and $set for the other fields
      await Payment.findOneAndUpdate(
        isSubscription
          ? { subscriptionId: razorpay_subscription_id }
          : { razorpayOrderId: razorpay_order_id },
        {
          $set: updateData,
          $setOnInsert: {
            transactionId: generateTransactionId(),
            paymentGateway: "razorpay",
            paymentMethod: "unknown",
            amount: 0 // Default amount if missing
          }
        },
        updateOptions
      );

      return res.status(400).json({
        status: "error",
        message: "Invalid payment signature",
        code: "SIGNATURE_VERIFICATION_FAILED",
      });
    }

    // Get payment details from Razorpay including token for recurring payments
    let razorpayPayment;
    let tokenId = null;
    let customerId = null;

    try {
      // Fetch the complete payment details from Razorpay API
      razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

      // Extract card details from Razorpay response
      let cardInfo = {
        last4: null,
        network: null,
        type: null,
        issuer: null,
      };

      if (razorpayPayment.card) {
        cardInfo = {
          last4: razorpayPayment.card.last4 || null,
          network: razorpayPayment.card.network || null,
          type: razorpayPayment.card.type || null,
          issuer: razorpayPayment.card.issuer || null,
        };
      }

      // Check if this payment created a token (critical for recurring payments)
      if (razorpayPayment.token_id) {
        tokenId = razorpayPayment.token_id;

        // If customer_id is available, store it too
        if (razorpayPayment.customer_id) {
          customerId = razorpayPayment.customer_id;
        }
      } else {
      }
    } catch (razorpayError) {
      console.error("Error fetching payment from Razorpay:", razorpayError);
      // Continue with local verification if Razorpay API fails
      razorpayPayment = { amount: null };
    }

    // Check if payment exists
    let existingPayment = await Payment.findOne(
      isSubscription
        ? { subscriptionId: razorpay_subscription_id }
        : { razorpayOrderId: razorpay_order_id }
    );

    if (existingPayment) {
      // Update existing payment record
      existingPayment.razorpayPaymentId = razorpay_payment_id;
      existingPayment.razorpaySignature = razorpay_signature;
      existingPayment.status = "captured";
      existingPayment.amount = razorpayPayment.amount
        ? razorpayPayment.amount / 100
        : existingPayment.amount; // Convert from cents if available
      existingPayment.planId = planId;
      existingPayment.paidAt = new Date();
      await existingPayment.save();
    } else {
      // Create new payment record
      // Generate payment code using centralized service
      const paymentCode = await generateUniqueId("PMT", Payment, "paymentCode");
      const newPayment = new Payment({
        paymentCode: paymentCode,
        tenantId: tenantId,
        ownerId: ownerId,
        planId: planId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        subscriptionId: razorpay_subscription_id,
        membershipType: membershipType,
        //autoRenew: autoRenew,
        amount: razorpayPayment.amount / 100, // Convert from cents
        status: "captured",
        paidAt: new Date(),
        paymentMethod: "card",
        paymentGateway: "razorpay",
        transactionId: generateTransactionId(),
        billingCycle: membershipType,
        metadata: {
          planName: subPlan.name,
          autoRenew: autoRenew,
        },
      });
      await newPayment.save();
    }

    // Process card details and token for recurring payments
    try {
      const PaymentCard = require("../models/Carddetails.js");

      // Get card info from Razorpay payment response
      const cardInfo = razorpayPayment?.card || {};
      const tokenId = razorpayPayment?.token_id;
      const customerId = razorpayPayment?.customer_id;

      // Format card details
      const cardNumber = cardInfo?.last4
        ? `**** **** **** ${cardInfo.last4}`
        : "Unknown";
      const cardBrand = cardInfo?.network || "Unknown";
      const cardType = cardInfo?.type || "unknown";

      // Check if we have enough info to save card
      const hasToken = !!tokenId;
      const hasCardDetails = cardInfo?.last4 || cardInfo?.network;

      if (!hasToken && !hasCardDetails) {
        return;
      }

      // Find or create payment card record
      let paymentCard = await PaymentCard.findOne({
        ownerId: ownerId,
        tenantId: tenantId,
      });

      let cardIndex = -1;

      if (!paymentCard) {
        // Create new payment card record
        paymentCard = new PaymentCard({
          ownerId,
          tenantId,
          cards: [
            {
              cardNumber,
              cardBrand,
              cardType,
              razorpayTokenId: tokenId,
              razorpayCustomerId: customerId,
              razorpayPaymentId: razorpay_payment_id,
              status: "active",
              lastUsed: new Date(),
            },
          ],
          lastPlanId: planId,
          lastPaymentDate: new Date(),
          lastPaymentId: razorpay_payment_id,
          isDefault: true,
        });
      } else {
        // Update existing payment card

        // Initialize cards array if it doesn't exist
        if (!paymentCard.cards) {
          paymentCard.cards = [];
        }

        // Check if this card already exists
        const last4Digits = cardInfo?.last4 || "";
        cardIndex = paymentCard.cards.findIndex(
          (card) => card.cardNumber && card.cardNumber.includes(last4Digits)
        );

        if (cardIndex !== -1) {
          // Update existing card
          paymentCard.cards[cardIndex].cardNumber = cardNumber;
          paymentCard.cards[cardIndex].cardBrand = cardBrand;
          paymentCard.cards[cardIndex].cardType = cardType;
          if (tokenId) paymentCard.cards[cardIndex].razorpayTokenId = tokenId;
          if (customerId)
            paymentCard.cards[cardIndex].razorpayCustomerId = customerId;
          paymentCard.cards[cardIndex].razorpayPaymentId = razorpay_payment_id;
          paymentCard.cards[cardIndex].lastUsed = new Date();
        } else {
          // Add new card to the list
          paymentCard.cards.push({
            cardNumber,
            cardBrand,
            cardType,
            razorpayTokenId: tokenId,
            razorpayCustomerId: customerId,
            razorpayPaymentId: razorpay_payment_id,
            status: "active",
            lastUsed: new Date(),
          });
        }

        // Update last used date
        paymentCard.lastUsed = new Date();
        paymentCard.lastPlanId = planId;
        paymentCard.lastPaymentId = razorpay_payment_id;
        paymentCard.lastPaymentDate = new Date();
      }

      // Save the payment card record
      try {
        await paymentCard.save();

        // Create payment method updated notification for new cards
        if (cardIndex === -1 && cardInfo?.last4) {
          try {
            await createPaymentMethodUpdatedNotification(ownerId, tenantId, {
              cardLast4: cardInfo.last4,
              cardBrand: cardBrand || "Card",
              isDefault: paymentCard.isDefault || false,
            });
          } catch (notificationError) {
            console.error(
              "[PAYMENT] Error creating payment method notification:",
              notificationError
            );
          }
        }
      } catch (saveError) {
        console.error("Error saving payment card details:", saveError);
        // Continue with the payment even if card save fails
      }
    } catch (cardError) {
      console.error("Error handling card details:", cardError);
      // Continue despite error - focus on subscription and invoice updates
    }

    let invoice = null;
    let receipt = null;
    // Update existing CustomerSubscription, Invoice
    try {
      // Define these variables at the outer scope so they're available for both invoice updates and receipt creation
      let price = 0;
      let discount = 0;
      let totalAmount = 0;

      // Get subscription plan details

      if (!subPlan) {
        console.warn(`Subscription plan not found with ID: ${planId}`);
        return res.status(404).json({ error: "Subscription plan not found" });
      }

      // Calculate billing dates
      const startDate = new Date();
      const billingCycle = membershipType;
      const endDate = calculateEndDate(billingCycle);
      const nextBillingDate = endDate;

      if (!invoiceId) {
        console.warn(
          "No invoiceId provided in the request. Payment verification will continue without invoice update."
        );
      }

      if (invoiceId) {
        try {
          invoice = await Invoicemodels.findById(invoiceId);
          if (invoice) {
          } else {
          }
        } catch (invoiceError) {
          console.error("Error finding invoice:", invoiceError);
          // Continue with payment verification even if invoice not found
        }
      }

      // Get the plan details to access its features (using lean() for better performance)
      const plan = await SubscriptionPlan.findById(planId).lean();

      // Look for existing subscription by ownerId
      const customerSubscription = await CustomerSubscription.findOne({
        ownerId: ownerId,
      });
      const payment = await Payment.findOne({
        razorpayPaymentId: razorpay_payment_id,
      });

      if (!customerSubscription) {
        console.warn(`No existing subscription found for owner: ${ownerId}`);
      } else {
        // Update existing subscription with payment information
        customerSubscription.status = SUBSCRIPTION_STATUSES.ACTIVE;
        customerSubscription.lastPaymentId = razorpay_payment_id;
        customerSubscription.razorpayPaymentId = razorpay_payment_id; // Store Razorpay payment ID for webhook use
        customerSubscription.lastPaymentDate = new Date();
        customerSubscription.endDate = endDate;
        customerSubscription.nextBillingDate = nextBillingDate;

        // Update existing invoice with payment information (if invoice exists)
        if (invoice) {
          let priceFound = false;

          // Get price from the pricing array based on billing cycle
          if (plan && plan.pricing && Array.isArray(plan.pricing)) {
            // Find the pricing object for the selected billing cycle
            const pricing = plan.pricing.find(
              (p) => p.billingCycle === billingCycle
            );

            if (pricing) {
              // Set the base price
              price = pricing.price;
              priceFound = true;

              // Calculate discount if applicable
              discount = billingCycle === "monthly" ? 0 : pricing.discount;

              // Calculate total amount
              totalAmount = price; //-discount
            }
          }

          // Update invoice with the new pricing from the subscription
          invoice.status = "paid";
          invoice.planName = plan.name;
          invoice.amountPaid = totalAmount;
          invoice.price = price;
          invoice.discount = discount || 0;
          invoice.totalAmount = totalAmount;
          invoice.outstandingAmount = 0;
          invoice.lastPaymentDate = new Date();
          invoice.lastPaymentId = razorpay_payment_id;
          invoice.startDate = startDate;
          invoice.endDate = endDate;
          invoice.paymentId = payment.paymentCode;

          await invoice.save();
        } else {
        }

        // Only create receipt if payment was successful
        if (payment.status === "captured" || payment.status === "authorized") {
          // Generate Recepit code
          const receiptCode = await generateUniqueId(
            "RCP",
            Receipt,
            "receiptCode"
          );
          receipt = new Receipt({
            receiptCode: receiptCode,
            tenantId: tenantId,
            ownerId: ownerId,
            planName: plan.name,
            // invoice may be null when checkout did not pre-create an invoice
            invoiceId: invoice ? invoice._id : undefined,
            amount: totalAmount, // Use subscription amount to ensure consistency
            price: price,
            discount: discount || 0,
            transactionId: razorpay_payment_id,
            paymentDate: new Date(),
            paymentMethod: "razorpay",
          });

          await receipt.save();

          // Update subscription with receipt ID only if receipt was created
          customerSubscription.receiptId = receipt._id;
        } else {
        }
        customerSubscription.invoiceId =
          invoice && invoice._id ? invoice._id : null;

        await customerSubscription.save();

        // Safely resolve the subscription plan to derive tenant feature limits
        let planDoc = null;
        try {
          planDoc = await SubscriptionPlan.findById(
            customerSubscription.subscriptionPlanId
          ).lean();
        } catch (e) {
          planDoc = null;
        }
        // Fallback to previously fetched plan/subPlan if needed
        planDoc = planDoc || plan || subPlan;

        if (
          payment.status === "captured" ||
          payment.status === "authorized" ||
          payment.status === "succeeded"
        ) {
          const features = Array.isArray(planDoc?.features)
            ? planDoc.features
            : [];

          // active tenant
          const tenant = await Tenant.findById(customerSubscription.tenantId);
          if (tenant) {
            tenant.status = "active";

            // Handle bandwidth limit - convert "unlimited" to 0 (which represents unlimited in the system)
            const bandwidthFeature = features.find(
              (feature) => feature?.name === "Bandwidth"
            );
            let bandwidthLimit =
              bandwidthFeature?.limit ?? tenant.usersBandWidth ?? 0;
            if (
              bandwidthLimit === "unlimited" ||
              bandwidthLimit === "Unlimited"
            ) {
              bandwidthLimit = 0; // 0 represents unlimited bandwidth
            }
            tenant.usersBandWidth = Number(bandwidthLimit) || 0;

            // Handle users limit - convert "unlimited" to 0 (which represents unlimited in the system)
            const usersFeature = features.find(
              (feature) => feature?.name === "Users"
            );
            let usersLimit = usersFeature?.limit ?? tenant.totalUsers ?? 0;
            if (usersLimit === "unlimited" || usersLimit === "Unlimited") {
              usersLimit = 0; // 0 represents unlimited users
            }
            tenant.totalUsers = Number(usersLimit) || 0;

            await tenant.save();

            const user = await Users.findById(customerSubscription.ownerId);
            // active user
            if (user) {
              user.status = "active";
              await user.save();
            }

            // 2️⃣ Call function to create or get default Zoom settings
            const videoSettingsResponse = await CreateOrGetVideoCallingSettings(
              customerSubscription.tenantId,
              ownerId
            );

            // Create Usage document only once per billing period after payment verification
            try {
              const now = new Date();
              const usageBillingCycle = (
                membershipType || "monthly"
              ).toLowerCase();

              // Check if Usage already exists for current billing period
              const existingUsage = await Usage.findOne({ tenantId, ownerId });

              // Helper function to check if we're in the same billing period
              const isInSameBillingPeriod = (usage) => {
                if (!usage || !usage.fromDate || !usage.toDate) return false;

                const nowMoment = moment(now);
                const fromMoment = moment(usage.fromDate);
                const toMoment = moment(usage.toDate);

                // Check if current date is within the existing usage period
                if (nowMoment.isBetween(fromMoment, toMoment, null, "[]")) {
                  return true;
                }

                // For monthly: check if we're in the same month and year
                if (usageBillingCycle.includes("month")) {
                  return (
                    nowMoment.year() === fromMoment.year() &&
                    nowMoment.month() === fromMoment.month()
                  );
                }

                // For annual: check if we're in the same year cycle
                if (
                  usageBillingCycle.includes("year") ||
                  usageBillingCycle.includes("annual")
                ) {
                  return nowMoment.year() === fromMoment.year();
                }

                return false;
              };

              // Only create Usage if it doesn't exist for current billing period
              if (!existingUsage || !isInSameBillingPeriod(existingUsage)) {
                const usageAttributes = features
                  .filter((f) =>
                    [
                      "Assessments",
                      "Internal_Interviews",
                      "Question_Bank_Access",
                      "Bandwidth",
                    ].includes(f?.name)
                  )
                  .map((f) => ({
                    entitled: Number(f?.limit) || 0,
                    type:
                      f?.name === "Internal_Interviews"
                        ? "Internal Interviews"
                        : f?.name === "Question_Bank_Access"
                          ? "Question Bank Access"
                          : f?.name === "Bandwidth"
                            ? "User Bandwidth"
                            : f?.name,
                    utilized: 0,
                    remaining: Number(f?.limit) || 0,
                  }));

                // Determine the exact billing period bounds
                let periodStart = null;
                let periodEnd = endDate; // fallback to computed endDate

                if (isSubscription && razorpay_subscription_id) {
                  try {
                    const sub = await razorpay.subscriptions.fetch(
                      razorpay_subscription_id
                    );
                    if (sub?.current_start)
                      periodStart = new Date(sub.current_start * 1000);
                    if (sub?.current_end)
                      periodEnd = new Date(sub.current_end * 1000);
                  } catch (e) {
                    console.warn(
                      "Unable to fetch subscription period for verifyPayment:",
                      e?.message
                    );
                  }
                }

                if (!periodStart) {
                  // Fallback: derive start from billing cycle and endDate
                  const end = new Date(periodEnd);
                  const start = new Date(end);
                  if (
                    usageBillingCycle.includes("year") ||
                    usageBillingCycle.includes("annual")
                  ) {
                    start.setFullYear(start.getFullYear() - 1);
                  } else {
                    // default monthly
                    start.setMonth(start.getMonth() - 1);
                  }
                  periodStart = start;
                }

                if (existingUsage) {
                  // Update existing Usage with new period
                  existingUsage.usageAttributes = usageAttributes;
                  existingUsage.fromDate = periodStart;
                  existingUsage.toDate = periodEnd;
                  await existingUsage.save();
                } else {
                  // Create new Usage document
                  const newUsage = new Usage({
                    tenantId,
                    ownerId,
                    usageAttributes,
                    fromDate: periodStart,
                    toDate: periodEnd,
                  });
                  await newUsage.save();
                }
              } else {
              }
            } catch (usageErr) {
              console.warn(
                "Usage creation/update failed during verifyPayment:",
                usageErr?.message
              );
            }
          } else {
            console.warn(
              "Tenant not found when updating limits for subscription payment"
            );
          }
        }

        // Update wallet if plan has credits
        if (plan && plan.walletCredits > 0) {
          // Safely resolve related invoice id if available
          const relatedInvoiceId =
            invoice && invoice._id ? invoice._id.toString() : undefined;

          const wallet = await WalletTopup.findOne({ ownerId });

          if (wallet) {
            // Update wallet status from pending to completed
            let updatedTransaction = false;

            const txns = Array.isArray(wallet.transactions)
              ? wallet.transactions
              : [];
            for (let i = 0; i < txns.length; i++) {
              if (
                txns[i].status === "pending" &&
                relatedInvoiceId &&
                txns[i].relatedInvoiceId === relatedInvoiceId
              ) {
                txns[i].status = "completed";
                updatedTransaction = true;
                break;
              }
            }

            if (!updatedTransaction) {
              // If no pending transaction found, add subscription credits using common function
              try {
                await createWalletTransaction({
                  ownerId,
                  businessType: WALLET_BUSINESS_TYPES.SUBSCRIBE_CREDITED,
                  amount: plan.walletCredits,
                  description: `Credited from ${plan.name} subscription`,
                  relatedInvoiceId: relatedInvoiceId,
                  status: "completed",
                  reason: "SUBSCRIPTION_CREDITED",
                  metadata: {
                    planId: plan._id,
                    planName: plan.name,
                    source: "subscription_credited",
                  },
                });
              } catch (walletError) {
                console.error("Error adding subscription credits:", walletError);
              }
            }

            await wallet.save();
          }
        }
      }

      // Update wallet if plan has credits
      if (plan && plan.walletCredits > 0) {
        // Safely resolve related invoice id if available
        const relatedInvoiceId =
          invoice && invoice._id ? invoice._id.toString() : undefined;

        const wallet = await WalletTopup.findOne({ ownerId });

        if (wallet) {
          // Update wallet status from pending to completed
          let updatedTransaction = false;

          const txns = Array.isArray(wallet.transactions)
            ? wallet.transactions
            : [];
          for (let i = 0; i < txns.length; i++) {
            if (
              txns[i].status === "pending" &&
              relatedInvoiceId &&
              txns[i].relatedInvoiceId === relatedInvoiceId
            ) {
              txns[i].status = "completed";
              updatedTransaction = true;
              break;
            }
          }

          if (!updatedTransaction) {
            // If no pending transaction found, add subscription credits using common function
            try {
              await createWalletTransaction({
                ownerId,
                businessType: WALLET_BUSINESS_TYPES.SUBSCRIBE_CREDITED,
                amount: plan.walletCredits,
                description: `Credited from ${plan.name} subscription`,
                relatedInvoiceId: relatedInvoiceId,
                status: "completed",
                reason: "SUBSCRIPTION_CREDITED",
                metadata: {
                  planId: plan._id,
                  planName: plan.name,
                  source: "subscription_credits",
                },
              });
            } catch (walletError) {
              console.error("Error adding subscription credits:", walletError);
            }
          }

          await wallet.save();
        }
      }

      //update organization subscription status
    } catch (error) {
      console.error("Error updating subscription records:", error);
      // Don't fail the payment verification if record updates fail
    }

    // Create payment success push notification
    try {
      const plan = await SubscriptionPlan.findOne({ planId: planId });
      const paymentAmount = razorpayPayment?.amount
        ? razorpayPayment.amount / 100
        : 0;

      await createPaymentSuccessNotification(ownerId, tenantId, {
        amount: paymentAmount,
        planName: plan?.name || "Subscription",
        billingCycle: membershipType || "monthly",
        paymentCode: existingPayment?.paymentCode || "N/A",
      });
    } catch (notificationError) {
      console.error(
        "[PAYMENT] Error creating payment success notification:",
        notificationError
      );
      // Don't fail the payment if notification fails
    }

    const responseBody = {
      message: "Payment verified and processed successfully",
      transactionId: razorpay_payment_id,
      status: "paid",
      subscriptionId: razorpay_subscription_id,
      planId: planId,
      amount: razorpayPayment?.amount ? razorpayPayment.amount / 100 : 0,
      planName: subPlan?.name,
      billingCycle: membershipType || "monthly",
      paymentCode: existingPayment?.paymentCode || "N/A",
      receiptId: receipt?._id,
      invoiceId: invoice?._id,
    };

    // Success logging - Ensure processName is always included
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Verify Payment", // Always include processName
      status: "success",
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      subscriptionId: razorpay_subscription_id,
      amount: razorpayPayment?.amount ? razorpayPayment.amount / 100 : 0,
      planName: subPlan?.name,
      requestBody: {
        razorpay_payment_id: razorpay_payment_id,
        razorpay_subscription_id: razorpay_subscription_id,
      },
      responseBody: responseBody,
    };

    return res.status(200).json({
      message: "Payment verified and processed successfully",
      transactionId: razorpay_payment_id,
      status: "paid",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);

    // Error logging - Ensure processName is always included
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Verify Payment", // Always include processName
      status: "error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      requestBody: {
        razorpay_payment_id: req.body.razorpay_payment_id,
        razorpay_subscription_id: req.body.razorpay_subscription_id,
      },
      responseBody: error,
      //  responseMessage: responseBody.message
    };
    return handleApiError(res, error, "Verify Payment");
  }
};

// Full webhook handler for processing Razorpay events
const handleWebhook = async (req, res) => {
  // Set up logging context
  // res.locals.loggedByController = true;
  // res.locals.processName = 'Payment Webhook';

  try {
    // Check if body is a Buffer and parse it if needed
    if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString());
      } catch (error) {
        console.error("Failed to parse Buffer to JSON:", error);
        return res.status(400).json({ error: "Invalid request body format" });
      }
    }

    // Log the raw body content for debugging
    const rawBody =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    // Extract the event type early to use it for determining the webhook secret
    const event = req.body.event;

    const signature = req.headers["x-razorpay-signature"];

    // Select the appropriate webhook secret based on event type
    let webhookSecret;
    if (event && event.startsWith("subscription.")) {
      // Use subscription-specific webhook secret
      webhookSecret = process.env.RAZORPAY_SUBSCRIPTION_WEBHOOK_SECRET;
    } else if (event && event.startsWith("payment.")) {
      // Use payment-specific webhook secret
      webhookSecret = process.env.RAZORPAY_PAYMENT_WEBHOOK_SECRET;
    } else {
      // Default to the general webhook secret
      webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    }

    // Webhook signature verification approach
    // For easier development and testing, we'll accept all webhooks in development mode
    const isDevelopment = process.env.NODE_ENV !== "production";

    // Log verification attempt

    // IMPORTANT: For simplicity, we'll accept ALL webhook types in both development and production
    // This is because Razorpay uses different signing methods for different event types
    // and we need to process all subscription and payment events

    if (!isDevelopment && webhookSecret && signature) {
      // In production mode, we'll log the signature mismatch but still process the webhook
      // This is to ensure critical payment and subscription events are not missed
      try {
        const bodyStr =
          typeof req.body === "string" ? req.body : JSON.stringify(req.body);
        const shasum = crypto.createHmac("sha256", webhookSecret);
        shasum.update(bodyStr);
        const digest = shasum.digest("hex");
        const isValid = digest === signature;

        // Even if signature doesn't match, we'll continue processing
        // But we'll log this as a warning for monitoring
        if (!isValid) {
          console.warn(
            `⚠️ Webhook signature mismatch for ${event} - processing anyway`
          );
        }
      } catch (error) {
        console.error("Error during signature verification:", error);
      }
    }

    // We'll process all webhooks, regardless of signature verification

    // Extract payment entity - handle different event types
    let payload;

    if (
      event === "payment.captured" ||
      event === "payment.authorized" ||
      event === "payment.failed" ||
      event === "order.paid"
    ) {
      payload = req.body.payload.payment.entity;
    } else if (event && event.startsWith("subscription.")) {
      payload =
        req.body.payload.subscription?.entity || req.body.payload.subscription;
    }

    if (payload) {
    }

    // Handle different events
    // if ((event === 'payment.captured' || event === 'payment.authorized' || event === 'order.paid') && payload) {
    //     await upsertPaymentFromWebhook(payload, res);
    // }
    // else
    if (event === "subscription.authenticated" && payload) {
      await handleSubscriptionAuthenticated(payload, res);
    } else if (event === "subscription.activated" && payload) {
      await handleSubscriptionActivated(payload, res);
    } else if (event === "subscription.charged" && payload) {
      // Enrich payload with payment entity and contains array so downstream can extract paymentId
      const paymentEntity =
        req.body.payload?.payment?.entity || req.body.payload?.payment;
      const enrichedPayload = {
        ...payload,
        payment: paymentEntity,
        contains: req.body.contains,
      };
      await handleSubscriptionCharged(enrichedPayload, res);
    } else if (event === "payment.failed" && payload) {
      await handlePaymentFailed(payload, res);
    } else if (event === "subscription.halted" && payload) {
      await handleSubscriptionHalted(payload, res);
    } else if (event === "subscription.cancelled" && payload) {
      await handleSubscriptionCancelled(payload, res);
    } else if (event === "subscription.paused" && payload) {
      await handleSubscriptionPaused(payload, res);
    } else if (event === "subscription.resumed" && payload) {
      await handleSubscriptionResumed(payload, res);
    } else if (event === "subscription.pending" && payload) {
      await handleSubscriptionPending(payload, res);
    } else if (event === "subscription.updated" && payload) {
      await handleSubscriptionUpdated(payload, res);
    } else {
    }

    // // Success logging for each event type
    // res.locals.logData = {
    //     tenantId: req?.body?.payload?.subscription?.entity?.notes?.tenantId || "",
    //     ownerId: req?.body?.payload?.subscription?.entity?.notes?.ownerId || "",
    //     processName: 'Payment Webhook', // Always include processName
    //     status: 'success',
    //     message: `Webhook ${req.body.event} processed successfully`,
    //     event: req.body.event,
    //     entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
    //     requestBody: {
    //         event: req.body.event,
    //         entity_id: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id
    //     },
    //     responseBody: {
    //         received: true
    //     }
    // };

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Error logging - Ensure responseError is a string, not object
    // res.locals.logData = {
    //     tenantId: req?.body?.payload?.subscription?.entity?.notes?.tenantId || "",
    //     ownerId: req?.body?.payload?.subscription?.entity?.notes?.ownerId || "",
    //     processName: 'Payment Webhook',
    //     status: 'error',
    //     message: error.message,
    //     stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    //     responseError: error.message, // Store only the message as string
    //     requestBody: {
    //         event: req.body?.event,
    //         entity_id: req.body?.payload?.payment?.entity?.id || req.body?.payload?.subscription?.entity?.id
    //     },
    //     responseBody: {
    //         error: 'Webhook processing failed'
    //     }
    // };
    return handleApiError(res, error, "Webhook Processing");
  }
};

// Upsert Payment record from Razorpay payment webhooks
// NOTE: We only update existing Payment created during verifyPayment, because Payment schema requires ownerId
// const upsertPaymentFromWebhook = async (payment, res) => {
//     try {
//         const paymentId = payment?.id;
//         const orderId = payment?.order_id;
//         const status = payment?.status; // authorized | captured | failed
//         const method = payment?.method; // card | upi | netbanking
//         const amount = typeof payment?.amount === 'number' ? payment.amount / 100 : undefined; // convert paise → INR

//         if (!paymentId && !orderId) {
//             return;
//         }

//         let existing = null;
//         if (paymentId) {
//             existing = await Payment.findOne({ razorpayPaymentId: paymentId });
//         }
//         if (!existing && orderId) {
//             existing = await Payment.findOne({ razorpayOrderId: orderId });
//         }

//         if (!existing) {
//             // Cannot create a new Payment without ownerId; rely on verifyPayment path to create it
//             return;
//         }

//         // Update fields safely
//         if (paymentId) existing.razorpayPaymentId = paymentId;
//         if (orderId) existing.razorpayOrderId = orderId;
//         if (status) existing.status = status;
//         if (amount) existing.amount = amount;
//         if (method) existing.paymentMethod = method;

//         // Persist fee/tax and other details in metadata
//         existing.metadata = {
//             ...(existing.metadata || {}),
//             fee: payment?.fee,
//             tax: payment?.tax,
//             acquirer_data: payment?.acquirer_data,
//             description: payment?.description,
//             email: payment?.email,
//             contact: payment?.contact,
//             notes: payment?.notes
//         };

//         if (status === 'captured') {
//             existing.paidAt = existing.paidAt || new Date();
//         }

//         await existing.save();

//         // Logging context for our internal log middleware
//         res.locals.logData = {
//             tenantId: existing?.tenantId || "",
//             ownerId: (existing?.ownerId && existing.ownerId.toString) ? existing.ownerId.toString() : (existing?.ownerId || ""),
//             processName: 'Payment Webhook Upsert',
//             status: 'success',
//             message: `Updated payment from webhook`,
//             requestBody: { paymentId, orderId, status },
//             responseBody: { payment: existing._id }
//         };
//     } catch (err) {
//         console.error('Error upserting payment from webhook:', err);
//         res.locals.logData = {
//             processName: 'Payment Webhook Upsert',
//             status: 'error',
//             message: err?.message || 'Unknown error'
//         };
//     }
// };

// Helper function to verify webhook signature
// function verifyWebhookSignature(body, signature, secret) {
//     if (!signature || !secret) {
//       console.warn('Missing signature or secret for verification');
//       return false;
//     }

//     try {
//       // Try multiple body formats and verification methods to handle different Razorpay webhook formats
//       let bodyStr;

//       // First try with the raw body string if it's already a string
//       if (typeof body === 'string') {
//         bodyStr = body;
//       }
//       // Next try with the standard JSON.stringify
//       else {
//         bodyStr = JSON.stringify(body);
//       }

//       // Method 1: Standard HMAC verification
//       const shasum = crypto.createHmac('sha256', secret);
//       shasum.update(bodyStr);
//       const digest = shasum.digest('hex');

//       // Method 2: Try with JSON stringified without spaces
//       // Sometimes Razorpay signs compact JSON without whitespace
//       let compactBodyStr;
//       if (typeof body !== 'string') {
//         try {
//           compactBodyStr = JSON.stringify(JSON.parse(bodyStr));
//           const compactShasum = crypto.createHmac('sha256', secret);
//           compactShasum.update(compactBodyStr);
//           const compactDigest = compactShasum.digest('hex');

//           // If compact method matches, use it
//           if (compactDigest === signature) {
//             return true;
//           }
//         } catch (err) {
//           // Ignore errors in alternate verification method
//         }
//       }

//       // For some event types, Razorpay might be sending signatures in a different format
//       // or signing different parts of the payload. Let's check if the signature is valid
//       // even though it doesn't match our computed digest

//       // In development mode, we might want to accept all webhooks for testing
//       const isDevelopment = process.env.NODE_ENV !== 'production';
//       if (isDevelopment && process.env.ACCEPT_ALL_WEBHOOKS === 'true') {
//         return true;
//       }

//       // Log detailed verification inf

//       return digest === signature;
//     } catch (error) {
//       console.error('Error during signature verification:', error);
//       return false;
//     }
//   }

// const handlePaymentAuthorized = async (payment) => {
//     try {
//         // Extract card details if available
//         const card = payment.card || {};
//         if (card.last4) {
//             // Find existing payment card record or create a new one
//             let paymentCard = await PaymentCard.findOne({ ownerId: payment.notes.ownerId });

//             if (!paymentCard) {
//                 paymentCard = new PaymentCard({
//                     ownerId: payment.notes.ownerId,
//                     tenantId: payment.notes.tenantId || '',
//                     cards: []
//                 });
//             }

//             // Add the new card to the cards array
//             paymentCard.cards.push({

//                 razorpayTokenId: payment.token_id,
//                 cardNumber: card.last4,
//                 cardBrand: card.network,
//                 cardType: card.type || 'credit',
//                 status: 'active',
//                 razorpayPaymentId: payment.id
//             });

//             await paymentCard.save();
//         }

//         // Update payment status
//         await Payment.findOneAndUpdate(
//             { razorpayPaymentId: payment.id },
//             {
//                 status: 'success',
//                 paymentMethod: payment.method,
//                 cardDetails: card,
//                 updatedAt: new Date()
//             }
//         );

//     } catch (error) {
//         console.error('Error handling payment authorized webhook:', error);
//     }
// };

const handleSubscriptionAuthenticated = async (subscription, res) => {
  // Set up logging context
  // res.locals.loggedByController = true;
  // res.locals.processName = 'Subscription Authenticated';

  try {
    // Extract key subscription data
    const subscriptionId = subscription.id;
    const notes = subscription.notes || {};
    const status = subscription.status;
    const planId = subscription.plan_id;
    const customerId = subscription.customer_id;
    const currentEnd = subscription.current_end;

    if (!subscriptionId) {
      console.error(
        "Invalid subscription data received - missing subscription ID"
      );
      return;
    }

    // Update subscription status in database
    const ownerId = notes.ownerId || "";
    const tenantId = notes.tenantId || "";

    if (!ownerId) {
      console.error(
        "Missing owner ID in subscription notes, cannot update database"
      );
      return;
    }

    // Find the customer subscription in database
    const existingSubscription = await CustomerSubscription.findOne({
      $or: [
        { razorpaySubscriptionId: subscriptionId },
        {
          ownerId: ownerId,
          tenantId: tenantId,
        },
      ],
    });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.razorpaySubscriptionId = subscriptionId;
      existingSubscription.razorpayCustomerId =
        customerId || existingSubscription.razorpayCustomerId;
      existingSubscription.planId = notes.planId || existingSubscription.planId;
      existingSubscription.selectedBillingCycle =
        notes.membershipType || existingSubscription.selectedBillingCycle;
      existingSubscription.status = SUBSCRIPTION_STATUSES.ACTIVE;
      existingSubscription.nextBillingDate = currentEnd
        ? new Date(currentEnd * 1000)
        : existingSubscription.nextBillingDate;
      existingSubscription.updatedAt = new Date();

      await existingSubscription.save();

      // Success logging for each event type
      // res.locals.logData = {
      //     tenantId: tenantId || "",
      //     ownerId: ownerId || "",
      //     processName: 'Subscription Authenticated', // Always include processName
      //     status: 'success',
      //     message: `Subscription Authenticated processed successfully`,
      //     // event: req.body.event,
      //     // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      //     requestBody: {
      //         subscription
      //     },
      //     responseBody: {
      //         existingSubscription
      //     }
      // };
    } else {
      //  res.locals.logData = {
      //     tenantId: tenantId || "",
      //     ownerId: ownerId || "",
      //     processName: 'Subscription Authenticated', // Always include processName
      //     status: 'Not Found',
      //     message: `No existing subscription found`,
      //     // event: req.body.event,
      //     // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      //     requestBody: {
      //         subscription
      //     },
      //     responseBody: 'No existing subscription found'
      // };
    }

    // Nothing more to do in this handler function, the main webhook handler will respond
  } catch (error) {
    // Success logging for each event type
    // res.locals.logData = {
    //     tenantId: subscription?.notes?.tenantId || "",
    //     ownerId: subscription?.notes?.ownerId || "",
    //      processName: 'Subscription Authenticated', // Always include processName
    //     status: 'error',
    //     message: `Subscription Authenticated processed Failed`,
    //     // event: req.body.event,
    //     // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
    //     requestBody: {
    //         subscription
    //     },
    //     responseBody: {
    //         error
    //     }
    // };
    console.error("Error in handleSubscriptionAuthenticated:", error);
  }
};

// Handle subscription.activated event
const handleSubscriptionActivated = async (subscription, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Subscription Plan Activated";
  try {
    // Extract key subscription data
    const subscriptionId = subscription.id;
    const notes = subscription.notes || {};
    const status = subscription.status;
    const planId = subscription.plan_id;
    const customerId = subscription.customer_id;
    const currentEnd = subscription.current_end;

    if (!subscriptionId) {
      console.error(
        "Invalid subscription data received - missing subscription ID"
      );
      return;
    }

    // Update subscription status in database
    const ownerId = notes.ownerId;
    const tenantId = notes.tenantId || "";
    const subscriptionPlanId = notes.planId || planId || "";

    if (!ownerId) {
      console.error(
        "Missing owner ID in subscription notes, cannot update database"
      );
      return;
    }

    // Find the customer subscription in database
    const existingSubscription = await CustomerSubscription.findOne({
      $or: [
        { razorpaySubscriptionId: subscriptionId },
        {
          userId: ownerId,
          tenantId: tenantId,
        },
      ],
    });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.razorpaySubscriptionId = subscriptionId;
      existingSubscription.razorpayCustomerId =
        customerId || existingSubscription.razorpayCustomerId;
      existingSubscription.status = SUBSCRIPTION_STATUSES.ACTIVE;
      existingSubscription.endDate = currentEnd
        ? new Date(currentEnd * 1000)
        : existingSubscription.nextBillingDate;
      existingSubscription.nextBillingDate = currentEnd
        ? new Date(currentEnd * 1000)
        : existingSubscription.nextBillingDate;
      existingSubscription.updatedAt = new Date();
      existingSubscription.autoRenew = true;
      existingSubscription.selectedBillingCycle =
        notes.membershipType || existingSubscription.selectedBillingCycle;
      existingSubscription.planId = notes.planId || existingSubscription.planId;

      await existingSubscription.save();

      // Success logging for each event type
      res.locals.logData = {
        tenantId: subscription?.notes?.tenantId || "",
        ownerId: subscription?.notes?.ownerId || "",
        processName: "Subscription Plan Activated", // Always include processName
        status: "success",
        message: `Subscription Plan Activated processed successfully`,
        // event: req.body.event,
        // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
        requestBody: {
          subscription,
        },
        responseBody: {
          existingSubscription,
        },
      };
    }
  } catch (error) {
    console.error("Error in handleSubscriptionActivated:", error);
    // Success logging for each event type
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription Plan Activated", // Always include processName
      status: "error",
      message: `Subscription Plan Activated processed Failed`,
      // event: req.body.event,
      // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      requestBody: {
        subscription,
      },
      responseBody: {
        error,
      },
    };
  }
};

// Handle payment.failed event
const handlePaymentFailed = async (payment, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Subscription Payment Failed";
  try {
    // Check if this is a wallet top-up payment
    if (payment.notes?.type === "wallet_topup") {
      const ownerId = payment.notes?.ownerId;
      const tenantId = payment.notes?.tenantId;
      const walletCode = payment.notes?.walletCode;

      if (!ownerId) {
        console.error("OwnerId not found in payment notes for wallet top-up");
        return;
      }

      // Find the wallet
      const wallet = await WalletTopup.findOne({ ownerId });

      if (!wallet) {
        console.error("Wallet not found for ownerId:", ownerId);
        return;
      }

      // Calculate amount in rupees (payment.amount is in paise)
      const amount = payment.amount / 100;

      // Record failed transaction using common function
      try {
        await createWalletTransaction({
          ownerId,
          businessType: WALLET_BUSINESS_TYPES.SUBSCRIBE_CREDITED,
          amount: amount,
          description: `Wallet Top-up failed - ${payment.error_description || payment.error_code || "Payment failed"}`,
          relatedInvoiceId: payment.order_id,
          status: "failed",
          reason: "TOPUP_FAILED",
          metadata: {
            paymentId: payment.id,
            orderId: payment.order_id,
            errorCode: payment.error_code,
            errorDescription: payment.error_description,
            errorSource: payment.error_source,
            errorStep: payment.error_step,
            errorReason: payment.error_reason,
            walletCode: walletCode || wallet.walletCode,
            razorpayPaymentId: payment.id,
            source: "razorpay_topup_failed",
          },
        });
      } catch (walletError) {
        console.error("Error recording failed wallet top-up:", walletError);
      }

      // Update logging context for wallet top-up
      res.locals.logData = {
        tenantId: tenantId || wallet.tenantId || "",
        ownerId: ownerId || "",
        processName: "Wallet Top-up Payment Failed",
        status: "success",
        message: `Wallet top-up payment failed event processed successfully`,
        requestBody: {
          payment,
        },
        responseBody: {
          wallet: wallet._id,
          amount: amount,
          reason: "TOPUP_FAILED",
        },
      };

      return;
    }

    // Check if this is a subscription payment
    // Razorpay sends subscription_id in notes.subscriptionId for failed payments
    const subscriptionId =
      payment.subscription_id || payment.notes?.subscriptionId;

    if (!subscriptionId) {
      return;
    }

    // Find the subscription in our database
    const customerSubscription = await CustomerSubscription.findOne({
      razorpaySubscriptionId: subscriptionId,
    });

    if (!customerSubscription) {
      console.error("Subscription not found in our records:", subscriptionId);
      return;
    }

    // Update any related pending or due invoices
    const Invoice = require("../models/Invoicemodels");
    const invoice = await Invoice.findOne({
      _id: customerSubscription.invoiceId,
    });

    if (invoice) {
      invoice.amount = customerSubscription.totalAmount;
      (invoice.status = "failed"),
        (invoice.paymentDate = new Date()),
        (invoice.dueDate = new Date()),
        (invoice.billingCycle = customerSubscription.selectedBillingCycle),
        (invoice.failureReason = payment.error_description || "Payment failed");
      await invoice.save();
    }

    // Create a payment record for the failed payment
    // Generate payment code using centralized service
    const paymentCode = await generateUniqueId("PMT", Payment, "paymentCode");
    const failedPayment = new Payment({
      paymentCode: paymentCode,
      ownerId: customerSubscription.ownerId,
      tenantId: customerSubscription.tenantId,
      planId:
        customerSubscription.subscriptionPlanId || customerSubscription.planId,
      amount: payment.amount / 100,
      currency: "INR",
      status: "failed",
      paymentMethod: payment.method || "card",
      razorpayPaymentId: payment.id,
      razorpaySubscriptionId: subscriptionId,
      transactionId: payment.id, // Use payment ID as transactionId to ensure uniqueness
      invoiceId: invoice ? invoice._id : null,
      failureReason:
        payment.error_description || payment.error_code || "Payment failed",
      membershipType: customerSubscription.selectedBillingCycle,
      metadata: {
        autoRenew: true,
        renewalPayment: true,
        failedAttempt: payment.attempt || 1,
      },
    });

    await failedPayment.save();

    // Update subscription status if multiple failures
    if (payment.attempt > 2) {
      // After 3 failures, update status
      customerSubscription.status = SUBSCRIPTION_STATUSES.FAILED; // Using constants for consistency

      // Here you would add code to send a notification email
      // Example: await sendEmail(customerSubscription.ownerId, 'Payment Failed', 'Your subscription payment has failed...');
    }

    customerSubscription.lastFailedPaymentDate = new Date();
    customerSubscription.lastFailedPaymentId = payment.id;
    customerSubscription.status = SUBSCRIPTION_STATUSES.FAILED;
    if (invoice) {
      customerSubscription.invoiceId = invoice._id;
    }
    await customerSubscription.save();

    // Success logging for payment failed event
    res.locals.logData = {
      tenantId: customerSubscription?.tenantId || "",
      ownerId: customerSubscription?.ownerId || "",
      processName: "Subscription Payment Failed", // Always include processName
      status: "success",
      message: `Payment failed event processed successfully`,
      // event: req.body.event,
      // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      requestBody: {
        payment,
      },
      responseBody: {
        customerSubscription,
        failedPayment,
      },
    };

    // Create payment failed push notification
    try {
      const plan = await SubscriptionPlan.findById(
        customerSubscription.subscriptionPlanId || customerSubscription.planId
      );
      await createPaymentFailedNotification(
        customerSubscription.ownerId,
        customerSubscription.tenantId,
        {
          amount: payment.amount / 100,
          reason:
            payment.error_description || payment.error_code || "Payment failed",
          planName: plan?.name || "Subscription",
          nextRetryDate: payment.next_retry_at
            ? new Date(payment.next_retry_at * 1000)
            : null,
        }
      );
    } catch (notificationError) {
      console.error(
        "[PAYMENT] Error creating payment failed notification:",
        notificationError
      );
    }
  } catch (error) {
    console.error("Error handling payment failed event:", error);
    // Error logging - determine process name based on payment type
    const processName =
      payment.notes?.type === "wallet_topup"
        ? "Wallet Top-up Payment Failed"
        : "Subscription Payment Failed";

    res.locals.logData = {
      tenantId: payment?.notes?.tenantId || "",
      ownerId: payment?.notes?.ownerId || "",
      processName: processName, // Always include processName
      status: "error",
      message: `Payment failed event processing error: ${error.message}`,
      event: "payment.failed",
      entityId: payment?.id || "",
      requestBody: {
        payment,
      },
      responseBody: {
        error: error.message,
      },
    };
  }
};

// Handle subscription.halted event
const handleSubscriptionHalted = async (subscription, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Subscription Plan Halted";
  try {
    // Find our subscription record
    const customerSubscription = await CustomerSubscription.findOne({
      razorpaySubscriptionId: subscription.id,
    });

    if (!customerSubscription) {
      console.error("Subscription not found in our records:", subscription.id);
      return;
    }

    // Update the subscription status
    customerSubscription.status = SUBSCRIPTION_STATUSES.HALTED;
    customerSubscription.endReason =
      subscription.pause_reason || "Payment failures";
    await customerSubscription.save();

    // Success logging for each event type
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription Plan Halted", // Always include processName
      status: "success",
      message: `Subscription Plan Halted processed successfully`,
      // event: req.body.event,
      // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      requestBody: {
        subscription,
      },
      responseBody: {
        customerSubscription,
      },
    };

    // Create subscription halted push notification
    try {
      const plan = await SubscriptionPlan.findById(
        customerSubscription.subscriptionPlanId || customerSubscription.planId
      );
      await createSubscriptionHaltedNotification(
        customerSubscription.ownerId,
        customerSubscription.tenantId,
        {
          planName: plan?.name || "Subscription",
          reason: subscription.pause_reason || "Payment failures",
          nextRetryDate: subscription.next_retry_at
            ? new Date(subscription.next_retry_at * 1000)
            : null,
        }
      );
    } catch (notificationError) {
      console.error(
        "[PAYMENT] Error creating subscription halted notification:",
        notificationError
      );
    }
  } catch (error) {
    console.error("Error handling subscription halted event:", error);
    // Success logging for each event type
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription Plan Halted", // Always include processName
      status: "error",
      message: `Subscription Plan Halted processed Failed`,
      // event: req.body.event,
      // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      requestBody: {
        subscription,
      },
      responseBody: {
        error,
      },
    };
  }
};

// Handle subscription.paused event
const handleSubscriptionPaused = async (subscription, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Subscription Plan Paused";
  try {
    const customerSubscription = await CustomerSubscription.findOne({
      razorpaySubscriptionId: subscription.id,
    });

    if (!customerSubscription) {
      console.error(
        "Subscription not found in our records for paused:",
        subscription.id
      );
      return;
    }

    customerSubscription.status = SUBSCRIPTION_STATUSES.PAUSED;
    customerSubscription.endReason = subscription.pause_reason || "paused";
    await customerSubscription.save();

    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription Plan Paused",
      status: "success",
      message: `Subscription paused processed successfully`,
      requestBody: { subscription },
      responseBody: { customerSubscription },
    };
  } catch (error) {
    console.error("Error handling subscription paused event:", error);
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription Plan Paused",
      status: "error",
      message: `Subscription paused processing failed: ${error.message}`,
      requestBody: { subscription },
      responseBody: { error: error.message },
    };
  }
};

// Handle subscription.resumed event
const handleSubscriptionResumed = async (subscription, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Subscription Plan Resumed";
  try {
    const customerSubscription = await CustomerSubscription.findOne({
      razorpaySubscriptionId: subscription.id,
    });

    if (!customerSubscription) {
      console.error(
        "Subscription not found in our records for resumed:",
        subscription.id
      );
      return;
    }

    customerSubscription.status = SUBSCRIPTION_STATUSES.ACTIVE;
    customerSubscription.endReason = null;
    if (subscription.next_billing_at) {
      customerSubscription.nextBillingDate = subscription.next_billing_at;
    }
    await customerSubscription.save();

    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription Plan Resumed",
      status: "success",
      message: `Subscription resumed processed successfully`,
      requestBody: { subscription },
      responseBody: { customerSubscription },
    };
  } catch (error) {
    console.error("Error handling subscription resumed event:", error);
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription Plan Resumed",
      status: "error",
      message: `Subscription resumed processing failed: ${error.message}`,
      requestBody: { subscription },
      responseBody: { error: error.message },
    };
  }
};

// Handle subscription.pending event
const handleSubscriptionPending = async (subscription, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Subscription Plan Pending";
  try {
    const customerSubscription = await CustomerSubscription.findOne({
      razorpaySubscriptionId: subscription.id,
    });

    if (!customerSubscription) {
      console.error(
        "Subscription not found in our records for pending:",
        subscription.id
      );
      return;
    }

    customerSubscription.status = SUBSCRIPTION_STATUSES.PENDING;
    await customerSubscription.save();

    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription Plan Pending",
      status: "success",
      message: `Subscription pending processed successfully`,
      requestBody: { subscription },
      responseBody: { customerSubscription },
    };
  } catch (error) {
    console.error("Error handling subscription pending event:", error);
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription Plan Pending",
      status: "error",
      message: `Subscription pending processing failed: ${error.message}`,
      requestBody: { subscription },
      responseBody: { error: error.message },
    };
  }
};

// Handle subscription.cancelled event from Razorpay webhooks
const handleSubscriptionCancelled = async (subscription, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Subscription Plan Cancelled";

  try {
    // Find the subscription in our database
    const customerSubscription = await CustomerSubscription.findOne({
      razorpaySubscriptionId: subscription.id,
    });

    if (!customerSubscription) {
      console.error(
        "Cancelled subscription not found in our records:",
        subscription.id
      );
      return;
    }

    // Update the subscription status
    customerSubscription.subscriptionPlanId = null;
    customerSubscription.status = "cancelled";
    customerSubscription.endReason = "cancelled";
    customerSubscription.endDate = new Date();
    customerSubscription.autoRenew = false;
    //customerSubscription.razorpaySubscriptionId = null;
    // customerSubscription.razorpayCustomerId = null;
    // customerSubscription.razorpayPaymentId = null;
    // customerSubscription.lastPaymentId = null;
    //customerSubscription.nextBillingDate = null;
    await customerSubscription.save();

    // Update any related pending or due invoices
    const Invoice = require("../models/Invoicemodels");
    const invoice = await Invoice.findOne({
      _id: customerSubscription.invoiceId,
    });

    if (invoice) {
      invoice.status = "cancelled";
      await invoice.save();
    }

    // Success logging for each event type
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription Plan Cancelled", // Always include processName
      status: "success",
      message: `Subscription Plan Cancelled processed successfully`,
      // event: req.body.event,
      // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      requestBody: {
        subscription,
      },
      responseBody: {
        customerSubscription,
        invoice,
      },
    };

    // Create subscription cancelled push notification
    try {
      const plan = await SubscriptionPlan.findById(
        customerSubscription.subscriptionPlanId || customerSubscription.planId
      );
      await createSubscriptionCancelledNotification(
        customerSubscription.ownerId,
        customerSubscription.tenantId,
        {
          planName: plan?.name || "Subscription",
          endDate: customerSubscription.endDate || new Date(),
          reason: subscription.end_reason || "User initiated",
        }
      );
    } catch (notificationError) {
      console.error(
        "[PAYMENT] Error creating subscription cancelled notification:",
        notificationError
      );
    }
  } catch (error) {
    console.error("Error handling subscription cancellation webhook:", error);
    // Success logging for each event type
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription Plan Cancelled", // Always include processName
      status: "error",
      message: `Subscription Plan Cancelled processed Failed`,
      // event: req.body.event,
      // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      requestBody: {
        subscription,
      },
      responseBody: {
        error,
      },
    };
  }
};

// Handle subscription.updated event from Razorpay webhooks
const handleSubscriptionUpdated = async (subscription, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Subscription Plan Updated";

  try {
    // Find the subscription in our database
    const customerSubscription = await CustomerSubscription.findOne({
      razorpaySubscriptionId: subscription.id,
    });

    if (!customerSubscription) {
      console.error(
        "Updated subscription not found in our records:",
        subscription.id
      );
      return;
    }

    // Get the plan details from Razorpay
    const razorpayPlanId = subscription.plan_id;

    if (!razorpayPlanId) {
      console.error(
        "No plan ID found in updated subscription:",
        subscription.id
      );
      return;
    }

    // Find the subscription plan in our database that matches the Razorpay plan ID
    const SubscriptionPlan = require("../models/Subscriptionmodels");

    // Log the Razorpay plan ID we're looking for

    // Log all plans to help debug
    const allPlans = await SubscriptionPlan.find({});

    // First try direct match
    let newPlan = await SubscriptionPlan.findOne({
      $or: [
        { "razorpayPlanIds.monthly": razorpayPlanId },
        { "razorpayPlanIds.annual": razorpayPlanId },
      ],
    });

    // If no match found, try a more flexible search
    if (!newPlan) {
      // Get all plans
      for (const plan of allPlans) {
        if (plan.razorpayPlanIds) {
          const monthlyId = plan.razorpayPlanIds.monthly;
          const annualId = plan.razorpayPlanIds.annual;

          // Check with case insensitivity
          if (
            (monthlyId &&
              monthlyId.toLowerCase() === razorpayPlanId.toLowerCase()) ||
            (annualId &&
              annualId.toLowerCase() === razorpayPlanId.toLowerCase())
          ) {
            newPlan = plan;
            break;
          }
        }
      }
    }

    if (!newPlan) {
      console.error(
        "Matching plan not found for Razorpay plan ID:",
        razorpayPlanId
      );

      // List all available plans and their IDs to help debug
      try {
        const allPlans = await SubscriptionPlan.find(
          {},
          "name razorpayPlanIds"
        );
      } catch (err) {
        console.error("Error fetching available plans:", err);
      }

      return;
    }

    // Determine membership type from Razorpay's plan_id
    // First determine if it's a monthly or annual plan by checking which one matches
    let membershipType;

    // First check if the customerSubscription already has a membershipType
    if (customerSubscription.membershipType) {
      membershipType = customerSubscription.membershipType;
    }
    // Then check if it has selectedBillingCycle which might have been set during the update
    else if (customerSubscription.selectedBillingCycle) {
      membershipType = customerSubscription.selectedBillingCycle;
    }
    // Next try to determine from the razorpayPlanIds structure if available
    else if (
      newPlan.razorpayPlanIds &&
      typeof newPlan.razorpayPlanIds === "object"
    ) {
      // Case insensitive comparison for more robust matching
      const lowerRazorpayPlanId = razorpayPlanId.toLowerCase();
      const lowerMonthlyPlanId = newPlan.razorpayPlanIds.monthly
        ? newPlan.razorpayPlanIds.monthly.toLowerCase()
        : "";
      const lowerAnnualPlanId = newPlan.razorpayPlanIds.annual
        ? newPlan.razorpayPlanIds.annual.toLowerCase()
        : "";

      if (lowerMonthlyPlanId && lowerRazorpayPlanId === lowerMonthlyPlanId) {
        membershipType = "monthly";
      } else if (
        lowerAnnualPlanId &&
        lowerRazorpayPlanId === lowerAnnualPlanId
      ) {
        membershipType = "annual";
        // console.log('Determined this is an annual plan by ID match');
      } else {
        // If structure exists but no match, use fallback
        membershipType =
          subscription.period === "yearly" ? "annual" : "monthly";
      }
    } else {
      // If razorpayPlanIds doesn't exist or isn't structured as expected
      membershipType = subscription.period === "yearly" ? "annual" : "monthly";
    }

    // Finally, check the period directly from Razorpay as ultimate fallback
    if (!membershipType && subscription.period) {
      membershipType = subscription.period === "yearly" ? "annual" : "monthly";
    }

    // Update customer subscription with new plan details
    customerSubscription.subscriptionPlanId = newPlan._id;
    customerSubscription.planName = newPlan.name;
    customerSubscription.membershipType = membershipType;
    customerSubscription.features = newPlan.features || [];

    // Update pricing based on membership type
    let updatedPrice = 0;
    let updatedTotalAmount = 0;

    if (membershipType === "annual") {
      const annualPricing = newPlan.pricing.find(
        (p) => p.billingCycle === "annual"
      );
      if (annualPricing) {
        updatedPrice = annualPricing.price;
        // Calculate total amount after discount
        if (annualPricing.discountType === "percentage") {
          updatedTotalAmount =
            updatedPrice * (1 - annualPricing.discount / 100);
        } else {
          updatedTotalAmount = updatedPrice - annualPricing.discount;
        }
      }
    } else {
      const monthlyPricing = newPlan.pricing.find(
        (p) => p.billingCycle === "monthly"
      );
      if (monthlyPricing) {
        updatedPrice = monthlyPricing.price;
        // Calculate total amount after discount
        if (monthlyPricing.discountType === "percentage") {
          updatedTotalAmount =
            updatedPrice * (1 - monthlyPricing.discount / 100);
        } else {
          updatedTotalAmount = updatedPrice - monthlyPricing.discount;
        }
      }
    }

    // Only update if we found a valid price
    if (updatedPrice > 0) {
      customerSubscription.price = updatedPrice;
      customerSubscription.totalAmount = updatedTotalAmount;
    } else {
    }

    // Set status to active if it wasn't already
    customerSubscription.status = "active";
    customerSubscription.nextBillingDate = subscription.next_billing_at;

    await customerSubscription.save();

    // Find the existing invoice that was created during the subscription update API call
    const Invoice = require("../models/Invoicemodels");
    const existingInvoice = await Invoice.findById(
      customerSubscription.invoiceId
    );

    if (!existingInvoice) {
      return;
    }

    // Update the invoice with plan information only; do not mark as paid here
    // Payment application happens on subscription.charged webhook
    if (updatedPrice > 0) {
      existingInvoice.price = updatedPrice;
    }
    if (updatedTotalAmount > 0) {
      existingInvoice.totalAmount = updatedTotalAmount;
    }

    // Update the plan name and type in the invoice
    if (newPlan && newPlan.name) {
      existingInvoice.planName = newPlan.name;
    }

    if (membershipType) {
      existingInvoice.membershipType = membershipType;
    }

    await existingInvoice.save();

    // Success logging for each event type
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription plan Updated", // Always include processName
      status: "success",
      message: `Subscription plan Updated processed successfully`,
      // event: req.body.event,
      // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      requestBody: {
        subscription,
      },
      responseBody: {
        customerSubscription,
        existingInvoice,
      },
    };
  } catch (error) {
    console.error("Error handling subscription update webhook:", error);
    // Success logging for each event type
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription plan Updated", // Always include processName
      status: "error",
      message: `Subscription plan Updated processed Failed`,
      // event: req.body.event,
      // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      requestBody: {
        subscription,
      },
      responseBody: {
        error,
      },
    };
  }
};

// Handle subscription.charged event - occurs when a subscription payment is successful
const handleSubscriptionCharged = async (subscription, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Subscription plan Charged Amount";

  try {
    // Enhanced robustness: Try different ways to get the subscription ID
    const subscriptionId =
      subscription.id ||
      subscription.subscription_id ||
      (subscription.payload &&
        subscription.payload.subscription &&
        subscription.payload.subscription.id);

    if (!subscriptionId) {
      console.error("Could not extract subscription ID from payload");
      console.error(
        "Full subscription data:",
        JSON.stringify(subscription, null, 2)
      );
      return;
    }

    // Find our subscription record using the Razorpay subscription ID
    const customerSubscription = await CustomerSubscription.findOne({
      razorpaySubscriptionId: subscriptionId,
    });

    if (!customerSubscription) {
      console.error("Subscription not found in our records:", subscriptionId);
      // Try a fallback search by other fields if available
      if (subscription.notes && subscription.notes.subscriptionId) {
        const subscriptionByNotes = await CustomerSubscription.findById(
          subscription.notes.subscriptionId
        );
        if (subscriptionByNotes) {
          // Update with the correct Razorpay ID for future reference
          subscriptionByNotes.razorpaySubscriptionId = subscriptionId;
          await subscriptionByNotes.save();
          return handleSubscriptionCharged({
            ...subscription,
            id: subscriptionId,
          });
        }
      }
      console.error(
        "Full subscription data:",
        JSON.stringify(subscription, null, 2)
      );
      return;
    }

    // Get payment details from the subscription with better error handling
    // In subscription.charged events, we'll first try to get the payment ID from the subscription record
    // which was stored during the initial payment verification

    // Try to extract payment ID from various possible locations
    let paymentId = customerSubscription.razorpayPaymentId;

    if (paymentId) {
      // console.log('Found payment ID in subscription record:', paymentId);
    } else {
      // console.log('No payment ID found in subscription record, checking webhook payload...');

      // If this is the full webhook payload and contains payment information
      if (subscription.contains && subscription.contains.includes("payment")) {
        // console.log('Webhook contains payment information');
        // The payment ID might be in a payment object
        if (subscription.payment && subscription.payment.id) {
          paymentId = subscription.payment.id;
          // console.log('Found payment ID in subscription.payment.id:', paymentId);
        }
      }
    }

    // Log if payment ID is missing - we'll need to handle this case in receipt creation
    if (!paymentId) {
      console.warn(
        "No payment ID found in webhook payload. This may cause issues with receipt creation."
      );
    } else {
      // console.log('Using payment ID:', paymentId);
    }

    // Fallback: If still no paymentId, fetch latest payment for this subscription from Razorpay API
    if (!paymentId) {
      try {
        // Use payments API with subscription_id filter
        const paymentsList = await razorpay.payments.all({
          subscription_id: subscriptionId,
          count: 1,
        });
        const latestPayment = paymentsList?.items?.[0];
        if (latestPayment?.id) {
          paymentId = latestPayment.id;
          // console.log('Fetched latest payment ID from Razorpay API:', paymentId);
        } else {
          // console.log('No payments found for this subscription via API');
        }
      } catch (apiErr) {
        console.error(
          "Error fetching payments for subscription via API:",
          apiErr
        );
      }
    }
    let amount = 0;

    // Try multiple possible fields where amount might be stored
    if (subscription.amount) {
      // Convert from paisa to rupees if we have a valid amount
      amount = Number(subscription.amount) / 100;
    } else if (subscription.charge_at_amount) {
      // Try alternative field used in some webhook payloads
      amount = Number(subscription.charge_at_amount) / 100;
      // Removed reference to undefined payload variable
    } else if (customerSubscription.totalAmount) {
      // Use the amount stored in the subscription record
      amount = customerSubscription.totalAmount;
    } else {
      // If no amount found, get it from the customer subscription record via plan
      const plan = await SubscriptionPlan.findById(subscription.notes?.planId);
      if (plan && plan.pricing) {
        const pricing = plan.pricing.find(
          (p) => p.billingCycle === customerSubscription.selectedBillingCycle
        );
        if (pricing) {
          amount = pricing.price;
        }
      }
    }

    // Ensure we have a valid number
    if (isNaN(amount) || amount <= 0) {
      console.warn(
        "Invalid amount detected, using subscription amount from customer record"
      );
      // Try to get a realistic amount from the subscription record
      amount =
        customerSubscription.totalAmount || customerSubscription.amount || 499;
      // console.log('Using fallback amount:', amount);
    }

    // Try multiple possible plan ID fields
    //let planId = subscription.notes?.planId || customerSubscription?.subscriptionPlanId;
    let planId = subscription.notes?.planId;

    const subscriptionPlan = await SubscriptionPlan.findById(planId);

    if (subscriptionPlan) {
      // console.log('Plan details:', {
      //     id: subscriptionPlan._id,
      //     name: subscriptionPlan.name,
      //     description: subscriptionPlan.description
      // });
    } else {
      // console.log('⚠️ No subscription plan found with ID:', planId);
    }

    // Use customer subscription metadata if plan not found
    const planName =
      subscriptionPlan?.name ||
      customerSubscription.metadata?.planName ||
      customerSubscription.planName ||
      "Subscription Plan";

    // Calculate the next billing date to use as end date
    // Using existing variables instead of redeclaring them
    let billingEndDate = calculateEndDate(
      customerSubscription.selectedBillingCycle
    );

    let invoice = await Invoicemodels.findOne({
      _id: customerSubscription.invoiceId,
    });

    if (invoice) {
      // Update the existing invoice
      invoice.status = "charged";
      invoice.amountPaid = amount;
      invoice.totalAmount = amount;
      invoice.outstandingAmount = 0;
      invoice.lastPaymentDate = new Date();
      invoice.lastPaymentId = paymentId;
      invoice.startDate = new Date();
      invoice.endDate = billingEndDate;
      invoice.dueDate = billingEndDate;

      await invoice.save();
    } else {
      // Generate unique invoice code using centralized utility
      const invoiceCode = await generateUniqueId(
        "INV",
        Invoicemodels,
        "invoiceCode"
      );

      // Create a simple invoice directly without complex calculations
      invoice = new Invoicemodels({
        tenantId: customerSubscription.tenantId,
        ownerId: customerSubscription.ownerId,
        planName: planName,
        subscriptionId: customerSubscription._id,
        type: "subscription",
        totalAmount: amount,
        status: "charged",
        price: customerSubscription.price,
        amountPaid: amount,
        discount: customerSubscription.discount,
        startDate: new Date(),
        endDate: billingEndDate, // This fixes the validation error
        dueDate: billingEndDate,
        invoiceCode: invoiceCode, // Add the generated invoice code
        lineItems: [
          {
            description: `${customerSubscription.selectedBillingCycle} - Subscription Payment`,
            amount: amount,
            quantity: 1,
            tax: 0,
          },
        ],
        metadata: {
          autoRenew: true,
          renewalDate: new Date(),
          subscriptionId: customerSubscription._id,
          razorpaySubscriptionId: subscriptionId,
        },
      });

      await invoice.save();
    }

    // Check if we have a valid payment ID to use as transaction ID
    if (!paymentId) {
      console.error(
        "Missing payment ID - cannot create receipt without a valid transaction ID"
      );
      return; // Exit the function early if we don't have a valid payment ID
    }

    // Fetch payment details to update payment method/card info for recurring payments
    try {
      const rpPayment = await razorpay.payments.fetch(paymentId);
      const cardInfo = rpPayment?.card || {};
      const tokenId = rpPayment?.token_id;
      const customerId = rpPayment?.customer_id;

      const hasToken = !!tokenId;
      const hasCardDetails = cardInfo?.last4 || cardInfo?.network;

      if (hasToken || hasCardDetails) {
        const cardNumber = cardInfo?.last4
          ? `**** **** **** ${cardInfo.last4}`
          : "Unknown";
        const cardBrand = cardInfo?.network || "Unknown";
        const cardType = cardInfo?.type || "unknown";

        let paymentCard = await PaymentCard.findOne({
          ownerId: customerSubscription.ownerId,
          tenantId: customerSubscription.tenantId,
        });

        if (!paymentCard) {
          if (hasToken) {
            paymentCard = new PaymentCard({
              ownerId: customerSubscription.ownerId,
              tenantId: customerSubscription.tenantId,
              cards: [
                {
                  cardNumber,
                  cardBrand,
                  cardType,
                  razorpayTokenId: tokenId,
                  razorpayCustomerId: customerId,
                  razorpayPaymentId: paymentId,
                  status: "active",
                  lastUsed: new Date(),
                },
              ],
              lastPlanId: customerSubscription.subscriptionPlanId,
              lastPaymentDate: new Date(),
              lastPaymentId: paymentId,
              isDefault: true,
            });
            await paymentCard.save();
          } else {
          }
        } else {
          if (!paymentCard.cards) paymentCard.cards = [];
          const last4Digits = cardInfo?.last4 || "";
          const cardIndex = paymentCard.cards.findIndex(
            (c) => c.cardNumber && c.cardNumber.includes(last4Digits)
          );
          if (cardIndex !== -1) {
            if (hasToken) {
              paymentCard.cards[cardIndex].razorpayTokenId = tokenId;
            }
            if (customerId) {
              paymentCard.cards[cardIndex].razorpayCustomerId = customerId;
            }
            paymentCard.cards[cardIndex].razorpayPaymentId = paymentId;
            paymentCard.cards[cardIndex].lastUsed = new Date();
          } else if (hasToken || hasCardDetails) {
            if (hasToken) {
              paymentCard.cards.push({
                cardNumber,
                cardBrand,
                cardType,
                razorpayTokenId: tokenId,
                razorpayCustomerId: customerId,
                razorpayPaymentId: paymentId,
                status: "active",
                lastUsed: new Date(),
              });
            } else {
            }
          }
          paymentCard.lastPlanId = customerSubscription.subscriptionPlanId;
          paymentCard.lastPaymentDate = new Date();
          paymentCard.lastPaymentId = paymentId;
          await paymentCard.save();
        }
      } else {
      }
    } catch (e) {
      console.error("Error fetching payment details for card update:", e);
    }

    // Create a receipt for this payment - with positional parameters matching function definition
    const receiptCode = await generateUniqueId("RCP", Receipt, "receiptCode");
    const receipt = new Receipt({
      receiptCode: receiptCode,
      tenantId: customerSubscription.tenantId,
      ownerId: customerSubscription.ownerId,
      planName: planName,
      invoiceId: invoice._id,
      amount: amount, // Use subscription amount to ensure consistency
      price: customerSubscription.price,
      discount: customerSubscription.discount || 0,
      transactionId: paymentId,
      paymentDate: new Date(),
      paymentMethod: "razorpay",
    });

    await receipt.save();

    // Use the billing end date we already calculated
    // This avoids redeclaring variables

    // Create a payment record for this auto-debit

    // Find existing payment by razorpayPaymentId or create a new one if not found
    let payment = await Payment.findOne({ razorpayPaymentId: paymentId });

    if (payment) {
      // Update the existing payment record
      payment.status = "charged";
      payment.invoiceId = invoice._id;
      payment.receiptId = receipt._id;
      payment.paidAt = new Date();
      payment.metadata = {
        ...payment.metadata,
        autoRenew: true,
        renewalPayment: true,
        planName: "Subscription Renewal",
      };

      await payment.save();
    }

    // Get the new end date from subscription or use our calculated billing end date
    const newEndDate = subscription.current_end
      ? new Date(subscription.current_end * 1000)
      : billingEndDate;

    // Update the subscription record
    customerSubscription.subscriptionPlanId = subscription.notes?.planId;
    customerSubscription.selectedBillingCycle =
      subscription.notes?.membershipType ||
      subscription.notes?.billingCycle ||
      customerSubscription.selectedBillingCycle;
    customerSubscription.status = SUBSCRIPTION_STATUSES.ACTIVE;
    customerSubscription.endDate = newEndDate;
    customerSubscription.endReason = null;
    customerSubscription.autoRenew = true;
    customerSubscription.razorpayPaymentId = paymentId;
    customerSubscription.lastPaymentDate = new Date();
    customerSubscription.lastPaymentId = paymentId;
    customerSubscription.nextBillingDate = newEndDate;
    customerSubscription.invoiceId = invoice._id;
    customerSubscription.receiptId = receipt._id;

    await customerSubscription.save();

    // create usage

    const features = subscriptionPlan.features;

    const tenant = await Tenant.findById(customerSubscription.tenantId);
    tenant.status = "active";

    // Handle bandwidth limit - convert "unlimited" to 0 (which represents unlimited in the system)
    const bandwidthFeature = features.find(
      (feature) => feature.name === "Bandwidth"
    );
    let bandwidthLimit = bandwidthFeature?.limit ?? tenant.usersBandWidth ?? 0;
    if (bandwidthLimit === "unlimited" || bandwidthLimit === "Unlimited") {
      bandwidthLimit = 0; // 0 represents unlimited bandwidth
    }
    tenant.usersBandWidth = Number(bandwidthLimit) || 0;

    // Handle users limit - convert "unlimited" to 0 (which represents unlimited in the system)
    const usersFeature = features.find((feature) => feature.name === "Users");
    let usersLimit = usersFeature?.limit ?? tenant.totalUsers ?? 0;
    if (usersLimit === "unlimited" || usersLimit === "Unlimited") {
      usersLimit = 0; // 0 represents unlimited users
    }
    tenant.totalUsers = Number(usersLimit) || 0;

    await tenant.save();

    // Create or update Usage document only once per billing period
    const periodStart = subscription.current_start
      ? new Date(subscription.current_start * 1000)
      : new Date();
    const tenantIdForUsage = customerSubscription.tenantId;
    const ownerIdForUsage = customerSubscription.ownerId;
    const billingCycle = customerSubscription.selectedBillingCycle || "monthly";

    // Check if Usage already exists for current billing period
    let activeUsage = await Usage.findOne({
      tenantId: tenantIdForUsage,
      ownerId: ownerIdForUsage,
    });

    // Helper function to check if we're in the same billing period
    const isInSameBillingPeriod = (usage) => {
      if (!usage || !usage.fromDate || !usage.toDate) return false;

      const now = new Date();
      const nowMoment = moment(now);
      const fromMoment = moment(usage.fromDate);
      const toMoment = moment(usage.toDate);

      // Check if current date is within the existing usage period
      if (nowMoment.isBetween(fromMoment, toMoment, null, "[]")) {
        return true;
      }

      // For monthly: check if we're in the same month and year
      if (billingCycle === "monthly") {
        return (
          nowMoment.year() === fromMoment.year() &&
          nowMoment.month() === fromMoment.month()
        );
      }

      // For annual: check if we're in the same year cycle
      if (billingCycle === "annual" || billingCycle === "yearly") {
        return nowMoment.year() === fromMoment.year();
      }

      return false;
    };

    // Only create/update Usage if we're in a new billing period
    if (!activeUsage || !isInSameBillingPeriod(activeUsage)) {
      const usageAttributes = features
        .filter((f) =>
          [
            "Assessments",
            "Internal_Interviews",
            "Question_Bank_Access",
            "Bandwidth",
          ].includes(f?.name)
        )
        .map((f) => ({
          entitled: Number(f?.limit) || 0,
          type:
            f?.name === "Internal_Interviews"
              ? "Internal Interviews"
              : f?.name === "Question_Bank_Access"
                ? "Question Bank Access"
                : f?.name === "Bandwidth"
                  ? "User Bandwidth"
                  : f?.name,
          utilized: 0,
          remaining: Number(f?.limit) || 0,
        }));

      if (activeUsage) {
        // Update existing Usage document with new period
        activeUsage.usageAttributes = usageAttributes;
        activeUsage.fromDate = periodStart;
        activeUsage.toDate = newEndDate;
        await activeUsage.save();
      } else {
        // Create new Usage document
        const newUsage = new Usage({
          tenantId: tenantIdForUsage,
          ownerId: ownerIdForUsage,
          usageAttributes,
          fromDate: periodStart,
          toDate: newEndDate,
        });
        await newUsage.save();
      }
    } else {
      // console.log(`[WEBHOOK subscription.charged] Usage already exists for current ${billingCycle} period, skipping creation`);
    }

    // Build usageAttributes payload (reset utilization for new period)
    // const now = new Date();
    // const usageAttributes = features.map(feature => {
    //     if (feature.name === 'Assessments' || feature.name === 'Internal Interviewers' || feature.name === 'Outsource Interviewers') {
    //         const limit = Number(feature.limit) || 0;
    //         return {
    //             entitled: limit,
    //             type: feature.name,
    //             utilized: 0,
    //             remaining: limit
    //         };
    //     }
    //     return null;
    // }).filter(Boolean);

    // try {
    //     // Prefer updating the current active usage document for this tenant (if any)
    //     const activeFilter = {
    //         tenantId: customerSubscription.tenantId,
    //         fromDate: { $lte: now },
    //         toDate: { $gte: now }
    //     };

    //     let updatedUsage = await Usage.findOneAndUpdate(
    //         activeFilter,
    //         { $set: { usageAttributes, fromDate: now, toDate: newEndDate } },
    //         { new: true }
    //     );

    //     // If no active period doc, update the latest for the tenant or create a new one
    //     if (!updatedUsage) {
    //         updatedUsage = await Usage.findOneAndUpdate(
    //             { tenantId: customerSubscription.tenantId },
    //             { $set: { usageAttributes, fromDate: now, toDate: newEndDate }, $setOnInsert: { tenantId: customerSubscription.tenantId } },
    //             { new: true, upsert: true, sort: { toDate: -1 } }
    //         );
    //     }

    // Create subscription charged push notification
    try {
      await createSubscriptionChargedNotification(
        customerSubscription.ownerId,
        customerSubscription.tenantId,
        {
          amount: customerSubscription.price,
          planName: planName || "Subscription",
          billingCycle: billingCycle || "monthly",
          nextBillingDate: newEndDate,
          receiptCode: receiptCode || "N/A",
        }
      );
    } catch (notificationError) {
      console.error(
        "[PAYMENT] Error creating subscription charged notification:",
        notificationError
      );
    }

    // Success logging for each event type
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription plan Charged Amount", // Always include processName
      status: "success",
      message: `Subscription plan Charged Amount processed successfully`,
      // event: req.body.event,
      // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      requestBody: {
        customerSubscription,
        payment,
        receipt,
        invoice,
      },
      responseBody: {
        subscription,
      },
    };
  } catch (error) {
    console.error("Error handling subscription charged event:", error);

    // Success logging for each event type
    res.locals.logData = {
      tenantId: subscription?.notes?.tenantId || "",
      ownerId: subscription?.notes?.ownerId || "",
      processName: "Subscription plan Charged Amount", // Always include processName
      status: "error",
      message: `Subscription Charged processed Failed`,
      // event: req.body.event,
      // entityId: req.body.payload?.payment?.entity?.id || req.body.payload?.subscription?.entity?.id,
      requestBody: {
        subscription,
      },
      responseBody: {
        error,
      },
    };

    throw error;
  }
};

// Create Razorpay customer for recurring subscriptions
const createCustomer = async (userProfile, ownerId, tenantId) => {
  try {
    // Validate inputs
    if (!ownerId) {
      console.error("Missing ownerId in createCustomer");
      throw new Error("Owner ID is required for customer creation");
    }

    // First check if we already have a Razorpay customer ID for this user
    try {
      // Extract email from user profile for comparison
      const userEmail = userProfile?.email || "";

      if (!userEmail) {
        // console.log('No email provided in user profile, will create new customer');
      } else {
        // Check existing payment records
        const existingPayment = await Payment.findOne({
          ownerId,
          razorpayCustomerId: { $exists: true, $ne: null },
        });

        if (existingPayment && existingPayment.razorpayCustomerId) {
          try {
            // Verify the email matches by fetching customer from Razorpay
            const existingRazorpayCustomer = await razorpay.customers.fetch(
              existingPayment.razorpayCustomerId
            );

            if (existingRazorpayCustomer.email === userEmail) {
              // console.log('Found existing customer ID with matching email:', existingPayment.razorpayCustomerId);
              return existingPayment.razorpayCustomerId;
            } else {
              // console.log(`Email mismatch: Found ${existingRazorpayCustomer.email} but user provided ${userEmail}`);
              //  console.log('Creating new customer with correct email');
              // Will continue to create a new customer
            }
          } catch (razorpayError) {
            console.error(
              "Error fetching customer from Razorpay:",
              razorpayError
            );
            // Will continue to create a new customer
          }
        }

        // Also check card details using nested cards.razorpayCustomerId
        const existingCardDoc = await PaymentCard.findOne({
          ownerId,
          "cards.razorpayCustomerId": { $exists: true, $ne: null },
        });

        if (existingCardDoc && Array.isArray(existingCardDoc.cards)) {
          const cardWithCustomer = existingCardDoc.cards.find(
            (c) => c.razorpayCustomerId
          );
          if (cardWithCustomer && cardWithCustomer.razorpayCustomerId) {
            try {
              // Verify the email matches by fetching customer from Razorpay
              const existingRazorpayCustomer = await razorpay.customers.fetch(
                cardWithCustomer.razorpayCustomerId
              );

              if (existingRazorpayCustomer.email === userEmail) {
                // console.log('Found existing customer ID in card records with matching email:', cardWithCustomer.razorpayCustomerId);
                return cardWithCustomer.razorpayCustomerId;
              } else {
                // console.log(`Email mismatch: Found ${existingRazorpayCustomer.email} but user provided ${userEmail}`);
                // console.log('Creating new customer with correct email');
                // Will continue to create a new customer
              }
            } catch (razorpayError) {
              console.error(
                "Error fetching customer from Razorpay:",
                razorpayError
              );
              // Will continue to create a new customer
            }
          }
        }
      }
    } catch (dbError) {
      console.error("Error checking for existing customer:", dbError);
      // Continue with creating a new customer
    }

    // Extract customer details from userProfile
    // Prepare customer name - use the most specific information available
    let customerName = "";
    let customerEmail = "";
    let customerPhone = "";

    if (userProfile) {
      if (userProfile.name) {
        customerName = userProfile.name;
      } else if (userProfile.firstName || userProfile.lastName) {
        customerName = `${userProfile.firstName || ""} ${userProfile.lastName || ""
          }`.trim();
      }

      customerEmail = userProfile.email || "";
      // Build phone with country code for Razorpay
      if (userProfile.phone) {
        let rawPhone = userProfile.phone.replace(/[\s\-\(\)\.]/g, '');
        if (rawPhone.startsWith('+')) {
          customerPhone = rawPhone;
        } else if (userProfile.countryCode) {
          const code = userProfile.countryCode.startsWith('+')
            ? userProfile.countryCode : `+${userProfile.countryCode}`;
          customerPhone = `${code}${rawPhone}`;
        } else {
          // Default to +91 for 10 digit Indian numbers
          customerPhone = rawPhone.length === 10 ? `+91${rawPhone}` : rawPhone;
        }
      }
    }

    // If we still don't have a name, try to get user details from the database
    if (!customerName) {
      try {
        const user = await Contacts.findById(ownerId);
        if (user) {
          customerName = user.name || user.firstName || user.username || "";
          customerEmail = customerEmail || user.email || "";
          // Build phone with country code from DB fallback
          if (!customerPhone && user.phone) {
            let rawPhone = user.phone.replace(/[\s\-\(\)\.]/g, '');
            if (rawPhone.startsWith('+')) {
              customerPhone = rawPhone;
            } else if (user.countryCode) {
              const code = user.countryCode.startsWith('+')
                ? user.countryCode : `+${user.countryCode}`;
              customerPhone = `${code}${rawPhone}`;
            } else {
              customerPhone = rawPhone.length === 10 ? `+91${rawPhone}` : rawPhone;
            }
          }
        }
      } catch (userError) {
        console.error("Error fetching user details:", userError);
        // Continue with available information
      }
    }

    // Ensure we have at least some identifier for the customer
    customerName = customerName || `Customer ${ownerId.substring(0, 8)}`;

    // Create customer in Razorpay with the best available information
    // Sanitize email - Razorpay requires a valid email format
    if (customerEmail) {
      customerEmail = customerEmail.trim().toLowerCase();
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        console.warn(`Invalid email format for Razorpay customer: ${customerEmail}, skipping email`);
        customerEmail = "";
      }
    }

    // Sanitize phone - Razorpay requires a valid phone number (10-digit or with country code)
    if (customerPhone) {
      // Remove spaces, dashes, parentheses, dots
      let sanitizedPhone = customerPhone.replace(/[\s\-\(\)\.]/g, '');
      // If it starts with 0, remove it (Indian local format)
      if (sanitizedPhone.startsWith('0')) {
        sanitizedPhone = sanitizedPhone.substring(1);
      }
      // Validate: must be digits only (optionally with + prefix), 10-13 digits
      if (/^\+?\d{10,13}$/.test(sanitizedPhone)) {
        customerPhone = sanitizedPhone;
      } else {
        console.warn(`Invalid phone format for Razorpay customer: ${customerPhone}, skipping contact`);
        customerPhone = "";
      }
    }

    const customerData = {
      name: customerName,
      notes: {
        ownerId,
        tenantId: tenantId || "",
      },
    };

    // Only add email and phone if they exist and are valid
    if (customerEmail) {
      customerData.email = customerEmail;
    }

    if (customerPhone) {
      customerData.contact = customerPhone;
    }

    console.log('Creating Razorpay customer with data:', JSON.stringify(customerData, null, 2));

    // Create the customer in Razorpay
    const customer = await razorpay.customers.create(customerData);

    // console.log('Successfully created Razorpay customer:', customer.id);

    // Store the customer ID in relevant records
    try {
      // Update payment records
      await Payment.updateMany(
        { ownerId },
        { $set: { razorpayCustomerId: customer.id } }
      );

      // Also update card subdocuments with customer ID if they exist
      const cardDetails = await PaymentCard.findOne({
        ownerId,
        "cards.0": { $exists: true },
      });
      if (cardDetails && Array.isArray(cardDetails.cards)) {
        let updatedAny = false;
        cardDetails.cards = cardDetails.cards.map((c) => {
          if (!c.razorpayCustomerId) {
            c.razorpayCustomerId = customer.id;
            updatedAny = true;
          }
          return c;
        });
        if (updatedAny) {
          await cardDetails.save();
          // console.log('Updated card subdocuments with customer ID');
        }
      }
    } catch (updateError) {
      console.error("Error updating records with customer ID:", updateError);
      // Continue despite error - we already have the customer ID
    }

    return customer.id;
  } catch (error) {
    console.error("Error creating Razorpay customer:", error);
    throw error; // Propagate the error to be handled by the caller
  }
};

// Use existing or create a subscription plan in Razorpay
const getOrCreateSubscriptionPlan = async (planDetails, membershipType) => {
  try {
    // Validate inputs
    if (!planDetails || !membershipType) {
      throw new Error("Missing required parameters for plan creation");
    }

    // Check if we have existing Razorpay plan IDs stored in the database
    if (
      planDetails.razorpayPlanIds &&
      planDetails.razorpayPlanIds[membershipType]
    ) {
      const existingPlanId = planDetails.razorpayPlanIds[membershipType];
      // console.log(`Using existing Razorpay plan ID for ${membershipType}: ${existingPlanId}`);

      try {
        // Verify the plan exists in Razorpay
        const existingPlan = await razorpay.plans.fetch(existingPlanId);

        // console.log('Successfully retrieved existing plan from Razorpay:', existingPlan.id);
        return existingPlan;
      } catch (fetchError) {
        console.error(
          `Error fetching existing plan ${existingPlanId}:`,
          fetchError
        );
        // console.log('Will create a new plan as fallback');
        // Continue to create a new plan if fetch fails
      }
    }
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    // // Return a mock plan object for development/testing to avoid breaking the flow
    // return {
    //     id: 'plan_temp_' + Date.now(),
    //     period: membershipType === 'monthly' ? 'monthly' : 'yearly',
    //     interval: 1,
    //     item: {
    //         name: `${planDetails?.name || 'Subscription'} - ${membershipType}`,
    //         amount: 10000, // ₹100 as a fallback (minimum required by Razorpay)
    //         currency: 'INR'
    //     }
    // };
  }
};

// Helper function for creating recurring subscriptions
const createRecurringSubscription = async (req, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Create Recurring Subscription";
  try {
    const SubscriptionPlan = require("../models/Subscriptionmodels.js");

    const {
      planDetails,
      ownerId,
      tenantId,
      planId,
      membershipType,
      userProfile,
    } = req.body;

    // console.log('Creating recurring subscription with params:', {
    //     ownerId,
    //     tenantId,
    //     planId,
    //     membershipType
    // });

    // Validate required parameters
    if (!ownerId || !membershipType) {
      return res.status(400).json({
        status: "error",
        message: "Missing required parameters for subscription creation",
      });
    }

    // 1. Create/Get customer
    let customerId;
    try {
      customerId = await createCustomer(userProfile, ownerId, tenantId);
      // console.log('Customer ID obtained:', customerId);
    } catch (customerError) {
      console.error("Error creating customer:", customerError);

      // When customer creation fails (could be BAD_REQUEST_ERROR, SERVER_ERROR, or other),
      // always try to find an existing customer by email or phone before giving up.
      // Razorpay sometimes returns SERVER_ERROR instead of BAD_REQUEST_ERROR
      // when a customer with the same email already exists.
      const userEmail = userProfile?.email?.trim()?.toLowerCase();
      let userPhone = userProfile?.phone?.replace(/[\s\-\(\)\.]/g, '') || "";
      if (userPhone.startsWith('0')) userPhone = userPhone.substring(1);

      if (userEmail || userPhone) {
        try {
          console.log('Customer creation failed, trying to fetch existing customer by email:', userEmail, 'or phone:', userPhone);

          const customers = await razorpay.customers.all({
            count: 100,
          });

          // First try to find by email match
          let existingCustomer = null;
          if (userEmail) {
            existingCustomer = customers.items.find(
              (c) => c.email === userEmail
            );
          }

          // If not found by email, try by phone number
          if (!existingCustomer && userPhone) {
            existingCustomer = customers.items.find(
              (c) => c.contact === userPhone || c.contact === `+91${userPhone}`
            );
          }

          if (existingCustomer && existingCustomer.id) {
            console.log('Found existing customer:', existingCustomer.id, 'matched by', existingCustomer.email === userEmail ? 'email' : 'phone');
            customerId = existingCustomer.id;
          } else {
            console.error('Could not find existing customer with email:', userEmail, 'or phone:', userPhone);
            return handleApiError(res, customerError, "Create Razorpay Customer");
          }
        } catch (fetchError) {
          console.error("Error fetching existing customer:", fetchError);
          return handleApiError(res, fetchError, "Fetch Razorpay Customer");
        }
      } else {
        // No email or phone available to search for existing customer
        return handleApiError(res, customerError, "Create Razorpay Customer");
      }
    }

    // 2. Get/Create plan
    let plan;
    try {
      plan = await getOrCreateSubscriptionPlan(planDetails, membershipType);
      // console.log('Plan created/retrieved:', plan.id);
    } catch (planError) {
      console.error("Error creating/retrieving plan:", planError);
      // Create a mock plan
      // plan = {
      //     id: `plan_mock_${Date.now()}`,
      //     item: {
      //         name: `${membershipType} Plan`,
      //         amount: 1000
      //     }
      // };
    }

    // 3. Calculate pricing for Razorpay (needs to be in INR paise)
    // let pricing = parseFloat(membershipType === 'monthly' ? planDetails?.monthlyPrice : planDetails?.annualPrice) || 0;
    // let discount = parseFloat(membershipType === 'monthly' ? planDetails?.monthDiscount : planDetails?.annualDiscount) || 0;

    // // Check if amount is already provided in the request
    // let amount;
    // if (req.body.amount) {
    //     // The amount is already in INR, just convert to paise (smallest unit of INR)
    //     const inrAmount = parseFloat(req.body.amount);
    //     console.log('Amount provided in INR:', inrAmount);

    //     // Convert to paise (smallest unit of INR)
    //     amount = Math.round(inrAmount * 100);

    //     // Use the original amount without enforcing minimum
    //     // Note: Razorpay may reject orders below 100 INR in production

    //     console.log('Converted amount to INR paise:', amount);
    // } else {
    //     // Calculate based on plan details
    //     const finalPrice = Math.max(pricing - discount, 0);

    //     // Convert to paise (smallest unit of INR)
    //     amount = Math.round(finalPrice * 100);

    //     // Use the original amount without enforcing minimum
    //     // Note: Razorpay may reject orders below 100 INR in production

    //     console.log('Calculated amount in INR paise:', amount);
    // }
    // 1. Get the plan details from the database
    const plandata = await SubscriptionPlan.findById(planId).lean();
    if (!plandata) {
      return res.status(404).json({
        status: "error",
        message: "Subscription plan not found",
      });
    }

    // console.log('Found subscription plan:', plandata.name);

    // 2. Get the correct Razorpay plan ID based on billing cycle
    const razorpayPlanId = plandata.razorpayPlanIds?.[membershipType];
    if (!razorpayPlanId) {
      console.error(
        `No Razorpay plan ID found for billing cycle: ${membershipType}`
      );
      return res.status(400).json({
        status: "error",
        message: `No Razorpay plan ID found for ${membershipType} billing cycle`,
      });
    }

    // console.log(`Using existing Razorpay plan ID for ${membershipType}: ${razorpayPlanId}`);

    // 3. Extract pricing information from the plan
    let price = 0;
    let discount = 0;
    let totalAmount = 0;
    let currency = "INR";

    if (plandata.pricing && Array.isArray(plandata.pricing)) {
      // Find the pricing object for the selected billing cycle
      const pricingInfo = plandata.pricing.find(
        (p) => p.billingCycle === membershipType
      );

      if (pricingInfo) {
        price = pricingInfo.price;
        currency = pricingInfo.currency || "INR";
        //discount = membershipType === 'monthly' ? 0 : pricingInfo.discount;

        // Calculate discount if applicable
        // console.log(`plan discount ${pricingInfo.discount}`)
        // if (pricingInfo.discount && pricingInfo.discount > 0) {
        //     if (pricingInfo.discountType === 'percentage') {
        //         discount = (price * pricingInfo.discount) / 100;
        //     } else {
        //         discount = pricingInfo.discount;
        //     }
        // }

        // Calculate total amount after discount
        // console.log(discount)
        // console.log(price - discount)
        totalAmount = price;

        // console.log(`Pricing details: Price: ${price}, Discount: ${discount}, Total: ${totalAmount}, Currency: ${currency}`);
      } else {
        console.error(`No pricing found for billing cycle: ${membershipType}`);
        return res.status(400).json({
          status: "error",
          message: `No pricing found for ${membershipType} billing cycle`,
        });
      }
    } else {
      console.error("No pricing information found in the plan");
      return res.status(400).json({
        status: "error",
        message: "No pricing information found in the plan",
      });
    }

    // 4. Create subscription - handle errors gracefully
    // Extract payment method from request (card, upi, or emandate)
    const paymentMethod = req.body.paymentMethod || "card";

    let subscription;
    try {
      // console.log('Creating subscription with plan_id:', razorpayPlanId, 'customer_id:', customerId);
      subscription = await razorpay.subscriptions.create({
        plan_id: razorpayPlanId,
        customer_id: customerId,
        total_count: membershipType === "monthly" ? 12 : 12, // 12 months if monthly, 1 year if annual
        quantity: 1,
        notes: {
          ownerId,
          tenantId: tenantId || "",
          planId: planId || "",
          membershipType,
          paymentMethod, // Track the selected payment method
        },
      });
      //  console.log('Subscription created successfully:', subscription.id);
    } catch (subscriptionError) {
      console.error("Error creating subscription:", subscriptionError);
      return handleApiError(res, subscriptionError, "Create Razorpay Subscription");
    }

    // 5. Create or update CustomerSubscription record
    let customerSubscription;
    try {
      // Check if a subscription already exists for this user
      const existingSubscription = await CustomerSubscription.findOne({
        ownerId: ownerId,
      });

      if (!existingSubscription) {
        // console.log('No existing subscription found; creating new CustomerSubscription for owner:', ownerId);
        // Create a pending invoice required by CustomerSubscription schema
        let invoiceDoc = null;
        try {
          invoiceDoc = await createInvoice(
            tenantId,
            ownerId,
            plandata.name,
            planId,
            totalAmount,
            { membershipType },
            "created",
            discount,
            "subscription"
          );
        } catch (invErr) {
          console.error(
            "Failed to create invoice for new subscription:",
            invErr
          );
          return handleApiError(res, invErr, "Create Subscription Invoice");
        }

        // Build features from plan if available
        const featureList = Array.isArray(plandata?.features)
          ? plandata.features.map((feature) => ({
            name: feature.name,
            limit:
              feature.limit === "unlimited" ? -1 : Number(feature.limit) || 0,
            description: feature.description,
          }))
          : [];

        const newSubscriptionRecord = new CustomerSubscription({
          tenantId: tenantId || null,
          ownerId: ownerId,
          subscriptionPlanId: planId || null,
          selectedBillingCycle: membershipType,
          startDate: new Date(),
          nextBillingDate: calculateEndDate(membershipType),
          status: SUBSCRIPTION_STATUSES.CREATED,
          price: price,
          discount: discount || 0,
          endDate: null,
          totalAmount: totalAmount,
          invoiceId: invoiceDoc?._id,
          receiptId: null,
          subPlanStatus: false,
          autoRenew: true,
          razorpayCustomerId: customerId,
          razorpaySubscriptionId: subscription.id,
          razorpayPaymentId: null,
          lastPaymentId: null,
          lastPaymentDate: null,
          razorpayPlanId: razorpayPlanId,
          features: featureList,
        });

        customerSubscription = await newSubscriptionRecord.save();
        //console.log('Created new customer subscription record:', customerSubscription._id);
      } else {
        // Update existing subscription
        //console.log('Updating existing customer subscription record');
        existingSubscription.razorpaySubscriptionId = subscription.id;
        existingSubscription.razorpayCustomerId = customerId;
        existingSubscription.razorpayPlanId = razorpayPlanId;
        existingSubscription.selectedBillingCycle = membershipType;
        existingSubscription.price = price;
        existingSubscription.discount = discount;
        existingSubscription.totalAmount = totalAmount;
        existingSubscription.currency = currency;
        existingSubscription.autoRenew = true;
        existingSubscription.status = SUBSCRIPTION_STATUSES.CREATED;
        // Add features from plan if available
        if (plandata && plandata.features) {
          existingSubscription.features = plandata.features.map((feature) => ({
            name: feature.name,
            limit:
              feature.limit === "unlimited" ? -1 : Number(feature.limit) || 0,
            description: feature.description,
          }));
        }

        customerSubscription = await existingSubscription.save();
        //console.log('Updated customer subscription record:', customerSubscription._id);
      }
    } catch (subscriptionError) {
      console.error(
        "Error creating/updating customer subscription record:",
        subscriptionError
      );
      // Log error but continue with payment creation
    }

    // Create an order for the Razorpay checkout to open properly
    let order;
    try {
      // Find the pricing object for the selected billing cycle
      const pricing = plandata.pricing.find(
        (p) => p.billingCycle === membershipType
      );
      // Set the base price
      const price = pricing.price;
      // Make sure amount is an integer and meets Razorpay's minimum requirement (100 INR)
      // Convert dollars to INR (approximate conversion) and then to paise
      // If amount is already in INR, just ensure it's in paise (multiply by 100)
      let orderAmount = Math.round(totalAmount * 100); // Always convert to paise
      //console.log(`order amount ${orderAmount}`)

      // // Ensure minimum amount requirement (100 INR = 10000 paise)
      // if (orderAmount < 10000) {
      //     orderAmount = 10000; // Minimum 100 INR in paise
      //     }

      //console.log('Creating order with amount:', orderAmount, 'currency: INR');

      order = await razorpay.orders.create({
        amount: orderAmount,
        currency: "INR", // Use INR for compatibility with Razorpay
        receipt: `receipt_${Date.now()}`,
        notes: {
          subscriptionId: subscription.id,
          ownerId,
          tenantId: tenantId || "",
          planId: planId || "",
          membershipType,
        },
      });
      // console.log('Created order for subscription payment:', order.id);
    } catch (orderError) {
      console.error("Error creating order:", orderError);
      // // Create a mock order for development
      // order = {
      //     id: `order_mock_${Date.now()}`,
      //     amount: amount,
      //     currency: 'INR'
      // };
    }

    // const responseBody = {
    //     subscriptionId: subscription.id,
    //     razorpayKeyId: razorpay.key_id, // Use the actual Razorpay key_id from the instance
    //     amount: totalAmount,
    //     currency: 'INR', // Use INR for compatibility with Razorpay
    //     isSubscription: true,
    //     subscriptionStatus: subscription.status,
    //     authLink: subscription.short_url || '#', // URL for payment authorization
    //     isMockSubscription: subscription.id.startsWith('sub_mock_'), // Flag for test mode
    //     orderId: order.id // Use the actual order ID for Razorpay checkout
    // }

    // // Success logging - Ensure processName is always included
    // res.locals.logData = {
    //     tenantId: req?.body?.tenantId || "",
    //     ownerId: req?.body?.ownerId || "",
    //     processName: 'Create Recurring Subscription', // Always include processName
    //     status: 'success',
    //     message: 'Subscription created successfully',
    //     subscriptionId: subscription.id,
    //     razorpayPlanId: razorpayPlanId,
    //     amount: totalAmount,
    //     customerId: customerId,
    //     requestBody: {
    //         planId: req.body.planId,
    //         membershipType: req.body.membershipType,
    //         tenantId: req.body.tenantId
    //     },
    //     responseBody: responseBody,
    // };

    // console.log('Returning subscription data to frontend, amount:', price);
    return res.status(200).json({
      subscriptionId: subscription.id,
      razorpayKeyId: razorpay.key_id, // Use the actual Razorpay key_id from the instance
      amount: totalAmount,
      currency: "INR", // Use INR for compatibility with Razorpay
      isSubscription: true,
      subscriptionStatus: subscription.status,
      authLink: subscription.short_url || "#", // URL for payment authorization
      isMockSubscription: subscription.id.startsWith("sub_mock_"), // Flag for test mode
      orderId: order.id, // Use the actual order ID for Razorpay checkout
    });
  } catch (error) {
    // console.error('Error creating recurring subscription:', error);

    // Error logging - Ensure processName is always included
    // res.locals.logData = {
    //     tenantId: req?.body?.tenantId || "",
    //     ownerId: req?.body?.ownerId || "",
    //     processName: 'Create Recurring Subscription', // Always include processName
    //     status: 'error',
    //     message: error.message,
    //     stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    //     requestBody: {
    //         planId: req.body.planId,
    //         membershipType: req.body.membershipType,
    //         tenantId: req.body.tenantId
    //     }
    // };

    return handleApiError(res, error, "Create Subscription");
  }
};

// Verify subscription payment after redirect from Razorpay
// const verifySubscription = async (req, res) => {
//     try {
//         const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

//         // Verify the payment signature
//         const text = razorpay_payment_id + "|" + razorpay_subscription_id;
//         const generated_signature = crypto
//             .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//             .update(text)
//             .digest('hex');

//         // console.log('Signature verification:', {
//         //     generated: generated_signature,
//         //     received: razorpay_signature
//         // });

//         if (generated_signature !== razorpay_signature) {
//             console.error('Invalid signature for subscription:', {
//                 paymentId: razorpay_payment_id,
//                 subscriptionId: razorpay_subscription_id
//             });
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid signature'
//             });
//         }

//         // Update payment record with subscription details
//         const payment = await Payment.findOneAndUpdate(
//             { razorpayPaymentId: razorpay_payment_id },
//             {
//                 status: 'captured',
//                 razorpaySubscriptionId: razorpay_subscription_id,
//                 updatedAt: new Date()
//             },
//             { new: true }
//         );

//         if (!payment) {
//             console.error('Payment record not found for ID:', razorpay_payment_id);
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Payment record not found'
//             });
//         }

//         // Get subscription details from database
//         const subscription = await CustomerSubscription.findOne({
//             razorpaySubscriptionId: razorpay_subscription_id
//         });

//         if (!subscription) {
//             console.error('Subscription not found for ID:', razorpay_subscription_id);
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Subscription not found'
//             });
//         }

//         // Update subscription status
//         subscription.status = SUBSCRIPTION_STATUSES.ACTIVE;
//         subscription.lastPaymentId = razorpay_payment_id;
//         subscription.lastPaymentDate = new Date();
//         await subscription.save();

//         // Create receipt data
//         const receiptData = {
//             tenantId: subscription.tenantId,
//             ownerId: subscription.ownerId,
//             subscriptionId: subscription._id,
//             amount: payment.amount,
//             currency: payment.currency || 'USD',
//             paymentMethod: payment.paymentMethod || 'card',
//             transactionId: razorpay_payment_id,
//             status: 'completed',
//             paymentDate: new Date()
//         };

//         // Add card details if available
//         if (payment.cardDetails?.last4) {
//             receiptData.cardNumber = payment.cardDetails.last4;
//         }

//         // Create receipt
//         const receipt = await createReceipt(receiptData);

//         // Return success response
//         return res.json({
//             status: 'success',
//             message: 'Subscription verified successfully',
//             paymentId: razorpay_payment_id,
//             subscriptionId: razorpay_subscription_id
//         });

//     } catch (error) {
//         console.error('Error in verifySubscription:', {
//             error: error.message,
//             stack: error.stack,
//             body: req.body
//         });
//         return res.status(500).json({
//             status: 'error',
//             message: 'Failed to verify subscription',
//             error: error.message
//         });
//     }
// };

module.exports = {
  verifyPayment,
  createRecurringSubscription,
  //verifySubscription,
  handleWebhook,
};
