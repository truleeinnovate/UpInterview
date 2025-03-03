const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    team_member: { type: String },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts' },
    tenantId: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

module.exports = TeamMember;