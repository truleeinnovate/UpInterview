//<---v1.0.0------venkatesh------bank account validation
/**
 * Validates a bank account form data object.
 * @param {Object} formData - The form data to validate.
 * @returns {Object} - An object containing error messages for invalid fields.
 */
export const validateBankAccount = (formData) => {
  const errors = {};

  if (!formData.accountName || formData.accountName.trim() === '') {
    errors.accountName = 'Account name is required';
  }

  if (!formData.accountNumber || formData.accountNumber.trim() === '') {
    errors.accountNumber = 'Account number is required';
  } else if (!/^[0-9]{8,17}$/.test(formData.accountNumber)) {
    errors.accountNumber = 'Account number must be between 8 and 17 digits';
  }

  if (!formData.confirmAccountNumber || formData.confirmAccountNumber.trim() === '') {
    errors.confirmAccountNumber = 'Please confirm your account number';
  } else if (formData.accountNumber !== formData.confirmAccountNumber) {
    errors.confirmAccountNumber = 'Account numbers do not match';
  }

  if (!formData.routingNumber || formData.routingNumber.trim() === '') {
    errors.routingNumber = 'Routing number or IFSC code is required';
  } else if (!/^[0-9]{9}$/.test(formData.routingNumber) && !/^[A-Za-z]{4}[0-9]{7}$/.test(formData.routingNumber)) {
    errors.routingNumber = 'Invalid format: Use 9-digit routing number or 11-character IFSC code';
  }

  if (!formData.bankName || formData.bankName.trim() === '') {
    errors.bankName = 'Bank name is required';
  }

  if (!formData.accountType || formData.accountType.trim() === '') {
    errors.accountType = 'Account type is required';
  }

  // if (!formData.swiftCode || formData.swiftCode.trim() === '') {
  //   errors.swiftCode = 'SWIFT code is required';
  // } else if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(formData.swiftCode.toUpperCase())) {
  //   errors.swiftCode = 'Invalid SWIFT code format (8-11 characters: BANKCCLL or BANKCCLLXXX)';
  // }

  return errors;
};
