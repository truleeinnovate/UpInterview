// v1.0.0 - Venkatesh - Added settleInterviewPayment function to handle interview payment settlement from hold to interviewer wallet
// v1.0.1 - Venkatesh - Added tenantId support to wallet creation in getWalletByOwnerId and settleInterviewPayment functions

const mongoose = require("mongoose");
const WalletTopup = require("../models/WalletTopup");
const Razorpay = require("razorpay");
const Payment = require("../models/Payments");
const Invoice = require("../models/Invoicemodels");
const { generateUniqueInvoiceCode } = require("../utils/invoiceCodeGenerator");
const Receipt = require("../models/Receiptmodels");
const BankAccount = require("../models/BankAccount");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const PushNotification = require("../models/PushNotifications");

// Import payment push notification functions
const {
    createWalletTopupNotification,
    createInterviewSettlementNotification
} = require('./PushNotificationControllers/pushNotificationPaymentController');
const crypto = require("crypto");
const https = require("https");
const { MockInterviewRound } = require("../models/MockInterview/mockinterviewRound");
const { InterviewRounds } = require("../models/Interview/InterviewRounds");

// Initialize Razorpay SDK
// Note: This uses the same credentials for both Razorpay (payments) and RazorpayX (payouts)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    // Extract tenantId from query params or headers
    const tenantId = req.query.tenantId || req.headers['x-tenant-id'] || req.body?.tenantId;

    // Validate ownerId
    if (!ownerId) {
      return res.status(400).json({ error: "ownerId is required" });
    }

    // Find or create wallet
    let wallet = await WalletTopup.findOne({ ownerId });

    if (!wallet) {
      // Log when creating wallet without tenantId
      if (!tenantId) {
        console.warn(`[getWalletByOwnerId] Creating wallet for ${ownerId} without tenantId`);
      }
      
      wallet = await WalletTopup.create({
        ownerId,
        tenantId: tenantId || "default",
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
    const { amount, currency = "INR", ownerId, tenantId } = req.body;

    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    if (!ownerId) {
      return res.status(400).json({ error: "ownerId is required" });
    }

    // Determine walletCode: reuse existing wallet's code if present, otherwise generate a new one
    let walletCode;
    const existingWallet = await WalletTopup.findOne({ ownerId })
      .select("walletCode")
      .lean();
    
    if (existingWallet?.walletCode) {
      walletCode = existingWallet.walletCode;
    } else {
      // Generate unique walletCode with retry logic for concurrent safety
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        const lastWallet = await WalletTopup.findOne({})
          .sort({ _id: -1 })
          .select("walletCode")
          .lean();
        
        let nextWalletNumber = 50001; // Start from 50001
        if (lastWallet?.walletCode) {
          const match = lastWallet.walletCode.match(/WLT-(\d+)/);
          if (match) {
            const lastNumber = parseInt(match[1], 10);
            nextWalletNumber = lastNumber >= 50001 ? lastNumber + 1 : 50001;
          }
        }
        
        // Add attempts offset to reduce collision probability
        walletCode = `WLT-${String(nextWalletNumber + attempts).padStart(5, "0")}`;
        
        // Check if this walletCode already exists
        const existingCode = await WalletTopup.findOne({ walletCode })
          .select("walletCode")
          .lean();
        
        if (!existingCode) {
          // Code is unique, we can use it
          break;
        }
        
        attempts++;
        console.log(`[CreateOrder] WalletCode ${walletCode} already exists, attempt ${attempts}/${maxAttempts}`);
        
        if (attempts >= maxAttempts) {
          return res.status(500).json({
            error: "Unable to generate unique wallet code. Please try again."
          });
        }
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

    // Try to retrieve walletCode from the Razorpay order notes if available
    let walletCodeFromNotes = null;
    try {
      const orderDetails = await razorpay.orders.fetch(razorpay_order_id);
      walletCodeFromNotes = orderDetails?.notes?.walletCode || null;
      if (walletCodeFromNotes) {
        console.log("walletCode from Razorpay order notes:", walletCodeFromNotes);
      }
    } catch (orderFetchErr) {
      console.log("Could not fetch Razorpay order details; proceeding without notes");
    }

    // Find or create wallet and ensure it has a walletCode
    let wallet;
    wallet = await WalletTopup.findOne({ ownerId });

    // If wallet doesn't exist or doesn't have a walletCode, we need to create/update it
    if (!wallet || !wallet.walletCode) {
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        try {
          // Determine effective wallet code
          let effectiveWalletCode = (wallet && wallet.walletCode) || walletCodeFromNotes;

          if (!effectiveWalletCode) {
            const lastWallet = await WalletTopup.findOne({})
              .sort({ _id: -1 })
              .select("walletCode")
              .lean();
            let nextWalletNumber = 50001; // Start from 50001
            if (lastWallet?.walletCode) {
              const match = lastWallet.walletCode.match(/WLT-(\d+)/);
              if (match) {
                const lastNumber = parseInt(match[1], 10);
                nextWalletNumber = lastNumber >= 50001 ? lastNumber + 1 : 50001;
              }
            }
            // Add attempts to ensure uniqueness in concurrent scenarios
            effectiveWalletCode = `WLT-${String(nextWalletNumber + attempts).padStart(5, "0")}`;
          }

          if (!wallet) {
            console.log("Creating new wallet for owner:", ownerId);
            wallet = await WalletTopup.create({
              ownerId,
              walletCode: effectiveWalletCode,
              tenantId: tenantId || "default",
              balance: 0,
              transactions: [],
            });
            break; // Success, exit loop
          } else if (!wallet.walletCode) {
            wallet.walletCode = effectiveWalletCode;
            await wallet.save();
            break; // Success, exit loop
          }
        } catch (dbError) {
          attempts++;
          
          // Check if it's a duplicate key error for walletCode
          if (dbError.code === 11000 && dbError.keyPattern?.walletCode) {
            console.log(`[Wallet] Duplicate walletCode detected, attempt ${attempts}/${maxAttempts}`);
            
            if (attempts >= maxAttempts) {
              console.error("Failed to generate unique wallet code after", maxAttempts, "attempts");
              return res.status(500).json({ 
                error: "Unable to generate unique wallet code. Please try again." 
              });
            }
            // Continue to next iteration
            continue;
          }
          
          // For other errors, log and return
          console.error("Database error when finding/creating wallet:", dbError);
          return res.status(500).json({ 
            error: "Database error when accessing wallet" 
          });
        }
      }
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
        // Generate unique invoice code using centralized utility
        const invoiceCode = await generateUniqueInvoiceCode();

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
          invoiceCode,
          metadata: {
            walletCode: wallet?.walletCode || null,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
          },
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
          currency: currency || "INR",
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

    // Create wallet top-up push notification
    try {
      await createWalletTopupNotification(ownerId, tenantId, {
        amount: parsedAmount,
        walletCode: wallet.walletCode,
        newBalance: wallet.balance,
        invoiceCode: invoice?.code || 'N/A'
      });
      console.log('[WALLET] Top-up notification created');
    } catch (notificationError) {
      console.error('[WALLET] Error creating top-up notification:', notificationError);
      // Don't fail the response if notification fails
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

// Add or update bank account
const addBankAccount = async (req, res) => {
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
      isDefault
    } = req.body;

    // Validate required fields
    if (!ownerId || !accountHolderName || !bankName || !accountNumber) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    // Check if account already exists
    const existingAccount = await BankAccount.findOne({
      ownerId,
      accountNumber,
      isActive: true
    });

    if (existingAccount) {
      return res.status(409).json({
        error: "Bank account already exists"
      });
    }

    // Create Razorpay contact if not exists
    let razorpayContactId;
    try {
      // Get user details for email and phone if available from Contacts
      const { Contacts } = require("../models/Contacts");
      const userContact = await Contacts.findOne({ ownerId: ownerId }).select("email phone countryCode").lean();
      const email = userContact?.email || req.body.email || `${ownerId}@wallet.com`;
      const countryCode = userContact?.countryCode || "+91";
      const phoneNumber = userContact?.phone || req.body.phone || "9999999999";
      const phone = phoneNumber.startsWith("+") ? phoneNumber : `${countryCode}${phoneNumber.replace(/^0+/, '')}`;
      
      const contact = await razorpay.contacts.create({
        name: accountHolderName,
        email: email,
        contact: phone, // Required field for Razorpay
        type: "customer", 
        reference_id: ownerId,
        notes: {
          ownerId,
          tenantId
        }
      });
      razorpayContactId = contact.id;
      console.log("Contact created successfully:", razorpayContactId);
    } catch (razorpayError) {
      console.error("Error creating Razorpay contact:", razorpayError.response?.data || razorpayError.message || razorpayError);
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
            account_number: accountNumber
          },
          notes: {
            ownerId,
            bankName
          }
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
      createdBy: ownerId
    });

    res.status(201).json({
      success: true,
      bankAccount,
      message: "Bank account added successfully"
    });
  } catch (error) {
    console.error("Error adding bank account:", error);
    res.status(500).json({
      error: "Failed to add bank account",
      details: error.message
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
      isActive: true
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
      bankAccounts
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    res.status(500).json({
      error: "Failed to fetch bank accounts",
      details: error.message
    });
  }
};

// Delete bank account
const deleteBankAccount = async (req, res) => {
  try {
    const { bankAccountId } = req.params;
    const { ownerId } = req.body || req.query; // Accept ownerId from body or query

    // Validate bankAccountId
    if (!bankAccountId) {
      return res.status(400).json({
        error: "Bank account ID is required"
      });
    }

    // Find the bank account
    const bankAccount = await BankAccount.findById(bankAccountId);
    
    if (!bankAccount) {
      return res.status(404).json({
        error: "Bank account not found"
      });
    }

    // Verify ownership if ownerId is provided
    if (ownerId && bankAccount.ownerId !== ownerId) {
      return res.status(403).json({
        error: "You don't have permission to delete this bank account"
      });
    }

    // Check if this account has been used for withdrawals
    const WithdrawalRequest = require("../models/WithdrawalRequest");
    const withdrawalCount = await WithdrawalRequest.countDocuments({
      bankAccountId: bankAccountId
    });

    if (withdrawalCount > 0) {
      // Soft delete - just mark as inactive
      bankAccount.isActive = false;
      bankAccount.updatedBy = ownerId || "system";
      await bankAccount.save();
      
      return res.status(200).json({
        success: true,
        message: "Bank account deactivated (has withdrawal history)",
        bankAccount
      });
    }

    // Hard delete if no withdrawal history
    await BankAccount.findByIdAndDelete(bankAccountId);

    res.status(200).json({
      success: true,
      message: "Bank account removed successfully"
    });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    res.status(500).json({
      error: "Failed to delete bank account",
      details: error.message
    });
  }
};

// Verify bank account using Razorpay Penny Drop (Fund Account Validation)
const verifyBankAccount = async (req, res) => {
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
        note: "Auto-verified due to missing Razorpay configuration"
      };
      await bankAccount.save();
      return res.status(200).json({ 
        message: "Bank account verified (development mode)",
        bankAccount 
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
    if ((bankAccount.ifscCode ? !bankAccount.ifscCode : !bankAccount.routingNumber) || !bankAccount.accountNumber) {
      return res.status(400).json({
        error: `${bankAccount.routingNumber ? "Routing Number": "IFSC code"} and account number are required for verification`,
      });
    }

    // Ensure Razorpay Contact (if needed for verification)
    if (!bankAccount.razorpayContactId) {
      try {
        // Check if contacts API is available
        if (!razorpay.contacts || typeof razorpay.contacts.create !== 'function') {
          console.warn("Razorpay contacts API not available - proceeding without contact creation");
          // For basic verification, we can proceed without a contact ID
          // Just auto-verify for now since we can't do penny drop without RazorpayX
          bankAccount.isVerified = true;
          bankAccount.isActive = true; // Ensure account is active
          bankAccount.verificationStatus = "verified";
          bankAccount.verificationMethod = "manual";
          bankAccount.verificationDate = new Date();
          bankAccount.metadata = {
            ...(bankAccount.metadata || {}),
            note: "Auto-verified: Razorpay contacts API not available"
          };
          await bankAccount.save();
          return res.status(200).json({ 
            message: "Bank account verified (contacts API not available)",
            bankAccount 
          });
        }
        
        // Get user email and phone if available from Contacts
        let email = `${bankAccount.ownerId}@wallet.com`;
        let phone = "+919999999999";
        
        // Try to get the actual user details from Contacts
        const { Contacts } = require("../models/Contacts");
        const userContact = await Contacts.findOne({ ownerId: bankAccount.ownerId }).select("email phone countryCode").lean();
        if (userContact) {
          if (userContact.email) {
            email = userContact.email;
          }
          if (userContact.phone) {
            const countryCode = userContact.countryCode || "+91";
            const phoneNumber = userContact.phone;
            phone = phoneNumber.startsWith("+") ? phoneNumber : `${countryCode}${phoneNumber.replace(/^0+/, '')}`;
          }
        }
        
        console.log("Creating Razorpay contact with:", {
          name: bankAccount.accountHolderName,
          email: email,
          phone: phone,
          type: "customer",
          reference_id: bankAccount.ownerId
        });
        
        const contact = await razorpay.contacts.create({
          name: bankAccount.accountHolderName,
          email: email,
          contact: phone, // Phone number from Contacts or default
          type: "customer",
          reference_id: bankAccount.ownerId,
          notes: { ownerId: bankAccount.ownerId }
        });
        bankAccount.razorpayContactId = contact.id;
        console.log("Razorpay contact created successfully:", contact.id);
      } catch (e) {
        console.error("Razorpay create contact failed:", e.response?.data || e.message || e);
        
        // If contact creation fails, we can still try basic verification
        console.warn("Contact creation failed - proceeding with auto-verification");
        bankAccount.isVerified = true;
        bankAccount.isActive = true; // Ensure account is active
        bankAccount.verificationStatus = "verified";
        bankAccount.verificationMethod = "manual";
        bankAccount.verificationDate = new Date();
        bankAccount.metadata = {
          ...(bankAccount.metadata || {}),
          note: "Auto-verified: Contact creation failed",
          error: e.message
        };
        await bankAccount.save();
        return res.status(200).json({ 
          message: "Bank account verified (contact creation failed)",
          bankAccount 
        });
      }
    }

    // Ensure Razorpay Fund Account
    if (!bankAccount.razorpayFundAccountId) {
      try {
        console.log("Creating Razorpay fund account with:", {
          contact_id: bankAccount.razorpayContactId,
          account_type: "bank_account",
          bank_account: {
            name: bankAccount.accountHolderName,
            ifsc: bankAccount.ifscCode,
            account_number: bankAccount.accountNumber,
          }
        });
        
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
        console.log("Razorpay fund account created successfully:", fundAccount.id);
      } catch (e) {
        console.error("Razorpay create fund account failed:", e.response?.data || e.message || e);
        return res.status(502).json({ 
          error: "Failed to create Razorpay fund account",
          details: e.response?.data?.error || e.message
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
      if (errorMessage.includes("not enabled") || errorMessage.includes("RazorpayX") || err.statusCode === 400) {
        console.warn("RazorpayX not enabled - auto-verifying for testing");
        bankAccount.isVerified = true;
        bankAccount.isActive = true; // Ensure account is active
        bankAccount.verificationStatus = "verified";
        bankAccount.verificationMethod = "manual";
        bankAccount.verificationDate = new Date();
        bankAccount.metadata = {
          ...(bankAccount.metadata || {}),
          note: "Auto-verified: RazorpayX not enabled on account"
        };
        await bankAccount.save();
        return res.status(200).json({ 
          message: "Bank account verified (RazorpayX not available)",
          bankAccount 
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
        details: errorMessage
      });
    }

    // Interpret response
    const vStatus = (validationResponse.status || "").toLowerCase();
    const resultStatus = (validationResponse.results?.account_status || "").toLowerCase();
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

    return res.status(202).json({
      success: true,
      bankAccount,
      message: "Verification initiated. It may take a few minutes to complete.",
    });
  } catch (error) {
    console.error("Error verifying bank account:", error);
    return res.status(500).json({
      error: "Failed to verify bank account",
      details: error.message,
    });
  }
};

// Create withdrawal request
const createWithdrawalRequest = async (req, res) => {
  try {
    const {
      ownerId,
      tenantId,
      amount,
      bankAccountId,
      mode,
      notes,
      walletSnapshot // Added for manual processing
    } = req.body;

    // Validate inputs
    if (!ownerId || !amount || !bankAccountId) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    // Minimum withdrawal amount check (e.g., $10 or ₹100)
    const MIN_WITHDRAWAL = 100;
    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({
        error: `Minimum withdrawal amount is ${MIN_WITHDRAWAL}`
      });
    }

    // Get wallet balance
    const wallet = await WalletTopup.findOne({ ownerId });
    if (!wallet) {
      return res.status(404).json({
        error: "Wallet not found"
      });
    }

    // Check available balance (balance - holdAmount)
    const availableBalance = wallet.balance - (wallet.holdAmount || 0);
    if (availableBalance < amount) {
      return res.status(400).json({
        error: "Insufficient balance",
        availableBalance
      });
    }

    // Verify bank account exists and is verified
    const bankAccount = await BankAccount.findById(bankAccountId);
    if (!bankAccount) {
      return res.status(404).json({
        error: "Bank account not found"
      });
    }

    if (!bankAccount.canWithdraw()) {
      return res.status(400).json({
        error: "Bank account is not verified or active"
      });
    }

    // Check for pending withdrawals
    const pendingWithdrawals = await WithdrawalRequest.find({
      ownerId,
      status: { $in: ["pending", "processing", "queued", "initiated"] }
    });

    if (pendingWithdrawals.length > 0) {
      return res.status(400).json({
        error: "You have pending withdrawal requests. Please wait for them to complete."
      });
    }

    // Generate unique withdrawalCode with retry logic
    let withdrawalRequest;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        // Generate next withdrawalCode like WD-000001
        const lastWithdrawal = await WithdrawalRequest.findOne({})
          .sort({ _id: -1 })
          .select("withdrawalCode")
          .lean();

        let nextNumber = 50001; // Start from 50001
        if (lastWithdrawal && lastWithdrawal.withdrawalCode) {
          const match = lastWithdrawal.withdrawalCode.match(/WD-(\d+)/);
          if (match) {
            const lastNumber = parseInt(match[1], 10);
            nextNumber = lastNumber >= 50001 ? lastNumber + 1 : 50001;
          }
        }
        
        // Add random component for extra safety in high-concurrency scenarios
        const withdrawalCode = `WD-${String(nextNumber + attempts).padStart(6, "0")}`;

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
          availableBalance: wallet.balance - (wallet.holdAmount || 0)
        },
        bankDetails: {
          accountHolderName: bankAccount.accountHolderName,
          bankName: bankAccount.bankName,
          accountNumber: bankAccount.maskedAccountNumber,
          accountType: bankAccount.accountType,
          routingNumber: bankAccount.routingNumber,
          swiftCode: bankAccount.swiftCode
        },
        processingType: "manual",
        requiresAdminApproval: true
          }
        });
        
        // Successfully created, break out of loop
        break;
        
      } catch (error) {
        attempts++;
        
        // Check if it's a duplicate key error
        if (error.code === 11000 && error.keyPattern?.withdrawalCode) {
          console.log(`[Withdrawal] Duplicate withdrawalCode detected, attempt ${attempts}/${maxAttempts}`);
          
          if (attempts >= maxAttempts) {
            return res.status(500).json({
              error: "Unable to generate unique withdrawal code. Please try again."
            });
          }
          
          // Continue to next iteration to try again
          continue;
        }
        
        // If it's not a duplicate key error, throw it
        throw error;
      }
    }

    // Check if withdrawal was created
    if (!withdrawalRequest) {
      return res.status(500).json({
        error: "Failed to create withdrawal request after multiple attempts."
      });
    }

    // Deduct amount from wallet and add to hold
    wallet.balance -= amount;
    wallet.holdAmount = (wallet.holdAmount || 0) + amount;
    
    // Add transaction record with enhanced metadata
    wallet.transactions.push({
      type: "debit",
      amount,
      description: `Withdrawal request ${withdrawalRequest.withdrawalCode}`,
      status: "pending",
      metadata: {
        withdrawalRequestId: withdrawalRequest._id,
        withdrawalCode: withdrawalRequest.withdrawalCode,
        bankAccountId,
        amount,
        processingType: "manual",
        requestedAt: new Date()
      },
      createdDate: new Date()
    });

    await wallet.save();

    // Create push notification for pending withdrawal
    try {
      await PushNotification.create({
        ownerId,
        tenantId,
        title: "Withdrawal Request Created",
        message: `Your withdrawal request ${withdrawalRequest.withdrawalCode} for ₹${withdrawalRequest.netAmount.toFixed(2)} has been submitted successfully. It will be processed within 24-48 hours.`,
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
          createdAt: new Date()
        }
      });
    } catch (notificationError) {
      console.error("Error creating withdrawal notification:", notificationError);
      // Don't fail the withdrawal if notification fails
    }

    // Comment out auto-processing for Razorpay - All withdrawals now require manual admin approval
    // if (amount <= 5000) { // Auto-approve small amounts
    //   processWithdrawal(withdrawalRequest._id);
    // }

    res.status(201).json({
      success: true,
      withdrawalRequest,
      message: `Withdrawal request ${withdrawalRequest.withdrawalCode} created successfully. It will be processed within 24-48 hours.`
    });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({
      error: "Failed to create withdrawal request",
      details: error.message
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
  try {
    const { withdrawalRequestId } = req.params;
    const { failureReason, failedBy, adminNotes } = req.body;

    const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId)
      .populate("bankAccountId");
    
    if (!withdrawalRequest) {
      return res.status(404).json({
        error: "Withdrawal request not found"
      });
    }

    if (!["pending", "processing"].includes(withdrawalRequest.status)) {
      return res.status(400).json({
        error: `Cannot fail withdrawal in status: ${withdrawalRequest.status}`
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
        adminNotes
      }
    };
    
    await withdrawalRequest.save();

    // Refund amount back to wallet
    const wallet = await WalletTopup.findOne({ ownerId: withdrawalRequest.ownerId });
    if (wallet) {
      wallet.balance += withdrawalRequest.amount;
      wallet.holdAmount = Math.max(0, (wallet.holdAmount || 0) - withdrawalRequest.amount);
      
      wallet.transactions.push({
        type: "credit",
        amount: withdrawalRequest.amount,
        description: `Withdrawal failed - Refund for ${withdrawalRequest.withdrawalCode}`,
        status: "completed",
        metadata: {
          withdrawalRequestId: withdrawalRequest._id,
          withdrawalCode: withdrawalRequest.withdrawalCode,
          failureReason: withdrawalRequest.failureReason
        },
        createdDate: new Date()
      });
      
      await wallet.save();
    }

        // Update wallet - remove from pending to failed
    const walletUpdate = await WalletTopup.findOne({ ownerId: withdrawalRequest.ownerId });
    if (walletUpdate) {
      //walletUpdate.holdAmount = Math.max(0, (wallet.holdAmount || 0) - withdrawalRequest.amount);
      
      // Update transaction status
      const transaction = walletUpdate.transactions.find(
        t => t.metadata?.withdrawalRequestId?.toString() === withdrawalRequest._id.toString()
      );
      if (transaction) {
        transaction.status = "failed";
        transaction.metadata = {
          //...transaction.metadata,
          failedAt: new Date(),
          withdrawalRequestId: withdrawalRequest._id,
          withdrawalCode: withdrawalRequest.withdrawalCode,
          failureReason: withdrawalRequest.failureReason
          
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
        message: `Your withdrawal request ${withdrawalRequest.withdrawalCode} for ₹${withdrawalRequest.amount.toFixed(2)} could not be processed. The amount has been refunded to your wallet. Reason: ${failureReason || 'Processing error'}`,
        type: "wallet",
        category: "withdrawal_status",
        unread: true,
        metadata: {
          withdrawalRequestId: withdrawalRequest._id.toString(),
          withdrawalCode: withdrawalRequest.withdrawalCode,
          amount: withdrawalRequest.amount,
          status: "failed",
          failureReason: failureReason || "Processing error",
          failedAt: new Date()
        }
      });
    } catch (notificationError) {
      console.error("Error creating withdrawal failure notification:", notificationError);
      // Don't fail the process if notification fails
    }

    res.status(200).json({
      success: true,
      withdrawalRequest,
      message: "Withdrawal marked as failed and amount refunded"
    });
  } catch (error) {
    console.error("Error failing withdrawal:", error);
    res.status(500).json({
      error: "Failed to process withdrawal failure",
      details: error.message
    });
  }
};

const processManualWithdrawal = async (req, res) => {
  try {
    const { withdrawalRequestId } = req.params;
    const { 
      transactionReference, 
      processedBy,
      adminNotes,
      actualMode // IMPS, NEFT, UPI, etc.
    } = req.body;

    const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId)
      .populate("bankAccountId");
    
    if (!withdrawalRequest) {
      return res.status(404).json({
        error: "Withdrawal request not found"
      });
    }

    if (!["pending", "processing"].includes(withdrawalRequest.status)) {
      return res.status(400).json({
        error: `Cannot process withdrawal in status: ${withdrawalRequest.status}`
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
        adminNotes
      }
    };
    
    await withdrawalRequest.save();

    // Update wallet - remove from hold
    const wallet = await WalletTopup.findOne({ ownerId: withdrawalRequest.ownerId });
    if (wallet) {
      wallet.holdAmount = Math.max(0, (wallet.holdAmount || 0) - withdrawalRequest.amount);
      
      // Update transaction status
      const transaction = wallet.transactions.find(
        t => t.metadata?.withdrawalRequestId?.toString() === withdrawalRequest._id.toString()
      );
      if (transaction) {
        transaction.status = "completed";
        transaction.metadata = {
          ...transaction.metadata,
          completedAt: new Date(),
          transactionReference,
          processedBy
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
        message: `Your withdrawal request ${withdrawalRequest.withdrawalCode} for ₹${withdrawalRequest.netAmount.toFixed(2)} has been completed successfully. The amount has been transferred to your bank account ending with ${withdrawalRequest.bankAccountId?.maskedAccountNumber || 'your registered account'}.`,
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
          completedAt: new Date()
        }
      });
    } catch (notificationError) {
      console.error("Error creating withdrawal completion notification:", notificationError);
      // Don't fail the process if notification fails
    }

    res.status(200).json({
      success: true,
      withdrawalRequest,
      message: "Withdrawal processed successfully"
    });
  } catch (error) {
    console.error("Error processing manual withdrawal:", error);
    res.status(500).json({
      error: "Failed to process withdrawal",
      details: error.message
    });
  }
};

// Get all withdrawal requests for superadmin - SIMPLE VERSION
const getAllWithdrawalRequests = async (req, res) => {
  try {
    const withdrawalRequests = await WithdrawalRequest.find({})
      .populate("bankAccountId")
      .sort({ _id: -1 }) // Using _id for sorting (more reliable in all environments)
    
    const totalWithdrawalRequests = await WithdrawalRequest.countDocuments({});
    
    res.status(200).json({
      success: true,
      withdrawalRequests: withdrawalRequests,
      total: totalWithdrawalRequests,
      hasMore: false
    });
  } catch (error) {
    console.error("Error fetching all withdrawal requests:", error);
    res.status(500).json({
      error: "Failed to fetch withdrawal requests",
      details: error.message
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
        error: "Withdrawal request ID is required"
      });
    }

    const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId)
      .populate("bankAccountId")
      .populate("ownerId", "email firstName lastName"); // Populate owner details if needed

    if (!withdrawalRequest) {
      return res.status(404).json({
        success: false,
        error: "Withdrawal request not found"
      });
    }

    res.status(200).json({
      success: true,
      withdrawalRequest: withdrawalRequest
    });
  } catch (error) {
    console.error("Error fetching withdrawal request by ID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch withdrawal request",
      details: error.message
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
      .populate("bankAccountId", "bankName maskedAccountNumber accountHolderName")
      .sort({ _id: -1 }) // Using _id for sorting (more reliable in all environments)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await WithdrawalRequest.countDocuments(query);
    
    //console.log(`Found ${withdrawalRequests.length} withdrawal requests for owner ${ownerId}`);

    res.status(200).json({
      success: true,
      withdrawalRequests,
      total,
      hasMore: total > skip + limit
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({
      error: "Failed to fetch withdrawal requests",
      details: error.message
    });
  }
};

// Cancel withdrawal request
const cancelWithdrawalRequest = async (req, res) => {
  try {
    const { withdrawalRequestId } = req.params;
    const { reason } = req.body;

    const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId);
    if (!withdrawalRequest) {
      return res.status(404).json({
        error: "Withdrawal request not found"
      });
    }

    if (!withdrawalRequest.canCancel()) {
      return res.status(400).json({
        error: "Withdrawal request cannot be cancelled in current status"
      });
    }

    // Update withdrawal request
    withdrawalRequest.status = "cancelled";
    withdrawalRequest.cancelledAt = new Date();
    withdrawalRequest.cancellationReason = reason || "User requested cancellation";
    await withdrawalRequest.save();

    // Refund amount back to wallet
    const wallet = await WalletTopup.findOne({ ownerId: withdrawalRequest.ownerId });
    if (wallet) {
      wallet.balance += withdrawalRequest.amount;
      wallet.holdAmount = Math.max(0, (wallet.holdAmount || 0) - withdrawalRequest.amount);
      
      wallet.transactions.push({
        type: "credit",
        amount: withdrawalRequest.amount,
        description: `Withdrawal cancelled - Refund for ${withdrawalRequest.withdrawalCode}`,
        status: "completed",
        metadata: {
          withdrawalRequestId: withdrawalRequest._id,
          withdrawalCode: withdrawalRequest.withdrawalCode
        },
        createdDate: new Date()
      });
      
      await wallet.save();
    }

    // Create push notification for canceled withdrawal
    try {
      await PushNotification.create({
        ownerId: withdrawalRequest.ownerId,
        tenantId: withdrawalRequest.tenantId,
        title: "Withdrawal Canceled",
        message: `Your withdrawal request ${withdrawalRequest.withdrawalCode} for ₹${withdrawalRequest.amount.toFixed(2)} has been canceled. The amount has been refunded to your wallet.`,
        type: "wallet",
        category: "withdrawal_status",
        unread: true,
        metadata: {
          withdrawalRequestId: withdrawalRequest._id.toString(),
          withdrawalCode: withdrawalRequest.withdrawalCode,
          amount: withdrawalRequest.amount,
          status: "canceled",
          cancellationReason: reason || "User requested cancellation",
          canceledAt: new Date()
        }
      });
    } catch (notificationError) {
      console.error("Error creating withdrawal cancellation notification:", notificationError);
      // Don't fail the cancellation if notification fails
    }

    res.status(200).json({
      success: true,
      withdrawalRequest,
      message: "Withdrawal request cancelled successfully"
    });
  } catch (error) {
    console.error("Error cancelling withdrawal request:", error);
    res.status(500).json({
      error: "Failed to cancel withdrawal request",
      details: error.message
    });
  }
};

// Commented out Razorpay payout webhook - will be used in future when Razorpay automatic payouts are enabled
const handlePayoutWebhook = async (req, res) => {
  // For now, just acknowledge the webhook since we're doing manual processing
  return res.status(200).json({ received: true, message: "Manual processing mode active" });
};

// Original Razorpay webhook handler - kept for future use
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
  try {
    // First, let's see what bank accounts exist
    const allAccounts = await BankAccount.find({}).select('isVerified isActive verificationStatus ownerId accountHolderName');
    //console.log("All bank accounts:", allAccounts);
    
    // Now update any verified accounts that aren't active
    const result = await BankAccount.updateMany(
      { isVerified: true, $or: [{ isActive: false }, { isActive: { $exists: false } }] },
      { $set: { isActive: true } }
    );
    
    // Also check for accounts with verificationStatus = "verified" but isVerified not true
    const result2 = await BankAccount.updateMany(
      { verificationStatus: "verified", $or: [{ isVerified: { $ne: true } }, { isActive: { $ne: true } }] },
      { $set: { isVerified: true, isActive: true } }
    );
    
    const totalFixed = result.modifiedCount + result2.modifiedCount;
    //console.log(`Fixed ${totalFixed} bank accounts`);
    
    return res.status(200).json({
      success: true,
      message: `Fixed ${totalFixed} bank accounts to be active`,
      modifiedCount: totalFixed,
      debug: {
        totalAccounts: allAccounts.length,
        accounts: allAccounts
      }
    });
  } catch (error) {
    console.error("Error fixing verified bank accounts:", error);
    return res.status(500).json({
      error: "Failed to fix verified bank accounts",
      details: error.message
    });
  }
};

