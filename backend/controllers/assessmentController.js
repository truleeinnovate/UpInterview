const Assessment = require("../models/assessment");
const { isValidObjectId } = require('mongoose');
const { CandidateAssessment } = require('../models/candidateAssessment');



const mongoose = require('mongoose');
const ScheduleAssessment = require('../models/scheduledAssessmentsSchema'); // Adjust path
const { Candidate } = require('../models/candidate'); // Adjust path
const Notification = require('../models/notification'); // Adjust path if needed
const { encrypt } = require('../utils/generateOtp')
const sendEmail = require('../utils/sendEmail'); // Adjust path
const emailTemplateModel = require('../models/EmailTemplatemodel'); // Adjust path
const notificationMiddleware = require('../middlewares/notificationMiddleware');
//newassessment is using

module.exports.newAssessment = async (req, res) => {
  try {
    const {
      AssessmentTitle,
      AssessmentType,
      NumberOfQuestions,
      Position,
      DifficultyLevel,
      Duration,
      ExpiryDate,
      // Sections,
      CandidateDetails,
      Instructions,
      AdditionalNotes,
      CreatedBy,
      ownerId,
      tenantId,
      totalScore,
      passScore
    } = req.body;

    const newAssessmentData = {
      AssessmentTitle,
      // AssessmentType,
      Position,
      Duration,
      DifficultyLevel,
      NumberOfQuestions,
      ExpiryDate,
      Instructions,
      AdditionalNotes,
      CreatedBy,
      ownerId,
      tenantId,
      totalScore,
      passScore
    };

    // if (Sections && Sections.length > 0) {
    //   newAssessmentData.Sections = Sections.map(section => ({
    //     ...section,
    //     Questions: section.Questions.map(question => {
    //       const baseQuestion = {
    //         Question: question.Question,
    //         QuestionType: question.QuestionType,
    //         DifficultyLevel: question.DifficultyLevel,
    //         Score: question.Score,
    //         Answer: question.Answer,
    //         Hint: question.Hint || null,
    //         CharLimits: question.CharLimits,
    //       };

    //       if (question.QuestionType === 'MCQ' && question.Options && question.Options.length > 0) {
    //         baseQuestion.Options = question.Options;
    //       }

    //       if (question.QuestionType === 'Programming Questions' && question.ProgrammingDetails && question.ProgrammingDetails.length > 0) {
    //         baseQuestion.ProgrammingDetails = question.ProgrammingDetails;
    //       }

    //       if ((question.QuestionType === 'Short Text(Single line)' || question.QuestionType === 'Long Text(Paragraph)') && question.AutoAssessment?.enabled) {
    //         baseQuestion.AutoAssessment = {
    //           enabled: question.AutoAssessment.enabled,
    //           matching: question.AutoAssessment.matching
    //         };
    //       }

    //       return baseQuestion;
    //     })
    //   }));
    // }

    if (CandidateDetails && (CandidateDetails.includePosition || CandidateDetails.includePhone || CandidateDetails.includeSkills)) {
      newAssessmentData.CandidateDetails = CandidateDetails;
    }
    console.log("newAssessmentData", newAssessmentData)
    const assessment = new Assessment(newAssessmentData);
    console.log('assessment', assessment)
    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
//update is using

module.exports.updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("update assessmnet body", req.body)

    // Validate the ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }



    const updatedAssessment = await Assessment.findByIdAndUpdate(
      id,
      req.body,

    );

    if (!updatedAssessment) {
      return res.status(404).json({ error: "Assessment not found." });
    }

    res.status(200).json({ message: "Updated successfully.", data: updatedAssessment });
  } catch (error) {
    console.error("Error updating assessment:", error);
    res.status(500).json({ error: error.message });
  }
}


