import axios from 'axios';
import { config } from '../config';
export const validateWorkEmail = (email) => {
  if (!email) {
    return 'Work email is required';
  }
  
  // Standard email format validation
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return 'Invalid email format';
//   }
  
//   // Work email validation (must be a company email, not common personal domains)
//   const personalDomains = [
//     'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
//     'aol.com', 'icloud.com', 'protonmail.com', 'mail.com'
//   ];
  
  const domain = email.split('@')[1]?.toLowerCase();
//   if (personalDomains.includes(domain)) {
//     return 'Please use your company email address';
//   }
  
  return '';
};

export const checkEmailExists = async (email) => {
  try {
    const response = await axios.get(
      `${config.REACT_APP_API_URL}/check-email?email=${email}`
    );
    return response.data.exists;
  } catch (error) {
    console.error("Email check error:", error);
    return false;
  }
};