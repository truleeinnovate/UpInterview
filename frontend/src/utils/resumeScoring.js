
export const getScoreColor = (score) => {
    if (score == null) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-600';
};

export const getScoreBadgeColor = (score) => {
    if (score == null) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
};

export const calculateCandidateScore = (candidate, position) => {
    if (!candidate || !position) return null;

    // 1. Normalize Candidate Skills
    const candidateSkills = (
        candidate.screening_result?.extracted_skills ||
        candidate.parsed_skills ||
        candidate.skills ||
        []
    ).map(s => (typeof s === 'string' ? s : s.skill || '').toLowerCase().trim()).filter(Boolean);

    // 2. Normalize Position Skills
    const positionSkillsData = Array.isArray(position.skills) ? position.skills : [];

    const positionSkills = positionSkillsData
        .map(s => (typeof s === 'string' ? s : s.skill || '').toLowerCase().trim())
        .filter(Boolean);

    const requiredSkills = positionSkillsData
        .filter(s => typeof s === 'string' || s.level === 'required' || !s.level) // Assume required if simple string
        .map(s => (typeof s === 'string' ? s : s.skill || '').toLowerCase().trim())
        .filter(Boolean);

    // 3. Calculate Matches
    const matchedSkills = positionSkills.filter(skill => candidateSkills.includes(skill));
    const missingRequiredSkills = requiredSkills.filter(skill => !candidateSkills.includes(skill));

    // 4. Calculate Scores
    const totalSkills = positionSkills.length;
    const skillMatchCount = matchedSkills.length;
    const skillMatchPercentage = totalSkills > 0 ? Math.round((skillMatchCount / totalSkills) * 100) : 0;

    const totalRequired = requiredSkills.length;
    const requiredMatchCount = totalRequired > 0 ? (totalRequired - missingRequiredSkills.length) : 0;
    const requiredMatchRate = totalRequired > 0 ? (requiredMatchCount / totalRequired) : 0;

    // Use AI/System score if available, otherwise fallback to skill match calculation
    const overallScore = candidate.match_percentage != null ? candidate.match_percentage :
        candidate.screening_result?.score != null ? candidate.screening_result.score :
            candidate.score != null ? candidate.score :
                skillMatchPercentage;

    // Calculate an "Overall Match Rate" (distinct from score) - perhaps weighted
    // For now, let's use the average of Score and Skill Match, or just Score / 100
    const overallMatchRate = overallScore / 100;

    return {
        score: overallScore,
        skillMatch: skillMatchPercentage,
        matchRate: {
            overall: overallMatchRate,
            required: requiredMatchRate
        },
        matchedSkills: matchedSkills,
        missingRequiredSkills: missingRequiredSkills
    };
};
