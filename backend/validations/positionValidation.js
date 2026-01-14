const Joi = require("joi");
const { default: mongoose } = require("mongoose");

// Round schema for validation
// const roundValidationSchema = Joi.object({
//   sequence: Joi.number().optional(),
//   roundTitle: Joi.string().optional(),
//   interviewMode: Joi.string().optional(),
//   interviewerType: Joi.string().optional(), // internal or external
//   duration: Joi.number().optional(),
//   instructions: Joi.string().optional(),
//   interviewerGroupName: Joi.string().optional(),
//   interviewerViewType: Joi.string().optional(),
//   selectedInterviewersType: Joi.string().optional(),
//   interviewers: Joi.array().items(Joi.string()).optional(), // ObjectId as string
//   assessmentId: Joi.string().optional(),
//   questions: Joi.array().items(
//     Joi.object({
//       questionId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
//       snapshot: Joi.any().required(),
//     })
//   ).optional(),
// });

// post call valdiaitons for rounds
const validateRoundData = Joi.object({
  sequence: Joi.number().min(1).required().messages({
    "number.base": "Sequence must be a number",
    "number.min": "Sequence must be at least 1",
    "any.required": "Sequence is required",
  }),

  roundTitle: Joi.string().trim().required().messages({
    "string.empty": "Round title is required",
    "any.required": "Round title is required",
  }),

  interviewMode: Joi.string().when("roundTitle", {
    is: "Assessment",
    then: Joi.optional(),
    otherwise: Joi.string().required().messages({
      "string.empty": "Interview mode is required",
      "any.required": "Interview mode is required",
    }),
  }),

  duration: Joi.number().when("roundTitle", {
    is: "Assessment",
    then: Joi.optional(),
    otherwise: Joi.number().min(1).required().messages({
      "number.base": "Duration must be a number",
      "any.required": "Duration is required",
    }),
  }),

  instructions: Joi.string().when("roundTitle", {
    is: "Assessment",
    then: Joi.optional(),
    otherwise: Joi.string().min(50).max(1000).required().messages({
      "string.empty": "Instructions are required",
      "string.min": "Instructions must be at least 50 characters",
      "string.max": "Instructions cannot exceed 1000 characters",
      "any.required": "Instructions are required",
    }),
  }),

  // interviewerType: Joi.string().when("roundTitle", {
  //   is: "Assessment",
  //   then: Joi.optional(),
  //   otherwise: Joi.string().required().messages({
  //     "string.empty": "Interviewer type is required",
  //     "any.required": "Interviewer type is required",
  //   }),
  // }),

  interviewerType: Joi.string()
    .allow(null, "")
    .optional()
    .when("roundTitle", {
      is: Joi.exist().not("Assessment"),
      then: Joi.string().required().messages({
        "string.empty": "Interviewer type is required",
        "any.required": "Interviewer type is required",
      }),
    }),

  // interviewers: Joi.when("roundTitle", {
  //   is: "Assessment",
  //   then: Joi.array().optional(),
  //   otherwise: Joi.array().min(1).messages({
  //     "array.min": "At least one interviewer is required",
  //   }),
  // }),

  interviewers: Joi.array()
    .when("roundTitle", {
      is: "Assessment",
      then: Joi.optional(), // Assessment does NOT require interviewer
    })
    .when("interviewerType", {
      is: "External",
      then: Joi.optional(), // External → interviewer OPTIONAL
    })
    .when("interviewerType", {
      not: "External",
      then: Joi.array().min(1).messages({
        "array.min": "At least one interviewer is required",
      }),
    }),

  interviewerGroupId: Joi.string().allow(""),

  interviewerViewType: Joi.string().allow(""),

  assessmentId: Joi.when("roundTitle", {
    is: "Assessment",
    then: Joi.string().required().messages({
      "any.required": "Assessment template is required",
    }),
    otherwise: Joi.optional(),
  }),

  // questions: Joi.when("roundTitle", {
  //   is: "Assessment",
  //   then: Joi.array().default([]),
  //   otherwise: Joi.array()
  //     .min(1)
  //     .messages({ "array.min": "At least one question is required" }),
  // }),
}).unknown(true);

