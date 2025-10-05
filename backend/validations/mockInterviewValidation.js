// // validations/mockInterviewValidation.js
// const Joi = require('joi');

// const roundSchema = Joi.object({
//   sequence: Joi.number().integer().min(1).optional(),
//   roundTitle: Joi.string().required(),
//   interviewMode: Joi.string().required(),
//   interviewType: Joi.string().valid('instant', 'scheduled').required(),
//   interviewerType: Joi.string().valid('internal', 'external').required(),
//   duration: Joi.string().required(),
//   instructions: Joi.string().allow('').optional(),
//   dateTime: Joi.string().optional(),
//   interviewerViewType: Joi.string().optional(),
//   interviewers: Joi.array().items(Joi.string()).optional(),
//   status: Joi.string().valid(
//     'Draft', 'RequestSent', 'Scheduled', 'InProgress', 'Completed', 
//     'InCompleted', 'Rescheduled', 'Rejected', 'Selected', 'Cancelled', 
//     'Incomplete', 'NoShow'
//   ).optional(),
//   currentAction: Joi.string().optional(),
//   currentActionReason: Joi.string().optional()
// });

// const mockInterviewSchema = Joi.object({
//   skills: Joi.array().items(
//     Joi.object({
//       skill: Joi.string().required(),
//       experience: Joi.string().required(),
//       expertise: Joi.string().required()
//     })
//   ).required(),
//   ownerId: Joi.string().required(),
//   tenantId: Joi.string().required(),
//   candidateName: Joi.string().required(),
//   higherQualification: Joi.string().required(),
//   currentExperience: Joi.string().required(),
//   technology: Joi.string().required(),
//   Role: Joi.string().required(),
//   jobDescription: Joi.string().allow('').optional(),
//   rounds: Joi.array().items(roundSchema).optional(),
//   createdById: Joi.string().optional(),
//   lastModifiedById: Joi.string().optional()
// });

// exports.validateMockInterview = (data) => {
//   const { error, value } = mockInterviewSchema.validate(data, { abortEarly: false });
  
//   return {
//     isValid: !error,
//     errors: error ? error.details.map(detail => detail.message) : [],
//     validatedData: value
//   };
// };



// validations/mockInterviewValidation.js
const Joi = require('joi');

const roundSchema = Joi.object({
  sequence: Joi.number().integer().min(1).optional(),
  roundTitle: Joi.string().required(),
  interviewMode: Joi.string().required(),
  interviewType: Joi.string().valid('instant', 'scheduled').required(),
  interviewerType: Joi.string().valid('internal', 'external').required(),
  duration: Joi.string().required(),
  instructions: Joi.string().allow('').optional(),
  dateTime: Joi.string().optional(),
  interviewerViewType: Joi.string().optional(),
  interviewers: Joi.array().items(Joi.string()).optional(),
  meetingId: Joi.string().optional(),
  status: Joi.string().valid(
    'Draft', 'RequestSent', 'Scheduled', 'InProgress', 'Completed', 
    'InCompleted', 'Rescheduled', 'Rejected', 'Selected', 'Cancelled', 
    'Incomplete', 'NoShow'
  ).optional(),
  currentAction: Joi.string().optional(),
  currentActionReason: Joi.string().optional()
});

const mockInterviewSchema = Joi.object({
  skills: Joi.array().items(
    Joi.object({
      skill: Joi.string().required(),
      experience: Joi.string().required(),
      expertise: Joi.string().required()
    })
  ).required(),
  ownerId: Joi.string().required(),
  tenantId: Joi.string().required(),
  candidateName: Joi.string().required(),
  higherQualification: Joi.string().required(),
  currentExperience: Joi.string().required(),
  technology: Joi.string().required(),
  Role: Joi.string().required(),
  jobDescription: Joi.string().allow('').optional(),
  rounds: Joi.array().items(roundSchema).optional(),
  createdById: Joi.string().optional(),
  lastModifiedById: Joi.string().optional()
});

// Update validation schema (more flexible for PATCH)
const mockInterviewUpdateSchema = Joi.object({
  skills: Joi.array().items(
    Joi.object({
      skill: Joi.string().optional(),
      experience: Joi.string().optional(),
      expertise: Joi.string().optional()
    })
  ).optional(),
  ownerId: Joi.string().optional(),
  tenantId: Joi.string().optional(),
  candidateName: Joi.string().optional(),
  higherQualification: Joi.string().optional(),
  currentExperience: Joi.string().optional(),
  technology: Joi.string().optional(),
  Role: Joi.string().optional(),
  jobDescription: Joi.string().allow('').optional(),
  rounds: Joi.array().items(roundSchema).optional(),
  createdById: Joi.string().optional(),
  lastModifiedById: Joi.string().optional()
});

