
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
  if (!userData.firstName) errors.firstName = "First Name is required";
  if (!userData.lastName) errors.lastName = "Last Name is required";
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