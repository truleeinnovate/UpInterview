// utils/groupFormValidation.js

export const validateGroupForm = (formData) => {
    const errors = {};
  
    if (!formData.name.trim()) {
      errors.name = 'Group name is required.';
    }
  
    if (!formData.description.trim()) {
      errors.description = 'Description is required.';
    }
  
    if (!formData.members || formData.members.length <= 1) {
      errors.members = 'Please select at least more than one member.';
    }
  
    return errors;
  };
  