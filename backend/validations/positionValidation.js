const Joi = require("joi");
const { default: mongoose } = require("mongoose");

// Round schema for validation
const roundValidationSchema = Joi.object({
  sequence: Joi.number().optional(),
  roundTitle: Joi.string().optional(),
  interviewMode: Joi.string().optional(),
  interviewerType: Joi.string().optional(), // internal or external
  duration: Joi.number().optional(),
  instructions: Joi.string().optional(),
  interviewerGroupName: Joi.string().optional(),
  interviewerViewType: Joi.string().optional(),
  selectedInterviewersType: Joi.string().optional(),
  interviewers: Joi.array().items(Joi.string()).optional(), // ObjectId as string
  assessmentId: Joi.string().optional(),
  questions: Joi.array().items(
    Joi.object({
      questionId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      snapshot: Joi.any().required(),
    })
  ).optional(),
});

// Backend validation schema
const positionValidationSchema = Joi.object({
  positionCode: Joi.string().optional(),

  title: Joi.string().required().messages({
    "any.required": "Title is required",
    "string.empty": "Title cannot be empty",
  }),

  companyname: Joi.string().required().messages({
    "any.required": "Company Name is required",
    "string.empty": "Company Name cannot be empty",
  }),

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

  NoofPositions: Joi.number().integer().min(1).required().messages({
    "any.required": "Number of Positions is required",
    "number.min": "Number of Positions must be greater than 0",
  }),

  Location: Joi.string().required().messages({
    "any.required": "Location is required",
    "string.empty": "Location cannot be empty",
  }),

  //add by venkatesh allow updating status; default stays 'draft'
  status: Joi.string()
    .valid("draft", "opened", "closed", "hold", "cancelled")
    .default("draft")
    .optional(),

  skills: Joi.array()
    .min(1)
    .items(
      Joi.object({
        skill: Joi.string().required().messages({ "any.required": "Skill is required" }),
        experience: Joi.string().required().messages({ "any.required": "Experience is required" }),
        expertise: Joi.string().required().messages({ "any.required": "Expertise is required" }),
      })
    )
    .required()
    .messages({
      "array.min": "At least one skill must be added",
    }),

//   additionalNotes: Joi.string().optional(),
additionalNotes: Joi.string().allow(null, "").optional(),
// selectedTemplete: Joi.string().allow(null, "").optional(),


  rounds: Joi.array().items(roundValidationSchema).optional(),
  roundsModified: Joi.boolean().optional(),

  createdBy: Joi.string().optional(),
  updatedBy: Joi.string().optional(),

  ownerId: Joi.string().required(),
  tenantId: Joi.string().required(),
});

// PATCH schema (all optional)
const positionPatchValidationSchema = positionValidationSchema.fork(
  Object.keys(positionValidationSchema.describe().keys),
  (field) => field.optional()
);



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
  
    interviewerType: Joi.string().when("roundTitle", {
      is: "Assessment",
      then: Joi.optional(),
      otherwise: Joi.string().required().messages({
        "string.empty": "Interviewer type is required",
        "any.required": "Interviewer type is required",
      }),
    }),
  
    interviewers: Joi.when("roundTitle", {
      is: "Assessment",
      then: Joi.array().optional(),
      otherwise: Joi.array().min(1).messages({
        "array.min": "At least one interviewer is required",
      }),
    }),
  
    interviewerGroupName: Joi.string().allow(""),
  
    interviewerViewType: Joi.string().allow(""),
  
    assessmentId: Joi.when("roundTitle", {
      is: "Assessment",
      then: Joi.string().required().messages({
        "any.required": "Assessment template is required",
      }),
      otherwise: Joi.optional(),
    }),
  
    questions: Joi.when("roundTitle", {
      is: "Assessment",
      then: Joi.array().default([]),
      otherwise: Joi.array()
        .min(1)
        .messages({ "array.min": "At least one question is required" }),
    }),
  });

  
// ✅ Joi schema for PATCH
// ✅ Joi schema for PATCH validation
// const validateRoundPatchData = Joi.object({
//     sequence: Joi.number().min(1).optional(),
//     roundTitle: Joi.string().trim().optional(),
//     interviewMode: Joi.string().optional(),
//     duration: Joi.number().optional(),
//     instructions: Joi.string().optional(),
//     interviewerType: Joi.string().optional(),
//     interviewerGroupName: Joi.string().allow("").optional(),
//     interviewerViewType: Joi.string().allow("").optional(),
//     // interviewers: Joi.array().items(Joi.string()).optional(),
//      // ✅ Fix: validate interviewers as ObjectId strings
//   interviewers: Joi.array()
//   .items(
//     Joi.string().custom((value, helpers) => {
//       if (!mongoose.Types.ObjectId.isValid(value)) {
//         return helpers.error("any.invalid");
//       }
//       return value;
//     }, "ObjectId validation")
//   )
//   .optional()
//   .messages({
//     "any.invalid": "Each interviewer must be a valid ObjectId",
//   }),

