
const Joi = require("joi");

 const contactPatchSchema = Joi.object({
  // My Profile
  firstName: Joi.string()
    .trim()
    .min(2)
    .messages({
      "string.empty": "First Name is required",
      "string.min": "First Name must be at least 2 characters",
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .messages({
      "string.empty": "Last Name is required",
      "string.min": "Last Name must be at least 2 characters",
    }),
  email: Joi.string()
    .trim()
    .email({ tlds: false })
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address",
    }),
  profileId: Joi.string()
    .trim()
    .min(2)
    .messages({
      "string.empty": "Profile Id is required",
      "string.min": "Profile Id must be at least 2 characters",
    }),
  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .messages({
      "string.empty": "Phone Number is required",
      "string.pattern.base": "Phone Number must be a valid 10-digit number",
    }),
  linkedinUrl: Joi.string()
    .pattern(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)
    .messages({
      "string.empty": "LinkedIn URL is required",
      "string.pattern.base": "Please enter a valid LinkedIn URL",
    }),

  // Advanced
  currentRole: Joi.string().messages({
    "string.empty": "Current Role is required",
  }),
  industry: Joi.string().messages({
    "string.empty": "Industry is required",
  }),
  yearsOfExperience: Joi.string()
    .pattern(/^\d+$/)
    .messages({
      "string.empty": "Years of Experience is required",
      "string.pattern.base": "Please enter a valid number",
    }),
  location: Joi.string().messages({
    "string.empty": "Location is required",
  }),

  // Interview
  PreviousExperienceConductingInterviews: Joi.string().messages({
    "string.empty": "Please select an option",
  }),
  PreviousExperienceConductingInterviewsYears: Joi.alternatives().conditional(
    "PreviousExperienceConductingInterviews",
    {
      is: "yes",
      then: Joi.string()
        .pattern(/^\d+$/)
        .messages({
          "string.empty": "Years of Experience is required",
          "string.pattern.base": "Enter a Number between 1 and 15",
        }),
      otherwise: Joi.forbidden(),
    }
  ),
  skills: Joi.array().min(1).messages({
    "array.min": "At least one skill is required",
  }),
  technologies: Joi.array().min(1).messages({
    "array.min": "At least one technology is required",
  }),
  hourlyRate: Joi.alternatives().try(
    Joi.number().min(20).max(500),
    Joi.string().allow('').empty('')
  ).messages({
    "number.base": "Hourly rate must be a number",
    "number.min": "Hourly rate must be between $20 and $500",
    "number.max": "Hourly rate must be between $20 and $500",
  }).optional(),
  NoShowPolicy: Joi.string().allow('').empty('').optional().messages({
    "string.empty": "Please select a no-show policy",
  }),
  professionalTitle: Joi.string().min(50).max(100).messages({
    "string.empty": "Professional Title is required",
    "string.min": "Professional Title must be at least 50 characters",
    "string.max": "Professional Title cannot exceed 100 characters",
  }),
  bio: Joi.string().min(150).max(500).messages({
    "string.empty": "Professional Bio is required",
    "string.min": "Bio must be at least 150 characters",
    "string.max": "Bio cannot exceed 500 characters",
  }),
  expectedRatePerMockInterview: Joi.alternatives().when("interviewFormatWeOffer", {
    is: Joi.array().items(Joi.string()).has("mock"),
    then: Joi.alternatives().try(
      Joi.number().min(1),
      Joi.string().allow('').empty('')
    ).messages({
      "number.base": "Expected rate must be a number",
      "number.min": "Rate must be a positive number",
    }),
  }).optional(),

  // Availability
  timeZone: Joi.alternatives().try(
    Joi.string(),
    Joi.object({ value: Joi.string().required() })
  ).messages({
    "any.required": "Time zone is required",
    "object.base": "Please select a valid time zone",
  }),
  preferredDuration: Joi.string().messages({
    "string.empty": "Please select a preferred interview duration",
  }),
}).min(1).unknown(true); // require at least one field

module.exports = {
  
  contactPatchSchema,
};
