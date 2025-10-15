const Joi = require('joi');

// Validation schema for candidate answer
const candidateAnswerSchema = Joi.object({
  answerType: Joi.string()
    // .valid('partial', 'correct', 'wrong', 'not answered')
    .default('not answered'),
  submittedAnswer: Joi.string().allow('', null)
});

// Validation schema for interviewer feedback
const interviewerFeedbackSchema = Joi.object({
  liked: Joi.string()
    .valid('liked', 'disliked', 'none')
    .default('none'),
  dislikeReason: Joi.string().allow('', null),
  note: Joi.string().allow('', null)
});

// Validation schema for question feedback
const questionFeedbackSchema = Joi.object({
  questionId: Joi.alternatives().try(
    Joi.string().hex().length(24), // MongoDB ObjectId as string
    Joi.object() // Allow object for backward compatibility
  ).required(),
  candidateAnswer: candidateAnswerSchema,
  interviewerFeedback: interviewerFeedbackSchema
});

// Validation schema for skills
const skillsSchema = Joi.object({
  skillName: Joi.string().trim().min(1).required()
    .messages({
      'string.empty': 'Please provide skill names and ratings for all skills',
      'string.min': 'Please provide skill names and ratings for all skills'
    }),
  rating: Joi.number().integer().min(1).max(5).required()
    .messages({
      'number.base': 'Please provide skill names and ratings for all skills',
      'number.min': 'Please provide skill names and ratings for all skills',
      'number.max': 'Skill rating cannot exceed 5',
      'any.required': 'Please provide skill names and ratings for all skills'
    }),
  note: Joi.string().allow('', null),
  skillType: Joi.string().allow('', null)
});

// Validation schema for overall impression
const overallImpressionSchema = Joi.object({
  overallRating: Joi.number().integer().min(1).max(5).required()
    .messages({
      'number.base': 'Please provide an overall rating',
      'number.min': 'Please provide an overall rating',
      'number.max': 'Overall rating cannot exceed 5',
      'any.required': 'Please provide an overall rating'
    }),
  communicationRating: Joi.number().integer().min(1).max(5).required()
    .messages({
      'number.base': 'Please provide a communication rating',
      'number.min': 'Please provide a communication rating',
      'number.max': 'Communication rating cannot exceed 5',
      'any.required': 'Please provide a communication rating'
    }),
  recommendation: Joi.string().valid('Yes', 'No', 'Maybe').allow('', null),
  note: Joi.string().allow('', null)
});

// Main validation schemas
const createFeedbackSchema = Joi.object({
  type: Joi.string().valid('submit', 'draft').required()
    .messages({
      'any.required': 'Type is required',
      'any.only': 'Type must be either "submit" or "draft"'
    }),
  
  tenantId: Joi.string().hex().length(24).allow('', null),
  ownerId: Joi.string().hex().length(24).allow('', null),
  
  interviewRoundId: Joi.string().hex().length(24).required()
    .messages({
      'string.empty': 'Interview Round ID is required',
      'any.required': 'Interview Round ID is required'
    }),
  
  candidateId: Joi.string().hex().length(24).allow('', null),
  positionId: Joi.string().hex().length(24).allow('', null),
  
  interviewerId: Joi.string().hex().length(24).required()
    .messages({
      'string.empty': 'Interviewer ID is required',
      'any.required': 'Interviewer ID is required'
    }),
  
  skills: Joi.when('type', {
    is: 'submit',
    then: Joi.array().items(skillsSchema).min(1).required()
      .messages({
        'array.min': 'Please provide skill names and ratings for all skills',
        'any.required': 'Please provide skill names and ratings for all skills'
      }),
    otherwise: Joi.array().items(skillsSchema).optional()
  }),
  
  questionFeedback: Joi.array().items(questionFeedbackSchema).optional(),
  
  generalComments: Joi.when('type', {
    is: 'submit',
    then: Joi.string().trim().min(1).required()
      .messages({
        'string.empty': 'Please provide overall comments',
        'string.min': 'Please provide overall comments',
        'any.required': 'Please provide overall comments'
      }),
    otherwise: Joi.string().allow('', null).optional()
  }),
  
  overallImpression: Joi.when('type', {
    is: 'submit',
    then: overallImpressionSchema.required()
      .messages({
        'any.required': 'Overall impression is required'
      }),
    otherwise: overallImpressionSchema.optional()
  }),
  
  status: Joi.string().valid('draft', 'submitted').optional(),
  feedbackCode: Joi.string().allow('', null).optional()
});

