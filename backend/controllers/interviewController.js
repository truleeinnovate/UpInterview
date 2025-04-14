const { Interview } = require('../models/Interview.js');
const { InterviewRounds } = require('../models/InterviewRounds.js');
const InterviewTemplate = require('../models/InterviewTemplate.js');


const { Users } = require('../models/Users');
const { Candidate } = require('../models/candidate');
const { encrypt, generateOTP } = require('../utils/generateOtp');
const sendEmail = require('../utils/sendEmail');
const TeamsOtpSchema = require('../models/teamOtp.js');
const interviewQuestions = require('../models/interviewQuestions');
const { Position } = require('../models/position.js');
const Assessment = require("../models/assessment.js");


//shashank-[14/02/2025]
//refinded version
// const createInterview = async (req, res) => {
//     try {
//         const interviewData = req.body;
//         const { CandidateId, teamId, rounds } = interviewData;

//         // Validate request data
//         if (!CandidateId || !teamId || !Array.isArray(rounds) || rounds.length === 0) {
//             return res.status(400).json({ message: "Missing required fields or invalid rounds format" });
//         }

//         // Fetch candidate details
//         const candidate = await Candidate.findById(CandidateId);
//         if (!candidate) {
//             return res.status(404).json({ message: "Candidate not found" });
//         }

//         // Sending emails to interviewers (handling multiple async calls)
//         const emailPromises = [];

//         for (const round of rounds) {
//             if (round.mode === "Virtual" && Array.isArray(round.interviewers)) {

//                 for (const interviewer of round.interviewers) {
//                     const ecryptArg = {user:"host",details:{id:interviewer.id}}
//                 // const encryptedHost = encrypt('host','meet')
//                 const encryptedHost = encrypt(ecryptArg,'meet')
//                     if (!interviewer.id) continue; // Skip invalid interviewer entries
//                     try {
//                         const user = await Users.findById(interviewer.id);
//                         if (user && user.Email) {
//                             emailPromises.push(
//                                 sendEmail(
//                                     user.Email,
//                                     "Interview Scheduled",
//                                     `Your scheduled interview can be accessed using link: http://localhost:3000/meetId/${teamId}?user=${encryptedHost}`
//                                 )
//                             );
//                         }
//                     } catch (err) {
//                         console.error(`Error fetching interviewer ${interviewer.id}:`, err);
//                     }
//                 }
//             }
//         }

//         // Sending email to candidate
//         if (candidate.Email) {
//             // const encryptedUser = encrypt("public","meet")
//             const ecryptArg = {user:"public",details:{id:CandidateId}}

//             const encryptedUser = encrypt(ecryptArg,'meet')
//             const otp = generateOTP(CandidateId)

//             emailPromises.push(
//                 sendEmail(
//                     candidate.Email,
//                     "Interview Invitation",
//                     `You are invited to attend a virtual interview with link: http://localhost:3000/meetId/${teamId}?user=${encryptedUser} . Your otp ${otp}`
//                 )
//             );
//         }

//         // Wait for all emails to be sent
//         await Promise.all(emailPromises);

//         // Save interview data
//         const newInterview = new Interview(interviewData);
//         const savedInterview = await newInterview.save();

//         res.status(201).json(savedInterview);
//     } catch (error) {
//         console.error("Error creating interview:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// const createInterview = async (req, res) => {
//     try {
//         const interviewData = req.body;
//         const { CandidateId, teamId, rounds } = interviewData;

//         // Validate request data
//         if (!CandidateId || !teamId || !Array.isArray(rounds) || rounds.length === 0) {
//             return res.status(400).json({ message: "Missing required fields or invalid rounds format" });
//         }

//         // Fetch candidate details
//         const candidate = await Candidate.findById(CandidateId);
//         if (!candidate) {
//             return res.status(404).json({ message: "Candidate not found" });
//         }

//         // Sending emails to interviewers (handling multiple async calls)
//         const emailPromises = [];

//         for (const round of rounds) {
//             if (round.mode === "Virtual" && Array.isArray(round.interviewers)) {

//                 // Generate meetLink for the round
//                 // const ecryptArgRound = { user: "public", details: { teamId, round: round.round } };
//                 const ecryptArgRound = { user: "public", details: { teamId, round: round.round } };
//                 const encryptedMeetLink = encrypt(ecryptArgRound, 'meet');
//                 // round.meetLink = `http://localhost:3000/meetId/${teamId}?user=${encryptedMeetLink}`;

