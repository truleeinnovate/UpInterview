/**
 * policyUtil.js
 * 
 * Centralized utility for calculating settlement amounts based on interview policies.
 * 
 * Supports:
 * - Normal interviews
 * - Mock interviews
 * - First-time scheduling vs rescheduling
 * - Candidate reschedule (first free if >12h)
 * - Candidate cancellation / no-show
 * - Interviewer no-show (candidate gets full refund/reschedule, interviewer gets 0)
 * 
 * All time calculations are based on hours before scheduled start time.
 */

const { SERVICE_CHARGE_PERCENT, GST_RATE } = require('../config');

const getPayPercent = (isMockInterview, roundStatus, hoursBefore, isInterviewerNoShow = false) => {
    let payPercent = 100;
    let settlementScenario = "completed";

    // Interviewer no-show: interviewer gets 0% regardless of timing or type
    if (isInterviewerNoShow) {
        return { payPercent: 0, settlementScenario: "interviewer_no_show" };
    }

    // Completed interview: full payment
    if (roundStatus === "Completed") {
        payPercent = 100;
        settlementScenario = "completed";
    }
    // Candidate no-show or very late cancellation
    else if (roundStatus === "NoShow" || roundStatus === "InCompleted") {
        settlementScenario = "candidate_no_show";
        payPercent = 100; // Interviewer gets full pay
    }
    // Explicitly cancelled by candidate or organization
    else if (roundStatus === "Cancelled" || roundStatus === "Rescheduled") {
        settlementScenario = "cancelled_or_rescheduled";

        if (hoursBefore == null || isNaN(hoursBefore)) {
            payPercent = 0; // Conservative default if timing unknown
        } else if (isMockInterview) {
            // === MOCK INTERVIEW POLICY ===
            if (hoursBefore > 12) {
                payPercent = 0;     // Cancelled >12h before → no pay
            } else if (hoursBefore > 2) {
                payPercent = 25;    // 2–12h → 25%
            } else {
                payPercent = 50;    // <2h or no-show → 50%
            }
        } else {
            // === NORMAL INTERVIEW POLICY ===
            if (hoursBefore > 24) {
                payPercent = 0;     // >24h → no pay
            } else if (hoursBefore > 12) {
                payPercent = 25;    // 12–24h → 25%
            } else if (hoursBefore > 2) {
                payPercent = 50;    // 2–12h → 50%
            } else {
                payPercent = 100;   // <2h or no-show → full pay
            }
        }
    }
    // Default fallback (e.g. unknown status)
    else {
        payPercent = 0;
        settlementScenario = "unknown_status";
    }

    return { payPercent, settlementScenario };
};

/**
 * Compute final settlement amounts for interviewer
 * 
 * @param {number} baseAmount - Original interview fee (before any deductions)
 * @param {number} payPercent - Percentage interviewer should receive (from getPayPercent)
 * @param {number} serviceChargePercent - Platform service charge (default 10%)
 * @param {number} gstRate - GST rate on service charge (default 18%)
 * @returns Object with all calculated amounts
 */
const computeSettlementAmounts = (
    baseAmount,
    payPercent,
    serviceChargePercent = SERVICE_CHARGE_PERCENT,
    gstRate = GST_RATE
) => {
    // Gross amount payable to interviewer before platform fees
    const grossSettlementAmount = Math.round((baseAmount * payPercent) / 100 * 100) / 100;

    // Amount refunded to candidate (if any)
    const refundAmount = Math.max(0, baseAmount - grossSettlementAmount);

    // Platform service charge (10% of gross settlement)
    const serviceCharge = Math.round((grossSettlementAmount * serviceChargePercent) / 100 * 100) / 100;

    // GST on service charge
    const serviceChargeGst = Math.round((serviceCharge * gstRate) * 100) / 100;

    // Final net amount paid to interviewer
    let settlementAmount = grossSettlementAmount - serviceCharge - serviceChargeGst;
    settlementAmount = Math.max(0, Math.round(settlementAmount * 100) / 100);

    return {
        grossSettlementAmount,     // Amount before platform fee
        refundAmount,              // Refunded to candidate
        serviceCharge,             // Platform fee (10%)
        serviceChargeGst,          // GST on platform fee
        settlementAmount,          // Final payout to interviewer
    };
};

/**
 * Helper to determine if this is the candidate's first reschedule
 * (Used elsewhere in wallet/settlement logic)
 * 
 * @param {Array} history - round.history array
 * @returns {boolean} true if this is first reschedule >12h
 */
const isFirstFreeReschedule = (history = []) => {
    const rescheduleCount = history.filter(h => h.action === "Rescheduled").length;
    return rescheduleCount === 0; // First reschedule is free
};

module.exports = {
    getPayPercent,
    computeSettlementAmounts,
    isFirstFreeReschedule,
};