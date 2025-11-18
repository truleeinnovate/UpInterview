// v1.0.0 - Ashok - fixed updating rounds based on sequence
//<-----v1.0.1---Venkatesh------add permission
const { mongoose } = require("mongoose");
const { Position } = require("../models/Position/position.js");
const { validatePosition, validateRoundData, validateRoundPatchData, positionValidationSchema, positionPatchValidationSchema, validateRoundDataStandard } = require("../validations/positionValidation.js");
const { hasPermission } = require("../middleware/permissionMiddleware");
const { Interview } = require("../models/Interview/Interview.js");
const { generateUniqueId } = require('../services/uniqueIdGeneratorService');
const { triggerWebhook, EVENT_TYPES } = require('../services/webhookService');


//  post call for position
const createPosition = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create Position";


  const { tenantId } = req.body;
  const isStandardType =
    req.body.type === "standard" ||
    req.body?.template?.type === "standard";

  let schemaToUse = positionValidationSchema;

  // if standard — make rounds optional
  if (isStandardType) {
    schemaToUse = positionValidationSchema.fork(["rounds"], (field) =>
      field.items(validateRoundDataStandard).optional()
    );
  }

   // --- VALIDATE REQUEST BODY ---
  const { error } = schemaToUse.validate(req.body, { abortEarly: false });


  if (error) {
    const errors = {};
    error.details.forEach((err) => {
      console.log("error found after", err);
      errors[err.path.join(".")] = err.message;
    });
    return res.status(400).json({ status: "error", errors });
  }


  // Check if ownerId exists
  if (!req.body.ownerId) {
    res.locals.responseData = {
      status: "error",
      message: "OwnerId field is required",
    };
    return res.status(400).json(res.locals.responseData);
  }

  res.locals.loggedByController = true;
  //console.log("effectivePermissions",res.locals?.effectivePermissions)
  //<-----v1.0.1---
  // Permission: Tasks.Create (or super admin override)
  //   const canCreate =
  //   await hasPermission(res.locals?.effectivePermissions?.Positions, 'Create')
  //  //await hasPermission(res.locals?.superAdminPermissions?.Positions, 'Create')
  //   if (!canCreate) {
  //     return res.status(403).json({ message: 'Forbidden: missing Positions.Create permission' });
  //   }
  //-----v1.0.1--->

  try {

    // Generate position code using centralized service with tenant ID
    const positionCode = await generateUniqueId('POS', Position, 'positionCode', tenantId);

    // Map request body to schema fields
    const positionData = {
      title: req.body.title || "",
      companyname: req.body.companyname || "",
      jobDescription: req.body.jobDescription || "",
      minexperience: req.body.minexperience || undefined,
      maxexperience: req.body.maxexperience || undefined,
      skills: req.body.skills || [],
      additionalNotes: req.body.additionalNotes || "",
      ownerId: req.body.ownerId || "",
      tenantId: req.body.tenantId || "",
      minSalary: req.body.minSalary || "",
      maxSalary: req.body.maxSalary || "",
      NoofPositions: req.body.NoofPositions
        ? Number(req.body.NoofPositions)
        : null,
      Location: req.body.Location || "",
      templateId: req.body.templateId || null,
      createdBy: req.body.ownerId, // Fixed: use req.body.ownerId instead of undefined ownerId
      positionCode, // Custom code added
    };

    // Handle rounds if template exists
    if (
      req.body.templateId &&
      req.body.rounds &&
      req.body.rounds.length > 0
    ) {
      positionData.rounds = req.body.rounds.map((round) => ({
        roundTitle: round.roundTitle || "",
        interviewMode: round.interviewMode || "",
        interviewerType: round.interviewerType || "",
        duration: round.duration ? Number(round.duration) : 0,
        instructions: round?.instructions || "",
        interviewerGroupId: round?.interviewerGroupId || "",
        interviewerViewType: round?.interviewerViewType || "",
        selectedInterviewersType: round?.selectedInterviewersType || "",
        // interviewers: round?.interviewers?.map((interviewer) => interviewer._id) || [],
        interviewers: round?.interviewers?.map((i) =>
          typeof i === "string" ? i : i._id  // FIX: ensure only ids stored
        ) || [],
        assessmentId: round?.assessmentId || null,
        sequence: round?.sequence || 0,
        questions: round?.questions
          ? round.questions?.map((q) => ({
            questionId: q.questionId,
            snapshot: q.snapshot,
          }))
          : [],
      }));
    } else {
      positionData.rounds = [];
    }

    // Save to database
    const position = new Position(positionData);
    await position.save();

    // Trigger webhook for position creation
    try {
      triggerWebhook(
        EVENT_TYPES.POSITION_CREATED,
        {
          id: position._id,
          title: position.title,
          companyName: position.companyname,
          minExperience: position.minexperience,
          maxExperience: position.maxexperience,
          skills: position.skills,
          noOfPositions: position.NoofPositions,
          location: position.Location,
          createdAt: position.createdAt,
          updatedAt: position.updatedAt,
          positionCode: position.positionCode
        },
        position.tenantId
      ).catch(error => {
        console.error('Webhook error (non-blocking):', error);
      });
    } catch (error) {
      console.error('Error triggering webhook for position creation:', error);
    }

    // Feed and log data
    let feedData = res.locals.feedData = {
      tenantId: req.body.tenantId,
      feedType: "info",
      action: {
        name: "position_created",
        description: `Position was created`,
      },
      ownerId: req.body.ownerId,
      parentId: position._id,
      parentObject: "Position",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      message: `Position was created successfully`,
    };





    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create Position",
      requestBody: req.body,
      status: "success",
      message: "Position created successfully",
      responseBody: position,
    };

    return res.status(201).json({
      status: "success",
      message: "Position created successfully",
      data: position,
    });
  } catch (error) {
    console.error("❌ Error creating position:", error.message);

    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create Position",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const updatePosition = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Position";

  const positionId = req.params.id;
  const { tenantId, ownerId, ...updateFields } = req.body;



  // Validate incoming PATCH data
  const { error } = positionPatchValidationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = {};
    error.details.forEach((err) => {
      errors[err.path.join(".")] = err.message;
    });
    return res.status(400).json({ status: "error", errors });
  }

  // const canCreate = await hasPermission(res.locals?.effectivePermissions?.Positions, 'Edit')
  // if (!canCreate) {
  //   return res.status(403).json({ message: 'Forbidden: missing Positions.Edit permission' });
  // }

  try {
    const currentPosition = await Position.findById(positionId).lean();

    if (!currentPosition) {
      return res.status(404).json({ message: "Position not found" });
    }

    const positionData = {
      title: updateFields.title || currentPosition.title,
      companyname: updateFields.companyName || currentPosition.companyname,
      jobDescription:
        updateFields.jobDescription || currentPosition.jobDescription,
      minexperience:
        updateFields.minexperience || currentPosition.minexperience,
      maxexperience:
        updateFields.maxexperience || currentPosition.maxexperience,
      templateId:
        updateFields?.templateId ?? currentPosition.templateId,
      skills: updateFields.skills || currentPosition.skills,
      additionalNotes:
        updateFields.additionalNotes || currentPosition.additionalNotes,
      ownerId: ownerId || currentPosition.ownerId,
      tenantId: tenantId || currentPosition.tenantId,
      minSalary: updateFields.minSalary || currentPosition.minSalary,
      maxSalary: updateFields.maxSalary || currentPosition.maxSalary,
      NoofPositions: updateFields.NoofPositions
        ? Number(updateFields.NoofPositions)
        : currentPosition.NoofPositions,
      Location: updateFields.Location || currentPosition.Location,
      status: updateFields.status ?? currentPosition.status,
      updatedBy: ownerId,
    };

    // CHANGED: Check if template name has changed before updating rounds
    const isTemplateChanged = updateFields?.templateId !== currentPosition.templateId;

    // Handle rounds update only if template is provided, has rounds, AND template name has changed
    if (updateFields?.rounds && isTemplateChanged) {
      positionData.rounds = updateFields.rounds.map((round) => ({
        roundTitle: round.roundTitle || "",
        interviewMode: round.interviewMode || "",
        interviewerType: round.interviewerType || "",
        duration: round.duration ? round.duration.toString() : "",
        instructions: round.instructions || "",
        selectedInterviewersType: round.selectedInterviewersType || "",
        interviewers: round.interviewers || [],
        assessmentId: round.assessmentId || null,
        sequence: round.sequence || 0,
        questions: round.questions
          ? round.questions.map((q) => ({
            questionId: q.questionId || null,
            snapshot: q.snapshot || null,
          }))
          : [],
      }));
    } else {
      // Keep existing rounds if template name hasn't changed
      positionData.rounds = currentPosition.rounds;
    }

    // Compare current values with updateFields to identify changes
    const changes = Object.entries(positionData)
      .filter(([key, newValue]) => {
        const oldValue = currentPosition[key];

        // Special handling for ObjectId vs string comparison
        if (['ownerId', 'tenantId', 'updatedBy', 'assessmentId'].includes(key)) {
          const oldIdString = oldValue?.toString();
          const newIdString = newValue?.toString();
          return oldIdString !== newIdString;
        }

        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
          const normalizeArray = (array) =>
            array
              .map(({ _id, ...rest }) => rest)
              .sort((a, b) => (a.skill || "").localeCompare(b.skill || ""));
          return (
            JSON.stringify(normalizeArray(oldValue)) !==
            JSON.stringify(normalizeArray(newValue))
          );
        }

        // For other fields, use strict equality
        return oldValue !== newValue;
      })
      .map(([key, newValue]) => ({
        fieldName: key,
        oldValue: currentPosition[key],
        newValue,
      }));

    // If no changes detected, return early without setting any log/feed data
    if (changes.length === 0) {
  
      return res.status(200).json({
        status: "no_changes",
        message: "No changes detected, position details remain the same",
        data: currentPosition
      });
    }



    // for (const change of changes) {
    //   console.log("Change: Data", change);
    // }

    const updateData = {
      $set: positionData
    };

    // Update the position
    const updatedPosition = await Position.findByIdAndUpdate(
      positionId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPosition) {
      return res.status(404).json({ message: 'Position not found' });
    }

    // Trigger webhook for position update
    triggerWebhook(
      EVENT_TYPES.POSITION_UPDATED,
      {
        id: updatedPosition._id,
        title: updatedPosition.title,
        companyName: updatedPosition.companyname,
        minExperience: updatedPosition.minexperience,
        maxExperience: updatedPosition.maxexperience,
        skills: updatedPosition.skills,
        noOfPositions: updatedPosition.NoofPositions,
        location: updatedPosition.Location,
        updatedAt: updatedPosition.updatedAt,
        positionCode: updatedPosition.positionCode,
        updatedFields: Object.keys(updateData.$set)
      },
      updatedPosition.tenantId
    ).catch(error => {
      console.error('Webhook error (non-blocking):', error);
    });

    await updatedPosition.save()


    // NEW: Generate proper field messages with formatted values
    const fieldMessages = changes.map(({ fieldName, formattedOldValue, formattedNewValue }) => ({
      fieldName,
      message: `${fieldName} updated from '${formattedOldValue}' to '${formattedNewValue}'`
    }));

    // Only set feedData and logData when there are actual changes
    res.locals.feedData = {
      tenantId,
      feedType: "update",
      action: {
        name: "position_updated",
        description: `Position was updated`,
      },
      ownerId,
      parentId: positionId,
      parentObject: "Position",
      metadata: req.body,
      severity: res.statusCode >= 500 ? 'high' : 'low',
      // fieldMessage: fieldMessages,
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
      })),
      history: changes,
    };

    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Update Position",
      requestBody: req.body,
      status: "success",
      message: "Position updated successfully",
      responseBody: updatedPosition,
    };

    res.status(200).json({
      status: "Updated successfully",
      message: "Position updated successfully",
      data: updatedPosition,
    });
  } catch (error) {
    console.error("❌ Error updating position:", error);

    res.locals.logData = {
      tenantId: req.body?.tenantId,
      ownerId: req.body?.ownerId,
      processName: "Update Position",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};




// Delete position by ID
const deletePosition = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Delete Position";

  const { id } = req.params;

  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID format'
      });
    }

    // Find position
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found'
      });
    }

    // ✅ Check if this position is referenced in Interview schema
    const existingInterview = await Interview.findOne({ positionId: id });

    if (existingInterview) {
      return res.status(400).json({
        status: 'error',
        message: 'Position cannot be deleted. It is referenced in one or more Interviews.'
      });
    }

    // ✅ If not found in Interview, delete the position
    const deletedPosition = await Position.findByIdAndDelete(id);

    if (!deletedPosition) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found or already deleted'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Position deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while deleting position',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




