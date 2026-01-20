// v1.1.0 - System-based Resume Screening Service (Manual Calculation)

const { calculateCandidateScore } = require("../../utils/resumeScoring");

/**
 * Screen a resume using system/manual calculation (no AI)
 * @param {Object} resumeData - Parsed resume data
 * @param {Object} position - Position with requirements
 * @returns {Object} System screening result
 */
async function screenResumeWithSystem(resumeData, position) {
    try {
        // Calculate skill matching
        const scoringResult = calculateCandidateScore(resumeData, position);

        if (!scoringResult) {
            return {
                success: false,
                error: "Failed to calculate score. Position may not have target skills defined.",
            };
        }

        // Generate insights based on the scoring
        const insights = generateSystemInsights(resumeData, scoringResult, position);

        return {
            success: true,
            scoringResult,
            insights,
        };
    } catch (error) {
        console.error("System screening error:", error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Generate insights from system screening
 */
function generateSystemInsights(resumeData, scoringResult, position) {
    const insights = {
        strengths: [],
        concerns: [],
        summary: "",
    };

    const targetSkills = position.skills || position.targetSkills || [];
    const matchedCount = scoringResult.matchedSkills.length;

    // Calculate required skills count safely
    const totalRequired = targetSkills.filter(
        (s) => (s.requirement_level || s.requirementLevel) === "REQUIRED"
    ).length;

    const matchedRequired = scoringResult.matchedSkills.filter((s) => s.level === "REQUIRED").length;

    // Strengths
    if (matchedRequired === totalRequired && totalRequired > 0) {
        insights.strengths.push(`Meets all ${totalRequired} required skills for the position`);
    } else if (matchedRequired > 0) {
        insights.strengths.push(`Matches ${matchedRequired} of ${totalRequired} required skills`);
    }

    if (resumeData.skills && resumeData.skills.length >= 10) {
        insights.strengths.push(
            `Demonstrates broad technical knowledge with ${resumeData.skills.length} identified skills`
        );
    }

    if (resumeData.experience && resumeData.experience !== "Not specified") {
        insights.strengths.push(`Has ${resumeData.experience} of relevant experience`);
    }

    if (resumeData.certifications && resumeData.certifications.length > 0) {
        insights.strengths.push(
            `Holds ${resumeData.certifications.length} professional certification(s)`
        );
    }

    // Concerns
    if (scoringResult.missingRequiredSkills && scoringResult.missingRequiredSkills.length > 0) {
        const missingSkills = scoringResult.missingRequiredSkills.slice(0, 3).join(", ");
        insights.concerns.push(`Missing required skills: ${missingSkills}`);
    }

    if (!resumeData.email || resumeData.email.includes("@email.com")) {
        insights.concerns.push("Contact email not clearly identified in resume");
    }

    if (!resumeData.experience || resumeData.experience === "Not specified") {
        insights.concerns.push("Years of experience not clearly stated in resume");
    }

    // Summary
    if (scoringResult.score >= 80) {
        insights.summary = "Strong candidate with excellent skill match";
    } else if (scoringResult.score >= 60) {
        insights.summary = "Good candidate with solid skill foundation";
    } else if (scoringResult.score >= 40) {
        insights.summary = "Potential candidate with some relevant skills";
    } else {
        insights.summary = "Limited skill match for this position";
    }

    return insights;
}

/**
 * Validate resume data
 */
function validateResumeData(parsedData) {
    if (!parsedData) {
        return {
            valid: false,
            errors: ["Resume parsing failed"],
        };
    }

    const errors = [];

    if (!parsedData.name || parsedData.name === "Unknown Candidate") {
        errors.push("Candidate name not detected");
    }

    if (!parsedData.skills || parsedData.skills.length === 0) {
        errors.push("No skills detected in resume");
    }

    if (!parsedData.email || parsedData.email.includes("@email.com")) {
        errors.push("Valid email not detected");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings: errors,
    };
}

/**
 * Get match level label and color
 */
function getCandidateMatchLevel(score) {
    if (score >= 80) return { level: "Excellent", color: "green" };
    if (score >= 60) return { level: "Good", color: "yellow" };
    if (score >= 40) return { level: "Fair", color: "orange" };
    return { level: "Low", color: "red" };
}

module.exports = {
    screenResumeWithSystem,
    generateSystemInsights,
    validateResumeData,
    getCandidateMatchLevel,
    calculateCandidateScore // Exporting for backward compatibility if needed
};
