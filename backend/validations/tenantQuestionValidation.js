// v1.0.0 - Venkatesh/Cascade - Simple Joi validations for Tenant Questions and List Names
const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId');

const questionTypes = [
  'Interview Questions',
  'MCQ',
  'Short',
  'Long',
  'Programming',
  'Programming Questions',
  'Number',
  'Boolean',
];

function formatJoiErrors(error) {
  if (!error) return {};
  const errors = {};
  for (const detail of error.details || []) {
    const key = detail.path?.[0] || 'base';
    if (!errors[key]) errors[key] = detail.message.replace(/"/g, '');
  }
  return errors;
}

function validateCreateTenantQuestion(payload = {}) {
  const isSuggestedFlow = Boolean(payload?.suggestedQuestionId);

  let schema;
  if (isSuggestedFlow) {
    schema = Joi.object({
      suggestedQuestionId: objectId.required(),
      tenantListId: Joi.array().items(objectId).min(1).required().messages({
        'array.min': 'At least one list must be selected',
      }),
      ownerId: Joi.string().allow('', null),
      tenantId: Joi.string().allow('', null),
      isInterviewType: Joi.boolean().optional(),
    });
  } else {
    schema = Joi.object({
      questionText: Joi.string().trim().min(1).required().messages({
        'string.empty': 'Question is required',
      }),
      questionType: Joi.string()
        .valid(...questionTypes)
        .when('isInterviewType', {
          is: true,
          then: Joi.optional(),
          otherwise: Joi.required().messages({ 'any.required': 'Question Type is required' }),
        }),
      category: Joi.string().trim().min(1).required().messages({
        'string.empty': 'Category is required',
      }),
      skill: Joi.array().items(Joi.string().trim().min(1)).min(1).required().messages({
        'array.min': 'Skill is required',
      }),
      difficultyLevel: Joi.string().valid('Easy', 'Medium', 'Hard').required().messages({
        'any.only': 'Difficulty Level must be one of Easy, Medium, or Hard',
      }),
      // minexperience: Joi.number().integer().min(0).required().messages({
      //   'number.base': 'Min Experience must be a number',
      //   'any.required': 'Min Experience is required',
      // }),
      // maxexperience: Joi.number().integer().min(0).required().messages({
      //   'number.base': 'Max Experience must be a number',
      //   'any.required': 'Max Experience is required',
      // }),
      correctAnswer: Joi.string().trim().required().messages({
        'string.empty': 'Answer is required',
      }),
      tenantListId: Joi.array().items(objectId).min(1).required().messages({
        'array.min': 'Question List is required',
      }),
      options: Joi.alternatives().conditional('questionType', {
        is: 'MCQ',
        then: Joi.array().items(Joi.string().trim().min(1)).min(1).required().messages({
          'array.min': 'At least one option is required for MCQ',
        }),
        otherwise: Joi.array().items(Joi.string().trim()).optional(),
      }),
      isInterviewType: Joi.boolean().optional(),
      ownerId: Joi.string().allow('', null),
      tenantId: Joi.string().allow('', null),
      suggestedQuestionId: objectId.allow('', null),
    });
  }

  const { error, value } = schema.validate(payload, { abortEarly: false, allowUnknown: true });
  let errors = formatJoiErrors(error);

  // Cross-field validations
  if (value?.minexperience !== undefined && value?.maxexperience !== undefined) {
    const min = Number(value.minexperience);
    const max = Number(value.maxexperience);
    if (!Number.isNaN(min) && !Number.isNaN(max) && max <= min) {
      errors.maxexperience = 'Max Experience must be greater than Min Experience';
    }
  }

  // At least one of ownerId or tenantId
  if (!value?.ownerId && !value?.tenantId) {
    errors.ownerId = 'Either ownerId or tenantId is required';
    errors.tenantId = 'Either tenantId or ownerId is required';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

function validateUpdateTenantQuestion(payload = {}) {
  const schema = Joi.object({
    questionText: Joi.string().trim().min(1),
    questionType: Joi.string().valid(...questionTypes),
    category: Joi.string().trim().min(1),
    skill: Joi.array().items(Joi.string().trim().min(1)).min(1),
    difficultyLevel: Joi.string().valid('Easy', 'Medium', 'Hard'),
    // minexperience: Joi.number().integer().min(0),
    // maxexperience: Joi.number().integer().min(0),
    correctAnswer: Joi.string().trim(),
    tenantListId: Joi.array().items(objectId).min(1),
    options: Joi.array().items(Joi.string().trim().min(1)).min(1),
    isInterviewType: Joi.boolean(),
    ownerId: Joi.string(),
    tenantId: Joi.string(),
    suggestedQuestionId: objectId,
  });

  const { error, value } = schema.validate(payload, { abortEarly: false, allowUnknown: true });
  let errors = formatJoiErrors(error);

  if (value?.minexperience !== undefined && value?.maxexperience !== undefined) {
    const min = Number(value.minexperience);
    const max = Number(value.maxexperience);
    if (!Number.isNaN(min) && !Number.isNaN(max) && max <= min) {
      errors.maxexperience = 'Max Experience must be greater than Min Experience';
    }
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

function validateQuestionListCreate(payload = {}) {
  const schema = Joi.object({
    label: Joi.string().trim().min(1).required().messages({
      'string.empty': 'Label is required',
    }),
    name: Joi.string().trim().min(1).required().messages({
      'string.empty': 'Name is required',
    }),
    ownerId: Joi.string().allow('', null),
    tenantId: Joi.string().allow('', null),
    type: Joi.boolean().optional(),
  });

  const { error, value } = schema.validate(payload, { abortEarly: false, allowUnknown: true });
  let errors = formatJoiErrors(error);

  if (!value?.ownerId && !value?.tenantId) {
    errors.ownerId = 'Either ownerId or tenantId is required';
    errors.tenantId = 'Either tenantId or ownerId is required';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

function validateQuestionListUpdate(payload = {}) {
  const schema = Joi.object({
    label: Joi.string().trim().min(1),
    name: Joi.string().trim().min(1),
    ownerId: Joi.string(),
    tenantId: Joi.string(),
    type: Joi.boolean(),
  }).min(1);

  const { error } = schema.validate(payload, { abortEarly: false, allowUnknown: true });
  const errors = formatJoiErrors(error);
  return { errors, isValid: Object.keys(errors).length === 0 };
}

module.exports = {
  validateCreateTenantQuestion,
  validateUpdateTenantQuestion,
  validateQuestionListCreate,
  validateQuestionListUpdate,
};
