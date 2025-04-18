const mongoose = require('mongoose');

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
    technologies: [String],
    isReadyForMockInterviews: String, //this feild have to check from login page this feild data is not getting properly 
    skills: [String],
    contactType: String,
    experienceYears: String,
    previousExperience: String,
    isFreelancer: String,
    expertiseLevel: String,
    language: String,
    contactType: String,
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