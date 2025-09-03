const Joi = require("joi");

// STEP 0: Basic details
const basicDetailsSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  lastName: Joi.string().required().messages({
    "string.empty": "Last name is required",
  }),
  phone: Joi.string().required().messages({
    "string.empty": "Phone number is required",
  }),
  linkedinUrl: Joi.string().uri().required().messages({
    "string.empty": "LinkedIn URL is required",
    "string.uri": "Invalid LinkedIn URL",
  }),
  firstName: Joi.string().allow("", null),
  profileId: Joi.string().allow("", null),
  countryCode: Joi.string().allow("", null),
  portfolioUrl: Joi.string().allow("", null),
  dateOfBirth: Joi.date().optional().allow("", null, ""),
  gender: Joi.string().allow("", null),
});

// STEP 1: Additional professional details
const additionalDetailsSchema = Joi.object({
  currentRole: Joi.string().required().messages({
    "string.empty": "Current role is required",
  }),
  industry: Joi.string().required().messages({
    "string.empty": "Industry is required",
  }),
  yearsOfExperience: Joi.number().required().messages({
    "any.required": "Years of experience is required",
  }),
  location: Joi.string().required().messages({
    "string.empty": "Location is required",
  }),
  coverLetterdescription: Joi.string().allow("", null),
  resume: Joi.string().allow("", null),
  coverLetter: Joi.string().allow("", null),
});

// STEP 2: Interview details
const interviewDetailsSchema = Joi.object({
  skills: Joi.array().items(Joi.string().required()).min(1).messages({
    "array.min": "Skills are required",
  }),
  technologies: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "Technologies are required",
  }),
  previousInterviewExperience: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid("yes", "no"))
    .required()
    .messages({
      "any.required": "Previous interview experience is required",
    }),
  previousInterviewExperienceYears: Joi.number().optional(),
  hourlyRate: Joi.number().optional(),
  interviewFormatWeOffer: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "At least one interview format is required",
  }),
  expectedRatePerMockInterview: Joi.number().optional(),
  noShowPolicy: Joi.string().required().messages({
    "string.empty": "No-show policy is required",
  }),
  professionalTitle: Joi.string().trim().min(50).max(100).required().messages({
    "string.empty": "Professional title is required",
    "string.min": "Professional title must be at least 50 characters",
    "string.max": "Professional title cannot exceed 100 characters",
  }),
  bio: Joi.string().trim().min(150).required().messages({
    "string.empty": "Professional bio is required",
    "string.min": "Professional bio must be at least 150 characters",
  }),
});

// STEP 3: Availability
const availabilitySchema = Joi.object({
  timeZone: Joi.string().required().messages({
    "string.empty": "Timezone is required",
  }),
  preferredDuration: Joi.string().required().messages({
    "string.empty": "Preferred duration is required",
  }),
});

// --- Wrapper validation by step ---
function validateIndividualSignup(step, data) {
  let schema;
  let stepData = {};

  if (step === 0) {
    schema = basicDetailsSchema;
    stepData = {
      email: data.email,
      lastName: data.lastName,
      phone: data.phone,
      linkedinUrl: data.linkedinUrl,
      firstName: data.firstName,
      profileId: data.profileId,
      countryCode: data.countryCode,
      portfolioUrl: data.portfolioUrl,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
    };
  } else if (step === 1) {
    schema = additionalDetailsSchema;
    stepData = {
      currentRole: data.currentRole,
      industry: data.industry,
      yearsOfExperience: data.yearsOfExperience,
      location: data.location,
      coverLetterdescription: data.coverLetterdescription,
      resume: data.resume,
      coverLetter: data.coverLetter,
    };
  } else if (step === 2) {
    schema = interviewDetailsSchema;
    stepData = {
      skills: data.skills,
      technologies: data.technologies,
      previousInterviewExperience: data.PreviousExperienceConductingInterviews || data.previousInterviewExperience,
      previousInterviewExperienceYears: data.PreviousExperienceConductingInterviewsYears || data.previousInterviewExperienceYears,
      hourlyRate: data.hourlyRate,
      interviewFormatWeOffer: data.InterviewFormatWeOffer || data.interviewFormatWeOffer,
      expectedRatePerMockInterview: data.expectedRatePerMockInterview,
      noShowPolicy: data.NoShowPolicy || data.noShowPolicy,
      professionalTitle: data.professionalTitle,
      bio: data.bio,
    };
  } else if (step === 3) {
    schema = availabilitySchema;
    stepData = {
      timeZone: data.timeZone,
      preferredDuration: data.preferredDuration,
    };
  } else {
    return { error: null }; // no validation
  }

  return schema.validate(stepData, { abortEarly: false, allowUnknown: true });
}

module.exports = {
  validateIndividualSignup,
};
