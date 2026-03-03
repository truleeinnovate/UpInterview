
import { validateWorkEmail, checkEmailExists } from '../utils/workEmailValidation.js';

export const validateUserForm = async (userData) => {
  const errors = {};

  const emailFormatError = validateWorkEmail(userData.email);
  if (emailFormatError) {
    errors.email = emailFormatError;
  } else {
    const emailExists = await checkEmailExists(userData.email);
    if (emailExists) {
      errors.email = 'Email already registered';
    }
  }
  // First Name
  if (!userData.firstName?.trim()) {
    errors.firstName = "First Name is required";
  } else if (userData.firstName.trim().length < 2) {
    errors.firstName = "First Name must be at least 2 characters";
  }
  // Last Name
  if (!userData.lastName?.trim()) {
    errors.lastName = "Last Name is required";
  } else if (userData.lastName.trim().length < 2) {
    errors.lastName = "Last Name must be at least 2 characters";
  }
  if (!userData.phone) {
    errors.phone = "Phone Number is required";
  } else if (!/^[6-9]\d{9}$/.test(userData.phone)) {
    errors.phone = "Invalid Phone Number";
  }
  if (!userData.roleId) errors.roleId = "Role is required";
  // if (!userData.linkedinUrl) {
  //   errors.linkedinUrl = "LinkedIn URL is required";
  // }


  return errors;
};