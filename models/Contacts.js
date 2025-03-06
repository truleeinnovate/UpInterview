const mongoose = require('mongoose');

const ContactsSchema = new mongoose.Schema({
    name: String,
    firstname: String,
    CountryCode: String,
    UserName: String,
    email: String,
    phone: String,
    linkedinUrl: String,
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
    // Technologys: [String],diretly add from form
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
},{ timestamps: true,strict: false  });



const Contacts = mongoose.model('Contacts', ContactsSchema);

module.exports = {
    Contacts,
};