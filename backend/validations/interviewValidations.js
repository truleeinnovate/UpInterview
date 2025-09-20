const Joi = require('joi');
const mongoose = require('mongoose');

// Validation schemas
const participantValidationSchema = Joi.object({
  role: Joi.string().valid("Candidate", "Interviewer", "Scheduler").required(),
  user: Joi.string().optional().allow(null, ''),
  joinedAt: Joi.date().optional().allow(null, ''),
  status: Joi.string().valid("Joined", "Not Joined").optional().allow(null, '')
});

const roundScheduleValidationSchema = Joi.object({
  scheduledAt: Joi.date().required(),
  action: Joi.string().valid("Scheduled", "Rescheduled").required(),
  reason: Joi.string().optional().allow('', null),
  participants: Joi.array().items(participantValidationSchema).optional(),
  updatedBy: Joi.string().optional().allow(null, ''),
  updatedAt: Joi.date().optional().default(Date.now)
});

const questionValidationSchema = Joi.object({
  questionId: Joi.string().required(),
  snapshot: Joi.object({
    questionText: Joi.string().required(),
    questionType: Joi.string().valid('MCQ', 'Descriptive', 'Coding', 'System Design').required(),
    mandatory: Joi.string().valid('true', 'false').default('false'),
    options: Joi.array().items(Joi.string()).optional(),
    correctAnswer: Joi.string().optional().allow('', null),
    score: Joi.number().min(0).optional(),
    difficultyLevel: Joi.string().valid('Easy', 'Medium', 'Hard').optional(),
    skill: Joi.array().items(Joi.string()).optional()
  }).required()
});

// Custom validation for round title
const validateRoundTitle = (value, helpers) => {
  const predefinedTitles = ['Assessment', 'Technical', 'Final', 'HR Interview'];
  
  if (predefinedTitles.includes(value)) {
    return value; // Valid predefined title
  }
  
  // Custom title validation
  if (typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 100) {
    // Check if custom title doesn't match any predefined titles
    if (!predefinedTitles.includes(value.trim())) {
      return value.trim();
    }
  }
  
  return helpers.error('any.invalid');
};

const interviewRoundValidationSchema = Joi.object({
  interviewId: Joi.string().required().messages({
    'string.empty': 'Interview ID is required',
    'any.required': 'Interview ID is required'
  }),
  sequence: Joi.number().integer().min(1).required().messages({
    'number.base': 'Sequence must be a number',
    'number.integer': 'Sequence must be an integer',
    'number.min': 'Sequence must be at least 1',
    'any.required': 'Sequence is required'
  }),
  roundTitle: Joi.alternatives().try(
    Joi.string().valid('Assessment', 'Technical', 'Final', 'HR Interview'),
    Joi.string().min(1).max(100).custom(validateRoundTitle, 'Custom round title validation')
  ).required().messages({
    'string.empty': 'Round title is required',
    'string.min': 'Round title must be at least 1 character',
    'string.max': 'Round title cannot exceed 100 characters',
    'any.required': 'Round title is required',
    'alternatives.types': 'Invalid round title format',
    'alternatives.match': 'Custom round title cannot match predefined values',
    'any.invalid': 'Invalid round title format'
  }),
  interviewMode: Joi.when('roundTitle', {
    is: 'Assessment',
    then: Joi.string().valid('Virtual').required().messages({
      'any.only': 'Assessment rounds must have Virtual interview mode',
      'any.required': 'Interview mode is required for Assessment rounds'
    }),
    otherwise: Joi.string().valid('Face to Face', 'Virtual').required().messages({
      'any.only': 'Interview mode must be either Face to Face or Virtual',
      'any.required': 'Interview mode is required'
    })
  }),
  interviewType: Joi.when('roundTitle', {
    is: 'Assessment',
    then: Joi.string().valid('instant').default('instant'),
    otherwise: Joi.string().valid('instant', 'scheduled').required().messages({
      'any.only': 'Interview type must be either instant or scheduled',
      'any.required': 'Interview type is required'
    })
  }),
  interviewerType: Joi.when('roundTitle', {
    is: 'Assessment',
    then: Joi.string().optional().allow(null, ''),
    otherwise: Joi.string().valid('Internal', 'External').required().messages({
      'any.only': 'Interviewer type must be either Internal or External',
      'any.required': 'Interviewer type is required'
    })
  }),
  duration: Joi.when('roundTitle', {
    is: 'Assessment',
    then: Joi.number().integer().min(1).optional(),
    otherwise: Joi.number().integer().min(1).required().messages({
      'number.base': 'Duration must be a number',
      'number.integer': 'Duration must be an integer',
      'number.min': 'Duration must be at least 1 minute',
      'any.required': 'Duration is required'
    })
  }),
  instructions: Joi.string().max(1000).optional().allow('', null).messages({
    'string.max': 'Instructions cannot exceed 1000 characters'
  }),
  dateTime: Joi.when('interviewType', {
    is: 'scheduled',
    then: Joi.date().min('now').required().messages({
      'date.base': 'Date and time must be a valid date',
      'date.min': 'Date and time cannot be in the past',
      'any.required': 'Date and time is required for scheduled interviews'
    }),
    otherwise: Joi.date().optional().allow(null, '')
  }),
  interviewerViewType: Joi.when('interviewerType', {
    is: 'Internal',
    then: Joi.string().valid('individuals', 'groups').required().messages({
      'any.only': 'Interviewer view type must be either individuals or groups',
      'any.required': 'Interviewer view type is required for Internal interviewers'
    }),
    otherwise: Joi.string().optional().allow('', null)
  }),
  interviewerGroupName: Joi.when('interviewerViewType', {
    is: 'groups',
    then: Joi.string().min(1).max(100).required().messages({
      'string.empty': 'Group name is required for group interviews',
      'string.min': 'Group name must be at least 1 character',
      'string.max': 'Group name cannot exceed 100 characters',
      'any.required': 'Group name is required for group interviews'
    }),
    otherwise: Joi.string().optional().allow('', null)
  }),
  interviewers: Joi.when('interviewerType', {
    is: Joi.valid('Internal', 'External'),
    then: Joi.array().min(1).required().messages({
      'array.min': 'At least one interviewer is required',
      'any.required': 'Interviewers are required'
    }),
    otherwise: Joi.array().optional()
  }),
  status: Joi.string().valid(
    "Draft", "RequestSent", "Scheduled", "InProgress", "Completed", 
    "InCompleted", "Rescheduled", "Rejected", "Selected", "Cancelled", 
    "Incomplete", "NoShow"
  ).default('Draft'),
  assessmentId: Joi.when('roundTitle', {
    is: 'Assessment',
    then: Joi.string().required().messages({
      'string.empty': 'Assessment ID is required for Assessment rounds',
      'any.required': 'Assessment ID is required for Assessment rounds'
    }),
    otherwise: Joi.string().optional().allow(null, '')
  }),
  history: Joi.array().items(roundScheduleValidationSchema).optional(),
  meetingId: Joi.string().optional().allow('', null),
  currentAction: Joi.string().valid(
    "Candidate_NoShow", "Interviewer_NoShow", "Technical_Issue", null
  ).optional().allow(null, ''),
  previousAction: Joi.string().valid(
    "Candidate_NoShow", "Interviewer_NoShow", "Technical_Issue", null
  ).optional().allow(null, ''),
  currentActionReason: Joi.string().optional().allow('', null),
  previousActionReason: Joi.string().optional().allow('', null),
  supportTickets: Joi.array().items(Joi.string()).optional(),
  rejectionReason: Joi.string().optional().allow('', null),
  meetLink: Joi.array().items(Joi.object({
    linkType: Joi.string().valid('Google Meet', 'Zoom', 'Microsoft Teams', 'Other'),
    link: Joi.string().uri()
  })).optional(),
  rescheduleCount: Joi.number().integer().min(0).optional().default(0)
}).with('interviewerViewType', 'interviewerGroupName')
  .with('interviewerType', 'interviewers');

