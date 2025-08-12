// v1.0.0 - mansoor - replaced the old ui with new ui
import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { ReactComponent as MdArrowDropDown } from '../../../src/icons/MdArrowDropDown.svg';
import Slideshow from "./Slideshow";
import { config } from '../../config';
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
import {
  validateEmail,
  validateProfileId,
  validateOrganizationSignup,
  validatePhone,
  validatePassword,
  validateConfirmPassword
} from '../../utils/OrganizationSignUpValidation';
import { setAuthCookies, clearAllAuth } from '../../utils/AuthCookieManager/AuthCookieManager.jsx';
import { validateWorkEmail, checkEmailExists } from '../../utils/workEmailValidation.js';

import { Link } from 'react-router-dom';
// import Layout from './Layout.jsx';

export const Organization = () => {
  console.log('org signup')
  const [selectedFirstName, setSelectedFirstName] = useState("");
  const [selectedLastName, setSelectedLastName] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPassword, setSelectedPassword] = useState("");
  const [selectedConfirmPassword, setSelectedConfirmPassword] = useState("");
  const [showDropdownEmployees, setShowDropdownEmployees] = useState(false);
  const [showDropdownCountry, setShowDropdownCountry] = useState(false);
  const [showDropdownCountryCode, setShowDropdownCountryCode] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingProfileId, setIsCheckingProfileId] = useState(false);
  const [suggestedProfileId, setSuggestedProfileId] = useState('');
  const countryOptions = ["India", "UK", "USA", "UAE"];
  const countryCodeOptions = [
    { country: "India", code: "+91" },
    { country: "UK", code: "+44" }
  ];
  const employeesOptions = ["0-10", "10-20", "50-100", "100-500", "500-1000"];
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // State for verification flow
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const emailTimeoutRef = useRef(null);
  const profileIdTimeoutRef = useRef(null);

  // Refs for dropdowns
  const employeesDropdownRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const countryCodeDropdownRef = useRef(null);

  // Handle verification success from query parameter
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const verified = query.get('verified');
    if (verified === 'true') {
      toast.success('Email verified successfully!');
      navigate('/organization-login');
      window.location.reload();
    }
  }, [location, navigate]);

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowDropdownEmployees(false);
    setShowDropdownCountry(false);
    setShowDropdownCountryCode(false);
  };

  // Handle click outside to close all dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (employeesDropdownRef.current && !employeesDropdownRef.current.contains(event.target)) &&
        (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) &&
        (countryCodeDropdownRef.current && !countryCodeDropdownRef.current.contains(event.target))
      ) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkProfileIdExists = useCallback(async (profileId) => {
    if (!profileId) return false;
    try {
      const response = await axios.get(`${config.REACT_APP_API_URL}/check-profileId?profileId=${profileId}`);
      return response.data.exists;
    } catch (error) {
      console.error("ProfileId check error:", error);
      return false;
    }
  }, []);

  const handleChange = (field, value) => {
    if (field === 'email') {
      setSelectedEmail(value);
      setErrors((prev) => ({ ...prev, email: '' }));
    } else if (field === 'profileId') {
      setSelectedProfileId(value);
      setErrors((prev) => ({ ...prev, profileId: '' }));
    } else if (field === 'firstName') {
      setSelectedFirstName(value);
    } else if (field === 'lastName') {
      setSelectedLastName(value);
      setErrors((prev) => ({ ...prev, lastName: '' }));
    } else if (field === 'phone') {
      let maxLength = selectedCountryCode === '+91' ? 10 : 11;
      let cleanValue = value.replace(/\D/g, '').slice(0, maxLength);
      setSelectedPhone(cleanValue);
      setErrors((prev) => ({ ...prev, phone: validatePhone(cleanValue, selectedCountryCode) }));
    } else if (field === 'countryCode') {
      setSelectedCountryCode(value);
      setSelectedPhone('');
      setErrors((prev) => ({ ...prev, phone: '' }));
    } else if (field === 'jobTitle') {
      setSelectedJobTitle(value);
      setErrors((prev) => ({ ...prev, jobTitle: '' }));
    } else if (field === 'company') {
      setSelectedCompany(value);
      setErrors((prev) => ({ ...prev, company: '' }));
    } else if (field === 'password') {
      setSelectedPassword(value);
      setErrors((prev) => ({
        ...prev,
        password: '',
        confirmPassword: selectedConfirmPassword && value !== selectedConfirmPassword ? 'Passwords do not match' : ''
      }));
    } else if (field === 'confirmPassword') {
      setSelectedConfirmPassword(value);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value && value !== selectedPassword ? 'Passwords do not match' : ''
      }));
    }
  };

  const handleBlur = (field, value) => {
    if (field === 'email') {
      clearTimeout(emailTimeoutRef.current);
      handleEmailValidation(value);
    } else if (field === 'profileId') {
      clearTimeout(profileIdTimeoutRef.current);
      handleProfileIdValidation(value);
    } else if (field === 'password') {
      const passwordError = validatePassword(value);
      const confirmPasswordError =
        selectedConfirmPassword && value !== selectedConfirmPassword
          ? 'Passwords do not match'
          : '';
      setErrors((prev) => ({
        ...prev,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      }));
    } else if (field === 'confirmPassword') {
      const confirmPasswordError =
        value && value !== selectedPassword ? 'Passwords do not match' : '';
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordError,
      }));
    }
  };


  useEffect(() => {
    return () => {
      clearTimeout(emailTimeoutRef.current);
      clearTimeout(profileIdTimeoutRef.current);
    };
  }, []);

  const toggleDropdownEmployees = () => {
    console.log('Toggle employees dropdown clicked');
    closeAllDropdowns();
    setShowDropdownEmployees((prev) => {
      console.log('Setting employees dropdown to:', !prev);
      return !prev;
    });
  };

  const handleEmployeesSelect = (option) => {
    setSelectedEmployees(option);
    closeAllDropdowns();
    setErrors((prev) => ({ ...prev, employees: '' }));
  };

  const toggleDropdownCountry = () => {
    console.log('Toggle country dropdown clicked');
    closeAllDropdowns();
    setShowDropdownCountry((prev) => {
      console.log('Setting country dropdown to:', !prev);
      return !prev;
    });
  };

  const handleCountrySelect = (option) => {
    setSelectedCountry(option);
    closeAllDropdowns();
    setErrors((prev) => ({ ...prev, country: '' }));
  };

  const toggleDropdownCountryCode = () => {
    closeAllDropdowns();
    setShowDropdownCountryCode((prev) => !prev);
  };

  const handleCountryCodeSelect = (code) => {
    setSelectedCountryCode(code);
    closeAllDropdowns();
    setErrors((prev) => ({ ...prev, phone: validatePhone(selectedPhone, code) }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare full data with confirmPassword
    const organizationData = {
      firstName: selectedFirstName,
      lastName: selectedLastName,
      email: selectedEmail,
      countryCode: selectedCountryCode,
      phone: selectedPhone,
      profileId: selectedProfileId,
      jobTitle: selectedJobTitle,
      company: selectedCompany,
      employees: selectedEmployees,
      country: selectedCountry,
      password: selectedPassword,
      confirmPassword: selectedConfirmPassword,
      contactType: 'Organization',
    };

    // Run validations first
    const isValid = await validateOrganizationSignup(
      organizationData,
      setErrors,
      checkEmailExists,
      checkProfileIdExists
    );

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    // Only set submitting to true after all validations pass
    setIsSubmitting(true);

    // Validate email format and existence
    const emailFormatError = validateWorkEmail(selectedEmail);
    if (emailFormatError) {
      setErrors((prev) => ({ ...prev, email: emailFormatError }));
      setIsSubmitting(false);
      return;
    }

    const emailExists = await checkEmailExists(selectedEmail);
    if (emailExists) {
      setErrors((prev) => ({ ...prev, email: 'Email already registered' }));
      setIsSubmitting(false);
      return;
    }

    // Validate profileId
    const profileIdError = await validateProfileId(selectedProfileId, checkProfileIdExists);
    if (profileIdError) {
      setErrors((prev) => ({ ...prev, profileId: profileIdError }));
      setIsSubmitting(false);
      return;
    }

    const confirmPasswordError = validateConfirmPassword(selectedPassword, selectedConfirmPassword);
    if (confirmPasswordError) {
      setErrors((prev) => ({ ...prev, confirmPassword: confirmPasswordError }));
      setIsSubmitting(false);
      return;
    }

    try {
      // Clear all cookies before setting new ones
      clearAllAuth();

      const response = await axios.post(`${config.REACT_APP_API_URL}/Organization/Signup`, organizationData);
      const { token } = response.data;

      setAuthCookies(token);
      setEmail(selectedEmail);
      setFormSubmitted(true);
      toast.success('Verification email sent! Please check your inbox.');
      setCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      const response = await axios.post(`${config.REACT_APP_API_URL}/emails/resend-verification`, { email });
      if (response.data.success) {
        toast.success('Verification email resent!');
        setCountdown(60);
      } else {
        toast.error(response.data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const generateProfileId = (email) => {
    if (!email) return '';
    return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  };

  const handleEmailValidation = async (email) => {
    if (!email) {
      setErrors((prev) => ({ ...prev, email: '' }));
      setIsCheckingEmail(false);
      return;
    }

    setIsCheckingEmail(true);

    const formatError = validateWorkEmail(email);
    if (formatError) {
      setErrors((prev) => ({ ...prev, email: formatError }));
      setIsCheckingEmail(false);
      return;
    }

    const exists = await checkEmailExists(email);
    if (exists) {
      setErrors((prev) => ({ ...prev, email: 'Email already registered' }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));

      if (!selectedProfileId) {
        const generatedProfileId = generateProfileId(email);
        setSelectedProfileId(generatedProfileId);
        handleProfileIdValidation(generatedProfileId);
      }
    }

    setIsCheckingEmail(false);
  };

  const handleProfileIdValidation = async (profileId) => {
    if (!profileId) {
      setErrors((prev) => ({ ...prev, profileId: '' }));
      setSuggestedProfileId('');
      setIsCheckingProfileId(false);
      return;
    }

    setIsCheckingProfileId(true);
    const profileIdError = await validateProfileId(profileId, checkProfileIdExists);
    setErrors((prev) => ({ ...prev, profileId: profileIdError }));

    if (profileIdError && profileIdError.includes('already taken')) {
      const baseProfileId = profileId.replace(/[0-9]+$/, '');
      let suffix = 1;
      let newProfileId = `${baseProfileId}${suffix}`;

      while (await checkProfileIdExists(newProfileId)) {
        suffix++;
        newProfileId = `${baseProfileId}${suffix}`;
      }
      setSuggestedProfileId(newProfileId);
    } else {
      setSuggestedProfileId('');
    }

    setIsCheckingProfileId(false);
  };

  const handleEmailInput = (e) => {
    const email = e.target.value;
    setSelectedEmail(email);
    setErrors((prev) => ({ ...prev, email: '' }));

    if (email && !selectedProfileId) {
      const generatedProfileId = generateProfileId(email);
      setSelectedProfileId(generatedProfileId);
      handleProfileIdValidation(generatedProfileId);
    }
  };

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <>
      {/* <----------------- v1.0.0 */}
      <div>
        {/* <div className="grid grid-cols-2 sm:grid-cols-1 h-[calc(100vh-48px)]">
          <div className="h-full">
            <Slideshow />
          </div>
          <div className="h-full overflow-y-auto">
            <div className="flex items-center justify-center min-h-full px-[20%] md:px-[10%] sm:px-[7%] sm:py-5">
              <div className="w-full">
                <p className="text-2xl font-semibold mb-7 mt-7 text-center">{!formSubmitted ? 'Welcome Back' :
                  'Welcome Back. Please verify!'}</p>
                {!formSubmitted ? (
                  <form onSubmit={handleSubmit}>
                    <div className="flex justify-between gap-3 mb-4">
                      <div className="relative w-1/2">
                        <input
                          type="text"
                          id="first_name"
                          className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                          placeholder=" "
                          value={selectedFirstName}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          autoComplete="off"
                          spellCheck="false"
                        />
                        <label
                          htmlFor="first_name"
                          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                        >
                          First Name
                        </label>
                      </div>
                      <div className="relative w-1/2">
                        <input
                          type="text"
                          id="last_name"
                          className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                          placeholder=" "
                          value={selectedLastName}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          autoComplete="off"
                          spellCheck="false"
                        />
                        <label
                          htmlFor="last_name"
                          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                        >
                          Last Name
                        </label>
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        id="job_title"
                        className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.jobTitle ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                        placeholder=" "
                        value={selectedJobTitle}
                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <label
                        htmlFor="job_title"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                      >
                        Job Title
                      </label>
                      {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>}
                    </div>
                    <div className="relative mb-4">
                      <input
                        type="email"
                        id="Email"
                        className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                        placeholder=" "
                        value={selectedEmail}
                        onInput={handleEmailInput}
                        onBlur={(e) => handleBlur('email', e.target.value)}
                        autoComplete="email"
                      />
                      <label
                        htmlFor="Email"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                      >
                        Work Email
                      </label>
                      {isCheckingEmail && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div className="relative mb-4">
                      <div className="flex gap-2">
                        <div className="relative w-1/4" ref={countryCodeDropdownRef}>
                          <div
                            className={`flex items-center justify-between rounded border ${errors.phone ? 'border-red-500' : 'border-gray-300'} bg-white px-3 h-11 cursor-pointer`}
                            onClick={toggleDropdownCountryCode}
                          >
                            <span className="text-gray-900 text-sm">{selectedCountryCode}</span>
                            <MdArrowDropDown className="text-gray-500 text-xl" />
                          </div>
                          {showDropdownCountryCode && (
                            <div className="absolute z-50 border w-full rounded-md bg-white shadow-lg mt-1 max-h-60 overflow-y-auto">
                              {countryCodeOptions.map((option) => (
                                <div
                                  key={option.code}
                                  className="py-1 px-4 cursor-pointer hover:bg-gray-100 text-sm text-gray-900"
                                  onClick={() => handleCountryCodeSelect(option.code)}
                                >
                                  {option.code}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="relative w-3/4">
                          <div className="relative">
                            <input
                              type="tel"
                              id="Phone"
                              className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.phone ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                              placeholder=" "
                              value={selectedPhone}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                handleChange('phone', value);
                              }}
                              maxLength={selectedCountryCode === '+91' ? 10 : 11}
                              inputMode="numeric"
                              autoComplete="tel"
                            />
                            <label
                              htmlFor="Phone"
                              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                            >
                              Phone Number
                            </label>
                          </div>
                        </div>
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        id="company"
                        className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.company ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                        placeholder=" "
                        value={selectedCompany}
                        onChange={(e) => handleChange('company', e.target.value)}
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <label
                        htmlFor="company"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                      >
                        Company
                      </label>
                      {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
                    </div>
                    <div className="relative mb-4" ref={employeesDropdownRef}>
                      <div className="relative">
                        <input
                          type="text"
                          id="employees"
                          className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.employees ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                          placeholder=" "
                          value={selectedEmployees}
                          onClick={toggleDropdownEmployees}
                          readOnly
                          autoComplete="off"
                          spellCheck="false"
                        />
                        <label
                          htmlFor="employees"
                          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                        >
                          Employees
                        </label>
                        <div
                          className="absolute right-0 top-0"
                          onClick={toggleDropdownEmployees}
                        >
                          <MdArrowDropDown className="text-lg text-gray-500 mt-[14px] mr-3 cursor-pointer" />
                        </div>
                      </div>
                      {showDropdownEmployees && (
                        <div className="absolute z-50 border w-full rounded-md bg-white shadow-lg mt-1 top-full left-0">
                          {employeesOptions.map((option) => (
                            <div
                              key={option}
                              className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleEmployeesSelect(option)}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.employees && <p className="text-red-500 text-xs mt-1">{errors.employees}</p>}
                    </div>
                    <div className="relative mb-4" ref={countryDropdownRef}>
                      <div className="relative">
                        <input
                          type="text"
                          id="country"
                          className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.country ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                          placeholder=" "
                          value={selectedCountry}
                          onClick={toggleDropdownCountry}
                          readOnly
                          autoComplete="off"
                          spellCheck="false"
                        />
                        <label
                          htmlFor="country"
                          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                        >
                          Country / Region
                        </label>
                        <div
                          className="absolute right-0 top-0"
                          onClick={toggleDropdownCountry}
                        >
                          <MdArrowDropDown className="text-lg text-gray-500 mt-[14px] mr-3 cursor-pointer" />
                        </div>
                      </div>
                      {showDropdownCountry && (
                        <div className="absolute z-50 border w-full rounded-md bg-white shadow-lg mt-1 top-full left-0">
                          {countryOptions.map((option) => (
                            <div
                              key={option}
                              className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleCountrySelect(option)}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                    </div>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        id="profileId"
                        className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.profileId ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                        placeholder=" "
                        autoComplete="off"
                        value={selectedProfileId}
                        onChange={(e) => handleChange('profileId', e.target.value)}
                        onBlur={(e) => handleBlur('profileId', e.target.value)}
                      />
                      <label
                        htmlFor="profileId"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                      >
                        Profile ID / UserName
                      </label>
                      {isCheckingProfileId && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                      {errors.profileId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.profileId}
                          {suggestedProfileId && errors.profileId.includes('already taken') && (
                            <span className="text-gray-600 ml-2">
                              Try this:{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProfileId(suggestedProfileId);
                                  setSuggestedProfileId('');
                                  setErrors((prev) => ({ ...prev, profileId: '' }));
                                }}
                                className="text-blue-500 hover:underline"
                              >
                                {suggestedProfileId}
                              </button>
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="relative mb-4">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="create_password"
                          className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.password ? "border-red-500" : "border-gray-300"
                            } appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                          placeholder=" "
                          value={selectedPassword}
                          onChange={(e) => handleChange("password", e.target.value)}
                          onBlur={(e) => handleBlur("password", e.target.value)}
                          onCopy={(e) => e.preventDefault()}
                          onPaste={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          autoComplete="new-password"
                          spellCheck="false"
                        />
                        <label
                          htmlFor="create_password"
                          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                        >
                          Create Password
                        </label>
                        <button
                          type="button"
                          className="absolute top-3 right-3 flex items-center text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1 w-96">{errors.password}</p>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirm_password"
                          className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                            } appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                          placeholder=" "
                          value={selectedConfirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                          onCopy={(e) => e.preventDefault()}
                          onPaste={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          autoComplete="new-password"
                          spellCheck="false"
                        />
                        <label
                          htmlFor="confirm_password"
                          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                        >
                          Confirm Password
                        </label>
                        <button
                          type="button"
                          className="absolute top-3 right-3 flex items-center text-gray-500"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <div className="text-sm mb-4">
                        If already registered | <span className="cursor-pointer text-custom-blue underline hover:text-custom-blue/80 transition-colors duration-200" onClick={() => navigate('/organization-login')}>Login</span>
                      </div>
                    </div>
                    <div className="flex justify-center mb-10">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full text-sm font-medium text-white rounded-lg px-4 py-3 transition-colors duration-300 flex items-center justify-center ${isSubmitting ? 'bg-custom-blue cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-blue/90 shadow-md'}`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center">
                    <p className="text-lg mb-2">
                      We've already sent a verification email to <span className="font-semibold">{email}</span>.
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      If you didn’t receive it, you can resend the email below.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleResendVerification}
                        disabled={isResending || countdown > 0}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium ${isResending || countdown > 0 ? 'bg-custom-blue/70 cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-blue/90 text-white shadow-md'}`}
                      >
                        {isResending ? 'Resending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
                      </button>
                      <button
                        onClick={() => navigate('/organization-login')}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium"
                      >
                        Back to Login
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div> */}
        {/* <Layout showBackButton={true} backPath="/organization"> */}
        <div className="min-h-screen flex">
          {/* Left side - Hero Image and Content */}
          <div className="hidden lg:flex lg:w-1/2 xl:flex xl:w-1/2 2xl:flex 2xl:w-1/2 bg-gradient-to-br from-custom-blue to-custom-blue/90 relative overflow-hidden rounded-r-3xl">
            <div className="absolute inset-0">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Team collaboration and hiring"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-custom-blue/90 to-custom-blue/80"></div>
            </div>

            <div className="relative z-10 flex -mt-20 flex-col justify-center px-4 lg:px-8 text-white">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Transform Your Hiring Process</h1>
                <p className="text-xl text-white leading-relaxed font-medium">
                  Join 200+ companies using UpInterview to reduce time-to-hire by 60%
                  and access expert interviewers on-demand.
                </p>
              </div>

              {/* Value Propositions */}
              <div className="space-y-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-lg">No More Scheduling Delays</h4>
                  </div>
                  <p className="text-white text-base font-medium">
                    Stop waiting for your technical team's availability. Schedule interviews
                    instantly with our network of 500+ expert interviewers.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-lg">Hybrid Team Management</h4>
                  </div>
                  <p className="text-white text-base font-medium">
                    Seamlessly coordinate both external expert interviewers and your
                    internal team members in one unified platform.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-lg">Detailed Assessments</h4>
                  </div>
                  <p className="text-white text-base font-medium">
                    Get comprehensive feedback and detailed candidate evaluations
                    to make informed hiring decisions quickly.
                  </p>
                </div>
              </div>

              {/* Platform Features */}
              <div className="space-y-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-lg">📝 Smart Assessment Suite</h4>
                  </div>
                  <p className="text-white text-base font-medium mb-4">
                    Pre-built technical assessments, coding challenges, and behavioral evaluation tools
                    tailored to specific roles and experience levels.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      <span>500+ Coding Challenges</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      <span>System Design Tests</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      <span>Behavioral Assessments</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      <span>Custom Question Sets</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-lg">💬 Advanced Feedback System</h4>
                  </div>
                  <p className="text-white text-base font-medium mb-4">
                    Comprehensive interview reports with detailed scoring, candidate strengths,
                    improvement areas, and clear hiring recommendations.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      <span>Detailed Scorecards</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      <span>Video Recordings</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      <span>Code Review Notes</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      <span>Hiring Recommendations</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Metrics */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-lg mb-4 text-center">Join Successful Companies</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">60%</div>
                    <div className="text-sm text-white/80">Faster Hiring</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">10k+</div>
                    <div className="text-sm text-white/80">Interviews</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">95%</div>
                    <div className="text-sm text-white/80">Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">200+</div>
                    <div className="text-sm text-white/80">Companies</div>
                  </div>
                </div>
              </div>

              {/* Question Bank & Analytics */}
              <div className="space-y-3 mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                    </svg>
                    <h5 className="font-semibold">🏦 Curated Question Bank</h5>
                  </div>
                  <p className="text-white text-base font-medium">1000+ interview questions across technologies, with difficulty ratings and expected answers.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <h5 className="font-semibold">📊 Real-time Analytics</h5>
                  </div>
                  <p className="text-white text-base font-medium">Track hiring pipeline, interviewer performance, and candidate success rates with detailed insights.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Signup Form */}
          <div className="w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2 flex items-start justify-center p-4 lg:p-8 bg-gray-50 overflow-y-auto">
            <div className="max-w-lg w-full py-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="text-center mb-8">
                  <img src={logo} alt="Upinterview Logo" className="w-32 object-contain mx-auto mb-3 hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Create Your Account</h2>
                  <p className="text-gray-600">Start accelerating your hiring process today</p>
                </div>

                {/* Benefits Banner */}
                <div className="bg-gradient-to-r from-custom-blue to-custom-blue/90 rounded-xl p-3 mb-4 text-white">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold">What You Get:</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>✓ Instant access to 500+ expert interviewers</div>
                    <div>✓ Schedule interviews without team delays</div>
                    <div>✓ Manage both external and internal interviewers</div>
                  </div>
                </div>

                {!formSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Company Information Section */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        🏢 Company Information
                      </h3>

                      <div className="mb-4">
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          id="company"
                          value={selectedCompany}
                          onChange={(e) => handleChange('company', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${errors.company ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="Acme Corporation"
                          autoComplete="organization"
                        />
                        {errors.company && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.company}
                          </p>
                        )}
                      </div>

                      <div className="mb-4 relative" ref={employeesDropdownRef}>
                        <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-2">
                          Employees *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="employees"
                            value={selectedEmployees}
                            onClick={toggleDropdownEmployees}
                            readOnly
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${errors.employees ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="Select employees"
                          />
                          <div
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={toggleDropdownEmployees}
                          >
                            <MdArrowDropDown className={`text-gray-500 text-xl cursor-pointer transition-transform duration-200 ${showDropdownEmployees ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        {showDropdownEmployees && (
                          <div className="absolute z-50 border w-full rounded-md bg-white shadow-lg mt-1 top-full left-0 max-h-60 overflow-y-auto">
                            {employeesOptions.map((option) => (
                              <div
                                key={option}
                                className="py-3 px-4 cursor-pointer hover:bg-gray-100 text-gray-900 text-sm transition-colors duration-150"
                                onClick={() => handleEmployeesSelect(option)}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                        {errors.employees && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.employees}
                          </p>
                        )}
                      </div>

                      <div className="mb-4 relative" ref={countryDropdownRef}>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                          Country *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="country"
                            value={selectedCountry}
                            onClick={toggleDropdownCountry}
                            readOnly
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${errors.country ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="Select country"
                          />
                          <div
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={toggleDropdownCountry}
                          >
                            <MdArrowDropDown className={`text-gray-500 text-xl cursor-pointer transition-transform duration-200 ${showDropdownCountry ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        {showDropdownCountry && (
                          <div className="absolute z-50 border w-full rounded-md bg-white shadow-lg mt-1 top-full left-0 max-h-60 overflow-y-auto">
                            {countryOptions.map((option) => (
                              <div
                                key={option}
                                className="py-3 px-4 cursor-pointer hover:bg-gray-100 text-gray-900 text-sm transition-colors duration-150"
                                onClick={() => handleCountrySelect(option)}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                        {errors.country && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.country}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Personal Information Section */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        👤 Account Information
                      </h3>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            value={selectedFirstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all duration-200 ${errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="John"
                            autoComplete="given-name"
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            value={selectedLastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="Doe"
                            autoComplete="family-name"
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          id="jobTitle"
                          value={selectedJobTitle}
                          onChange={(e) => handleChange('jobTitle', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${errors.jobTitle ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="HR Manager"
                          autoComplete="organization-title"
                        />
                        {errors.jobTitle && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.jobTitle}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Work Email Address *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="email"
                            value={selectedEmail}
                            onChange={handleEmailInput}
                            onBlur={(e) => handleBlur('email', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="john.doe@company.com"
                            autoComplete="email"
                          />
                          {isCheckingEmail && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-custom-blue"></div>
                            </div>
                          )}
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="flex gap-2">
                          <div className="relative w-1/4" ref={countryCodeDropdownRef}>
                            <div
                              className={`flex items-center justify-between rounded border
                                 bg-white px-3 h-12 cursor-pointer`}
                              onClick={toggleDropdownCountryCode}
                            >
                              <span className="text-gray-900 text-sm">{selectedCountryCode}</span>
                              <MdArrowDropDown className="text-gray-500 text-xl" />
                            </div>
                            {showDropdownCountryCode && (
                              <div className="absolute z-50 border w-full rounded-md bg-white shadow-lg mt-1 max-h-60 overflow-y-auto">
                                {countryCodeOptions.map((option) => (
                                  <div
                                    key={option.code}
                                    className="py-2 px-4 cursor-pointer hover:bg-gray-100 text-sm text-gray-900"
                                    onClick={() => handleCountryCodeSelect(option.code)}
                                  >
                                    {option.code}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="relative w-3/4">
                            <input
                              type="tel"
                              id="phone"
                              value={selectedPhone}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                handleChange('phone', value);
                              }}
                              maxLength={selectedCountryCode === '+91' ? 10 : 11}
                              inputMode="numeric"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200
                                `}
                              placeholder="1234567890"
                              autoComplete="tel"
                            />
                          </div>
                        </div>
                        {/* {errors.phone && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.phone}
                          </p>
                        )} */}
                      </div>

                      <div className="mb-4">
                        <label htmlFor="profileId" className="block text-sm font-medium text-gray-700 mb-2">
                          Profile ID / Username *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="profileId"
                            value={selectedProfileId}
                            onChange={(e) => handleChange('profileId', e.target.value)}
                            onBlur={(e) => handleBlur('profileId', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${errors.profileId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="your-username"
                            autoComplete="username"
                          />
                          {isCheckingProfileId && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-custom-blue"></div>
                            </div>
                          )}
                        </div>
                        {errors.profileId && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.profileId}
                            {suggestedProfileId && errors.profileId.includes('already taken') && (
                              <span className="text-gray-600 ml-2">
                                Try this:{' '}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProfileId(suggestedProfileId);
                                    setSuggestedProfileId('');
                                    setErrors((prev) => ({ ...prev, profileId: '' }));
                                  }}
                                  className="text-blue-500 hover:underline"
                                >
                                  {suggestedProfileId}
                                </button>
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                          Create Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={selectedPassword}
                            onChange={(e) => handleChange("password", e.target.value)}
                            onBlur={(e) => handleBlur("password", e.target.value)}
                            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all duration-200 ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="••••••••"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={selectedConfirmPassword}
                            onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="••••••••"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Account Security Section */}
                    {/* <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        🔐 Account Security
                      </h3>

                      <div className="mb-4">
                        <label htmlFor="profileId" className="block text-sm font-medium text-gray-700 mb-2">
                          Profile ID / Username *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="profileId"
                            value={selectedProfileId}
                            onChange={(e) => handleChange('profileId', e.target.value)}
                            onBlur={(e) => handleBlur('profileId', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${errors.profileId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="your-username"
                            autoComplete="username"
                          />
                          {isCheckingProfileId && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-custom-blue"></div>
                            </div>
                          )}
                        </div>
                        {errors.profileId && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.profileId}
                            {suggestedProfileId && errors.profileId.includes('already taken') && (
                              <span className="text-gray-600 ml-2">
                                Try this:{' '}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProfileId(suggestedProfileId);
                                    setSuggestedProfileId('');
                                    setErrors((prev) => ({ ...prev, profileId: '' }));
                                  }}
                                  className="text-blue-500 hover:underline"
                                >
                                  {suggestedProfileId}
                                </button>
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                          Create Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={selectedPassword}
                            onChange={(e) => handleChange("password", e.target.value)}
                            onBlur={(e) => handleBlur("password", e.target.value)}
                            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all duration-200 ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="••••••••"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={selectedConfirmPassword}
                            onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="••••••••"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div> */}

                    {/* <div className="flex justify-center mb-4">
                        <div className="text-sm text-gray-600">
                          If already registered | <span className="cursor-pointer text-primary-500 hover:underline" onClick={() => navigate('/organization-login')}>Login</span>
                        </div>
                      </div> */}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full text-lg font-medium rounded-lg py-3 transition-all duration-300 flex items-center justify-center ${isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed transform scale-95'
                        : 'bg-custom-blue hover:bg-custom-blue/90 text-white transform hover:scale-105'
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        'Create Organization Account ✨'
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-custom-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-custom-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Email Verification Required 📧
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We've sent a verification email to{' '}
                      <span className="font-semibold text-custom-blue">{email}</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Please check your inbox and click the verification link to continue.
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={handleResendVerification}
                        disabled={isResending || countdown > 0}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isResending || countdown > 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-custom-blue hover:bg-custom-blue/90 text-white transform hover:scale-105'
                          }`}
                      >
                        {isResending ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Resending...
                          </span>
                        ) : countdown > 0 ? (
                          `Resend in ${countdown}s`
                        ) : (
                          'Resend Verification Email'
                        )}
                      </button>

                      <button
                        onClick={() => navigate('/organization-login')}
                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                      >
                        Back to Login
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/organization-login"
                      className="text-custom-blue hover:text-custom-blue/80 font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-4">Trusted by leading companies:</p>
                <div className="flex justify-center space-x-3 mb-4">
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                    <span className="text-xs font-medium text-gray-700">Stripe</span>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                    <span className="text-xs font-medium text-gray-700">Airbnb</span>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                    <span className="text-xs font-medium text-gray-700">Uber</span>
                  </div>
                </div>

                <div className="flex justify-center items-center space-x-4 text-gray-500 text-xs">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>SOC 2 Compliant</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>99.9% Uptime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* </Layout> */}
      </div>
      {/* v1.0.0 ---------------> */}
    </>
  );
};

export default Organization;