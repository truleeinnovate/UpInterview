// v1.0.0 - Venkatesh - Added settleInterviewPayment function to handle interview payment settlement from hold to interviewer wallet
// v1.0.1 - Venkatesh - Added tenantId support to wallet creation in getWalletByOwnerId and settleInterviewPayment functions

const mongoose = require("mongoose");
const WalletTopup = require("../models/WalletTopup");
const Razorpay = require("razorpay");
const Payment = require("../models/Payments");
const Invoice = require("../models/Invoicemodels");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService");
const Receipt = require("../models/Receiptmodels");
const BankAccount = require("../models/BankAccount");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const PushNotification = require("../models/PushNotifications");

// Import payment push notification functions
const {
  createWalletTopupNotification,
  createInterviewSettlementNotification,
} = require("./PushNotificationControllers/pushNotificationPaymentController");
const crypto = require("crypto");
const https = require("https");
const {
  MockInterviewRound,
} = require("../models/MockInterview/mockinterviewRound");
const { InterviewRounds } = require("../models/Interview/InterviewRounds");
const Invoicemodels = require("../models/Invoicemodels");
const { RegionalTaxConfig } = require("../models/Pricing");
const Tenant = require("../models/Tenant");

const {
  computeSettlementAmounts,
  findPolicyForSettlement,
  isFirstFreeReschedule,
} = require("../utils/roundPolicyUtil");

// Legacy import before InterviewPolicy DB refactor:
// const { getPayPercent, computeSettlementAmounts } = require("../utils/roundPolicyUtil");

// Platform wallet owner for capturing platform fees & GST
const PLATFORM_WALLET_OWNER_ID =
  process.env.PLATFORM_WALLET_OWNER_ID || "PLATFORM";

// Initialize Razorpay SDK
// Note: This uses the same credentials for both Razorpay (payments) and RazorpayX (payouts)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Helper to get or create the global platform wallet (for superadmin)
async function getOrCreatePlatformWallet(session = null) {
  const ownerId = PLATFORM_WALLET_OWNER_ID;

  // Locate the platform wallet by a fixed ownerId
  let query = WalletTopup.findOne({ isCompany: true });
  if (session) {
    query = query.session(session);
  }

  let wallet = await query;

  if (!wallet) {
    // Create a new platform wallet with isCompany marked as true
    wallet = new WalletTopup({
      ownerId,
      isCompany: true,
      currency: "INR",
      tenantId: "",
      balance: 0,
      holdAmount: 0,
      transactions: [],
    });

    if (session) {
      await wallet.save({ session });
    } else {
      await wallet.save();
    }
  } else if (!wallet.isCompany) {
    // Backward compatibility: ensure existing platform wallet is flagged as company
    wallet.isCompany = true;

    if (session) {
      await wallet.save({ session });
    } else {
      await wallet.save();
    }
  }

  return wallet;
}

// Get or create the global platform wallet (superadmin)
const getPlatformWallet = async (req, res) => {
  try {
    // Prefer any wallet that is explicitly marked as company
    let wallet = await WalletTopup.findOne({
      isCompany: true,
    });

    // Fallback: create or normalize the platform wallet if not found
    if (!wallet) {
      wallet = await getOrCreatePlatformWallet();
    }

    return res.status(200).json({
      success: true,
      wallet,
    });
  } catch (error) {
    console.error("[getPlatformWallet] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch platform wallet",
      error: error.message,
    });
  }
};

/**
 * WEBHOOK SECRETS:
 * Different webhook endpoints have different secrets!
 *
 * - RAZORPAY_WALLET_WEBHOOK_SECRET: For wallet top-up payments (payment.captured)
 * - RAZORPAY_PAYOUT_WEBHOOK_SECRET: For RazorpayX payouts (payout.processed, payout.failed)
 * - RAZORPAY_PAYMENT_WEBHOOK_SECRET: For regular payments (non-wallet)
 * - RAZORPAY_SUBSCRIPTION_WEBHOOK_SECRET: For subscription events
 *
 * Get these from: Razorpay Dashboard > Settings > Webhooks > Your Webhook > Secret
 */

// Get wallet by owner ID
const getWalletByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Validate ownerId
    if (!ownerId) {
      return res.status(400).json({ error: "ownerId is required" });
    }

    // Find or create wallet
    let wallet = await WalletTopup.findOne({ ownerId });

    if (!wallet) {
      // Log when creating wallet without tenantId
      console.warn(`[getWalletByOwnerId] wallet for ${ownerId} not found`);
    }

    res.status(200).json({ walletDetials: [wallet] });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create Razorpay order for wallet top-up
const createTopupOrder = async (req, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Create Wallet Top-up Order";

  try {
    const { amount, currency = "INR", ownerId, tenantId } = req.body;

    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    if (!ownerId) {
      return res.status(400).json({ error: "ownerId is required" });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys are not configured");
      return res.status(500).json({
        error: "Payment configuration error. Please contact support.",
      });
    }

    // Determine walletCode: reuse existing wallet's code if present, otherwise generate a new one
    let walletCode;
    const existingWallet = await WalletTopup.findOne({ ownerId })
      .select("walletCode")
      .lean();

    if (existingWallet?.walletCode) {
      walletCode = existingWallet.walletCode;
    } else {
      // Generate unique wallet code using centralized service
      try {
        walletCode = await generateUniqueId("WLT", WalletTopup, "walletCode");
      } catch (error) {
        console.error("Failed to generate wallet code:", error);
        return res.status(500).json({
          success: false,
          error:
            "Unable to generate unique wallet code. Please try again later.",
        });
      }
    }

    // Convert amount to smallest currency unit (cents)
    const amountInSmallestUnit = Math.round(amount * 100);

    // Create a shorter receipt ID to comply with Razorpay's 40 character limit
    // Use a timestamp and last 6 chars of ownerId to keep it unique but shorter
    const timestamp = Date.now().toString().slice(-10);
    const shortOwnerId = ownerId.slice(-6);
    const receipt = `wallet-${timestamp}-${shortOwnerId}`;

    // Make sure receipt is not longer than 40 chars
    const finalReceipt = receipt.slice(0, 39);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency: currency,
      receipt: finalReceipt,
      notes: {
        type: "wallet_topup",
        ownerId,
        tenantId: tenantId || "",
        walletCode: walletCode,
      },
    });

    // STEP 5: Store structured log data for success
    res.locals.logData = {
      tenantId: tenantId || "",
      ownerId,
      processName: "Create Wallet Top-up Order",
      requestBody: req.body,
      status: "success",
      message: "Wallet top-up order created successfully",
      responseBody: {
        orderId: order.id,
        walletCode,
        amount,
        currency,
      },
    };

    res.status(200).json({
      orderId: order.id,
      amount: amount,
      currency: currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const razorpayErrorData = error?.response?.data;
    console.error(
      "Error creating topup order:",
      razorpayErrorData || error
    );
    // STEP 5: Store structured log data for success
    res.locals.logData = {
      tenantId: req?.body?.tenantId || "",
      ownerId: req?.body?.ownerId,
      processName: "Create Wallet Top-up Order",
      requestBody: req.body,
      status: "error",
      message: "Wallet top-up order created Failed",
      responseBody: {
        error: razorpayErrorData || error,
      },
    };
    res.status(500).json({
      error:
        razorpayErrorData?.error?.description ||
        razorpayErrorData?.error?.reason ||
        "Failed to create topup order",
    });
  }
};