// v1.0.0 <-----------------------------------------------------------------------------------
// const saveInterviewRoundPosition = async (req, res) => {
//   try {
//     const { positionId, round, roundId } = req.body;

//     if (!positionId || !round) {
//       return res
//         .status(400)
//         .json({ message: "Interview ID and round data are required." });
//     }

//     // Find the position document
//     const position = await Position.findById(positionId);
//     if (!position) {
//       return res.status(404).json({ message: "Position not found." });
//     }

//     if (roundId) {
//       // **Edit an existing round**
//       const roundIndex = position.rounds.findIndex(
//         (r) => r._id.toString() === roundId
//       );
//       if (roundIndex === -1) {
//         return res.status(404).json({ message: "Round not found." });
//       }

//       // if (round.interviewers && Array.isArray(round.interviewers)) {
//       //   round.interviewers = round.interviewers
//       //     .filter(id => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))
//       //     .map(id => new mongoose.Types.ObjectId(id));
//       // } else {
//       //   round.interviewers = [];
//       // }

//       // Update the existing round with new data
//       position.rounds[roundIndex] = {
//         ...position.rounds[roundIndex],
//         ...round,
//       };

//       // **Reorder all rounds based on sequence**
//       await reorderInterviewRounds(position);

//       console.log("Position rounds 508", positionId, round, roundId);

