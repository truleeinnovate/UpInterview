// Common wallet transaction utilities for interview-related holds, refunds, and generic wallet movements
// v1.0.0 - Shared helper to keep wallet balance/holdAmount updates consistent

const mongoose = require("mongoose");
const WalletTopup = require("../models/WalletTopup");
const { Candidate } = require("../models/candidate");
const { MockInterview } = require("../models/Mockinterview/mockinterview");
const {
  getTaxConfigForTenant,
  computeBaseGstGross,
  normalizePercentage,
} = require("./taxConfigUtil");

/**
 * High-level semantic transaction kinds used by business logic.
 * These are mapped internally onto the underlying WalletTopup transaction
 * `type` field (credit/debit/hold) and appropriate balance/holdAmount deltas.
 */
const WALLET_BUSINESS_TYPES = {
  HOLD_ADJUST: "HOLD_ADJUST",
  HOLD_CREATE: "HOLD_CREATE", // Move available balance -> hold
  HOLD_RELEASE: "HOLD_RELEASE", // Release hold back to available balance
  HOLD_DEBIT: "HOLD_DEBIT", // Convert part/all of hold into a debit (payout/charge)
  REFUND: "REFUND", // Credit back to wallet balance (no hold change)
  TOPUP_CREDIT: "TOPUP_CREDIT", // Generic credit/topup
  SUBSCRIBE_CREDITED: "SUBSCRIBE_CREDITED", // Subscription plan credits
  GENERIC_DEBIT: "GENERIC_DEBIT", // Generic debit from available balance
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
        txType: "debit",
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
        txType: "debit",
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
    effect = "CREDIT";
  } else if (txType === "debit" || txType === "hold" || txType === "") {
    effect = "DEBIT";
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

    const experienceYears = Number(candidate.CurrentExperience);
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
        // rate: rate, // Store selected rate
        // experienceLevel: experienceLevel,
        // duration: String(duration),
        // durationInMinutes: durationInMinutes,
        // isMockInterview: Boolean(request.isMockInterview),
        // mockInterviewDiscount: request.isMockInterview
        //   ? appliedDiscountPercentage
        //   : null,
        // calculation: {
        //   formula:
        //     request.isMockInterview && appliedDiscountPercentage > 0
        //       ? "(rate * minutes / 60) - discount"
        //       : "rate * minutes / 60",
        //   rate: rate,
        //   minutes: durationInMinutes,
        //   discountPercentage: appliedDiscountPercentage,
        // },
        // acceptedBaseAmount: acceptBaseAmount,
        // acceptedGstRate: acceptGstRate,
        // acceptedGstAmount: acceptGstAmount,
        // acceptedGrossAmount: acceptGrossAmount,
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
        // rate: rate, // Store selected rate
        // experienceLevel: experienceLevel,
        // duration: String(duration),
        // durationInMinutes: durationInMinutes,
        // isMockInterview: Boolean(request.isMockInterview),
        // mockInterviewDiscount: request.isMockInterview
        //   ? appliedDiscountPercentage
        //   : null,
        // calculation: {
        //   formula:
        //     request.isMockInterview && appliedDiscountPercentage > 0
        //       ? "(rate * minutes / 60) - discount"
        //       : "rate * minutes / 60",
        //   rate: rate,
        //   minutes: durationInMinutes,
        //   discountPercentage: appliedDiscountPercentage,
        // },
        // legacyBaseAmount,
        // legacyGstRate,
        // legacyGstAmount,
        // legacyGrossAmount,
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

module.exports = {
  WALLET_BUSINESS_TYPES,
  createWalletTransaction,
  computeInterviewPricingForAccept,
  applySelectionTimeWalletHoldForOutsourcedRound,
  applyAcceptInterviewWalletFlow,
};
