// v1.0.0  -  Ashraf  -  fixed name  scheduleassessment to assessment schema,added extend,cancel,schedule status api code based on policy
const { CandidateAssessment } = require("../models/candidateAssessment");
const { generateOTP } = require('../utils/generateOtp')
const Otp = require("../models/Otp");
const mongoose = require('mongoose');
const cron = require('node-cron');
// <-------------------------------v1.0.0
const ScheduleAssessment = require("../models/assessmentsSchema"); 
// ------------------------------v1.0.0 >

// exports.updateCandidateAssessment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find and update the document, or return 404 if not found
//     const updateResult = await CandidateAssessment.findOneAndUpdate(
//       { _id: id },
//       req.body,
//       { new: true } // This returns the updated document
//     );

//     // If no document was found, return a 404
//     if (!updateResult) {
//       return res.status(404).send({
//         success: false,
//         message: "Candidate assessment not found",
//       });
//     }

//     res.status(200).send({
//       message: "Candidate assessment updated successfully",
//       success: true,
//       updatedAssessment: updateResult, // Send only the updated document
//     });
//   } catch (error) {
//     console.log(
//       "Error in updating candidate assessment status:",
//       error.message
//     );
//     return res.status(500).send({
//       success: false,
//       message: "Failed to update candidate assessment status",
//       error: error.message,
//     });
//   }
// }


// exports.updateAnswersToDb = async (req, res) => {
//   try {
//     const { candidateAssessmentId, sectionIndex, questionId } = req.params;
//     const { SectionName, Answers, passScore, sectionResult, assessmentTotalScore, totalScore, sectionTotalScore } = req.body;
//     const { answer, isCorrect, score, isAnswerLater } = Answers;

//     console.log("Request Body:", req.body);

//     // Check if the CandidateAssessment exists
//     let candidateAssessment = await CandidateAssessment.findById(candidateAssessmentId);

//     if (!candidateAssessment) {
//       return res.status(404).json({ message: 'Candidate assessment not found' });
//     }

//     // Check if the section exists
//     const section = candidateAssessment.sections[sectionIndex];

//     if (!section) {
//       console.log("Section does not exist, creating a new one...");
//       // Add a new section if it doesn't exist
//       candidateAssessment.sections.push({
//         SectionName,
//         Answers: [
//           {
//             questionId,
//             answer,
//             isCorrect,
//             score,
//             isAnswerLater,
//             submittedAt: new Date(),
//           },
//         ],
//         totalScore: sectionTotalScore,
//         passScore,
//         sectionResult,
//       });
//     } else {
//       console.log("Section exists, checking for the answer...");

//       // Check if the answer already exists in the section
//       const answerIndex = section.Answers.findIndex(
//         (ans) => ans.questionId.toString() === questionId
//       );

//       if (answerIndex === -1) {
//         // If the answer doesn't exist, add a new one
//         console.log("Answer does not exist, adding a new one...");
//         section.Answers.push({
//           questionId,
//           answer,
//           isCorrect,
//           score,
//           isAnswerLater,
//           submittedAt: new Date(),
//         });
//       } else {
//         // If the answer exists, update the existing one
//         console.log("Answer exists, updating the existing one...");
//         section.Answers[answerIndex].answer = answer;
//         section.Answers[answerIndex].isCorrect = isCorrect;
//         section.Answers[answerIndex].score = score;
//         section.Answers[answerIndex].isAnswerLater = isAnswerLater;
//         section.Answers[answerIndex].submittedAt = new Date();
//       }

//       // Update section-level fields
//       section.totalScore = sectionTotalScore;
//       section.passScore = passScore;
//       section.sectionResult = sectionResult;
//     }

//     candidateAssessment.totalScore = assessmentTotalScore
//     // Save the updated CandidateAssessment document
//     const updatedAssessment = await candidateAssessment.save();

//     // Send the updated document back to the client
//     res.json(updatedAssessment);
//   } catch (error) {
//     console.error('Error updating assessment:', error);
//     res.status(500).json({ message: 'Internal Server Error', error });
//   }
// }

// exports.autoSaveAnswers = async (req, res) => {
//   try {
//     const { candidateAssessmentId } = req.params;
//     const { remainingTime, lastSelectedSection } = req.body;

