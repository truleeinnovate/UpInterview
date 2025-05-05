// models/Groups.js
const mongoose = require('mongoose');


// const InterviewerGroupSchema = new mongoose.Schema({ 

//     tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }, 

//     name: { type: String, required: true }, // Group name 

//     description: { type: String }, // Optional description 

//     interviewers: [{ 

//         userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Internal Interviewer 

//         externalInterviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExternalInterviewer' }, // Outsourced 

//         role: { type: String, enum: ['lead', 'member', 'observer'], required: true } // Role in the group 

//     }], 

//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 

//     createdAt: { type: Date, default: Date.now }, 

//     updatedAt: { type: Date, default: Date.now } 

// }); 

// module.exports = mongoose.model('InterviewerGroup', InterviewerGroupSchema);


const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    description:{type:String},
    status: {type: String},
    numberOfUsers: {
        type: Number,
        default: 0
    },
   
    tenantId: { type: mongoose.Schema.Types.ObjectId},
}, { timestamps: true });

groupSchema.pre('save', function(next) {
    this.numberOfUsers = this.users.length;
    next();
});

module.exports = mongoose.model('InterviewerGroup', groupSchema);