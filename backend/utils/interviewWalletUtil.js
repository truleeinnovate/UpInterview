// Common wallet transaction utilities for interview-related holds, refunds, and generic wallet movements
// v1.0.0 - Shared helper to keep wallet balance/holdAmount updates consistent

const mongoose = require("mongoose");
const WalletTopup = require("../models/WalletTopup");
const { Candidate } = require("../models/candidate");
const { Resume } = require("../models/Resume");
const { MockInterview } = require("../models/Mockinterview/mockinterview");
const {
  getTaxConfigForTenant,
  computeBaseGstGross,
  normalizePercentage,
} = require("./taxConfigUtil");
const moment = require("moment");

/**
 * High-level semantic transaction kinds used by business logic.
 * These are mapped internally onto the underlying WalletTopup transaction
 * `type` field (credit/debit/hold) and appropriate balance/holdAmount deltas.
 */
const WALLET_BUSINESS_TYPES = {
  HOLD_ADJUST: "HOLD_ADJUST",
  HOLD_CREATE: "HOLD_CREATE", // Move available balance -> hold
  HOLD_RELEASE: "HOLD_RELEASE", // Release hold back to available balance
  HOLD_DEBIT: "HOLD_DEBITED", // Convert part/all of hold into a debit (payout/charge)
  REFUND: "REFUND", // Credit back to wallet balance (no hold change)
  TOPUP_CREDIT: "TOPUP_CREDITED", // Generic credit/topup
  SUBSCRIBE_CREDITED: "SUBSCRIBE_CREDITED", // Subscription plan credits
  GENERIC_DEBIT: "GENERIC_DEBITED", // Generic debit from available balance
  HOLD_NOTE: "HOLD_NOTE", // Ledger-only hold record (no balance/hold change)
  INTERVIEWER_HOLD_CREATE: "INTERVIEWER_HOLD_CREATE", // Pending payout hold in interviewer wallet (no balance change, holdAmount increases)
};

/**
 * Normalize number (avoid NaN) and round to 2 decimals.
 */