// Validation function for the complete request body
const validateInterviewRoundRequest = Joi.object({
  interviewId: Joi.string().required().messages({
    'string.empty': 'Interview ID is required',
    'any.required': 'Interview ID is required'
  }),
  roundId: Joi.string().optional().allow(null, ''),
  round: interviewRoundValidationSchema.required().messages({
    'any.required': 'Round data is required'
  }),
  questions: Joi.array().items(questionValidationSchema).optional()
});

// Main validation function
const validateInterviewRound = (data, isEditing = false) => {
  // Validate the complete request
  const { error: requestError, value: validatedRequest } = validateInterviewRoundRequest.validate(data, {
    abortEarly: false,
    allowUnknown: true // Allow unknown fields for flexibility
  });

  if (requestError) {
    const validationErrors = {};
    requestError.details.forEach(detail => {
      const field = detail.path.join('.');
      validationErrors[field] = detail.message;
    });
    return { error: validationErrors, value: null };
  }

  // Additional custom validation logic
  const customErrors = {};

  // Custom validation: Ensure scheduled date is at least 2 hours from now for scheduled interviews
  if (validatedRequest.round.interviewType === 'scheduled' && validatedRequest.round.dateTime) {
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (new Date(validatedRequest.round.dateTime) < twoHoursFromNow) {
      customErrors['round.dateTime'] = 'Scheduled time must be at least 2 hours from now';
    }
  }

  // Custom validation: For External interviewers, status should be RequestSent
  if (validatedRequest.round.interviewerType === 'External' && validatedRequest.round.interviewers && validatedRequest.round.interviewers.length > 0) {
    if (validatedRequest.round.status !== 'RequestSent') {
      customErrors['round.status'] = 'Status must be "RequestSent" for External interviewers';
    }
  }

  // Custom validation: For Internal interviewers, status should be Draft if not specified
  if (validatedRequest.round.interviewerType === 'Internal' && !validatedRequest.round.status) {
    validatedRequest.round.status = 'Draft';
  }

  if (Object.keys(customErrors).length > 0) {
    return { error: customErrors, value: null };
  }

  return { error: null, value: validatedRequest };
};

// Middleware for Express routes
const validateInterviewRoundMiddleware = (req, res, next) => {
  const { error, value } = validateInterviewRound(req.body);
  
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error
    });
  }
  
  // Replace req.body with validated data
  req.body = value;
  next();
};

// Export functions
module.exports = {
  validateInterviewRound,
  validateInterviewRoundMiddleware,
  interviewRoundValidationSchema,
  validateInterviewRoundRequest
};