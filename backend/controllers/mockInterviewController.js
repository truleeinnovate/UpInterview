// v1.0.0  - mansoor - removed the sort by createdAt in the mock interview controller to save the mockinterview in the online
// v1.0.1 - Ashok - added the sort by _id in the createMockInterview controller
// v1.0.2 - Added backend validation for mock interview
// controllers/mockInterviewController.js
const { MockInterview } = require("../models/Mockinterview/mockinterview");
const { MockInterviewRound } = require("../models/Mockinterview/mockinterviewRound");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService");
const { validateMockInterview, validateMockInterviewUpdate } = require("../validations/mockInterviewValidation");

exports.createMockInterview = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create mock interview with rounds";

  try {
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
      rounds,
      createdById,
      lastModifiedById,
    } = req.body;

    // Generate mockInterviewCode using centralized service
    const mockInterviewCode = await generateUniqueId('MINT', MockInterview, 'mockInterviewCode');

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

    // console.log("New mock interview created:", newMockInterview);
    // console.log("rounds",rounds);
    

    // Create rounds if provided (for Page 2 submit)
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
          currentActionReason: round.currentActionReason,
          meetingId: round.meetingId
        });
        
        return mockInterviewRound.save();
      });

      createdRounds = await Promise.all(roundPromises);
    }

    // Generate feed and logs
    res.locals.feedData = {
      tenantId,
      feedType: "info",
      action: {
        name: "mock_interview_created",
        description: `Mock interview ${rounds && rounds.length > 0 ? 'with ' + rounds.length + ' rounds ' : ''}was created successfully`,
      },
      ownerId,
      parentId: newMockInterview._id,
      parentObject: "Mock interview",
      metadata: req.body,
      severity: "low",
      message: `Mock interview ${rounds && rounds.length > 0 ? 'with ' + rounds.length + ' rounds ' : ''}was created successfully`,
    };

    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Create mock interview with rounds",
      requestBody: req.body,
      message: "Mock interview created successfully",
      status: "success",
      responseBody: {
        mockInterview: newMockInterview,
        rounds: createdRounds
      },
    };

    // Send response
    res.status(201).json({
      status: "success",
      message: `Mock interview ${rounds && rounds.length > 0 ? 'with ' + rounds.length + ' rounds ' : ''}created successfully`,
      data: {
        mockInterview: newMockInterview,
        rounds: createdRounds
      },
    });
  } catch (error) {
    console.error("Error creating mock interview:", error);
    
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create mock interview",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    res.status(500).json({
      status: "error",
      message: "Failed to create mock interview. Please try again later.",
      data: { error: error.message },
    });
  }
};