//     // Update the CandidateAssessment with the current progress
//     const updatedAssessment = await CandidateAssessment.findByIdAndUpdate(
//       candidateAssessmentId,
//       {
//         $set: req.body
//       },
//       { new: true } // Return the updated document
//     );

//     if (!updatedAssessment) {
//       return res.status(404).json({ message: 'Candidate assessment not found' });
//     }

//     res.json({ message: 'Progress saved successfully', updatedAssessment });
//   } catch (error) {
//     console.error('Error saving progress:', error);
//     res.status(500).json({ message: 'Internal Server Error', error });
//   }
// }






exports.getCandidateAssessmentBasedOnId = async(req,res)=>{
  try {
    const {id}= req.params 
    if (!id){
      return res.status(400).send({message:"id is missing"})
    }
    const document = await CandidateAssessment.findById(id) 
    if (!document){
      return res.status(400).send({message:`no document found for given candidate assessment id:${id}`})
    }
    return res.status(200).send({
      message:"Retrieved candidate Assessment",
      success:true,
      candidateAssessment:document
    })
  } catch (error) {
    res.status(500).send({
      success:false,
      message:"Failed to get candidate assessment details",
      error:error.message
    })
  }
}

exports.verifyOtp = async (req, res) => {
  const { candidateAssessmentId, otp } = req.body;

  if (!candidateAssessmentId || !otp) {
    return res.status(400).json({
      isValid: false,
      message: 'Missing required fields.',
    });
  }

  try {
    const storedOtp = await Otp.findOne({ candidateAssessmentId });
    if (!storedOtp) {
      return res.status(404).json({
        isValid: false,
        message: 'Invalid OTP. Please request a new one.',
      });
    }

    if (new Date() > storedOtp.expiresAt) {
      await Otp.findByIdAndDelete(storedOtp._id);
      return res.status(410).json({
        isValid: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    const isValid = String(storedOtp.otp) === String(otp);
    if (isValid) {
      await Otp.findByIdAndDelete(storedOtp._id);
      return res.status(200).json({
        isValid: true,
        message: 'OTP is valid.',
      });
    } else {
      return res.status(400).json({
        isValid: false,
        message: 'Invalid OTP.',
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      isValid: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

exports.submitCandidateAssessment = async (req, res) => {
  try {
    const {
      candidateAssessmentId,
      scheduledAssessmentId,
      candidateId,
      status,
      sections,
      totalScore,
      submittedAt,
    } = req.body;

    // Validate required fields (allow 0 for totalScore)
    if (
      !candidateAssessmentId ||
      !sections ||
      totalScore === undefined ||
      !submittedAt
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find the existing candidate assessment by candidateAssessmentId
    let candidateAssessment = await CandidateAssessment.findById(
      new mongoose.Types.ObjectId(candidateAssessmentId)
    );

    if (!candidateAssessment) {
      return res.status(404).json({
        success: false,
        message: "Candidate assessment not found",
      });
    }

    // Process sections and calculate results
    let hasFailedSection = false;
    const processedSections = sections.map(section => {
      // Calculate section score based on answers
      const sectionScore = section.Answers.reduce((total, answer) => {
        // For interview questions, we might not have a correct answer to check against
        // So we'll just sum up the scores from the answers
        return total + (answer.score || 0);
      }, 0);

      // Determine section result
      const sectionResult = sectionScore >= (section.passScore || 0) ? 'pass' : 'fail';
      
      // Update overall result if any section fails
      if (sectionResult === 'fail') {
        hasFailedSection = true;
      }

      return {
        ...section,
        totalScore: sectionScore,
        sectionResult
      };
    });

    // Update the candidate assessment with processed data
    candidateAssessment.status = status || 'completed';
    candidateAssessment.sections = processedSections;
    candidateAssessment.totalScore = totalScore;
    candidateAssessment.submittedAt = submittedAt;
    candidateAssessment.endedAt = new Date();
    candidateAssessment.overallResult = hasFailedSection ? 'fail' : 'pass';

    // Save the updated assessment
    const updatedAssessment = await candidateAssessment.save();

    return res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      data: updatedAssessment,
    });
  } catch (error) {
    console.error("Error submitting candidate assessment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit assessment",
      error: error.message,
    });
  }
};
// ------------------------------v1.0.0 >

// Extend candidate assessment expiry date
exports.extendCandidateAssessment = async (req, res) => {
  try {
    const { candidateAssessmentIds, extensionDays } = req.body;

    if (!candidateAssessmentIds || !Array.isArray(candidateAssessmentIds) || candidateAssessmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid candidate assessment IDs",
      });
    }

    if (!extensionDays || extensionDays < 1 || extensionDays > 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid extension days (1-10 days)",
      });
    }

    const results = [];
    const errors = [];

    for (const candidateAssessmentId of candidateAssessmentIds) {
      try {
        const candidateAssessment = await CandidateAssessment.findById(candidateAssessmentId);
        
        if (!candidateAssessment) {
          errors.push(`Candidate assessment not found: ${candidateAssessmentId}`);
          continue;
        }

        // Check if assessment can be extended (not completed, cancelled, or already extended)
        // Allow only 1 extension per assessment
        if (['completed', 'cancelled', 'extended'].includes(candidateAssessment.status)) {
          errors.push(`Assessment ${candidateAssessmentId} cannot be extended (status: ${candidateAssessment.status})`);
          continue;
        }

        // Check if within extension window (24-72 hours before expiry)
        const now = new Date();
        const expiryDate = new Date(candidateAssessment.expiryAt);
        const timeUntilExpiry = expiryDate.getTime() - now.getTime();
        const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);

        // Allow extension only if within 24-72 hours before expiry
        if (hoursUntilExpiry < 24 || hoursUntilExpiry > 72) {
          errors.push(`Assessment ${candidateAssessmentId} can only be extended 24-72 hours before expiry. Current time until expiry: ${Math.round(hoursUntilExpiry)} hours`);
          continue;
        }

        // Calculate new expiry date
        const currentExpiry = new Date(candidateAssessment.expiryAt);
        const newExpiry = new Date(currentExpiry.getTime() + (extensionDays * 24 * 60 * 60 * 1000));

        // Update the candidate assessment
        candidateAssessment.expiryAt = newExpiry;
        candidateAssessment.status = 'extended';
        
        await candidateAssessment.save();

        results.push({
          candidateAssessmentId,
          newExpiryDate: newExpiry,
          status: 'extended'
        });

      } catch (error) {
        console.error(`Error extending assessment ${candidateAssessmentId}:`, error);
        errors.push(`Failed to extend assessment ${candidateAssessmentId}: ${error.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully extended ${results.length} assessment(s)`,
      data: {
        extended: results,
        errors: errors
      }
    });

  } catch (error) {
    console.error("Error extending candidate assessments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to extend assessments",
      error: error.message,
    });
  }
};

// Cancel candidate assessments
exports.cancelCandidateAssessments = async (req, res) => {
  try {
    const { candidateAssessmentIds } = req.body;

    if (!candidateAssessmentIds || !Array.isArray(candidateAssessmentIds) || candidateAssessmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid candidate assessment IDs",
      });
    }

    const results = [];
    const errors = [];

    for (const candidateAssessmentId of candidateAssessmentIds) {
      try {
        const candidateAssessment = await CandidateAssessment.findById(candidateAssessmentId);
        
        if (!candidateAssessment) {
          errors.push(`Candidate assessment not found: ${candidateAssessmentId}`);
          continue;
        }

        // Check if assessment can be cancelled (not already completed or cancelled)
        // Allow cancelling extended assessments (1 chance to cancel)
        if (['completed', 'cancelled'].includes(candidateAssessment.status)) {
          errors.push(`Assessment ${candidateAssessmentId} cannot be cancelled (status: ${candidateAssessment.status})`);
          continue;
        }

        // Update the candidate assessment status
        candidateAssessment.status = 'cancelled';
        candidateAssessment.isActive = false;
        
        await candidateAssessment.save();

        results.push({
          candidateAssessmentId,
          status: 'cancelled'
        });

      } catch (error) {
        console.error(`Error cancelling assessment ${candidateAssessmentId}:`, error);
        errors.push(`Failed to cancel assessment ${candidateAssessmentId}: ${error.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully cancelled ${results.length} assessment(s)`,
      data: {
        cancelled: results,
        errors: errors
      }
    });

  } catch (error) {
    console.error("Error cancelling candidate assessments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel assessments",
      error: error.message,
    });
  }
};