exports.validateMockInterview = (data) => {
  const { error, value } = mockInterviewSchema.validate(data, { abortEarly: false });
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => detail.message) : [],
    validatedData: value
  };
};

exports.validateMockInterviewUpdate = (data) => {
  const { error, value } = mockInterviewUpdateSchema.validate(data, { abortEarly: false });
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => {
      // Format error messages for better readability
      const field = detail.path.join('.');
      return `${field}: ${detail.message}`;
    }) : [],
    validatedData: value
  };
};


// // backend/validations/mockInterviewValidation.js
// const Joi = require("joi");

// // Schema for skill validation
// const skillSchema = Joi.object({
//   skill: Joi.string().required().messages({
//     "string.empty": "Skill is required",
//     "any.required": "Skill is required",
//   }),
//   experience: Joi.string().required().messages({
//     "string.empty": "Experience is required",
//     "any.required": "Experience is required",
//   }),
//   expertise: Joi.string().required().messages({
//     "string.empty": "Expertise is required",
//     "any.required": "Expertise is required",
//   }),
// });

// // Schema for round validation
// const roundSchema = Joi.object({
//   roundTitle: Joi.string().required().messages({
//     "string.empty": "Round Title is required",
//     "any.required": "Round Title is required",
//   }),
//   interviewMode: Joi.string().required().messages({
//     "string.empty": "Interview Mode is required",
//     "any.required": "Interview Mode is required",
//   }),
//   interviewerType: Joi.string().optional().allow("", null),
//   duration: Joi.string().optional().allow("", null),
//   instructions: Joi.string().optional().allow("", null),
//   interviewType: Joi.string().required().messages({
//     "string.empty": "Interview Type is required",
//     "any.required": "Interview Type is required",
//   }),
//   interviewers: Joi.array().items(Joi.string()).optional(),
//   status: Joi.string().optional().allow("", null),
//   meetingId:Joi.string().optional().allow("", null),
//   dateTime: Joi.when("interviewType", {
//     is: "scheduled",
//     then: Joi.string().required().messages({
//       "string.empty": "Date & Time is required for scheduled interviews",
//       "any.required": "Date & Time is required for scheduled interviews",
//     }),
//     otherwise: Joi.string().optional().allow("", null),
//   }),
// }).unknown(true);

// // Main mock interview validation schema
// const mockInterviewValidationSchema = Joi.object({
//   candidateName: Joi.string().required().messages({
//     "string.empty": "Candidate Name is required",
//     "any.required": "Candidate Name is required",
//   }),
//   higherQualification: Joi.string().required().messages({
//     "string.empty": "Higher Qualification is required",
//     "any.required": "Higher Qualification is required",
//   }),
//   currentExperience: Joi.number()
//     .min(1)
//     .max(15)
//     .required()
//     .messages({
//       "number.base": "Experience must be a number",
//       "number.min": "Experience must be at least 1 year",
//       "number.max": "Experience cannot exceed 15 years",
//       "any.required": "Experience is required",
//     }),
//   technology: Joi.string().required().messages({
//     "string.empty": "Technology is required",
//     "any.required": "Technology is required",
//   }),
//   Role: Joi.string().required().messages({
//     "string.empty": "Role is required",
//     "any.required": "Role is required",
//   }),
//   jobDescription: Joi.string().optional().allow("", null),
//   skills: Joi.array()
//     .items(skillSchema)
//     .min(1)
//     .required()
//     .messages({
//       "array.min": "At least one skill is required",
//       "any.required": "Skills are required",
//     }),
//   rounds: Joi.array()
//     .items(roundSchema)
//     .min(1)
//     .required()
//     .messages({
//       "array.min": "At least one round is required",
//       "any.required": "Rounds are required",
//     }),
//   resume: Joi.object({
//     filename: Joi.string().optional(),
//     path: Joi.string().optional(),
//     contentType: Joi.string().optional(),
//     publicId: Joi.string().optional(),
//     fileSize: Joi.number().optional(),
//     uploadDate: Joi.date().optional(),
//   }).optional(),
//   mockInterviewCode: Joi.string().optional(),
//   createdBy: Joi.string().optional(),
//   updatedBy: Joi.string().optional(),
//   createdById: Joi.string().optional(), // Frontend sends this, maps to createdBy
//   lastModifiedById: Joi.string().optional(), // Frontend sends this, maps to updatedBy
//   ownerId: Joi.string().optional(),
//   tenantId: Joi.string().optional(),
// });

