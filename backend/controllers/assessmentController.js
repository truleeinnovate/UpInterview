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
const { generateUniqueId } = require("../services/uniqueIdGeneratorService");

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
const { buildPermissionQuery } = require("../utils/buildPermissionQuery.js");

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
  // Mark that logging will be handled by this controller
  // res.locals.loggedByController = true;
  // res.locals.processName = "Delete Assessment";

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

    // ✅ 3️⃣ Delete related selected assessment questions (added new)
    const deletedQuestions = await selectedAssessmentquestions
      .deleteMany({
        assessmentId: id,
      })
      .session(session);

    // ✅ Commit transaction if everything succeeded
    await session.commitTransaction();
    session.endSession();

    // Generate logs for successful delete
    // res.locals.logData = {
    //   tenantId: assessment?.tenantId || req.body?.tenantId || "",
    //   ownerId: assessment?.ownerId || req.body?.ownerId || "",
    //   processName: "Delete Assessment",
    //   requestBody: req.body,
    //   status: "success",
    //   message: "Assessment and related data deleted successfully",
    //   responseBody: {
    //     assessmentId: id,
    //     deletedCandidateAssessments,
    //     deletedQuestions,
    //   },
    // };

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

    // Generate logs for error case
    // res.locals.logData = {
    //   tenantId: req.body?.tenantId || "",
    //   ownerId: req.body?.ownerId || "",
    //   processName: "Delete Assessment",
    //   requestBody: req.body,
    //   status: "error",
    //   message: error.message,
    // };

    res.status(500).json({
      success: false,
      message: "Failed to delete assessment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params; // Assessment ID from URL params
    // const { tenantId, ownerId } = req.query; // Optional query params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assessment ID is required",
      });
    }

    // Build base query
    const query = { _id: id };

    // Add optional filters if provided
    // if (tenantId) {
    //   query.tenantId = tenantId;
    // }
    // if (ownerId) {
    //   query.ownerId = ownerId;
    // }

    const assessment = await Assessment.findOne(query)
      .populate("Position", "title")
      .populate("assessmentTemplateList", "name")
      .lean();

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create Assessment";

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
      externalId,
      totalScore,
      passScore,
      passScoreType,
      passScoreBy,
      categoryOrTechnology,
    } = req.body;

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
      externalId,
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

    // Generate assessment code using centralized service with tenant ID
    const assessmentCode = await generateUniqueId(
      "ASMT-TPL",
      Assessment,
      "AssessmentCode",
      tenantId
    );
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

    const populatedAssessment = await Assessment.findById(assessment._id)
      .populate("Position", "title")
      .populate("assessmentTemplateList", "categoryOrTechnology")
      .lean();

    const feedMetadata = {
      AssessmentTitle: populatedAssessment.AssessmentTitle,
      Position: populatedAssessment.Position?.title || "",
      categoryOrTechnology:
        populatedAssessment.assessmentTemplateList?.categoryOrTechnology || "",
      DifficultyLevel: populatedAssessment.DifficultyLevel,
      Duration: populatedAssessment.Duration,
    };

    // Generate feed for assessment creation
    res.locals.feedData = {
      tenantId: tenantId || "",
      feedType: "info",
      action: {
        name: "assessment_created",
        description: `Assessment was created successfully`,
      },
      ownerId: ownerId || "",
      parentId: assessment._id,
      parentObject: "Assessment",
      // metadata: req.body,
      metadata: feedMetadata,
      severity: res.statusCode >= 500 ? "high" : "low",
      message: `Assessment was created successfully`,
    };

    // Generate logs for successful assessment creation
    res.locals.logData = {
      tenantId: tenantId || "",
      ownerId: ownerId || "",
      processName: "Create Assessment",
      requestBody: req.body,
      status: "success",
      message: "Assessment created successfully",
      responseBody: assessment,
    };

    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    console.error("[ASSESSMENT] Error creating assessment:", error);
    // Generate logs for error case
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Create Assessment",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({
      success: false,
      message: "Failed to create assessment",
      error: error.message,
    });
  }
};
//update is using

