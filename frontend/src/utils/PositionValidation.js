// export const validateForm = (formData, entries, roundEntries) => {
//     const requiredFields = {
//         title: "Title is required",
//         companyname: "Company Name is required",
//         jobdescription: "Job Description is required",
//         minexperience: "Min Experience is required",
//         maxexperience: "Max Experience is required",
//     };

//     let formIsValid = true;
//     const newErrors = {};

//     Object.entries(requiredFields).forEach(([field, message]) => {
//         if (!formData[field]) {
//             newErrors[field] = message;
//             formIsValid = false;
//         }
//     });

//     // Check if at least one skill is added
//     if (entries?.length === 0) {
//         newErrors.skills = "At least one skill is required";
//         formIsValid = false;
//     }

//     // // Check if at least one round is added
//     // if (roundEntries?.length === 0) {
//     //     newErrors.rounds = "At least one round isrequired";
//     //     formIsValid = false;
//     // }

//     return { formIsValid, newErrors };
// };

export const validateForm = (formData, entries, rounds) => {
  let errors = {};
  let formIsValid = true;

  if (!formData.title) {
    errors.title = "Title is required";
    formIsValid = false;
  }

  if (!formData.companyName) {
    errors.companyname = "Company Name is required";
    formIsValid = false;
  }

  if (!formData.minexperience) {
    errors.minexperience = "Minimum experience is required";
    formIsValid = false;
  }

  if (!formData.maxexperience) {
    errors.maxexperience = "Maximum experience is required";
    formIsValid = false;
  }

  // Validate experience range
  if (formData.minexperience && formData.maxexperience) {
    if (parseInt(formData.minexperience) > parseInt(formData.maxexperience)) {
      errors.minexperience = "Min experience cannot be greater than max";
      errors.maxexperience = "Max experience cannot be less than min";
      formIsValid = false;
    }
  }


 // Salary validation - only validate if at least one salary field is filled
 if (formData.minSalary || formData.maxSalary) {
  // Validate minSalary
  if (formData.minSalary) {
    if (parseInt(formData.minSalary) < 0) {
      errors.minsalary = "Minimum salary cannot be negative";
      formIsValid = false;
    }
  }

  // Validate maxSalary
  if (formData.maxSalary) {
    if (parseInt(formData.maxSalary) < 0) {
      errors.maxsalary = "Maximum salary cannot be negative";
      formIsValid = false;
    }
  }

  // Validate relationship between min and max salary
  if (formData.minSalary && formData.maxSalary) {
    if (parseInt(formData.minSalary) > parseInt(formData.maxSalary)) {
      errors.minsalary = "Minimum salary cannot be greater than maximum";
      errors.maxsalary = "Maximum salary cannot be less than minimum";
      formIsValid = false;
    }
  }
}

  if (!formData.jobDescription || !formData.jobDescription.trim()) {
    errors.jobdescription = "Job description is required";
    formIsValid = false;
  } else if (formData.jobDescription.trim().length < 50) {
    errors.jobdescription = `Job description must be at least 50 characters (currently ${formData.jobDescription.trim().length}/50)`;
    formIsValid = false;
  }

  if (entries.length === 0) {
    errors.skills = "At least one skill must be selected";
    formIsValid = false;
  }
  else if (entries.some((entry) => !entry.skill || !entry.experience || !entry.expertise)) {
    errors.skills = "All skills must have a value in the skill, experience and expertise fields";
    formIsValid = false;
  }

    // Add salary validation
    if (formData.minSalary && formData.maxSalary) {
      if (parseInt(formData.minSalary) > parseInt(formData.maxSalary)) {
        errors.minsalary = "Minimum salary cannot be greater than maximum salary";
        formIsValid = false;
      } else if (parseInt(formData.maxSalary) < parseInt(formData.minSalary)) {
        errors.maxsalary = "Maximum salary cannot be less than minimum salary";
        formIsValid = false;
      }
    }



    // Add No of Positions validation
    if (!formData.NoofPositions || parseInt(formData.NoofPositions) <= 0) {
      errors.noOfPositions = "Number of positions must be greater than 0";
      formIsValid = false;
    }

  return { formIsValid, newErrors: errors };
};


// export const validateRound = (round) => {
//   const newErrors = {};
//   if (!round.round) {
//     newErrors.round = "Round type is required";
//   }
//   if (round.round === "Other" && !round.customRoundName) {
//     newErrors.round = "Custom round name is required";
//   }
//   if (!round.mode) {
//     newErrors.mode = "Interview mode is required";
//   }
//   if (!round.duration) {
//     newErrors.duration = "Duration is required";
//   }
//   if (!round.interviewer || round.interviewer.length === 0) {
//     newErrors.interviewer = "At least one interviewer is required";
//   }
//   if (!round.roundName.trim()) {
//     newErrors.roundName = "Round Name is required";
//   }
//   if (!round.interviewType.trim()) {
//     newErrors.interviewType = "Interview Type is required";
//   }
//   return newErrors;
// };

export const validateRoundPopup = (round) => {
  const newErrors = {};

  if (!round.roundName.trim()) {
    newErrors.roundName = "Round Name is required";
  }
  if (!round.interviewType.trim()) {
    newErrors.interviewType = "Interview Type is required";
  }

  return newErrors;
};
