// utils/Interviews/handleInterviewerRequestFlow.js

const mongoose = require('mongoose');
const { Interview } = require('../../models/Interview/Interview');
const { MockInterview } = require('../../models/Mockinterview/mockinterview');
const { createRequest } = require('../../controllers/InterviewRequestController');
const { sendOutsourceInterviewRequestEmails } = require('../../controllers/EmailsController/interviewEmailController');

/**
 * Unified function to create interview requests (works for both real & mock interviews)
 */
async function handleInterviewerRequestFlow({
  interviewId,
  round,
  selectedInterviewers = [],
  isMockInterview = false,
  // cancelOldRequests = false, // you can add back later if needed
}) {
  // 1. Get parent document
  let interview;
  if (isMockInterview) {
    interview = await MockInterview.findById(interviewId).lean();
  } else {
    interview = await Interview.findById(interviewId).lean();
  }

  if (!interview) {
    console.error(`Parent ${isMockInterview ? 'mock' : ''} interview not found:`, interviewId);
    return;
  }


  const resolveInterviewerId = (interviewer) =>
    interviewer?.contact?._id || interviewer?._id;

  // 2. Create requests for each selected interviewer
  for (const interviewer of selectedInterviewers) {
    // ── Flexible ID resolution ──
    // const interviewerId = interviewer._id || interviewer.contact?._id || interviewer.contactId;
    const interviewerId = resolveInterviewerId(interviewer);


    if (!interviewerId || !mongoose.Types.ObjectId.isValid(interviewerId)) {
      console.error('Invalid interviewer ID:', interviewer);
      continue;
    }

    // For mock interviews → contactId = interviewerId (same person)
    // const contactId = isMockInterview ? interviewerId : (interviewer.contact?._id || interviewer.contactId);

    // Fake minimal res object — only with what's needed
    const fakeRes = {
      locals: {}, // ← prevents crash
      status: () => ({ json: () => { } }),
    };

    await createRequest(
      {
        body: {
          tenantId: interview.tenantId?.toString(),
          ownerId: interview.ownerId?.toString(),
          scheduledInterviewId: isMockInterview ? undefined : interview._id,
          interviewerType: round.interviewerType || 'External', // default for mock
          interviewerId,
          // contactId,
          dateTime: round.dateTime,
          duration: round.duration,
          candidateId: isMockInterview ? undefined : interview.candidateId,
          positionId: isMockInterview ? undefined : interview.positionId,
          roundId: round._id,
          expiryDateTime: round.expiryDateTime,
          isMockInterview,
          requestMessage: round.interviewerType === 'Internal'
            ? 'Internal interview request'
            : 'External interview request',
        },
      },
      fakeRes
    );
  }

  // 3. Send emails → only for External interviewers
  if (round.interviewerType === 'External') {
    const interviewerContactIds = selectedInterviewers
      .map(i => (i.contact?._id || i.contactId || i._id)?.toString())
      .filter(Boolean);

    if (interviewerContactIds.length > 0) {
      const fakeResForEmail = {
        locals: {},
        status: () => ({ json: () => { } }),
      };

      await sendOutsourceInterviewRequestEmails(
        {
          body: {
            interviewId: interview._id,
            roundId: round._id,
            interviewerIds: interviewerContactIds,
            type: isMockInterview ? 'mockinterview' : 'interview',
          },
        },
        fakeResForEmail
      );

      console.log(`Outsource emails sent to ${interviewerContactIds.length} external interviewers`);
    }
  }
}

module.exports = { handleInterviewerRequestFlow };