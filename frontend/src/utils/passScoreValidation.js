export const validatePassScoreData = (selectedScore, selectedPassScoreBy, passScore, passScores, sections) => {
    const errors = {};

    if (!selectedScore) {
        errors.selectedScore = "Pass Score Type is required.";
    }

    if (!selectedPassScoreBy) {
        errors.selectedPassScoreBy = "Pass Score By is required.";
    }

    if (selectedPassScoreBy === "Overall" && !passScore) {
        errors.passScore = "Overall Pass Score is required.";
    }

    if (selectedPassScoreBy === "Each Section") {
        sections.forEach((sectionName) => {
            if (!passScores[sectionName]) {
                errors[sectionName] = `Pass Score for ${sectionName} is required.`;
            }
        });
    }

    return errors;
};