function normalizeAmount(value) {
  const num = Number(value || 0);
  if (!isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
}

/**
 * Compute how balance and holdAmount should change for a given businessType.
 *
 * NOTE:
 * - `WalletTopup` schema only allows `type` = credit | debit | hold.
 * - We keep the more granular semantic intent in `metadata.businessType`.
 */
function computeWalletDeltas(businessType, amount) {
  const amt = normalizeAmount(amount);

  switch (businessType) {
    case WALLET_BUSINESS_TYPES.HOLD_CREATE:
      // Move available balance into hold
      return {
        txType: "hold",
        balanceDelta: -amt,
        holdDelta: amt,
      };

    case WALLET_BUSINESS_TYPES.HOLD_RELEASE:
      // Release hold back to available balance
      return {
        txType: "hold_release",
        balanceDelta: amt,
        holdDelta: -amt,
      };

    case WALLET_BUSINESS_TYPES.HOLD_DEBIT:
      // Use held funds for a payment; reduce hold, no balance change
      // (The original debit was already accounted when HOLD_CREATE happened.)
      return {
        txType: "debited",
        balanceDelta: 0,
        holdDelta: -amt,
      };

    case WALLET_BUSINESS_TYPES.REFUND:
      // Pure refund back to wallet (no hold change)
      return {
        txType: "credited",
        balanceDelta: amt,
        holdDelta: 0,
      };

    case WALLET_BUSINESS_TYPES.TOPUP_CREDIT:
      // Generic top-up credit
      return {
        txType: "credited",
        balanceDelta: amt,
        holdDelta: 0,
      };

    case WALLET_BUSINESS_TYPES.SUBSCRIBE_CREDITED:
      // Subscription plan credits
      return {
        txType: "credited",
        balanceDelta: amt,
        holdDelta: 0,
      };

    case WALLET_BUSINESS_TYPES.GENERIC_DEBIT:
      // Generic debit from available balance (no hold involvement)
      return {
        txType: "debited",
        balanceDelta: -amt,
        holdDelta: 0,
      };

    case WALLET_BUSINESS_TYPES.HOLD_NOTE:
      // Record a hold entry for audit/UI without changing wallet totals
      return {
        txType: "hold",
        balanceDelta: 0,
        holdDelta: 0,
      };

    case WALLET_BUSINESS_TYPES.HOLD_ADJUST:
      // For interviewer wallets: represent a pending payout as "on hold".
      // We do not change balance yet, only increase holdAmount so the wallet
      // UI can show this as money on hold for future settlement.
      return {
        txType: "hold_adjust",
        balanceDelta: 0,
        holdDelta: amt,
      };

    default:
      throw new Error(`Unsupported wallet businessType: ${businessType}`);
  }
}

/**
 * Create a single wallet transaction and atomically update balance/holdAmount.
 *
 * This helper is intentionally generic so it can be reused from interview
 * controllers (hold creation at scheduling, hold release/refund at settlement,
 * etc.) and from any other flows that need consistent wallet semantics.
 *
 * @param {Object} params
 * @param {String} params.ownerId - Wallet owner ID (organization or user)
 * @param {String} params.businessType - One of WALLET_BUSINESS_TYPES
 * @param {Number} params.amount - Positive amount in INR
 * @param {String} [params.description]
 * @param {String} [params.relatedInvoiceId]
 * @param {Object} [params.metadata] - Extra metadata (roundId, interviewId, etc.)
 * @param {mongoose.ClientSession} [params.session] - Optional session for callers that run their own transactions
 *
 * @returns {Promise<{ wallet: any, transaction: any }>} Updated wallet and created transaction
 */
async function createWalletTransaction({
  ownerId,
  businessType,
  amount,
  description,
  relatedInvoiceId,
  metadata = {},
  status = "pending",
  session = null,
  gstAmount = 0,
  serviceCharge = 0,
  reason = undefined,
  // interviewId = undefined,
  // roundId = undefined,
  // interviewerId = undefined,
  // companyId = undefined,
  // policyApplied = undefined,
  // notes = undefined,
}) {
  if (!ownerId) {
    throw new Error("ownerId is required to create a wallet transaction");
  }

  const normalizedAmount = normalizeAmount(amount); // base amount
  const normalizedGstAmount = normalizeAmount(gstAmount);
  const normalizedServiceCharge = normalizeAmount(serviceCharge);
  const totalAmountValue =
    normalizedAmount + normalizedGstAmount + normalizedServiceCharge;

  if (totalAmountValue <= 0) {
    throw new Error("amount must be a positive number");
  }

  const { txType, balanceDelta, holdDelta } = computeWalletDeltas(
    businessType,
    totalAmountValue
  );

  // Fetch current wallet state (outside of update so we can store prev values in metadata)
  const walletQuery = WalletTopup.findOne({ ownerId });
  if (session) {
    walletQuery.session(session);
  }
  const wallet = await walletQuery;

  if (!wallet) {
    throw new Error("Wallet not found for ownerId " + ownerId);
  }

  const prevBalance = Number(wallet.balance || 0);
  const prevHoldAmount = Number(wallet.holdAmount || 0);

  const newBalance = prevBalance + balanceDelta;
  const newHoldAmount = prevHoldAmount + holdDelta;

  // Prepare metadata (keep caller-provided fields only; audit is implicit
  // from balanceBefore/After and holdBalanceBefore/After fields below).
  const txMetadata = {
    ...metadata,
  };

  // Derive bucket/effect for the primary impacted bucket.
  // NOTE: We still keep `type` limited to credit/debit/hold.
  let bucket = undefined;
  if (holdDelta !== 0) {
    bucket = "HOLD";
  } else if (balanceDelta !== 0) {
    bucket = "AVAILABLE";
  }

  let effect = "NONE";
  if (txType === "credited" || txType === "hold_release" || txType === "hold_adjust") {
    effect = "CREDITED";
  } else if (txType === "debited" || txType === "hold" || txType === "") {
    effect = "DEBITED";
  }

  const transaction = {
    type: txType,
    bucket,
    effect,
    // Wallet-level identifiers
    walletId: ownerId,
    // interviewId: txInterviewId,
    // roundId: txRoundId,
    // Ensure every transaction has a clear reason; prefer explicit reason,
    // then metadata.source.
    reason: reason || metadata.source,
    // Financial breakdown
    amount: normalizedAmount,
    gstAmount: normalizedGstAmount,
    serviceCharge: normalizedServiceCharge,
    totalAmount: totalAmountValue,
    description: description || "",
    relatedInvoiceId: relatedInvoiceId || undefined,
    status: status || "pending", // callers can override/mark completed later if needed
    metadata: txMetadata,
    balanceBefore: prevBalance,
    balanceAfter: newBalance,
    holdBalanceBefore: prevHoldAmount,
    holdBalanceAfter: newHoldAmount,
    createdDate: new Date(),
    createdAt: new Date(),
  };

  const update = {
    $inc: {
      balance: balanceDelta,
      holdAmount: holdDelta,
    },
    $push: {
      transactions: transaction,
    },
  };

  const updateOptions = {
    new: true,
    runValidators: true,
  };

  if (session) {
    updateOptions.session = session;
  }

  const updatedWallet = await WalletTopup.findOneAndUpdate(
    { ownerId },
    update,
    updateOptions
  );

  if (!updatedWallet) {
    throw new Error("Failed to update wallet for ownerId " + ownerId);
  }

  const savedTransaction =
    updatedWallet.transactions[updatedWallet.transactions.length - 1];

  return {
    wallet: updatedWallet,
    transaction: savedTransaction,
  };
}

// Compute interviewer pricing (experience level, rate, total amount, discount)
// for an interview request acceptance. On success returns:
//   { durationInMinutes, experienceLevel, rate, totalAmount, appliedDiscountPercentage }
// On validation failure returns:
//   { error, statusCode } (no direct HTTP response handling).
async function computeInterviewPricingForAccept({
  request,
  round,
  contact,
  contactId,
}) {
  const duration = request.duration;
  const durationInMinutes = parseInt(duration?.split(" ")[0], 10);
  if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
    return {
      error:
        'Invalid duration in interview request. Expected format like "30 minutes".',
      statusCode: 400,
    };
  }

  let rate;
  let experienceLevel;

  if (request.isMockInterview) {
    let mockInterview = null;
    try {
      mockInterview = await MockInterview.findById(round.mockInterviewId);
      if (!mockInterview) {
        // Preserve existing behavior: no early return; validation below will handle.
      }
    } catch (error) {
      console.error("Invalid MockInterview ID:", error.message);
    }

    const expertiseYears = Number(mockInterview.currentExperience);
    if (isNaN(expertiseYears) || expertiseYears < 0) {
      return {
        error:
          `Invalid or missing expertiseLevel for interviewer (${mockInterview}). Must be a non-negative number.`,
        statusCode: 400,
      };
    }
    if (expertiseYears <= 3) {
      experienceLevel = "junior";
    } else if (expertiseYears <= 6) {
      experienceLevel = "mid";
    } else {
      experienceLevel = "senior";
    }

    rate = contact.rates?.[experienceLevel]?.inr;
    if (typeof rate !== "number" || rate <= 0) {
      return {
        error: `Invalid or missing INR rate for ${experienceLevel} level in contact (${contactId}).`,
        statusCode: 400,
      };
    }
  } else {
    const candidate = await Candidate.findById(request.candidateId);
    if (!candidate) {
      return {
        error: "Candidate not found",
        statusCode: 404,
      };
    }

    // Fetch active resume to get CurrentExperience (moved from Candidate to Resume)
    const activeResume = await Resume.findOne({
      candidateId: request.candidateId,
      isActive: true
    });

    // Try Resume first, fallback to legacy Candidate field
    const experienceYears = Number(
      activeResume?.CurrentExperience
    );
    if (isNaN(experienceYears) || experienceYears < 0) {
      return {
        error: `Invalid or missing CurrentExperience for candidate (${request.candidateId}).`,
        statusCode: 400,
      };
    }
    if (experienceYears <= 3) {
      experienceLevel = "junior";
    } else if (experienceYears <= 6) {
      experienceLevel = "mid";
    } else {
      experienceLevel = "senior";
    }

    rate = contact.rates?.[experienceLevel]?.inr;
    if (typeof rate !== "number" || rate <= 0) {
      return {
        error: `Invalid or missing INR rate for ${experienceLevel} level in contact (${contactId}).`,
        statusCode: 400,
      };
    }
  }

  let totalAmount = (rate * durationInMinutes) / 60;
  if (isNaN(totalAmount) || totalAmount <= 0) {
    return {
      error:
        "Failed to calculate interview fee. Please check rate and duration.",
      statusCode: 400,
    };
  }

  let appliedDiscountPercentage = 0;
  let discountAmount = 0;
  if (request.isMockInterview && contact.mock_interview_discount) {
    appliedDiscountPercentage =
      parseFloat(contact.mock_interview_discount) || 0;
    if (appliedDiscountPercentage > 0 && appliedDiscountPercentage <= 100) {
      discountAmount = (totalAmount * appliedDiscountPercentage) / 100;
      totalAmount -= discountAmount;
    }
  }

  return {
    durationInMinutes,
    experienceLevel,
    rate,
    totalAmount,
    appliedDiscountPercentage,
    discountAmount,
    originalAmount: totalAmount + discountAmount,
  };
}

