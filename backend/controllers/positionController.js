// v1.0.0 - Ashok - fixed updating rounds based on sequence
//<-----v1.0.1---Venkatesh------add permission
const { mongoose } = require("mongoose");
const { Position } = require("../models/Position/position.js");
const { validatePosition, validateRoundData, validateRoundPatchData, positionValidationSchema, positionPatchValidationSchema } = require("../validations/positionValidation.js");
const { hasPermission } = require("../middleware/permissionMiddleware");

// const createPosition = async (req, res) => {
//   res.locals.loggedByController = true;
//   res.locals.processName = 'Create Position';

//   if (!req.body.ownerId) {
//     res.locals.responseData = {
//       status: 'error',
//       message: "OwnerId field is required",
//     };
//     return res.status(400).json(res.locals.responseData);
//   }

//   try {
//     console.log("position data ", req.body);

//     // const position = new Position({ ...req.body }); // Store all fields dynamically

//     // Map request body to schema fields
//     const positionData = {
//       title: req.body.title || "",
//       companyname: req.body.companyName || "",
//       jobDescription: req.body.jobDescription || "",
//       minexperience: req.body.minexperience || undefined,
//       maxexperience: req.body.maxexperience || undefined,
//       // selectedTemplete: req.body.template?._id || null,
//       skills: req.body.skills || [],
//       additionalNotes: req.body.additionalNotes || "",
//       CreatedBy: req.body.ownerId || "",
//       LastModifiedById: req.body.ownerId || "",
//       ownerId: req.body.ownerId || "",
//       tenantId: req.body.tenantId || "",
//       minSalary: req.body.minSalary || "",
//       maxSalary: req.body.maxSalary || "",
//       NoofPositions: req.body.NoofPositions ? Number(req.body.NoofPositions) : undefined,
//       Location: req.body.Location || "",
//       rounds: [], // Initialize as empty array
//       selectedTemplete: req.body.template.templateName || null
//     };

//     if (req.body.template && req.body.template.rounds) {
//       positionData.rounds = req.body.template.rounds.map((round) => ({
//         roundName: round.roundName || "",
//         interviewMode: round.interviewMode || "",
//         interviewType: round.interviewType || "",
//         duration: round.duration || "",
//         instructions: round.instructions || ""
//       }));
//     }

//     // console.log("createPosition position",positionData);

//     const position = new Position(positionData);
//     const newPosition = await position.save();

//     res.locals.feedData = {
//       tenantId: req.body.tenantId,
//       feedType: 'info',
//       action: {
//         name: 'position_created',
//         description: `Position was created`,
//       },
//       ownerId: req.body.ownerId,
//       parentId: newPosition._id,
//       parentObject: 'Position',
//       metadata: req.body,
//       severity: res.statusCode >= 500 ? 'high' : 'low',
//       message: `Position was created successfully`,
//     };

//     res.locals.logData = {
//       tenantId: req.body.tenantId,
//       ownerId: req.body.ownerId,
//       processName: 'Create Position',
//       requestBody: req.body,
//       status: 'success',
//       message: 'Position created successfully',
//       responseBody: newPosition,
//     };

//     res.status(201).json({
//       status: 'success',
//       message: 'Position created successfully',
//       data: newPosition,
//     });
//   } catch (error) {
//     res.locals.logData = {
//       tenantId: req.body.tenantId,
//       ownerId: req.body.ownerId,
//       processName: 'Create Position',
//       requestBody: req.body,
//       message: error.message,
//       status: 'error',
//     };

//     res.status(500).json({
//       status: 'error',
//       message: error.message,
//     });
//   }
// };

// feed and log data added in this code but not saving the data in the database due to the error of owner is required
// const createPosition = async (req, res) => {
//   res.locals.loggedByController = true;
//   res.locals.processName = 'Create Position';
//   console.log("createPosition", req.body);

