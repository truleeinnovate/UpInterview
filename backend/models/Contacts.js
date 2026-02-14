// v1.0.0 - Ashok - changed enum values to lower case

const mongoose = require("mongoose");

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
    currentRole: String,
    industry: { type: String },
    company: String,
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
    resume: {
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
      fileSize: Number,
      uploadDate: Date,
    },
    coverLetter: {
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
      fileSize: Number,
      uploadDate: Date,
    },
    // ranjith added have to check proeprly
    professionalTitle: String,
    bio: String,
    InterviewFormatWeOffer: [String],
    mock_interview_discount: { type: String },
    isMockInterviewSelected: { type: Boolean },
    PreviousExperienceConductingInterviews: String,
    PreviousExperienceConductingInterviewsYears: String,
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
    // technologies: [String],
    isReadyForMockInterviews: String, //this feild have to check from login page this feild data is not getting properly
    skills: [String],
    contactType: String,
    experienceYears: String,
    yearsOfExperience: String,
    previousExperience: String,
    isFreelancer: String,
    language: String,
    // contactType: String,
    dateOfBirth: String,
    higherQualification: String,
    universityCollege: String,
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
      default: null,
    },
  },
  { timestamps: true }
);

// added by mansoor for indexes to fetch the data fast
ContactsSchema.index({ tenantId: 1, ownerId: 1 });
ContactsSchema.index({ email: 1 });
ContactsSchema.index({ status: 1 });

const Contacts = mongoose.model("Contacts", ContactsSchema);

module.exports = {
  Contacts,
};
