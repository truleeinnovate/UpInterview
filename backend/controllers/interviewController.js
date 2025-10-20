

// v1.0.0  -  Ashraf  -  fixed name assessment to assessment template
// v1.0.2  -  Ashraf  -  added sending interview email
// v1.0.3  -  Ashok  -  Added new controller to get all interviews
// v1.0.4  -  Ranjith  -  fixed new update api in updateInterviewRound and interview seprated the patch and post call
// v1.0.5  -  Venkatesh - Fetch wallet transaction data in getAllInterviewRounds and return settlement status


const mongoose = require("mongoose");
const { Interview } = require("../models/Interview/Interview.js");
const { InterviewRounds } = require("../models/Interview/InterviewRounds.js");
const InterviewTemplate = require("../models/InterviewTemplate.js");
const { Contacts } = require("../models/Contacts");
const { Users } = require("../models/Users");
// v1.0.2 <-----------------------------------------
const { Candidate } = require("../models/candidate.js");
const { encrypt, generateOTP } = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const interviewQuestions = require("../models/Interview/selectedInterviewQuestion.js");
const { Position } = require("../models/Position/position.js");
// <-------------------------------v1.0.0
const Assessment = require("../models/Assessment/assessmentTemplates.js");
const Wallet = require("../models/WalletTopup");
const {
    sendInterviewRoundEmails,
} = require("./EmailsController/interviewEmailController");
const { updateInterviewStatus, TERMINAL_STATUSES } = require('../services/interviewStatusService');
// Import usage service for internal interview tracking
const { 
    checkInternalInterviewUsageLimit, 
    getInternalInterviewUsageStats 
} = require('../services/interviewUsageService');
// v1.0.2 <-----------------------------------------
// ------------------------------v1.0.0 >

// Import push notification functions
const {
    createInterviewCreatedNotification,
    createInterviewRoundScheduledNotification,
    createInterviewStatusUpdateNotification,
} = require("./PushNotificationControllers/pushNotificationInterviewController");

// const createInterview = async (req, res) => {
//   try {
//     const {
//       candidateId,
//       positionId,
//       templateId,
//       status,
//       orgId,
//       userId,
//       interviewId,
//       updatingInterviewStatus,
//       completionReason,
//     } = req.body;
//     let candidate = null;

//     if (!updatingInterviewStatus) {
//       candidate = await Candidate.findById(candidateId);
//       if (!candidate) {
//         return res.status(404).json({ message: "Candidate not found" });
//       }
//     }

//     console.log(
//       "roundsToSave",
//       candidateId,
//       positionId,
//       templateId,
//       status,
//       orgId,
//       userId,
//       interviewId,
//       updatingInterviewStatus,
//       completionReason
//     );

//     const template = await InterviewTemplate.findById(templateId);

//     let interview;
//     let isUpdate = Boolean(interviewId);
//     let interviewData = {
//       candidateId,
//       positionId,
//       templateId: template ? templateId : undefined,
//       ownerId: userId,
//       tenantId: orgId || undefined,
//       completionReason,
//       status,
//     };

//     if (isUpdate) {
//       interviewData.updatedBy = userId;
//       interview = await Interview.findByIdAndUpdate(
//         interviewId,
//         interviewData,
//         { new: true }
//       );
//       if (!interview) {
//         return res.status(404).json({ message: "Interview not found" });
//       }
//     } else {
//       // Generate interviewCode for new interview
//       const lastInterview = await Interview.findOne({ tenantId: orgId })
//         .sort({ _id: -1 })
//         .select("interviewCode")
//         .lean();

//       let nextNumber = 1;
//       if (lastInterview && lastInterview.interviewCode) {
//         const match = lastInterview.interviewCode.match(/INT-(\d+)/);
//         if (match) {
//           nextNumber = parseInt(match[1], 10) + 1;
//         }
//       }
//       interviewData.interviewCode = `INT-${String(nextNumber).padStart(
//         5,
//         "0"
//       )}`;
//       interviewData.createdBy = userId;

//       interview = new Interview(interviewData);
//       await interview.save();
//     }

//     // Handle rounds and questions if not just updating status
//     if (!updatingInterviewStatus) {
//       const position = await Position.findById(positionId);
//       let roundsToSave = [];

//       if (position?.templateId?.toString() === templateId?.toString()) {
//         roundsToSave = position.rounds || [];
//       } else if (
//         position?.templateId &&
//         position?.templateId.toString() !== templateId?.toString()
//       ) {
//         roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//       } else if (
//         !position?.templateId &&
//         position?.rounds?.length > 0 &&
//         templateId
//       ) {
//         roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//       } else if (!position?.templateId && position?.rounds?.length > 0) {
//         roundsToSave = position.rounds;
//       } else if (templateId) {
//         roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//       }

//       console.log("roundsToSave", roundsToSave);

//       if (roundsToSave.length > 0) {
//         if (isUpdate) {
//           await InterviewRounds.deleteMany({ interviewId: interview._id });
//           await interviewQuestions.deleteMany({ interviewId: interview._id });
//         }

//         // Process each round with proper field mapping
//         for (let index = 0; index < roundsToSave.length; index++) {
//           const round = roundsToSave[index];

//           // Create round document with proper field mapping
//           const roundDoc = new InterviewRounds({
//             interviewId: interview._id,
//             sequence: index + 1, // Use index-based sequence
//             roundTitle: round.roundTitle || "",
//             interviewMode: round.interviewMode || "",
//             interviewType: round.interviewType || "", // This field was missing in your mapping
//             interviewerType: round.interviewerType || "",
//             selectedInterviewersType: round.selectedInterviewersType || "", // This field doesn't exist in schema
//             duration: round.duration || "", // Map interviewDuration to duration
//             instructions: round.instructions || "",
//             dateTime: round.dateTime || "",
//             interviewers: round.interviewers || [], // This should be ObjectId array
//             status: "Draft",
//             // meetLink: round.meetLink || [],
//             meetingId: round.meetingId || "",
//             assessmentId: round.assessmentId || null,
//             // questions: [], // Initialize as empty array
//             rejectionReason: round.rejectionReason || "",
//             minimumInterviewers: round.minimumInterviewers || "", // This field doesn't exist in schema
//             interviewerGroupId: round.interviewerGroupId || null, // This field doesn't exist in schema
//           });

//           // Save the round document
//           const savedRound = await roundDoc.save();
//           console.log("Saved roundDoc:", JSON.stringify(savedRound, null, 2));

//           // Handle questions if they exist and are valid
//           if (
//             round.questions &&
//             Array.isArray(round.questions) &&
//             round.questions.length > 0
//           ) {
//             try {
//               // Validate questions structure
//               const validQuestions = round.questions.every(
//                 (q) =>
//                   q && (q.questionId || q._id) && (q.snapshot || q.question)
//               );

//               if (validQuestions) {
//                 // Transform questions to match expected format
//                 const transformedQuestions = round.questions.map((q) => ({
//                   questionId: q.questionId || q._id,
//                   snapshot: q.snapshot || q,
//                 }));

//                 await handleInterviewQuestions(
//                   interview._id,
//                   savedRound._id,
//                   transformedQuestions
//                 );
//                 console.log(`Questions saved for round ${savedRound._id}`);
//               } else {
//                 console.warn(
//                   `Invalid questions structure for round ${savedRound._id}, skipping questions.`
//                 );
//               }
//             } catch (questionError) {
//               console.error(
//                 `Error saving questions for round ${savedRound._id}:`,
//                 questionError
//               );
//             }
//           }
//         }
//       }
//     }

//     res.status(201).json(interview);
//   } catch (error) {
//     console.error("Error creating interview:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };


