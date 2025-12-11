// validations/mockInterviewValidation.js - FIXED VERSION
const Joi = require("joi");

// ✅ BASE ROUND SCHEMA - Flexible for both POST and PATCH
const baseRoundSchema = Joi.object({
  _id: Joi.string().optional(),
  sequence: Joi.number().integer().min(1).optional(),
  roundTitle: Joi.string().optional(),
  interviewMode: Joi.string().optional(),
  interviewType: Joi.string().valid("instant", "scheduled").optional(),
  interviewerType: Joi.string().valid("internal", "external").optional(),
  duration: Joi.string().optional(),
  instructions: Joi.string().allow("").optional(),
  dateTime: Joi.string().optional(),
  interviewerViewType: Joi.string().optional(),
  interviewers: Joi.array().items(Joi.string()).optional(),
  meetingId: Joi.string().optional(),
  status: Joi.string()
    .valid(
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
    )
    .optional(),
  currentAction: Joi.string().allow(null, "").optional(),
  currentActionReason: Joi.string().allow("").optional(),
});

// ✅ CREATE ROUND SCHEMA - Strict for POST operations
const createRoundSchema = baseRoundSchema.keys({
  roundTitle: Joi.string().required().messages({
    "string.empty": "Round title is required",
  }),
  interviewMode: Joi.string().required().messages({
    "string.empty": "Interview mode is required",
  }),
  interviewType: Joi.string()
    .valid("instant", "scheduled")
    .required()
    .messages({
      "any.only": "Interview type must be instant or scheduled",
    }),
  interviewerType: Joi.string()
    .valid("internal", "external")
    .required()
    .messages({
      "any.only": "Interviewer type must be internal or external",
    }),
  duration: Joi.string().required().messages({
    "string.empty": "Duration is required",
  }),
});

// ✅ PAGE 1 VALIDATION - For initial POST without rounds
const mockInterviewPage1Schema = Joi.object({
  skills: Joi.array()
    .items(
      Joi.string().required().messages({
        "string.empty": "Skill name cannot be empty",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one skill is required",
      "array.base": "Skills must be an array",
      "any.required": "Skills are required",
    }),

  ownerId: Joi.string().required().messages({
    "string.empty": "Owner ID is required",
  }),
  tenantId: Joi.string().required().messages({
    "string.empty": "Tenant ID is required",
  }),
  candidateName: Joi.string().required().messages({
    "string.empty": "Candidate name is required",
  }),
  higherQualification: Joi.string().required().messages({
    "string.empty": "Higher qualification is required",
  }),
  currentExperience: Joi.string().required().messages({
    "string.empty": "Current experience is required",
  }),
  // technology: Joi.string().required().messages({
  //   "string.empty": "Technology is required",
  // }),
  currentRole: Joi.string().required().messages({
    "string.empty": "current Role is required",
  }),
  jobDescription: Joi.string().allow("").optional(),
  // Rounds are optional for Page 1 - FIXED: allow empty array or omit
  rounds: Joi.alternatives()
    .try(
      Joi.array().items(createRoundSchema).max(0).optional(), // No rounds allowed in page 1
      Joi.any().forbidden() // Don't allow rounds object in page 1
    )
    .optional(),
  createdById: Joi.string().optional(),
  lastModifiedById: Joi.string().optional(),
});

// ✅ FULL VALIDATION - For POST with rounds (Page 2 submission)
const mockInterviewFullSchema = mockInterviewPage1Schema.keys({
  // Rounds are required for full submission - FIXED: proper validation
  rounds: Joi.alternatives()
    .try(
      Joi.array().items(createRoundSchema).min(1).required().messages({
        "array.min": "At least one round is required for scheduling",
        "any.required": "Rounds are required for scheduling",
      }),
      createRoundSchema.required().messages({
        "any.required": "At least one round is required for scheduling",
      })
    )
    .required(),
});

// ✅ UPDATE VALIDATION - Flexible for PATCH operations
const mockInterviewUpdateSchema = Joi.object({
  // skills: Joi.array().items(
  //   Joi.object({
  //     skill: Joi.string().optional(),
  //     experience: Joi.string().optional(),
  //     expertise: Joi.string().optional()
  //   })
  // ).optional(),
  skills: Joi.array().items(Joi.string().optional()).optional(),
  ownerId: Joi.string().optional(),
  tenantId: Joi.string().optional(),
  candidateName: Joi.string().optional(),
  higherQualification: Joi.string().optional(),
  currentExperience: Joi.string().optional(),
  // technology: Joi.string().optional(),
  currentRole: Joi.string().optional(),
  jobDescription: Joi.string().allow("").optional(),
  rounds: Joi.alternatives().try(
    Joi.array().items(baseRoundSchema).optional(),
    baseRoundSchema.optional()
  ),
  createdById: Joi.string().optional(),
  lastModifiedById: Joi.string().optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// ✅ Data cleaner for PATCH operations
const cleanPatchData = (data) => {
  const cleaned = { ...data };

  if (cleaned.rounds) {
    // Remove database-only fields that might come from frontend
    const dbOnlyFields = [
      "mockInterviewId",
      "previousAction",
      "supportTickets",
      "history",
      "__v",
      "completedDate",
      "rejectionReason",
      "createdAt",
      "updatedAt",
    ];

    if (Array.isArray(cleaned.rounds)) {
      cleaned.rounds = cleaned.rounds.map((round) => {
        const cleanRound = { ...round };
        dbOnlyFields.forEach((field) => delete cleanRound[field]);
        return cleanRound;
      });
    } else if (typeof cleaned.rounds === "object") {
      const cleanRound = { ...cleaned.rounds };
      dbOnlyFields.forEach((field) => delete cleanRound[field]);
      cleaned.rounds = cleanRound;
    }
  }

  return cleaned;
};

// ✅ CREATE/POST Validation - Main function (auto-detects schema)
exports.validateMockInterview = (data) => {
  // Auto-detect: if rounds are provided, use full validation, otherwise use page 1
  const hasRounds =
    data.rounds &&
    ((Array.isArray(data.rounds) && data.rounds.length > 0) ||
      (typeof data.rounds === "object" && Object.keys(data.rounds).length > 0));

  const schema = hasRounds ? mockInterviewFullSchema : mockInterviewPage1Schema;

  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    isValid: !error,
    errors: error
      ? error.details.map((detail) => {
          const field = detail.path.join(".");
          return `${field}: ${detail.message}`;
        })
      : [],
    validatedData: value,
  };
};

// ✅ UPDATE/PATCH Validation
exports.validateMockInterviewUpdate = (data) => {
  const cleanedData = cleanPatchData(data);

  const { error, value } = mockInterviewUpdateSchema.validate(cleanedData, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    isValid: !error,
    errors: error
      ? error.details.map((detail) => {
          const field = detail.path.join(".");
          return `${field}: ${detail.message}`;
        })
      : [],
    validatedData: value,
  };
};

// ✅ Explicit validations for specific use cases
exports.validateMockInterviewPage1 = (data) => {
  const { error, value } = mockInterviewPage1Schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    isValid: !error,
    errors: error
      ? error.details.map((detail) => {
          const field = detail.path.join(".");
          return `${field}: ${detail.message}`;
        })
      : [],
    validatedData: value,
  };
};

exports.validateMockInterviewFull = (data) => {
  const { error, value } = mockInterviewFullSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    isValid: !error,
    errors: error
      ? error.details.map((detail) => {
          const field = detail.path.join(".");
          return `${field}: ${detail.message}`;
        })
      : [],
    validatedData: value,
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