//       await position.save();

//       return res.status(200).json({
//         message: "Round updated successfully.",
//         data: position.rounds[roundIndex],
//       });
//     } else {
//       // **Add a new round**
//       const totalRounds = position.rounds.length;
//       const newSequence = round.sequence || totalRounds + 1; // Default to next sequence

//       // **Shift existing rounds if inserting at a lower sequence**
//       position.rounds.forEach((r) => {
//         if (r.sequence >= newSequence) {
//           r.sequence += 1;
//         }
//       });

//       // if (round.interviewers && Array.isArray(round.interviewers)) {
//       //   round.interviewers = round.interviewers
//       //     .filter(id => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))
//       //     .map(id => new mongoose.Types.ObjectId(id));
//       // } else {
//       //   round.interviewers = [];
//       // }

//       console.log("Position rounds 540", positionId, round, roundId);

//       // **Add the new round**
//       const newRound = {
//         ...round,
//         sequence: newSequence,
//       };
//       position.rounds.push(newRound);
//       await position.save();

//       // **Reorder rounds after adding**
//       await reorderInterviewRounds(position);

//       await position.save();

//       return res.status(201).json({
//         message: "Interview round created successfully.",
//         data: position.rounds[position.rounds.length - 1],
//       });
//     }

//     /**
//      * Reorders interview rounds based on sequence.
//      */
//     function reorderInterviewRounds(positionId) {
//       position.rounds.sort((a, b) => a.sequence - b.sequence);

//       // Reassign sequence numbers starting from 1
//       position.rounds.forEach((round, index) => {
//         round.sequence = index + 1;
//       });
//     }

//     // Sending emails to interviewers
//     // const emailPromises = [];

//     // for (const interviewRounds of rounds) {
//     //     console.log("Processing Round:", JSON.stringify(round, null, 2));

//     //     if (round.mode === "Virtual" && Array.isArray(round.interviewers)) {
//     //         console.log("Virtual Round Detected:", round.round);

//     //         // Validate interviewers
//     //         if (!Array.isArray(round.interviewers) || round.interviewers.length === 0) {
//     //             console.error("Invalid interviewers data:", round);
//     //             continue;
//     //         }

//     //         // Generate meetLink for the round
//     //         const ecryptArgRound = { user: "host", details: { teamId, round: round.round } };

//     //         try {
//     //             console.log("Encrypting MeetLink Data:", JSON.stringify(ecryptArgRound, null, 2));
//     //             const encryptedMeetLink = encrypt(ecryptArgRound, 'meet');
//     //             console.log("Encrypted MeetLink:", encryptedMeetLink);

//     //             for (const interviewer of round.interviewers) {
//     //                 if (!interviewer._id) {
//     //                     console.error("Skipping invalid interviewer:", interviewer);
//     //                     continue;
//     //                 }

//     //                 const ecryptArg = {
//     //                     user: "host",
//     //                     details: { id: interviewer._id, candidateId, round: round.round }
//     //                 };
//     //                 console.log("Encrypting Host Data:", JSON.stringify(ecryptArg, null, 2));

//     //                 const encryptedHost = encrypt(ecryptArg, 'meet');
//     //                 console.log("Encrypted Host Data:", encryptedHost);

//     //                 round.meetLink = `http://localhost:3000/meetId/${teamId}/${savedInterview._id}?user=${encryptedHost}`;
//     //                 console.log("Generated Meet Link:", round.meetLink);

//     //                 try {
//     //                     const user = await Users.findById(interviewer._id);
//     //                     if (user && user.Email) {
//     //                         console.log("Sending Email to:", user.Email);
//     //                         emailPromises.push(
//     //                             sendEmail(
//     //                                 user.Email,
//     //                                 "Interview Scheduled",
//     //                                 `Your scheduled interview can be accessed using this link: ${round.meetLink}`
//     //                             )
//     //                         );
//     //                     }
//     //                 } catch (err) {
//     //                     console.error(`Error fetching interviewer ${interviewer._id}:`, err);
//     //                 }
//     //             }
//     //         } catch (encryptionError) {
//     //             console.error("Encryption Error:", encryptionError);
//     //         }
//     //     }
//     // }

//     // // Generate and store OTP for candidate
//     // const otp = generateOTP(CandidateId);
//     // console.log("Generated OTP:", otp);

//     // const otpInstance = new TeamsOtpSchema({
//     //     teamId,
//     //     candidateId,
//     //     otp,
//     //     expiresAt: new Date(Date.now() + 90 * 1000), // 90 seconds expiration
//     // });

//     // console.log("OTP Instance:", otpInstance);
//     // await otpInstance.save();

//     // // Sending email to candidate
//     // if (candidate.Email) {
//     //     console.log("Sending email to candidate:", candidate.Email);

//     //     const ecryptArg = { user: "public", details: { id: candidateId } };
//     //     console.log("Encrypting Candidate Data:", JSON.stringify(ecryptArg, null, 2));

//     //     const encryptedUser = encrypt(ecryptArg, 'meet');
//     //     console.log("Encrypted Candidate Data:", encryptedUser);

//     //     emailPromises.push(
//     //         sendEmail(
//     //             candidate.Email,
//     //             "Interview Invitation",
//     //             `You are invited to attend a virtual interview with this link: http://localhost:3000/meetId/${teamId}/${savedInterview._id}?user=${encryptedUser}. Your OTP is: ${otp}`
//     //         )
//     //     );
//     // }

//     // // Wait for all emails to be sent
//     // await Promise.all(emailPromises);
//   } catch (error) {
//     console.error("Error saving interview round:", error);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };

const getPositionById = async (req, res) => {
  const { id } = req.params; // Position ID from URL params
  const { tenantId } = req.query; // Optional tenant ID from query string

  try {
    // Build query - if tenantId provided, use it for filtering
    const query = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }

    // Find position by ID (and optionally tenantId)
    const position = await Position.findOne(query)
      .populate('rounds') // Populate rounds if needed
      .populate('skills') // Populate skills if needed
      .lean(); // Convert to plain JS object for performance

    if (!position) {
      return res.status(404).json({
        success: false,
        error: "Position not found",
        message: "The requested position does not exist or has been deleted"
      });
    }

    // Success response
    res.status(200).json(position);

  } catch (error) {
    console.error("Error fetching position by ID:", error);
    
    // Check if it's a CastError (invalid ObjectId format)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid position ID format"
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to fetch position details",
      message: error.message
    });
  }
};

