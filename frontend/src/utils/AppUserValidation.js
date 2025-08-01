
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

  if (!userData.lastName) errors.lastName = "Last name is required";
  if (!userData.phone) {
    errors.phone = "Phone number is required";
  } else if (!/^[6-9]\d{9}$/.test(userData.phone)) {
    errors.phone = "Invalid phone number";
  }
  if (!userData.roleId) errors.roleId = "Role is required";

  return errors;
};