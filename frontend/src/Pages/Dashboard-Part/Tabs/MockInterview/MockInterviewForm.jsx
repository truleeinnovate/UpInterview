import { useState, useRef, useEffect, useCallback } from "react";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { ReactComponent as FaPlus } from '../../../../icons/FaPlus.svg';
import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';
// import PopupComponent from "../Interviews/OutsourceOption";
import Cookies from "js-cookie";
// import Candidate2MiniTab from "./Candidate2MiniTab.jsx";
import { useNavigate, useParams } from 'react-router-dom';
import { validatemockForm, getErrorMessage, validatePage1 } from '../../../../utils/mockinterviewValidation.js';
import toast from "react-hot-toast";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { X, User, Users, Trash2, Clock, Calendar } from 'lucide-react';
import { Button } from "../CommonCode-AllTabs/ui/button.jsx";
// import OutsourceOption from "../Interviews/OutsourceOption.jsx";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";


// Helper function to parse custom dateTime format (e.g., "31-03-2025 10:00 PM")
const parseCustomDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return null;
  const [datePart, timePart] = dateTimeStr.split(" ");
  const [day, month, year] = datePart.split("-");
  const formattedDate = `${year}-${month}-${day}T${timePart}:00`; // Convert to ISO-like format
  const date = new Date(formattedDate);
  return isNaN(date.getTime()) ? null : date;
};

// Helper function to format Date to "DD-MM-YYYY HH:MM AM/PM"
const formatToCustomDateTime = (date) => {
  if (!date || isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year} ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
};