// const updateRounds = async (req, res) => {
//   const { positionId } = req.params;
//   const { rounds } = req.body;

//   try {
//     const updatedPosition = await Position.findByIdAndUpdate(
//       positionId,
//       { $set: { rounds } },
//       { new: true }
//     );

//     if (!updatedPosition) {
//       return res.status(404).json({ message: "Position not found" });
//     }

//     res.status(200).json(updatedPosition);
//   } catch (error) {
//     console.error("Error updating rounds:", error);
//     res.status(500).json({ message: "error updating the rounds (position controller)" });
//   }
// };

const saveInterviewRoundPosition = async (req, res) => {

  res.locals.loggedByController = true;
  res.locals.processName = "Create Position Round";


  try {
    const { positionId, round, roundId } = req.body;


    //res.locals.loggedByController = true;
    //console.log("effectivePermissions",res.locals?.effectivePermissions)
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    //   const canCreate =
    //   await hasPermission(res.locals?.effectivePermissions?.Positions, 'Edit')
    //  //await hasPermission(res.locals?.superAdminPermissions?.Positions, 'Edit')
    //   if (!canCreate) {
    //     return res.status(403).json({ message: 'Forbidden: missing Positions.Edit permission' });
    //   }
    //-----v1.0.1--->

    if (!positionId || !round) {
      return res
        .status(400)
        .json({ message: "Position ID and round data are required." });
    }

    // ✅ Backend validation
    const { error } = validateRoundData.validate(round, {
      abortEarly: false,
    });
    if (error) {
      const errors = {};
      error.details.forEach((err) => {
        errors[err.path.join(".")] = err.message;
      });
      return res.status(400).json({ status: "error", errors });
    }

    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: "Position not found." });
    }

    // if (roundId) {
    //   // === Editing Existing Round ===
    //   const roundIndex = position.rounds.findIndex(
    //     (r) => r._id.toString() === roundId
    //   );

    //   if (roundIndex === -1) {
    //     return res.status(404).json({ message: "Round not found." });
    //   }

    //   // Remove the existing round
    //   const existingRound = position.rounds.splice(roundIndex, 1)[0];
    //   const updatedRound = {
    //     ...existingRound.toObject(),
    //     ...round,
    //   };

    //   // Insert updated round at desired sequence (minus 1 due to zero-based index)
    //   const desiredIndex = Math.max((updatedRound.sequence || 1) - 1, 0);
    //   position.rounds.splice(desiredIndex, 0, updatedRound);

    //   // Reorder sequences
    //   reorderInterviewRounds(position);

    //   // Set roundsModified to true
    //   position.roundsModified = true;

    //   await position.save();

    //   return res.status(200).json({

    //     message: "Round updated successfully.",
    //     data: updatedRound,
    //   });
    // } else {
    // === Adding New Round ===

    const newSequence = round.sequence || position.rounds.length + 1;
    const newIndex = Math.max(newSequence - 1, 0);

    // console.log("newIndex", round);

    const newRound = {
      ...round,
      sequence: newSequence,
    };

    // Insert at proper index
    position.rounds.splice(newIndex, 0, newRound);

    reorderInterviewRounds(position);

    // Set roundsModified to true
    position.roundsModified = true;

    await position.save();



    // Get the latest saved position to access the round with _id
    const updatedPosition = await Position.findById(positionId);
    const savedRound = updatedPosition.rounds.find(
      r => r.sequence === newSequence &&
        r.roundTitle === newRound.roundTitle
    );

    

    // Feed and log data
    res.locals.feedData = {
      tenantId: req.body.tenantId,
      feedType: "info",
      action: {
        name: "position_round_created",
        description: `Position Round was created`,
      },
      ownerId: req.body.ownerId,
      parentId: savedRound._id,
      parentObject: "Position Round",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      message: `Position Round was created successfully`,
    };

    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create Position Round",
      requestBody: req.body,
      status: "success",
      message: "Position Round created successfully",
      responseBody: newRound,
    };


    return res.status(201).json({
      status: "Created Round successfully",
      message: "Interview round created successfully.",
      data: newRound,
    });
    // }

    // === Utility to Normalize Sequence ===
    function reorderInterviewRounds(positionDoc) {
      positionDoc.rounds.forEach((r, idx) => {
        r.sequence = idx + 1;
      });
    }
  } catch (error) {
    console.error("Error saving interview round:", error);

    // Error logging
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create Position Round",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    return res.status(500).json({ message: "Internal server error." });
  }
};

// patch call for positons round 
// PATCH: /api/positions/:positionId/rounds/:roundId
// const updateInterviewRound = async (req, res) => {
//   try {
//     const { positionId, roundId } = req.params;
//     const updates = req.body; // only the fields to update


//     // Convert to ObjectId explicitly
//     positionId = new mongoose.Types.ObjectId(positionId);
//     roundId = new mongoose.Types.ObjectId(roundId);

//     if (!mongoose.Types.ObjectId.isValid(positionId)) {
//       return res.status(400).json({ message: "Invalid Position ID" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(roundId)) {
//       return res.status(400).json({ message: "Invalid Round ID" });
//     }

//     if (!positionId || !roundId) {
//       return res
//         .status(400)
//         .json({ message: "Position ID and Round ID are required." });
//     }



//     // ✅ Find position
//     const position = await Position.findById(positionId);
//     if (!position) {
//       return res.status(404).json({ message: "Position not found." });
//     }

//     // ✅ Find round inside position
//     const round = position.rounds.id(roundId);
//     if (!round) {
//       return res.status(404).json({ message: "Round not found." });
//     }

//     // ✅ Apply only provided updates
//     Object.keys(updates).forEach((key) => {
//       round[key] = updates[key];
//     });

//         // ✅ Validate incoming data with Joi (partial validation)
//    // PATCH/editing an existing round
//    const { error } = validateRoundPatchData.validate(round, { abortEarly: false });
//    if (error) {
//      const errors = {};
//      error.details.forEach((err) => {
//        errors[err.path.join(".")] = err.message;
//      });
//      return res.status(400).json({ status: "error", errors });
//    }

//     // ✅ Reorder if sequence changed
//     if (updates.sequence) {
//       position.rounds = position.rounds.filter((r) => r._id.toString() !== roundId);
//       const desiredIndex = Math.max(updates.sequence - 1, 0);
//       position.rounds.splice(desiredIndex, 0, round);

//       position.rounds.forEach((r, idx) => {
//         r.sequence = idx + 1;
//       });
//     }

//     position.roundsModified = true;

//     await position.save();

//     return res.status(200).json({
//       message: "Round updated successfully.",
//       data: round,
//     });
//   } catch (error) {
//     console.error("Error updating interview round:", error);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };
// PATCH: /api/positions/:positionId/rounds/:roundId


// ======================= PATCH Handler =======================



