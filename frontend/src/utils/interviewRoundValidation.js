// v1.0.0 - Ashok - Added some some fields to validate
// utils/validation.js

export const validateInterviewRoundData = (data) => {
  const errors = {};

  // Required fields validation
  if (!data.roundTitle) {
    errors.roundTitle = "Round Title is required";
  }

  if (data.roundTitle === "Other" && !data.customRoundTitle?.trim()) {
    errors.roundTitle = "Custom Round Title is required";
  }

  if (!data.interviewMode) {
    errors.interviewMode = "Interview Mode is required";
  }

  if (!data.sequence) {
    errors.sequence = "Sequence is required";
  }

  // Conditional validation for Assessment Template
  if (data.roundTitle === "Assessment" && !data.assessmentId) {
    errors.assessmentTemplate = "Assessment Template is required";
  }

  // Conditional validation for Interviewers
  if (data.status === "Scheduled" && !data.dateTime) {
    errors.dateTime = "Date & Time is required for scheduled interviews";
  }

  if (
    data.status === "Scheduled" &&
    data.dateTime &&
    !data.interviewers?.length
  ) {
    errors.interviewers =
      "At least one interviewer is required for scheduled interviews";
  }

  return errors;
};
