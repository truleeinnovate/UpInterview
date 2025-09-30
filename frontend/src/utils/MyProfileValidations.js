// validations.js
export const validateFormMyProfile = (formData) => {
    const errors = {};
  
    // First Name validation
    if (!formData.firstName?.trim()) {
      errors.firstName = "First Name is required";
    } else if (formData.firstName.length < 2) {
      errors.firstName = "First Name must be at least 2 characters";
    }

    // errors.firstName = !formData?.firstName ? 'First Name is required' : '';

// errors.firstName = !formData?.firstName ? 'First Name is required' : '';

  
    // Last Name validation
    if (!formData.lastName?.trim()) {
      errors.lastName = "Last Name is required";
    } else if (formData.lastName.length < 2) {
      errors.lastName = "Last Name must be at least 2 characters";
    }

    // errors.lastName = !formData?.lastName ? 'Last Name is required' : '';
  
    // Email validation
    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    // errors.email = !formData?.email ? 'Email is required' : '';


    if (!formData.profileId?.trim()) {
      errors.name = "profile Id is required";
    } else if (formData.profileId.length < 2) {
      errors.name = "Last profileId must be at least 2 characters";
    }
    // errors.profileId = !formData?.profileId ? 'Profile ID is required' : '';
  
    // Phone validation
      // Phone
  const phoneOnlyDigits = formData?.phone?.replace(/\D/g, '');
  if (!phoneOnlyDigits) {
    errors.phone = 'Phone Number is required';
  } else if (!/^\d{10}$/.test(phoneOnlyDigits)) {
    errors.phone = 'Phone Number must be a valid 10-digit number';
  }

  
  // LinkedIn URL validation
    // errors.linkedinUrl = !formData?.linkedinUrl ? 'LinkedIn URL is required' : '';
  
    // LinkedIn URL validation
    if (!formData.linkedinUrl?.trim()) {
      errors.linkedinUrl = "LinkedIn URL is required";
    } else if (!/^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(formData.linkedinUrl)) {
      errors.linkedinUrl = "Please enter a valid LinkedIn URL";
    }
  
    return errors;
  };
  
//   export const isEmptyObject = (obj) => {
//     return Object.keys(obj).length === 0;
//   };


  // validations.js
