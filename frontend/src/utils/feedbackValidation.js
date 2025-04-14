const PositionAddFromValidation = (formData, addFormCustomMsgFunction) => {
  const requiredFields = [
    "title",
    "jobDescription",
    "company",
    "skills",
    "experience",
    "additionalNotes",
    "rounds",
  ];
  const { min:minExp, max:maxExp } = formData.experience;

  let hasError = false;
  requiredFields.forEach((field) => {
    if (field === "experience") {
      if (!minExp) {
        hasError = true;
        addFormCustomMsgFunction("expMin", "min experience is required");
      } else {
        addFormCustomMsgFunction("expMin", "");
      }

      if (maxExp === "") {
        hasError = true;
        addFormCustomMsgFunction("expMax", "max experience is required");
      } else {
        addFormCustomMsgFunction("expMax", "");
      }
    }
     else if (
      !formData[field] ||
      (Array.isArray(formData[field]) && formData[field].length === 0)
    ) {
      hasError = true;
      console.log('list',formData[field])
      addFormCustomMsgFunction(field, `${field} is required`);
    } else {
      addFormCustomMsgFunction(field, ``);
    }
  });

  return !hasError;
};

const AddCustomQuestionValidation = (question,answer, CustomQuestionErrFunction) => {
  console.log("Validation started");
  let hasError = false;


  // Validate question field
  if (!question.trim()) {
    hasError = true;
    CustomQuestionErrFunction("question", "Question is required");
  } else {
    CustomQuestionErrFunction("question", "");
  }

  // Validate answer field
  if (!answer.trim()) {
    hasError = true;
    CustomQuestionErrFunction("answer", "Answer is required");
  } else {
    CustomQuestionErrFunction("answer", "");
  }

  return !hasError;
};


const SchedulerQuestionsValidation = (SchedulerSectionData,setSchedulerSectionData) => {
  let isValid = true;
  const updatedData = SchedulerSectionData.map((question) => {
    // if (question.mandatory && !question.isAnswered) {
    if (question.mandatory && !question.isAnswered ) {
      if (question.isLiked==="disliked" && question.whyDislike===""){
        isValid = false;
        return { ...question, error: true };
      }
      isValid = false;
      return { ...question, error: true };
    }
    return { ...question, error: false };
  });
  setSchedulerSectionData(updatedData);
  return isValid;
};


const ValidateSkills = (skillsTabData,setSkillsTabData) => {
  let isValid = true; // Assume valid unless an error is found

  const updatedData = skillsTabData.map(category=>
  ({
    ...category,
    skillsList:category.skillsList.map(skill=>{
      if (skill.required && skill.rating<=1){
        isValid= false;
        return {...skill,error:true}
      }
      return {...skill,error:false}
    })
  })
  )
  setSkillsTabData(updatedData)

  return isValid;
};

const validateOverallImpression = (overallImpressionTabData, setInterviewTabData) => {
  const { rating, note, recommendation, required } = overallImpressionTabData;

  // Determine if there's an error in the data
  // const hasError = required && (rating <= 1 || note.trim() === "" || recommendation.trim() === "");
  const hasError = required && (rating <= 1  || recommendation.trim() === "");

  // Update the state with the error
  setInterviewTabData((prev) => ({
    ...prev,
    overallImpressionTabData: {
      ...prev.overallImpressionTabData,
      error: hasError, // Update error state
    },
  }));

  // Return validation result (optional, in case you want to use this as a boolean flag)
  return !hasError;
};



  
module.exports = { PositionAddFromValidation, AddCustomQuestionValidation,SchedulerQuestionsValidation ,ValidateSkills,validateOverallImpression};
