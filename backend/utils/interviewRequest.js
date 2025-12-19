const { default: mongoose } = require("mongoose");
const InterviewRequest = require("../models/InterviewRequest");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService");

exports.createInterviewRequest = async function createInterviewRequest(data) {
  const {
    tenantId,
    ownerId,
    scheduledInterviewId,
    interviewerType,
    dateTime,
    duration,
    interviewerId,
    candidateId,
    positionId,
    roundId,
    requestMessage,
    expiryDateTime,
    isMockInterview,
    contactId,
  } = data;

  const isInternal = interviewerType === "internal";

  const customRequestId = await generateUniqueId(
    "INT-RQST",
    InterviewRequest,
    "customRequestId",
    tenantId
  );

  const newRequest = new InterviewRequest({
    interviewRequestCode: customRequestId,
    tenantId: new mongoose.Types.ObjectId(tenantId),
    ownerId,
    scheduledInterviewId: isMockInterview
      ? undefined
      : new mongoose.Types.ObjectId(scheduledInterviewId),
    interviewerType,
    contactId: new mongoose.Types.ObjectId(contactId),
    interviewerId: new mongoose.Types.ObjectId(interviewerId),
    dateTime,
    duration,
    candidateId: isMockInterview
      ? undefined
      : new mongoose.Types.ObjectId(candidateId),
    positionId: isMockInterview
      ? undefined
      : new mongoose.Types.ObjectId(positionId),
    status: isInternal ? "accepted" : "inprogress",
    roundId: new mongoose.Types.ObjectId(roundId),
    requestMessage,
    expiryDateTime,
    isMockInterview,
  });

  await newRequest.save();
  return newRequest;
};