// Apply a selection-time wallet hold for outsourced (external) interviewers.
// This checks organization wallet, GST config, available balance and, if valid,
// creates a HOLD_CREATE transaction for the max hourly rate (no duration multiplier).
async function applySelectionTimeWalletHoldForOutsourcedRound({
  req,
  res,
  interview,
  round,
  savedRound,
}) {
  const isExternalRound =
    round?.interviewerType === "External" &&
    savedRound.roundTitle !== "Assessment" &&
    savedRound.interviewMode !== "Face to Face";

  const selectedInterviewersPayload = Array.isArray(
    req.body?.round?.selectedInterviewers
  )
    ? req.body.round.selectedInterviewers
    : [];

  const maxHourlyRateFromFrontend = Number(round?.maxHourlyRate || 0);

  if (
    !(
      isExternalRound &&
      selectedInterviewersPayload.length > 0 &&
      maxHourlyRateFromFrontend > 0
    )
  ) {
    // Conditions not met; nothing to do.
    return null;
  }

  try {
    const orgWallet = await WalletTopup.findOne({ ownerId: interview.ownerId });
    if (!orgWallet) {
      return res.status(400).json({
        status: "error",
        message:
          "No wallet found for this organization. Please set up a wallet before scheduling outsourced interviews.",
      });
    }

    // Derive GST rate from shared tax config helper using the wallet's tenant
    const orgTenantId = orgWallet.tenantId || interview?.tenantId || "";
    const { gstRate } = await getTaxConfigForTenant({ tenantId: orgTenantId });

    // Compute selection-time gross amount = base + GST using shared helper
    const {
      baseAmount: selectionBaseAmount,
      gstAmount: selectionGstAmount,
      grossAmount: selectionGrossAmount,
    } = computeBaseGstGross(maxHourlyRateFromFrontend, gstRate);

    const walletBalance = Number(orgWallet.balance || 0);
    const availableBalance = walletBalance;

    if (availableBalance < selectionGrossAmount) {
      const requiredTopupAmount = Math.max(
        0,
        Math.round((selectionGrossAmount - availableBalance) * 100) / 100
      );

      return res.status(400).json({
        status: "error",
        message:
          "Insufficient available wallet balance to send outsourced interview requests. Please add funds to your wallet.",
        requiredTopupAmount,
        requiredHoldAmount: selectionGrossAmount,
        availableBalance,
      });
    }

    // Create a selection-time HOLD for the highest hourly rate among all outsourced interviewers.
    await createWalletTransaction({
      ownerId: interview.ownerId,
      businessType: WALLET_BUSINESS_TYPES.HOLD_CREATE,
      amount: selectionBaseAmount,
      gstAmount: selectionGstAmount,
      description: `Selection-time hold for outsourced interview round ${savedRound.roundTitle}`,
      reason: "OUTSOURCED_INTERVIEW_SELECTION_HOLD",
      relatedInvoiceId: savedRound._id.toString(),
      metadata: {
        interviewId: String(interview._id),
        roundId: String(savedRound._id),
        source: "selection_hold",
        // selectionGstRate: gstRate,
        // selectionGstAmount: selectionGstAmount,
      },
    });

    return null;
  } catch (walletError) {
    console.error(
      "[INTERVIEW] Error applying selection-time wallet hold:",
      walletError
    );
    return res.status(400).json({
      status: "error",
      message:
        walletError.message ||
        "Failed to apply wallet hold for outsourced interview selection.",
    });
  }
}