// Verify payment and update wallet balance
const walletVerifyPayment = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Wallet Payment Verification";

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      ownerId,
      tenantId,
      amount,
      currency = "INR",
      description = "Wallet Top-up via Razorpay",
    } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error("Missing required Razorpay fields", {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      });
      res.locals.logData = {
        tenantId: req?.body?.tenantId || "",
        ownerId: req?.body?.ownerId,
        processName: "Wallet Payment Verification",
        status: "error",
        message: "Missing required Razorpay verification fields",
        requestBody: req.body,
        responseBody: {
          error: "Missing required Razorpay verification fields",
        },
      };
      return res
        .status(400)
        .json({ error: "Missing required Razorpay verification fields" });
    }

    if (!ownerId) {
      console.error("Missing ownerId");
      res.locals.logData = {
        tenantId: req?.body?.tenantId || "",
        ownerId: req?.body?.ownerId,
        processName: "Wallet Payment Verification",
        status: "error",
        message: "Missing required Razorpay verification fields",
        requestBody: req.body,
        responseBody: {
          error: "Owner ID is required",
        },
      };
      return res.status(400).json({ error: "Owner ID is required" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error("Invalid signature", {
        expected: expectedSignature,
        received: razorpay_signature,
      });
      res.locals.logData = {
        tenantId: req?.body?.tenantId || "",
        ownerId: req?.body?.ownerId,
        processName: "Wallet Payment Verification",
        status: "error",
        message: "Invalid signature",
        requestBody: req.body,
        responseBody: {
          expectedSignature,
          receivedSignature,
          error: "Invalid payment signature",
        },
      };
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // console.log("Signature validated successfully");

    // Get payment details from Razorpay - Make this optional
    // If we can't get payment details, we'll trust the signature verification
    let paymentVerified = false;
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment && payment.status) {
        // console.log("Payment details fetched:", payment.status);

        if (payment.status === "captured" || payment.status === "authorized") {
          paymentVerified = true;
        } else {
          // console.log(
          //   `Payment status is ${payment.status}, continuing with signature verification only`
          // );
        }
      } else {
        // console.log(
        //   "Payment details incomplete, continuing with signature verification only"
        // );
      }
    } catch (razorpayError) {
      console.error("Error fetching payment from Razorpay:", razorpayError);
      // console.log("Continuing with signature verification only");
      // Instead of returning an error, we'll continue with signature verification
      // This makes our process more robust in case Razorpay API has issues
    }

    // Since the signature is valid, we'll proceed with the payment processing
    // The signature verification is our primary method of validating payments
    // console.log("Proceeding based on valid signature verification");

    // Try to retrieve walletCode from the Razorpay order notes if available
    let walletCodeFromNotes = null;
    try {
      const orderDetails = await razorpay.orders.fetch(razorpay_order_id);
      walletCodeFromNotes = orderDetails?.notes?.walletCode || null;
      if (walletCodeFromNotes) {
        // console.log("walletCode from Razorpay order notes:", walletCodeFromNotes);
      }
    } catch (orderFetchErr) {
      // console.log("Could not fetch Razorpay order details; proceeding without notes");
    }

    // Find or create wallet and ensure it has a walletCode
    let wallet;
    wallet = await WalletTopup.findOne({ ownerId });

    // If wallet doesn't exist or doesn't have a walletCode, we need to create/update it
    if (!wallet || !wallet.walletCode) {
      try {
        // Determine effective wallet code
        let effectiveWalletCode =
          (wallet && wallet.walletCode) || walletCodeFromNotes;

        // Generate a wallet code using centralized service (already handles retries internally)
        if (!effectiveWalletCode) {
          effectiveWalletCode = await generateUniqueId(
            "WLT",
            WalletTopup,
            "walletCode"
          );
        }

        if (!wallet) {
          // console.log("Creating new wallet for owner:", ownerId);
          wallet = await WalletTopup.create({
            ownerId,
            walletCode: effectiveWalletCode,
            tenantId: tenantId || "",
            balance: 0,
            holdAmount: 0,
            transactions: [],
          });
        } else if (!wallet.walletCode) {
          wallet.walletCode = effectiveWalletCode;
          await wallet.save();
        }
      } catch (error) {
        console.error("Error creating/updating wallet:", error);

        res.locals.logData = {
          tenantId: req?.body?.tenantId || "",
          ownerId: req?.body?.ownerId,
          processName: "Wallet Payment Verification",
          status: "error",
          message: "Database error while creating wallet",
          error: error.message,
          requestBody: req.body,
          responseBody: {
            error: error.message,
          },
        };

        return res.status(500).json({
          error: "Database error when accessing wallet",
        });
      }
    }

    // Parse amount as number and validate
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error("Invalid amount:", amount);
      return res.status(400).json({ error: "Invalid amount provided" });
    }

    // Add transaction - semantic type `topup` for wallet credit
    const transaction = {
      type: "topup",
      amount: parsedAmount,
      description,
      relatedInvoiceId: razorpay_order_id, // Using relatedInvoiceId for compatibility
      status: "completed",
      metadata: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      },
      createdDate: new Date(),
    };

    // Check if this payment has already been processed
    const existingTransaction = wallet.transactions.find(
      (txn) => txn.metadata && txn.metadata.paymentId === razorpay_payment_id
    );

    if (existingTransaction) {
      // console.log("Payment already processed, returning success");
      return res.status(200).json({
        success: true,
        wallet,
        transaction: existingTransaction,
        message: "Payment already processed",
      });
    }

    // Variables to hold created records
    let invoice = null;
    let receipt = null;
    let payment = null;
    let recordCreationError = null;

    // Update wallet balance and add transaction
    try {
      // Credit transactions always increase the available balance immediately
      wallet.balance += parsedAmount;
      wallet.transactions.push(transaction);
      await wallet.save();
      // console.log("Wallet updated successfully", { balance: wallet.balance });

      /* ------------------------------------------------------------------
         Create simple Invoice, Receipt and Payment records for this top-up
         ------------------------------------------------------------------ */

      try {
        // Generate unique invoice code using centralized utility
        const invoiceCode = await generateUniqueId(
          "INVC",
          Invoicemodels,
          "invoiceCode"
        );

        // 1. Invoice
        invoice = await Invoice.create({
          tenantId: tenantId || "",
          ownerId,
          planName: "Wallet Top-up",
          type: "wallet",
          totalAmount: parsedAmount,
          amountPaid: parsedAmount,
          status: "paid",
          lineItems: [
            {
              description: "Wallet Top-up",
              amount: parsedAmount,
              quantity: 1,
              tax: 0,
            },
          ],
          invoiceCode,
          metadata: {
            walletCode: wallet?.walletCode || null,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
          },
        });

        // Generate receipt code using centralized service
        const receiptCode = await generateUniqueId(
          "RCP",
          Receipt,
          "receiptCode"
        );

        // 2. Receipt – reference the created invoice
        receipt = await Receipt.create({
          invoiceId: invoice._id,
          tenantId: tenantId || "",
          ownerId,
          amount: parsedAmount,
          paymentMethod: "razorpay",
          transactionId: razorpay_payment_id,
          receiptCode: receiptCode,
          status: "success",
        });

        // Generate payment code
        const paymentCode = await generateUniqueId(
          "PMT",
          Payment,
          "paymentCode"
        );

        // 3. Payment – reference both invoice & receipt
        payment = await Payment.create({
          paymentCode: paymentCode,
          tenantId: tenantId || "",
          ownerId,
          amount: parsedAmount,
          currency: currency || "INR",
          status: "captured",
          paidAt: new Date(),
          paymentMethod: "wallet",
          paymentGateway: "razorpay",
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          transactionId: razorpay_payment_id,
          invoiceId: invoice._id,
          receiptId: receipt._id,
        });
      } catch (recordErr) {
        console.error(
          "Error creating payment/invoice/receipt records:",
          recordErr
        );
        // Store error details for response
        recordCreationError = {
          message:
            "Wallet topped up successfully, but failed to create some records",
          error: recordErr.message,
          invoice: invoice ? "created" : "failed",
          receipt: receipt ? "created" : "failed",
          payment: payment ? "created" : "failed",
        };
        // We will not fail the entire request if these records cannot be created;
        // wallet top-up has already been credited. Just continue.
      }
    } catch (saveError) {
      console.error("Error saving wallet:", saveError);
      return res
        .status(500)
        .json({ error: "Failed to update wallet", details: saveError.message });
    }

    // Create wallet top-up push notification
    try {
      await createWalletTopupNotification(ownerId, tenantId, {
        amount: parsedAmount,
        walletCode: wallet.walletCode,
        newBalance: wallet.balance,
        invoiceCode: invoice?.code || "N/A",
      });
      // console.log('[WALLET] Top-up notification created');
    } catch (notificationError) {
      console.error(
        "[WALLET] Error creating top-up notification:",
        notificationError
      );
      // Don't fail the response if notification fails
    }

    res.locals.logData = {
      tenantId: req?.body?.tenantId || "",
      ownerId: req?.body?.ownerId,
      processName: "Wallet Payment Verification",
      status: "success",
      message: "Payment verified successfully",
      requestBody: req.body,
      responseBody: {
        success: true,
        wallet,
        transaction,
        invoice,
        receipt,
        payment,
      },
    };

    res.status(200).json({
      success: true,
      wallet,
      transaction,
      invoice,
      receipt,
      payment,
      ...(recordCreationError && { warning: recordCreationError }),
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.locals.logData = {
      tenantId: req?.body?.tenantId || "",
      ownerId: req?.body?.ownerId,
      processName: "Wallet Payment Verification",
      status: "error",
      message: "Failed to verify payment",
      error: error.message || "Unknown error",
      requestBody: req.body,
      responseBody: {
        error: "Failed to verify payment",
        message: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    };
    res.status(500).json({
      error: "Failed to verify payment",
      message: error.message || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Webhook handler for Razorpay events
// const handleWebhook = async (req, res) => {
//   try {
//     console.log('Received webhook event:', req.body.event);
//     console.log('============== WALLET WEBHOOK RECEIVED ==============');
//     console.log('Timestamp:', new Date().toISOString());
//     console.log('Event:', req.body.event);

//     const signature = req.headers['x-razorpay-signature'];
//     const secret = process.env.RAZORPAY_Wallet_WEBHOOK_SECRET;

//     // If we don't have a webhook secret configured, use a fallback verification
//     if (!secret) {
//       console.log('Using entire webhook body as fallback');
//       // Just log and proceed for now
//     } else {
//       // Verify webhook signature
//       const isValid = verifyWebhookSignature(req.body, signature, secret);
//       if (!isValid) {
//         console.error('Invalid webhook signature');
//         return res.status(400).json({ error: 'Invalid webhook signature' });
//       }
//     }

//     const event = req.body.event;
//     console.log('Full webhook body:', JSON.stringify(req.body).substring(0, 200) + '...');

//     // Extract payment entity - handle different event types
//     let payload;
//     try {
//       // Different events have different payload structures
//       if (event === 'payment.captured' || event === 'payment.authorized') {
//         payload = req.body.payload.payment.entity;
//       } else if (req.body.payload && req.body.payload.payment) {
//         payload = req.body.payload.payment.entity;
//       } else {
//         console.log('Unknown event structure, trying to find payment data');
//         // Try to find payment data in the payload
//         payload = req.body.payload.entity || req.body.payload;
//       }

//       console.log('Extracted payload entity:', payload ? 'Found' : 'Not found');
//       if (payload) {
//         console.log('Payment ID:', payload.id);
//         console.log('Payment status:', payload.status);
//       }
//     } catch (err) {
//       console.error('Failed to extract payment payload:', err.message);
//       payload = null;
//     }

//     // Handle different events
//     if ((event === 'payment.captured' || event === 'payment.authorized') && payload) {
//       console.log('Payment status updated from webhook for payment ID:', payload.id);

//       // Extract notes from payment
//       const notes = payload.notes || {};

//       if (notes.type === 'wallet_topup') {
//         try {
//           const ownerId = notes.ownerId;
//           const tenantId = notes.tenantId || 'default';
//           const amount = payload.amount / 100; // Convert from smallest unit

//           // Find wallet
//           let wallet = await WalletTopup.findOne({ ownerId });

//           if (!wallet) {
//             console.log('Creating new wallet for webhook event');
//             wallet = await WalletTopup.create({
//               ownerId,
//               tenantId,
//               balance: 0,
//               transactions: []
//             });
//           }

//           // Check if this transaction was already processed
//           const existingTransaction = wallet.transactions.find(
//             txn => txn.metadata && txn.metadata.paymentId === payload.id
//           );

//           if (!existingTransaction) {
//             // Add transaction - ensure we use lowercase transaction type
//             const transaction = {
//               type: 'credit', // Explicitly lowercase
//               amount: amount,
//               description: 'Wallet Top-up via Razorpay',
//               relatedInvoiceId: payload.order_id, // Using relatedInvoiceId for compatibility
//               status: 'completed',
//               metadata: {
//                 paymentId: payload.id,
//                 orderId: payload.order_id
//               },
//               createdDate: new Date(),
//               date: new Date() // Add date field for frontend display
//             };

//             // Update wallet balance
//             // Credit transactions always increase the available balance immediately
//             wallet.balance += amount;
//             // Update wallet with payment info
//             wallet.lastUpdated = new Date();
//             wallet.transactions.push(transaction);

//             try {
//               await wallet.save();
//               console.log(`Wallet updated via webhook. New balance: ${wallet.balance}`);
//             } catch (saveError) {
//               console.error('Error saving wallet via webhook:', saveError.message);
//               // Try to save with minimal transaction data if validation fails
//               try {
//                 const minimalTransaction = {
//                   type: 'credit',
//                   amount: amount,
//                   description: 'Wallet Top-up via Razorpay',
//                   status: 'completed',
//                   createdDate: new Date()
//                 };
//                 wallet.transactions.pop(); // Remove the problematic transaction
//                 wallet.transactions.push(minimalTransaction); // Add minimal one
//                 await wallet.save();
//                 console.log('Wallet updated with minimal transaction data');
//               } catch (fallbackError) {
//                 console.error('Fallback save also failed:', fallbackError.message);
//               }
//             }
//           } else {
//             console.log('Transaction already processed, skipping update');
//           }
//         } catch (error) {
//           console.error('Error verifying payment:', error);
//           // Continue processing to respond to Razorpay
//         }
//       }
//     } else {
//       console.log('Unhandled webhook event:', event);
//     }

//     res.status(200).json({ received: true });
//   } catch (error) {
//     console.error('Webhook error:', error);
//     res.status(500).json({ error: 'Webhook processing failed' });
//   }
// };

// Helper function to verify webhook signature
// function verifyWebhookSignature(body, signature, secret) {
//   const shasum = crypto.createHmac('sha256', secret);
//   shasum.update(JSON.stringify(body));
//   const digest = shasum.digest('hex');
//   return digest === signature;
// }

// Add or update bank account
const addBankAccount = async (req, res) => {
  // Structured logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Add Bank Account";

  try {
    const {
      ownerId,
      tenantId,
      accountHolderName,
      bankName,
      accountType,
      accountNumber,
      routingNumber,
      ifscCode,
      swiftCode,
      branchName,
      bankAddress,
      isDefault,
    } = req.body;

    // Validate required fields
    if (!ownerId || !accountHolderName || !bankName || !accountNumber) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Check if account already exists
    const existingAccount = await BankAccount.findOne({
      ownerId,
      accountNumber,
      isActive: true,
    });

    if (existingAccount) {
      return res.status(409).json({
        error: "Bank account already exists",
      });
    }

    // Create Razorpay contact if not exists
    let razorpayContactId;
    try {
      // Get user details for email and phone if available from Contacts
      const { Contacts } = require("../models/Contacts");
      const userContact = await Contacts.findOne({ ownerId: ownerId })
        .select("email phone countryCode")
        .lean();
      const email =
        userContact?.email || req.body.email || `${ownerId}@wallet.com`;
      const countryCode = userContact?.countryCode || "+91";
      const phoneNumber = userContact?.phone || req.body.phone || "9999999999";
      const phone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `${countryCode}${phoneNumber.replace(/^0+/, "")}`;

      const contact = await razorpay.contacts.create({
        name: accountHolderName,
        email: email,
        contact: phone, // Required field for Razorpay
        type: "customer",
        reference_id: ownerId,
        notes: {
          ownerId,
          tenantId,
        },
      });
      razorpayContactId = contact.id;
      // console.log("Contact created successfully:", razorpayContactId);
    } catch (razorpayError) {
      console.error(
        "Error creating Razorpay contact:",
        razorpayError.response?.data || razorpayError.message || razorpayError
      );
      // Continue without Razorpay contact for now - verification will be skipped
    }

    // Create Razorpay fund account for bank account
    let razorpayFundAccountId;
    if (razorpayContactId) {
      try {
        // @ts-ignore - Razorpay SDK returns a Promise despite TypeScript warning
        const fundAccount = await razorpay.fundAccount.create({
          contact_id: razorpayContactId,
          account_type: "bank_account",
          bank_account: {
            name: accountHolderName,
            ifsc: ifscCode || "RAZR0000001", // Use dummy IFSC for testing
            account_number: accountNumber,
          },
          notes: {
            ownerId,
            bankName,
          },
        });
        razorpayFundAccountId = fundAccount.id;
      } catch (razorpayError) {
        console.error("Error creating Razorpay fund account:", razorpayError);
      }
    }

    // Create bank account record
    const bankAccount = await BankAccount.create({
      ownerId,
      tenantId,
      accountHolderName,
      bankName,
      accountType: accountType || "checking",
      accountNumber,
      routingNumber,
      ifscCode,
      swiftCode,
      branchName,
      bankAddress,
      razorpayContactId,
      razorpayFundAccountId,
      isDefault: isDefault || false,
      isVerified: false, // Will be verified through penny drop
      verificationStatus: "pending",
      createdBy: ownerId,
    });

    // Internal log: success
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Add Bank Account",
      status: "success",
      message: "Bank account added successfully",
      requestBody: req.body,
      responseBody: bankAccount,
    };

    res.status(201).json({
      success: true,
      bankAccount,
      message: "Bank account added successfully",
    });
  } catch (error) {
    console.error("Error adding bank account:", error);

    // Internal log: error
    res.locals.logData = {
      tenantId: req?.body?.tenantId || "",
      ownerId: req?.body?.ownerId,
      processName: "Add Bank Account",
      status: "error",
      message: "Failed to add bank account",
      requestBody: req.body,
      responseBody: {
        error: error.message,
      },
    };

    res.status(500).json({
      error: "Failed to add bank account",
      details: error.message,
    });
  }
};

// Get bank accounts for an owner
const getBankAccounts = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Fetch without sorting (Azure Cosmos DB compatibility)
    const bankAccounts = await BankAccount.find({
      ownerId,
      isActive: true,
    }).sort({ _id: -1 }); // Only sort by _id for Azure compatibility

    // Sort in JavaScript to ensure default accounts appear first
    bankAccounts.sort((a, b) => {
      // First sort by isDefault (true comes before false)
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      // Then sort by _id (newest first)
      return b._id.toString().localeCompare(a._id.toString());
    });

    res.status(200).json({
      success: true,
      bankAccounts,
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    res.status(500).json({
      error: "Failed to fetch bank accounts",
      details: error.message,
    });
  }
};

// Delete bank account
const deleteBankAccount = async (req, res) => {
  // Structured logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Delete Bank Account";

  try {
    const { bankAccountId } = req.params;
    const { ownerId } = req.body || req.query; // Accept ownerId from body or query

    // Validate bankAccountId
    if (!bankAccountId) {
      return res.status(400).json({
        error: "Bank account ID is required",
      });
    }

    // Find the bank account
    const bankAccount = await BankAccount.findById(bankAccountId);

    if (!bankAccount) {
      return res.status(404).json({
        error: "Bank account not found",
      });
    }

    // Verify ownership if ownerId is provided
    if (ownerId && bankAccount.ownerId !== ownerId) {
      return res.status(403).json({
        error: "You don't have permission to delete this bank account",
      });
    }

    // Check if this account has been used for withdrawals
    const WithdrawalRequest = require("../models/WithdrawalRequest");
    const withdrawalCount = await WithdrawalRequest.countDocuments({
      bankAccountId: bankAccountId,
    });

    if (withdrawalCount > 0) {
      // Soft delete - just mark as inactive
      bankAccount.isActive = false;
      bankAccount.updatedBy = ownerId || "system";
      await bankAccount.save();

      // Internal log: soft delete success
      res.locals.logData = {
        tenantId: bankAccount.tenantId || req?.body?.tenantId || "",
        ownerId: bankAccount.ownerId,
        processName: "Delete Bank Account",
        status: "success",
        message: "Bank account deactivated (has withdrawal history)",
        requestBody: req.body || req.query,
        responseBody: bankAccount,
      };

      return res.status(200).json({
        success: true,
        message: "Bank account deactivated (has withdrawal history)",
        bankAccount,
      });
    }

    // Hard delete if no withdrawal history
    await BankAccount.findByIdAndDelete(bankAccountId);

    // Internal log: hard delete success
    res.locals.logData = {
      tenantId: bankAccount.tenantId || req?.body?.tenantId || "",
      ownerId: bankAccount.ownerId,
      processName: "Delete Bank Account",
      status: "success",
      message: "Bank account removed successfully",
      requestBody: req.body || req.query,
      responseBody: {
        bankAccountId,
        bankAccount,
      },
    };

    res.status(200).json({
      success: true,
      message: "Bank account removed successfully",
    });
  } catch (error) {
    console.error("Error deleting bank account:", error);

    // Internal log: error
    res.locals.logData = {
      tenantId: req?.body?.tenantId || "",
      ownerId: req?.body?.ownerId || null,
      processName: "Delete Bank Account",
      status: "error",
      message: "Failed to delete bank account",
      requestBody: {
        params: req.params,
        body: req.body,
        query: req.query,
      },
      responseBody: {
        error: error.message,
      },
    };

    res.status(500).json({
      error: "Failed to delete bank account",
      details: error.message,
    });
  }
};

// Verify bank account using Razorpay Penny Drop (Fund Account Validation)
const verifyBankAccount = async (req, res) => {
  // Structured logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Verify Bank Account";

  try {
    const { bankAccountId } = req.params;

    const bankAccount = await BankAccount.findById(bankAccountId);
    if (!bankAccount) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    // Validate required envs
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const accountNumber = process.env.RAZORPAY_ACCOUNT_NUMBER; // Your RazorpayX account number

    if (!keyId || !keySecret) {
      console.warn("Razorpay not configured - skipping verification");
      // Mark as verified for testing/development
      bankAccount.isVerified = true;
      bankAccount.isActive = true; // Ensure account is active
      bankAccount.verificationStatus = "verified";
      bankAccount.verificationMethod = "manual";
      bankAccount.verificationDate = new Date();
      bankAccount.metadata = {
        ...(bankAccount.metadata || {}),
        note: "Auto-verified due to missing Razorpay configuration",
      };
      await bankAccount.save();

      // Internal log: success (dev mode)
      res.locals.logData = {
        tenantId: bankAccount.tenantId || "",
        ownerId: bankAccount.ownerId,
        processName: "Verify Bank Account",
        status: "success",
        message: "Bank account verified (development mode)",
        requestBody: req.body,
        responseBody: bankAccount,
      };

      return res.status(200).json({
        message: "Bank account verified (development mode)",
        bankAccount,
      });
    }

    // Initialize Razorpay instance for this function
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    if (!accountNumber) {
      console.warn("RAZORPAY_ACCOUNT_NUMBER not set - using test mode");
    }

    // Basic validation for IFSC/Account number (Indian banks). Adjust as needed per region
    if (
      (bankAccount.ifscCode
        ? !bankAccount.ifscCode
        : !bankAccount.routingNumber) ||
      !bankAccount.accountNumber
    ) {
      return res.status(400).json({
        error: `${bankAccount.routingNumber ? "Routing Number" : "IFSC code"
          } and account number are required for verification`,
      });
    }

    // Ensure Razorpay Contact (if needed for verification)
    if (!bankAccount.razorpayContactId) {
      try {
        // Check if contacts API is available
        if (
          !razorpay.contacts ||
          typeof razorpay.contacts.create !== "function"
        ) {
          console.warn(
            "Razorpay contacts API not available - proceeding without contact creation"
          );
          // For basic verification, we can proceed without a contact ID
          // Just auto-verify for now since we can't do penny drop without RazorpayX
          bankAccount.isVerified = true;
          bankAccount.isActive = true; // Ensure account is active
          bankAccount.verificationStatus = "verified";
          bankAccount.verificationMethod = "manual";
          bankAccount.verificationDate = new Date();
          bankAccount.metadata = {
            ...(bankAccount.metadata || {}),
            note: "Auto-verified: Razorpay contacts API not available",
          };
          await bankAccount.save();

          // Internal log: success (contacts API not available)
          res.locals.logData = {
            tenantId: bankAccount.tenantId || "",
            ownerId: bankAccount.ownerId,
            processName: "Verify Bank Account",
            status: "success",
            message: "Bank account verified (contacts API not available)",
            requestBody: req.body,
            responseBody: bankAccount,
          };

          return res.status(200).json({
            message: "Bank account verified (contacts API not available)",
            bankAccount,
          });
        }

        // Get user email and phone if available from Contacts
        let email = `${bankAccount.ownerId}@wallet.com`;
        let phone = "+919999999999";

        // Try to get the actual user details from Contacts
        const { Contacts } = require("../models/Contacts");
        const userContact = await Contacts.findOne({
          ownerId: bankAccount.ownerId,
        })
          .select("email phone countryCode")
          .lean();
        if (userContact) {
          if (userContact.email) {
            email = userContact.email;
          }
          if (userContact.phone) {
            const countryCode = userContact.countryCode || "+91";
            const phoneNumber = userContact.phone;
            phone = phoneNumber.startsWith("+")
              ? phoneNumber
              : `${countryCode}${phoneNumber.replace(/^0+/, "")}`;
          }
        }

        // console.log("Creating Razorpay contact with:", {
        //   name: bankAccount.accountHolderName,
        //   email: email,
        //   phone: phone,
        //   type: "customer",
        //   reference_id: bankAccount.ownerId
        // });

        const contact = await razorpay.contacts.create({
          name: bankAccount.accountHolderName,
          email: email,
          contact: phone, // Phone number from Contacts or default
          type: "customer",
          reference_id: bankAccount.ownerId,
          notes: { ownerId: bankAccount.ownerId },
        });
        bankAccount.razorpayContactId = contact.id;
        // console.log("Razorpay contact created successfully:", contact.id);
      } catch (e) {
        console.error(
          "Razorpay create contact failed:",
          e.response?.data || e.message || e
        );

        // If contact creation fails, we can still try basic verification
        console.warn(
          "Contact creation failed - proceeding with auto-verification"
        );
        bankAccount.isVerified = true;
        bankAccount.isActive = true; // Ensure account is active
        bankAccount.verificationStatus = "verified";
        bankAccount.verificationMethod = "manual";
        bankAccount.verificationDate = new Date();
        bankAccount.metadata = {
          ...(bankAccount.metadata || {}),
          note: "Auto-verified: Contact creation failed",
          error: e.message,
        };
        await bankAccount.save();

        // Internal log: success (contact creation failed but auto-verified)
        res.locals.logData = {
          tenantId: bankAccount.tenantId || "",
          ownerId: bankAccount.ownerId,
          processName: "Verify Bank Account",
          status: "success",
          message: "Bank account verified (contact creation failed)",
          requestBody: req.body,
          responseBody: bankAccount,
        };

        return res.status(200).json({
          message: "Bank account verified (contact creation failed)",
          bankAccount,
        });
      }
    }

    // Ensure Razorpay Fund Account
    if (!bankAccount.razorpayFundAccountId) {
      try {
        // console.log("Creating Razorpay fund account with:", {
        //   contact_id: bankAccount.razorpayContactId,
        //   account_type: "bank_account",
        //   bank_account: {
        //     name: bankAccount.accountHolderName,
        //     ifsc: bankAccount.ifscCode,
        //     account_number: bankAccount.accountNumber,
        //   }
        // });

        // @ts-ignore - Razorpay SDK returns a Promise despite TypeScript warning
        const fundAccount = await razorpay.fundAccount.create({
          contact_id: bankAccount.razorpayContactId,
          account_type: "bank_account",
          bank_account: {
            name: bankAccount.accountHolderName,
            ifsc: bankAccount.ifscCode,
            account_number: bankAccount.accountNumber,
          },
          notes: {
            ownerId: bankAccount.ownerId,
            bankName: bankAccount.bankName,
          },
        });
        bankAccount.razorpayFundAccountId = fundAccount.id;
        // console.log("Razorpay fund account created successfully:", fundAccount.id);
      } catch (e) {
        console.error(
          "Razorpay create fund account failed:",
          e.response?.data || e.message || e
        );
        return res.status(502).json({
          error: "Failed to create Razorpay fund account",
          details: e.response?.data?.error || e.message,
        });
      }
    }

    // Initiate Fund Account Validation (Penny Drop)
    // Note: This requires RazorpayX to be enabled on your account
    const payload = {
      account_number: accountNumber || "4564563559247998", // Use test account if not set
      fund_account: { id: bankAccount.razorpayFundAccountId },
      amount: 100, // 1 INR in paise
      currency: "INR",
      notes: {
        ownerId: bankAccount.ownerId,
        bankAccountId: bankAccount._id.toString(),
      },
    };

    const dataString = JSON.stringify(payload);
    const options = {
      hostname: "api.razorpay.com",
      path: "/v1/fund_accounts/validations",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(dataString),
        Authorization:
          "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
    };

    const callRazorpayValidation = () =>
      new Promise((resolve, reject) => {
        const reqHttps = https.request(options, (resp) => {
          let raw = "";
          resp.on("data", (chunk) => (raw += chunk));
          resp.on("end", () => {
            try {
              const json = raw ? JSON.parse(raw) : {};
              if (resp.statusCode && resp.statusCode >= 400) {
                return reject({ statusCode: resp.statusCode, body: json });
              }
              resolve(json);
            } catch (err) {
              reject(err);
            }
          });
        });
        reqHttps.on("error", reject);
        reqHttps.write(dataString);
        reqHttps.end();
      });

    let validationResponse;
    try {
      validationResponse = await callRazorpayValidation();
    } catch (err) {
      console.error("Fund account validation failed:", err);

      // Check if it's a RazorpayX not enabled error
      const errorMessage = err.body?.error?.description || err.message || "";
      if (
        errorMessage.includes("not enabled") ||
        errorMessage.includes("RazorpayX") ||
        err.statusCode === 400
      ) {
        console.warn("RazorpayX not enabled - auto-verifying for testing");
        bankAccount.isVerified = true;
        bankAccount.isActive = true; // Ensure account is active
        bankAccount.verificationStatus = "verified";
        bankAccount.verificationMethod = "manual";
        bankAccount.verificationDate = new Date();
        bankAccount.metadata = {
          ...(bankAccount.metadata || {}),
          note: "Auto-verified: RazorpayX not enabled on account",
        };
        await bankAccount.save();

        // Internal log: success (RazorpayX not enabled)
        res.locals.logData = {
          tenantId: bankAccount.tenantId || "",
          ownerId: bankAccount.ownerId,
          processName: "Verify Bank Account",
          status: "success",
          message: "Bank account verified (RazorpayX not available)",
          requestBody: req.body,
          responseBody: bankAccount,
        };

        return res.status(200).json({
          message: "Bank account verified (RazorpayX not available)",
          bankAccount,
        });
      }

      bankAccount.isVerified = false;
      bankAccount.verificationStatus = "failed";
      bankAccount.verificationMethod = "penny_drop";
      bankAccount.metadata = {
        ...(bankAccount.metadata || {}),
        validationError: err.body || err.message || err,
      };
      await bankAccount.save();
      return res.status(502).json({
        error: "Bank account validation failed",
        details: errorMessage,
      });
    }

    // Interpret response
    const vStatus = (validationResponse.status || "").toLowerCase();
    const resultStatus = (
      validationResponse.results?.account_status || ""
    ).toLowerCase();
    const beneficiaryName = validationResponse.results?.name_at_bank;

    // Persist validation meta for future reference
    bankAccount.metadata = {
      ...(bankAccount.metadata || {}),
      validation: {
        id: validationResponse.id,
        status: vStatus,
        resultStatus,
        beneficiaryName,
        initiatedAt: new Date(),
      },
    };

    if (vStatus === "completed" && resultStatus === "valid") {
      bankAccount.isVerified = true;
      bankAccount.isActive = true; // Ensure account is active
      bankAccount.verificationStatus = "verified";
      bankAccount.verificationDate = new Date();
      bankAccount.verificationMethod = "penny_drop";
      await bankAccount.save();

      // Internal log: success (penny drop verified)
      res.locals.logData = {
        tenantId: bankAccount.tenantId || "",
        ownerId: bankAccount.ownerId,
        processName: "Verify Bank Account",
        status: "success",
        message: "Bank account verified successfully via penny drop",
        requestBody: req.body,
        responseBody: bankAccount,
      };

      return res.status(200).json({
        success: true,
        bankAccount,
        message: "Bank account verified successfully via penny drop",
      });
    }

    // If validation is completed but not valid, mark as failed
    if (vStatus === "completed" && resultStatus !== "valid") {
      bankAccount.isVerified = false;
      bankAccount.verificationStatus = "failed";
      bankAccount.verificationMethod = "penny_drop";
      await bankAccount.save();

      return res.status(400).json({
        success: false,
        bankAccount,
        error: "Bank account details could not be verified",
        details: validationResponse.results || null,
      });
    }

    // If not completed yet, keep it pending
    bankAccount.isVerified = false;
    bankAccount.verificationStatus = "pending";
    bankAccount.verificationMethod = "penny_drop";
    await bankAccount.save();

    // Internal log: success (verification initiated)
    res.locals.logData = {
      tenantId: bankAccount.tenantId || "",
      ownerId: bankAccount.ownerId,
      processName: "Verify Bank Account",
      status: "success",
      message:
        "Verification initiated. It may take a few minutes to complete.",
      requestBody: req.body,
      responseBody: bankAccount,
    };

    return res.status(202).json({
      success: true,
      bankAccount,
      message: "Verification initiated. It may take a few minutes to complete.",
    });
  } catch (error) {
    console.error("Error verifying bank account:", error);

    // Internal log: error
    res.locals.logData = {
      tenantId: "",
      ownerId: null,
      processName: "Verify Bank Account",
      status: "error",
      message: "Failed to verify bank account",
      requestBody: {
        params: req.params,
        body: req.body,
      },
      responseBody: {
        error: "Failed to verify bank account",
        details: error.message,
      },
    };

    return res.status(500).json({
      error: "Failed to verify bank account",
      details: error.message,
    });
  }
};

// Create withdrawal request
const createWithdrawalRequest = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create Withdrawal Request";

  try {
    const {
      ownerId,
      tenantId,
      amount,
      bankAccountId,
      mode,
      notes,
      walletSnapshot, // Added for manual processing
    } = req.body;

    // Validate inputs
    if (!ownerId || !amount || !bankAccountId) {
      res.locals.logData = {
        tenantId,
        ownerId,
        processName: "Create Withdrawal Request",
        status: "error",
        message: "Missing required fields",
        requestBody: req.body,
        requestBody: {
          error: "Missing required fields",
        },
      };

      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Minimum withdrawal amount check (e.g., $10 or ₹100)
    const MIN_WITHDRAWAL = 100;
    if (amount < MIN_WITHDRAWAL) {
      res.locals.logData = {
        tenantId,
        ownerId,
        processName: "Create Withdrawal Request",
        status: "error",
        message: "Minimum withdrawal amount is ${MIN_WITHDRAWAL}",
        requestBody: req.body,
        requestBody: {
          error: `Minimum withdrawal amount is ${MIN_WITHDRAWAL}`,
        },
      };

      return res.status(400).json({
        error: `Minimum withdrawal amount is ${MIN_WITHDRAWAL}`,
      });
    }

    // Get wallet balance
    const wallet = await WalletTopup.findOne({ ownerId });
    if (!wallet) {
      res.locals.logData = {
        tenantId,
        ownerId,
        processName: "Create Withdrawal Request",
        status: "error",
        message: "Wallet not found",
        requestBody: req.body,
        requestBody: {
          error: "Wallet not found",
        },
      };

      return res.status(404).json({
        error: "Wallet not found",
      });
    }

    // Check available balance (balance - holdAmount)
    const availableBalance = wallet.balance - (wallet.holdAmount || 0);
    if (availableBalance < amount) {
      res.locals.logData = {
        tenantId,
        ownerId,
        processName: "Create Withdrawal Request",
        status: "error",
        message: "Insufficient balance",
        requestBody: req.body,
        requestBody: {
          error: "Insufficient balance",
          availableBalance,
        },
      };

      return res.status(400).json({
        error: "Insufficient balance",
        availableBalance,
      });
    }

    // Verify bank account exists and is verified
    const bankAccount = await BankAccount.findById(bankAccountId);
    if (!bankAccount) {
      res.locals.logData = {
        tenantId,
        ownerId,
        processName: "Create Withdrawal Request",
        status: "error",
        message: "Bank account not found",
        requestBody: req.body,
        requestBody: {
          error: "Bank account not found",
        },
      };

      return res.status(404).json({
        error: "Bank account not found",
      });
    }

    if (!bankAccount.canWithdraw()) {
      res.locals.logData = {
        tenantId,
        ownerId,
        processName: "Create Withdrawal Request",
        status: "error",
        message: "Bank account is not verified or active",
        requestBody: req.body,
        requestBody: {
          error: "Bank account is not verified or active",
        },
      };

      return res.status(400).json({
        error: "Bank account is not verified or active",
      });
    }

    // Check for pending withdrawals
    const pendingWithdrawals = await WithdrawalRequest.find({
      ownerId,
      status: { $in: ["pending", "processing", "queued", "initiated"] },
    });

    if (pendingWithdrawals.length > 0) {
      res.locals.logData = {
        tenantId,
        ownerId,
        processName: "Create Withdrawal Request",
        status: "error",
        message:
          "You have pending withdrawal requests. Please wait for them to complete.",
        requestBody: req.body,
        requestBody: {
          error:
            "You have pending withdrawal requests. Please wait for them to complete.",
        },
      };

      return res.status(400).json({
        error:
          "You have pending withdrawal requests. Please wait for them to complete.",
      });
    }

    // Generate unique withdrawal code using centralized service (handles retries internally)
    let withdrawalRequest;
    try {
      const withdrawalCode = await generateUniqueId(
        "WDL",
        WithdrawalRequest,
        "withdrawalCode"
      );

      // Calculate fees (example: 2% or flat ₹10)
      const processingFee = Math.max(amount * 0.02, 10);
      const tax = processingFee * 0.18; // 18% GST
      const netAmount = amount - processingFee - tax;

      // Create withdrawal request with enhanced metadata for manual processing
      withdrawalRequest = await WithdrawalRequest.create({
        withdrawalCode, // Add the generated withdrawal code
        tenantId,
        ownerId,
        amount,
        currency: "INR",
        bankAccountId,
        status: "pending",
        mode: mode || "manual", // Default to manual processing
        processingFee,
        tax,
        netAmount,
        razorpayFundAccountId: bankAccount.razorpayFundAccountId,
        razorpayContactId: bankAccount.razorpayContactId,
        requestIp: req.ip,
        userAgent: req.get("user-agent"),
        notes,
        createdBy: ownerId,
        // Store wallet snapshot and bank details for manual processing
        metadata: {
          walletSnapshot: walletSnapshot || {
            currentBalance: wallet.balance,
            currentHoldAmount: wallet.holdAmount || 0,
            availableBalance: wallet.balance - (wallet.holdAmount || 0),
          },
          bankDetails: {
            accountHolderName: bankAccount.accountHolderName,
            bankName: bankAccount.bankName,
            accountNumber: bankAccount.maskedAccountNumber,
            accountType: bankAccount.accountType,
            routingNumber: bankAccount.routingNumber,
            swiftCode: bankAccount.swiftCode,
          },
          processingType: "manual",
          requiresAdminApproval: true,
        },
      });
    } catch (error) {
      console.error("Failed to create withdrawal request:", error);

      res.locals.logData = {
        tenantId,
        ownerId,
        processName: "Create Withdrawal Request",
        status: "error",
        message: "Failed to create withdrawal request",
        error: error.message,
        requestBody: req.body,
        responseBody: {
          error: error.message,
        },
      };

      return res.status(500).json({
        error: "Failed to create withdrawal request. Please try again.",
        details: error.message,
      });
    }

    // Check if withdrawal was created
    if (!withdrawalRequest) {
      res.locals.logData = {
        tenantId,
        ownerId,
        processName: "Create Withdrawal Request",
        status: "error",
        message: "Failed to create withdrawal request after multiple attempts.",
        requestBody: req.body,
        requestBody: {
          error: "Failed to create withdrawal request after multiple attempts.",
        },
      };

      return res.status(500).json({
        error: "Failed to create withdrawal request after multiple attempts.",
      });
    }

    // Deduct amount from wallet and add to hold
    wallet.balance -= amount;
    wallet.holdAmount = (wallet.holdAmount || 0) + amount;

    // Add transaction record with enhanced metadata (funds moved to HOLD bucket)
    wallet.transactions.push({
      type: "hold",
      amount,
      description: `Withdrawal request ${withdrawalRequest.withdrawalCode}`,
      status: "pending",
      metadata: {
        withdrawalRequestId: withdrawalRequest._id,
        withdrawalCode: withdrawalRequest.withdrawalCode,
        bankAccountId,
        amount,
        processingType: "manual",
        requestedAt: new Date(),
      },
      createdDate: new Date(),
    });

    await wallet.save();

    // Create push notification for pending withdrawal
    try {
      await PushNotification.create({
        ownerId,
        tenantId,
        title: "Withdrawal Request Created",
        message: `Your withdrawal request ${withdrawalRequest.withdrawalCode
          } for ₹${withdrawalRequest.netAmount.toFixed(
            2
          )} has been submitted successfully. It will be processed within 24-48 hours.`,
        type: "wallet",
        category: "withdrawal_status",
        unread: true,
        metadata: {
          withdrawalRequestId: withdrawalRequest._id.toString(),
          withdrawalCode: withdrawalRequest.withdrawalCode,
          amount: withdrawalRequest.amount,
          netAmount: withdrawalRequest.netAmount,
          status: "pending",
          bankAccount: bankAccount.maskedAccountNumber,
          bankName: bankAccount.bankName,
          createdAt: new Date(),
        },
      });
    } catch (notificationError) {
      console.error(
        "Error creating withdrawal notification:",
        notificationError
      );
      // Don't fail the withdrawal if notification fails
    }

    // Comment out auto-processing for Razorpay - All withdrawals now require manual admin approval
    // if (amount <= 5000) { // Auto-approve small amounts
    //   processWithdrawal(withdrawalRequest._id);
    // }

    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Create Withdrawal Request",
      status: "success",
      message: "Withdrawal request created successfully.",
      requestBody: req.body,
      responseBody: {
        withdrawalCode: withdrawalRequest.withdrawalCode,
        amount,
        netAmount: withdrawalRequest.netAmount,
        balanceAfter: wallet.balance,
      },
    };

    res.status(201).json({
      success: true,
      withdrawalRequest,
      message: `Withdrawal request ${withdrawalRequest.withdrawalCode} created successfully. It will be processed within 24-48 hours.`,
    });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);

    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Create Withdrawal Request",
      status: "error",
      message: "Failed to create withdrawal request",
      requestBody: req.body,
      requestBody: {
        error: "Failed to create withdrawal request",
        details: error.message,
      },
    };

    res.status(500).json({
      error: "Failed to create withdrawal request",
      details: error.message,
    });
  }
};

// Commented out Razorpay automatic processing - will be used in future
// const processWithdrawal = async (withdrawalRequestId) => {
//   try {
//     const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId)
//       .populate("bankAccountId");
//
//     if (!withdrawalRequest) {
//       throw new Error("Withdrawal request not found");
//     }
//
//     // Update status to processing
//     withdrawalRequest.status = "processing";
//     withdrawalRequest.processedAt = new Date();
//     await withdrawalRequest.save();
//
//     // Create Razorpay payout
//     try {
//       const payout = await razorpay.payouts.create({
//         account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
//         fund_account_id: withdrawalRequest.razorpayFundAccountId,
//         amount: Math.round(withdrawalRequest.netAmount * 100),
//         currency: "INR",
//         mode: withdrawalRequest.mode,
//         purpose: "payout",
//         queue_if_low_balance: true,
//         reference_id: withdrawalRequest.withdrawalCode,
//         narration: `Withdrawal ${withdrawalRequest.withdrawalCode}`,
//         notes: {
//           withdrawalRequestId: withdrawalRequest._id.toString(),
//           ownerId: withdrawalRequest.ownerId
//         }
//       });
//
//       withdrawalRequest.razorpayPayoutId = payout.id;
//       withdrawalRequest.status = "initiated";
//       withdrawalRequest.razorpayUtr = payout.utr;
//       await withdrawalRequest.save();
//
//       console.log("Payout initiated successfully:", payout.id);
//     } catch (razorpayError) {
//       console.error("Razorpay payout error:", razorpayError);
//
//       withdrawalRequest.status = "failed";
//       withdrawalRequest.failedAt = new Date();
//       withdrawalRequest.failureReason = razorpayError.error?.description || razorpayError.message;
//       await withdrawalRequest.save();
//
//       const wallet = await WalletTopup.findOne({ ownerId: withdrawalRequest.ownerId });
//       if (wallet) {
//         wallet.balance += withdrawalRequest.amount;
//         wallet.holdAmount = Math.max(0, (wallet.holdAmount || 0) - withdrawalRequest.amount);
//
//         wallet.transactions.push({
//           type: "credit",
//           amount: withdrawalRequest.amount,
//           description: `Withdrawal failed - Refund for ${withdrawalRequest.withdrawalCode}`,
//           status: "completed",
//           metadata: {
//             withdrawalRequestId: withdrawalRequest._id,
//             withdrawalCode: withdrawalRequest.withdrawalCode,
//             failureReason: withdrawalRequest.failureReason
//           },
//           createdDate: new Date()
//         });
//
//         await wallet.save();
//       }
//     }
//   } catch (error) {
//     console.error("Error processing withdrawal:", error);
//   }
// };

// Manual processing functions for superadmin
// Function to mark a withdrawal as failed and refund the amount
const failManualWithdrawal = async (req, res) => {
  // Structured logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Fail Manual Withdrawal";

  try {
    const { withdrawalRequestId } = req.params;
    const { failureReason, failedBy, adminNotes } = req.body;

    const withdrawalRequest = await WithdrawalRequest.findById(
      withdrawalRequestId
    ).populate("bankAccountId");

    if (!withdrawalRequest) {
      return res.status(404).json({
        error: "Withdrawal request not found",
      });
    }

    if (!["pending", "processing"].includes(withdrawalRequest.status)) {
      return res.status(400).json({
        error: `Cannot fail withdrawal in status: ${withdrawalRequest.status}`,
      });
    }

    // Update withdrawal request as failed
    withdrawalRequest.status = "failed";
    withdrawalRequest.failedAt = new Date();
    withdrawalRequest.failureReason = failureReason || "Processing error";
    withdrawalRequest.reviewedBy = failedBy;
    withdrawalRequest.reviewedAt = new Date();
    withdrawalRequest.reviewNotes = adminNotes;

    // Store failure details
    withdrawalRequest.metadata = {
      ...withdrawalRequest.metadata,
      failureDetails: {
        failedBy,
        failedAt: new Date(),
        failureReason,
        adminNotes,
      },
    };

    await withdrawalRequest.save();

    // Refund amount back to wallet
    const wallet = await WalletTopup.findOne({
      ownerId: withdrawalRequest.ownerId,
    });
    if (wallet) {
      wallet.balance += withdrawalRequest.amount;
      wallet.holdAmount = Math.max(
        0,
        (wallet.holdAmount || 0) - withdrawalRequest.amount
      );

      wallet.transactions.push({
        type: "refund",
        amount: withdrawalRequest.amount,
        description: `Withdrawal failed - Refund for ${withdrawalRequest.withdrawalCode}`,
        status: "completed",
        metadata: {
          withdrawalRequestId: withdrawalRequest._id,
          withdrawalCode: withdrawalRequest.withdrawalCode,
          failureReason: withdrawalRequest.failureReason,
        },
        createdDate: new Date(),
      });

      await wallet.save();
    }

    // Update wallet - remove from pending to failed
    const walletUpdate = await WalletTopup.findOne({
      ownerId: withdrawalRequest.ownerId,
    });
    if (walletUpdate) {
      //walletUpdate.holdAmount = Math.max(0, (wallet.holdAmount || 0) - withdrawalRequest.amount);

      // Update transaction status
      const transaction = walletUpdate.transactions.find(
        (t) =>
          t.metadata?.withdrawalRequestId?.toString() ===
          withdrawalRequest._id.toString()
      );
      if (transaction) {
        transaction.status = "failed";
        transaction.metadata = {
          //...transaction.metadata,
          failedAt: new Date(),
          withdrawalRequestId: withdrawalRequest._id,
          withdrawalCode: withdrawalRequest.withdrawalCode,
          failureReason: withdrawalRequest.failureReason,
        };
      }

      await walletUpdate.save();
    }

    // Create push notification for failed withdrawal
    try {
      await PushNotification.create({
        ownerId: withdrawalRequest.ownerId,
        tenantId: withdrawalRequest.tenantId,
        title: "Withdrawal Failed",
        message: `Your withdrawal request ${withdrawalRequest.withdrawalCode
          } for ₹${withdrawalRequest.amount.toFixed(
            2
          )} could not be processed. The amount has been refunded to your wallet. Reason: ${failureReason || "Processing error"
          }`,
        type: "wallet",
        category: "withdrawal_status",
        unread: true,
        metadata: {
          withdrawalRequestId: withdrawalRequest._id.toString(),
          withdrawalCode: withdrawalRequest.withdrawalCode,
          amount: withdrawalRequest.amount,
          status: "failed",
          failureReason: failureReason || "Processing error",
          failedAt: new Date(),
        },
      });
    } catch (notificationError) {
      console.error(
        "Error creating withdrawal failure notification:",
        notificationError
      );
      // Don't fail the process if notification fails
    }

    // Internal log: success
    res.locals.logData = {
      tenantId: withdrawalRequest.tenantId || "",
      ownerId: withdrawalRequest.ownerId,
      processName: "Fail Manual Withdrawal",
      status: "success",
      message: "Withdrawal marked as failed and amount refunded",
      requestBody: req.body,
      responseBody: {
        withdrawalRequest,
        wallet,
        walletUpdate,
      },
    };

    res.status(200).json({
      success: true,
      withdrawalRequest,
      message: "Withdrawal marked as failed and amount refunded",
    });
  } catch (error) {
    console.error("Error failing withdrawal:", error);
    // Internal log: error
    res.locals.logData = {
      tenantId: "",
      ownerId: null,
      processName: "Fail Manual Withdrawal",
      status: "error",
      message: "Failed to process withdrawal failure",
      requestBody: {
        params: req.params,
        body: req.body,
      },
      responseBody: {
        error: "Failed to process withdrawal failure",
        details: error.message,
      },
    };

    res.status(500).json({
      error: "Failed to process withdrawal failure",
      details: error.message,
    });
  }
};

const processManualWithdrawal = async (req, res) => {
  // Structured logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Process Manual Withdrawal";

  try {
    const { withdrawalRequestId } = req.params;
    const {
      transactionReference,
      processedBy,
      adminNotes,
      actualMode, // IMPS, NEFT, UPI, etc.
    } = req.body;

    const withdrawalRequest = await WithdrawalRequest.findById(
      withdrawalRequestId
    ).populate("bankAccountId");

    if (!withdrawalRequest) {
      return res.status(404).json({
        error: "Withdrawal request not found",
      });
    }

    if (!["pending", "processing"].includes(withdrawalRequest.status)) {
      return res.status(400).json({
        error: `Cannot process withdrawal in status: ${withdrawalRequest.status}`,
      });
    }

    // Update withdrawal request as completed
    withdrawalRequest.status = "completed";
    withdrawalRequest.processedAt = new Date();
    withdrawalRequest.completedAt = new Date();
    withdrawalRequest.actualCompletionDate = new Date();
    withdrawalRequest.reviewedBy = processedBy;
    withdrawalRequest.reviewedAt = new Date();
    withdrawalRequest.reviewNotes = adminNotes;

    // Store manual processing details
    withdrawalRequest.metadata = {
      ...withdrawalRequest.metadata,
      manualProcessing: {
        processedBy,
        processedAt: new Date(),
        transactionReference,
        actualMode: actualMode || withdrawalRequest.mode,
        adminNotes,
      },
    };

    await withdrawalRequest.save();

    // Update wallet - remove from hold
    const wallet = await WalletTopup.findOne({
      ownerId: withdrawalRequest.ownerId,
    });
    if (wallet) {
      wallet.holdAmount = Math.max(
        0,
        (wallet.holdAmount || 0) - withdrawalRequest.amount
      );

      // Update transaction status
      const transaction = wallet.transactions.find(
        (t) =>
          t.metadata?.withdrawalRequestId?.toString() ===
          withdrawalRequest._id.toString()
      );
      if (transaction) {
        transaction.status = "completed";
        transaction.metadata = {
          ...transaction.metadata,
          completedAt: new Date(),
          transactionReference,
          processedBy,
        };
      }

      await wallet.save();
    }

    // Create push notification for completed withdrawal
    try {
      await PushNotification.create({
        ownerId: withdrawalRequest.ownerId,
        tenantId: withdrawalRequest.tenantId,
        title: "Withdrawal Completed",
        message: `Your withdrawal request ${withdrawalRequest.withdrawalCode
          } for ₹${withdrawalRequest.netAmount.toFixed(
            2
          )} has been completed successfully. The amount has been transferred to your bank account ending with ${withdrawalRequest.bankAccountId?.maskedAccountNumber ||
          "your registered account"
          }.`,
        type: "wallet",
        category: "withdrawal_status",
        unread: true,
        metadata: {
          withdrawalRequestId: withdrawalRequest._id.toString(),
          withdrawalCode: withdrawalRequest.withdrawalCode,
          amount: withdrawalRequest.amount,
          netAmount: withdrawalRequest.netAmount,
          status: "completed",
          transactionReference,
          processedBy,
          completedAt: new Date(),
        },
      });
    } catch (notificationError) {
      console.error(
        "Error creating withdrawal completion notification:",
        notificationError
      );
      // Don't fail the process if notification fails
    }

    // Internal log: success
    res.locals.logData = {
      tenantId: withdrawalRequest.tenantId || "",
      ownerId: withdrawalRequest.ownerId,
      processName: "Process Manual Withdrawal",
      status: "success",
      message: "Withdrawal processed successfully",
      requestBody: req.body,
      responseBody: {
        withdrawalRequest,
        wallet,
      },
    };

    res.status(200).json({
      success: true,
      withdrawalRequest,
      message: "Withdrawal processed successfully",
    });
  } catch (error) {
    console.error("Error processing manual withdrawal:", error);
    // Internal log: error
    res.locals.logData = {
      tenantId: "",
      ownerId: null,
      processName: "Process Manual Withdrawal",
      status: "error",
      message: "Failed to process withdrawal",
      requestBody: {
        params: req.params,
        body: req.body,
      },
      responseBody: {
        error: "Failed to process withdrawal",
        details: error.message,
      },
    };

    res.status(500).json({
      error: "Failed to process withdrawal",
      details: error.message,
    });
  }
};

// Get all withdrawal requests for superadmin - supports optional pagination/search/filters
const getAllWithdrawalRequests = async (req, res) => {
  try {
    const hasPaginationParams =
      "page" in req.query ||
      "limit" in req.query ||
      "search" in req.query ||
      "status" in req.query ||
      "mode" in req.query ||
      "minAmount" in req.query ||
      "maxAmount" in req.query ||
      "startDate" in req.query ||
      "endDate" in req.query;

    if (!hasPaginationParams) {
      // Legacy behavior: return full list with populate
      const withdrawalRequests = await WithdrawalRequest.find({})
        .populate("bankAccountId")
        .sort({ _id: -1 });

      const totalWithdrawalRequests = await WithdrawalRequest.countDocuments(
        {}
      );

      return res.status(200).json({
        success: true,
        withdrawalRequests,
        total: totalWithdrawalRequests,
        hasMore: false,
      });
    }

    // Paginated mode
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const limitRaw = parseInt(req.query.limit, 10);
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 10;
    const search = (req.query.search || "").trim();
    const statusParam = (req.query.status || "").trim();
    const modeParam = (req.query.mode || "").trim();
    const minAmount =
      req.query.minAmount !== undefined && req.query.minAmount !== ""
        ? Number(req.query.minAmount)
        : undefined;
    const maxAmount =
      req.query.maxAmount !== undefined && req.query.maxAmount !== ""
        ? Number(req.query.maxAmount)
        : undefined;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;

    const statusValues = statusParam
      ? statusParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      : [];
    const modeValues = modeParam
      ? modeParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      : [];

    const pipeline = [];

    // Lookup bank account for search fields
    pipeline.push({
      $lookup: {
        from: "bankaccounts",
        localField: "bankAccountId",
        foreignField: "_id",
        as: "bankAccount",
      },
    });
    pipeline.push({
      $unwind: { path: "$bankAccount", preserveNullAndEmptyArrays: true },
    });
    // Keep legacy shape: expose populated doc as bankAccountId
    pipeline.push({ $addFields: { bankAccountId: "$bankAccount" } });

    const match = {};
    if (statusValues.length > 0) {
      match.status = { $in: statusValues };
    }
    if (modeValues.length > 0) {
      match.mode = { $in: modeValues };
    }
    if (Number.isFinite(minAmount) || Number.isFinite(maxAmount)) {
      match.amount = {};
      if (Number.isFinite(minAmount)) match.amount.$gte = minAmount;
      if (Number.isFinite(maxAmount)) match.amount.$lte = maxAmount;
    }
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) {
        const end = new Date(endDate);
        // include entire end day if only date provided
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          match.createdAt.$lte = end;
        }
      }
    }
    if (search) {
      const regex = new RegExp(search, "i");
      match.$or = [
        { withdrawalCode: { $regex: regex } },
        { ownerId: { $regex: regex } },
        { razorpayPayoutId: { $regex: regex } },
        { razorpayReferenceId: { $regex: regex } },
        { "bankAccount.bankName": { $regex: regex } },
        { "bankAccount.accountHolderName": { $regex: regex } },
        { "bankAccount.maskedAccountNumber": { $regex: regex } },
      ];
    }

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({ $sort: { _id: -1 } });

    pipeline.push({
      $facet: {
        data: [{ $skip: page * limit }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
        statusCounts: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalAmount: { $sum: { $ifNull: ["$amount", 0] } },
              totalNetAmount: { $sum: { $ifNull: ["$netAmount", 0] } },
            },
          },
        ],
      },
    });

    const aggResult = await WithdrawalRequest.aggregate(pipeline);
    const agg = aggResult?.[0] || {
      data: [],
      totalCount: [],
      statusCounts: [],
    };
    const data = agg.data || [];
    const totalItems = agg.totalCount?.[0]?.count || 0;
    const statusCounts = Array.isArray(agg.statusCounts)
      ? agg.statusCounts
      : [];

    // Build stats map
    const statsMap = statusCounts.reduce((acc, cur) => {
      if (!cur || !cur._id) return acc;
      acc[cur._id] = {
        count: cur.count || 0,
        totalAmount: cur.totalAmount || 0,
        totalNetAmount: cur.totalNetAmount || 0,
      };
      return acc;
    }, {});

    const stats = {
      pending: statsMap.pending?.count || 0,
      processing: statsMap.processing?.count || 0,
      completed: statsMap.completed?.count || 0,
      failed: statsMap.failed?.count || 0,
      cancelled: statsMap.cancelled?.count || 0,
      totalAmount: Object.values(statsMap).reduce(
        (s, v) => s + (v.totalAmount || 0),
        0
      ),
      totalNetAmount: Object.values(statsMap).reduce(
        (s, v) => s + (v.totalNetAmount || 0),
        0
      ),
      pendingAmount: statsMap.pending?.totalAmount || 0,
      pendingNetAmount: statsMap.pending?.totalNetAmount || 0,
      processingAmount: statsMap.processing?.totalAmount || 0,
      processingNetAmount: statsMap.processing?.totalNetAmount || 0,
      completedAmount: statsMap.completed?.totalAmount || 0,
      completedNetAmount: statsMap.completed?.totalNetAmount || 0,
      failedAmount: statsMap.failed?.totalAmount || 0,
      failedNetAmount: statsMap.failed?.totalNetAmount || 0,
      cancelledAmount: statsMap.cancelled?.totalAmount || 0,
      cancelledNetAmount: statsMap.cancelled?.totalNetAmount || 0,
    };

    return res.status(200).json({
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit) || 0,
        totalItems,
        hasNext: (page + 1) * limit < totalItems,
        hasPrev: page > 0,
        itemsPerPage: limit,
      },
      stats,
      status: true,
    });
  } catch (error) {
    console.error("Error fetching all withdrawal requests:", error);
    res.status(500).json({
      error: "Failed to fetch withdrawal requests",
      details: error.message,
    });
  }
};

