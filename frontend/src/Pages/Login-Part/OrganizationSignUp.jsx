import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { ReactComponent as MdArrowDropDown } from '../../../src/icons/MdArrowDropDown.svg';
import Slideshow from "./Slideshow";
import { config } from '../../config';
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
    closeAllDropdowns();
    setShowDropdownEmployees((prev) => !prev);
  };

  const handleEmployeesSelect = (option) => {
    setSelectedEmployees(option);
    closeAllDropdowns();
    setErrors((prev) => ({ ...prev, employees: '' }));
  };

  const toggleDropdownCountry = () => {
    closeAllDropdowns();
    setShowDropdownCountry((prev) => !prev);
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
    if (isSubmitting) return;

    setIsSubmitting(true);

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
      contactType: 'Organization',
    };

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
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-1 h-[calc(100vh-48px)]">
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
                        If already registered | <span className="cursor-pointer text-custom-blue underline" onClick={() => navigate('/organization-login')}>Login</span>
                      </div>
                    </div>
                    <div className="flex justify-center mb-10">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full text-sm text-white rounded px-3 py-[10px] transition-colors duration-300 flex items-center justify-center ${isSubmitting ? 'bg-custom-blue cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-blue/80'}`}
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
                        className={`px-4 py-2 rounded-md transition-colors ${isResending || countdown > 0 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                      >
                        {isResending ? 'Resending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
                      </button>
                      <button
                        onClick={() => navigate('/organization-login')}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
                      >
                        Back to Login
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Organization;