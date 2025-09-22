const mongoose = require("mongoose");
const WalletTopup = require("../models/WalletTopup");
const Razorpay = require("razorpay");
const Payment = require("../models/Payments");
const Invoice = require("../models/Invoicemodels");
const Receipt = require("../models/Receiptmodels");
const BankAccount = require("../models/BankAccount");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const crypto = require("crypto");
const https = require("https");

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

    // Determine walletCode: reuse existing wallet's code if present, otherwise generate a new one
    let walletCode;
    const existingWallet = await WalletTopup.findOne({ ownerId })
      .select("walletCode")
      .lean();
    if (existingWallet?.walletCode) {
      walletCode = existingWallet.walletCode;
    } else {
      const lastWallet = await WalletTopup.findOne({})
        .sort({ _id: -1 })
        .select("walletCode")
        .lean();
      let nextWalletNumber = 1;
      if (lastWallet?.walletCode) {
        const match = lastWallet.walletCode.match(/WLT-(\d+)/);
        if (match) {
          nextWalletNumber = parseInt(match[1], 10) + 1;
        }
      }
      walletCode = `WLT-${String(nextWalletNumber).padStart(5, "0")}`;
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
    try {
      wallet = await WalletTopup.findOne({ ownerId });

      // Determine effective wallet code
      let effectiveWalletCode = (wallet && wallet.walletCode) || walletCodeFromNotes;

      if (!effectiveWalletCode) {
        const lastWallet = await WalletTopup.findOne({})
          .sort({ _id: -1 })
          .select("walletCode")
          .lean();
        let nextWalletNumber = 1;
        if (lastWallet?.walletCode) {
          const match = lastWallet.walletCode.match(/WLT-(\d+)/);
          if (match) {
            nextWalletNumber = parseInt(match[1], 10) + 1;
          }
        }
        effectiveWalletCode = `WLT-${String(nextWalletNumber).padStart(5, "0")}`;
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
      } else if (!wallet.walletCode) {
        wallet.walletCode = effectiveWalletCode;
        await wallet.save();
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
        // Generate a unique invoice code like INVC-00001
        const lastInvoice = await Invoice.findOne({})
          .sort({ _id: -1 })
          .select("invoiceCode")
          .lean();
        let nextInvNumber = 1;
        if (lastInvoice?.invoiceCode) {
          const match = lastInvoice.invoiceCode.match(/INVC-(\d+)/);
          if (match) {
            nextInvNumber = parseInt(match[1], 10) + 1;
          }
        }
        const invoiceCode = `INVC-${String(nextInvNumber).padStart(5, "0")}`;

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
      const contact = await razorpay.contacts.create({
        name: accountHolderName,
        email: req.body.email || `${ownerId}@wallet.com`,
        type: "customer",
        reference_id: ownerId,
        notes: {
          ownerId,
          tenantId
        }
      });
      razorpayContactId = contact.id;
    } catch (razorpayError) {
      console.error("Error creating Razorpay contact:", razorpayError);
      // Continue without Razorpay contact for now
    }

    // Create Razorpay fund account for bank account
    let razorpayFundAccountId;
    if (razorpayContactId) {
      try {
        const fundAccount = await razorpay.fundAccounts.create({
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

    const bankAccounts = await BankAccount.find({
      ownerId,
      isActive: true
    }).sort({ isDefault: -1, createdAt: -1 });

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
    
    if (!keyId || !keySecret || !accountNumber) {
      return res.status(500).json({
        error: "Missing Razorpay configuration. Please set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_ACCOUNT_NUMBER",
      });
    }

    // Basic validation for IFSC/Account number (Indian banks). Adjust as needed per region
    if (!bankAccount.ifscCode || !bankAccount.accountNumber) {
      return res.status(400).json({
        error: "IFSC code and account number are required for verification",
      });
    }

    // Ensure Razorpay Contact
    if (!bankAccount.razorpayContactId) {
      try {
        const contact = await razorpay.contacts.create({
          name: bankAccount.accountHolderName,
          type: "customer",
          reference_id: bankAccount.ownerId,
          notes: { ownerId: bankAccount.ownerId }
        });
        bankAccount.razorpayContactId = contact.id;
      } catch (e) {
        console.error("Razorpay create contact failed:", e);
        return res.status(502).json({ error: "Failed to create Razorpay contact" });
      }
    }

    // Ensure Razorpay Fund Account
    if (!bankAccount.razorpayFundAccountId) {
      try {
        const fundAccount = await razorpay.fundAccounts.create({
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
      } catch (e) {
        console.error("Razorpay create fund account failed:", e);
        return res.status(502).json({ error: "Failed to create Razorpay fund account" });
      }
    }

    // Initiate Fund Account Validation (Penny Drop)
    const payload = {
      account_number: accountNumber,
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
      bankAccount.isVerified = false;
      bankAccount.verificationStatus = "failed";
      bankAccount.verificationMethod = "penny_drop";
      bankAccount.metadata = {
        ...(bankAccount.metadata || {}),
        validationError: err.body || err.message || err,
      };
      await bankAccount.save();
      return res.status(502).json({ error: "Bank account validation failed" });
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
      notes
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

    // Calculate fees (example: 2% or flat ₹10)
    const processingFee = Math.max(amount * 0.02, 10);
    const tax = processingFee * 0.18; // 18% GST
    const netAmount = amount - processingFee - tax;

    // Create withdrawal request
    const withdrawalRequest = await WithdrawalRequest.create({
      tenantId,
      ownerId,
      amount,
      currency: "INR",
      bankAccountId,
      status: "pending",
      mode: mode || "IMPS",
      processingFee,
      tax,
      netAmount,
      razorpayFundAccountId: bankAccount.razorpayFundAccountId,
      razorpayContactId: bankAccount.razorpayContactId,
      requestIp: req.ip,
      userAgent: req.get("user-agent"),
      notes,
      createdBy: ownerId
    });

    // Deduct amount from wallet and add to hold
    wallet.balance -= amount;
    wallet.holdAmount = (wallet.holdAmount || 0) + amount;
    
    // Add transaction record
    wallet.transactions.push({
      type: "debit",
      amount,
      description: `Withdrawal request ${withdrawalRequest.withdrawalCode}`,
      status: "pending",
      metadata: {
        withdrawalRequestId: withdrawalRequest._id,
        withdrawalCode: withdrawalRequest.withdrawalCode,
        bankAccountId,
        netAmount
      },
      createdDate: new Date()
    });

    await wallet.save();

    // Process withdrawal immediately if auto-approval is enabled
    // In production, this might go through an approval process
    if (amount <= 5000) { // Auto-approve small amounts
      processWithdrawal(withdrawalRequest._id);
    }

    res.status(201).json({
      success: true,
      withdrawalRequest,
      message: "Withdrawal request created successfully"
    });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({
      error: "Failed to create withdrawal request",
      details: error.message
    });
  }
};

// Process withdrawal (internal function)
const processWithdrawal = async (withdrawalRequestId) => {
  try {
    const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId)
      .populate("bankAccountId");
    
    if (!withdrawalRequest) {
      throw new Error("Withdrawal request not found");
    }

    // Update status to processing
    withdrawalRequest.status = "processing";
    withdrawalRequest.processedAt = new Date();
    await withdrawalRequest.save();

    // Create Razorpay payout
    try {
      const payout = await razorpay.payouts.create({
        account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // Your Razorpay account number
        fund_account_id: withdrawalRequest.razorpayFundAccountId,
        amount: Math.round(withdrawalRequest.netAmount * 100), // Convert to paise
        currency: "INR",
        mode: withdrawalRequest.mode,
        purpose: "payout",
        queue_if_low_balance: true,
        reference_id: withdrawalRequest.withdrawalCode,
        narration: `Withdrawal ${withdrawalRequest.withdrawalCode}`,
        notes: {
          withdrawalRequestId: withdrawalRequest._id.toString(),
          ownerId: withdrawalRequest.ownerId
        }
      });

      // Update withdrawal request with Razorpay payout details
      withdrawalRequest.razorpayPayoutId = payout.id;
      withdrawalRequest.status = "initiated";
      withdrawalRequest.razorpayUtr = payout.utr;
      await withdrawalRequest.save();

      console.log("Payout initiated successfully:", payout.id);
    } catch (razorpayError) {
      console.error("Razorpay payout error:", razorpayError);
      
      // Update withdrawal request as failed
      withdrawalRequest.status = "failed";
      withdrawalRequest.failedAt = new Date();
      withdrawalRequest.failureReason = razorpayError.error?.description || razorpayError.message;
      await withdrawalRequest.save();

      // Refund the amount back to wallet
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
    }
  } catch (error) {
    console.error("Error processing withdrawal:", error);
  }
};

// Get withdrawal requests
const getWithdrawalRequests = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { status, limit = 50, skip = 0 } = req.query;

    const query = { ownerId };
    if (status) {
      query.status = status;
    }

    const withdrawalRequests = await WithdrawalRequest.find(query)
      .populate("bankAccountId", "bankName maskedAccountNumber accountHolderName")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await WithdrawalRequest.countDocuments(query);

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

// Handle Razorpay payout webhook
const handlePayoutWebhook = async (req, res) => {
  try {
    const webhookBody = req.body;
    const webhookSignature = req.get("X-Razorpay-Signature");

    // Verify webhook signature for PAYOUT events (RazorpayX)
    const payoutWebhookSecret = process.env.RAZORPAY_PAYOUT_WEBHOOK_SECRET;
    if (payoutWebhookSecret && process.env.NODE_ENV === 'production') {
      const expectedSignature = crypto
        .createHmac('sha256', payoutWebhookSecret)
        .update(JSON.stringify(webhookBody))
        .digest('hex');
      
      if (expectedSignature !== webhookSignature) {
        console.error('Invalid payout webhook signature');
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    const { event, payload } = webhookBody;
    const payout = payload.payout?.entity;

    if (!payout) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const withdrawalRequest = await WithdrawalRequest.findOne({
      razorpayPayoutId: payout.id
    });

    if (!withdrawalRequest) {
      console.log("Withdrawal request not found for payout:", payout.id);
      return res.status(200).json({ received: true });
    }

    switch (event) {
      case "payout.processed":
        withdrawalRequest.status = "completed";
        withdrawalRequest.completedAt = new Date();
        withdrawalRequest.actualCompletionDate = new Date();
        withdrawalRequest.razorpayUtr = payout.utr;
        
        // Update wallet transaction status
        const wallet = await WalletTopup.findOne({ ownerId: withdrawalRequest.ownerId });
        if (wallet) {
          wallet.holdAmount = Math.max(0, (wallet.holdAmount || 0) - withdrawalRequest.amount);
          
          const transaction = wallet.transactions.find(
            t => t.metadata?.withdrawalRequestId?.toString() === withdrawalRequest._id.toString()
          );
          if (transaction) {
            transaction.status = "completed";
          }
          await wallet.save();
        }
        break;

      case "payout.failed":
        withdrawalRequest.status = "failed";
        withdrawalRequest.failedAt = new Date();
        withdrawalRequest.failureReason = payout.failure_reason || "Unknown error";
        
        // Refund amount back to wallet
        const walletRefund = await WalletTopup.findOne({ ownerId: withdrawalRequest.ownerId });
        if (walletRefund) {
          walletRefund.balance += withdrawalRequest.amount;
          walletRefund.holdAmount = Math.max(0, (walletRefund.holdAmount || 0) - withdrawalRequest.amount);
          
          walletRefund.transactions.push({
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
          
          await walletRefund.save();
        }
        break;

      case "payout.reversed":
        withdrawalRequest.status = "reversed";
        withdrawalRequest.failureReason = payout.status_details?.description || "Payout reversed";
        
        // Handle reversal similar to failure
        const walletReverse = await WalletTopup.findOne({ ownerId: withdrawalRequest.ownerId });
        if (walletReverse) {
          walletReverse.balance += withdrawalRequest.amount;
          walletReverse.holdAmount = Math.max(0, (walletReverse.holdAmount || 0) - withdrawalRequest.amount);
          
          walletReverse.transactions.push({
            type: "credit",
            amount: withdrawalRequest.amount,
            description: `Withdrawal reversed - Refund for ${withdrawalRequest.withdrawalCode}`,
            status: "completed",
            metadata: {
              withdrawalRequestId: withdrawalRequest._id,
              withdrawalCode: withdrawalRequest.withdrawalCode
            },
            createdDate: new Date()
          });
          
          await walletReverse.save();
        }
        break;

      default:
        console.log("Unhandled payout webhook event:", event);
    }

    await withdrawalRequest.save();

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error handling payout webhook:", error);
    res.status(500).json({
      error: "Failed to process webhook",
      details: error.message
    });
  }
};

module.exports = {
  getWalletByOwnerId,
  createTopupOrder,
  walletVerifyPayment,
  addBankAccount,
  getBankAccounts,
  verifyBankAccount,
  createWithdrawalRequest,
  getWithdrawalRequests,
  cancelWithdrawalRequest,
  handlePayoutWebhook
};