//     assessmentId: Joi.alternatives()
//       .try(
//         Joi.string().custom((value, helpers) => {
//           if (value && !mongoose.Types.ObjectId.isValid(value)) {
//             return helpers.error("any.invalid");
//           }
//           return value;
//         }),
//         Joi.allow(null, "")
//       )
//       .optional()
//       .messages({
//         "any.invalid": "Assessment template must be a valid ObjectId",
//       }),
//     questions: Joi.array()
//       .items(
//         Joi.object({
//           questionId: Joi.any().required(),
//           snapshot: Joi.any().optional(),
//         }).unknown(true) // 👈 extra props allowed
//       )
//       .optional(),
//   });
  
// ✅ Joi schema for PATCH validation
const validateRoundPatchData = Joi.object({
    sequence: Joi.number().min(1).optional(),
    roundTitle: Joi.string().trim().optional(),
    interviewMode: Joi.string().optional(),
    duration: Joi.number().optional(),
    instructions: Joi.string().optional(),
    interviewerType: Joi.alternatives().try(
      Joi.string().valid('internal', 'external').allow(''),
      Joi.valid(null)
    ).optional(),
    interviewerGroupName: Joi.when('assessmentId', {
      is: Joi.exist(),
      then: Joi.string().allow("").optional(),
      otherwise: Joi.when('interviewerType', {
        is: 'internal',
        then: Joi.string().allow("").optional(),
        otherwise: Joi.string().allow("").optional()
      })
    }),
    interviewerViewType: Joi.when('assessmentId', {
      is: Joi.exist(),
      then: Joi.string().allow("").optional(),
      otherwise: Joi.when('interviewerType', {
        is: 'external',
        then: Joi.string().allow("").optional(),
        otherwise: Joi.string().allow("").optional()
      })
    }),
    selectedInterviewersType: Joi.when('assessmentId', {
      is: Joi.exist(),
      then: Joi.string().allow("").optional(),
      otherwise: Joi.when('interviewerType', {
        is: 'external',
        then: Joi.string().allow("").optional(),
        otherwise: Joi.string().allow("").optional()
      })
    }),
    interviewers: Joi.when('assessmentId', {
      is: Joi.exist(),
      then: Joi.array().max(0).optional(),
      otherwise: Joi.array()
        .items(
          Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
              return helpers.error("any.invalid");
            }
            return value;
          }, "ObjectId validation")
        )
        .optional()
    }).messages({
      "any.invalid": "Each interviewer must be a valid ObjectId",
      "array.max": "Interviewers must be empty for assessment rounds"
    }),
    assessmentId: Joi.alternatives()
      .try(
        Joi.string().custom((value, helpers) => {
          if (value && !mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
          }
          return value;
        }),
        Joi.allow(null, "")
      )
      .optional()
      .messages({
        "any.invalid": "Assessment template must be a valid ObjectId",
      }),
    questions: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.any().required(),
          snapshot: Joi.any().optional(),
        }).unknown(true)
      )
      .optional(),
  });
  

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




module.exports = { positionValidationSchema, positionPatchValidationSchema, validateRoundData,validateRoundPatchData };


// const Joi = require("joi");

// // Backend validation schema
// const positionValidationSchema = Joi.object({
//   title: Joi.string().required().messages({
//     "any.required": "Title is required",
//     "string.empty": "Title cannot be empty",
//   }),
//   companyname: Joi.string().required().messages({
//     "any.required": "Company Name is required",
//     "string.empty": "Company Name cannot be empty",
//   }),
//   jobDescription: Joi.string().min(50).required().messages({
//     "any.required": "Job Description is required",
//     "string.empty": "Job Description cannot be empty",
//     "string.min": "Job Description must be at least 50 characters",
//   }),
//   minexperience: Joi.number().integer().min(0).required().messages({
//     "any.required": "Minimum Experience is required",
//     "number.base": "Minimum Experience must be a number",
//     "number.min": "Minimum Experience cannot be negative",
//   }),
//   maxexperience: Joi.number().integer().min(Joi.ref("minexperience")).required().messages({
//     "any.required": "Maximum Experience is required",
//     "number.base": "Maximum Experience must be a number",
//     "number.min": "Maximum Experience cannot be less than Minimum Experience",
//   }),
//   minSalary: Joi.number().integer().min(0).allow(null, "").optional().messages({
//     "number.base": "Minimum Salary must be a number",
//     "number.min": "Minimum Salary cannot be negative",
//   }),
//   maxSalary: Joi.number().integer().min(Joi.ref("minSalary")).allow(null, "").optional().messages({
//     "number.base": "Maximum Salary must be a number",
//     "number.min": "Maximum Salary cannot be less than Minimum Salary",
//   }),
//   NoofPositions: Joi.number().integer().min(1).required().messages({
//     "any.required": "Number of Positions is required",
//     "number.min": "Number of Positions must be greater than 0",
//   }),
//   Location: Joi.string().required().messages({
//     "any.required": "Location is required",
//     "string.empty": "Location cannot be empty",
//   }),
//   skills: Joi.array().min(1).items(
//     Joi.object({
//       skill: Joi.string().required().messages({ "any.required": "Skill is required" }),
//       experience: Joi.string().required().messages({ "any.required": "Experience is required" }),
//       expertise: Joi.string().required().messages({ "any.required": "Expertise is required" }),
//     })
//   ).required().messages({
//     "array.min": "At least one skill must be added",
//   }),
//   ownerId: Joi.string().required(),
//   tenantId: Joi.string().required(),
// });

