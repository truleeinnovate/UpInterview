const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Phone: String,
    CompanyName: { type: String, required: true },
    CurrentRole: { type: String, required: true },
    Technology: { type: String, required: true },
    Location: { type: String, required: true },
    ImageData: {
        filename: String,
        path: String,
        contentType: String,
    },
    skills: [
        {
            skill: String,
            experience: String,
            expertise: String,
        },
    ],
    PreferredDuration: { type: String, required: true },
    TimeZone: { type: String, required: true },
    CreatedBy: String,
    LastModifiedById: String,
    OwnerId: String,
    orgId: String,
    CreatedDate: { type: Date, default: Date.now }
});

const teamHistorySchema = new mongoose.Schema({
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Phone: String,
    CompanyName: { type: String, required: true },
    CurrentRole: { type: String, required: true },
    Technology: { type: String, required: true },
    Location: { type: String, required: true },
    ImageData: {
        filename: String,
        path: String,
        contentType: String,
    },
    skills: [
        {
            skill: String,
            experience: String,
            expertise: String,
        },
    ],
    PreferredDuration: { type: String, required: true },
    TimeZone: { type: String, required: true },
    CreatedBy: String,
    LastModifiedById: String,
    OwnerId: String,
    orgId: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
});

const Team = mongoose.model("Team", teamSchema);
const TeamHistory = mongoose.model("TeamHistory", teamHistorySchema);

module.exports = { Team, TeamHistory };