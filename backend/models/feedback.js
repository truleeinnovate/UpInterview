const mongoose = require("mongoose");

const candidateAnswerSchema = new mongoose.Schema({
  answerType: {
    type: String,
    // enum:["partial","correct","wrong","not answered"]
  }, // Type:"partial","correct" , "wrong","not answered"
  submittedAnswer: String, //text or code submitted by the candidate
});

const interviewerFeedbackSchema = new mongoose.Schema({
  liked: {
    type: String,
    enum: ["liked", "disliked", "none"],
    default: "none",
  }, //Options: "liked","disliked","none"(default)
  dislikeReason: String, //if disliked,for what reason
  // in interviewFeedbackSchema , I have added a field i.e reason
  // comments:String,
  // save note field into comments fields or not
  note: String, //comments about the question or answer
});

const questionFeedbackSchema = new mongoose.Schema({
  // questionId: String, //reference to question (can be string ID or full object)
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SelectedInterviewQuestion", // must match the model name
  },
  candidateAnswer: candidateAnswerSchema, //candidate's answer details
  interviewerFeedback: interviewerFeedbackSchema, // feedback from the interviewer
});

const skillsSchema = new mongoose.Schema({
  skillName: String,
  rating: Number,
  note: String,
  // skillType:[String]
  // changed skillType to string instead of list of strings
  skillType: String,
});

const overallImpressionSchema = new mongoose.Schema({
  overallRating: Number,
  communicationRating: Number,
  recommendation: String,
  note: String,
});

// InterviewFeedback
const feedbackSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: false,
    }, // reference to tenant
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: false,
    }, // reference to user who created the feedback
    isMockInterview: {
      type: Boolean,
      default: false,
    },
    interviewRoundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewRounds",
    }, // reference to interview session

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: false,
    }, //candidate information
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      required: false,
      default: undefined,
    },
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contacts",
      required: false,
    }, //interviewer information

    skills: [skillsSchema], //overall skill ratings
    questionFeedback: [questionFeedbackSchema], //feedback for each question
    generalComments: String, //general comments about the interview session
    overallImpression: overallImpressionSchema,
    feedbackCode: String,
    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "submitted",
    },
  },
  { timestamps: true },
);

const FeedbackModel = mongoose.model("interviewFeedback", feedbackSchema);

module.exports = FeedbackModel;