exports.updateAssessment = async (req, res) => {
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Update Assessment";

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
    // Get the current assessment to compare status changes
    const currentAssessment = await Assessment.findById(id);
    const oldStatus = currentAssessment.status;

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAssessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Detect changes between current assessment and incoming updateData
    const changes = [];
    const excludedFields = [
      "_id",
      "__v",
      "createdAt",
      "updatedAt",
      "tenantId",
      "ownerId",
    ];

    Object.keys(updateData).forEach((key) => {
      if (excludedFields.includes(key)) return;

      const oldValue = currentAssessment[key];
      const newValue = updateData[key];

      // Comparison for objects/arrays vs primitives
      const isDifferent =
        typeof oldValue === "object" && oldValue !== null
          ? JSON.stringify(oldValue) !== JSON.stringify(newValue)
          : oldValue !== newValue;

      if (isDifferent) {
        changes.push({
          fieldName: key,
          oldValue,
          newValue,
        });
      }
    });

    const isEmptyValue = (val) => {
      return (
        val === null ||
        val === undefined ||
        (typeof val === "string" && val.trim() === "")
      );
    };

    // Helper to format values for the message string
    const formatValue = (val) => {
      if (val === null || val === undefined) return "None";

      // If it's an array of skills, map the skill names
      if (Array.isArray(val)) {
        if (val.length === 0) return "Empty List";
        // Check if it's the skills array (objects with a 'skill' property)
        if (val[0] && typeof val[0] === "object" && val[0].skill) {
          return val.map((s) => s.skill).join(", ");
        }
        // Fallback for other arrays
        return JSON.stringify(val);
      }

      // If it's a single object (that isn't an array)
      if (typeof val === "object") {
        return JSON.stringify(val);
      }

      return val.toString();
    };

    const populatedAssessment = await Assessment.findById(updatedAssessment._id)
      .populate("Position", "title")
      .populate("assessmentTemplateList", "categoryOrTechnology")
      .lean();

    const mergedMetadata = {
      ...req.body,

      // Replace IDs with readable values
      Position: populatedAssessment.Position?.title || req.body.Position,

      categoryOrTechnology:
        populatedAssessment.assessmentTemplateList?.categoryOrTechnology ||
        req.body.categoryOrTechnology,
    };

    // Only set feedData and logData when there are actual changes
    res.locals.feedData = {
      tenantId: updatedAssessment?.tenantId || req.body?.tenantId || "",
      feedType: "update",
      action: {
        name: "assessment_updated",
        description: `Assessment was updated`,
      },
      ownerId: updatedAssessment?.ownerId || req.body?.ownerId || "",
      parentId: updatedAssessment?._id,
      parentObject: "Assessment",
      // metadata: req.body,
      metadata: mergedMetadata,
      severity: res.statusCode >= 500 ? "high" : "low",
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: `${fieldName} updated from '${formatValue(
          oldValue
        )}' to '${formatValue(newValue)}'`,
      })),
      history: changes,
    };

    // Generate logs for successful update
    res.locals.logData = {
      tenantId: updatedAssessment?.tenantId || req.body?.tenantId || "",
      ownerId: updatedAssessment?.ownerId || req.body?.ownerId || "",
      processName: "Update Assessment",
      requestBody: req.body,
      status: "success",
      message: "Assessment updated successfully",
      responseBody: updatedAssessment,
    };

    res.status(200).json({
      success: true,
      message: "Assessment updated successfully",
      data: updatedAssessment,
    });
  } catch (error) {
    console.error("[ASSESSMENT] Error updating assessment:", error);
    // Generate logs for error case
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Assessment",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

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
    const { actingAsUserId, actingAsTenantId } = res.locals.auth;

    const {
      effectivePermissions,
      inheritedRoleIds,
      effectivePermissions_RoleType,
      effectivePermissions_RoleName,
    } = res.locals;

    const permissionQuery = await buildPermissionQuery(
      actingAsUserId,
      actingAsTenantId,
      inheritedRoleIds || [],
      effectivePermissions_RoleType,
      effectivePermissions_RoleName
    );

    // let query = { ...permissionQuery };

    // conosle.log("[ASSESSMENT] query:", query);

    // Fetch the assessment to get passScoreBy and passScore
    const assessment = await Assessment.find({
      _id: assessmentId,
      // ...permissionQuery,
    }).select("passScoreBy passScore totalScore");

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Find all active scheduled assessments for this assessment ID
    const scheduledAssessments = await ScheduleAssessment.find({
      assessmentId,
      ...permissionQuery,
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
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Create new list
exports.createList = async (req, res) => {
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create Assessment List";

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

    // Generate feed for assessment creation
    res.locals.feedData = {
      tenantId: tenantId || "",
      feedType: "info",
      action: {
        name: "assessment_list_created",
        description: `Assessment list was created successfully`,
      },
      ownerId: ownerId || "",
      parentId: req.body._id,
      parentObject: "AssessmentList",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      message: `Assessment list was created successfully`,
    };

    // Generate logs for successful list creation
    res.locals.logData = {
      tenantId: tenantId || "",
      ownerId: ownerId || "",
      processName: "Create Assessment List",
      requestBody: req.body,
      status: "success",
      message: "List created successfully",
      responseBody: newList,
    };

    return res.status(201).json({
      success: true,
      message: "List created successfully",
      data: newList,
    });
  } catch (error) {
    console.error("Error creating list:", error);
    // Generate logs for error case
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Create Assessment List",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all lists
// exports.getLists = async (req, res) => {
//   try {
//     const { tenantId, ownerId } = req.query;

//     // Build query dynamically
//     const filter = {};
//     if (tenantId) filter.tenantId = tenantId;
//     if (ownerId) filter.ownerId = ownerId;

//     const lists = await AssessmentList.find(filter).sort({ _id: -1 });

//     return res.status(200).json({ success: true, data: lists });
//   } catch (error) {
//     console.error("Error fetching lists:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };
