export const validateQuestionBankData = (formData, mcqOptions,section) => {
    const errors = {};
    const requiredFields = {
        questionText: "Question is required",
        tenantListId: "Question List is required",
        questionType: "Question Type is required",
        skill: "Skill is required",
        difficultyLevel: "Difficulty Level is required",
        // score: "Score is required",
        ...(section==="assessmet" && {score:"score is required"}),
        correctAnswer: "Answer is required",
    };

    // Check if required fields are empty
    Object.entries(requiredFields).forEach(([field, message]) => {
        if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
            errors[field] = message;
        }
    });

    // Additional validation for MCQ options
    if (formData.questionType === 'MCQ' && mcqOptions.every(option => !option.option)) {
        errors.Options = "At least one option is required for MCQ";
    }

    return errors;
};
