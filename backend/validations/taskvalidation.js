const mongoose = require('mongoose');

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Shared base validation (mirrors frontend utils/AppTaskValidation.js)
function validateTaskBase(payload = {}) {
  const errors = {};

  if (!payload.title) errors.title = 'Title is required';
  if (!payload.assignedTo) errors.assignedTo = 'Assigned To is required';
  if (!payload.priority) errors.priority = 'Priority is required';
  if (!payload.status) errors.status = 'Status is required';

  if (!payload.dueDate) {
    errors.dueDate = 'Due Date is required';
  } else {
    const dt = new Date(payload.dueDate);
    if (Number.isNaN(dt.getTime())) {
      errors.dueDate = 'Invalid Due Date';
    }
  }

  const relatedTo = payload.relatedTo || {};
  if (!relatedTo.objectName) {
    // Keep keys similar to frontend for easy mapping
    errors.relatedToCategory = 'Choose Any Tab';
  }
  if (!relatedTo.recordId) {
    errors.relatedToOption = 'Choose Any Record';
  } else if (!isValidObjectId(relatedTo.recordId)) {
    errors.relatedToOption = 'Invalid RecordId Format';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

function validateCreateTask(payload = {}) {
  const base = validateTaskBase(payload);
  const errors = { ...base.errors };

  // Required by schema
  if (!payload.ownerId) {
    errors.ownerId = 'ownerId is required';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

function validateUpdateTask(payload = {}) {
  // For simplicity, require same fields as create (matches frontend form behavior)
  return validateTaskBase(payload);
}

module.exports = {
  validateCreateTask,
  validateUpdateTask,
};
