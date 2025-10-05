// v1.0.0  - mansoor - removed the sort by createdAt in the mock interview controller to save the mockinterview in the online
// v1.0.1 - Ashok - added the sort by _id in the createMockInterview controller
// v1.0.2 - Added backend validation for mock interview
// controllers/mockInterviewController.js
const { MockInterview } = require("../models/Mockinterview/mockinterview");
const { MockInterviewRound } = require("../models/Mockinterview/mockinterviewRound");
const { validateMockInterview, validateMockInterviewUpdate } = require("../validations/mockInterviewValidation");

// exports.createMockInterview = async (req, res) => {
//   // Mark that logging will be handled by the controller
//   res.locals.loggedByController = true;
//   res.locals.processName = "Create mock interview";

//   try {
//     // Validate request data
//     const validation = validateMockInterview(req.body);
//     if (!validation.isValid) {
//       return res.status(400).json({
//         status: "error",
//         message: "Validation failed",
//         errors: validation.errors
//       });
//     }

//     const {
//       skills,
//       ownerId,
//       tenantId,
//       candidateName,
//       higherQualification,
//       currentExperience,
//       technology,
//       Role,
//       jobDescription,
//       rounds,
//       createdById,
//       lastModifiedById,
      
//     } = req.body;

//     // ✅ Generate custom mockInterviewCode like MINT-00001
//     const lastMockInterview = await MockInterview.findOne({})
//       // <---------------- v1.0.0
//       // .sort({ createdAt: -1 })
//       // v1.0.1 ------------------------------------->
//       .sort({_id:-1})
//       // v1.0.1 <-------------------------------------
//       // v1.0.0------------------->
//       .select("mockInterviewCode")
//       .lean();

//     let nextNumber = 1;
//     if (lastMockInterview?.mockInterviewCode) {
//       const match = lastMockInterview.mockInterviewCode.match(/MINT-(\d+)/);
//       if (match) {
//         nextNumber = parseInt(match[1], 10) + 1;
//       }
//     }

//     const mockInterviewCode = `MINT-${String(nextNumber).padStart(5, "0")}`;

//     const mockInterview = new MockInterview({
//       // title,
//       skills,
//       // dateTime,
//       // interviewer,
//       // interviewType,
//       // duration,
//       // instructions,
//       Role,
//       // rounds,
//       candidateName,
//       higherQualification,
//       currentExperience,
//       technology,
//       jobDescription,
//       ownerId,
//       tenantId,
//       mockInterviewCode,
//       createdBy: createdById || ownerId, // Map createdById to createdBy, fallback to ownerId
//       updatedBy: lastModifiedById || createdById || ownerId, // Map lastModifiedById to updatedBy
//     });
//     const newMockInterview = await mockInterview.save();
    
//     // const mockInterviews = await MockInterview.find({ ownerId });
//     // Generate feed
//     res.locals.feedData = {
//       tenantId,
//       feedType: "info",
//       action: {
//         name: "mock_interview_created",
//         description: `Mock interview was created successfully`,
//       },
//       ownerId,
//       parentId: newMockInterview._id,
//       parentObject: "Mock interview",
//       metadata: req.body,
//       severity: res.statusCode >= 500 ? "high" : "low",
//       message: `Mock interview was created successfully`,
//     };

//     // Generate logs
//     res.locals.logData = {
//       tenantId,
//       ownerId,
//       processName: "Create mock interview",
//       requestBody: req.body,
//       message: "Mock interview created successfully",
//       status: "success",
//       responseBody: newMockInterview,
//     };

//     // Send response
//     res.status(201).json({
//       status: "success",
//       message: "Mock interview created successfully",
//       data: newMockInterview,
//     });
//   } catch (error) {
//     console.error("Error creating mock interview:", error);
//     // Generate logs for the error
//     res.locals.logData = {
//       tenantId: req.body.tenantId,
//       ownerId: req.body.ownerId,
//       processName: "Create mock interview",
//       requestBody: req.body,
//       message: error.message,
//       status: "error",
//     };

//     // Send error response
//     res.status(500).json({
//       status: "error",
//       message: "Failed to create mock interview. Please try again later.",
//       data: { error: error.message },
//     });
//   }
// };

