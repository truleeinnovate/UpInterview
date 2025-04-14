const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    FirstName: String,
    LastName: String,
    Email: String,
    Phone: String,
    Date_Of_Birth: Date,
    Gender: String,
    HigherQualification: String,
    UniversityCollege: String,
    CurrentExperience: Number,
    RelevantExperience:Number,
    skills: [
        {
            skill: String,
            experience: String,
            expertise: String,
        },
    ],
    // ImageData: {
    //     filename: String,
    //     path: String,
    //     contentType: String,
    // },
    resume: {
        filename: String,
        path: String,
        contentType: String,
      },
      CurrentRole:String,
    CreatedBy: String,
    LastModifiedById: String,
    ownerId: String,
    tenantId: String,
    CreatedDate: { type: Date, default: Date.now },
    ModifiedDate: {
        type: Date,
        default: Date.now
    },
},{ timestamps: true,strict: false  });


const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = { Candidate };