//   if (!req.body.ownerId) {
//     res.locals.responseData = {
//       status: 'error',
//       message: "OwnerId field is required",
//     };
//     return res.status(400).json(res.locals.responseData);
//   }

//   try {
//     console.log("position data ", req.body);

//     // Map request body to schema fields
//     const positionData = {
//       title: req.body.title || "",
//       companyname: req.body.companyName || "",
//       jobDescription: req.body.jobDescription || "",
//       minexperience: req.body.minexperience || undefined,
//       maxexperience: req.body.maxexperience || undefined,
//       skills: req.body.skills || [],
//       additionalNotes: req.body.additionalNotes || "",
//       ownerId: req.body.ownerId || "",
//       tenantId: req.body.tenantId || "",
//       minSalary: req.body.minSalary || "",
//       maxSalary: req.body.maxSalary || "",
//       NoofPositions: req.body.NoofPositions ? Number(req.body.NoofPositions) : undefined,
//       Location: req.body.Location || "",
//       selectedTemplete: req.body.template?.templateName || null,
//       createdBy: ownerId,
//     };

//     // Only add rounds if template exists and has rounds
//     if (req.body.template && req.body.template.rounds && req.body.template.rounds.length > 0) {
//       positionData.rounds = req.body.template.rounds.map(round => ({
//         roundTitle: round.roundTitle || "",
//         interviewMode: round.interviewMode || "",
//         interviewerType: round.interviewerType || "",
//         duration: round.interviewDuration ? round.interviewDuration.toString() : "",
//         instructions: round.instructions || "",
//         selectedInterviewersType: round.selectedInterviewersType || "",
//         interviewers: round.interviewers || [],
//         assessmentId: round.assessmentId || null,
//         sequence: round.sequence || 0,
//         questions: round.interviewQuestionsList ? round.interviewQuestionsList.map(q => ({
//           questionId: q.questionId || null,
//           snapshot: q.snapshot || null
//         })) : []
//       }));
//     } else {
//       positionData.rounds = [];
//     }

//     const position = new Position(positionData);
//     const newPosition = await position.save();

//     res.locals.feedData = {
//       tenantId: req.body.tenantId,
//       feedType: 'info',
//       action: {
//         name: 'position_created',
//         description: `Position was created`,
//       },
//       ownerId: req.body.ownerId,
//       parentId: newPosition._id,
//       parentObject: 'Position',
//       metadata: req.body,
//       severity: res.statusCode >= 500 ? 'high' : 'low',
//       message: `Position was created successfully`,
//     };

//     res.locals.logData = {
//       tenantId: req.body.tenantId,
//       ownerId: req.body.ownerId,
//       processName: 'Create Position',
//       requestBody: req.body,
//       status: 'success',
//       message: 'Position created successfully',
//       responseBody: newPosition,
//     };

//     res.status(201).json({
//       status: 'success',
//       message: 'Position created successfully',
//       data: newPosition,
//     });
//   } catch (error) {
//     res.locals.logData = {
//       tenantId: req.body.tenantId,
//       ownerId: req.body.ownerId,
//       processName: 'Create Position',
//       requestBody: req.body,
//       message: error.message,
//       status: 'error',
//     };

//     res.status(500).json({
//       status: 'error',
//       message: error.message,
//     });
//   }
// };

