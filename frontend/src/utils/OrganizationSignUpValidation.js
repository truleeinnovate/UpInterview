export const validateEmail = async (email, checkEmailExists) => {
  let errorMessage = '';

  if (!email) {
    errorMessage = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorMessage = 'Invalid email format';
  } else if (checkEmailExists) {
    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        errorMessage = 'Email already registered';
      }
    } catch (err) {
      console.error('Error checking email:', err);
      errorMessage = 'Error verifying email';
    }
  }

  return errorMessage;
};

export const validateProfileId = async (profileId, checkProfileIdExists) => {
  let errorMessage = '';
  let suggestedProfileId = '';

  if (!profileId) {
    errorMessage = 'Profile ID is required';
  } else if (profileId.length < 4) {
    errorMessage = 'Profile ID must be at least 4 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(profileId)) {
    errorMessage = 'Only letters, numbers, and underscores allowed';
  } else if (checkProfileIdExists) {
    try {
      const exists = await checkProfileIdExists(profileId);
      if (exists) {
        errorMessage = 'Profile ID already taken';
        suggestedProfileId = `${profileId}${Math.floor(Math.random() * 100)}`;
      }
    } catch (err) {
      console.error('Error checking profile ID:', err);
      errorMessage = 'Error verifying Profile ID';
    }
  }

  return { errorMessage, suggestedProfileId };
};

export const validatePhone = (phone, countryCode) => {
  if (!phone) {
    return 'Phone number is required';
  }

  const cleanPhone = phone.replace(/\D/g, '');

  if (countryCode === '+91') {
    if (!/^\d{10}$/.test(cleanPhone)) {
      return 'Phone number must be a valid 10-digit number for India';
    }
  } else if (countryCode === '+44') {
    if (!/^\d{10,11}$/.test(cleanPhone)) {
      return 'Phone number must be a valid 10 or 11-digit number for UK';
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
    return 'Company is required';
  }
  return '';
};

export const validateEmployees = (employees) => {
  if (!employees) {
    return 'Number of employees is required';
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

export const validateOrganizationSignup = async (formData, setErrors, checkEmailExists, checkProfileIdExists) => {
  const errors = {};

  errors.email = await validateEmail(formData.email, checkEmailExists);

  const { errorMessage: profileIdError } = await validateProfileId(formData.profileId, checkProfileIdExists);
  errors.profileId = profileIdError;

  errors.lastName = !formData.lastName ? 'Last Name is required' : '';

  errors.phone = validatePhone(formData.phone, formData.countryCode);

  errors.jobTitle = validateJobTitle(formData.jobTitle);

  errors.company = validateCompany(formData.company);

  errors.employees = validateEmployees(formData.employees);

  errors.country = validateCountry(formData.country);

  errors.password = validatePassword(formData.password);

  setErrors((prev) => ({ ...prev, ...errors }));

  return Object.values(errors).every((error) => error === '');
};