export const validateAssessmentData = (assessmentData) => {
    const errors = {};
    const requiredFields = {
        AssessmentTitle: "Assessment Title is required",
        AssessmentType: "Assessment Type is required",
        Duration: "Duration is required",
        DifficultyLevel: "Difficulty Level is required",
        NumberOfQuestions: "Number Of Questions is required",
        ExpiryDate: "Expiry Date is required",
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
        if (!assessmentData[field] || (Array.isArray(assessmentData[field]) && assessmentData[field].length === 0)) {
            errors[field] = message;
        }
    });

    return errors;
};