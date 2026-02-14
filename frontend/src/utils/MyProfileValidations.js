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


// validations.js
export const validateAdvancedForm = (formData) => {
  const errors = {};

  // Current Role validation
  if (!formData.currentRole?.trim()) {
    errors.currentRole = "Current Role is required";
  }

  // Industry validation
  // if (!formData.industry?.trim()) {
  //   errors.industry = "Industry is required";
  // }

  // Experience validation
  if (!formData.yearsOfExperience?.toString().trim()) {
    errors.yearsOfExperience = "Years of Experience is required";
  } else if (!/^\d+$/.test(formData.yearsOfExperience.toString().trim())) {
    errors.yearsOfExperience = "Please enter a valid number";
  }

  // Location validation
  // if (!formData.location?.trim()) {
  //   errors.location = "Location is required";
  // }

  return errors;
};

export const validateInterviewForm = (formData, isReady) => {
  const errors = {};

  // Technology validation - checks if at least one technology is selected
  // if (!formData.Technology || formData.Technology.length === 0) {
  //   errors.technologies = "At least one technology is required";
  // }


  // Skills validation - checks if at least one skill is selected
  if (!formData.skills || formData.skills.length === 0) {
    errors.skills = "At least one skill is required";
  }

  // Previous Experience validation - checks if option is selected
  if (!formData.PreviousExperienceConductingInterviews) {
    errors.PreviousExperienceConductingInterviews = "Please select an option";
  } else if (formData.PreviousExperienceConductingInterviews === "yes") {
    // Additional validation if 'yes' is selected
    // Check for empty, null, undefined, or 0
    if (!formData.PreviousExperienceConductingInterviewsYears ||
      formData.PreviousExperienceConductingInterviewsYears === 0 ||
      formData.PreviousExperienceConductingInterviewsYears === "0") {
      errors.PreviousExperienceConductingInterviewsYears = "Years of Experience is required (minimum 1)";
    } else if (!/^\d+$/.test(formData.PreviousExperienceConductingInterviewsYears) ||
      Number(formData.PreviousExperienceConductingInterviewsYears) < 1 ||
      Number(formData.PreviousExperienceConductingInterviewsYears) > 15) {
      errors.PreviousExperienceConductingInterviewsYears = "Enter a Number between 1 and 15";
    }
  }

  // Professional Title validation
  if (!formData.professionalTitle) {
    errors.professionalTitle = "Professional Title is required";
  } else if (formData.professionalTitle.length < 30) {
    errors.professionalTitle = "Professional Title must be at least 50 characters";
  } else if (formData.professionalTitle.length > 100) {
    errors.professionalTitle = "Professional Title cannot exceed 100 characters";
    formData.professionalTitle = formData.professionalTitle.substring(0, 100);
  }

  // Professional Bio validation - Made optional with length constraints
  if (formData.bio) {
    if (formData.bio.length < 150) {
      errors.bio = "Bio must be at least 150 characters";
    } else if (formData.bio.length > 500) {
      errors.bio = "Bio cannot exceed 500 characters";
    }
  }

  // Interview Format validation - checks if at least one format is selected
  if (!formData.interviewFormatWeOffer || formData.interviewFormatWeOffer.length === 0) {
    errors.interviewFormatWeOffer = "Interview format is required";
  }

  // FIXED: Mock Interview validation - Check if discount is required but missing
  if (formData.interviewFormatWeOffer?.includes("mock")) {
    if (!formData.mock_interview_discount) {
      errors.mock_interview_discount = "Mock interview discount is required ";
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
