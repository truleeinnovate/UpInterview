const { InterviewPolicy } = require("../models/InterviewPolicy");

/**
 * Core function to find an InterviewPolicy row for settlement,
 * based on interview type (mock vs normal), round status and hours before.
 *
 * This is shared between backend logic (roundPolicyUtil / wallet settlement)
 * and the Interview Policies API.
 *
 * @param {boolean} isMockInterview
 * @param {string} roundStatus
 * @param {number|null} hoursBefore
 * @returns {Promise<Object|null>} InterviewPolicy document or null
 */
const findPolicyForSettlement = async (
  isMockInterview,
  roundStatus,
  hoursBefore
) => {
  if (hoursBefore == null || isNaN(hoursBefore)) {
    return null;
  }

  const minutesBefore = Math.floor(hoursBefore * 60);
  if (!Number.isFinite(minutesBefore) || minutesBefore < 0) {
    return null;
  }

  const category = isMockInterview ? "MOCK" : "INTERVIEW";

  let type = null;
  if (
    roundStatus === "Cancelled" ||
    roundStatus === "NoShow" ||
    roundStatus === "InCompleted" ||
    roundStatus === "Incomplete"
  ) {
    type = "CANCEL";
  } else if (roundStatus === "Rescheduled") {
    type = "RESCHEDULE";
  }

  if (!type) {
    return null;
  }

  const policy = await InterviewPolicy.findOne({
    category,
    type,
    status: "Active",
    timeBeforeInterviewMin: { $lte: minutesBefore },
    timeBeforeInterviewMax: { $gte: minutesBefore },
  })
    .sort({ _id: -1 })
    .lean();

  return policy || null;
};

/**
 * API: POST /interview-policies/settlement-policy
 *
 * Request body:
 *   - isMockInterview (boolean | string)
 *   - roundStatus (string)
 *   - hoursBefore (number | string)
 *
 * Response:
 *   200: { success: true, policy }
 *   400: { success: false, message }
 *   500: { success: false, message, error }
 */
const getSettlementPolicy = async (req, res) => {
  try {
    let { isMockInterview, roundStatus, hoursBefore } = req.body || {};

    // Normalize boolean and number inputs
    const parsedIsMockInterview =
      isMockInterview === true || isMockInterview === "true";

    const parsedHoursBefore =
      hoursBefore === null || hoursBefore === undefined
        ? null
        : Number(hoursBefore);

    if (!roundStatus) {
      return res.status(400).json({
        success: false,
        message: "roundStatus is required",
      });
    }

    const policy = await findPolicyForSettlement(
      parsedIsMockInterview,
      roundStatus,
      parsedHoursBefore
    );

    return res.status(200).json({
      success: true,
      policy,
    });
  } catch (error) {
    console.error("[getSettlementPolicy] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch settlement policy",
      error: error.message || String(error),
    });
  }
};

module.exports = {
  findPolicyForSettlement,
  getSettlementPolicy,
};
