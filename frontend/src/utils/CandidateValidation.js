// utils/CandidateValidation.js

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validatePhoneNumber = (phone) => {
  const re = /^[0-9]{10}$/; // ✅ Exactly 10 digits
  return re.test(String(phone));
};


const getErrorMessage = (field, value, formData) => {
  const messages = {
    FirstName: "First Name is required",
    LastName: "Last Name is required",
    Email: "Email is required",
    Phone: "Phone Number is required",
    // Gender: "Gender is required",
    HigherQualification: "Higher Qualification is required",
    // UniversityCollege: "University/College is required",
    CurrentExperience: "Total Experience is required",
    RelevantExperience: "Relevant Experience is required",
    RelevantExperienceGreater:
      "Relevant Experience cannot be greater than Total Experience",
    Position: "Position is required",
    skills: "First 3 rows are required",
    invalidEmail: "Invalid Email address",
    invalidPhone: "Invalid Phone number",
    CurrentRole: "Current Role is required",
    // Technology: "Technology is required",

  };

  if (!value) {
    return messages[field];
  }

  if (field === "Email" && !validateEmail(value)) {
    return messages.invalidEmail;
  }

  if (field === "Phone" && !validatePhoneNumber(value)) {
    return messages.invalidPhone;
  }

  if (field === "Technology" && !value) {
    return messages.Technology;
  }

  // Validate RelevantExperience against CurrentExperience
  // Validate RelevantExperience against CurrentExperience
  if (
    field === "RelevantExperience" &&
    formData &&
    formData.CurrentExperience
  ) {
    const currentExp = parseInt(formData.CurrentExperience, 10);
    const relevantExp = parseInt(value, 10);
    if (relevantExp > currentExp) {
      return messages.RelevantExperienceGreater;
    }
  }

  return "";
};

// Validate candidate form. Ensures all field-level errors are caught, including
// the cross-field constraint that relevantExperience must not exceed CurrentExperience.
// Returns { formIsValid, newErrors }
const validateCandidateForm = (formData, entries, errors) => {
  let formIsValid = true;
  const newErrors = { ...(errors || {}) };

  // Validate each field
  Object.keys(formData).forEach((field) => {
    // Skip generic validation for skills; it's handled with custom logic below
    if (field === "skills") return;
    // Skip validation for CountryCode, ImageData, resume - these are optional/non-validated fields
    if (field === "CountryCode" || field === "ImageData" || field === "resume")
      return;
    const errorMessage = getErrorMessage(field, formData[field], formData);
    if (errorMessage) {
      newErrors[field] = errorMessage;
      formIsValid = false;
    }
  });

  // ── Salary cross-validation (final check) ─────────────────────────
  if (formData.minSalary || formData.maxSalary) {
    const minSalaryVal = formData.minSalary ? parseInt(formData.minSalary, 10) : NaN;
    const maxSalaryVal = formData.maxSalary ? parseInt(formData.maxSalary, 10) : NaN;

    const hasMin = !Number.isNaN(minSalaryVal);
    const hasMax = !Number.isNaN(maxSalaryVal);

    if (hasMin && minSalaryVal < 0) {
      newErrors.minSalary = "Minimum salary cannot be negative";
      formIsValid = false;
    }
    if (hasMax && maxSalaryVal < 0) {
      newErrors.maxSalary = "Maximum salary cannot be negative";
      formIsValid = false;
    }

    if (hasMin && hasMax) {
      if (minSalaryVal === maxSalaryVal) {
        newErrors.minSalary = "Min and Max Salary cannot be equal";
        newErrors.maxSalary = "Min and Max Salary cannot be equal";
        formIsValid = false;
      } else if (minSalaryVal > maxSalaryVal) {
        newErrors.minSalary = "Min Salary cannot be greater than Max Salary";
        newErrors.maxSalary = "Max Salary cannot be less than Min Salary";
        formIsValid = false;
      }
    }
  }

  // Skills validation:
  // - First 3 rows are mandatory: all fields must be filled
  // - Additional rows (4+) are validated only if partially filled
  const rows = Array.isArray(entries) ? entries : [];
  const invalidRows = [];

  const getMissingFields = (entry) => {
    const missing = [];
    if (!entry?.skill) missing.push("skill");
    if (!entry?.experience) missing.push("experience");
    if (!entry?.expertise) missing.push("expertise");
    return missing;
  };

  // Validate first 3 rows (mandatory)
  for (let i = 0; i < 3; i++) {
    const entry = rows[i] || {};
    const missingFields = getMissingFields(entry);
    if (missingFields.length > 0) {
      invalidRows.push({ index: i, missingFields });
    }
  }

  // Validate additional rows (only if partially filled)
  rows.forEach((entry, index) => {
    if (index < 3) return;
    const hasAnyValue = !!(
      entry?.skill ||
      entry?.experience ||
      entry?.expertise
    );
    const missingFields = getMissingFields(entry);
    if (hasAnyValue && missingFields.length > 0) {
      invalidRows.push({ index, missingFields });
    }
  });

  if (invalidRows.length > 0) {
    const messages = [
      getErrorMessage("skills", 0, formData) || "First 3 rows are required",
    ];
    invalidRows.forEach(({ index, missingFields }) => {
      messages.push(
        `Row ${index + 1}: Please fill in ${missingFields.join(", ")}`,
      );
    });
    newErrors.skills = messages.join("; ");
    formIsValid = false;
  } else {
    if (newErrors.skills) delete newErrors.skills;
  }

  return { formIsValid, newErrors };
};

export { validateCandidateForm, getErrorMessage };
