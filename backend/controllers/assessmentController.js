// v1.0.0  -  Ashraf  -  fixed assessment result tab issue.before getting only completed status data now we will display all status data
// v1.0.1  -  Ashraf  -  fixed assessment code issue.now it will generate assessment code like ASMT-TPL-00001 and assessment name to assessment template
// v1.0.2  -  Ashraf  -  fixed assessment code issue.now it will generate assessment code like ASMT-TPL-00001 and assessment name to assessment template
// v1.0.3  -  Venkatesh  -  Added Joi validation for assessment creation and updates
// v1.0.4  -  Ashok   -  added list creation controllers

// <-------------------------------v1.0.1
const Assessment = require("../models/Assessment/assessmentTemplates.js");
// ------------------------------v1.0.1 >
const { isValidObjectId } = require("mongoose");
const {
  CandidateAssessment,
} = require("../models/Assessment/candidateAssessment.js");

const mongoose = require("mongoose");
const ScheduleAssessment = require("../models/Assessment/assessmentsSchema.js");
const { Candidate } = require("../models/candidate.js");
const Notification = require("../models/notification");
const { encrypt } = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const emailTemplateModel = require("../models/EmailTemplatemodel");
const notificationMiddleware = require("../middleware/notificationMiddleware");

// Import push notification functions
const {
  createAssessmentCreatedNotification,
} = require("./PushNotificationControllers/pushNotificationAssessmentController");

// Import validation functions
const {
  validateCreateAssessment,
  validateUpdateAssessment,
  validateAssessmentByTab,
} = require("../validations/assessmentValidation");
const selectedAssessmentquestions = require("../models/Assessment/selectedAssessmentquestions.js");
const AssessmentList = require("../models/Assessment/AssessmentList.js");

// Delete an assessment
// exports.deleteAssessment = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const { id } = req.params;

//         // Validate ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid assessment ID',
//             });
//         }

//         // Check if assessment exists
//         const assessment = await Assessment.findById(id).session(session);
//         if (!assessment) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Assessment not found',
//             });
//         }

//         // Check if there are any scheduled assessments using this template
//         const scheduledAssessments = await ScheduleAssessment.find({ templateId: id }).session(session);
//         if (scheduledAssessments.length > 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Cannot delete assessment template that is being used in scheduled assessments',
//             });
//         }

//         // Delete the assessment
//         await Assessment.findByIdAndDelete(id).session(session);

//         // Delete related candidate assessments
//         await CandidateAssessment.deleteMany({ assessmentId: id }).session(session);

//         await session.commitTransaction();
//         session.endSession();

//         res.status(200).json({
//             success: true,
//             message: 'Assessment deleted successfully',
//         });
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();

//         console.error('[ASSESSMENT] Error deleting assessment:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to delete assessment',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//         });
//     }
// };