// Get single withdrawal request by ID for superadmin
const getWithdrawalRequestById = async (req, res) => {
  try {
    const { withdrawalRequestId } = req.params;

    if (!withdrawalRequestId) {
      return res.status(400).json({
        success: false,
        error: "Withdrawal request ID is required",
      });
    }

    const withdrawalRequest = await WithdrawalRequest.findById(
      withdrawalRequestId
    )
      .populate("bankAccountId")
      .populate("ownerId", "email firstName lastName"); // Populate owner details if needed

    if (!withdrawalRequest) {
      return res.status(404).json({
        success: false,
        error: "Withdrawal request not found",
      });
    }

    res.status(200).json({
      success: true,
      withdrawalRequest: withdrawalRequest,
    });
  } catch (error) {
    console.error("Error fetching withdrawal request by ID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch withdrawal request",
      details: error.message,
    });
  }
};

// Get withdrawal requests
const getWithdrawalRequests = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { status, limit = 50, skip = 0 } = req.query;

    // console.log("Getting withdrawal requests for:", {
    //   ownerId,
    //   status,
    //   limit,
    //   skip
    // });

    const query = { ownerId };
    if (status) {
      query.status = status;
    }

    const withdrawalRequests = await WithdrawalRequest.find(query)
      .populate(
        "bankAccountId",
        "bankName maskedAccountNumber accountHolderName"
      )
      .sort({ _id: -1 }) // Using _id for sorting (more reliable in all environments)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await WithdrawalRequest.countDocuments(query);

    //console.log(`Found ${withdrawalRequests.length} withdrawal requests for owner ${ownerId}`);

    res.status(200).json({
      success: true,
      withdrawalRequests,
      total,
      hasMore: total > skip + limit,
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({
      error: "Failed to fetch withdrawal requests",
      details: error.message,
    });
  }
};