// // Make all fields optional for PATCH
// const positionPatchValidationSchema = positionValidationSchema.fork(
//     Object.keys(positionValidationSchema.describe().keys),
//     (field) => field.optional()
//   );

// module.exports = { positionValidationSchema, positionPatchValidationSchema };

// const Joi = require("joi");

// // Skill schema
// const skillSchema = Joi.object({
//   skill: Joi.string().required().messages({
//     "any.required": "Skill is required",
//     "string.empty": "Skill cannot be empty",
//   }),
//   experience: Joi.string().required().messages({
//     "any.required": "Experience is required",
//     "string.empty": "Experience cannot be empty",
//   }),
//   expertise: Joi.string().required().messages({
//     "any.required": "Expertise is required",
//     "string.empty": "Expertise cannot be empty",
//   }),
// });

// // Round schema
// const roundSchema = Joi.object({
//   roundTitle: Joi.string().required().messages({
//     "any.required": "Round Name is required",
//     "string.empty": "Round Name cannot be empty",
//   }),
//   interviewMode: Joi.string().required().messages({
//     "any.required": "Interview Mode is required",
//     "string.empty": "Interview Mode cannot be empty",
//   }),
//   interviewerType: Joi.string().required().messages({
//     "any.required": "Interview Type is required",
//     "string.empty": "Interview Type cannot be empty",
//   }),
//   duration: Joi.number().integer().min(1).required().messages({
//     "any.required": "Duration is required",
//     "number.base": "Duration must be a number",
//     "number.min": "Duration must be at least 1",
//   }),
//   instructions: Joi.string().allow("").optional(),
//   selectedInterviewersType: Joi.string().allow("").optional(),
//   interviewers: Joi.array().items(Joi.string()).optional(),
//   assessmentId: Joi.string().allow(null).optional(),
//   sequence: Joi.number().integer().optional(),
//   questions: Joi.array().items(
//     Joi.object({
//       questionId: Joi.any().required(),
//       snapshot: Joi.any().required(),
//     })
//   ).optional(),
// });

// // Position schema
// const positionSchema = Joi.object({
//   title: Joi.string().required().messages({
//     "any.required": "Title is required",
//     "string.empty": "Title cannot be empty",
//   }),
//   companyName: Joi.string().required().messages({
//     "any.required": "Company Name is required",
//     "string.empty": "Company Name cannot be empty",
//   }),
//   jobDescription: Joi.string().min(50).required().messages({
//     "any.required": "Job Description is required",
//     "string.empty": "Job Description cannot be empty",
//     "string.min": "Job Description must be at least 50 characters",
//   }),
//   minexperience: Joi.number().integer().min(0).required().messages({
//     "any.required": "Minimum Experience is required",
//     "number.base": "Minimum Experience must be a number",
//     "number.min": "Minimum Experience cannot be negative",
//   }),
//   maxexperience: Joi.number().integer().min(Joi.ref('minexperience')).required().messages({
//     "any.required": "Maximum Experience is required",
//     "number.base": "Maximum Experience must be a number",
//     "number.min": "Maximum Experience cannot be less than Minimum Experience",
//   }),
//   minSalary: Joi.number().integer().min(0).allow(null).optional().messages({
//     "number.base": "Minimum Salary must be a number",
//     "number.min": "Minimum Salary cannot be negative",
//   }),
//   maxSalary: Joi.number().integer().min(Joi.ref('minSalary')).allow(null).optional().messages({
//     "number.base": "Maximum Salary must be a number",
//     "number.min": "Maximum Salary cannot be less than Minimum Salary",
//   }),
//   NoofPositions: Joi.number().integer().min(1).required().messages({
//     "any.required": "Number of Positions is required",
//     "number.min": "Number of Positions must be greater than 0",
//   }),
//   Location: Joi.string().required().messages({
//     "any.required": "Location is required",
//     "string.empty": "Location cannot be empty",
//   }),
//   skills: Joi.array().min(1).items(skillSchema).required().messages({
//     "any.required": "At least one skill is required",
//     "array.min": "At least one skill must be added",
//   }),
//   rounds: Joi.array().items(roundSchema).optional(),
//   ownerId: Joi.string().required().messages({
//     "any.required": "OwnerId is required",
//     "string.empty": "OwnerId cannot be empty",
//   }),
//   tenantId: Joi.string().required().messages({
//     "any.required": "TenantId is required",
//     "string.empty": "TenantId cannot be empty",
//   }),
// });

// // Middleware for validation
// const validatePosition = (req, res, next) => {
//   const { error } = positionSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     const errors = {};
//     error.details.forEach((err) => {
//       errors[err.path.join(".")] = err.message;
//     });
//     return res.status(400).json({ status: "error", errors });
//   }
//   console.log("✅ Position data is valid",error);
//   next();
// };

// module.exports = { validatePosition };
