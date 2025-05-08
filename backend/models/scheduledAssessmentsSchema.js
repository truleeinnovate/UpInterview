const mongoose = require("mongoose");

const ScheduledAssessmentSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'assessment', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  expiryAt: { type: Date },
  status: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled' },
  rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledAssessment' },
  proctoringEnabled: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  order: { type: String, default: 'Assessment 1' }, // New field for display name
}, { timestamps: true });

module.exports = mongoose.model('ScheduledAssessment', ScheduledAssessmentSchema);