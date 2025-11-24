const Invoicemodels = require("../models/Invoicemodels.js");
const Receipt = require("../models/Receiptmodels.js");
const CustomerSubscription = require("../models/CustomerSubscriptionmodels.js");
const SubscriptionPlan = require("../models/Subscriptionmodels.js");
const Tenant = require("../models/Tenant");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService.js");

const createSubscriptionRecord = async (
  userDetails,
  planDetails,
  pricing,
  discount,
  totalAmount,
  invoiceId,
  status,
  receiptId
) => {
  const tenant = await Tenant.findOne({ ownerId: userDetails.ownerId });
  if (tenant) {
    tenant.status = status === "active" ? "active" : "payment_pending";
    await tenant.save();
  }

  let features = [];
  if (
    userDetails.userType === "individual" &&
    userDetails.membershipType === "monthly"
  ) {
    const planData = await SubscriptionPlan.findById(
      planDetails.subscriptionPlanId
    );

    if (planData && planData.features) {
      features = planData.features.map((feature) => ({
        name: feature.name,
        limit: feature.limit === "unlimited" ? -1 : Number(feature.limit) || 0,
        description: feature.description,
      }));
    }
  }

  // Calculate endDate and nextBillingDate for all plans including free plans
  const startDate = new Date();
  const endDate = calculateEndDate(userDetails.membershipType);
  const nextBillingDate = new Date(endDate); // Next billing date is same as end date

  return await CustomerSubscription.create({
    tenantId: userDetails.tenantId,
    ownerId: userDetails.ownerId,
    subscriptionPlanId: planDetails.subscriptionPlanId,
    selectedBillingCycle: userDetails.membershipType,
    startDate: startDate,
    status: status === "active" ? "active" : "created",
    price: totalAmount,
    discount: discount,
    endDate: status === "active" ? endDate : null, // Set endDate for active (including free) plans
    nextBillingDate: status === "active" ? nextBillingDate : null, // Set nextBillingDate for active plans
    totalAmount: pricing - parseFloat(discount),
    invoiceId: invoiceId,
    receiptId: receiptId || null,
    subPlanStatus: false,
    features:
      userDetails.userType === "individual" &&
      userDetails.membershipType === "monthly" &&
      userDetails.membershipType === "annual"
        ? features
        : [],
  });
};

const createInvoice = async (
  tenantId,
  ownerId,
  planName,
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
    throw new Error("Total amount must be a valid number");
  }

  const membershipType = userDetails?.membershipType || "Unknown Membership";
  const currentMonth = new Date().getMonth() + 1;

  // Validate status against enum values
  const validStatuses = [
    "active",
    "created",
    "pending",
    "paid",
    "partially_paid",
    "failed",
    "overdue",
  ];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  // Calculate final amount
  const finalAmount = numericTotalAmount; //- (isNaN(numericDiscount) ? 0 : numericDiscount);

  // Validate type against enum values
  const validTypes = ["subscription", "wallet", "payout", "custom"];
  if (!validTypes.includes(type)) {
    throw new Error("Invalid type value");
  }

  // For subscription invoices that are immediately paid (e.g., Free plan), compute endDate now
  const computedEndDate =
    type === "subscription" && status === "paid"
      ? calculateEndDate(membershipType === "annual" ? "annual" : "monthly")
      : null;

  // Generate unique invoice code using centralized utility
  const invoiceCode = await generateUniqueId(
    "INVC",
    Invoicemodels,
    "invoiceCode"
  );

  // // Generate custom Code like INVC-00001
  //     const lastInvoice = await Invoicemodels.findOne({ tenantId: tenantId })
  //       .sort({ _id: -1 })
  //       .select("invoiceCode")
  //       .lean();

  //     let nextNumber = 1;
  //     if (lastInvoice && lastInvoice?.invoiceCode) {
  //       const match = lastInvoice.invoiceCode.match(/INVC-(\d+)/);

  //       if (match) {
  //         nextNumber = parseInt(match[1], 10) + 1;
  //       }
  //     }

  //     const invoiceCode = `INVC-${String(nextNumber).padStart(5, '0')}`;

  return await Invoicemodels.create({
    // invoiceId: invoiceId,
    tenantId: tenantId,
    ownerId: ownerId,
    planName: planName,
    planId: planId,
    type: type,
    totalAmount: finalAmount,
    status: status,
    dueDate: null,
    amountPaid: type === "wallet" ? totalAmount : 0,
    startDate: new Date(),
    endDate: computedEndDate,
    lineItems: [
      {
        description: membershipType
          ? `${membershipType} - Start Date: ${currentMonth}`
          : type,
        amount: finalAmount,
        quantity: 1,
        tax: 0,
      },
    ],
    invoiceCode: invoiceCode,
    createdAt: new Date(),
  });
};

const createReceipt = async (
  tenantId,
  ownerId,
  invoiceId,
  totalPaid,
  transactionId,
  cardDetails
) => {
  const receiptCode = await generateUniqueId("RCP", Receipt, "receiptCode");

  return await Receipt.create({
    receiptCode: receiptCode,
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
  if (cycle === "monthly") startDate.setMonth(startDate.getMonth() + 1);
  if (cycle === "annual") startDate.setFullYear(startDate.getFullYear() + 1);
  return startDate;
};

module.exports = {
  createInvoice,
  createSubscriptionRecord,
  createReceipt,
  calculateEndDate,
};
