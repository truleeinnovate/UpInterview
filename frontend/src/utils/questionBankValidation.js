export const validateQuestionBankData = (formData, mcqOptions,section) => {
    const errors = {};
    const requiredFields = {
        questionText: "Question is required",
        tenantListId: "Question List is required",
        questionType: "Question Type is required",
        skill: "Skill is required",
        difficultyLevel: "Difficulty Level is required",
        minexperience: "Min experience is required",
        maxexperience: "Max experience is required",
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
        errors.options = "At least one option is required for MCQ";
    }

    // Validate experience range
    if (formData.minexperience && formData.maxexperience) {
        const minExp = parseInt(formData.minexperience, 10);
        const maxExp = parseInt(formData.maxexperience, 10);
        if (!isNaN(minExp) && !isNaN(maxExp) && maxExp <= minExp) {
            errors.maxexperience = "Max experience must be greater than Min experience";
        }
    }

    return errors;
};