exports.createMockInterview = async (req, res) => {
  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create mock interview with rounds";

  // const session = await mongoose.startSession();
  // session.startTransaction();
  console.log("req.body", req.body);

  try {
    // Validate request data
        const validation = validateMockInterview(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: validation.errors
      });
    }

    const {
      skills,
      ownerId,
      tenantId,
      candidateName,
      higherQualification,
      currentExperience,
      technology,
      Role,
      jobDescription,
      rounds, // Now rounds are included in the request
      createdById,
      lastModifiedById,
    } = req.body;

    // ✅ Generate custom mockInterviewCode like MINT-00001
    const lastMockInterview = await MockInterview.findOne({})
      .sort({ _id: -1 })
      .select("mockInterviewCode")
      .lean();

    let nextNumber = 1;
    if (lastMockInterview?.mockInterviewCode) {
      const match = lastMockInterview.mockInterviewCode.match(/MINT-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const mockInterviewCode = `MINT-${String(nextNumber).padStart(5, "0")}`;

    // Create mock interview
    const mockInterview = new MockInterview({
      skills,
      Role,
      candidateName,
      higherQualification,
      currentExperience,
      technology,
      jobDescription,
      ownerId,
      tenantId,
      mockInterviewCode,
      createdBy: createdById || ownerId,
      updatedBy: lastModifiedById || createdById || ownerId,
    });

    const newMockInterview = await mockInterview.save();

    // Create rounds if provided
    let createdRounds = [];
    if (rounds && Array.isArray(rounds) && rounds.length > 0) {
      const roundPromises = rounds.map((round, index) => {
        const mockInterviewRound = new MockInterviewRound({
          mockInterviewId: newMockInterview._id,
          sequence: round.sequence || index + 1,
          roundTitle: round.roundTitle,
          interviewMode: round.interviewMode,
          interviewType: round.interviewType,
          interviewerType: round.interviewerType,
          duration: round.duration,
          instructions: round.instructions,
          dateTime: round.dateTime,
          interviewerViewType: round.interviewerViewType,
          interviewers: round.interviewers || [],
          status: round.status || "Draft",
          currentAction: round.currentAction,
          currentActionReason: round.currentActionReason
        });
        
        return mockInterviewRound.save();
      });

      createdRounds = await Promise.all(roundPromises);
    }

    // await session.commitTransaction();

    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: "info",
      action: {
        name: "mock_interview_created",
        description: `Mock interview with ${createdRounds.length} rounds was created successfully`,
      },
      ownerId,
      parentId: newMockInterview._id,
      parentObject: "Mock interview",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      message: `Mock interview with ${createdRounds.length} rounds was created successfully`,
    };

    // Generate logs
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Create mock interview with rounds",
      requestBody: req.body,
      message: "Mock interview with rounds created successfully",
      status: "success",
      responseBody: {
        mockInterview: newMockInterview,
        rounds: createdRounds
      },
    };

    // Send response
    res.status(201).json({
      status: "success",
      message: `Mock interview with ${createdRounds.length} rounds created successfully`,
      data: {
        mockInterview: newMockInterview,
        rounds: createdRounds
      },
    });
  } catch (error) {
    // await session.abortTransaction();
    console.error("Error creating mock interview with rounds:", error);
    
    // Generate logs for the error
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create mock interview with rounds",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    // Send error response
    res.status(500).json({
      status: "error",
      message: "Failed to create mock interview with rounds. Please try again later.",
      data: { error: error.message },
    });
  } finally {
    // session.endSession();
  }
};


