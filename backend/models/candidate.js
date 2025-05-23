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
    // PositionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' },
    // PositionId: [{ 
    //     type: mongoose.Schema.Types.ObjectId, 
    //     ref: 'Position'
    // }],
    skills: [
        {
            skill: String,
            experience: String,
            expertise: String,
        },
    ],
    ImageData: {
        filename: String,
        path: String,
        contentType: String,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    ownerId: String,
    tenantId: String,
}, { timestamps: true });


const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = { Candidate };