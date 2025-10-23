// v1.0.0 - Ashok - changed enum values to lower case

const mongoose = require("mongoose");

// const ContactsSchema = new mongoose.Schema({
//     name: String,
//     firstname: String,
//     countryCode: String,
//     userId: String,
//     email: String,
//     phone: String,
//     linkedinUrl: String,
//     currentRole: String,
//     industry: { type: String },
//     experience: { type: String },
//     gender: String,
//     imageData: {
//         filename: String,
//         path: String,
//         contentType: String,
//     },
//     timeZone: String,
//     preferredDuration: String,
//     location: String,
//     introduction: String,
//     technology: [String],
//     skill: [String],
//     experienceYears: String,
//     previousExperience: String,
//     isFreelancer: String,
//     expertiseLevel: String,
//     contactType: String,
//     isAddedTeam: String,
//     interviewType: String,
//     availability: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InterviewAvailability' }],
//     // user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
//     createdDate: {
//         type: Date,
//         default: Date.now
//     },
//     createdBy: {
//         type: String,
//     },
//     // ModifiedDate: {
//     //     type: Date,
//     //     default: Date.now
//     // },
//     // ModifiedBy: {
//     //     type: String
//     // }
// });

// const ContactsSchema = new mongoose.Schema({
//     name: String,
//     firstname: String,
//     CountryCode: String,
//     UserName: String,
//     email: String,
//     phone: String,
//     linkedinUrl: String,
//     currentRole: String,
//     industry: { type: String },
//     experience: { type: String },
//     gender: String,
//     imageData: {
//         filename: String,
//         path: String,
//         contentType: String,
//     },
//     timeZone: String,
//     preferredDuration: String,
//     location: String,
//     introduction: String,

//     ResumePdf: String,
//     Coverletter:String,
//     Technology:[String],

//     IsReadyForMockInterviews:String, //this feild have to check from login page this feild data is not getting properly

//    skills:[String],

//     // Technologys: [String],diretly add from form
//     // password: String,
//     contactType: String,
//     experienceYears: String,
//     previousExperience: String,
//     isFreelancer: String,
//     expertiseLevel: String,
//     language: String,
//     // profileId: String,
//     // roleId: String,
//     contactType: String,
//     interviewerType: String,
//     isAddedTeam: String,
//     interviewType: String,
//     organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
//     availability: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interviewavailability' }],
//     ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
//     // createdDate: {
//     //     type: Date,
//     //     default: Date.now
//     // },
//     createdBy: {
//         type: String,
//     },
//     // ModifiedDate: {
//     //     type: Date,
//     //     default: Date.now
//     // },
//     // ModifiedBy: {
//     //     type: String
//     // }
// },{ timestamps: true,strict: false  });

const ContactsSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    countryCode: String,
    profileId: String,
    email: String,
    phone: String,
    linkedinUrl: String,
    portfolioUrl: String,
    // hourlyRate: Number,
    currentRole: String,
    industry: { type: String },
    // experience: { type: String },
    gender: String,
    imageData: {
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
      fileSize: Number,
      uploadDate: Date,
    },
    timeZone: String,
    preferredDuration: String,
    location: String,
    introduction: String,
    // resumePdf: String,
    resume: {
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
      fileSize: Number,
      uploadDate: Date,
    },
    // coverLetter: String,
    coverLetter: {
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
      fileSize: Number,
      uploadDate: Date,
    },
    // ranjith added have to check proeprly
    // coverLetterdescription: String,
    professionalTitle: String,
    bio: String,
    InterviewFormatWeOffer: [String],
    mock_interview_discount: { type: String },
    isMockInterviewSelected: { type: Boolean },
    // NoShowPolicy: { type: String },
    PreviousExperienceConductingInterviews: String,
    PreviousExperienceConductingInterviewsYears: String,
    // ExpertiseLevel_ConductingInterviews: String,
    rates: {
      junior: {
        usd: { type: Number, default: 0 },
        inr: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
      },
      mid: {
        usd: { type: Number, default: 0 },
        inr: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: false },
      },
      senior: {
        usd: { type: Number, default: 0 },
        inr: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: false },
      },
    },
    lead_rate: { type: Number },
    // expectedRatePerMockInterview: String, //newly added  Ranjith
    technologies: [String],
    isReadyForMockInterviews: String, //this feild have to check from login page this feild data is not getting properly
    skills: [String],
    contactType: String,
    experienceYears: String,
    yearsOfExperience: String,
    previousExperience: String,
    isFreelancer: String,
    expertiseLevel: String,
    language: String,
    // contactType: String,
    dateOfBirth: String,
    // interviewerType: String,
    // isAddedTeam: String,
    // interviewType: String,
    availability: [
      { type: mongoose.Schema.Types.ObjectId, ref: "InterviewAvailability" },
    ],
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    completionStatus: {
      basicDetails: { type: Boolean, default: false },
      additionalDetails: { type: Boolean, default: false },
      interviewDetails: { type: Boolean, default: false },
      availabilityDetails: { type: Boolean, default: false },
    },
    // Status field for outsource interviewers
    // v1.0.0 <------------------------------------------------------
    // status: {
    //   type: String,
    //   enum: ["New",
    //     "Under Review",
    //     "Approved",
    //     "Rejected",
    //     "Suspended",],
    //   default: 'New'
    // },
    status: {
      type: String,
      enum: ["new", "underReview", "approved", "rejected", "suspended"],
      default: "new",
    },
    // v1.0.0 ------------------------------------------------------>
    // v1.0.1  -  Venkatesh   -  Added rating field for outsource interviewers (decimal values up to 10)
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
  },
  { timestamps: true }
);

const Contacts = mongoose.model("Contacts", ContactsSchema);

module.exports = {
  Contacts,
};
