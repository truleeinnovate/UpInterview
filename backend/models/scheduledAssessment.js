// const { CandidateAssessment } = require("../models/candidateAssessment");
// const Otp = require("../models/Otp");
// const scheduledAssessmentsSchema = require("../models/scheduledAssessmentsSchema");
// const mongoose = require('mongoose');



// exports.getScheduledAssessmentsListBasedOnId = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const scheduledAssessment = await scheduledAssessmentsSchema
//       .findById(id)
//       // .populate("createdBy", "Firstname")
//       .populate("assessmentId");
//     // .populate({
//     //   path: "assessmentId",
//     //   populate: { path: "Sections.Questions" },
//     // });
//     // const scheduledAssessment = await scheduledAssessmentsSchema.findById(id).populate('createdBy',"Firstname").populate('assessmentId')
//     // console.log("scheduled assesmne,", scheduledAssessment);
//     return res.status(200).send({
//       message: "Retrieved scheduled assessments",
//       success: true,
//       scheduledAssessment,
//     });
//   } catch (error) {
//     console.log("error in getting scheduled assessment from backed", error);
//     res.status(500).send({
//       message: "Failed to get scheduled assessment",
//       success: false,
//       error: error.message,
//     });
//   }
// }
// exports.getScheduledAssessmentsWithCandidates = async (req, res) => {
//   try {
//     const { assessmentId } = req.params;

//     if (!mongoose.isValidObjectId(assessmentId)) {
//       return res.status(400).json({ success: false, message: 'Invalid assessment ID' });
//     }

//     // Find all active scheduled assessments for the given assessmentId
//     const scheduledAssessments = await scheduledAssessmentsSchema.find({
//       assessmentId,
//       isActive: true,
//     })
//       .select('_id order expiryAt status createdAt')
//       .sort({ _id: -1 }); // Sort by creation date to maintain order

//     if (!scheduledAssessments.length) {
//       return res.status(200).json([]);
//     }

//     // Fetch candidate assessments for all scheduled assessments
//     const scheduledIds = scheduledAssessments.map((sa) => sa._id);
//     const candidateAssessments = await CandidateAssessment.find({
//       scheduledAssessmentId: { $in: scheduledIds },
//       isActive: true,
//     })
//       .populate('candidateId')
//       .sort({ _id: -1 });

//     // Group candidate assessments by scheduledAssessmentId
//     const schedulesWithCandidates = scheduledAssessments.map((schedule) => {
//       const candidates = candidateAssessments.filter(
//         (ca) => ca.scheduledAssessmentId.toString() === schedule._id.toString()
//       );
//       return {
//         _id: schedule._id,
//         order: schedule.order,
//         expiryAt: schedule.expiryAt,
//         status: schedule.status,
//         createdAt: schedule.createdAt,
//         candidates,
//       };
//     });

//     res.status(200).json(schedulesWithCandidates);
//   } catch (error) {
//     console.error('Error fetching scheduled assessments with candidates:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