export const validateAdvancedForm = (formData) => {
    const errors = {};
  
    // Current Role validation
    if (!formData.currentRole?.trim()) {
      errors.currentRole = "Current Role is required";
    }
  
    // Industry validation
    if (!formData.industry?.trim()) {
      errors.industry = "Industry is required";
    }
  
    // Experience validation
    if (!formData.experience?.trim()) {
      errors.yearsOfExperience = "Years of Experience is required";
    } else if (!/^\d+$/.test(formData.experience.trim())) {
      errors.yearsOfExperience = "Please enter a valid number";
    }
  
    // Location validation
    if (!formData.location?.trim()) {
      errors.location = "Location is required";
    }
  
 
  
    // Introduction validation
    // if (!formData.introduction?.trim()) {
    //   errors.introduction = "Introduction is required";
    // } else if (formData.introduction.length < 10) {
    //   errors.introduction = "Introduction must be at least 10 characters";
    // }
  
    return errors;
  };

  // validations.js
  // export const validateInterviewForm = (formData, isReady) => {
  //   const errors = {};
  
  //   // Previous Experience Conducting Interviews
  //   if (!formData.PreviousExperienceConductingInterviews) {
  //     errors.PreviousExperienceConductingInterviews = "Please select an option";
  //   } else if (formData.PreviousExperienceConductingInterviews === "yes") {
  //     if (!formData.PreviousExperienceConductingInterviewsYears) {
  //       errors.PreviousExperienceConductingInterviewsYears = "Years of experience is required";
  //     } else if (!/^\d+$/.test(formData.PreviousExperienceConductingInterviewsYears) || 
  //              Number(formData.PreviousExperienceConductingInterviewsYears) < 1 || 
  //              Number(formData.PreviousExperienceConductingInterviewsYears) > 15) {
  //       errors.PreviousExperienceConductingInterviewsYears = "Enter a number between 1 and 15";
  //     }
  //   }
  
  //   // Skills validation
  //   if (!formData.skills || formData.skills.length === 0) {
  //     errors.skills = "At least one skill is required";
  //   }
  
  //   // Expertise Level
  //   if (!formData.ExpertiseLevel_ConductingInterviews) {
  //     errors.ExpertiseLevel_ConductingInterviews = "Please select an expertise level";
  //   }
  
  //   // Expected Rate Per Hour
  //   if (!formData.ExpectedRateMin) {
  //     errors.ExpectedRateMin = "Minimum rate is required";
  //   } else if (!/^\d+$/.test(formData.ExpectedRateMin) || Number(formData.ExpectedRateMin) < 1) {
  //     errors.ExpectedRateMin = "Enter a valid positive number";
  //   }
  
  //   if (!formData.ExpectedRateMax) {
  //     errors.ExpectedRateMax = "Maximum rate is required";
  //   } else if (!/^\d+$/.test(formData.ExpectedRateMax) || Number(formData.ExpectedRateMax) < 1) {
  //     errors.ExpectedRateMax = "Enter a valid positive number";
  //   } else if (Number(formData.ExpectedRateMax) < Number(formData.ExpectedRateMin)) {
  //     errors.ExpectedRateMax = "Max rate must be greater than or equal to min rate";
  //   }
  
  //   // Ready for Mock Interviews
  //   if (!formData.IsReadyForMockInterviews) {
  //     errors.IsReadyForMockInterviews = "Please select an option";
  //   }
  
  //   // Expected Rate Per Mock Interview (only if ready)
  //   if (formData.IsReadyForMockInterviews === "yes") {
  //     if (!formData.ExpectedRatePerMockInterviewMin) {
  //       errors.ExpectedRatePerMockInterviewMin = "Minimum rate is required";
  //     } else if (!/^\d+$/.test(formData.ExpectedRatePerMockInterviewMin) || Number(formData.ExpectedRatePerMockInterviewMin) < 1) {
  //       errors.ExpectedRatePerMockInterviewMin = "Enter a valid positive number";
  //     }
  
  //     if (!formData.ExpectedRatePerMockInterviewMax) {
  //       errors.ExpectedRatePerMockInterviewMax = "Maximum rate is required";
  //     } else if (!/^\d+$/.test(formData.ExpectedRatePerMockInterviewMax) || Number(formData.ExpectedRatePerMockInterviewMax) < 1) {
  //       errors.ExpectedRatePerMockInterviewMax = "Enter a valid positive number";
  //     } else if (Number(formData.ExpectedRatePerMockInterviewMax) < Number(formData.ExpectedRatePerMockInterviewMin)) {
  //       errors.ExpectedRatePerMockInterviewMax = "Max rate must be greater than or equal to min rate";
  //     }
  //   }
  
  //   // No-Show Policy (always required, independent of mock interviews)
  //   if (!formData.NoShowPolicy) {
  //     errors.NoShowPolicy = "Please select a no-show policy";
  //   }
  
  //   // Technology
  //   if (!formData.Technology || formData.Technology.length === 0) {
  //     errors.Technology = "At least one technology is required";
  //   }
  
  //   return errors;
  // };

// export const validateInterviewForm = (formData, isReady) => {
//     const errors = {};
  
//     // Technology validation - checks if at least one technology is selected
//     if (!formData.Technology || formData.Technology.length === 0) {
//       errors.Technology = "At least one technology is required";
//     }
  
//     // Skills validation - checks if at least one skill is selected
//     if (!formData.skills || formData.skills.length === 0) {
//       errors.skills = "At least one skill is required";
//     }
  
//     // Previous Experience validation - checks if option is selected
//     if (!formData.PreviousExperienceConductingInterviews) {
//       errors.PreviousExperienceConductingInterviews = "Please select an option";
//     } else if (formData.PreviousExperienceConductingInterviews === "yes") {
//       // Additional validation if 'yes' is selected
//       if (!formData.PreviousExperienceConductingInterviewsYears) {
//         errors.PreviousExperienceConductingInterviewsYears = "Years of experience is required";
//       } else if (!/^\d+$/.test(formData.PreviousExperienceConductingInterviewsYears) || 
//                Number(formData.PreviousExperienceConductingInterviewsYears) < 1 || 
//                Number(formData.PreviousExperienceConductingInterviewsYears) > 15) {
//         errors.PreviousExperienceConductingInterviewsYears = "Enter a number between 1 and 15";
//       }
//     }
  
//     // Expertise Level validation
//     if (!formData.ExpertiseLevel_ConductingInterviews) {
//       errors.ExpertiseLevel_ConductingInterviews = "Please select an expertise level";
//     }
  
//     // Hourly Rate validation - checks range and presence
//     if (!formData.hourlyRate) {
//       errors.hourlyRate = "Hourly rate is required";
//     } else if (Number(formData.hourlyRate) < 20 || Number(formData.hourlyRate) > 500) {
//       errors.hourlyRate = "Hourly rate must be between $20 and $500";
//     }
  
//     // No-Show Policy validation
//     if (!formData.NoShowPolicy) {
//       errors.NoShowPolicy = "Please select a no-show policy";
//     }
  
