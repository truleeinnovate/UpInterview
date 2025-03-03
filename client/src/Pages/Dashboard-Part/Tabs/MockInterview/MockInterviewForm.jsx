import { useState, useRef, useEffect, useCallback } from "react";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { ReactComponent as FaPlus } from '../../../../icons/FaPlus.svg';
import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';
// import PopupComponent from "../Interviews/OutsourceOption";
import Sidebar from "../Interviews/OutsourceOption.jsx";
import { fetchMasterData } from "../../../../utils/fetchMasterData.js";
import Cookies from "js-cookie";
import { AiOutlineClose } from "react-icons/ai";
// import Candidate2MiniTab from "./Candidate2MiniTab.jsx";
import { ReactComponent as MdArrowDropDown } from "../../../../icons/MdArrowDropDown.svg";
import { useNavigate } from 'react-router-dom';
import { validatemockForm, getErrorMessage } from '../../../../utils/mockinterviewValidation.js';
import toast from "react-hot-toast";
import { useCustomContext } from "../../../../Context/Contextfetch.js";



const MockSchedulelater = ({ onClose, onOutsideClick, InterviewType, mockEdit, MockEditData }) => {
  const {
    fetchMockInterviewData,
    qualification,
    technologies,
    skills
  } = useCustomContext();

  const [formData, setFormData] = useState({
    title: "",
    skills: [],
    dateTime: "",
    interviewer: "",
    duration: "60 minutes",
    instructions: "",
    candidateName: "",
    higherQualification: "",
    currentExperience: "",
    technology: "",
    jobResponsibilities: "",
  });

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (userProfile) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        candidateName: userProfile.Name,
        // higherQualification: userProfile.HigherQualification,
        // currentExperience: userProfile.Experience,
        // technology: userProfile.Skills,
      }));
    }
  }, [userProfile]);


  useEffect(() => {
    if (mockEdit) {
      setFormData({
        title: MockEditData.title || "",
        // interviewer: MockEditData.interviewer || "",
        currentExperience: MockEditData.currentExperience || "",
        jobResponsibilities: MockEditData.jobResponsibilities || "",
      });
      setTextareaValue(MockEditData.instructions || "");
      setDateTime(MockEditData.dateTime || "");
      setSelectedTechnology(MockEditData.technology || "");
      setSelectedQualification(MockEditData.higherQualification || "");
      setDuration(MockEditData.duration || "");
      setSelectedDate(MockEditData.dateTime?.split(" ")[0] || "");
      setStartTime(MockEditData.dateTime?.split(" ")[1] || "");
    }
  }, [mockEdit, MockEditData]);


  useEffect(() => {
    if (mockEdit && MockEditData.skills) {
      const initialSkills = MockEditData.skills || [];
      const initialRows = MockEditData.skills.map((skill, index) => ({
        skill: skill.skill || "",
        experience: MockEditData.SkillExperience?.[index] || "", // Handle missing skill experience
        expertise: MockEditData.SkillExpertise?.[index] || "", // Handle missing expertise
      }));

      // Set the skills data in the form state
      setFormData((prevFormData) => ({
        ...prevFormData,
        skills: initialRows,
      }));

      // Set the initial rows for the UI and selected skills
      setEntries(MockEditData.skills || []);
      setAllSelectedSkills(initialSkills.map(skill => skill.skill));
    }
  }, [MockEditData]);

  const userId = Cookies.get("userId");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/users/${userId}`
        );
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const errorMessage = getErrorMessage(name, value);
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: errorMessage });
  };
  const organizationId = Cookies.get("organizationId");
  const Navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();


    const { formIsValid, newErrors } = validatemockForm(
      formData,
      entries,
      errors
    );
    setErrors(newErrors);

    if (!formIsValid) {
      console.log("Form is not valid:", newErrors);
      return;
    }

    try {
      // Prepare the payload
      const payload = {
        skills: entries.map((entry) => ({
          skill: entry.skill,
          experience: entry.experience,
          expertise: entry.expertise,
        })),
        title: formData.title,
        interviewer: "", // Placeholder for interviewer
        candidateName: formData.candidateName,
        higherQualification: selectedQualification,
        currentExperience: formData.currentExperience,
        technology: selectedTechnology,
        jobResponsibilities: formData.jobResponsibilities,
        dateTime: dateTime,
        duration: duration,
        instructions: textareaValue,
        createdById: userId,
        lastModifiedById: userId,
        ownerId: userId,
      };

      // Add additional fields for new interviews
      if (!mockEdit) {
        payload.status = "Scheduled";
        payload.interviewType = InterviewType;

      }

      // Add tenant ID if applicable
      if (organizationId) {
        payload.tenantId = organizationId;
      }

      console.log("Payload:", payload);

      let response;

      if (mockEdit) {
        response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/updateMockInterview/${MockEditData._id}`,
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

        // Reset form data
        setFormData({
          title: "",
          dateTime: "",
          candidateName: "",
          higherQualification: "",
          currentExperience: "",
          technology: "",
          duration: "",
          instructions: "",
          status: "",
        });

        if (InterviewType === 'InstantInterview') {
          Navigate('/');
        }
        onClose?.();
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

  const [showDropdownQualification, setShowDropdownQualification] =
    useState(false);

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


  // skills
  const [unsavedChanges, setUnsavedChanges] = useState(false);
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

  const handleAddEntry = () => {
    if (editingIndex !== null) {
      // Edit the existing entry
      const updatedEntries = entries.map((entry, index) =>
        index === editingIndex
          ? {
            skill: selectedSkill, // Use 'skill' instead of 'skills'
            experience: selectedExp,
            expertise: selectedLevel,
          }
          : entry
      );
      setEntries(updatedEntries);
      setEditingIndex(null);
      setAllSelectedSkills([selectedSkill]);
    } else {
      // Add a new entry
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

    // Reset errors and form state
    setErrors((prevErrors) => ({
      ...prevErrors,
      skills: "",
    }));
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
    setUnsavedChanges(true);
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setUnsavedChanges(true);
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
  };

  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    setUnsavedChanges(true);
  }
  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const entry = entries[deleteIndex];
      setAllSelectedSkills(
        allSelectedSkills.filter((skill) => skill !== entry.skills[0])
      );
      setEntries(entries.filter((_, i) => i !== deleteIndex));
      setDeleteIndex(null);
      setUnsavedChanges(true);
    }
  };


  // date and duration
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };


  const calculateEndTime = (startTime, duration) => {
    const [startHour, startMinute] = startTime.split(":").map(Number); // Ensure parsing works with HH:mm format
    const durationMinutes = parseInt(duration.split(" ")[0]);

    let endHour = startHour + Math.floor(durationMinutes / 60);
    let endMinute = startMinute + (durationMinutes % 60);

    if (endMinute >= 60) {
      endHour += Math.floor(endMinute / 60);
      endMinute %= 60;
    }

    if (endHour >= 24) {
      endHour %= 24;
    }

    const formattedEndHour = endHour % 12 || 12;
    const ampm = endHour >= 12 ? "PM" : "AM";
    const formattedEndMinute = endMinute.toString().padStart(2, "0");

    return `${formattedEndHour}:${formattedEndMinute} ${ampm}`;
  };


  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState(getCurrentTime());
  const [endTime, setEndTime] = useState(calculateEndTime(getCurrentTime(), "60 minutes"));
  const [dateTime, setDateTime] = useState("");
  const [duration, setDuration] = useState("60 minutes");
  const [showPopup, setShowPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const durationOptions = ["30 minutes", "60 minutes", "90 minutes", "120 minutes"];

  useEffect(() => {
    // Update end time and display default combined date and time
    const calculatedEndTime = calculateEndTime(startTime, duration);
    setEndTime(calculatedEndTime);
    setDateTime(`${formatDate(selectedDate)} ${formatTime(startTime)} - ${calculatedEndTime}`);
  }, [startTime, duration, selectedDate]);

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
    const calculatedEndTime = calculateEndTime(selectedStartTime, duration);
    setEndTime(calculatedEndTime);
  };

  const handleConfirm = () => {
    const calculatedEndTime = calculateEndTime(startTime, duration);
    setEndTime(calculatedEndTime);
    setDateTime(`${formatDate(selectedDate)} ${formatTime(startTime)} - ${calculatedEndTime}`);
    setShowPopup(false);
  };


  const handleDurationSelect = (selectedDuration) => {
    setDuration(selectedDuration);
    const calculatedEndTime = calculateEndTime(startTime, selectedDuration);
    setEndTime(calculatedEndTime);
    setDateTime(`${formatDate(selectedDate)} ${formatTime(startTime)} - ${calculatedEndTime}`);
    setShowDropdown(false);
  };


  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };


  const handlecloseview = () => {
    setUserProfile(false);
  };

  const [selectedTechnology, setSelectedTechnology] = useState("");
  const [showDropdownTechnology, setShowDropdownTechnology] = useState(false);

  const toggleDropdownTechnology = () => {
    setShowDropdownTechnology(!showDropdownTechnology);
  };

  const handleTechnologySelect = (technology) => {
    setSelectedTechnology(technology.TechnologyMasterName);
    setFormData((prevFormData) => ({
      ...prevFormData,
      technology: technology.TechnologyMasterName,
    }));
    setShowDropdownTechnology(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      technology: "",
    }));
    setUnsavedChanges(true);
  };


  const [selectedQualification, setSelectedQualification] = useState("");


  const handleQualificationSelect = (qualification) => {
    setSelectedQualification(qualification.QualificationName);
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




  return (
    <div>
      <div>
        <div className="fixed bg-white w-full border-b -mt-3 pt-2 pb-2 z-40">
          <div className="mx-8 flex justify-between items-center">
            <p className="text-2xl">
              <span className="text-black font-semibold cursor-pointer">
                Schedule Mock Interview
              </span>
            </p>
          </div>
        </div>
        {/* Content */}
        <div className="fixed top-14 bottom-14 overflow-auto p-5 w-full mx-5">
          <form onSubmit={handleSubmit}>
            <p className="font-semibold text-lg mt-8">Candidate Details:</p>
            <div className="flex gap-5 mb-5 mt-5">
              {/* name */}
              <div className="flex gap-5  w-[50%]">
                <div>
                  <label
                    htmlFor="CandidateName"
                    className="block mb-5 text-sm font-medium text-gray-900 dark:text-black w-36"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <input
                    value={formData.candidateName}
                    onChange={handleChange}
                    name="candidateName"
                    type="text"
                    id="CandidateName"
                    readOnly
                    className={`border-b focus:outline-none mb-5 w-full ${errors.candidateName
                      ? "border-red-500"
                      : "border-gray-300 "
                      }`}
                  />
                  {errors.candidateName && (
                    <p className="text-red-500 text-sm -mt-4">
                      {errors.candidateName}
                    </p>
                  )}
                </div>
              </div>
              {/* Higher Qualification */}
              <div className="flex gap-5 w-[50%]">
                <div>
                  <label
                    htmlFor="HigherQualification"
                    className="block text-sm font-medium mb-5 leading-6 text-gray-900 dark:text-black w-36"
                  >
                    Higher Qualification{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className=" relative flex-grow">
                  <div className=" relative">

                    <input
                      value={selectedQualification}
                      onClick={toggleDropdownQualification}
                      name="higherQualification"
                      type="text"
                      id="higherQualification"
                      readOnly
                      className={`border-b focus:outline-none mb-5 w-full ${errors.higherQualification
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                        }`}
                    />
                    {errors.higherQualification && (
                      <p className="text-red-500 text-sm -mt-5">
                        {errors.higherQualification}
                      </p>
                    )}
                    <div
                      className="absolute right-0 top-0"
                      onClick={toggleDropdownQualification}
                    >
                      <MdArrowDropDown className="text-lg  text-gray-500 mt-1 cursor-pointer" />
                    </div>
                  </div>
                  {showDropdownQualification && (
                    <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md h-72 overflow-y-scroll bg-white shadow-lg">
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
            <div className="flex mb-5 gap-5">
              {/* Technology */}
              <div className="flex gap-5 w-[50%]">
                <div>
                  <label
                    htmlFor="Technology"
                    className="block mb-5 text-sm font-medium text-gray-900 dark:text-black w-36"
                  >
                    Technology <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow relative">
                  <div className="relative">

                    <input
                      value={selectedTechnology}
                      onClick={toggleDropdownTechnology}
                      name="technology"
                      type="text"
                      id="Technology"
                      readOnly
                      className={`border-b focus:outline-none mb-5 w-full ${errors.technology
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                        }`}
                    />
                    {errors.technology && (
                      <p className="text-red-500 text-sm -mt-5">
                        {errors.technology}
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

              {/* Current Experience */}
              <div className="flex gap-5 w-[50%]">
                <div>
                  <label
                    htmlFor="currentExperience"
                    className="block text-sm mb-5 font-medium leading-6 text-gray-900 dark:text-black w-36"
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
                    className={`border-b focus:outline-none mb-5 w-full ${errors.currentExperience
                      ? "border-red-500"
                      : "border-gray-300 focus:border-black"
                      }`}
                  />
                  {errors.currentExperience && (
                    <p className="text-red-500 text-sm -mt-5">
                      {errors.currentExperience}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-t border-gray-300 my-5" />

            <p className="font-semibold text-lg mb-5">
              Skills Details:
            </p>
            {/* skills */}
            <div>
              <div className="flex justify-end">
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
              </div>
            </div>

            {/* Job Responsibilities */}
            <div className="flex gap-5 mb-5">
              <div>
                <label className="block mb-2 text-md font-medium text-gray-900 dark:text-black w-36">
                  Job Responsibilities
                </label>
              </div>
              <textarea
                onChange={handleChange}
                name="jobResponsibilities"
                id="jobResponsibilities"
                value={formData.jobResponsibilities}
                className="border rounded-md p-2 focus:outline-none mb-5 w-full"
                rows="7"
              ></textarea>
            </div>

            <div className="text-center text-sm p-2">(OR)</div>

            {/* Resume */}
            <div className="flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="fileUpload"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                >
                  Resume
                </label>
              </div>
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
                      <AiOutlineClose />
                    </button>
                  )}
                </div>
                {errors.Resume && (
                  <p className="text-red-500 text-sm">{errors.Resume}</p>
                )}
              </div>
            </div>

            <hr className="border-t border-gray-300 my-5" />

            {/* Interview Details */}
            <p className="font-semibold text-lg">Interview Details:</p>

            <div className="flex gap-5 mb-5 mt-5">
              {/* Title */}
              <div className="flex gap-5 w-[50%]">
                <div>
                  <label
                    htmlFor="Title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                  >
                    Interview Title<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <input
                    value={formData.title}
                    onChange={handleChange}
                    name="title"
                    type="text"
                    id="title"
                    className={`border-b focus:outline-none mb-5 w-full ${errors.title
                      ? "border-red-500"
                      : "border-gray-300 focus:border-black"
                      }`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm -mt-5">
                      {errors.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex w-[50%] gap-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <input
                    type="text"
                    readOnly
                    value={dateTime || ""}
                    onClick={handleDateClick}
                    className="border-b w-full focus:outline-none cursor-pointer"
                  /></div>
              </div>
            </div>

            <div className="flex gap-5 mb-5 mt-5">
              {/* Duration */}
              <div className="flex  w-[50%] gap-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">
                    Duration <span className="text-red-500">*</span>
                  </label></div>
                <div className="flex-grow relative">
                  <input
                    type="text"
                    value={duration}
                    readOnly
                    className="border-b w-full focus:outline-none cursor-pointer"
                    onClick={toggleDropdown}
                  />
                  <div
                    className="absolute right-0 top-0"
                    onClick={toggleDropdown}
                  >
                    <MdArrowDropDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
                  </div>

                  {showDropdown && (
                    <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow-lg">
                      {durationOptions.map((option) => (
                        <div
                          key={option}
                          className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleDurationSelect(option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>


              {/*  Add Interviews */}
              <div className="flex gap-5 w-[50%]">
                <label
                  htmlFor="Interviewer"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                >
                  Interviewer <span className="text-red-500">*</span>
                </label>
                <div className="relative flex-grow">
                  <div
                    className="border-b border-gray-300 focus:border-black focus:outline-none min-h-6 h-auto mb-5 w-full relative"
                    // onClick={handleAddInterviewClick}
                    onClick={toggleSidebar}
                  ></div>
                  {errors.interviewer && (
                    <p className="text-red-500 text-sm -mt-5">
                      {errors.interviewer}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Description/Instruction */}
            <div className="flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="Instructions"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                >
                  Instructions <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex-grow">
                <textarea
                  value={textareaValue}
                  onChange={handleChangedescription}
                  name="instructions"
                  id="instructions"
                  rows={5}
                  className={`border rounded-md p-2 focus:outline-none mb-5 w-full ${errors.instructions
                    ? "border-red-500"
                    : "border-gray-300 focus:border-black"
                    }`}
                ></textarea>
                {errors.instructions && (
                  <p className="text-red-500 text-sm -mt-6">
                    {errors.instructions}
                  </p>
                )}
                {textareaValue.length > 0 && (
                  <p className="text-gray-600 text-xs float-right -mt-4">
                    {textareaValue.length}/250
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="footer-buttons flex justify-end">
              <button
                className="border border-custom-blue mt-3 p-3 rounded py-1 mr-5"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-custom-blue text-white mt-3 p-3 rounded py-1"
                onClick={(e) => handleSubmit(e)}

              >
                {InterviewType === 'InstantInterview' ? 'Save & Schedule' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div >

      {/* {showPopup && <PopupComponent onClose={handlePopupClose} />} */}
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
      {
        sidebarOpen && (
          <>
            <Sidebar
              onClose={closeSidebar}
              onOutsideClick={handleOutsideClick}
            />
          </>
        )
      }
    </div >
  );
};

export default MockSchedulelater;
