const { Position } = require('../models/position.js');

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
  res.locals.processName = 'Create Position';
  console.log("🔁 Incoming request to createPosition:", req.body);

  // Check if ownerId exists
  if (!req.body.ownerId) {
    res.locals.responseData = {
      status: 'error',
      message: "OwnerId field is required",
    };
    return res.status(400).json(res.locals.responseData);
  }

  try {
    console.log("📦 Position data received:", req.body);

    // Map request body to schema fields
    const positionData = {
      title: req.body.title || "",
      companyname: req.body.companyName || "",
      jobDescription: req.body.jobDescription || "",
      minexperience: req.body.minexperience || undefined,
      maxexperience: req.body.maxexperience || undefined,
      skills: req.body.skills || [],
      additionalNotes: req.body.additionalNotes || "",
      ownerId: req.body.ownerId || "",
      tenantId: req.body.tenantId || "",
      minSalary: req.body.minSalary || "",
      maxSalary: req.body.maxSalary || "",
      NoofPositions: req.body.NoofPositions ? Number(req.body.NoofPositions) : undefined,
      Location: req.body.Location || "",
      selectedTemplete: req.body.template?.templateName || null,
      createdBy: req.body.ownerId, // ✅ Fixed: use req.body.ownerId instead of undefined ownerId
    };

    // Handle rounds if template exists
    if (req.body.template && req.body.template.rounds && req.body.template.rounds.length > 0) {
      positionData.rounds = req.body.template.rounds.map(round => ({
        roundTitle: round.roundTitle || "",
        interviewMode: round.interviewMode || "",
        interviewerType: round.interviewerType || "",
        duration: round.interviewDuration ? round.interviewDuration.toString() : "",
        instructions: round.instructions || "",
        selectedInterviewersType: round.selectedInterviewersType || "",
        interviewers: round.interviewers || [],
        assessmentId: round.assessmentId || null,
        sequence: round.sequence || 0,
        questions: round.interviewQuestionsList ? round.interviewQuestionsList.map(q => ({
          questionId: q.questionId || null,
          snapshot: q.snapshot || null
        })) : []
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
      feedType: 'info',
      action: {
        name: 'position_created',
        description: `Position was created`,
      },
      ownerId: req.body.ownerId,
      parentId: newPosition._id,
      parentObject: 'Position',
      metadata: req.body,
      severity: res.statusCode >= 500 ? 'high' : 'low',
      message: `Position was created successfully`,
    };

    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: 'Create Position',
      requestBody: req.body,
      status: 'success',
      message: 'Position created successfully',
      responseBody: newPosition,
    };

    return res.status(201).json({
      status: 'success',
      message: 'Position created successfully',
      data: newPosition,
    });
  } catch (error) {
    console.error("❌ Error creating position:", error.message);

    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: 'Create Position',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};


const updatePosition = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Update Position';

  const positionId = req.params.id;
  const { tenantId, ownerId, ...updateFields } = req.body;

  try {
    const currentPosition = await Position.findById(positionId).lean();

    if (!currentPosition) {
      return res.status(404).json({ message: "Position not found" });
    }

    const positionData = {
      title: updateFields.title || currentPosition.title,
      companyname: updateFields.companyName || currentPosition.companyname,
      jobDescription: updateFields.jobDescription || currentPosition.jobDescription,
      minexperience: updateFields.minexperience || currentPosition.minexperience,
      maxexperience: updateFields.maxexperience || currentPosition.maxexperience,
      selectedTemplete: updateFields.template?.templateName ?? currentPosition.selectedTemplete,
      skills: updateFields.skills || currentPosition.skills,
      additionalNotes: updateFields.additionalNotes || currentPosition.additionalNotes,
      ownerId: ownerId || currentPosition.ownerId,
      tenantId: tenantId || currentPosition.tenantId,
      minSalary: updateFields.minSalary || currentPosition.minSalary,
      maxSalary: updateFields.maxSalary || currentPosition.maxSalary,
      NoofPositions: updateFields.NoofPositions ? Number(updateFields.NoofPositions) : currentPosition.NoofPositions,
      Location: updateFields.Location || currentPosition.Location,
      updatedBy: ownerId
    };

    // Handle rounds update only if template is provided and has rounds
    if (updateFields.template?.rounds) {
      positionData.rounds = updateFields.template.rounds.map(round => ({
        roundTitle: round.roundTitle || "",
        interviewMode: round.interviewMode || "",
        interviewerType: round.interviewerType || "",
        duration: round.interviewDuration ? round.interviewDuration.toString() : "",
        instructions: round.instructions || "",
        selectedInterviewersType: round.selectedInterviewersType || "",
        interviewers: round.interviewers || [],
        assessmentId: round.assessmentId || null,
        sequence: round.sequence || 0,
        questions: round.interviewQuestionsList ? round.interviewQuestionsList.map(q => ({
          questionId: q.questionId || null,
          snapshot: q.snapshot || null
        })) : []
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
            array.map(({ _id, ...rest }) => rest)
              .sort((a, b) => (a.skill || "").localeCompare(b.skill || ""));
          return JSON.stringify(normalizeArray(oldValue)) !== JSON.stringify(normalizeArray(newValue));
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
        status: 'no_changes',
        message: 'No changes detected, position details remain the same',
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
      feedType: 'update',
      action: {
        name: 'position_updated',
        description: `Position was updated`,
      },
      ownerId,
      parentId: positionId,
      parentObject: 'Position',
      metadata: req.body,
      severity: res.statusCode >= 500 ? 'high' : 'low',
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
      })),
      history: changes,
    };

    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Update Position',
      requestBody: req.body,
      status: 'success',
      message: 'Position updated successfully',
      responseBody: updatedPosition,
    };

    res.status(201).json({
      status: 'success',
      message: 'Position updated successfully',
      data: updatedPosition,
    });
  } catch (error) {
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Update Position',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };

    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};



const saveInterviewRoundPosition = async (req, res) => {
  try {

    const { positionId, round, roundId } = req.body;

    if (!positionId || !round) {
      return res.status(400).json({ message: "Interview ID and round data are required." });
    }

    // Find the position document
    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: "Position not found." });
    }

    if (roundId) {
      // **Edit an existing round**
      const roundIndex = position.rounds.findIndex(r => r._id.toString() === roundId);
      if (roundIndex === -1) {
        return res.status(404).json({ message: "Round not found." });
      }

      // Update the existing round with new data
      position.rounds[roundIndex] = { ...position.rounds[roundIndex], ...round };
      await position.save();

      // **Reorder all rounds based on sequence**
      await reorderInterviewRounds(position);

      console.log("Position rounds", position.rounds[roundIndex]);


      return res.status(200).json({
        message: "Round updated successfully.",
        data: position.rounds[roundIndex],
      });

    } else {
      // **Add a new round**
      const totalRounds = position.rounds.length;
      const newSequence = round.sequence || totalRounds + 1; // Default to next sequence

      // **Shift existing rounds if inserting at a lower sequence**
      position.rounds.forEach(r => {
        if (r.sequence >= newSequence) {
          r.sequence += 1;
        }
      });
      // **Add the new round**
      const newRound = {
        ...round,
        sequence: newSequence,
      };
      position.rounds.push(newRound);
      await position.save();

      // **Reorder rounds after adding**
      await reorderInterviewRounds(position);

      return res.status(201).json({ message: "Interview round created successfully.", data: position.rounds[position.rounds.length - 1], });
    }

    /**
     * Reorders interview rounds based on sequence. 
     */
    async function reorderInterviewRounds(positionId) {
      position.rounds.sort((a, b) => a.sequence - b.sequence);

      // Reassign sequence numbers starting from 1
      position.rounds.forEach((round, index) => {
        round.sequence = index + 1;
      });

      await position.save();
    }



    // Sending emails to interviewers
    // const emailPromises = [];

    // for (const interviewRounds of rounds) {
    //     console.log("Processing Round:", JSON.stringify(round, null, 2));

    //     if (round.mode === "Virtual" && Array.isArray(round.interviewers)) {
    //         console.log("Virtual Round Detected:", round.round);

    //         // Validate interviewers
    //         if (!Array.isArray(round.interviewers) || round.interviewers.length === 0) {
    //             console.error("Invalid interviewers data:", round);
    //             continue;
    //         }

    //         // Generate meetLink for the round
    //         const ecryptArgRound = { user: "host", details: { teamId, round: round.round } };

    //         try {
    //             console.log("Encrypting MeetLink Data:", JSON.stringify(ecryptArgRound, null, 2));
    //             const encryptedMeetLink = encrypt(ecryptArgRound, 'meet');
    //             console.log("Encrypted MeetLink:", encryptedMeetLink);

    //             for (const interviewer of round.interviewers) {
    //                 if (!interviewer._id) {
    //                     console.error("Skipping invalid interviewer:", interviewer);
    //                     continue;
    //                 }

    //                 const ecryptArg = {
    //                     user: "host",
    //                     details: { id: interviewer._id, candidateId, round: round.round }
    //                 };
    //                 console.log("Encrypting Host Data:", JSON.stringify(ecryptArg, null, 2));

    //                 const encryptedHost = encrypt(ecryptArg, 'meet');
    //                 console.log("Encrypted Host Data:", encryptedHost);

    //                 round.meetLink = `http://localhost:3000/meetId/${teamId}/${savedInterview._id}?user=${encryptedHost}`;
    //                 console.log("Generated Meet Link:", round.meetLink);

    //                 try {
    //                     const user = await Users.findById(interviewer._id);
    //                     if (user && user.Email) {
    //                         console.log("Sending Email to:", user.Email);
    //                         emailPromises.push(
    //                             sendEmail(
    //                                 user.Email,
    //                                 "Interview Scheduled",
    //                                 `Your scheduled interview can be accessed using this link: ${round.meetLink}`
    //                             )
    //                         );
    //                     }
    //                 } catch (err) {
    //                     console.error(`Error fetching interviewer ${interviewer._id}:`, err);
    //                 }
    //             }
    //         } catch (encryptionError) {
    //             console.error("Encryption Error:", encryptionError);
    //         }
    //     }
    // }

    // // Generate and store OTP for candidate
    // const otp = generateOTP(CandidateId);
    // console.log("Generated OTP:", otp);

    // const otpInstance = new TeamsOtpSchema({
    //     teamId,
    //     candidateId,
    //     otp,
    //     expiresAt: new Date(Date.now() + 90 * 1000), // 90 seconds expiration
    // });

    // console.log("OTP Instance:", otpInstance);
    // await otpInstance.save();

    // // Sending email to candidate
    // if (candidate.Email) {
    //     console.log("Sending email to candidate:", candidate.Email);

    //     const ecryptArg = { user: "public", details: { id: candidateId } };
    //     console.log("Encrypting Candidate Data:", JSON.stringify(ecryptArg, null, 2));

    //     const encryptedUser = encrypt(ecryptArg, 'meet');
    //     console.log("Encrypted Candidate Data:", encryptedUser);

    //     emailPromises.push(
    //         sendEmail(
    //             candidate.Email,
    //             "Interview Invitation",
    //             `You are invited to attend a virtual interview with this link: http://localhost:3000/meetId/${teamId}/${savedInterview._id}?user=${encryptedUser}. Your OTP is: ${otp}`
    //         )
    //     );
    // }

    // // Wait for all emails to be sent
    // await Promise.all(emailPromises);
  } catch (error) {
    console.error("Error saving interview round:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getPositionById = async (req, res) => {

  const { id } = req.params; // Position ID from URL params
  const { tenantId } = req.query; // Tenant ID from query string

  try {
    // Validate tenantId (if required)
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: "Tenant ID is required"
      });
    }

    // Find position by ID AND tenantId (ensures data isolation)
    const position = await Position.findOne({
      _id: id,
      tenantId: tenantId, // Filter by tenant
    }).lean(); // Convert to plain JS object for performance

    
    
    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found or not accessible for this tenant"
      });
    }

    // Success response
    res.status(200).json(
      position
    );

  } catch (error) {
    console.error("Error fetching position:", error);
    console.error('Error details:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: "Server Error"
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

module.exports = {
  createPosition,
  updatePosition,
  saveInterviewRoundPosition,
  getPositionById
  // updateRounds
};
