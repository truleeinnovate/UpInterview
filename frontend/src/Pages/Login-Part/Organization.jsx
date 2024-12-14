import React, { useState, useEffect, memo } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import image1 from "../Dashboard-Part/Images/image1.png";
import Cookies from 'js-cookie';
import { fetchMasterData } from '../../utils/fetchMasterData';
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";

import { ReactComponent as MdArrowDropDown } from '../../../src/icons/MdArrowDropDown.svg';

const countryOptions = ["India", "UK"];
const employeesOptions = ["1-10", "11-20", "21-50", "51-100", "100+"];

// const FloatingLabelInput = memo(({ id, label, value, onChange, type = "text", readOnly, onClick }) => (
//   <div className="relative">
//     <input
//       type={type}
//       id={id}
//       className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
//       placeholder=" "
//       value={value}
//       onChange={onChange}
//       readOnly={readOnly}
//       onClick={onClick}
//     />
//     <label
//       htmlFor={id}
//       className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
//     >
//       {label}
//     </label>
//   </div>
// ));

const Organization = memo(() => {
  const [selectedFirstName, setSelectedFirstName] = useState("");
  const [selectedLastName, setSelectedLastName] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedUsername, setSelectedUsername] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPassword, setSelectedPassword] = useState("");
  const [selectedConfirmPassword, setSelectedConfirmPassword] = useState("");
  const [showDropdownEmployees, setShowDropdownEmployees] = useState(false);
  const [showDropdownCountry, setShowDropdownCountry] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [objectsData, setObjectsData] = useState([]);
  const [tabsData, setTabsData] = useState([]);
  const navigate = useNavigate();

  const backendUrl = process.env.NODE_ENV === 'production'
    ? 'https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net'
    : 'http://localhost:4041';


  // useEffect(() => {
  //   const fetchObjectsData = async () => {
  //     try {
  //       const data = await fetchMasterData('api/objects');
  //       const objects = data?.objects;
  //       setObjectsData(Array.isArray(objects) ? objects : []);
  //     } catch (error) {
  //       console.error('Error fetching objects data:', error);
  //       setObjectsData([]);
  //     }
  //   };

  //   const fetchTabsData = async () => {
  //     try {
  //       const data = await fetchMasterData('api/tabs');
  //       const tabs = data?.tabs;
  //       setTabsData(Array.isArray(tabs) ? tabs : []);
  //     } catch (error) {
  //       console.error('Error fetching tabs data:', error);
  //       setTabsData([]);
  //     }
  //   };

  //   fetchObjectsData();
  //   fetchTabsData();
  // }, []);

  const toggleDropdownEmployees = () => {
    setShowDropdownEmployees(!showDropdownEmployees);
  };

  const handleEmployeesSelect = (option) => {
    setSelectedEmployees(option);
    setShowDropdownEmployees(false);
  };

  const toggleDropdownCountry = () => {
    setShowDropdownCountry(!showDropdownCountry);
  };

  const handleCountrySelect = (option) => {
    setSelectedCountry(option);
    setShowDropdownCountry(false);
  };

  const validateForm = () => {
    if (selectedPassword !== selectedConfirmPassword) {
      setErrorMessage("Passwords do not match!");
      return false;
    }

    const requiredFields = {
      'First Name': selectedFirstName,
      'Last Name': selectedLastName,
      'Email': selectedEmail,
      'Phone': selectedPhone,
      'Username': selectedUsername,
      'Job Title': selectedJobTitle,
      'Company': selectedCompany,
      'Employees': selectedEmployees,
      'Country': selectedCountry,
      'Password': selectedPassword
    };

    const emptyFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (emptyFields.length > 0) {
      setErrorMessage(`Please fill in the following required fields: ${emptyFields.join(', ')}`);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(selectedEmail)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const formData = {
        firstName: selectedFirstName.trim(),
        lastName: selectedLastName.trim(),
        Email: selectedEmail.trim(),
        Phone: selectedPhone.trim(),
        username: selectedUsername.trim(),
        jobTitle: selectedJobTitle.trim(),
        company: selectedCompany.trim(),
        employees: selectedEmployees,
        country: selectedCountry,
        password: selectedPassword
      };

      // Create axios instance with default config
      const axiosInstance = axios.create({
        baseURL: backendUrl,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        withCredentials: true,
        timeout: 15000
      });

      const response = await axiosInstance.post('/organization', formData);

      if (!response?.data?.user?._id || !response?.data?.organization?._id) {
        throw new Error("Invalid response from server");
      }

      const { user, organization } = response.data;

      // Set cookies with proper domain
      Cookies.set('userId', user._id, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      Cookies.set('organizationId', organization._id, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      navigate('/price');

    } catch (error) {
      console.error('Error saving organization:', error);
      
      let errorMessage = 'An error occurred while saving the organization';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        console.error('Server error:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Unable to reach the server. Please check your connection.';
        console.error('Network error:', error.request);
      } else {
        errorMessage = error.message;
        console.error('Error:', error.message);
      }
      
      setErrorMessage(errorMessage);
    }
  };

  return (
    <>
      <div className="border-b p-4">
        <img src={logo} alt="Logo" className="w-20" />
      </div>
      <div className="container mx-auto grid grid-cols-2 items-center justify-center p-4">
        <div className="col-span-1 flex justify-center">
          <img src={image1} alt="Interview" className="h-[29rem]" />
        </div>
        <div className="col-span-1 mt-3" style={{ width: "75%" }}>
          <p className="text-3xl font-medium mb-4 text-center">Sign Up</p>
          {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-5">
              <div className="relative">
                <input
                  type="text"
                  id="first_name"
                  className="block rounded px-8 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  value={selectedFirstName}
                  onChange={(e) => setSelectedFirstName(e.target.value)}
                />
                <label
                  htmlFor="first_name"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  First Name
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="last_name"
                  className="block rounded px-8 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  placeholder=" "
                  value={selectedLastName}
                  onChange={(e) => setSelectedLastName(e.target.value)}
                />
                <label
                  htmlFor="last_name"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  Last Name
                </label>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                id="job_title"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                value={selectedJobTitle}
                onChange={(e) => setSelectedJobTitle(e.target.value)}
              />
              <label
                htmlFor="job_title"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Job Title
              </label>
            </div>
            <div className="relative">
              <input
                type="email"
                id="Email"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
              />
              <label
                htmlFor="Email"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Email
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                id="Phone"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedPhone}
                onChange={(e) => setSelectedPhone(e.target.value)}
              />
              <label
                htmlFor="Phone"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Phone
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                id="company"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              />
              <label
                htmlFor="company"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Company
              </label>
            </div>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  id="employees"
                  className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  placeholder=" "
                  value={selectedEmployees}
                  onClick={toggleDropdownEmployees}
                  readOnly
                />
                <label
                  htmlFor="employees"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
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
                <div className="absolute z-50 border mb-5 w-full rounded-md bg-white shadow-lg">
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
            </div>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  id="country"
                  className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  placeholder=" "
                  value={selectedCountry}
                  onClick={toggleDropdownCountry}
                  readOnly
                />
                <label
                  htmlFor="country"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  Country/Region
                </label>
                <div
                  className="absolute right-0 top-0"
                  onClick={toggleDropdownCountry}
                >
                  <MdArrowDropDown className="text-lg text-gray-500 mt-[14px] mr-3 cursor-pointer" />
                </div>
              </div>
              {showDropdownCountry && (
                <div className="absolute z-50 border mb-5 w-full rounded-md bg-white shadow-lg">
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
            </div>
            <div className="relative">
              <input
                type="text"
                id="username"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
              />
              <label
                htmlFor="username"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Username
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                id="create_password"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedPassword}
                onChange={(e) => setSelectedPassword(e.target.value)}
              />
              <label
                htmlFor="create_password"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Create Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                id="confirm_password"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedConfirmPassword}
                onChange={(e) => setSelectedConfirmPassword(e.target.value)}
              />
              <label
                htmlFor="confirm_password"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Confirm Password
              </label>
            </div>
            <div className="flex justify-center">
              <div className="text-sm mb-4">
                If already registered | <span className="cursor-pointer text-blue-500 underline" onClick={() => navigate('/admin')}>Login</span>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-20 py-2 bg-blue-500 text-white rounded-3xl"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
});

export default Organization;
