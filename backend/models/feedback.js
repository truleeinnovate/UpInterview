const mongoose = require("mongoose");

const candidateAnswerSchema = new mongoose.Schema({
  answerType: {
    type: String,
    enum: ["partial", "correct", "wrong", "not answered"],
  },
  submittedAnswer: String,
});

const interviewerFeedbackSchema = new mongoose.Schema({
  liked: {
    type: String,
    enum: ["liked", "disliked", "none"],
    default: "none",
  },
  dislikeReason: String,
  note: String,
});

const questionFeedbackSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SelectedInterviewQuestion",
  },
  question: String, // Store the actual question text for quick reference
  candidateAnswer: candidateAnswerSchema,
  interviewerFeedback: interviewerFeedbackSchema,
  answered: {
    type: Boolean,
    default: true,
  }, // For UI radio selection (Answered/Not Answered)
  notes: String, // Additional notes about this specific question
});

const technicalCompetencyDetailsSchema = new mongoose.Schema({
  skillName: String,
  rating: Number,
  notes: String,
});

const skillsSchema = new mongoose.Schema({
  skillName: String,
  level: String,
  rating: Number,
  note: String,
  // skillType:[String]
  // changed skillType to string instead of list of strings

});

const strengthSchema = new mongoose.Schema({
  description: String,
});

const improvementAreaSchema = new mongoose.Schema({
  description: String,
});

const overallImpressionSchema = new mongoose.Schema({
  overallRating: Number,
  communicationRating: Number,
  recommendation: {
    type: String,
    enum: ["Strong Hire", "Hire", "No Hire", "Strong No Hire", "Maybe"],
    default: "Maybe",
  },
  note: String,
  cultureFit: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  willingnessToLearn: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
});

// InterviewFeedback - Main Schema
const feedbackSchema = new mongoose.Schema(
  {
    // Core identifiers
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    interviewRoundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewRounds",
      required: true,
    },

    // Related entities
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
    },
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contacts",
      required: true,
    },

    // Interview type
    isMockInterview: {
      type: Boolean,
      default: false,
    },

    // Basic Information (from UI)
    // basicInfo: {
    //   candidateName: String,
    //   position: String,
    //   roundTitle: String,
    //   interviewerName: String,
    //   interviewDate: Date,
    // },

    // Technical Skills Assessment
    technicalSkills: [skillsSchema],

    // Questions Asked
    questionsAsked: [questionFeedbackSchema],

    // Skill Ratings
    technicalCompetency: [technicalCompetencyDetailsSchema],

    // Strengths
    strengths: [String],

    // Areas for Improvement
    areasForImprovement: [String],

    // Comments
    additionalComments: String,
    generalComments: String,

    // Overall Assessment
    overallImpression: overallImpressionSchema,

    // Legacy support (for backward compatibility)
    // skills: [{
    //   skillName: String,
    //   rating: Number,
    //   note: String,
    //   skillType: String,
    // }],
    questionFeedback: [questionFeedbackSchema],

    // Metadata
    feedbackCode: String,
    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },
  },
  {
    timestamps: true,
    // Enable strict mode to ensure we don't save undefined fields
    strict: true
  }
);

const FeedbackModel = mongoose.model("interviewFeedback", feedbackSchema);

module.exports = FeedbackModel;

// const mongoose = require("mongoose");

// const candidateAnswerSchema = new mongoose.Schema({
//   answerType: {
//     type: String,
//     // enum:["partial","correct","wrong","not answered"]
//   }, // Type:"partial","correct" , "wrong","not answered"
//   submittedAnswer: String, //text or code submitted by the candidate
// });

// const interviewerFeedbackSchema = new mongoose.Schema({
//   liked: {
//     type: String,
//     enum: ["liked", "disliked", "none"],
//     default: "none",
//   }, //Options: "liked","disliked","none"(default)
//   dislikeReason: String, //if disliked,for what reason
//   // in interviewFeedbackSchema , I have added a field i.e reason
//   // comments:String,
//   // save note field into comments fields or not
//   note: String, //comments about the question or answer
// });

// const questionFeedbackSchema = new mongoose.Schema({
//   // questionId: String, //reference to question (can be string ID or full object)
//   questionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "SelectedInterviewQuestion", // must match the model name
//   },
//   candidateAnswer: candidateAnswerSchema, //candidate's answer details
//   interviewerFeedback: interviewerFeedbackSchema, // feedback from the interviewer
// });

// const skillsSchema = new mongoose.Schema({
//   skillName: String,
//   rating: Number,
//   note: String,
//   // skillType:[String]
//   // changed skillType to string instead of list of strings
//   skillType: String,
// });

// const overallImpressionSchema = new mongoose.Schema({
//   overallRating: Number,
//   communicationRating: Number,
//   recommendation: String,
//   note: String,
// });

// // InterviewFeedback
// const feedbackSchema = new mongoose.Schema(
//   {
//     tenantId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Tenant",
//       required: false,
//     }, // reference to tenant
//     ownerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Users",
//       required: false,
//     }, // reference to user who created the feedback
//     isMockInterview: {
//       type: Boolean,
//       default: false,
//     },
//     interviewRoundId: {
//       type: mongoose.Schema.Types.ObjectId,
//       // ref: "InterviewRounds",
//     }, // reference to interview session

//     candidateId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Candidate",
//       required: false,
//     }, //candidate information
//     positionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Position",
//       required: false,
//       default: undefined,
//     },
//     interviewerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Contacts",
//       required: false,
//     }, //interviewer information

//     skills: [skillsSchema], //overall skill ratings
//     questionFeedback: [questionFeedbackSchema], //feedback for each question
//     generalComments: String, //general comments about the interview session
//     overallImpression: overallImpressionSchema,
//     feedbackCode: String,
//     status: {
//       type: String,
//       enum: ["draft", "submitted"],
//       default: "submitted",
//     },
//   },
//   { timestamps: true },
// );

// const FeedbackModel = mongoose.model("interviewFeedback", feedbackSchema);

// module.exports = FeedbackModel;