

const getErrorMessage = (field, value) => {
  const messages = {
    higherQualification: "Higher Qualification is required",
    currentExperience: "Experience is required",
    technology: "Technology is required",
    title: "Title is required",
    instructions: "Instructions are required",
    skills: "At least one skill is required",
  };

  if (!value) {
    return messages[field];
  }


  return "";
};

const validatemockForm = (formData, entries, errors) => {
  console.log("formData", formData);
  
  let formIsValid = true;
  const newErrors = { ...errors };

  Object.keys(formData).forEach((field) => {
    const errorMessage = getErrorMessage(field, formData[field]);
    if (errorMessage) {
      newErrors[field] = errorMessage;
      formIsValid = false;
    }
  });

  console.log("newErrors", newErrors);


  if (entries.length === 0) {
    newErrors.skills = getErrorMessage("skills", entries.length);
    formIsValid = false;
  }

  return { formIsValid, newErrors };
};

module.exports = {
  validatemockForm,
  getErrorMessage
};