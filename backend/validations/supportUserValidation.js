//<----v1.0.1----Venkatesh----add validation
const Joi = require('joi');

// Common objectId validator (24-hex string)
const objectId = Joi.string().hex().length(24);

function buildErrors(error) {
  const errors = {};
  if (!error) return errors;
  for (const detail of error.details) {
    const key = (detail.path && detail.path.length ? detail.path.join('.') : detail.context?.key) || 'unknown';
    // Prefer first error per key
    if (!errors[key]) errors[key] = detail.message.replace(/\"/g, '"').replace(/"/g, '');
  }
  return errors;
}

// Create ticket validation (mirrors frontend SupportForm requirements)
function validateCreateSupportTicket(payload = {}) {
  const schema = Joi.object({
    issueType: Joi.string().trim().required().messages({
      'any.required': 'Issue type is required',
      'string.empty': 'Issue type is required',
    }),
    subject: Joi.string().trim().max(150).required().messages({
      'any.required': 'Subject is required',
      'string.empty': 'Subject is required',
      'string.max': 'Subject must be at most 150 characters',
    }),
    description: Joi.string().trim().max(1000).required().messages({
      'any.required': 'Description is required',
      'string.empty': 'Description is required',
      'string.max': 'Description must be at most 1000 characters',
    }),

    contact: Joi.string().trim().required().messages({
      'any.required': 'Contact is required',
      'string.empty': 'Contact is required',
    }),
    organization: Joi.string().allow('', null),

    // Optional server-controlled defaults
    status: Joi.string().optional(),
    priority: Joi.string().optional(),
    assignedTo: Joi.string().optional(),
    assignedToId: objectId.optional(),

    ownerId: Joi.string().trim().required().messages({
      'any.required': 'ownerId is required',
      'string.empty': 'ownerId is required',
    }),
    tenantId: Joi.string().trim().required().messages({
      'any.required': 'tenantId is required',
      'string.empty': 'tenantId is required',
    }),
    createdByUserId: objectId.required().messages({
      'any.required': 'createdByUserId is required',
      'string.length': 'createdByUserId must be a valid ObjectId',
      'string.hex': 'createdByUserId must be a valid ObjectId',
    }),
  });

  const { error } = schema.validate(payload, { abortEarly: false, allowUnknown: true });
  const errors = buildErrors(error);
  return { errors, isValid: Object.keys(errors).length === 0 };
}

// Update ticket (edit form) validation
function validateUpdateSupportTicket(payload = {}) {
  const schema = Joi.object({
    issueType: Joi.string().trim().required().messages({
      'any.required': 'Issue type is required',
      'string.empty': 'Issue type is required',
    }),
    subject: Joi.string().trim().max(150).required().messages({
      'any.required': 'Subject is required',
      'string.empty': 'Subject is required',
      'string.max': 'Subject must be at most 150 characters',
    }),
    description: Joi.string().trim().max(1000).required().messages({
      'any.required': 'Description is required',
      'string.empty': 'Description is required',
      'string.max': 'Description must be at most 1000 characters',
    }),
    assignedTo: Joi.string().optional(),
    assignedToId: objectId.optional(),
  });

  const { error } = schema.validate(payload, { abortEarly: false, allowUnknown: true });
  const errors = buildErrors(error);
  return { errors, isValid: Object.keys(errors).length === 0 };
}

// Status update validation
function validateStatusUpdate(payload = {}) {
  const schema = Joi.object({
    status: Joi.string()
      .valid('New', 'Assigned', 'Inprogress', 'Pending', 'Resolved', 'Closed')
      .required()
      .messages({
        'any.only': 'Invalid status',
        'any.required': 'Status is required',
        'string.empty': 'Status is required',
      }),
    comment: Joi.string().allow('', null).max(1000),
    userComment: Joi.string().allow('', null).max(1000),
    user: Joi.string().allow('', null),
    updatedByUserId: objectId.required().messages({
      'any.required': 'updatedByUserId is required',
      'string.length': 'updatedByUserId must be a valid ObjectId',
      'string.hex': 'updatedByUserId must be a valid ObjectId',
    }),
    notifyUser: Joi.boolean().optional(),
  });

  const { error } = schema.validate(payload, { abortEarly: false, allowUnknown: true });
  const errors = buildErrors(error);
  return { errors, isValid: Object.keys(errors).length === 0 };
}

module.exports = {
  validateCreateSupportTicket,
  validateUpdateSupportTicket,
  validateStatusUpdate,
};
////-----v1.0.1---->