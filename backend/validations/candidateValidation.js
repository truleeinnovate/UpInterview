// backend/validations/candidateValidation.js
const Joi = require("joi");

const candidateValidationSchema = Joi.object({
  FirstName: Joi.string().required().messages({
    "string.empty": "First Name is required",
    "any.required": "First Name is required",
  }),
  LastName: Joi.string().required().messages({
    "string.empty": "Last Name is required",
    "any.required": "Last Name is required",
  }),
  Email: Joi.string().email().required().messages({
    "string.email": "Invalid Email address",
    "any.required": "Email is required",
  }),
  Phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone Number is required",
      "string.pattern.base": "Invalid Phone number",
      "any.required": "Phone Number is required",
    }),
  CountryCode: Joi.string().required().messages({
    "string.empty": "Country Code is required",
    "any.required": "Country Code is required",
  }),
  // Date_Of_Birth: Joi.date().optional(),
  Date_Of_Birth: Joi.date()
    .optional() // ✅ Changed to optional
    .allow(null, ""),
  Gender: Joi.string().optional().allow("", null),
  // Gender: Joi.string().optional()
  // .messages({
  //   "string.empty": "Gender is required",
  //   "any.required": "Gender is required",
  // })
  HigherQualification: Joi.string().required().messages({
    "string.empty": "Higher Qualification is required",
    "any.required": "Higher Qualification is required",
  }),
  UniversityCollege: Joi.string().optional().allow(null, ""),
  // .messages({
  //   "string.empty": "University/College is required",
  //   "any.required": "University/College is required",
  // })
  CurrentExperience: Joi.number().required().messages({
    "number.base": "Current Experience must be a number",
    "any.required": "Current Experience is required",
  }),
  RelevantExperience: Joi.number().required().messages({
    "number.base": "Relevant Experience must be a number",
    "any.required": "Relevant Experience is required",
  }),
  CurrentRole: Joi.string().required().messages({
    "string.empty": "Current Role is required",
    "any.required": "Current Role is required",
  }),

  // ── NEW FIELDS ───────────────────────────────────────────────────────
  location: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow("", null),

  minSalary: Joi.number()
    .min(0)
    .optional()
    .allow(null, ""),

  maxSalary: Joi.number()
    .min(Joi.ref("minSalary")) // optional: enforce max >= min
    .optional()
    .allow(null, ""),

  languages: Joi.array()
    .items(Joi.string().trim().max(100))
    .optional()
    .allow(null),

  certifications: Joi.array()
    .items(Joi.string().trim().max(200))
    .optional()
    .allow(null),

  noticePeriod: Joi.string()
    .valid(
      "Immediate",
      "7days",
      "15days",
      "30days",
      "45days",
      "60days",
      "90days",
      "Morethan90days",
      "Negotiable"
    )
    .optional()
    .allow("", null)
    .messages({
      "any.only": "Invalid notice period value",
    }),
  // Technology: Joi.string().required().messages({
  //   "string.empty": "Technology is required",
  //   "any.required": "Technology is required",
  // }),
  //   PositionId: Joi.string().required().messages({
  //     "string.empty": "Position is required",
  //     "any.required": "Position is required",
  //   }),
  ownerId: Joi.string().optional().messages({
    "any.required": "OwnerId is required",
  }),
  tenantId: Joi.string().optional(),

  skills: Joi.array()
    .items(
      Joi.object({
        skill: Joi.string().required(),
        experience: Joi.string().required(),
        expertise: Joi.string().required(),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one skill is required",
      "any.required": "Skills are required",
    }),
  externalId: Joi.string().optional().allow("", null),
  linkedInUrl: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .pattern(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)
    .optional()
    .allow("", null)
    .messages({
      "string.uri": "Invalid LinkedIn URL",
      "string.pattern.base": "Please enter a valid LinkedIn profile URL",
    }),

  professionalSummary: Joi.string()
    .min(200)
    .max(1500)
    .optional()
    .allow("", null)
    .messages({
      "string.min": "Professional Summary must be at least 200 characters",
      "string.max": "Professional Summary cannot exceed 1500 characters",
    }),

  keyAchievements: Joi.string()
    .min(150)
    .max(1000)
    .optional()
    .allow("", null)
    .messages({
      "string.min": "Key Achievements must be at least 150 characters",
      "string.max": "Key Achievements cannot exceed 1000 characters",
    }),

  workExperience: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().optional(),
        projectName: Joi.string().optional().allow(""),
        role: Joi.string().optional().allow(""),
        fromDate: Joi.string().optional().allow(""),
        toDate: Joi.string().optional().allow(""),
        responsibilities: Joi.string()
          .min(150)
          .max(1000)
          .optional()
          .allow("")
          .messages({
            "string.min": "Responsibilities must be at least 150 characters",
            "string.max": "Responsibilities cannot exceed 1000 characters",
          }),
      })
    )
    .optional(),

  // ────────────────────────────────────────────────────────────────
  // NEW: Allow screening/parsed fields (optional - no error if missing)
  // ────────────────────────────────────────────────────────────────
  screeningData: Joi.object().optional(),
  parsedJson: Joi.object().optional(),
  parsedSkills: Joi.array().items(Joi.string()).optional(),
  parsedExperience: Joi.string().optional().allow(null, ""),
  parsedEducation: Joi.string().optional().allow(null, ""),
  matchPercentage: Joi.number().optional(),
  recommendation: Joi.string().optional().allow(null, ""),
  summary: Joi.string().optional().allow(null, ""),
  matchedSkills: Joi.array().items(Joi.string()).optional(),
  missingSkills: Joi.array().items(Joi.string()).optional(),
}).unknown(true);  // ← optional: allows any other extra fields in future

// 🔹 Add custom validation for RelevantExperience <= CurrentExperience
const validateCandidateData = (data) => {
  const { error, value } = candidateValidationSchema.validate(data, {
    abortEarly: false, // show all errors
  });

  let errors = {};
  if (error) {
    error.details.forEach((err) => {
      errors[err.context.key] = err.message;
    });
  }

  // Cross-field validation
  if (
    value.RelevantExperience &&
    value.CurrentExperience &&
    value.RelevantExperience > value.CurrentExperience
  ) {
    errors.RelevantExperience =
      "Relevant Experience cannot be greater than Current Experience";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// For PATCH (partial updates) → same rules but all fields optional
const candidateUpdateSchema = candidateValidationSchema.fork(
  Object.keys(candidateValidationSchema.describe().keys),
  (schema) => schema.optional(),
);

module.exports = { validateCandidateData, candidateUpdateSchema };
