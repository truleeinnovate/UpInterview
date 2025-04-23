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
    errors.title = "title is required";
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

  if (!formData.jobDescription.trim() || formData.jobDescription.trim().length < 250) {
    errors.jobdescription = "Job description is required";
    formIsValid = false;
  }

  if (entries.length === 0) {
    errors.skills = "At least one skill must be selected";
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