// const updateInterviewRound = async (req, res) => {
//   try {
//     console.log("=== PATCH /positions/:positionId/rounds/:roundId called ===");

//     const { positionId: rawPositionId, roundId: rawRoundId } = req.params;
//     const { round: updates } = req.body;

//     // ---------- Validate ObjectId ----------
//     if (!mongoose.Types.ObjectId.isValid(rawPositionId)) {
//       console.log("Invalid Position ID:", rawPositionId);
//       return res.status(400).json({ message: "Invalid Position ID" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(rawRoundId)) {
//       console.log("Invalid Round ID:", rawRoundId);
//       return res.status(400).json({ message: "Invalid Round ID" });
//     }

//     // ---------- Fetch Position ----------
//     const position = await Position.findById(rawPositionId);
//     if (!position) {
//       console.log("Position not found:", rawPositionId);
//       return res.status(404).json({ message: "Position not found." });
//     }

//     // ---------- Fetch Round ----------
//     const round = position.rounds.id(rawRoundId);
//     if (!round) {
//       console.log("Round not found:", rawRoundId);
//       return res.status(404).json({ message: "Round not found." });
//     }
//     // Remove system fields before validation
// const { _id, createdAt, updatedAt, ...roundPlain } = round.toObject();

//     // ---------- Merge & Validate Updates ----------
//     const roundObjectForValidation = {
//       ...roundPlain,
//       ...updates,
//     };

//     const { error } = validateRoundPatchData.validate(roundObjectForValidation, { abortEarly: false });
//     if (error) {
//       const errors = {};
//       error.details.forEach((err) => {
//         errors[err.path.join(".")] = err.message;
//       });
//       console.log("Validation errors:", errors);
//       return res.status(400).json({ status: "error", errors });
//     }

//     // ---------- Apply Updates ----------
//     Object.keys(updates).forEach((key) => {
//       if (key === "assessmentId" && updates.assessmentId) {
//         round[key] = mongoose.Types.ObjectId(updates.assessmentId);
//       } else if (key === "interviewers" && Array.isArray(updates.interviewers)) {
//         round[key] = updates.interviewers.map((id) => mongoose.Types.ObjectId(id));
//       } else {
//         round[key] = updates[key];
//       }
//     });

//     // ---------- Reorder Rounds if Sequence Changed ----------
//     if (updates.sequence) {
//       position.rounds = position.rounds.filter((r) => !r._id.equals(rawRoundId));
//       const desiredIndex = Math.max(updates.sequence - 1, 0);
//       position.rounds.splice(desiredIndex, 0, round);
//       position.rounds.forEach((r, idx) => (r.sequence = idx + 1));
//     }

//     // ---------- Save Position ----------
//     await position.save();
//     console.log("Round updated successfully:", round._id);

//     return res.status(200).json({
//       message: "Round updated successfully.",
//       data: round,
//     });
//   } catch (err) {
//     console.error("Error updating interview round:", err);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };

// ======================= PATCH Handler =======================
// const updateInterviewRound = async (req, res) => {
//   try {
//     console.log("=== PATCH /positions/:positionId/rounds/:roundId called ===");

//     const { positionId: rawPositionId, roundId: rawRoundId } = req.params;
//     const { round: updates } = req.body;

//     // ---------- Validate ObjectId ----------
//     if (!mongoose.Types.ObjectId.isValid(rawPositionId)) {
//       console.log("Invalid Position ID:", rawPositionId);
//       return res.status(400).json({ message: "Invalid Position ID" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(rawRoundId)) {
//       console.log("Invalid Round ID:", rawRoundId);
//       return res.status(400).json({ message: "Invalid Round ID" });
//     }

//     // ---------- Fetch Position ----------
//     const position = await Position.findById(rawPositionId);
//     if (!position) {
//       console.log("Position not found:", rawPositionId);
//       return res.status(404).json({ message: "Position not found." });
//     }

//     // ---------- Fetch Round ----------
//     const round = position.rounds.id(rawRoundId);
//     if (!round) {
//       console.log("Round not found:", rawRoundId);
//       return res.status(404).json({ message: "Round not found." });
//     }

//     // ---------- Handle interviewer type transitions ----------
//     // If changing interviewerType, clear dependent fields appropriately
//     if (updates.interviewerType && updates.interviewerType !== round.interviewerType) {
//       console.log(`Changing interviewerType from ${round.interviewerType} to ${updates.interviewerType}`);

//       if (updates.interviewerType === 'internal') {
//         // Clear fields not relevant for internal interviewers
//         updates.interviewerViewType = '';
//         updates.selectedInterviewersType = '';
//       } else if (updates.interviewerType === 'external') {
//         // Clear fields not relevant for external interviewers
//         updates.interviewerGroupName = '';
//         updates.interviewers = [];
//       }
//     }

//     // ---------- Merge & Validate Updates (skip system fields) ----------
//     const { _id, createdAt, updatedAt, ...roundPlain } = round.toObject();

//     const roundObjectForValidation = {
//       ...roundPlain,
//       ...updates,
//     };

//     const { error } = validateRoundPatchData.validate(roundObjectForValidation, { abortEarly: false });
//     if (error) {
//       const errors = {};
//       error.details.forEach((err) => {
//         errors[err.path.join(".")] = err.message;
//       });
//       console.log("Validation errors:", errors);
//       return res.status(400).json({ status: "error", errors });
//     }

//     // ---------- Apply Updates ----------
//     Object.keys(updates).forEach((key) => {
//       if (key === "assessmentId" && updates.assessmentId) {
//         round[key] = new mongoose.Types.ObjectId(updates.assessmentId);
//       } else if (key === "interviewers" && Array.isArray(updates.interviewers)) {
//         round[key] = updates.interviewers.map((id) => new mongoose.Types.ObjectId(id));
//       } else {
//         round[key] = updates[key];
//       }
//     });

//     // ---------- Reorder Rounds if Sequence Changed ----------
//     if (updates.sequence) {
//       position.rounds = position.rounds.filter((r) => !r._id.equals(rawRoundId));
//       const desiredIndex = Math.max(updates.sequence - 1, 0);
//       position.rounds.splice(desiredIndex, 0, round);
//       position.rounds.forEach((r, idx) => (r.sequence = idx + 1));
//     }

//     // ---------- Save Position ----------
//     await position.save();
//     console.log("Round updated successfully:", round._id);

//     return res.status(200).json({
//       message: "Round updated successfully.",
//       data: round,
//     });
//   } catch (err) {
//     console.error("Error updating interview round:", err);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };


// ======================= PATCH Handler =======================



