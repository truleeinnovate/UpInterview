// Assessment validation using Joi - Matching Frontend Step-wise Validation
const Joi = require("joi");

// Custom ObjectId validation
const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ObjectId");

// Utility function to format Joi errors into a clean object
function formatJoiErrors(error) {
  if (!error) return {};
  const errors = {};
  for (const detail of error.details || []) {
    const key = detail.path?.[0] || "base";
    if (!errors[key]) errors[key] = detail.message.replace(/"/g, "");
  }
  return errors;
}

// Step 1: Basic Details Validation (matching frontend "Basicdetails" tab)
function validateBasicDetails(payload = {}) {
  const schema = Joi.object({
    AssessmentTitle: Joi.string().trim().min(1).max(200).required().messages({
      "string.empty": "Assessment Title is required",
      "string.max": "Assessment Title cannot exceed 200 characters",
      "any.required": "Assessment Title is required",
    }),

    DifficultyLevel: Joi.string()
      .valid("Easy", "Medium", "Hard")
      .required()
      .messages({
        "any.only": "Difficulty Level is required",
        "any.required": "Difficulty Level is required",
      }),

    NumberOfQuestions: Joi.number()
      .integer()
      .min(1)
      .max(500)
      .required()
      .messages({
        "number.base": "Number of Questions is required",
        "number.min": "Number of Questions must be at least 1",
        "number.max": "Number of Questions cannot exceed 500",
        "any.required": "Number of Questions is required",
      }),

    categoryOrTechnology: Joi.string()
      .trim()
      .min(1)
      .max(30)
      .required()
      .messages({
        "string.empty": "Category/Technology is required",
        "string.max": "Category/Technology cannot exceed 30 characters",
        "any.required": "Category/Technology is required",
      }),

    // Optional fields for Basic Details
    Position: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .allow(null, "")
      .optional(),

    Duration: Joi.string().trim().allow("", null).optional(),
    ExpiryDate: Joi.date().iso().allow("", null).optional(),
    linkExpiryDays: Joi.number()
      .integer()
      .min(1)
      .max(365)
      .allow(null)
      .optional(),
    status: Joi.string().valid("Active", "Inactive").optional(),
  }).unknown(true); // Allow other fields to pass through

  const { error } = schema.validate(payload, { abortEarly: false });
  const errors = formatJoiErrors(error);
  return { errors, isValid: Object.keys(errors).length === 0 };
}

// Step 2: Details Validation (matching frontend "Details" tab)
function validateDetails(payload = {}) {
  const schema = Joi.object({
    // Instructions validation - matching frontend exactly
    instructions: Joi.string()
      .trim()
      .allow("", null)
      .optional()
      .custom((value, helpers) => {
        if (value !== null && value !== undefined && value !== "") {
          const trimmedValue = value.trim();
          if (trimmedValue.length === 0) {
            return helpers.error("custom.empty");
          }
          if (trimmedValue.length < 500) {
            return helpers.error("custom.min");
          }
          if (trimmedValue.length > 2000) {
            return helpers.error("custom.max");
          }
        }
        return value;
      })
      .messages({
        "custom.empty": "Instructions cannot be empty.",
        "custom.min": "Instructions must be at least 500 characters.",
        "custom.max": "Instructions cannot exceed 2000 characters.",
      }),

    // Also validate Instructions (capital I) for consistency
    Instructions: Joi.string()
      .trim()
      .allow("", null)
      .optional()
      .custom((value, helpers) => {
        if (value !== null && value !== undefined && value !== "") {
          const trimmedValue = value.trim();
          if (trimmedValue.length === 0) {
            return helpers.error("custom.empty");
          }
          if (trimmedValue.length < 500) {
            return helpers.error("custom.min");
          }
          if (trimmedValue.length > 2000) {
            return helpers.error("custom.max");
          }
        }
        return value;
      })
      .messages({
        "custom.empty": "Instructions cannot be empty.",
        "custom.min": "Instructions must be at least 500 characters.",
        "custom.max": "Instructions cannot exceed 2000 characters.",
      }),

    AdditionalNotes: Joi.string().trim().max(1000).allow("", null).optional(),

    CandidateDetails: Joi.object({
      includePosition: Joi.boolean().optional(),
      includePhone: Joi.boolean().optional(),
      includeSkills: Joi.boolean().optional(),
    }).optional(),
  }).unknown(true); // Allow other fields to pass through

  const { error } = schema.validate(payload, { abortEarly: false });
  const errors = formatJoiErrors(error);

  // Map errors from 'Instructions' to 'instructions' for frontend compatibility
  if (errors.Instructions && !errors.instructions) {
    errors.instructions = errors.Instructions;
    delete errors.Instructions;
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

// Step 3: Questions Validation (matching frontend "Questions" tab)
function validateQuestions(payload = {}) {
  const schema = Joi.object({
    // Pass score validation
    passScore: Joi.number().min(0).allow(null, "").optional().messages({
      "number.min": "Pass Score must be a positive number",
    }),

    totalScore: Joi.number().min(0).allow(null, "").optional().messages({
      "number.min": "Total Score must be a positive number",
    }),

    passScoreType: Joi.string()
      .valid("Percentage", "Number")
      .allow("", null)
      .optional(),

    passScoreBy: Joi.string()
      .valid("Overall", "Each Section")
      .allow("", null)
      .optional(),

    // Questions array validation would go here if needed
    questions: Joi.array().optional(),
    addedSections: Joi.array().optional(),
  }).unknown(true); // Allow other fields to pass through

  const { error, value } = schema.validate(payload, { abortEarly: false });
  let errors = formatJoiErrors(error);

  // Custom validation for pass score
  if (value?.passScore !== undefined && value?.totalScore !== undefined) {
    const passScore = Number(value.passScore);
    const totalScore = Number(value.totalScore);

    if (!Number.isNaN(passScore) && !Number.isNaN(totalScore)) {
      if (value.passScoreType === "Number" && passScore > totalScore) {
        errors.passScore = "Pass Score cannot be greater than Total Score";
      }
      if (value.passScoreType === "Percentage" && passScore > 100) {
        errors.passScore = "Pass Score percentage cannot be greater than 100";
      }
    }
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

// Common fields validation (fields that are always validated)
function validateCommonFields(payload = {}) {
  const schema = Joi.object({
    ownerId: Joi.string().allow("", null).optional(),
    tenantId: Joi.string().allow("", null).optional(),
    externalId: Joi.string().allow("", null).optional(),

    // System fields
    status: Joi.string()
      .valid("Active", "Inactive")
      .default("Active")
      .optional()
      .messages({
        "any.only": "Status must be either Active or Inactive",
      }),

    CreatedBy: Joi.string().allow("", null).optional(),
    ModifiedBy: Joi.string().allow("", null).optional(),
    ModifiedDate: Joi.date().iso().allow(null).optional(),

    AssessmentCode: Joi.string()
      .regex(/^ASMT-TPL-\d{5}$/)
      .allow("", null)
      .optional()
      .messages({
        "string.pattern.base":
          "Assessment Code must be in format ASMT-TPL-00001",
      }),
  }).unknown(true); // Allow other fields to pass through

  const { error } = schema.validate(payload, { abortEarly: false });
  const errors = formatJoiErrors(error);

  return { errors, isValid: Object.keys(errors).length === 0 };
}

// Main validation function that validates based on tab/step
function validateAssessmentByTab(payload = {}, tab = "all") {
  let errors = {};
  let isValid = true;

  switch (tab) {
    case "Basicdetails":
      const basicValidation = validateBasicDetails(payload);
      errors = { ...errors, ...basicValidation.errors };
      isValid = isValid && basicValidation.isValid;
      break;

    case "Details":
      const detailsValidation = validateDetails(payload);
      errors = { ...errors, ...detailsValidation.errors };
      isValid = isValid && detailsValidation.isValid;
      break;

    case "Questions":
      const questionsValidation = validateQuestions(payload);
      errors = { ...errors, ...questionsValidation.errors };
      isValid = isValid && questionsValidation.isValid;
      break;

    case "all":
    default:
      // Validate all tabs
      const allBasic = validateBasicDetails(payload);
      const allDetails = validateDetails(payload);
      const allQuestions = validateQuestions(payload);

      errors = {
        ...allBasic.errors,
        ...allDetails.errors,
        ...allQuestions.errors,
      };

      isValid = allBasic.isValid && allDetails.isValid && allQuestions.isValid;
      break;
  }

  // Validate common fields
  const commonValidation = validateCommonFields(payload);
  errors = { ...errors, ...commonValidation.errors };
  isValid = isValid && commonValidation.isValid;

  // Always check for ownerId or tenantId
  if (!payload?.ownerId && !payload?.tenantId) {
    errors.ownerId = "Either ownerId or tenantId is required";
    errors.tenantId = "Either tenantId or ownerId is required";
    isValid = false;
  }

  return { errors, isValid };
}

// Complete validation for creating a new assessment
function validateCreateAssessment(payload = {}) {
  return validateAssessmentByTab(payload, "all");
}

// Validation for updating an existing assessment
function validateUpdateAssessment(payload = {}) {
  // For updates, validate only the fields that are provided
  // Use the same validation as create but allow partial updates
  return validateAssessmentByTab(payload, "all");
}

// Validation for scheduled assessment (placeholder for now)
function validateScheduledAssessment(payload = {}) {
  const schema = Joi.object({
    assessmentId: objectId.required().messages({
      "any.required": "Assessment ID is required",
      "string.pattern.base": "Invalid Assessment ID format",
    }),

    // organizationId: objectId.required().messages({
    //   "any.required": "Organization ID is required",
    //   "string.pattern.base": "Invalid Organization ID format",
    // }),

    expiryAt: Joi.date().iso().min("now").allow(null).optional().messages({
      "date.min": "Expiry date must be in the future",
      "date.base": "Invalid expiry date format",
    }),

    status: Joi.string()
      .valid("scheduled", "cancelled", "completed", "expired", "failed")
      .default("scheduled")
      .optional()
      .messages({
        "any.only": "Invalid status value",
      }),

    createdBy: objectId.required().messages({
      "any.required": "Created By user ID is required",
      "string.pattern.base": "Invalid Created By ID format",
    }),
  });

  const { error } = schema.validate(payload, {
    abortEarly: false,
    allowUnknown: true,
  });
  const errors = formatJoiErrors(error);

  return { errors, isValid: Object.keys(errors).length === 0 };
}

// Validation for candidate assessment (placeholder for now)
function validateCandidateAssessment(payload = {}) {
  const schema = Joi.object({
    candidateId: objectId.required().messages({
      "any.required": "Candidate ID is required",
      "string.pattern.base": "Invalid Candidate ID format",
    }),

    scheduledAssessmentId: objectId.optional().messages({
      "string.pattern.base": "Invalid Scheduled Assessment ID format",
    }),

    status: Joi.string()
      .valid("pending", "started", "completed", "expired", "failed")
      .default("pending")
      .optional(),
  });

  const { error } = schema.validate(payload, {
    abortEarly: false,
    allowUnknown: true,
  });
  const errors = formatJoiErrors(error);

  return { errors, isValid: Object.keys(errors).length === 0 };
}

// Export all validation functions
module.exports = {
  // Tab-based validation functions
  validateAssessmentByTab,
  validateBasicDetails,
  validateDetails,
  validateQuestions,
  validateCommonFields,

  // Main validation functions
  validateCreateAssessment,
  validateUpdateAssessment,
  validateScheduledAssessment,
  validateCandidateAssessment,
};