// Function to update schedule assessment status based on candidate assessment statuses
exports.updateScheduleAssessmentStatus = async (scheduleAssessmentId) => {
  try {
    const scheduleAssessment = await ScheduleAssessment.findById(scheduleAssessmentId);
    if (!scheduleAssessment) {
      return null;
    }

    // Get all candidate assessments for this schedule
    const candidateAssessments = await CandidateAssessment.find({
      scheduledAssessmentId: scheduleAssessmentId
    });

    if (!candidateAssessments || candidateAssessments.length === 0) {
      return scheduleAssessment;
    }

    // Get all candidate statuses
    const candidateStatuses = candidateAssessments.map(ca => ca.status);
    const uniqueStatuses = [...new Set(candidateStatuses)];
    
    let newScheduleStatus = scheduleAssessment.status;

    // Check if all candidates have final statuses (completed, cancelled, expired, failed, pass)
    const finalStatuses = ['completed', 'cancelled', 'expired', 'failed', 'pass'];
    const allHaveFinalStatus = candidateStatuses.every(status => finalStatuses.includes(status));

    if (allHaveFinalStatus) {
      // All candidates have final statuses, determine schedule status
      if (uniqueStatuses.length === 1) {
        // All candidates have the same status
        const singleStatus = uniqueStatuses[0];
        if (['completed', 'pass'].includes(singleStatus)) {
          newScheduleStatus = 'completed';
        } else if (singleStatus === 'cancelled') {
          newScheduleStatus = 'cancelled';
        } else if (singleStatus === 'expired') {
          newScheduleStatus = 'expired';
        } else if (singleStatus === 'failed') {
          newScheduleStatus = 'failed';
        }
      } else {
        // Mixed final statuses - determine based on priority
        if (candidateStatuses.some(s => ['completed', 'pass'].includes(s))) {
          newScheduleStatus = 'completed';
        } else if (candidateStatuses.every(s => ['cancelled', 'expired'].includes(s))) {
          if (candidateStatuses.every(s => s === 'cancelled')) {
            newScheduleStatus = 'cancelled';
          } else if (candidateStatuses.every(s => s === 'expired')) {
            newScheduleStatus = 'expired';
          } else {
            newScheduleStatus = 'cancelled';
          }
        } else if (candidateStatuses.some(s => s === 'failed')) {
          newScheduleStatus = 'failed';
        }
      }
    } else {
      // Some candidates still have pending statuses, keep as scheduled
      newScheduleStatus = 'scheduled';
    }

    // Update schedule status if it changed
    if (newScheduleStatus !== scheduleAssessment.status) {
      scheduleAssessment.status = newScheduleStatus;
      await scheduleAssessment.save();
    }

    return scheduleAssessment;
  } catch (error) {
    console.error(`Error updating schedule assessment status for ${scheduleAssessmentId}:`, error);
    throw error;
  }
};

