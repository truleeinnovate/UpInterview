// validations/mockInterviewValidation.js
const Joi = require('joi');

const roundSchema = Joi.object({
  _id: Joi.string().optional(),
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
    "Draft",
    "RequestSent",
    "Scheduled",
    "InProgress",
    "Completed",
    "InCompleted",
    "Rescheduled",
    "Rejected",
    "Selected",
    "Cancelled",
    "Incomplete",
    "NoShow"
  ).optional(),
  currentAction: Joi.string().optional(),
  currentActionReason: Joi.string().optional()
});

// ✅ PAGE 1 VALIDATION - Without rounds (used for "Save & Next" on Page 1)
const mockInterviewPage1Schema = Joi.object({
  _id: Joi.string().optional(),
  skills: Joi.array().items(
    Joi.object({
      skill: Joi.string().required(),
      experience: Joi.string().required(),
      expertise: Joi.string().required()
    })
  ).min(1).required().messages({
    'array.min': 'At least one skill is required'
  }),
  ownerId: Joi.string().required(),
  tenantId: Joi.string().required(),
  candidateName: Joi.string().required().messages({
    'string.empty': 'Candidate name is required'
  }),
  higherQualification: Joi.string().required().messages({
    'string.empty': 'Higher qualification is required'
  }),
  currentExperience: Joi.string().required().messages({
    'string.empty': 'Current experience is required'
  }),
  technology: Joi.string().required().messages({
    'string.empty': 'Technology is required'
  }),
  Role: Joi.string().required().messages({
    'string.empty': 'Role is required'
  }),
  jobDescription: Joi.string().allow('').optional(),
  // Rounds are optional for Page 1
  rounds: Joi.array().items(roundSchema).optional(),
  createdById: Joi.string().optional(),
  lastModifiedById: Joi.string().optional()
});

// ✅ FULL VALIDATION - With rounds (used for final submission on Page 2)
const mockInterviewFullSchema = Joi.object({
  _id: Joi.string().optional(),
  skills: Joi.array().items(
    Joi.object({
      skill: Joi.string().required(),
      experience: Joi.string().required(),
      expertise: Joi.string().required()
    })
  ).min(1).required(),
  ownerId: Joi.string().required(),
  tenantId: Joi.string().required(),
  candidateName: Joi.string().required(),
  higherQualification: Joi.string().required(),
  currentExperience: Joi.string().required(),
  technology: Joi.string().required(),
  Role: Joi.string().required(),
  jobDescription: Joi.string().allow('').optional(),
  // Rounds are required for full submission
  rounds: Joi.array().items(roundSchema).min(1).optional().messages({
    'array.min': 'At least one round is required for scheduling'
  }),
  createdById: Joi.string().optional(),
  lastModifiedById: Joi.string().optional()
});

// ✅ UPDATE VALIDATION - Very flexible (for PATCH operations)
const mockInterviewUpdateSchema = Joi.object({
  _id: Joi.string().optional(),
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
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// ✅ Main validation function - AUTO-DETECTS which schema to use
exports.validateMockInterview = (data) => {
  // If rounds exist and have data, use full validation
  // Otherwise use Page 1 validation
  const hasRounds = data.rounds && Array.isArray(data.rounds) && data.rounds.length > 0;
  const schema = hasRounds ? mockInterviewFullSchema : mockInterviewPage1Schema;
  
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => {
      const field = detail.path.join('.');
      return `${field}: ${detail.message}`;
    }) : [],
    validatedData: value
  };
};

// ✅ Update validation function
exports.validateMockInterviewUpdate = (data) => {
  const { error, value } = mockInterviewUpdateSchema.validate(data, { abortEarly: false });
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => {
      const field = detail.path.join('.');
      return `${field}: ${detail.message}`;
    }) : [],
    validatedData: value
  };
};

// ✅ Optional: Explicit Page 1 validation (if you want to call it separately)
exports.validateMockInterviewPage1 = (data) => {
  const { error, value } = mockInterviewPage1Schema.validate(data, { abortEarly: false });
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => {
      const field = detail.path.join('.');
      return `${field}: ${detail.message}`;
    }) : [],
    validatedData: value
  };
};

