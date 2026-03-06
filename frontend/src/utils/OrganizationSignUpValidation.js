// v1.0.0  - Ashraf - changed user name format and place holder,suggest part
import {
  validateUsernameFormat,
  validateUsername as sharedValidateUsername,
  validateProfileId as sharedValidateProfileId
} from './userIdentifierValidation';
export const validateEmail = async (email, checkEmailExists) => {
  let errorMessage = '';

  if (!email) {
    errorMessage = 'Work Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorMessage = 'Invalid Work Email format';
  } else if (checkEmailExists) {
    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        errorMessage = 'Work Email already registered';
      }
    } catch (err) {
      console.error('Error checking Work Email:', err);
      errorMessage = 'Error verifying Work Email';
    }
  }

  return errorMessage;
};
//  -------------------------------------- v1.0.0 >

export const validateUsername = sharedValidateUsername;
export const validateProfileId = sharedValidateProfileId;
//  -------------------------------------- v1.0.0 >

export const validatePhone = (phone, countryCode) => {
  if (!phone || phone.trim() === '') {
    return 'Phone Number is required';
  }

  const cleanPhone = phone.replace(/\D/g, '');

  if (countryCode === '+91') {
    if (!/^\d{10}$/.test(cleanPhone)) {
      return 'Phone Number must be a valid 10-digit number for India';
    }
  } else if (countryCode === '+44') {
    if (!/^\d{10,11}$/.test(cleanPhone)) {
      return 'Phone Number must be a valid 10 or 11-digit number for UK';
    }
  } else {
    return 'Invalid country code';
  }

  return '';
};

export const validateJobTitle = (jobTitle) => {
  if (!jobTitle) {
    return 'Job Title is required';
  }
  return '';
};

export const validateCompany = (company) => {
  if (!company) {
    return 'Company Name is required';
  }
  return '';
};

export const validateEmployees = (employees) => {
  if (!employees) {
    return 'Number of Employees is required';
  }
  return '';
};

export const validateCountry = (country) => {
  if (!country) {
    return 'Country is required';
  }
  return '';
};

export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!password) {
    return 'Password is required';
  }
  if (!passwordRegex.test(password)) {
    return 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.';
  }
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Confirm Password is required';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
};

// export const validateOrganizationSignup = async (formData, setErrors, checkEmailExists, checkUsernameExists) => {
//   const errors = {};

//   // errors.email = await validateEmail(formData.email, checkEmailExists);
//   errors.username = await validateUsername(formData.username, checkUsernameExists);
//   errors.lastName = !formData.lastName ? 'Last Name is required' : '';
//   errors.phone = validatePhone(formData.phone, formData.countryCode);
//   errors.jobTitle = validateJobTitle(formData.jobTitle);
//   errors.company = validateCompany(formData.company);
//   errors.employees = validateEmployees(formData.employees);
//   errors.country = validateCountry(formData.country);
//   errors.password = validatePassword(formData.password);

//   setErrors((prev) => ({ ...prev, ...errors }));

//   return Object.values(errors).every((error) => error === '');
// };

export const validateOrganizationSignup = async (
  formData, setErrors,
  checkEmailExists, checkUsernameExists
) => {
  const errors = {};

  const emailError = await validateEmail(formData.email, checkEmailExists);
  errors.email = emailError || '';

  const usernameError = await validateUsername(formData.username, checkUsernameExists);
  errors.username = usernameError || '';

  errors.firstName = !formData.firstName ? 'First Name is required' : '';
  errors.lastName = !formData.lastName ? 'Last Name is required' : '';
  errors.phone = validatePhone(formData.phone, formData.countryCode) || '';
  errors.jobTitle = validateJobTitle(formData.jobTitle) || '';
  errors.company = validateCompany(formData.company) || '';
  errors.employees = validateEmployees(formData.employees) || '';
  errors.country = validateCountry(formData.country) || '';
  errors.password = validatePassword(formData.password) || '';
  errors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword) || '';

  setErrors(errors);

  return Object.values(errors).every((error) => error === '');
};
