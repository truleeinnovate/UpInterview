// require('dotenv').config();
// const Tenant = require('../models/Tenant');
// const CustomerSubscription = require('../models/CustomerSubscriptionmodels');
// const Invoice = require('../models/Invoicemodels');

// // Initialize Razorpay
// const Razorpay = require('razorpay');
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// /**
//  * Cancel a subscription
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const cancelSubscription = async (req, res) => {
//   try {
//     // Extract request data
//     const { subscriptionId, razorpaySubscriptionId, ownerId } = req.body;

//     if (!subscriptionId || !razorpaySubscriptionId || !ownerId) {
//       return res.status(400).json({ message: 'Missing required subscription information' });
//     }

//     // Step 1: Cancel subscription in Razorpay
//     try {
//       await razorpay.subscriptions.cancel(razorpaySubscriptionId);
//     } catch (razorpayError) {
//       console.error('Error cancelling Razorpay subscription:', razorpayError);
//       return res.status(400).json({ message: 'Failed to cancel Razorpay subscription' });
//     }

//     // Step 2: Update local subscription status and related records
//     let updatedSubscription = null;
//     try {
//       updatedSubscription = await CustomerSubscription.findById(subscriptionId);
//       if (!updatedSubscription) {
//         // Fallback: try by owner and RP subscription id
//         updatedSubscription = await CustomerSubscription.findOne({ ownerId, razorpaySubscriptionId });
//       }

//       if (updatedSubscription) {
//         updatedSubscription.status = 'cancelled';
//         updatedSubscription.autoRenew = false;
//         updatedSubscription.endDate = new Date();
//         updatedSubscription.endReason = 'cancelled';
//         await updatedSubscription.save();

//         // Optionally mark any pending invoice as cancelled
//         if (updatedSubscription.invoiceId) {
//           try {
//             const invoice = await Invoice.findById(updatedSubscription.invoiceId);
//             if (invoice && invoice.status !== 'paid' && invoice.status !== 'cancelled') {
//               invoice.status = 'cancelled';
//               await invoice.save();
//             }
//           } catch (invErr) {
//             console.warn('Failed to update related invoice status on cancel:', invErr?.message);
//           }
//         }
//       }
//     } catch (subErr) {
//       console.error('Failed to update local subscription after RP cancel:', subErr);
//       // Continue, as RP cancel succeeded
//     }

//     // Step 3: Update tenant status to cancelled (best effort)
//     try {
//       const tenant = await Tenant.findOne({ ownerId });
//       if (tenant) {
//         tenant.status = 'cancelled';
//         await tenant.save();
//       }
//     } catch (tenantErr) {
//       console.warn('Failed to update tenant status on cancel:', tenantErr?.message);
//     }

//     // Return success response with updated subscription (if available)
//     return res.status(200).json({
//       message: 'Subscription cancelled successfully',
//       cancelled: true,
//       subscription: updatedSubscription || null
//     });

//   } catch (error) {
//     console.error('Error in subscription cancellation:', error);
//     return res.status(500).json({ message: 'Error cancelling subscription', error: error.message });
//   }
// };

// module.exports = {
//   cancelSubscription
// };

require("dotenv").config();
const Tenant = require("../models/Tenant"); // Adjust path
const CustomerSubscription = require("../models/CustomerSubscriptionmodels"); // Adjust path
const Invoice = require("../models/Invoicemodels"); // Adjust path
const { Users } = require("../models/Users"); // Adjust path
const {
  sendEmailNotification,
} = require("../controllers/EmailsController/signUpEmailController.js");
const SubscriptionPlan = require("../models/Subscriptionmodels.js"); // Adjust path

// Initialize Razorpay
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Cancel a subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelSubscription = async (req, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Cancel Subscription";
  try {
    // Extract request data
    const { subscriptionId, razorpaySubscriptionId, ownerId } = req.body;

    if (!subscriptionId || !razorpaySubscriptionId || !ownerId) {
      return res
        .status(400)
        .json({ message: "Missing required subscription information" });
    }

    // Step 1: Cancel subscription in Razorpay
    try {
      await razorpay.subscriptions.cancel(razorpaySubscriptionId);
    } catch (razorpayError) {
      console.error(
        "❌ Error cancelling Razorpay subscription:",
        razorpayError
      );
      res.locals.logData = {
        ownerId,
        processName: "Cancel Subscription",
        status: "error",
        message: "Failed to cancel Razorpay subscription",
        requestBody: req.body,
        error: razorpayError.message,
      };
      return res
        .status(400)
        .json({ message: "Failed to cancel Razorpay subscription" });
    }

    // Step 2: Update local subscription status and related records
    let updatedSubscription = null;
    try {
      updatedSubscription = await CustomerSubscription.findById(subscriptionId);
      if (!updatedSubscription) {
        // Fallback: try by owner and RP subscription id
        updatedSubscription = await CustomerSubscription.findOne({
          ownerId,
          razorpaySubscriptionId,
        });
      }

      if (updatedSubscription) {
        updatedSubscription.status = "cancelled";
        updatedSubscription.autoRenew = false;
        updatedSubscription.endDate = new Date();
        updatedSubscription.endReason = "cancelled";
        // Clear Razorpay subscription ID since it's cancelled
        updatedSubscription.razorpaySubscriptionId = null;
        updatedSubscription.razorpayPaymentId = null;
        updatedSubscription.lastPaymentId = null;
        await updatedSubscription.save();

        // Mark any related invoice as cancelled (including paid ones for free plans)
        if (updatedSubscription.invoiceId) {
          try {
            const invoice = await Invoice.findById(
              updatedSubscription.invoiceId
            );
            if (invoice && invoice.status !== "cancelled") {
              // Store original status before cancelling (especially for paid free plan invoices)
              const originalStatus = invoice.status;
              invoice.status = "cancelled";

              // Add metadata to track cancellation details
              if (!invoice.metadata) invoice.metadata = {};
              invoice.metadata.cancelledDate = new Date();
              invoice.metadata.cancelReason = "Subscription cancelled by user";
              invoice.metadata.originalStatus = originalStatus;

              await invoice.save();
            }
          } catch (invErr) {
            console.warn(
              "Failed to update related invoice status on cancel:",
              invErr?.message
            );
          }
        }
      }
    } catch (subErr) {
      console.error(
        "Failed to update local subscription after RP cancel:",
        subErr
      );
      // Continue, as RP cancel succeeded
    }
    //no need to update status when cancelled
    // Step 3: Update tenant status to cancelled (best effort)
    // try {
    //   const tenant = await Tenant.findOne({ ownerId });
    //   if (tenant) {
    //     tenant.status = 'cancelled';
    //     await tenant.save();
    //   }
    // } catch (tenantErr) {
    //   console.warn('Failed to update tenant status on cancel:', tenantErr?.message);
    // }

    // Step 4: Send cancellation email (if subscription was found and updated)
    if (updatedSubscription) {
      try {
        // Fetch user details for email
        const user = await Users.findById(ownerId);
        if (user && user.email) {
          // Prepare email data
          const startDate = updatedSubscription.startDate
            ? new Date(updatedSubscription.startDate).toLocaleDateString()
            : "N/A";
          const endDate = updatedSubscription.endDate
            ? new Date(updatedSubscription.endDate).toLocaleDateString()
            : "N/A";
          const subscriptionplandata = await SubscriptionPlan.findById(
            updatedSubscription.subscriptionPlanId
          );
          const planName = subscriptionplandata.name || "Your Plan";

          // Send email using common email controller
          const emailResult = await sendEmailNotification({
            to: user.email,
            category: "subscription_cancelled",
            data: {
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              planName,
              startDate,
              endDate,
              companyName: process.env.COMPANY_NAME || "Your Company",
              supportEmail:
                process.env.SUPPORT_EMAIL || "support@yourcompany.com",
            },
          });

          if (!emailResult.success) {
            console.warn(
              "Failed to send cancellation email:",
              emailResult.message
            );
          } else {
          }
        } else {
          console.warn("User or email not found for ownerId:", ownerId);
        }
      } catch (emailErr) {
        console.error("Failed to send cancellation email:", emailErr);
        // Continue without failing the response
      }
    }

    // STEP 5: Structured log data for centralized tracking
    res.locals.logData = {
      tenantId: updatedSubscription?.tenantId || "",
      ownerId,
      processName: "Cancel Subscription",
      requestBody: req.body,
      status: "success",
      message: "Subscription cancelled successfully",
      responseBody: {
        cancelled: true,
        subscription: updatedSubscription?._id || null,
      },
    };

    // Return success response with updated subscription (if available)
    return res.status(200).json({
      message: "Subscription cancelled successfully",
      cancelled: true,
      subscription: updatedSubscription || null,
    });
  } catch (error) {
    console.error("Error in subscription cancellation:", error);
    res.locals.logData = {
      tenantId: updatedSubscription?.tenantId || "",
      ownerId,
      processName: "Cancel Subscription",
      requestBody: req.body,
      status: "error",
      message: "Subscription cancelled error",
      responseBody: {
        error,
      },
    };
    return res
      .status(500)
      .json({ message: "Error cancelling subscription", error: error.message });
  }
};

module.exports = {
  cancelSubscription,
};