module.exports.shareAssessment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      assessmentId,
      selectedCandidates,
      linkExpiryDays = 3,
      organizationId,
      userId,
    } = req.body;

    if (!assessmentId || !mongoose.isValidObjectId(assessmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing assessment ID' });
    }

    if (!selectedCandidates || selectedCandidates.length === 0) {
      return res.status(400).json({ success: false, message: 'No candidates selected' });
    }

    // 1. Create a new ScheduleAssessment
    const scheduleCount = await ScheduleAssessment.countDocuments({ assessmentId }).session(session);
    const order = `Assessment ${scheduleCount + 1}`;

    const scheduleAssessment = new ScheduleAssessment({
      assessmentId,
      organizationId,
      expiryAt: new Date(Date.now() + linkExpiryDays * 24 * 60 * 60 * 1000),
      status: 'scheduled',
      proctoringEnabled: true,
      createdBy: userId,
      order,
    });
    await scheduleAssessment.save({ session });

    // 2. Check for existing CandidateAssessments within this ScheduledAssessment
    const existingAssessments = await CandidateAssessment.find({
      scheduledAssessmentId: scheduleAssessment._id,
      candidateId: { $in: selectedCandidates.map((c) => c._id) },
    }).session(session);

    const existingCandidateIdsSet = new Set(existingAssessments.map((a) => a.candidateId.toString()));

    // Filter out candidates who are already in this ScheduledAssessment
    const newCandidates = selectedCandidates.filter(
      (candidate) => !existingCandidateIdsSet.has(candidate._id.toString())
    );

    if (newCandidates.length === 0) {
      await session.commitTransaction();
      return res.status(200).json({
        success: true,
        message: 'All selected candidates are already assigned to this schedule',
        data: { scheduledAssessmentId: scheduleAssessment._id },
      });
    }

    // 3. Create CandidateAssessments for new candidates
    const candidateAssessments = newCandidates.map((candidate) => ({
      scheduledAssessmentId: scheduleAssessment._id,
      candidateId: candidate._id,
      status: 'pending',
      expiryAt: scheduleAssessment.expiryAt,
      isActive: true,
      assessmentLink: '',
    }));

    const insertedAssessments = await CandidateAssessment.insertMany(candidateAssessments, { session });

    // 4. Send emails and update assessment links
    const notifications = [];
    const emailTemplate = await emailTemplateModel.findOne({ category: 'assessment' }).session(session);
    if (!emailTemplate && newCandidates.length > 0) {
      throw new Error('Email template not found');
    }

    for (const candidate of newCandidates) {
      const candidateData = await Candidate.findOne({ _id: candidate._id }).session(session);
      if (!candidateData) {
        console.error(`Candidate not found for ID: ${candidate._id}`);
        continue;
      }

      const emails = Array.isArray(candidate.emails)
        ? candidate.emails
        : candidate.emails
          ? [candidate.emails]
          : candidate.Email
            ? [candidate.Email]
            : [];
      if (emails.length === 0) {
        console.error(`No valid email for candidate ID: ${candidate._id}`);
        continue;
      }

      const candidateAssessment = insertedAssessments.find(
        (ca) => ca.candidateId.toString() === candidate._id.toString()
      );
      if (!candidateAssessment) continue;

      const encryptedId = encrypt(candidateAssessment._id.toString(), 'test');
      const link = `http://localhost:3000/assessmenttest?candidateAssessmentId=${encryptedId}`;

      await CandidateAssessment.findByIdAndUpdate(
        candidateAssessment._id,
        { assessmentLink: link },
        { session }
      );
      const cleanedBody = emailTemplate.body.replace(/[\n\r]/g, '');
      // Prepare personalized email body
      const emailBody = cleanedBody
        .replace('{{candidateName}}', candidateData.LastName || 'Candidate')
        .replace('{{expiryDate}}', candidateAssessment.expiryAt.toLocaleString())
        .replace('{{assessmentLink}}', `${link}<br><br>`);

      // Send emails
      const sendEmailResponses = await Promise.all(
        emails.map((email) => sendEmail(email, emailTemplate.subject, emailBody))
      );

      const emailStatus = sendEmailResponses.every((response) => response.success)
        ? 'Success'
        : 'Failed';

      sendEmailResponses.forEach((response, index) => {
        if (!response.success) {
          console.error(`Error sending email to ${emails[index]}: ${response.message}`);
        }
      });

      notifications.push({
        toAddress: emails,
        fromAddress: 'ashrafshaik250@gmail.com',
        title: `Assessment Email ${emailStatus}`,
        body: `Email ${emailStatus} for candidate ${candidateData.LastName}.`,
        notificationType: 'email',
        object: {
          objectName: 'assessment',
          objectId: assessmentId,
        },
        status: emailStatus,
        tenantId: organizationId,
        recipientId: candidate._id,
        createdBy: userId,
        modifiedBy: userId,
      });
    }

    // Save notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications, { session });
      req.notificationData = notifications;
      await notificationMiddleware(req, res, () => { });
    }

    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: 'Assessment shared successfully',
      data: { scheduledAssessmentId: scheduleAssessment._id },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error sharing assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share assessment',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