exports.deleteAssessment = async (req, res) => {
  // ✅ Start MongoDB session for transaction safety
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // ✅ Validate assessment ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment ID",
      });
    }

    // ✅ Check if assessment exists
    const assessment = await Assessment.findById(id).session(session);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // ✅ Check for any scheduled assessments using this template
    const scheduledAssessments = await ScheduleAssessment.find({
      templateId: id,
    }).session(session);
    if (scheduledAssessments.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete assessment template that is being used in scheduled assessments",
      });
    }

    // ✅ 1️⃣ Delete the main assessment
    await Assessment.findByIdAndDelete(id).session(session);

    // ✅ 2️⃣ Delete related candidate assessments
    const deletedCandidateAssessments = await CandidateAssessment.deleteMany({
      assessmentId: id,
    }).session(session);

    console.log(
      `[ASSESSMENT] Deleted ${deletedCandidateAssessments.deletedCount} candidate assessments for ${id}`
    );

    // ✅ 3️⃣ Delete related selected assessment questions (added new)
    const deletedQuestions = await selectedAssessmentquestions
      .deleteMany({
        assessmentId: id,
      })
      .session(session);

    console.log(
      `[ASSESSMENT] Deleted ${deletedQuestions.deletedCount} question sets for ${id}`
    );

    // ✅ Commit transaction if everything succeeded
    await session.commitTransaction();
    session.endSession();

    // ✅ Send success response
    res.status(200).json({
      success: true,
      message: "Assessment and related data deleted successfully",
    });
  } catch (error) {
    // ❌ Rollback on any error
    await session.abortTransaction();
    session.endSession();

    console.error("[ASSESSMENT] Error deleting assessment:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete assessment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Validate assessment by tab/step (for frontend step-wise validation)
exports.validateAssessmentStep = async (req, res) => {
  try {
    const { tab } = req.params; // Get tab name from URL param
    const { errors, isValid } = validateAssessmentByTab(req.body, tab);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(200).json({
      success: true,
      message: "Validation passed for " + tab,
    });
  } catch (error) {
    console.error("[ASSESSMENT] Error validating assessment step:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate assessment",
      error: error.message,
    });
  }
};

//newassessment is using

exports.newAssessment = async (req, res) => {
  try {
    // Validate the assessment data using Joi
    const { errors, isValid } = validateCreateAssessment(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const {
      AssessmentTitle,
      // AssessmentType,
      NumberOfQuestions,
      Position,
      DifficultyLevel,
      Duration,
      ExpiryDate,
      linkExpiryDays,
      CandidateDetails,
      Instructions,
      AdditionalNotes,
      CreatedBy,
      ownerId,
      tenantId,
      totalScore,
      passScore,
      passScoreType,
      passScoreBy,
      categoryOrTechnology,
    } = req.body;
    console.log("CATEGORY OR TECHNOLOGY =============================> ", categoryOrTechnology);

    // Clean up empty strings for enum fields
    const cleanedPassScoreType =
      passScoreType && passScoreType.trim() !== "" ? passScoreType : undefined;
    const cleanedPassScoreBy =
      passScoreBy && passScoreBy.trim() !== "" ? passScoreBy : undefined;

    const newAssessmentData = {
      AssessmentTitle,
      // AssessmentType,
      Position,
      Duration,
      DifficultyLevel,
      NumberOfQuestions,
      ExpiryDate,
      linkExpiryDays,
      Instructions,
      AdditionalNotes,
      CreatedBy,
      ownerId,
      tenantId,
      totalScore,
      passScore,
      assessmentTemplateList: categoryOrTechnology,
    };

    // Only add these fields if they have valid values
    if (cleanedPassScoreType) {
      newAssessmentData.passScoreType = cleanedPassScoreType;
    }
    if (cleanedPassScoreBy) {
      newAssessmentData.passScoreBy = cleanedPassScoreBy;
    }

    if (
      CandidateDetails &&
      (CandidateDetails.includePosition ||
        CandidateDetails.includePhone ||
        CandidateDetails.includeSkills)
    ) {
      newAssessmentData.CandidateDetails = CandidateDetails;
    }

    // Generate custom AssessmentCode like "ASMT-00001"
    const lastAssessment = await Assessment.findOne({ tenantId })
      .select("AssessmentCode")
      // <-------------------------------v1.0.2
      .sort({ _id: -1 }) // Use _id for sorting instead of AssessmentCode
      // ------------------------------v1.0.2 >
      .lean();

    let nextNumber = 1;
    if (lastAssessment?.AssessmentCode) {
      const match = lastAssessment.AssessmentCode.match(/ASMT-TPL-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Alternative approach: Find the highest number by querying all AssessmentCodes
    // This is more reliable but less efficient - use only if the above approach fails
    // if (nextNumber === 1) {
    //   const allAssessmentCodes = await Assessment.find({
    //     tenantId,
    //     AssessmentCode: { $regex: /^ASMT-TPL-\d+$/ }
    //   })
    //     .select("AssessmentCode")
    //     .lean();

    //   const numbers = allAssessmentCodes
    //     .map(assessment => {
    //       const match = assessment.AssessmentCode.match(/ASMT-TPL-(\d+)/);
    //       return match ? parseInt(match[1], 10) : 0;
    //     })
    //     .filter(num => num > 0);

    //   if (numbers.length > 0) {
    //     nextNumber = Math.max(...numbers) + 1;
    //   }
    // }

    const assessmentCode = `ASMT-TPL-${String(nextNumber).padStart(5, "0")}`;
    newAssessmentData.AssessmentCode = assessmentCode;

    const assessment = new Assessment(newAssessmentData);
    await assessment.save();

    // Create push notification for assessment creation
    try {
      // Pass ownerId as the createdBy parameter
      await createAssessmentCreatedNotification(assessment, assessment.ownerId);
    } catch (notificationError) {
      console.error(
        "[ASSESSMENT] Error creating notification:",
        notificationError
      );
      // Continue execution even if notification fails
    }

    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    console.error("[ASSESSMENT] Error creating assessment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create assessment",
      error: error.message,
    });
  }
};
//update is using

exports.updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
        errors: { id: "Invalid assessment ID format" },
      });
    }

    // Validate the update data using Joi
    const { errors, isValid } = validateUpdateAssessment(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Clean up the data before updating
    const updateData = { ...req.body };

    // Clean empty strings for enum fields
    if (
      updateData.passScoreType !== undefined &&
      (!updateData.passScoreType || updateData.passScoreType.trim() === "")
    ) {
      delete updateData.passScoreType;
    }
    if (
      updateData.passScoreBy !== undefined &&
      (!updateData.passScoreBy || updateData.passScoreBy.trim() === "")
    ) {
      delete updateData.passScoreBy;
    }

    // Update with runValidators to ensure Mongoose schema validation
    const updatedAssessment = await Assessment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAssessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
        errors: { assessment: "Assessment not found" },
      });
    }

    res.status(200).json({
      success: true,
      message: "Assessment updated successfully",
      data: updatedAssessment,
    });
  } catch (error) {
    console.error("[ASSESSMENT] Error updating assessment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update assessment",
      error: error.message,
    });
  }
};