// ✅ FIXED - No Duplicate Rounds on PATCH (Scoping Issue Fixed)
exports.updateMockInterview = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update mock interview";

  const mockId = req.params.id;
  console.log("UPDATE - mockId:", mockId);
  console.log("UPDATE - req.body:", req.body);

  try {
    // ✅ Validate incoming data
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
    } = validation.validatedData;

    // ✅ Fetch existing mock interview
    const existingMockInterview = await MockInterview.findById(mockId);
    if (!existingMockInterview) {
      return res.status(404).json({
        status: "error",
        message: "Mock interview not found"
      });
    }

    let changes = [];
    let roundsUpdatedCount = 0;
    let roundsCreatedCount = 0;

    // ✅ Update skills
    if (skills && Array.isArray(skills)) {
      changes.push({
        fieldName: "skills",
        oldValue: existingMockInterview.skills,
        newValue: skills
      });
      existingMockInterview.skills = skills;
    }

    // ✅ Update basic fields
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

    // ✅ Update metadata
    if (lastModifiedById) existingMockInterview.updatedBy = lastModifiedById;
    existingMockInterview.updatedAt = new Date();

    // ✅ Handle rounds - FIXED LOGIC
    if (req.body.rounds !== undefined) {
      console.log("Processing rounds update for mock interview:", mockId);

      let roundsArray = [];
      if (Array.isArray(req.body.rounds)) {
        roundsArray = req.body.rounds;
      } else if (req.body.rounds && typeof req.body.rounds === "object") {
        console.log("Converting single round object to array");
        roundsArray = [req.body.rounds];
      }
// console.log("roundsArray",roundsArray);

      if (roundsArray.length > 0) {
        for (const round of roundsArray) {
          console.log("Processing round:", round);
          
          // 🔥 FIX: Check both _id and id fields properly
          const roundId = round?._id || round?.id;

          if (roundId) {
            // ✅ This is an EXISTING round - UPDATE it
            console.log(`Updating existing round: ${roundId}`);

            try {
              const existingRound = await MockInterviewRound.findOne({
                _id: roundId,
                mockInterviewId: mockId
              });

              if (!existingRound) {
                console.warn(`Round ${roundId} not found in database, skipping update`);
                continue;
              }

              // Track changes
              const roundChanges = [];
              const updateFields = [
                "sequence", "roundTitle", "interviewMode", "interviewType",
                "interviewerType", "duration", "instructions", "dateTime",
                "interviewerViewType", "status", "currentAction",
                "currentActionReason", "meetingId"
              ];

              // Update scalar fields
              updateFields.forEach(field => {
                if (round[field] !== undefined && existingRound[field] !== round[field]) {
                  roundChanges.push({
                    fieldName: `${field} (round ${round.sequence || existingRound.sequence})`,
                    oldValue: existingRound[field],
                    newValue: round[field]
                  });
                  existingRound[field] = round[field];
                }
              });

              // Update interviewers array
              if (round.interviewers && Array.isArray(round.interviewers)) {
                const oldInterviewers = JSON.stringify(existingRound.interviewers);
                const newInterviewers = JSON.stringify(round.interviewers);
                
                if (oldInterviewers !== newInterviewers) {
                  roundChanges.push({
                    fieldName: `interviewers (round ${round.sequence || existingRound.sequence})`,
                    oldValue: existingRound.interviewers,
                    newValue: round.interviewers
                  });
                  existingRound.interviewers = round.interviewers;
                }
              }

              // Save if there are changes
              if (roundChanges.length > 0) {
                await existingRound.save();
                changes.push(...roundChanges);
                roundsUpdatedCount++;
                console.log(`✅ Round ${roundId} updated successfully`);
              } else {
                console.log(`No changes detected for round ${roundId}`);
              }

            } catch (err) {
              console.error(`❌ Error updating round ${roundId}:`, err);
              throw err;
            }

          } else {
            // ✅ This is a NEW round - CREATE it
            console.log(`Creating new round with sequence: ${round.sequence}`);

            try {
              const currentRoundCount = await MockInterviewRound.countDocuments({ 
                mockInterviewId: mockId 
              });

              const newRound = new MockInterviewRound({
                mockInterviewId: mockId,
                sequence: round.sequence || (currentRoundCount + 1),
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

              const savedRound = await newRound.save();
              
              // Add to mock interview rounds array
              if (!existingMockInterview.rounds) {
                existingMockInterview.rounds = [];
              }
              existingMockInterview.rounds.push(savedRound._id);

              changes.push({
                fieldName: "new_round",
                oldValue: "none",
                newValue: `Round ${savedRound.sequence} created`
              });

              roundsCreatedCount++;
              console.log(`✅ New round created with ID: ${savedRound._id}`);

            } catch (err) {
              console.error(`❌ Error creating new round:`, err);
              throw err;
            }
          }
        }

        console.log(`Summary: ${roundsUpdatedCount} rounds updated, ${roundsCreatedCount} rounds created`);
      }
    }

    // ✅ Save mock interview
    const updatedMockInterview = await existingMockInterview.save();

    // ✅ Feed data
    res.locals.feedData = {
      tenantId: tenantId || existingMockInterview.tenantId,
      feedType: "update",
      action: {
        name: "mock_interview_updated",
        description: "Mock interview updated successfully",
      },
      ownerId: ownerId || existingMockInterview.ownerId,
      parentId: mockId,
      parentObject: "Mock interview",
      metadata: req.body,
      severity: "low",
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
      })),
      history: changes,
    };

    // ✅ Log data
    res.locals.logData = {
      tenantId: tenantId || existingMockInterview.tenantId,
      ownerId: ownerId || existingMockInterview.ownerId,
      processName: "Update mock interview",
      requestBody: req.body,
      message: "Mock interview updated successfully",
      status: "success",
      responseBody: updatedMockInterview,
    };

    // ✅ Get all updated rounds
    const updatedRounds = await MockInterviewRound.find({ 
      mockInterviewId: mockId 
    }).sort({ sequence: 1 });

    // ✅ Success response
    res.status(200).json({
      status: "success",
      message: "Mock interview updated successfully",
      data: {
        mockInterview: updatedMockInterview,
        rounds: updatedRounds,
        updateSummary: {
          totalRounds: updatedRounds.length,
          roundsUpdated: roundsUpdatedCount,
          roundsCreated: roundsCreatedCount,
          totalChanges: changes.length
        }
      },
    });

  } catch (error) {
    console.error("❌ Error updating MockInterview:", error);

    // ✅ Safe logging of error - FIXED: Proper string conversion
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Update mock interview",
      requestBody: req.body,
      message: error.message || "Unknown error occurred",
      status: "error",
      responseError: error.stack || error.message || "No stack trace available"
    };

    res.status(500).json({
      status: "error",
      message: "Failed to update mock interview. Please try again later.",
      data: { error: error.message },
    });
  }
};


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
