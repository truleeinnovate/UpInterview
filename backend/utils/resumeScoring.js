// v1.0.0 - Resume Scoring Utility

const REQUIREMENT_WEIGHTS = {
    REQUIRED: 40,
    PREFERRED: 30,
    NICE_TO_HAVE: 20,
    OPTIONAL: 10
};

const EXPERTISE_SCORES = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    EXPERT: 4
};

const EXPERTISE_LEVEL_MULTIPLIERS = {
    BEGINNER: 0.5,
    INTERMEDIATE: 0.75,
    ADVANCED: 1.0,
    EXPERT: 1.25
};

/**
 * Calculate candidate score based on skill matching
 * @param {Object} candidate - Candidate object/Resume data
 * @param {Object} position - Position object with targetSkills
 * @returns {Object|null} Scoring result
 */
function calculateCandidateScore(candidate, position) {
    const targetSkills = position.skills || position.targetSkills || [];

    if (!candidate.skills || targetSkills.length === 0) {
        return null;
    }

    const candidateSkills = candidate.skills.map((s) =>
        typeof s === "string" ? s.toLowerCase() : (s.skill || s.name || "").toLowerCase()
    );

    let totalPossibleScore = 0;
    let earnedScore = 0;
    const matchedSkills = [];
    const missingRequiredSkills = [];

    targetSkills.forEach(targetSkill => {
        const requirementLevel = targetSkill.requirement_level || targetSkill.requirementLevel || "REQUIRED";
        const expertiseLevel = targetSkill.expertise || targetSkill.expertiseLevel || "INTERMEDIATE";
        const skillName = (targetSkill.skill || targetSkill.name || "").toLowerCase();

        const weight = REQUIREMENT_WEIGHTS[requirementLevel] || 10;
        totalPossibleScore += weight;

        const hasSkill = candidateSkills.some(cs =>
            cs === skillName ||
            skillName.includes(cs) ||
            cs.includes(skillName)
        );

        if (hasSkill) {
            const multiplier = EXPERTISE_LEVEL_MULTIPLIERS[expertiseLevel] || 1.0;
            const skillScore = weight * multiplier;
            earnedScore += skillScore;

            matchedSkills.push({
                skill: targetSkill.skill || targetSkill.name,
                level: requirementLevel,
                expertiseLevel: expertiseLevel
            });
        } else if (requirementLevel === 'REQUIRED') {
            missingRequiredSkills.push(targetSkill.skill || targetSkill.name);
        }
    });

    const rawScore = totalPossibleScore > 0 ? (earnedScore / totalPossibleScore) * 100 : 0;

    let finalScore = Math.min(Math.round(rawScore), 100);

    const requiredSkillsCount = targetSkills.filter(
        s => (s.requirement_level || s.requirementLevel) === 'REQUIRED'
    ).length;
    const matchedRequiredCount = matchedSkills.filter(
        m => m.level === 'REQUIRED'
    ).length;
    const requiredSkillMatchRate = requiredSkillsCount > 0
        ? matchedRequiredCount / requiredSkillsCount
        : 1;

    if (requiredSkillMatchRate < 0.5) {
        finalScore = Math.min(finalScore, 65);
    }

    let skillMatch = 'Low';
    if (finalScore >= 80) {
        skillMatch = 'High';
    } else if (finalScore >= 60) {
        skillMatch = 'Medium';
    }

    return {
        score: finalScore,
        skillMatch,
        matchedSkills,
        missingRequiredSkills,
        matchRate: {
            overall: matchedSkills.length / targetSkills.length,
            required: requiredSkillMatchRate
        }
    };
}

function getScoreColor(score) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
}

function getScoreBackgroundColor(score) {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
}

function getScoreBadgeColor(skillMatch) {
    switch (skillMatch) {
        case 'High':
            return 'bg-green-100 text-green-800';
        case 'Medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'Low':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

module.exports = {
    calculateCandidateScore,
    getScoreColor,
    getScoreBackgroundColor,
    getScoreBadgeColor
};
