// utils/mockinterviewValidation.jsAdd commentMore actions
const getErrorMessage = (field, value) => {
  const messages = {
    candidateName: "Candidate Name is required",
    // higherQualification: "Higher Qualification is required",
    currentExperience: "Experience is required",
    // technology: "Technology is required",
    currentRole: "Current Role is required",
    "rounds.roundTitle": "Round Title is required",
    "rounds.interviewMode": "Interview Mode is required",

    skills: "At least one skill is required",
    jobDescription: "Professional Summary is required",
  };

  if (!value || value === "") {
    return messages[field];
  }

  // Additional validation for specific fields
  if (field === "currentExperience") {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 1 || numValue > 15) {
      return "Experience must be a number between 1 and 15 years";
    }
  }

  if (field === "jobDescription" && value.trim().length < 200) {
    return "Job Description should be at least 200 characters";
  }
  return "";
};

// Validation for Page 1 (Candidate Details)
const validatePage1 = (formData, entries) => {
  const requiredFields = {
    candidateName: formData.candidateName,
    // higherQualification: formData.higherQualification,
    // technology: formData.technology,
    currentExperience: formData.currentExperience,
    currentRole: formData.currentRole,
    jobDescription: formData.jobDescription,
  };
  let formIsValid = true;
  const newErrors = {};

  Object.keys(requiredFields).forEach((field) => {
    const errorMessage = getErrorMessage(field, requiredFields[field]);
    if (errorMessage) {
      newErrors[field] = errorMessage;
      formIsValid = false;
    }
  });

  // Validate skills (at least one skill is required)
  // if (formData.skills.length === 0) {
  //   newErrors.skills = getErrorMessage("skills", formData.skills.length);
  //   formIsValid = false;
  // }
  // else if (formData.skills.some((entry) => !entry.skill)) {
  //   newErrors.skills = "skills must have a value in the skill fields";
  //   formIsValid = false;
  // }

  // Validate skills (at least one skill is required)
  if (formData.skills.length === 0) {
    newErrors.skills = getErrorMessage("skills", formData.skills.length);
    formIsValid = false;
  } else if (formData.skills.some((skill) => !skill || skill.trim() === "")) {
    newErrors.skills = "skills must have a value in the skill fields";
    formIsValid = false;
  }
  // else if (entries.some((entry) => !entry.experience )) {
  //   newErrors.skills = "experience must have a value in the experience fields";
  //   formIsValid = false;
  // }
  // else if (entries.some((entry) => !entry.expertise )) {
  //   newErrors.skills = "expertise must have a value in the expertise fields";
  //   formIsValid = false;
  // }

  return { formIsValid, newErrors };
};

const validatemockForm = (formData, entries, errors) => {
  let formIsValid = true;
  const newErrors = { ...errors };

  const requiredFields = {
    candidateName: formData.candidateName,
    higherQualification: formData.higherQualification,
    currentExperience: formData.currentExperience,
    // technology: formData.technology,
    currentRole: formData.currentRole,
    jobDescription: formData.jobDescription,
    "rounds.roundTitle": formData.rounds.roundTitle,
    "rounds.interviewMode": formData.rounds.interviewMode,
  };

  // Add dateTime validation only for "scheduled" interviews
  if (formData.rounds.interviewType === "scheduled") {
    requiredFields["rounds.dateTime"] = formData.rounds.dateTime;
  }

  Object.keys(requiredFields).forEach((field) => {
    const errorMessage = getErrorMessage(field, requiredFields[field]);
    if (errorMessage) {
      newErrors[field] = errorMessage;
      formIsValid = false;
    } else {
      delete newErrors[field];
    }
  });

  if (formData.skills.length === 0) {
    newErrors.skills = getErrorMessage("skills", formData.skills.length);
    formIsValid = false;
  } else {
    delete newErrors.skills;
  }

  return { formIsValid, newErrors };
};

export { validatemockForm, getErrorMessage, validatePage1 };
