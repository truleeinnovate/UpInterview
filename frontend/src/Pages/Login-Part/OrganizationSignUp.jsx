import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
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

export const Organization = () => {
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
  const countryOptions = ["India", "UK", "USA", "UAE"];
  const countryCodeOptions = [
    { country: "India", code: "+91" },
    { country: "UK", code: "+44" }
  ];
  const employeesOptions = ["0-10", "10-20", "50-100", "100-500", "500-1000"];
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const emailInputRef = useRef(null);
  const profileIdInputRef = useRef(null);
  const emailTimeoutRef = useRef(null);
  const profileIdTimeoutRef = useRef(null);
  
  // to click outside of dropdown
  const employeesDropdownRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const countryCodeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (employeesDropdownRef.current && !employeesDropdownRef.current.contains(event.target)) &&
        (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) &&
        (countryCodeDropdownRef.current && !countryCodeDropdownRef.current.contains(event.target))
      ) {
        setShowDropdownEmployees(false);
        setShowDropdownCountry(false);
        setShowDropdownCountryCode(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkEmailExists = useCallback(async (email) => {
    if (!email) return false;
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/check-email?email=${email}`
      );
      return response.data.exists;
    } catch (error) {
      console.error("Email check error:", error);
      return false;
    }
  }, []);

  const checkProfileIdExists = useCallback(async (profileId) => {
    if (!profileId) return false;
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/check-username?username=${profileId}`
      );
      return response.data.exists;
    } catch (error) {
      console.error("Profile ID check error:", error);
      return false;
    }
  }, []);

  const handleEmailValidation = async (email) => {
    if (!email) {
      setErrors((prev) => ({ ...prev, email: '' }));
      setIsCheckingEmail(false);
      return;
    }

    setIsCheckingEmail(true);
    const errorMessage = await validateEmail(email, checkEmailExists);
    setErrors((prev) => ({ ...prev, email: errorMessage }));
    setIsCheckingEmail(false);
  };

  const handleProfileIdValidation = async (profileId) => {
    if (!profileId) {
      setErrors((prev) => ({ ...prev, profileId: '' }));
      setIsCheckingProfileId(false);
      return;
    }
  
    setIsCheckingProfileId(true);
    const errorMessage = await validateProfileId(profileId, checkProfileIdExists); // This returns { errorMessage, suggestedProfileId }
    setErrors((prev) => ({ ...prev, profileId: errorMessage }));
    setIsCheckingProfileId(false);
  };

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
      setErrors((prev) => ({
        ...prev,
        password: passwordError,
        confirmPassword: selectedConfirmPassword && value !== selectedConfirmPassword ? 'Passwords do not match' : ''
      }));
    } else if (field === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value && value !== selectedPassword ? 'Passwords do not match' : ''
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
    setShowDropdownEmployees(!showDropdownEmployees);
  };

  const handleEmployeesSelect = (option) => {
    setSelectedEmployees(option);
    setShowDropdownEmployees(false);
    setErrors((prev) => ({ ...prev, employees: '' }));
  };

  const toggleDropdownCountry = () => {
    setShowDropdownCountry(!showDropdownCountry);
  };

  const handleCountrySelect = (option) => {
    setSelectedCountry(option);
    setShowDropdownCountry(false);
    setErrors((prev) => ({ ...prev, country: '' }));
    // const matchingCode = countryCodeOptions.find((item) => item.country === option)?.code || "+91";
    // setSelectedCountryCode(matchingCode);
    // setErrors((prev) => ({ ...prev, phone: validatePhone(selectedPhone, matchingCode) }));
  };

  const toggleDropdownCountryCode = () => {
    setShowDropdownCountryCode(!showDropdownCountryCode);
  };

  const handleCountryCodeSelect = (code) => {
    setSelectedCountryCode(code);
    setShowDropdownCountryCode(false);
    setErrors((prev) => ({ ...prev, phone: validatePhone(selectedPhone, code) }));
    // const matchingCountry = countryCodeOptions.find((item) => item.code === code)?.country || "India";
    // setSelectedCountry(matchingCountry);
    // setErrors((prev) => ({ ...prev, country: '' }));
  };

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
    contactType: 'Organization'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateOrganizationSignup(
      organizationData,
      setErrors,
      checkEmailExists,
      checkProfileIdExists
    );

    const confirmPasswordError = validateConfirmPassword(selectedPassword, selectedConfirmPassword);
    if (confirmPasswordError) {
      setErrors((prev) => ({ ...prev, confirmPassword: confirmPasswordError }));
      console.error("Please fix the errors in the form");
      return;
    }

    if (!isValid) {
      console.error("Please fix the errors in the form");
      return;
    }

    try {
      const response = await axios.post(`${config.REACT_APP_API_URL}/Organization/Signup`, organizationData);
      const data = response.data;

      Cookies.set('userId', data.user._id, { expires: 7 });
      Cookies.set('organizationId', data.organization._id, { expires: 7 });
      toast.success("Organization created successfully!");
      navigate('/subscription-plans');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-1">
        <div>
          <Slideshow />
        </div>
        <div className="flex flex-col items-center justify-center sm:px-4 px-6 md:px-8">
          <div className="max-h-[532px] overflow-y-scroll">
            <style>
              {`
          ::-webkit-scrollbar {
            display: none;
          }
        `}
            </style>
            <p className="text-xl font-medium mb-6 mt-4 text-center">Sign Up</p>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
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
                <div className="relative">
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
              <div className="relative">
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
              <div className="relative">
                <input
                  type="text"
                  id="Email"
                  className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                  placeholder=" "
                  value={selectedEmail}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={(e) => handleBlur('email', e.target.value)}
                  autoComplete="off"
                  spellCheck="false"
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
              <div className="relative flex gap-2">
                <div className="relative w-1/4" ref={countryCodeDropdownRef}>
                  <input
                    type="text"
                    id="country_code"
                    className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.phone ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                    placeholder=" "
                    value={selectedCountryCode}
                    onClick={toggleDropdownCountryCode}
                    readOnly
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <label
                    htmlFor="country_code"
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                  >
                    Code
                  </label>
                  <div
                    className="absolute right-0 top-0"
                    onClick={toggleDropdownCountryCode}
                  >
                    <MdArrowDropDown className="text-lg text-gray-500 mt-[14px] mr-3 cursor-pointer" />
                  </div>
                  {showDropdownCountryCode && (
                    <div className="absolute z-50 border w-full rounded-md bg-white shadow-lg mt-1 top-full left-0">
                      {countryCodeOptions.map((option) => (
                        <div
                          key={option.code}
                          className="py-2 px-4 cursor-pointer hover:bg-gray-100"
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
                    type="text"
                    id="Phone"
                    className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.phone ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                    placeholder=" "
                    value={selectedPhone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    maxLength={selectedCountryCode === '+91' ? 10 : 11}
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <label
                    htmlFor="Phone"
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                  >
                    Phone
                  </label>
                  {errors.phone && <p className="text-red-500 text-xs mt-1 w-64">{errors.phone}</p>}
                </div>
              </div>
              <div className="relative">
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
              {/* employees */}
              <div className="relative" ref={employeesDropdownRef}>
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
              <div className="relative" ref={countryDropdownRef}>
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
              <div className="relative">
                <input
                  type="text"
                  id="profileId"
                  className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.profileId ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                  placeholder=" "
                  value={selectedProfileId}
                  onChange={(e) => handleChange('profileId', e.target.value)}
                  onBlur={(e) => handleBlur('profileId', e.target.value)}
                  autoComplete="off"
                  spellCheck="false"
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
                {errors.profileId && <p className="text-red-500 text-xs mt-1">{errors.profileId}</p>}
              </div>
              <div className="relative">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="create_password"
                    className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.password ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                    placeholder=" "
                    value={selectedPassword}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={(e) => handleBlur('password', e.target.value)}
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
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 w-96">{errors.password}</p>}
              </div>
              <div className="relative">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                    placeholder=" "
                    value={selectedConfirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
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
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
              <div className="flex justify-center">
                <div className="text-sm mb-4">
                  If already registered | <span className="cursor-pointer text-custom-blue underline" onClick={() => navigate('/organizationLogin')}>Login</span>
                </div>
              </div>
              <div className="flex justify-center mb-5">
                <button
                  type="submit"
                  className="px-8 py-2 bg-custom-blue text-white rounded-3xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Organization;