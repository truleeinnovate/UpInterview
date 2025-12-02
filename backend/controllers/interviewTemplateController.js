// v1.0.0 - Ashok - Added sort when fetching all interview templates
const { default: mongoose } = require("mongoose");
const { Interview } = require("../models/Interview/Interview");
const InterviewTemplate = require("../models/InterviewTemplate");
const { Position } = require("../models/Position/position");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService");

// Create a new interview template
exports.createInterviewTemplate = async (req, res) => {
  try {
    const { tenantId } = req.body;
    // Generate interview template code using centralized service with tenant ID
    const interviewTemplateCode = await generateUniqueId(
      "INT-TPL",
      InterviewTemplate,
      "interviewTemplateCode",
      tenantId
    );

    const template = new InterviewTemplate({
      ...req.body,
      // For now, we'll use a default user ID since auth is not implemented
      createdBy: req.body.tenantId,
      tenantId: req.body.tenantId,
      interviewTemplateCode, // Set the generated code
    });

    const savedTemplate = await template.save();
    res.status(201).json({
      status: "success",
      data: savedTemplate,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    // Validate required fields
    // if (!req.body.tenantId) {
    //     return res.status(400).json({
    //         status: false,
    //         message: 'Tenant ID is required'
    //     });
    // }

    if (!req.body) {
      return res.status(400).json({
        status: false,
        message: "Template data is required",
      });
    }

    // Prepare update data
    const updateData = {
      updatedAt: Date.now(),
    };

    // Handle template data updates
    if (req.body.templateData) {
      Object.assign(updateData, req.body.templateData);
    }

    if (req.body.rounds) {
      if (!Array.isArray(req.body.rounds)) {
        return res.status(400).json({
          status: false,
          message: "Rounds must be an array",
        });
      }

      // Remove _id duplicates and insert based on sequence
      const uniqueRoundsMap = new Map();
      req.body.rounds.forEach((round) => {
        if (round._id) {
          uniqueRoundsMap.set(round._id, round);
        } else {
          uniqueRoundsMap.set(Math.random().toString(), round); // Fallback for new rounds
        }
      });

      // Convert to array and sort by sequence
      let uniqueRounds = Array.from(uniqueRoundsMap.values());
      uniqueRounds.sort((a, b) => (a.sequence || 999) - (b.sequence || 999));

      // Normalize + enrich rounds
      const processedRounds = uniqueRounds.map((round, index) => {
        return {
          roundTitle: round.roundTitle || `Round ${index + 1}`,
          sequence: index + 1,
          duration: round.duration || 60,
          instructions: round.instructions || "",
          interviewMode: round.interviewMode || "virtual",
          interviewerType: round.interviewerType || "",
          selectedInterviewersType: round.selectedInterviewersType || "",
          interviewQuestionsList: round.interviewQuestionsList || [],
          interviewers: round.interviewers || [],
          assessmentId: round.assessmentId || null,
          interviewerGroupId: round.interviewerGroupId || "",
          ...round,
        };
      });

      updateData.rounds = processedRounds;
    }

    // Update the template
    const template = await InterviewTemplate.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.body.tenantId,
      },

      updateData,

      {
        new: true,
        runValidators: true,
      }
    );

    if (!template) {
      return res.status(404).json({
        status: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: template,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(400).json({
      status: false,
      message: error.message || "Failed to update template",
    });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers["x-tenant-id"] || req.query.tenantId;

    // ✅ Validate tenantId
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required",
      });
    }

    // ✅ Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid template ID format",
      });
    }

    // ✅ Check if this template exists
    const template = await InterviewTemplate.findOne({ _id: id, tenantId });
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found or you don't have permission to delete it",
      });
    }

    // ✅ Check if template is used in Interview collection
    const existingInterview = await Interview.findOne({ templateId: id });
    if (existingInterview) {
      return res.status(400).json({
        success: false,
        message:
          "Template cannot be deleted. It is used in one or more Interviews.",
      });
    }

    // ✅ Check if template is used in Position collection
    const existingPosition = await Position.findOne({ templateId: id });
    if (existingPosition) {
      return res.status(400).json({
        success: false,
        message:
          "Template cannot be deleted. It is linked with one or more Positions.",
      });
    }

    // ✅ Safe to delete
    const deletedTemplate = await InterviewTemplate.findOneAndDelete({
      _id: id,
      tenantId,
    });

    if (!deletedTemplate) {
      return res.status(404).json({
        success: false,
        message: "Template not found or already deleted",
      });
    }

    // ✅ Success
    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting interview template:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error while deleting template",
    });
  }
};

exports.deleteRound = async (req, res) => {
  const { roundId } = req.params;

  try {
    const position = await InterviewTemplate.findOne({ "rounds._id": roundId });
    if (!position) {
      return res.status(404).json({ message: "Round not found" });
    }

    // Find the index of the round to delete
    const roundIndex = position.rounds.findIndex(
      (round) => round._id.toString() === roundId
    );
    if (roundIndex === -1) {
      return res.status(404).json({ message: "Round not found" });
    }

    // Remove the round from the array
    position.rounds.splice(roundIndex, 1);

    // Save the updated position
    await position.save();

    res.status(200).json({ message: "Round deleted successfully" });
  } catch (error) {
    console.error("Error deleting round:", error);
    res.status(500).json({ message: "Error deleting round" });
  }
};

exports.getTemplatesByTenantId = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const templates = await InterviewTemplate.find({ tenantId });
    res.status(200).json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: "Error fetching templates" });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    // const template = await InterviewTemplate.findById(id);
    const template = await InterviewTemplate.findById(id)
      .populate({
        path: "rounds.interviewers",
        model: "Contacts",
        select: "firstName lastName email",
      })
      .populate({
        path: "rounds.selectedInterviewers",
        model: "Contacts",
        select: "firstName lastName email",
      })
      .lean();
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json({ template });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Error fetching template" });
  }
};