//     // Professional Bio validation (optional but with length constraints)
//     if (formData.bio) {
//       if (formData.bio.length < 20) {
//         errors.bio = "Bio must be at least 20 characters";
//       } else if (formData.bio.length > 500) {
//         errors.bio = "Bio cannot exceed 500 characters";
//       }
//     }
  
//     // Mock Interview validation (only if mock is selected)
//     // if (formData.interviewFormatWeOffer?.includes("mock")) {
//     //   if (!formData.expectedRatePerMockInterview) {
//     //     errors.expectedRatePerMockInterview = "Expected rate is required for mock interviews";
//     //   } else if (Number(formData.expectedRatePerMockInterview) < 1) {
//     //     errors.expectedRatePerMockInterview = "Rate must be a positive number";
//     //   }
//     // }
  
//     return errors;
//   };

export const validateInterviewForm = (formData, isReady) => {
  const errors = {};

  // Technology validation - checks if at least one technology is selected
  if (!formData.Technology || formData.Technology.length === 0) {
    errors.technologies = "At least one technology is required";
  }

  // Skills validation - checks if at least one skill is selected
  if (!formData.skills || formData.skills.length === 0) {
    errors.skills = "At least one skill is required";
  }

  // Previous Experience validation - checks if option is selected
  if (!formData.PreviousExperienceConductingInterviews) {
    errors.PreviousExperienceConductingInterviews = "Please select an option";
  } else if (formData.PreviousExperienceConductingInterviews === "yes") {
    // Additional validation if 'yes' is selected
    if (!formData.PreviousExperienceConductingInterviewsYears) {
      errors.PreviousExperienceConductingInterviewsYears = "Years of Experience is required";
    } else if (!/^\d+$/.test(formData.PreviousExperienceConductingInterviewsYears) || 
             Number(formData.PreviousExperienceConductingInterviewsYears) < 1 || 
             Number(formData.PreviousExperienceConductingInterviewsYears) > 15) {
      errors.PreviousExperienceConductingInterviewsYears = "Enter a Number between 1 and 15";
    }
  }

  // Expertise Level validation - Made optional
  if (formData.ExpertiseLevel_ConductingInterviews && formData.ExpertiseLevel_ConductingInterviews.trim() === '') {
    errors.ExpertiseLevel_ConductingInterviews = "Please select a valid expertise level";
  }

  // Hourly Rate validation - Made optional
  if (formData.hourlyRate && (Number(formData.hourlyRate) < 20 || Number(formData.hourlyRate) > 500)) {
    errors.hourlyRate = "Hourly rate must be between $20 and $500 if provided";
  }

  // No-Show Policy validation - Made optional
  if (formData.NoShowPolicy && formData.NoShowPolicy.trim() === '') {
    errors.NoShowPolicy = "Please select a valid no-show policy";
  }

  // Professional Title validation
  if (!formData.professionalTitle) {
    errors.professionalTitle = "Professional Title is required";
  } else if (formData.professionalTitle.length < 50) {
    errors.professionalTitle = "Professional Title must be at least 50 characters";
  } else if (formData.professionalTitle.length > 100) {
    errors.professionalTitle = "Professional Title cannot exceed 100 characters";
  }

  // Professional Bio validation - Made optional with length constraints
  if (formData.bio) {
    if (formData.bio.length < 150) {
      errors.bio = "Bio must be at least 150 characters";
    } else if (formData.bio.length > 500) {
      errors.bio = "Bio cannot exceed 500 characters";
    }
  }

  // Mock Interview validation - Made optional
  if (formData.interviewFormatWeOffer?.includes("mock") && formData.expectedRatePerMockInterview) {
    if (Number(formData.expectedRatePerMockInterview) < 1) {
      errors.expectedRatePerMockInterview = "Rate must be a positive number";
    }
  }

  return errors;
};
export const validateAvailabilityForm = (formData,times) => {
    const errors = {};
  
    // Time Zone validation
    if (!formData.selectedTimezone) {
      errors.TimeZone = "Time zone is required";
    } else if (typeof formData.selectedTimezone === 'object' && !formData.selectedTimezone.value) {
      errors.TimeZone = "Please select a valid time zone";
    }
  
    // Availability Times validation
    const hasValidTimeSlot = Object.values(times).some(daySlots =>
      daySlots.some(slot => slot.startTime && slot.endTime && slot.startTime < slot.endTime)
    );
    if (!hasValidTimeSlot) {
      errors.TimeSlot = "At least one valid time slot (start time before end time) is required";
    }
  
    // Preferred Duration validation
    if (!formData.selectedOption) {
      errors.PreferredDuration = "Please select a preferred interview duration";
    }
  
    return errors;
  };
  
//   export const isEmptyObject = (obj) => {
//     return Object.keys(obj).length === 0;
//   };
  
 
  
  export const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0;
  };