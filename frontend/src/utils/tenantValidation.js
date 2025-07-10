// utils/CandidateValidation.js

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validatePhoneNumber = (phone) => {
  const re = /^[0-9]+$/;
  return re.test(String(phone));
};

const getErrorMessage = (field, value, formData) => {
  const messages = {
    LastName: "Last Name is required",
    UserName: "User Name is required",
    Email: "Email is required",
    Phone: "Phone Number is required",
    invalidEmail: "Invalid Email Address",
    invalidPhone: "Invalid Phone Number",
    Country: "Country is required",
    Company: "Company is required",
    Employees: "Employees is required",
    JobTitle: "Job Title is required",
    Status: "Status is required",
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

  return "";
};

// Update the validateTenantForm function to pass formData to getErrorMessage:
const validateTenantForm = (formData, entries, selectedPosition, errors) => {
  // console.log("formData", formData);
  let formIsValid = true;
  const newErrors = { ...errors };

  Object.keys(formData).forEach((field) => {
    const errorMessage = getErrorMessage(field, formData[field], formData); // Pass formData here
    if (errorMessage) {
      newErrors[field] = errorMessage;
      formIsValid = false;
    }
  });

  return { formIsValid, newErrors };
};
const countryCodes = [
  { value: "+1", label: "🇺🇸 +1 (USA)" },
  { value: "+44", label: "🇬🇧 +44 (UK)" },
  { value: "+91", label: "🇮🇳 +91 (India)" },
  // Add more countries as needed
];

module.exports = {
  validateTenantForm,
  getErrorMessage,
  countryCodes,
};
