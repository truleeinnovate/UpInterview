import React, { useState, useEffect, useRef } from "react";
import { MdArrowDropDown, MdUpdate } from "react-icons/md";
import { ImCancelCircle } from "react-icons/im";
import { GiCancel } from "react-icons/gi";
import { IoIosCopy } from "react-icons/io";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { FaSearch } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import moment from 'moment-timezone';
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import TimezoneSelect from 'react-timezone-select';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';
import { validateSteps } from '../../utils/LoginValidation';
import { useCustomContext } from "../../Context/Contextfetch";
import { fetchMasterData } from '../../utils/fetchMasterData';
import { TailSpin } from "react-loader-spinner";
import { FaArrowRightLong } from "react-icons/fa6";
import noImage from '../Dashboard-Part/Images/no-photo.png';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { IoPersonOutline } from "react-icons/io5";

const FooterButtons = ({ onNext, onPrev, currentStep, isFreelancer }) => {
  return (
    <div className="flex justify-between space-x-3 mt-4 mb-4 sm:text-sm">
      <button
        type="button"
        onClick={onPrev}
        className="border border-custom-blue rounded px-6 sm:px-3 py-1 text-custom-blue"
      >
        Prev
      </button>
      <button
        onClick={onNext}
        className="px-6 sm:px-3 py-1 bg-custom-blue text-white rounded"
        type="button"
      >
        {(!isFreelancer && currentStep === 1) || (isFreelancer && currentStep === 3) ? "Save" : "Next"}
      </button>
    </div>
  );
};