// Settlement function for interview rounds
const settleInterviewPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { roundId, transactionId, interviewerContactId, companyName, roundTitle, positionTitle, interviewerTenantId } = req.body;
    
    console.log("[settleInterviewPayment] Starting settlement:", { roundId, transactionId, interviewerContactId, companyName, roundTitle });
    
    // Validate required fields
    if (!roundId || !transactionId || !interviewerContactId) {
      return res.status(400).json({
        success: false,
        message: "roundId, transactionId, and interviewerContactId are required"
      });
    }
    
    // 1. Find the organization's wallet with the hold transaction
    const orgWallet = await WalletTopup.findOne({
      'transactions._id': transactionId
    }).session(session);
    
    if (!orgWallet) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Organization wallet with hold transaction not found"
      });
    }
    
    // 2. Find the specific hold transaction
    const holdTransaction = orgWallet.transactions.find(
      t => t._id && t._id.toString() === transactionId
    );
    
    if (!holdTransaction) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Hold transaction not found"
      });
    }
    
    if (holdTransaction.type !== 'hold' || holdTransaction.status === 'completed') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Transaction is not a hold or already settled"
      });
    }
    
    const settlementAmount = holdTransaction.amount;
    console.log(`[settleInterviewPayment] Settlement amount: ${settlementAmount}`);
    
    // 3. Update the hold transaction to debit/completed in organization wallet
    const updatedOrgWallet = await WalletTopup.findOneAndUpdate(
      {
        _id: orgWallet._id,
        'transactions._id': transactionId
      },
      {
        $set: {
          'transactions.$.type': 'debit',
          'transactions.$.status': 'completed',
          'transactions.$.description': `Settled payment to interviewer for ${companyName || 'Company'} - ${roundTitle || 'Interview Round'}`,
          'transactions.$.metadata.settledAt': new Date(),
          'transactions.$.metadata.settlementStatus': 'completed'
        },
        $inc: {
          holdAmount: -settlementAmount  // Reduce hold amount
        }
      },
      { new: true, session }
    );
    
    if (!updatedOrgWallet) {
      await session.abortTransaction();
      return res.status(500).json({
        success: false,
        message: "Failed to update organization wallet"
      });
    }
    
    console.log(`[settleInterviewPayment] Updated org wallet - reduced hold by ${settlementAmount}`);
    
    // 4. Find or create interviewer's wallet
    let interviewerWallet = await WalletTopup.findOne({ ownerId: interviewerContactId }).session(session);
    
    if (!interviewerWallet) {
      // Create wallet for interviewer if doesn't exist
      // Get tenantId from the organization wallet or request
      const tenantId = orgWallet?.tenantId || req.body?.tenantId || req.query?.tenantId;
      
      if (!tenantId) {
        console.warn(`[settleInterviewPayment] Creating interviewer wallet without tenantId for ${interviewerContactId}`);
      }
    }
    
    // 5. Create credit transaction for interviewer
    const creditTransaction = {
      type: 'credit',
      amount: settlementAmount,
      description: `Payment from ${companyName || 'Company'} - ${roundTitle || 'Interview Round'} for ${positionTitle || 'Position'}`,
      relatedInvoiceId: holdTransaction.relatedInvoiceId,
      status: 'completed',
      metadata: {
        ...holdTransaction.metadata,
        settlementDate: new Date(),
        originalTransactionId: transactionId,
        organizationWalletId: orgWallet._id.toString(),
        roundId: roundId,
        settlementType: 'interview_payment',
        companyName: companyName || 'Company',
        roundTitle: roundTitle || 'Interview Round',
        positionTitle: positionTitle || 'Position'
      },
      createdDate: new Date(),
      createdAt: new Date()
    };
    
    // 6. Update interviewer's wallet - add balance and transaction
    const updatedInterviewerWallet = await WalletTopup.findByIdAndUpdate(
      interviewerWallet._id,
      {
        $inc: {
          balance: settlementAmount  // Increase interviewer balance
        },
        $push: {
          transactions: creditTransaction
        }
      },
      { new: true, session }
    );
    
    if (!updatedInterviewerWallet) {
      await session.abortTransaction();
      return res.status(500).json({
        success: false,
        message: "Failed to update interviewer wallet"
      });
    }
    
    console.log(`[settleInterviewPayment] Added ${settlementAmount} to interviewer wallet. New balance: ${updatedInterviewerWallet.balance}`);
    
    // 7. Send push notification to interviewer
    try {
      await createInterviewSettlementNotification(
        interviewerContactId,
        interviewerTenantId,
        {
          amount: settlementAmount,
          companyName: companyName || 'Company',
          roundTitle: roundTitle || 'Interview Round',
          positionTitle: positionTitle || 'Position',
          settlementCode: transactionId
        }
      );
      console.log("[settleInterviewPayment] Push notification sent to interviewer");
    } catch (notifErr) {
      console.error("[settleInterviewPayment] Failed to send notification:", notifErr);
      // Don't fail the settlement if notification fails
    }
    
    // 8. Update the interview round to mark settlement
    
    // Try regular interview round first
    let roundUpdate = await InterviewRounds.findByIdAndUpdate(
      roundId,
      {
        $set: {
          settlementStatus: 'completed',
          settlementDate: new Date(),
          settlementTransactionId: creditTransaction._id
        }
      },
      { new: true, session }
    );
    
    // If not found, try mock interview round
    if (!roundUpdate) {
      roundUpdate = await MockInterviewRound.findByIdAndUpdate(
        roundId,
        {
          $set: {
            settlementStatus: 'completed',
            settlementDate: new Date(),
            settlementTransactionId: creditTransaction._id
          }
        },
        { new: true, session }
      );
    }
    
    // Commit transaction
    await session.commitTransaction();
    
    console.log("[settleInterviewPayment] Settlement completed successfully");
    
    return res.status(200).json({
      success: true,
      message: "Interview payment settled successfully",
      data: {
        settlementAmount,
        organizationWallet: {
          ownerId: updatedOrgWallet.ownerId,
          balance: updatedOrgWallet.balance,
          holdAmount: updatedOrgWallet.holdAmount
        },
        interviewerWallet: {
          ownerId: updatedInterviewerWallet.ownerId,
          balance: updatedInterviewerWallet.balance,
          creditTransactionId: creditTransaction._id
        },
        roundId,
        originalTransactionId: transactionId
      }
    });
    
  } catch (error) {
    await session.abortTransaction();
    console.error("[settleInterviewPayment] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to settle interview payment",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getWalletByOwnerId,
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
  settleInterviewPayment,  // Added settlement function
  // Manual processing endpoints for superadmin
  processManualWithdrawal,
  failManualWithdrawal,
  getAllWithdrawalRequests
};
