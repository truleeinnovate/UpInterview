export const validateSteps = (step, params, setErrors) => {
  let hasError = false;

  // Initialize errors object
  const errors = {};
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  console.log("Step valid:", step);
  console.log("Params for Step valid:", params);

  if (step === 0) {
    const { basicDetailsData } = params;
    errors.Name = !basicDetailsData.Name ? 'Name is required' : '';
    errors.UserName = !basicDetailsData.UserName ? 'Username is required' : '';
    errors.Email = !basicDetailsData.Email ? "Email is required" : !validateEmail(basicDetailsData.Email) ? "Invalid email format" : "";
    errors.Phone = !basicDetailsData.Phone ? 'Phone number is required' : '';
    errors.LinkedinUrl = !basicDetailsData.LinkedinUrl ? 'LinkedIn URL is required' : '';
    errors.portfolioUrl = !basicDetailsData.portfolioUrl ? 'Portfolio URL is required' : '';
  }

  if (step === 1) {
    const { additionalDetailsData } = params;
    errors.CurrentRole = !additionalDetailsData.CurrentRole ? 'Current Role is required' : '';
    errors.industry = !additionalDetailsData.industry ? 'Industry is required' : '';
    errors.YearsOfExperience = !additionalDetailsData.YearsOfExperience ? 'Experience is required' : '';
    errors.location = !additionalDetailsData.location ? 'Location is required' : '';
  }

  if (step === 2) {
    const { interviewDetailsData } = params;
    errors.Technology = !interviewDetailsData.Technology || interviewDetailsData.Technology.length === 0
      ? 'At least one technology is required'
      : '';
    errors.Skills = !interviewDetailsData.Skills || interviewDetailsData.Skills.length === 0
      ? 'At least one skill is required'
      : '';
    errors.PreviousExperienceConductingInterviews = !interviewDetailsData.PreviousExperienceConductingInterviews ? 'Previous Experience is required' : '';
    errors.ExpertiseLevel_ConductingInterviews = !interviewDetailsData.ExpertiseLevel_ConductingInterviews ? 'Expertise Level is required' : '';
    errors.hourlyRate = !interviewDetailsData.hourlyRate ? 'Expected Hourly Rate is required' : '';
    errors.InterviewFormatWeOffer = interviewDetailsData.InterviewFormatWeOffer.length === 0 ? "Please select at least one interview format" : "";

    // Validate Interview Previous Experience Years if "Yes" is selected
    if (interviewDetailsData.PreviousExperienceConductingInterviews === "yes") {
      errors.PreviousExperienceConductingInterviewsYears = !interviewDetailsData.PreviousExperienceConductingInterviewsYears
        ? 'Years of experience is required'
        : '';
    }

    // Validate Mock Interview Fields Only if "Mock Interviews" is Selected
    if (interviewDetailsData.InterviewFormatWeOffer.includes("mock")) {
      errors.ExpectedRatePerMockInterviewMin = !interviewDetailsData.ExpectedRatePerMockInterviewMin
        ? "Min expected rate is required"
        : "";
      errors.ExpectedRatePerMockInterviewMax = !interviewDetailsData.ExpectedRatePerMockInterviewMax
        ? "Max expected rate is required"
        : "";
      errors.NoShowPolicy = !interviewDetailsData.NoShowPolicy ? "No-show policy selection is required" : "";
    }
  }

  if (step === 3) {
    const { availabilityDetailsData } = params;
    const hasValidTimeSlot = availabilityDetailsData.Availability && Object.values(availabilityDetailsData.Availability).some((dayTimes) =>
      dayTimes.some((timeSlot) => timeSlot.startTime && timeSlot.endTime && timeSlot.startTime !== "unavailable")
    );

    errors.TimeSlot = !hasValidTimeSlot ? 'At least one valid time slot is required' : '';
    errors.TimeZone = !availabilityDetailsData.TimeZone ? 'Time Zone is required' : '';
    errors.PreferredDuration = !availabilityDetailsData.PreferredDuration ? 'Preferred Interview Duration is required' : '';
  }

  // Log errors object
  console.log("Errors valid:", errors);

  // Check for any errors
  hasError = Object.values(errors).some((error) => error !== '');

  // Update errors state if there are errors
  if (setErrors) {
    setErrors((prev) => ({ ...prev, ...errors }));
  }

  // Return true if no errors, otherwise false
  return !hasError;
};