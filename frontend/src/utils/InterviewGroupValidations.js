// utils/teamFormValidation.js

export const validateTeamForm = (formData) => {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Team Name is required.';
  }

  // Description is optional, so no validation for it anymore
  // Department is optional
  // Lead is optional
  // Color is optional - has default value

  // Check member_ids (new field) or members (backward compatibility)
  const memberList = formData.member_ids || formData.members || [];
  if (!memberList || memberList.length === 0) {
    errors.members = 'Please select at least one team member.';
  }

  return errors;
};

// Backward compatibility alias
export const validateGroupForm = validateTeamForm;