const updateFeedbackSchema = Joi.object({
  type: Joi.string().valid('submit', 'draft').optional(),
  tenantId: Joi.string().hex().length(24).allow('', null).optional(),
  ownerId: Joi.string().hex().length(24).allow('', null).optional(),
  interviewRoundId: Joi.string().hex().length(24).optional(),
  candidateId: Joi.string().hex().length(24).allow('', null).optional(),
  positionId: Joi.string().hex().length(24).allow('', null).optional(),
  interviewerId: Joi.string().hex().length(24).optional(),
  
  skills: Joi.array().items(skillsSchema).optional(),
  questionFeedback: Joi.array().items(questionFeedbackSchema).optional(),
  generalComments: Joi.string().allow('', null).optional(),
  overallImpression: overallImpressionSchema.optional(),
  status: Joi.string().valid('draft', 'submitted').optional(),
  feedbackCode: Joi.string().allow('', null).optional()
});

// Validate create feedback
const validateCreateFeedback = (data) => {
  const { error, value } = createFeedbackSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = {};
    error.details.forEach(detail => {
      const path = detail.path.join('.');
      errors[path] = detail.message;
    });
    return { isValid: false, errors, value: null };
  }
  
  return { isValid: true, errors: null, value };
};

// Validate update feedback
const validateUpdateFeedback = (data) => {
  const { error, value } = updateFeedbackSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = {};
    error.details.forEach(detail => {
      const path = detail.path.join('.');
      errors[path] = detail.message;
    });
    return { isValid: false, errors, value: null };
  }
  
  return { isValid: true, errors: null, value };
};

// Custom validation for additional business rules - matches frontend exactly
const validateFeedbackBusinessRules = (data) => {
  const errors = {};
  
  // Only validate for submit type (frontend doesn't validate draft)
  if (data.type === 'submit') {
    // Frontend validation: overallRating === 0
    if (data.overallImpression) {
      if (!data.overallImpression.overallRating || data.overallImpression.overallRating === 0) {
        errors['overallRating'] = 'Please provide an overall rating';
      }
      if (!data.overallImpression.communicationRating || data.overallImpression.communicationRating === 0) {
        errors['communicationRating'] = 'Please provide a communication rating';
      }
    } else {
      errors['overallRating'] = 'Please provide an overall rating';
      errors['communicationRating'] = 'Please provide a communication rating';
    }
    
    // Frontend validation: skillRatings.some((skill) => !skill.skill.trim() || skill.rating === 0)
    if (data.skills && Array.isArray(data.skills)) {
      const hasInvalidSkill = data.skills.some(
        (skill) => !skill.skillName || skill.skillName.trim() === '' || !skill.rating || skill.rating === 0
      );
      if (hasInvalidSkill) {
        errors['skills'] = 'Please provide skill names and ratings for all skills';
      }
    } else {
      errors['skills'] = 'Please provide skill names and ratings for all skills';
    }
    
    // Frontend validation: !comments.trim()
    if (!data.generalComments || data.generalComments.trim() === '') {
      errors['comments'] = 'Please provide overall comments';
    }
    
    // Note: Frontend has questions validation commented out, so we don't validate it
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = {
  validateCreateFeedback,
  validateUpdateFeedback,
  validateFeedbackBusinessRules,
  createFeedbackSchema,
  updateFeedbackSchema
};
