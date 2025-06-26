const Assessment = require("../models/assessment");
const { isValidObjectId } = require("mongoose");
const { CandidateAssessment } = require("../models/candidateAssessment");

const mongoose = require("mongoose");
const ScheduleAssessment = require("../models/scheduledAssessmentsSchema"); // Adjust path
const { Candidate } = require("../models/candidate"); // Adjust path
const Notification = require("../models/notification"); // Adjust path if needed
const { encrypt } = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail"); // Adjust path
const emailTemplateModel = require("../models/EmailTemplatemodel"); // Adjust path
const notificationMiddleware = require("../middleware/notificationMiddleware");
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
    const lastAssessment = await Assessment.findOne({})
      .sort({ createdAt: -1 })
      .select("AssessmentCode")
      .lean();

    let nextNumber = 1;
    if (lastAssessment?.AssessmentCode) {
      const match = lastAssessment.AssessmentCode.match(/ASMT-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const assessmentCode = `ASMT-${String(nextNumber).padStart(5, "0")}`;
    newAssessmentData.AssessmentCode = assessmentCode;

    const assessment = new Assessment(newAssessmentData);
    await assessment.save();
    res.status(201).json(assessment);
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
      .json({ message: "Updated successfully.", data: updatedAssessment });
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
        // Find completed candidate assessments for this schedule
        const candidateAssessments = await CandidateAssessment.find({
          scheduledAssessmentId: schedule._id,
          status: "completed",
          isActive: true,
        })
          .populate("candidateId", "FirstName LastName Email CurrentExperience")
          .select(
            "candidateId status totalScore endedAt sections startedAt remainingTime"
          );

        // Process candidate results with pass/fail logic
        const formattedCandidates = candidateAssessments.map((ca) => {
          let resultStatus = "N/A";
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

          return {
            id: ca._id,
            candidateId: ca.candidateId._id,
            name: `${ca.candidateId.FirstName} ${ca.candidateId.LastName}`,
            email: ca.candidateId.Email,
            experience: ca.candidateId.CurrentExperience || 0,
            totalScore: ca.totalScore,
            result: resultStatus,
            completionDate: ca.endedAt,
            startedAt: ca.startedAt,
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

    res.status(200).json(results);
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
      isActive: true,
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
