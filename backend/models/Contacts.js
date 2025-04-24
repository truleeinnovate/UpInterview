const mongoose = require('mongoose');

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


const ContactsSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    countryCode: String,
    profileId: String,
    email: String,
    phone: String,
    linkedinUrl: String,
    portfolioUrl: String,
    hourlyRate: Number,
    currentRole: String,
    industry: { type: String },
    experience: { type: String },
    gender: String,
    imageData: {
        filename: String,
        path: String,
        contentType: String,
    },
    timeZone: String,
    preferredDuration: String,
    location: String,
    introduction: String,
    resumePdf: String,
    coverLetter: String,
    
    // ranjith added have to check proeprly 
    coverLetterdescription:String,
    professionalTitle:String,
    bio:String,
    InterviewFormatWeOffer:[String],
    NoShowPolicy:String,
    PreviousExperienceConductingInterviews:String,
    PreviousExperienceConductingInterviewsYears:Number,
    ExpertiseLevel_ConductingInterviews:String,


    technologies: [String],
    isReadyForMockInterviews: String, //this feild have to check from login page this feild data is not getting properly 
    skills: [String],
    contactType: String,
    experienceYears: String,
    previousExperience: String,
    isFreelancer: String,
    expertiseLevel: String,
    language: String,
    // contactType: String,
    dateOfBirth:String,
    interviewerType: String,
    isAddedTeam: String,
    interviewType: String,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    availability: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interviewavailability' }],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    // createdDate: {
    //     type: Date,
    //     default: Date.now
    // },
    createdBy: {
        type: String,
    },
    // ModifiedDate: {
    //     type: Date,
    //     default: Date.now
    // },
    // ModifiedBy: {
    //     type: String
    // }
}, { timestamps: true});



const Contacts = mongoose.model('Contacts', ContactsSchema);

module.exports = {
    Contacts,
};