// Backend validation schema
const positionValidationSchema = Joi.object({
  positionCode: Joi.string().optional(),

  title: Joi.string().required().messages({
    "any.required": "Title is required",
    "string.empty": "Title cannot be empty",
  }),
  // companyname: Joi.string().optional().allow(null, ""),
  companyname: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.invalid": "Company must be a valid ObjectId",
      "any.required": "Company is required",
    }),

  // companyname: Joi.string().required().messages({
  //   "any.required": "Company Name is required",
  //   "string.empty": "Company Name cannot be empty",
  // }),

  jobDescription: Joi.string().min(50).required().messages({
    "any.required": "Job Description is required",
    "string.empty": "Job Description cannot be empty",
    "string.min": "Job Description must be at least 50 characters",
  }),

  minexperience: Joi.number().integer().min(0).required().messages({
    "any.required": "Minimum Experience is required",
    "number.base": "Minimum Experience must be a number",
    "number.min": "Minimum Experience cannot be negative",
  }),

  maxexperience: Joi.number()
    .integer()
    .min(Joi.ref("minexperience"))
    .required()
    .messages({
      "any.required": "Maximum Experience is required",
      "number.base": "Maximum Experience must be a number",
      "number.min": "Maximum Experience cannot be less than Minimum Experience",
    }),

  //   selectedTemplete: Joi.string().optional(), // typo fixed to match mongoose

  minSalary: Joi.string().allow(null, "").optional(),
  maxSalary: Joi.string().allow(null, "").optional(),
  templateId: Joi.string().allow(null, "").optional(),
  // NoofPositions: Joi.number().integer().min(1).required().messages({
  //   "any.required": "Number of Positions is required",
  //   "number.min": "Number of Positions must be greater than 0",
  // }),
  // NoofPositions: Joi.number().integer().min(1).optional().allow(null, ""),
  NoofPositions: Joi.number().integer().min(1).optional().allow(null),
  Location: Joi.string().optional().allow(null, ""),

  // Location: Joi.string().required().messages({
  //   "any.required": "Location is required",
  //   "string.empty": "Location cannot be empty",
  // }),

  //add by venkatesh allow updating status; default stays 'draft'
  status: Joi.string()
    .valid("draft", "opened", "closed", "hold", "cancelled")
    .default("draft")
    .optional(),

  skills: Joi.array()
    .min(1)
    .items(
      Joi.object({
        skill: Joi.string()
          .required()
          .messages({ "any.required": "Skill is required" }),
        experience: Joi.string().optional().allow(null, ""),
        expertise: Joi.string()
          .required()
          .messages({ "any.required": "Expertise is required" }),
        requirement_level: Joi.string()
          .valid("REQUIRED", "PREFERRED", "NICE_TO_HAVE", "OPTIONAL")
          .default("REQUIRED")
          .optional(),
      })
    )
    .required()
    .messages({
      "array.min": "At least one skill must be added",
    }),

  externalId: Joi.string().optional().allow("", null),

  //   additionalNotes: Joi.string().optional(),
  additionalNotes: Joi.string().allow(null, "").optional(),
  // selectedTemplete: Joi.string().allow(null, "").optional(),

  rounds: Joi.array().items(validateRoundData).optional(),
  roundsModified: Joi.boolean().optional(),

  createdBy: Joi.string().optional(),
  updatedBy: Joi.string().optional(),

  ownerId: Joi.string().required(),
  tenantId: Joi.string().required(),
}).unknown(true);

const validateRoundPatchData = Joi.object({
  sequence: Joi.number().min(1).optional(),
  roundTitle: Joi.string().trim().optional(),
  interviewMode: Joi.string().optional(),
  duration: Joi.number().optional(),
  instructions: Joi.string().optional(),

  // IMPORTANT: Remove the .when() condition for interviewerType in PATCH
  interviewerType: Joi.string().allow(null, "").optional(),

  // IMPORTANT: Remove or simplify the .when() condition for interviewers in PATCH
  interviewers: Joi.array().optional(),

  interviewerGroupId: Joi.string().allow("").optional(),
  interviewerViewType: Joi.string().allow("").optional(),

  assessmentId: Joi.string().allow(null, "").optional(),

  questions: Joi.array().optional(),
}).unknown(true);