const updateInterviewRound = async (req, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = 'Update Interview Round';

  try {
   
    // Log request parameters
    const { positionId: rawPositionId, roundId: rawRoundId } = req.params;
    const { tenantId, ownerId, round: updates } = req.body;

 
    // ---------- Validate ObjectId ----------
   
    if (!mongoose.Types.ObjectId.isValid(rawPositionId)) {
      console.log("❌ Invalid Position ID:", rawPositionId);
      return res.status(400).json({ message: "Invalid Position ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(rawRoundId)) {
      // console.log("❌ Invalid Round ID:", rawRoundId);
      return res.status(400).json({ message: "Invalid Round ID" });
    }


    // ---------- Fetch Position ----------
   
    const position = await Position.findById(rawPositionId);
    if (!position) {
     
      return res.status(404).json({ message: "Position not found." });
    }
  

    // ---------- Fetch Round ----------
  
    const round = position.rounds.id(rawRoundId);
    if (!round) {
      console.log("❌ Round not found:", rawRoundId);
      return res.status(404).json({ message: "Round not found." });
    }
   
    // ---------- Handle assessment rounds ----------
    
    if (updates.assessmentId) {
     
      updates.interviewerType = '';
      updates.interviewerGroupId = '';
      updates.interviewerViewType = '';
      updates.selectedInterviewersType = '';
      updates.interviewers = [];

    
      if (updates.roundTitle && updates.roundTitle.toLowerCase() !== "assessment") {
        console.log("🔄 Non-assessment round detected - resetting assessmentId");
        updates.assessmentId = null;
      }
    }

    // ---------- Handle interviewer type transitions ----------
   
    if (!updates.assessmentId) {
      if (updates.interviewerType && updates.interviewerType !== round.interviewerType) {
      
        if (updates.interviewerType === 'Internal') {
          updates.selectedInterviewersType = '';
        } else if (updates.interviewerType === 'External') {
        updates.interviewerGroupId = '';
          updates.interviewers = [];
        }
      } else {
        console.log("✅ No interviewer type change detected");
      }
    }

    // ---------- Validate Updates ----------
   
    const roundObjectForValidation = { ...updates };
   
    const { error } = validateRoundPatchData.validate(roundObjectForValidation, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach((err) => {
        errors[err.path.join(".")] = err.message;
      });
      console.log("❌ Validation errors:", errors);
      return res.status(400).json({ status: "error", errors });
    }
    

    // ---------- Apply Updates ----------
  
    // Track changes for logging and feed
    const changes = [];

    Object.keys(updates).forEach((key) => {
   
      const oldValue = round[key];
      let newValue = updates[key];

      if (key === "assessmentId") {
        if (updates.assessmentId) {
        newValue = new mongoose.Types.ObjectId(updates.assessmentId);
          round[key] = newValue;
        } else {
      
          newValue = null;
          round[key] = null;
        }
      } else if (key === "interviewers" && Array.isArray(updates.interviewers)) {
       newValue = updates.interviewers.map((id) => new mongoose.Types.ObjectId(id));
        round[key] = newValue;
      } else {
      round[key] = newValue;
      }

      // Track changes for logging and feed
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          fieldName: key,
          oldValue: oldValue,
          newValue: newValue
        });
      }
    });

   
    // If no changes detected, return early WITHOUT setting feed/log data
    if (changes.length === 0) {
    return res.status(200).json({
        status: 'no_changes',
        message: 'No changes detected, round details remain the same',
        data: round,
      });
    }

    // ---------- Reorder Rounds if Sequence Changed ----------
    if (updates.sequence !== undefined && updates.sequence !== round.sequence) {
    
      position.rounds = position.rounds.filter((r) => !r._id.equals(rawRoundId));
      const desiredIndex = Math.max(updates.sequence - 1, 0);
      position.rounds.splice(desiredIndex, 0, round);

      position.rounds.forEach((r, idx) => {
      r.sequence = idx + 1;
      });
    }

    // ---------- Save Position ----------
  
    await position.save();
   

    // ONLY set feedData and logData when there are actual changes
    res.locals.feedData = {
      tenantId: req.body.tenantId,
      feedType: 'update',
      action: {
        name: 'Position_round_updated',
        description: `Position round was updated`,
      },
      ownerId: req.body.ownerId,
      parentId: rawRoundId,
      parentObject: 'Position',
      metadata: req.body,
      severity: 'low',
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
      })),
      history: changes,
    };

    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: 'Update Position Round',
      requestBody: req.body,
      status: 'success',
      message: 'Position Round updated successfully',
      responseBody: round,
      changes: changes,
    };

    return res.status(200).json({
      status: "Updated Round successfully",
      message: "Round updated successfully.",
      data: round,
    });

  } catch (err) {
    console.error("❌ Error updating interview round:", err);
    console.error("📋 Error details:", err.message);
    console.error("🔍 Error stack:", err.stack);

    // Error logging - only set logData for actual errors
    res.locals.logData = {
      tenantId: req.body?.tenantId,
      ownerId: req.body?.ownerId,
      processName: "Update Position Round",
      requestBody: req.body,
      message: err.message,
      status: "error",
    };

    return res.status(500).json({ message: "Internal server error." });
  }
};










// const updateInterviewRound = async (req, res) => {
//   try {
//     console.log("=== PATCH /positions/:positionId/rounds/:roundId called ===");
//     console.log("Request received at:", new Date().toISOString());

//     // Log request parameters
//     const { positionId: rawPositionId, roundId: rawRoundId } = req.params;
//     console.log("📍 Request Parameters:");
//     console.log("  - positionId:", rawPositionId);
//     console.log("  - roundId:", rawRoundId);

//     // Log request body
//     const { round: updates } = req.body;
//     console.log("📥 Incoming Updates from Request Body:");
//     console.log("  - updates object:", JSON.stringify(updates, null, 2));

//     // ---------- Validate ObjectId ----------
//     console.log("🔍 Validating ObjectIds...");
//     if (!mongoose.Types.ObjectId.isValid(rawPositionId)) {
//       console.log("❌ Invalid Position ID:", rawPositionId);
//       return res.status(400).json({ message: "Invalid Position ID" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(rawRoundId)) {
//       console.log("❌ Invalid Round ID:", rawRoundId);
//       return res.status(400).json({ message: "Invalid Round ID" });
//     }
//     console.log("✅ ObjectIds validated successfully");

//     // ---------- Fetch Position ----------
//     console.log("📋 Fetching position from database...");
//     const position = await Position.findById(rawPositionId);
//     if (!position) {
//       console.log("❌ Position not found:", rawPositionId);
//       return res.status(404).json({ message: "Position not found." });
//     }
//     console.log("✅ Position found:", position._id);

//     // ---------- Fetch Round ----------
//     console.log("📋 Fetching round from position...");
//     const round = position.rounds.id(rawRoundId);
//     if (!round) {
//       console.log("❌ Round not found:", rawRoundId);
//       return res.status(404).json({ message: "Round not found." });
//     }
//     console.log("✅ Round found:", round._id);
//     console.log("📊 Current round data:", JSON.stringify(round.toObject(), null, 2));

