// v1.0.0  -  Mansoor  -  removed required for description
// v1.0.1  -  Added name uniqueness check
export const validateInterviewTemplate = (templateData, allTemplates = [], currentTemplateId = null) => {
    const errors = {};
    let isValid = true;

    // Validate template name
    if (!templateData.title || !templateData.title.trim()) {
        errors.title = 'Title is required';
        isValid = false;
    } else if (templateData.title.trim().length > 100) {
        errors.title = 'Title cannot exceed 100 characters';
        isValid = false;
    }

    // Validate label
    if (!templateData.name || !templateData.name.trim()) {
        errors.name = 'Name is required';
        isValid = false;
    } else if (templateData.name.trim().length > 50) {
        errors.name = 'Name cannot exceed 50 characters';
        isValid = false;
    } else if (allTemplates) {
        // Check for duplicate names
        const nameExists = allTemplates.some(template => 
            template.name?.toLowerCase() === templateData.name.toLowerCase() && 
            template._id !== currentTemplateId
        );
        
        if (nameExists) {
            errors.name = 'A template with this name already exists';
            isValid = false;
        }
    }

    // <---------------------- v1.0.0
    // // Validate description
    // if (!templateData.description || !templateData.description.trim()) {
    //   errors.description = 'Description is required';
    //   isValid = false;
    // } else if (templateData.description.trim().length < 20) {
    //   errors.description = `Description must be at least 20 characters (currently ${templateData.description.trim().length}/20)`;
    //   isValid = false;
    // } else if (templateData.description.trim().length > 300) {
    //   errors.description = 'Description cannot exceed 300 characters';
    //   isValid = false;
    // }
    // v1.0.0 ---------------------->

    // Validate bestFor
    // if (!templateData.bestFor || !templateData.bestFor.trim()) {
    //   errors.bestFor = 'Best For is required';
    //   isValid = false;
    // } else if (templateData.bestFor.trim().length > 50) {
    //   errors.bestFor = 'Best For cannot exceed 50 characters';
    //   isValid = false;
    // }

    // Validate format
    // if (!templateData.format || !templateData.format.trim()) {
    //   errors.format = 'Format is required';
    //   isValid = false;
    // } else if (!['fully online', 'hybrid', 'offline'].includes(templateData.format)) {
    //   errors.format = 'Format must be one of: fully online, hybrid, or offline';
    //   isValid = false;
    // }

    // Validate rounds (if provided)
    if (templateData.rounds && templateData.rounds.length > 0) {
        const roundErrors = [];
        templateData.rounds.forEach((round, index) => {
            const roundError = {};

            if (!round.name || !round.name.trim()) {
                roundError.name = 'Round Name is required';
                isValid = false;
            } else if (round.name.trim().length < 2) {
                roundError.name = 'Round Name must be at least 2 characters';
                isValid = false;
            } else if (round.name.trim().length > 50) {
                roundError.name = 'Round Name cannot exceed 50 characters';
                isValid = false;
            }

            if (!round.interviewType) {
                roundError.interviewType = 'Interview Type is required';
                isValid = false;
            }

            if (Object.keys(roundError).length > 0) {
                roundErrors[index] = roundError;
            }
        });

        if (roundErrors.length > 0) {
            errors.rounds = roundErrors;
        }
    }

    return { isValid, errors };
};

export const validateRound = (round) => {
    const errors = {};
    let isValid = true;

    if (!round.name || !round.name.trim()) {
        errors.name = 'Round Name is required';
        isValid = false;
    } else if (round.name.trim().length < 2) {
        errors.name = 'Round Name must be at least 2 characters';
        isValid = false;
    } else if (round.name.trim().length > 50) {
        errors.name = 'Round Name cannot exceed 50 characters';
        isValid = false;
    }

    if (!round.interviewType) {
        errors.interviewType = 'Interview Type is required';
        isValid = false;
    }

    return { isValid, errors };
};
