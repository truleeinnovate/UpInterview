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
  } else if (roundStatus === "Rescheduled" || roundStatus === "Scheduled") {
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
 *   - hoursBefore (number | string, optional)
 *   - dateTime (string, optional) - e.g. "04-01-2026 12:09 PM - 01:09 PM"
 *
 * Response:
 *   200: { success: true, hoursBefore, policy }
 *   400: { success: false, message }
 *   500: { success: false, message, error }
 */
const getSettlementPolicy = async (req, res) => {
  try {
    let { isMockInterview, roundStatus, dateTime } = req.body || {};

    // Normalize boolean and number inputs
    const parsedIsMockInterview =
      isMockInterview === true || isMockInterview === "true";

    // 1) Derive hoursBefore
    // Prefer an explicit hoursBefore value if provided; otherwise compute it
    // from dateTime (formatted as "DD-MM-YYYY hh:mm A - hh:mm A") relative
    // to the current server time.

    let effectiveHoursBefore = null;

    // 1a) If hoursBefore was provided explicitly, try to parse it
    // if (hoursBefore !== null && hoursBefore !== undefined && hoursBefore !== "") {
    //   const numeric = Number(hoursBefore);
    //   if (!isNaN(numeric) && Number.isFinite(numeric)) {
    //     effectiveHoursBefore = numeric;
    //   }
    // }

    // 1b) If not provided, but dateTime string is available, parse and compute
    if (
      effectiveHoursBefore === null &&
      typeof dateTime === "string" &&
      dateTime.trim()
    ) {
      // Expecting format like: "04-01-2026 12:09 PM - 01:09 PM"
      const match = dateTime.match(
        /^(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)\s+-\s+\d{1,2}:\d{2}\s+(AM|PM)$/
      );

      if (match) {
        let [, day, month, year, hour, minute, ampm] = match;

        let hours = parseInt(hour, 10);
        if (ampm === "PM" && hours !== 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;

        const scheduledTime = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          hours,
          parseInt(minute, 10)
        );

        // Use current server time as the action time (when cancel/reschedule happens)
        const actionTime = new Date();

        if (
          scheduledTime &&
          !isNaN(scheduledTime.getTime()) &&
          actionTime &&
          !isNaN(actionTime.getTime())
        ) {
          let diffHours =
            (scheduledTime.getTime() - actionTime.getTime()) / (1000 * 60 * 60);

          if (!isNaN(diffHours) && diffHours < 0) {
            diffHours = 0;
          }

          effectiveHoursBefore = diffHours;
        }
      }
    }

    if (!roundStatus) {
      return res.status(400).json({
        success: false,
        message: "roundStatus is required",
      });
    }

    const policy = await findPolicyForSettlement(
      parsedIsMockInterview,
      roundStatus,
      effectiveHoursBefore
    );

    return res.status(200).json({
      success: true,
      hoursBefore: effectiveHoursBefore,
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

//  * Create Interview Policy
const createInterviewPolicy = async (req, res) => {
  try {
    const {
      policyName,
      category,
      type,
      timeBeforeInterviewMin,
      timeBeforeInterviewMax,
      feePercentage,
      interviewerPayoutPercentage,
      platformFeePercentage,
      firstRescheduleFree,
      gstIncluded,
      status,
    } = req.body;

    /* -------------------- Basic Validation -------------------- */
    if (!policyName) {
      return res.status(400).json({
        success: false,
        message: "Policy name is required",
      });
    }

    if (!category || !type) {
      return res.status(400).json({
        success: false,
        message: "Category and type are required",
      });
    }

    if (
      timeBeforeInterviewMin === undefined ||
      timeBeforeInterviewMin === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum time before interview is required",
      });
    }

    /* -------------------- Uniqueness Check -------------------- */
    const existingPolicy = await InterviewPolicy.findOne({ policyName });
    if (existingPolicy) {
      return res.status(409).json({
        success: false,
        message: "Policy with this name already exists",
      });
    }

    /* -------------------- Create Policy -------------------- */
    const policy = await InterviewPolicy.create({
      policyName,
      category,
      type,
      timeBeforeInterviewMin,
      timeBeforeInterviewMax,
      feePercentage,
      interviewerPayoutPercentage,
      platformFeePercentage,
      firstRescheduleFree,
      gstIncluded,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Interview policy created successfully",
      data: policy,
    });
  } catch (error) {
    console.error("Create Interview Policy Error:", error);

    // Mongo unique index error safety
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Policy name must be unique",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create interview policy",
      error: error.message,
    });
  }
};

// API: GET ALL
const getAllPolicies = async (req, res) => {
  try {
    const policies = await InterviewPolicy.find().sort({ _id: -1 }).lean();

    return res.status(200).json({
      success: true,
      policies,
    });
  } catch (error) {
    console.error("[getAllPolicies] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch policies",
      error: error.message,
    });
  }
};

// API: GET
const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await InterviewPolicy.findById(id).lean();

    if (!policy) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found" });
    }

    return res.status(200).json({ success: true, policy });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching policy",
      error: error.message,
    });
  }
};

// API: PUT
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPolicy = await InterviewPolicy.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedPolicy) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Policy updated successfully",
      policy: updatedPolicy,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Update failed", error: error.message });
  }
};

// API: DELETE
const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPolicy = await InterviewPolicy.findByIdAndDelete(id);

    if (!deletedPolicy) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Policy deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Delete failed", error: error.message });
  }
};

module.exports = {
  findPolicyForSettlement,
  createInterviewPolicy,
  getSettlementPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
};