// create interview v1.0.4 ------- >
// create rounds
const createInterview = async (req, res) => {
    try {
        const {
            candidateId,
            positionId,
            templateId,
            status,
            orgId,
            userId,
            // interviewId,
            updatingInterviewStatus,
            completionReason,
        } = req.body;
        let candidate = null;

        // Skip candidate/position check if just updating status

        if (!candidateId) {
            return res.status(400).json({
                field: "candidateId",
                message: "Candidate is required"
            });
        }

        if (!positionId) {
            return res.status(400).json({
                field: "positionId",
                message: "Position is required"
            });
        }


        if (!updatingInterviewStatus) {
            candidate = await Candidate.findById(candidateId);
            if (!candidate) {
                return res.status(404).json({ message: "Candidate not found" });
            }
        }

        // console.log(
        //   "roundsToSave",
        //   candidateId,
        //   positionId,
        //   templateId,
        //   status,
        //   // orgId,
        //   userId,
        //   // interviewId,
        //   updatingInterviewStatus,
        //   completionReason
        // );

        const template = await InterviewTemplate.findById(templateId);

        let interview;
        // let isUpdate = Boolean(interviewId);
        let interviewData = {
            candidateId,
            positionId,
            templateId: template ? templateId : undefined,
            ownerId: userId,
            tenantId: orgId || undefined,
            completionReason,
            status,
        };

        // if (isUpdate) {
        //   interviewData.updatedBy = userId;
        //   interview = await Interview.findByIdAndUpdate(
        //     interviewId,
        //     interviewData,
        //     { new: true }
        //   );
        //   if (!interview) {
        //     return res.status(404).json({ message: "Interview not found" });
        //   }
        // } else {
        // Generate interviewCode for new interview
        const lastInterview = await Interview.findOne({ tenantId: orgId })
            .sort({ _id: -1 })
            .select("interviewCode")
            .lean();

        let nextNumber = 50001; // Start from 50001
        if (lastInterview && lastInterview.interviewCode) {
            const match = lastInterview.interviewCode.match(/INT-(\d+)/);
            if (match) {
                const lastNumber = parseInt(match[1], 10);
                nextNumber = lastNumber >= 50001 ? lastNumber + 1 : 50001;
            }
        }
        interviewData.interviewCode = `INT-${String(nextNumber).padStart(
            5,
            "0"
        )}`;
        interviewData.createdBy = userId;

        interview = new Interview(interviewData);
        await interview.save();

        // Create push notification for interview creation
        try {
            await createInterviewCreatedNotification(interview);
        } catch (notificationError) {
            console.error('[INTERVIEW] Error creating notification:', notificationError);
            // Continue execution even if notification fails
        }

        // Handle rounds and questions if not just updating status
        if (!updatingInterviewStatus) {
            const position = await Position.findById(positionId);
            let roundsToSave = [];

            if (position?.templateId?.toString() === templateId?.toString()) {
                roundsToSave = position.rounds || [];
            } else if (
                position?.templateId &&
                position?.templateId.toString() !== templateId?.toString()
            ) {
                roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
            } else if (
                !position?.templateId &&
                position?.rounds?.length > 0 &&
                templateId
            ) {
                roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
            } else if (!position?.templateId && position?.rounds?.length > 0) {
                roundsToSave = position.rounds;
            } else if (templateId) {
                roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
            }

            // console.log("roundsToSave", roundsToSave);

            if (roundsToSave.length > 0) {
                // if (isUpdate) {
                //   await InterviewRounds.deleteMany({ interviewId: interview._id });
                //   await interviewQuestions.deleteMany({ interviewId: interview._id });
                // }

                // Process each round with proper field mapping
                for (let index = 0; index < roundsToSave.length; index++) {
                    const round = roundsToSave[index];

                    // Create round document with proper field mapping
                    const roundDoc = new InterviewRounds({
                        interviewId: interview._id,
                        sequence: index + 1, // Use index-based sequence
                        roundTitle: round.roundTitle || "",
                        interviewMode: round.interviewMode || "",
                        interviewType: round.interviewType || "", // This field was missing in your mapping
                        interviewerType: round.interviewerType || "",
                        selectedInterviewersType: round.selectedInterviewersType || "", // This field doesn't exist in schema
                        duration: round.duration || "", // Map interviewDuration to duration
                        instructions: round.instructions || "",
                        dateTime: round.dateTime || "",
                        interviewers: round.interviewers || [], // This should be ObjectId array
                        status: "Draft",
                        // meetLink: round.meetLink || [],
                        meetingId: round.meetingId || "",
                        assessmentId: round.assessmentId || null,
                        // questions: [], // Initialize as empty array
                        rejectionReason: round.rejectionReason || "",
                        minimumInterviewers: round.minimumInterviewers || "", // This field doesn't exist in schema
                        interviewerGroupId: round.interviewerGroupId || null, // This field doesn't exist in schema
                    });

                    // Save the round document
                    const savedRound = await roundDoc.save();
                    // console.log("Saved roundDoc:", JSON.stringify(savedRound, null, 2));

                    // Create notification if round has scheduled date and interviewer
                    if (savedRound.dateTime || savedRound.interviewers?.length > 0) {
                        try {
                            await createInterviewRoundScheduledNotification(savedRound);
                        } catch (notificationError) {
                            console.error('[INTERVIEW] Error creating round scheduled notification:', notificationError);
                            // Continue execution even if notification fails
                        }
                    }

                    // Handle questions if they exist and are valid
                    if (
                        round.questions &&
                        Array.isArray(round.questions) &&
                        round.questions.length > 0
                    ) {
                        try {
                            // Validate questions structure
                            const validQuestions = round.questions.every(
                                (q) =>
                                    q && (q.questionId || q._id) && (q.snapshot || q.question)
                            );

                            if (validQuestions) {
                                // Transform questions to match expected format
                                const transformedQuestions = round.questions.map((q) => ({
                                    questionId: q.questionId || q._id,
                                    snapshot: q.snapshot || q,
                                }));

                                await handleInterviewQuestions(
                                    interview._id,
                                    savedRound._id,
                                    transformedQuestions
                                );
                                // console.log(`Questions saved for round ${savedRound._id}`);
                            } else {
                                console.warn(
                                    `Invalid questions structure for round ${savedRound._id}, skipping questions.`
                                );
                            }
                        } catch (questionError) {
                            console.error(
                                `Error saving questions for round ${savedRound._id}:`,
                                questionError
                            );
                        }
                    }
                }
            }
        }

        res.status(201).json(interview);
    } catch (error) {
        console.error("Error creating interview:", error);
        res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
};


// PATCH /interviews/:id
const updateInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            candidateId,
            positionId,
            templateId,
            status,
            orgId,
            userId,
            updatingInterviewStatus,
            completionReason,
        } = req.body;

        // Check if interview exists first
        const existingInterview = await Interview.findById(id);
        if (!existingInterview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Field-specific validation matching frontend
        if (!updatingInterviewStatus) {
            if (candidateId && !candidateId) {
                return res.status(400).json({
                    field: "candidateId",
                    message: "Candidate is required"
                });
            }

            if (positionId && !positionId) {
                return res.status(400).json({
                    field: "positionId",
                    message: "Position is required"
                });
            }

            // Validate candidate exists if provided
            if (candidateId) {
                const candidate = await Candidate.findById(candidateId);
                if (!candidate) {
                    return res.status(404).json({
                        field: "candidateId",
                        message: "Candidate not found"
                    });
                }
            }
        }

        // Base update data - only include fields that are provided and different
        const interviewData = {};

        if (candidateId && candidateId !== existingInterview.candidateId?.toString()) {
            interviewData.candidateId = candidateId;
        }

        if (positionId && positionId !== existingInterview.positionId?.toString()) {
            interviewData.positionId = positionId;
        }

        if (templateId && templateId !== existingInterview.templateId?.toString()) {
            interviewData.templateId = templateId;
        }

        if (completionReason && completionReason !== existingInterview.completionReason) {
            interviewData.completionReason = completionReason;
        }

        if (status && status !== existingInterview.status) {
            interviewData.status = status;
        }

        // Check if there are any actual changes
        if (Object.keys(interviewData).length === 0) {
            return res.status(200).json({
                status: "no_changes",
                message: "No changes made",
                interview: existingInterview
            });
        }

        // Add metadata fields
        interviewData.updatedBy = userId;
        interviewData.updatedAt = new Date();

        // Update interview
        const interview = await Interview.findByIdAndUpdate(id, interviewData, {
            new: true,
        });

        // Create notification if status changed
        if (status && status !== existingInterview.status) {
            try {
                await createInterviewStatusUpdateNotification(interview, existingInterview.status, status);
            } catch (notificationError) {
                console.error('[INTERVIEW] Error creating status update notification:', notificationError);
                // Continue execution even if notification fails
            }
        }

        // Handle rounds/questions only if not just updating status and template is provided/changed
        if (!updatingInterviewStatus && templateId && templateId !== existingInterview.templateId?.toString()) {
            const template = await InterviewTemplate.findById(templateId);

            if (template?.rounds?.length > 0) {
                // Clear old rounds & questions
                await InterviewRounds.deleteMany({ interviewId: interview._id });
                await interviewQuestions.deleteMany({ interviewId: interview._id });

                // Create new rounds from template
                for (let index = 0; index < template.rounds.length; index++) {
                    const round = template.rounds[index];

                    const roundDoc = new InterviewRounds({
                        interviewId: interview._id,
                        sequence: index + 1,
                        roundTitle: round.roundTitle || "",
                        interviewMode: round.interviewMode || "",
                        interviewType: round.interviewType || "",
                        interviewerType: round.interviewerType || "",
                        duration: round.duration || "",
                        instructions: round.instructions || "",
                        status: "Draft",
                    });

                    const savedRound = await roundDoc.save();

                    // Handle questions if they exist
                    if (round.questions?.length > 0) {
                        const validQuestions = round.questions.filter(q =>
                            q && (q.questionId || q._id)
                        );

                        if (validQuestions.length > 0) {
                            const transformedQuestions = validQuestions.map(q => ({
                                questionId: q.questionId || q._id,
                                snapshot: q.snapshot || q,
                            }));

                            await handleInterviewQuestions(
                                interview._id,
                                savedRound._id,
                                transformedQuestions
                            );
                        }
                    }
                }
            }
        }

        return res.status(200).json({
            status: "updated_successfully",
            message: "interview updated successfully",
            interview: interview
        });

        // res.json(interview);
    } catch (error) {
        // console.error("Error updating interview:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// const createInterview = async (req, res) => {
//     try {
//         const { candidateId, positionId, templateId, status, orgId, userId, interviewId, updatingInterviewStatus, completionReason } = req.body;
//         let candidate = null;

//         if (!updatingInterviewStatus) {
//             candidate = await Candidate.findById(candidateId);
//             if (!candidate) {
//                 return res.status(404).json({ message: "Candidate not found" });
//             }
//         }
//         console.log("roundsToSave", candidateId, positionId, templateId, status, orgId, userId, interviewId, updatingInterviewStatus, completionReason);

//         const template = await InterviewTemplate.findById(templateId);

//         //   console.log("template",template);

//         let interview;
//         let isUpdate = Boolean(interviewId);
//         let interviewData = {
//             candidateId,
//             positionId,
//             templateId: template ? templateId : undefined,
//             ownerId: userId,
//             tenantId: orgId || undefined,
//             completionReason,
//             status
//         };

//         if (isUpdate) {
//             interviewData.updatedBy = userId;
//             interview = await Interview.findByIdAndUpdate(interviewId, interviewData, { new: true });
//             if (!interview) {
//                 return res.status(404).json({ message: "Interview not found" });
//             }
//         } else {
//             // Generate interviewCode for new interview
//             const lastInterview = await Interview.findOne({})
//                 .sort({ createdAt: -1 })
//                 .select('interviewCode')
//                 .lean();

//             let nextNumber = 1;
//             if (lastInterview && lastInterview.interviewCode) {
//                 const match = lastInterview.interviewCode.match(/INV-(\d+)/);
//                 if (match) {
//                     nextNumber = parseInt(match[1], 10) + 1;
//                 }
//             }
//             interviewData.interviewCode = `INV-${String(nextNumber).padStart(5, '0')}`;
//             interviewData.createdBy = userId;

//             interview = new Interview(interviewData);
//             await interview.save();
//         }

//         // Handle rounds and questions if not just updating status
//         if (!updatingInterviewStatus) {
//             const position = await Position.findById(positionId);
//             let roundsToSave = [];
//             if (position?.templateId?.toString() === templateId?.toString()) {
//                 roundsToSave = position.rounds || [];
//             } else if (position?.templateId && position?.templateId.toString() !== templateId?.toString()) {
//                 roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//             } else if (!position?.templateId && position?.rounds?.length > 0 && templateId) {
//                 roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//             } else if (!position?.templateId && position?.rounds?.length > 0) {
//                 roundsToSave = position.rounds;
//             } else if (templateId) {
//                 roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//             }

//             console.log("roundsToSave", roundsToSave);

//             roundsToSave = roundsToSave.map((round, index) => ({
//                 ...round,
//                 sequence: index + 1,
//             }));

//             // // Map and transform the rounds data to match your database schema
//             // const transformedRounds = roundsToSave.map((round, index) => ({
//             //     interviewId: interview._id,
//             //     sequence: round.sequence || index + 1,
//             //     roundTitle: round.roundTitle,
//             //     interviewMode: round.interviewMode,
//             //     interviewerType: round.interviewerType,
//             //     selectedInterviewersType: round.selectedInterviewersType,
//             //     duration: round.duration, // map interviewDuration to duration
//             //     instructions: round.instructions,
//             //     interviewers: round.internalInterviewers || round.interviewers || [], // handle both possible fields
//             //     status: round.status || "Pending", // default status
//             //     questions: round.questions || [],
//             //     assessmentId: round.assessmentId,
//             //     minimumInterviewers: round.minimumInterviewers || "1",
//             //     interviewerGroupId: round.interviewerGroupId || null
//             // }));

//             if (roundsToSave.length > 0) {
//                 if (isUpdate) {
//                     await InterviewRounds.deleteMany({ interviewId: interview._id });
//                     await interviewQuestions.deleteMany({ interviewId: interview._id });
//                 }

//                 // const insertedRounds = await InterviewRounds.insertMany(
//                 //     roundsToSave.map(round => ({
//                 //         interviewId: interview._id,
//                 //         sequence: round.sequence,
//                 //         roundTitle: round.roundTitle,
//                 //         interviewMode: round.interviewMode,
//                 //         interviewType: round.interviewType,
//                 //         interviewerType: round.interviewerType,
//                 //         duration: round.duration,
//                 //         instructions: round.instructions,
//                 //         dateTime: round.dateTime,
//                 //         interviewers: round.interviewers || [],
//                 //         status: round.status || "Pending",
//                 //         questions: round.questions || [],
//                 //         meetingId: round.meetingId,
//                 //         meetLink: round.meetLink || [],
//                 //         assessmentId: round.assessmentId,
//                 //     }))
//                 // );

//                 // const insertedRounds = await InterviewRounds.insertMany(transformedRounds);
//                 // console.log("insertedRounds", insertedRounds);

//                 // for (const round of insertedRounds) {
//                 //     if (round.questions && round.questions.length > 0) {
//                 //         await handleInterviewQuestions(interview._id, round._id, round.questions);
//                 //     }
//                 // }

//                     for (const round of roundsToSave) {
//                     const roundDoc = new InterviewRounds({
//                         interviewId: interview._id,
//                         sequence: round.sequence,
//                         roundTitle: round.roundTitle,
//                         interviewMode: round.interviewMode,
//                         interviewType: round.interviewType,
//                         interviewerType: round.interviewerType,
//                         selectedInterviewersType: round.selectedInterviewersType,
//                         duration: round.duration,
//                         instructions: round.instructions,
//                         dateTime: round.dateTime,
//                         interviewers: round.interviewers,
//                         status: round.status,
//                         meetLink: round.meetLink,
//                         meetingId: round.meetingId,
//                         assessmentId: round.assessmentId,
//                         questions: [],
//                         rejectionReason: round.rejectionReason,
//                         minimumInterviewers: round.minimumInterviewers,
//                         interviewerGroupId: round.interviewerGroupId
//                     });

//                     await roundDoc.save();

//                     if (round.questions ) {
//                         const validQuestions = round.questions.every(q => q.questionId && q.snapshot);
//                         if (validQuestions) {
//                             await handleInterviewQuestions(interview._id, roundDoc._id, round.questions);
//                         } else {
//                             console.warn(`Invalid questions for round ${roundDoc._id}, skipping.`);
//                         }
//                     }

//                     console.log("Saved roundDoc:", JSON.stringify(roundDoc, null, 2));
//                 }
//             }

//             // res.status(201).json(interview);
//         }

//         res.status(201).json(interview);
//     } catch (error) {
//         console.error("Error creating interview:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

async function handleInterviewQuestions(interviewId, roundId, questions) {
    // Add null check for questions parameter
    if (!questions || !Array.isArray(questions)) {
        console.log(
            "handleInterviewQuestions: questions is null, undefined, or not an array:",
            questions
        );
        return;
    }

    const existingQuestions = await interviewQuestions.find({
        interviewId,
        roundId,
    });
    const existingQuestionIds = existingQuestions.map((q) => q._id.toString());
    const newQuestionIds = questions.map((q) => q._id).filter((id) => id);

    const questionsToDelete = existingQuestionIds.filter(
        (id) => !newQuestionIds.includes(id)
    );
    if (questionsToDelete.length > 0) {
        await interviewQuestions.deleteMany({ _id: { $in: questionsToDelete } });
    }

    for (const q of questions) {
        if (q._id) {
            await interviewQuestions.findByIdAndUpdate(q._id, q, { new: true });
        } else {
            await interviewQuestions.create({
                interviewId,
                roundId,
                order: q.order,
                customizations: q.customizations,
                mandatory: q.mandatory,
                tenantId: q.tenantId,
                ownerId: q.ownerId,
                questionId: q.questionId,
                source: q.source,
                snapshot: q.snapshot,
                addedBy: q.addedBy,
            });
        }
    }
}

async function processInterviewers(interviewers) {
    if (!Array.isArray(interviewers)) {
        return [];
    }

    const processedInterviewers = [];
    for (const interviewer of interviewers) {
        try {
            if (
                mongoose.Types.ObjectId.isValid(interviewer) &&
                !Array.isArray(interviewer)
            ) {
                processedInterviewers.push(interviewer);
                continue;
            }
            if (interviewer.email) {
                let contact = await Contacts.findOne({ email: interviewer.email });
                if (!contact) {
                    contact = new Contacts({
                        firstName: interviewer.name?.split(" ")[0] || "Unknown",
                        lastName: interviewer.name?.split(" ").slice(1).join(" ") || "User",
                        email: interviewer.email,
                        phone: interviewer.phone || "",
                        technology: interviewer.technology ? [interviewer.technology] : [],
                        contactType: "Interviewer",
                        createdDate: new Date(),
                    });
                    await contact.save();
                }
                if (contact._id) {
                    processedInterviewers.push(contact._id);
                }
            }
        } catch (error) {
            console.error("Error processing interviewer:", error);
        }
    }
    return processedInterviewers;
}

//interview round creation
const saveInterviewRound = async (req, res) => {
    try {
        const { interviewId, round, roundId, questions } = req.body;
        // console.log("=== saveInterviewRound START ===");
        // console.log("Request body:", JSON.stringify(req.body, null, 2));
        // console.log("interviewId:", interviewId);
        // console.log("roundId:", roundId);
        // console.log("round keys:", Object.keys(round || {}));
        // console.log("meetLink field:", round?.meetLink);

        //  // Validate the request data
        //  const validationResult = validateInterviewRound(req.body, !!roundId);
        //  console.log("Validation result:", validationResult);

        //  if (validationResult.error) {
        //    console.log("Validation errors:", validationResult.error);
        //    return res.status(400).json({
        //      message: "Validation failed",
        //      errors: validationResult.error
        //    });
        //  }

        // Initialize emailResult variable
        let emailResult = { success: false, message: "No email sending attempted" };

        if (!interviewId || !round) {
            return res
                .status(400)
                .json({ message: "Interview ID and round data are required." });
        }

        if (round.interviewers) {
            round.interviewers = await processInterviewers(round.interviewers);
        }

        let savedRound;
        // v1.0.2 <-----------------------------------------
        // if (roundId) {
        //   console.log("Updating existing round with ID:", roundId);
        //   let existingRound = await InterviewRounds.findById(roundId);
        //   if (existingRound) {
        //     console.log("Found existing round:", existingRound._id);
        //     console.log(
        //       "Before update - existing round data:",
        //       JSON.stringify(existingRound.toObject(), null, 2)
        //     );

        //     // Handle meetLink field separately to prevent conversion issues
        //     const { meetLink, ...otherRoundData } = round;
        //     Object.assign(existingRound, otherRoundData);

        //     // Set meetLink directly if it exists
        //     if (meetLink && Array.isArray(meetLink)) {
        //       console.log("Setting meetLink directly:", meetLink);
        //       console.log(
        //         "meetLink structure:",
        //         meetLink?.map((item) => ({
        //           linkType: item.linkType,
        //           link: item.link,
        //         }))
        //       );
        //       existingRound.meetLink = meetLink;
        //     }

        //     console.log(
        //       "After update - round data:",
        //       JSON.stringify(existingRound.toObject(), null, 2)
        //     );
        //     savedRound = await existingRound.save();
        //     console.log("Round saved successfully:", savedRound._id);
        //     await reorderInterviewRounds(interviewId);
        //   } else {
        //     console.log("Round not found with ID:", roundId);
        //     return res.status(404).json({ message: "Round not found." });
        //   }
        // }
        // else {
        let totalRounds = await InterviewRounds.countDocuments({ interviewId });
        let newSequence = round.sequence || totalRounds + 1;

        await InterviewRounds.updateMany(
            { interviewId, sequence: { $gte: newSequence } },
            { $inc: { sequence: 1 } }
        );

        // Handle meetLink field separately for new rounds too
        const {meetPlatform, meetLink, ...otherRoundData } = round;
        const newInterviewRound = new InterviewRounds({
            interviewId,
            ...otherRoundData,
            sequence: newSequence,
        });

        // Set meetLink directly if it exists
        if (meetLink && Array.isArray(meetLink)) {
            // console.log("Setting meetLink for new round:", meetLink);
            // console.log(
            //   "meetLink structure:",
            //   meetLink?.map((item) => ({
            //     linkType: item.linkType,
            //     link: item.link,
            //   }))
            // );
            newInterviewRound.meetLink = meetLink;
            newInterviewRound.meetPlatform = meetPlatform;
        }

        savedRound = await newInterviewRound.save();
        await reorderInterviewRounds(interviewId);

        // Create notification for round scheduling
        if (savedRound.dateTime || savedRound.interviewers?.length > 0) {
            try {
                await createInterviewRoundScheduledNotification(savedRound);
            } catch (notificationError) {
                console.error('[INTERVIEW] Error creating round scheduled notification:', notificationError);
                // Continue execution even if notification fails
            }
        }

        // Only call handleInterviewQuestions if questions is provided
        if (questions && Array.isArray(questions)) {
            try {
                await handleInterviewQuestions(interviewId, savedRound._id, questions);
            } catch (error) {
                console.error('[INTERVIEW] Error handling interview questions:', error);
                // Continue execution even if question handling fails
            }
        } else {
            console.log(
                "saveInterviewRound: questions is null, undefined, or not an array, skipping handleInterviewQuestions"
            );
        }

        // Email sending is now handled in the frontend after meeting links are generated
        // This ensures emails contain the proper encrypted meeting links
        emailResult = {
            success: true,
            message:
                "Emails will be sent from frontend after meeting links are generated",
        };

        return res.status(200).json({
            message: roundId
                ? "Round updated successfully."
                : "Interview round created successfully.",
            savedRound,
            emailResult,
            status: "ok",
        });

        async function reorderInterviewRounds(interviewId) {
            const rounds = await InterviewRounds.find({ interviewId });
            rounds.sort((a, b) => a.sequence - b.sequence);

            for (let i = 0; i < rounds.length; i++) {
                rounds[i].sequence = i + 1;
                await rounds[i].save();
            }
        }
    } catch (error) {
        // console.error("=== saveInterviewRound ERROR ===");
        console.error("Error saving interview round:", error);
        // console.error("Error message:", error.message);
        // console.error("Error stack:", error.stack);
        // console.error("=== saveInterviewRound ERROR END ===");
        return res
            .status(500)
            .json({ message: "Internal server error.", error: error.message });
    }
};


// PATCH: Update interview round
const updateInterviewRound = async (req, res) => {
    try {
        let roundIdParam = req.params.roundId;
        const { interviewId, round, questions } = req.body;
      
    console.log("req.body",req.body);
    

        if (!mongoose.Types.ObjectId.isValid(roundIdParam)) {
            return res.status(400).json({ message: "Invalid roundId" });
        }

        const roundId = new mongoose.Types.ObjectId(roundIdParam);

    

        if (!interviewId || !roundId || !round) {
            return res.status(400).json({
                message: "Interview ID, Round ID, and round data are required."
            });
        }

        if (round.interviewers) {
            round.interviewers = await processInterviewers(round.interviewers);
        }

        let existingRound = await InterviewRounds.findById(roundId);
        if (!existingRound) {
            console.log("Round not found with ID:", roundId);
            return res.status(404).json({ message: "Round not found." });
        }

        // Check usage limit if changing status to Scheduled for internal interview
        if (round.status === 'Scheduled' && 
            existingRound.status !== 'Scheduled' && 
            existingRound.interviewerType === 'internal') {
            
            // Get interview details for tenantId
            const interview = await Interview.findById(interviewId);
            if (interview) {
                const usageCheck = await checkInternalInterviewUsageLimit(
                    interview.tenantId, 
                    interview.ownerId
                );
                
                if (!usageCheck.canSchedule) {
                    return res.status(400).json({
                        message: usageCheck.message,
                        usageStats: {
                            utilized: usageCheck.utilized,
                            entitled: usageCheck.entitled,
                            remaining: usageCheck.remaining
                        }
                    });
                }
            }
        }

        // Store original status for tracking
        existingRound._original_status = existingRound.status;

        // Handle meetLink field separately to prevent conversion issues
        const {meetPlatform, meetLink, ...otherRoundData } = round;
        Object.assign(existingRound, otherRoundData);

        if (meetPlatform) existingRound.meetPlatform = meetPlatform;
        // && Array.isArray(meetLink)

        if (meetLink ) {
            // console.log("Updating meetLink directly:", meetLink);
            existingRound.meetLink = meetLink;
            // existingRound.meetPlatform = meetPlatform;
        }

        // Save updated round
        const savedRound = await existingRound.save();

        console.log("savedRound", savedRound);
      
        // Reorder rounds just in case sequence was changed
        await reorderInterviewRounds(interviewId);

        // Update questions if provided
        if (questions && Array.isArray(questions)) {
            await handleInterviewQuestions(interviewId, savedRound._id, questions);
        } else {
            console.log(
                "updateInterviewRound: questions not provided, skipping handleInterviewQuestions"
            );
        }

        return res.status(200).json({
            message: "Round updated successfully.",
            savedRound,
            status: "ok"
        });

        async function reorderInterviewRounds(interviewId) {
            const rounds = await InterviewRounds.find({ interviewId });
            rounds.sort((a, b) => a.sequence - b.sequence);

            for (let i = 0; i < rounds.length; i++) {
                rounds[i].sequence = i + 1;
                await rounds[i].save();
            }
        }
    } catch (error) {
        console.error("Error updating interview round:", error);
        return res.status(500).json({
            message: "Internal server error.",
            error: error.message
        });
    }
};


// v1.0.2 <-----------------------------------------
// Dashboard stats code remains unchanged
const getDateRanges = () => {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startOfCurrentMonth, startOfLastMonth, endOfLastMonth };
};