//                 for (const interviewer of round.interviewers) {
//                     if (!interviewer.id) continue; // Skip invalid interviewer entries

//                     const ecryptArg = { user: "host", details: { id: interviewer.id } };
//                     const encryptedHost = encrypt(ecryptArg, 'meet');
//                     round.meetLink = `http://localhost:3000/meetId/${teamId}?user=${encryptedHost}`;


//                     try {
//                         const user = await Users.findById(interviewer.id);
//                         if (user && user.Email) {
//                             emailPromises.push(
//                                 sendEmail(
//                                     user.Email,
//                                     "Interview Scheduled",
//                                     `Your scheduled interview can be accessed using this link: ${round.meetLink}`
//                                 )
//                             );
//                         }
//                     } catch (err) {
//                         console.error(`Error fetching interviewer ${interviewer.id}:`, err);
//                     }
//                 }
//             }
//         }

//         // Sending email to candidate
//         if (candidate.Email) {
//             const ecryptArg = { user: "public", details: { id: CandidateId } };
//             const encryptedUser = encrypt(ecryptArg, 'meet');
//             const otp = generateOTP(CandidateId);
//         const otpInstance = new TeamsOtpSchema({
//             teamId,
//             candidateId: CandidateId,
//             otp,  // ✅ Fixed the incorrect variable name
//             expiresAt: new Date(Date.now() + 90 * 1000), // 90 seconds expiration
//         });

//         await otpInstance.save();

//             emailPromises.push(
//                 sendEmail(
//                     candidate.Email,
//                     "Interview Invitation",
//                     `You are invited to attend a virtual interview with this link: http://localhost:3000/meetId/${teamId}?user=${encryptedUser}. Your OTP is: ${otp}`
//                 )
//             );
//         }

//         // Wait for all emails to be sent
//         await Promise.all(emailPromises);

//         // Save interview data with updated meetLinks
//         const newInterview = new Interview(interviewData);
//         const savedInterview = await newInterview.save();

//         res.status(201).json(savedInterview);
//     } catch (error) {
//         console.error("Error creating interview:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// const createInterview = async (req, res) => {
//     try {
//         const interviewData = req.body;
//         const { CandidateId, teamId, rounds } = interviewData;

//         // Validate request data
//         if (!CandidateId || !teamId || !Array.isArray(rounds) || rounds.length === 0) {
//             return res.status(400).json({ message: "Missing required fields or invalid rounds format" });
//         }

//         // Fetch candidate details
//         const candidate = await Candidate.findById(CandidateId);
//         if (!candidate) {
//             return res.status(404).json({ message: "Candidate not found" });
//         }

//         const newInterview = new Interview(interviewData);

//         // Sending emails to interviewers (handling multiple async calls)
//         const emailPromises = [];

//         for (const round of rounds) {
//             if (round.mode === "Virtual" && Array.isArray(round.interviewers)) {
//                 console.log("round",round)
//                 // Generate meetLink for the round
//                 const ecryptArgRound = { user: "host", details: { teamId, round: round.round } };
//                 const encryptedMeetLink = encrypt(ecryptArgRound, 'meet');
//                 // round.meetLink = `http://localhost:3000/meetId/${teamId}?user=${encryptedMeetLink}`;
//                 // round.meetLink = `http://localhost:3000/meetId/${teamId}/${newInterview._id}?user=${encryptedMeetLink}`;

//                 for (const interviewer of round.interviewers) {
//                     if (!interviewer.id) continue; // Skip invalid interviewer entries

//                     const ecryptArg = { user: "host", details: { id: interviewer.id,candidateId:CandidateId, round:round.round } };
//                     const encryptedHost = encrypt(ecryptArg, 'meet');
//                     round.meetLink = `http://localhost:3000/meetId/${teamId}/${newInterview._id}?user=${encryptedHost}`;

//                     try {
//                         const user = await Users.findById(interviewer.id);
//                         if (user && user.Email) {
//                             emailPromises.push(
//                                 sendEmail(
//                                     user.Email,
//                                     "Interview Scheduled",
//                                     `Your scheduled interview can be accessed using this link: ${round.meetLink}`
//                                 )
//                             );
//                         }
//                     } catch (err) {
//                         console.error(`Error fetching interviewer ${interviewer.id}:`, err);
//                     }
//                 }
//             }
//         }

