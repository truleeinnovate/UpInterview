//<-----v1.0.0-----Venkatesh-----if skipQuestionType is true then skip question type validation


export const validateQuestionBankData = (formData, mcqOptions, section, options = {}) => {
    const { skipQuestionType = false } = options || {};
    const errors = {};
    const requiredFields = {
        questionText: "Question is required",
        tenantListId: "Question List is required",
        category: "Category is required",
        ...(skipQuestionType ? {} : { questionType: "Question Type is required" }),//-----v1.0.0----->
        skill: "Skill is required",
        difficultyLevel: "Difficulty Level is required",
        minexperience: "Min Experience is required",
        maxexperience: "Max Experience is required",
        // score: "Score is required",
        ...(section === "assessment" && { score: "Score is required" }),
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
    // if (formData.minexperience && formData.maxexperience) {
    //     const minExp = parseInt(formData.minexperience, 10);
    //     const maxExp = parseInt(formData.maxexperience, 10);
    //     if (!isNaN(minExp) && !isNaN(maxExp) && maxExp <= minExp) {
    //         errors.maxexperience = "Max Experience must be greater than Min Experience";
    //     }
    // }

    // Validate tenantListId shape (mirror backend: array of string ObjectIds)
    if (formData.tenantListId) {
        if (!Array.isArray(formData.tenantListId)) {
            errors.tenantListId = errors.tenantListId || "Question List selection is invalid";
        } else if (!formData.tenantListId.every(id => typeof id === 'string' && id.trim().length > 0)) {
            errors.tenantListId = "Question List contains invalid entries";
        }
    }

    return errors;
};
