export const validateSteps = (step, params, setErrors) => {
  let hasError = false;

  // Initialize errors object
  const errors = {};
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};


  if (step === 0) {
    const { formData } = params;

    // Validate fields for step 0
    errors.Name = !formData.Name ? 'Last Name is required' : '';
    errors.UserName = !formData.UserName ? 'Username is required' : '';
    // errors.Email = !formData.Email ? 'Email is required' : '';
    errors.Email = !formData.Email
    ? "Email is required"
    : !validateEmail(formData.Email)
    ? "Invalid email format"
    : ""; // Validate email properly
    errors.Phone = !formData.Phone ? 'Phone number is required' : '';
    errors.LinkedinUrl = !formData.LinkedinUrl ? 'LinkedIn URL is required' : '';
  }

  
  if (step === 1) {
    const { formData, selectedIndustry, selectedLocation } = params;
    errors.CurrentRole = !formData.CurrentRole ? 'Current Role is required' : '';
    errors.Industry = !selectedIndustry ? 'Industry is required' : '';
    errors.Experience = !formData.Experience ? 'Experience is required' : '';
    errors.Location = !selectedLocation ? 'Location is required' : '';
    errors.Introduction = !formData.Introduction ? 'Introduction is required' : '';
  }

  if (step === 2) {
    const { selectedCandidates, selectedSkills, InterviewPreviousExperience, expertiseLevel, formData2 } = params;

    // Validate fields for step 1
    errors.Technologys = !selectedCandidates.length ? 'Technology is required' : '';
    errors.Skills = !selectedSkills.length ? 'Skill is required' : '';
    errors.PreviousExperience = !InterviewPreviousExperience ? 'Previous Experience is required' : '';
    errors.ExpertiseLevel = !expertiseLevel ? 'Expertise Level is required' : '';
    // Validate Expected Rate Per Hour
    errors.ExpectedRateMin = !formData2.ExpectedRateMin ? 'Min rate is required' : '';
    errors.ExpectedRateMax = !formData2.ExpectedRateMax ? 'Max rate is required' : '';
    errors.IsReadyForMockInterviews = !formData2.IsReadyForMockInterviews ? 'MockInterview is required' : '';


    // Validate Interview Previous Experience Years if "Yes" is selected
    if (InterviewPreviousExperience === "yes") {
      errors.InterviewPreviousExperienceYears = !formData2.InterviewPreviousExperienceYears
        ? 'Years of experience is required'
        : '';
    }
    // Validate Mock Interview Fields Only if "Yes" is Selected
  if (formData2.IsReadyForMockInterviews === "yes") {
    errors.ExpectedRatePerMockInterviewMin = !formData2.ExpectedRatePerMockInterviewMin 
      ? "Min expected rate is required" 
      : "";
    errors.ExpectedRatePerMockInterviewMax = !formData2.ExpectedRatePerMockInterviewMax 
      ? "Max expected rate is required" 
      : "";
    errors.NoShowPolicy = !formData2.NoShowPolicy ? "No-show policy selection is required" : "";
  } else {
    // Reset values when "No" is selected
    formData2.ExpectedRatePerMockInterviewMin = "";
    formData2.ExpectedRatePerMockInterviewMax = "";
    formData2.NoShowPolicy = "";
  }


  }



  if (step === 3) {
    const { times, formData3, selectedOption } = params;

    // Validate fields for step 2
    const hasValidTimeSlot = Object.values(times).some((dayTimes) =>
      dayTimes.some((timeSlot) => timeSlot.startTime && timeSlot.endTime)
    );

    errors.TimeSlot = !hasValidTimeSlot ? 'At least one valid time slot is required' : '';
    errors.TimeZone = !formData3.TimeZone ? 'Time Zone is required' : '';
    errors.PreferredDuration = !selectedOption ? 'Preferred Interview Duration is required' : '';
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