//         // Generate and store OTP for candidate
//         const otp = generateOTP(CandidateId);
//         const otpInstance = new TeamsOtpSchema({
//             teamId,
//             candidateId: CandidateId,
//             otp,  // ✅ Fixed the incorrect variable name
//             expiresAt: new Date(Date.now() + 90 * 1000), // 90 seconds expiration
//         });
//         console.log("otp instance",otpInstance)

//         await otpInstance.save();

//         // Sending email to candidate
//         if (candidate.Email) {
//             const ecryptArg = { user: "public", details: { id: CandidateId } };
//             const encryptedUser = encrypt(ecryptArg, 'meet');

//             emailPromises.push(
//                 sendEmail(
//                     candidate.Email,
//                     "Interview Invitation",
//                     // `You are invited to attend a virtual interview with this link: http://localhost:3000/meetId/${teamId}?user=${encryptedUser}. Your OTP is: ${otp}`
//                     `You are invited to attend a virtual interview with this link: http://localhost:3000/meetId/${teamId}/${newInterview._id}?user=${encryptedUser}. Your OTP is: ${otp}`
//                 )
//             );
//         }

//         // Wait for all emails to be sent
//         await Promise.all(emailPromises);

//         // Save interview data with updated meetLinks
//         // const newInterview = new Interview(interviewData);
//         const savedInterview = await newInterview.save();

//         res.status(201).json(savedInterview);
//     } catch (error) {
//         console.error("Error creating interview:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };
// before changing rounds schema array to direct code
// const createInterview = async (req, res) => {
//     try {
//         const { candidateId, positionId, templateId, orgId, userId, interviewId } = req.body;

//         // Validate candidate
//         const candidate = await Candidate.findById(candidateId);
//         if (!candidate) {
//             return res.status(404).json({ message: "Candidate not found" });
//         }

//         const template = await InterviewTemplate.findById(templateId);

//         // Check if the interview already exists (for editing)
//         let interview;
//         if (interviewId) {
//             interview = await Interview.findById(interviewId);
//             if (!interview) {
//                 return res.status(404).json({ message: "Interview not found" });
//             }
//         }

//         // Prepare interview data
//         const interviewData = {
//             candidateId,
//             positionId,
//             templateId: template ? templateId : undefined, // Only include if template is selected
//             status: interview ? interview.status : "Draft", // Preserve status if editing
//             createdById: interview ? interview.createdById : userId, // Preserve createdById if editing
//             lastModifiedById: userId,
//             ownerId: userId,
//             tenantId: orgId || undefined,
//         };

//         // Create or update interview
//         let savedInterview;
//         if (interviewId) {
//             savedInterview = await Interview.findByIdAndUpdate(interviewId, interviewData, { new: true });
//         } else {
//             const newInterview = new Interview(interviewData);
//             savedInterview = await newInterview.save();
//         }

//         const position = await Position.findById(positionId);
//         let roundsToSave = [];

//         // Logic to determine which rounds to save
//         if (position?.templateId?.toString() === templateId?.toString()) {
//             roundsToSave = position.rounds || [];
//         } else if (position?.templateId && position?.templateId.toString() !== templateId?.toString()) {
//             if (template?.rounds?.length > 0) {
//                 roundsToSave = template.rounds;
//             }
//         } else if (!position?.templateId && position?.rounds?.length > 0 && templateId) {
//             if (template?.rounds?.length > 0) {
//                 roundsToSave = template.rounds;
//             }
//         } else if (!position?.templateId && position?.rounds?.length > 0) {
//             roundsToSave = position.rounds;
//         } else if (templateId) {
//             if (template?.rounds?.length > 0) {
//                 roundsToSave = template.rounds;
//             }
//         }
//         let interviewRounds;
//         // Update or create interview rounds
//         if (roundsToSave.length > 0) {
//             if (interviewId) {
//                 // Update existing interview rounds
//                 interviewRounds = await InterviewRounds.findOneAndUpdate(
//                     { interviewId: savedInterview._id },
//                     {  roundsToSave },
//                     { new: true, upsert: true } // Create if not found
//                 );
//             } else {
//                 // Create new interview rounds
//                 interviewRounds = new InterviewRounds({
//                     interviewId: savedInterview._id,
//                      roundsToSave,
//                 });
//                 await interviewRounds.save();
//             }
//             console.log("interviewRounds", interviewRounds);
//         }


