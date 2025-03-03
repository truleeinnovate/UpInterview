import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimezoneSelect from 'react-timezone-select';
import { fetchMasterData } from '../../../../utils/fetchMasterData.js';
import { validateEmail, validatePhone, validateFormData, validateAvailability } from '../../../../utils/teamValidation.js';
import Cookies from 'js-cookie';
import Availability from '../CommonCode-AllTabs/Availability.jsx'

import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as MdUpdate } from '../../../../icons/MdUpdate.svg';
import { ReactComponent as TbCameraPlus } from '../../../../icons/TbCameraPlus.svg';
import { ReactComponent as ImCancelCircle } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { ReactComponent as FaPlus } from '../../../../icons/FaPlus.svg';
import { ReactComponent as FaMinus } from '../../../../icons/FaMinus.svg';
import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as IoIosCopy } from '../../../../icons/IoIosCopy.svg';
import { useCustomContext } from "../../../../Context/Contextfetch.js";

const CreateTeams = ({ onClose, onClose1,defaultData, parentHandleSubmit, fetchTeamMembers, toastMessageCall, source, fromEditTeamFile, candidate }) => {
  const {
    fetchTeamsData,
    //masterdata
    skills,
    companies,
    technologies,
    locations
  } = useCustomContext();
  useEffect(() => {
    console.log("candidate", candidate)
  }, [])

  const userId = Cookies.get("userId");
  const [selectedTimezone1, setSelectedTimezone1] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [timeZoneError, setTimeZoneError] = useState("");
  const [preferredDurationError, setPreferredDurationError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [currentPage, setCurrentPage] = useState("form");
  const [formData, setFormData] = useState(() => {
    if (fromEditTeamFile) {
      return {
        FirstName: candidate?.contactId?.firstname || "",
        LastName: candidate?.contactId?.name || "",
        Email: candidate?.contactId?.email || "",
        Phone: candidate?.contactId?.phone || "",
        contactId: candidate?.contactId?._id || null,
        availabilityId: candidate?.contactId?.availability?.[0]?._id || null,
        CompanyName: candidate?.contactId?.CompanyName || "",
        Technology: candidate?.contactId?.technology || "",
        Location: candidate?.contactId?.location || "",
        CurrentRole: candidate?.contactId?.currentRole || "",
        skills: candidate?.contactId?.skills || [],
        TimeZone: candidate?.contactId?.timeZone || "",
        PreferredDuration: candidate?.contactId?.preferredDuration || "",
      };
    } else {
      return {
        FirstName: defaultData?.FirstName || "",
        LastName: defaultData?.LastName || "",
        Email: defaultData?.Email || "",
        Phone: defaultData?.Phone || "",
        CountryCode: defaultData?.CountryCode ?? "+91",
        UserName: defaultData?.UserName || "",
        Password: defaultData?.Password || "",
        LinkedinURL: defaultData?.LinkedinURL || "",
        ProfileId: defaultData?.ProfileId || "",
        RoleId: defaultData?.RoleId || "",
        TimeZone: defaultData?.TimeZone || "",
        Language: defaultData?.Language || "",
        Gender: defaultData?.Gender || "",
        OrganizationId: defaultData?.OrganizationId || "",
        CompanyName: "",
        Technology: "",
        Location: "",
        CurrentRole: "",
        skills: [],
        PreferredDuration: "",
      };
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (defaultData) {
      setFormData(defaultData);
    }
  }, [defaultData]);

  const handlePhoneInput = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      handleChange(e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setUnsavedChanges(true);

    setErrors((prevErrors) => {
      const { [name]: removedError, ...restErrors } = prevErrors;
      return restErrors;
    });

    if (name === 'Email' && !validateEmail(value)) {
      setErrors((prevErrors) => ({ ...prevErrors, Email: "Invalid email address" }));
    }

    if (name === 'Phone' && !validatePhone(value)) {
      setErrors((prevErrors) => ({ ...prevErrors, Phone: "Invalid phone number" }));
    }
  };

  const [isImageUploaded, setIsImageUploaded] = useState(false);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(`${process.env.REACT_APP_API_URL}/contacts/${userId}/details`);
  //       if (response.data) {
  //         setSelectedTimezone1({ value: response.data.TimeZone, label: response.data.TimeZone });
  //         setFormData((prevFormData) => ({
  //           ...prevFormData,
  //           TimeZone: response.data.TimeZone,
  //         }));
  //       }
  //     } catch (error) {
  //       console.error("Error fetching availability data:", error);
  //     }
  //   };
  //   fetchData();
  // }, [userId]);

  const handleNext = (e) => {
    e.preventDefault();

    const newErrors = validateFormData(formData, entries);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (source === "userForm") {
      setLocalSource("userForm");
    }

    else if (selectedContact && selectedContact.isAddedTeam === "user") {
      setLocalSource("team");
    }

    setCurrentPage("availability");
  };

  const handleBack = () => {
    setCurrentPage("form");
  };

  const newErrors = {
    timeZone: "",
    preferredDuration: "",
    availability: "",
  };

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
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
  };

  const handleSubmit = async (e, isAddedTeam = "team") => {
    e.preventDefault();
    setTimeZoneError("");
    setPreferredDurationError("");
    setAvailabilityError("");

    const newErrors = validateAvailability(times, formData, selectedOption);
    if (Object.keys(newErrors).length > 0) {
      setAvailabilityError(newErrors.availability);
      setTimeZoneError(newErrors.timeZone);
      setPreferredDurationError(newErrors.preferredDuration);
      return;
    }

    const userId = Cookies.get("userId");
    const orgId = Cookies.get("organizationId");

    try {
      const generateRandomSub = () => Math.random().toString(36).substring(2, 10);
      const UserNameToSend = formData.UserName || generateRandomSub();

      const userDataToSend = {
        Firstname: formData.FirstName,
        Name: formData.LastName,
        Email: formData.Email,
        Phone: formData.Phone,
        CountryCode: formData.CountryCode || "+91",
        UserName: UserNameToSend,
        password: formData.Password,
        LinkedinUrl: formData.LinkedinURL,
        ProfileId: formData.ProfileId,
        RoleId: formData.RoleId,
        TimeZone: formData.TimeZone,
        Language: formData.Language,
        Gender: formData.Gender,
        organizationId: formData.OrganizationId || Cookies.get("organizationId"),
        sub: generateRandomSub(),
        isAddedTeam,
        CompanyName: formData.CompanyName,
        Technology: formData.Technology,
        Location: formData.Location,
        CurrentRole: formData.CurrentRole,
        skills: entries.map((entry) => ({
          skill: entry.skill,
          experience: entry.experience,
          expertise: entry.expertise,
        })),
        PreferredDuration: formData.PreferredDuration
      };

      console.log("User Data to Send (Before):", userDataToSend);

      // Create user
      const userResponse = await axios.post(`${process.env.REACT_APP_API_URL}/users`, userDataToSend);
      console.log("User Data from Backend (After):", userResponse.data);

      const savedUserId = userResponse.data._id;

      const availabilityArray = Object.entries(times)
        .map(([day, slots]) => ({
          day,
          timeSlots: slots
            .filter(slot => slot.startTime && slot.endTime) // Only include slots where both times are present
            .map(slot => ({
              startTime: slot.startTime,
              endTime: slot.endTime
            }))
        }))
        .filter(dayData => dayData.timeSlots.length > 0)

      const contactData = {
        name: formData.LastName,
        firstname: formData.FirstName,
        CountryCode: formData.CountryCode || "+91",
        UserName: formData.UserName,
        email: formData.Email,
        phone: formData.Phone,
        linkedinUrl: formData.LinkedinURL,
        currentRole: formData.CurrentRole,
        industry: formData.Industry,
        experience: formData.Experience,
        CompanyName: formData.CompanyName,
        gender: formData.Gender,
        imageData: file ? {
          filename: file.name,
          path: '',
          contentType: file.type,
        } : undefined,
        timeZone: formData.TimeZone,
        preferredDuration: selectedOption,
        location: formData.Location,
        introduction: formData.Introduction,
        technology: formData.Technology,
        skills: entries.map((entry) => ({
          skill: entry.skill,
          experience: entry.experience,
          expertise: entry.expertise,
        })),
        experienceYears: formData.ExperienceYears,
        previousExperience: formData.PreviousExperience,
        expertiseLevel: formData.ExpertiseLevel,
        language: formData.Language,
        profileId: formData.ProfileId,
        roleId: formData.RoleId,
        organizationId: formData.OrganizationId || Cookies.get("organizationId"),
        user: savedUserId,
        availability: [],
        createdBy: userId,
        contactType: "interviewer",
        interviewerType: "internal",
        password: formData.Password,
        isAddedTeam
      };

      console.log("Contact Data to Send (Before):", contactData);

      // Create contact
      const contactResponse = await axios.post(`${process.env.REACT_APP_API_URL}/contacts`, contactData);
      console.log("Contact Data from Backend (After):", contactResponse.data);

      const contactId = contactResponse.data._id;

      // Availability data to send
      const availabilityData = {
        contact: contactId,
        days: availabilityArray
      };

      console.log("Availability Data to Send (Before):", availabilityData);

      // Create availability
      const availabilityResponse = await axios.post(`${process.env.REACT_APP_API_URL}/interviewavailability`, availabilityData);
      console.log("Availability Data from Backend (After):", availabilityResponse.data);

      if (isAddedTeam === "added to team") {
        // Team schema data to send
        const teamSchemaData = {
          team_member: "",
          contactId: contactId,
          tenantId: orgId,
          ownerId: userId,
          created_at: new Date(),
          updated_at: new Date(),
        };

        console.log("Team Schema Data to Send (Before):", teamSchemaData);

        // Create team schema
        const teamResponse = await axios.post(`${process.env.REACT_APP_API_URL}/teammember`, teamSchemaData);
        console.log("Team Schema Data from Backend (After):", teamResponse.data);
      }

      console.log("All data successfully saved:", {
        user: userResponse.data,
        contact: contactResponse.data,
        availability: availabilityResponse.data,
        ...(isAddedTeam && { teamSchema: "Team member data saved." }),
      });

      setUnsavedChanges(false);
      onClose();
      onClose1();
      fetchTeamMembers();
      toastMessageCall();

      await fetchTeamsData();
    } catch (error) {
      console.error("Error saving data:", error.response?.data || error.message);
    }
  };

  const handleEditSave = async (e, isAddedTeam = "edit team") => {
    e.preventDefault();

    try {
      const userId = formData.userId || Cookies.get("userId");
      console.log(userId, "userId");
      const contactId = formData.contactId;
      console.log(contactId, "contactId");

      // Prepare data for update (without availability for now)
      const contactData = {
        name: formData.LastName,
        firstname: formData.FirstName,
        email: formData.Email,
        phone: formData.Phone,
        linkedinUrl: formData.LinkedinURL,
        currentRole: formData.CurrentRole,
        timeZone: formData.TimeZone,
        preferredDuration: formData.PreferredDuration,
        location: formData.Location,
        technology: formData.Technology,
        skills: entries.map((entry) => ({
          skill: entry.skill,
          experience: entry.experience,
          expertise: entry.expertise,
        })),
      };

      // Transform times data for availability
      const availabilityData = Object.entries(times)
        .map(([day, slots]) => ({
          day,
          timeSlots: slots.filter((slot) => slot.startTime && slot.endTime),
        }))
        .filter((day) => day.timeSlots.length > 0);

      if (!contactId) {
        console.error("Contact ID is missing. Cannot update contact.");
        return;
      }

      // Update the contact data (PATCH request)
      await axios.patch(`${process.env.REACT_APP_API_URL}/contacts/${contactId}`, contactData);
      console.log("Contact updated successfully:", contactData);

      // Update availability data if available
      if (availabilityData.length > 0) {
        const availabilityId = formData.availabilityId; // Ensure this is passed from the backend
        if (availabilityId) {
          await axios.patch(
            `${process.env.REACT_APP_API_URL}/interviewavailability/${availabilityId}`,
            { days: availabilityData }
          );
          console.log("Availability updated successfully:", availabilityData);
        } else {
          console.error("Availability ID is missing. Cannot update availability.");
        }
      }

      console.log("Contact and availability updated successfully");

      // Close modals or perform further actions after the update
      onClose();
      onClose1();
      fetchTeamMembers();
      toastMessageCall();
      await fetchTeamsData();

    } catch (error) {
      console.error("Error updating contact:", error.response?.data || error.message);
    }
  };

  const [selectedCurrentRole, setSelectedCurrentRole] = useState(
    fromEditTeamFile ? candidate.contactId?.currentRole || "" : ""
  );
  const [searchTermCurrentRole, setSearchTermCurrentRole] = useState('');
  const [showDropdownCurrentRole, setShowDropdownCurrentRole] = useState(false);

  // Hardcoded array of roles
  const currentRoles = [
    { _id: 1, RoleName: "Developer" },
    { _id: 2, RoleName: "Designer" },
    { _id: 3, RoleName: "Project Manager" },
    { _id: 4, RoleName: "Tester" },
    { _id: 5, RoleName: "DevOps Engineer" }
  ];

  // Filter current roles based on search term
  const filteredCurrentRoles = currentRoles.filter(role =>
    role.RoleName && role.RoleName.toLowerCase().includes(searchTermCurrentRole.toLowerCase())
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

  const toggleDropdownCurrentRole = () => {
    setShowDropdownCurrentRole(!showDropdownCurrentRole);
  };

  const [selectedLocation, setSelectedLocation] = useState(
    fromEditTeamFile ? candidate.contactId?.location || "" : ""
  );
  const [searchTermLocation, setSearchTermLocation] = useState('');
  const [showDropdownLocation, setShowDropdownLocation] = useState(false);

  const filteredLocations = locations.filter(location =>
    location.LocationName && location.LocationName.toLowerCase().includes(searchTermLocation.toLowerCase())
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
      Location: "", // Clear the error message
    }));
    setUnsavedChanges(true);
  };

  // Toggle dropdown visibility
  const toggleDropdownLocation = () => {
    setShowDropdownLocation(!showDropdownLocation);
  };



  // technology purpose
  // const technologies = [
  //   "Artificial Intelligence (AI)",
  //   "Machine Learning (ML)",
  //   "Data Science",
  //   "Big Data Analytics",
  //   "Cloud Computing",
  //   "Blockchain",
  //   "Cybersecurity",
  //   "Internet of Things (IoT)",
  //   "Augmented Reality (AR)",
  //   "Virtual Reality (VR)",
  //   "DevOps",
  //   "Full Stack Development",
  //   "Mobile App Development",
  //   "Robotic Process Automation (RPA)",
  //   "Digital Marketing",
  //   "UI/UX Design",
  //   "Software Testing",
  //   "Edge Computing",
  //   "5G Technology",
  //   "Quantum Computing"
  // ];



  const handleTechnologySelect = (technology) => {
    setSelectedTechnology(technology.TechnologyMasterName);
    setFormData((prevFormData) => ({
      ...prevFormData,
      Technology: technology.TechnologyMasterName,
    }));
    setShowDropdownTechnology(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      Technology: "",
    }));
    setUnsavedChanges(true);
  };

  const [selectedCompany, setSelectedCompany] = useState(
    fromEditTeamFile ? candidate.contactId?.CompanyName : ""
  );

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
    setErrors((prevErrors) => ({
      ...prevErrors,
      CompanyName: "",
    }));
    setUnsavedChanges(true);
  };

  const [selectedTechnology, setSelectedTechnology] = useState(
    fromEditTeamFile ? candidate.contactId?.technology : ""
  );
  const [showDropdownTechnology, setShowDropdownTechnology] = useState(false);

  const toggleDropdownTechnology = () => {
    setShowDropdownTechnology(!showDropdownTechnology);
  };




  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [entries, setEntries] = useState([]);
  const [allSelectedSkills, setAllSelectedSkills] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [teamData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const experienceOptions = [
    "0-1 Years",
    "1-2 years",
    "2-3 years",
    "3-4 years",
    "4-5 years",
    "5-6 years",
    "6-7 years",
    "7-8 years",
    "8-9 years",
    "9-10 years",
    "10+ years",
  ];
  const expertiseOptions = ["Basic", "Medium", "Expert"];

  useEffect(() => {
    if (fromEditTeamFile) {
      setEntries(
        formData.skills.map(skill => ({
          skill: skill.skill || "",
          experience: skill.experience || "",
          expertise: skill.expertise || "",
        }))
      );

      // Initialize selected skills for modal filtering
      setAllSelectedSkills(
        formData.skills.map(skill => skill.skill || "")
      );
    }
  }, [formData.skills, fromEditTeamFile])

  const handleAddEntry = () => {
    if (selectedSkill && selectedExp && selectedLevel) {
      if (editingIndex !== null) {
        const updatedEntries = entries.map((entry, index) =>
          index === editingIndex
            ? {
              skill: selectedSkill,
              experience: selectedExp,
              expertise: selectedLevel,
            }
            : entry
        );
        setEntries(updatedEntries);
        setEditingIndex(null);
        setAllSelectedSkills([
          ...updatedEntries.flatMap((entry) => entry.skill),
        ]);
      } else {
        setEntries([
          ...entries,
          {
            skill: selectedSkill,
            experience: selectedExp,
            expertise: selectedLevel,
          },
        ]);
        setAllSelectedSkills([...allSelectedSkills, selectedSkill]);
      }

      // Clear the skills error
      setErrors((prevErrors) => ({
        ...prevErrors,
        skills: "",
      }));

      resetSkillForm();
      setUnsavedChanges(true);
    } else {
      // Handle validation error if any field is missing
      setErrors((prevErrors) => ({
        ...prevErrors,
        skills: "Please fill all skill fields",
      }));
    }
  };

  const resetSkillForm = () => {
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
    setCurrentStep(0);
    setIsModalOpen(false);
  };


  const isNextEnabled = () => {
    if (currentStep === 0) {
      if (editingIndex !== null) {
        return selectedSkill !== "";
      } else {
        return (
          selectedSkill !== "" && !allSelectedSkills.includes(selectedSkill)
        );
      }
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
    setIsModalOpen(true);
    setUnsavedChanges(true);
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setUnsavedChanges(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const entry = entries[deleteIndex];
      setAllSelectedSkills(
        allSelectedSkills.filter((skill) => skill !== entry.skills)
      );
      setEntries(entries.filter((_, i) => i !== deleteIndex));
      setDeleteIndex(null);
      setUnsavedChanges(true);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
  };

  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    setUnsavedChanges(true);
  }

  const filteredSkills = skills.filter(skill =>
    skill.SkillName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedOption, setSelectedOption] = useState(
    fromEditTeamFile ? formData.PreferredDuration?.toString() || "" : ""
  );

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setFormData((prevFormData) => ({
      ...prevFormData,
      PreferredDuration: option,
    }));
    setPreferredDurationError("");
  };

  const navigate = useNavigate()

  const navigatepage = () => {
    navigate("/team");
    onClose();
  };

  const [times, setTimes] = useState({
    Sunday: [{ startTime: null, endTime: null }],
    Monday: [{ startTime: null, endTime: null }],
    Tuesday: [{ startTime: null, endTime: null }],
    Wednesday: [{ startTime: null, endTime: null }],
    Thursday: [{ startTime: null, endTime: null }],
    Friday: [{ startTime: null, endTime: null }],
    Saturday: [{ startTime: null, endTime: null }]
  });

  const [showPopup, setShowPopup] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  const handleCopy = (event, day) => {
    setSelectedDay(day);
    setSelectedDays([day]);
    const buttonRect = event.target.getBoundingClientRect();
    setPopupPosition({
      top: buttonRect.bottom + window.scrollY,
      left: buttonRect.left + window.scrollX
    });
    setShowPopup(true);
  };

  const handlePaste = () => {
    const copiedTimes = times[selectedDay];
    setTimes(prevTimes => {
      const newTimes = { ...prevTimes };
      selectedDays.forEach(day => {
        newTimes[day] = copiedTimes.map(time => ({ ...time }));
      });
      return newTimes;
    });
    setShowPopup(false);
    setSelectedDay(null);
    setSelectedDays([]);
  };

  const handleAddTimeSlot = (day) => {
    setTimes(prevTimes => {
      const dayTimes = prevTimes[day];
      return {
        ...prevTimes,
        [day]: [...dayTimes, { startTime: null, endTime: null }]
      };
    });
  };

  const handleRemoveTimeSlot = (day, index) => {
    setTimes(prevTimes => {
      const newTimes = { ...prevTimes };
      newTimes[day] = newTimes[day].filter((_, i) => i !== index);
      if (newTimes[day].length === 0) {
        newTimes[day] = [{ startTime: null, endTime: null }];
      }
      return newTimes;
    });
  };

  const [selectedTimezone, setSelectedTimezone] = useState({});

  const handleTimezoneChange = (timezone) => {
    setSelectedTimezone(timezone);
    setFormData((prevFormData) => ({
      ...prevFormData,
      TimeZone: timezone.value,
    }));
    setTimeZoneError('');
  };


  const handleCancel = () => {
    if (unsavedChanges) {
      setShowConfirmationPopup(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmationPopup(false);
    setUnsavedChanges(false); // Reset unsaved changes
    onClose(); // Close the modal
  };

  const handleCancelClose = () => {
    setShowConfirmationPopup(false); // Just close the popup
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   if (value.length <= 100) {
  //     setFormData({ ...formData, [name]: value });
  //     setUnsavedChanges(true);
  //   }
  //   setErrors((prevErrors) => ({
  //     ...prevErrors,
  //     [name]: "",
  //   }));
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // const [showNewSaveButton, setShowNewSaveButton] = useState(false);
  const [showLookup, setShowLookup] = useState(source === "team");
  const [selectedUser, setSelectedUser] = useState(null);
  const [localSource, setLocalSource] = useState(source);

  const handleCreateTeamClick = () => {
    setShowLookup(false);
    console.log("Before setting localSource:", localSource);
    setLocalSource("createNew");
    console.log("After setting localSource:", localSource);
  };

  const organizationId = Cookies.get("organizationId");
  const [contactsData, setContactsData] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);

  // to show the search data from the contact table

  const fetchContactData = useCallback(async () => {
    try {
      // console.log("Fetching contact data...");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/contacts/organization/${organizationId}`
      );
      // console.log("API response received:", response.data);

      const filteredContacts = response.data.filter(
        (contact) => contact.isAddedTeam === "team" || contact.isAddedTeam === "user"
      );

      // console.log("Filtered contacts:", filteredContacts);
      setContactsData(filteredContacts); // Store contacts data
      setFilteredContacts(filteredContacts); // Initialize filtered contacts
    } catch (error) {
      console.error("Error fetching contact data:", error);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchContactData();
  }, [fetchContactData]);

  useEffect(() => {
    // console.log("Search term:", searchTerm); // Debugging searchTerm
    const filtered = contactsData.filter((contact) =>
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) // Case-insensitive search
    );
    // console.log("Filtered contacts based on search:", filtered); // Check filtered contacts
    setFilteredContacts(filtered); // Update filtered contacts based on search term
  }, [searchTerm, contactsData]);

  const [highlightedContact, setHighlightedContact] = useState(null); // Track the highlighted contact

  const [selectedContact, setSelectedContact] = useState(null);

  // const handleContactClick = (contact) => {
  //   if (contact.isAddedTeam === "user") {
  //     setFormData({
  //       FirstName: contact.firstname || "",
  //       LastName: contact.name || "",
  //       Email: contact.email || "",
  //       Phone: contact.phone || "",
  //       CountryCode: contact.countryCode || "+91",
  //     });
  //     setSelectedUser(contact);
  //     setHighlightedContact(contact._id);
  //     handleCreateTeamClick();
  //     setSearchTerm('');
  //   } else if (contact.isAddedTeam === "team") {
  //     setSelectedContact(contact);
  //   }
  // };

  const handleContactClick = async (contact) => {
    setSelectedContact(contact);
    setHighlightedContact(contact._id);

    if (contact.isAddedTeam === "team") {
      try {
        const teamMemberPayload = {
          team_member: contact.name || `${contact.firstname} ${contact.lastname}`,
          contactId: contact._id,
          tenantId: contact.organizationId || Cookies.get("organizationId"),
          ownerId: Cookies.get("userId"),
        };

        const teamMemberResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/teammember`,
          teamMemberPayload
        );

        if (teamMemberResponse.status === 201) {
          console.log("Contact added to TeamMember successfully:", teamMemberResponse.data);
          fetchTeamMembers();
        }
      } catch (error) {
        console.error("Error adding contact to TeamMember:", error.response?.data || error.message);
      }
    }

    if (contact.isAddedTeam === "user") {
      setLocalSource("team");
    } else {
      setLocalSource(contact.isAddedTeam);
    }

    console.log("Updated localSource:", localSource);
  };

  useEffect(() => {
    setLocalSource("createNew");
  }, []);

  const handleSingleSave = async (e) => {
    e.preventDefault();

    if (!selectedUser?._id) {
      console.error("User ID is missing");
      return;
    }

    const payload = {
      // Contact data payload
      name: formData.LastName,
      firstname: formData.FirstName,
      CountryCode: formData.CountryCode || "+91",
      UserName: formData.UserName,
      email: formData.Email,
      phone: `${formData.CountryCode || "+91"} ${formData.Phone}`,
      linkedinUrl: formData.LinkedinURL,
      currentRole: formData.CurrentRole,
      industry: formData.Industry,
      experience: formData.Experience,
      gender: formData.Gender,
      timeZone: formData.TimeZone,
      preferredDuration: formData.PreferredDuration,
      location: formData.Location,
      introduction: formData.Introduction,
      technology: formData.Technology,
      skills: entries.map((entry) => ({
        skill: entry.skills,
        experience: entry.experience,
        expertise: entry.expertise,
      })),
      experienceYears: formData.ExperienceYears,
      previousExperience: formData.PreviousExperience,
      expertiseLevel: formData.ExpertiseLevel,
      language: formData.Language,
      profileId: formData.ProfileId,
      roleId: formData.RoleId,
      organizationId: formData.OrganizationId || Cookies.get("organizationId"),
      user: selectedUser._id,
      availability: [],
      createdBy: Cookies.get("userId"),
      contactType: "interviewer",
      interviewerType: "internal",
      password: formData.Password,
      isAddedTeam: "added to team",
    };

    try {
      // Update contact
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/contacts/${selectedUser._id}`,
        payload
      );

      if (response.status === 200) {
        console.log("Contact updated successfully:", response.data);

        // Add to TeamMember table
        if (response.data.isAddedTeam === "team") {
          const teamMemberPayload = {
            team_member: `${formData.FirstName} ${formData.LastName}`,
            contactId: response.data._id,
            tenantId: formData.OrganizationId || Cookies.get("organizationId"),
            ownerId: Cookies.get("userId"),
          };

          const teamMemberResponse = await axios.post(
            `${process.env.REACT_APP_API_URL}/teammember`,
            teamMemberPayload
          );

          if (teamMemberResponse.status === 201) {
            console.log("Contact added to TeamMember successfully:", teamMemberResponse.data);
          }
        }

        fetchContactData();
        setFormData({});
        onClose();
        fetchTeamMembers();
        toastMessageCall();
      }
    } catch (error) {
      console.error("Error during contact update or team member addition:", error.response?.data || error.message);
    }
  };

  const handleAddClick = async () => {
    if (!selectedContact) {
      console.error("No contact selected");
      return;
    }

    if (selectedContact.isAddedTeam === "user") {
      setFormData({
        FirstName: selectedContact.firstname || "",
        LastName: selectedContact.name || "",
        Email: selectedContact.email || "",
        Phone: selectedContact.phone || "",
        CountryCode: selectedContact.countryCode || "+91",
      });

      setSelectedUser(selectedContact);
      handleCreateTeamClick();
      setSearchTerm('');
    } else if (selectedContact.isAddedTeam === "team") {
      const updatedContact = { ...selectedContact, isAddedTeam: "added to team" };

      try {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/contacts/${selectedContact._id}`,
          updatedContact
        );

        if (response.status === 200) {
          console.log("Team member updated successfully:", response.data);
          fetchContactData();
          setSelectedContact(null);
          toastMessageCall();
        }
        onClose();
        fetchTeamMembers();
      } catch (error) {
        console.error("Error updating team member:", error);
      }
    }
  };

  // State to toggle the new Save button

  // const handleCreateTeamClick = () => {
  //   setShowNewSaveButton(true); // Show the new Save button
  //   // Other logic for creating a new team, if needed
  // };


  const [buttonState, setButtonState] = useState("default"); // Tracks which buttons to show

  const handleNewSave = (e) => {
    e.preventDefault();
    console.log("New Save clicked");
    // Add logic for New Save
  };

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 w-full bg-white border-b">
        <div className="flex justify-between sm:justify-start items-center p-4">
          <button onClick={handleCancel} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
            <IoArrowBack className="text-2xl" />
          </button>
          <h2 className="text-lg font-bold">{source === "team" ? "New Team Member" : "Interviewer"}</h2>
          <button onClick={handleCancel} className="focus:outline-none sm:hidden">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {showLookup ? (
        <>
          <div className="flex items-center space-x-2 mt-20 px-3">
            <label className="text-md font-medium whitespace-nowrap -mt-1">Search Users</label>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search"
                className="w-full border rounded px-2 py-1 pl-10 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm
              />
              <svg
                className="absolute left-3 top-1.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19a8 8 0 100-16 8 8 0 000 16zm4.293-4.293l4.707 4.707"
                />
              </svg>
              {/* Dropdown */}
              {searchTerm.trim() && (
                <ul className="absolute top-full left-0 w-full max-h-40 overflow-y-auto border rounded bg-white shadow-md z-10">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <li
                        key={contact._id}
                        className={`p-2 border-b cursor-pointer hover:bg-gray-200 ${selectedContact && selectedContact._id === contact._id ? "bg-gray-200" : ""}`}
                        onClick={() => handleContactClick(contact)} // Store the selected contact
                      >
                        {contact.name}
                      </li>
                    ))
                  ) : (
                    <li className="p-2 text-gray-500">No contacts found</li>
                  )}
                </ul>
              )}
            </div>
            <button
              onClick={handleAddClick}
              className="px-4 py-1 bg-custom-blue text-white rounded font-semibold"
            >
              Add
            </button>
            <button
              onClick={handleCreateTeamClick} // Create a new team for user
              className="px-4 py-1 bg-custom-blue text-white rounded font-semibold"
            >
              Create New
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Content */}
          <div className="fixed top-16 bottom-16 overflow-auto text-sm right-0 left-0 p-5">
            {currentPage === "form" && (
              <form onSubmit={handleNext}>
                <p className="font-bold text-lg mb-5">
                  Personal Details:
                </p>
                <div className="grid grid-cols-4 ">
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
                          value={formData.FirstName}
                          onChange={handleInputChange}
                          maxLength={100}
                          autoComplete="off"
                          className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                        />
                        {formData.FirstName.length >= 99 && (
                          <span className="text-gray-500 text-xs float-end -mt-4">
                            {formData.FirstName.length}/100
                          </span>
                        )}
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
                          value={formData.LastName}
                          onChange={handleInputChange}
                          maxLength={100}
                          className={`border-b focus:outline-none mb-5 w-full ${errors.LastName
                            ? "border-red-500"
                            : "border-gray-300 focus:border-black"
                            }`}
                        />
                        {formData.LastName.length >= 99 && (
                          <span className="text-gray-500 text-xs float-end -mt-4">
                            {formData.LastName.length}/100
                          </span>
                        )}
                        {errors.LastName && (
                          <span className="text-red-500 text-sm -mt-5">
                            {errors.LastName}
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
                            value={formData.CountryCode}
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
                            value={formData.Phone}
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
                    <p className="font-bold text-lg mb-5">
                      Contact Details:
                    </p>

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
                          value={formData.Email}
                          onChange={handleChange}
                          maxLength={50}
                          className={`border-b focus:outline-none mb-5 w-full ${errors.Email
                            ? "border-red-500"
                            : "border-gray-300 focus:border-black"
                            }`}
                        />
                        {formData.Email.length >= 49 && (
                          <span className="text-gray-500 text-xs float-end -mt-4">
                            {formData.Email.length}/50
                          </span>
                        )}
                        {errors.Email && (
                          <span className="text-red-500 text-sm -mt-5">
                            {errors.Email}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="font-bold text-lg mb-5">
                      Job Details:
                    </p>

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
                            className={`border-b focus:outline-none mb-5 w-full ${errors.CompanyName
                              ? "border-red-500"
                              : "border-gray-300 focus:border-black"
                              }`}
                            value={selectedCompany}
                            onClick={toggleDropdownCompany}
                            readOnly
                          />
                          {errors.CompanyName && (
                            <p className="text-red-500 text-sm">{errors.CompanyName}</p>
                          )}
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
                            {technologies.map((technology, index) => (
                              <div
                                key={index}
                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleTechnologySelect(technology)}
                              >
                                {technology.TechnologyMasterName}
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
                            onChange={(e) => setSearchTermLocation(e.target.value)}
                            className={`border-b focus:outline-none mb-5 w-full ${errors.Location ? "border-red-500" : "border-gray-300 focus:border-black"}`}
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
                          <div className="absolute z-50 -mt-4 w-full rounded-md bg-white shadow-xl border max-h-48 overflow-y-auto">
                            <div className="flex items-center border p-2 rounded m-2">
                              <IoMdSearch className="absolute left-5 text-gray-500" />
                              <input
                                type="text"
                                placeholder="Search Location"
                                value={searchTermLocation}
                                onChange={(e) => setSearchTermLocation(e.target.value)}
                                className="pl-8 focus:outline-none w-full"
                              />
                            </div>
                            {filteredLocations.length > 0 ? (
                              filteredLocations.map((location) => (
                                <div
                                  key={location._id}
                                  onClick={() => handleLocationSelect(location)}
                                  className="cursor-pointer hover:bg-gray-200 p-2"
                                >
                                  {location.LocationName}
                                </div>
                              ))
                            ) : (
                              <div className="p-2 text-gray-500">No locations found</div>
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
                            className={`border-b focus:outline-none mb-5 w-full ${errors.CurrentRole ? "border-red-500" : "border-gray-300 focus:border-black"}`}
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
                          <div className="absolute z-50 -mt-4 w-full rounded-md bg-white shadow-xl border max-h-48 overflow-y-auto">
                            <div className="flex items-center border p-2 rounded m-2">
                              <IoMdSearch className="absolute left-5 text-gray-500" />
                              <input
                                type="text"
                                placeholder="Search Current Role"
                                value={searchTermCurrentRole}
                                onChange={(e) => setSearchTermCurrentRole(e.target.value)}
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
                              <div className="p-2 text-gray-500">No roles found</div>
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
                <p className="font-bold text-lg mb-5">
                  Skills Details:
                </p>
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
                    <div className="space-y-2 mb-4 mt-5">
                      {entries.map((entry, index) => (
                        <div key={index} className="flex flex-wrap -mx-2 border p-3 rounded-lg items-center bg-custom-blue text-white">
                          <div className="w-1/3 px-2">{entry.skill}</div>
                          <div className="w-1/3 px-2">{entry.experience}</div>
                          <div className="w-1/3 px-2">{entry.expertise}</div>
                          <div className="w-full flex justify-end space-x-2 -mt-5">
                            <button type="button" onClick={() => handleEdit(index)} className="text-black text-md">
                              <FaEdit />
                            </button>
                            <button type="button" onClick={() => handleDelete(index)} className="text-red-500 text-md">
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
                                className={`bg-custom-blue text-white px-4 py-2 rounded block float-right ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                  className={`bg-custom-blue text-white px-4 py-2 rounded ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                  className={`bg-custom-blue text-white px-4 py-2 rounded ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <div className="mt-7">
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
                          onChange={handleTimezoneChange}
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
                          Availability{" "}
                          <span className="text-red-500">*</span>
                        </h2>
                        {availabilityError && (
                          <p className="text-red-500 text-sm">{availabilityError}</p>
                        )}
                      </div>
                      <Availability
                        times={times}
                        onTimesChange={setTimes}
                        availabilityError={availabilityError}
                        onAvailabilityErrorChange={setAvailabilityError}
                        from={'createTeams'}
                        fromEditTeamFile={fromEditTeamFile}
                        availabilityData={candidate?.contactId?.availability}
                      />
                    </div>
                  </div>
                  <div className="mt-10">
                    {/* preferred interview */}
                    <div className="bg-gray-50 border border-gray-500 text-gray-900 text-sm p-4 rounded-lg">
                      <p className="font-medium">Preferred Interview Duration</p>

                      <ul className="flex mt-3 text-xs font-medium">
                        {fromEditTeamFile ? (
                          ["30", "60", "90", "120"].map((duration) => (
                            <li
                              key={duration}
                              className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${selectedOption === duration ? "bg-gray-700 text-white" : "bg-gray-300"}`}
                              onClick={() => handleOptionClick(duration)}
                            >
                              {duration === "30"
                                ? "30 mins"
                                : duration === "60"
                                  ? "1 Hour"
                                  : duration === "90"
                                    ? "1:30 mins"
                                    : "2 Hours"}
                            </li>
                          ))
                        ) : (
                          <>
                            <li
                              className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${selectedOption === "30" ? "bg-gray-700 text-white" : "bg-gray-300"}`}
                              onClick={() => handleOptionClick("30")}
                            >
                              30 mins
                            </li>
                            <li
                              className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${selectedOption === "60" ? "bg-gray-700 text-white" : "bg-gray-300"}`}
                              onClick={() => handleOptionClick("60")}
                            >
                              1 Hour
                            </li>
                            <li
                              className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${selectedOption === "90" ? "bg-gray-700 text-white" : "bg-gray-300"}`}
                              onClick={() => handleOptionClick("90")}
                            >
                              1:30 mins
                            </li>
                            <li
                              className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${selectedOption === "120" ? "bg-gray-700 text-white" : "bg-gray-300"}`}
                              onClick={() => handleOptionClick("120")}
                            >
                              2 Hours
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                    {preferredDurationError && (
                      <p className="text-red-500 text-sm">{preferredDurationError}</p>
                    )}
                  </div>

                  <div className="footer-buttons flex justify-between">
                    <button onClick={handleBack} className="footer-button">
                      Back
                    </button>
                    <div>
                      {localSource === "team" ? (
                        <button
                          type="submit"
                          className="footer-button bg-custom-blue"
                          onClick={(e) => handleSingleSave(e)}
                        >
                          Save
                        </button>
                      ) : localSource === "createNew" ? (
                            <>
                              {fromEditTeamFile ? (
                                // edit save button
                                <button
                                  type="button"
                                  className="footer-button bg-custom-blue ml-2"
                                  onClick={(e) => handleEditSave(e, "edit team")}
                                >
                                  Save
                                </button>
                              ) : (
                                  // new save button
                                <button
                                  type="button"
                                  className="footer-button bg-custom-blue ml-2"
                                  onClick={(e) => handleSubmit(e, "added to team")}
                                >
                                  Save
                                </button>
                              )}
                            </>
                      ) : (
                        <>
                          <button
                            type="submit"
                            className="footer-button bg-custom-blue"
                            onClick={(e) => handleSubmit(e, "team")}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="footer-button bg-custom-blue ml-2"
                            onClick={(e) => handleSubmit(e, "added to team")}
                          >
                            Save & Add To Team Member
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </>
      )}

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



    </>
  );
};

export default CreateTeams;