// from here this is new code created by ashraf

// Get assessment results
exports.getAssessmentResults = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Fetch the assessment to get passScoreBy and passScore
    const assessment = await Assessment.findById(assessmentId).select(
      "passScoreBy passScore totalScore"
    );
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Find all active scheduled assessments for this assessment ID
    const scheduledAssessments = await ScheduleAssessment.find({
      assessmentId,
      isActive: true,
    }).select("_id order expiryAt status");

    if (!scheduledAssessments.length) {
      return res.status(200).json([]);
    }

    // Prepare response data
    const results = await Promise.all(
      scheduledAssessments.map(async (schedule) => {
        // Find all candidate assessments for this schedule (not just completed)
        const candidateAssessments = await CandidateAssessment.find({
          scheduledAssessmentId: schedule._id,
          // <-------------------------------v1.0.1
          // Removed isActive: true filter to show cancelled candidates
          // ------------------------------v1.0.1 >
        })
          .populate("candidateId", "FirstName LastName Email CurrentExperience")
          .select(
            "candidateId status totalScore endedAt sections startedAt remainingTime expiryAt"
          );
        // ------------------------------v1.0.0 >
        // Process candidate results with pass/fail logic
        const formattedCandidates = candidateAssessments.map((ca) => {
          let resultStatus = "N/A";
          // <-------------------------------v1.0.0
          if (ca.status === "completed") {
            if (assessment.passScoreBy === "Overall") {
              resultStatus =
                ca.totalScore >= (assessment.passScore || 0) ? "pass" : "fail";
            } else if (assessment.passScoreBy === "Each Section") {
              const sectionResults = ca.sections.map((section) => {
                return section.totalScore >= (section.passScore || 0);
              });
              resultStatus = sectionResults.every((passed) => passed)
                ? "pass"
                : "fail";
            }
          } else {
            resultStatus = ca.status || "N/A";
          }
          // ------------------------------v1.0.0 >

          return {
            id: ca._id,
            candidateId: ca.candidateId._id,
            name: `${ca.candidateId.FirstName} ${ca.candidateId.LastName}`,
            email: ca.candidateId.Email,
            experience: ca.candidateId.CurrentExperience || 0,
            totalScore: ca.totalScore,
            result: resultStatus,
            // <-------------------------------v1.0.0
            status: ca.status, // Add status field
            // ------------------------------v1.0.0 >
            completionDate: ca.endedAt,
            startedAt: ca.startedAt,
            // <-------------------------------v1.0.0
            expiryAt: ca.expiryAt, // Add expiryAt from candidate assessment
            // ------------------------------v1.0.0 >
            sections: ca.sections,
            remainingTime: ca.remainingTime,
            answeredQuestions: ca.sections.reduce((count, section) => {
              return (
                count +
                section.Answers.reduce((acc, answer) => {
                  return !answer.isAnswerLater ? acc + 1 : acc;
                }, 0)
              );
            }, 0),
          };
        });

        return {
          scheduleId: schedule._id,
          order: schedule.order,
          expiryAt: schedule.expiryAt,
          status: schedule.status,
          candidates: formattedCandidates,
        };
      })
    );

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// checking candidates if already assigned for assessment or not

