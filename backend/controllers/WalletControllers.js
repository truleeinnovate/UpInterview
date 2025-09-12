const mongoose = require("mongoose");
const WalletTopup = require("../models/WalletTopup");
const Razorpay = require("razorpay");
const Payment = require("../models/Payments");
const Invoice = require("../models/Invoicemodels");
const Receipt = require("../models/Receiptmodels");
const crypto = require("crypto");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
      wallet = await WalletTopup.create({
        ownerId,
        balance: 0,
        transactions: [],
      });
    }

    res.status(200).json({ walletDetials: [wallet] });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create Razorpay order for wallet top-up
const createTopupOrder = async (req, res) => {
  try {
    const { amount, currency = "USD", ownerId, tenantId } = req.body;

    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    if (!ownerId) {
      return res.status(400).json({ error: "ownerId is required" });
    }

    // Generate walletCode like "WLT-00001"
    const lastTopup = await WalletTopup.findOne({})
      .sort({ _id: -1 })
      .select("walletCode")
      .lean();

    let nextWalletNumber = 1;
    if (lastTopup && lastTopup.walletCode) {
      const match = lastTopup.walletCode.match(/WLT-(\d+)/);
      if (match) {
        nextWalletNumber = parseInt(match[1], 10) + 1;
      }
    }

    const walletCode = `WLT-${String(nextWalletNumber).padStart(5, "0")}`;

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
        tenantId: tenantId || "default",
        walletCode: walletCode,
      },
    });

    res.status(200).json({
      orderId: order.id,
      amount: amount,
      currency: currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating topup order:", error);
    res.status(500).json({ error: "Failed to create topup order" });
  }
};

// Verify payment and update wallet balance
const walletVerifyPayment = async (req, res) => {
  try {
    console.log("Payment verification request received:", req.body);

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      ownerId,
      tenantId,
      amount,
      currency = "USD",
      description = "Wallet Top-up via Razorpay",
    } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error("Missing required Razorpay fields", {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      });
      return res
        .status(400)
        .json({ error: "Missing required Razorpay verification fields" });
    }

    if (!ownerId) {
      console.error("Missing ownerId");
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
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    console.log("Signature validated successfully");

    // Get payment details from Razorpay - Make this optional
    // If we can't get payment details, we'll trust the signature verification
    let paymentVerified = false;
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment && payment.status) {
        console.log("Payment details fetched:", payment.status);

        if (payment.status === "captured" || payment.status === "authorized") {
          paymentVerified = true;
        } else {
          console.log(
            `Payment status is ${payment.status}, continuing with signature verification only`
          );
        }
      } else {
        console.log(
          "Payment details incomplete, continuing with signature verification only"
        );
      }
    } catch (razorpayError) {
      console.error("Error fetching payment from Razorpay:", razorpayError);
      console.log("Continuing with signature verification only");
      // Instead of returning an error, we'll continue with signature verification
      // This makes our process more robust in case Razorpay API has issues
    }

    // Since the signature is valid, we'll proceed with the payment processing
    // The signature verification is our primary method of validating payments
    console.log("Proceeding based on valid signature verification");

    // Find or create wallet
    let wallet;
    try {
      wallet = await WalletTopup.findOne({ ownerId });

      if (!wallet) {
        console.log("Creating new wallet for owner:", ownerId);
        wallet = await WalletTopup.create({
          ownerId,
          walletCode,
          tenantId: tenantId || "default",
          balance: 0,
          transactions: [],
        });
      }
    } catch (dbError) {
      console.error("Database error when finding/creating wallet:", dbError);
      return res
        .status(500)
        .json({ error: "Database error when accessing wallet" });
    }

    // Parse amount as number and validate
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error("Invalid amount:", amount);
      return res.status(400).json({ error: "Invalid amount provided" });
    }

    // Add transaction - ensure lowercase transaction type and maintain compatibility with existing data structure
    const transaction = {
      type: "credit", // Explicitly lowercase
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
      console.log("Payment already processed, returning success");
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

    // Update wallet balance and add transaction
    try {
      // Credit transactions always increase the available balance immediately
      wallet.balance += parsedAmount;
      wallet.transactions.push(transaction);
      await wallet.save();
      console.log("Wallet updated successfully", { balance: wallet.balance });

      /* ------------------------------------------------------------------
         Create simple Invoice, Receipt and Payment records for this top-up
         ------------------------------------------------------------------ */
      
      try {
        // 1. Invoice
        invoice = await Invoice.create({
          tenantId: tenantId || "default",
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
          invoiceCode: walletCode,
        });

        // 2. Receipt – reference the created invoice
        receipt = await Receipt.create({
          invoiceId: invoice._id,
          tenantId: tenantId || "default",
          ownerId,
          amount: parsedAmount,
          paymentMethod: "razorpay",
          transactionId: razorpay_payment_id,
          receiptCode: `RCPT-${Date.now()}`,
          status: "success",
        });

        // 3. Payment – reference both invoice & receipt
        payment = await Payment.create({
          paymentCode: `PAY-${Date.now()}`,
          tenantId: tenantId || "default",
          ownerId,
          amount: parsedAmount,
          currency: currency || "USD",
          status: "captured",
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
        console.error("Error creating payment/invoice/receipt records:", recordErr);
        // We will not fail the entire request if these records cannot be created;
        // wallet top-up has already been credited. Just continue.
      }
    } catch (saveError) {
      console.error("Error saving wallet:", saveError);
      return res
        .status(500)
        .json({ error: "Failed to update wallet", details: saveError.message });
    }

    res.status(200).json({
      success: true,
      wallet,
      transaction,
      invoice,
      receipt,
      payment,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
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

module.exports = {
  getWalletByOwnerId,
  createTopupOrder,
  walletVerifyPayment,
  //handleWebhook
};