// API endpoint to update schedule assessment status
exports.updateScheduleStatus = async (req, res) => {
  try {
    const { scheduleAssessmentId } = req.params;

    if (!scheduleAssessmentId) {
      return res.status(400).json({
        success: false,
        message: "Schedule assessment ID is required",
      });
    }

    const updatedSchedule = await exports.updateScheduleAssessmentStatus(scheduleAssessmentId);
    
    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule assessment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Schedule assessment status updated successfully",
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating schedule assessment status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update schedule assessment status",
      error: error.message,
    });
  }
};



// Function to automatically check and update expired candidate assessments
exports.checkAndUpdateExpiredAssessments = async (req, res) => {
  try {
    const now = new Date();
    
    // Find all candidate assessments that have expired but status is not updated
    const expiredAssessments = await CandidateAssessment.find({
      expiryAt: { $lt: now },
      status: { $nin: ['completed', 'cancelled', 'expired', 'failed', 'pass', 'extended'] }
    }).populate('candidateId');

    const updatedAssessments = [];
    const failedUpdates = [];

    for (const assessment of expiredAssessments) {
      try {
        // Update status to expired
        assessment.status = 'expired';
        assessment.isActive = false;
        await assessment.save();
        
        updatedAssessments.push({
          id: assessment._id,
          candidateName: `${assessment.candidateId?.FirstName || ''} ${assessment.candidateId?.LastName || ''}`.trim(),
          email: assessment.candidateId?.Email || 'N/A',
          expiredAt: assessment.expiryAt
        });

        // Update schedule assessment status after candidate assessment update
        await exports.updateScheduleAssessmentStatus(assessment.scheduledAssessmentId);
      } catch (error) {
        failedUpdates.push({
          id: assessment._id,
          error: error.message
        });
      }
    }

    // Update all schedule assessments to ensure consistency
    const scheduleAssessments = await ScheduleAssessment.find({}).populate({
      path: 'candidates',
      populate: { path: 'candidateId' }
    });

    const updatedSchedules = [];
    const failedScheduleUpdates = [];

    for (const schedule of scheduleAssessments) {
      try {
        const updatedSchedule = await exports.updateScheduleAssessmentStatus(schedule._id);
        if (updatedSchedule && updatedSchedule.status !== schedule.status) {
          updatedSchedules.push({
            id: schedule._id,
            order: schedule.order,
            oldStatus: schedule.status,
            newStatus: updatedSchedule.status,
            candidateCount: schedule.candidates?.length || 0
          });
        }
      } catch (error) {
        failedScheduleUpdates.push({
          id: schedule._id,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Expiry check completed successfully',
      data: {
        expiredAssessments: {
          updated: updatedAssessments.length,
          failed: failedUpdates.length,
          details: updatedAssessments,
          failures: failedUpdates
        },
        scheduleAssessments: {
          updated: updatedSchedules.length,
          failed: failedScheduleUpdates.length,
          details: updatedSchedules,
          failures: failedScheduleUpdates
        }
      }
    });

  } catch (error) {
    console.error('Error checking expired assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check expired assessments',
      error: error.message
    });
  }
};

//corn runScheduleAssessmentStatusUpdateJob and updateAllScheduleStatuse both is same code(ashraf)
// API endpoint to update all schedule assessment statuses
exports.updateAllScheduleStatuses = async (req, res) => {
  try {
    const scheduleAssessments = await ScheduleAssessment.find({});
    const results = [];
    const errors = [];

    for (const schedule of scheduleAssessments) {
      try {
        const updatedSchedule = await exports.updateScheduleAssessmentStatus(schedule._id);
        if (updatedSchedule && updatedSchedule.status !== schedule.status) {
          results.push({
            scheduleAssessmentId: schedule._id,
            oldStatus: schedule.status,
            newStatus: updatedSchedule.status
          });
        }
      } catch (error) {
        errors.push({
          scheduleAssessmentId: schedule._id,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${results.length} schedule assessment(s)`,
      data: { updated: results, errors }
    });
  } catch (error) {
    console.error("Error updating all schedule assessment statuses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update schedule assessment statuses",
      error: error.message,
    });
  }
};



// Function to run the schedule assessment status update job
const runScheduleAssessmentStatusUpdateJob = async () => {
  try {
    console.log('Starting automated schedule assessment status update job...');
    
    const scheduleAssessments = await ScheduleAssessment.find({});
    const results = [];
    const errors = [];

    for (const schedule of scheduleAssessments) {
      try {
        const updatedSchedule = await exports.updateScheduleAssessmentStatus(schedule._id);
        if (updatedSchedule && updatedSchedule.status !== schedule.status) {
          results.push({
            scheduleAssessmentId: schedule._id,
            oldStatus: schedule.status,
            newStatus: updatedSchedule.status
          });
        }
      } catch (error) {
        errors.push({
          scheduleAssessmentId: schedule._id,
          error: error.message
        });
      }
    }

    console.log(`Automated schedule assessment status update completed. Updated: ${results.length}, Errors: ${errors.length}`);
    
    if (results.length > 0) {
      console.log('Updated schedule assessments:', results);
    }
    
    if (errors.length > 0) {
      console.error('Errors during update:', errors);
    }

  } catch (error) {
    console.error('Error in automated schedule assessment status update job:', error);
  }
};

// Cron job to automatically update schedule assessment statuses every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  runScheduleAssessmentStatusUpdateJob();
});

// */5 * * * * means: "Run every 5 minutes"
// You can adjust this schedule as needed:
// */1 * * * * = every minute (for testing)
// 0 */1 * * * = every hour
// 0 0 * * * = once daily at midnight

// Run immediately on file load for initial check
console.log('Running initial schedule assessment status update check at startup...');
runScheduleAssessmentStatusUpdateJob();

// ------------------------------v1.0.0 >