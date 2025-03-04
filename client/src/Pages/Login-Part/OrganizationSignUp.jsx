import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { fetchMasterData } from '../../utils/fetchMasterData';
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { ReactComponent as MdArrowDropDown } from '../../../src/icons/MdArrowDropDown.svg';
import Slideshow from "./Slideshow";

export const Organization = () => {
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
  const countryOptions = ["India", "UK"];
  const employeesOptions = ["Employees", "11-20"];
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [objectsData, setObjectsData] = useState([]);
  // const [tabsData, setTabsData] = useState([]);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchObjectsData = async () => {
  //     try {
  //       const data = await fetchMasterData('api/objects');
  //       setObjectsData(data.objects || []);
  //     } catch (error) {
  //       console.error('Error fetching objects data:', error);
  //     }
  //   };
  //   const fetchTabsData = async () => {
  //     try {
  //       const data = await fetchMasterData('api/tabs');
  //       setTabsData(data.tabs || []);
  //     } catch (error) {
  //       console.error('Error fetching tabs data:', error);
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (selectedPassword !== selectedConfirmPassword) {
  //     setErrorMessage("Passwords do not match!");
  //     return;
  //   }
  //   try {
  //     // Ensure objectsData and tabsData are arrays
  //     if (!Array.isArray(objectsData) || !Array.isArray(tabsData)) {
  //       throw new Error("Objects data or tabs data is not available");
  //     }
  //     // Create organization
  //     const formData = {
  //       firstName: selectedFirstName,
  //       lastName: selectedLastName,
  //       Email: selectedEmail,
  //       Phone: selectedPhone,
  //       username: selectedUsername,
  //       jobTitle: selectedJobTitle,
  //       company: selectedCompany,
  //       employees: selectedEmployees,
  //       country: selectedCountry,
  //       password: selectedPassword,
  //       contactType: 'Organization'
  //     };

  //     const response = await axios.post(`${process.env.REACT_APP_API_URL}/organization`, formData);

  //     Cookies.set('userId', response.data.user._id, { expires: 7 });
  //     Cookies.set('organizationId', response.data.organization._id, { expires: 7 });

  //     const organizationId = response.data.organization._id;
  //     const userId = response.data.user._id; // Ensure user ID is correctly retrieved

  //     // Construct accessBody from objectsData and tabsData
  //     const accessBody = objectsData.map(tab => ({
  //       ObjName: tab,
  //       Access: 'Public',
  //       GrantAccess: false
  //     }));

  //     // Save default sharing settings
  //     await axios.post(`${process.env.REACT_APP_API_URL}/api/sharing-settings`, {
  //       Name: 'sharingSettingDefaultName',
  //       organizationId: organizationId,
  //       accessBody: accessBody
  //     });

  //     // Create default profiles
  //     const profileNames = ["Admin", "CEO", "HR Manager", "HR Lead", "HR Recruiter"];
  //     let adminProfileId = "";
  //     for (let i = 0; i < profileNames.length; i++) {
  //       const profileTabs = tabsData.map(tab => ({
  //         name: tab,
  //         status: profileNames[i] === "Admin" ? 'Visible' : 'Hidden'
  //       }));
  //       const profileObjects = objectsData.map(object => ({
  //         name: object,
  //         permissions: {
  //           View: true,
  //           Create: true,
  //           Edit: true,
  //           Delete: profileNames[i] === "Admin"
  //         }
  //       }));

  //       const profileResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles`, {
  //         label: profileNames[i],
  //         Name: profileNames[i],
  //         Description: `Default profile description for ${profileNames[i]}`,
  //         Tabs: profileTabs,
  //         Objects: profileObjects,
  //         organizationId: organizationId
  //       });

  //       if (profileNames[i] === "Admin") {
  //         adminProfileId = profileResponse.data._id;
  //       }
  //     }

  //     // Create default roles
  //     const roles = [
  //       { label: "Admin", name: "Admin" },
  //       { label: "CEO", name: "CEO" },
  //       { label: "HR Manager", name: "HR_Manager" },
  //       { label: "HR Lead", name: "HR_Lead" },
  //       { label: "Recruiter", name: "Recruiter" },
  //     ];

  //     let adminRoleId = "";
  //     let ceoRoleId = "";
  //     let hrManagerRoleId = "";
  //     let hrLeadRoleId = "";

  //     for (let i = 0; i < roles.length; i++) {
  //       let reportsToRoleId = null;

  //       if (roles[i].name === "CEO") {
  //         reportsToRoleId = adminRoleId;
  //       } else if (roles[i].name === "HR_Manager") {
  //         reportsToRoleId = ceoRoleId;
  //       } else if (roles[i].name === "HR_Lead") {
  //         reportsToRoleId = hrManagerRoleId;
  //       } else if (roles[i].name === "Recruiter") {
  //         reportsToRoleId = hrLeadRoleId;
  //       }

  //       const roleData = {
  //         label: roles[i].label,
  //         roleName: roles[i].name,
  //         description: `Default role description for ${roles[i].name}`,
  //         organizationId: organizationId,
  //       };

  //       if (reportsToRoleId) {
  //         roleData.reportsToRoleId = reportsToRoleId;
  //       }

  //       const roleResponse = await axios.post(`${process.env.REACT_APP_API_URL}/rolesdata`, roleData);

  //       if (roles[i].name === "Admin") {
  //         adminRoleId = roleResponse.data._id;
  //       } else if (roles[i].name === "CEO") {
  //         ceoRoleId = roleResponse.data._id;
  //       } else if (roles[i].name === "HR_Manager") {
  //         hrManagerRoleId = roleResponse.data._id;
  //       } else if (roles[i].name === "HR_Lead") {
  //         hrLeadRoleId = roleResponse.data._id;
  //       }
  //     }

  //     await axios.put(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
  //       RoleId: adminRoleId,
  //       ProfileId: adminProfileId
  //     });

  //     navigate('/subscription-plans');
  //   } catch (error) {
  //     console.error('Error saving organization:', error.response?.data || error.message);
  //     setErrorMessage(`An error occurred while saving the organization: ${error.response?.data?.message || error.message || 'Unknown error'}`);
  //   }
  // };

  const organizationData = {
    firstName: selectedFirstName,
    lastName: selectedLastName,
    Email: selectedEmail,
    Phone: selectedPhone,
    username: selectedUsername,
    jobTitle: selectedJobTitle,
    company: selectedCompany,
    employees: selectedEmployees,
    country: selectedCountry,
    password: selectedPassword,
    contactType: 'Organization'
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Password validation regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(selectedPassword)) {
      setErrorMessage("Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.");
      return;
    }

    if (selectedPassword !== selectedConfirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }
 // Clear error if validation passes
 setErrorMessage("");
    try {
      // const response = await fetch(`${process.env.REACT_APP_API_URL}/Organization/Signup`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(organizationData),
      // });
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/Organization/Signup`, organizationData);



      const data = response.data;

      // Save User and Organization IDs in Cookies
      Cookies.set('userId', data.user._id, { expires: 7 });
      Cookies.set('organizationId', data.organization._id, { expires: 7 });
      if (response.ok) toast.success("Organization created successfully!");
      navigate('/subscription-plans');
    } catch (error) {
      console.error('Error:', error);
    setErrorMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-1">
        <div>
          <Slideshow />
        </div>
        <div className="flex flex-col text-sm items-center justify-center space-y-4 sm:mt-5 sm:mb-5 sm:px-[7%] px-[20%] md:px-[10%]"> 
          <div className="max-h-[532px] overflow-y-scroll">
            <style>
              {`
          ::-webkit-scrollbar {
            display: none; // Hide scrollbar for Chrome, Safari, and Edge
          }
        `}
            </style>
            <p className="text-xl font-medium mb-4 mt-3 text-center">Sign Up</p>
            {errorMessage && <p className="text-red-500 text-center text-xs mb-2">{errorMessage}</p>}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5">
                <div className="relative">
                  <input
                    type="text"
                    id="first_name"
                    className="block rounded px-8 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                    placeholder=" "
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
                    className="block rounded px-8 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
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
                  className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  placeholder=" "
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
                  className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
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
                  className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
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
                  className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
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
                    className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
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
                    className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
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
                  className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  placeholder=" "
                  autoComplete="off"
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
              {/* Create Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="create_password"
                  className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  placeholder=" "
                  autoComplete="new-password"
                  value={selectedPassword}
                  onChange={(e) => setSelectedPassword(e.target.value)}
                />
                <label
                  htmlFor="create_password"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  Create Password
                </label>
                {/* Eye Icon */}
                <button
                  type="button"
                  className="absolute inset-y-0 end-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="relative mt-4">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  placeholder=" "
                  value={selectedConfirmPassword}
                  onChange={(e) => setSelectedConfirmPassword(e.target.value)}
                   autoComplete="current-password"
                />
                <label
                  htmlFor="confirm_password"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  Confirm Password
                </label>
                {/* Eye Icon */}
                <button
                  type="button"
                  className="absolute inset-y-0 end-3 flex items-center text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-center">
                <div className="text-sm mb-4">
                  If already registered | <span className="cursor-pointer text-custom-blue underline" onClick={() => navigate('/organizationLogin')}>Login</span>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-20 py-2 bg-custom-blue text-white rounded-3xl mb-3"
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
