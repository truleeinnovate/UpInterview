export const validateAssessmentData = (assessmentData, tab) => {
    const errors = {};

    // Validate basic required fields only for Basicdetails tab
    if (tab === "Basicdetails") {
        const requiredFields = {
            AssessmentTitle: "Assessment Title is required",
            DifficultyLevel: "Difficulty Level is required",
            NumberOfQuestions: "Number of Questions is required",
            categoryOrTechnology: "Category or technology is required",
        };

        Object.entries(requiredFields).forEach(([field, message]) => {
            if (!assessmentData[field] || (Array.isArray(assessmentData[field]) && assessmentData[field].length === 0)) {
                errors[field] = message;
            }
        });
    }

    // Validate instructions if provided (for Details tab)
    if (assessmentData.instructions !== undefined) {
        const trimmedInstructions = assessmentData.instructions.trim();
        console.log(`Instructions length in validateAssessmentData: ${trimmedInstructions.length}`);
        if (!trimmedInstructions) {
            errors.instructions = "Instructions cannot be empty.";
        } else if (trimmedInstructions.length < 500) {
            errors.instructions = "Instructions must be at least 500 characters.";
        } else if (trimmedInstructions.length > 2000) {
            errors.instructions = "Instructions cannot exceed 2000 characters.";
        }
    }

    // console.log(`Validation errors for ${tab}: ${JSON.stringify(errors)}`);
    return errors;
};