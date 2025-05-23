const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payments');

// Helper function to generate unique transaction IDs
const generateTransactionId = () => {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Import models with appropriate error handling
let User, Invoice, CustomerSubscription, PaymentCard, Receipt;

try {
    User = require('../models/User');
} catch (err) {
    console.log('User model not found, using fallback');
    // Create mock User model if not found
    User = {
        findByIdAndUpdate: async () => { return null; }
    };
}

try {
    Invoice = require('../models/Invoice');
} catch (err) {
    console.log('Invoice model not found, using fallback');
    // Create mock Invoice model if not found
    Invoice = {
        findByIdAndUpdate: async () => { return null; }
    };
}

try {
    CustomerSubscription = require('../models/CustomerSubscriptionmodels');
} catch (err) {
    console.log('CustomerSubscription model not found, using fallback');
    CustomerSubscription = {};
}

try {
    PaymentCard = require('../models/Carddetails');
} catch (err) {
    console.log('PaymentCard model not found, using fallback');
    PaymentCard = {};
}

try {
    Receipt = require('../models/Receipt');
} catch (err) {
    console.log('Receipt model not found, using fallback');
    Receipt = {};
}

// Import helper functions
let createReceipt, createInvoice, calculateEndDate;
try {
    const helpers = require('./CustomerSubscriptionInvoiceContollers');
    createReceipt = helpers.createReceipt;
    createInvoice = helpers.createInvoice;
    calculateEndDate = helpers.calculateEndDate;
} catch (err) {
    console.log('Helper functions not found, using fallbacks');
    createReceipt = async () => ({ _id: `mock_receipt_${Date.now()}` });
    createInvoice = async () => ({ _id: `mock_invoice_${Date.now()}` });
    calculateEndDate = (startDate, cycle) => {
        // For testing: Set end date to 24 hours from start date
        // This is only for testing the automatic billing flow
        const date = new Date(startDate);
        date.setHours(date.getHours() + 24); // Add 24 hours for testing
        console.log(`TEST MODE: Setting next billing date to 24 hours from now: ${date.toISOString()}`);
        return date;
        
        // Production code (commented out during testing)
        // const date = new Date(startDate);
        // date.setMonth(date.getMonth() + (cycle === 'monthly' ? 1 : 12));
        // return date;
    };
}

// Default test keys for development - replace with your actual keys in production
const RAZORPAY_TEST_KEY_ID = 'rzp_test_YourTestKeyHere'; // Replace with your actual test key
const RAZORPAY_TEST_SECRET = 'YourTestSecretHere'; // Replace with your actual test secret

// Razorpay instance creation - initialize with your API keys
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID ,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log('Razorpay initialized with key_id:', razorpay.key_id);

// Helper function to create Razorpay order
const createRazorpayOrder = async (amount, currency, notes) => {
  try {
    // Generate a receipt ID
    const receiptId = `receipt_${Date.now()}`;
    
    // Ensure amount is a valid number and convert to paisa/cents
    const amountInPaisa = Math.round(parseFloat(amount) * 100);
    
    if (!amountInPaisa || isNaN(amountInPaisa) || amountInPaisa <= 0) {
      console.error('Invalid amount:', amount, 'converted to:', amountInPaisa);
      return {
        success: false,
        error: 'Invalid amount. Amount must be a positive number.'
      };
    }
    
    console.log('Creating Razorpay order with amount (in paisa/cents):', amountInPaisa);
    
    // Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: amountInPaisa,
      currency: currency || 'USD',
      receipt: receiptId,
      notes: notes || {}
    });
    
    console.log('Razorpay order created:', order);
    
    return {
      success: true,
      order: order
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create Order for Razorpay payment
const createOrder = async (req, res) => {
  try {
    const { amount, totalAmount, cardDetails, planDetails, metadata } = req.body;
    
    console.log('Received order creation request:', JSON.stringify(req.body, null, 2));
    
    // Extract and validate amount - check both amount and totalAmount fields
    const orderAmount = amount || totalAmount || 0;
    console.log('Extracted amount for order creation:', orderAmount);
    
    if (!orderAmount || orderAmount <= 0) {
      console.error('Invalid or missing amount in order creation request');
      return res.status(400).json({
        message: 'Invalid or missing amount',
        error: 'Amount must be a positive number'
      });
    }
    
    // Extract and validate planId
    const planId = metadata?.planId || planDetails?.planId || planDetails?._id || '';
    console.log('Extracted planId for order creation:', planId);
    
    if (!planId) {
      console.warn('No planId found in order creation request');
    }
    
    // Prepare comprehensive notes for the Razorpay order
    // These notes will be included in webhook events
    const notes = {
      tenantId: metadata?.tenantId || cardDetails?.tenantId || '',
      ownerId: metadata?.ownerId || cardDetails?.ownerId || '',
      planId: planId, // Use the extracted planId
      planName: metadata?.planName || planDetails?.name || 'Subscription Plan',
      //subscriptionId: metadata?.subscriptionId || planDetails?.subscriptionId || '',
      billingCycle: metadata?.billingCycle || cardDetails?.membershipType || 'monthly',
      autoRenew: metadata?.autoRenew || cardDetails?.autoRenew ? 'true' : 'false',
    };
    
    console.log('Creating Razorpay order with notes:', JSON.stringify(notes, null, 2));
    
    // Create order in Razorpay using the helper function
    const orderResponse = await createRazorpayOrder(
      orderAmount,
      'USD', // Using USD (dollars) instead of INR
      notes
    );
    
    if (!orderResponse.success) {
      return res.status(500).json({
        message: 'Failed to create Razorpay order',
        error: orderResponse.error
      });
    }
    
    // Return order ID and key to frontend
    return res.status(200).json({
      message: 'Razorpay order created successfully',
      order: orderResponse.order,
      orderId: orderResponse.order.id, // Explicitly include order ID
      amount: orderResponse.order.amount, // Include the amount
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || razorpay.key_id // Ensure key is sent
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      message: 'Error creating Razorpay order',
      error: error.message
    });
  }
};

// Verify Razorpay payment signature
const verifyPayment = async (req, res) => {
    try {
      console.log('Received payment verification request:', JSON.stringify(req.body, null, 2));
      
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        cardDetails,
        planDetails,
        metadata 
      } = req.body;
      
      // Extract important information from request payload
          const ownerId = metadata?.ownerId || planDetails?.user?.ownerId || cardDetails?.ownerId;
          const tenantId = metadata?.tenantId || planDetails?.user?.tenantId || cardDetails?.tenantId;
          const planId = metadata?.planId || planDetails?.planId || planDetails?.subscriptionPlanId;
          const invoiceId = metadata?.invoiceId || planDetails?.invoiceId;
          
          console.log('Extracted payment details:', { ownerId, tenantId, planId, invoiceId });
      
      if (!planId) {
        console.warn('No planId found in payment verification request');
      }
      
      // Verify signature for subscription payment
      const generated_signature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

      if (generated_signature !== razorpay_signature) {
          console.error('Signature verification failed', {
              generated: generated_signature,
              received: razorpay_signature
          });
          
          await Payment.findOneAndUpdate(
              { razorpayOrderId: razorpay_order_id },
              { 
                  status: 'failed',
                  notes: 'Signature verification failed',
                  error: 'Invalid payment signature',
                  signatureMatch: false
              },
              { new: true, upsert: true }
          );
          
          return res.status(400).json({
              status: 'error',
              message: 'Invalid payment signature',
              code: 'SIGNATURE_VERIFICATION_FAILED'
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
                  issuer: null
              };
              
              if (razorpayPayment.card) {
                  cardInfo = {
                      last4: razorpayPayment.card.last4 || null,
                      network: razorpayPayment.card.network || null,
                      type: razorpayPayment.card.type || null,
                      issuer: razorpayPayment.card.issuer || null
                  };
              }
              
              console.log('Fetched payment details from Razorpay:', {
                  id: razorpayPayment.id,
                  status: razorpayPayment.status,
                  hasToken: !!razorpayPayment.token_id,
                  method: razorpayPayment.method,
                  card: cardInfo
              });
              
              // Check if this payment created a token (critical for recurring payments)
              if (razorpayPayment.token_id) {
                  tokenId = razorpayPayment.token_id;
                  console.log('🔑 Found token ID in payment:', tokenId);
                  
                  // If customer_id is available, store it too
                  if (razorpayPayment.customer_id) {
                      customerId = razorpayPayment.customer_id;
                      console.log('👤 Found customer ID in payment:', customerId);
                  }
              } else {
                  console.log('⚠️ No token found in payment - recurring payments will not work');
              }
          } catch (razorpayError) {
              console.error('Error fetching payment from Razorpay:', razorpayError);
              // Continue with local verification if Razorpay API fails
              razorpayPayment = { amount: null };
          }
          
          // Check if payment exists
          let payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
          
          if (payment) {
              console.log('Found existing payment record, updating with verified payment details');
              // Update existing payment record
              payment.razorpayPaymentId = razorpay_payment_id;
              payment.razorpaySignature = razorpay_signature;
              payment.status = 'captured';
              payment.amount = razorpayPayment.amount ? razorpayPayment.amount / 100 : payment.amount; // Convert from cents if available
              payment.planId = planId;
              payment.paidAt = new Date();
              await payment.save();
          } else {
              console.log('Creating new payment record for verified payment');
              // Create new payment record
              payment = new Payment({
                  tenantId: tenantId,
                  ownerId: ownerId,
                  planId: planId,
                  amount: razorpayPayment.amount ? razorpayPayment.amount / 100 : null,
                  currency: 'USD',
                  status: 'captured',
                  paymentMethod: 'card',
                  paymentGateway: 'razorpay',
                  razorpayPaymentId: razorpay_payment_id,
                  razorpayOrderId: razorpay_order_id,
                  razorpaySignature: razorpay_signature,
                  transactionId: generateTransactionId(),
                  paidAt: new Date(),
                  billingCycle: metadata?.billingCycle || cardDetails?.membershipType || 'monthly',
                  metadata: {
                      planName: metadata?.planName || planDetails?.name || 'Subscription',
                      autoRenew: metadata?.autoRenew || cardDetails?.autoRenew || false
                  }
              });
              await payment.save();
          }
      
          // Process card details and token for recurring payments
          try {
              const PaymentCard = require('../models/Carddetails.js');
              
              // Check if we have valid card details to save
              const hasCardDetails = cardDetails && (cardDetails.cardNumber || cardDetails.cardHolderName);
              
              // We've already retrieved tokenId and customerId from Razorpay API above
              // Important: Even without card details, we need to store the token for recurring payments
              const hasToken = !!tokenId;
              
              if (hasCardDetails || hasToken) {
                  // Extract essential card details from Razorpay API response
                  let cardNumber = '';
                  let cardBrand = '';
                  let cardType = '';
                  
                  // Get card details from Razorpay if available
                  if (cardInfo && cardInfo.last4) {
                      cardNumber = cardInfo.last4;
                      console.log('Using card number from Razorpay:', cardNumber);
                  }
                  
                  if (cardInfo && cardInfo.network) {
                      cardBrand = cardInfo.network;
                      console.log('Using card brand from Razorpay:', cardBrand);
                  }
                  
                  if (cardInfo && cardInfo.type) {
                      cardType = cardInfo.type;
                      console.log('Using card type from Razorpay:', cardType);
                  }
                  
                  console.log('Card details for storage:', {
                      hasCardDetails: !!hasCardDetails,
                      cardNumberFromRazorpay: !!cardInfo?.last4,
                      cardBrand,
                      cardType,
                      hasToken: hasToken
                  });
                  
                  // Find existing card by owner ID
                  const existingCard = await PaymentCard.findOne({ ownerId: ownerId });
                                              
                  if (existingCard) {
                      console.log('Found existing payment card record for owner:', ownerId);
                      // Update existing card with Razorpay details
                      if (existingCard.cards && existingCard.cards.length > 0) {
                          console.log('Existing card details:', JSON.stringify(existingCard.cards.map(c => ({ cardNumber: c.cardNumber }))));
                          
                          // Find the card that matches the one used for payment
                          // Extract last 4 digits for comparison (if we have a card number)
                          const last4Digits = cardNumber ? cardNumber.replace(/\s+|-/g, '').slice(-4) : '';
                          if (last4Digits) console.log('Looking for card with last 4 digits:', last4Digits);
                          
                          // Find the card by last 4 digits if available
                          const cardIndex = last4Digits ? existingCard.cards.findIndex(card => 
                              card.cardNumber && card.cardNumber.includes(last4Digits)
                          ) : -1;
                          
                          if (cardIndex !== -1) {
                              console.log('Updating existing card at index:', cardIndex);
                              // We found a matching card, update it
                              if (hasToken) {
                                  existingCard.cards[cardIndex].razorpayTokenId = tokenId; // Use our retrieved token ID
                                  if (customerId) {
                                      existingCard.cards[cardIndex].razorpayCustomerId = customerId;
                                  }
                                  console.log('Updated existing card with token ID:', tokenId);
                              }
                              existingCard.cards[cardIndex].razorpayPaymentId = razorpay_payment_id;
                              existingCard.cards[cardIndex].status = 'active';
                              existingCard.cards[cardIndex].lastUsed = new Date();
                          } else if (hasCardDetails) {
                              console.log('Adding new card to existing payment record');
                              // Add new card to existing payment record
                              existingCard.cards.push({
                                  cardNumber: cardNumber || 'Unknown',
                                  cardBrand: cardBrand || 'Unknown',
                                  cardType: cardType || 'unknown',
                                  razorpayTokenId: tokenId,
                                  razorpayCustomerId: customerId,
                                  razorpayPaymentId: razorpay_payment_id,
                                  status: 'active',
                                  lastUsed: new Date()
                              });
                              
                              try {
                                  await existingCard.save();
                                  console.log('Successfully saved new card details');
                              } catch (saveError) {
                                  console.error('Error saving new card details:', saveError);
                              }
                          }
                      } else {
                          // No existing cards, add first card
                          existingCard.cards = [{
                              cardNumber: cardNumber || 'Unknown',
                              cardBrand: cardBrand || 'Unknown',
                              cardType: cardType || 'unknown',
                              razorpayTokenId: tokenId,
                              razorpayCustomerId: customerId,
                              razorpayPaymentId: razorpay_payment_id,
                              status: 'active',
                              lastUsed: new Date(),
                              isDefault: true
                          }];
                          
                          try {
                              await existingCard.save();
                              console.log('Successfully saved first card');
                          } catch (saveError) {
                              console.error('Error saving first card:', saveError);
                          }
                      }
                  } else if (hasCardDetails || hasToken) {
                      console.log('No existing payment card found, creating new one');
                      
                      // Create new payment card record with essential fields for recurring payments
                      const newPaymentCard = new PaymentCard({
                          tenantId: tenantId,
                          ownerId: ownerId,
                          razorpayTokenId: tokenId, // Store token at top level for backward compatibility
                          razorpayCustomerId: customerId, // Store customer ID at top level
                          cards: hasToken ? [{
                              cardNumber: cardNumber || 'Unknown',
                              cardBrand: cardBrand || 'Unknown',
                              cardType: cardType || 'unknown',
                              razorpayTokenId: tokenId, // Store token ID needed for recurring payments
                              razorpayCustomerId: customerId, // Store customer ID if available
                              razorpayPaymentId: razorpay_payment_id,
                              currency: 'USD', // Always use USD as per requirements
                              status: 'active',
                              lastUsed: new Date()
                          }] : [],
                          lastPlanId: planId,
                          lastPaymentDate: new Date(),
                          lastPaymentId: razorpay_payment_id,
                          isDefault: true
                      });
                      
                      try {
                          await newPaymentCard.save();
                          console.log('Created new payment card record');
                      } catch (saveError) {
                          console.error('Error creating new card record:', saveError);
                      }
                  }
              } else {
                  console.log('No card details or token to save');
              }
          } catch (cardError) {
              console.error('Error handling card details:', cardError);
              // Continue despite error - focus on subscription and invoice updates
          }
  
      // Update existing CustomerSubscription, Invoice
      try {
        const { createReceipt, calculateNextBillingDate, calculateEndDate } = require('./CustomerSubscriptionInvoiceContollers.js');
        const CustomerSubscription = require('../models/CustomerSubscriptionmodels.js');
        const Invoicemodels = require('../models/Invoicemodels.js');
        const Wallet = require('../models/WalletTopup.js');
        const SubscriptionPlan = require('../models/Subscriptionmodels.js');
        const Receipt = require('../models/Receiptmodels.js');
        
        console.log('Updating existing subscription records for payment:', razorpay_payment_id);
        
        // Get subscription plan details
        console.log('Looking up subscription plan with ID:', planId);
        const subPlan = await SubscriptionPlan.findById(planId);
        if (!subPlan) {
          console.warn(`Subscription plan not found with ID: ${planId}`);
        } else {
          console.log('Found subscription plan:', subPlan.name);
        }
        
        // Calculate billing dates
        const startDate = new Date();
        const billingCycle = metadata?.billingCycle;
        const endDate = calculateEndDate(billingCycle);
        const nextBillingDate = endDate;
        
        console.log('Billing cycle:', billingCycle, 'End date:', endDate);
        console.log('Searching for existing subscription for owner:', ownerId);
  
        // First, find the invoice associated with this payment
        const invoice = await Invoicemodels.findOne({ _id: invoiceId });
       
        if (!invoice) {
            console.warn(`No existing invoice found with ID: ${invoiceId}`);
          } else {
            console.log('Found existing invoice:', invoice._id);
          }
        
        
        // Get the plan details to access its features (using lean() for better performance)
        const plan = await SubscriptionPlan.findById(planId).lean();
        
        // Look for existing subscription by ownerId
        const subscription = await CustomerSubscription.findOne({ ownerId: ownerId });
        
        if (!subscription) {
          console.warn(`No existing subscription found for owner: ${ownerId}`);
          console.log('Payment processed but no subscription to update.');
        } else {
          console.log('Found existing subscription:', subscription._id);
          
          // Update existing subscription with payment information
                      subscription.status = 'active';
                      subscription.subscriptionPlanId = planId;
                      subscription.lastPaymentId = razorpay_payment_id;
                      subscription.lastPaymentDate = new Date();
                      subscription.startDate = startDate;
                      subscription.endDate = endDate;
                      subscription.nextBillingDate = nextBillingDate;
                      subscription.selectedBillingCycle = billingCycle;
                      
                      // Add features from plan if available
                      if (plan && plan.features) {
                          subscription.features = plan.features.map(feature => ({
                              name: feature.name,
                              limit: feature.limit,
                              description: feature.description
                          }));
                      }
  
                      let priceFound = false;
                      
                      // Get price from the pricing array based on billing cycle
                      if (plan && plan.pricing && Array.isArray(plan.pricing)) {
                          console.log('Plan pricing:', JSON.stringify(plan.pricing, null, 2));
                          
                          // Find the pricing object for the selected billing cycle
                          const pricing = plan.pricing.find(p => p.billingCycle === billingCycle);
                          
                          if (pricing) {
                              console.log(`Found ${billingCycle} pricing:`, pricing);
                              
                              // Set the base price
                              const price = pricing.price;
                              subscription.price = price;
                              priceFound = true;
                              
                              // Calculate discount if applicable
                              let discount = 0;
                              if (pricing.discount && pricing.discount > 0) {
                                  if (pricing.discountType === 'percentage') {
                                      discount = (price * pricing.discount) / 100;
                                  } else {
                                      discount = pricing.discount;
                                  }
                              }
                              
                              // Calculate total amount after discount
                              subscription.totalAmount = price - discount;
                              subscription.discount = discount;
                              
                              console.log(`Price: ${price}, Discount: ${discount}, Total: ${subscription.totalAmount}`);
                          }
                      }
                      // Update existing invoice with payment information
                      invoice.status = 'paid';
                      // Update invoice with the new pricing from the subscription
                      invoice.amountPaid = subscription.totalAmount;
                      invoice.price = subscription.price;
                      invoice.discount = subscription.discount || 0;
                      invoice.totalAmount = subscription.totalAmount;
                      invoice.outstandingAmount = 0;
                      invoice.lastPaymentDate = new Date();
                      invoice.lastPaymentId = razorpay_payment_id;
                      invoice.startDate = startDate;
                      invoice.endDate = endDate;
                      
                      await invoice.save();
                      console.log('Invoice updated to paid status');
                      
                      // Only create receipt if payment was successful
                      if (payment.status === 'captured' || payment.status === 'authorized') {
                          console.log('Creating receipt for successful payment');
                          const receipt = new Receipt({
                              tenantId: tenantId,
                              ownerId: ownerId,
                              invoiceId: invoice._id,
                              amount: subscription.totalAmount,  // Use subscription amount to ensure consistency
                              price: subscription.price,
                              discount: subscription.discount || 0,
                              transactionId: razorpay_payment_id,
                              paymentDate: new Date(),
                              paymentMethod: 'razorpay'
                          });
                          
                          await receipt.save();
                          console.log('Receipt created successfully:', receipt._id);
                          
                          // Update subscription with receipt ID only if receipt was created
                          subscription.receiptId = receipt._id;
                      } else {
                          console.log('Payment not successfully captured, skipping receipt creation');
                      }
                      subscription.invoiceId = invoice._id;
  
                      await subscription.save();
                      console.log('Subscription updated with receipt ID');
  
  
                      // Update wallet if plan has credits
                      if (plan && plan.walletCredits > 0) {
                          console.log('Plan includes wallet credits:', plan.walletCredits);
                          
                          const wallet = await Wallet.findOne({ ownerId: cardDetails.ownerId });
                          
                          if (wallet) {
                              console.log('Found existing wallet:', wallet._id);
                              
                              // Update wallet status from pending to completed
                              let updatedTransaction = false;
                              
                              for (let i = 0; i < wallet.transactions.length; i++) {
                                  if (wallet.transactions[i].status === 'pending' && 
                                      wallet.transactions[i].relatedInvoiceId === invoice._id.toString()) {
                                      wallet.transactions[i].status = 'completed';
                                      updatedTransaction = true;
                                      console.log('Updated pending transaction to completed status');
                                      break;
                                  }
                              }
                              
                              if (!updatedTransaction) {
                                  // If no pending transaction found, add a new one
                                  wallet.balance += plan.walletCredits;
                                  wallet.transactions.push({
                                      type: 'credit',
                                      amount: plan.walletCredits,
                                      description: `Credits from ${plan.name} subscription`,
                                      relatedInvoiceId: invoice._id.toString(),
                                      status: 'completed',
                                      createdDate: new Date()
                                  });
                                  console.log('Added new completed transaction to wallet');
                              }
                              
                              await wallet.save();
                              console.log('Wallet updated successfully');
                          }
                      }
          
        
        }
        
        console.log('Payment verification completed, all records updated');
      } catch (error) {
        console.error('Error updating subscription records:', error);
        // Don't fail the payment verification if record updates fail
      }
      
      return res.status(200).json({
        message: 'Payment verified and processed successfully',
        transactionId: razorpay_payment_id,
        status: 'paid'
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      return res.status(500).json({
        message: 'Error verifying payment',
        error: error.message,
        status: 'failed'
      });
    }
  };

// Full webhook handler for processing Razorpay events
const handleWebhook = async (req, res) => {
    try {
        // Enhanced webhook logging for better debugging
        console.log('=============== RAZORPAY WEBHOOK RECEIVED ===============');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Webhook payload:', JSON.stringify(req.body, null, 2));
        console.log('Webhook headers:', JSON.stringify(req.headers, null, 2));
        console.log('Request IP:', req.ip || req.connection.remoteAddress);
        
        // Webhook signature verification
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];
        
        // Check if we're in development mode (can be controlled via env var)
        const isDevelopment = process.env.NODE_ENV === 'development' || true; // Default to true for testing
        
        // In development mode, we can optionally skip signature verification
        if (!signature && !isDevelopment) {
            console.error('Missing Razorpay signature in webhook request');
            // Return 200 to acknowledge receipt but log the error
            return res.status(200).json({ 
                received: true, 
                error: 'Missing signature', 
                success: false 
            });
        } else if (!signature && isDevelopment) {
            console.warn('Missing signature but continuing in development mode');
        }
        
        if (!webhookSecret && !isDevelopment) {
            console.error('RAZORPAY_WEBHOOK_SECRET not configured in environment');
            return res.status(200).json({ 
                received: true, 
                error: 'Webhook secret not configured', 
                success: false 
            });
        } else if (!webhookSecret && isDevelopment) {
            console.warn('Webhook secret not configured but continuing in development mode');
        }
        
        // Verify webhook signature if both values are present
        if (signature && webhookSecret) {
            const payload = JSON.stringify(req.body);
            const crypto = require('crypto');
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(payload)
                .digest('hex');
                
            if (signature !== expectedSignature) {
                console.error('Invalid webhook signature');
                console.error(`Received: ${signature}`);
                console.error(`Expected: ${expectedSignature}`);
                return res.status(200).json({ 
                    received: true, 
                    error: 'Invalid signature', 
                    success: false 
                });
            }
            console.log('Webhook signature verified successfully');
        } else if (!webhookSecret) {
            console.warn('RAZORPAY_WEBHOOK_SECRET not set, skipping signature verification');
        }
        
        // Extract event type and payload
        let eventType = '';
        let payload = req.body.payload || req.body;
        
        if (req.body && req.body.event) {
            eventType = req.body.event;
            console.log('Event type:', eventType);
            console.log('Event payload:', JSON.stringify(payload, null, 2));
        } else if (req.body && req.body.payload && req.body.payload.payment) {
            eventType = 'payment.received';
            console.log('Received payment event with payload:', JSON.stringify(payload, null, 2));
        }
        
        console.log('Processing webhook event type:', eventType);
        
        // Process different event types
        switch (eventType) {
            case 'payment.authorized':
            case 'payment.captured':
                await handlePaymentEvent(eventType, req.body.payload || req.body);
                break;
                
            case 'subscription.charged':
            case 'subscription.activated':
            case 'subscription.created':
                console.log(`============= PROCESSING ${eventType.toUpperCase()} EVENT =============`);
                console.log('Event time:', new Date().toISOString());
                await handleSubscriptionEvent(eventType, req.body.payload || req.body);
                console.log(`${eventType} processing completed`);
                break;
                
            case 'payment.failed':
                await handlePaymentFailed(req.body.payload?.payment || req.body.payment || req.body);
                break;
                
            case 'subscription.cancelled':
                await handleSubscriptionCancelled(req.body.payload?.subscription || req.body.subscription || req.body);
                break;
                
            case 'subscription.paused':
                await handleSubscriptionStatusChange(eventType, req.body.payload || req.body);
                break;
            case 'subscription.halted':
                await handleSubscriptionHalted(req.body.payload?.subscription || req.body.subscription || req.body);
                break;
                
            default:
                console.log(`Unhandled event type: ${eventType}`);
        }
        
        // Always acknowledge receipt to prevent Razorpay from retrying
        return res.status(200).json({ 
            received: true, 
            message: `Webhook processed successfully for event: ${eventType}` 
        });
    } catch (error) {
        console.error('Error in webhook handler:', error);
        // Still return 200 to prevent Razorpay from retrying
        return res.status(200).json({ received: true, error: error.message });
    }
};


// Handle payment.failed event
const handlePaymentFailed = async (payment) => {
    try {
        console.log('Processing payment failed event for:', payment.id);
        
        // Check if this is a subscription payment
        if (!payment.subscription_id) {
            console.log('Not a subscription payment, skipping');
            return;
        }
        
        // Find our subscription record
        const customerSubscription = await CustomerSubscription.findOne({ 
            razorpaySubscriptionId: payment.subscription_id 
        });
        
        if (!customerSubscription) {
            console.error('Subscription not found in our records:', payment.subscription_id);
            return;
        }
        
        // Update the subscription status
        customerSubscription.status = 'payment_failed';
        
        // Create a failed invoice record
        const invoice = await createInvoice({
            ownerId: customerSubscription.ownerId,
            tenantId: customerSubscription.tenantId,
            subscriptionId: customerSubscription._id,
            amount: payment.amount / 100, // Convert from paisa to rupees
            status: 'failed',
            paymentDate: new Date(),
            dueDate: new Date(),
            billingCycle: customerSubscription.selectedBillingCycle,
            failureReason: payment.error_description || 'Payment failed'
        });
        
        customerSubscription.invoices = customerSubscription.invoices || [];
        customerSubscription.invoices.push(invoice._id);
        await customerSubscription.save();
        
        console.log('Updated subscription status to payment_failed');
        
        // You can add notification logic here to inform the user about the failed payment
        
    } catch (error) {
        console.error('Error handling payment failed event:', error);
    }
};

// Handle subscription.halted event
const handleSubscriptionHalted = async (subscription) => {
    try {
        console.log('Processing subscription halted event for:', subscription.id);
        
        // Find our subscription record
        const customerSubscription = await CustomerSubscription.findOne({ 
            razorpaySubscriptionId: subscription.id 
        });
        
        if (!customerSubscription) {
            console.error('Subscription not found in our records:', subscription.id);
            return;
        }
        
        // Update the subscription status
        customerSubscription.status = 'halted';
        customerSubscription.haltedReason = subscription.pause_reason || 'Payment failures';
        await customerSubscription.save();
        
        console.log('Updated subscription status to halted');
        
        // You can add notification logic here to inform the user about the halted subscription
        
    } catch (error) {
        console.error('Error handling subscription halted event:', error);
    }
};

// Handle subscription status changes (cancelled, paused)
const handleSubscriptionStatusChange = async (event, payload) => {
    try {
        console.log(`Processing subscription ${event} event:`, JSON.stringify(payload));
        
        // Extract subscription details
        let subscription;
        if (payload.subscription) {
            subscription = payload.subscription;
        } else {
            subscription = payload;
        }
        
        if (!subscription || !subscription.id) {
            console.error(`Invalid subscription data in ${event} payload`);
            return;
        }
        
        // Check if subscription has notes
        if (!subscription.notes) {
            console.error('Subscription notes missing in webhook payload');
            return;
        }
        
        // Extract subscription details from notes
        const { subscriptionId } = subscription.notes;
        
        if (!subscriptionId) {
            console.error('Internal subscription ID missing in subscription notes');
            return;
        }
        
        // Find the existing subscription in your database
        const existingSubscription = await CustomerSubscription.findOne({
            $or: [
                { _id: subscriptionId },
                { razorpaySubscriptionId: subscription.id }
            ]
        });
        
        if (!existingSubscription) {
            console.error(`Subscription not found for ID: ${subscriptionId} or Razorpay ID: ${subscription.id}`);
            return;
        }
        
        // Update subscription status based on event type
        if (event === 'subscription.cancelled') {
            existingSubscription.status = 'cancelled';
            existingSubscription.autoRenew = false;
            existingSubscription.cancellationDate = new Date();
            existingSubscription.cancellationReason = subscription.cancel_reason || 'Cancelled via webhook';
        } else if (event === 'subscription.paused') {
            existingSubscription.status = 'paused';
            existingSubscription.pauseDate = new Date();
        }
        
        await existingSubscription.save();
        console.log(`Updated subscription status to ${existingSubscription.status} for ID: ${subscriptionId}`);
    } catch (error) {
        console.error(`Error handling ${event} event:`, error);
    }
};

// Handle subscription events (subscription.charged, subscription.activated, subscription.created)
const handleSubscriptionEvent = async (event, payload) => {
    try {
        console.log(`Processing subscription ${event} event:`, JSON.stringify(payload));
        
        // Extract subscription and payment details
        let subscription, payment;
        
        if (payload.subscription) {
            subscription = payload.subscription;
        } else {
            subscription = payload;
        }
        
        if (payload.payment) {
            payment = payload.payment;
        }
        
        if (!subscription || !subscription.id) {
            console.error(`Invalid subscription data in ${event} payload`);
            return;
        }
        
        // Route to the appropriate handler based on event type
        switch (event) {
            case 'subscription.charged':
                await handleSubscriptionCharged(subscription);
                break;
                
            case 'subscription.activated':
                await handleSubscriptionActivated(subscription);
                break;
                
            case 'subscription.created':
                // Handle subscription creation - store the Razorpay subscription ID
                const customerSubscription = await CustomerSubscription.findOne({ 
                    razorpaySubscriptionId: subscription.id 
                });
                
                if (customerSubscription) {
                    console.log('Subscription already exists in our records:', subscription.id);
                } else {
                    // Try to find by notes if available
                    if (subscription.notes && subscription.notes.subscriptionId) {
                        const existingSubscription = await CustomerSubscription.findById(subscription.notes.subscriptionId);
                        
                        if (existingSubscription) {
                            existingSubscription.razorpaySubscriptionId = subscription.id;
                            existingSubscription.autoRenew = true;
                            await existingSubscription.save();
                            console.log(`Updated subscription with Razorpay ID: ${subscription.id}`);
                        }
                    }
                }
                break;
                
            default:
                console.log(`Unhandled subscription event type: ${event}`);
        }
    } catch (error) {
        console.error(`Error handling ${event} event:`, error);
    }
};

// Handle subscription.charged event - occurs when a subscription payment is successful
const handleSubscriptionCharged = async (subscription) => {
    try {
        console.log('Processing subscription charged event for:', subscription.id);
        console.log('Subscription details:', JSON.stringify(subscription, null, 2));
        
        // Find our subscription record using the Razorpay subscription ID
        const customerSubscription = await CustomerSubscription.findOne({ 
            razorpaySubscriptionId: subscription.id 
        });
        
        if (!customerSubscription) {
            console.error('Subscription not found in our records:', subscription.id);
            console.error('Subscription ID:', subscription.id);
            console.error('Full subscription data:', JSON.stringify(subscription, null, 2));
            return;
        }
        
        console.log('Found subscription record:', customerSubscription._id);
        console.log('Subscription status:', customerSubscription.status);
        console.log('Next billing date:', customerSubscription.nextBillingDate);
        console.log('Billing cycle:', customerSubscription.selectedBillingCycle);
        
        // Get payment details from the subscription
        const paymentId = subscription.payment_id;
        const amount = subscription.amount / 100; // Convert from paisa to rupees
        
        console.log('Processing payment:', {
            paymentId: paymentId,
            amount: amount,
            status: subscription.status
        });
        
        // Create a new invoice for this payment
        const invoice = await createInvoice({
            ownerId: customerSubscription.ownerId,
            tenantId: customerSubscription.tenantId,
            subscriptionId: customerSubscription._id,
            amount: amount,
            status: 'paid',
            paymentDate: new Date(),
            dueDate: new Date(),
            billingCycle: customerSubscription.selectedBillingCycle
        });
        
        // Create a receipt for this payment
        const receipt = await createReceipt({
            ownerId: customerSubscription.ownerId,
            tenantId: customerSubscription.tenantId,
            invoiceId: invoice._id,
            amount: amount,
            paymentId: paymentId,
            paymentDate: new Date(),
            status: 'completed'
        });
        
        // Calculate the next billing date
        const currentDate = new Date();
        const nextBillingDate = calculateEndDate(currentDate, customerSubscription.selectedBillingCycle);
        
        // Update the subscription record
        customerSubscription.status = 'active';
        customerSubscription.lastPaymentDate = new Date();
        customerSubscription.lastPaymentId = paymentId;
        customerSubscription.nextBillingDate = nextBillingDate;
        customerSubscription.invoices = customerSubscription.invoices || [];
        customerSubscription.receipts = customerSubscription.receipts || [];
        customerSubscription.invoices.push(invoice._id);
        customerSubscription.receipts.push(receipt._id);
        
        await customerSubscription.save();
        
        console.log('Successfully processed subscription payment:', paymentId);
        console.log('Next billing date set to:', nextBillingDate);
        
        // You can add notification logic here to inform the user about the successful payment
        
    } catch (error) {
        console.error('Error handling subscription charged event:', error);
    }
};

// Handle subscription.activated event
const handleSubscriptionActivated = async (subscription) => {
    try {
        console.log('Processing subscription activated event for:', subscription.id);
        
        // Find our subscription record using the Razorpay subscription ID
        const customerSubscription = await CustomerSubscription.findOne({ 
            razorpaySubscriptionId: subscription.id 
        });
        
        if (!customerSubscription) {
            console.error('Subscription not found in our records:', subscription.id);
            return;
        }
        
        // Update the subscription status
        customerSubscription.status = 'active';
        customerSubscription.autoRenew = true;
        
        // Calculate the next billing date if not already set
        if (!customerSubscription.nextBillingDate) {
            const currentDate = new Date();
            const nextBillingDate = calculateEndDate(currentDate, customerSubscription.selectedBillingCycle);
            customerSubscription.nextBillingDate = nextBillingDate;
        }
        
        await customerSubscription.save();
        
        console.log('Successfully activated subscription:', subscription.id);
        
    } catch (error) {
        console.error('Error handling subscription activated event:', error);
    }
};

// Handle payment events (payment.authorized, payment.captured)
const handlePaymentEvent = async (event, payload) => {
    try {
        console.log('Processing payment event with payload:', JSON.stringify(payload));
        
        // The actual Razorpay webhook payload structure is different
        // Check if payload has entity or payment property
        let payment;
        
        if (payload.entity && payload.entity === 'event') {
            // This is the webhook format where payment is nested
            payment = payload.payload && payload.payload.payment;
        } else if (payload.payment) {
            // Direct payment object in payload
            payment = payload.payment;
        } else {
            // Assume payload itself is the payment
            payment = payload;
        }
        
        if (!payment || !payment.id) {
            console.error('Invalid payment data in webhook payload:', JSON.stringify(payload));
            return;
        }
        
        console.log(`Processing payment ${payment.id} with status ${payment.status}`);
        
        // Extract order ID from payment
        const orderId = payment.order_id;
        if (!orderId) {
            console.error('No order ID found in payment:', payment.id);
            return;
        }
        
        // Update payment record in our database
        const existingPayment = await Payment.findOne({ razorpayOrderId: orderId });
        
        if (existingPayment) {
            console.log(`Found existing payment record for order ${orderId}`);
            existingPayment.status = event === 'payment.captured' ? 'captured' : 'authorized';
            existingPayment.razorpayPaymentId = payment.id;
            existingPayment.amount = payment.amount / 100; // Convert from paisa to dollars
            existingPayment.notes = `Payment ${event === 'payment.captured' ? 'captured' : 'authorized'} via webhook`;
            await existingPayment.save();
        } else {
            console.log(`No existing payment record found for order ${orderId}, creating new record`);
            // We need to get the order details to get the notes
            let orderDetails;
            try {
                orderDetails = await razorpay.orders.fetch(orderId);
                console.log('Fetched order details:', orderDetails.id);
            } catch (orderError) {
                console.error('Error fetching order details:', orderError);
                return;
            }
            
            if (!orderDetails || !orderDetails.notes) {
                console.error('Order notes missing in order details');
                return;
            }
            
            const newPayment = new Payment({
                razorpayOrderId: orderId,
                razorpayPaymentId: payment.id,
                status: event === 'payment.captured' ? 'captured' : 'authorized',
                amount: payment.amount / 100,
                currency: payment.currency || 'USD',
                notes: `Payment ${event === 'payment.captured' ? 'captured' : 'authorized'} via webhook`,
                ownerId: orderDetails.notes.ownerId,
                tenantId: orderDetails.notes.tenantId,
                planId: orderDetails.notes.planId
            });
            
            await newPayment.save();
            console.log(`Created new payment record for ${payment.id}`);
        }
        
        // Get order details to extract notes
        let orderDetails;
        try {
            orderDetails = await razorpay.orders.fetch(orderId);
        } catch (orderError) {
            console.error('Error fetching order details:', orderError);
            return;
        }
        
        if (!orderDetails || !orderDetails.notes) {
            console.error('Order notes missing in order details');
            return;
        }
        
        const { 
            ownerId, 
            tenantId, 
            planId, 
            membershipType,
            isRecurring
        } = orderDetails.notes;
        
        // Find the invoice associated with this order
        const invoice = await Invoice.findOne({ 
            relatedObjectId: order.id 
        });
        
        if (!invoice) {
            console.error('Invoice not found for order:', order.id);
            return;
        }
        
        // Update invoice status
        invoice.status = 'paid';
        invoice.amountPaid = payment.amount / 100; // Convert from cents to dollars
        
        // Calculate end date based on membership type
        const startDate = new Date();
        const endDate = calculateEndDate(startDate, membershipType);
        
        invoice.startDate = startDate;
        invoice.endDate = endDate;
        await invoice.save();
        
        // Create receipt
        const receipt = await createReceipt(
            tenantId,
            ownerId,
            invoice._id,
            payment.amount / 100,
            payment.id,
            { membershipType }
        );
        
        // Update or create subscription
        const existingSubscription = await CustomerSubscription.findOne({ 
            ownerId, 
            subscriptionPlanId: planId 
        });
        
        if (existingSubscription) {
            existingSubscription.selectedBillingCycle = membershipType;
            existingSubscription.startDate = startDate;
            existingSubscription.nextBillingDate = endDate;
            existingSubscription.status = 'active';
            existingSubscription.receiptId = receipt._id;
            existingSubscription.totalAmount = payment.amount / 100;
            existingSubscription.invoiceId = invoice._id;
            
            // Handle auto-renewal based on isRecurring flag
            if (isRecurring === 'true' || isRecurring === true) {
                console.log('Setting up subscription for automatic renewal');
                existingSubscription.autoRenew = true;
                
                // Store token ID for future automatic payments if available
                if (payment.razorpayTokenId) {
                    existingSubscription.razorpayTokenId = payment.razorpayTokenId;
                    console.log('Stored token ID for automatic renewal:', payment.razorpayTokenId);
                } else if (existingPayment && existingPayment.razorpayTokenId) {
                    existingSubscription.razorpayTokenId = existingPayment.razorpayTokenId;
                    console.log('Using existing token ID for automatic renewal:', existingPayment.razorpayTokenId);
                }
            } else {
                // Disable auto-renewal for one-time payments
                existingSubscription.autoRenew = false;
                console.log('One-time payment - auto-renewal disabled');
            }
            
            await existingSubscription.save();
        } else {
            // Create new subscription
            const subscription = new CustomerSubscription({
                tenantId,
                ownerId,
                subscriptionPlanId: planId,
                selectedBillingCycle: membershipType,
                startDate,
                nextBillingDate: endDate,
                status: 'active',
                price: invoice.totalAmount,
                discount: 0, // Can be updated from planDetails if needed
                totalAmount: payment.amount / 100, // Convert from cents to dollars
                receiptId: receipt._id,
                invoiceId: invoice._id,
                // Set auto-renewal based on isRecurring flag
                autoRenew: (isRecurring === 'true' || isRecurring === true)
            });
            
            // Store token ID for future automatic payments if this is a recurring subscription
            if (isRecurring === 'true' || isRecurring === true) {
                console.log('Setting up new subscription for automatic renewal');
                
                // Store token ID if available
                if (payment.razorpayTokenId) {
                    subscription.razorpayTokenId = payment.razorpayTokenId;
                    console.log('Stored token ID for automatic renewal:', payment.razorpayTokenId);
                } else if (existingPayment && existingPayment.razorpayTokenId) {
                    subscription.razorpayTokenId = existingPayment.razorpayTokenId;
                    console.log('Using existing token ID for automatic renewal:', existingPayment.razorpayTokenId);
                }
            } else {
                console.log('New one-time payment - auto-renewal disabled');
            }
            
            await subscription.save();
        }
         
        // Handle subscription events for recurring payments
        if (event === 'subscription.charged' || event === 'subscription.activated') {
            console.log('Processing subscription event:', event);
            const { subscription, payment } = payload;
            
            if (!subscription || !subscription.notes) {
                console.error('Subscription notes missing in webhook payload');
                return res.status(400).json({ error: 'Subscription details missing' });
            }
            
            // Extract subscription details from notes
            const { 
                ownerId, 
                tenantId, 
                subscriptionId, // This is your internal subscription ID
                billingCycle 
            } = subscription.notes;
            
            console.log('Processing subscription for owner:', ownerId, 'subscription ID:', subscriptionId);
            
            // Find the existing subscription in your database
            const existingSubscription = await CustomerSubscription.findOne({
                $or: [
                    { _id: subscriptionId },
                    { ownerId: ownerId, razorpaySubscriptionId: subscription.id }
                ]
            });
            
            if (!existingSubscription) {
                console.error('Subscription not found in database:', subscriptionId);
                return res.status(404).json({ error: 'Subscription not found' });
            }
            
            // Calculate new dates
            const startDate = new Date();
            const endDate = calculateEndDate(billingCycle || existingSubscription.selectedBillingCycle);
            
            // Create a new invoice for this billing cycle
            const invoice = new Invoice({
                tenantId: tenantId || existingSubscription.tenantId,
                ownerId: ownerId,
                subscriptionId: existingSubscription._id,
                subscriptionPlanId: existingSubscription.subscriptionPlanId,
                totalAmount: payment ? payment.amount / 100 : existingSubscription.totalAmount,
                amountPaid: payment ? payment.amount / 100 : existingSubscription.totalAmount,
                outstandingAmount: 0,
                status: 'paid',
                startDate: startDate,
                endDate: endDate,
                paidAt: new Date(),
                lineItems: {
                    description: `Auto-renewal for ${billingCycle || existingSubscription.selectedBillingCycle} subscription`,
                    amount: payment ? payment.amount / 100 : existingSubscription.totalAmount
                },
                paymentMethod: 'razorpay_auto',
                razorpayPaymentId: payment ? payment.id : null,
                razorpaySubscriptionId: subscription.id
            });
            
            await invoice.save();
            console.log('Created new invoice for subscription renewal:', invoice._id);
            
            // Create a receipt for this payment
            const receipt = new Receipt({
                tenantId: tenantId || existingSubscription.tenantId,
                ownerId: ownerId,
                invoiceId: invoice._id,
                amount: payment ? payment.amount / 100 : existingSubscription.totalAmount,
                transactionId: payment ? payment.id : `auto_${Date.now()}`,
                paymentDate: new Date(),
                paymentMethod: 'razorpay_auto',
                status: 'completed'
            });
            
            await receipt.save();
            console.log('Created receipt for subscription renewal:', receipt._id);
            
            // Calculate the next billing date based on current date
            const currentDate = new Date();
            const nextBillingDate = calculateEndDate(currentDate, existingSubscription.selectedBillingCycle);
            
            // Update the subscription
            existingSubscription.status = 'active';
            existingSubscription.startDate = startDate;
            existingSubscription.endDate = endDate;
            existingSubscription.nextBillingDate = nextBillingDate; // Use the calculated next billing date
            existingSubscription.lastPaymentDate = new Date();
            existingSubscription.lastPaymentId = payment ? payment.id : null;
            
            // Store invoice and receipt IDs in arrays for payment history
            if (!existingSubscription.invoices) existingSubscription.invoices = [];
            if (!existingSubscription.receipts) existingSubscription.receipts = [];
            
            existingSubscription.invoices.push(invoice._id);
            existingSubscription.receipts.push(receipt._id);
            
            // Ensure auto-renewal is enabled
            existingSubscription.autoRenew = true;
            
            await existingSubscription.save();
            console.log('Updated subscription with new billing cycle:', existingSubscription._id);
            
            // Create a payment record
            if (payment) {
                const paymentRecord = new Payment({
                    tenantId: tenantId || existingSubscription.tenantId,
                    ownerId: ownerId,
                    planId: existingSubscription.subscriptionPlanId,
                    amount: payment.amount / 100,
                    currency: payment.currency || 'USD',
                    status: 'captured',
                    paymentMethod: 'card',
                    paymentGateway: 'razorpay',
                    razorpayPaymentId: payment.id,
                    razorpaySubscriptionId: subscription.id,
                    transactionId: generateTransactionId(),
                    paidAt: new Date(),
                    billingCycle: billingCycle || existingSubscription.selectedBillingCycle,
                    metadata: {
                        isRecurring: true,
                        autoRenew: true
                    }
                });
                
                await paymentRecord.save();
                console.log('Created payment record for subscription renewal:', paymentRecord._id);
            }
        }
        // Handle payment failure events
        else if (event === 'payment.failed' || event === 'subscription.payment_failed') {
            console.log('Processing payment failure event:', event);
            const { payment, subscription } = payload;
            
            // If this is a subscription payment failure
            if (subscription && subscription.notes) {
                const { ownerId, subscriptionId } = subscription.notes;
                
                // Find the subscription in your database
                const existingSubscription = await CustomerSubscription.findOne({
                    $or: [
                        { _id: subscriptionId },
                        { ownerId: ownerId, razorpaySubscriptionId: subscription.id }
                    ]
                });
                
                if (existingSubscription) {
                    // Update subscription status
                    existingSubscription.status = 'payment_failed';
                    await existingSubscription.save();
                    console.log('Updated subscription status to payment_failed:', existingSubscription._id);
                    
                    // TODO: Send notification to user about payment failure
                }
            }
            // If this is a regular payment failure
            else if (payment) {
                // Update payment record if it exists
                await Payment.findOneAndUpdate(
                    { razorpayPaymentId: payment.id },
                    { 
                        status: 'failed',
                        notes: 'Payment failed via webhook'
                    }
                );
            }
            
            const { 
                ownerId, 
                tenantId, 
                planId,
                membershipType 
            } = subscription.notes;
            
            // Create new invoice for this subscription charge
            const newInvoice = await createInvoice(
                tenantId,
                ownerId,
                planId,
                payment.amount / 100,
                { membershipType },
                'paid',
                subscription.id
            );
            
            // Create receipt
            const receipt = await createReceipt(
                tenantId,
                ownerId,
                newInvoice._id,
                payment.amount / 100,
                payment.id,
                { membershipType }
            );
            
            // Update customer subscription
            const customerSubscription = await CustomerSubscription.findOne({
                ownerId,
                subscriptionPlanId: planId
            });
            
            if (customerSubscription) {
                // Calculate next billing date
                const startDate = new Date();
                const endDate = calculateEndDate(startDate, membershipType);
                
                customerSubscription.startDate = startDate;
                customerSubscription.nextBillingDate = endDate;
                customerSubscription.receiptId = receipt._id;
                customerSubscription.invoiceId = newInvoice._id;
                await customerSubscription.save();
            }
        }
        // Handle failed payments
        else if (event === 'payment.failed') {
            const { payment, order } = payload;
            
            if (order && order.notes) {
                const { ownerId, planId } = order.notes;
                
                // Find the invoice and mark as failed
                const invoice = await Invoice.findOne({
                    relatedObjectId: order.id
                });
                
                if (invoice) {
                    invoice.status = 'failed';
                    await invoice.save();
                }
                
                // Update subscription status if needed
                const subscription = await CustomerSubscription.findOne({
                    ownerId,
                    subscriptionPlanId: planId
                });
                
                if (subscription) {
                    // You may want to handle failed payments differently
                    // depending on your business logic
                    // For example, you might not want to immediately mark as inactive
                    // subscription.status = 'inactive';
                    // await subscription.save();
                }
            }
        }
        
        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({
            error: 'Error processing webhook',
            message: error.message
        });
    }
};

// Create Razorpay customer for recurring subscriptions
const createCustomer = async (userProfile, ownerId, tenantId) => {
    try {
        // Validate inputs
        if (!ownerId) {
            console.error('Missing ownerId in createCustomer');
            throw new Error('Owner ID is required for customer creation');
        }

        console.log(`Creating/retrieving customer for owner ID: ${ownerId}`);
        
        // First check if we already have a Razorpay customer ID for this user
        try {
            // Check existing payment records
            const existingPayment = await Payment.findOne({ 
                ownerId, 
                razorpayCustomerId: { $exists: true, $ne: null } 
            });
            
            if (existingPayment && existingPayment.razorpayCustomerId) {
                console.log('Found existing customer ID in payment records:', existingPayment.razorpayCustomerId);
                return existingPayment.razorpayCustomerId;
            }
            
            // Also check card details
            const existingCard = await PaymentCard.findOne({
                ownerId,
                razorpayCustomerId: { $exists: true, $ne: null }
            });
            
            if (existingCard && existingCard.razorpayCustomerId) {
                console.log('Found existing customer ID in card records:', existingCard.razorpayCustomerId);
                return existingCard.razorpayCustomerId;
            }
        } catch (dbError) {
            console.error('Error checking for existing customer:', dbError);
            // Continue with creating a new customer
        }
        
        // Extract customer details from userProfile
        // Prepare customer name - use the most specific information available
        let customerName = '';
        let customerEmail = '';
        let customerPhone = '';
        
        if (userProfile) {
            if (userProfile.name) {
                customerName = userProfile.name;
            } else if (userProfile.firstName || userProfile.lastName) {
                customerName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
            }
            
            customerEmail = userProfile.email || '';
            customerPhone = userProfile.phone || '';
        }
        
        // If we still don't have a name, try to get user details from the database
        if (!customerName) {
            try {
                const user = await User.findById(ownerId);
                if (user) {
                    customerName = user.name || user.firstName || user.username || '';
                    customerEmail = customerEmail || user.email || '';
                    customerPhone = customerPhone || user.phone || '';
                }
            } catch (userError) {
                console.error('Error fetching user details:', userError);
                // Continue with available information
            }
        }
        
        // Ensure we have at least some identifier for the customer
        customerName = customerName || `Customer ${ownerId.substring(0, 8)}`;
        
        // Create customer in Razorpay with the best available information
        console.log(`Creating customer with name: ${customerName}, email: ${customerEmail || 'Not provided'}, phone: ${customerPhone || 'Not provided'}`);
        
        const customerData = {
            name: customerName,
            notes: {
                ownerId,
                tenantId: tenantId || ''
            }
        };
        
        // Only add email and phone if they exist to avoid sending empty values to Razorpay
        if (customerEmail) {
            customerData.email = customerEmail;
        }
        
        if (customerPhone) {
            customerData.contact = customerPhone;
        }
        
        // Create the customer in Razorpay
        const customer = await razorpay.customers.create(customerData);
        
        console.log('Successfully created Razorpay customer:', customer.id);
        
        // Store the customer ID in relevant records
        try {
            // Update payment records
            await Payment.updateMany(
                { ownerId },
                { $set: { razorpayCustomerId: customer.id } }
            );
            
            // Also update card details if they exist
            const cardDetails = await PaymentCard.findOne({ ownerId });
            if (cardDetails) {
                cardDetails.razorpayCustomerId = customer.id;
                await cardDetails.save();
                console.log('Updated card details with customer ID');
            }
        } catch (updateError) {
            console.error('Error updating records with customer ID:', updateError);
            // Continue despite error - we already have the customer ID
        }
        
        return customer.id;
    } catch (error) {
        console.error('Error creating Razorpay customer:', error);
        throw error; // Propagate the error to be handled by the caller
    }
};

// Store token from Razorpay payment response for recurring payments
// This function should be called with the token from Razorpay's payment response
const createCardToken = async (customerId, razorpayTokenId, cardLast4, cardNetwork) => {
    console.log('Storing Razorpay token for auto-renewal');
    
    try {
        // Validate required inputs
        if (!customerId) {
            throw new Error('Customer ID is required for token storage');
        }
        
        if (!razorpayTokenId) {
            throw new Error('Razorpay token ID is required for recurring payments');
        }
        
        console.log('Using Razorpay token:', razorpayTokenId);
        
        // For a complete implementation, you would verify the token with Razorpay
        // by making an API call to fetch token details
        
        // Example of how you would fetch token details from Razorpay:
        // const tokenDetails = await razorpay.tokens.fetch(razorpayTokenId);
        
        // Since we already have the token from the payment response,
        // we can use it directly
        const token = {
            id: razorpayTokenId,
            entity: 'token',
            card: {
                last4: cardLast4 || '****',
                network: cardNetwork || ''
            }
        };
        
        console.log('Successfully created card token:', token.id);
        
        // Save the token ID to the card details
        try {
            const cardDetails = await PaymentCard.findOne({ ownerId: customerId });
            if (cardDetails) {
                cardDetails.razorpayTokenId = token.id;
                await cardDetails.save();
                console.log('Saved Razorpay token ID to card details:', token.id);
            } else {
                console.error('Could not find payment card record to update with token ID');
            }
        } catch (saveError) {
            console.error('Error saving token ID to card details:', saveError);
            // Continue despite this error as we still have the token
        }
        
        return {
            success: true,
            token
        };
    } catch (error) {
        console.error('Error creating card token:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Create a subscription in Razorpay for recurring billing
const createSubscription = async (planId, customerId, amount, startAt, notes = {}) => {
    try {
        // Validate inputs
        if (!planId) {
            throw new Error('Plan ID is required for subscription creation');
        }
        
        if (!customerId) {
            throw new Error('Customer ID is required for subscription creation');
        }

        console.log(`Creating subscription for plan: ${planId}, customer: ${customerId}`);
        
        // Determine the billing frequency based on notes or plan details
        let totalCount = 12; // Default to 12 billing cycles for monthly
        let billingCycle = notes?.billingCycle || 'monthly';
        
        // Adjust total_count based on billing cycle
        if (billingCycle.toLowerCase() === 'annual' || billingCycle.toLowerCase() === 'yearly') {
            totalCount = 1; // Annual subscription has 1 billing cycle per year
        }
        
        // Convert startAt to Unix timestamp if it's a Date object or use current time
        let startAtTimestamp;
        if (startAt) {
            startAtTimestamp = startAt instanceof Date 
                ? Math.floor(startAt.getTime() / 1000) 
                : (typeof startAt === 'number' ? startAt : Math.floor(Date.now() / 1000));
        } else {
            // If no start date provided, start from now
            startAtTimestamp = Math.floor(Date.now() / 1000);
        }
        
        // For testing: Set a shorter period (48 hours) for testing automatic billing
        const testPeriodInSeconds = 60 * 60 * 48; // 48 hours for testing
        const expireBy = startAtTimestamp + testPeriodInSeconds;
        console.log(`TEST MODE: Setting subscription expiry to 48 hours from start: ${new Date(expireBy * 1000).toISOString()}`);
        
        // Prepare subscription data
        const subscriptionData = {
            plan_id: planId,
            customer_id: customerId,
            total_count: totalCount,
            quantity: 1,
            start_at: startAtTimestamp,
            expire_by: expireBy,
            customer_notify: 1, // Notify customer about subscription
            notes: notes
        };
        
        // Add additional metadata if available
        if (amount) {
            subscriptionData.notes.amount = amount.toString();
        }
        
        // Create subscription in Razorpay
        const subscription = await razorpay.subscriptions.create(subscriptionData);
        
        console.log('Successfully created subscription:', subscription.id);
        
        // Store subscription details in our database for reference
        try {
            if (notes.ownerId && notes.subscriptionId) {
                // Find and update the subscription record
                await CustomerSubscription.findByIdAndUpdate(
                    notes.subscriptionId,
                    {
                        $set: {
                            razorpaySubscriptionId: subscription.id,
                            autoRenew: true,
                            nextBillingDate: new Date(startAtTimestamp * 1000)
                        }
                    },
                    { new: true }
                );
                console.log('Updated subscription record with Razorpay subscription ID');
            }
        } catch (dbError) {
            console.error('Error updating subscription record:', dbError);
            // Continue despite error - we already have the subscription created in Razorpay
        }
        
        return {
            success: true,
            subscription: subscription
        };
    } catch (error) {
        console.error('Error creating subscription:', error);
        return {
            success: false,
            error: error.message || 'Failed to create subscription'
        };
    }
};

// Create or get a subscription plan in Razorpay
const getOrCreateSubscriptionPlan = async (planDetails, membershipType) => {
    try {
        // Validate inputs
        if (!planDetails || !membershipType) {
            throw new Error('Missing required parameters for plan creation');
        }

        // Set period based on membership type (Razorpay accepts: daily, weekly, monthly, yearly)
        const period = membershipType === 'monthly' ? 'monthly' : 'yearly';
        
        // Calculate amount based on selected cycle
        const pricing = parseInt(membershipType === 'monthly' ? planDetails.monthlyPrice : planDetails.annualPrice) || 0;
        const discount = parseInt(membershipType === 'monthly' ? planDetails.monthDiscount : planDetails.annualDiscount) || 0;
        const amount = Math.max(pricing - discount, 0);
        
        if (amount <= 0) {
            throw new Error('Plan amount must be greater than 0');
        }
        
        // Plan name and description
        const planName = `${planDetails.name || 'Subscription'} - ${membershipType}`;
        const description = `${membershipType} subscription for ${planDetails.name || 'service'}`;

        console.log('Creating plan with details:', { 
            planName, 
            description, 
            period, 
            amount: amount * 100, 
            currency: 'USD' 
        });

        // Create a new plan directly - for simplicity and to avoid errors
        const plan = await razorpay.plans.create({
            period: period,
            interval: 1,
            item: {
                name: planName,
                description: description,
                amount: amount * 100, // Convert to cents
                currency: 'USD'
            }
        });
        
        console.log('Successfully created plan:', plan.id);
        return plan;
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        // Return a mock plan object for development/testing to avoid breaking the flow
        return {
            id: 'plan_temp_' + Date.now(),
            period: membershipType === 'monthly' ? 'monthly' : 'yearly',
            interval: 1,
            item: {
                name: `${planDetails?.name || 'Subscription'} - ${membershipType}`,
                amount: 1000, // $10 as a fallback
                currency: 'USD'
            }
        };
    }
};

// Helper function for creating recurring subscriptions
const createRecurringSubscription = async (req, res) => {
    try {
        const { 
            planDetails,
            ownerId,
            tenantId,
            planId,
            membershipType,
            userProfile
        } = req.body;

        console.log('Creating recurring subscription with params:', { 
            ownerId, 
            tenantId, 
            planId, 
            membershipType 
        });

        // Validate required parameters
        if (!ownerId || !membershipType) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required parameters for subscription creation'
            });
        }

        // 1. Create/Get customer
        let customerId;
        try {
            customerId = await createCustomer(userProfile, ownerId, tenantId);
            console.log('Customer ID obtained:', customerId);
        } catch (customerError) {
            console.error('Error creating customer:', customerError);
            customerId = `mock_customer_${Date.now()}`;
        }
        
        // 2. Get/Create plan
        let plan;
        try {
            plan = await getOrCreateSubscriptionPlan(planDetails, membershipType);
            console.log('Plan created/retrieved:', plan.id);
        } catch (planError) {
            console.error('Error creating/retrieving plan:', planError);
            // Create a mock plan
            plan = {
                id: `plan_mock_${Date.now()}`,
                item: {
                    name: `${membershipType} Plan`,
                    amount: 1000
                }
            };
        }
        
        // 3. Calculate pricing - ensure amount is in cents for Razorpay
        let pricing = parseInt(membershipType === 'monthly' ? planDetails?.monthlyPrice : planDetails?.annualPrice) || 1000;
        let discount = parseInt(membershipType === 'monthly' ? planDetails?.monthDiscount : planDetails?.annualDiscount) || 0;
        
        // Check if amount is already provided in the request
        let amount;
        if (req.body.amount) {
            // Assume amount from frontend is already in cents
            amount = Math.round(parseFloat(req.body.amount));
            console.log('Using provided amount (cents):', amount);
        } else {
            // Calculate based on plan details (convert to cents if needed)
            // If values appear to be in dollars (< 1000), multiply by 100
            if (pricing < 1000) pricing = pricing * 100;
            if (discount < 1000) discount = discount * 100;
            
            amount = Math.max(pricing - discount, 100); // Ensure minimum 100 cents ($1) amount
            console.log('Calculated amount in cents:', amount);
        }

        // 4. Create subscription - handle errors gracefully
        let subscription;
        try {
            console.log('Creating subscription with plan_id:', plan.id, 'customer_id:', customerId);
            subscription = await razorpay.subscriptions.create({
                plan_id: plan.id,
                customer_id: customerId,
                total_count: membershipType === 'monthly' ? 12 : 1, // 12 months if monthly, 1 year if annual
                quantity: 1,
                notes: {
                    ownerId,
                    tenantId: tenantId || '',
                    planId: planId || '',
                    membershipType
                }
            });
            console.log('Subscription created successfully:', subscription.id);
        } catch (subscriptionError) {
            console.error('Error creating subscription:', subscriptionError);
            
            // For testing and development, create a mock subscription response
            subscription = {
                id: `sub_mock_${Date.now()}`,
                status: 'created',
                short_url: '#'
            };
        }
        
        // 5. Record payment in our system
        let newPayment, invoice;
        try {
            // Generate a unique transaction ID to avoid duplicate key errors
            const transactionId = generateTransactionId();
            
            newPayment = new Payment({
                tenantId: tenantId || '',
                ownerId,
                planId: planId || '',
                amount: amount,
                currency: 'USD',
                status: 'pending',
                paymentMethod: 'card',
                razorpayCustomerId: customerId,
                isRecurring: true,
                subscriptionId: subscription.id,
                billingCycle: membershipType,
                transactionId, // Add the unique transaction ID
                metadata: { planDetails }
            });

            // 6. Create a pending invoice
            try {
                invoice = await createInvoice(
                    tenantId || '',
                    ownerId,
                    planId || '',
                    amount,
                    {
                        membershipType,
                        billingCycle: membershipType
                    },
                    'pending',
                    subscription.id
                );
                
                // Connect payment record to invoice
                if (invoice && invoice._id) {
                    newPayment.invoiceId = invoice._id;
                }
            } catch (invoiceError) {
                console.error('Error creating invoice:', invoiceError);
                // Continue without invoice
            }
            
            await newPayment.save();
        } catch (dbError) {
            console.error('Error saving payment/invoice records:', dbError);
            // Continue even if DB operations fail
        }

        console.log('Returning subscription data to frontend, amount (cents):', amount);
        return res.status(200).json({
            subscriptionId: subscription.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_TEST_KEY',
            amount: amount, // Already in cents from earlier calculation
            currency: 'USD',
            isSubscription: true,
            subscriptionStatus: subscription.status,
            authLink: subscription.short_url || '#', // URL for payment authorization
            isMockSubscription: subscription.id.startsWith('sub_mock_'), // Flag for test mode
            orderId: subscription.id // Using subscription ID as order ID for popup consistency
        });
    } catch (error) {
        console.error('Error creating recurring subscription:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error creating subscription',
            error: error.message
        });
    }
};

// Verify subscription payment after redirect from Razorpay
const verifySubscription = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
            ownerId,
            tenantId,
            planId,
            membershipType
        } = req.body;

        // Verify signature
        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_KEY')
            .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid signature'
            });
        }

        // Get subscription details from Razorpay
        const subscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);
        
        // Update payment record
        const payment = await Payment.findOneAndUpdate(
            { subscriptionId: razorpay_subscription_id },
            { 
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: 'captured'
            },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({
                status: 'error',
                message: 'Payment record not found'
            });
        }

        // Find the invoice
        const invoice = await Invoice.findById(payment.invoiceId);
        if (!invoice) {
            return res.status(404).json({
                status: 'error',
                message: 'Invoice not found'
            });
        }

        // Update invoice
        invoice.status = 'paid';
        invoice.amountPaid = payment.amount;
        
        // Calculate end date based on membership type
        const startDate = new Date();
        const endDate = calculateEndDate(startDate, membershipType);
        
        invoice.startDate = startDate;
        invoice.endDate = endDate;
        await invoice.save();
        
        // Create receipt
        const receipt = await createReceipt(
            tenantId,
            ownerId,
            invoice._id,
            payment.amount,
            razorpay_payment_id,
            { membershipType }
        );
        
        // Update customer subscription
        const existingSubscription = await CustomerSubscription.findOne({ 
            ownerId,
            subscriptionPlanId: planId
        });
        
        if (existingSubscription) {
            existingSubscription.selectedBillingCycle = membershipType;
            existingSubscription.startDate = startDate;
            existingSubscription.nextBillingDate = endDate;
            existingSubscription.status = 'active';
            existingSubscription.price = payment.amount;
            existingSubscription.receiptId = receipt._id;
            existingSubscription.invoiceId = invoice._id;
            await existingSubscription.save();
        } else {
            // Create new subscription record
            const newSubscription = new CustomerSubscription({
                tenantId,
                ownerId,
                subscriptionPlanId: planId,
                selectedBillingCycle: membershipType,
                startDate,
                nextBillingDate: endDate,
                status: 'active',
                price: payment.amount,
                discount: 0,
                totalAmount: payment.amount,
                receiptId: receipt._id,
                invoiceId: invoice._id
            });
            await newSubscription.save();
        }

        return res.status(200).json({
            status: 'success',
            message: 'Subscription verified successfully',
            subscriptionId: razorpay_subscription_id,
            paymentId: razorpay_payment_id
        });
    } catch (error) {
        console.error('Error verifying subscription:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error verifying subscription',
            error: error.message
        });
    }
};




module.exports = {
    createOrder,
    verifyPayment,
    createRecurringSubscription,
    verifySubscription,
    handleWebhook,
    handlePaymentEvent,
    handleSubscriptionEvent,
    handlePaymentFailed,
    handleSubscriptionHalted,
};