// // Page 1 validation (Candidate Details) - for step-wise validation
// const mockInterviewPage1Schema = Joi.object({
//   candidateName: Joi.string().required().messages({
//     "string.empty": "Candidate Name is required",
//     "any.required": "Candidate Name is required",
//   }),
//   higherQualification: Joi.string().required().messages({
//     "string.empty": "Higher Qualification is required",
//     "any.required": "Higher Qualification is required",
//   }),
//   currentExperience: Joi.number()
//     .min(1)
//     .max(15)
//     .required()
//     .messages({
//       "number.base": "Experience must be a number",
//       "number.min": "Experience must be at least 1 year",
//       "number.max": "Experience cannot exceed 15 years",
//       "any.required": "Experience is required",
//     }),
//   technology: Joi.string().required().messages({
//     "string.empty": "Technology is required",
//     "any.required": "Technology is required",
//   }),
//   Role: Joi.string().required().messages({
//     "string.empty": "Role is required",
//     "any.required": "Role is required",
//   }),
//   skills: Joi.array()
//     .items(skillSchema)
//     .min(1)
//     .required()
//     .messages({
//       "array.min": "At least one skill is required",
//       "any.required": "Skills are required",
//     }),
// }).unknown(true); // Allow other fields for partial validation

// // Validation helper function
// const validateMockInterview = (data, isPage1Only = false) => {
//   const schema = isPage1Only ? mockInterviewPage1Schema : mockInterviewValidationSchema;
//   const { error, value } = schema.validate(data, { abortEarly: false });
  
//   if (error) {
//     const errors = {};
//     error.details.forEach((err) => {
//       // Handle nested field paths (e.g., "rounds.0.roundTitle" -> "rounds.roundTitle")
//       let field = err.path.join(".");
      
//       // For array field validation, simplify the path
//       if (field.includes(".0.")) {
//         field = field.replace(/\.\d+\./g, ".");
//       }
      
//       errors[field] = err.message;
//     });
    
//     return { 
//       isValid: false, 
//       errors,
//       message: "Validation failed"
//     };
//   }
  
//   return { 
//     isValid: true, 
//     value,
//     message: "Validation successful"
//   };
// };

// // Update validation schema (allows partial updates)
// const mockInterviewUpdateSchema = Joi.object({
//   candidateName: Joi.string().optional(),
//   higherQualification: Joi.string().optional(),
//   currentExperience: Joi.number()
//     .min(1)
//     .max(15)
//     .optional()
//     .messages({
//       "number.base": "Experience must be a number",
//       "number.min": "Experience must be at least 1 year",
//       "number.max": "Experience cannot exceed 15 years",
//     }),
//   technology: Joi.string().optional(),
//   Role: Joi.string().optional(),
//   jobDescription: Joi.string().optional().allow("", null),
//   skills: Joi.array()
//     .items(skillSchema)
//     .min(1)
//     .optional()
//     .messages({
//       "array.min": "At least one skill is required",
//     }),
//   rounds: Joi.array()
//     .items(roundSchema)
//     .min(1)
//     .optional()
//     .messages({
//       "array.min": "At least one round is required",
//     }),
//   resume: Joi.object({
//     filename: Joi.string().optional(),
//     path: Joi.string().optional(),
//     contentType: Joi.string().optional(),
//     publicId: Joi.string().optional(),
//     fileSize: Joi.number().optional(),
//     uploadDate: Joi.date().optional(),
//   }).optional(),
//   mockInterviewCode: Joi.string().optional(),
//   updatedBy: Joi.string().optional(),
//   createdById: Joi.string().optional(), // Frontend sends this, maps to createdBy
//   lastModifiedById: Joi.string().optional(), // Frontend sends this, maps to updatedBy
// });

// module.exports = {
//   mockInterviewValidationSchema,
//   mockInterviewUpdateSchema,
//   mockInterviewPage1Schema,
//   validateMockInterview,
//   skillSchema,
//   roundSchema,
// };
