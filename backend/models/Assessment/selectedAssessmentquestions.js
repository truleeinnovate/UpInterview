const mongoose = require('mongoose');
const assessmentQuestionsSchema = new mongoose.Schema({
    assessmentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "assessment", 
        required: true 
    },
    sections: [{
        sectionName: { 
            type: String, 
            required: true 
        },
        passScore: { 
            type: Number, 
            default: 0,
            // required: function() { return this.parent().assessmentId.passScoreBy === "Each Section"; }
        },
        totalScore: { 
            type: Number, 
            default: 0,
            // required: function() { return this.parent().assessmentId.passScoreBy === "Each Section"; }
        },
        questions: [{
            questionId: { 
                type: mongoose.Schema.Types.ObjectId, 
                required: true 
            },
            source: { 
                type: String, 
                enum: ["system", "custom"], 
                required: true 
            },
            snapshot: { 
                type: mongoose.Schema.Types.Mixed, 
                required: true 
            },
            score: { 
                type: Number, 
                required: true,
                min: 1 // Ensure score is at least 1
            },
            order: { 
                type: Number, 
                required: true 
            },
            customizations: { 
                type: mongoose.Schema.Types.Mixed, 
                default: null 
            }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model("SelectedAssessmentQuestions", assessmentQuestionsSchema);