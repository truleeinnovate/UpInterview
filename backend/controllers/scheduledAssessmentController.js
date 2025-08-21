// v1.0.0  -  Ashraf  -  fixed name schedule assessment to assessment schema
const { CandidateAssessment } = require("../models/Assessment/candidateAssessment");
const Otp = require("../models/Otp");
// <-------------------------------v1.0.0
const scheduledAssessmentsSchema = require("../models/Assessment/assessmentsSchema");
// ------------------------------v1.0.0 >
const mongoose = require("mongoose");

exports.getScheduledAssessmentsListBasedOnId = async (req, res) => {
  try {
    const { id } = req.params;
    const scheduledAssessment = await scheduledAssessmentsSchema
      .findById(id)
      .populate({
        path: 'assessmentId',
        populate: {
          path: 'Position',
          model: 'Position' // Assuming your position model is named 'Position'
        }
      });

    return res.status(200).send({
      message: "Retrieved scheduled assessments",
      success: true,
      scheduledAssessment,
    });
  } catch (error) {
    console.log("error in getting scheduled assessment from backed", error);
    res.status(500).send({
      message: "Failed to get scheduled assessment",
      success: false,
      error: error.message,
    });
  }
};
exports.getScheduledAssessmentsWithCandidates = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!mongoose.isValidObjectId(assessmentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid assessment ID" });
    }

    // Find all active scheduled assessments for the given assessmentId
    const scheduledAssessments = await scheduledAssessmentsSchema
      .find({
        assessmentId,
        isActive: true,
      })
      .select("_id order expiryAt status createdAt");

    if (!scheduledAssessments.length) {
      return res.status(200).json([]);
    }

    // Fetch candidate assessments for all scheduled assessments
     // <-------------------------------v1.0.0
    // Remove isActive filter to show cancelled candidates as well
    const scheduledIds = scheduledAssessments.map((sa) => sa._id);
    const candidateAssessments = await CandidateAssessment.find({
      scheduledAssessmentId: { $in: scheduledIds },
      // Removed isActive: true filter to show cancelled candidates
    })
     // <-------------------------------v1.0.0
      .populate("candidateId");

    // Group candidate assessments by scheduledAssessmentId
    const schedulesWithCandidates = scheduledAssessments.map((schedule) => {
      const candidates = candidateAssessments.filter(
        (ca) => ca.scheduledAssessmentId.toString() === schedule._id.toString()
      );
      return {
        _id: schedule._id,
        order: schedule.order,
        expiryAt: schedule.expiryAt,
        status: schedule.status,
        createdAt: schedule.createdAt,
        candidates,
      };
    });

    res.status(200).json({ success: true, data: schedulesWithCandidates });
  } catch (error) {
    console.error(
      "Error fetching scheduled assessments with candidates:",
      error
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createScheduledAssessment = async (req, res) => {
  try {
    const {
      assessmentId,
      organizationId,
      expiryAt,
      status,
      rescheduledFrom,
      proctoringEnabled,
      createdBy,
      order,
    } = req.body;

    // Generate custom code like ASMT-TPL-00001
    const lastScheduled = await scheduledAssessmentsSchema.findOne({ })
      .select("scheduledAssessmentCode")
      .lean();

    let nextNumber = 1;
    if (lastScheduled?.scheduledAssessmentCode) {
      const match =
        lastScheduled.scheduledAssessmentCode.match(/ASMT-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const scheduledAssessmentCode = `ASMT-${String(nextNumber).padStart(
      5,
      "0"
    )}`;

    console.log("expiryAt---", expiryAt);
    // Build new object
    const scheduledAssessment = new scheduledAssessmentsSchema({
      scheduledAssessmentCode,
      assessmentId,
      organizationId,
      expiryAt,
      status,
      rescheduledFrom,
      proctoringEnabled,
      createdBy,
      order: order || "Assessment 1",
    });

    // Save to DB
    const savedAssessment = await scheduledAssessment.save();

    res.status(201).json({
      status: "success",
      message: "Scheduled assessment created successfully",
      data: savedAssessment,
    });
  } catch (error) {
    console.error("Error creating scheduled assessment:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create scheduled assessment",
      error: error.message,
    });
  }
};
