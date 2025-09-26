// v1.0.0  -  Ashraf  -  fixed assessment result tab issue.before getting only completed status data now we will display all status data
// v1.0.1  -  Ashraf  -  fixed assessment code issue.now it will generate assessment code like ASMT-TPL-00001 and assessment name to assessment template
// v1.0.2  -  Ashraf  -  fixed assessment code issue.now it will generate assessment code like ASMT-TPL-00001 and assessment name to assessment template
 // <-------------------------------v1.0.1
const Assessment = require("../models/Assessment/assessmentTemplates.js");
// ------------------------------v1.0.1 >
const { isValidObjectId } = require("mongoose");
const { CandidateAssessment } = require("../models/Assessment/candidateAssessment.js");

const mongoose = require("mongoose");
const ScheduleAssessment = require("../models/Assessment/assessmentsSchema.js"); 
const { Candidate } = require("../models/candidate.js");
const Notification = require("../models/notification");
const { encrypt } = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const emailTemplateModel = require("../models/EmailTemplatemodel");
const notificationMiddleware = require("../middleware/notificationMiddleware");

// Import push notification functions
const {createAssessmentCreatedNotification} = require("./PushNotificationControllers/pushNotificationAssessmentController");

//newassessment is using

exports.newAssessment = async (req, res) => {
  try {
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
    } = req.body;

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
    };

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
      console.error('[ASSESSMENT] Error creating notification:', notificationError);
      // Continue execution even if notification fails
    }
    
    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//update is using

exports.updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    const updatedAssessment = await Assessment.findByIdAndUpdate(id, req.body);

    if (!updatedAssessment) {
      return res.status(404).json({ error: "Assessment not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Updated successfully.", data: updatedAssessment });
  } catch (error) {
    console.error("Error updating assessment:", error);
    res.status(500).json({ error: error.message });
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
