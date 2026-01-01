// Common wallet transaction utilities for interview-related holds, refunds, and generic wallet movements
// v1.0.0 - Shared helper to keep wallet balance/holdAmount updates consistent

const mongoose = require("mongoose");
const WalletTopup = require("../models/WalletTopup");

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
        txType: "credit",
        balanceDelta: amt,
        holdDelta: 0,
      };

    case WALLET_BUSINESS_TYPES.TOPUP_CREDIT:
      // Generic top-up credit
      return {
        txType: "credit",
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
  if (txType === "credit" || txType === "hold_release" || txType === "hold_adjust") {
    effect = "CREDIT";
  } else if (txType === "debit" || txType === "hold"|| txType === "") {
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

module.exports = {
  WALLET_BUSINESS_TYPES,
  createWalletTransaction,
};
