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
  
  export const validateUserForm = (userData) => {
    const errors = {};
    if (!userData.lastName) errors.lastName = "Last name is required";
    if (!userData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = "Invalid email format";
    }
    if (!userData.phone) {
      errors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(userData.phone)) {
      errors.phone = "Invalid phone number";
    }
    if (!userData.roleId) errors.roleId = "Role is required";
  
    return errors;
  };