// ✅ For "standard" templates, make all round fields optional
const validateRoundDataStandard = Joi.object({
  sequence: Joi.number().optional(),
  roundTitle: Joi.string().optional(),
  interviewMode: Joi.string().optional(),
  duration: Joi.number().optional(),
  instructions: Joi.string().allow("").optional(),
  interviewerType: Joi.string().allow("").optional(),
  interviewers: Joi.array().optional(),
  interviewerGroupId: Joi.string().allow("").optional(),
  interviewerViewType: Joi.string().allow("").optional(),
  selectedInterviewersType: Joi.string().allow("").optional(),
  assessmentId: Joi.string().allow(null, "").optional(),
  questions: Joi.array().optional(),
}).unknown(true);

// PATCH schema (all optional)
const positionPatchValidationSchema = positionValidationSchema.fork(
  Object.keys(positionValidationSchema.describe().keys),
  (field) => field.optional()
);

// ✅ Joi schema for PATCH validation
// const validateRoundPatchData = Joi.object({
//   sequence: Joi.number().min(1).optional(),
//   roundTitle: Joi.string().trim().optional(),
//   interviewMode: Joi.string().optional(),
//   duration: Joi.number().optional(),
//   instructions: Joi.string().optional(),
//   interviewerType: Joi.alternatives()
//     .try(Joi.string().valid("Internal", "External").allow(""), Joi.valid(null))
//     .optional(),
//   interviewerGroupId: Joi.when("assessmentId", {
//     is: Joi.exist(),
//     then: Joi.string().allow("").optional(),
//     otherwise: Joi.when("interviewerType", {
//       is: "internal",
//       then: Joi.string().allow("").optional(),
//       otherwise: Joi.string().allow("").optional(),
//     }),
//   }),
//   interviewerViewType: Joi.when("assessmentId", {
//     is: Joi.exist(),
//     then: Joi.string().allow("").optional(),
//     otherwise: Joi.when("interviewerType", {
//       is: "external",
//       then: Joi.string().allow("").optional(),
//       otherwise: Joi.string().allow("").optional(),
//     }),
//   }),
//   selectedInterviewersType: Joi.when("assessmentId", {
//     is: Joi.exist(),
//     then: Joi.string().allow("").optional(),
//     otherwise: Joi.when("interviewerType", {
//       is: "external",
//       then: Joi.string().allow("").optional(),
//       otherwise: Joi.string().allow("").optional(),
//     }),
//   }),

//   interviewers: Joi.when("assessmentId", {
//     // FIX: Check if assessmentId exists AND is not null/empty
//     is: Joi.exist().invalid(null, ""),
//     then: Joi.array().max(0).optional(),
//     otherwise: Joi.array()
//       .items(
//         Joi.string().custom((value, helpers) => {
//           if (!mongoose.Types.ObjectId.isValid(value)) {
//             return helpers.error("any.invalid");
//           }
//           return value;
//         }, "ObjectId validation")
//       )
//       .optional(),
//   }).messages({
//     "any.invalid": "Each interviewer must be a valid ObjectId",
//     "array.max": "Interviewers must be empty for assessment rounds",
//   }),
//   assessmentId: Joi.alternatives()
//     .try(
//       Joi.string().custom((value, helpers) => {
//         if (value && !mongoose.Types.ObjectId.isValid(value)) {
//           return helpers.error("any.invalid");
//         }
//         return value;
//       }),
//       Joi.allow(null, "")
//     )
//     .optional()
//     .messages({
//       "any.invalid": "Assessment template must be a valid ObjectId",
//     }),

//   questions: Joi.array()
//     .items(
//       Joi.object({
//         questionId: Joi.any().required(),
//         snapshot: Joi.any().optional(),
//       }).unknown(true)
//     )
//     .optional(),
// }).unknown(true);

// const validateRoundData = (data) => {
//   const { error, value } = roundFormValidationSchema.validate(data, {
//     abortEarly: false,
//   });

//   let errors = {};
//   if (error) {
//     error.details.forEach((err) => {
//       errors[err.context.key] = err.message;
//     });
//   }

//   return {
//     isValid: Object.keys(errors).length === 0,
//     errors,
//   };
// };

module.exports = {
  positionValidationSchema,
  positionPatchValidationSchema,
  validateRoundData,
  validateRoundPatchData,
  validateRoundDataStandard,
};