module.exports.resendAssessmentLink = async (req, res) => {
  try {
    const { candidateAssessmentId, userId, organizationId } = req.body;

    if (!candidateAssessmentId || !mongoose.isValidObjectId(candidateAssessmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing candidate assessment ID' });
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing user ID' });
    }

    if (!organizationId || !mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing organization ID' });
    }

    // Fetch CandidateAssessment
    const candidateAssessment = await CandidateAssessment.findById(candidateAssessmentId)
      .populate('candidateId')
      .populate('scheduledAssessmentId');

    if (!candidateAssessment) {
      return res.status(404).json({ success: false, message: 'Candidate assessment not found' });
    }

    if (!candidateAssessment.isActive) {
      return res.status(400).json({ success: false, message: 'Candidate assessment is not active' });
    }

    if (!candidateAssessment.assessmentLink) {
      return res.status(400).json({ success: false, message: 'No assessment link available' });
    }

    const candidate = candidateAssessment.candidateId;
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Fetch email template
    const emailTemplate = await emailTemplateModel.findOne({ category: 'assessment' });
    if (!emailTemplate) {
      return res.status(404).json({ success: false, message: 'Email template not found' });
    }

    // Prepare email data
    const emails = Array.isArray(candidate.emails)
      ? candidate.emails
      : candidate.emails
        ? [candidate.emails]
        : candidate.Email
          ? [candidate.Email]
          : [];

    if (emails.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid email address for candidate' });
    }
    const cleanedBody = emailTemplate.body.replace(/[\n\r]/g, '');
    // Prepare personalized email body
    const emailBody = emailTemplate.body
      .replace('{{candidateName}}', candidate.LastName || 'Candidate')
      .replace('{{expiryDate}}', candidateAssessment.expiryAt.toLocaleString())
      .replace('{{assessmentLink}}', `${candidateAssessment.assessmentLink}<br><br>`);

    // Send emails
    const sendEmailResponses = await Promise.all(
      emails.map((email) => sendEmail(email, emailTemplate.subject, emailBody))
    );

    const emailStatus = sendEmailResponses.every((response) => response.success) ? 'Success' : 'Failed';

    // Log any email sending errors
    sendEmailResponses.forEach((response, index) => {
      if (!response.success) {
        console.error(`Error sending email to ${emails[index]}: ${response.message}`);
      }
    });

    // Prepare notification
    const notificationData = [{
      toAddress: emails,
      fromAddress: 'ashrafshaik250@gmail.com', // Replace with configurable value
      title: `Assessment Email ${emailStatus}`,
      body: `Email ${emailStatus} for candidate ${candidate.LastName}.`,
      notificationType: 'email',
      object: {
        objectName: 'assessment',
        objectId: candidateAssessment.scheduledAssessmentId.assessmentId,
      },
      status: emailStatus,
      tenantId: organizationId,
      recipientId: candidate._id,
      createdBy: userId,
      modifiedBy: userId,
    }];

    // Save notification via middleware
    req.notificationData = notificationData;
    await notificationMiddleware(req, res, () => { });

    res.status(200).json({
      success: true,
      message: `Assessment link resent successfully to ${candidate.LastName}`,
    });
  } catch (error) {
    console.error('Error resending assessment link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend assessment link',
      error: error.message,
    });
  }
};

// from here this is new code created by ashraf