// Cancel withdrawal request
const cancelWithdrawalRequest = async (req, res) => {
  // Structured logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Cancel Withdrawal Request";

  try {
    const { withdrawalRequestId } = req.params;
    const { reason } = req.body;

    const withdrawalRequest = await WithdrawalRequest.findById(
      withdrawalRequestId
    );
    if (!withdrawalRequest) {
      return res.status(404).json({
        error: "Withdrawal request not found",
      });
    }

    if (!withdrawalRequest.canCancel()) {
      return res.status(400).json({
        error: "Withdrawal request cannot be cancelled in current status",
      });
    }

    // Update withdrawal request
    withdrawalRequest.status = "cancelled";
    withdrawalRequest.cancelledAt = new Date();
    withdrawalRequest.cancellationReason =
      reason || "User requested cancellation";
    await withdrawalRequest.save();

    // Refund amount back to wallet
    const wallet = await WalletTopup.findOne({
      ownerId: withdrawalRequest.ownerId,
    });
    if (wallet) {
      wallet.balance += withdrawalRequest.amount;
      wallet.holdAmount = Math.max(
        0,
        (wallet.holdAmount || 0) - withdrawalRequest.amount
      );

      wallet.transactions.push({
        type: "refund",
        amount: withdrawalRequest.amount,
        description: `Withdrawal cancelled - Refund for ${withdrawalRequest.withdrawalCode}`,
        status: "completed",
        metadata: {
          withdrawalRequestId: withdrawalRequest._id,
          withdrawalCode: withdrawalRequest.withdrawalCode,
        },
        createdDate: new Date(),
      });

      await wallet.save();
    }

    // Create push notification for canceled withdrawal
    try {
      await PushNotification.create({
        ownerId: withdrawalRequest.ownerId,
        tenantId: withdrawalRequest.tenantId,
        title: "Withdrawal Canceled",
        message: `Your withdrawal request ${withdrawalRequest.withdrawalCode
          } for ₹${withdrawalRequest.amount.toFixed(
            2
          )} has been canceled. The amount has been refunded to your wallet.`,
        type: "wallet",
        category: "withdrawal_status",
        unread: true,
        metadata: {
          withdrawalRequestId: withdrawalRequest._id.toString(),
          withdrawalCode: withdrawalRequest.withdrawalCode,
          amount: withdrawalRequest.amount,
          status: "canceled",
          cancellationReason: reason || "User requested cancellation",
          canceledAt: new Date(),
        },
      });
    } catch (notificationError) {
      console.error(
        "Error creating withdrawal cancellation notification:",
        notificationError
      );
      // Don't fail the cancellation if notification fails
    }

    // Internal log: success
    res.locals.logData = {
      tenantId: withdrawalRequest.tenantId || "",
      ownerId: withdrawalRequest.ownerId,
      processName: "Cancel Withdrawal Request",
      status: "success",
      message: "Withdrawal request cancelled successfully",
      requestBody: req.body,
      responseBody: {
        withdrawalRequest,
        wallet,
      },
    };

    res.status(200).json({
      success: true,
      withdrawalRequest,
      message: "Withdrawal request cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling withdrawal request:", error);

    // Internal log: error
    res.locals.logData = {
      tenantId: "",
      ownerId: null,
      processName: "Cancel Withdrawal Request",
      status: "error",
      message: "Failed to cancel withdrawal request",
      requestBody: {
        params: req.params,
        body: req.body,
      },
      responseBody: {
        error: "Failed to cancel withdrawal request",
        details: error.message,
      },
    };

    res.status(500).json({
      error: "Failed to cancel withdrawal request",
      details: error.message,
    });
  }
};

// Commented out Razorpay payout webhook - will be used in future when Razorpay automatic payouts are enabled
const handlePayoutWebhook = async (req, res) => {
  // For now, just acknowledge the webhook since we're doing manual processing
  return res
    .status(200)
    .json({ received: true, message: "Manual processing mode active" });
};

// Razorpay webhook handler - kept for future use
// const handlePayoutWebhook = async (req, res) => {
//   try {
//     const webhookBody = req.body;
//     const webhookSignature = req.get("X-Razorpay-Signature");
//
//     // Verify webhook signature for PAYOUT events (RazorpayX)
//     const payoutWebhookSecret = process.env.RAZORPAY_PAYOUT_WEBHOOK_SECRET;
//     if (payoutWebhookSecret && process.env.NODE_ENV === 'production') {
//       const expectedSignature = crypto
//         .createHmac('sha256', payoutWebhookSecret)
//         .update(JSON.stringify(webhookBody))
//         .digest('hex');
//
//       if (expectedSignature !== webhookSignature) {
//         console.error('Invalid payout webhook signature');
//         return res.status(401).json({ error: "Invalid signature" });
//       }
//     }

//     const { event, payload } = webhookBody;
//     const payout = payload.payout?.entity;
//
//     if (!payout) {
//       return res.status(400).json({ error: "Invalid webhook payload" });
//     }
//
//     const withdrawalRequest = await WithdrawalRequest.findOne({
//       razorpayPayoutId: payout.id
//     });
//
//     if (!withdrawalRequest) {
//       console.log("Withdrawal request not found for payout:", payout.id);
//       return res.status(200).json({ received: true });
//     }
//
//     switch (event) {
//       case "payout.processed":
//         withdrawalRequest.status = "completed";
//         withdrawalRequest.completedAt = new Date();
//         withdrawalRequest.actualCompletionDate = new Date();
//         withdrawalRequest.razorpayUtr = payout.utr;
//
//         // Update wallet transaction status
//         const wallet = await WalletTopup.findOne({ ownerId: withdrawalRequest.ownerId });
//         if (wallet) {
//           wallet.holdAmount = Math.max(0, (wallet.holdAmount || 0) - withdrawalRequest.amount);
//
//           const transaction = wallet.transactions.find(
//             t => t.metadata?.withdrawalRequestId?.toString() === withdrawalRequest._id.toString()
//           );
//           if (transaction) {
//             transaction.status = "completed";
//           }
//           await wallet.save();
//         }
//         break;
//
//       case "payout.failed":
//         withdrawalRequest.status = "failed";
//         withdrawalRequest.failedAt = new Date();
//         withdrawalRequest.failureReason = payout.failure_reason || "Unknown error";
//
//         // Refund amount back to wallet
//         const walletRefund = await WalletTopup.findOne({ ownerId: withdrawalRequest.ownerId });
//         if (walletRefund) {
//           walletRefund.balance += withdrawalRequest.amount;
//           walletRefund.holdAmount = Math.max(0, (walletRefund.holdAmount || 0) - withdrawalRequest.amount);
//
//           walletRefund.transactions.push({
//             type: "credit",
//             amount: withdrawalRequest.amount,
//             description: `Withdrawal failed - Refund for ${withdrawalRequest.withdrawalCode}`,
//             status: "completed",
//             metadata: {
//               withdrawalRequestId: withdrawalRequest._id,
//               withdrawalCode: withdrawalRequest.withdrawalCode,
//               failureReason: withdrawalRequest.failureReason
//             },
//             createdDate: new Date()
//           });
//
//           await walletRefund.save();
//         }
//         break;
//
//       case "payout.reversed":
//         withdrawalRequest.status = "reversed";
//         withdrawalRequest.failureReason = payout.status_details?.description || "Payout reversed";
//
//         // Handle reversal similar to failure
//         const walletReverse = await WalletTopup.findOne({ ownerId: withdrawalRequest.ownerId });
//         if (walletReverse) {
//           walletReverse.balance += withdrawalRequest.amount;
//           walletReverse.holdAmount = Math.max(0, (walletReverse.holdAmount || 0) - withdrawalRequest.amount);
//
//           walletReverse.transactions.push({
//             type: "credit",
//             amount: withdrawalRequest.amount,
//             description: `Withdrawal reversed - Refund for ${withdrawalRequest.withdrawalCode}`,
//             status: "completed",
//             metadata: {
//               withdrawalRequestId: withdrawalRequest._id,
//               withdrawalCode: withdrawalRequest.withdrawalCode
//             },
//             createdDate: new Date()
//           });
//
//           await walletReverse.save();
//         }
//         break;
//
//       default:
//         console.log("Unhandled payout webhook event:", event);
//     }
//
//     await withdrawalRequest.save();
//
//     res.status(200).json({ received: true });
//   } catch (error) {
//     console.error("Error handling payout webhook:", error);
//     res.status(500).json({
//       error: "Failed to process webhook",
//       details: error.message
//     });
//   }
// };

// Utility function to fix existing verified accounts that might not have isActive set
const fixVerifiedBankAccounts = async (req, res) => {
  // Structured logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Fix Verified Bank Accounts";

  try {
    // First, let's see what bank accounts exist
    const allAccounts = await BankAccount.find({}).select(
      "isVerified isActive verificationStatus ownerId accountHolderName"
    );
    //console.log("All bank accounts:", allAccounts);

    // Now update any verified accounts that aren't active
    const result = await BankAccount.updateMany(
      {
        isVerified: true,
        $or: [{ isActive: false }, { isActive: { $exists: false } }],
      },
      { $set: { isActive: true } }
    );

    // Also check for accounts with verificationStatus = "verified" but isVerified not true
    const result2 = await BankAccount.updateMany(
      {
        verificationStatus: "verified",
        $or: [{ isVerified: { $ne: true } }, { isActive: { $ne: true } }],
      },
      { $set: { isVerified: true, isActive: true } }
    );

    const totalFixed = result.modifiedCount + result2.modifiedCount;
    //console.log(`Fixed ${totalFixed} bank accounts`);

    // Internal log: success
    res.locals.logData = {
      tenantId: "",
      ownerId: null,
      processName: "Fix Verified Bank Accounts",
      status: "success",
      message: `Fixed ${totalFixed} bank accounts to be active`,
      requestBody: req.body,
      responseBody: {
        modifiedCount: totalFixed,
        totalAccounts: allAccounts.length,
      },
    };

    return res.status(200).json({
      success: true,
      message: `Fixed ${totalFixed} bank accounts to be active`,
      modifiedCount: totalFixed,
      debug: {
        totalAccounts: allAccounts.length,
        accounts: allAccounts,
      },
    });
  } catch (error) {
    console.error("Error fixing verified bank accounts:", error);
    // Internal log: error
    res.locals.logData = {
      tenantId: "",
      ownerId: null,
      processName: "Fix Verified Bank Accounts",
      status: "error",
      message: "Failed to fix verified bank accounts",
      requestBody: req.body,
      responseBody: {
        error: "Failed to fix verified bank accounts",
        details: error.message,
      },
    };

    return res.status(500).json({
      error: "Failed to fix verified bank accounts",
      details: error.message,
    });
  }
};

// Settlement function for interview rounds
// const settleInterviewPayment = async (req, res) => {
//   // Structured logging context
//   res.locals.loggedByController = true;
//   res.locals.processName = "Settle Interview Payment";

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const {
//       roundId,
//       transactionId,
//       interviewerContactId,
//       companyName,
//       roundTitle,
//       positionTitle,
//       interviewerTenantId,
//       previewOnly,
//     } = req.body;

//     const isPreview = Boolean(previewOnly);

//     // console.log("[settleInterviewPayment] Starting settlement:", { roundId, transactionId, interviewerContactId, companyName, roundTitle });

//     // Validate required fields
//     if (!roundId || !transactionId || !interviewerContactId) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "roundId, transactionId, and interviewerContactId are required",
//       });
//     }

//     // 1. Find the organization's wallet with the hold transaction
//     const orgWallet = await WalletTopup.findOne({
//       "transactions._id": transactionId,
//     }).session(session);

//     if (!orgWallet) {
//       await session.abortTransaction();
//       return res.status(404).json({
//         success: false,
//         message: "Organization wallet with hold transaction not found",
//       });
//     }

//     // 2. Find the specific hold transaction
//     const holdTransaction = orgWallet.transactions.find(
//       (t) => t._id && t._id.toString() === transactionId
//     );

//     if (!holdTransaction) {
//       await session.abortTransaction();
//       return res.status(404).json({
//         success: false,
//         message: "Hold transaction not found",
//       });
//     }

//     if (
//       holdTransaction.type !== "hold" ||
//       holdTransaction.status === "completed"
//     ) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         success: false,
//         message: "Transaction is not a hold or already settled",
//       });
//     }

//     // ------------------------------------------------------------------
//     // 2a. Determine settlement amount based on interview policy
//     // ------------------------------------------------------------------
//     const baseAmount = Number(holdTransaction.amount || 0);

//     // Default: full payout (backwards compatible)
//     let payPercent = 100;
//     let settlementScenario = "completed";

//     // Try to load the interview round (normal or mock) to inspect status/timing
//     let roundDoc = await InterviewRounds.findById(roundId).lean();
//     let isMockRound = false;

//     if (!roundDoc) {
//       roundDoc = await MockInterviewRound.findById(roundId).lean();
//       isMockRound = !!roundDoc;
//     }

//     const isMockInterview = Boolean(
//       (holdTransaction.metadata && holdTransaction.metadata.isMockInterview) ||
//         isMockRound
//     );

//     if (roundDoc) {
//       const roundStatus = roundDoc.status;
//       const currentAction = roundDoc.currentAction;

//       // Determine when the status effectively changed
//       let actionTime = roundDoc.updatedAt
//         ? new Date(roundDoc.updatedAt)
//         : new Date();

//       // For cancellations, prefer the explicit history entry (when the user actually cancelled)
//       if (
//         roundStatus === "Cancelled" &&
//         Array.isArray(roundDoc.history) &&
//         roundDoc.history.length > 0
//       ) {
//         const cancelEntry = roundDoc.history
//           .slice()
//           .reverse()
//           .find((h) => h && h.action === "Cancelled");

//         if (cancelEntry && cancelEntry.updatedAt) {
//           const cancelTime = new Date(cancelEntry.updatedAt);
//           if (!isNaN(cancelTime.getTime())) {
//             actionTime = cancelTime;
//           }
//         }
//       }

//       // Scheduled interview start time (string in schema)
//       const scheduledTime = roundDoc.dateTime
//         ? new Date(roundDoc.dateTime)
//         : null;

//       // Helper: compute hours before interview at the moment of action
//       let hoursBefore = null;
//       if (
//         scheduledTime &&
//         !isNaN(scheduledTime.getTime()) &&
//         !isNaN(actionTime.getTime())
//       ) {
//         hoursBefore =
//           (scheduledTime.getTime() - actionTime.getTime()) /
//           (1000 * 60 * 60);

//         // For bracket purposes, treat any negative value as 0 (at/after start)
//         if (!isNaN(hoursBefore) && hoursBefore < 0) {
//           hoursBefore = 0;
//         }
//       }

//       const isInterviewerNoShow = currentAction === "Interviewer_NoShow";

//       if (isInterviewerNoShow) {
//         // Interviewer no-show → full refund to organization, no payout
//         payPercent = 0;
//         settlementScenario = "interviewer_no_show";
//       } else if (roundStatus === "Completed") {
//         // Completed interviews always pay 100% to interviewer
//         payPercent = 100;
//         settlementScenario = "completed";
//       } else if (
//         roundStatus === "Cancelled" ||
//         roundStatus === "NoShow" ||
//         roundStatus === "InCompleted" ||
//         roundStatus === "Incomplete"
//       ) {
//         // Apply time-based policy for cancellations / no-show
//         settlementScenario = (roundStatus || "other").toLowerCase();

//         if (hoursBefore == null || isNaN(hoursBefore)) {
//           // If we cannot compute a valid bracket, be conservative (no payout)
//           payPercent = 0;
//         } else if (isMockInterview) {
//           // -------------------------
//           // Mock Interview Policy
//           // > 12h    → 0%
//           // 2–12h    → 25%
//           // < 2h/NS  → 50%
//           // -------------------------
//           if (hoursBefore > 12) {
//             payPercent = 0;
//           } else if (hoursBefore > 2) {
//             payPercent = 25;
//           } else {
//             payPercent = 50;
//           }
//         } else {
//           // -------------------------
//           // Normal Interview Policy
//           // > 24h    → 0%
//           // 12–24h  → 25%
//           // 2–12h   → 50%
//           // < 2h/NS → 100%
//           // -------------------------
//           if (hoursBefore > 24) {
//             payPercent = 0;
//           } else if (hoursBefore > 12) {
//             payPercent = 25;
//           } else if (hoursBefore > 2) {
//             payPercent = 50;
//           } else {
//             payPercent = 100;
//           }
//         }
//       }
//     }

//     // Final settlement amounts
//     // 1) Compute gross payout as per policy (before platform charges & GST)
//     const rawGrossSettlement = (baseAmount * payPercent) / 100;
//     const grossSettlementAmount =
//       Math.round(rawGrossSettlement * 100) / 100; // round to 2 decimals

//     // 2) Any amount not paid out (gross) is refunded back to the organization
//     const refundAmount = Math.max(0, baseAmount - grossSettlementAmount);

//     // 3) Platform service charge (10% of gross payout)
//     const serviceChargePercent = 10;
//     const rawServiceCharge =
//       (grossSettlementAmount * serviceChargePercent) / 100;
//     const serviceCharge = Math.round(rawServiceCharge * 100) / 100;

//     // 4) GST on the service charge (18% of service charge)
//     const gstRate = 0.18;
//     const rawServiceChargeGst = serviceCharge * gstRate;
//     const serviceChargeGst =
//       Math.round(rawServiceChargeGst * 100) / 100;

//     // 5) Net amount actually credited to interviewer after charges + GST
//     let settlementAmount =
//       grossSettlementAmount - serviceCharge - serviceChargeGst;
//     if (settlementAmount < 0) {
//       settlementAmount = 0;
//     }
//     settlementAmount = Math.round(settlementAmount * 100) / 100;
//     // console.log(`[settleInterviewPayment] Gross: ${grossSettlementAmount}, net: ${settlementAmount}, refund: ${refundAmount}, serviceCharge: ${serviceCharge}, gst: ${serviceChargeGst}, scenario: ${settlementScenario}`);

//     // If this is only a preview call, return the computed values without mutating wallets
//     if (isPreview) {
//       const previewData = {
//         settlementAmount,
//         refundAmount,
//         payPercent,
//         serviceCharge,
//         serviceChargeGst,
//         grossSettlementAmount,
//         settlementScenario,
//         organizationWallet: {
//           ownerId: orgWallet.ownerId,
//           balance: orgWallet.balance,
//           holdAmount: orgWallet.holdAmount,
//         },
//         interviewerWallet: null,
//         roundId,
//         originalTransactionId: transactionId,
//         preview: true,
//       };

//       res.locals.logData = {
//         tenantId: interviewerTenantId || req?.body?.tenantId || "",
//         ownerId: interviewerContactId,
//         processName: "Preview Interview Settlement",
//         status: "success",
//         message: "Interview settlement preview computed successfully",
//         requestBody: req.body,
//         responseBody: previewData,
//       };

//       await session.abortTransaction();
//       return res.status(200).json({
//         success: true,
//         message: "Interview settlement preview",
//         data: previewData,
//       });
//     }

//     // 3. Update the hold transaction to debit/completed in organization wallet
//     const orgWalletUpdate = {
//       $set: {
//         "transactions.$.type": "debit",
//         "transactions.$.status": "completed",
//         // Amount debited from organization wallet is the gross payout
//         // determined by the policy (before platform charges & GST)
//         "transactions.$.amount": grossSettlementAmount,
//         "transactions.$.description": `Settled payment to interviewer for ${
//           companyName || "Company"
//         } - ${roundTitle || "Interview Round"}`,
//         "transactions.$.metadata.settledAt": new Date(),
//         "transactions.$.metadata.settlementStatus": "completed",
//         "transactions.$.metadata.settlementBaseAmount": baseAmount,
//         "transactions.$.metadata.settlementPayPercent": payPercent,
//         "transactions.$.metadata.settlementAmountPaidToInterviewer":
//           settlementAmount,
//         "transactions.$.metadata.settlementRefundAmount": refundAmount,
//         "transactions.$.metadata.settlementServiceCharge": serviceCharge,
//         "transactions.$.metadata.settlementServiceChargeGst":
//           serviceChargeGst,
//         "transactions.$.metadata.settlementGrossAmount":
//           grossSettlementAmount,
//         "transactions.$.metadata.settlementScenario": settlementScenario,
//       },
//       $inc: {
//         // Release full hold, and refund any unused portion back to balance
//         holdAmount: -baseAmount,
//         balance: refundAmount,
//       },
//     };

//     const updatedOrgWallet = await WalletTopup.findOneAndUpdate(
//       {
//         _id: orgWallet._id,
//         "transactions._id": transactionId,
//       },
//       orgWalletUpdate,
//       { new: true, session }
//     );

//     if (!updatedOrgWallet) {
//       await session.abortTransaction();
//       return res.status(500).json({
//         success: false,
//         message: "Failed to update organization wallet",
//       });
//     }

//     // If there is a refund portion, also log it as a separate credit transaction
//     if (refundAmount > 0) {
//       const refundTransaction = {
//         type: "credit",
//         amount: refundAmount,
//         description: `Refund for ${companyName || "Company"} - ${
//           roundTitle || "Interview Round"
//         }`,
//         relatedInvoiceId: holdTransaction.relatedInvoiceId,
//         status: "completed",
//         metadata: {
//           ...holdTransaction.metadata,
//           settlementDate: new Date(),
//           originalTransactionId: transactionId,
//           roundId: roundId,
//           settlementType: "interview_refund",
//           companyName: companyName || "Company",
//           roundTitle: roundTitle || "Interview Round",
//           positionTitle: positionTitle || "Position",
//         },
//         createdDate: new Date(),
//         createdAt: new Date(),
//       };

//       await WalletTopup.findByIdAndUpdate(
//         orgWallet._id,
//         {
//           $push: {
//             transactions: refundTransaction,
//           },
//         },
//         { session }
//       );
//     }

//     // console.log(`[settleInterviewPayment] Updated org wallet - reduced hold by ${settlementAmount}`);

//     // 4. Find or create interviewer's wallet
//     let interviewerWallet = await WalletTopup.findOne({
//       ownerId: interviewerContactId,
//     }).session(session);

//     if (!interviewerWallet) {
//       // Create wallet for interviewer if doesn't exist
//       // Get tenantId from the organization wallet or request
//       const tenantId =
//         orgWallet?.tenantId || req.body?.tenantId || req.query?.tenantId;

//       if (!tenantId) {
//         console.warn(
//           `[settleInterviewPayment] Creating interviewer wallet without tenantId for ${interviewerContactId}`
//         );
//       }
//     }

//     // 5. Create credit transaction for interviewer (only if there is a payout)
//     let creditTransaction = null;
//     let updatedInterviewerWallet = null;

//     if (settlementAmount > 0) {
//       creditTransaction = {
//         type: "credit",
//         amount: settlementAmount,
//         description: `Payment from ${companyName || "Company"} - ${
//           roundTitle || "Interview Round"
//         } for ${positionTitle || "Position"}`,
//         relatedInvoiceId: holdTransaction.relatedInvoiceId,
//         status: "completed",
//         metadata: {
//           ...holdTransaction.metadata,
//           settlementDate: new Date(),
//           originalTransactionId: transactionId,
//           organizationWalletId: orgWallet._id.toString(),
//           roundId: roundId,
//           settlementType: "interview_payment",
//           companyName: companyName || "Company",
//           roundTitle: roundTitle || "Interview Round",
//           positionTitle: positionTitle || "Position",
//         },
//         createdDate: new Date(),
//         createdAt: new Date(),
//       };

//       // 6. Update interviewer's wallet - add balance and transaction
//       updatedInterviewerWallet = await WalletTopup.findByIdAndUpdate(
//         interviewerWallet._id,
//         {
//           $inc: {
//             balance: settlementAmount, // Increase interviewer balance
//           },
//           $push: {
//             transactions: creditTransaction,
//           },
//         },
//         { new: true, session }
//       );

//       if (!updatedInterviewerWallet) {
//         await session.abortTransaction();
//         return res.status(500).json({
//           success: false,
//           message: "Failed to update interviewer wallet",
//         });
//       }
//     }

//     // console.log(`[settleInterviewPayment] Added ${settlementAmount} to interviewer wallet. New balance: ${updatedInterviewerWallet?.balance}`);

//     // 7. Send push notification to interviewer
//     try {
//       if (settlementAmount > 0) {
//         await createInterviewSettlementNotification(
//           interviewerContactId,
//           interviewerTenantId,
//           {
//             amount: settlementAmount,
//             companyName: companyName || "Company",
//             roundTitle: roundTitle || "Interview Round",
//             positionTitle: positionTitle || "Position",
//             settlementCode: transactionId,
//           }
//         );
//       }
//       // console.log("[settleInterviewPayment] Push notification sent to interviewer");
//     } catch (notifErr) {
//       console.error(
//         "[settleInterviewPayment] Failed to send notification:",
//         notifErr
//       );
//       // Don't fail the settlement if notification fails
//     }

//     // 8. Update the interview round to mark settlement

//     // Try regular interview round first
//     let roundUpdate = await InterviewRounds.findByIdAndUpdate(
//       roundId,
//       {
//         $set: {
//           settlementStatus: "completed",
//           settlementDate: new Date(),
//         },
//       },
//       { new: true, session }
//     );

//     // If not found, try mock interview round
//     if (!roundUpdate) {
//       roundUpdate = await MockInterviewRound.findByIdAndUpdate(
//         roundId,
//         {
//           $set: {
//             settlementStatus: "completed",
//             settlementDate: new Date(),
//           },
//         },
//         { new: true, session }
//       );
//     }

//     // Commit transaction
//     await session.commitTransaction();

//     // console.log("[settleInterviewPayment] Settlement completed successfully");

//     const responseData = {
//       settlementAmount,
//       refundAmount,
//       payPercent,
//       serviceCharge,
//       serviceChargeGst,
//       grossSettlementAmount,
//       settlementScenario,
//       organizationWallet: {
//         ownerId: updatedOrgWallet.ownerId,
//         balance: updatedOrgWallet.balance,
//         holdAmount: updatedOrgWallet.holdAmount,
//       },
//       interviewerWallet:
//         settlementAmount > 0 && updatedInterviewerWallet
//           ? {
//               ownerId: updatedInterviewerWallet.ownerId,
//               balance: updatedInterviewerWallet.balance,
//               creditTransactionId: creditTransaction._id,
//             }
//           : null,
//       roundId,
//       originalTransactionId: transactionId,
//     };

//     // Internal log: success
//     res.locals.logData = {
//       tenantId: interviewerTenantId || req?.body?.tenantId || "",
//       ownerId: interviewerContactId,
//       processName: "Settle Interview Payment",
//       status: "success",
//       message: "Interview payment settled successfully",
//       requestBody: req.body,
//       responseBody: responseData,
//     };

//     return res.status(200).json({
//       success: true,
//       message: "Interview payment settled successfully",
//       data: responseData,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error("[settleInterviewPayment] Error:", error);
//     // Internal log: error
//     res.locals.logData = {
//       tenantId: req?.body?.tenantId || "",
//       ownerId: req?.body?.interviewerContactId || null,
//       processName: "Settle Interview Payment",
//       status: "error",
//       message: "Failed to settle interview payment",
//       requestBody: req.body,
//       responseBody: {
//         error: error.message,
//       },
//     };

//     return res.status(500).json({
//       success: false,
//       message: "Failed to settle interview payment",
//       error: error.message,
//     });
//   } finally {
//     session.endSession();
//   }
// };





/**
 * Settle interview payment from an organization wallet HOLD to interviewer wallet,
 * using InterviewPolicy + RegionalTaxConfig rules.
 *
 * API: POST /wallet/settle-interview
 *
 * Request body:
 *   - roundId (string, required): InterviewRounds or MockInterviewRound ID.
 *   - interviewerContactId (string, required): wallet owner ID for interviewer.
 *   - companyName (string, optional): used in transaction descriptions.
 *   - roundTitle (string, optional): used in descriptions.
 *   - positionTitle (string, optional): used in descriptions.
 *   - interviewerTenantId (string, optional): tenant for interviewer wallet.
 *   - previewOnly (boolean, optional): true = calculate only, false = apply changes.
 *
 * Behaviour:
 *   1) Finds the organization wallet that has a HOLD transaction for this round
 *      (transactions.metadata.roundId === roundId).
 *   2) Uses that HOLD amount as baseAmount.
 *   3) Loads the round (normal or mock) to determine:
 *        - status (Completed / Cancelled / NoShow / Rescheduled / InCompleted / Incomplete)
 *        - currentAction (e.g. "Interviewer_NoShow")
 *        - scheduled start time vs action time (to compute hoursBefore).
 *   4) Determines payPercent according to status:
 *        - currentAction === "Interviewer_NoShow":
 *             payPercent = 0 (candidate/org gets full refund, interviewer gets 0).
 *        - status === "Completed":
 *             payPercent = 100 (full payout to interviewer, minus platform fee + GST).
 *        - status in ["Cancelled","NoShow","InCompleted","Incomplete"]:
 *             uses InterviewPolicy (category INTERVIEW/MOCK, type CANCEL) and
 *             time window to find interviewerPayoutPercentage.
 *        - status === "Rescheduled":
 *             uses InterviewPolicy (type RESCHEDULE) and checks history;
 *             if policy.firstRescheduleFree === true and this is first reschedule,
 *             overrides payPercent = 0 (free reschedule).
 *        - if no matching policy or timing invalid:
 *             payPercent = 0 ("no_policy_found"/"policy_lookup_error").
 *   5) Uses RegionalTaxConfig to get serviceCharge% and GST, then computes:
 *        - grossSettlementAmount = baseAmount * payPercent / 100
 *        - refundAmount = baseAmount - grossSettlementAmount
 *        - serviceCharge on grossSettlementAmount
 *        - serviceChargeGst on serviceCharge
 *        - settlementAmount = grossSettlementAmount - serviceCharge - serviceChargeGst
 *
 * Preview mode (previewOnly = true):
 *   - Returns all calculated values and wallet snapshot WITHOUT mutating any wallet.
 *
 * Apply mode (previewOnly = false):
 *   - Converts org HOLD transaction to completed DEBIT for grossSettlementAmount.
 *   - Decreases org holdAmount by baseAmount and increases balance by refundAmount.
 *   - If settlementAmount > 0, credits interviewer wallet and adds a payout transaction.
 *   - Credits platform wallet with platform fee and GST portions.
 *   - Updates round settlementStatus/date and sends notification to interviewer.
 */


const settleInterviewPayment = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Settle Interview Payment";

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      roundId,
      interviewerContactId,
      companyName,
      roundTitle,
      positionTitle,
      interviewerTenantId,
      previewOnly,
    } = req.body;

    const isPreview = Boolean(previewOnly);

    if (!roundId || !interviewerContactId) {
      return res.status(400).json({
        success: false,
        message: "roundId and interviewerContactId are required",
      });
    }

    // 1. Find the organization's wallet with transactions for this round
    const orgWallet = await WalletTopup.findOne({
      "transactions.metadata.roundId": roundId,
    }).session(session);

    if (!orgWallet) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Organization wallet with round transactions not found",
      });
    }

    // 2. Find the active hold transaction (latest hold not settled)
    const activeHoldTransaction = orgWallet.transactions
      .filter(t =>
        t.metadata && t.metadata.roundId === roundId &&
        t.type === "hold" &&
        t.status !== "completed"
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (!activeHoldTransaction) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Active hold transaction not found for this round",
      });
    }

    const transactionId = activeHoldTransaction._id.toString();
    const baseAmount = Number(activeHoldTransaction.amount || 0);

    // 3. Load the interview round (normal or mock)
    let roundDoc = await InterviewRounds.findById(roundId).lean();
    let isMockRound = false;

    if (!roundDoc) {
      roundDoc = await MockInterviewRound.findById(roundId).lean();
      isMockRound = !!roundDoc;
    }

    if (!roundDoc) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Interview round not found",
      });
    }

    const isMockInterview = Boolean(
      (activeHoldTransaction.metadata && activeHoldTransaction.metadata.isMockInterview) ||
      isMockRound
    );

    const roundStatus = roundDoc.status;
    const currentAction = roundDoc.currentAction;

    // Determine action time (e.g., when cancelled)
    let actionTime = roundDoc.updatedAt ? new Date(roundDoc.updatedAt) : new Date();

    if (
      roundStatus === "Cancelled" &&
      Array.isArray(roundDoc.history) &&
      roundDoc.history.length > 0
    ) {
      const cancelEntry = roundDoc.history
        .slice()
        .reverse()
        .find(h => h && h.action === "Cancelled");

      if (cancelEntry && cancelEntry.updatedAt) {
        const cancelTime = new Date(cancelEntry.updatedAt);
        if (!isNaN(cancelTime.getTime())) {
          actionTime = cancelTime;
        }
      }
    }

    // Scheduled time (last one)
    const scheduledTime = roundDoc.dateTime ? new Date(roundDoc.dateTime) : null;

    // Compute hoursBefore
    let hoursBefore = null;
    if (
      scheduledTime &&
      !isNaN(scheduledTime.getTime()) &&
      !isNaN(actionTime.getTime())
    ) {
      hoursBefore =
        (scheduledTime.getTime() - actionTime.getTime()) / (1000 * 60 * 60);
      if (!isNaN(hoursBefore) && hoursBefore < 0) {
        hoursBefore = 0;
      }
    }

    const isInterviewerNoShow = currentAction === "Interviewer_NoShow";

    // Legacy settlement logic (before InterviewPolicy DB, using getPayPercent helper):
    // let payPercentLegacy;
    // let settlementScenarioLegacy;
    //
    // if (isInterviewerNoShow) {
    //   payPercentLegacy = 0;
    //   settlementScenarioLegacy = "interviewer_no_show";
    // } else {
    //   const resultLegacy = getPayPercent(
    //     isMockInterview,
    //     roundStatus,
    //     hoursBefore
    //   );
    //   payPercentLegacy = resultLegacy.payPercent;
    //   settlementScenarioLegacy = resultLegacy.settlementScenario;
    // }

    let payPercent = 0;
    let settlementScenario = "unknown_status";

    // Track which InterviewPolicy was applied (if any) for traceability
    let appliedPolicyId = null;
    let appliedPolicyCategory = isMockInterview ? "MOCK" : "INTERVIEW";
    let appliedPolicyName = null;

    if (isInterviewerNoShow) {
      // Interviewer no-show: interviewer always gets 0%
      payPercent = 0;
      settlementScenario = "interviewer_no_show";
      appliedPolicyName = "interviewer_no_show";
    } else if (roundStatus === "Completed") {
      // Completed interview: always pay 100%
      payPercent = 100;
      settlementScenario = "completed";
      appliedPolicyName = "completed";
    } else {
      try {
        const policy = await findPolicyForSettlement(
          isMockInterview,
          roundStatus,
          hoursBefore
        );

        if (policy) {
          // Base payout from DB policy
          if (typeof policy.interviewerPayoutPercentage === "number") {
            payPercent = policy.interviewerPayoutPercentage;
          } else {
            payPercent = 0;
          }

          if (policy.policyName) {
            settlementScenario = policy.policyName;
          }

          // Capture applied policy identifiers for reporting / audit
          if (policy._id) {
            appliedPolicyId = policy._id;
          }
          if (policy.category) {
            appliedPolicyCategory = policy.category;
          }
          if (policy.policyName) {
            appliedPolicyName = policy.policyName;
          }

          // Handle first reschedule free using policy flag + history
          if (
            policy.type === "RESCHEDULE" &&
            policy.firstRescheduleFree &&
            isFirstFreeReschedule(
              Array.isArray(roundDoc.history) ? roundDoc.history : []
            )
          ) {
            payPercent = 0;
            settlementScenario = policy.policyName || "first_reschedule_free";
          }
        } else {
          // No matching policy found in DB
          payPercent = 0;
          settlementScenario = "no_policy_found";
          appliedPolicyName = "no_policy_found";
        }
      } catch (policyErr) {
        console.warn(
          "[settleInterviewPayment] Failed to load InterviewPolicy:",
          policyErr && policyErr.message ? policyErr.message : policyErr
        );
        payPercent = 0;
        settlementScenario = "policy_lookup_error";
        appliedPolicyName = "policy_lookup_error";
      }
    }

    // Load regional tax config (service charge & GST) from DB based on tenant's region/currency
    let serviceChargePercent = 0;
    let gstRate = 0;

    try {
      // Derive tenant context for pricing lookup
      const orgTenantId = orgWallet.tenantId || req?.body?.tenantId || "";

      let regionCode = "IN";
      let currencyCode = "INR";

      if (orgTenantId) {
        const tenantDoc = await Tenant.findById(orgTenantId).lean();
        if (tenantDoc) {
          if (tenantDoc.regionCode) {
            regionCode = tenantDoc.regionCode;
          } else if (tenantDoc.country) {
            // Fallback: use country as region code if explicit regionCode not set
            regionCode = tenantDoc.country;
          }

          if (tenantDoc.currency && tenantDoc.currency.code) {
            currencyCode = tenantDoc.currency.code;
          }
        }
      }

      // 1) Try exact match on region + currency, status Active
      let pricing = await RegionalTaxConfig.findOne({
        status: "Active",
        regionCode,
        "currency.code": currencyCode,
      })
        .sort({ _id: -1 })
        .lean();

      // 2) Fallback: any Active default config for same currency
      if (!pricing) {
        pricing = await RegionalTaxConfig.findOne({
          status: "Active",
          isDefault: true,
          "currency.code": currencyCode,
        })
          .sort({ _id: -1 })
          .lean();
      }

      // 3) Fallback: any Active default config regardless of currency
      if (!pricing) {
        pricing = await RegionalTaxConfig.findOne({
          status: "Active",
          isDefault: true,
        })
          .sort({ _id: -1 })
          .lean();
      }

      if (pricing) {
        if (
          pricing.serviceCharge &&
          pricing.serviceCharge.enabled &&
          typeof pricing.serviceCharge.percentage === "number"
        ) {
          serviceChargePercent = pricing.serviceCharge.percentage;
        }

        if (
          pricing.gst &&
          pricing.gst.enabled &&
          typeof pricing.gst.percentage === "number"
        ) {
          gstRate = pricing.gst.percentage;
        }
      }
    } catch (pricingErr) {
      console.warn(
        "[settleInterviewPayment] Failed to load RegionalTaxConfig:",
        pricingErr && pricingErr.message ? pricingErr.message : pricingErr
      );
      serviceChargePercent = 0;
      gstRate = 0;
    }

    // Compute amounts using util
    const {
      grossSettlementAmount,
      refundAmount,
      serviceCharge,
      serviceChargeGst,
      settlementAmount,
    } = computeSettlementAmounts(baseAmount, payPercent, serviceChargePercent, gstRate);

    if (isPreview) {
      const previewData = {
        settlementAmount,
        refundAmount,
        payPercent,
        serviceCharge,
        serviceChargeGst,
        grossSettlementAmount,
        settlementScenario,
        settlementPolicyId: appliedPolicyId,
        settlementPolicyCategory: appliedPolicyCategory,
        settlementPolicyName: appliedPolicyName || settlementScenario,
        organizationWallet: {
          ownerId: orgWallet.ownerId,
          balance: orgWallet.balance,
          holdAmount: orgWallet.holdAmount,
        },
        interviewerWallet: null,
        roundId,
        originalTransactionId: transactionId,
        preview: true,
      };

      res.locals.logData = {
        tenantId: interviewerTenantId || req?.body?.tenantId || "",
        ownerId: interviewerContactId,
        processName: "Preview Interview Settlement",
        status: "success",
        message: "Interview settlement preview computed successfully",
        requestBody: req.body,
        responseBody: previewData,
      };

      await session.abortTransaction();
      return res.status(200).json({
        success: true,
        message: "Interview settlement preview",
        data: previewData,
      });
    }

    // Update org wallet: settle the hold to debit
    const orgWalletUpdate = {
      $set: {
        "transactions.$.type": "debit",
        "transactions.$.status": "completed",
        "transactions.$.amount": grossSettlementAmount,
        "transactions.$.description": `Settled payment to interviewer for ${companyName || "Company"} - ${roundTitle || "Interview Round"}`,
        "transactions.$.metadata.settledAt": new Date(),
        "transactions.$.metadata.settlementStatus": "completed",
        "transactions.$.metadata.settlementBaseAmount": baseAmount,
        "transactions.$.metadata.settlementPayPercent": payPercent,
        "transactions.$.metadata.settlementAmountPaidToInterviewer": settlementAmount,
        "transactions.$.metadata.settlementRefundAmount": refundAmount,
        "transactions.$.metadata.settlementServiceCharge": serviceCharge,
        "transactions.$.metadata.settlementServiceChargeGst": serviceChargeGst,
        "transactions.$.metadata.settlementGrossAmount": grossSettlementAmount,
        "transactions.$.metadata.settlementScenario": settlementScenario,
        "transactions.$.metadata.settlementPolicyId": appliedPolicyId,
        "transactions.$.metadata.settlementPolicyCategory": appliedPolicyCategory,
        "transactions.$.metadata.settlementPolicyName": appliedPolicyName || settlementScenario,
      },
      $inc: {
        holdAmount: -baseAmount,
        balance: refundAmount,
      },
    };

    const updatedOrgWallet = await WalletTopup.findOneAndUpdate(
      {
        _id: orgWallet._id,
        "transactions._id": transactionId,
      },
      orgWalletUpdate,
      { new: true, session }
    );

    if (!updatedOrgWallet) {
      await session.abortTransaction();
      return res.status(500).json({
        success: false,
        message: "Failed to update organization wallet",
      });
    }

    // Log refund transaction if applicable
    if (refundAmount > 0) {
      const refundTransaction = {
        type: "refund",
        amount: refundAmount,
        description: `Refund for ${companyName || "Company"} - ${roundTitle || "Interview Round"}`,
        relatedInvoiceId: activeHoldTransaction.relatedInvoiceId,
        status: "completed",
        metadata: {
          ...activeHoldTransaction.metadata,
          settlementDate: new Date(),
          originalTransactionId: transactionId,
          roundId: roundId,
          settlementType: "interview_refund",
          companyName: companyName || "Company",
          roundTitle: roundTitle || "Interview Round",
          positionTitle: positionTitle || "Position",
          settlementPolicyId: appliedPolicyId,
          settlementPolicyCategory: appliedPolicyCategory,
          settlementPolicyName: appliedPolicyName || settlementScenario,
        },
        createdDate: new Date(),
        createdAt: new Date(),
      };

      await WalletTopup.findByIdAndUpdate(
        orgWallet._id,
        { $push: { transactions: refundTransaction } },
        { session }
      );
    }

    // Find or create interviewer wallet
    let interviewerWallet = await WalletTopup.findOne({
      ownerId: interviewerContactId,
    }).session(session);

    if (!interviewerWallet) {
      // Create basic interviewer wallet if it does not exist yet
      interviewerWallet = new WalletTopup({
        ownerId: interviewerContactId,
        currency: "INR",
        tenantId: interviewerTenantId || req?.body?.tenantId || "",
        balance: 0,
        holdAmount: 0,
        transactions: [],
      });

      await interviewerWallet.save({ session });
    }

    let creditTransaction = null;
    let updatedInterviewerWallet = null;

    if (settlementAmount > 0) {
      const interviewerPrevBalance = Number(interviewerWallet.balance || 0);
      const interviewerPrevHold = Number(interviewerWallet.holdAmount || 0);
      const interviewerNewBalance = interviewerPrevBalance + settlementAmount;

      creditTransaction = {
        type: "payout",
        bucket: "AVAILABLE",
        effect: "CREDIT",
        amount: settlementAmount,
        gstAmount: 0,
        serviceCharge: 0,
        totalAmount: settlementAmount,
        description: `Payment from ${companyName || "Company"} - ${roundTitle || "Interview Round"} for ${positionTitle || "Position"}`,
        relatedInvoiceId: activeHoldTransaction.relatedInvoiceId,
        status: "completed",
        metadata: {
          ...activeHoldTransaction.metadata,
          settlementDate: new Date(),
          originalTransactionId: transactionId,
          organizationWalletId: orgWallet._id.toString(),
          roundId: roundId,
          settlementType: "interview_payment",
          companyName: companyName || "Company",
          roundTitle: roundTitle || "Interview Round",
          positionTitle: positionTitle || "Position",
          settlementPolicyId: appliedPolicyId,
          settlementPolicyCategory: appliedPolicyCategory,
          settlementPolicyName: appliedPolicyName || settlementScenario,
        },
        balanceBefore: interviewerPrevBalance,
        balanceAfter: interviewerNewBalance,
        holdBalanceBefore: interviewerPrevHold,
        holdBalanceAfter: interviewerPrevHold,
        createdDate: new Date(),
        createdAt: new Date(),
      };

      updatedInterviewerWallet = await WalletTopup.findByIdAndUpdate(
        interviewerWallet._id,
        {
          $inc: { balance: settlementAmount },
          $push: { transactions: creditTransaction },
        },
        { new: true, session }
      );

      if (!updatedInterviewerWallet) {
        await session.abortTransaction();
        return res.status(500).json({
          success: false,
          message: "Failed to update interviewer wallet",
        });
      }
    }

    // ---------------- PLATFORM (SUPERADMIN) WALLET LEDGER -----------------
    // Record platform fee and GST portions into a dedicated PLATFORM wallet
    let updatedPlatformWallet = null;
    let platformFeeTransaction = null;
    let platformGstTransaction = null;

    if (serviceCharge > 0 || serviceChargeGst > 0) {
      const platformWallet = await getOrCreatePlatformWallet(session);
      const platformPrevBalance = Number(platformWallet.balance || 0);
      const platformPrevHold = Number(platformWallet.holdAmount || 0);

      const platformTransactions = [];
      let runningBalance = platformPrevBalance;

      if (serviceCharge > 0) {
        const nextBalance = runningBalance + serviceCharge;
        platformFeeTransaction = {
          type: "platform_fee",
          bucket: "AVAILABLE",
          effect: "CREDIT",
          amount: serviceCharge,
          gstAmount: 0,
          serviceCharge: serviceCharge,
          totalAmount: serviceCharge,
          description: `Platform fee for ${companyName || "Company"} - ${roundTitle || "Interview Round"}`,
          relatedInvoiceId: activeHoldTransaction.relatedInvoiceId,
          status: "completed",
          reason: "PLATFORM_COMMISSION",
          metadata: {
            ...(activeHoldTransaction.metadata || {}),
            settlementDate: new Date(),
            roundId: roundId,
            organizationWalletId: orgWallet._id.toString(),
            interviewerOwnerId: interviewerContactId,
            settlementPolicyId: appliedPolicyId,
            settlementPolicyCategory: appliedPolicyCategory,
            settlementPolicyName: appliedPolicyName || settlementScenario,
          },
          balanceBefore: runningBalance,
          balanceAfter: nextBalance,
          holdBalanceBefore: platformPrevHold,
          holdBalanceAfter: platformPrevHold,
          createdDate: new Date(),
          createdAt: new Date(),
        };
        platformTransactions.push(platformFeeTransaction);
        runningBalance = nextBalance;
      }

      if (serviceChargeGst > 0) {
        const nextBalance = runningBalance + serviceChargeGst;
        platformGstTransaction = {
          type: "platform_fee",
          bucket: "AVAILABLE",
          effect: "CREDIT",
          amount: serviceChargeGst,
          gstAmount: serviceChargeGst,
          serviceCharge: 0,
          totalAmount: serviceChargeGst,
          description: `GST on platform fee for ${companyName || "Company"} - ${roundTitle || "Interview Round"}`,
          relatedInvoiceId: activeHoldTransaction.relatedInvoiceId,
          status: "completed",
          reason: "PLATFORM_GST",
          metadata: {
            ...(activeHoldTransaction.metadata || {}),
            settlementDate: new Date(),
            roundId: roundId,
            organizationWalletId: orgWallet._id.toString(),
            interviewerOwnerId: interviewerContactId,
          },
          balanceBefore: runningBalance,
          balanceAfter: nextBalance,
          holdBalanceBefore: platformPrevHold,
          holdBalanceAfter: platformPrevHold,
          createdDate: new Date(),
          createdAt: new Date(),
        };
        platformTransactions.push(platformGstTransaction);
        runningBalance = nextBalance;
      }

      if (platformTransactions.length > 0) {
        const totalDelta = runningBalance - platformPrevBalance;

        updatedPlatformWallet = await WalletTopup.findByIdAndUpdate(
          platformWallet._id,
          {
            $inc: { balance: totalDelta },
            $push: { transactions: { $each: platformTransactions } },
          },
          { new: true, session }
        );
      }
    }

    // Send notification
    if (settlementAmount > 0) {
      await createInterviewSettlementNotification(
        interviewerContactId,
        interviewerTenantId,
        {
          amount: settlementAmount,
          companyName: companyName || "Company",
          roundTitle: roundTitle || "Interview Round",
          positionTitle: positionTitle || "Position",
          settlementCode: transactionId,
        }
      );
    }

    await session.commitTransaction();

    const responseData = {
      settlementAmount,
      refundAmount,
      payPercent,
      serviceCharge,
      serviceChargeGst,
      grossSettlementAmount,
      settlementScenario,
      organizationWallet: {
        ownerId: updatedOrgWallet.ownerId,
        balance: updatedOrgWallet.balance,
        holdAmount: updatedOrgWallet.holdAmount,
      },
      interviewerWallet: settlementAmount > 0 && updatedInterviewerWallet
        ? {
          ownerId: updatedInterviewerWallet.ownerId,
          balance: updatedInterviewerWallet.balance,
          creditTransactionId: creditTransaction._id,
        }
        : null,
      platformWallet:
        updatedPlatformWallet && (platformFeeTransaction || platformGstTransaction)
          ? {
              ownerId: updatedPlatformWallet.ownerId,
              balance: updatedPlatformWallet.balance,
              lastFeeTransactionId: platformFeeTransaction?._id,
              lastGstTransactionId: platformGstTransaction?._id,
            }
          : null,
      roundId,
      originalTransactionId: transactionId,
    };

    res.locals.logData = {
      tenantId: interviewerTenantId || req?.body?.tenantId || "",
      ownerId: interviewerContactId,
      processName: "Settle Interview Payment",
      status: "success",
      message: "Interview payment settled successfully",
      requestBody: req.body,
      responseBody: responseData,
    };

    return res.status(200).json({
      success: true,
      message: "Interview payment settled successfully",
      data: responseData,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("[settleInterviewPayment] Error:", error);
    res.locals.logData = {
      tenantId: req?.body?.tenantId || "",
      ownerId: req?.body?.interviewerContactId || null,
      processName: "Settle Interview Payment",
      status: "error",
      message: "Failed to settle interview payment",
      requestBody: req.body,
      responseBody: { error: error.message },
    };

    return res.status(500).json({
      success: false,
      message: "Failed to settle interview payment",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getWalletByOwnerId,
  getPlatformWallet,
  createTopupOrder,
  walletVerifyPayment,
  addBankAccount,
  getBankAccounts,
  deleteBankAccount,
  verifyBankAccount,
  createWithdrawalRequest,
  getWithdrawalRequests,
  getWithdrawalRequestById,
  cancelWithdrawalRequest,
  handlePayoutWebhook,
  fixVerifiedBankAccounts,
  settleInterviewPayment, // Added settlement function
  // Manual processing endpoints for superadmin
  processManualWithdrawal,
  failManualWithdrawal,
  getAllWithdrawalRequests,
};
