import React, { useState, useEffect, useRef } from "react";
import { TbCameraPlus } from "react-icons/tb";
import { MdUpdate, MdArrowDropDown } from "react-icons/md";
import { ImCancelCircle } from "react-icons/im";
import ImageUploading from "react-images-uploading";
import "react-phone-input-2/lib/style.css";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import bcrypt from 'bcryptjs';
import Interviewers from "../../Tabs/Team-Tab/CreateTeams.jsx";

import TimezoneSelect from 'react-timezone-select';
import Cookies from 'js-cookie';
import { IoArrowBack } from "react-icons/io5";
import { validateUserForm } from "../../../../utils/AppUserValidation";

const UserForm = ({ isOpen, onClose, onDataAdded }) => {
  const organizationId = Cookies.get("organizationId");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState();
  const fileInputRef = useRef(null);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [errors, setErrors] = useState({});

  const [userData, setUserData] = useState({
    FirstName: "",
    LastName: "",
    Gender: "",
    UserName: "",
    Password: "",
    Email: "",
    Phone: "",
    LinkedinURL: "",
    TimeZone: "",
    Language: "",
    ProfileId: '',
    RoleId: '',
    OrganizationId: organizationId,
    ImageData: '',
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setIsImageUploaded(true);

    }
  };

  const handleReplace = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteImage = () => {
    setFile(null);
    setFilePreview(null);
  };

  const [selectedGender, setSelectedGender] = useState("");
  const [showDropdowngender, setShowDropdownGender] = useState(false);
  const genders = ["Male", "Female", "Others"];

  const toggleDropdowngender = () => {
    setShowDropdownGender(!showDropdowngender);
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setUserData((prevUserData) => ({
      ...prevUserData,
      Gender: gender,
    }));
    setShowDropdownGender(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      Gender: "",
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = "";

    if (name === "Email") {
      if (!value) {
        errorMessage = "Email is required";
      } else if (!validateEmail(value)) {
        errorMessage = "Invalid email address";
      }
    } else if (name === "Phone") {
      if (!value) {
        errorMessage = "Phone number is required";
      } else if (!validatePhone(value)) {
        errorMessage = "Invalid phone number";
      }
    }

    setUserData({ ...userData, [name]: value });
    setErrors({ ...errors, [name]: errorMessage });
  };

  const handlePhoneInput = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      handleChange(e);
    }
  };

  const handleCountryCodeChange = (e) => {
    setUserData({ ...userData, CountryCode: e.target.value });
  };

  const [selectedLanguage, setSelectedLanguage] = useState("");

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  // role
  const [selectedCurrentRole, setSelectedCurrentRole] = useState("");
  const [selectedCurrentRoleId, setSelectedCurrentRoleId] = useState("");
  const [showDropdownCurrentRole, setShowDropdownCurrentRole] = useState(false);
  const [CurrentRole, setCurrentRole] = useState([]);
  const [searchTermCurrentRole, setSearchTermCurrentRole] = useState("");
  const filteredCurrentRoles = CurrentRole.filter((role) =>
    role.roleName ? role.roleName.toLowerCase().includes(searchTermCurrentRole.toLowerCase()) : false
  );
  const toggleCurrentRole = () => {
    setShowDropdownCurrentRole(!showDropdownCurrentRole);
  };

  useEffect(() => {
    const fetchsetcurrentrolesData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/rolesdata?organizationId=${organizationId}`);
        setCurrentRole(response.data);
      } catch (error) {
        console.error("Error fetching roles data:", error);
      }
    };
    fetchsetcurrentrolesData();
  }, [organizationId]);

  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  const [showDropdownProfile, setShowDropdownProfile] = useState(false);
  const [Profiles, setProfiles] = useState([]);
  const [searchTermProfile, setSearchTermProfile] = useState("");
  const filteredProfiles = Profiles.filter((profile) =>
    profile.Name ? profile.Name.toLowerCase().includes(searchTermProfile.toLowerCase()) : false
  );
  const toggleProfile = () => {
    setShowDropdownProfile(!showDropdownProfile);
  };

  useEffect(() => {
    const fetchProfilesData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/organization/${organizationId}`);
        setProfiles(response.data);
      } catch (error) {
        console.error("Error fetching profiles data:", error);
      }
    };
    fetchProfilesData();
  }, [organizationId]);

  const [selectedTimezone, setSelectedTimezone] = useState({});
  const [timeZoneError, setTimeZoneError] = useState('');
  // const handleTimezoneChange = (timezone) => {
  //   setSelectedTimezone(timezone);
  //   setUserData((prevState) => ({
  //     ...prevState,
  //     TimeZone: timezone.value,
  //   }));
  //   setTimeZoneError('');
  // };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile.Name);
    setSelectedProfileId(profile._id);
    setUserData((prevUserData) => ({
      ...prevUserData,
      ProfileId: profile._id, // Update ProfileId in userData
    }));
    setShowDropdownProfile(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      ProfileId: "", // Clear the error for Profile
    }));
  };

  const handleSubmit = async (e, actionType, isAddedTeam = "user") => {
    e.preventDefault();

    // Perform validation
    const newErrors = validateUserForm(userData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If actionType is "addToInterviewers", open the popup and stop further execution
    if (actionType === "addToInterviewers") {
      setMainUserPopUp(false);
      setAddToInterviewersPopup(true);
      return;
    }

    const hashedPassword = await bcrypt.hash(userData.Password, 10);

    const dataToSend = {
      Name: userData.LastName,
      Firstname: userData.FirstName || "",
      CountryCode: userData.CountryCode || "+1",
      UserName: userData.UserName || "",
      Email: userData.Email || "",
      Phone: userData.Phone || "",
      LinkedinUrl: userData.LinkedinURL || "",
      TimeZone: selectedTimezone?.value || "",
      Language: selectedLanguage || "",
      Gender: selectedGender || "",
      organizationId: userData.OrganizationId || "",
      RoleId: selectedCurrentRoleId,
      ProfileId: selectedProfileId,
      password: hashedPassword,
      isAddedTeam,
    };

    try {
      const userResponse = await axios.post(`${process.env.REACT_APP_API_URL}/users`, dataToSend);

      const savedUserId = userResponse.data._id;
      if (!savedUserId) {
        throw new Error("User ID not returned from user creation!");
      }

      const contactData = {
        name: userData.LastName,
        firstname: userData.FirstName || "",
        countryCode: userData.CountryCode || "+1",
        UserName: userData.UserName || "",
        email: userData.Email || "",
        phone: userData.Phone || "",
        linkedinUrl: userData.LinkedinURL || "",
        gender: selectedGender || "",
        timeZone: selectedTimezone?.value || "",
        language: selectedLanguage || "",
        organizationId: userData.OrganizationId || "",
        roleId: selectedCurrentRoleId,
        profileId: selectedProfileId,
        password: hashedPassword,
        user: savedUserId,
        imageData: userData.ImageData || "",
        isAddedTeam,
      };

      const contactResponse = await axios.post(`${process.env.REACT_APP_API_URL}/contacts`, contactData);

      onClose();
    } catch (error) {
      console.error("Error creating user or contact:", error.response ? error.response.data : error.message);
    }
  };

  const [showDropdownTimezone, setShowDropdownTimezone] = useState(false);

  const toggleDropdownTimezone = () => {
    setShowDropdownTimezone(!showDropdownTimezone);
    setSearchTermTimezone('');
  };

  const timezones = {
    "Asia/Kolkata": "India Standard Time",
    "Asia/Dubai": "Gulf Standard Time",
    "Europe/Moscow": "Moscow Standard Time",
    "America/New_York": "Eastern Time (US & Canada)",
    "America/Chicago": "Central Time (US & Canada)",
    "America/Los_Angeles": "Pacific Time (US & Canada)",
    "Europe/London": "Greenwich Mean Time",
    "Europe/Paris": "Central European Time",
  };

  const [searchTermTimezone, setSearchTermTimezone] = useState("");

  const dropdownRef = useRef(null);

  const handleTimezoneChange = (timezone) => {
    setSelectedTimezone(timezone);
    setUserData((prevUserData) => ({
      ...prevUserData,
      TimeZone: timezone.value,
    }));
    setShowDropdownTimezone(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      TimeZone: "",
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdownTimezone(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [showDropdownRole, setShowDropdownRole] = useState(false);
  const [searchTermRole, setSearchTermRole] = useState("");

  const toggleDropdownRole = () => {
    setShowDropdownRole(!showDropdownRole);
  };

  const handleRoleSelect = (role) => {
    setSelectedCurrentRole(role.roleName);
    setSelectedCurrentRoleId(role._id);
    setUserData((prevUserData) => ({
      ...prevUserData,
      RoleId: role._id, // Update RoleId in userData
    }));
    setShowDropdownRole(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      RoleId: "", // Clear the error for Role
    }));
  };

  const [showDropdownLanguage, setShowDropdownLanguage] = useState(false);
  const [searchTermLanguage, setSearchTermLanguage] = useState("");

  const toggleDropdownLanguage = () => {
    setShowDropdownLanguage(!showDropdownLanguage);
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setUserData((prevUserData) => ({
      ...prevUserData,
      Language: language,
    }));
    setShowDropdownLanguage(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      Language: "",
    }));
  };

  // const handleContinue = (e) => {
  //   e.preventDefault();
  //   setShowImagePopup(false);
  //   handleSubmit(e, false);
  // };

  const handleClose = () => {
    const isFormEmpty = !userData.FirstName && !userData.LastName && !userData.Email && !userData.Phone && !userData.UserName && !userData.Password && !userData.LinkedinURL && !userData.TimeZone && !userData.Language && !userData.Gender && !selectedProfile && !selectedCurrentRole;

    if (!isFormEmpty) {
      setShowConfirmationPopup(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmationPopup(false);
  };

  const [mainUserPopUp, setMainUserPopUp] = useState(true);
  const [addToInterviewers, setAddToInterviewersPopup] = useState(false);

  const onCloseAddToInterviewers = () => {
    setAddToInterviewersPopup(false);
    setMainUserPopUp(true);
  };

  return (
    <>
      {mainUserPopUp &&
        <div>
          {/* Header */}
          <div className="fixed top-0 w-full bg-white border-b">
            <div className="flex justify-between sm:justify-start items-center p-4">
              <button onClick={handleClose} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
                <IoArrowBack className="text-2xl" />
              </button>
              <h2 className="text-xl font-bold">New User</h2>
              <button onClick={handleClose} className="focus:outline-none sm:hidden">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Content */}
          <div className="fixed top-16 bottom-16 right-0 left-0 overflow-auto p-5 text-sm">
            <form>
              <div className="grid grid-cols-4">

                <div className="sm:col-span-4 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3 sm:mt-44">
                  {/* First Name */}
                  <div className="flex gap-5 mb-5">
                    <div>
                      <label
                        htmlFor="FirstName"
                        className="block text-sm font-medium leading-6 text-gray-900 w-36"
                      >
                        First Name
                      </label>
                    </div>
                    <div className="flex-grow">
                      <input
                        type="text"
                        name="FirstName"
                        id="FirstName"
                        value={userData.FirstName}
                        onChange={handleChange}
                        autoComplete="off"
                        className={`border-b focus:outline-none mb-5 w-full ${errors.FirstName ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                      />
                      {errors.FirstName && <p className="text-red-500 text-sm -mt-4">{errors.FirstName}</p>}
                    </div>
                  </div>
                  {/* Last Name */}
                  <div className="flex gap-5 mb-5">
                    <div>
                      <label
                        htmlFor="LastName"
                        className="block text-sm font-medium leading-6 text-gray-900 w-36"
                      >
                        Last Name <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="flex-grow">
                      <input
                        type="text"
                        name="LastName"
                        id="LastName"
                        value={userData.LastName}
                        onChange={handleChange}
                        autoComplete="family-name"
                        className={`border-b focus:outline-none mb-5 w-full ${errors.LastName ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                      />
                      {errors.LastName && <p className="text-red-500 text-sm -mt-4">{errors.LastName}</p>}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex gap-5 mb-5">
                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium leading-6 text-gray-900  w-36"
                      >
                        Gender <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="relative flex-grow">
                      <div className="relative">
                        <input
                          type="text"
                          className={`border-b focus:outline-none mb-5 w-full ${errors.Gender ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                          id="gender"
                          onClick={toggleDropdowngender}
                          value={selectedGender}
                          readOnly
                        />

                        <div
                          className="absolute right-0 top-0"
                          onClick={toggleDropdowngender}
                        >
                          <MdArrowDropDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
                        </div>
                      </div>
                      {showDropdowngender && (
                        <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                          {genders.map((gender) => (
                            <div
                              key={gender}
                              className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleGenderSelect(gender)}
                            >
                              {gender}
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.Gender && <p className="text-red-500 text-sm -mt-4">{errors.Gender}</p>}
                    </div>
                  </div>

                  {/* User ID */}
                  <div className="flex gap-5 mb-5">
                    <div>
                      <label
                        htmlFor="UserName"
                        className="block text-sm font-medium leading-6 text-gray-900 w-36"
                      >
                        User ID <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="flex-grow">
                      <input
                        type="text"
                        name="UserName"
                        id="UserName"
                        value={userData.UserName}
                        onChange={handleChange}
                        autoComplete="off"
                        className={`border-b focus:outline-none mb-5 w-full ${errors.UserName ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                      />
                      {errors.UserName && <p className="text-red-500 text-sm -mt-4">{errors.UserName}</p>}
                    </div>
                  </div>


                  {/* email */}
                  <div className="flex gap-5 mb-5">
                    <div>
                      <label
                        htmlFor="Email"
                        className="block text-sm font-medium leading-6 text-gray-900 w-36"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="flex-grow">
                      <input
                        type="text"
                        name="Email"
                        id="email"
                        value={userData.Email}
                        onChange={handleChange}
                        placeholder="example@gmail.com"
                        autoComplete="email"
                        className={`border-b focus:outline-none mb-5 w-full ${errors.Email ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                      />
                      {errors.Email && <p className="text-red-500 text-sm -mt-4">{errors.Email}</p>}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex gap-5 mb-5">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-gray-900 w-36"
                      >
                        Password
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="relative flex-grow">
                      <div className="relative">
                        <input
                          type="text"
                          name="Password"
                          id="Password"
                          value={userData.Password}
                          onChange={handleChange}
                          autoComplete="off"
                          className={`border-b focus:outline-none mb-5 w-full ${errors.Password ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                        />
                      </div>
                      {errors.Password && <p className="text-red-500 text-sm -mt-4">{errors.Password}</p>}
                    </div>
                  </div>

                  {/* phone */}
                  <div className="flex gap-5 mb-5">
                    <div>
                      <label
                        htmlFor="Phone"
                        className="block text-sm font-medium leading-6 text-gray-900 w-36"
                      >
                        Phone <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="flex-grow">
                      <div className="flex">
                        <select
                          name="CountryCode"
                          id="CountryCode"
                          value={userData.CountryCode}
                          onChange={handleCountryCodeChange}
                          className="border-b focus:outline-none mb-5 w-1/4 mr-2"
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+61">+61</option>
                          <option value="+971">+971</option>
                          <option value="+60">+60</option>
                        </select>
                        <input
                          type="text"
                          name="Phone"
                          id="Phone"
                          value={userData.Phone}
                          onChange={handlePhoneInput}
                          autoComplete="off"
                          placeholder="XXX-XXX-XXXX"
                          className={`border-b focus:outline-none mb-5 w-full ${errors.Phone ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                        />
                      </div>
                      {errors.Phone && <p className="text-red-500 text-sm -mt-4">{errors.Phone}</p>}
                    </div>
                  </div>

                  {/* Linkedin URL */}
                  <div className="flex gap-5 mb-5">
                    <div>
                      <label
                        htmlFor="linkedin"
                        className="block text-sm font-medium leading-6 text-gray-900 w-36"
                      >
                        Linkedin URL
                        <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <div className="relative flex-grow">
                      <div className="relative">
                        <input
                          type="text"
                          name="LinkedinURL"
                          id="linkedin"
                          value={userData.LinkedinURL}
                          autoComplete="off"
                          onChange={handleChange}
                          className={`border-b focus:outline-none mb-5 w-full ${errors.LinkedinURL ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                        />
                        {errors.LinkedinURL && <p className="text-red-500 text-sm -mt-4">{errors.LinkedinURL}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Profile */}
                  <div className="flex gap-5 mb-9">
                    <label htmlFor="Profile" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                      Profile <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex-grow">
                      <input
                        name="Profile"
                        type="text"
                        id="Profile"
                        value={selectedProfile}
                        onClick={toggleProfile}
                        readOnly
                        className={`border-b focus:outline-none w-full ${errors.ProfileId ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                      />
                      <div
                        className="absolute right-0 top-0 mt-1 cursor-pointer"
                        onClick={toggleProfile}
                        >
                        <MdArrowDropDown className="text-lg text-gray-500" />
                      </div>
                        {errors.ProfileId && <p className="text-red-500 text-sm mt-1">{errors.ProfileId}</p>}
                      {showDropdownProfile && (
                        <div className="absolute bg-white border border-gray-300 -mt-6 w-full max-h-60 overflow-y-auto z-10">
                          <div className="p-2 border-b border-gray-300">
                            <input
                              type="text"
                              placeholder="Search Profile"
                              value={searchTermProfile}
                              onChange={(e) => setSearchTermProfile(e.target.value)}
                              className="w-full border rounded p-1 border-gray-300 focus:outline-none"
                            />
                          </div>
                          {filteredProfiles
                            .filter((profile) =>
                              profile.Name.toLowerCase().includes(searchTermProfile.toLowerCase())
                            )
                            .map((profile) => (
                              <div
                                key={profile._id}
                                onClick={() => handleProfileSelect(profile)}
                                className="cursor-pointer hover:bg-gray-200 p-2"
                              >
                                {profile.Name}
                              </div>
                            ))}
                          {filteredProfiles.length === 0 && (
                            <div className="p-2 text-gray-500">No profiles found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Role */}
                  <div className="flex gap-5 mb-9">
                    <label htmlFor="CurrentRole" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex-grow">
                      <input
                        name="CurrentRole"
                        type="text"
                        id="CurrentRole"
                        className={`border-b focus:outline-none w-full ${errors.RoleId ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                        readOnly
                        onClick={toggleDropdownRole}
                        value={selectedCurrentRole || ""}
                      />
                      <div
                        className="absolute right-0 top-0 mt-1 cursor-pointer"
                        onClick={toggleDropdownRole}
                        >
                        <MdArrowDropDown className="text-lg text-gray-500" />
                      </div>
                        {errors.RoleId && <p className="text-red-500 text-sm mt-1">{errors.RoleId}</p>}
                      {showDropdownRole && (
                        <div className="absolute bg-white border -mt-6 border-gray-300 w-full max-h-60 overflow-y-auto z-10">
                          <div className="p-2 border-b border-gray-300">
                            <input
                              type="text"
                              placeholder="Search Role"
                              value={searchTermRole}
                              onChange={(e) => setSearchTermRole(e.target.value)}
                              className="w-full border rounded p-1 border-gray-300 focus:outline-none"
                            />
                          </div>
                          {filteredCurrentRoles
                            .filter((role) =>
                              role.roleName.toLowerCase().includes(searchTermRole.toLowerCase())
                            )
                            .map((role) => (
                              <div
                                key={role._id}
                                onClick={() => handleRoleSelect(role)}
                                className="cursor-pointer hover:bg-gray-200 p-2"
                              >
                                {role.roleName}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timezone */}
                  <div className="flex gap-5 mb-9">
                    <div>
                      <label
                        htmlFor="TimeZone"
                        className="block text-sm font-medium leading-6 text-gray-900 w-36"
                      >
                        Time Zone <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="flex-grow w-full overflow-visible -mt-1 relative">
                      <div className="w-full overflow-visible">
                        <input
                          name="TimeZone"
                          type="text"
                          id="TimeZone"
                          className={`border-b focus:outline-none w-full ${errors.TimeZone ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                          readOnly
                          onClick={toggleDropdownTimezone}
                          value={selectedTimezone.label || ""}
                        />
                        <div
                          className="absolute right-0 top-0 mt-1 cursor-pointer"
                          onClick={toggleDropdownTimezone}
                          >
                          <MdArrowDropDown className="text-lg text-gray-500" />
                        </div>
                          {errors.TimeZone && <p className="text-red-500 text-sm mt-1">{errors.TimeZone}</p>}
                        {showDropdownTimezone && (
                          <div className="absolute bg-white border -mt-6 border-gray-300 w-full max-h-60 overflow-y-auto z-10">
                            <div className="p-2 border-b border-gray-300">
                              <input
                                type="text"
                                placeholder="Search Timezone"
                                value={searchTermTimezone}
                                onChange={(e) => setSearchTermTimezone(e.target.value)}
                                className="w-full border rounded p-1 border-gray-300 focus:outline-none"
                              />
                            </div>
                            {Object.entries(timezones)
                              .filter(([key, value]) =>
                                value.toLowerCase().includes(searchTermTimezone.toLowerCase())
                              )
                              .map(([key, value]) => (
                                <div
                                  key={key}
                                  onClick={() => handleTimezoneChange({ value: key, label: value })}
                                  className="cursor-pointer hover:bg-gray-200 p-2"
                                >
                                  {value}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="flex flex-col gap-5 mb-5">
                    <div className="flex gap-5">
                      <div>
                        <label
                          htmlFor="language"
                          className="block text-sm font-medium leading-6 text-gray-900 w-36"
                        >
                          Language
                          <span className="text-red-500">*</span>
                        </label>
                      </div>

                      <div className="relative flex-grow">
                        <div className="relative">
                          <input
                            type="text"
                            id="language"
                            className={`border-b focus:outline-none w-full ${errors.Language ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                            readOnly
                            onClick={toggleDropdownLanguage}
                            value={selectedLanguage || ""}
                          />
                          <div
                            className="absolute right-0 top-0 mt-1 cursor-pointer"
                            onClick={toggleDropdownLanguage}
                            >
                            <MdArrowDropDown className="text-lg text-gray-500" />
                          </div>
                            {errors.Language && <p className="text-red-500 text-sm mt-1">{errors.Language}</p>}
                          {showDropdownLanguage && (
                            <div className="absolute bg-white -mt-6 border border-gray-300 w-full max-h-60 overflow-y-auto z-10">
                              <div className="p-2 border-b border-gray-300">
                                <input
                                  type="text"
                                  placeholder="Search Language"
                                  value={searchTermLanguage}
                                  onChange={(e) => setSearchTermLanguage(e.target.value)}
                                  className="w-full border rounded p-1 border-gray-300 focus:outline-none"
                                />
                              </div>
                              {["English", "Spanish", "French"]
                                .filter((language) =>
                                  language.toLowerCase().includes(searchTermLanguage.toLowerCase())
                                )
                                .map((language) => (
                                  <div
                                    key={language}
                                    onClick={() => handleLanguageSelect(language)}
                                    className="cursor-pointer hover:bg-gray-200 p-2"
                                  >
                                    {language}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Right content */}
                <div className="sm:col-span-4 sm:flex sm:justify-center md:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1 sm:-mt-[55rem]">
                  <div className="ml-5">
                    <div className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center relative">
                      <input
                        type="file"
                        id="imageInput"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                      {filePreview ? (
                        <>
                          <img src={filePreview} alt="Selected" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0">
                            <button
                              type="button"
                              onClick={handleReplace}
                              className="text-white"
                            >
                              <MdUpdate className="text-xl ml-2 mb-1" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 right-0">
                            <button
                              type="button"
                              onClick={handleDeleteImage}
                              className="text-white"
                            >
                              <ImCancelCircle className="text-xl mr-2 mb-1" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          className="flex flex-col items-center justify-center"
                          onClick={() => fileInputRef.current.click()}
                          type="button"
                        >
                          <span style={{ fontSize: "40px" }}>
                            <TbCameraPlus />
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {showImagePopup && (
                <div className="fixed inset-0 flex z-50 items-center justify-center bg-gray-200 bg-opacity-50">
                  <div className="bg-white p-5 rounded shadow-lg">
                    <p>Upload the image for identification, if not then you can continue to the next page.</p>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowImagePopup(false)}
                        className="bg-gray-300 text-black px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="footer-button bg-custom-blue"
                      // onClick={handleContinue}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="footer-buttons flex justify-end">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "save", "user")}
                  className="footer-button bg-custom-blue"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "addToInterviewers")}
                  className="footer-button bg-custom-blue ml-3"
                >
                  Save & Add to Interviewers
                </button>
              </div>
            </form>
          </div>



        </div>
      }

      {/* Confirmation Popup */}
      {showConfirmationPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded shadow-lg">
            <p>Do you want to save the changes before closing?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={handleConfirmClose} className="bg-red-500 text-white px-4 py-2 rounded">
                Don't Save
              </button>
              <button type="button" onClick={handleCancelClose} className="bg-gray-300 text-black px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {addToInterviewers && (
        <Interviewers
          onClose={onCloseAddToInterviewers}
          onClose1={onClose}
          defaultData={userData}
          parentHandleSubmit={(e, isAddedTeam) => handleSubmit(e, "save", isAddedTeam)}
          source="userForm"
        />
      )}


    </>
  );
};

export default UserForm;