// Apply all wallet operations for accepting an interview request.
// This encapsulates:
// - locating any existing selection-time HOLD for the round
// - validating available balance (including that selection hold)
// - releasing unused selection hold back to the org wallet
// - creating the final HOLD_NOTE (or legacy HOLD_CREATE when no selection hold exists)
//
// It is intentionally HTTP-agnostic: on success it returns
//   { wallet, transaction }
// and on failure it returns
//   { error, statusCode }  (no direct res.json calls).
async function applyAcceptInterviewWalletFlow({
  request,
  round,
  roundId,
  requestId,
  contact,
  totalAmount,
  appliedDiscountPercentage = 0,
  discountAmount = 0,
  originalAmount = 0,
}) {
  // Fetch wallet and derive available balance, taking existing holds into account
  const wallet = await WalletTopup.findOne({ ownerId: request.ownerId });
  if (!wallet) {
    return {
      error: "No wallet found for this organization.",
      statusCode: 400,
    };
  }

  const walletBalance = Number(wallet.balance || 0);

  // With the shared wallet helper, `balance` already reflects available funds
  // after all previous holds. We keep the pre-check simple and only look at
  // this round's selection-time hold (if any) plus the current balance.
  const availableBalanceBefore = walletBalance;

  // Try to locate an existing selection-time HOLD for this round (created at round save)
  let selectionHoldTx = null;
  if (Array.isArray(wallet.transactions) && wallet.transactions.length > 0) {
    selectionHoldTx = wallet.transactions
      .slice()
      .reverse()
      .find((t) => {
        if (!t || !t.type || !t.status) return false;
        const txType = String(t.type).toLowerCase();
        const txStatus = String(t.status).toLowerCase();
        const meta = t.metadata || {};
        return (
          txType === "hold" &&
          txStatus === "pending" &&
          String(meta.roundId || "") === String(roundId) &&
          meta.source === "selection_hold"
        );
      });
  }

  // Work with the GROSS amount that was actually held at selection time
  // (base + GST), using the transaction's totalAmount field.
  const selectionHoldGrossAmount = selectionHoldTx
    ? Number(selectionHoldTx.totalAmount || 0)
    : 0;

  // Determine GST rate for acceptance using the current tenant tax config.
  // This keeps acceptance logic aligned with how selection-time holds are
  // calculated (both use getTaxConfigForTenant) as long as the config
  // doesn't change between selection and acceptance.
  const orgTenantId = request.tenantId || "";
  const { gstRate: acceptGstRate } = await getTaxConfigForTenant({
    tenantId: orgTenantId,
  });

  // Compute gross amount for this accepted interviewer: base + GST using shared helper
  const {
    baseAmount: acceptBaseAmount,
    gstAmount: acceptGstAmount,
    grossAmount: acceptGrossAmount,
  } = computeBaseGstGross(totalAmount, acceptGstRate);

  const effectiveAvailable = availableBalanceBefore + selectionHoldGrossAmount;

  if (effectiveAvailable < acceptGrossAmount) {
    return {
      error:
        "Insufficient available balance in wallet to accept this interview request.",
      statusCode: 400,
    };
  }

  const holdID =
    request?.interviewRequestCode || String(requestId).slice(-10);

  // Description reused for both final hold record and fallback hold create
  const holdDescription = `Hold for ${request.isMockInterview ? "mock " : ""
    }interview round ${round?.roundTitle}`;

  let updatedWallet = wallet;
  let savedTransaction = null;

  if (selectionHoldTx && selectionHoldGrossAmount > 0) {
    // Simple adjustment logic (GROSS amounts):
    // - selectionHoldAmount was reserved at selection time (e.g. 4000 + GST)
    // - acceptGrossAmount is final interviewer amount (e.g. 1500 + GST)
    // - we release only the difference back to org wallet and leave the
    //   remaining gross amount effectively held for this round.
    const releaseGrossAmount = Math.max(
      selectionHoldGrossAmount - acceptGrossAmount,
      0
    );

    if (releaseGrossAmount > 0) {
      // Split the GROSS release amount into base + GST using the same
      // acceptance GST rate so that reporting fields (amount, gstAmount,
      // totalAmount) remain consistent.
      let releaseBaseAmount = releaseGrossAmount;
      let releaseGstAmount = 0;

      if (acceptGstRate && acceptGstRate > 0) {
        const rateFactor = 1 + acceptGstRate / 100;
        releaseBaseAmount = Math.round(
          (releaseGrossAmount / rateFactor) * 100
        ) / 100;
        releaseGstAmount = Math.round(
          (releaseGrossAmount - releaseBaseAmount) * 100
        ) / 100;
      }

      const releaseResult = await createWalletTransaction({
        ownerId: request.ownerId,
        businessType: WALLET_BUSINESS_TYPES.HOLD_RELEASE,
        amount: releaseBaseAmount,
        gstAmount: releaseGstAmount,
        description: `Refund unused selection-time hold for interview round ${round?.roundTitle}`,
        relatedInvoiceId: selectionHoldTx.relatedInvoiceId || holdID,
        status: "completed",
        reason: request.isMockInterview
          ? "MOCK_INTERVIEW_ACCEPTED_REFUND"
          : "INTERVIEW_ACCEPTED_REFUND",
        metadata: {
          interviewId: String(
            request.isMockInterview
              ? round?.mockInterviewId
              : round?.interviewId || ""
          ),
          roundId: String(roundId),
          requestId: String(requestId),
          source: "selection_hold_refund_on_accept",
        },
      });

      updatedWallet = releaseResult.wallet;
    }

    // Create a non-mutating hold record for the final interviewer amount so
    // that transaction history clearly shows the final gross hold
    // (e.g. 1500 + GST) without double-counting holdAmount.
    // without double-counting holdAmount.
    const noteResult = await createWalletTransaction({
      ownerId: request.ownerId,
      businessType: WALLET_BUSINESS_TYPES.HOLD_NOTE,
      amount: acceptBaseAmount,
      gstAmount: acceptGstAmount,
      description: holdDescription,
      relatedInvoiceId: holdID,
      reason: request.isMockInterview
        ? "MOCK_INTERVIEW_ROUND_ACCEPTED_HOLD"
        : "INTERVIEW_ROUND_ACCEPTED_HOLD",
      metadata: {
        interviewId: String(
          request.isMockInterview
            ? round?.mockInterviewId
            : round?.interviewId || ""
        ),
        roundId: String(roundId),
        requestId: String(requestId),
        interviewerContactId: String(contact._id),
        isMockInterview: Boolean(request.isMockInterview),
        mockDiscountPercentage: appliedDiscountPercentage || 0,
        mockDiscountAmount: discountAmount || 0,
        originalAmountBeforeDiscount: originalAmount || 0,
        source: "interview_accept_hold",
      },
    });

    updatedWallet = noteResult.wallet;
    savedTransaction = noteResult.transaction;

    try {
      await WalletTopup.updateOne(
        { ownerId: request.ownerId, "transactions._id": selectionHoldTx._id },
        { $set: { "transactions.$.status": "completed" } }
      );
    } catch (statusUpdateErr) {
      console.error(
        "[acceptInterviewRequest] Failed to update selection hold status:",
        statusUpdateErr
      );
    }
  } else {
    // Fallback for legacy cases where no selection-time hold was created:
    // create a real HOLD for the full interviewer gross amount (base + GST).

    // Use shared tax config helper for GST
    const orgTenantId = request.tenantId || "";
    const { gstRate: legacyGstRate } = await getTaxConfigForTenant({
      tenantId: orgTenantId,
    });

    const {
      baseAmount: legacyBaseAmount,
      gstAmount: legacyGstAmount,
      grossAmount: legacyGrossAmount,
    } = computeBaseGstGross(totalAmount, legacyGstRate);

    const holdResult = await createWalletTransaction({
      ownerId: request.ownerId,
      businessType: WALLET_BUSINESS_TYPES.HOLD_CREATE,
      amount: legacyBaseAmount,
      gstAmount: legacyGstAmount,
      description: holdDescription,
      relatedInvoiceId: holdID,
      reason: request.isMockInterview
        ? "MOCK_INTERVIEW_ACCEPTED"
        : "INTERVIEW_ACCEPTED",
      metadata: {
        interviewId: String(
          request.isMockInterview
            ? round?.mockInterviewId
            : round?.interviewId || ""
        ),
        roundId: String(roundId),
        requestId: String(requestId),
        interviewerContactId: String(contact._id),
        isMockInterview: Boolean(request.isMockInterview),
        mockDiscountPercentage: appliedDiscountPercentage || 0,
        mockDiscountAmount: discountAmount || 0,
        originalAmountBeforeDiscount: originalAmount || 0,
        source: "interview_accept_hold",
      },
    });

    updatedWallet = holdResult.wallet;
    savedTransaction = holdResult.transaction;
  }

  return {
    wallet: updatedWallet,
    transaction: savedTransaction,
  };
}

/**
 * Process automatic settlement when interview round status changes to Completed or Cancelled.
 *
 * This function is called from updateInterviewRoundStatus in interviewRoundsController.js
 * when the action is "Completed" or "Cancelled".
 *
 * Settlement logic:
 * - For "Completed": Interviewer gets 100% payout (minus service charge)
 * - For "Cancelled": Uses InterviewPolicy to determine payout percentage based on timing
 *
 * Wallet operations:
 * - GST is taken from organization wallet
 * - Service charge is deducted from interviewer's payout
 * - Platform wallet (isCompany: true) receives service charge + GST
 * - Interviewer wallet receives net settlement amount
 * - A payout invoice is created for the interviewer
 *
 * @param {Object} params
 * @param {String} params.roundId - Interview round ID
 * @param {String} params.action - "Completed" or "Cancelled"
 * @param {String} params.reasonCode - Reason code for settlement
 * @returns {Promise<Object|null>} Settlement result or null if no settlement needed
 */