const getDashboardStats = async (req, res) => {
    try {
        const { isOrganization, tenantId, ownerId, period = "monthly" } = req.query;

        if (!tenantId && !ownerId) {
            return res.status(400).json({ error: "tenantId or ownerId is required" });
        }

        const now = new Date();
        const { startOfCurrentMonth, startOfLastMonth, endOfLastMonth } =
            getDateRanges(now);

        const query =
            isOrganization === "true"
                ? { tenantId: new mongoose.Types.ObjectId(tenantId) }
                : { ownerId: new mongoose.Types.ObjectId(ownerId) };

        const totalInterviews = await Interview.countDocuments(query);

        const interviewsThisMonth = await Interview.countDocuments({
            ...query,
            createdAt: { $gte: startOfCurrentMonth },
        });

        const interviewsLastMonth = await Interview.countDocuments({
            ...query,
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        });

        let interviewChange = "0%";
        let trendSymbol = "";
        if (interviewsLastMonth > 0) {
            const percentageChange =
                ((interviewsThisMonth - interviewsLastMonth) / interviewsLastMonth) *
                100;
            interviewChange =
                percentageChange >= 0
                    ? `+${percentageChange.toFixed(1)}%`
                    : `${percentageChange.toFixed(1)}%`;
            trendSymbol = percentageChange < 0 ? "↓" : "↑";
        } else if (interviewsThisMonth > 0) {
            interviewChange = "+100%";
            trendSymbol = "↑";
        }

        const selectedThisMonth = await Interview.countDocuments({
            ...query,
            status: "selected",
            createdAt: { $gte: startOfCurrentMonth },
        });

        const selectedLastMonth = await Interview.countDocuments({
            ...query,
            status: "selected",
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        });

        const successRateThisMonth =
            interviewsThisMonth > 0
                ? ((selectedThisMonth / interviewsThisMonth) * 100).toFixed(1)
                : 0;
        let successRateChange = "0%";
        if (selectedLastMonth > 0 && interviewsLastMonth > 0) {
            const lastMonthSuccessRate =
                (selectedLastMonth / interviewsLastMonth) * 100;
            const percentageChange = successRateThisMonth - lastMonthSuccessRate;
            successRateChange =
                percentageChange >= 0
                    ? `+${percentageChange.toFixed(1)}%`
                    : `${percentageChange.toFixed(1)}%`;
        } else if (selectedThisMonth > 0) {
            successRateChange = "+100%";
        }

        let chartData = [];
        if (period === "weekly") {
            const weeks = [];
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - i * 7
                );
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                const count = await Interview.countDocuments({
                    ...query,
                    createdAt: { $gte: weekStart, $lte: weekEnd },
                });
                weeks.push({
                    name: `Week ${4 - i}`,
                    interviews: count,
                });
            }
            chartData = weeks;
        } else if (period === "yearly") {
            const months = [];
            for (let i = 11; i >= 0; i--) {
                const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthEnd = new Date(
                    monthStart.getFullYear(),
                    monthStart.getMonth() + 1,
                    0
                );
                const count = await Interview.countDocuments({
                    ...query,
                    createdAt: { $gte: monthStart, $lte: monthEnd },
                });
                months.push({
                    name: monthStart.toLocaleString("default", {
                        month: "short",
                        year: "2-digit",
                    }),
                    interviews: count,
                });
            }
            chartData = months;
        } else {
            const days = [];
            for (let i = 29; i >= 0; i--) {
                const dayStart = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - i
                );
                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);
                const count = await Interview.countDocuments({
                    ...query,
                    createdAt: { $gte: dayStart, $lte: dayEnd },
                });
                days.push({
                    name: dayStart.toLocaleString("default", {
                        day: "numeric",
                        month: "short",
                    }),
                    interviews: count,
                });
            }
            chartData = days;
        }

        res.json({
            totalInterviews,
            interviewChange: `${interviewChange} ${trendSymbol}`,
            successRate: `${successRateThisMonth}%`,
            successRateChange,
            chartData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};



// Delete interview and related rounds
const deleteInterview = async (req, res) => {
    res.locals.loggedByController = true;
    res.locals.processName = "Delete Interview";
  
    const { id } = req.params;
  
    try {
      // ✅ Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid interview ID format",
        });
      }
  
      // ✅ Check if interview exists
      const interview = await Interview.findById(id);
      if (!interview) {
        return res.status(404).json({
          status: "error",
          message: "Interview not found",
        });
      }
  
      // ✅ Check if status is "Draft"
      if (interview.status !== "Draft") {
        return res.status(400).json({
          status: "error",
          message: `Interview cannot be deleted because its current status is "${interview.status}".`,
        });
      }
  
      // ✅ Delete related interview rounds first
      const deletedRounds = await InterviewRounds.deleteMany({ interviewId: id });
      console.log(`Deleted ${deletedRounds.deletedCount} rounds linked to interview ${id}`);
  
      // ✅ Delete the interview itself
      const deletedInterview = await Interview.findByIdAndDelete(id);
  
      if (!deletedInterview) {
        return res.status(404).json({
          status: "error",
          message: "Interview not found or already deleted",
        });
      }
  
      // ✅ Success response
      res.status(200).json({
        status: "success",
        message: "Interview and its related rounds deleted successfully.",
      });
  
    } catch (error) {
      console.error("Error deleting interview:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while deleting interview",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };

//  Delete interview Round
const deleteRound = async (req, res) => {
    try {
        const { id } = req.params;
        await InterviewRounds.findByIdAndDelete(id);
        res.json({ message: "Round deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

// SUPER ADMIN added by Ashok ----------------------------------------------------------->
const getInterviews = async (req, res) => {
    try {
        const now = new Date();

        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const totalInterviews = await Interview.countDocuments();

        const interviewsThisMonth = await Interview.countDocuments({
            createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
        });

        const interviewsLastMonth = await Interview.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
        });

        let trend = "neutral";
        let trendValue = "0%";

        if (interviewsLastMonth > 0) {
            const change =
                ((interviewsThisMonth - interviewsLastMonth) / interviewsLastMonth) *
                100;
            trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";
            trendValue = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
        } else if (interviewsThisMonth > 0) {
            trend = "up";
            trendValue = "+100%";
        }

        res.json({
            metric: {
                title: "Total Interviews",
                value: totalInterviews.toLocaleString(),
                description: "Across all tenants",
                trend,
                trendValue,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

// v1.0.0 <---------------------SUPER ADMIN-----------------------------------------

// Controller: Get all interviews with candidate details
// const getAllInterviews = async (req, res) => {
//   try {
//     // fetch all interviews
//     const interviews = await Interview.find();

//     // enrich each interview with candidate data
//     const interviewsWithCandidates = await Promise.all(
//       interviews.map(async (interview) => {
//         if (!interview.candidateId) {
//           return { ...interview.toObject(), candidate: null };
//         }

//         try {
//           const candidate = await Candidate.findById(interview.candidateId);
//           return {
//             ...interview.toObject(),
//             candidate: candidate ? candidate.toObject() : null,
//           };
//         } catch (err) {
//           console.error("Error fetching candidate:", err);
//           return { ...interview.toObject(), candidate: null };
//         }
//       })
//     );

//     // reverse like frontend (latest first)
//     res.status(200).json(interviewsWithCandidates.reverse());
//   } catch (error) {
//     console.error("Error fetching interviews:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

const getAllInterviews = async (req, res) => {
    try {
        // fetch all interviews
        const interviews = await Interview.find();

        // enrich each interview with candidate + position data
        const enrichedInterviews = await Promise.all(
            interviews.map(async (interview) => {
                let candidate = null;
                let position = null;

                // fetch candidate
                if (interview.candidateId) {
                    try {
                        candidate = await Candidate.findById(interview.candidateId);
                    } catch (err) {
                        console.error("Error fetching candidate:", err);
                    }
                }

                // fetch position
                if (interview.positionId) {
                    try {
                        position = await Position.findById(interview.positionId);
                    } catch (err) {
                        console.error("Error fetching position:", err);
                    }
                }

                return {
                    ...interview.toObject(),
                    candidate: candidate ? candidate.toObject() : null,
                    position: position ? position.toObject() : null,
                };
            })
        );

        // reverse like frontend (latest first)
        res.status(200).json(enrichedInterviews.reverse());
    } catch (error) {
        console.error("Error fetching interviews:", error);
        res.status(500).json({ error: "Server error" });
    }
};
// v1.0.0 <-------------------------SUPER ADMIN------------------------------------->

// -------------------------------------------------------------------------------------->

// module.exports = {
//     createInterview,
//     updateInterview,
//     //  interview round
//     saveInterviewRound,
//     updateInterviewRound,
//     // interview round
//     getDashboardStats,
//     deleteRound,
//     getInterviews,
//     getAllInterviews,
//     updateInterviewStatus,
// };






// const mongoose = require('mongoose');
// const { Interview } = require('../models/Interview');
// const { InterviewRounds } = require('../models/InterviewRounds.js');
// const InterviewTemplate = require('../models/InterviewTemplate.js');
// const { Contacts } = require('../models/Contacts');

// const { Users } = require('../models/Users');
// const { Candidate } = require('../models/candidate');
// const { encrypt, generateOTP } = require('../utils/generateOtp');
// const sendEmail = require('../utils/sendEmail');
// const interviewQuestions = require('../models/interviewQuestions');
// const { Position } = require('../models/position.js');
// const Assessment = require("../models/assessment");

// const createInterview = async (req, res) => {
//     try {
//         const { candidateId, positionId, templateId, status, orgId, userId, interviewId, updatingInterviewStatus, completionReason } = req.body;
//         let candidate = null;

//         if (!updatingInterviewStatus) {
//             candidate = await Candidate.findById(candidateId);

//             if (!candidate) {
//                 return res.status(404).json({ message: "Candidate not found" });
//             }
//         }

//         const template = await InterviewTemplate.findById(templateId);

//         let interview;
//         if (interviewId) {
//             interview = await Interview.findById(interviewId);
//             if (!interview) {
//                 return res.status(404).json({ message: "Interview not found" });
//             }
//         }

//         const interviewData = {
//             candidateId,
//             positionId,
//             templateId: template ? templateId : undefined,
//             ownerId: userId,
//             tenantId: orgId || undefined,
//             completionReason
//         };

//         let savedInterview;
//         if (interviewId) {
//             interviewData.updatedById = userId;
//             savedInterview = await Interview.findByIdAndUpdate(interviewId, interviewData, { new: true });
//         } else {
//             interviewData.createdBy = userId;
//             const newInterview = new Interview(interviewData);
//             savedInterview = await newInterview.save();
//         }

//         if (!updatingInterviewStatus) {
//             const position = await Position.findById(positionId);
//             let roundsToSave = [];
//             if (position?.templateId?.toString() === templateId?.toString()) {
//                 roundsToSave = position.rounds || [];
//             } else if (position?.templateId && position?.templateId.toString() !== templateId?.toString()) {
//                 roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//             } else if (!position?.templateId && position?.rounds?.length > 0 && templateId) {
//                 roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//             } else if (!position?.templateId && position?.rounds?.length > 0) {
//                 roundsToSave = position.rounds;
//             } else if (templateId) {
//                 roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//             }
//             console.log("rounds to save", roundsToSave);
//             roundsToSave = roundsToSave.map((round, index) => ({
//                 ...round,
//                 sequence: index + 1,
//             }));

//             if (roundsToSave.length > 0) {
//                 if (interviewId) {
//                     await InterviewRounds.deleteMany({ interviewId: savedInterview._id });
//                     await interviewQuestions.deleteMany({ interviewId: savedInterview._id });
//                 }

//                 const insertedRounds = await InterviewRounds.insertMany(
//                     roundsToSave.map(round => ({
//                         interviewId: savedInterview._id,
//                         sequence: round.sequence,
//                         roundTitle: round.roundTitle,
//                         interviewMode: round.interviewMode,
//                         interviewType: round.interviewType,
//                         interviewerType: round.interviewerType,
//                         duration: round.duration,
//                         instructions: round.instructions,
//                         dateTime: round.dateTime,
//                         interviewers: round.interviewers || [],
//                         status: round.status || "Pending",
//                         questions: round.questions || [],
//                         meetingId: round.meetingId,
//                         meetLink: round.meetLink || [],
//                         assessmentId: round.assessmentId,
//                     }))
//                 );

//                 for (const round of insertedRounds) {
//                     if (round.questions && round.questions.length > 0) {
//                         await handleInterviewQuestions(savedInterview._id, round._id, round.questions);
//                     }
//                 }
//             }
//         }

//            // Find the latest interviewCode
//         const lastInterview = await Interview.findOne({})
//             .sort({ createdAt: -1 })
//             .select('interviewCode')
//             .lean();

//         let nextNumber = 1;
//         if (lastInterview && lastInterview.interviewCode) {
//             // Extract the number part from 'INV-00001'
//             const match = lastInterview.interviewCode.match(/INV-(\d+)/);
//             if (match) {
//                 nextNumber = parseInt(match[1], 10) + 1;
//             }
//         }
//         const interviewCode = `INV-${String(nextNumber).padStart(5, '0')}`;

//         // Add interviewCode to the interview data
//         const interviewData = { ...req.body, interviewCode };

//         const interview = new Interview(interviewData);
//         await interview.save();

//         res.status(201).json(interview);

//         res.status(201).json(savedInterview);
//     } catch (error) {
//         console.error("Error creating interview:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// async function handleInterviewQuestions(interviewId, roundId, questions) {
//     const existingQuestions = await interviewQuestions.find({ interviewId, roundId });
//     const existingQuestionIds = existingQuestions.map(q => q._id.toString());
//     const newQuestionIds = questions.map(q => q._id).filter(id => id);

//     const questionsToDelete = existingQuestionIds.filter(id => !newQuestionIds.includes(id));
//     if (questionsToDelete.length > 0) {
//         await interviewQuestions.deleteMany({ _id: { $in: questionsToDelete } });
//     }

//     for (const q of questions) {
//         if (q._id) {
//             await interviewQuestions.findByIdAndUpdate(q._id, q, { new: true });
//         } else {
//             await interviewQuestions.create({
//                 interviewId,
//                 roundId,
//                 order: q.order,
//                 customizations: q.customizations,
//                 mandatory: q.mandatory,
//                 tenantId: q.tenantId,
//                 ownerId: q.ownerId,
//                 questionId: q.questionId,
//                 source: q.source,
//                 snapshot: q.snapshot,
//                 addedBy: q.addedBy
//             });
//         }
//     }
// }

// async function processInterviewers(interviewers) {
//     if (!Array.isArray(interviewers)) {
//         return [];
//     }

//     const processedInterviewers = [];

//     for (const interviewer of interviewers) {
//         try {
//             if (mongoose.Types.ObjectId.isValid(interviewer) && !Array.isArray(interviewer)) {
//                 processedInterviewers.push(interviewer);
//                 continue;
//             }
//             if (interviewer.email) {
//                 let contact = await Contacts.findOne({ email: interviewer.email });

//                 if (!contact) {
//                     contact = new Contacts({
//                         firstName: interviewer.name?.split(' ')[0] || 'Unknown',
//                         lastName: interviewer.name?.split(' ').slice(1).join(' ') || 'User',
//                         email: interviewer.email,
//                         phone: interviewer.phone || '',
//                         technology: interviewer.technology ? [interviewer.technology] : [],
//                         contactType: 'Interviewer',
//                         createdDate: new Date()
//                     });
//                     await contact.save();
//                 }

//                 if (contact._id) {
//                     processedInterviewers.push(contact._id);
//                 }
//             }
//         } catch (error) {
//             console.error('Error processing interviewer:', error);
//         }
//     }

//     return processedInterviewers;
// }

// const saveInterviewRound = async (req, res) => {
//     try {
//         const { interviewId, round, roundId, questions } = req.body;
//         console.log("saveInterviewRound called with body:", req.body);
//         console.log("interviewId", interviewId);

//         if (!interviewId || !round) {
//             return res.status(400).json({ message: "Interview ID and round data are required." });
//         }

//         if (round.interviewers) {
//             round.interviewers = await processInterviewers(round.interviewers);
//         }

//         let savedRound;

//         if (roundId) {
//             let existingRound = await InterviewRounds.findById(roundId);

//             if (existingRound) {
//                 Object.assign(existingRound, round);
//                 savedRound = await existingRound.save();

//                 await reorderInterviewRounds(interviewId);
//             } else {
//                 return res.status(404).json({ message: "Round not found." });
//             }
//         } else {
//             let totalRounds = await InterviewRounds.countDocuments({ interviewId });
//             let newSequence = round.sequence || totalRounds + 1;

//             await InterviewRounds.updateMany(
//                 { interviewId, sequence: { $gte: newSequence } },
//                 { $inc: { sequence: 1 } }
//             );

//             const newInterviewRound = new InterviewRounds({
//                 interviewId,
//                 ...round,
//                 sequence: newSequence
//             });

//             savedRound = await newInterviewRound.save();

//             await reorderInterviewRounds(interviewId);
//         }

//         await handleInterviewQuestions(interviewId, savedRound._id, questions);

//         return res.status(200).json({
//             message: roundId ? "Round updated successfully." : "Interview round created successfully.",
//             savedRound
//         });

//         async function reorderInterviewRounds(interviewId) {
//             const rounds = await InterviewRounds.find({ interviewId });
//             rounds.sort((a, b) => a.sequence - b.sequence);

//             for (let i = 0; i < rounds.length; i++) {
//                 rounds[i].sequence = i + 1;
//                 await rounds[i].save();
//             }
//         }

//     } catch (error) {
//         console.error("Error saving interview round:", error);
//         return res.status(500).json({ message: "Internal server error." });
//     }
// };

// //home page code
// const getDateRanges = () => {
//   const now = new Date();
//   const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//   const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//   const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
//   return { startOfCurrentMonth, startOfLastMonth, endOfLastMonth };
// };

// const getDashboardStats = async (req, res) => {
//   try {
//     const { isOrganization, tenantId, ownerId, period = 'monthly' } = req.query;

//     if (!tenantId && !ownerId) {
//       return res.status(400).json({ error: 'tenantId or ownerId is required' });
//     }

//     const now = new Date();
//     const { startOfCurrentMonth, startOfLastMonth, endOfLastMonth } = getDateRanges(now);

//     const query = isOrganization === 'true' ? { tenantId: new mongoose.Types.ObjectId(tenantId) } : { ownerId: new mongoose.Types.ObjectId(ownerId) };

//     const totalInterviews = await Interview.countDocuments(query);

//     const interviewsThisMonth = await Interview.countDocuments({
//       ...query,
//       createdAt: { $gte: startOfCurrentMonth },
//     });

//     const interviewsLastMonth = await Interview.countDocuments({
//       ...query,
//       createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
//     });

//     let interviewChange = '0%';
//     let trendSymbol = '';
//     if (interviewsLastMonth > 0) {
//       const percentageChange = ((interviewsThisMonth - interviewsLastMonth) / interviewsLastMonth) * 100;
//       interviewChange = percentageChange >= 0 ? `+${percentageChange.toFixed(1)}%` : `${percentageChange.toFixed(1)}%`;
//       trendSymbol = percentageChange < 0 ? '↓' : '↑';
//     } else if (interviewsThisMonth > 0) {
//       interviewChange = '+100%';
//       trendSymbol = '↑';
//     }

//     const selectedThisMonth = await Interview.countDocuments({
//       ...query,
//       status: 'selected',
//       createdAt: { $gte: startOfCurrentMonth },
//     });

//     const selectedLastMonth = await Interview.countDocuments({
//       ...query,
//       status: 'selected',
//       createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
//     });

//     const successRateThisMonth = interviewsThisMonth > 0 ? ((selectedThisMonth / interviewsThisMonth) * 100).toFixed(1) : 0;
//     let successRateChange = '0%';
//     if (selectedLastMonth > 0 && interviewsLastMonth > 0) {
//       const lastMonthSuccessRate = (selectedLastMonth / interviewsLastMonth) * 100;
//       const percentageChange = successRateThisMonth - lastMonthSuccessRate;
//       successRateChange = percentageChange >= 0 ? `+${percentageChange.toFixed(1)}%` : `${percentageChange.toFixed(1)}%`;
//     } else if (selectedThisMonth > 0) {
//       successRateChange = '+100%';
//     }

//     let chartData = [];
//     if (period === 'weekly') {
//       const weeks = [];
//       for (let i = 3; i >= 0; i--) {
//         const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
//         const weekEnd = new Date(weekStart);
//         weekEnd.setDate(weekStart.getDate() + 6);
//         const count = await Interview.countDocuments({
//           ...query,
//           createdAt: { $gte: weekStart, $lte: weekEnd },
//         });
//         weeks.push({
//           name: `Week ${4 - i}`,
//           interviews: count,
//         });
//       }
//       chartData = weeks;
//     } else if (period === 'yearly') {
//       const months = [];
//       for (let i = 11; i >= 0; i--) {
//         const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
//         const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
//         const count = await Interview.countDocuments({
//           ...query,
//           createdAt: { $gte: monthStart, $lte: monthEnd },
//         });
//         months.push({
//           name: monthStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
//           interviews: count,
//         });
//       }
//       chartData = months;
//     } else {
//       const days = [];
//       for (let i = 29; i >= 0; i--) {
//         const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
//         const dayEnd = new Date(dayStart);
//         dayEnd.setHours(23, 59, 59, 999);
//         const count = await Interview.countDocuments({
//           ...query,
//           createdAt: { $gte: dayStart, $lte: dayEnd },
//         });
//         days.push({
//           name: dayStart.toLocaleString('default', { day: 'numeric', month: 'short' }),
//           interviews: count,
//         });
//       }
//       chartData = days;
//     }

//     res.json({
//       totalInterviews,
//       interviewChange: `${interviewChange} ${trendSymbol}`,
//       successRate: `${successRateThisMonth}%`,
//       successRateChange,
//       chartData,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// module.exports = { createInterview, saveInterviewRound, getDashboardStats };

// Check internal interview usage before scheduling
const checkInternalInterviewUsage = async (req, res) => {
    try {
        const { tenantId, ownerId } = req.query;
        
        if (!tenantId) {
            return res.status(400).json({ message: 'TenantId is required' });
        }
        
        const usageCheck = await checkInternalInterviewUsageLimit(tenantId, ownerId);
        const usageStats = await getInternalInterviewUsageStats(tenantId, ownerId);
        
        return res.status(200).json({
            canSchedule: usageCheck.canSchedule,
            message: usageCheck.message,
            usage: usageStats || {
                utilized: usageCheck.utilized || 0,
                entitled: usageCheck.entitled || 0,
                remaining: usageCheck.remaining || 0,
                percentage: 0
            }
        });
    } catch (error) {
        console.error('Error checking internal interview usage:', error);
        return res.status(500).json({ 
            message: 'Error checking usage limits', 
            error: error.message 
        });
    }
};

const updateInterviewStatusController = async (req, res) => {
    try {
        const { interviewId, status } = req.params;
        const { reason } = req.body;

        // Validate status
        if (!['Completed', 'Cancelled', 'Rejected', 'Selected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: Completed, Cancelled, Rejected, Selected'
            });
        }

        // Update the interview status service call
        const updatedInterview = await updateInterviewStatus(interviewId, status);

        if (!updatedInterview) {
            return res.status(400).json({
                success: false,
                message: 'Could not update interview status. Check if all rounds are in a terminal state.'
            });
        }

        // If there's a reason, update it
        if (reason) {
            updatedInterview.completionReason = reason;
            await updatedInterview.save();
        }

        res.status(200).json({
            success: true,
            data: updatedInterview
        });
    } catch (error) {
        console.error('Error updating interview status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating interview status',
            error: error.message
        });
    }
};

// Get all interview rounds for super admin
const getAllInterviewRounds = async (req, res) => {
    try {
        // Fetch all interview rounds with populated data (filter for internal interviews only)
        const interviewRounds = await InterviewRounds.find({ interviewerType: 'Internal' })
            .populate({
                path: 'interviewId',
                select: 'interviewCode candidateId positionId status tenantId ownerId createdAt',
                populate: [
                    {
                        path: 'candidateId',
                        select: 'FirstName LastName Email'
                    },
                    {
                        path: 'positionId',
                        select: 'title companyname Location'
                    }
                ]
            })
            .populate('interviewers', 'firstName lastName email _id')
            .lean() // Add lean for better performance
            .sort({ _id: -1 }); // Latest first
        
        //console.log(`[getAllInterviewRounds] Found ${interviewRounds.length} rounds`);
        
        // Check first few rounds for debugging
        // if (interviewRounds.length > 0) {
        //     console.log('[getAllInterviewRounds] Sample round interviewers:', {
        //         roundId: interviewRounds[0]._id,
        //         interviewersCount: interviewRounds[0].interviewers?.length || 0,
        //         interviewers: interviewRounds[0].interviewers
        //     });
        // }

        // Format the data for frontend
        const formattedRounds = await Promise.all(interviewRounds.map(async (round) => {
            // Get organization/tenant info
            let organizationType = 'individual'; // Default to individual
            let organizationName = 'Individual';
            
            if (round.interviewId?.tenantId) {
                try {
                    const Tenant = require('../models/Tenant');
                    const tenant = await Tenant.findById(round.interviewId.tenantId);
                    if (tenant) {
                        organizationType = tenant?.type;
                        // Use company name for organizations, or firstName + lastName for individuals
                        if (tenant?.type === 'organization') {
                            organizationName = tenant.company || 'Organization';
                        } else {
                            organizationName = 'Individual';
                        }
                    }
                } catch (error) {
                    console.error('Error fetching tenant:', error);
                }
            }

            // Debug logging for interviewers
            // if (round.interviewers && round.interviewers.length > 0) {
            //     console.log(`[Round ${round._id}] Interviewers:`, round.interviewers.map(i => ({
            //         id: i?._id,
            //         firstName: i?.firstName,
            //         lastName: i?.lastName,
            //         populated: !!i?.firstName
            //     })));
            // }

            // Format interviewer names
            const interviewerNames = round.interviewers && round.interviewers.length > 0
                ? round.interviewers
                    .map(interviewer => {
                        if (interviewer && (interviewer.firstName || interviewer.lastName)) {
                            const name = `${interviewer.firstName || ''} ${interviewer.lastName || ''}`.trim();
                            return name || 'Unknown';
                        }
                        return null;
                    })
                    .filter(name => name !== null)
                    .join(', ')
                : '';
            
            const finalInterviewerNames = interviewerNames || 'No interviewers assigned';
            
            // Fetch wallet transaction data if holdTransactionId exists
            let holdTransactionData = null;
            if (round.holdTransactionId) {
                try {
                    // Find the wallet that contains this transaction
                    // We need to search in the wallet's transactions array
                    const wallet = await Wallet.findOne({
                        'transactions._id': round.holdTransactionId
                    });
                    
                    if (wallet) {
                        // Find the specific transaction in the wallet
                        holdTransactionData = wallet.transactions.find(
                            t => t._id && t._id.toString() === round.holdTransactionId
                        );
                    }
                    
                    if (!holdTransactionData) {
                        console.log(`Transaction ${round.holdTransactionId} not found in any wallet`);
                    }
                } catch (error) {
                    console.error(`Error fetching transaction for round ${round._id}:`, error);
                }
            }

            return {
                // Core identifiers
                _id: round._id,
                interviewCode: `${round.interviewId?.interviewCode}-${round.sequence}` || 'N/A',
                interviewId: round.interviewId?._id || null,
                sequence: round.sequence || 1,
                
                // Round details
                roundTitle: round.roundTitle || 'N/A',
                interviewMode: round.interviewMode || 'N/A',
                interviewType: round.interviewType || 'N/A',
                interviewerType: round.interviewerType || 'N/A',
                duration: round.duration || 'N/A',
                instructions: round.instructions || '',
                dateTime: round.dateTime || 'Not scheduled',
                
                // Interviewer details
                interviewerViewType: round.interviewerViewType || '',
                interviewerGroupId: round.interviewerGroupId || '',
                interviewers: round.interviewers || [],
                interviewerNames: finalInterviewerNames,
                
                // Status and actions
                status: round.status || 'Draft',
                currentAction: round.currentAction || null,
                previousAction: round.previousAction || null,
                currentActionReason: round.currentActionReason || '',
                previousActionReason: round.previousActionReason || '',
                
                // Support and history
                supportTickets: round.supportTickets || [],
                history: round.history || [],
                
                // Meeting details
                meetingId: round.meetingId || '',
                meetPlatform: round.meetPlatform || '',
                
                // Assessment references
                assessmentId: round.assessmentId || null,
                scheduleAssessmentId: round.scheduleAssessmentId || null,
                
                // Additional info
                rejectionReason: round.rejectionReason || '',
                holdTransactionId: round.holdTransactionId || null,
                holdTransactionData: holdTransactionData || null, // Include full transaction object
                settlementStatus: round.settlementStatus || 'pending',
                settlementDate: round.settlementDate || null,
                settlementTransactionId: round.settlementTransactionId || null,
                
                // Organization info
                organizationType: organizationType,
                organization: organizationName,
                
                // Timestamps
                createdOn: round.createdAt || new Date(),
                updatedAt: round.updatedAt || null,
                
                // Related data from populated fields
                candidate: round.interviewId?.candidateId ? {
                    name: `${round.interviewId.candidateId.FirstName || ''} ${round.interviewId.candidateId.LastName || ''}`.trim() || 'Unknown',
                    email: round.interviewId.candidateId.Email || 'N/A'
                } : null,
                position: round.interviewId?.positionId ? {
                    title: round.interviewId.positionId.title || 'N/A',
                    company: round.interviewId.positionId.companyname || 'N/A',
                    location: round.interviewId.positionId.Location || 'N/A'
                } : null,
                interviewStatus: round.interviewId?.status || 'N/A'
            };
        }));

        // // Debug: Count organization types
        // const typeCounts = formattedRounds.reduce((acc, round) => {
        //     const type = round.organizationType || 'undefined';
        //     acc[type] = (acc[type] || 0) + 1;
        //     return acc;
        // }, {});
        
        // console.log('[getAllInterviewRounds] Organization type distribution:', typeCounts);
        // console.log('[getAllInterviewRounds] Total rounds:', formattedRounds.length);
        
        res.status(200).json({
            success: true,
            data: formattedRounds,
            total: formattedRounds.length,
            //typeDistribution: typeCounts // Include in response for debugging
        });
    } catch (error) {
        console.error('Error fetching interview rounds:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch interview rounds',
            error: error.message
        });
    }
};

// Export all controller functions
module.exports = {
    createInterview,
    getAllInterviews,
    getAllInterviewRounds, // Added new function
    updateInterview,
    saveInterviewRound,
    updateInterviewRound,
    getDashboardStats,
    deleteRound,
    getInterviews,
    checkInternalInterviewUsage,
    updateInterviewStatus: updateInterviewStatusController,
    deleteInterview
};
