const CustomerSubscription = require("../models/CustomerSubscriptionmodels.js");
const SubscriptionPlan = require("../models/Subscriptionmodels.js");
const Invoice = require("../models/Invoicemodels.js");
const SubscriptionHistory = require("../models/SubscriptionHistory.js");
const Usage = require("../models/Usage.js");
const moment = require("moment");
const Razorpay = require("razorpay");
const {
  calculateEndDate,
} = require("./CustomerSubscriptionInvoiceContollers.js");
const Tenant = require("../models/Tenant");

// Initialize Razorpay with the same keys used in RazorpayController.js
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Note this is KEY_SECRET not SECRET_KEY
});

/**
 * Controller to update a subscription plan.
 * Handles both free (price 0) and paid plans.
 * - Free plans: skip all Razorpay calls
 * - Paid plans without existing Razorpay subscription: create pending invoice and instruct frontend to proceed to payment.
 * - Paid plans with an existing Razorpay subscription: cancel old RP sub, create new RP sub + order, update local records.
 */

const updateSubscriptionPlan = async (req, res) => {
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Update Subscription Plan";

  // console.log('Request body:', req.body);
  const {
    tenantId,
    ownerId,
    subscriptionId,
    razorpaySubscriptionId,
    newPlanId,
    newBillingCycle,
  } = req.body;

  // console.log('Received request to update subscriptionupadcontroller:', req.body);

  try {
    // 1) Load new plan
    const plan = await SubscriptionPlan.findById(newPlanId).lean();
    if (!plan) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Subscription plan not found in database",
        });
    }

    // 2) Determine pricing for selected cycle
    const selectedPricing = Array.isArray(plan.pricing)
      ? plan.pricing.find((p) => p.billingCycle === newBillingCycle)
      : null;
    if (!selectedPricing) {
      return res
        .status(400)
        .json({
          success: false,
          message: `No pricing configured for billing cycle: ${newBillingCycle}`,
        });
    }
    const basePrice = Number(selectedPricing.price) || 0;
    const discount = Number(selectedPricing.discount) || 0;
    const discountType = selectedPricing.discountType || null;
    let finalPrice = basePrice;
    if (discount > 0) {
      if (discountType === "percentage") {
        finalPrice = Math.max(0, basePrice - (basePrice * discount) / 100);
      } else if (discountType === "flat") {
        finalPrice = Math.max(0, basePrice - discount);
      }
    }

    // 3) Determine Razorpay plan ID only for paid plans
    let planIdToUse = null;
    if (
      finalPrice > 0 &&
      plan.razorpayPlanIds &&
      typeof plan.razorpayPlanIds === "object"
    ) {
      if (newBillingCycle === "annual" && plan.razorpayPlanIds?.annual) {
        planIdToUse = plan.razorpayPlanIds.annual;
      } else if (
        newBillingCycle === "monthly" &&
        plan.razorpayPlanIds?.monthly
      ) {
        planIdToUse = plan.razorpayPlanIds.monthly;
      }
    }

    // 4) Locate subscription record
    let customerSubscription = null;
    if (razorpaySubscriptionId) {
      customerSubscription = await CustomerSubscription.findOne({
        razorpaySubscriptionId,
      });
    }
    if (!customerSubscription && subscriptionId) {
      customerSubscription = await CustomerSubscription.findById(
        subscriptionId
      );
    }
    if (!customerSubscription && ownerId) {
      customerSubscription = await CustomerSubscription.findOne({
        ownerId,
      }).sort({ _id: -1 });
    }
    if (!customerSubscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    // 5) Free plan path (price = 0): skip all Razorpay calls
    if (finalPrice === 0) {
      // Store old plan info for history
      const oldPlanName = customerSubscription.planName;
      const oldPlanId = customerSubscription.subscriptionPlanId;
      const oldBillingCycle = customerSubscription.selectedBillingCycle;
      const oldPrice = customerSubscription.price;
      const oldStatus = customerSubscription.status;
      const oldInvoiceId = customerSubscription.invoiceId;

      // If there is an existing Razorpay subscription, best-effort cancel
      if (customerSubscription.razorpaySubscriptionId) {
        try {
          await razorpay.subscriptions.cancel(
            customerSubscription.razorpaySubscriptionId
          );
          // console.log('Cancelled old Razorpay subscription (moving to free):', customerSubscription.razorpaySubscriptionId);
        } catch (cancelErr) {
          console.warn(
            "Failed to cancel existing Razorpay subscription while moving to free plan:",
            cancelErr?.message
          );
        }
      }

      // Cancel previous invoice (whether from paid or free plan)
      try {
        if (customerSubscription.invoiceId) {
          const oldInvoice = await Invoice.findById(
            customerSubscription.invoiceId
          );
          if (oldInvoice && oldInvoice.status !== "cancelled") {
            oldInvoice.status = "cancelled";
            oldInvoice.metadata = {
              ...oldInvoice.metadata,
              cancelledDate: new Date(),
              cancelReason: `Switched from ${oldPlanName} to ${plan.name}`,
              upgradedToPlan: plan.name,
            };
            await oldInvoice.save();
            // console.log(`Cancelled old invoice (${oldPlanName}):`, oldInvoice.invoiceCode);
          }
        }
      } catch (invErr) {
        console.warn(
          "Failed to cancel previous invoice (free plan switch):",
          invErr?.message
        );
      }

      // Delete current period's Usage document when switching to free plan
      try {
        const now = moment();
        const billingCycle =
          customerSubscription.selectedBillingCycle || "monthly";

        // Find Usage document for current period
        const existingUsage = await Usage.findOne({
          tenantId: customerSubscription.tenantId,
          ownerId: customerSubscription.ownerId,
        });

        if (existingUsage) {
          // Check if this Usage is for the current billing period
          const fromDate = moment(existingUsage.fromDate);
          const toDate = moment(existingUsage.toDate);
          let isCurrentPeriod = false;

          if (billingCycle === "monthly") {
            // Check if Usage is for current month
            isCurrentPeriod =
              now.isSame(fromDate, "month") ||
              now.isBetween(fromDate, toDate, null, "[]");
          } else if (billingCycle === "annual" || billingCycle === "yearly") {
            // Check if Usage is for current year
            isCurrentPeriod =
              now.isSame(fromDate, "year") ||
              now.isBetween(fromDate, toDate, null, "[]");
          }

          if (isCurrentPeriod) {
            await Usage.deleteOne({
              _id: existingUsage._id,
              tenantId: customerSubscription.tenantId,
              ownerId: customerSubscription.ownerId,
            });
            // console.log(`Deleted current ${billingCycle} Usage document for tenant ${customerSubscription.tenantId} and owner ${customerSubscription.ownerId} when switching to free plan`);
          } else {
            // console.log('Keeping Usage document - not for current billing period');
          }
        }
      } catch (usageErr) {
        console.warn(
          "Failed to delete Usage document (free plan switch):",
          usageErr?.message
        );
      }

      // Update local subscription
      customerSubscription.subscriptionPlanId = newPlanId;
      customerSubscription.selectedBillingCycle = newBillingCycle;
      customerSubscription.price = 0;
      customerSubscription.discount = 0;
      customerSubscription.totalAmount = 0;
      customerSubscription.status = "active";
      customerSubscription.autoRenew = false;
      customerSubscription.planName = plan.name;
      // Properly clear Razorpay fields using null instead of undefined
      customerSubscription.razorpaySubscriptionId = null;
      customerSubscription.razorpayPaymentId = null;
      customerSubscription.lastPaymentId = null;
      customerSubscription.endDate = calculateEndDate(newBillingCycle);
      customerSubscription.nextBillingDate = calculateEndDate(newBillingCycle);

      // Create zero-value paid invoice for bookkeeping
      try {
        const lastInvoice = await Invoice.findOne({})
          .sort({ _id: -1 })
          .select("invoiceCode")
          .lean();
        let nextNumber = 50001; // Start from 50001
        if (lastInvoice && lastInvoice.invoiceCode) {
          const match = lastInvoice.invoiceCode.match(/INVC-(\d+)/);
          if (match) {
            const lastNumber = parseInt(match[1], 10);
            nextNumber = lastNumber >= 50001 ? lastNumber + 1 : 50001;
          }
        }
        const invoiceCode = `INVC-${String(nextNumber).padStart(5, "0")}`;

        const newInvoice = new Invoice({
          tenantId: tenantId || customerSubscription.tenantId,
          ownerId: ownerId || customerSubscription.ownerId,
          planId: newPlanId,
          planName: plan.name || "Free Plan",
          type: "subscription",
          price: 0,
          discount: 0,
          totalAmount: 0,
          amountPaid: 0,
          outstandingAmount: 0,
          status: "paid",
          startDate: new Date(),
          endDate: customerSubscription.endDate,
          lineItems: [
            { description: `${newBillingCycle} Plan (Free)`, amount: 0 },
          ],
          invoiceCode,
        });
        await newInvoice.save();
        customerSubscription.invoiceId = newInvoice._id;
      } catch (freeInvErr) {
        console.warn(
          "Failed to create invoice for free plan:",
          freeInvErr?.message
        );
      }

      await customerSubscription.save();

      // Create subscription history record
      try {
        await SubscriptionHistory.create({
          tenantId: customerSubscription.tenantId,
          ownerId: customerSubscription.ownerId,
          oldPlanId: oldPlanId,
          oldPlanName: oldPlanName,
          oldBillingCycle: oldBillingCycle,
          oldPrice: oldPrice,
          oldStatus: oldStatus,
          newPlanId: newPlanId,
          newPlanName: plan.name,
          newBillingCycle: newBillingCycle,
          newPrice: 0,
          action: oldPrice > 0 ? "downgrade" : "switched",
          reason: "User requested plan change",
          oldInvoiceId: oldInvoiceId,
          newInvoiceId: customerSubscription.invoiceId,
          metadata: {
            switchedAt: new Date(),
            switchType: oldPrice > 0 ? "paid-to-free" : "free-to-free",
          },
        });
        // console.log('Created subscription history record');
      } catch (histErr) {
        console.warn(
          "Failed to create subscription history:",
          histErr?.message
        );
      }

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

      // Structured internal log for successful free-plan update
      res.locals.logData = {
        tenantId: tenantId || customerSubscription.tenantId || "",
        ownerId: ownerId || customerSubscription.ownerId || "",
        processName: "Update Subscription Plan",
        requestBody: req.body,
        status: "success",
        message: "Subscription updated to free plan",
        responseBody: {
          subscriptionId: customerSubscription._id,
          invoiceId: customerSubscription.invoiceId,
          planId: customerSubscription.subscriptionPlanId,
          billingCycle: customerSubscription.selectedBillingCycle,
          price: customerSubscription.price,
        },
      };

      return res.status(200).json({
        success: true,
        message: "Subscription updated to free plan",
        requiresPayment: false,
        invoiceId: customerSubscription.invoiceId || null,
      });
    }

    // 6) Paid plan path
    if (!planIdToUse) {
      return res
        .status(400)
        .json({
          success: false,
          message: `No Razorpay plan ID found for ${newBillingCycle} billing cycle`,
        });
    }

    // If no existing Razorpay subscription (e.g., upgrading from free), create a pending invoice and instruct checkout
    // Check for null, undefined, or empty string
    if (
      !customerSubscription.razorpaySubscriptionId ||
      customerSubscription.razorpaySubscriptionId === null
    ) {
      // Store old plan info for history
      const oldPlanName = customerSubscription.planName;
      const oldPlanId = customerSubscription.subscriptionPlanId;
      const oldBillingCycle = customerSubscription.selectedBillingCycle;
      const oldPrice = customerSubscription.price || 0;
      const oldStatus = customerSubscription.status;
      const oldInvoiceId = customerSubscription.invoiceId;

      // First, cancel the old free plan's invoice if it exists
      try {
        if (customerSubscription.invoiceId) {
          const oldInvoice = await Invoice.findById(
            customerSubscription.invoiceId
          );
          if (oldInvoice && oldInvoice.status !== "cancelled") {
            oldInvoice.status = "cancelled";
            oldInvoice.metadata = {
              ...oldInvoice.metadata,
              cancelledDate: new Date(),
              cancelReason: "Plan upgraded",
            };
            await oldInvoice.save();
            // console.log('Cancelled old free plan invoice:', oldInvoice.invoiceCode);
          }
        }
      } catch (cancelErr) {
        console.warn(
          "Failed to cancel old free plan invoice:",
          cancelErr?.message
        );
      }

      // Delete current period's Usage document when upgrading from free to paid plan
      try {
        const now = moment();
        const billingCycle = oldBillingCycle || "monthly";

        // Find Usage document for current period
        const existingUsage = await Usage.findOne({
          tenantId: customerSubscription.tenantId,
          ownerId: customerSubscription.ownerId,
        });

        if (existingUsage) {
          // Check if this Usage is for the current billing period
          const fromDate = moment(existingUsage.fromDate);
          const toDate = moment(existingUsage.toDate);
          let isCurrentPeriod = false;

          if (billingCycle === "monthly") {
            // Check if Usage is for current month
            isCurrentPeriod =
              now.isSame(fromDate, "month") ||
              now.isBetween(fromDate, toDate, null, "[]");
          } else if (billingCycle === "annual" || billingCycle === "yearly") {
            // Check if Usage is for current year
            isCurrentPeriod =
              now.isSame(fromDate, "year") ||
              now.isBetween(fromDate, toDate, null, "[]");
          }

          if (isCurrentPeriod) {
            await Usage.deleteOne({
              _id: existingUsage._id,
              tenantId: customerSubscription.tenantId,
              ownerId: customerSubscription.ownerId,
            });
            // console.log(`Deleted current ${billingCycle} Usage document for tenant ${customerSubscription.tenantId} and owner ${customerSubscription.ownerId} when upgrading from free to paid plan`);
          } else {
            // console.log('Keeping Usage document - not for current billing period');
          }
        }
      } catch (usageErr) {
        console.warn(
          "Failed to delete Usage document (free to paid upgrade):",
          usageErr?.message
        );
      }

      let invoiceId = null;
      try {
        const lastInvoice = await Invoice.findOne({})
          .sort({ _id: -1 })
          .select("invoiceCode")
          .lean();
        let nextNumber = 50001; // Start from 50001
        if (lastInvoice && lastInvoice.invoiceCode) {
          const match = lastInvoice.invoiceCode.match(/INVC-(\d+)/);
          if (match) {
            const lastNumber = parseInt(match[1], 10);
            nextNumber = lastNumber >= 50001 ? lastNumber + 1 : 50001;
          }
        }
        const invoiceCode = `INVC-${String(nextNumber).padStart(5, "0")}`;

        const newInvoice = new Invoice({
          tenantId: tenantId || customerSubscription.tenantId,
          ownerId: ownerId || customerSubscription.ownerId,
          planId: newPlanId,
          planName: plan.name || "Updated Plan",
          type: "subscription",
          price: basePrice,
          discount: basePrice - finalPrice,
          totalAmount: finalPrice,
          amountPaid: 0,
          outstandingAmount: finalPrice,
          status: "pending",
          startDate: new Date(),
          endDate: null,
          lineItems: [
            { description: `${newBillingCycle} Plan`, amount: finalPrice },
          ],
          invoiceCode,
        });
        await newInvoice.save();
        invoiceId = newInvoice._id;
      } catch (invErr) {
        console.error(
          "Error creating invoice for paid upgrade (no existing RP sub):",
          invErr
        );
      }

      // Update local subscription stub
      try {
        customerSubscription.subscriptionPlanId = newPlanId;
        customerSubscription.selectedBillingCycle = newBillingCycle;
        customerSubscription.price = finalPrice;
        customerSubscription.totalAmount = finalPrice;
        customerSubscription.status = "created";
        customerSubscription.autoRenew = true;
        customerSubscription.planName = plan.name;
        customerSubscription.endDate = calculateEndDate(newBillingCycle);
        customerSubscription.nextBillingDate =
          calculateEndDate(newBillingCycle);
        if (invoiceId) customerSubscription.invoiceId = invoiceId;
        if (!customerSubscription.metadata) customerSubscription.metadata = {};
        customerSubscription.metadata.razorpayPlanId = planIdToUse;
        await customerSubscription.save();

        // Create subscription history record for upgrade
        try {
          await SubscriptionHistory.create({
            tenantId: customerSubscription.tenantId,
            ownerId: customerSubscription.ownerId,
            oldPlanId: oldPlanId,
            oldPlanName: oldPlanName,
            oldBillingCycle: oldBillingCycle,
            oldPrice: oldPrice,
            oldStatus: oldStatus,
            newPlanId: newPlanId,
            newPlanName: plan.name,
            newBillingCycle: newBillingCycle,
            newPrice: finalPrice,
            action: "upgrade",
            reason: "User requested plan upgrade",
            oldInvoiceId: oldInvoiceId,
            newInvoiceId: invoiceId,
            metadata: {
              upgradedAt: new Date(),
              upgradeType: "free-to-paid",
            },
          });
          // console.log('Created subscription history record for upgrade');
        } catch (histErr) {
          console.warn(
            "Failed to create subscription history:",
            histErr?.message
          );
        }
      } catch (saveErr) {
        console.error(
          "Error updating local subscription for paid upgrade (no RP sub):",
          saveErr
        );
      }

      // Structured internal log for successful upgrade from free to paid (no existing RP subscription)
      res.locals.logData = {
        tenantId: tenantId || customerSubscription.tenantId || "",
        ownerId: ownerId || customerSubscription.ownerId || "",
        processName: "Update Subscription Plan",
        requestBody: req.body,
        status: "success",
        message: "Proceed to payment to activate the new plan",
        responseBody: {
          subscriptionId: customerSubscription._id,
          invoiceId,
          planId: newPlanId,
          billingCycle: newBillingCycle,
          price: finalPrice,
          razorpayPlanId: planIdToUse,
        },
      };

      return res.status(200).json({
        success: true,
        message: "Proceed to payment to activate the new plan",
        requiresPayment: true,
        invoiceId,
        planId: planIdToUse,
        razorpayKeyId: razorpay.key_id,
      });
    }

    // Existing Razorpay subscription: verify plan, cancel old, create new, create order
    // Store old plan info for history
    const oldPlanName = customerSubscription.planName;
    const oldPlanId = customerSubscription.subscriptionPlanId;
    const oldBillingCycle = customerSubscription.selectedBillingCycle;
    const oldPrice = customerSubscription.price;
    const oldStatus = customerSubscription.status;
    const oldRazorpaySubscriptionId =
      customerSubscription.razorpaySubscriptionId;

    try {
      const planDetails = await razorpay.plans.fetch(planIdToUse);
      // console.log('Verified plan details with Razorpay:', { id: planDetails.id, period: planDetails.period });
    } catch (error) {
      console.error("Error verifying plan with Razorpay:", error);
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid Razorpay plan ID",
          error: error.message,
        });
    }

    const existingRpCustomerId = customerSubscription.razorpayCustomerId;
    const oldInvoiceId = customerSubscription.invoiceId;

    // Try to cancel the old subscription if it exists and is active
    if (customerSubscription.razorpaySubscriptionId) {
      try {
        // First check if the subscription exists and is active
        const existingSubscription = await razorpay.subscriptions.fetch(
          customerSubscription.razorpaySubscriptionId
        );

        // Only cancel if the subscription is in an active state
        if (
          existingSubscription &&
          ["created", "authenticated", "active"].includes(
            existingSubscription.status
          )
        ) {
          await razorpay.subscriptions.cancel(
            customerSubscription.razorpaySubscriptionId
          );
          // console.log('Cancelled old Razorpay subscription (immediate):', customerSubscription.razorpaySubscriptionId);
        } else {
          // console.log('Subscription already cancelled or in terminal state:', existingSubscription?.status);
          // Clear the subscription ID since it's no longer valid
          customerSubscription.razorpaySubscriptionId = null;
        }
      } catch (cancelErr) {
        // If subscription doesn't exist or is already cancelled, just log and continue
        if (
          cancelErr.statusCode === 400 ||
          cancelErr.error?.description?.includes("already")
        ) {
          // console.log('Subscription already cancelled or does not exist, continuing with upgrade');
          customerSubscription.razorpaySubscriptionId = null;
        } else {
          console.error(
            "Error cancelling old Razorpay subscription:",
            cancelErr
          );
          return res
            .status(400)
            .json({
              success: false,
              message: "Failed to cancel existing Razorpay subscription",
            });
        }
      }
    }

    try {
      if (oldInvoiceId) {
        const oldInvoice = await Invoice.findById(oldInvoiceId);
        if (oldInvoice) {
          oldInvoice.status = "cancelled";
          await oldInvoice.save();
        }
      }
    } catch (cancelInvErr) {
      console.error("Error marking previous invoice cancelled:", cancelInvErr);
    }

    // Delete current period's Usage document when switching between paid plans
    try {
      const now = moment();
      const billingCycle = oldBillingCycle || "monthly";

      // Find Usage document for current period
      const existingUsage = await Usage.findOne({
        tenantId: customerSubscription.tenantId,
        ownerId: customerSubscription.ownerId,
      });

      if (existingUsage) {
        // Check if this Usage is for the current billing period
        const fromDate = moment(existingUsage.fromDate);
        const toDate = moment(existingUsage.toDate);
        let isCurrentPeriod = false;

        if (billingCycle === "monthly") {
          // Check if Usage is for current month
          isCurrentPeriod =
            now.isSame(fromDate, "month") ||
            now.isBetween(fromDate, toDate, null, "[]");
        } else if (billingCycle === "annual" || billingCycle === "yearly") {
          // Check if Usage is for current year
          isCurrentPeriod =
            now.isSame(fromDate, "year") ||
            now.isBetween(fromDate, toDate, null, "[]");
        }

        if (isCurrentPeriod) {
          await Usage.deleteOne({
            _id: existingUsage._id,
            tenantId: customerSubscription.tenantId,
            ownerId: customerSubscription.ownerId,
          });
          // console.log(`Deleted current ${billingCycle} Usage document for tenant ${customerSubscription.tenantId} and owner ${customerSubscription.ownerId} when switching between paid plans`);
        } else {
          // console.log(`Keeping Usage document for tenant ${customerSubscription.tenantId} and owner ${customerSubscription.ownerId} - not for current billing period`);
        }
      }
    } catch (usageErr) {
      console.warn(
        "Failed to delete Usage document (paid to paid switch):",
        usageErr?.message
      );
    }

    let newRpSubscription;
    try {
      newRpSubscription = await razorpay.subscriptions.create({
        plan_id: planIdToUse,
        customer_id: existingRpCustomerId,
        total_count: newBillingCycle === "monthly" ? 12 : 12,
        quantity: 1,
        notes: {
          ownerId,
          tenantId: tenantId || "",
          planId: newPlanId || "",
          membershipType: newBillingCycle,
        },
      });
      // console.log('Created new Razorpay subscription for upgrade:', newRpSubscription.id);
    } catch (createErr) {
      console.error("Error creating new Razorpay subscription:", createErr);
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to create new Razorpay subscription",
        });
    }

    const orderAmount = Math.round(finalPrice * 100); // in paise
    let order;
    try {
      order = await razorpay.orders.create({
        amount: orderAmount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          subscriptionId: newRpSubscription.id,
          ownerId,
          tenantId: tenantId || "",
          planId: newPlanId || "",
          membershipType: newBillingCycle,
        },
      });
      // console.log('Created Razorpay order for new subscription authorization:', order.id);
    } catch (orderErr) {
      console.error(
        "Error creating Razorpay order for authorization:",
        orderErr
      );
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to create Razorpay order for authorization",
        });
    }

    try {
      customerSubscription.razorpaySubscriptionId = newRpSubscription.id;
      customerSubscription.razorpayCustomerId =
        existingRpCustomerId || customerSubscription.razorpayCustomerId;
      customerSubscription.subscriptionPlanId = newPlanId;
      customerSubscription.selectedBillingCycle = newBillingCycle;
      customerSubscription.price = finalPrice;
      customerSubscription.totalAmount = finalPrice;
      customerSubscription.status = "created";
      customerSubscription.autoRenew = true;
      customerSubscription.planName = plan.name;
      customerSubscription.endDate = calculateEndDate(newBillingCycle);
      customerSubscription.nextBillingDate = calculateEndDate(newBillingCycle);
      if (!customerSubscription.metadata) customerSubscription.metadata = {};
      customerSubscription.metadata.razorpayPlanId = planIdToUse;
      await customerSubscription.save();
      // console.log('Updated local subscription with new Razorpay subscription ID');
    } catch (saveSubErr) {
      console.error(
        "Error updating local subscription after upgrade:",
        saveSubErr
      );
    }

    try {
      const lastInvoice = await Invoice.findOne({})
        .sort({ _id: -1 })
        .select("invoiceCode")
        .lean();
      let nextNumber = 50001; // Start from 50001
      if (lastInvoice && lastInvoice.invoiceCode) {
        const match = lastInvoice.invoiceCode.match(/INVC-(\d+)/);
        if (match) {
          const lastNumber = parseInt(match[1], 10);
          nextNumber = lastNumber >= 50001 ? lastNumber + 1 : 50001;
        }
      }
      const invoiceCode = `INVC-${String(nextNumber).padStart(5, "0")}`;

      const newInvoice = new Invoice({
        tenantId: tenantId,
        ownerId: ownerId,
        planId: newPlanId,
        planName: plan.name || "Updated Plan",
        type: "subscription",
        price: basePrice,
        discount: basePrice - finalPrice,
        totalAmount: finalPrice,
        status: "pending",
        startDate: new Date(),
        endDate: customerSubscription.endDate,
        lineItems: [
          {
            description: `${newBillingCycle} Plan Upgrade`,
            amount: finalPrice,
          },
        ],
        invoiceCode: invoiceCode,
        outstandingAmount: finalPrice,
      });
      await newInvoice.save();
      customerSubscription.invoiceId = newInvoice._id;
      await customerSubscription.save();
      // console.log('Created invoice and linked to subscription');
    } catch (invErr) {
      console.error(
        "Error creating invoice for upgraded subscription:",
        invErr
      );
    }

    // Create subscription history record for paid-to-paid switch
    try {
      const action =
        oldPrice < finalPrice
          ? "upgrade"
          : oldPrice > finalPrice
          ? "downgrade"
          : "switched";
      await SubscriptionHistory.create({
        tenantId: customerSubscription.tenantId,
        ownerId: customerSubscription.ownerId,
        oldPlanId: oldPlanId,
        oldPlanName: oldPlanName,
        oldBillingCycle: oldBillingCycle,
        oldPrice: oldPrice,
        oldStatus: oldStatus,
        newPlanId: newPlanId,
        newPlanName: plan.name,
        newBillingCycle: newBillingCycle,
        newPrice: finalPrice,
        action: action,
        reason: `User requested plan ${action}`,
        oldInvoiceId: oldInvoiceId,
        newInvoiceId: customerSubscription.invoiceId,
        razorpaySubscriptionId: newRpSubscription.id,
        metadata: {
          switchedAt: new Date(),
          switchType: "paid-to-paid",
          oldRazorpaySubscriptionId: oldRazorpaySubscriptionId,
          newRazorpaySubscriptionId: newRpSubscription.id,
        },
      });
      // console.log(`Created subscription history record for ${action}`);
    } catch (histErr) {
      console.warn("Failed to create subscription history:", histErr?.message);
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

    // Structured internal log for successful paid-to-paid upgrade
    res.locals.logData = {
      tenantId: tenantId || customerSubscription.tenantId || "",
      ownerId: ownerId || customerSubscription.ownerId || "",
      processName: "Update Subscription Plan",
      requestBody: req.body,
      status: "success",
      message:
        "Subscription upgraded successfully. Authorize the new plan payment.",
      responseBody: {
        subscriptionId: customerSubscription._id,
        razorpaySubscriptionId: customerSubscription.razorpaySubscriptionId,
        planId: newPlanId,
        billingCycle: newBillingCycle,
        price: finalPrice,
        razorpayPlanId: planIdToUse,
        orderId: order.id,
      },
    };

    return res.status(200).json({
      success: true,
      message:
        "Subscription upgraded successfully. Authorize the new plan payment.",
      subscriptionId: customerSubscription.razorpaySubscriptionId,
      planId: planIdToUse,
      authLink: "#",
      orderId: order.id,
      razorpayKeyId: razorpay.key_id,
    });
  } catch (err) {
    console.error("Error updating subscription:", err);

    // Structured internal log for error case
    res.locals.logData = {
      tenantId: tenantId || req.body?.tenantId || "",
      ownerId: ownerId || req.body?.ownerId || "",
      processName: "Update Subscription Plan",
      requestBody: req.body,
      status: "error",
      message: err.message,
    };

    return res
      .status(500)
      .json({ success: false, message: "Failed to update subscription" });
  }
};

module.exports = { updateSubscriptionPlan };
