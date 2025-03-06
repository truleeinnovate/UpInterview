
const mongoose = require("mongoose")


// Scheduled Assessment Schema
const ScheduledAssessmentSchema = new mongoose.Schema({
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'assessment', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    expiryAt: { type: Date, required: true }, // When the assessment expires and can no longer be accessed or rescheduled
    status: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled' },
    rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledAssessment' }, //In case of reschduled  
    proctoringEnabled: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive:{type:Boolean,default:true}
},{timestamps:true});


module.exports = mongoose.model('ScheduledAssessment', ScheduledAssessmentSchema)