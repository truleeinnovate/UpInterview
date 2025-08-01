// utils/groupFormValidation.js

export const validateGroupForm = (formData) => {
    const errors = {};
  
    if (!formData.name.trim()) {
      errors.name = 'Group Name is required.';
    }
  
    if (!formData.description.trim()) {
      errors.description = 'Description is required.';
    }
  
    if (!formData.members || formData.members.length === 0) {
      errors.members = 'Please select at least one member.';
    }
  
    return errors;
  };
  