// Get assessment results
module.exports.getAssessmentResults = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Fetch the assessment to get passScoreBy and passScore
    const assessment = await Assessment.findById(assessmentId).select('passScoreBy passScore totalScore');
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Find all active scheduled assessments for this assessment ID
    const scheduledAssessments = await ScheduleAssessment.find({
      assessmentId,
      isActive: true,
    }).select('_id order expiryAt status');

    if (!scheduledAssessments.length) {
      return res.status(200).json([]);
    }

    // Prepare response data
    const results = await Promise.all(
      scheduledAssessments.map(async (schedule) => {
        // Find completed candidate assessments for this schedule
        const candidateAssessments = await CandidateAssessment.find({
          scheduledAssessmentId: schedule._id,
          status: 'completed',
          isActive: true,
        })
          .populate('candidateId', 'FirstName LastName Email CurrentExperience')
          .select('candidateId status totalScore endedAt sections startedAt remainingTime');

        // Process candidate results with pass/fail logic
        const formattedCandidates = candidateAssessments.map((ca) => {
          let resultStatus = 'N/A';
          if (assessment.passScoreBy === 'Overall') {
            resultStatus = ca.totalScore >= (assessment.passScore || 0) ? 'pass' : 'fail';
          } else if (assessment.passScoreBy === 'Each Section') {
            const sectionResults = ca.sections.map((section) => {
              return section.totalScore >= (section.passScore || 0);
            });
            resultStatus = sectionResults.every((passed) => passed) ? 'pass' : 'fail';
          }

          return {
            id: ca._id,
            candidateId: ca.candidateId._id,
            name: `${ca.candidateId.FirstName} ${ca.candidateId.LastName}`,
            email: ca.candidateId.Email,
            experience: ca.candidateId.CurrentExperience || 0,
            totalScore: ca.totalScore,
            result: resultStatus,
            completionDate: ca.endedAt,
            startedAt: ca.startedAt,
            sections: ca.sections,
            remainingTime: ca.remainingTime,
            answeredQuestions: ca.sections.reduce((count, section) => {
              return count + section.Answers.reduce((acc, answer) => {
                return !answer.isAnswerLater ? acc + 1 : acc;
              }, 0);
            }, 0),
          };
        });

        return {
          scheduleId: schedule._id,
          order: schedule.order,
          expiryAt: schedule.expiryAt,
          status: schedule.status,
          candidates: formattedCandidates,
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// checking candidates if already assigned for assessment or not 

module.exports.getAssignedCandidates = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!mongoose.isValidObjectId(assessmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid assessment ID' });
    }

    // Find all active scheduled assessments for this assessmentId
    const scheduledAssessments = await ScheduleAssessment.find({
      assessmentId,
      isActive: true,
    }).select('_id order');

    if (!scheduledAssessments.length) {
      return res.status(200).json({ success: true, assignedCandidates: [] });
    }

    // Extract scheduledAssessmentIds
    const scheduledAssessmentIds = scheduledAssessments.map((sa) => sa._id);

    // Find all candidate assessments with these scheduledAssessmentIds
    const candidateAssessments = await CandidateAssessment.find({
      scheduledAssessmentId: { $in: scheduledAssessmentIds },
      isActive: true,
    }).select('candidateId scheduledAssessmentId');

    // Create a mapping of candidateId to their scheduledAssessment details
    const assignedCandidates = candidateAssessments.map((ca) => {
      const schedule = scheduledAssessments.find(
        (sa) => sa._id.toString() === ca.scheduledAssessmentId.toString()
      );
      return {
        candidateId: ca.candidateId.toString(),
        scheduleOrder: schedule ? schedule.order : 'Unknown',
      };
    });

    // Remove duplicates by candidateId, keeping the first occurrence
    const uniqueAssignedCandidates = Array.from(
      new Map(assignedCandidates.map((item) => [item.candidateId, item])).values()
    );

    res.status(200).json({
      success: true,
      assignedCandidates: uniqueAssignedCandidates,
    });
  } catch (error) {
    console.error('Error fetching assigned candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned candidates',
    });
  }
};