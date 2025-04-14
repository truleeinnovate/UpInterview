const Invoicemodels = require('../models/Invoicemodels.js');
const Receipt = require('../models/Receiptmodels.js'); 
const CustomerSubscription = require('../models/CustomerSubscriptionmodels.js'); 


const  createInvoice = async (
  tenantId,
  ownerId,
  planId = null,
  totalAmount,
  userDetails = null,
  status,
  discount = 0,
  type = "subscription"
) => {
  // Ensure totalAmount is a valid number
  const numericTotalAmount = Number(totalAmount);
  const numericDiscount = Number(discount);

  if (isNaN(numericTotalAmount)) {
    throw new Error('Total amount must be a valid number');
  }

  const membershipType = userDetails?.membershipType || "Unknown Membership";
  const currentMonth = new Date().getMonth() + 1;


  // Validate status against enum values
  const validStatuses = ['pending', 'paid', 'partially_paid', 'failed', 'overdue'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status value');
  }

  // Calculate final amount
  const finalAmount = numericTotalAmount - (isNaN(numericDiscount) ? 0 : numericDiscount);

  // Validate type against enum values
  const validTypes = ['subscription', 'wallet', 'payout', 'custom'];
  if (!validTypes.includes(type)) {
    throw new Error('Invalid type value');
  }

  return await Invoicemodels.create({
    // invoiceId: invoiceId,
    tenantId: tenantId,
    ownerId: ownerId,
    subscriptionId: planId,
    type: type,
    totalAmount: finalAmount,
    status: status,
    dueDate: null,
    amountPaid : type === "wallet" ? totalAmount : 0,
    startDate: new Date(),
    endDate:  null,
    lineItems: [{
      description: membershipType ? `${membershipType} - Start Date: ${currentMonth}` : type,
      amount: finalAmount,
      quantity: 1,
      tax: 0
    }],
    createdAt: new Date(),
  });
};

  
  const createSubscriptionRecord = async (userDetails, planDetails, pricing, discount, totalAmount,invoiceId,receiptId) => {
    return await CustomerSubscription.create({
      tenantId: userDetails.tenantId,
      ownerId: userDetails.ownerId,
      subscriptionPlanId: planDetails.subscriptionPlanId,
      selectedBillingCycle: userDetails.membershipType,
      startDate: new Date(),
      status: 'inactive',
      price: totalAmount,
      discount: discount,
      endDate: null,
      totalAmount: pricing - parseFloat(discount),
      invoiceId: invoiceId,
      receiptId: receiptId || null ,
      subPlanStatus:false
    });
  };
  
  const createReceipt = async (tenantId,ownerId, invoiceId, totalPaid, transactionId, cardDetails) => {
   
    return await Receipt.create({
      tenantId: tenantId,
      ownerId: ownerId,
      invoiceId: invoiceId,
      amount: totalPaid,
      transactionId: transactionId,
      paymentDate: new Date(),
      paymentMethod: cardDetails.cardNumber.slice(-4) + "Card",
    });
  };



// const calculateNextBillingDate = (cycle) => {
//   const startDate = new Date();
//   if (cycle === 'monthly') startDate.setMonth(startDate.getMonth() + 1);
//   if (cycle === 'annual') startDate.setFullYear(startDate.getFullYear() + 1);
//   return startDate;
// };


const calculateEndDate = (cycle) => {
  const startDate = new Date();
  if (cycle === 'monthly') startDate.setMonth(startDate.getMonth() + 1);
  if (cycle === 'annual') startDate.setFullYear(startDate.getFullYear() + 1);
  return startDate;
};

  

  module.exports ={createInvoice,createSubscriptionRecord,createReceipt,calculateEndDate}