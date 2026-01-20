// v1.1.0 - Application Service for Resume Screening
// Orchestrates the entire flow: Upload -> Parse -> Deduplicate -> Screen -> Create Application

const fs = require('fs').promises;
const path = require('path');
const { Candidate } = require('../models/candidate');
const { Application } = require('../models/Application');
const { Resume } = require('../models/Resume');
const { ScreeningResult } = require('../models/ScreeningResult');
const { Position } = require('../models/Position/position');
const deduplicationService = require('./deduplicationService');
const { screenResumeWithAI } = require('./resumeScreening/aiScreeningService');
const { screenResumeWithSystem } = require('./resumeScreening/systemScreeningService');

/**
 * Process a resume upload
 * 1. Parse content
 * 2. Find or create Candidate (Deduplication)
 * 3. Save Resume
 */
async function processResumeUpload(fileObj, parserFunction, tenantId, userId) {
    try {
        // 1. Parser
        const resumeData = await parserFunction(fileObj);

        if (!resumeData) {
            throw new Error("Resume parsing returned no data");
        }

        // 2. Find or Create Candidate
        const candidateResult = await deduplicationService.findOrCreateCandidate(
            resumeData,
            tenantId,
            userId
        );

        // 3. Save Resume
        // We always save the resume, linking to candidate
        // Fixed: Correct argument order (candidateId, resumeData, file) and handle wrapper result
        const resumeResult = await deduplicationService.saveResume(
            candidateResult.candidate._id,
            resumeData,
            fileObj
        );

        if (!resumeResult.success) {
            throw new Error("Failed to save resume: " + resumeResult.error);
        }

        return {
            success: true,
            candidate: candidateResult.candidate,
            resume: resumeResult.resume, // Extract actual resume doc
            isNewCandidate: candidateResult.isNew,
            multipleMatches: candidateResult.multipleMatches,
            candidates: candidateResult.candidates
        };

    } catch (error) {
        console.error("Process Resume Upload Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Screen Candidate and Create Application
 * 1. Determine screening method (AI or System)
 * 2. Perform screening
 * 3. Save Screening Result
 * 4. Create/Update Application
 */
async function screenAndCreateApplication(candidateId, positionId, resumeId, method = 'system', tenantId, userId) {
    try {
        const candidate = await Candidate.findById(candidateId);
        const resume = await Resume.findById(resumeId);
        const position = await Position.findById(positionId);

        if (!candidate || !resume || !position) {
            const missing = [];
            if (!candidate) missing.push(`Candidate (${candidateId})`);
            if (!resume) missing.push(`Resume (${resumeId})`);
            if (!position) missing.push(`Position (${positionId})`);
            throw new Error(`Missing required entities for screening: ${missing.join(', ')}`);
        }

        // Prepare data for screening
        // Resume model stores parsed data in 'parsedJson' or mapped fields. 
        // For now, we reconstruct simple object since schema might have specific fields
        // But wait, Resume schema has skills array of objects. 
        // Screening services expect { skills: ["java"], experience: "5 years" ... }

        const resumeData = {
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone,
            // Fallback if resume.skills is [ { skill: "Java" } ] mapped above.
            skills: resume.skills ? resume.skills.map(s => s.skill) : [],
            experience: resume.CurrentExperience ? `${resume.CurrentExperience} years` : "Not specified",
            education: resume.HigherQualification ? [{ degree: resume.HigherQualification }] : [],
            rawText: resume.resume?.text || "" // If we stored it
        };

        let scoringResult;
        let insights = { strengths: [], concerns: [], summary: "" };
        let finalScore = 0;
        let finalSkillMatch = 0;
        let recommendation = "REVIEW";

        // Perform Screening
        if (method === 'ai_assistant' || method === 'ai_claude') {
            const aiResult = await screenResumeWithAI(resumeData, position);
            if (aiResult.success) {
                scoringResult = aiResult.data;
                insights = {
                    strengths: aiResult.data.strengths || [],
                    concerns: aiResult.data.weaknesses || [],
                    summary: aiResult.data.summary || ""
                };
                finalScore = aiResult.data.score || 0;
                finalSkillMatch = aiResult.data.skillMatch || 0;
                recommendation = aiResult.data.recommendation || "REVIEW";
            } else {
                // Fallback to system or just fail?
                console.warn("AI Screening failed, falling back to system:", aiResult.error);
                // Let's fail for now to be explicit, or could fallback
                throw new Error("AI Screening Service Unavailable: " + aiResult.error);
            }
        } else {
            // System / Manual
            const systemResult = await screenResumeWithSystem(resumeData, position);

            if (systemResult.success) {
                scoringResult = systemResult.scoringResult;
                insights = systemResult.insights;
                finalScore = scoringResult.score;

                // Map skillMatch string to number roughly? 
                if (scoringResult.skillMatch === 'High') finalSkillMatch = 90;
                else if (scoringResult.skillMatch === 'Medium') finalSkillMatch = 70;
                else finalSkillMatch = 40;

                if (finalScore >= 80) recommendation = "PROCEED";
                else if (finalScore >= 40) recommendation = "HOLD";
                else recommendation = "REJECT";
            } else {
                // Capture error in insights if screening failed (e.g. no skills in position)
                insights.summary = systemResult.error || "Screening could not be completed";
                insights.concerns.push(systemResult.error || "Screening failed");
                recommendation = "HOLD"; // Default to HOLD if screening fails
                // Ensure scoringResult is safer
                scoringResult = {
                    score: 0,
                    skillMatch: 'Low',
                    matchedSkills: [],
                    missingSkills: []
                };
            }
        }

        // Save Screening Result
        const screening = new ScreeningResult({
            resumeId,
            positionId,
            candidateId,
            tenantId,
            score: finalScore,
            skillMatch: finalSkillMatch,
            recommendation,
            matchedSkills: scoringResult.matchedSkills?.map(s => s.skill || s) || [],
            missingSkills: scoringResult.missingRequiredSkills || scoringResult.missingSkills || [],
            screeningNotes: JSON.stringify(insights),
            screenedBy: userId,
            screenedAt: new Date()
        });

        await screening.save();

        // Create or Update Application
        let application = await Application.findOne({ candidateId, positionId });

        if (!application) {
            application = new Application({
                tenantId,
                positionId,
                candidateId,
                status: 'SCREENED', // Fixed: Uppercase status matching Mongoose schema enum
                screeningScore: finalScore,
                screeningDecision: recommendation,
                appliedAt: new Date()
            });
        } else {
            // Update existing application
            application.status = 'SCREENED'; // Fixed: Uppercase status matching Mongoose schema enum
            application.screeningScore = finalScore;
            application.screeningDecision = recommendation;
            application.updatedAt = new Date();
        }

        await application.save();

        return {
            success: true,
            screening,
            application,
            score: finalScore,
            skillMatch: finalSkillMatch
        };

    } catch (error) {
        console.error("Screen and Create App Error:", error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    processResumeUpload,
    screenAndCreateApplication
};