exports.updateMockInterview = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update mock interview";
  const mockId = req.params.id;
  
  console.log("UPDATE - mockId:", mockId);
  console.log("UPDATE - req.body:", req.body);

  try {
    // Validate update data using PATCH validation (more flexible)
    const validation = validateMockInterviewUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: validation.errors
      });
    }

    const {
      skills,
      ownerId,
      tenantId,
      candidateName,
      higherQualification,
      currentExperience,
      technology,
      Role,
      jobDescription,
      rounds,
      createdById,
      lastModifiedById,
    } = req.body;

    // Find existing mock interview
    const existingMockInterview = await MockInterview.findById(mockId);
    if (!existingMockInterview) {
      return res.status(404).json({
        status: "error",
        message: "Mock interview not found"
      });
    }

    // Track changes for logging
    const changes = [];

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      changes.push({
        fieldName: "skills",
        oldValue: existingMockInterview.skills,
        newValue: skills,
      });
      existingMockInterview.skills = skills;
    }

    // Update basic fields
    const basicFields = {
      candidateName,
      higherQualification,
      currentExperience,
      technology,
      Role,
      jobDescription
    };

    Object.keys(basicFields).forEach(field => {
      if (basicFields[field] !== undefined && existingMockInterview[field] !== basicFields[field]) {
        changes.push({
          fieldName: field,
          oldValue: existingMockInterview[field],
          newValue: basicFields[field]
        });
        existingMockInterview[field] = basicFields[field];
      }
    });

    // Update metadata fields
    if (lastModifiedById) {
      existingMockInterview.updatedBy = lastModifiedById;
    }
    existingMockInterview.updatedAt = new Date();

    // Handle rounds update - COMPLETE ROUNDS MANAGEMENT
    if (rounds && Array.isArray(rounds)) {
      console.log("Updating rounds for mock interview:", mockId);
      
      // Delete existing rounds and create new ones (or update if you have round IDs)
      await MockInterviewRound.deleteMany({ mockInterviewId: mockId });
      
      const roundPromises = rounds.map((round, index) => {
        const mockInterviewRound = new MockInterviewRound({
          mockInterviewId: mockId,
          sequence: round.sequence || index + 1,
          roundTitle: round.roundTitle,
          interviewMode: round.interviewMode,
          interviewType: round.interviewType,
          interviewerType: round.interviewerType,
          duration: round.duration,
          instructions: round.instructions,
          dateTime: round.dateTime,
          interviewerViewType: round.interviewerViewType,
          interviewers: round.interviewers || [],
          status: round.status || "Draft",
          currentAction: round.currentAction,
          currentActionReason: round.currentActionReason,
          meetingId: round.meetingId
        });
        
        return mockInterviewRound.save();
      });

      const updatedRounds = await Promise.all(roundPromises);
      changes.push({
        fieldName: "rounds",
        oldValue: "previous rounds",
        newValue: `${updatedRounds.length} updated rounds`
      });

      // Also store rounds reference in main document if needed
      existingMockInterview.rounds = updatedRounds.map(round => round._id);
    }

    // Save the updated mock interview
    const updatedMockInterview = await existingMockInterview.save();

    // Generate feed
    res.locals.feedData = {
      tenantId: tenantId || existingMockInterview.tenantId,
      feedType: "update",
      action: {
        name: "mock_interview_updated",
        description: `Mock interview was updated successfully`,
      },
      ownerId: ownerId || existingMockInterview.ownerId,
      parentId: mockId,
      parentObject: "Mock interview",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
      })),
      history: changes,
    };

    // Generate logs
    res.locals.logData = {
      tenantId: tenantId || existingMockInterview.tenantId,
      ownerId: ownerId || existingMockInterview.ownerId,
      processName: "Update mock interview",
      requestBody: req.body,
      message: "Mock interview updated successfully",
      status: "success",
      responseBody: updatedMockInterview,
    };

    // Get updated rounds for response
    const updatedRounds = await MockInterviewRound.find({ mockInterviewId: mockId });

    // Send response
    res.status(200).json({
      status: "success",
      message: "Mock interview updated successfully",
      data: {
        mockInterview: updatedMockInterview,
        rounds: updatedRounds
      },
    });

  } catch (error) {
    console.error("Error updating MockInterview:", error);
    
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Update mock interview",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    res.status(500).json({
      status: "error",
      message: "Failed to update mock interview. Please try again later.",
      data: { error: error.message },
    });
  }
};



// exports.updateMockInterview = async (req, res) => {
//   res.locals.loggedByController = true;
//   res.locals.processName = "Update mock interview";
//   const mockId = req.params.id;
//   console.log("mockId",mockId);
  
//   const { tenantId, ownerId, ...updateFields } = req.body;

//   console.log("req.body",req.body);
  
//   try {
//     // Validate update data
//     const { error } = mockInterviewUpdateSchema.validate(updateFields, { abortEarly: false });
//     if (error) {
//       const errors = {};
//       error.details.forEach((err) => {
//         // Handle nested field paths
//         let field = err.path.join(".");
//         if (field.includes(".0.")) {
//           field = field.replace(/\.\d+\./g, ".");
//         }
//         errors[field] = err.message;
//       });
      
//       return res.status(400).json({
//         status: "error",
//         message: "Validation failed",
//         errors
//       });
//     }
//     const currentMockInterview = await MockInterview.findById(mockId);
//     if (!currentMockInterview) {
//       console.error("MockInterview not found for ID:", mockId);
//       return res.status(404).json({ message: "MockInterview not found" });
//     }

//     // Track changes for logging
//     const changes = [];