//     // ---------- Handle assessment rounds ----------
//     console.log("🔍 Checking for assessment round updates...");
//     if (updates.assessmentId) {
//       console.log("🎯 Assessment round detected - clearing interviewer fields");
//       console.log("📝 Before clearing - interviewerType:", round.interviewerType);

//       updates.interviewerType = '';
//       updates.interviewerGroupName = '';
//       updates.interviewerViewType = '';
//       updates.selectedInterviewersType = '';
//       updates.interviewers = [];

//       console.log("📝 After clearing - interviewerType:", updates.interviewerType);

//       if (updates.roundTitle && updates.roundTitle.toLowerCase() !== "assessment") {
//         console.log("🔄 Non-assessment round detected - resetting assessmentId");
//         updates.assessmentId = null;
//       }
//     }

//     // ---------- Handle interviewer type transitions ----------
//     console.log("🔍 Checking for interviewer type transitions...");
//     if (!updates.assessmentId) {
//       if (updates.interviewerType && updates.interviewerType !== round.interviewerType) {
//         console.log(`🔄 Changing interviewerType from '${round.interviewerType}' to '${updates.interviewerType}'`);

//         if (updates.interviewerType === 'Internal') {
//           console.log("🏢 Internal interviewer type - clearing selectedInterviewersType");
//           updates.selectedInterviewersType = '';
//         } else if (updates.interviewerType === 'External') {
//           console.log("🌐 External interviewer type - clearing group and interviewers");
//           updates.interviewerGroupName = '';
//           updates.interviewers = [];
//         }
//       } else {
//         console.log("✅ No interviewer type change detected");
//       }
//     }

//     // ---------- Validate Updates ----------
//     console.log("🔍 Validating update data...");
//     const roundObjectForValidation = { ...updates };
//     console.log("📋 Data being validated:", JSON.stringify(roundObjectForValidation, null, 2));

//     const { error } = validateRoundPatchData.validate(roundObjectForValidation, { abortEarly: false });
//     if (error) {
//       const errors = {};
//       error.details.forEach((err) => {
//         errors[err.path.join(".")] = err.message;
//       });
//       console.log("❌ Validation errors:", errors);
//       return res.status(400).json({ status: "error", errors });
//     }
//     console.log("✅ Validation passed");

//     // ---------- Apply Updates ----------
//     console.log("🔄 Applying updates to round...");
//     console.log("📊 Current round state before updates:", JSON.stringify(round.toObject(), null, 2));

//     Object.keys(updates).forEach((key) => {
//       console.log(`   Processing field: ${key}`);

//       if (key === "assessmentId") {
//         if (updates.assessmentId) {
//           console.log(`   ↳ Setting assessmentId to ObjectId: ${updates.assessmentId}`);
//           round[key] = new mongoose.Types.ObjectId(updates.assessmentId);
//         } else {
//           console.log(`   ↳ Clearing assessmentId`);
//           round[key] = null;
//         }
//       } else if (key === "interviewers" && Array.isArray(updates.interviewers)) {
//         console.log(`   ↳ Setting interviewers array with ${updates.interviewers.length} items`);
//         round[key] = updates.interviewers.map((id) => new mongoose.Types.ObjectId(id));
//       } else {
//         console.log(`   ↳ Setting ${key} from '${round[key]}' to '${updates[key]}'`);
//         round[key] = updates[key];
//       }
//     });

//     console.log("📊 Round state after updates:", JSON.stringify(round.toObject(), null, 2));

//     // ---------- Reorder Rounds if Sequence Changed ----------
//     if (updates.sequence !== undefined && updates.sequence !== round.sequence) {
//       console.log(`🔄 Reordering rounds - moving to sequence ${updates.sequence}`);
//       console.log(`   Current sequence: ${round.sequence}`);

//       position.rounds = position.rounds.filter((r) => !r._id.equals(rawRoundId));
//       const desiredIndex = Math.max(updates.sequence - 1, 0);
//       position.rounds.splice(desiredIndex, 0, round);

//       position.rounds.forEach((r, idx) => {
//         console.log(`   Setting round ${r._id} sequence from ${r.sequence} to ${idx + 1}`);
//         r.sequence = idx + 1;
//       });
//     }

//     // ---------- Save Position ----------
//     console.log("💾 Saving position to database...");
//     await position.save();
//     console.log("✅ Round updated successfully:", round._id);
//     console.log("📊 Final round data:", JSON.stringify(round.toObject(), null, 2));

//     return res.status(200).json({
//       status: "Updated Round successfully",
//       message: "Round updated successfully.",
//       data: round,
//     });

//   } catch (err) {
//     console.error("❌ Error updating interview round:", err);
//     console.error("📋 Error details:", err.message);
//     console.error("🔍 Error stack:", err.stack);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };




// const updateInterviewRound = async (req, res) => {
//   //res.locals.loggedByController = true;
//   //console.log("effectivePermissions",res.locals?.effectivePermissions)
//   //<-----v1.0.1---
//   // Permission: Tasks.Create (or super admin override)
// //   const canCreate =
// //   await hasPermission(res.locals?.effectivePermissions?.Positions, 'Delete')
// //  //await hasPermission(res.locals?.superAdminPermissions?.Positions, 'Delete')
// //   if (!canCreate) {
// //     return res.status(403).json({ message: 'Forbidden: missing Positions.Delete permission' });
// //   }
//   //-----v1.0.1--->

//   try {
//     console.log("=== PATCH /positions/:positionId/rounds/:roundId called ===");

//     const { positionId: rawPositionId, roundId: rawRoundId } = req.params;
//     const { round: updates } = req.body;
//     console.log("updates round",updates)
//     // console.log("round round",round);


//     // ---------- Validate ObjectId ----------
//     if (!mongoose.Types.ObjectId.isValid(rawPositionId)) {
//       console.log("Invalid Position ID:", rawPositionId);
//       return res.status(400).json({ message: "Invalid Position ID" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(rawRoundId)) {
//       console.log("Invalid Round ID:", rawRoundId);
//       return res.status(400).json({ message: "Invalid Round ID" });
//     }

//     // ---------- Fetch Position ----------
//     const position = await Position.findById(rawPositionId);
//     if (!position) {
//       console.log("Position not found:", rawPositionId);
//       return res.status(404).json({ message: "Position not found." });
//     }

//     // ---------- Fetch Round ----------
//     const round = position.rounds.id(rawRoundId);
//     if (!round) {
//       console.log("Round not found:", rawRoundId);
//       return res.status(404).json({ message: "Round not found." });
//     }


//     // || round.assessmentId
//     // ---------- Handle assessment rounds (interviewerType should be empty) ----------
//     if (updates.assessmentId) {
//       console.log("Assessment round detected - clearing interviewer fields");
//       updates.interviewerType = '';
//       updates.interviewerGroupName = '';
//       updates.interviewerViewType = '';
//       updates.selectedInterviewersType = '';
//       updates.interviewers = [];

