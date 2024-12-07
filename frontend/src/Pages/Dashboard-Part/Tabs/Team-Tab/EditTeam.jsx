import React, { forwardRef, useEffect, useRef, useState } from "react";
import "react-phone-input-2/lib/style.css";
import TimezoneSelect from 'react-timezone-select';
// import ImageUploading from "react-images-uploading";
import axios from "axios";
import { useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { fetchMasterData } from '../../../../utils/fetchMasterData.js';


import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { ReactComponent as FaPlus } from '../../../../icons/FaPlus.svg';
import { ReactComponent as FaMinus } from '../../../../icons/FaMinus.svg';
import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { ReactComponent as TbCameraPlus } from '../../../../icons/TbCameraPlus.svg';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as MdUpdate } from '../../../../icons/MdUpdate.svg';
import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as IoIosCopy } from '../../../../icons/IoIosCopy.svg';

const CreateTeams = ({ onClose, candidate1 }) => {
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showUnsavedChangesPopup, setShowUnsavedChangesPopup] = useState(false);
  // const userId = localStorage.getItem("userId");
  const location = useLocation();
  const candidateData = location.state?.teams || candidate1;
  const [teams] = useState(candidateData);
  const [updatedCandidate, setUpdatedCandidate] = useState(teams);

  const [selectedCompany, setSelectedCompany] = useState(
    candidate1.CompanyName || ""
  );
  const [selectedTechnology, setSelectedTechnology] = useState(
    candidate1.Technology || ""
  );
  const [selectedCurrentRole, setSelectedCurrentRole] = useState(
    candidate1.CurrentRole || ""
  );

  const [timeZoneError, setTimeZoneError] = useState("");
  const [preferredDurationError, setPreferredDurationError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [currentPage, setCurrentPage] = useState("form");
  const [formData, setFormData] = useState({
    FirstName: updatedCandidate.FirstName || "",
    LastName: updatedCandidate.LastName || "",
    Email: updatedCandidate.Email || "",
    Phone: updatedCandidate.Phone || "",
    CompanyName: updatedCandidate.CompanyName || "",
    Technology: updatedCandidate.Technology || "",
    Location: updatedCandidate.Location || "",
    CurrentRole: updatedCandidate.CurrentRole || "",
    skills: [],
    TimeZone: updatedCandidate.TimeZone || "",
  });
  const [errors, setErrors] = useState({});

  // const validateEmail = (email) => {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(email);
  // };

  // const validatePhone = (phone) => {
  //   const phoneRegex = /^[6-9]\d{9}$/;
  //   return phoneRegex.test(phone);
  // };

  const handlePhoneInput = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      handleChange(e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = "";

    if (name === 'TimeZone') {
      setTimeZoneError('');
    }

    // Update the candidate data
    setUpdatedCandidate((prevState) => ({ ...prevState, [name]: value }));
    setFormData({ ...formData, [name]: value });

    // Check for errors only if the field is empty
    if (!value) {
      if (name === "FirstName") {
        errorMessage = "First Name is required";
      } else if (name === "Email") {
        errorMessage = "Email is required";
      } else if (name === "Phone") {
        errorMessage = "Phone number is required";
      }
    } else {
      // Clear the error if the field has data
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }

    // Set the error message if any
    if (errorMessage) {
      setErrors({ ...errors, [name]: errorMessage });
    }

    setUnsavedChanges(true);
  };

  const handleCancel = () => {
    if (unsavedChanges) {
      setShowUnsavedChangesPopup(true);
    } else {
      onClose();
    }
  };

  const handleLeaveWithoutSaving = () => {
    setShowUnsavedChangesPopup(false);
    setUnsavedChanges(false);
    onClose();
  };

  const handleContinueEditing = () => {
    setShowUnsavedChangesPopup(false); // Just close the popup
  };

  const handleNext = (e) => {
    e.preventDefault();

    const requiredFields = {
      LastName: "Last Name is required",
      Email: "Email is required",
      Phone: "Phone Number is required",
    };

    let formIsValid = true;
    const newErrors = { ...errors };

    // Check if at least one skill is added
    if (entries.length === 0) {
      newErrors.skills = "At least one skill is required";
      formIsValid = false;
    }

    // Validate required fields
    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field]) {
        newErrors[field] = message;
        formIsValid = false;
      }
    });

    // Set errors if the form is not valid
    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }

    setCurrentPage("availability");
  };

  const handleBack = () => {
    setCurrentPage("form");
  };

  // Initialize error states
  // const newErrors = {
  //   timeZone: "",
  //   preferredDuration: "",
  //   availability: "",
  // };

  // image code
  const [file, setFile] = useState(null);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [filePreview, setFilePreview] = useState(updatedCandidate.imageUrl);
  const fileInputRef = useRef(null);
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
    setIsImageUploaded(false); // Mark image as not uploaded
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setShowImagePopup(false);
    handleSubmit(e, false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validations code
    const newErrors = {};

    const hasTimeSlots = Object.values(times).some((daySlots) =>
      daySlots.some((slot) => slot.startTime && slot.endTime)
    );

    if (!hasTimeSlots) {
      newErrors.availability = "At least one time slot must be selected.";
    }

    if (!formData.TimeZone) {
      newErrors.timeZone = "Time Zone is required.";
    }

    if (!selectedOption) {
      newErrors.preferredDuration =
        "Preferred Interview Duration is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setAvailabilityError(newErrors.availability);
      setTimeZoneError(newErrors.timeZone);
      setPreferredDurationError(newErrors.preferredDuration);
      return;
    } else {
      setAvailabilityError("");
      setTimeZoneError("");
      setPreferredDurationError("");
    }
    // validations end

    const teamData = {
      _id: candidate1._id, // Include the ID for the update
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      Email: formData.Email,
      Phone: formData.Phone,
      CompanyName: formData.CompanyName,
      CurrentRole: formData.CurrentRole,
      Technology: formData.Technology,
      Location: formData.Location,
      skills: entries.map((entry) => ({
        skill: entry.skill,
        experience: entry.experience,
        expertise: entry.expertise,
      })),
      PreferredDuration: selectedOption,
      TimeZone: formData.TimeZone,
    };

    const availabilityArray = [];
    Object.entries(times).forEach(([day, slots]) => {
      slots.forEach((slot) => {
        if (slot.startTime && slot.endTime) {
          availabilityArray.push({
            day,
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        }
      });
    });

    const availabilityData = {
      TeamId: teamData._id,
      Availability: availabilityArray,
    };

    try {
      const teamResponse = await axios.put(
        `${process.env.REACT_APP_API_URL}/team/${teamData._id}`,
        teamData
      );
      console.log("Team created:", teamResponse.data);

      const availabilityResponse = await axios.put(
        `${process.env.REACT_APP_API_URL}/teamavailability`,
        availabilityData
      );
      console.log("Availability created:", availabilityResponse.data);

      // Handle image upload
      if (file) {
        const imageData = new FormData();
        imageData.append("image", file);
        imageData.append("type", "team");
        imageData.append("id", teamResponse.data._id);

        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/upload`, imageData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } catch (error) {
          console.error("Error uploading image:", error);
          return;
        }
      } else if (!isImageUploaded && !filePreview) {
        // If no image is uploaded and no preview is available, remove the image from the backend
        try {
          await axios.delete(
            `${process.env.REACT_APP_API_URL}/team/${teamResponse.data._id}/image`
          );
        } catch (error) {
          console.error("Error deleting image:", error);
          return;
        }
      }

      onClose();
    } catch (error) {
      console.error("Error creating team or availability:", error);
    }
  };

  // State for current role
  const [searchTermCurrentRole, setSearchTermCurrentRole] = useState("");
  const [showDropdownCurrentRole, setShowDropdownCurrentRole] =
    useState(false);

  // Hardcoded array of roles
  const currentRoles = [
    { _id: 1, RoleName: "Developer" },
    { _id: 2, RoleName: "Designer" },
    { _id: 3, RoleName: "Project Manager" },
    { _id: 4, RoleName: "Tester" },
    { _id: 5, RoleName: "DevOps Engineer" },
  ];

  // Filter current roles based on search term
  const filteredCurrentRoles = currentRoles.filter(
    (role) =>
      role.RoleName &&
      role.RoleName.toLowerCase().includes(
        searchTermCurrentRole.toLowerCase()
      )
  );

  // Handle current role selection
  const handleRoleSelect = (role) => {
    setSelectedCurrentRole(role.RoleName);
    setFormData((prevState) => ({
      ...prevState,
      CurrentRole: role.RoleName,
    }));
    setShowDropdownCurrentRole(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      CurrentRole: "",
    }));
    setUnsavedChanges(true);
  };

  // Toggle dropdown visibility
  const toggleDropdownCurrentRole = () => {
    setShowDropdownCurrentRole(!showDropdownCurrentRole);
  };

  // location purpose

  const [selectedLocation, setSelectedLocation] = useState(
    candidate1.Location || ""
  );
  const [searchTermLocation, setSearchTermLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [showDropdownLocation, setShowDropdownLocation] = useState(false);

  // Fetch locations data
  useEffect(() => {
    const fetchLocationsData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations`);
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations data:", error);
      }
    };
    fetchLocationsData();
  }, []);

  // Filter locations based on search term
  const filteredLocations = locations.filter(
    (location) =>
      location.LocationName &&
      location.LocationName.toLowerCase().includes(
        searchTermLocation.toLowerCase()
      )
  );

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location.LocationName);
    setFormData((prevState) => ({
      ...prevState,
      Location: location.LocationName,
    }));
    setShowDropdownLocation(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      Location: "",
    }));

    setUpdatedCandidate((prevFormData) => ({
      ...prevFormData,
      location: location.LocationName,
    }));
    setUnsavedChanges(true);
  };

  // Toggle dropdown visibility
  const toggleDropdownLocation = () => {
    setShowDropdownLocation(!showDropdownLocation);
  };

  // technology purpose
  const technologies = [
    "Artificial Intelligence (AI)",
    "Machine Learning (ML)",
    "Data Science",
    "Big Data Analytics",
    "Cloud Computing",
    "Blockchain",
    "Cybersecurity",
    "Internet of Things (IoT)",
    "Augmented Reality (AR)",
    "Virtual Reality (VR)",
    "DevOps",
    "Full Stack Development",
    "Mobile App Development",
    "Robotic Process Automation (RPA)",
    "Digital Marketing",
    "UI/UX Design",
    "Software Testing",
    "Edge Computing",
    "5G Technology",
    "Quantum Computing",
  ];

  const handleTechnologySelect = (technology) => {
    setSelectedTechnology(technology);
    setFormData((prevFormData) => ({
      ...prevFormData,
      Technology: technology,
    }));
    setShowDropdownTechnology(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      Technology: "",
    }));
    setUnsavedChanges(true);
  };

  const [showDropdownCompany, setShowDropdownCompany] = useState(false);

  const toggleDropdownCompany = () => {
    setShowDropdownCompany(!showDropdownCompany);
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company.CompanyName);
    setFormData((prevFormData) => ({
      ...prevFormData,
      CompanyName: company.CompanyName,
    }));
    setShowDropdownCompany(false);

    setUpdatedCandidate((prevFormData) => ({
      ...prevFormData,
      company: company.CompanyName,
    }));
    setUnsavedChanges(true);
  };

  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    const fetchCompaniesData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/company`);
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching Companies data:", error);
      }
    };
    fetchCompaniesData();
  }, []);

  const [showDropdownTechnology, setShowDropdownTechnology] = useState(false);

  const toggleDropdownTechnology = () => {
    setShowDropdownTechnology(!showDropdownTechnology);
  };

  // const [technology, setTechnology] = useState([]);
  useEffect(() => {
    const fetchtechnologyData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/technology`);
        // setTechnology(response.data);
      } catch (error) {
        console.error("Error fetching technology data:", error);
      }
    };
    fetchtechnologyData();
  }, []);

  // const [teamData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // const resetSkillForm = () => {
  //   setSelectedSkill("");
  //   setSelectedExp("");
  //   setSelectedLevel("");
  //   setCurrentStep(0);
  //   setIsModalOpen(false);
  // };

  const [skills, setSkills] = useState([]);
  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/skills`);
        setSkills(response.data);
      } catch (error) {
        console.error("Error fetching SkillsData:", error);
      }
    };
    fetchSkillsData();
  }, []);

  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    setSearchTerm("");
  };

  const filteredSkills = skills.filter((skill) =>
    skill.SkillName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // availability team member
  // const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOption, setSelectedOption] = useState(
    candidate1.PreferredDuration || null
  );
  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setPreferredDurationError(""); // Clear the error when a valid option is selected
  };
  // const navigate = useNavigate();
  // const navigatepage = () => {
  //   navigate("/team");
  //   onClose();
  // };

  const [times, setTimes] = useState({
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });
  // working
  // useEffect(() => {
  //   if (candidate1) {
  //     // Set times based on availability data
  //     const updatedTimes = { ...times };
  //     if (Array.isArray(candidate1.availability)) {
  //       candidate1.availability.forEach(slot => {
  //         updatedTimes[slot.day] = [{ startTime: new Date(slot.startTime), endTime: new Date(slot.endTime) }];
  //       });
  //     }
  //     setTimes(updatedTimes);
  //   }
  // }, [candidate1]);
  useEffect(() => {
    if (candidate1) {
      // Set times based on availability data
      const updatedTimes = { ...times };
      if (Array.isArray(candidate1.availability)) {
        candidate1.availability.forEach((slot) => {
          if (!updatedTimes[slot.day]) {
            updatedTimes[slot.day] = [];
          }
          updatedTimes[slot.day].push({
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime),
          });
        });
      }
      setTimes(updatedTimes);
    }
  }, [candidate1, times]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  // const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  const handleCopy = (event, day) => {
    setSelectedDay(day);
    setSelectedDays([day]);
    // const buttonRect = event.target.getBoundingClientRect();
    // setPopupPosition({
    //   top: buttonRect.bottom + window.scrollY,
    //   left: buttonRect.left + window.scrollX,
    // });
    setShowPopup(true);
  };

  const handlePaste = () => {
    const copiedTimes = times[selectedDay];
    setTimes((prevTimes) => {
      const newTimes = { ...prevTimes };
      selectedDays.forEach((day) => {
        newTimes[day] = copiedTimes.map((time) => ({ ...time }));
      });
      return newTimes;
    });
    setShowPopup(false);
    setSelectedDay(null);
    setSelectedDays([]);
  };

  const handleAddTimeSlot = (day) => {
    setTimes((prevTimes) => {
      const dayTimes = prevTimes[day];
      return {
        ...prevTimes,
        [day]: [...dayTimes, { startTime: null, endTime: null }], // Ensure both are initialized
      };
    });
  };

  const handleRemoveTimeSlot = (day, index) => {
    setTimes((prevTimes) => {
      const newTimes = { ...prevTimes };
      newTimes[day] = newTimes[day].filter((_, i) => i !== index);
      return newTimes;
    });
  };

  const skillsData = location.state?.position || candidate1;
  // for showing the skills
  // const [showConfirmation, setShowConfirmation] = useState(false);
  // const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const initialSkills = skillsData.skills || [];
  const [entries, setEntries] = useState(initialSkills);
  const [allSelectedSkills, setAllSelectedSkills] = useState(initialSkills.map(skill => skill.skill));
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const experienceOptions = [
    "0-1 Years", "1-2 years", "2-3 years", "3-4 years", "4-5 years", "5-6 years",
    "6-7 years", "7-8 years", "8-9 years", "9-10 years", "10+ years",
  ];
  const expertiseOptions = ["Basic", "Medium", "Expert"];

  const handleAddEntry = () => {
    if (editingIndex !== null) {
      const updatedEntries = entries.map((entry, index) =>
        index === editingIndex
          ? { skill: selectedSkill, experience: selectedExp, expertise: selectedLevel }
          : entry
      );
      setEntries(updatedEntries);
      setEditingIndex(null);
      setAllSelectedSkills(updatedEntries.map((entry) => entry.skill));
    } else {
      const newEntry = { skill: selectedSkill, experience: selectedExp, expertise: selectedLevel };
      setEntries([...entries, newEntry]);
      setAllSelectedSkills([...allSelectedSkills, selectedSkill]);
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      skills: "",
    }));
    resetForm();
    setUnsavedChanges(true);
  };

  const resetForm = () => {
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
    setCurrentStep(0);
    setIsModalOpen(false);
  };

  const isNextEnabled = () => {
    if (currentStep === 0) {
      return selectedSkill !== "" && (!allSelectedSkills.includes(selectedSkill) || editingIndex !== null);
    } else if (currentStep === 1) {
      return selectedExp !== "";
    } else if (currentStep === 2) {
      return selectedLevel !== "";
    }
    return false;
  };

  const handleEdit = (index) => {
    const entry = entries[index];
    setSelectedSkill(entry.skill);
    setSelectedExp(entry.experience);
    setSelectedLevel(entry.expertise);
    setEditingIndex(index);
    setCurrentStep(0);
    setIsModalOpen(true);
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    // setShowConfirmation(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const updatedEntries = entries.filter((_, i) => i !== deleteIndex);
      setEntries(updatedEntries);
      if (updatedEntries.length === 0) {
        setAllSelectedSkills([]);
      } else {
        setAllSelectedSkills(updatedEntries.map((entry) => entry.skill));
      }
      setDeleteIndex(null);
      // setShowConfirmation(false);
      // setHasUnsavedChanges(true);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
    // setShowConfirmation(false);
  };

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/skills`);
        setSkills(response.data);
      } catch (error) {
        console.error("Error fetching SkillsData:", error);
      }
    };
    fetchSkillsData();
  }, []);


  // (m

  // const [selectedTimezone, setSelectedTimezone] = useState({});

  // const handleTimezoneChange = (timezone) => {
  //   setSelectedTimezone(timezone);
  //   setTimeZoneError('');
  // };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-15 z-50" >
        <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
          {/* Header */}
          <div className="fixed top-0 w-full bg-white border-b">
            <div className="flex justify-between sm:justify-start items-center p-4">
              <button onClick={handleCancel} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
                <IoArrowBack className="text-2xl" />
              </button>
              <h2 className="text-lg font-bold">Team Member</h2>
              <button onClick={handleCancel} className="focus:outline-none sm:hidden">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {showUnsavedChangesPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-50">
              <div className="bg-white p-5 rounded shadow-lg">
                <p>Make sure to save your changes, or you will lose them.</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={handleLeaveWithoutSaving}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Leave without saving
                  </button>
                  <button
                    onClick={handleContinueEditing}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Content */}
          <div className="fixed top-16 bottom-16 overflow-auto right-0 p-5 text-sm">
            {currentPage === "form" && (
              <form onSubmit={handleNext} noValidate>
                <div className="grid grid-cols-4">
                  <div className="sm:col-span-4 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3 sm:mt-44">
                    {/* First Name */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="FirstName"
                          className="block text-sm font-medium leading-6 text-gray-900 w-32"
                        >
                          First Name
                        </label>
                      </div>
                      <div className="flex-grow">
                        <input
                          type="text"
                          name="FirstName"
                          id="FirstName"
                          value={updatedCandidate.FirstName}
                          onChange={handleChange}
                          autoComplete="off"
                          className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                        />
                      </div>
                    </div>
                    {/* Last Name */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="LastName"
                          className="block text-sm font-medium leading-6 text-gray-900 w-32"
                        >
                          Last Name <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="flex-grow">
                        <input
                          type="text"
                          name="LastName"
                          id="LastName"
                          autoComplete="off"
                          value={updatedCandidate.LastName}
                          onChange={handleChange}
                          className={`border-b focus:outline-none mb-5 w-full ${errors.LastName
                            ? "border-red-500"
                            : "border-gray-300 focus:border-black"
                            }`}
                        />
                        {errors.LastName && (
                          <span className="text-red-500 text-sm -mt-5">
                            {errors.LastName}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Email */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="Email"
                          className="block text-sm font-medium leading-6 text-gray-900 w-32"
                        >
                          Email <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="flex-grow">
                        <input
                          type="email"
                          name="Email"
                          id="Email"
                          placeholder="example@gmail.com"
                          autoComplete="off"
                          value={updatedCandidate.Email}
                          onChange={handleChange}
                          className={`border-b focus:outline-none mb-5 w-full ${errors.Email
                            ? "border-red-500"
                            : "border-gray-300 focus:border-black"
                            }`}
                        />
                        {errors.Email && (
                          <span className="text-red-500 text-sm -mt-5">
                            {errors.Email}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Phone */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="Phone"
                          className="block text-sm font-medium leading-6 text-gray-900 w-32"
                        >
                          Phone <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="flex-grow">
                        <div className="flex">
                          <select
                            name="CountryCode"
                            id="CountryCode"
                            value={updatedCandidate.CountryCode}
                            onChange={handleChange}
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
                            value={updatedCandidate.Phone}
                            onChange={handlePhoneInput}
                            autoComplete="off"
                            placeholder="XXX-XXX-XXXX"
                            className={`border-b focus:outline-none mb-5 w-full ${errors.Phone
                              ? "border-red-500"
                              : "border-gray-300 focus:border-black"
                              }`}
                          />
                        </div>
                        {errors.Phone && (
                          <p className="text-red-500 text-sm -mt-4">
                            {errors.Phone}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Company */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="Company"
                          className="block text-sm font-medium leading-6 text-gray-900 w-32"
                        >
                          Company
                        </label>
                      </div>
                      <div className="relative flex-grow">
                        <div className="relative">
                          <input
                            type="text"
                            className="border-b focus:outline-none mb-5 w-full border-gray-300 focus:border-black"
                            value={selectedCompany}
                            onClick={toggleDropdownCompany}
                            readOnly
                          />
                          <div
                            className="absolute right-0 top-0"
                            onClick={toggleDropdownCompany}
                          >
                            <MdArrowDropDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
                          </div>
                        </div>
                        {showDropdownCompany && (
                          <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
                            {companies.map((company) => (
                              <div
                                key={company._id}
                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleCompanySelect(company)}
                              >
                                {company.CompanyName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Technology */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="Technology"
                          className="block text-sm font-medium leading-6 text-gray-900 w-32"
                        >
                          Technology <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="relative flex-grow">
                        <div className="relative">
                          <input
                            type="text"
                            className={`border-b focus:outline-none mb-5 w-full ${errors.Technology
                              ? "border-red-500"
                              : "border-gray-300 focus:border-black"
                              }`}
                            value={selectedTechnology}
                            onClick={toggleDropdownTechnology}
                            readOnly
                          />
                          {errors.Technology && (
                            <p className="text-red-500 text-sm -mt-4">
                              {errors.Technology}
                            </p>
                          )}
                          <div
                            className="absolute right-0 top-0"
                            onClick={toggleDropdownTechnology}
                          >
                            <MdArrowDropDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
                          </div>
                        </div>
                        {showDropdownTechnology && (
                          <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
                            {technologies.map((technology) => (
                              <div
                                key={technology}
                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                onClick={() =>
                                  handleTechnologySelect(technology)
                                }
                              >
                                {technology}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location field */}
                    <div className="flex gap-5 mb-5 relative">
                      <label
                        htmlFor="Location"
                        className="block text-sm font-medium leading-6 text-gray-900 w-32"
                      >
                        Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex-grow">
                        <div className="relative">
                          <input
                            name="Location"
                            type="text"
                            id="Location"
                            value={selectedLocation}
                            onClick={toggleDropdownLocation}
                            onChange={(e) =>
                              setSearchTermLocation(e.target.value)
                            }
                            className={`border-b focus:outline-none mb-5 w-full ${errors.Location
                              ? "border-red-500"
                              : "border-gray-300 focus:border-black"
                              }`}
                            readOnly
                            autoComplete="off"
                          />
                          {errors.Location && (
                            <p className="text-red-500 text-sm -mt-4">
                              {errors.Location}
                            </p>
                          )}
                          <div
                            className="absolute right-0 top-0"
                            onClick={toggleDropdownLocation}
                          >
                            <MdArrowDropDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
                          </div>
                        </div>
                        {showDropdownLocation && (
                          <div className="absolute z-50 -mt-4 w-full rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
                            <div className="flex items-center border-b p-2">
                              <IoMdSearch className="absolute left-2 text-gray-500" />
                              <input
                                type="text"
                                placeholder="Search Location"
                                value={searchTermLocation}
                                onChange={(e) =>
                                  setSearchTermLocation(e.target.value)
                                }
                                className="pl-8 focus:outline-none w-full"
                              />
                            </div>
                            {filteredLocations.length > 0 ? (
                              filteredLocations.map((location) => (
                                <div
                                  key={location._id}
                                  onClick={() =>
                                    handleLocationSelect(location)
                                  }
                                  className="cursor-pointer hover:bg-gray-200 p-2"
                                >
                                  {location.LocationName}
                                </div>
                              ))
                            ) : (
                              <div className="p-2 text-gray-500">
                                No locations found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Current Role field */}
                    <div className="flex gap-5 mb-5 relative">
                      <label
                        htmlFor="CurrentRole"
                        className="block text-sm font-medium leading-6 text-gray-900 w-32"
                      >
                        Current Role <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex-grow">
                        <div className="relative">
                          <input
                            name="CurrentRole"
                            type="text"
                            id="CurrentRole"
                            value={selectedCurrentRole}
                            onClick={toggleDropdownCurrentRole}
                            className={`border-b focus:outline-none mb-5 w-full ${errors.CurrentRole
                              ? "border-red-500"
                              : "border-gray-300 focus:border-black"
                              }`}
                            readOnly
                          />
                          {errors.CurrentRole && (
                            <p className="text-red-500 text-sm -mt-4">
                              {errors.CurrentRole}
                            </p>
                          )}
                          <div
                            className="absolute right-0 top-0"
                            onClick={toggleDropdownCurrentRole}
                          >
                            <MdArrowDropDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
                          </div>
                        </div>
                        {showDropdownCurrentRole && (
                          <div className="absolute z-50 -mt-4 w-full rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
                            <div className="flex items-center border-b p-2">
                              <IoMdSearch className="absolute left-2 text-gray-500" />
                              <input
                                type="text"
                                placeholder="Search Current Role"
                                value={searchTermCurrentRole}
                                onChange={(e) =>
                                  setSearchTermCurrentRole(e.target.value)
                                }
                                className="pl-8 focus:outline-none w-full"
                              />
                            </div>
                            {filteredCurrentRoles.length > 0 ? (
                              filteredCurrentRoles.map((role) => (
                                <div
                                  key={role._id}
                                  onClick={() => handleRoleSelect(role)}
                                  className="cursor-pointer hover:bg-gray-200 p-2"
                                >
                                  {role.RoleName}
                                </div>
                              ))
                            ) : (
                              <div className="p-2 text-gray-500">
                                No roles found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="sm:col-span-4 sm:flex sm:justify-center md:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1 sm:-mt-[41rem]">
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
                            <img
                              src={filePreview}
                              alt="Selected"
                              className="w-full h-full object-cover"
                            />
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
                                <MdOutlineCancel className="text-xl mr-2 mb-1" />
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

                    {showImagePopup && (
                      <div className="fixed inset-0 flex z-50 items-center justify-center bg-gray-200 bg-opacity-50">
                        <div className="bg-white p-5 rounded shadow-lg">
                          <p>
                            Upload the image for identification, if not then
                            you can continue to the next page.
                          </p>
                          <div className="flex justify-end space-x-2 mt-4">
                            <button
                              type="button"
                              onClick={() => setShowImagePopup(false)}
                              className="bg-gray-300 text-black px-4 py-2 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="footer-button bg-custom-blue"
                              onClick={handleContinue}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* skills */}
                <div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center mb-2">
                      <label htmlFor="Skills" className="text-sm font-medium text-gray-900" >
                        Skills <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center justify-center text-sm bg-custom-blue text-white py-1 rounded w-28"
                    >
                      <FaPlus className="text-md mr-2" />
                      Add Skills
                    </button>
                  </div>
                  {errors.skills && (
                    <p className="text-red-500 text-sm">{errors.skills}</p>
                  )}
                  <div>
                    <div className="space-y-2 mb-4 mt-3">
                      {entries.map((entry, index) => (
                        <div
                          key={index}
                          className="flex flex-wrap -mx-2 border p-3 rounded-lg items-center bg-custom-blue text-white"
                        >
                          <div className="w-1/3 px-2">{entry.skill}</div>
                          <div className="w-1/3 px-2">{entry.experience}</div>
                          <div className="w-1/3 px-2">{entry.expertise}</div>
                          <div className="w-full flex justify-end space-x-2 -mt-5">
                            <button
                              onClick={() => handleEdit(index)}
                              className="text-black text-md"
                              type="button"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(index)}
                              className="text-red-500 text-md"
                              type="button"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {isModalOpen && (
                      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg w-80 relative">
                          <header className="flex justify-between items-center w-full border-b py-3 px-4">
                            <h2 className="text-lg font-bold">Select Skills</h2>
                            <button type="button" className="text-gray-700" onClick={skillpopupcancelbutton}>
                              <FaTimes className="text-gray-400 border rounded-full p-1 text-2xl" />
                            </button>
                          </header>
                          <div>
                            {currentStep === 0 && (
                              <div>
                                <div className="max-h-56 overflow-y-auto">

                                  <div className="mt-3 ml-4 mb-3">
                                    <div>
                                      <input
                                        type="text"
                                        placeholder="Search skills..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border p-2 mb-3 w-[96%] rounded focus:outline-none"
                                      />
                                      <div className="min-h-56">
                                        {filteredSkills.length > 0 ? (
                                          filteredSkills.map(skill => (
                                            <label key={skill._id} className="block mb-1">
                                              <input
                                                type="radio"
                                                value={skill.SkillName}
                                                checked={selectedSkill === skill.SkillName}
                                                disabled={allSelectedSkills.includes(skill.SkillName) && selectedSkill !== skill.SkillName}
                                                onChange={(e) => setSelectedSkill(e.target.value)}
                                                className="mr-3"
                                              />
                                              {skill.SkillName}
                                            </label>
                                          ))
                                        ) : (
                                          <p className="text-gray-500">No skills available</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            )}
                            {currentStep === 1 && (
                              <div>
                                <div className="max-h-56 overflow-y-auto">
                                  <div className="mt-3 ml-4 mb-3">
                                    {experienceOptions.map(exp => (
                                      <label key={exp} className="block mb-1">
                                        <input
                                          type="radio"
                                          name="experience"
                                          value={exp}
                                          checked={selectedExp === exp}
                                          onChange={(e) => setSelectedExp(e.target.value)}
                                          className="mr-3"
                                        />
                                        {exp}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            {currentStep === 2 && (
                              <div>
                                <div className="min-h-56 overflow-y-auto">
                                  <div className="mt-3 ml-4 mb-3">
                                    {expertiseOptions.map(exp => (
                                      <label key={exp} className="block mb-1">
                                        <input
                                          type="radio"
                                          name="expertise"
                                          value={exp}
                                          checked={selectedLevel === exp}
                                          onChange={(e) => setSelectedLevel(e.target.value)}
                                          className="mr-3"
                                        />
                                        {exp}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <footer className="flex justify-end border-t py-2 px-4">
                            {currentStep === 0 && (
                              <button
                                onClick={() => {
                                  setCurrentStep(1);
                                  setSearchTerm("");
                                }}
                                className={`bg-blue-500 text-white px-4 py-2 rounded block float-right ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!isNextEnabled()}
                              >
                                Next
                              </button>
                            )}
                            {currentStep === 1 && (
                              <div className="flex justify-between gap-4">
                                <button type="button" onClick={() => setCurrentStep(0)} className="bg-gray-300 text-black px-4 py-2 rounded">
                                  Back
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCurrentStep(2)}
                                  className={`bg-blue-500 text-white px-4 py-2 rounded ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  disabled={!isNextEnabled()}
                                >
                                  Next
                                </button>
                              </div>
                            )}
                            {currentStep === 2 && (
                              <div className="flex justify-between gap-4">
                                <button type="button" onClick={() => setCurrentStep(1)} className="bg-gray-300 text-black px-4 py-2 rounded">
                                  Back
                                </button>
                                <button
                                  type="button"
                                  onClick={handleAddEntry}
                                  className={`bg-blue-500 text-white px-4 py-2 rounded ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  disabled={!isNextEnabled()}
                                >
                                  {editingIndex !== null ? 'Update' : 'Add'}
                                </button>
                              </div>
                            )}
                          </footer>
                        </div>
                      </div>
                    )}

                    {deleteIndex !== null && (
                      <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
                        <div className="bg-white p-5 rounded shadow-lg">
                          <p>Are you sure you want to delete this Skill?</p>
                          <div className="flex justify-end space-x-2 mt-4">
                            <button
                              type="button"
                              onClick={confirmDelete}
                              className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={cancelDelete}
                              className="bg-gray-300 text-black px-4 py-2 rounded"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="footer-buttons flex justify-end">
                  <button type="submit" className="footer-button">
                    Next
                  </button>
                </div>
              </form>
            )}
            {currentPage === "availability" && (
              <form onSubmit={handleSubmit}>
                <div className="mx-5 mt-7 gap-28 mb-5">
                  {/* time zone */}
                  <div className="flex mb-5 overflow-visible">
                    <div>
                      <label
                        htmlFor="TimeZone"
                        className="block text-sm font-medium leading-6 text-gray-900 w-20"
                      >
                        Time Zone <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="flex-grow w-full overflow-visible -mt-1">
                      <div className="w-full overflow-visible">
                        <TimezoneSelect
                          value={formData.TimeZone}
                          onChange={(timezone) => {
                            setFormData({ ...formData, TimeZone: timezone.value });
                            setTimeZoneError(""); // Clear error when timezone is selected
                          }}
                          className="TimezonePicker ml-5"
                        />
                        {timeZoneError && <p className="text-red-500 text-sm ml-5 mt-2">{timeZoneError}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm flex">
                    <div>
                      <div className="text-xl">
                        <h2>
                          Availability &nbsp;{" "}
                          <span className="text-red-500 -ml-3">*</span>
                        </h2>
                        {availabilityError && (
                          <p className="text-red-500 text-sm">
                            {availabilityError}
                          </p>
                        )}
                      </div>
                      {Object.keys(times).map((day) => {
                        // const allUnavailable = times[day].every(
                        //   (timeSlot) =>
                        //     !timeSlot.startTime || !timeSlot.endTime
                        // );

                        return (
                          <div key={day}>
                            <div className="flex justify-start space-y-8">
                              <span className="w-24 mr-10 mt-9">{day}</span>
                              <div className="flex flex-col">
                                {times[day].length === 0 ? (
                                  // Display editable time boxes even if no time slots are available
                                  <div className="flex items-center">
                                    {/* start time */}
                                    <div className="w-28 mr-5">
                                      <div className="border-2 border-black">
                                        <div className="flex justify-center">
                                          <div className="text-center">
                                            <DatePicker
                                              selected={null} // No date selected initially
                                              onChange={(date) => {
                                                const newTimes = [{ startTime: date, endTime: null }];
                                                setTimes((prevTimes) => ({
                                                  ...prevTimes,
                                                  [day]: newTimes,
                                                }));
                                              }}
                                              showTimeSelect
                                              showTimeSelectOnly
                                              timeIntervals={15}
                                              dateFormat="h:mm aa"
                                              placeholderText="Start Time"
                                              className="p-2 w-full"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {/* minus */}
                                    <div className="mr-5">
                                      <span>
                                        <FaMinus className="text-2xl" />
                                      </span>
                                    </div>
                                    {/* end time */}
                                    <div className="max-w-sm w-28">
                                      <div className="border-2 border-black">
                                        <div className="flex justify-center">
                                          <div className="text-center">
                                            <DatePicker
                                              selected={null} // No date selected initially
                                              onChange={(date) => {
                                                const newTimes = [{ startTime: times[day][0]?.startTime || null, endTime: date }];
                                                setTimes((prevTimes) => ({
                                                  ...prevTimes,
                                                  [day]: newTimes,
                                                }));
                                              }}
                                              showTimeSelect
                                              showTimeSelectOnly
                                              timeIntervals={15}
                                              dateFormat="h:mm aa"
                                              placeholderText="End Time"
                                              className="w-full p-2"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {/* remove button (hidden by default) */}
                                    <div className="ml-12" style={{ width: "24px", height: "24px" }}>
                                      {/* Hidden unless times are selected */}
                                    </div>
                                  </div>
                                ) : (
                                  times[day].map((timeSlot, index) => (
                                    <div
                                      key={index}
                                      className={`flex items-center justify-center ${index > 0 ? "mt-5" : ""}`}
                                    >
                                      {/* start time */}
                                      <div className="w-28 mr-5">
                                        <div className="border-2 border-black">
                                          <div className="flex justify-center">
                                            <div className="text-center">
                                              <DatePicker
                                                selected={timeSlot.startTime}
                                                onChange={(date) => {
                                                  const newTimes = [...times[day]];
                                                  newTimes[index].startTime = date;
                                                  setTimes((prevTimes) => ({
                                                    ...prevTimes,
                                                    [day]: newTimes,
                                                  }));
                                                }}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                dateFormat="h:mm aa"
                                                placeholderText="Start Time"
                                                className="p-2 w-full"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      {/* minus */}
                                      <div className="mr-5">
                                        <span>
                                          <FaMinus className="text-2xl" />
                                        </span>
                                      </div>
                                      {/* end time */}
                                      <div className="max-w-sm w-28">
                                        <div className="border-2 border-black">
                                          <div className="flex justify-center">
                                            <div className="text-center">
                                              <DatePicker
                                                selected={timeSlot.endTime}
                                                onChange={(date) => {
                                                  const newTimes = [...times[day]];
                                                  newTimes[index].endTime = date;
                                                  setTimes((prevTimes) => ({
                                                    ...prevTimes,
                                                    [day]: newTimes,
                                                  }));
                                                }}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                dateFormat="h:mm aa"
                                                placeholderText="End Time"
                                                className="w-full p-2"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      {/* remove button (visible only when times are selected) */}
                                      <div className="ml-12" style={{ width: "24px", height: "24px" }}>
                                        {timeSlot.startTime && timeSlot.endTime ? (
                                          <MdOutlineCancel
                                            className="text-2xl cursor-pointer"
                                            onClick={() => handleRemoveTimeSlot(day, index)}
                                          />
                                        ) : (
                                          <div style={{ width: "24px", height: "24px" }}></div>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              <div className="flex ml-5 relative">
                                <FaPlus
                                  className="text-2xl cursor-pointer mt-2"
                                  onClick={() => handleAddTimeSlot(day)}
                                />
                                <div className="relative">
                                  <IoIosCopy
                                    className="text-2xl cursor-pointer ml-4 mt-2"
                                    onClick={(e) => handleCopy(e, day)}
                                  />
                                  {showPopup && selectedDay === day && (
                                    <div
                                      className="absolute bg-white p-4 rounded-lg w-72 -ml-56 shadow-md border"
                                      style={{ zIndex: 1000 }}
                                    >
                                      <div className="flex justify-between">
                                        <h2 className="text-lg font-semibold mb-2 mr-2">
                                          Duplicate Time Entries
                                        </h2>
                                        <MdOutlineCancel
                                          className="text-2xl cursor-pointer"
                                          onClick={() => setShowPopup(false)}
                                        />
                                      </div>
                                      <div>
                                        {Object.keys(times).map((dayOption) => (
                                          <label key={dayOption} className="block">
                                            <input
                                              type="checkbox"
                                              value={dayOption}
                                              checked={selectedDays.includes(dayOption)}
                                              disabled={dayOption === selectedDay}
                                              onChange={(e) => {
                                                const value = e.target.value;
                                                setSelectedDays((prev) =>
                                                  prev.includes(value)
                                                    ? prev.filter((item) => item !== value)
                                                    : [...prev, value]
                                                );
                                              }}
                                              className="mr-2"
                                            />
                                            {dayOption}
                                          </label>
                                        ))}
                                      </div>
                                      <button
                                        onClick={handlePaste}
                                        className="mt-4 bg-blue-500 text-white py-1 px-4 rounded"
                                      >
                                        Duplicate
                                      </button>
                                      <button
                                        onClick={() => setShowPopup(false)}
                                        className="mt-4 ml-2 bg-gray-500 text-white py-1 px-4 rounded"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>


                            </div>
                          </div>



                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-10">
                    {/* preferred interview */}
                    <div>
                      <div className="bg-gray-50 border border-gray-500 text-gray-900 text-sm p-4 rounded-lg">
                        <p className="font-medium">
                          Preferred Interview Duration
                        </p>
                        <ul className="flex mt-3 text-xs font-medium">
                          <li
                            className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${selectedOption === "30"
                              ? "bg-gray-700 text-white"
                              : "bg-gray-300"
                              }`}
                            onClick={() => handleOptionClick("30")}
                          >
                            30 mins
                          </li>
                          <li
                            className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${selectedOption === "60"
                              ? "bg-gray-700 text-white"
                              : "bg-gray-300"
                              }`}
                            onClick={() => handleOptionClick("60")}
                          >
                            1 Hour
                          </li>
                          <li
                            className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${selectedOption === "90"
                              ? "bg-gray-700 text-white"
                              : "bg-gray-300"
                              }`}
                            onClick={() => handleOptionClick("90")}
                          >
                            1:30 mins
                          </li>
                          <li
                            className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${selectedOption === "120"
                              ? "bg-gray-700 text-white"
                              : "bg-gray-300"
                              }`}
                            onClick={() => handleOptionClick("120")}
                          >
                            2 Hours
                          </li>
                        </ul>
                      </div>
                    </div>
                    {preferredDurationError && (
                      <p className="text-red-500 text-sm">
                        {preferredDurationError}
                      </p>
                    )}
                  </div>

                  <div className="footer-buttons flex justify-end">
                    <button onClick={handleBack} className="footer-button">
                      Back
                    </button>
                    <button type="submit" className="footer-button">
                      Save
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTeams;
