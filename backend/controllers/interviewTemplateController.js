// v1.0.0 - Ashok - Added sort when fetching all interview templates
const InterviewTemplate = require("../models/InterviewTemplate");

// Create a new interview template
exports.createInterviewTemplate = async (req, res) => {
  try {
    const { tenantId } = req.body;
    // Generate custom code like ASMT-TPL-00001
    const lastTemplate = await InterviewTemplate.findOne({ tenantId })
      .sort({ _id: -1 })
      .select("interviewTemplateCode")
      .lean();

    let nextNumber = 1;
    if (lastTemplate?.interviewTemplateCode) {
      const match = lastTemplate.interviewTemplateCode.match(/INT-TPL-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const interviewTemplateCode = `INT-TPL-${String(nextNumber).padStart(
      5,
      "0"
    )}`;

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

// Get all interview templates for a tenant
// Get all interview templates based on organization or owner
// exports.getAllTemplates = async (req, res) => {
//   try {
//     const { tenantId, ownerId, organization } = req.query;

//     let filter = {};

//     if (organization === "true") {
//       if (!tenantId) {
//         console.error("Missing tenantId for organization");
//         return res.status(400).json({
//           success: false,
//           message: "tenantId is required for organization",
//         });
//       }
//       filter.tenantId = tenantId;
//     } else {
//       if (!ownerId) {
//         console.error("Missing ownerId for individual user");
//         return res.status(400).json({
//           success: false,
//           message: "ownerId is required for individual user",
//         });
//       }
//       filter.ownerId = ownerId;
//       console.log("Filtering by ownerId:", ownerId);
//     }

//     // const templates = await InterviewTemplate.find(filter).populate('rounds.interviewers');

//     // Only populate firstName and lastName of interviewers
//     // Populate only firstName and lastName for interviewers
//     const templates = await InterviewTemplate.find(filter).populate({
//       path: "rounds.interviewers",
//       model: "Contacts",
//       select: "firstName lastName email",
//       // select: "firstName lastName _id", // limit fields
//     // v1.0.0 <-------------------------------------------------------------------------
//     }).sort({ _id: -1 }); // _id in MongoDB roughly reflects creation order
//     // v1.0.0 ------------------------------------------------------------------------->


//     // Transform output: map interviewers to a single "name" field
//     const transformedTemplates = templates.map((template) => {
//       const templateObj = template.toObject();
//       // templateObj.rounds = templateObj.rounds.map((round) => {
//       //   if (Array.isArray(round.interviewers)) {
//       //     round.interviewers = round.interviewers.map((interviewer) => ({
//       //       _id: interviewer._id,
//       //       name: `${interviewer.firstName} ${interviewer.lastName}`.trim(),
//       //     }));
//       //   }
//       //   return round;
//       // });

//       return templateObj;
//     });

//     return res.status(200).json({
//       success: true,
//       data: transformedTemplates,
//     });
//   } catch (error) {
//     console.error(
//       "Error fetching interview templates:",
//       error.message,
//       error.stack
//     );
//     return res.status(500).json({
//       success: false,
//       message: "Server error. Please try again later.",
//       error: error.message,
//     });
//   }
// };

// Get template by ID
// exports.getTemplateById = async (req, res) => {
//     try {
//         const tenantId = req.query.tenantId;
//         const template = await InterviewTemplate.findOne({
//             _id: req.params.id,
//             tenantId
//         });

//         if (!template) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Template not found'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: template
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

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

    // console.log("req.body", req.body);

    // Prepare update data
    const updateData = {
      updatedAt: Date.now(),
    };

    // Handle template data updates
    if (req.body.templateData) {
      Object.assign(updateData, req.body.templateData);
    }

    // Validate and process rounds if present
    // v1.0.0 <-------------------------------------------------------------------------------
    // if (req.body.rounds) {
    //   // Validate rounds is an array
    //   if (!Array.isArray(req.body.rounds)) {
    //     return res.status(400).json({
    //       status: false,
    //       message: "Rounds must be an array",
    //     });
    //   }

    //   // Process each round
    //   const processedRounds = req.body.rounds.map((round, index) => {
    //     // Ensure sequence is set - use provided or default to position
    //     const sequence =
    //       typeof round.sequence === "number" ? round.sequence : index + 1;

    //     console.log("req.body.rounds", req.body.rounds);

    //     // Return the processed round with required fields
    //     return {
    //       roundTitle: round.roundTitle || `Round ${index + 1}`,
    //       sequence,
    //       duration: round.duration || 60,
    //       instructions: round.instructions || "",
    //       interviewMode: round.interviewMode || "virtual",
    //       interviewerType: round.interviewerType || "",
    //       selectedInterviewersType: round.selectedInterviewersType || "",
    //       // selectedInterviewerIds: round.selectedInterviewerIds || [],
    //       interviewQuestionsList: round.interviewQuestionsList || [],
    //       interviewers: round.interviewers || [],
    //       assessmentId: round.assessmentId || null,
    //       // interviewerGroupId: round.interviewerGroupId || null,
    //       interviewers: round.interviewers || [],
    //       // minimumInterviewers: round.minimumInterviewers || '1',
    //       // Include any other fields from the original round
    //       ...round,
    //     };
    //   });

    //   // Replace the rounds in the request body with processed rounds
    //   updateData.rounds = processedRounds;
    // }

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
          ...round,
        };
      });

      updateData.rounds = processedRounds;
    }

    // v1.0.0 ------------------------------------------------------------------------------->
    // console.log("req", req.body);

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
    // console.log("template", template);

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
    // For now, we'll use a default tenant ID since auth is not implemented
    // const tenantId = "670286b86ebcb318dab2f676";
    const template = await InterviewTemplate.findOneAndDelete({
      _id: req.params.id,
      tenantId,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
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
