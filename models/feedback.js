
const mongoose = require("mongoose");


const candidateAnswerSchema  = new mongoose.Schema({
  answerType:{
    type:String,
    // enum:["partial","correct","wrong","not answered"]
  }, // Type:"partial","correct" , "wrong","not answered"
  submittedAnswer:String, //text or code submitted by the candidate
})

const interviewerFeedbackSchema = new mongoose.Schema({
  liked:{
    type:String,
    enum:["liked","disliked","none"],
    default:"none"
  }, //Options: "liked","disliked","none"(default)
  dislikeReason:String, //if disliked,for what reason
  // in interviewFeedbackSchema , I have added a field i.e reason
  // comments:String,
  // save note field into comments fields or not
  note:String, //comments about the question or answer
})



const questionFeedbackSchema = new mongoose.Schema({
  questionId:String, //reference to question
  candidateAnswer:candidateAnswerSchema, //candidate's answer details
  interviewerFeedback:interviewerFeedbackSchema // feedback from the interviewer
})



const skillsSchema = new mongoose.Schema({
  skillName: String,
  rating: Number,
  note: String,
  // skillType:[String]
  // changed skillType to string instead of list of strings
  skillType:String
});

const overallImpressionSchema = new mongoose.Schema({
  overallRating: Number,
  recommendation: String,
  note: String,
});

// InterviewFeedback
const feedbackSchema = new mongoose.Schema(
  {
    tenantId:String, // reference to  tenant
    interviewId:String, // reference to interview session
    candidateId: String, //candidate information
    interviewerId:String, //interviewer information
    skills: [skillsSchema], //overall skill ratings
    questionFeedback:[questionFeedbackSchema], //feedback for each question
    generalComments:String, //general comments about the interview session
    overallImpression: overallImpressionSchema,
  },
  { timestamps: true }
);

const FeedbackModel = mongoose.model("interviewFeedback", feedbackSchema);

module.exports = FeedbackModel;