const MultiStepForm = () => {
  const {
    skills,
    locations,
    industries,
    CurrentRole
  } = useCustomContext();
  const { user } = useAuth0();
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const skillsPopupRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const { Freelancer, profession } = location.state || {};
  const [selectedTimezone, setSelectedTimezone] = useState({});
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showDropdownLocation, setShowDropdownLocation] = useState(false);
  const [searchTermLocation, setSearchTermLocation] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [showDropdownIndustry, setShowDropdownIndustry] = useState(false);
  const [selectedCurrentRole, setSelectedCurrentRole] = useState('');
  const [showDropdownCurrentRole, setShowDropdownCurrentRole] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([])
  const [showSkillsPopup, setShowSkillsPopup] = useState(false);
  const [InterviewPreviousExperience, setInterviewPreviousExperience] = useState('');
  const [expertiseLevel, setExpertiseLevel] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [showPopup1, setShowPopup1] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [searchTermCurrentRole, setSearchTermCurrentRole] = useState('');
  const [searchTermIndustry, setSearchTermIndustry] = useState('');
  const [searchTermTechnology, setSearchTermTechnology] = useState('');
  const [searchTermSkills, setSearchTermSkills] = useState('');
  const [showTechPopup, setTechpopup] = useState(false);
  // const [filePreview, setFilePreview] = useState(user.picture ? user.picture : null);
  const [filePreview, setFilePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [times, setTimes] = useState({
    Sun: [{ startTime: null, endTime: null }],
    Mon: [{ startTime: null, endTime: null }],
    Tue: [{ startTime: null, endTime: null }],
    Wed: [{ startTime: null, endTime: null }],
    Thu: [{ startTime: null, endTime: null }],
    Fri: [{ startTime: null, endTime: null }],
    Sat: [{ startTime: null, endTime: null }]
  });

  const [formData, setFormData] = useState({
    Name: "",
    UserName: "",
    Email: "",
    Phone: "",
    LinkedinUrl: "",
    CountryCode: "+91",
    CurrentRole: "",
    industry: "",
    Experience: "",
    location: "",
    Introduction: "",
    dateOfBirth: "",
    gender: "",
    CoverLetterdescription: "",
  });

  const [formData2, setFormData2] = useState({
    InterviewPreviousExperience: "",
    InterviewPreviousExperienceYears: "",
    InterviewExpertiseLevel: "",
    ExpectedRateMin: "",
    ExpectedRateMax: "",
    IsReadyForMockInterviews: "",
    ExpectedRatePerMockInterviewMin: "",
    ExpectedRatePerMockInterviewMax: "",
    NoShowPolicy: "",
  });

  const [formData3, setFormData3] = useState({
    TimeZone: "",
    PreferredDuration: "",
    Availability: ""
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState([false, false, false, false]);
  const [services, setServices] = useState()

  useEffect(() => {
    const fetchData = async () => {
      try {

        const technologyData = await fetchMasterData('technology');
        setServices(technologyData);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };

    fetchData();
  }, []);

  const handleNextStep = async () => {

    const params = {
      formData,
      formData2,
      selectedIndustry,
      selectedLocation,
      selectedCandidates,
      selectedSkills,
      InterviewPreviousExperience,
      expertiseLevel,
      times,
      formData3,
      selectedOption,
    };

    // // Validate the current step
    const isValid = validateSteps(currentStep, params, setErrors);
    if (!isValid) {
      console.log("Validation failed");
      return; // Stop if validation fails
    }

    // If Freelancer is false, submit directly from step 0 after validation
    if (!Freelancer && currentStep === 1) {
      await handleSubmit();
      return;
    }

    // Mark current step as completed before moving forward
    setCompleted((prev) => {
      const updated = [...prev];
      updated[currentStep] = true; // Mark this step as completed
      return updated;
    });

    // If it's the last step (3) and validation passes, submit the form
    if (currentStep === 3) {
      await handleSubmit();
    } else {
      // Otherwise, move to the next step
      setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
    }
  };


  const toggleCurrentRole = () => {
    setShowDropdownCurrentRole(!showDropdownCurrentRole);
  };

  const handleRoleSelect = (role) => {
    setSelectedCurrentRole(role);
    handleChange({ target: { name: 'CurrentRole', value: role } });
    setShowDropdownCurrentRole(false);

    setErrors((prevErrors) => ({
      ...prevErrors,
      CurrentRole: '',
    }));
  };


  const handleRemoveCandidate = (index) => {
    setSelectedCandidates(selectedCandidates.filter((_, i) => i !== index));
  };

  const clearRemoveCandidate = () => {
    setSelectedCandidates([]);
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setTechpopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleRemoveSkill = (index) => {
    setSelectedSkills(selectedSkills.filter((_, i) => i !== index));
  };

  const clearSkills = () => {
    setSelectedSkills([]);
  };

  const handleSkillsClickOutside = (event) => {
    if (skillsPopupRef.current && !skillsPopupRef.current.contains(event.target)) {
      setShowSkillsPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleSkillsClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleSkillsClickOutside);
    };
  }, []);

  const toggleSkillsPopup = () => {
    setShowSkillsPopup((prev) => !prev);
  };

  const handleCopy = (event, day) => {
    setSelectedDay(day);
    setSelectedDays([day]);
    setShowPopup1(true);
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
      if (newTimes[day].length === 1) {
        newTimes[day] = [{ startTime: "unavailable", endTime: "unavailable" }];
      } else {
        newTimes[day] = newTimes[day].filter((_, i) => i !== index);
      }
      return newTimes;
    });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update the state with new value
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear the error when user types
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",  // Clear error for this field
    }));
  };

  const handleChangeforExp = (e) => {
    const { name, value } = e.target;
    setFormData2((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Math.max(1, Math.min(15, Number(value))), // Restrict value between 1-15
    }));

    // Clear the error when user types
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleIndustrySelect = (industry) => {
    setSelectedIndustry(industry.IndustryName);
    setFormData((prevState) => ({
      ...prevState,
      industry: industry.IndustryName,
    }));
    setShowDropdownIndustry(false);

    setErrors((prevErrors) => ({
      ...prevErrors,
      Industry: ''
    }));
  };

  const handleSelectCandidate = (technologies) => {
    if (!selectedCandidates.includes(technologies)) {
      setSelectedCandidates((prev) => [...prev, technologies]);

      setFormData2((prev) => ({
        ...prev,
        Technologys: Array.isArray(prev.Technology)
          ? [...prev.Technology, technologies.TechnologyMasterName]
          : [technologies.TechnologyMasterName],
      }));
    }

    setTechpopup(false);

    // Clear Technology error
    setErrors((prevErrors) => ({
      ...prevErrors,
      Technologys: "",
    }));
  };


  const handleSelectSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => [...prev, skill]);

      setFormData2((prev) => ({
        ...prev,
        Skills: Array.isArray(prev.Skill)
          ? [...prev.Skill, skill.SkillName]
          : [skill.SkillName],
      }));
    }

    setShowSkillsPopup(false);

    // Clear Skill error
    setErrors((prevErrors) => ({
      ...prevErrors,
      Skills: "",
    }));
  };


  const handleRadioChange = (e) => {
    const value = e.target.value;
    setInterviewPreviousExperience(value);

    setFormData2((prev) => ({
      ...prev,
      InterviewPreviousExperience: value,
      InterviewPreviousExperienceYears: value === "no" ? "" : prev.InterviewPreviousExperienceYears,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      PreviousExperience: "",  // Remove error when selected
      InterviewPreviousExperienceYears: value === "no" ? "" : prevErrors.InterviewPreviousExperienceYears,
    }));
  };



  // level of expertice
  const handleRadioChange2 = (e) => {
    const value = e.target.value;
    setExpertiseLevel(value);

    setFormData2((prev) => ({
      ...prev,
      InterviewExpertiseLevel: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      ExpertiseLevel: "", // Clear error when an option is selected
    }));
  };


  const handleChangeExperienceYears = (e) => {
    const value = e.target.value;
    setFormData2((prev) => ({
      ...prev,
      InterviewPreviousExperienceYears: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      InterviewPreviousExperienceYears: value ? "" : 'Years of experience is required',
    }));
  };


  const handleNoShow = (e) => {
    const { name, value } = e.target;
    setFormData2((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Clear error for this field
    }));
  };

  const handleTimeChange = (day, index, key, date) => {
    const newTimes = [...times[day]];
    newTimes[index][key] = date;

    setTimes((prevTimes) => ({
      ...prevTimes,
      [day]: newTimes,
    }));

    // Remove error when both start and end times are selected
    if (newTimes[index].startTime && newTimes[index].endTime) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        TimeSlot: "",
      }));
    }
  };


  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setErrors((prevErrors) => ({
      ...prevErrors,
      PreferredDuration: "",
    }));
  };

  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    let hasError = false;
    setLoading(true);

    // Add validation logic here if required
    if (hasError) return;

    // Prepare user data
    const userData = {
      Name: formData.Name,
      UserName: formData.UserName,
      isFreelancer: Freelancer,
      Email: formData.Email,
    };

    // Prepare contact data
    const contactData = {
      ...formData,
      ...(Freelancer && {
        ...formData2,
        TimeZone: selectedTimezone.value,
        PreferredDuration: selectedOption,
        interviewType: "Outsource",
      }),
      industry: selectedIndustry,
      location: selectedLocation,
      CurrentRole: selectedCurrentRole,
      isFreelancer: Freelancer,
      contactType: "Individual",
      LetUsKnowYourProfession: profession,
    };


    // Prepare availability data
    const availabilityData = Object.keys(times)
      .map((day) => ({
        day,
        timeSlots: times[day]
          .filter((slot) => slot.startTime && slot.endTime)
          .map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
      }))
      .filter((dayData) => dayData.timeSlots.length > 0);
    console.log("before contactData data:", contactData);
    console.log("before userData1 data:", userData);


    console.log("before Availability data:", availabilityData);


    try {

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/Individual/Signup`, {
        userData,
        contactData,
        availabilityData,
        Freelancer,
      });
      const contactId = response.data.contactId;
      console.log("file data:", file);

      if (file) {
        const imageData = new FormData();
        imageData.append("image", file);
        imageData.append("type", "contact");
        imageData.append("id", contactId);

        await axios.post(`${process.env.REACT_APP_API_URL}/upload`, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

      } else {
        console.log("No file uploaded");
      }

      Cookies.set("userId", response.data.userId, { expires: 7 });
      if (Cookies.get("organizationId")) {
        Cookies.remove("organizationId");
      }
      setLoading(false);
      console.log("Navigating to subscription...");
      navigate("/subscription-plans");
    } catch (error) {
      console.error("Error saving data:", error.response?.data || error.message);
    }
  };



  const handleCountryCodeChange = (e) => {
    setFormData({ ...formData, CountryCode: e.target.value });
  };

  const handlePhoneInput = (e) => {
    const { value, name } = e.target;

    // Remove any non-digit characters
    const numbersOnly = value.replace(/\D/g, '');

    // Limit to 10 digits
    const truncatedValue = numbersOnly.slice(0, 10);

    // Clear the error when the user starts typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: ''
    }));

    // Update form data
    setFormData((prevData) => ({
      ...prevData,
      [name]: truncatedValue,
    }));
  };

  const filteredCurrentRoles = CurrentRole.filter(role =>
    role.RoleName.toLowerCase().includes(searchTermCurrentRole.toLowerCase())
  );


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));

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

  const handleLocationSelect = (location) => {
    setSelectedLocation(location.LocationName);
    setFormData((prevState) => ({
      ...prevState,
      location: location.LocationName,
    }));
    setShowDropdownLocation(false);
    const timezone = location.TimeZone || moment.tz.guess();
    setSelectedTimezone({ value: timezone, label: timezone });
    setFormData3((prevState) => ({
      ...prevState,
      TimeZone: timezone,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      Location: ''
    }));
  };

  const handleTimezoneChange = (timezone) => {
    setSelectedTimezone(timezone);
    setFormData3((prevState) => ({
      ...prevState,
      TimeZone: timezone.value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      TimeZone: ''
    }));
  };

  useEffect(() => {
    if (selectedLocation) {
      const selectedLocData = locations.find(loc => loc.LocationName === selectedLocation);
      if (selectedLocData) {
        const timezone = selectedLocData.TimeZone || moment.tz.guess();
        setSelectedTimezone({ value: timezone, label: timezone });
        setFormData3((prevState) => ({
          ...prevState,
          TimeZone: timezone,
        }));
      }
    }
  }, [selectedLocation, locations]);


  const handlePrevStep = () => {
    if (currentStep === 0) {
      navigate('/profile3'); // Navigate to '/profile3' if on step 0
    } else {
      setCurrentStep((prevStep) => {
        const previousStep = prevStep - 1;
        console.log("Navigating to previousStep:", previousStep);
        return previousStep >= 0 ? previousStep : 0; // Ensure it doesn't go below step 0
      });
    }
  };


  const [resumeName, setResumeName] = useState('');
  const [coverLetterName, setCoverLetterName] = useState('');

  // Handle file upload
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];

    if (file) {
      // Only allow PDF files
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
      }

      // Limit file size to 4MB
      if (file.size > 4 * 1024 * 1024) {
        alert('File size should be less than 4MB.');
        return;
      }

      // Set the file name based on the type (Resume or CoverLetter)
      if (type === 'Resume') {
        setResumeName(file.name);
      } else if (type === 'CoverLetter') {
        setCoverLetterName(file.name);
      }
    }
  };

  // Handle file removal
  const handleRemoveFile = (type) => {
    if (type === 'Resume') {
      setResumeName('');
    } else if (type === 'CoverLetter') {
      setCoverLetterName('');
    }
  };

  const resumeInputRef = useRef(null);
  const coverLetterInputRef = useRef(null);

  const [isReady, setIsReady] = useState(null);
  const handleRadioChange3 = (event) => {
    const { value } = event.target;

    setFormData2((prevData) => ({
      ...prevData,
      IsReadyForMockInterviews: value,
      ...(value === "no" ? {
        ExpectedRatePerMockInterviewMin: "",
        ExpectedRatePerMockInterviewMax: "",
        NoShowPolicy: ""
      } : {}),
    }));

    setIsReady(value === "yes");

    // Update validation errors
    setErrors((prevErrors) => ({
      ...prevErrors,
      IsReadyForMockInterviews: value ? "" : "Please select an option",
      ...(value === "no" ? {
        ExpectedRatePerMockInterviewMin: "",
        ExpectedRatePerMockInterviewMax: "",
        NoShowPolicy: ""
      } : {}),
    }));
  };


  const handleInputChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.value,
    });

    // Clear the error for the specific field
    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: '',
    }));
  };
  const handleInputChangeintro = (e, field) => {
    const { value } = e.target;
    const limit = field === "CoverLetterdescription" ? 2000 : 500; // Set different limits

    if (value.length <= limit) {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    }

    // Only update errors for "introduction", not for "CoverLetterdescription"
    if (field === "Introduction") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: '',
      }));
    }
  };


  useEffect(() => {
    // Disable page scrolling when component is mounted
    document.body.style.overflow = "hidden";

    return () => {
      // Re-enable scrolling when component is unmounted
      document.body.style.overflow = "auto";
    };
  }, []);

  const steps = [
    { label: "Basic Details" },
    { label: "Additional Details" },
    { label: "Interview Details" },
    { label: "Availability" },
  ];


  // gender code

  const [showDropdowngender, setShowDropdownGender] = useState(false);
  const genders = ["Male", "Female", "Others"];
  const [selectedGender, setSelectedGender] = useState("");
  const toggleDropdowngender = () => {
    setShowDropdownGender(!showDropdowngender);
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setShowDropdownGender(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      gender,
    }));
  };


  // date of birth

  const [startDate, setStartDate] = useState(null);

  const handleDateChange = (date) => {
    if (!date) {
      setFormData((prevData) => ({ ...prevData, Date_Of_Birth: "" }));
      setStartDate(null);
      setErrors((prevErrors) => ({ ...prevErrors, Date_Of_Birth: "" }));
      return;
    }

    const formattedDate = format(date, "dd-MM-yyyy");
    setFormData((prevData) => ({ ...prevData, dateOfBirth: formattedDate }));
    setStartDate(date);
  };

  return (
    <div className="px-[15%] sm:px-[5%] md:px-[2%] lg:px-[2%] xl:px-[10%]">

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center">
            <TailSpin color="#ffffff" height={50} width={50} />
            <span className="mt-2 text-white text-lg font-semibold">Processing...</span>
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div>
        {/*  Header */}
        <div>
          <p className="font-bold text-2xl sm:text-md">Signup</p>
          <div className="block  md:flex xl:flex lg:flex 2xl:flex items-center justify-center py-3 md:space-x-5 xl:space-x-5 lg:space-x-5 2xl:space-x-5">
            {/* Left Side: Step Numbers with Arrows */}
            <div className="flex items-center justify-center space-x-2 mr-2">
              {steps
                .filter((_, index) => Freelancer || index < 2) // Show all steps if Freelancer, else only first two
                .map((_, index) => (
                  <React.Fragment key={index}>
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full sm:text-xs font-bold
                       ${currentStep === index ? "bg-orange-500 text-white"
                          : completed[index] ? "bg-custom-blue text-white"
                            : "bg-sky-100 text-custom-blue"}`}
                    >
                      {index + 1}
                    </div>
                    {index < (Freelancer ? steps.length - 1 : 1) && (
                      <FaArrowRightLong className="mx-2 text-gray-500" size={20} />
                    )}
                  </React.Fragment>
                ))}
            </div>

            {/* Right Side: Step Labels */}
            <div className="flex justify-center items-center sm:mt-2">
              {steps
                .filter((_, index) => Freelancer || index < 2)
                .map((step, index) => (
                  <span
                    key={index}
                    className={`sm:text-[9px] mr-3 font-semibold 
                     ${currentStep === index ? "text-orange-500"
                        : completed[index] ? "text-custom-blue"
                          : "text-gray-400"}`}
                  >
                    {step.label}
                  </span>
                ))}
            </div>
          </div>
        </div>



        <form onSubmit={handleSubmit}>
          <div>
            <div className="border border-gray-300 rounded-lg p-4 sm:p-2 md:p-2">

              {currentStep === 0 && (
                <>
                  {/* basic details */}
                  <div className="text-xl font-bold mb-5 sm:text-sm">Basic Details:</div>
                  <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* image */}
                    <div className="sm:col-span-6 col-span-2">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-6 col-span-1">
                          <div className="flex items-center space-x-4">
                            {/* Image Preview Box */}
                            <div className="w-28 h-32 sm:w-20 sm:h-20 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                              {filePreview ? (
                                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <img src={noImage} alt="Preview" className="w-full h-full object-cover" />
                              )}
                            </div>

                            {/* File Upload UI */}
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 sm:text-[10px]">Please upload square image, size less than 100KB</p>
                              <div className="flex items-center space-x-2 mt-1 bg-sky-50 py-2 rounded">
                                <input
                                  type="file"
                                  id="imageInput"
                                  className="hidden"
                                  onChange={handleFileChange}
                                  ref={fileInputRef}
                                  accept="image/*"
                                />
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current.click()}
                                  className="border px-4 sm:px-1 py-1 rounded-md sm:text-xs text-sm text-custom-blue border-custom-blue hover:bg-gray-200"
                                >
                                  Choose File
                                </button>
                                {file ? (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <button onClick={handleDeleteImage} type="button" className="text-red-500">
                                      <ImCancelCircle className="text-lg" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-sm sm:px-1 text-gray-400 sm:text-xs">No file chosen</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Left Side */}
                    <div className="space-y-6 sm:col-span-6 col-span-1">
                      {/* Name */}
                      <div>
                        <label htmlFor="Name" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.Name}
                          onChange={(e) => handleInputChange(e, 'Name')}
                          placeholder="John Doe"
                          className={`block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border focus:outline-none ${errors.Name ? 'border-red-500' : 'border-gray-400'}`}
                          autoComplete="given-name"
                        />
                        {errors.Name && <p className="text-red-500 text-sm sm:text-xs">{errors.Name}</p>}
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label htmlFor="dateofbirth" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                          Date of Birth
                        </label>
                        <DatePicker
                          selected={startDate}
                          onChange={handleDateChange}
                          dateFormat="MMMM d, yyyy"
                          maxDate={new Date()}
                          showYearDropdown
                          showMonthDropdown
                          dropdownMode="select"
                          className="w-full"
                          wrapperClassName="w-full"
                          customInput={
                            <input
                              type="text"
                              readOnly
                              className="block w-full rounded-md bg-white px-3 py-2  text-base text-gray-900 placeholder-gray-400 border border-gray-400 focus:outline-none sm:text-sm"
                            />
                          }
                          onChangeRaw={(e) => e.preventDefault()}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="Email" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="Email"
                          type="text"
                          id="Email"
                          value={formData.Email}
                          onChange={(e) => handleInputChange(e, 'Email')}
                          placeholder="John.doe@gmail.com"
                          className={`block w-full rounded-md bg-white px-3 py-2  text-sm text-gray-900 placeholder-gray-400 border focus:outline-none ${errors.Email ? 'border-red-500' : 'border-gray-400'}`}
                          autoComplete="email"
                        />
                        {errors.Email && <p className="text-red-500 text-sm sm:text-xs">{errors.Email}</p>}
                      </div>

                      {/* LinkedIn URL */}
                      <div>
                        <label htmlFor="LinkedinUrl" className="block text-sm font-medium sm:text-xs text-gray-900 mb-1">
                          LinkedIn URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="LinkedinUrl"
                          type="text"
                          id="LinkedinUrl"
                          value={formData.LinkedinUrl}
                          onChange={(e) => handleInputChange(e, 'LinkedinUrl')}
                          placeholder="linkedin.com/in/johndoe"
                          autoComplete="off"
                          className={`block w-full rounded-md bg-white px-3 py-2  text-sm text-gray-900 placeholder-gray-400 border focus:outline-none ${errors.LinkedinUrl ? 'border-red-500' : 'border-gray-400'}`}
                        />
                        {errors.LinkedinUrl && <p className="text-red-500 text-sm sm:text-xs">{errors.LinkedinUrl}</p>}
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-6 sm:col-span-6 col-span-1">
                      {/* Username */}
                      <div>
                        <label htmlFor="UserName" className="block sm:text-xs text-sm font-medium text-gray-900 mb-1">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="UserName"
                          type="text"
                          id="UserName"
                          value={formData.UserName}
                          onChange={(e) => handleInputChange(e, 'UserName')}
                          placeholder="John.doe123"
                          className={`block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 border focus:outline-none ${errors.UserName ? 'border-red-500' : 'border-gray-400'}`}
                          autoComplete="username"
                        />
                        {errors.UserName && <p className="text-red-500 text-sm sm:text-xs">{errors.UserName}</p>}
                      </div>

                      {/* Gender */}
                      <div className="relative">
                        <label htmlFor="gender" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                          Gender
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="gender"
                            autoComplete="off"
                            value={selectedGender}
                            onClick={toggleDropdowngender}
                            readOnly
                            className="block w-full rounded-md bg-white px-3 py-1 text-base text-gray-900 placeholder-gray-400 border border-gray-400 focus:outline-none cursor-pointer"
                          />
                          {/* Dropdown Arrow */}
                          <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500" onClick={toggleDropdowngender}>
                            <MdArrowDropDown className="text-lg" />
                          </div>
                        </div>

                        {showDropdowngender && (
                          <div className="absolute z-50 mt-1 text-xs w-full rounded-md bg-white shadow-lg border border-gray-200">
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
                      </div>


                      {/* Phone Number */}
                      <div>
                        <label htmlFor="Phone" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            name="CountryCode"
                            id="CountryCode"
                            value={formData.CountryCode || "+91"}
                            onChange={handleInputChange}
                            className={`w-20 rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border focus:outline-none ${errors.Phone ? 'border-red-500' : 'border-gray-400'}`}
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
                            maxLength="10"
                            placeholder="Enter 10-digit number"
                            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder-gray-400 border focus:outline-none sm:text-sm ${errors.Phone ? 'border-red-500' : 'border-gray-400'}`}
                          />
                        </div>
                        {errors.Phone && <p className="text-red-500 text-sm sm:text-xs">{errors.Phone}</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-6">
                    {/* additional details */}
                    <div className="text-xl font-bold col-span-2 sm:col-span-6 sm:text-sm">Additional Details:</div>
                    {/* left side */}
                    <div className="sm:col-span-6 col-span-1 space-y-4">
                      {/* current role */}
                      <div >
                        <label htmlFor="CurrentRole" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                          Current Role <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            name="CurrentRole"
                            type="text"
                            id="CurrentRole"
                            value={selectedCurrentRole}
                            onClick={toggleCurrentRole}
                            placeholder="Senior Software Engineer"
                            autoComplete="off"
                            className={`block focus:outline-none border w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 ${errors.CurrentRole ? 'border-red-500' : 'border-gray-400'}`}
                            readOnly
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                            <MdArrowDropDown className="text-lg" onClick={toggleCurrentRole} />
                          </div>

                          {showDropdownCurrentRole && (
                            <div className="absolute bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto z-10 text-xs">
                              <div className="border-b">
                                <div className="flex items-center border rounded px-2 py-1 m-2">
                                  <FaSearch className="absolute ml-1 text-gray-500" />
                                  <input
                                    type="text"
                                    placeholder="Search Current Role"
                                    value={searchTermCurrentRole}
                                    // onChange={(e) => setSearchTermCurrentRole(e.target.value)}
                                    className="pl-8  focus:border-black focus:outline-none w-full"
                                  />
                                </div>
                              </div>
                              {filteredCurrentRoles.length > 0 ? (
                                filteredCurrentRoles.map((role) => (
                                  <div
                                    key={role._id}
                                    onClick={() => handleRoleSelect(role.RoleName)}
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
                        {errors.CurrentRole && <p className="text-red-500 text-sm sm:text-xs">{errors.CurrentRole}</p>}
                      </div>

                      {/* Experience */}
                      <div>
                        <div>
                          <label htmlFor="Experience" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                            Years of Experience <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <div>
                          <input
                            type="number"
                            name="Experience"
                            autoComplete="off"
                            value={formData.Experience}
                            placeholder="5 years"
                            onChange={handleChange}
                            id="Experience" min="1" max="15"
                            className={`block focus:outline-none border w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 ${errors.Experience ? 'border-red-500' : 'border-gray-400'}`}
                          />
                          {errors.Experience && <p className="text-red-500 text-sm sm:text-xs">{errors.Experience}</p>}
                        </div>
                      </div>
                      {/* Resume Section */}
                      <div>
                        <div>
                          <label htmlFor="Resume" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                            Resume
                          </label>
                          <div className="relative flex">
                            <input
                              ref={resumeInputRef}
                              type="file"
                              name="Resume"
                              id="Resume"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleFileUpload(e, 'Resume')}
                            />
                            <div
                              className="bg-blue-500 text-white text-center text-sm sm:text-xs p-2 rounded cursor-pointer"
                              onClick={() => resumeInputRef.current.click()}  // Trigger file input click
                            >
                              {resumeName ? 'Uploaded' : 'Upload File'}
                            </div>
                            <p className="text-sm sm:text-xs text-gray-400 py-2 px-4">Upload PDF only. 4 MB max</p>
                          </div>
                        </div>
                        {resumeName && (
                          <div className="border mt-2 inline-flex items-center gap-2">
                            <span className="text-gray-600">{resumeName}</span>
                            <button
                              className="text-red-500"
                              onClick={() => handleRemoveFile('Resume')}
                            >
                              <span className="text-xl">×</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Cover Letter Section */}
                      <div>
                        <div>
                          <label htmlFor="CoverLetter" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                            Cover Letter
                          </label>
                          <div className="relative flex">
                            <input
                              ref={coverLetterInputRef}
                              type="file"
                              name="CoverLetter"
                              id="CoverLetter"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleFileUpload(e, 'CoverLetter')}
                            />
                            <div
                              className="bg-blue-500 text-white text-center p-2 text-sm sm:text-xs rounded cursor-pointer"
                              onClick={() => coverLetterInputRef.current.click()}  // Trigger file input click
                            >
                              {coverLetterName ? 'Uploaded' : 'Upload File'}
                            </div>
                            <p className="text-sm sm:text-xs text-gray-400 py-2 px-4">Upload PDF only. 4 MB max</p>
                          </div>
                        </div>
                        {coverLetterName && (
                          <div className="border mt-2 inline-flex items-center gap-2">
                            <span className="text-gray-600">{coverLetterName}</span>
                            <button
                              className="text-red-500"
                              onClick={() => handleRemoveFile('CoverLetter')}
                            >
                              <span className="text-xl">×</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                    {/* right side */}
                    <div className="sm:col-span-6 col-span-1 space-y-4">

                      {/* Industry */}
                      <div >
                        <label htmlFor="Industry" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                          Industry <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            name="Industry"
                            type="text"
                            id="Industry"
                            value={selectedIndustry}
                            placeholder="Information Technology"
                            autoComplete="off"
                            onClick={() => setShowDropdownIndustry(!showDropdownIndustry)}
                            className={`block focus:outline-none border w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 ${errors.Industry ? 'border-red-500' : 'border-gray-400'}`}
                            readOnly
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                            <MdArrowDropDown className="text-lg" onClick={() => setShowDropdownIndustry(!showDropdownIndustry)} />
                          </div>
                          {showDropdownIndustry && (
                            <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                              <div className="border-b">
                                <div className="flex items-center border rounded px-2 py-1 m-2">
                                  <FaSearch className="absolute ml-1 text-gray-500" />
                                  <input
                                    type="text"
                                    placeholder="Search Industry"
                                    value={searchTermIndustry}
                                    onChange={(e) => setSearchTermIndustry(e.target.value)}
                                    className="pl-8  focus:border-black focus:outline-none w-full"
                                  />
                                </div>
                              </div>
                              {industries.filter(industry =>
                                industry.IndustryName.toLowerCase().includes(searchTermIndustry.toLowerCase())
                              ).length > 0 ? (
                                industries.filter(industry =>
                                  industry.IndustryName.toLowerCase().includes(searchTermIndustry.toLowerCase())
                                ).map((industry) => (
                                  <div
                                    key={industry._id}
                                    onClick={() => handleIndustrySelect(industry)}
                                    className="cursor-pointer hover:bg-gray-200 p-2"
                                  >
                                    {industry.IndustryName}
                                  </div>
                                ))
                              ) : (
                                <div className="p-2 text-gray-500">No industries found</div>
                              )}
                            </div>
                          )}

                        </div>
                        {errors.Industry && <p className="text-red-500 text-sm sm:text-xs">{errors.Industry}</p>}

                      </div>

                      {/* Location */}
                      <div >
                        <label htmlFor="Location" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            name="Location"
                            type="text"
                            id="Location"
                            value={selectedLocation}
                            placeholder="Delhi,India"
                            autoComplete="off"
                            onClick={() => setShowDropdownLocation(!showDropdownLocation)}
                            className={`block focus:outline-none border w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 ${errors.Location ? 'border-red-500' : 'border-gray-400'}`}

                            readOnly
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                            <MdArrowDropDown className="text-lg" onClick={() => setShowDropdownLocation(!showDropdownLocation)} />
                          </div>
                          {showDropdownLocation && (
                            <div className="absolute bg-white border border-gray-300 w-full text-xs mt-1 max-h-60 overflow-y-auto z-10">
                              <div className="border-b">
                                <div className="flex items-center border rounded px-2 py-1 m-2">
                                  <FaSearch className="absolute ml-1 text-gray-500" />
                                  <input
                                    type="text"
                                    placeholder="Search Location"
                                    value={searchTermLocation}
                                    autoComplete="off"
                                    onChange={(e) => setSearchTermLocation(e.target.value)}
                                    className="pl-8 focus:border-black focus:outline-none w-full"
                                  />
                                </div>
                              </div>
                              {(() => {
                                const filteredLocations = locations.filter(location =>
                                  location.LocationName && location.LocationName.toLowerCase().includes(searchTermLocation.toLowerCase())
                                );

                                return filteredLocations.length > 0 ? (
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
                                );
                              })()}
                            </div>
                          )}
                        </div>
                        {errors.Location && <p className="text-red-500 text-sm sm:text-xs">{errors.Location}</p>}

                      </div>


                    </div>


                    {/* CoverLetterdescription */}
                    <div className="col-span-2 sm:col-span-6">
                      <p className="flex justify-center mb-3">(OR)</p>
                      <div>
                        <textarea
                          name="CoverLetterdescription"
                          type="text"
                          rows={5}
                          id="CoverLetterdescription"
                          onChange={(e) => handleInputChangeintro(e, 'CoverLetterdescription')}
                          placeholder="I am a technical interviewer..."
                          autoComplete="off"
                          className="border p-2 focus:outline-none mb-3 w-full rounded-md border-gray-300 focus:border-black sm:placeholder:text-xs placeholder:text-sm"
                        />

                        <p className="text-gray-600 text-sm sm:text-xs float-right -mt-4">
                          {formData.CoverLetterdescription.length}/2000
                        </p>
                      </div>
                    </div>

                    {/* Introduction */}
                    <div className="col-span-2 sm:col-span-6">
                      <label htmlFor="Introduction" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                        Introduction <span className="text-red-500">*</span>
                      </label>
                      <div>
                        <textarea
                          name="Introduction"
                          type="text"
                          rows={5}
                          id="Introduction"
                          onChange={(e) => handleInputChangeintro(e, 'Introduction')}
                          placeholder="I am a technical interviewer with 5+ years of experience in assessing candidates for software engineering roles."
                          autoComplete="off"
                          // onChange={handleChange}
                          className={`border p-2 focus:outline-none mb-3 sm:placeholder:text-xs placeholder:text-sm w-full rounded-md ${errors.Introduction ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                        />
                        {errors.Introduction && <p className="text-red-500 text-sm sm:text-xs -mt-4">{errors.Introduction}</p>}
                        <p className="text-gray-600 text-sm sm:text-xs float-right -mt-4">
                          {formData.Introduction.length}/500
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {Freelancer && (
                <>
                  {currentStep === 2 && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-xl font-bold mb-5 col-span-2">
                          Skills and Experience Details:
                        </div>
                        <div className="col-span-1 sm:col-span-6">
                          {/* technology */}
                          <div>
                            <label htmlFor="technology" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                              Select Your Comfortable Technologies <span className="text-red-500">*</span>
                            </label>
                            <div className="relative"ref={popupRef}>
                              <input
                                placeholder="Select Multiple Technologies"
                                readOnly // Prevent typing
                                onClick={() => setTechpopup((prev) => !prev)}
                                className={`block focus:outline-none border w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 ${errors.Technologys ? "border-red-500" : "border-gray-400"
                                  }`}
                              />
                              <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                                <MdArrowDropDown className="text-lg" onClick={() => setTechpopup((prev) => !prev)} />
                              </div>
                              {showTechPopup && (
                                <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                                  <div className="border-b">
                                    <div className="flex items-center border rounded px-2 py-1 m-2">
                                      <FaSearch className="absolute ml-1 text-gray-500" />
                                      <input
                                        type="text"
                                        placeholder="Search Technology"
                                        value={searchTermTechnology}
                                        onChange={(e) => setSearchTermTechnology(e.target.value)}
                                        className="pl-8 focus:border-black focus:outline-none w-full"
                                      />
                                    </div>
                                  </div>
                                  {services.filter(service =>
                                    service.TechnologyMasterName.toLowerCase().includes(searchTermTechnology.toLowerCase())
                                  ).length > 0 ? (
                                    services.filter(service =>
                                      service.TechnologyMasterName.toLowerCase().includes(searchTermTechnology.toLowerCase())
                                    ).map((service) => (
                                      <div
                                        key={service._id}
                                        onClick={() => handleSelectCandidate(service)}
                                        className="cursor-pointer hover:bg-gray-200 p-2"
                                      >
                                        {service.TechnologyMasterName}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-2 text-gray-500">No technologies found</div>
                                  )}
                                </div>
                              )}
                              {errors.Technologys && <p className="text-red-500 text-sm sm:text-xs">{errors.Technologys}</p>}
                            </div>

                            {/* to display selected one */}
                            <div className="mt-5 mb-5 relative">
                              {selectedCandidates.map((candidate, index) => (
                                <div key={index} className="border border-custom-blue rounded px-2 m-1 py-1 inline-block mr-2 text-sm sm:text-xs sm:w-[90%]">
                                  <div className="flex items-center justify-between gap-2 text-custom-blue">
                                    <div className="flex">
                                      <span className="sm:w-5 w-8"> <IoPersonOutline className="pt-1 text-lg" /></span>
                                      {candidate.TechnologyMasterName}
                                    </div>
                                    <button type="button" onClick={() => handleRemoveCandidate(index)} className="ml-2 text-red-500 rounded px-2">X</button>
                                  </div>

                                </div>
                              ))}
                              {selectedCandidates.length > 0 && (
                                <button type="button" onClick={clearRemoveCandidate} className="text-red-500 border border-custom-blue rounded px-2 sm:px-1 sm:text-xs absolute top-1 text-sm right-0" title="Clear All">X</button>
                              )}
                            </div>
                          </div>

                          {/* skills */}
                          <div>
                            <label htmlFor="skills" className="block text-sm sm:text-xs font-medium text-gray-900 mb-1">
                              Select Skills <span className="text-red-500">*</span>
                            </label>
                            <div className="relative"ref={skillsPopupRef}>
                              <input
                                onClick={toggleSkillsPopup}
                                className={`block focus:outline-none border w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 ${errors.Skills ? 'border-red-500' : 'border-gray-400'}`}
                                placeholder="Select Multiple Skills"

                              />
                              <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                                <MdArrowDropDown className="text-lg" onClick={toggleSkillsPopup} />
                              </div>
                              {showSkillsPopup && (
                                <div  className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                                  <div className="border-b">
                                    <div className="flex items-center border rounded px-2 py-1 m-2">
                                      <FaSearch className="absolute ml-1 text-gray-500" />
                                      <input
                                        type="text"
                                        placeholder="Search Skills"
                                        value={searchTermSkills}
                                        onChange={(e) => setSearchTermSkills(e.target.value)}
                                        className="pl-8  focus:border-black focus:outline-none w-full"
                                      />
                                    </div>
                                  </div>
                                  {skills.filter(skill =>
                                    skill.SkillName.toLowerCase().includes(searchTermSkills.toLowerCase())
                                  ).length > 0 ? (
                                    skills.filter(skill =>
                                      skill.SkillName.toLowerCase().includes(searchTermSkills.toLowerCase())
                                    ).map((skill) => (
                                      <div
                                        key={skill._id}
                                        onClick={() => handleSelectSkill(skill)}
                                        className="cursor-pointer hover:bg-gray-200 p-2"
                                      >
                                        {skill.SkillName}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-2 text-gray-500">No skills found</div>
                                  )}
                                </div>
                              )}
                              {errors.Skills && <p className="text-red-500 text-sm sm:text-xs">{errors.Skills}</p>}
                            </div>

                            <div className="mt-5 mb-5 relative">

                              {selectedSkills.map((skill, index) => (
                                <div key={index} className="border border-custom-blue rounded px-2 m-1 py-1 inline-block mr-2 text-sm sm:text-xs sm:w-[90%]">
                                  <div className="flex items-center justify-between gap-2 text-custom-blue">
                                    <div className="flex">
                                      <span className="sm:w-5 w-8">
                                        <IoPersonOutline className="pt-1 text-lg" />
                                      </span>
                                      {skill.SkillName}
                                    </div>
                                    <button type="button" onClick={() => handleRemoveSkill(index)} className="ml-2 text-red-500 rounded px-2">X</button>
                                  </div>
                                </div>
                              ))}
                              {selectedSkills.length > 0 && (
                                <button type="button" onClick={clearSkills} className="text-red-500 border border-custom-blue rounded sm:px-1 sm:text-xs px-2 absolute top-1 text-sm right-0" title="Clear All">X</button>
                              )}
                            </div>
                          </div>

                        </div>


                        <div className="col-span-2 sm:col-span-6 space-y-6">
                          {/* Previous Experience */}
                          <div className="text-gray-900 text-sm font-medium leading-6 rounded-lg">
                            <p >
                              Do you have any previous experience conducting interviews? <span className="text-red-500">*</span>
                            </p>
                            <div className="mt-3 mb-3 flex space-x-6">
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  className="form-radio text-gray-600"
                                  name="InterviewPreviousExperience"
                                  value="yes"
                                  checked={InterviewPreviousExperience === "yes"}
                                  onChange={handleRadioChange}
                                />
                                <span className="ml-2">Yes</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  className="form-radio text-gray-600"
                                  name="InterviewPreviousExperience"
                                  value="no"
                                  checked={InterviewPreviousExperience === "no"}
                                  onChange={handleRadioChange}
                                />
                                <span className="ml-2">No</span>
                              </label>
                            </div>
                            {errors.PreviousExperience && (
                              <p className="text-red-500 text-sm sm:text-xs">{errors.PreviousExperience}</p>
                            )}
                          </div>

                          {/* Conditional Experience Years */}
                          {InterviewPreviousExperience === "yes" && (
                            <div>
                              <label htmlFor="InterviewPreviousExperienceYears" className="block text-sm font-medium text-gray-900 mb-2">
                                How many years of experience do you have in conducting interviews? <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                id="InterviewPreviousExperienceYears"
                                name="InterviewPreviousExperienceYears"
                                min="1"
                                max="15"
                                value={formData2.InterviewPreviousExperienceYears}
                                onChange={handleChangeExperienceYears}
                                className={`block border rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 w-1/4 sm:w-1/2 focus:outline-none ${errors.InterviewPreviousExperienceYears ? "border-red-500" : "border-gray-400"
                                  }`}
                              />
                              {errors.InterviewPreviousExperienceYears && (
                                <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.InterviewPreviousExperienceYears}</p>
                              )}
                            </div>
                          )}

                          {/* Level of Expertise */}
                          <div className="text-gray-900 text-sm font-medium leading-6 rounded-lg">
                            <p>Choose your level of expertise in conducting interviews <span className="text-red-500">*</span></p>
                            <div className="mt-3 flex flex-wrap space-x-20 md:space-x-10 sm:space-x-0 sm:flex-col">
                              {["junior", "mid-level", "senior", "lead"].map((level, index) => (
                                <label key={index} className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    className="form-radio text-gray-600"
                                    name="InterviewExpertiseLevel"
                                    value={level}
                                    checked={formData2.InterviewExpertiseLevel === level}
                                    onChange={handleRadioChange2}
                                  />
                                  <span className="ml-2 capitalize">{level.replace("-", " ")} ({index * 3}-{(index + 1) * 3} years)</span>
                                </label>
                              ))}
                            </div>
                            {errors.ExpertiseLevel && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.ExpertiseLevel}</p>}
                          </div>

                          {/* Expected Rate Per Hour */}
                          <div>
                            <label htmlFor="ExpectedRateMin" className="block text-sm font-medium text-gray-900 mb-2">
                              Expected rate per hour <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-6">
                              {["Min", "Max"].map((label, index) => (
                                <div key={index} className="w-full">
                                  <div className="flex items-center gap-2">
                                    {/* Min/Max Label */}
                                    <span className="text-gray-900 text-sm mb-1">{label}:</span>

                                    {/* Input Field with $ Symbol Inside */}
                                    <div className="relative flex-1">
                                      <input
                                        type="number"
                                        id={`ExpectedRate${label}`}
                                        name={`ExpectedRate${label}`}
                                        min="1"
                                        max="100"
                                        value={formData2[`ExpectedRate${label}`]}
                                        onChange={handleChangeforExp}
                                        className={`block border rounded-md bg-white pl-3 pr-6 py-2 text-sm text-gray-900 placeholder-gray-400 w-full focus:outline-none ${errors[`ExpectedRate${label}`] ? "border-red-500" : "border-gray-400"
                                          } appearance-none`}
                                      />
                                      {/* Dollar Symbol Inside Input (After Value) */}
                                      <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">$</span>
                                    </div>
                                  </div>

                                  {/* Error Message Below Input */}
                                  {errors[`ExpectedRate${label}`] && (
                                    <p className="text-red-500 text-sm sm:text-xs mt-1 ml-9">{errors[`ExpectedRate${label}`]}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>





                          {/* Mock Interviews */}
                          <div>
                            <p className="block text-sm font-medium text-gray-900 mb-2">Are you ready to take mock interviews? <span className="text-red-500">*</span></p>
                            <div className="mt-3 flex space-x-6">
                              {["yes", "no"].map((option) => (
                                <label key={option} className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name="IsReadyForMockInterviews"
                                    className="form-radio text-gray-600"
                                    value={option}
                                    checked={formData2.IsReadyForMockInterviews === option}
                                    onChange={handleRadioChange3}
                                  />
                                  <span className="ml-2 capitalize">{option}</span>
                                </label>
                              ))}
                            </div>
                            {errors.IsReadyForMockInterviews && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.IsReadyForMockInterviews}</p>}
                          </div>

                          {/* Expected Rate Per Mock Interview */}
                          {isReady && (
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Expected rate per mock interview <span className="text-red-500">*</span>
                              </label>
                              <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {["Min", "Max"].map((label, index) => (
                                  <div key={index} className="w-full">
                                    <div className="flex items-center gap-2">
                                      {/* Min/Max Label */}
                                      <span className="text-gray-900 text-sm mb-1">{label}:</span>

                                      {/* Input Field with $ Symbol Inside */}
                                      <div className="relative flex-1">
                                        <input
                                          type="number"
                                          name={`ExpectedRatePerMockInterview${label}`}
                                          min="1"
                                          max="100"
                                          value={formData2[`ExpectedRatePerMockInterview${label}`]}
                                          onChange={handleChangeforExp}
                                          className={`block border rounded-md bg-white pl-3 pr-6 py-2 text-sm text-gray-900 w-full focus:outline-none ${errors[`ExpectedRatePerMockInterview${label}`] ? "border-red-500" : "border-gray-400"
                                            } appearance-none`}
                                        />
                                        {/* Dollar Symbol Inside Input (After Value) */}
                                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">$</span>
                                      </div>
                                    </div>

                                    {/* Error Message Below Input */}
                                    {errors[`ExpectedRatePerMockInterview${label}`] && (
                                      <p className="text-red-500 text-sm sm:text-xs mt-1 ml-9">{errors[`ExpectedRatePerMockInterview${label}`]}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>


                          )}

                          {/* No-Show Policy */}
                          {isReady && (
                            <div>
                              <p className="text-gray-900 text-sm font-medium leading-6 rounded-lg mb-1">
                                Policy for No-Show Cases <span className="text-red-500">*</span>
                              </p>
                              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-1 text-sm sm:text-xs">
                                {["25%", "50%", "75%", "100%"].map((policy) => (
                                  <label key={policy} className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name="NoShowPolicy"
                                      value={policy}
                                      checked={formData2.NoShowPolicy === policy}
                                      onChange={handleNoShow}
                                      className="form-radio text-gray-600"
                                    />
                                    <span className="ml-2">Charge {policy} without rescheduling</span>
                                  </label>
                                ))}
                              </div>
                              {errors.NoShowPolicy && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.NoShowPolicy}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {Freelancer && (
                <>
                  {currentStep === 3 && (
                    <>
                      <div className="grid grid-cols-2 gap-10 md:gap-5 lg:gap-5 xl:gap-8">
                        <div className="text-sm sm:col-span-6 col-span-1">
                          <h2 className="text-xl sm:text-md sm:text-md font-semibold mb-3">
                            Availability <span className="text-red-500">*</span>
                          </h2>
                          {errors.TimeSlot && <p className="text-red-500 text-sm sm:text-xs">{errors.TimeSlot}</p>}
                          <div className="border border-gray-300 p-4 sm:p-2 md:p-1 rounded-lg w-[90%] sm:w-full md:w-full xl:w-full">
                            {Object.keys(times).map((day) => (
                              <div key={day} className="mb-3 relative">
                                <div className="flex space-x-3 md:space-x-2 sm:space-x-1">
                                  {/* Day Name */}
                                  <p className="sm:text-[8px] border border-gray-400 sm:mt-[2px] md:pt-[6px] lg:pt-[6px] xl:pt-[7px] 2xl:pt-[7px] rounded sm:w-16 md:w-20 lg:w-[100px] xl:w-[80px] 2xl:w-[80px] sm:h-[21px] md:h-[37.5px] lg:h-[37px] xl:h-[37px] 2xl:h-[37px] xl:mr-5 text-center">
                                    {day}
                                  </p>

                                  <div className="flex flex-col">
                                    {times[day].map((timeSlot, index) => (
                                      <div key={index} className="flex items-center space-x-3 sm:space-x-2 md:space-x-2 xl:space-x-6">
                                        {timeSlot.startTime === "unavailable" ? (
                                          <span className="p-2 bg-gray-200 text-center w-72 sm:w-full text-sm">Unavailable</span>
                                        ) : (
                                          <>
                                            {/* Start Time Picker */}
                                            <DatePicker
                                              selected={timeSlot.startTime}
                                              onChange={(date) => handleTimeChange(day, index, "startTime", date)}
                                              showTimeSelect
                                              showTimeSelectOnly
                                              timeIntervals={15}
                                              dateFormat="h:mm aa"
                                              placeholderText="Start Time"
                                              className="p-2 sm:p-0 border mb-1 border-gray-400 rounded w-24 sm:w-14 md:w-20 sm:placeholder:text-[8px] sm:text-[8px] text-center outline-none focus:ring-0"
                                            />

                                            <FaMinus className="text-xs text-gray-600 sm:text-[8px]" />

                                            {/* End Time Picker */}
                                            <DatePicker
                                              selected={timeSlot.endTime}
                                              onChange={(date) => handleTimeChange(day, index, "endTime", date)}
                                              showTimeSelect
                                              showTimeSelectOnly
                                              timeIntervals={15}
                                              dateFormat="h:mm aa"
                                              placeholderText="End Time"
                                              className="p-2 sm:p-0 border mb-1 border-gray-400 rounded sm:placeholder:text-[8px] sm:text-[8px] w-24 md:w-20 sm:w-14 outline-none text-center focus:ring-0"
                                            />

                                            {/* Cancel Icon (Invisible When Not Needed) */}
                                            <GiCancel
                                              className={`text-2xl xl:ml-4 cursor-pointer text-red-500 sm:text-sm ${timeSlot.startTime && timeSlot.endTime && timeSlot.startTime !== "unavailable"
                                                ? "visible"
                                                : "invisible"
                                                }`}
                                              onClick={() => handleRemoveTimeSlot(day, index)}
                                            />
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  {/* Add Time Slot */}
                                  <FaPlus
                                    className="text-2xl cursor-pointer sm:text-sm w-20 mt-[4.5px] xl:mt-2 2xl:mt-2"
                                    onClick={() => handleAddTimeSlot(day)}
                                  />

                                  {/* Copy Icon (Click to Toggle Popup) */}
                                  <div className="relative mt-[4.5px] xl:mt-2 2xl:mt-2">
                                    <IoIosCopy
                                      className="text-xl cursor-pointer sm:text-sm"
                                      onClick={() => {
                                        if (showPopup && selectedDay === day) {
                                          setShowPopup(false);
                                          setSelectedDay(null);
                                        } else {
                                          setSelectedDay(day);
                                          setShowPopup(true);
                                        }
                                      }}
                                    />

                                    {/* Copy Popup (Only Show for Selected Day) */}
                                    {showPopup && selectedDay === day && (
                                      <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
                                        <div className="bg-white p-3 rounded-lg w-72 sm:w-60 shadow-md border text-sm">

                                          <h2 className="text-lg sm:text-md font-semibold p-2">Duplicate Time Entries</h2>


                                          <div className="space-y-2">
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
                                                      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
                                                    );
                                                  }}
                                                  className="mr-2"
                                                />
                                                {dayOption}
                                              </label>
                                            ))}
                                          </div>

                                          <div className="mt-4 flex gap-2 justify-end">
                                            <button
                                              type="button"
                                              onClick={() => setShowPopup(false)}
                                              className="bg-white border border-custom-blue text-custom-blue py-1 px-4 rounded"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                handlePaste(selectedDay, selectedDays);
                                                setShowPopup(false);
                                              }}
                                              className="bg-custom-blue text-white py-1 px-4 rounded"
                                            >
                                              Duplicate
                                            </button>

                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-10 sm:col-span-6 col-span-1">
                          {/* Time Zone */}
                          <div>

                            <label
                              htmlFor="TimeZone"
                              className="block text-sm sm:text-xs font-medium text-gray-900 mb-1"
                            >
                              Time Zone <span className="text-red-500">*</span>
                            </label>

                            <div className="flex-grow w-full overflow-visible">
                              <div className="w-full overflow-visible">
                                <TimezoneSelect
                                  value={selectedTimezone}
                                  onChange={handleTimezoneChange}
                                  className="mt-1 sm:text-xs"
                                />
                                {errors.TimeZone && <p className="text-red-500 text-sm sm:text-xs ml-5 mt-2">{errors.TimeZone}</p>}
                              </div>
                            </div>
                          </div>

                          {/* preferred interview */}
                          <div className="mt-5">
                            <div className="border border-gray-500 text-sm sm:text-xs p-3 rounded-lg w-[80%] sm:w-full md:w-full lg:w-full">
                              <p className="font-medium">
                                Preferred Interview Duration <span className="text-red-500">*</span>
                              </p>
                              <ul className="flex mt-3 text-xs font-medium space-x-3">
                                {["30", "45", "60", "90"].map((duration) => (
                                  <li
                                    key={duration}
                                    className={`option cursor-pointer inline-block py-2 px-3 sm:py-1 sm:px-2 sm:text-[9px] rounded-lg border border-custom-blue ${selectedOption === duration ? "text-white bg-custom-blue" : "bg-white"
                                      }`}
                                    onClick={() => handleOptionClick(duration)}
                                  >
                                    {duration} mins
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {errors.PreferredDuration && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.PreferredDuration}</p>}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}



            </div>
            {/* Common Footer for all steps */}
            {currentStep <= 3 && (
              <FooterButtons
                onNext={handleNextStep}
                onPrev={handlePrevStep}
                currentStep={currentStep}
                isFreelancer={Freelancer}
              />
            )}

          </div>

        </form>
      </div>
    </div>
  );
};

export default MultiStepForm;
