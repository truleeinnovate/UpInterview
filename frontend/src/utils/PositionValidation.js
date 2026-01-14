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

// v1.0.0 - Ashok - added "location" validation

export const validateForm = (formData, entries, rounds) => {
  let errors = {};
  let formIsValid = true;

  if (!formData.title) {
    errors.title = "Title is required";
    formIsValid = false;
  }

  // if (!formData.companyName) {
  //   errors.companyname = "Company Name is required";
  //   formIsValid = false;
  // }

  if (!formData.minexperience) {
    errors.minexperience = "Minimum Experience is required";
    formIsValid = false;
  }

  if (!formData.maxexperience) {
    errors.maxexperience = "Maximum Experience is required";
    formIsValid = false;
  }

  // Validate experience range
  if (formData.minexperience && formData.maxexperience) {
    const minExp = parseInt(formData.minexperience);
    const maxExp = parseInt(formData.maxexperience);

    if (minExp === maxExp) {
      errors.minexperience = "Min and Max Experience cannot be equal";
      errors.maxexperience = "Max and Min Experience cannot be equal";
      formIsValid = false;
    } else if (minExp > maxExp) {
      errors.minexperience = "Min Experience cannot be greater than Max";
      errors.maxexperience = "Max Experience cannot be less than Min";
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
      const minSalary = parseInt(formData.minSalary);
      const maxSalary = parseInt(formData.maxSalary);

      if (minSalary === maxSalary) {
        errors.minsalary = "Minimum and Maximum Salary cannot be equal";
        errors.maxsalary = "Maximum and Minimum Salary cannot be equal";
        formIsValid = false;
      } else if (minSalary > maxSalary) {
        errors.minsalary = "Minimum Salary cannot be greater than Maximum";
        errors.maxsalary = "Maximum Salary cannot be less than Minimum";
        formIsValid = false;
      }
    }
  }

  if (!formData.jobDescription || !formData.jobDescription.trim()) {
    errors.jobDescription = "Job Description is required";
    formIsValid = false;
  } else if (formData.jobDescription.trim().length < 50) {
    errors.jobDescription = `Job Description must be at least 50 characters (currently ${formData.jobDescription.trim().length}/50)`;
    formIsValid = false;
  }

  // Skills validation: ignore entirely empty rows, validate only rows where any field is filled
  const filledEntries = (entries || []).filter(
    (e) => (e?.skill && e.skill !== "") || (e?.expertise && e.expertise !== "") || (e?.requirement_level && e.requirement_level !== "")
  );
  if (filledEntries.length === 0) {
    errors.skills = "At least one skill must be selected";
    formIsValid = false;
  } else {
    // Check each filled entry for missing fields
    const invalidEntries = filledEntries.map((entry, index) => {
      const missingFields = [];
      if (!entry.skill) missingFields.push('skill');
      if (!entry.expertise) missingFields.push('expertise');
      if (!entry.requirement_level) missingFields.push('requirement_level');

      return missingFields.length > 0
        ? { index, missingFields }
        : null;
    }).filter(Boolean);

    if (invalidEntries.length > 0) {
      // Create a more helpful error message
      const errorMessages = invalidEntries.map(({ index, missingFields }) =>
        `Row ${index + 1}: Please fill in ${missingFields.join(', ')}`
      );

      errors.skills = errorMessages.join('; ');
      formIsValid = false;
    }
  }

  // Add salary validation
  if (formData.minSalary && formData.maxSalary) {
    if (parseInt(formData.minSalary) > parseInt(formData.maxSalary)) {
      errors.minsalary = "Minimum Salary cannot be greater than Maximum";
      formIsValid = false;
    } else if (parseInt(formData.maxSalary) < parseInt(formData.minSalary)) {
      errors.maxsalary = "Maximum Salary cannot be less than Minimum";
      formIsValid = false;
    }
  }



  // Add No of Positions validation
  // if (!formData.NoofPositions || parseInt(formData.NoofPositions) <= 0) {
  //   errors.NoofPositions = "Number of Positions must be greater than 0";
  //   formIsValid = false;
  // }
  // v1.0.0 <----------------------------------------------------------------------
  // Add location validation
  // if (!formData.Location) {
  //   errors.Location = "Location is required";
  //   formIsValid = false;
  // }
  // v1.0.0 ---------------------------------------------------------------------->

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
