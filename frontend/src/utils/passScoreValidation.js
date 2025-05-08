export const validatePassScoreData = (selectedScore, selectedPassScoreBy, passScore, passScores, sections, totalScore, totalScores, addedSections) => {
    const errors = {};
  
    if (!selectedScore) {
      errors.selectedScore = "Pass Score Type is required.";
    }
  
    if (!selectedPassScoreBy) {
      errors.selectedPassScoreBy = "Pass Score By is required.";
    }
  
    if (selectedPassScoreBy === "Overall") {
      const totalQuestions = addedSections.reduce((acc, section) => acc + section.Questions.length, 0);
      const questionScore = totalScore ? Number(totalScore) / totalQuestions : 0;
  
      if (!passScore) {
        errors.passScore = "Overall Pass Score is required.";
      } else if (isNaN(passScore) || Number(passScore) < 1) {
        errors.passScore = "Overall Pass Score must be a positive number.";
      } else if (selectedScore === "Percentage" && Number(passScore) > 100) {
        errors.passScore = "Overall Pass Score cannot exceed 100%.";
      }
  
      if (!totalScore) {
        errors.totalScore = "Total Score is required.";
      } else if (isNaN(totalScore) || Number(totalScore) < totalQuestions) {
        errors.totalScore = `Total Score must be at least ${totalQuestions} to ensure each question has a score of 1 or more (based on ${totalQuestions} questions).`;
      } else if (Number(totalScore) < Number(passScore)) {
        errors.totalScore = "Total Score must be greater than or equal to Pass Score.";
      } else if (questionScore < 1) {
        errors.totalScore = "Total Score must be high enough to assign at least 1 point per question.";
      }
    }
  
    if (selectedPassScoreBy === "Each Section") {
      sections.forEach((sectionName) => {
        const section = addedSections.find(s => s.SectionName === sectionName);
        const sectionQuestions = section ? section.Questions.length : 0;
        const sectionPassScore = passScores[sectionName];
        const sectionTotalScore = totalScores[sectionName];
        const questionScore = sectionTotalScore ? Number(sectionTotalScore) / sectionQuestions : 0;
  
        if (!sectionPassScore) {
          errors[sectionName] = `Pass Score for ${sectionName} is required.`;
        } else if (isNaN(sectionPassScore) || Number(sectionPassScore) < 1) {
          errors[sectionName] = `Pass Score for ${sectionName} must be a positive number.`;
        } else if (selectedScore === "Percentage" && Number(sectionPassScore) > 100) {
          errors[sectionName] = `Pass Score for ${sectionName} cannot exceed 100%.`;
        }
  
        if (!sectionTotalScore) {
          errors[sectionName] = errors[sectionName] ? 
            `${errors[sectionName]} Total Score is required.` : 
            `Total Score for ${sectionName} is required.`;
        } else if (isNaN(sectionTotalScore) || Number(sectionTotalScore) < sectionQuestions) {
          errors[sectionName] = errors[sectionName] ? 
            `${errors[sectionName]} Total Score must be at least ${sectionQuestions} to ensure each question has a score of 1 or more.` : 
            `Total Score for ${sectionName} must be at least ${sectionQuestions} to ensure each question has a score of 1 or more (based on ${sectionQuestions} questions).`;
        } else if (Number(sectionTotalScore) < Number(sectionPassScore)) {
          errors[sectionName] = errors[sectionName] ? 
            `${errors[sectionName]} Total Score must be greater than or equal to Pass Score.` : 
            `Total Score for ${sectionName} must be greater than or equal to Pass Score.`;
        } else if (questionScore < 1) {
          errors[sectionName] = errors[sectionName] ? 
            `${errors[sectionName]} Total Score must be high enough to assign at least 1 point per question.` : 
            `Total Score for ${sectionName} must be high enough to assign at least 1 point per question.`;
        }
      });
    }
  
    return errors;
  };