//     // Handle skills update (replace entirely - don't merge)
//     if (updateFields.skills && Array.isArray(updateFields.skills)) {
//       // Track changes for logging
//       changes.push({
//         fieldName: "skills",
//         oldValue: currentMockInterview.skills.map((s) => s.skill),
//         newValue: updateFields.skills.map((s) => s.skill),
//       });
      
//       // Replace the entire skills array with the new one
//       currentMockInterview.skills = updateFields.skills;
//     }

//     // Handle rounds update
//     if (
//       updateFields.rounds &&
//       Array.isArray(updateFields.rounds) &&
//       updateFields.rounds.length > 0
//     ) {
//       const newRound = updateFields.rounds[0]; // Assume single round for now
//       const oldRound = currentMockInterview.rounds || {};

//       // Track changes in rounds fields
//       Object.entries(newRound).forEach(([key, newValue]) => {
//         const oldValue = oldRound[key];
//         if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
//           changes.push({
//             fieldName: `rounds.${key}`,
//             oldValue: oldValue === undefined ? "undefined" : oldValue,
//             newValue,
//           });
//         }
//       });

//       // Special handling for status
//       if (newRound.status === "Reschedule") {
//         newRound.status = "scheduled";
//       } else if (newRound.status === "cancel") {
//         newRound.status = "cancelled";
//       }

//       // Update interviewers (ensure it's an array of ObjectIds)
//       if (newRound.interviewers) {
//         currentMockInterview.rounds.interviewers = newRound.interviewers.map(
//           (id) => id
//         );
//       }

//       // Update other round fields
//       currentMockInterview.rounds = {
//         ...currentMockInterview.rounds,
//         ...newRound,
//       };
//       currentMockInterview.markModified("rounds");
//     }

//     // Map frontend fields to schema fields
//     if (updateFields.createdById) {
//       updateFields.createdBy = updateFields.createdById;
//       delete updateFields.createdById;
//     }
//     if (updateFields.lastModifiedById) {
//       updateFields.updatedBy = updateFields.lastModifiedById;
//       delete updateFields.lastModifiedById;
//     }

//     // Update top-level fields
//     const topLevelFields = [
//       "candidateName",
//       "higherQualification",
//       "currentExperience",
//       "technology",
//       "jobDescription",
//       "Role",
//       "createdBy",
//       "updatedBy",
//     ];
//     topLevelFields.forEach((field) => {
//       if (
//         updateFields[field] !== undefined &&
//         currentMockInterview[field] !== updateFields[field]
//       ) {
//         changes.push({
//           fieldName: field,
//           oldValue: currentMockInterview[field],
//           newValue: updateFields[field],
//         });
//         currentMockInterview[field] = updateFields[field];
//       }
//     });

//     // Save the updated document
//     const updatedMockInterview = await currentMockInterview.save();

//     // Generate feed
//     res.locals.feedData = {
//       tenantId,
//       feedType: "update",
//       action: {
//         name: "mock_interview_updated",
//         description: `Mock interview was updated successfully`,
//       },
//       ownerId,
//       parentId: mockId,
//       parentObject: "Mock interview",
//       metadata: req.body,
//       severity: res.statusCode >= 500 ? "high" : "low",
//       fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
//         fieldName,
//         message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
//       })),
//       history: changes,
//     };

//     // Generate logs
//     res.locals.logData = {
//       tenantId,
//       ownerId,
//       processName: "Update mock interview",
//       requestBody: req.body,
//       message: "Mock interview updated successfully",
//       status: "success",
//       responseBody: updatedMockInterview,
//     };

//     // Send response
//     res.status(200).json({
//       status: "success",
//       message: "Mock interview updated successfully",
//       data: updatedMockInterview,
//     });
//   } catch (error) {
//     console.error("Error updating MockInterview:", error);
//     res.locals.logData = {
//       tenantId,
//       ownerId,
//       processName: "Update mock interview",
//       requestBody: req.body,
//       message: error.message,
//       status: "error",
//     };

//     res.status(500).json({
//       status: "error",
//       message: "Failed to update mock interview. Please try again later.",
//       data: { error: error.message },
//     });
//   }
// };

// Validate mock interview data endpoint



exports.validateMockInterview = async (req, res) => {
  try {
    const { page } = req.params; // For page-wise validation
    const isPage1Only = page === "page1";
    
    // Validate the data
    const validation = validateMockInterview(req.body, isPage1Only);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Validation successful",
      data: validation.value
    });
  } catch (error) {
    console.error("Error validating mock interview:", error);
    return res.status(500).json({
      success: false,
      message: "Validation error",
      errors: { general: error.message }
    });
  }
};
