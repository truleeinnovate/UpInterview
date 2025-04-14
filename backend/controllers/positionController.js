const { Position } = require('../models/position.js');

const createPosition = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Create Position';

  if (!req.body.ownerId) {
    res.locals.responseData = {
      status: 'error',
      message: "OwnerId field is required",
    };
    return res.status(400).json(res.locals.responseData);
  }

  try {
    console.log("position data ", req.body);

    // const position = new Position({ ...req.body }); // Store all fields dynamically

    // Map request body to schema fields
    const positionData = {
      title: req.body.title || "",
      companyname: req.body.companyName || "",
      jobDescription: req.body.jobDescription || "",
      minexperience: req.body.minexperience || undefined,
      maxexperience: req.body.maxexperience || undefined,
      // selectedTemplete: req.body.template?._id || null,
      skills: req.body.skills || [],
      additionalNotes: req.body.additionalNotes || "",
      CreatedBy: req.body.ownerId || "",
      LastModifiedById: req.body.ownerId || "",
      ownerId: req.body.ownerId || "",
      tenantId: req.body.tenantId || "",
      minSalary: req.body.minSalary || "",
      maxSalary: req.body.maxSalary || "",
      NoofPositions: req.body.NoofPositions ? Number(req.body.NoofPositions) : undefined,
      Location: req.body.Location || "",
      rounds: [], // Initialize as empty array
      selectedTemplete: req.body.template.templateName || null
    };

    if (req.body.template && req.body.template.rounds) {
      positionData.rounds = req.body.template.rounds.map((round) => ({
        roundName: round.roundName || "",
        interviewMode: round.interviewMode || "",
        interviewType: round.interviewType || "",
        duration: round.duration || "",
        instructions: round.instructions || ""
      }));
    }

    // console.log("createPosition position",positionData);

    const position = new Position(positionData);
    const newPosition = await position.save();

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

    res.status(201).json({
      status: 'success',
      message: 'Position created successfully',
      data: newPosition,
    });
  } catch (error) {
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: 'Create Position',
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


const updatePosition = async (req, res) => {
  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = 'Update Position';

  const positionId = req.params.id;
  const { tenantId, ownerId, ...updateFields } = req.body;

  try {
    // Fetch current position details
    const currentPosition = await Position.findById(positionId).lean();

    if (!currentPosition) {
      return res.status(404).json({ message: "Position not found" });
    }
    // console.log("updateFields data", updateFields );

    const positionData = {
      title: updateFields.title || currentPosition.title,
      companyname: updateFields.companyName || currentPosition.companyname,
      jobDescription: updateFields.jobDescription || currentPosition.jobDescription,
      minexperience: updateFields.experienceMin || currentPosition.minexperience,
      maxexperience: updateFields.experienceMax || currentPosition.maxexperience,

      // selectedTemplete: updateFields.template?.templateName || currentPosition?.templateName,
      selectedTemplete: updateFields.template?.templateName ?? currentPosition.selectedTemplete,


      skills: updateFields.skills || currentPosition.skills,
      additionalNotes: updateFields.additionalNotes || currentPosition.additionalNotes,
      CreatedBy: ownerId || currentPosition.CreatedBy,
      LastModifiedById: ownerId || currentPosition.LastModifiedById,
      ownerId: ownerId || currentPosition.ownerId,
      tenantId: tenantId || currentPosition.tenantId,
      minSalary: updateFields.minSalary || currentPosition.minSalary,
      maxSalary: updateFields.maxSalary || currentPosition.maxSalary,
      NoofPositions: updateFields.NoofPositions ? Number(updateFields.NoofPositions) : currentPosition.NoofPositions,
      Location: updateFields.Location || currentPosition.Location,
      rounds: updateFields.template?.rounds?.map(round => ({
        roundName: round.roundName || "",
        interviewMode: round.interviewMode || "",
        interviewType: round.interviewType || "",
        duration: round.duration || "",
        instructions: round.instructions || ""
      })) ?? currentPosition.rounds
      // rounds: (updateFields.template?.rounds?.length > 0 ? 
      //   updateFields.template?.rounds?.map(round => ({
      //   roundName: round.roundName || "",
      //   interviewMode: round.interviewMode || "",
      //   interviewType: round.interviewType || "",
      //   duration: round.duration || "",
      //   instructions: round.instructions || ""
      // })) : currentPosition.rounds)
    };

    // Compare current values with updateFields to identify changes
    const changes = Object.entries(positionData)
      .filter(([key, newValue]) => {
        const oldValue = currentPosition[key];


        // console.log(`key: ${key}, oldValue: ${oldValue}, newValue: ${newValue}`);


        // console.log("Old Value:", oldValue);
        // console.log("New Value:", newValue);



        // Handle arrays (e.g., `skills`) by comparing stringified versions
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

    // console.log("Changes detected:", changes);    

    // If no changes detected, return early
    if (changes.length === 0) {
      return res.status(200).json({
        status: 'no_changes',
        message: 'No changes detected, position details remain the same',
      });
    }

    // Update the position
    const updatedPosition = await Position.findByIdAndUpdate(
      positionId,
      { $set: positionData },
      { new: true }
    );

    if (!updatedPosition) {
      return res.status(404).json({ message: "Position not found." });
    }

    // Generate feed
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

    // Generate logs
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Update Position',
      requestBody: req.body,
      status: 'success',
      message: 'Position updated successfully',
      responseBody: updatedPosition,
    };

    // Send response
    res.status(201).json({
      status: 'success',
      message: 'Position updated successfully',
      data: updatedPosition,
    });
  } catch (error) {
    // Handle errors
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
  saveInterviewRoundPosition
  // updateRounds
};
