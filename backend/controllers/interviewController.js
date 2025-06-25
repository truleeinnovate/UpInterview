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

const mongoose = require("mongoose");
const { Interview } = require("../models/Interview");
const { InterviewRounds } = require("../models/InterviewRounds.js");
const InterviewTemplate = require("../models/InterviewTemplate.js");
const { Contacts } = require("../models/Contacts");
const { Users } = require("../models/Users");
const { Candidate } = require("../models/candidate");
const { encrypt, generateOTP } = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const interviewQuestions = require("../models/interviewQuestions");
const { Position } = require("../models/position.js");
const Assessment = require("../models/assessment");

const createInterview = async (req, res) => {
  try {
    const {
      candidateId,
      positionId,
      templateId,
      status,
      orgId,
      userId,
      interviewId,
      updatingInterviewStatus,
      completionReason,
    } = req.body;
    let candidate = null;

    if (!updatingInterviewStatus) {
      candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
    }

    console.log(
      "roundsToSave",
      candidateId,
      positionId,
      templateId,
      status,
      orgId,
      userId,
      interviewId,
      updatingInterviewStatus,
      completionReason
    );

    const template = await InterviewTemplate.findById(templateId);

    let interview;
    let isUpdate = Boolean(interviewId);
    let interviewData = {
      candidateId,
      positionId,
      templateId: template ? templateId : undefined,
      ownerId: userId,
      tenantId: orgId || undefined,
      completionReason,
      status,
    };

    if (isUpdate) {
      interviewData.updatedBy = userId;
      interview = await Interview.findByIdAndUpdate(
        interviewId,
        interviewData,
        { new: true }
      );
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
    } else {
        
      // Generate interviewCode for new interview
      const lastInterview = await Interview.findOne({})
        .sort({ _id: -1 })
        .select("interviewCode")
        .lean();

      let nextNumber = 1;
      if (lastInterview && lastInterview.interviewCode) {
        const match = lastInterview.interviewCode.match(/INT-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      interviewData.interviewCode = `INT-${String(nextNumber).padStart(
        5,
        "0"
      )}`;
      interviewData.createdBy = userId;

      interview = new Interview(interviewData);
      await interview.save();
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

      console.log("roundsToSave", roundsToSave);

      if (roundsToSave.length > 0) {
        if (isUpdate) {
          await InterviewRounds.deleteMany({ interviewId: interview._id });
          await interviewQuestions.deleteMany({ interviewId: interview._id });
        }

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
            status: round.status || "Pending",
            meetLink: round.meetLink || [],
            meetingId: round.meetingId || "",
            assessmentId: round.assessmentId || null,
            questions: [], // Initialize as empty array
            rejectionReason: round.rejectionReason || "",
            minimumInterviewers: round.minimumInterviewers || "", // This field doesn't exist in schema
            interviewerGroupId: round.interviewerGroupId || null, // This field doesn't exist in schema
          });

          // Save the round document
          const savedRound = await roundDoc.save();
          console.log("Saved roundDoc:", JSON.stringify(savedRound, null, 2));

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
                console.log(`Questions saved for round ${savedRound._id}`);
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

const saveInterviewRound = async (req, res) => {
  try {
    const { interviewId, round, roundId, questions } = req.body;
    if (!interviewId || !round) {
      return res
        .status(400)
        .json({ message: "Interview ID and round data are required." });
    }

    if (round.interviewers) {
      round.interviewers = await processInterviewers(round.interviewers);
    }

    let savedRound;
    if (roundId) {
      let existingRound = await InterviewRounds.findById(roundId);
      if (existingRound) {
        Object.assign(existingRound, round);
        savedRound = await existingRound.save();
        await reorderInterviewRounds(interviewId);
      } else {
        return res.status(404).json({ message: "Round not found." });
      }
    } else {
      let totalRounds = await InterviewRounds.countDocuments({ interviewId });
      let newSequence = round.sequence || totalRounds + 1;

      await InterviewRounds.updateMany(
        { interviewId, sequence: { $gte: newSequence } },
        { $inc: { sequence: 1 } }
      );

      const newInterviewRound = new InterviewRounds({
        interviewId,
        ...round,
        sequence: newSequence,
      });

      savedRound = await newInterviewRound.save();
      await reorderInterviewRounds(interviewId);
    }

    await handleInterviewQuestions(interviewId, savedRound._id, questions);

    return res.status(200).json({
      message: roundId
        ? "Round updated successfully."
        : "Interview round created successfully.",
      savedRound,
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
    console.error("Error saving interview round:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

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

module.exports = {
  createInterview,
  saveInterviewRound,
  getDashboardStats,
  deleteRound,
};