const MockSchedulelater = () => {
  const {
    fetchMockInterviewData,
    qualification,
    technologies,
    skills,
    mockinterviewData
  } = useCustomContext();
  const { id } = useParams();
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    skills: [],
    candidateName: "",
    higherQualification: "",
    currentExperience: "",
    technology: "",
    jobDescription: "",
    Role: '',
    rounds: {
      roundTitle: "",
      interviewMode: "",
      duration: "30",
      instructions: "",
      interviewType: "scheduled",
      interviewers: [],
      status: "Pending",
      dateTime: "",
    },
    // status: 'Pending',
  });

  const [candidate, setCandidate] = useState(null);
  const [interviewType, setInterviewType] = useState("scheduled");
  const [combinedDateTime, setCombinedDateTime] = useState("")
  const [scheduledDate, setScheduledDate] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [mockEdit, setmockEdit] = useState(false);


  // skills
  // const [unsavedChanges, setUnsavedChanges] = useState(false);


  const [entries, setEntries] = useState([]);
  const [allSelectedSkills, setAllSelectedSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [teamData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [externalInterviewers, setExternalInterviewers] = useState([]);
  const [roles, setRoles] = useState([])

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;

  const organizationId = tokenPayload?.organizationId;
  const Navigate = useNavigate();

  const [showDropdownRole, setShowDropdownRole] = useState(false);


const toggleDropdownRole = () => {
  setShowDropdownRole(!showDropdownRole);
};

const handleRoleSelect = (role) => {
  setFormData((prevData) => ({
    ...prevData,
    Role: role.roleName,
  }));
  setShowDropdownRole(false);
};

  const handleExternalInterviewerSelect = (interviewers) => {

    // Ensure no duplicates and append new interviewers
    const uniqueInterviewers = interviewers.filter(
      (newInterviewer) => !externalInterviewers.some((i) => i.id === newInterviewer.id)
    );

    // setSelectedInterviewType("external");
    setExternalInterviewers([...externalInterviewers, ...uniqueInterviewers]); // Append new interviewers
  };



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/users/${userId}`
        );

        const allRolesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/rolesdata?organizationId=${organizationId}`);
        const allRoles = allRolesResponse.data;

        console.log("allRoles", allRoles)
        setUserProfile(response.data);

        // console.log("response.data", response.data);
        setRoles(allRoles)

      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchData();
  }, [userId]);


  
  const handleRemoveExternalInterviewer = (interviewerId) => {
    setExternalInterviewers((prev) => {
      const updatedInterviewers = prev.filter((i) => i.id !== interviewerId);

      // Reset selectedInterviewType if no interviewers are left
      if (updatedInterviewers.length === 0 && formData.rounds.interviewers.length === 0) {
        // setSelectedInterviewType(null);
      }

      return updatedInterviewers;
    });
  };

  const handleClearAllInterviewers = () => {

    setExternalInterviewers([]);

  };



  useEffect(() => {
    if (!id && userProfile) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        candidateName: userProfile.Name || "",
        higherQualification: userProfile.HigherQualification || "",
        currentExperience: userProfile.Experience || "",
        technology: userProfile.technology || "",
      }));
    }
  }, [userProfile]);


  useEffect(() => {
    if (id && mockinterviewData.length > 0) {

      const MockEditData = mockinterviewData.find(moc => moc._id === id);

      console.log("MockEditData MockEditData", MockEditData);


      if (MockEditData) {
        setmockEdit(true)
        setFormData({
          skills: MockEditData.skills || [],
          candidateName: MockEditData.candidateName || "",
          higherQualification: MockEditData.higherQualification || "",
          currentExperience: MockEditData.currentExperience || "",
          technology: MockEditData.technology || "",
          jobDescription: MockEditData.jobDescription || "",
          Role: MockEditData.Role || "",
          rounds: {
            roundTitle: MockEditData.rounds?.roundTitle || "",
            interviewMode: MockEditData.rounds?.interviewMode || "",
            duration: MockEditData.rounds?.duration || "30", // Use rounds.duration
            instructions: MockEditData.rounds?.instructions || "",
            interviewers: Array.isArray(MockEditData.rounds?.interviewers) ? MockEditData.rounds.interviewers : [],
            status: MockEditData.rounds?.status || "Pending",
            dateTime: MockEditData.rounds?.dateTime || "",
            interviewType: MockEditData.rounds?.interviewType || "scheduled",
          },
        });
        const updatedEntries = MockEditData?.skills.map((entry, index) =>
          index === editingIndex ? { skill: selectedSkill, experience: selectedExp, expertise: selectedLevel } : entry
        );
        setEntries(updatedEntries);

        setInterviewType(MockEditData.rounds?.interviewType || "scheduled");
     // Change: Parse and set dateTime for editing
     if (MockEditData.rounds?.dateTime) {
      const [startStr, endStr] = MockEditData.rounds.dateTime.split(" - ");
      const startDate = parseCustomDateTime(startStr);
      if (startDate && !isNaN(startDate.getTime())) {
        setScheduledDate(startDate.toISOString().slice(0, 16));
        setStartTime(startDate.toISOString());
        const endDate = endStr ? parseCustomDateTime(`${startStr.split(" ")[0]} ${endStr}`) : null;
        setEndTime(endDate && !isNaN(endDate.getTime()) ? endDate.toISOString() : "");
        setCombinedDateTime(MockEditData.rounds.dateTime);
      }
    }
  }
} else {
  // Change: Set default instant interview time for new form
  updateTimes(formData.rounds.duration);
}
       
      
    
  }, [mockEdit, id]);


  // useEffect(() => {
  //   if (mockEdit && MockEditData.skills) {
  //     const initialSkills = MockEditData.skills || [];
  //     const initialRows = MockEditData.skills.map((skill, index) => ({
  //       skill: skill.skill || "",
  //       experience: MockEditData.SkillExperience?.[index] || "", // Handle missing skill experience
  //       expertise: MockEditData.SkillExpertise?.[index] || "", // Handle missing expertise
  //     }));

  //     // Set the skills data in the form state
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       skills: initialRows,
  //     }));

  //     // Set the initial rows for the UI and selected skills
  //     setEntries(MockEditData.skills || []);
  //     setAllSelectedSkills(initialSkills.map(skill => skill.skill));
  //   }
  // }, [MockEditData]);


  const [errors, setErrors] = useState({});



  const handleChange = (e) => {
    const { name, value } = e.target;
    const errorMessage = getErrorMessage(name, value);
    if (name.startsWith("rounds.")) {
      const roundField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        rounds: { ...prev.rounds, [roundField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };




  const handleSubmit = async (e) => {
    e.preventDefault();


    const { formIsValid, newErrors } = validatemockForm(formData, entries, errors);
    setErrors(newErrors);

    if (!formIsValid) {
      console.log("Form is not valid:", newErrors);
      return;
    }

    try {

      const status = formData.rounds.interviewers.length > 0 ? "Requests Sent" : "Draft";
      // Prepare the payload
      const payload = {
        skills: entries.map((entry) => ({
          skill: entry.skill,
          experience: entry.experience,
          expertise: entry.expertise,
        })),
        Role: formData.Role,
        candidateName: formData.candidateName,
        higherQualification: formData.higherQualification,
        currentExperience: formData.currentExperience,
        technology: formData.technology,
        jobDescription: formData.jobDescription,
        rounds: {
          ...formData.rounds,
          dateTime: combinedDateTime,
          status: status,
        },
        createdById: userId,
        lastModifiedById: userId,
        ownerId: userId,
        tenantId: organizationId,
      };

      // Add additional fields for new interviews
      // if (!mockEdit) {
      //   // payload.status = "Scheduled";
      //   payload.interviewType = InterviewType;

      // }

      // // Add tenant ID if applicable
      // if (organizationId) {
      //   payload.tenantId = organizationId;
      // }

      console.log("Payload:", payload);

      let response;

      if (mockEdit) {
        response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/updateMockInterview/${id}`,
          payload
        );
      } else {
        // Create a new mock interview
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/mockinterview`,
          payload
        );
      }

      console.log(mockEdit ? "Mock updated:" : "Mock created:", response.data);

      // Handle successful response
      if (response?.data) {

        if (formData.rounds.interviewers && formData.rounds.interviewers.length > 0) {


          for (const interviewer of formData.rounds.interviewers) {
            const outsourceRequestData = {
              tenantId: organizationId,
              ownerId: userId,
              scheduledInterviewId: interviewer,
              // interviewerType: selectedInterviewType,
              id: interviewer._id, // Directly passing the interviewer ID
              // status: isInternal ? "accepted" : "inprogress", // Status is already in the main schema
              dateTime: combinedDateTime,
              duration: formData.rounds.duration,
              candidateId: candidate?._id,
              // positionId: position?._id,
              roundId: response.data.savedRound._id,
              requestMessage: "Outsource interview request",
              expiryDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            };

            console.log("Sending outsource request:", outsourceRequestData);

            await axios.post(
              `${process.env.REACT_APP_API_URL}/interviewrequest`,
              outsourceRequestData
            );
          }
        }

        // Reset form data
        setFormData({
          skills: [],
          candidateName: "",
          higherQualification: "",
          currentExperience: "",
          technology: "",
          jobDescription: "",
          Role: "",
          rounds: {
            roundTitle: "",
            interviewMode: "",
            duration: "30",
            instructions: "",
            interviewType: "",
            interviewers: [],
            status: "Pending",
            dateTime: "",
          },
        })

        // if (formData.rounds.interviewType === 'InstantInterview') {
        //   Navigate('/');
        // }


        navigate('/mockinterview');
        await fetchMockInterviewData();
        toast.success(mockEdit ? "Mock Interview updated successfully" : "Candidate saved successfully");
      }
    } catch (error) {
      console.error("Error creating/updating mock interview:", error);
      toast.error(mockEdit ? "Failed to update mock interview" : "Failed to save mock interview");

    }
  };


  const [textareaValue, setTextareaValue] = useState("");

  const handleChangedescription = (event) => {
    const value = event.target.value;
    if (value.length <= 250) {
      setTextareaValue(value);
      event.target.style.height = "auto";
      event.target.style.height = event.target.scrollHeight + "px";
      setFormData({ ...formData, instructions: value });

      setErrors({ ...errors, instructions: "" });
    }
  };
  //for skills

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleOutsideClick = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebarOpen, handleOutsideClick]);

  const [showDropdownQualification, setShowDropdownQualification] = useState(false);

  const toggleDropdownQualification = () => {
    setShowDropdownQualification(!showDropdownQualification);
  };

  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
  };





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

  const handleAddEntry = () => {
    if (editingIndex !== null) {
      const updatedEntries = entries.map((entry, index) =>
        index === editingIndex ? { skill: selectedSkill, experience: selectedExp, expertise: selectedLevel } : entry
      );
      setEntries(updatedEntries);
      setEditingIndex(null);
    } else {
      setEntries([...entries, { skill: selectedSkill, experience: selectedExp, expertise: selectedLevel }]);
      setAllSelectedSkills([...allSelectedSkills, selectedSkill]);
    }
    setErrors((prev) => ({ ...prev, skills: "" }));
    resetForm();
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
    // setUnsavedChanges(true);
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    // setUnsavedChanges(true);
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
  };

  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    // setUnsavedChanges(true);
  }
  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const entry = entries[deleteIndex];
      setAllSelectedSkills(
        allSelectedSkills.filter((skill) => skill !== entry.skills[0])
      );
      setEntries(entries.filter((_, i) => i !== deleteIndex));
      setDeleteIndex(null);
      // setUnsavedChanges(true);
    }
  };


  // date and duration
  const getTodayDate = () => new Date().toISOString().slice(0, 10);

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };


  const calculateEndTime = (startTime, duration) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const durationMinutes = Number(duration);
    let endHour = startHour + Math.floor(durationMinutes / 60);
    let endMinute = startMinute + (durationMinutes % 60);
    if (endMinute >= 60) {
      endHour += Math.floor(endMinute / 60);
      endMinute %= 60;
    }
    if (endHour >= 24) endHour %= 24;
    const formattedEndHour = endHour % 12 || 12;
    const ampm = endHour >= 12 ? "PM" : "AM";
    return `${formattedEndHour}:${endMinute.toString().padStart(2, "0")} ${ampm}`;
  };


  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [endTime, setEndTime] = useState("");


  const [dateTime, setDateTime] = useState("");
  // const [duration, setDuration] = useState("60 minutes");
  const [showPopup, setShowPopup] = useState(false);


  const durationOptions = ["30 minutes", "60 minutes", "90 minutes", "120 minutes"];

  useEffect(() => {
    // Update end time and display default combined date and time
    const calculatedEndTime = calculateEndTime(startTime, formData.duration);
    setEndTime(calculatedEndTime);
    setDateTime(`${formatDate(selectedDate)} ${formatTime(startTime)} - ${calculatedEndTime}`);
  }, [startTime, formData.duration, selectedDate]);

  const handleDateClick = () => {
    setShowPopup(true);
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const hourInt = parseInt(hour);
    const ampm = hourInt >= 12 ? "PM" : "AM";
    const formattedHour = hourInt % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const handleStartTimeChange = (e) => {
    const selectedStartTime = e.target.value;
    setStartTime(selectedStartTime);
    const calculatedEndTime = calculateEndTime(selectedStartTime, formData.duration);
    setEndTime(calculatedEndTime);
  };

  const handleConfirm = () => {
    const calculatedEndTime = calculateEndTime(startTime, formData.duration);
    setEndTime(calculatedEndTime);
    setDateTime(`${formatDate(selectedDate)} ${formatTime(startTime)} - ${calculatedEndTime}`);
    // setShowPopup(false);
  };



  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };


  const handleCancel = () => {
    setUserProfile(false);
    navigate?.('/mockinterview')
  };

  // const [selectedTechnology, setSelectedTechnology] = useState("");
  const [showDropdownTechnology, setShowDropdownTechnology] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleDropdownTechnology = () => {
    setShowDropdownTechnology(!showDropdownTechnology);
  };

  const handleTechnologySelect = (technology) => {
    // setSelectedTechnology(technology.TechnologyMasterName);
    setFormData((prevFormData) => ({
      ...prevFormData,
      technology: technology.TechnologyMasterName,
    }));
    setShowDropdownTechnology(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      technology: "",
    }));
    // setUnsavedChanges(true);
  };


  // const [selectedQualification, setSelectedQualification] = useState("");


  const handleQualificationSelect = (qualification) => {
    // setSelectedQualification(qualification.QualificationName);
    setFormData((prevData) => ({
      ...prevData,
      higherQualification: qualification.QualificationName,
    }));
    setShowDropdownQualification(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      higherQualification: "",
    }));
  };

  const handleNext = () => {
    const { formIsValid, newErrors } = validatePage1(formData, entries); // Validate Page 1
    setErrors(newErrors);

    if (formIsValid) {
      setCurrentPage(2);
    } else {
      console.log("Page 1 validation failed:", newErrors);
    }
  };

  const handleRoundTitleChange = (e) => {
    const selectedTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      roundTitle: selectedTitle,
    }));
  };


 const updateTimes = (newDuration) => {
  let start = null;
  let end = null;

  if (interviewType === "instant") {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15); // Start 15 minutes from now
    start = now;
    end = new Date(now);
    end.setMinutes(end.getMinutes() + Number(newDuration || 30)); // Default to 30 if undefined
  } else if (interviewType === "scheduled" && scheduledDate) {
    start = new Date(scheduledDate); // Parse ISO string from datetime-local
    if (isNaN(start.getTime())) return; // Exit if invalid date
    end = new Date(start);
    end.setMinutes(end.getMinutes() + Number(newDuration || 30)); // Default to 30 if undefined
  }

  if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
    setStartTime(start.toISOString());
    setEndTime(end.toISOString());
    const formattedStart = formatToCustomDateTime(start);
    const formattedEnd = formatToCustomDateTime(end).split(" ")[1]; // Only time part
    setCombinedDateTime(`${formattedStart} - ${formattedEnd}`);
    // Change: Update formData.rounds.dateTime
    setFormData((prev) => ({
      ...prev,
      rounds: { ...prev.rounds, dateTime: `${formattedStart} - ${formattedEnd}` },
    }));
  }
};

  // Update times when mode, date, or duration changes
  useEffect(() => {
    updateTimes(formData.rounds.duration);
  }, [formData.rounds.interviewType, scheduledDate, formData.rounds.duration]);