//         // Save interview data with updated meetLinks
//         res.status(201).json(savedInterview);
//     } catch (error) {
//         console.error("Error creating interview:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// const getInterviewWithRoundCandidatePositionTemplate = async (req, res) => {
//     try {
//         const { id } = req.params;
//         console.log(`Fetching interview details for ID: ${id}`);

//         // Fetch Interview and populate candidate, position, and template
//         const interview = await Interview.findById(id)
//             .populate({ path: 'candidateId', model: Candidate }) // Candidate Details
//             .populate({ path: 'positionId', model: Position }) // Position Details
//             .populate({ path: 'templateId', model: InterviewTemplate, select: 'templateName' }); // Template Details

//         if (!interview) {
//             console.log(`No interview found for ID: ${id}`);
//             return res.status(404).json({ message: 'Interview not found' });
//         }

//         console.log('Interview Data:', interview);

//         // Fetch InterviewRounds for this interview and populate interviewers, questions, and assessment sections
//         const interviewRoundsSchema = await InterviewRounds.findOne({ interviewId: id })
//             .populate({
//                 path: "rounds.interviewers",
//                 model: "Contacts", // Populate interviewers
//                 select: "name email", // Select specific fields from Contacts (adjust as needed)
//             })
//             .populate({
//                 path: "rounds.questions",
//                 model: "InterviewQuestions", // Populate questions
//                 select: "snapshot", // Select only the snapshot field
//             })
//             .populate({
//                 path: "rounds.assessmentId",
//                 model: Assessment,
//                 select: "Sections", // Select only Sections
//                 populate: {
//                     path: "Sections.Questions",
//                     model: "assessmentQuestions",
//                     select: "snapshot", // Select only snapshot from assessmentQuestions
//                 },
//             });

//         const interviewRounds = interviewRoundsSchema ? interviewRoundsSchema.rounds : [];

//         console.log('Interview Rounds Data:', interviewRounds);

//         res.status(200).json({
//             interview,
//             interviewRounds
//         });
//     } catch (error) {
//         console.error('Error fetching interview details:', error);
//         res.status(500).json({ message: 'Internal server error', error });
//     }
// };


//code before adding interview questions common logic
// const createInterview = async (req, res) => {
//     try {
//         const { candidateId, positionId, templateId,status, orgId, userId, interviewId, updatingInterviewStatus,completionReason } = req.body;

//         let candidate = null;

//         // Validate candidate only if interviewId is not provided
//         if (!updatingInterviewStatus) {
//             candidate = await Candidate.findById(candidateId);

//             if (!candidate) {
//                 return res.status(404).json({ message: "Candidate not found" });
//             }
//         }

//         const template = await InterviewTemplate.findById(templateId);

//         // Check if the interview already exists (for editing)
//         let interview;
//         if (interviewId) {
//             interview = await Interview.findById(interviewId);
//             if (!interview) {
//                 return res.status(404).json({ message: "Interview not found" });
//             }
//         }

//         // Prepare interview data
//         const interviewData = {
//             candidateId,
//             positionId,
//             templateId: template ? templateId : undefined, // Only include if template is selected
//             status, // Preserve status if editing
//             createdById: interview ? interview.createdById : userId, // Preserve createdById if editing
//             lastModifiedById: userId,
//             ownerId: userId,
//             tenantId: orgId || undefined,
//             completionReason
//         };

//         // Create or update interview
//         let savedInterview;
//         if (interviewId) {
//             savedInterview = await Interview.findByIdAndUpdate(interviewId, interviewData, { new: true });
//         } else {
//             const newInterview = new Interview(interviewData);
//             savedInterview = await newInterview.save();
//         }
//         // when status updating then we dont update template or postion rounds only update when creating or editing
//         if (!updatingInterviewStatus) {
//             const position = await Position.findById(positionId);
//             let roundsToSave = [];

