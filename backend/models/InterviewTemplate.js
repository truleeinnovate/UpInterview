const mongoose = require('mongoose');

const RoundSchema = new mongoose.Schema({
    
        roundName: { type: String, required: true }, // e.g., "Technical Round"
        assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
        interviewDuration: { type: Number }, // Changed to String and made optional
        instructions: { type: String }, // Special notes for the round
        interviewMode: { type: String }, // Made optional
        // minimumInterviewers: { type: String }, // Changed to String and made optional
        // selectedInterviewerIds: [{ type: String }], // Made array items optional
        interviewerType: { type: String}, // Made optional
        selectedInterviewersType: { type: String }, // user or group
        sequence: {type:Number},
        // interviewerGroupId:
        //  { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewerGroup' },
        interviewers: [
           
                 mongoose.Schema.Types.ObjectId, 
         
    ],
        interviewQuestionsList: [{
                        questionId: { type: mongoose.Schema.Types.Mixed,  },
                        // required: true
                        snapshot: { type: mongoose.Schema.Types.Mixed, }
                        // required: true
                    }],
                    
    
}, { timestamps: true });
 
// Interview Template Schema
const InterviewTemplateSchema = new mongoose.Schema({
    templateName: { type: String, required: true }, // Template name
    label: { type: String, required: true }, // Template label
    tenantId: { type: String, required: true }, // Changed to String for now
    description: { type: String }, // Template purpose
    status: { type: String, enum: ['active', 'draft', 'inactive','archived'], default: 'active' },
    rounds: [RoundSchema],
     createdBy: { type: String, required: true }
}, { timestamps: true });
 
module.exports = mongoose.model('InterviewTemplate', InterviewTemplateSchema);