//       if (updates.roundTitle && updates.roundTitle.toLowerCase() !== "assessment") {
//       console.log("Non-assessment round detected - resetting assessmentId");
//       updates.assessmentId = null;   // force clear assessmentId
//     }

//     // ---------- Handle interviewer type transitions ----------
//     if (!updates.assessmentId) {   // 🔄 move this inside "non-assessment flow"
//       if (updates.interviewerType && updates.interviewerType !== round.interviewerType) {
//         console.log(`Changing interviewerType from ${round.interviewerType} to ${updates.interviewerType}`);

//         if (updates.interviewerType === 'Internal') {
//           updates.selectedInterviewersType = '';
//         } else if (updates.interviewerType === 'External') {
//           updates.interviewerGroupName = '';
//           updates.interviewers = [];
//         }
//       }

//     } 
//   }
//     // else {
//     //       //  updates.assessmentId = ""
//     //   // ---------- Handle interviewer type transitions ----------
//     //   // If changing interviewerType, clear dependent fields appropriately
//     //   if (updates.interviewerType && updates.interviewerType !== round.interviewerType) {
//     //     console.log(`Changing interviewerType from ${round.interviewerType} to ${updates.interviewerType}`);

//     //     if (updates.interviewerType === 'Internal') {
//     //       // Clear fields not relevant for internal interviewers
//     //       // updates.interviewerViewType = '';
//     //       updates.selectedInterviewersType = '';

//     //     } else if (updates.interviewerType === 'External') {
//     //       // Clear fields not relevant for external interviewers
//     //       updates.interviewerGroupName = '';
//     //       updates.interviewers = [];

//     //     }
//     //   }
//     // }

//     // ---------- Merge & Validate Updates (skip system fields) ----------
//     // const { _id, createdAt, updatedAt, ...roundPlain } = updates.toObject();

//     const roundObjectForValidation = {
//       // ...roundPlain,
//       ...updates,
//     };
//     console.log("roundObjectForValidation",roundObjectForValidation);

//     const { error } = validateRoundPatchData.validate(roundObjectForValidation, { abortEarly: false });
//     if (error) {
//       const errors = {};
//       error.details.forEach((err) => {
//         errors[err.path.join(".")] = err.message;
//       });
//       console.log("Validation errors:", errors);
//       return res.status(400).json({ status: "error", errors });
//     }

//     console.log("updates.assessmentId",updates?.assessmentId);

//     // ---------- Apply Updates ----------
//     Object.keys(updates).forEach((key) => {
//       console.log("key",key === "assessmentId" && updates.assessmentId);
//       if (key === "assessmentId" && updates.assessmentId) {
//         if (updates.assessmentId !== undefined) {
//           round[key] = new mongoose.Types.ObjectId(updates.assessmentId);
//         } else {
//           // Explicitly clear assessmentId when null/empty
//           round[key] = null;  // or = null, depending on schema
//         }
//         // round[key] = new mongoose.Types.ObjectId(updates.assessmentId);
//       } else if (key === "interviewers" && Array.isArray(updates.interviewers)) {

//         round[key] = updates.interviewers.map((id) => new mongoose.Types.ObjectId(id));
//       } else {
//         round[key] = updates[key];
//       }
//     });

//     // ---------- Reorder Rounds if Sequence Changed ----------
//     if (updates.sequence) {
//       position.rounds = position.rounds.filter((r) => !r._id.equals(rawRoundId));
//       const desiredIndex = Math.max(updates.sequence - 1, 0);
//       position.rounds.splice(desiredIndex, 0, round);
//       position.rounds.forEach((r, idx) => (r.sequence = idx + 1));
//     }
//     console.log("updates updates",updates);


//     // ---------- Save Position ----------
//     await position.save();
//     console.log("Round updated successfully:", round._id);

//     return res.status(200).json({
//       status: "Updated Round successfully",
//       message: "Round updated successfully.",
//       data: round,
//     });
//   } catch (err) {
//     console.error("Error updating interview round:", err);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };






// v1.0.0 ----------------------------------------------------------------------------------->


const deleteRound = async (req, res) => {
  const { roundId } = req.params;

  try {
    const position = await Position.findOne({ "rounds._id": roundId });
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

    // if (roundIndex === -1) {
    //   console.log("❌ Round not found in position:", roundId);

    //   res.locals.logData = {
    //     processName: 'Delete Interview Round',
    //     requestBody: req.body,
    //     status: 'error',
    //     message: 'Round not found in position',
    //   };

    //   return res.status(404).json({ message: "Round not found" });
    // }

    // // Store the round data BEFORE splicing for logging
    // const deletedRound = position.rounds[roundIndex];
    // console.log("🗑️ Round to be deleted:", JSON.stringify(deletedRound.toObject(), null, 2));

    // // Generate feed data BEFORE removing the round
    // res.locals.feedData = {
    //   tenantId: position.tenantId,
    //   feedType: 'delete',
    //   action: {
    //     name: 'interview_round_deleted',
    //     description: `Interview round was deleted`,
    //   },
    //   ownerId: position.ownerId,
    //   parentId: position._id,
    //   parentObject: 'Position',
    //   metadata: req.body,
    //   severity: 'medium',
    //   fieldMessage: [{
    //     fieldName: 'round',
    //     message: `Round '${deletedRound.roundTitle}' (sequence: ${deletedRound.sequence}) was deleted`,
    //   }],
    //   history: [{
    //     fieldName: 'deletedRound',
    //     oldValue: deletedRound.toObject(),
    //     newValue: null
    //   }],
    // };

    // // Update log data for successful operation
    // res.locals.logData = {
    //   tenantId: position.tenantId,
    //   ownerId: position.ownerId,
    //   processName: 'Delete Interview Round',
    //   requestBody: req.body,
    //   status: 'success',
    //   message: 'Round deleted successfully',
    //   responseBody: { 
    //     deletedRoundId: roundId, 
    //     roundTitle: deletedRound.roundTitle,
    //     sequence: deletedRound.sequence 
    //   },
    //   changes: [{
    //     action: 'delete',
    //     roundId: roundId,
    //     roundTitle: deletedRound.roundTitle,
    //     sequence: deletedRound.sequence
    //   }],
    // };

    // Remove the round from the array


    position.rounds.splice(roundIndex, 1);

    // Save the updated position
    await position.save();



    res.status(200).json({ message: "Round deleted successfully" });
  } catch (error) {
    console.error("Error deleting round:", error);

    // Error logging
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Update Ticket",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    res.status(500).json({ message: "Error deleting round" });
  }
};

module.exports = {
  createPosition,
  updatePosition,
  saveInterviewRoundPosition,
  deleteRound,
  updateInterviewRound,
  deletePosition,
  getPositionById
};