// ✅ Optional: Explicit full validation (if you want to call it separately)
exports.validateMockInterviewFull = (data) => {
  const { error, value } = mockInterviewFullSchema.validate(data, { abortEarly: false });
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => {
      const field = detail.path.join('.');
      return `${field}: ${detail.message}`;
    }) : [],
    validatedData: value
  };
};

// // // validations/mockInterviewValidation.js
// // const Joi = require('joi');

// // const roundSchema = Joi.object({
// //   sequence: Joi.number().integer().min(1).optional(),
// //   roundTitle: Joi.string().required(),
// //   interviewMode: Joi.string().required(),
// //   interviewType: Joi.string().valid('instant', 'scheduled').required(),
// //   interviewerType: Joi.string().valid('internal', 'external').required(),
// //   duration: Joi.string().required(),
// //   instructions: Joi.string().allow('').optional(),
// //   dateTime: Joi.string().optional(),
// //   interviewerViewType: Joi.string().optional(),
// //   interviewers: Joi.array().items(Joi.string()).optional(),
// //   status: Joi.string().valid(
// //     'Draft', 'RequestSent', 'Scheduled', 'InProgress', 'Completed', 
// //     'InCompleted', 'Rescheduled', 'Rejected', 'Selected', 'Cancelled', 
// //     'Incomplete', 'NoShow'
// //   ).optional(),
// //   currentAction: Joi.string().optional(),
// //   currentActionReason: Joi.string().optional()
// // });

// // const mockInterviewSchema = Joi.object({
// //   skills: Joi.array().items(
// //     Joi.object({
// //       skill: Joi.string().required(),
// //       experience: Joi.string().required(),
// //       expertise: Joi.string().required()
// //     })
// //   ).required(),
// //   ownerId: Joi.string().required(),
// //   tenantId: Joi.string().required(),
// //   candidateName: Joi.string().required(),
// //   higherQualification: Joi.string().required(),
// //   currentExperience: Joi.string().required(),
// //   technology: Joi.string().required(),
// //   Role: Joi.string().required(),
// //   jobDescription: Joi.string().allow('').optional(),
// //   rounds: Joi.array().items(roundSchema).optional(),
// //   createdById: Joi.string().optional(),
// //   lastModifiedById: Joi.string().optional()
// // });

// // exports.validateMockInterview = (data) => {
// //   const { error, value } = mockInterviewSchema.validate(data, { abortEarly: false });
  
// //   return {
// //     isValid: !error,
// //     errors: error ? error.details.map(detail => detail.message) : [],
// //     validatedData: value
// //   };
// // };



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
//   meetingId: Joi.string().optional(),
//   status: Joi.string().valid(
//     "Draft",
//       "RequestSent",
//       "Scheduled",
//       "InProgress",
//       "Completed",
//       "InCompleted",
//       "Rescheduled",
//       "Rejected",
//       "Selected",
//       "Cancelled",
//       "Incomplete",
//       "NoShow"
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

// // Update validation schema (more flexible for PATCH)
// const mockInterviewUpdateSchema = Joi.object({
//   skills: Joi.array().items(
//     Joi.object({
//       skill: Joi.string().optional(),
//       experience: Joi.string().optional(),
//       expertise: Joi.string().optional()
//     })
//   ).optional(),
//   ownerId: Joi.string().optional(),
//   tenantId: Joi.string().optional(),
//   candidateName: Joi.string().optional(),
//   higherQualification: Joi.string().optional(),
//   currentExperience: Joi.string().optional(),
//   technology: Joi.string().optional(),
//   Role: Joi.string().optional(),
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

// exports.validateMockInterviewUpdate = (data) => {
//   const { error, value } = mockInterviewUpdateSchema.validate(data, { abortEarly: false });
  
//   return {
//     isValid: !error,
//     errors: error ? error.details.map(detail => {
//       // Format error messages for better readability
//       const field = detail.path.join('.');
//       return `${field}: ${detail.message}`;
//     }) : [],
//     validatedData: value
//   };
// };