//             // Determine rounds to save based on template and position logic
//             if (position?.templateId?.toString() === templateId?.toString()) {
//                 roundsToSave = position.rounds || [];
//             } else if (position?.templateId && position?.templateId.toString() !== templateId?.toString()) {
//                 roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//             } else if (!position?.templateId && position?.rounds?.length > 0 && templateId) {
//                 roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//                 console.log('roundsToSaveposition', roundsToSave);
//             } else if (!position?.templateId && position?.rounds?.length > 0) {
//                 roundsToSave = position.rounds;
//             } else if (templateId) {
//                 roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
//             }

//             // Ensure sequence numbers are properly assigned
//             roundsToSave = roundsToSave.map((round, index) => ({
//                 ...round,
//                 sequence: index + 1, // Ensure sequential numbering
//             }));



//             if (roundsToSave.length > 0) {
//                 if (interviewId) {
//                     // if user is editing interviwe form selected new template then old rounds will be deleted and new will be add
//                     // Delete existing rounds and insert new ones
//                     await InterviewRounds.deleteMany({ interviewId: savedInterview._id });

//                     await InterviewRounds.insertMany(
//                         roundsToSave.map(round => ({
//                             interviewId: savedInterview._id,
//                             sequence: round.sequence,
//                             roundTitle: round.roundTitle,
//                             interviewMode: round.interviewMode,
//                             interviewType: round.interviewType,
//                             interviewerType: round.interviewerType,
//                             duration: round.duration,
//                             instructions: round.instructions,
//                             dateTime: round.dateTime,
//                             interviewers: round.interviewers || [],
//                             status: round.status || "Pending",
//                             questions: round.questions || [],
//                             meetingId: round.meetingId,
//                             meetLink: round.meetLink || [],
//                             assessmentId: round.assessmentId,
//                         }))
//                     );
//                 } else {
//                     // Create new rounds
//                     await InterviewRounds.insertMany(
//                         roundsToSave.map(round => ({

//                             interviewId: savedInterview._id,
//                             sequence: round.sequence,
//                             roundTitle: round.roundTitle,
//                             interviewMode: round.interviewMode,
//                             interviewType: round.interviewType,
//                             interviewerType: round.interviewerType,
//                             duration: round.duration,
//                             instructions: round.instructions,
//                             dateTime: round.dateTime,
//                             interviewers: round.interviewers || [],
//                             status: round.status || "Pending",
//                             questions: round.questions || [],
//                             meetingId: round.meetingId,
//                             meetLink: round.meetLink || [],
//                             assessmentId: round.assessmentId,
//                         }))
//                     );
//                 }
//             }
//         }

