const mongoose = require('mongoose');

const ContactsSchema = new mongoose.Schema({
    name: String,
    firstname: String,
    CountryCode: String,
    UserName: String,
    email: String,
    phone: String,
    linkedinUrl: String,
    portfolioUrl: String,
    currentRole: String,
    hourlyRate: Number,
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
    password: String,
    contactType: String,
    experienceYears: String,
    previousExperience: String,
    isFreelancer: String,
    expertiseLevel: String,
    language: String,
    profileId: String,
    roleId: String,
    contactType: String,
    interviewerType: String,
    isAddedTeam: String,
    interviewType: String,
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    availability: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interviewavailability' }],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    createdBy: {
        type: String,
    },
}, { timestamps: true, strict: false });

const Contacts = mongoose.model('Contacts', ContactsSchema);

module.exports = { Contacts };