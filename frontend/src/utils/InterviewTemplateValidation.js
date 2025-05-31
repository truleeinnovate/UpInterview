export const validateInterviewTemplate = (templateData) => {
  const errors = {};
  let isValid = true;

  // Validate template name
  if (!templateData.name || !templateData.name.trim()) {
    errors.name = 'Template name is required';
    isValid = false;
  } else if (templateData.name.trim().length > 100) {
    errors.name = 'Template name cannot exceed 100 characters';
    isValid = false;
  }

  // Validate label
  if (!templateData.label || !templateData.label.trim()) {
    errors.label = 'Label is required';
    isValid = false;
  } else if (templateData.label.trim().length > 50) {
    errors.label = 'Label cannot exceed 50 characters';
    isValid = false;
  }

  // Validate description
  if (!templateData.description || !templateData.description.trim()) {
    errors.description = 'Description is required';
    isValid = false;
  } else if (templateData.description.trim().length < 20) {
    errors.description = `Description must be at least 20 characters (currently ${templateData.description.trim().length}/20)`;
    isValid = false;
  } else if (templateData.description.trim().length > 300) {
    errors.description = 'Description cannot exceed 300 characters';
    isValid = false;
  }

  // Validate rounds (if provided)
  if (templateData.rounds && templateData.rounds.length > 0) {
    const roundErrors = [];
    templateData.rounds.forEach((round, index) => {
      const roundError = {};
      
      if (!round.name || !round.name.trim()) {
        roundError.name = 'Round name is required';
        isValid = false;
      } else if (round.name.trim().length < 2) {
        roundError.name = 'Round name must be at least 2 characters';
        isValid = false;
      } else if (round.name.trim().length > 50) {
        roundError.name = 'Round name cannot exceed 50 characters';
        isValid = false;
      }

      if (!round.interviewType) {
        roundError.interviewType = 'Interview type is required';
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
    errors.name = 'Round name is required';
    isValid = false;
  } else if (round.name.trim().length < 2) {
    errors.name = 'Round name must be at least 2 characters';
    isValid = false;
  } else if (round.name.trim().length > 50) {
    errors.name = 'Round name cannot exceed 50 characters';
    isValid = false;
  }

  if (!round.interviewType) {
    errors.interviewType = 'Interview type is required';
    isValid = false;
  }

  return { isValid, errors };
};