async function processAutoSettlement({ roundId, action, reasonCode }) {
  // These requires are placed here to avoid circular dependencies
  const InterviewRequest = require("../models/InterviewRequest");
  const { InterviewRounds } = require("../models/Interview/InterviewRounds");
  const { Interview } = require("../models/Interview/Interview");
  const { Position } = require("../models/Position/position");
  const Invoicemodels = require("../models/Invoicemodels");
  const { generateUniqueId } = require("../services/uniqueIdGeneratorService");
  const { findPolicyForSettlement } = require("./roundPolicyUtil");

  if (!roundId || !action) {
    console.log("[processAutoSettlement] Missing roundId or action");
    return null;
  }

  // Only process for Completed, Cancelled, or Rescheduled actions
  if (action !== "Completed" && action !== "Cancelled" && action !== "Rescheduled") {
    console.log("[processAutoSettlement] Skipping - action not Completed, Cancelled, or Rescheduled");
    return null;
  }

  try {
    // 1. Find the accepted InterviewRequest for this round
    const acceptedRequest = await InterviewRequest.findOne({
      roundId: roundId,
      status: "accepted",
    }).lean();

    if (!acceptedRequest) {
      console.log("[processAutoSettlement] No accepted interview request found for round:", roundId);
      return null;
    }

    // Skip if it's an internal interviewer (no wallet settlement needed)
    if (acceptedRequest.interviewerType === "Internal") {
      console.log("[processAutoSettlement] Skipping internal interviewer - no wallet settlement needed");
      return null;
    }

    const interviewerContactId = acceptedRequest.interviewerId?.toString();
    if (!interviewerContactId) {
      console.log("[processAutoSettlement] No interviewer ID found in accepted request");
      return null;
    }

    // Lookup the Contact to get the ownerId (wallet is linked to ownerId, not contact _id)
    const { Contacts } = require("../models/Contacts");
    const contactDoc = await Contacts.findById(interviewerContactId).lean();
    if (!contactDoc) {
      console.log("[processAutoSettlement] Contact not found for interviewerId:", interviewerContactId);
      return null;
    }

    const interviewerOwnerId = contactDoc.ownerId?.toString();
    const interviewertenantId = contactDoc.tenantId?.toString();
    if (!interviewerOwnerId) {
      console.log("[processAutoSettlement] Contact has no ownerId:", interviewerContactId);
      return null;
    }

    // 2. Load the interview round
    const isMock = Boolean(acceptedRequest.isMockInterview);

    let roundDoc = null;
    let interview = null;
    let positionTitle = "Position";
    let companyName = "Organization";

    if (isMock) {
      const { MockInterviewRound } = require("../models/Mockinterview/mockinterviewRound");
      const { MockInterview } = require("../models/Mockinterview/mockinterview");

      roundDoc = await MockInterviewRound.findById(roundId).lean();
      if (!roundDoc) {
        console.log("[processAutoSettlement] Mock Interview round not found:", roundId);
        return null;
      }

      interview = await MockInterview.findById(roundDoc.mockInterviewId).lean();
      // Mock interviews might not have Position/Company concept same as Interviews
      // Use defaults or derive from MockInterview data if available
      // Usually Mock interviews are B2C (candidate pays), but if organization is involved:
      positionTitle = "Mock Interview";
      companyName = "Mock Interview"; // Or fetch tenant name if needed

    } else {
      const roundDocFetch = await InterviewRounds.findById(roundId).lean();
      roundDoc = roundDocFetch;

      if (!roundDoc) {
        console.log("[processAutoSettlement] Interview round not found:", roundId);
        return null;
      }

      interview = await Interview.findById(roundDoc.interviewId).lean();

      // Get position details
      if (interview && interview.positionId) {
        const position = await Position.findById(interview.positionId).lean();
        if (position) {
          positionTitle = position.title || "Position";
          companyName = position.companyname || "Organization";
        }
      }
    }

    if (!interview) {
      console.log("[processAutoSettlement] Interview/MockInterview not found for round:", roundId);
      return null;
    }


    // Get round title
    const roundTitle = roundDoc.roundTitle || "Interview Round";

    // 4. Find the organization wallet with HOLD transaction for this round
    const orgWallet = await WalletTopup.findOne({
      "transactions.metadata.roundId": roundId,
    });

    if (!orgWallet) {
      console.log("[processAutoSettlement] Organization wallet with round transactions not found:", roundId);
      return null;
    }

    // 5. Find the active hold transaction
    const activeHoldTransaction = orgWallet.transactions
      .filter(
        (t) =>
          t.metadata &&
          t.metadata.roundId === roundId &&
          t.type === "hold" &&
          t.status !== "completed"
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (!activeHoldTransaction) {
      console.log("[processAutoSettlement] No active hold transaction found for round:", roundId);
      return null;
    }

    const baseAmount = Number(activeHoldTransaction.amount || 0);
    const transactionId = activeHoldTransaction._id.toString();

    // Extract mock discount info from the hold transaction metadata
    const holdMeta = activeHoldTransaction.metadata || {};
    const isMockInterview = Boolean(holdMeta.isMockInterview || acceptedRequest.isMockInterview);
    const mockDiscountPercentage = Number(holdMeta.mockDiscountPercentage || 0);
    const mockDiscountAmount = Number(holdMeta.mockDiscountAmount || 0);
    const originalAmountBeforeDiscount = Number(holdMeta.originalAmountBeforeDiscount || 0);

    // 6. Determine pay percentage based on action
    let payPercent = 0;
    let settlementScenario = "unknown_status";
    let appliedPolicyName = null;

    if (action === "Completed") {
      payPercent = 100;
      settlementScenario = "completed";
      appliedPolicyName = "completed";
      console.log(`[processAutoSettlement] Action Completed. Logic: PayPercent=${payPercent}, Base=${baseAmount}`);
    } else if (action === "Cancelled") {
      // Calculate hours before interview
      // Calculate hours before interview
      let scheduledTime = null;
      const moment = require("moment"); // Ensure moment is available

      if (roundDoc.dateTime) {
        try {
          // Handle if dateTime is already a Date object
          if (roundDoc.dateTime instanceof Date) {
            scheduledTime = roundDoc.dateTime;
          }
          // Handle if dateTime is a string
          else if (typeof roundDoc.dateTime === "string") {
            // Try parsing with moment using flexible formats
            // Common formats: "DD-MM-YYYY hh:mm A", ISO strings, etc.
            const dateTimeStr = roundDoc.dateTime.split(" - ")[0].trim();
            const m = moment(dateTimeStr, [
              "DD-MM-YYYY hh:mm A",
              "DD-MM-YYYY h:mm A",
              "MM-DD-YYYY hh:mm A", // Added to match Controller
              "YYYY-MM-DD hh:mm A",
              "YYYY-MM-DD h:mm A",
              "YYYY-MM-DD HH:mm",   // Added to match Controller
              "DD/MM/YYYY hh:mm A",
              "DD/MM/YYYY h:mm A",
              "MM/DD/YYYY hh:mm A",
              "MM/DD/YYYY h:mm A",
              "MMM DD, YYYY hh:mm A", // Added to match Controller
              moment.ISO_8601
            ]);

            if (m.isValid()) {
              scheduledTime = m.toDate();
            } else {
              // Last attempt: try lax parsing
              const mLax = moment(dateTimeStr);
              if (mLax.isValid()) scheduledTime = mLax.toDate();
              else console.warn("[processAutoSettlement] Moment failed to parse dateTime:", roundDoc.dateTime);
            }
          }
        } catch (e) {
          console.warn("[processAutoSettlement] Error parsing dateTime:", e);
        }
      }

      const actionTime = new Date();

      let hoursBefore = null;
      if (scheduledTime && !isNaN(scheduledTime.getTime())) {
        hoursBefore = (scheduledTime.getTime() - actionTime.getTime()) / (1000 * 60 * 60);
        // If scheduled time is in the past (e.g. no-show reported late), treat as 0 hours before
        if (hoursBefore < 0) hoursBefore = 0;
      }

      console.log(`[processAutoSettlement] Time calc: Scheduled=${scheduledTime}, Now=${actionTime}, HoursBefore=${hoursBefore}`);


      const isMockInterview = Boolean(acceptedRequest.isMockInterview);

      const policy = await findPolicyForSettlement(isMockInterview, "Cancelled", hoursBefore);
      let appliedPolicyId = null;
      if (policy) {
        payPercent = typeof policy.interviewerPayoutPercentage === "number"
          ? policy.interviewerPayoutPercentage
          : 0;
        settlementScenario = policy.policyName || "cancelled_policy_applied";
        appliedPolicyId = policy._id?.toString() || null;
        appliedPolicyName = policy.policyName || "cancelled_policy";
      } else {
        payPercent = 0;
        settlementScenario = "no_policy_found";
        appliedPolicyName = "no_policy_found";
      }
    } else if (action === "Rescheduled") {
      const moment = require("moment");
      // Calculate hours before interview for reschedule policy
      let scheduledTime = null;
      if (roundDoc.dateTime) {
        try {
          if (roundDoc.dateTime instanceof Date) {
            scheduledTime = roundDoc.dateTime;
          } else if (typeof roundDoc.dateTime === "string") {
            const dateTimeStr = roundDoc.dateTime.split(" - ")[0].trim();
            const m = moment(dateTimeStr, [
              "DD-MM-YYYY hh:mm A", "DD-MM-YYYY h:mm A",
              "MM-DD-YYYY hh:mm A", // Added to match Controller
              "YYYY-MM-DD hh:mm A", "YYYY-MM-DD h:mm A",
              "YYYY-MM-DD HH:mm",   // Added to match Controller
              "DD/MM/YYYY hh:mm A", "DD/MM/YYYY h:mm A",
              "MMM DD, YYYY hh:mm A", // Added to match Controller
              moment.ISO_8601
            ]);
            if (m.isValid()) scheduledTime = m.toDate();
            else {
              const mLax = moment(dateTimeStr);
              if (mLax.isValid()) scheduledTime = mLax.toDate();
            }
          }
        } catch (e) {
          console.warn("Error parsing reschedule date", e);
        }
      }
      const actionTime = new Date();

      let hoursBefore = null;
      if (scheduledTime && !isNaN(scheduledTime.getTime())) {
        hoursBefore = (scheduledTime.getTime() - actionTime.getTime()) / (1000 * 60 * 60);
        if (hoursBefore < 0) hoursBefore = 0;
      }

      const isMockInterview = Boolean(acceptedRequest.isMockInterview);

      // Use "Rescheduled" status to look up RESCHEDULE type policies
      const policy = await findPolicyForSettlement(isMockInterview, "Rescheduled", hoursBefore);

      if (policy) {
        payPercent = typeof policy.interviewerPayoutPercentage === "number"
          ? policy.interviewerPayoutPercentage
          : 0; // Default 0 for reschedule usually

        // Store platformFeePercentage from policy for reschedule-specific calculation
        // This will be used instead of the general service charge
        settlementScenario = policy.policyName || "reschedule_policy_applied";
        appliedPolicyId = policy._id?.toString() || null;
        appliedPolicyName = policy.policyName || "reschedule_policy";

        // TODO: firstRescheduleFree logic - commented out for now
        // if (policy.firstRescheduleFree) {
        //   const { isFirstFreeReschedule } = require("./roundPolicyUtil");
        //   if (isFirstFreeReschedule(roundDoc.history)) {
        //     payPercent = 0;
        //     settlementScenario = "first_reschedule_free";
        //   }
        // }
      } else {
        // No policy found - default to full refund (0% to interviewer)
        payPercent = 0;
        settlementScenario = "no_reschedule_policy_found";
        appliedPolicyName = "no_reschedule_policy_found";
      }
    }

    // 7. Get tax config for service charge percentage
    const orgTenantId = orgWallet.tenantId || interview.tenantId || "";
    const { serviceChargePercent } = await getTaxConfigForTenant({ tenantId: orgTenantId });

    // 8. Compute settlement amounts
    // GST is ALREADY taken from org at hold time - read it from the hold transaction
    const gstFromHold = Number(activeHoldTransaction.gstAmount || 0);
    const totalHoldAmount = Number(activeHoldTransaction.totalAmount || baseAmount + gstFromHold);

    // Calculate gross settlement based on policy percentage (applied to interviewer's base amount)
    const grossSettlementAmount = Math.round(((baseAmount * payPercent) / 100) * 100) / 100;

    // Refund to org: unused portion of base amount + proportional GST refund
    const unusedBaseAmount = baseAmount - grossSettlementAmount;
    const gstRefundProportion = gstFromHold > 0 && baseAmount > 0
      ? Math.round(((unusedBaseAmount / baseAmount) * gstFromHold) * 100) / 100
      : 0;
    const refundAmount = Math.max(0, unusedBaseAmount + gstRefundProportion);

    // Service charge: deducted from interviewer's gross payout (10% of their payout)
    const scPercent = typeof serviceChargePercent === "number" ? serviceChargePercent : 0;
    const serviceCharge = Math.round(((grossSettlementAmount * scPercent) / 100) * 100) / 100;

    // GST that goes to platform (proportional to what's used)
    const gstForPlatform = gstFromHold - gstRefundProportion;

    // Interviewer gets: grossSettlementAmount - serviceCharge (GST already from org, not deducted from interviewer)
    const settlementAmount = Math.max(0, Math.round((grossSettlementAmount - serviceCharge) * 100) / 100);

    console.log(`[processAutoSettlement] Settlement calculation:`, {
      baseAmount, gstFromHold, totalHoldAmount, payPercent,
      grossSettlementAmount, serviceCharge, gstForPlatform, settlementAmount, refundAmount,
    });

    if (settlementAmount <= 0 && refundAmount <= 0 && gstForPlatform <= 0) {
      console.log("[processAutoSettlement] No settlement needed - all amounts are zero");
      return { settlementAmount: 0, refundAmount: 0, message: "No settlement needed" };
    }

    // 9. Update organization wallet - settle the hold to debit
    // Calculate the GST portion for the settled amount (proportional to what's being used)
    const gstForSettlement = gstFromHold - gstRefundProportion;
    const totalSettlementAmount = grossSettlementAmount + gstForSettlement;

    const orgWalletUpdate = {
      $set: {
        "transactions.$.type": "debited",
        "transactions.$.status": "completed",
        "transactions.$.amount": grossSettlementAmount,
        "transactions.$.gstAmount": gstForSettlement, // GST portion for settled amount
        "transactions.$.totalAmount": totalSettlementAmount, // Updated total = amount + gst
        "transactions.$.description": `Settled payment for ${companyName} - ${roundTitle}`,
        "transactions.$.metadata.settledAt": new Date(),
        "transactions.$.metadata.settlementStatus": "completed",
        "transactions.$.metadata.settlementBaseAmount": baseAmount,
        "transactions.$.metadata.settlementPayPercent": payPercent,
        "transactions.$.metadata.settlementAmountPaidToInterviewer": settlementAmount,
        "transactions.$.metadata.settlementRefundAmount": refundAmount,
        "transactions.$.metadata.settlementServiceCharge": serviceCharge,
        "transactions.$.metadata.settlementGstForPlatform": gstForPlatform,
        "transactions.$.metadata.settlementScenario": settlementScenario,
        "transactions.$.metadata.settlementPolicyName": appliedPolicyName,
        "transactions.$.metadata.originalHoldAmount": baseAmount,
        "transactions.$.metadata.originalGstAmount": gstFromHold,
        "transactions.$.metadata.originalTotalAmount": totalHoldAmount,
        "transactions.$.metadata.isMockInterview": isMockInterview,
        "transactions.$.metadata.mockDiscountPercentage": mockDiscountPercentage,
        "transactions.$.metadata.mockDiscountAmount": mockDiscountAmount,
        "transactions.$.metadata.originalAmountBeforeDiscount": originalAmountBeforeDiscount,
      },
      $inc: {
        holdAmount: -totalHoldAmount, // Release full hold amount (base + GST)
        balance: refundAmount,
      },
    };

    const updatedOrgWallet = await WalletTopup.findOneAndUpdate(
      { _id: orgWallet._id, "transactions._id": transactionId },
      orgWalletUpdate,
      { new: true }
    );

    if (!updatedOrgWallet) {
      console.error("[processAutoSettlement] Failed to update organization wallet");
      return null;
    }

    // 10. Add refund transaction if applicable using common function
    // Separate base amount and GST for proper breakdown display
    if (refundAmount > 0) {
      await createWalletTransaction({
        ownerId: orgWallet.ownerId,
        businessType: WALLET_BUSINESS_TYPES.REFUND,
        amount: unusedBaseAmount, // Base amount being refunded
        gstAmount: gstRefundProportion, // GST portion being refunded
        description: `Refund for cancelled/partial settlement - ${roundTitle}`,
        relatedInvoiceId: activeHoldTransaction.relatedInvoiceId,
        status: "completed",
        reason: action === "Cancelled" ? reasonCode : "INTERVIEW_SETTLEMENT_REFUND",
        metadata: {
          roundId: roundId,
          settlementDate: new Date(),
          originalTransactionId: transactionId,
          interviewId: interview._id?.toString(),
          isMockInterview: isMockInterview,
          mockDiscountPercentage: mockDiscountPercentage,
          mockDiscountAmount: mockDiscountAmount,
          originalAmountBeforeDiscount: originalAmountBeforeDiscount,
        },
      });
    }

    // 11. Find or create interviewer wallet and credit settlement amount
    // Wallet is linked to Contact.ownerId, not the Contact._id
    // console.log("Interviewer ownerId for wallet:", interviewerOwnerId);
    let interviewerWallet = await WalletTopup.findOne({ ownerId: interviewerOwnerId });
    // console.log("Interviewer wallet:", interviewerWallet);
    let invoiceDoc = null;

    if (settlementAmount > 0) {
      if (!interviewerWallet) {
        // Generate unique walletCode for new wallet
        const walletCode = await generateUniqueId("WLT", WalletTopup, "walletCode");
        interviewerWallet = new WalletTopup({
          ownerId: interviewerOwnerId,
          walletCode: walletCode,
          currency: "INR",
          tenantId: interviewertenantId || "",
          balance: 0,
          holdAmount: 0,
          transactions: [],
        });
        await interviewerWallet.save();
        console.log("Created new interviewer wallet:", interviewerWallet.walletCode);
      }

      const interviewerPrevBalance = Number(interviewerWallet.balance || 0);
      const interviewerNewBalance = interviewerPrevBalance + settlementAmount;

      // Create payout invoice for interviewer
      const invoiceCode = await generateUniqueId("INVC", Invoicemodels, "invoiceCode");

      invoiceDoc = await Invoicemodels.create({
        tenantId: interviewertenantId || "",
        ownerId: interviewerOwnerId,
        type: "payout",
        planName: `Interview Payment - ${roundTitle}`,
        totalAmount: settlementAmount,
        amountPaid: settlementAmount,
        status: "credited",
        invoiceCode: invoiceCode,
        relatedObjectId: mongoose.Types.ObjectId.isValid(roundId)
          ? new mongoose.Types.ObjectId(roundId)
          : undefined,
        metadata: {
          roundId: roundId,
          interviewId: interview._id?.toString(),
          companyName: companyName,
          roundTitle: roundTitle,
          positionTitle: positionTitle,
          settlementScenario: settlementScenario,
          serviceCharge: serviceCharge,
          grossSettlementAmount: grossSettlementAmount,
        },
        lineItems: [
          {
            description: `Interview conducted for ${companyName} - ${positionTitle} (${roundTitle})`,
            amount: settlementAmount,
            quantity: 1,
            tax: 0,
          },
        ],
        createdAt: new Date(),
      });

      // Credit interviewer wallet using common function
      // Pass gross amount and service charge at transaction level
      // Service charge is passed as negative (deduction) so totalAmount = gross - serviceCharge = net
      await createWalletTransaction({
        ownerId: interviewerOwnerId,
        businessType: WALLET_BUSINESS_TYPES.TOPUP_CREDIT,
        amount: grossSettlementAmount, // Gross amount before service charge deduction
        serviceCharge: -serviceCharge, // Negative = deducted from gross (totalAmount = gross + (-SC) = net)
        description: `Payment from ${companyName} - ${roundTitle} for ${positionTitle}`,
        relatedInvoiceId: invoiceDoc._id.toString(),
        status: "completed",
        reason: action === "Completed" ? (reasonCode ? reasonCode : "INTERVIEW_COMPLETED_PAYOUT") : "INTERVIEW_CANCELLED_PAYOUT",
        metadata: {
          interviewId: interview._id?.toString(),
          roundId: roundId,
          settlementDate: new Date(),
          invoiceId: invoiceDoc._id.toString(),
          companyName: companyName,
          roundTitle: roundTitle,
          positionTitle: positionTitle,
          serviceChargePercent: scPercent,
          isMockInterview: isMockInterview,
          mockDiscountPercentage: mockDiscountPercentage,
          mockDiscountAmount: mockDiscountAmount,
          originalAmountBeforeDiscount: originalAmountBeforeDiscount,
        },
      });
    }

    // 12. Credit platform wallet (isCompany: true) with service charge and GST
    // Note: Platform wallet has isCompany: true but no ownerId, so we update directly
    if (serviceCharge > 0 || gstForPlatform > 0) {
      const platformWallet = await WalletTopup.findOne({ isCompany: true });

      if (platformWallet) {
        const platformTransactions = [];
        const platformPrevBalance = Number(platformWallet.balance || 0);
        let runningBalance = platformPrevBalance;

        // Service charge transaction (deducted from interviewer)
        if (serviceCharge > 0) {
          const nextBalance = runningBalance + serviceCharge;
          platformTransactions.push({
            type: "platform_fee",
            bucket: "AVAILABLE",
            effect: "CREDITED",
            amount: serviceCharge,
            serviceCharge: serviceCharge,
            totalAmount: serviceCharge,
            description: `Platform fee for ${companyName} - ${roundTitle}`,
            relatedInvoiceId: invoiceDoc?._id?.toString() || transactionId,
            status: "completed",
            reason: "PLATFORM_COMMISSION",
            metadata: {
              roundId: roundId,
              interviewerOwnerId: interviewerContactId,
              interviewId: interview._id?.toString(),
            },
            balanceBefore: runningBalance,
            balanceAfter: nextBalance,
            createdDate: new Date(),
            createdAt: new Date(),
          });
          runningBalance = nextBalance;
        }

        // GST transaction (already collected from org at hold time)
        if (gstForPlatform > 0) {
          const nextBalance = runningBalance + gstForPlatform;
          platformTransactions.push({
            type: "platform_fee",
            bucket: "AVAILABLE",
            effect: "CREDITED",
            amount: gstForPlatform,
            gstAmount: gstForPlatform,
            totalAmount: gstForPlatform,
            description: `GST from interview for ${companyName} - ${roundTitle}`,
            relatedInvoiceId: invoiceDoc?._id?.toString() || transactionId,
            status: "completed",
            reason: "PLATFORM_GST",
            metadata: {
              roundId: roundId,
              interviewerOwnerId: interviewerContactId,
              interviewId: interview._id?.toString(),
            },
            balanceBefore: runningBalance,
            balanceAfter: nextBalance,
            createdDate: new Date(),
            createdAt: new Date(),
          });
          runningBalance = nextBalance;
        }

        const totalPlatformDelta = runningBalance - platformPrevBalance;

        await WalletTopup.findByIdAndUpdate(platformWallet._id, {
          $inc: { balance: totalPlatformDelta },
          $push: { transactions: { $each: platformTransactions } },
        });

        console.log(`[processAutoSettlement] Platform wallet credited: serviceCharge=${serviceCharge}, GST=${gstForPlatform}`);
      } else {
        console.warn("[processAutoSettlement] Platform wallet (isCompany: true) not found");
      }
    }

    console.log(`[processAutoSettlement] Settlement completed for round ${roundId}:`, {
      action, settlementAmount, refundAmount, serviceCharge, gstForPlatform, invoiceId: invoiceDoc?._id?.toString(),
    });

    return {
      success: true,
      action,
      settlementAmount,
      refundAmount,
      serviceCharge,
      gstForPlatform,
      invoiceId: invoiceDoc?._id?.toString(),
      roundId,
    };
  } catch (error) {
    console.error("[processAutoSettlement] Error:", error);
    throw error;
  }
}

/**
 * Process full refund for withdrawn requests (selection time hold).
 * This is called when RequestSent → Draft and requests are withdrawn before any acceptance.
 * No policy needed - full refund of hold amount + GST to organization.
 *
 * @param {Object} params
 * @param {String} params.roundId - Interview round ID
 * @returns {Promise<Object|null>} Refund result or null if no hold found
 */
async function processWithdrawnRefund({ roundId }) {
  if (!roundId) {
    console.log("[processWithdrawnRefund] Missing roundId");
    return null;
  }

  try {
    console.log("[processWithdrawnRefund] Processing refund for round:", roundId);

    // 1. Find the organization wallet with HOLD transaction for this round
    const orgWallet = await WalletTopup.findOne({
      "transactions.metadata.roundId": roundId,
      "transactions.type": "hold",
      "transactions.status": "pending",
    });

    if (!orgWallet) {
      console.log("[processWithdrawnRefund] No organization wallet with hold found for round:", roundId);
      return null;
    }

    // 2. Find the active hold transaction
    const activeHoldTransaction = orgWallet.transactions.find(
      (tx) =>
        tx.metadata?.roundId === roundId &&
        tx.type === "hold" &&
        tx.status === "pending"
    );

    if (!activeHoldTransaction) {
      console.log("[processWithdrawnRefund] No active hold transaction found for round:", roundId);
      return null;
    }

    const transactionId = activeHoldTransaction._id;
    const baseAmount = Number(activeHoldTransaction.amount || 0);
    const gstAmount = Number(activeHoldTransaction.gstAmount || 0);
    const totalHoldAmount = Number(activeHoldTransaction.totalAmount || baseAmount + gstAmount);

    // console.log("[processWithdrawnRefund] Found hold to refund:", {
    //   transactionId: transactionId?.toString(),
    //   baseAmount,
    //   gstAmount,
    //   totalHoldAmount,
    // });

    // 3. Mark the original hold transaction as completed (preserve original type for audit trail)
    // This keeps the hold record intact - we just mark it as "completed" to indicate it's been processed
    const holdCompletionUpdate = {
      $set: {
        "transactions.$.status": "completed",
        "transactions.$.metadata.processedAt": new Date(),
        "transactions.$.metadata.processedReason": "WITHDRAWN_BEFORE_ACCEPTANCE",
        "transactions.$.metadata.refundTransactionCreated": true,
      },
    };

    await WalletTopup.findOneAndUpdate(
      { _id: orgWallet._id, "transactions._id": transactionId },
      holdCompletionUpdate
    );

    //console.log("[processWithdrawnRefund] Marked hold transaction as completed");

    // 4. Create a NEW refund transaction using createWalletTransaction() for proper audit trail
    // This will:
    // - Release the hold amount (reduce holdAmount)
    // - Credit back to available balance
    // - Create a clear refund record in transaction history
    const refundResult = await createWalletTransaction({
      ownerId: orgWallet.ownerId,
      businessType: WALLET_BUSINESS_TYPES.HOLD_RELEASE, // Releases hold and credits to available
      amount: baseAmount,
      gstAmount: gstAmount,
      description: `Full refund - Requests withdrawn before acceptance`,
      relatedInvoiceId: activeHoldTransaction.relatedInvoiceId,
      status: "completed",
      reason: "WITHDRAWN_BEFORE_ACCEPTANCE_REFUND",
      metadata: {
        roundId: roundId,
        originalTransactionId: transactionId?.toString(),
        originalHoldAmount: totalHoldAmount,
        refundDate: new Date(),
        source: "withdrawn_refund",
      },
    });

    // console.log("[processWithdrawnRefund] Created refund transaction:", {
    //   roundId,
    //   refundAmount: totalHoldAmount,
    //   newBalance: refundResult.wallet?.balance,
    // });

    return {
      success: true,
      roundId,
      refundAmount: totalHoldAmount,
      baseAmount,
      gstAmount,
      refundTransaction: refundResult.transaction,
      wallet: refundResult.wallet,
    };
  } catch (error) {
    console.error("[processWithdrawnRefund] Error:", error);
    throw error;
  }
}

module.exports = {
  WALLET_BUSINESS_TYPES,
  createWalletTransaction,
  computeInterviewPricingForAccept,
  applySelectionTimeWalletHoldForOutsourcedRound,
  applyAcceptInterviewWalletFlow,
  processAutoSettlement,
  processWithdrawnRefund,
};