//         res.status(201).json(savedInterview);
//     } catch (error) {
//         console.error("Error creating interview:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };
const createInterview = async (req, res) => {
    try {
        const { candidateId, positionId, templateId, status, orgId, userId, interviewId, updatingInterviewStatus, completionReason } = req.body;

        let candidate = null;

        // Validate candidate only if interviewId is not provided
        if (!updatingInterviewStatus) {
            candidate = await Candidate.findById(candidateId);

            if (!candidate) {
                return res.status(404).json({ message: "Candidate not found" });
            }
        }

        const template = await InterviewTemplate.findById(templateId);

        // Check if the interview already exists (for editing)
        let interview;
        if (interviewId) {
            interview = await Interview.findById(interviewId);
            if (!interview) {
                return res.status(404).json({ message: "Interview not found" });
            }
        }

        // Prepare interview data
        const interviewData = {
            candidateId,
            positionId,
            templateId: template ? templateId : undefined, // Only include if template is selected
            status, // Preserve status if editing
            createdById: interview ? interview.createdById : userId, // Preserve createdById if editing
            lastModifiedById: userId,
            ownerId: userId,
            tenantId: orgId || undefined,
            completionReason
        };

        // Create or update interview
        let savedInterview;
        if (interviewId) {
            savedInterview = await Interview.findByIdAndUpdate(interviewId, interviewData, { new: true });
        } else {
            const newInterview = new Interview(interviewData);
            savedInterview = await newInterview.save();
        }

        // Only update rounds if interview status is NOT being updated
        if (!updatingInterviewStatus) {
            const position = await Position.findById(positionId);
            let roundsToSave = [];

            // Determine rounds to save based on template and position logic
            if (position?.templateId?.toString() === templateId?.toString()) {
                roundsToSave = position.rounds || [];
            } else if (position?.templateId && position?.templateId.toString() !== templateId?.toString()) {
                roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
            } else if (!position?.templateId && position?.rounds?.length > 0 && templateId) {
                roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
            } else if (!position?.templateId && position?.rounds?.length > 0) {
                roundsToSave = position.rounds;
            } else if (templateId) {
                roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
            }
            console.log("rounds to save", roundsToSave);
            // Ensure sequence numbers are properly assigned
            roundsToSave = roundsToSave.map((round, index) => ({
                ...round,
                sequence: index + 1, // Ensure sequential numbering
            }));

            if (roundsToSave.length > 0) {
                if (interviewId) {
                    // Delete existing rounds and their questions if editing
                    await InterviewRounds.deleteMany({ interviewId: savedInterview._id });
                    await interviewQuestions.deleteMany({ interviewId: savedInterview._id });
                }

                // Insert new rounds
                const insertedRounds = await InterviewRounds.insertMany(
                    roundsToSave.map(round => ({
                        interviewId: savedInterview._id,
                        sequence: round.sequence,
                        roundTitle: round.roundTitle,
                        interviewMode: round.interviewMode,
                        interviewType: round.interviewType,
                        interviewerType: round.interviewerType,
                        duration: round.duration,
                        instructions: round.instructions,
                        dateTime: round.dateTime,
                        interviewers: round.interviewers || [],
                        status: round.status || "Pending",
                        questions: round.questions || [],
                        meetingId: round.meetingId,
                        meetLink: round.meetLink || [],
                        assessmentId: round.assessmentId,
                    }))
                );

                // Handle interview questions for the newly inserted rounds
                for (const round of insertedRounds) {
                    if (round.questions && round.questions.length > 0) {
                        await handleInterviewQuestions(savedInterview._id, round._id, round.questions);
                    }
                }
            }
        }

        res.status(201).json(savedInterview);
    } catch (error) {
        console.error("Error creating interview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Handles creating, updating, and deleting interview questions for a round.
 * Used in both createInterview and saveInterviewRound functions.
 */
async function handleInterviewQuestions(interviewId, roundId, questions) {
    const existingQuestions = await interviewQuestions.find({ interviewId, roundId });
    const existingQuestionIds = existingQuestions.map(q => q._id.toString());
    const newQuestionIds = questions.map(q => q._id).filter(id => id); // Ignore new questions without _id

    // **Delete questions that were removed**
    const questionsToDelete = existingQuestionIds.filter(id => !newQuestionIds.includes(id));
    if (questionsToDelete.length > 0) {
        await interviewQuestions.deleteMany({ _id: { $in: questionsToDelete } });
    }

    // **Update or Insert Questions**
    for (const q of questions) {
        if (q._id) {
            // **Update existing question**
            await interviewQuestions.findByIdAndUpdate(q._id, q, { new: true });
        } else {
            // **Insert new question**
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
                addedBy: q.addedBy
            });
        }
    }
}

const saveInterviewRound = async (req, res) => {
    try {

        const { interviewId, round, roundId, questions } = req.body;

        if (!interviewId || !round) {
            return res.status(400).json({ message: "Interview ID and round data are required." });
        }

        // let savedRound;

        // if (roundId) {
        //     // **Edit existing round**
        //     let existingRound = await InterviewRounds.findById(roundId);

        //     if (existingRound) {
        //         Object.assign(existingRound, round); // Merge updated fields
        //         savedRound = await existingRound.save();

        //         // **Reorder all rounds based on sequence**
        //         await reorderInterviewRounds(interviewId);

        //         // **Handle Interview Questions when Editing**
        //         if (questions && questions.length > 0) {
        //             await handleInterviewQuestions(interviewId, roundId, questions);
        //         }
        //     } else {
        //         return res.status(404).json({ message: "Round not found." });
        //     }
        // } else {
        //     // **Create a new round**
        //     let totalRounds = await InterviewRounds.countDocuments({ interviewId });
        //     let newSequence = round.sequence || totalRounds + 1;

        //     // **Shift existing rounds if inserting at a lower sequence**
        //     await InterviewRounds.updateMany(
        //         { interviewId, sequence: { $gte: newSequence } },
        //         { $inc: { sequence: 1 } }
        //     );

        //     // **Save new round**
        //     const newInterviewRound = new InterviewRounds({
        //         interviewId,
        //         ...round,
        //         sequence: newSequence
        //     });

        //     savedRound = await newInterviewRound.save();

        //     // **Reorder rounds after adding**
        //     await reorderInterviewRounds(interviewId);

        //     // **Handle Interview Questions when Creating a New Round**
        //     if (questions && questions.length > 0) {
        //         await handleInterviewQuestions(interviewId, savedRound._id, questions);
        //     }
        // }

        let savedRound;

        if (roundId) {
            // **Edit existing round**
            let existingRound = await InterviewRounds.findById(roundId);

            if (existingRound) {
                Object.assign(existingRound, round); // Merge updated fields
                savedRound = await existingRound.save();

                // **Reorder all rounds based on sequence**
                await reorderInterviewRounds(interviewId);
            } else {
                return res.status(404).json({ message: "Round not found." });
            }
        } else {
            // **Create a new round**
            let totalRounds = await InterviewRounds.countDocuments({ interviewId });
            let newSequence = round.sequence || totalRounds + 1;

            // **Shift existing rounds if inserting at a lower sequence**
            await InterviewRounds.updateMany(
                { interviewId, sequence: { $gte: newSequence } },
                { $inc: { sequence: 1 } }
            );

            // **Save new round**
            const newInterviewRound = new InterviewRounds({
                interviewId,
                ...round,
                sequence: newSequence
            });

            savedRound = await newInterviewRound.save();

            // **Reorder rounds after adding**
            await reorderInterviewRounds(interviewId);
        }

        // **Handle Interview Questions for the Round**
        await handleInterviewQuestions(interviewId, savedRound._id, questions);

        return res.status(200).json({
            message: roundId ? "Round updated successfully." : "Interview round created successfully.",
            savedRound
        });

        /**
         * Handles creating, updating, and deleting interview questions for a round.
         */
        // async function handleInterviewQuestions(interviewId, roundId, questions) {
        //     const existingQuestions = await interviewQuestions.find({ interviewId, roundId });
        //     const existingQuestionIds = existingQuestions.map(q => q._id.toString());
        //     const newQuestionIds = questions.map(q => q._id).filter(id => id); // Ignore new questions without _id

        //     // **Delete questions that were removed**
        //     const questionsToDelete = existingQuestionIds.filter(id => !newQuestionIds.includes(id));
        //     if (questionsToDelete.length > 0) {
        //         await interviewQuestions.deleteMany({ _id: { $in: questionsToDelete } });
        //     }

        //     // **Update or Insert Questions**
        //     for (const q of questions) {
        //         if (q._id) {
        //             // **Update existing question**
        //             await interviewQuestions.findByIdAndUpdate(q._id, q, { new: true });
        //         } else {
        //             // **Insert new question**
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

        /**
         * Reorders interview rounds based on sequence. 
         */
        async function reorderInterviewRounds(interviewId) {
            let rounds = await InterviewRounds.find({ interviewId }).sort({ sequence: 1 });

            for (let i = 0; i < rounds.length; i++) {
                rounds[i].sequence = i + 1;
                await rounds[i].save();
            }
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




// const createInterview = async (req, res) => {
//     try {
//         const interviewData = req.body;
//         const {CandidateId,meetId,rounds}=interviewData
//         const candidate = await Candidate.findById(CandidateId)
//         //sending mails to interviewers

//         rounds.forEach(async round=>{
//             if (round.mode==="Virtual"){
//                 const {interviewers}=round 
//                 interviewers.forEach(async i=>{
//                     const {id}=i 
//                     const user = await Users.findById(id)
//                     console.log("user",user)
//                     sendEmail(user.Email,"Interview Scheduled",`Your scheduled interview can be accessed using link :  http://localhost:3000/meetId=${meetId}&user=host`)
//                 })
//             }
//             const {Email}=candidate
//         await sendEmail("shashankmende88@gmail.com","Interview Invitation",`You are invited to attend virtual interview with link:  http://localhost:3000/meetId=${meetId}&user=public`)
//         })

//         console.log("candidate",candidate)

//         console.log("Received interview data:", interviewData);
//         const newInterview = new Interview(interviewData);
//         const savedInterview = await newInterview.save();
//         res.status(201).json(savedInterview);
//     } catch (error) {
//         console.error("Error saving interview:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

//mansoor
// const createInterview = async (req, res) => {
//     try {
//         const interviewData = req.body;
//         console.log("Received interview data:", interviewData);
//         const newInterview = new Interview(interviewData);
//         const savedInterview = await newInterview.save();
//         res.status(201).json(savedInterview);
//     } catch (error) {
//         console.error("Error saving interview:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// const getAllInterviews = async (req, res) => {
//     try {
//         const interviews = await Interview.find().sort({ createdOn: -1 });
//         res.json(interviews);
//     } catch (error) {
//         console.error('Error fetching interviews:', error);
//         res.status(500).json({ message: 'Error fetching interviews', error });
//     }
// };

// const getInterviewBasedOnInterviewId = async(req,res)=>{
//     try {
//         const {id}=req.params 
//         const interview = await Interview.findById(id)
//             .populate({
//                 path: 'rounds.interviewers.id', // Populating interviewers' `id` field
//                 model: 'Users', // Ensures proper reference to the User model
//                 // select: 'name email role' // Select necessary fields from User
//             }).lean()
//             .populate({
//                 path:"rounds.questions.questionId",
//                 model:"InterviewQuestions"
//                 // model:"suggestedQuestions"
//             })
//             ;

//         res.json(interview)
//     } catch (error) {
//         console.log("error in getting interview based on id",error)
//         res.status(500).json({ message: 'Error fetching interview', error });
//     }
// }

const mongoose = require('mongoose'); // Import mongoose for ObjectId conversion
const { data } = require('autoprefixer');
const { log } = require('util');

// const getInterviewBasedOnInterviewId = async (req, res) => {
//     try {
//         const { id } = req.params;
//         console.log("Interview ID:", id);

//         // Convert ID to ObjectId
//         const interviewId = new mongoose.Types.ObjectId(id);

//         // Step 1: Fetch the interview and populate interviewers
//         let interview = await Interview.findById(interviewId)
//             .populate({
//                 path: 'rounds.interviewers.id',
//                 model: 'Users'
//             }).lean();

//         if (!interview) {
//             return res.status(404).json({ message: 'Interview not found' });
//         }

//         // Step 2: Fetch questions for this interviewId and questionId
//         for (const round of interview.rounds) {
//             for (const question of round.questions) {
//                 console.log("Processing Question:", question);

//                 const questionObjectId = new mongoose.Types.ObjectId(question.questionId);

//                 const doc = await interviewQuestions.findOne({
//                     interviewId: interviewId,  // Match interviewId correctly
//                     questionId: questionObjectId // Match questionId correctly
//                 }).lean();

//                 console.log("Fetched Questions:", doc);

//                 // Replace questionId with actual question data
//                 // question.questionId = doc.length > 0 ? doc : null;
//                 question.questionId = doc;
//             }
//         }

//         res.json(interview);
//     } catch (error) {
//         console.error("Error in getting interview based on ID:", error);
//         res.status(500).json({ message: 'Error fetching interview', error });
//     }
// };



// const getAllInterviews = async (req, res) => {
//     try {
//         const interviews = await Interview.find()
//             .populate({
//                 path: 'positionId',
//                 model: 'Position'
//             })
//             .sort({ createdOn: -1 });

//         res.json(interviews);
//     } catch (error) {
//         console.error('Error fetching interviews:', error);
//         res.status(500).json({ message: 'Error fetching interviews', error });
//     }
// };

// const updateInterview = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { rounds, LastModifiedById } = req.body;

//         const existingInterview = await Interview.findById(id);
//         if (!existingInterview) {
//             return res.status(404).json({ message: "Interview not found" });
//         }

//         existingInterview.rounds = rounds.map(round => ({
//             ...round,
//             interviewers: round.interviewers?.map(member => ({
//                 id: member.id,
//                 name: member.name
//             })),
//             questions: round.questions?.map(question => ({
//                 questionId: question.questionId
//             }))
//         }));

//         existingInterview.LastModifiedById = LastModifiedById;

//         // Save the updated interview document in the database
//         const updatedInterview = await Interview.findByIdAndUpdate(
//             id,
//             { rounds: existingInterview.rounds, LastModifiedById },
//             { new: true }
//         );

//         res.status(200).json(updatedInterview);
//     } catch (error) {
//         console.error("Error updating interview:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

module.exports = { createInterview, saveInterviewRound };
