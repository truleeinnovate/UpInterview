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

        // Enrich resumeData with extracted rich fields
        const fullText = resumeData.rawText || resumeData.resumeText || '';
        const enrichedProfile = extractRichData(fullText, resumeData);

        // Generate insights based on the scoring
        const insights = generateSystemInsights(resumeData, scoringResult, position);

        return {
            success: true,
            scoringResult,
            insights,
            extractedProfile: enrichedProfile
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
 * Extract rich structured data using rule-based methods
 * @param {string} fullText - Full resume text
 * @param {Object} resumeData - Basic parsed data
 * @returns {Object} Enriched profile data
 */
function extractRichData(fullText, resumeData) {
    const enriched = {
        name: resumeData.name || 'Unknown Candidate',
        email: resumeData.email || '',
        phone: resumeData.phone || '',
        experienceYears: extractYears(resumeData.experience) || 0,
        education: resumeData.education || 'Not specified',
        currentRole: extractCurrentRole(fullText),
        currentLocation: extractLocation(fullText),
        linkedIn: extractLinkedIn(fullText),
        professionalSummary: extractSummary(fullText),
        certifications: extractCertifications(fullText),
        projects: extractProjects(fullText),
        workHistory: extractWorkHistory(fullText),
        languages: extractLanguages(fullText)
    };

    return enriched;
}

/**
 * Simple helper to extract years from experience string
 */
function extractYears(expStr) {
    if (!expStr) return 0;
    const match = expStr.match(/(\d+(\.\d+)?)\+?\s*(year|yr|years)/i);
    return match ? parseFloat(match[1]) : 0;
}

/**
 * Extract professional summary (first big paragraph after contact info)
 */
function extractSummary(fullText) {
    if (!fullText) return '';
    const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
    
    let summary = '';
    let started = false;
    for (let i = 0; i < lines.length && summary.length < 500; i++) {
        const line = lines[i];
        if (!started && line.match(/^(summary|profile|professional summary|objective|about me)/i)) {
            started = true;
            continue; // Skip the heading
        }
        if (started) {
            if (line.match(/^(experience|skills|education|projects|certifications)/i)) break; // Stop at next section
            summary += line + ' ';
        } else if (i > 2 && !line.match(/@|\+?\d{10,}|linkedin|github/i) && line.length > 50) {
            started = true;
            summary += line + ' ';
        }
    }
    return summary.trim();
}

/**
 * Extract certifications
 */
function extractCertifications(fullText) {
    if (!fullText) return [];
    const certSection = fullText.match(/certifications?\s*([\s\S]*?)(?=skills|education|experience|$)/i)?.[1] || fullText;
    const certPatterns = [
        /aws certified/i, /google certified/i, /microsoft certified/i,
        /azure/i, /scrum master/i, /pmp/i, /cisa/i, /cissp/i,
        /certified.*professional/i, /certification/i
    ];
    const lines = certSection.split('\n').map(l => l.trim()).filter(Boolean);
    return lines
        .filter(line => certPatterns.some(p => p.test(line.toLowerCase())))
        .map(line => line.replace(/[-•*]/g, '').trim())
        .filter(line => line.length > 10 && line.length < 120);
}

/**
 * Extract projects
 */
function extractProjects(fullText) {
    if (!fullText) return [];
    const projectSection = fullText.match(/projects?\s*([\s\S]*?)(?=certifications|skills|education|experience|$)/i)?.[1] || fullText;
    const lines = projectSection.split('\n').map(l => l.trim()).filter(Boolean);
    const projects = [];
    let currentProject = null;

    for (const line of lines) {
        if (line.match(/^(project|developed|built|created|led)/i) || /^[A-Z][a-zA-Z\s]{10,60}$/.test(line)) {
            if (currentProject) projects.push(currentProject);
            currentProject = {
                title: line.replace(/^(project:|developed|built|created|led)/i, '').trim(),
                desc: ''
            };
        } else if (currentProject && line.trim()) {
            currentProject.desc += line + ' ';
        }
    }
    if (currentProject) projects.push(currentProject);
    return projects.filter(p => p.title && p.desc.length > 20);
}

/**
 * Extract work history
 */
function extractWorkHistory(fullText) {
    if (!fullText) return [];
    const experienceSection = fullText.match(/experience\s*([\s\S]*?)(?=education|skills|projects|certifications|$)/i)?.[1] || fullText;
    const lines = experienceSection.split('\n').map(l => l.trim()).filter(Boolean);
    const history = [];
    let currentJob = null;

    for (const line of lines) {
        // Detect role/company line (e.g., "Software Engineer at Google, 2020-2024")
        const jobMatch = line.match(/^(.*?) at (.*?),?\s*(\d{4}-(?:\d{4}|present))/i);
        if (jobMatch || line.match(/^(senior|lead|junior|software|engineer|developer|manager)/i)) {
            if (currentJob) history.push(currentJob);
            currentJob = {
                role: jobMatch?.[1] || line.split(' at ')[0] || line,
                company: jobMatch?.[2] || line.split(' at ')[1]?.split(',')[0] || 'Unknown',
                duration: jobMatch?.[3] || line.match(/(\d{4}-(?:\d{4}|present))/i)?.[1] || 'Unknown',
                responsibilities: []
            };
        } else if (currentJob && line.startsWith('- ') || line.startsWith('* ') || line.length > 20) {
            currentJob.responsibilities.push(line.replace(/[-*]/g, '').trim());
        }
    }
    if (currentJob) history.push(currentJob);
    return history.filter(j => j.role && j.company !== 'Unknown');
}

/**
 * Extract languages
 */
function extractLanguages(fullText) {
    if (!fullText) return [];
    const langSection = fullText.match(/languages?\s*([\s\S]*?)(?=certifications|projects|education|experience|$)/i)?.[1] || fullText;
    const commonLanguages = ['english', 'spanish', 'french', 'german', 'hindi', 'mandarin', 'arabic', 'japanese', 'python', 'javascript']; // Add more
    const lines = langSection.split('\n').map(l => l.trim()).filter(Boolean);
    return lines
        .filter(line => commonLanguages.some(lang => line.toLowerCase().includes(lang)))
        .map(line => line.replace(/[-•*]/g, '').trim());
}

/**
 * Extract current role (from top of experience)
 */
function extractCurrentRole(fullText) {
    const experienceSection = fullText.match(/experience\s*([\s\S]*?)(?=education|skills|projects)/i)?.[1] || '';
    const firstJobMatch = experienceSection.match(/^(\w+\s\w+)\s(at|in)/i);
    return firstJobMatch?.[1] || 'Not detected';
}

/**
 * Extract location (look for city, state)
 */
function extractLocation(fullText) {
    const locationMatch = fullText.match(/([A-Z][a-z]+,\s[A-Z]{2}|[A-Z][a-z]+\s[A-Z][a-z]+,\s[A-Z]{2})/);
    return locationMatch?.[0] || 'Not detected';
}

/**
 * Extract LinkedIn URL
 */
function extractLinkedIn(fullText) {
    const linkedinMatch = fullText.match(/linkedin\.com\/in\/[a-zA-Z0-9\-]+/i);
    return linkedinMatch ? `https://www.linkedin.com/in/${linkedinMatch[0].split('/in/')[1]}` : '';
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