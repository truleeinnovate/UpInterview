// models/InterviewerScheduling.js
// v1.0.0 - Venkatesh - Tracks interviewer scheduling slots to prevent double-booking

const mongoose = require("mongoose");

const interviewerSchedulingSchema = new mongoose.Schema(
    {
        interviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contacts",
            required: true,
            index: true,
        },
        roundId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InterviewRounds",
            required: true,
            index: true,
        },
        dateTime: {
            type: String, // Format: "DD-MM-YYYY HH:mm AM/PM - HH:mm AM/PM"
            required: true,
        },
        status: {
            type: String,
            enum: ["Scheduled", "InProgress", "Completed", "Cancelled", "NoShow", "Rescheduled"],
            default: "Scheduled",
        },
        reason: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Compound index for fast availability lookups
interviewerSchedulingSchema.index({ interviewerId: 1, status: 1 });

const InterviewerScheduling = mongoose.model(
    "InterviewerScheduling",
    interviewerSchedulingSchema
);

module.exports = { InterviewerScheduling };