// Change: Handle interview type change and set default duration
  useEffect(() => {
    if (interviewType === "instant") {
      const date = new Date();
      date.setMinutes(date.getMinutes() + 15);
      setScheduledDate(date.toISOString().slice(0, 16));
      setFormData((prev) => ({
        ...prev,
        rounds: { ...prev.rounds, interviewType: "instant", duration: "30" },
      }));
    }
  }, [interviewType]);

  console.log("role data", formData.Role);
  

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-lg w-full flex flex-col">
        {/* Modal Header */}
        <div className="mt-4 mb-4">

          <h2 className="text-2xl font-semibold px-[13%] sm:mt-5 sm:mb-2 sm:text-lg sm:px-[5%] md:mt-6 md:mb-2 md:text-xl md:px-[5%]">
            Schedule Mock Interview
          </h2>

        </div>

        <div className="px-[13%] sm:px-[5%] md:px-[5%]">
          {/* Content */}
          <div className="bg-white rounded-lg shadow-md border">
            <div className="flex justify-between items-center px-5 pt-4">
              <h2 className="text-lg font-semibold sm:text-md">{currentPage === 1 ? "Candidate Details:" : "Interview Details:"}</h2>
            </div>

            <div className="px-6 pt-3">
              <form className="space-y-5 mb-5" >
                {/* onSubmit={handleSubmit} */}
                {currentPage === 1 && (


                  <>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                      {/* name */}
                      <div>

                        <label
                          htmlFor="CandidateName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Name <span className="text-red-500">*</span>
                        </label>

                        <div className="flex-grow">
                          <input
                            value={formData.candidateName}
                            onChange={handleChange}
                            name="candidateName"
                            type="text"
                            id="CandidateName"
                            readOnly
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.candidateName ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                              }`}
                          />
                          {errors.candidateName && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.candidateName}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Higher Qualification */}
                      <div >

                        <label
                          htmlFor="higherQualification"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Higher Qualification{" "}
                          <span className="text-red-500">*</span>
                        </label>


                        <div className=" relative">
                          <input
                            value={formData.higherQualification}
                            onClick={toggleDropdownQualification}
                            name="higherQualification"
                            type="text"
                            id="higherQualification"
                            readOnly
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.higherQualification ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                              }`}
                          />

                          {errors.higherQualification && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.higherQualification}
                            </p>
                          )}


                          {showDropdownQualification && (
                            <div className="absolute z-50 w-full bg-white shadow-md rounded-md mt-1 max-h-40 overflow-y-auto">
                              {qualification.map((qualification, index) => (
                                <div
                                  key={index}
                                  className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleQualificationSelect(qualification)}
                                >
                                  {qualification.QualificationName}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Technology and Current Experience */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                      {/* Technology */}
                      <div >

                        <label
                          htmlFor="technology"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Technology <span className="text-red-500">*</span>
                        </label>

                        <div className="flex-grow relative">
                          <div className="relative">

                            <input
                              value={formData.technology}
                              onClick={toggleDropdownTechnology}
                              name="technology"
                              type="text"
                              id="Technology"
                              readOnly

                              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.technology ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                }`}
                            />
                            {errors.technology && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.technology}
                              </p>
                            )}
                            {/* <div
                      className="absolute right-0 top-0"
                      onClick={toggleDropdownTechnology}
                    >
                      <MdArrowDropDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
                    </div> */}
                          </div>
                          {showDropdownTechnology && (
                            <div className="absolute z-50 w-full bg-white shadow-md rounded-md mt-1 max-h-40 overflow-y-auto">
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

                      {/* Current Experience */}
                      <div >
                        <div>
                          <label
                            htmlFor="currentExperience"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Current Experience <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <div className="flex-grow">
                          <input
                            type="number"
                            name="currentExperience"
                            value={formData.currentExperience}
                            onChange={handleChange}
                            id="Experience"
                            min="1"
                            max="15"
                            autoComplete="off"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.currentExperience ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                              }`}
                          />
                          {errors.currentExperience && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.currentExperience}
                            </p>
                          )}
                        </div>
                      </div>


                      {/* Current Role */}
                      <div>
                        <div>
                          <label
                            htmlFor="Role"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Role <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <div className="flex-grow relative">
                          <input
                            value={formData.Role}
                            onClick={toggleDropdownRole}
                            name="Role"
                            type="text"
                            id="Role"
                            readOnly
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.Role ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                          />
                          {errors.Role && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.Role}
                            </p>
                          )}
                          {showDropdownRole && (
                            <div className="absolute z-50 w-full bg-white shadow-md rounded-md mt-1 max-h-40 overflow-y-auto">
                              {roles.map((role, index) => (
                                <div
                                  key={index}
                                  className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleRoleSelect(role)}
                                >
                                  {role.roleName}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>



                    </div>

                    {/* <hr className="border-t border-gray-300 my-5" /> */}
                    <div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center mb-2">
                          <label htmlFor="Skills" className="text-sm font-medium text-gray-900" >
                            Skills
                            {/* <span className="text-red-500">*</span> */}
                          </label>
                        </div>
                        {/* skills */}


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

                      <div className="space-y-2 mb-4 mt-5">
                        {entries.map((entry, index,) => (
                          <div key={index} className="flex flex-wrap -mx-2 border p-3 rounded-lg items-center bg-toggle-bg">
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

                      {
                        isModalOpen && (
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
                                            {skills.length > 0 ? (
                                              skills.map(skill => (
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
                        )
                      }

                      {
                        deleteIndex !== null && (
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
                        )
                      }
                    </div>

                    {/* Job Responsibilities */}
                    <div >

                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Description
                      </label>

                      <textarea
                        onChange={handleChange}
                        name="jobDescription"
                        id="jobDescription"
                        value={formData.jobDescription}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none `}
                        rows={6}
                        placeholder="This interview template is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."

                      ></textarea>
                    </div>

                    <div className="text-center text-sm p-2">(OR)</div>

                    {/* Resume */}
                    <div className="w-full  flex justify-center">
                      <div className="w-full ms-[40%] flex items-center justify-center gap-5 ">

                        <label
                          htmlFor="fileUpload"
                          className="text-sm font-medium text-gray-900"
                        >
                          Resume
                        </label>

                        <div className="flex-grow">
                          <div className="flex items-center mt-3">
                            <button
                              onClick={() => document.getElementById('fileUpload').click()}
                              className="bg-custom-blue text-white px-4 py-1 rounded cursor-pointer"
                              type="button"
                            >
                              Upload File
                            </button>
                            <input
                              type="file"
                              id="fileUpload"
                              style={{ display: "none" }}
                              onChange={handleFileChange}
                            />
                            {fileName && (
                              <span
                                className="text-custom-blue ml-3"
                                style={{ width: "300px" }}
                              >
                                {fileName}
                              </span>
                            )}
                            {fileName && (
                              <button
                                onClick={handleRemoveFile}
                                className="text-gray-500 text-sm ml-5"
                              >
                                <X />
                              </button>
                            )}
                          </div>
                          {errors.Resume && (
                            <p className="text-red-500 text-sm">{errors.Resume}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Interview Details */}
                {currentPage === 2 && (
                  <>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">

                      <div>
                        <label htmlFor="rounds.roundTitle" className="block text-sm font-medium text-gray-700">
                          Round Title *
                        </label>

                        <input
                          id="rounds.roundTitle"
                          name="rounds.roundTitle"
                          value={formData.rounds.roundTitle}
                          onChange={handleChange}
                          className={`mt-1 block w-full border ${errors["rounds.roundTitle"] ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          required
                        />

                        {errors["rounds.roundTitle"] && (
                          <p className="mt-1 text-sm text-red-500">{errors.roundTitle}</p>
                        )}
                      </div>


                      <div>
                        <label htmlFor="rounds.interviewMode" className="block text-sm font-medium text-gray-700">
                          Interview Mode *
                        </label>
                        <select
                          id="rounds.interviewMode"
                          name="rounds.interviewMode"
                          value={formData.rounds.interviewMode}
                          onChange={(event) => {
                            const { name, value } = event.target;
                      
                            setFormData((prevData) => ({
                              ...prevData,
                              rounds: {
                                ...prevData.rounds,
                                [name.split(".")[1]]: value, // Extracts "interviewMode"
                              },
                            }));
                      
                            // Clear error if a valid selection is made
                            setErrors((prevErrors) => ({
                              ...prevErrors,
                              [name]: value ? "" : "This field is required",
                            }));
                          }}
                          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${errors.interviewMode ? 'border-red-500' : 'border-gray-300'
                            } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
                          required
                        // disabled={roundTitle === "Assessment"}
                        >
                          <option value="">Select Interview Mode</option>
                          <option value="Face to Face">Face to Face</option>
                          <option value="Virtual">Virtual</option>
                        </select>
                        {errors["rounds.interviewMode"] && (
                          <p className="mt-1 text-sm text-red-500">{errors["rounds.interviewMode"]}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">


                      {/* Status */}
                      {/* <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                          Status *
                                        </label>
                                        <div className="mt-1 flex items-center">
                                          <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                            className={`block w-full pl-3 pr-10 py-2 text-base border ${errors.status ? 'border-red-500' : 'border-gray-300'
                                              } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
                                            required
                                          >
                                            <option value="In Progress">In Progress</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                          </select>
                                          <div className="ml-2">
                                            <StatusBadge status={formData.status} size="sm" />
                                          </div>
                                        </div>
                                        {errors.status && (
                                          <p className="mt-1 text-sm text-red-500">{errors.status}</p>
                                        )}
                                      </div> */}


                    </div>

                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interview Scheduling
                        </label>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                          <button
                            type="button"
                            onClick={() => { setInterviewType("instant"); setFormData(prev => ({ ...prev, rounds: { ...prev.rounds, interviewType: "instant" } })); }}
                            className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${interviewType === "instant"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                              }`}
                          >
                            <Clock className={`h-6 w-6 ${interviewType === "instant" ? "text-blue-500" : "text-gray-400"}`} />
                            <span className={`mt-2 font-medium ${interviewType === "instant" ? "text-blue-700" : "text-gray-900"}`}>
                              Instant Interview
                            </span>
                            <span className="mt-1 text-sm text-gray-500">Starts in 15 minutes</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => { setInterviewType("scheduled"); setFormData(prev => ({ ...prev, rounds: { ...prev.rounds, interviewType: "scheduled" } })); }}
                            className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${interviewType === "scheduled"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                              }`}
                          >
                            <Calendar className={`h-6 w-6 ${interviewType === "scheduled" ? "text-blue-500" : "text-gray-400"}`} />
                            <span className={`mt-2 font-medium ${interviewType === "scheduled" ? "text-blue-700" : "text-gray-900"}`}>
                              Schedule for Later
                            </span>
                            <span className="mt-1 text-sm text-gray-500">Pick date & time</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-2">
                          {interviewType === "scheduled" && (
                            <div className="mt-4">
                              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                                Scheduled Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                id="scheduledDate"
                                name="scheduledDate"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          )}

                          <div className="mt-4">
                            <label htmlFor="rounds.duration" className="block text-sm font-medium text-gray-700">
                              Duration (minutes)
                            </label>
                            <select
                              id="rounds.duration"
                              name="rounds.duration"
                              value={formData.rounds.duration}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="30">30 min</option>
                              <option value="45">45 min</option>
                              <option value="60">60 min</option>
                              <option value="90">90 min</option>
                              <option value="120">120 min</option>
                            </select>
                          </div>
                        </div>

                        {interviewType === "instant" && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-md">
                            <div className="flex items-center">
                              <Clock className="h-5 w-5 text-blue-500 mr-2" />
                              <p className="text-sm text-blue-700">
                                Interview will start at{" "}
                                <span className="font-medium">
                                  {new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>{" "}
                                and end at{" "}
                                <span className="font-medium">
                                  {new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}

                        {interviewType === "scheduled" && scheduledDate && (
                          <div className="mt-4 p-4 bg-green-50 rounded-md">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 text-green-500 mr-2" />
                              <p className="text-sm text-green-700">
                                Scheduled from{" "}
                                <span className="font-medium">
                                  {formatToCustomDateTime(new Date(startTime))}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                  {formatToCustomDateTime(new Date(endTime))}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>


                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Interviewers</label>
                        <div className="flex space-x-2">

                          <Button
                            type="button"
                            onClick={toggleSidebar}
                            variant="outline"
                            size="sm"

                          >
                            <User className="h-4 w-4 mr-1 text-orange-600" />
                            Select Outsourced
                          </Button>
                        </div>
                      </div>


                      <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                        {formData.rounds?.interviewers?.length > 0 ? (
                          <p className="text-sm text-gray-500 text-center">No interviewers selected</p>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-700">


                                  <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">
                                    Outsourced
                                  </span>

                                </span>
                              </div>
                              {formData.rounds?.interviewers?.length > 0 && (
                                <button
                                  type="button"
                                  // onClick={handleClearAllInterviewers}
                                  className="text-sm text-red-600 hover:text-red-800 flex items-center"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Clear All
                                </button>
                              )}
                            </div>




                            {formData?.rounds?.interviewers && (
                              <div>
                                <h4 className="text-xs font-medium text-gray-500 mb-2">Outsourced Interviewers</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {/* {externalInterviewers.map((interviewer) => (
                                                      <div key={interviewer.id} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-md p-2">
                                                        <div className="flex items-center">
                                                          <span className="ml-2 text-sm text-orange-800 truncate">{interviewer.name} (Outsourced)</span>
                                                        </div>
                                                        <button
                                                          type="button"
                                                          onClick={() => handleRemoveExternalInterviewer(interviewer.id)}
                                                          className="text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-100"
                                                          title="Remove interviewer"
                                                        >
                                                          <X className="h-4 w-4" />
                                                        </button>
                                                      </div>
                                                    ))} */}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {errors.rounds?.interviewers && <p className="text-red-500 text-sm -mt-5">{errors.rounds.interviewers}</p>}

                    </>

                    <div>
                      <label htmlFor="rounds.instructions" className="block text-sm font-medium text-gray-700">
                        Instructions
                      </label>
                      <textarea
                        id="rounds.instructions"
                        name="rounds.instructions"
                        rows={3}
                        value={formData.rounds.instructions}
                        onChange={handleChange}
                        placeholder="This interview template is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."
                
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {/* <p className="mt-1 text-sm text-gray-500">
                        Add Instructions after the interview round is completed
                      </p> */}
                    </div>





                
                  {/* <div>
                    <label
                      htmlFor="Interviewer"
                     className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Interviewer <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex-grow">
                      <div
                        className="w-full px-3 py-5 border rounded-md focus:outline-none"
                     
                        onClick={toggleSidebar}
                      ></div>
                      {errors.interviewer && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.interviewer}
                        </p>
                      )}
                    </div>
                  </div> */}
               
              
                {/* <div >
                
                    <label
                      htmlFor="Instructions"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Instructions <span className="text-red-500">*</span>
                    </label>
                 
                  <div className="flex-grow">
                    <textarea
                      value={textareaValue}
                      onChange={handleChangedescription}
                      name="instructions"
                      id="instructions"
                      rows={5}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none  ${errors.instructions
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                        }`}
                         placeholder="This interview template is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."
                    ></textarea>
                    {errors.instructions && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.instructions}
                      </p>
                    )}
                    {textareaValue.length > 0 && (
                      <p className="text-gray-600 text-xs float-right -mt-4">
                        {textareaValue.length}/250
                      </p>
                    )}
                  </div>
                </div>  */}


                  </>
                )}


              </form>
            </div>
          </div>

          {/* Footer  */}
          {
            currentPage === 1 ?
              <div className="flex justify-end gap-4 mt-5 mb-4">
                <button
                  className="border border-custom-blue p-3 rounded py-1"
                  onClick={() => navigate('/mockinterview')}
                >
                  Cancel
                </button>
                <button
                  className="bg-custom-blue text-white p-3 rounded py-1"
                  onClick={handleNext}
                >
                  Save & Next
                </button>
              </div>

              :

              <div className="flex justify-end gap-4 mt-5 mb-4 ">
                <button
                  className="border border-custom-blue mt-3 p-3 rounded py-1 mr-5"
                  onClick={() => setCurrentPage(1)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-custom-blue text-white mt-3 p-3 rounded py-1"
                  onClick={(e) => handleSubmit(e)}

                >
                  {formData.rounds.interviewType === 'InstantInterview' ? 'Save & Schedule' : 'Save'}
                </button>
              </div>
          }


          {/* {showPopup && <PopupComponent onClose={handlePopupClose} />} */}

          {/* showing date and time */}
          {
            showPopup && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-5 rounded-lg shadow-lg w-1/3 relative">
                  <div className="mb-4">
                    <label className="block mb-2 font-bold">Select Date</label>
                    <input
                      type="date"
                      className="border p-2 w-full"
                      min={getTodayDate()}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      value={selectedDate}

                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 font-bold">Start Time</label>
                    <input
                      type="time"
                      className="border p-2 w-full"
                      onChange={handleStartTimeChange}
                      value={startTime}


                    />
                  </div>
                  {selectedDate && startTime && endTime && (
                    <button
                      onClick={handleConfirm}
                      className="px-4 py-2 bg-custom-blue text-white rounded float-right"
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            )
          }
          {/* {
            sidebarOpen && (
              <>
                <OutsourceOption
                  onClose={() => setSidebarOpen(false)}
                  dateTime={combinedDateTime}
                  candidateData1={candidate}
                  onProceed={handleExternalInterviewerSelect}
                />
              </>
            )
          } */}



        </div >

      </div>
    </div >
  );
};

export default MockSchedulelater;
