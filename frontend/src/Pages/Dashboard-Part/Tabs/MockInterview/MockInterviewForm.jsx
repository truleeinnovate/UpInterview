// v1.0.0  - mansoor - improved the error message
// v1.0.1  - Ashok - addded scroll to first error functionality

import { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import {
  validatemockForm,
  getErrorMessage,
  validatePage1,
} from "../../../../utils/mockinterviewValidation.js";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { useSingleContact } from "../../../../apiHooks/useUsers";
import {
  X,
  Users,
  User,
  Trash2,
  Clock,
  Calendar,
  Search,
  ChevronDown,
} from "lucide-react";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { Button } from "../CommonCode-AllTabs/ui/button.jsx";
import OutsourceOption from "../Interview-New/pages/Internal-Or-Outsource/OutsourceInterviewer.jsx";
import { useMockInterviews } from "../../../../apiHooks/useMockInterviews.js";
import LoadingButton from "../../../../Components/LoadingButton";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import SkillsField from "../CommonCode-AllTabs/SkillsInput.jsx";
import { validateFile } from "../../../../utils/FileValidation/FileValidation.js";
// v1.0.1 <-------------------------------------------------------------------------------
import { scrollToFirstError } from "../../../../utils/ScrollToFirstError/scrollToFirstError.js";
// v1.0.1 ------------------------------------------------------------------------------->

// Reusable CustomDropdown Component
// v1.0.1 <----------------------------------------------------------------
// const CustomDropdown = ({
//   label,
//   name,
//   value,
//   options,
//   onChange,
//   error,
//   placeholder,
//   optionKey,
//   optionValue,
//   disableSearch = false,
//   hideLabel = false,
// }) => {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const dropdownRef = useRef(null);

//   const toggleDropdown = () => {
//     setShowDropdown(!showDropdown);
//   };

//   const handleSelect = (option) => {
//     const selectedValue = optionValue ? option[optionValue] : option;
//     onChange({ target: { name, value: selectedValue } });
//     setShowDropdown(false);
//     setSearchTerm("");
//   };

//   const filteredOptions = options?.filter((option) => {
//     const displayValue = optionKey ? option[optionKey] : option;
//     return displayValue
//       .toString()
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
//   });

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDropdown(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div ref={dropdownRef}>
//       {!hideLabel && (
//         <label
//           htmlFor={name}
//           className="block text-sm font-medium text-gray-700 mb-1"
//         >
//           {label} <span className="text-red-500">*</span>
//         </label>
//       )}
//       <div className="relative">
//         <input
//           name={name}
//           type="text"
//           id={name}
//           value={value}
//           onClick={toggleDropdown}
//           placeholder={placeholder}
//           autoComplete="off"
//           className={`block w-full px-3 py-2 h-10 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${
//             error ? "border-red-500" : "border-gray-300"
//           }`}
//           readOnly
//         />
//         <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
//           <ChevronDown className="text-lg w-5 h-5" onClick={toggleDropdown} />
//         </div>
//         {showDropdown && (
//           <div className="absolute bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto z-10 text-xs">
//             {!disableSearch && (
//               <div className="border-b">
//                 <div className="flex items-center border rounded px-2 py-1 m-2">
//                   <Search className="absolute ml-1 text-gray-500 w-4 h-4" />
//                   <input
//                     type="text"
//                     placeholder={`Search ${label}`}
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-8 focus:border-black focus:outline-none w-full"
//                   />
//                 </div>
//               </div>
//             )}
//             {filteredOptions?.length > 0 ? (
//               filteredOptions.map((option, index) => (
//                 <div
//                   key={option._id || index}
//                   onClick={() => handleSelect(option)}
//                   className="cursor-pointer hover:bg-gray-200 p-2"
//                 >
//                   {optionKey ? option[optionKey] : option}
//                 </div>
//               ))
//             ) : (
//               <div className="p-2 text-gray-500">No options found</div>
//             )}
//           </div>
//         )}
//       </div>
//       {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
//     </div>
//   );
// };

const CustomDropdown = forwardRef(
  (
    {
      label,
      name,
      value,
      options,
      onChange,
      error,
      placeholder,
      optionKey,
      optionValue,
      disableSearch = false,
      hideLabel = false,
    },
    ref
  ) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
      setShowDropdown(!showDropdown);
    };

    const handleSelect = (option) => {
      const selectedValue = optionValue ? option[optionValue] : option;
      onChange({ target: { name, value: selectedValue } });
      setShowDropdown(false);
      setSearchTerm("");
    };

    const filteredOptions = options?.filter((option) => {
      const displayValue = optionKey ? option[optionKey] : option;
      return displayValue
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setShowDropdown(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div ref={dropdownRef}>
        {!hideLabel && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label} <span className="text-red-500">*</span>
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            name={name}
            type="text"
            id={name}
            value={value}
            onClick={toggleDropdown}
            placeholder={placeholder}
            autoComplete="off"
            // className={`block w-full px-3 py-2 h-10 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${
            //   error ? "border-red-500" : "border-gray-300"
            // }`}
            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
              border ${
                error
                  ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                  : "border-gray-300 focus:ring-red-300"
              }
              focus:outline-gray-300
            `}
            readOnly
          />
          <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
            <ChevronDown className="text-lg w-5 h-5" onClick={toggleDropdown} />
          </div>
          {showDropdown && (
            <div className="absolute bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto z-10 text-xs">
              {!disableSearch && (
                <div className="border-b">
                  <div className="flex items-center border rounded px-2 py-1 m-2">
                    <Search className="absolute ml-1 text-gray-500 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={`Search ${label}`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 focus:border-black focus:outline-none w-full"
                    />
                  </div>
                </div>
              )}
              {filteredOptions?.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={option._id || index}
                    onClick={() => handleSelect(option)}
                    className="cursor-pointer hover:bg-gray-200 p-2"
                  >
                    {optionKey ? option[optionKey] : option}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">No options found</div>
              )}
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
      </div>
    );
  }
);
// v1.0.1 ---------------------------------------------------------------->

// Helper function to parse custom dateTime format (e.g., "31-03-2025 10:00 PM")
const parseCustomDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return null;
  const [datePart, timePart] = dateTimeStr.split(" ");
  const [day, month, year] = datePart.split("-");
  const formattedDate = `${year}-${month}-${day}T${timePart}:00`;
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
  const { singleContact } = useSingleContact();
  const { qualifications, technologies, skills, currentRoles, contacts } =
    useMasterData();
  const { mockinterviewData, addOrUpdateMockInterview, isMutationLoading } =
    useMockInterviews();
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
      interviewType: "scheduled",
      interviewers: [],
      status: "Pending",
      dateTime: "",
    },
  });

  const [interviewType, setInterviewType] = useState("scheduled");
  const [combinedDateTime, setCombinedDateTime] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [mockEdit, setMockEdit] = useState(false);
  const [entries, setEntries] = useState([]);
  const [allSelectedSkills, setAllSelectedSkills] = useState([]);
  const [allSelectedExperiences, setAllSelectedExperiences] = useState([]);
  const [allSelectedExpertises, setAllSelectedExpertises] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOutsourcePopup, setShowOutsourcePopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [externalInterviewers, setExternalInterviewers] = useState([]);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const organizationId = tokenPayload?.tenantId;

  const [showDropdownRole, setShowDropdownRole] = useState(false);

  // v1.0.1 <-----------------------------------------------------------------------------
  const fieldRefs = {
    higherQualification: useRef(null),
    technology: useRef(null),
    currentExperience: useRef(null),
    relevantExperience: useRef(null),
    currentRole: useRef(null),
    skills: useRef(null),
    "rounds.roundTitle": useRef(null),
    "rounds.interviewMode": useRef(null),
  };

  // v1.0.1 ---------------------------------------------------------------------------->

  const toggleDropdownRole = () => {
    setShowDropdownRole(!showDropdownRole);
  };

  const handleRoleSelect = (role) => {
    setFormData((prevData) => ({
      ...prevData,
      Role: role.RoleName,
    }));
    setShowDropdownRole(false);
  };

  const filteredSkills = skills.filter((skill) =>
    skill.SkillName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Populate formData for new interview from singleContact
  useEffect(() => {
    if (!id && singleContact) {
      const contact = singleContact;
      setFormData((prev) => ({
        ...prev,
        candidateName: `${contact.firstName || ""} ${
          contact.lastName || ""
        }`.trim(),
        higherQualification: contact.HigherQualification || "",
        currentExperience: contact.Experience || "",
        technology: contact.technologies?.[0] || "",
        Role: contact.currentRole || "",
        skills: contact.skills || [],
      }));
    }
  }, [singleContact, id]);

  // Populate formData for edit mode
  useEffect(() => {
    if (id && mockinterviewData.length > 0) {
      const MockEditData = mockinterviewData.find((moc) => moc._id === id);
      if (MockEditData) {
        setMockEdit(true);
        // Map interviewers to externalInterviewers format
        const formattedInterviewers =
          MockEditData.rounds?.[0]?.interviewers?.map((interviewer) => ({
            _id: interviewer._id,
            name:
              interviewer.contact?.Name ||
              `${interviewer.contact?.firstName || ""} ${
                interviewer.contact?.lastName || ""
              }`.trim(),
          })) || [];

        setExternalInterviewers(formattedInterviewers);
        setSelectedInterviewType(
          formattedInterviewers.length > 0 ? "external" : "scheduled"
        );

        console.log("Edit Mode - MockEditData:", MockEditData);
        console.log(
          "Edit Mode - Formatted Interviewers:",
          formattedInterviewers
        );
        console.log(
          "Edit Mode - Selected Interview Type:",
          formattedInterviewers.length > 0 ? "external" : "scheduled"
        );

        setFormData({
          skills: MockEditData.skills || [],
          candidateName: MockEditData.candidateName || "",
          higherQualification: MockEditData.higherQualification || "",
          currentExperience: MockEditData.currentExperience || "",
          technology: MockEditData.technology || "",
          jobDescription: MockEditData.jobDescription || "",
          Role: MockEditData.Role || "",
          rounds: {
            roundTitle: MockEditData.rounds?.[0]?.roundTitle || "",
            interviewMode: MockEditData.rounds?.[0]?.interviewMode || "",
            duration: MockEditData.rounds?.[0]?.duration || "30",
            instructions: MockEditData.rounds?.[0]?.instructions || "",
            interviewType:
              MockEditData.rounds?.[0]?.interviewType || "scheduled",
            interviewers:
              MockEditData.rounds?.[0]?.interviewers?.map((i) => i._id) || [],
            status: MockEditData.rounds?.[0]?.status || "Pending",
            dateTime: MockEditData.rounds?.[0]?.dateTime || "",
          },
        });
        setFileName(MockEditData?.resume?.filename);

        setInterviewType(
          MockEditData.rounds?.[0]?.interviewType || "scheduled"
        );
        if (MockEditData.rounds?.[0]?.dateTime) {
          const [startStr, endStr] =
            MockEditData.rounds[0].dateTime.split(" - ");
          const startDate = parseCustomDateTime(startStr);
          if (startDate && !isNaN(startDate.getTime())) {
            setScheduledDate(startDate.toISOString().slice(0, 16));
            setStartTime(startDate.toISOString());
            const endDate = endStr
              ? parseCustomDateTime(`${startStr.split(" ")[0]} ${endStr}`)
              : null;
            setEndTime(
              endDate && !isNaN(endDate.getTime()) ? endDate.toISOString() : ""
            );
            setCombinedDateTime(MockEditData.rounds[0].dateTime);
          }
        }

        // Populate skills entries
        if (MockEditData.skills?.length > 0) {
          const skillEntries = MockEditData.skills.map((skill) => ({
            skill: skill.skill || "",
            experience: skill.experience || "",
            expertise: skill.expertise || "",
          }));
          setEntries(skillEntries);
          setAllSelectedSkills(skillEntries.map((entry) => entry.skill));
        }
      }
    } else {
      updateTimes(formData.rounds.duration);
    }
  }, [id, mockinterviewData]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = getErrorMessage(name, value);
    if (name === "currentExperience") {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 1 || numValue > 15) {
        errorMessage = "Experience must be between 1 and 15";
      }
    } else {
      errorMessage = getErrorMessage(name, value);
    }

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

  const handleExperienceKeyDown = (e) => {
    if (
      [46, 8, 9, 27, 13].includes(e.keyCode) ||
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return;
    }
    if (
      (e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.group("Mock Interview Form Submission");
    console.log("Form data:", formData);
    console.log("Entries:", entries);
    console.log("Errors:", errors);
    console.log("External Interviewers:", externalInterviewers);
    console.log("Selected Interview Type:", selectedInterviewType);

    const { formIsValid, newErrors } = validatemockForm(
      formData,
      entries,
      errors
    );
    setErrors(newErrors);

    if (!formIsValid) {
      // v1.0.1 <--------------------------------------------------------
      scrollToFirstError(newErrors, fieldRefs);
      // v1.0.1 -------------------------------------------------------->
      console.error("Form is not valid:", newErrors);
      console.groupEnd();
      return;
    }

    const interviewerIds = externalInterviewers
      .filter((interviewer) => interviewer && interviewer._id)
      .map((interviewer) => interviewer._id);

    if (selectedInterviewType === "external" && interviewerIds.length === 0) {
      setErrors((prev) => ({
        ...prev,
        interviewers: "At least one interviewer must be selected",
      }));
      console.error("No interviewers selected");
      console.groupEnd();
      return;
    }

    const updatedFormData = {
      ...formData,
      rounds: {
        ...formData.rounds,
        interviewers: interviewerIds,
        interviewType:
          selectedInterviewType === "external" ? "external" : interviewType,
        dateTime: combinedDateTime,
      },
      entries,
      combinedDateTime,
    };

    console.log("Updated form data with interviewers:", updatedFormData);

    await addOrUpdateMockInterview(
      {
        formData: updatedFormData,
        id: mockEdit ? id : undefined,
        isEdit: mockEdit,
        userId,
        organizationId,
        resume,
        isResumeRemoved,
      },
      {
        onSuccess: () => {
          navigate("/mockinterview");
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
              interviewType: "scheduled",
              interviewers: [],
              status: "Pending",
              dateTime: "",
            },
          });
          setExternalInterviewers([]);
          setSelectedInterviewType(null);
          console.groupEnd();
        },
        //  <------------------  v1.0.0
        onError: (error) => {
          console.error("Error saving mock interview:", error);

          // More specific error message based on the error type
          let errorMessage = "Failed to save interview. Please try again.";

          if (error.response?.status === 500) {
            errorMessage =
              "Server error. Please try again later or contact support.";
          } else if (error.response?.status === 400) {
            errorMessage =
              "Invalid data. Please check your input and try again.";
          }

          setErrors((prev) => ({
            ...prev,
            submit: errorMessage,
          }));
          console.groupEnd();
        },
        // v1.0.0--------------------------->
      }
    );
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

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
  const inputRef = useRef();
  const [resume, setResume] = useState(null);
  const [isResumeRemoved, setIsResumeRemoved] = useState(false);
  const [resumeError, setResumeError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = await validateFile(file, "resume");
      if (error) {
        setResumeError(error);
        return;
      }
      setResumeError("");
      setResume(file);
      setFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setResume(null);
    setFileName("");
    setIsResumeRemoved(true);
    setResumeError("");
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
      const oldSkill = entries[editingIndex].skill;
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
      setAllSelectedSkills((prev) => {
        const newSkills = prev.filter((skill) => skill !== oldSkill);
        newSkills.push(selectedSkill);
        return newSkills;
      });
      setFormData((prevFormData) => ({
        ...prevFormData,
        skills: updatedEntries,
      }));
    } else {
      const newEntry = {
        skill: selectedSkill,
        experience: selectedExp,
        expertise: selectedLevel,
      };
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      setAllSelectedSkills([...allSelectedSkills, selectedSkill]);
      setAllSelectedExperiences([...allSelectedExperiences, selectedExp]);
      setAllSelectedExpertises([...allSelectedExpertises, selectedLevel]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        skills: updatedEntries,
      }));
    }

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
        const currentSkill = entries[editingIndex]?.skill;
        return (
          selectedSkill !== "" &&
          selectedExp !== "" &&
          selectedLevel !== "" &&
          (selectedSkill === currentSkill ||
            !allSelectedSkills.includes(selectedSkill))
        );
      } else {
        return (
          selectedSkill !== "" &&
          selectedExp !== "" &&
          selectedLevel !== "" &&
          !allSelectedSkills.includes(selectedSkill)
        );
      }
    } else if (currentStep === 1) {
      return selectedExp !== "";
    } else if (currentStep === 2) {
      return selectedLevel !== "";
    }
    return false;
  };

  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
  };

  const getTodayDate = () => new Date().toISOString().slice(0, 10);

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
    return `${formattedEndHour}:${endMinute
      .toString()
      .padStart(2, "0")} ${ampm}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [endTime, setEndTime] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const calculatedEndTime = calculateEndTime(
      startTime,
      formData.rounds.duration
    );
    setEndTime(calculatedEndTime);
    setDateTime(
      `${formatDate(selectedDate)} ${formatTime(
        startTime
      )} - ${calculatedEndTime}`
    );
  }, [startTime, formData.rounds.duration, selectedDate]);

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
    const calculatedEndTime = calculateEndTime(
      selectedStartTime,
      formData.rounds.duration
    );
    setEndTime(calculatedEndTime);
  };

  const handleConfirm = () => {
    const calculatedEndTime = calculateEndTime(
      startTime,
      formData.rounds.duration
    );
    setEndTime(calculatedEndTime);
    setDateTime(
      `${formatDate(selectedDate)} ${formatTime(
        startTime
      )} - ${calculatedEndTime}`
    );
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const [showDropdownTechnology, setShowDropdownTechnology] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleDropdownTechnology = () => {
    setShowDropdownTechnology(!showDropdownTechnology);
  };

  const handleTechnologySelect = (technology) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      technology: technology.TechnologyMasterName,
    }));
    setShowDropdownTechnology(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      technology: "",
    }));
  };

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      higherQualification: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      higherQualification: "",
    }));
  };

  const handleNext = () => {
    const { formIsValid, newErrors } = validatePage1(formData, entries);
    setErrors(newErrors);
    // v1.0.1 <----------------------------------------------------------------
    scrollToFirstError(newErrors, fieldRefs);
    // v1.0.1 ---------------------------------------------------------------->
    if (formIsValid) {
      setCurrentPage(2);
    } else {
      console.log("Page 1 validation failed:", newErrors);
    }
  };

  const updateTimes = (newDuration) => {
    let start = null;
    let end = null;

    if (interviewType === "instant") {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15);
      start = now;
      end = new Date(now);
      end.setMinutes(end.getMinutes() + Number(newDuration || 30));
    } else if (interviewType === "scheduled" && scheduledDate) {
      start = new Date(scheduledDate);
      if (isNaN(start.getTime())) return;
      end = new Date(start);
      end.setMinutes(end.getMinutes() + Number(newDuration || 30));
    }

    if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
      setStartTime(start.toISOString());
      setEndTime(end.toISOString());
      const formattedStart = formatToCustomDateTime(start);
      const formattedEnd = formatToCustomDateTime(end).split(" ")[1];
      setCombinedDateTime(`${formattedStart} - ${formattedEnd}`);
      setFormData((prev) => ({
        ...prev,
        rounds: {
          ...prev.rounds,
          dateTime: `${formattedStart} - ${formattedEnd}`,
        },
      }));
    }
  };

  useEffect(() => {
    updateTimes(formData.rounds.duration);
  }, [formData.rounds.interviewType, scheduledDate, formData.rounds.duration]);

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

  const handleExternalInterviewerSelect = (newInterviewers) => {
    const formattedInterviewers = newInterviewers.map((interviewer) => ({
      _id: interviewer._id,
      name:
        interviewer.contact?.Name ||
        `${interviewer.contact?.firstName || ""} ${
          interviewer.contact?.lastName || ""
        }`.trim(),
    }));

    // Merge new interviewers with existing ones, avoiding duplicates
    setExternalInterviewers((prev) => {
      const existingIds = prev.map((i) => i._id);
      const uniqueNewInterviewers = formattedInterviewers.filter(
        (i) => !existingIds.includes(i._id)
      );
      return [...prev, ...uniqueNewInterviewers];
    });

    setSelectedInterviewType("external");
  };

  const handleRemoveExternalInterviewer = (interviewerId) => {
    setExternalInterviewers((prev) =>
      prev.filter((i) => i._id !== interviewerId)
    );
    setFormData((prev) => ({
      ...prev,
      rounds: {
        ...prev.rounds,
        interviewers: prev.rounds.interviewers.filter(
          (id) => id !== interviewerId
        ),
      },
    }));
    if (externalInterviewers.length === 1) {
      setSelectedInterviewType("scheduled");
    }
  };

  const handleClearAllInterviewers = () => {
    setExternalInterviewers([]);
    setFormData((prev) => ({
      ...prev,
      rounds: {
        ...prev.rounds,
        interviewers: [],
      },
    }));
    setSelectedInterviewType("scheduled");
  };

  const selectedInterviewers =
    selectedInterviewType === "external" ? externalInterviewers : [];

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-lg w-full flex flex-col">
        <div className="mt-4 mb-4">
          <h2 className="text-2xl font-semibold px-[13%] sm:mt-5 sm:mb-2 sm:text-lg sm:px-[5%] md:mt-6 md:mb-2 md:text-xl md:px-[5%]">
            Schedule Mock Interview
          </h2>
        </div>

        <div className="px-[13%] sm:px-[5%] md:px-[5%]">
          <div className="bg-white rounded-lg shadow-md border">
            <div className="flex justify-between items-center px-5 pt-4">
              <h2 className="text-lg font-semibold sm:text-md">
                {currentPage === 1
                  ? "Candidate Details:"
                  : "Interview Details:"}
              </h2>
            </div>

            <div className="px-6 pt-3">
              <form className="space-y-5 mb-5">
                {currentPage === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
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
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                              errors.candidateName
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.candidateName && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.candidateName}
                            </p>
                          )}
                        </div>
                      </div>
                      <CustomDropdown
                        // v1.0.1 <-----------------------------------------------------------------
                        ref={fieldRefs.higherQualification}
                        // v1.0.1 ----------------------------------------------------------------->
                        label="Higher Qualification"
                        name="HigherQualification"
                        value={formData.higherQualification}
                        options={qualifications}
                        onChange={handleDropdownChange}
                        error={errors.higherQualification}
                        placeholder="Select Higher Qualification"
                        optionKey="QualificationName"
                        optionValue="QualificationName"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                      <div>
                        <label
                          htmlFor="technology"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Technology <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-grow relative">
                          <div className="relative">
                            <input
                              // v.0.1 <--------------------------------------------------------
                              ref={fieldRefs.technology}
                              // v.0.1 -------------------------------------------------------->
                              value={formData.technology}
                              onClick={toggleDropdownTechnology}
                              name="technology"
                              type="text"
                              id="Technology"
                              readOnly
                              // className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                              //   errors.technology
                              //     ? "border-red-500 focus:ring-red-500"
                              //     : "border-gray-300"
                              // }`}
                              className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                                border ${
                                  errors.technology
                                    ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                                    : "border-gray-300 focus:ring-red-300"
                                }
                                focus:outline-gray-300
                              `}
                            />
                            {errors.technology && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.technology}
                              </p>
                            )}
                          </div>
                          {showDropdownTechnology && (
                            <div className="absolute z-50 w-full bg-white shadow-md rounded-md mt-1 max-h-40 overflow-y-auto">
                              {technologies.map((technology, index) => (
                                <div
                                  key={index}
                                  className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                  onClick={() =>
                                    handleTechnologySelect(technology)
                                  }
                                >
                                  {technology.TechnologyMasterName}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div>
                          <label
                            htmlFor="currentExperience"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Current Experience{" "}
                            <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <div className="flex-grow">
                          {/* v1.0.0 <-------------------------------------------------------------- */}
                          <input
                            ref={fieldRefs.currentExperience}
                            type="number"
                            name="currentExperience"
                            value={formData.currentExperience}
                            onChange={handleChange}
                            id="Experience"
                            min="1"
                            max="15"
                            autoComplete="off"
                            onKeyDown={handleExperienceKeyDown}
                            // className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                            //   errors.currentExperience
                            //     ? "border-red-500 focus:ring-red-500"
                            //     : "border-gray-300"
                            // }`}
                            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                              border ${
                                errors.currentExperience
                                  ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                                  : "border-gray-300 focus:ring-red-300"
                              }
                              focus:outline-gray-300
                            `}
                          />
                          {errors.currentExperience && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.currentExperience}
                            </p>
                          )}
                          {/* v1.0.1 --------------------------------------------------------------> */}
                        </div>
                      </div>
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
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                              errors.Role
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.Role && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.Role}
                            </p>
                          )}
                          {showDropdownRole && (
                            <div className="absolute z-50 w-full bg-white shadow-md rounded-md mt-1 max-h-40 overflow-y-auto">
                              {currentRoles.map((role, index) => (
                                <div
                                  key={index}
                                  className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleRoleSelect(role)}
                                >
                                  {role.RoleName}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      {/* v1.0.0 <---------------------------------------------------------------- */}
                      <SkillsField
                        ref={fieldRefs.skills}
                        entries={entries}
                        errors={errors}
                        onAddSkill={(setEditingIndex) => {
                          setEntries((prevEntries) => {
                            const newEntries = [
                              ...prevEntries,
                              { skill: "", experience: "", expertise: "" },
                            ];
                            setEditingIndex(newEntries.length - 1);
                            return newEntries;
                          });
                          setSelectedSkill("");
                          setSelectedExp("");
                          setSelectedLevel("");
                        }}
                        onEditSkill={(index) => {
                          const entry = entries[index];
                          setSelectedSkill(entry.skill || "");
                          setSelectedExp(entry.experience);
                          setSelectedLevel(entry.expertise);
                        }}
                        onDeleteSkill={(index) => {
                          const entry = entries[index];
                          setAllSelectedSkills(
                            allSelectedSkills.filter(
                              (skill) => skill !== entry.skill
                            )
                          );
                          setEntries(entries.filter((_, i) => i !== index));
                        }}
                        setIsModalOpen={setIsModalOpen}
                        setEditingIndex={setEditingIndex}
                        isModalOpen={isModalOpen}
                        currentStep={currentStep}
                        setCurrentStep={setCurrentStep}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        selectedSkill={selectedSkill}
                        setSelectedSkill={setSelectedSkill}
                        allSelectedSkills={allSelectedSkills}
                        selectedExp={selectedExp}
                        setSelectedExp={setSelectedExp}
                        selectedLevel={selectedLevel}
                        setSelectedLevel={setSelectedLevel}
                        skills={skills}
                        expertiseOptions={expertiseOptions}
                        experienceOptions={experienceOptions}
                        isNextEnabled={isNextEnabled}
                        handleAddEntry={handleAddEntry}
                        skillpopupcancelbutton={skillpopupcancelbutton}
                        editingIndex={editingIndex}
                      />
                      {/* v1.0.0 -------------------------------------------------------------------> */}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Description
                      </label>
                      <textarea
                        onChange={handleChange}
                        name="jobDescription"
                        id="jobDescription"
                        value={formData.jobDescription}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none`}
                        rows={6}
                        placeholder="This interview template is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."
                      ></textarea>
                    </div>
                    <div className="text-center text-sm p-2">(OR)</div>
                    <div className="w-full flex justify-center">
                      <div className="w-full ms-[40%] flex items-center justify-center gap-5">
                        <label
                          htmlFor="fileUpload"
                          className="text-sm font-medium text-gray-900"
                        >
                          Resume
                        </label>
                        <div className="flex-grow">
                          <div className="flex items-center mt-3">
                            <button
                              onClick={() =>
                                document.getElementById("fileUpload").click()
                              }
                              className="bg-custom-blue text-white px-4 py-1 rounded cursor-pointer"
                              type="button"
                            >
                              Upload File
                            </button>
                            <input
                              ref={inputRef}
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
                                type="button"
                                title="Remove Resume"
                                onClick={handleRemoveFile}
                                className="text-red-500 text-sm ml-3"
                              >
                                <X />
                              </button>
                            )}
                          </div>
                          {/* {errors.Resume && (
                            <p className="text-red-500 text-sm">
                              {errors.Resume}
                            </p>
                          )} */}
                          <p className="text-red-500 text-sm font-semibold mt-2">
                            {resumeError}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {currentPage === 2 && (
                  <>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">
                      <div>
                        <label
                          htmlFor="rounds.roundTitle"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Round Title *
                        </label>
                        {/* v1.0.0 <---------------------------------------------------------------------- */}
                        <input
                          ref={fieldRefs["rounds.roundTitle"]}
                          id="rounds.roundTitle"
                          name="rounds.roundTitle"
                          value={formData.rounds.roundTitle}
                          onChange={handleChange}
                          // className={`mt-1 block w-full border ${
                          //   errors["rounds.roundTitle"]
                          //     ? "border-red-500"
                          //     : "border-gray-300"
                          // } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                            border ${
                              errors["rounds.roundTitle"]
                                ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                                : "border-gray-300 focus:ring-red-300"
                            }
                            focus:outline-gray-300
                          `}
                          required
                        />
                        {errors["rounds.roundTitle"] && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors["rounds.roundTitle"]}
                          </p>
                        )}
                        {/* v1.0.0 ----------------------------------------------------------------------> */}
                      </div>
                      <div>
                        <label
                          htmlFor="rounds.interviewMode"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Interview Mode *
                        </label>
                        {/* v1.0.0 <----------------------------------------------------------------- */}
                        <select
                          ref={fieldRefs["rounds.interviewMode"]}
                          id="rounds.interviewMode"
                          name="rounds.interviewMode"
                          value={formData.rounds.interviewMode}
                          onChange={(event) => {
                            const { name, value } = event.target;
                            setFormData((prevData) => ({
                              ...prevData,
                              rounds: {
                                ...prevData.rounds,
                                [name.split(".")[1]]: value,
                              },
                            }));
                            setErrors((prevErrors) => ({
                              ...prevErrors,
                              [name]: value ? "" : "This field is required",
                            }));
                          }}
                          // className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                          //   errors.interviewMode
                          //     ? "border-red-500"
                          //     : "border-gray-300"
                          // } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
                          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                            border ${
                              errors["rounds.interviewMode"]
                                ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                                : "border-gray-300 focus:ring-red-300"
                            }
                            focus:outline-gray-300
                          `}
                          required
                        >
                          <option value="">Select Interview Mode</option>
                          <option value="Face to Face">Face to Face</option>
                          <option value="Virtual">Virtual</option>
                        </select>
                        {errors["rounds.interviewMode"] && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors["rounds.interviewMode"]}
                          </p>
                        )}
                        {/* v1.0.0 -----------------------------------------------------------------> */}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interview Scheduling
                      </label>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                        <button
                          type="button"
                          onClick={() => {
                            setInterviewType("instant");
                            setFormData((prev) => ({
                              ...prev,
                              rounds: {
                                ...prev.rounds,
                                interviewType: "instant",
                              },
                            }));
                          }}
                          className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${
                            interviewType === "instant"
                              ? "border-custom-blue bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <Clock
                            className={`h-6 w-6 ${
                              interviewType === "instant"
                                ? "text-custom-blue"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`mt-2 font-medium ${
                              interviewType === "instant"
                                ? "text-custom-blue"
                                : "text-gray-900"
                            }`}
                          >
                            Instant Interview
                          </span>
                          <span className="mt-1 text-sm text-gray-500">
                            Starts in 15 minutes
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInterviewType("scheduled");
                            setFormData((prev) => ({
                              ...prev,
                              rounds: {
                                ...prev.rounds,
                                interviewType: "scheduled",
                              },
                            }));
                          }}
                          className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${
                            interviewType === "scheduled"
                              ? "border-custom-blue bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <Calendar
                            className={`h-6 w-6 ${
                              interviewType === "scheduled"
                                ? "text-custom-blue"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`mt-2 font-medium ${
                              interviewType === "scheduled"
                                ? "text-custom-blue"
                                : "text-gray-900"
                            }`}
                          >
                            Schedule for Later
                          </span>
                          <span className="mt-1 text-sm text-gray-500">
                            Pick date & time
                          </span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-2">
                        {interviewType === "scheduled" && (
                          <div className="mt-4">
                            <label
                              htmlFor="scheduledDate"
                              className="block text-sm font-medium text-gray-700"
                            >
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
                          <label
                            htmlFor="rounds.duration"
                            className="block text-sm font-medium text-gray-700"
                          >
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
                            <Clock className="h-5 w-5 text-custom-blue mr-2" />
                            <p className="text-sm text-custom-blue">
                              Interview will start at{" "}
                              <span className="font-medium">
                                {new Date(startTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>{" "}
                              and end at{" "}
                              <span className="font-medium">
                                {new Date(endTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
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
                      <label className="block text-sm font-medium text-gray-700">
                        Interviewers
                      </label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          onClick={() => setShowOutsourcePopup(true)}
                          variant="outline"
                          size="sm"
                          className={`${
                            selectedInterviewType === "external" ? "" : ""
                          }`}
                          disabled={false}
                          title=""
                        >
                          <User className="h-4 w-4 mr-1 text-orange-600" />
                          Select Outsourced
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                      {selectedInterviewers.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center">
                          No interviewers selected
                        </p>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm text-gray-700">
                                {selectedInterviewers.length} interviewer
                                {selectedInterviewers.length !== 1
                                  ? "s"
                                  : ""}{" "}
                                selected
                                <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">
                                  Outsourced
                                </span>
                              </span>
                            </div>
                            {selectedInterviewers.length > 0 && (
                              <button
                                type="button"
                                onClick={handleClearAllInterviewers}
                                className="text-sm text-red-600 hover:text-red-800 flex items-center"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Clear All
                              </button>
                            )}
                          </div>
                          <div className="mb-3">
                            <h4 className="text-xs font-medium text-gray-500 mb-2">
                              Outsourced Interviewers
                            </h4>
                            <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                              {externalInterviewers.map((interviewer) => (
                                <div
                                  key={interviewer._id}
                                  className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-md p-2"
                                >
                                  <div className="flex items-center">
                                    <span className="ml-2 text-sm text-orange-800 truncate">
                                      {interviewer.name}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveExternalInterviewer(
                                        interviewer._id
                                      )
                                    }
                                    className="text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-100"
                                    title="Remove interviewer"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.interviewers && (
                      <p className="text-red-500 text-sm -mt-5">
                        {errors.interviewers}
                      </p>
                    )}
                    <div>
                      <label
                        htmlFor="rounds.instructions"
                        className="block text-sm font-medium text-gray-700"
                      >
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
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
          {currentPage === 1 ? (
            <div className="flex justify-end gap-4 mt-5 mb-4">
              <button
                className="border border-custom-blue p-3 rounded py-1"
                onClick={() => navigate("/mockinterview")}
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleNext}
                isLoading={isMutationLoading}
                loadingText={mockEdit ? "Updating..." : "Saving..."}
              >
                {mockEdit ? "Update" : "Save"} & Next
              </LoadingButton>
            </div>
          ) : (
            <div className="flex justify-end gap-4 mt-5 mb-4">
              <button
                className="border border-custom-blue p-3 rounded py-1"
                onClick={() => setCurrentPage(1)}
              >
                Back
              </button>
              <LoadingButton
                onClick={(e) => handleSubmit(e)}
                isLoading={isMutationLoading}
                loadingText={mockEdit ? "Updating..." : "Saving..."}
              >
                {formData.rounds.interviewType === "instant"
                  ? "Save & Schedule"
                  : "Save"}
              </LoadingButton>
            </div>
          )}
          {showPopup && (
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
          )}
        </div>
      </div>
      {showOutsourcePopup && (
        <OutsourceOption
          onClose={() => setShowOutsourcePopup(false)}
          dateTime={combinedDateTime}
          onProceed={handleExternalInterviewerSelect}
          skills={formData.skills}
          navigatedfrom="mock-interview"
        />
      )}
    </div>
  );
};

export default MockSchedulelater;