const createPosition = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create Position";

  // --- VALIDATE REQUEST BODY ---
  const { error } = positionValidationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = {};
    error.details.forEach((err) => {
      errors[err.path.join(".")] = err.message;
    });
    return res.status(400).json({ status: "error", errors });
  }

  // // --- Validate req.body using Joi ---
  // const { error } = Position.validate(req.body, { abortEarly: false });
  // if (error) {
  //   const errors = {};
  //   error.details.forEach((err) => {
  //     errors[err.path.join(".")] = err.message;
  //   });
  //   return res.status(400).json({ status: "error", errors });
  // }

  // console.log("🔁 Incoming request to createPosition:", req.body);

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
  const canCreate =
  await hasPermission(res.locals?.effectivePermissions?.Positions, 'Create')
 //await hasPermission(res.locals?.superAdminPermissions?.Positions, 'Create')
  if (!canCreate) {
    return res.status(403).json({ message: 'Forbidden: missing Positions.Create permission' });
  }
  //-----v1.0.1--->

  try {
    console.log("Position data received:", req.body);

    // Generate custom positionCode like POS-00001
    const lastPosition = await Position.findOne({ tenantId: req.body.tenantId })
      .sort({ _id: -1 })
      .select("positionCode")
      .lean();

    let nextNumber = 1;
    if (lastPosition?.positionCode) {
      const match = lastPosition.positionCode.match(/POS-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const positionCode = `POS-${String(nextNumber).padStart(5, "0")}`;

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
        : undefined,
      Location: req.body.Location || "",
      selectedTemplete: req.body.template?.templateName || null,
      createdBy: req.body.ownerId, // Fixed: use req.body.ownerId instead of undefined ownerId
      positionCode, // Custom code added
    };

    // Handle rounds if template exists
    if (
      req.body.template &&
      req.body.template.rounds &&
      req.body.template.rounds.length > 0
    ) {
      positionData.rounds = req.body.template.rounds.map((round) => ({
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
      positionData.rounds = [];
    }

    console.log("🛠️ Mapped Position Data:", positionData);

    // Save to database
    const position = new Position(positionData);
    const newPosition = await position.save();
    console.log("✅ Position saved to DB:", newPosition);

    // Feed and log data
    res.locals.feedData = {
      tenantId: req.body.tenantId,
      feedType: "info",
      action: {
        name: "position_created",
        description: `Position was created`,
      },
      ownerId: req.body.ownerId,
      parentId: newPosition._id,
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
      responseBody: newPosition,
    };

    return res.status(201).json({
      status: "success",
      message: "Position created successfully",
      data: newPosition,
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

//  Ranjith changes
  // Validate incoming PATCH data
  const { error } = positionPatchValidationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = {};
    error.details.forEach((err) => {
      errors[err.path.join(".")] = err.message;
    });
    return res.status(400).json({ status: "error", errors });
  }
// venkatesh changes
  //res.locals.loggedByController = true;
  //console.log("effectivePermissions",res.locals?.effectivePermissions)
  //<-----v1.0.1---
  // Permission: Tasks.Create (or super admin override)
  const canCreate =
  await hasPermission(res.locals?.effectivePermissions?.Positions, 'Edit')
 //await hasPermission(res.locals?.superAdminPermissions?.Positions, 'Edit')
  if (!canCreate) {
    return res.status(403).json({ message: 'Forbidden: missing Positions.Edit permission' });
  }
  //-----v1.0.1--->

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
      selectedTemplete:
        updateFields.template?.templateName ?? currentPosition.selectedTemplete,
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
      status: updateFields.status ?? currentPosition.status,// v1.0.2  -  Venkatesh   -  added status change functionality
      updatedBy: ownerId,
    };

    // Handle rounds update only if template is provided and has rounds
    if (updateFields.template?.rounds) {
      positionData.rounds = updateFields.template.rounds.map((round) => ({
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
      // Keep existing rounds if no template rounds provided
      positionData.rounds = currentPosition.rounds;
    }

    // Compare current values with updateFields to identify changes
    const changes = Object.entries(positionData)
      .filter(([key, newValue]) => {
        const oldValue = currentPosition[key];
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
        return oldValue !== newValue;
      })
      .map(([key, newValue]) => ({
        fieldName: key,
        oldValue: currentPosition[key],
        newValue,
      }));

    if (changes.length === 0) {
      return res.status(200).json({
        status: "no_changes",
        message: "No changes detected, position details remain the same",
      });
    }

    const updatedPosition = await Position.findByIdAndUpdate(
      positionId,
      { $set: positionData },
      { new: true }
    );

    if (!updatedPosition) {
      return res.status(404).json({ message: "Position not found." });
    }

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
      severity: res.statusCode >= 500 ? "high" : "low",
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

    res.status(201).json({
      status: "success",
      message: "Position updated successfully",
      data: updatedPosition,
    });
  } catch (error) {
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Update Position",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    res.status(500).json({
      status: "error",
      message: error.message,
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

// const getPositionById = async (req, res) => {

//   const { id } = req.params; // Position ID from URL params
//   const { tenantId } = req.query; // Tenant ID from query string

//   try {
//     // Validate tenantId (if required)
//     if (!tenantId) {
//       return res.status(400).json({
//         success: false,
//         error: "Tenant ID is required"
//       });
//     }

//     // Find position by ID AND tenantId (ensures data isolation)
//     const position = await Position.findOne({
//       _id: id,
//       tenantId: tenantId, // Filter by tenant
//     }).lean(); // Convert to plain JS object for performance

//     if (!position) {
//       return res.status(404).json({
//         success: false,
//         message: "Position not found or not accessible for this tenant"
//       });
//     }

//     // Success response
//     res.status(200).json(
//       position
//     );

//   } catch (error) {
//     console.error("Error fetching position:", error);
//     console.error('Error details:', {
//       error: error.message,
//       stack: error.stack
//     });
//     res.status(500).json({
//       success: false,
//       error: "Server Error"
//     });
//   }
// };

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
  try {
    const { positionId, round, roundId } = req.body;

    //res.locals.loggedByController = true;
    //console.log("effectivePermissions",res.locals?.effectivePermissions)
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    const canCreate =
    await hasPermission(res.locals?.effectivePermissions?.Positions, 'Edit')
   //await hasPermission(res.locals?.superAdminPermissions?.Positions, 'Edit')
    if (!canCreate) {
      return res.status(403).json({ message: 'Forbidden: missing Positions.Edit permission' });
    }
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

    if (roundId) {
      // === Editing Existing Round ===
      const roundIndex = position.rounds.findIndex(
        (r) => r._id.toString() === roundId
      );

      if (roundIndex === -1) {
        return res.status(404).json({ message: "Round not found." });
      }

      // Remove the existing round
      const existingRound = position.rounds.splice(roundIndex, 1)[0];
      const updatedRound = {
        ...existingRound.toObject(),
        ...round,
      };

      // Insert updated round at desired sequence (minus 1 due to zero-based index)
      const desiredIndex = Math.max((updatedRound.sequence || 1) - 1, 0);
      position.rounds.splice(desiredIndex, 0, updatedRound);

      // Reorder sequences
      reorderInterviewRounds(position);

      // Set roundsModified to true
      position.roundsModified = true;

      await position.save();

      return res.status(200).json({
        message: "Round updated successfully.",
        data: updatedRound,
      });
    } else {
      // === Adding New Round ===
      const newSequence = round.sequence || position.rounds.length + 1;
      const newIndex = Math.max(newSequence - 1, 0);

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

      return res.status(201).json({
        message: "Interview round created successfully.",
        data: newRound,
      });
    }

    // === Utility to Normalize Sequence ===
    function reorderInterviewRounds(positionDoc) {
      positionDoc.rounds.forEach((r, idx) => {
        r.sequence = idx + 1;
      });
    }
  } catch (error) {
    console.error("Error saving interview round:", error);
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
  //res.locals.loggedByController = true;
  //console.log("effectivePermissions",res.locals?.effectivePermissions)
  //<-----v1.0.1---
  // Permission: Tasks.Create (or super admin override)
  const canCreate =
  await hasPermission(res.locals?.effectivePermissions?.Positions, 'Delete')
 //await hasPermission(res.locals?.superAdminPermissions?.Positions, 'Delete')
  if (!canCreate) {
    return res.status(403).json({ message: 'Forbidden: missing Positions.Delete permission' });
  }
  //-----v1.0.1--->

  try {
    console.log("=== PATCH /positions/:positionId/rounds/:roundId called ===");

    const { positionId: rawPositionId, roundId: rawRoundId } = req.params;
    const { round: updates } = req.body;

    // ---------- Validate ObjectId ----------
    if (!mongoose.Types.ObjectId.isValid(rawPositionId)) {
      console.log("Invalid Position ID:", rawPositionId);
      return res.status(400).json({ message: "Invalid Position ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(rawRoundId)) {
      console.log("Invalid Round ID:", rawRoundId);
      return res.status(400).json({ message: "Invalid Round ID" });
    }

    // ---------- Fetch Position ----------
    const position = await Position.findById(rawPositionId);
    if (!position) {
      console.log("Position not found:", rawPositionId);
      return res.status(404).json({ message: "Position not found." });
    }

    // ---------- Fetch Round ----------
    const round = position.rounds.id(rawRoundId);
    if (!round) {
      console.log("Round not found:", rawRoundId);
      return res.status(404).json({ message: "Round not found." });
    }

    // ---------- Handle assessment rounds (interviewerType should be empty) ----------
    if (updates.assessmentId || round.assessmentId) {
      console.log("Assessment round detected - clearing interviewer fields");
      updates.interviewerType = '';
      updates.interviewerGroupName = '';
      updates.interviewerViewType = '';
      updates.selectedInterviewersType = '';
      updates.interviewers = [];
    } else {
      // ---------- Handle interviewer type transitions ----------
      // If changing interviewerType, clear dependent fields appropriately
      if (updates.interviewerType && updates.interviewerType !== round.interviewerType) {
        console.log(`Changing interviewerType from ${round.interviewerType} to ${updates.interviewerType}`);
        
        if (updates.interviewerType === 'internal') {
          // Clear fields not relevant for internal interviewers
          updates.interviewerViewType = '';
          updates.selectedInterviewersType = '';
        } else if (updates.interviewerType === 'external') {
          // Clear fields not relevant for external interviewers
          updates.interviewerGroupName = '';
          updates.interviewers = [];
        }
      }
    }

    // ---------- Merge & Validate Updates (skip system fields) ----------
    const { _id, createdAt, updatedAt, ...roundPlain } = round.toObject();

    const roundObjectForValidation = {
      ...roundPlain,
      ...updates,
    };

    const { error } = validateRoundPatchData.validate(roundObjectForValidation, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach((err) => {
        errors[err.path.join(".")] = err.message;
      });
      console.log("Validation errors:", errors);
      return res.status(400).json({ status: "error", errors });
    }

    // ---------- Apply Updates ----------
    Object.keys(updates).forEach((key) => {
      if (key === "assessmentId" && updates.assessmentId) {
        round[key] = new mongoose.Types.ObjectId(updates.assessmentId);
      } else if (key === "interviewers" && Array.isArray(updates.interviewers)) {
        round[key] = updates.interviewers.map((id) => new mongoose.Types.ObjectId(id));
      } else {
        round[key] = updates[key];
      }
    });

    // ---------- Reorder Rounds if Sequence Changed ----------
    if (updates.sequence) {
      position.rounds = position.rounds.filter((r) => !r._id.equals(rawRoundId));
      const desiredIndex = Math.max(updates.sequence - 1, 0);
      position.rounds.splice(desiredIndex, 0, round);
      position.rounds.forEach((r, idx) => (r.sequence = idx + 1));
    }

    // ---------- Save Position ----------
    await position.save();
    console.log("Round updated successfully:", round._id);

    return res.status(200).json({
      message: "Round updated successfully.",
      data: round,
    });
  } catch (err) {
    console.error("Error updating interview round:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};






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

    module.exports = {
      createPosition,
      updatePosition,
      saveInterviewRoundPosition,
      deleteRound,
      updateInterviewRound
    };
