export const validateQuestionBankData = (formData, mcqOptions) => {
    const errors = {};
    const requiredFields = {
        Question: "Question is required",
        QuestionType: "Question Type is required",
        Skill: "Skill is required",
        DifficultyLevel: "Difficulty Level is required",
        Score: "Score is required",
        Answer: "Answer is required",
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
        if (!formData[field]) {
            errors[field] = message;
        }
    });

    if (formData.QuestionType === 'MCQ' && mcqOptions.every(option => !option.option)) {
        errors.Options = "At least one option is required for MCQ";
    }

    return errors;
};