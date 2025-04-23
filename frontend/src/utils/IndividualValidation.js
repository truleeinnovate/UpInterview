export const validateEmail = async (email, checkEmailExists) => {
  let errorMessage = '';

  if (!email) {
    errorMessage = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorMessage = 'Invalid email format';
  } else if (checkEmailExists) {
    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        errorMessage = 'Email already registered';
      }
    } catch (err) {
      console.error('Error checking email:', err);
      errorMessage = 'Error verifying email';
    }
  }

  return errorMessage;
};

export const validateProfileId = async (profileId, checkProfileIdExists) => {
  let errorMessage = '';
  let suggestedProfileIds = [];

  if (!profileId) {
    errorMessage = 'Profile ID is required';
  } else if (profileId.length < 4) {
    errorMessage = 'Profile ID must be at least 4 characters';
  } else if (!/^[a-zA-Z0-9.]+$/.test(profileId)) {
    errorMessage = 'Only letters, numbers, and dots allowed';
  } else if (checkProfileIdExists) {
    try {
      const exists = await checkProfileIdExists(profileId);
      if (exists) {
        errorMessage = 'Profile ID already taken';
        // Generate 3 random suggestions
        suggestedProfileIds = [
          `${profileId}${Math.floor(Math.random() * 100)}`,
          `${profileId}.${Math.floor(Math.random() * 10)}`,
          `${profileId.split('.')[0]}${Math.floor(Math.random() * 100)}`
        ];
      }
    } catch (err) {
      console.error('Error checking Profile ID:', err);
      errorMessage = 'Error verifying Profile ID';
    }
  }

  return { errorMessage, suggestedProfileIds };
};

export const validateSteps = (step, params, setErrors, checkProfileIdExists, checkEmailExists) => {
  let hasError = false;
  const errors = {};

  if (step === 0) {
    const { formData } = params;
    errors.lastName = !formData?.lastName ? 'Last Name is required' : '';
    errors.email = !formData?.email ? 'Email is required' : '';
    errors.profileId = !formData?.profileId ? 'Profile ID is required' : '';
    errors.phone = !formData?.phone ? 'Phone number is required' : '';
    if (formData?.phone && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be a valid 10-digit number';
    }
    errors.linkedinUrl = !formData?.linkedinUrl ? 'LinkedIn URL is required' : '';
  }

  if (step === 1) {
    const { formData, selectedIndustry, selectedLocation } = params;
    errors.currentRole = !formData.currentRole ? 'Current Role is required' : '';
    errors.industry = !selectedIndustry ? 'Industry is required' : '';
    errors.yearsOfExperience = !formData.yearsOfExperience ? 'Experience is required' : '';
    errors.location = !selectedLocation ? 'Location is required' : '';
  }

  if (step === 2) {
    const { selectedCandidates, selectedSkills, InterviewPreviousExperience, expertiseLevel, formData2 } = params;
    errors.technologies = !selectedCandidates.length ? 'Technology is required' : '';
    errors.skills = !selectedSkills.length ? 'Skill is required' : '';
    errors.previousExperienceConductingInterviews = !InterviewPreviousExperience ? 'Previous Experience is required' : '';
    errors.expertiseLevel_ConductingInterviews = !expertiseLevel ? 'Expertise Level is required' : '';
    errors.hourlyRate = !formData2.hourlyRate ? 'Hourly rate is required' : '';
    errors.noShowPolicy = !formData2.noShowPolicy ? "No-show policy selection is required" : "";

    // Validate bio: optional, but if non-empty, must be >= 20 characters
    if (formData2.bio && formData2.bio.length < 20) {
      errors.bio = 'Bio must be at least 20 characters';
    } else if (formData2.bio && formData2.bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters';
    }
    
    // Validate Interview Previous Experience Years if "Yes" is selected
    if (InterviewPreviousExperience === "yes") {
      errors.previousExperienceConductingInterviewsYears = !formData2.previousExperienceConductingInterviewsYears ? 'Experience years is required' : '';
    }
    
    // Validate Mock Interview Fields Only if "Yes" is Selected
    console.log("Interview Format We Offer:", formData2.interviewFormatWeOffer);
  if (formData2.interviewFormatWeOffer.includes("mock")) {
    errors.expectedRatePerMockInterview = !formData2.expectedRatePerMockInterview 
      ? "Expected rate is required" 
      : "";
  } else {
    // Reset values when "No" is selected
    formData2.expectedRatePerMockInterview = "";
  }


  }



  if (step === 3) {
    const { times, formData3, selectedOption } = params;

    // Validate fields for step 2
    const hasValidTimeSlot = Object.values(times).some((dayTimes) =>
      dayTimes.some((timeSlot) => timeSlot.startTime && timeSlot.endTime)
    );

    errors.TimeSlot = !hasValidTimeSlot ? 'At least one valid time slot is required' : '';
    errors.timeZone = !formData3.timeZone ? 'Time Zone is required' : '';
    errors.preferredDuration = !selectedOption ? 'Preferred Interview Duration is required' : '';
  }


  // Check for any errors
  hasError = Object.values(errors).some((error) => error !== '');

  // Update errors state if there are errors
  if (setErrors) {
    setErrors((prev) => ({ ...prev, ...errors }));
  }

  // Return true if no errors, otherwise false
  return !hasError;
};