exports.getAssignedCandidates = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!mongoose.isValidObjectId(assessmentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid assessment ID" });
    }

    // Find all active scheduled assessments for this assessmentId
    const scheduledAssessments = await ScheduleAssessment.find({
      assessmentId,
      isActive: true,
    }).select("_id order");

    if (!scheduledAssessments.length) {
      return res.status(200).json({ success: true, assignedCandidates: [] });
    }

    // Extract scheduledAssessmentIds
    const scheduledAssessmentIds = scheduledAssessments.map((sa) => sa._id);

    // Find all candidate assessments with these scheduledAssessmentIds
    const candidateAssessments = await CandidateAssessment.find({
      scheduledAssessmentId: { $in: scheduledAssessmentIds },
      // <-------------------------------v1.0.1
      // Removed isActive: true filter to show cancelled candidates
      // ------------------------------v1.0.1 >
    }).select("candidateId scheduledAssessmentId");

    // Create a mapping of candidateId to their scheduledAssessment details
    const assignedCandidates = candidateAssessments.map((ca) => {
      const schedule = scheduledAssessments.find(
        (sa) => sa._id.toString() === ca.scheduledAssessmentId.toString()
      );
      return {
        candidateId: ca.candidateId.toString(),
        scheduleOrder: schedule ? schedule.order : "Unknown",
      };
    });

    // Remove duplicates by candidateId, keeping the first occurrence
    const uniqueAssignedCandidates = Array.from(
      new Map(
        assignedCandidates.map((item) => [item.candidateId, item])
      ).values()
    );

    res.status(200).json({
      success: true,
      assignedCandidates: uniqueAssignedCandidates,
    });
  } catch (error) {
    console.error("Error fetching assigned candidates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching assigned candidates",
    });
  }
};

// SUPER ADMIN
exports.getAllAssessments = async (req, res) => {
  try {
    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total active assessments
    const totalAssessments = await Assessment.countDocuments({
      status: "Active",
    });

    // Active assessments created this month
    const thisMonth = await Assessment.countDocuments({
      status: "Active",
      createdAt: { $gte: startOfCurrentMonth },
    });

    // Active assessments created last month
    const lastMonth = await Assessment.countDocuments({
      status: "Active",
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });

    // Trend calculation
    let trend = "neutral";
    let trendValue = "0%";

    if (lastMonth > 0) {
      const change = ((thisMonth - lastMonth) / lastMonth) * 100;
      trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";
      trendValue = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    } else if (thisMonth > 0) {
      trend = "up";
      trendValue = "+100%";
    }

    return res.status(200).json({
      metric: {
        title: "Active Assessments",
        value: totalAssessments.toLocaleString(),
        description: "Live assessment sessions",
        trend,
        trendValue,
      },
    });
  } catch (error) {
    console.log("Error in get assessments:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Create new list
exports.createList = async (req, res) => {
  try {
    const { categoryOrTechnology, name, ownerId, tenantId } = req.body;
    if (!name || !ownerId) {
      return res
        .status(400)
        .json({ success: false, message: "Name and ownerId are required" });
    }

    // Check duplicate (case-insensitive)
    const existing = await AssessmentList.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      tenantId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A list with this name already exists.",
      });
    }

    const newList = await AssessmentList.create({
      categoryOrTechnology,
      name,
      ownerId,
      tenantId,
    });

    return res.status(201).json({
      success: true,
      message: "List created successfully",
      data: newList,
    });
  } catch (error) {
    console.error("Error creating list:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all lists
exports.getLists = async (req, res) => {
  try {
    const { tenantId, ownerId } = req.query;

    // Build query dynamically
    const filter = {};
    if (tenantId) filter.tenantId = tenantId;
    if (ownerId) filter.ownerId = ownerId;

    const lists = await AssessmentList.find(filter).sort({ _id: -1 });

    return res.status(200).json({ success: true, data: lists });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
