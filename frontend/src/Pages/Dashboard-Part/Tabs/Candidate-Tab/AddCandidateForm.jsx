/* v1.0.0 - Ashok - Fixed an error occurring when clicking the 'Add Candidate' button. 
   The candidate was saved successfully the first time, but an error occurred on the second attempt
*/

// v1.0.1 - Venkatesh - added custom university
// v1.0.2 - Ashok - disabled the scroll conditionally based on the isModalOpen state and added scroll to top logic after form submission
// v1.0.3 - Ashok - Added navigating to invalid fields after form submission and removed form outline
// v1.0.4 - Ashok - improved outline and border when errors in fields
// v1.0.5 - Ashok - Fixed style issues
/* eslint-disable react/prop-types */
// v1.0.6 - Ashok - Improved responsiveness and added sidebarPopup common code to popup to modal
// v1.0.7 - Ashok - Fixed issues in responsiveness
// v1.0.8 - Ashok - Fixed responsiveness issues
// v1.0.9 - Ashok - Fixed scroll to first error field issue
// v2.0.0 - Ashok - Fixed style issues and added some logic to reset custom skill

import React, { useState, useRef, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ReactComponent as FaPlus } from "../../../../icons/FaPlus.svg";
import {
  validateCandidateForm,
  getErrorMessage,
} from "../../../../utils/CandidateValidation";
import Cookies from "js-cookie";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import {
  useCandidates,
  useCandidateById,
  useValidateEmail,
  useValidatePhone,
  useValidateLinkedIn,
} from "../../../../apiHooks/useCandidates";
import LoadingButton from "../../../../Components/LoadingButton";
import SkillsField from "../CommonCode-AllTabs/SkillsInput";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import { validateFile } from "../../../../utils/FileValidation/FileValidation";
// Field components
import ProfilePhotoUpload from "../../../../Components/FormFields/ProfilePhotoUpload";
import ResumeUpload from "../../../../Components/FormFields/ResumeUpload";
import DateOfBirthField from "../../../../Components/FormFields/DateOfBirthField";
import GenderDropdown from "../../../../Components/FormFields/GenderDropdown";
import EmailField from "../../../../Components/FormFields/EmailField";
import PhoneField from "../../../../Components/FormFields/PhoneField";

// v1.0.2 <---------------------------------------------------------------------
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
// v1.0.2 --------------------------------------------------------------------->
// v1.0.3 <----------------------------------------------------------------------------------
import { scrollToFirstError } from "../../../../utils/ScrollToFirstError/scrollToFirstError";
// v1.0.3 ----------------------------------------------------------------------------------->

import { notify } from "../../../../services/toastService";
import {
  ArrowLeft,
  Briefcase,
  Dot,
  Edit,
  ExternalLink,
  Info,
  X,
} from "lucide-react";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";
import IncreaseAndDecreaseField from "../../../../Components/FormFields/IncreaseAndDecreaseField";
import InputField from "../../../../Components/FormFields/InputField";
import { Button } from "../../../../Components/Buttons/Button";
import { useApplicationMutations } from "../../../../apiHooks/useApplications";
import DescriptionField from "../../../../Components/FormFields/DescriptionField";
// v1.0.3 ----------------------------------------------------------------->

// Main AddCandidateForm Component
const AddCandidateForm = ({
  mode,
  onClose,
  isModal = false,
  hideAddButton = false,
  candidateId = null, // Optional: Pass candidateId when using as modal for editing
  // initialData = {}, // ← new prop for pre-filling
  screeningData = {},
  source = "",
  positionId,
  shouldCreateApplication = false, // ← new prop, default false
  onSaveStart, // ← new callback
}) => {
  console.log("mode", mode);
  console.log("candidateId", candidateId);

  const pageType = "adminPortal";
  const {
    skills,
    colleges,
    qualifications,
    currentRoles,
    locations,
    loadSkills,
    loadColleges,
    loadQualifications,
    loadCurrentRoles,
    loadLocations,
    isQualificationsFetching,
    isCollegesFetching,
    isCurrentRolesFetching,
    isLocationsFetching,
  } = useMasterData({}, pageType);

  // Get user token information
  const tokenPayload = decodeJwt(Cookies.get("authToken"));

  const userId = tokenPayload?.userId;
  const orgId = tokenPayload?.tenantId;
  const isOrganization = tokenPayload?.organization === true;

  // v1.0.2 <----------------------------------------------------------------
  useScrollLock(true);

  const formRef = useRef(null);
  // v1.0.2 ----------------------------------------------------------------->
  const {
    // candidateData is no longer used here; edits now rely on useCandidateById
    isLoading: _isLoading,
    isQueryLoading: _isQueryLoading,
    isMutationLoading,
    isError: _isError,
    error: _error,
    addOrUpdateCandidate,
  } = useCandidates();
  const { createApplication, isCreating } = useApplicationMutations();
  const { id: routeId } = useParams();
  // Use candidateId prop when in modal mode, otherwise use route param
  const id = isModal ? candidateId : routeId;
  const { candidate: selectedCandidate } = useCandidateById(id);
  const navigate = useNavigate();
  const location = useLocation();

  const imageInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  // const [imageFile, setImageFile] = useState(null);
  // const [resumeFile, setResumeFile] = useState(null);

  // State for tooltip visibility
  const [showTooltip, setShowTooltip] = useState(false);
  // 2. Optional: Re-apply if initialData changes later (rare case)
  // Inside AddCandidateForm component

  // 3. Make sure entries are initialized correctly too (for skills)
  // useEffect(() => {
  //   if (initialData.skills?.length > 0) {
  //     setEntries(initialData.skills); // ← pre-fill entries from initialData.skills
  //   } else {
  //     // Default empty rows if no pre-fill
  //     setEntries([
  //       { skill: "", experience: "", expertise: "" },
  //       { skill: "", experience: "", expertise: "" },
  //       { skill: "", experience: "", expertise: "" },
  //     ]);
  //   }
  // }, [initialData.skills]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTooltip && !event.target.closest(".tooltip-container")) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

  // Initialize with 3 default empty skill rows
  const [entries, setEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [allSelectedSkills, setAllSelectedSkills] = useState([]);
  // const [allSelectedExperiences, setAllSelectedExperiences] = useState([]);
  // const [allSelectedExpertises, setAllSelectedExpertises] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  // const [filePreview, setFilePreview] = useState(null);
  // const [isImageUploaded, setIsImageUploaded] = useState(false);

  //<----v1.0.1 - University dropdown state---
  const [isCustomUniversity, setIsCustomUniversity] = useState(false);

  //----v1.0.1--->

  // const experienceCurrentOptions = Array.from({ length: 16 }, (_, i) => i);
  const genderOptions = ["Male", "Female"];
  // Near other options (useMemo or direct const)
  const noticePeriodOptions = [
    { value: "Immediate", label: "Immediate (0 days)" },
    { value: "7days", label: "7 Days" },
    { value: "15days", label: "15 Days" },
    { value: "30days", label: "30 Days" },
    { value: "45days", label: "45 Days" },
    { value: "60days", label: "60 Days" },
    { value: "90days", label: "90 Days" },
    { value: "Morethan90days", label: "More than 90 Days" },
    { value: "Negotiable", label: "Negotiable" },
  ];

  // ----------------------------- new fields ----------------
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    projectName: "",
    role: "",
    fromDate: "",
    toDate: "",
    responsibilities: "",
  });
  const [editingProjectIndex, setEditingProjectIndex] = useState(null);
  const [projectErrors, setProjectErrors] = useState({});
  // ----------------------------- new fields ----------------

  // v1.0.3 <---------------------------------------------------------------------------
  const fieldRefs = {
    FirstName: useRef(null),
    LastName: useRef(null),
    Gender: useRef(null),
    Email: useRef(null),
    externalId: useRef(null),
    CountryCode: useRef(null),
    Phone: useRef(null),
    HigherQualification: useRef(null),
    UniversityCollege: useRef(null),
    CurrentExperience: useRef(null),
    RelevantExperience: useRef(null),
    CurrentRole: useRef(null),
    skills: useRef(null),
    // Technology: useRef(null),
    linkedInUrl: useRef(null),
    professionalSummary: useRef(null),
    keyAchievements: useRef(null),
    workExperience: useRef(null),
    location: useRef(null),
    minSalary: useRef(null),
    maxSalary: useRef(null),
    languages: useRef(null),
    certifications: useRef(null),
    noticePeriod: useRef(null),
  };

  // v1.0.3 --------------------------------------------------------------------------->
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    externalId: "",
    Phone: "",
    Date_Of_Birth: "",
    Gender: "",
    HigherQualification: "",
    UniversityCollege: "",
    CurrentExperience: "",
    RelevantExperience: "",
    CountryCode: "+91",
    skills: [],
    CurrentRole: "",
    linkedInUrl: "",
    professionalSummary: "",
    keyAchievements: "",
    workExperience: [],
    location: "",
    maxSalary: "",
    minSalary: "",
    languages: [],
    certifications: [],
    noticePeriod: "",
  });
  const [errors, setErrors] = useState({});

  const [isProfilePicRemoved, setIsProfilePicRemoved] = useState(false);
  const [isResumeRemoved, setIsResumeRemoved] = useState(false);
  const [fileError, setFileError] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [activeButton, setActiveButton] = useState(null); // 'save' or 'add' or null
  const [showSkillValidation, setShowSkillValidation] = useState(false); // Track if skills validation should show

  // const authToken = Cookies.get("authToken");
  // const tokenPayload = decodeJwt(authToken);
  // const userId = tokenPayload?.userId;

  // --------------------------------------- new fields version 2 -----------------------
  const [certInput, setCertInput] = useState("");

  const handleCertKeyDown = (e) => {
    if (e.key === "Enter") {
      // Stop the form from submitting
      e.preventDefault();
      e.stopPropagation();

      const newCert = certInput.trim();

      if (newCert) {
        if (formData.certifications.length >= 10) {
          notify.warning("Maximum 10 certifications allowed");
          return;
        }

        if (
          formData.certifications.some(
            (c) => c.toLowerCase() === newCert.toLowerCase(),
          )
        ) {
          notify.info("This certification is already added");
          return;
        }

        setFormData((prev) => ({
          ...prev,
          certifications: [...prev.certifications, newCert],
        }));

        // Clear the input
        setCertInput("");
      }
    }
  };

  const removeCert = (certToRemove) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c !== certToRemove),
    }));
  };

  // Inside AddCandidateForm component
  const [isCustomLocation, setIsCustomLocation] = useState(false);

  // Memoize location options from master data
  const locationOptionsRS = useMemo(
    () =>
      (locations || [])
        .map((l) => ({
          value: l?.LocationName,
          label: l?.LocationName,
        }))
        .concat([{ value: "__other__", label: "+ Others" }]),
    [locations],
  );

  // Effect to handle custom location display in Edit mode
  useEffect(() => {
    const saved = (formData.location || "").trim();
    if (!saved || !Array.isArray(locations) || locations.length === 0) return;

    const list = locations.map((l) =>
      (l?.LocationName || "").trim().toLowerCase(),
    );
    const existsInList = list.includes(saved.toLowerCase());
    setIsCustomLocation(!existsInList);
  }, [locations, formData.location]);
  // --------------------------------------- new fields version 2 -----------------------

  useEffect(() => {
    // IMPORTANT: Skip DB pre-fill when coming from screening — we want screening data instead
    if (source === "candidate-screening") {
      console.log("Skipping DB pre-fill because source is candidate-screening");
      return;
    }
    if (id && selectedCandidate) {
      const dob = selectedCandidate.Date_Of_Birth;

      setFormData({
        FirstName: selectedCandidate.FirstName || "",
        LastName: selectedCandidate.LastName || "",
        Email: selectedCandidate.Email || "",
        externalId: selectedCandidate.externalId || "",
        Phone: selectedCandidate.Phone || "",
        Date_Of_Birth: dob ? format(dob, "MMMM dd, yyyy") : "",
        Gender: selectedCandidate.Gender || "",
        HigherQualification: selectedCandidate.HigherQualification || "",
        UniversityCollege: selectedCandidate.UniversityCollege || "",
        CurrentExperience: selectedCandidate.CurrentExperience || "",
        RelevantExperience: selectedCandidate.RelevantExperience || "",
        skills: selectedCandidate.skills || [],
        // ImageData: selectedCandidate.imageUrl || null,
        ImageData: selectedCandidate?.ImageData || null, // Added by Ashok
        resume: selectedCandidate?.resume || null,
        CurrentRole: selectedCandidate?.CurrentRole || "",
        CountryCode: selectedCandidate?.CountryCode || "",
        // Technology: selectedCandidate?.Technology || "",
        linkedInUrl: selectedCandidate.linkedInUrl || "",
        professionalSummary: selectedCandidate.professionalSummary || "",
        keyAchievements: selectedCandidate.keyAchievements || "",
        workExperience: selectedCandidate.workExperience || [],
        location: selectedCandidate?.location || "",
        minSalary: selectedCandidate?.minSalary || "",
        maxSalary: selectedCandidate?.maxSalary || "",
        languages: selectedCandidate?.languages || [],
        certifications: selectedCandidate?.certifications || [],
        noticePeriod: selectedCandidate?.noticePeriod || "",
      });

      if (selectedCandidate.ImageData?.filename) {
        setImagePreview(selectedCandidate?.ImageData.path);
        setSelectedImage(selectedCandidate?.ImageData);
      } else {
        setImagePreview(null);
        setSelectedImage(null);
      }

      if (selectedCandidate.resume?.filename) {
        setSelectedResume({
          path: selectedCandidate?.resume.path,
          name: selectedCandidate?.resume.filename,
          size: selectedCandidate?.resume.fileSize,
        });
      } else {
        setSelectedResume(null);
      }

      // In edit mode, use existing skills or default to 3 empty rows
      const candidateSkills = selectedCandidate.skills || [];
      if (candidateSkills.length === 0) {
        setEntries([
          { skill: "", experience: "", expertise: "" },
          { skill: "", experience: "", expertise: "" },
          { skill: "", experience: "", expertise: "" },
        ]);
      } else {
        setEntries(candidateSkills);
      }
      // Initialize allSelectedSkills with the skills from the candidate being edited
      setAllSelectedSkills(
        selectedCandidate.skills?.map((skill) => skill.skill) || [],
      );
      // setAllSelectedExperiences(selectedCandidate.skills?.map(skill => skill.experience) || []);
      // setAllSelectedExpertises(selectedCandidate.skills?.map(skill => skill.expertise) || []);
    }
  }, [id, selectedCandidate, source]);

  // Ensure form starts with 3 default skill rows when in Add mode
  useEffect(() => {
    if (!id && entries.length === 0) {
      setEntries([
        { skill: "", experience: "", expertise: "" },
        { skill: "", experience: "", expertise: "" },
        { skill: "", experience: "", expertise: "" },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id to run when form mode changes

  useEffect(() => {
    if (source !== "candidate-screening" || !screeningData) {
      console.log("Screening pre-fill SKIPPED — source or data missing");
      return;
    }

    console.log("SCREENING PRE-FILL RUNNING — full data:", {
      skillsCount: screeningData.parsed_skills?.length,
      experience: screeningData.parsed_experience,
      education: screeningData.parsed_education,
      name: screeningData.candidate_name,
    });

    const sd = screeningData;

    const parsedSkills = sd.parsed_skills || [];
    const parsedExperience = sd.parsed_experience || "";
    const parsedEducation = sd.parsed_education || "";

    // Parse years from "6 Years" string
    const experienceYears =
      Number(sd.screening_result?.experience_years) ||
      parseFloat(parsedExperience.match(/(\d+(\.\d+)?)/)?.[0]) ||
      0;

    const newFormData = {
      // ── Name ────────────────────────────────────────
      FirstName: sd.candidate_name?.split(" ")[0]?.trim() || "",
      LastName: sd.candidate_name?.split(" ").slice(1).join(" ").trim() || "",

      // ── Contact ─────────────────────────────────────
      Email: sd.candidate_email?.trim() || "",
      CountryCode: sd.candidate_country_code || "+91",
      Phone: sd.candidate_phone
        ? sd.candidate_phone
          .replace(/^\+\d{1,3}/, "")
          .replace(/^\d{1,3}/, "")
          .trim()
        : "",

      // ── Education ───────────────────────────────────
      HigherQualification:
        parsedEducation || sd.screening_result?.education || "",
      UniversityCollege:
        sd.screening_result?.university ||
        parsedEducation.match(/University\s+of\s+([\w\s]+)/i)?.[1]?.trim() ||
        parsedEducation.match(/([\w\s]+)\s+University/i)?.[1]?.trim() ||
        parsedEducation.split(",").pop()?.trim() ||
        "",

      // ── Experience ──────────────────────────────────
      CurrentExperience: experienceYears,
      RelevantExperience: experienceYears,

      // ── Skills ──────────────────────────────────────
      skills:
        parsedSkills.length > 0
          ? parsedSkills.map((name) => ({
            skill: (name || "").trim(),
            experience: "",
            expertise: "Beginner",
          }))
          : (sd.screening_result?.extracted_skills || []).map((name) => ({
            skill: (name || "").trim(),
            experience: "",
            expertise: "Beginner",
          })),

      // ── New Fields (Resume Analysis) ─────────────────
      professionalSummary:
        sd.screening_result?.summary ||
        sd.screening_result?.professionalSummary ||
        "",
      keyAchievements: sd.screening_result?.strengths?.join("\n• ")
        ? "• " + sd.screening_result.strengths.join("\n• ")
        : "",
      workExperience:
        sd.screening_result?.workHistory?.map((job) => ({
          projectName: job.company || "",
          role: job.role || "",
          fromDate: job.duration ? job.duration.split("-")[0]?.trim() : "",
          toDate: job.duration ? job.duration.split("-")[1]?.trim() : "",
          responsibilities: Array.isArray(job.responsibilities)
            ? job.responsibilities.map((r) => `• ${r}`).join("\n")
            : job.responsibilities || "",
        })) || [],

      linkedInUrl: sd.linkedInUrl || "",

      // ── Resume File ──────────────────────────────────
      resume: sd.resume_file || null,
    };

    console.log("Setting formData with:", {
      skills: newFormData.skills.length,
      experience: newFormData.CurrentExperience,
      name: `${newFormData.FirstName} ${newFormData.LastName}`,
    });

    // Apply form data
    setFormData((prev) => ({ ...prev, ...newFormData }));

    // Set skill entries (critical for SkillsField to show them)
    if (newFormData.skills.length > 0) {
      console.log("Setting entries to", newFormData.skills.length, "skills");
      setEntries(newFormData.skills);
      setAllSelectedSkills(newFormData.skills.map((s) => s.skill));
    }
  }, [screeningData, source]);

  // Ensure University/College custom input is shown in edit mode when the saved value
  // is not present in master list (handles the '+ Others' flow gracefully)
  useEffect(() => {
    const saved = (formData.UniversityCollege || "").trim();
    // When nothing saved, keep dropdown mode
    if (!saved) {
      setIsCustomUniversity(false);
      return;
    }
    // Avoid forcing custom mode if colleges are not loaded yet
    if (!Array.isArray(colleges) || colleges.length === 0) {
      return;
    }
    const list = (colleges || []).map((c) =>
      (c?.University_CollegeName || "").trim().toLowerCase(),
    );
    const existsInList = list.includes(saved.toLowerCase());
    setIsCustomUniversity(!existsInList);
  }, [colleges, formData.UniversityCollege]);

  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    setSearchTerm("");
    setSelectedSkill("");
  };

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
          : entry,
      );
      setEntries(updatedEntries);
      setEditingIndex(null);
      setAllSelectedSkills((prev) => {
        const newSkills = prev.filter((skill) => skill !== oldSkill);
        newSkills.push(selectedSkill);
        return newSkills;
      });

      setEditingIndex(null);

      // setAllSelectedSkills([selectedSkill]);
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = await validateFile(file, "image");
      if (error) {
        setFileError(error);
        return;
      }

      setFileError("");
      setSelectedImage(file);
      // setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // setIsImageUploaded(true);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = await validateFile(file, "resume");
      if (error) {
        setResumeError(error);
        return;
      }
      setResumeError("");
      // setResumeFile(file);
      setSelectedResume(file);
    }
  };

  const removeImage = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = ""; // Reset input value Added by Ashok
    }
    // setImageFile(null);
    setImagePreview(null);
    setSelectedImage(null);
    setIsProfilePicRemoved(true);
  };

  // v1.0.0 <-------------------------------------------------------------------
  const resetImage = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = ""; // Reset input value Added by Ashok
    }
    // setImageFile(null);
    setImagePreview(null);
    setSelectedImage(null);
  };
  // -------------------------------------------------------------------------->
  const removeResume = () => {
    // setResumeFile(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = ""; // Reset input value Added by Ashok
    }
    setSelectedResume(null);
    setIsResumeRemoved(true);
  };
  // v1.0.0 <-------------------------------------------------------------------
  const resetResume = () => {
    // setResumeFile(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = ""; // Reset input value Added by Ashok
    }
    setSelectedResume(null);
  };

  const validateLinkedIn = (url) => {
    if (!url) return "";
    const regex =
      /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
    return regex.test(url) ? "" : "Please enter a valid LinkedIn URL";
  };

  // -------------------------------------------------------------------------->

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Build next form data so cross-field validation can use the latest values
    const nextFormData = { ...formData, [name]: value };
    let errorMessage = getErrorMessage(name, value, nextFormData);

    // linkedInUrl validation
    if (name === "linkedInUrl") {
      errorMessage = validateLinkedIn(value);
    }
    if (name === "CurrentExperience" || name === "RelevantExperience") {
      if (!/^\d*$/.test(value)) {
        return;
      }
    }

    setFormData(nextFormData);
    // Update this field's error, and if CurrentExperience changed, also revalidate RelevantExperience
    // setErrors((prev) => ({
    //   ...prev,
    //   [name]: errorMessage,
    //   ...(name === "CurrentExperience" && formData.RelevantExperience
    //     ? {
    //         RelevantExperience: getErrorMessage(
    //           "RelevantExperience",
    //           formData.RelevantExperience,
    //           nextFormData,
    //         ),
    //       }
    //     : {}),
    // }));
    setErrors((prev) => {
      const newErrors = { ...prev, [name]: errorMessage };

      // Revalidate Relevant Experience if Total Experience changes
      if (name === "CurrentExperience" && formData.RelevantExperience) {
        newErrors.RelevantExperience = getErrorMessage(
          "RelevantExperience",
          formData.RelevantExperience,
          nextFormData,
        );
      }

      // Live cross-field validation: Salary (keys are minsalary/maxsalary in validation)
      // Inside setErrors callback
      if (name === "minSalary" || name === "maxSalary") {
        const minVal = Number(nextFormData.minSalary);
        const maxVal = Number(nextFormData.maxSalary);
        const hasMin = !Number.isNaN(minVal) && nextFormData.minSalary !== "";
        const hasMax = !Number.isNaN(maxVal) && nextFormData.maxSalary !== "";

        delete newErrors.minSalary;
        delete newErrors.maxSalary;

        if (hasMin && minVal < 0) {
          newErrors.minSalary = "Minimum salary cannot be negative";
        }
        if (hasMax && maxVal < 0) {
          newErrors.maxSalary = "Maximum salary cannot be negative";
        }

        if (hasMin && hasMax) {
          if (minVal === maxVal) {
            newErrors.minSalary = "Min and Max Salary cannot be equal";
            newErrors.maxSalary = "Min and Max Salary cannot be equal";
          } else if (minVal > maxVal) {
            newErrors.minSalary =
              "Min Salary cannot be greater than Max Salary";
            newErrors.maxSalary = "Max Salary cannot be less than Min Salary";
          }
        }
      }

      return newErrors;
    });
  };

  const handleDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      Date_Of_Birth: date ? new Date(date).toISOString() : "",
    }));
  };

  const resetFormData = () => {
    setFormData({
      FirstName: "",
      LastName: "",
      Email: "",
      externalId: "",
      Phone: "",
      Date_Of_Birth: "",
      Gender: "",
      HigherQualification: "",
      UniversityCollege: "",
      CurrentExperience: "",
      RelevantExperience: "",
      skills: [],
      CurrentRole: "",
      CountryCode: "+91",
      // Technology: "",
      linkedInUrl: "",
    });

    setErrors({});
    // Reset to 3 default empty skill rows instead of empty array
    setEntries([
      { skill: "", experience: "", expertise: "" },
      { skill: "", experience: "", expertise: "" },
      { skill: "", experience: "", expertise: "" },
    ]);
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
    setEditingIndex(null);
    setCurrentStep(0);
    // v1.0.0 <------------------------------------------------------------------
    // removeImage();
    // removeResume();
    resetImage();
    resetResume();
    // -------------------------------------------------------------------------->
    setAllSelectedSkills([]);
    setShowSkillValidation(false); // Reset validation flag
  };

  const handleClose = () => {
    resetFormData();

    // If it's a modal, call the onClose function
    if (isModal && onClose) {
      onClose();
      return;
    }

    // Check if we came from InterviewForm
    const fromPath = location.state?.from;
    const returnTo = location.state?.returnTo;

    if (fromPath === "/interviews/new" && returnTo) {
      navigate(returnTo);
      return;
    }

    switch (mode) {
      case "Edit":
        navigate(-1); // `/candidate`
        break;
      case "Candidate Edit":
        navigate(`/candidates/${id}`);
        break;
      default:
        // navigate("/candidate");
        navigate(-1);
    }
  };

  const formatToBulletPoints = (text) => {
    if (!text) return "";
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .map((line) => (line.startsWith("•") ? line : `• ${line}`))
      .join("\n");
  };

  const formatForStorage = (text) => {
    if (!text) return "";
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .map((line) => line.replace(/^[•\s*-]+/, ""))
      .join("\n");
  };

  const handleSubmit = async (e, isAddCandidate = false) => {
    e.preventDefault();

    // 1.uniqueness
    const uniquenessFields = ["Email", "Phone", "linkedInUrl"];

    // Set which button was clicked
    setActiveButton(isAddCandidate ? "add" : "save");

    // Show skills validation when submit is attempted
    setShowSkillValidation(true);

    setErrors({});

    const { formIsValid, newErrors } = validateCandidateForm(
      formData,
      entries,
      {}, // always start fresh
    );

    // 2.uniqueness
    let hasUniquenessConflict = false;
    uniquenessFields.forEach((field) => {
      if (
        errors[field] &&
        (errors[field].includes("exists") || errors[field].includes("in use"))
      ) {
        newErrors[field] = errors[field];
        hasUniquenessConflict = true;
      }
    });

    const linkedInError = validateLinkedIn(formData.linkedInUrl);
    if (linkedInError) {
      newErrors.linkedInUrl = linkedInError;
    }

    if (
      formData.professionalSummary &&
      formData.professionalSummary.length < 200
    ) {
      newErrors.professionalSummary =
        "Professional Summary must be at least 200 characters.";
    }

    if (formData.keyAchievements && formData.keyAchievements.length < 150) {
      newErrors.keyAchievements =
        "Key Achievements must be at least 150 characters.";
    }

    if (formData.minSalary && formData.minSalary) {
      // ← BUG: checking same field twice
      if (parseFloat(formData.salaryMax) < parseFloat(formData.minSalary)) {
        // ← wrong field name
        newErrors.salaryMax = "Max salary cannot be less than min salary";
      }
    }
    // 3.uniqueness
    if (!formIsValid || linkedInError || hasUniquenessConflict) {
      setErrors(newErrors);
      setActiveButton(null);

      // Navigate to the first error field (now includes Email/Phone conflicts)
      scrollToFirstError(newErrors, fieldRefs);
      return; // Stop here
    }

    // 4.uniqueness
    if (!formIsValid || linkedInError) {
      // Check both
      setErrors(newErrors);
      setActiveButton(null);
      scrollToFirstError(newErrors, fieldRefs);
      return;
    }

    if (!formIsValid) {
      setErrors(newErrors);
      // Reset active button on validation failure
      setActiveButton(null);
      // v1.0.3 <-----------------------------------------------------------------
      scrollToFirstError(newErrors, fieldRefs);
      // v1.0.3 ----------------------------------------------------------------->
      return;
    }

    // Filter out empty skill rows - only include rows where at least one field has a value
    const filledSkills = entries
      .filter((entry) => entry.skill || entry.experience || entry.expertise)
      .map((entry) => ({
        skill: entry.skill,
        experience: entry.experience,
        expertise: entry.expertise,
      }));
    const cleanedWorkExperience = formData.workExperience.map((project) => {
      const { _id, ...cleanProject } = project; // remove _id if present
      return cleanProject;
    });
    const data = {
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      Email: formData.Email,
      externalId: formData.externalId || undefined,
      Phone: formData.Phone,
      CountryCode: formData.CountryCode,
      CurrentExperience: formData.CurrentExperience,
      RelevantExperience: formData.RelevantExperience,
      HigherQualification: formData.HigherQualification,
      Gender: formData.Gender || "",
      UniversityCollege: formData.UniversityCollege || "",
      Date_Of_Birth: formData.Date_Of_Birth,
      skills: filledSkills,
      CurrentRole: formData?.CurrentRole,
      // Technology: formData.Technology,
      ownerId: userId,
      tenantId: orgId,
      linkedInUrl: formData.linkedInUrl,
      // professionalSummary: formData.professionalSummary,
      // keyAchievements: formData.keyAchievements,
      professionalSummary: formatForStorage(formData.professionalSummary),
      keyAchievements: formatForStorage(formData.keyAchievements),
      workExperience: cleanedWorkExperience,

      location: formData.location || undefined,
      minSalary: formData.minSalary ? Number(formData.minSalary) : undefined,
      maxSalary: formData.maxSalary ? Number(formData.maxSalary) : undefined,
      languages: formData.languages?.filter((lang) => lang.trim() !== "") || [], // remove empty strings
      certifications: formData.certifications?.filter(Boolean) || [],
      noticePeriod: formData.noticePeriod || undefined,
    };

    // Add screening metadata for backend storage only
    const payload = {
      ...data,
      // These fields are NOT for form pre-fill — only for backend Resume / ScreeningResult
      ...(source === "candidate-screening" &&
        mode !== "Edit" && {
        source: "UPLOAD",
        // Pass full screeningData so backend can store it
        screeningData: screeningData, // ← direct pass (full object)
        parsedJson: screeningData.metadata || screeningData.parsedJson || {},
        parsedSkills: screeningData.parsed_skills || [],
        parsedExperience: screeningData.parsed_experience || null,
        parsedEducation: screeningData.parsed_education || null,
      }),
    };

    try {
      const candidateResponse = await addOrUpdateCandidate({
        id,
        data: payload,
        profilePicFile: selectedImage,
        resumeFile: selectedResume,
        isProfilePicRemoved,
        isResumeRemoved,
      });

      // if (isAddCandidate) {
      //   if (response.status === "success") {
      //     notify.success("Candidate added successfully");
      //   }
      // }
      if (
        candidateResponse.status !== "success" &&
        candidateResponse.status !== "Updated successfully" &&
        candidateResponse.status !== "no_changes"
      ) {
        throw new Error("Candidate save failed");
      }

      // ────────────────────────────────────────────────
      // Safely determine if this was CREATE or UPDATE
      // ────────────────────────────────────────────────
      const isCreateOperation = !id; // no id → definitely create
      const isUpdateOperation = !!id;

      let candidateId;
      let newOrUpdatedCandidate;

      if (isCreateOperation) {
        // Create mode → expect candidate in response
        newOrUpdatedCandidate = candidateResponse.data?.candidate;
        candidateId = newOrUpdatedCandidate?._id;

        if (!candidateId) {
          throw new Error("Candidate created but no _id returned from server");
        }
      } else {
        // Update mode → we already had the id
        candidateId = id;
        newOrUpdatedCandidate = candidateResponse.data?.candidate || {
          _id: id,
        }; // fallback
      }

      // ────────────────────────────────────────────────
      // Application + ScreeningResult — only on NEW candidates from screening
      // ────────────────────────────────────────────────

      // Debug: Log EVERY variable that affects the final decision
      console.log("=== DEBUG: shouldCreateApplicationFinal calculation ===");
      console.log("source:", source);
      console.log("positionId:", positionId ? "exists" : "missing");
      console.log("candidateResponse.status:", candidateResponse.status);
      console.log(
        "shouldCreateApplication prop (from viewer):",
        shouldCreateApplication,
      );
      console.log("candidateResponse full:", candidateResponse); // ← see the real status

      const isSuccess = [
        "success",
        "Updated successfully",
        "no_changes",
      ].includes(candidateResponse.status);

      console.log("isSuccess (after checking status):", isSuccess);

      const shouldCreateApplicationFinal =
        source === "candidate-screening" &&
        !!positionId && // make sure it's truthy
        isSuccess &&
        shouldCreateApplication; // from CandidateViewer: !hasActiveApplication

      console.log(
        "shouldCreateApplicationFinal FINAL result:",
        shouldCreateApplicationFinal,
      );
      console.log("Reason breakdown:");
      console.log(
        "  - source === 'candidate-screening' →",
        source === "candidate-screening",
      );
      console.log("  - !!positionId →", !!positionId);
      console.log("  - isSuccess →", isSuccess);
      console.log("  - shouldCreateApplication →", shouldCreateApplication);

      // 2. ONLY if from candidate screening → create application
      let appResult = null;
      if (shouldCreateApplicationFinal) {
        try {
          let candidateIdForApp;

          // For new candidate: get the newly created _id
          if (!id) {
            // Create mode → candidateResponse should have the new candidate
            const newCandidate = candidateResponse.data?.candidate;
            candidateIdForApp = newCandidate?._id;
            if (!candidateIdForApp) {
              throw new Error("New candidate created but no _id returned");
            }
          } else {
            // Update mode → use existing id
            candidateIdForApp = id;
          }

          const appPayload = {
            candidateId: candidateIdForApp,
            positionId,
            status: "SCREENED",
            currentStage: "Application Submitted",
            type: "candidate-screening",
            screeningData: screeningData,
            resumeId: candidateResponse.data?.resumeId,
          };

          appResult = await createApplication(appPayload);
          console.log("Application & ScreeningResult created:", appResult);
          notify.success(
            "Application and screening result created successfully",
          );
        } catch (appError) {
          console.error("Application/Screening creation failed:", appError);
          notify.warning(
            "Candidate saved/updated, but application creation failed",
          );
        }
      }
      resetFormData();
      // Reset custom skill rows inside SkillsField component
      // This should now correctly call the function in SkillsField
      if (fieldRefs.skills.current?.resetCustomSkills) {
        fieldRefs.skills.current.resetCustomSkills();
      }

      if (!isAddCandidate) {
        // setTimeout(() => {
        // If it's a modal, call the onClose function with the new candidate data
        if (isModal && onClose) {
          onClose({ ...candidateResponse.data, createdApplication: appResult });
          if (candidateResponse.status === "success") {
            notify.success("Candidate added successfully");
          } else if (
            candidateResponse.status === "no_changes" ||
            candidateResponse.status === "Updated successfully"
          ) {
            notify.success("Candidate updated successfully");
          }
          return;
        }

        // Check if we came from InterviewForm
        const fromPath = location.state?.from;
        const returnTo = location.state?.returnTo;

        if (fromPath === "/interviews/new" && returnTo) {
          navigate(returnTo);
          return;
        }

        switch (mode) {
          case ("Edit" && candidateResponse.status === "no_changes") ||
            candidateResponse.status === "Updated successfully":
            navigate(-1); // /candidate
            notify.success("Candidate updated successfully");
            break;
          case "Candidate Edit":
            navigate(`/candidates/${id}`);
            notify.success("Candidate updated successfully");
            break;
          default:
            navigate("/candidates");
            if (candidateResponse.status === "success") {
              notify.success("Candidate added successfully");
            } else if (
              candidateResponse.status === "no_changes" ||
              candidateResponse.status === "Updated successfully"
            ) {
              notify.success("Candidate updated successfully");
            }
        }
        // }, 1000); // Delay navigation to ensure loading state is visible
      } else {
        // For "Add Candidate" button, also close modal if in modal mode
        if (isModal && onClose) {
          // setTimeout(() => {
          onClose(candidateResponse.data);
          // }, 1000);
        }
      }
    } catch (error) {
      console.error("Error adding candidate:", error);

      // Show error toast
      notify.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to save candidate",
      );

      if (error.response?.data?.errors) {
        // Backend Joi validation errors
        setErrors(error.response.data.errors);
        scrollToFirstError(error.response.data.errors, fieldRefs);
      } else {
        // Fallback error
        setErrors({
          submit: `Failed to add/update candidate: ${error.message}`,
        });
      }
      // console.error("Error adding candidate:", error);
      // setErrors({ submit: `Failed to add/update candidate: ${error.message}` });
    } finally {
      // Reset active button regardless of success or failure
      setActiveButton(null);
    }

    // v1.0.2 <----------------------------------------------------------------------------
    // Scroll to top of form
    // v1.0.3 <-------------------------------------------------------------------
    if (isAddCandidate) {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // v1.0.3 ------------------------------------------------------------------->
    // v1.0.2 ---------------------------------------------------------------------------->
  };

  // Using shared DropdownSelect styles from CommonCode-AllTabs/DropdownSelect

  // Using shared CollegeMenuList from CommonCode-AllTabs/DropdownSelect

  // Mapped options for react-select
  // const genderOptionsRS = genderOptions.map((g) => ({ value: g, label: g }));

  const genderOptionsRS = useMemo(
    () => genderOptions.map((g) => ({ value: g, label: g })),
    [],
  );
  const noticePeriodOptionsRS = useMemo(
    () => noticePeriodOptions.map((g) => ({ value: g, label: g })),
    [],
  );

  // const qualificationOptionsRS =
  //   qualifications?.map((q) => ({
  //     value: q?.QualificationName,
  //     label: q?.QualificationName,
  //   })) || [];

  const qualificationOptionsRS = useMemo(
    () =>
      qualifications?.map((q) => ({
        value: q?.QualificationName,
        label: q?.QualificationName,
      })) || [],
    [qualifications],
  );

  // const collegeOptionsRS = (
  //   colleges?.map((c) => ({
  //     value: c?.University_CollegeName,
  //     label: c?.University_CollegeName,
  //   })) || []
  // ).concat([{ value: "__other__", label: "+ Others" }]);

  const collegeOptionsRS = useMemo(
    () =>
      (
        colleges?.map((c) => ({
          value: c?.University_CollegeName,
          label: c?.University_CollegeName,
        })) || []
      ).concat([{ value: "__other__", label: "+ Others" }]),
    [colleges],
  );

  // const roleOptionsRS =
  //   currentRoles?.map((r) => ({ value: r?.RoleName, label: r?.RoleName })) || [];

  const roleOptionsRS = useMemo(
    () =>
      currentRoles?.map((r) => ({
        value: r?.roleName,
        label: r?.roleLabel,
      })) || [],
    [currentRoles],
  );

  // ---------------------------------- Uniqueness checking ----------------------------------------
  const emailCheck = useValidateEmail(formData.Email);
  const phoneCheck = useValidatePhone(formData.Phone);
  const linkedinCheck = useValidateLinkedIn(formData.linkedInUrl);

  // ──────────────────────────────────────────────────────────────────────────────
  // Uniqueness checking — improved version for add + edit modes
  // ──────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const current = formData.Email?.trim() || "";
    const original = selectedCandidate?.Email?.trim() || "";

    // Edit mode + value didn't change → immediately clear error (most important)
    if (id && current === original) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.Email;
        return next;
      });
      return;
    }

    // No value → no error
    if (!current) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.Email;
        return next;
      });
      return;
    }

    // While loading → do nothing (don't show stale error)
    if (emailCheck.isLoading || !emailCheck.data) {
      return;
    }

    // Real conflict
    if (emailCheck.data.exists) {
      setErrors((prev) => ({
        ...prev,
        Email: "This email is already in use by another candidate.",
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.Email;
        return next;
      });
    }
  }, [
    formData.Email,
    selectedCandidate?.Email,
    id,
    emailCheck.isLoading,
    emailCheck.data,
  ]);

  // ──────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const current = formData.Phone?.trim() || "";
    const original = selectedCandidate?.Phone?.trim() || "";

    if (id && current === original) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.Phone;
        return next;
      });
      return;
    }

    if (!current) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.Phone;
        return next;
      });
      return;
    }

    if (phoneCheck.isLoading || !phoneCheck.data) return;

    if (phoneCheck.data.exists) {
      setErrors((prev) => ({
        ...prev,
        Phone: "This phone number is already in use by another candidate.",
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.Phone;
        return next;
      });
    }
  }, [
    formData.Phone,
    selectedCandidate?.Phone,
    id,
    phoneCheck.isLoading,
    phoneCheck.data,
  ]);

  // ──────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const current = formData.linkedInUrl?.trim() || "";
    const original = selectedCandidate?.linkedInUrl?.trim() || "";

    if (id && current === original) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.linkedInUrl;
        return next;
      });
      return;
    }

    if (!current) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.linkedInUrl;
        return next;
      });
      return;
    }

    if (linkedinCheck.isLoading || !linkedinCheck.data) return;

    if (linkedinCheck.data.exists) {
      setErrors((prev) => ({
        ...prev,
        linkedInUrl:
          "This LinkedIn URL is already in use by another candidate.",
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.linkedInUrl;
        return next;
      });
    }
  }, [
    formData.linkedInUrl,
    selectedCandidate?.linkedInUrl,
    id,
    linkedinCheck.isLoading,
    linkedinCheck.data,
  ]);

  const handleEditProject = (index) => {
    setEditingProjectIndex(index);
    setCurrentProject(formData.workExperience[index]);
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = (index) => {
    const updatedWorkExp = formData.workExperience.filter(
      (_, i) => i !== index,
    );
    setFormData({ ...formData, workExperience: updatedWorkExp });
  };

  const saveProject = () => {
    const newProjectErrors = {};

    if (!currentProject.projectName || !currentProject.projectName.trim()) {
      newProjectErrors.projectName = "Project Name is required";
    }

    if (!currentProject.role || !currentProject.role.trim()) {
      newProjectErrors.role = "Role is required";
    }

    // If both dates exist, ensure End Date is strictly after Start Date
    // if (currentProject.fromDate && currentProject.toDate) {
    //   if (currentProject.toDate <= currentProject.fromDate) {
    //     newProjectErrors.toDate = "Duration To must be later than Duration From";
    //   }
    // }

    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    if (currentProject.fromDate && currentProject.toDate) {
      if (currentProject.toDate <= currentProject.fromDate) {
        newProjectErrors.toDate = "End Date must be later than Start Date";
      }

      if (currentProject.toDate > currentYearMonth) {
        newProjectErrors.toDate = "End date cannot be in the future.";
      }
    }

    if (currentProject.responsibilities.length < 150) {
      newProjectErrors.responsibilities =
        "Responsibilities must be at least 150 characters";
    }

    if (Object.keys(newProjectErrors).length > 0) {
      setProjectErrors(newProjectErrors);
      return;
    }

    // 1. Clean the text and ensure every line has a bullet point for the DB
    // const cleanedResponsibilities = currentProject.responsibilities
    //   .split("\n")
    //   .map((line) => line.trim())
    //   .filter((line) => line !== "")
    //   .map((line) => (line.startsWith("•") ? line : `• ${line}`)) // Add bullet if missing
    //   .join("\n");
    const cleanedResponsibilities = currentProject.responsibilities
      .split("\n")
      .map((line) => line.trim())
      .map((line) => line.replace(/^[•\s*-]+/, ""))
      .filter((line) => line !== "")
      .join("\n");

    const projectToSave = {
      ...currentProject,
      responsibilities: cleanedResponsibilities,
    };

    // 2. Use the "projectToSave" variable instead of "currentProject"
    const updatedList = [...formData.workExperience];

    if (editingProjectIndex !== null) {
      updatedList[editingProjectIndex] = projectToSave;
    } else {
      updatedList.push(projectToSave);
    }

    setFormData({ ...formData, workExperience: updatedList });
    setIsProjectModalOpen(false);

    // Reset state
    setCurrentProject({
      projectName: "",
      role: "",
      fromDate: "",
      toDate: "",
      responsibilities: "",
    });
    setProjectErrors({});
  };

  // Convert the raw string from DB/State into a clean array for rendering
  const formatResponsibilitiesToList = (text) => {
    if (!text) return [];
    // Splits by newline and removes empty lines or just whitespace
    return text.split("\n").filter((line) => line.trim() !== "");
  };

  // The form content (this part is shared)
  const formContent = (
    <div className="sm:p-0 p-4 mb-10" ref={formRef}>
      {/* v1.0.8 ----------------------------------------------> */}
      {/* v1.0.7 ---------------------------------------------------------------------> */}
      {/* v1.0.4 ----------------------------------------------------------------------------------> */}
      {/* v1.0.2 ------------------------------------------------------------------> */}
      {source !== "candidate-screening" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2 gap-6 mb-6">
          {/* Profile Image Upload */}
          <ProfilePhotoUpload
            imageInputRef={imageInputRef}
            imagePreview={imagePreview}
            selectedImage={selectedImage}
            fileError={fileError}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
            label="Profile Photo"
          />

          {/* Resume Upload */}
          <ResumeUpload
            resumeInputRef={resumeInputRef}
            selectedResume={selectedResume}
            resumeError={resumeError}
            onResumeChange={handleResumeChange}
            onRemoveResume={removeResume}
            label="Resume"
          />
        </div>
      )}
      {/* </div> */}

      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white space-y-4">
            {/* v1.0.7 <------------------------------------------------------ */}
            {/* <h4 className="text-lg font-semibold text-gray-800"> */}
            <h4 className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800">
              {/* v1.0.7 ------------------------------------------------------> */}
              Personal Details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
              <InputField
                value={formData.FirstName}
                onChange={handleChange}
                inputRef={fieldRefs.FirstName}
                label="First Name"
                name="FirstName"
                required
                error={errors.FirstName}
              />
              <InputField
                value={formData.LastName}
                onChange={handleChange}
                inputRef={fieldRefs.LastName}
                error={errors.LastName}
                label="Last Name"
                name="LastName"
                required
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
              <DateOfBirthField
                selectedDate={
                  formData.Date_Of_Birth
                    ? new Date(formData.Date_Of_Birth)
                    : null
                }
                onChange={handleDateChange}
                label="Date of Birth"
                required={false}
              />
              <GenderDropdown
                value={formData.Gender}
                options={genderOptionsRS}
                onChange={handleChange}
                // error={errors.Gender}
                containerRef={fieldRefs.Gender}
                label="Gender"
              // required
              />
            </div>
            {/* v1.0.7 <---------------------------------------------------------------------------------------- */}
            {/* <p className="text-lg font-semibold col-span-2"> */}
            <p className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold col-span-2">
              {/* v1.0.7 ----------------------------------------------------------------------------------------> */}
              Contact Details
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
              <EmailField
                value={formData.Email}
                onChange={handleChange}
                inputRef={fieldRefs.Email}
                error={errors.Email}
                label="Email"
                required
              />
              <PhoneField
                countryCodeValue={formData.CountryCode}
                onCountryCodeChange={handleChange}
                countryCodeError={errors.CountryCode}
                countryCodeRef={fieldRefs.CountryCode}
                phoneValue={formData.Phone}
                onPhoneChange={handleChange}
                phoneError={errors.Phone}
                phoneRef={fieldRefs.Phone}
                label="Phone"
                required
              />
              <InputField
                value={formData.linkedInUrl}
                onChange={handleChange}
                inputRef={fieldRefs.linkedInUrl}
                label="LinkedIn URL"
                name="linkedInUrl"
                placeholder="https://linkedin.com/in/username"
                error={errors.linkedInUrl}
              />
              <DropdownWithSearchField
                label="Current Location"
                name="location"
                value={formData.location}
                options={locationOptionsRS}
                onChange={(e) => {
                  const { value } = e.target;
                  setFormData((prev) => ({ ...prev, location: value }));
                  if (errors.location) {
                    setErrors((prev) => ({ ...prev, location: "" }));
                  }
                }}
                placeholder="Select Location"
                isCustomName={isCustomLocation}
                setIsCustomName={setIsCustomLocation}
                onMenuOpen={loadLocations}
                loading={isLocationsFetching}
                containerRef={fieldRefs.location} // Ensure you add this ref to your fieldRefs object
              />
            </div>

            {/* v1.0.7 <-------------------------------------------------------------------------------------- */}
            {/* <p className="text-lg font-semibold col-span-2"> */}
            <p className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold col-span-2">
              {/* v1.0.7 --------------------------------------------------------------------------------------> */}
              Education & Experience Details
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
              <DropdownWithSearchField
                value={formData.HigherQualification}
                options={qualificationOptionsRS}
                onChange={handleChange}
                error={errors.HigherQualification}
                containerRef={fieldRefs.HigherQualification}
                label="Higher Qualification"
                name="HigherQualification"
                required
                onMenuOpen={loadQualifications}
                loading={isQualificationsFetching}
              />
              <DropdownWithSearchField
                value={formData.UniversityCollege}
                options={collegeOptionsRS}
                onChange={(e) => {
                  const { value } = e.target;
                  setFormData((prev) => ({
                    ...prev,
                    UniversityCollege: value,
                  }));
                  if (errors.UniversityCollege) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      UniversityCollege: "",
                    }));
                  }
                }}
                // error={errors.UniversityCollege}
                isCustomName={isCustomUniversity}
                setIsCustomName={setIsCustomUniversity}
                containerRef={fieldRefs.UniversityCollege}
                label="University/College"
                name="UniversityCollege"
                // required
                onMenuOpen={loadColleges}
                loading={isCollegesFetching}
              />
            </div>
            {/* --------v1.0.1----->*/}
            {/* v1.0.7 <----------------------------------------------------------------------------------- */}
            {/* <p className="text-lg font-semibold col-span-2"> */}

            {/* Current Role */}
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
              <IncreaseAndDecreaseField
                value={formData.CurrentExperience}
                onChange={handleChange}
                inputRef={fieldRefs.CurrentExperience}
                error={errors.CurrentExperience}
                label="Total Experience"
                name="CurrentExperience"
                required
              />
              <IncreaseAndDecreaseField
                value={formData.RelevantExperience}
                onChange={handleChange}
                inputRef={fieldRefs.RelevantExperience}
                error={errors.RelevantExperience}
                label="Relevant Experience"
                name="RelevantExperience"
                required
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
              <DropdownWithSearchField
                value={formData.CurrentRole}
                options={roleOptionsRS}
                onChange={handleChange}
                error={errors.CurrentRole}
                containerRef={fieldRefs.CurrentRole}
                label="Role / Technology"
                name="CurrentRole"
                required
                onMenuOpen={loadCurrentRoles}
                loading={isCurrentRolesFetching}
              />

              {/* <DropdownWithSearchField
                    containerRef={fieldRefs.Technology}
                    label="Technology"
                    name="technology"
                    value={formData.Technology}
                    options={currentRoles.map((t) => ({
                      value: t.roleName,
                      label: t.roleLabel,
                    }))}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        Technology: e.target.value,
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        Technology: "",
                      }));
                    }}
                    error={errors.Technology}
                    placeholder="Select Technology"
                    required
                    onMenuOpen={loadCurrentRoles}
                    loading={isCurrentRolesFetching}
                  /> */}
            </div>

            <p className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold col-span-2">
              {/* v1.0.7 --------------------------------------------------------------------------------------> */}
              Additional Details
            </p>

            {/* New Fields: Location, Salary, Languages */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-1 lg:grid-cols-2">
              <InputField
                label="Languages (comma separated)"
                name="languages"
                value={
                  Array.isArray(formData?.languages)
                    ? formData.languages.join(", ")
                    : ""
                }
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const languageArray = inputValue
                    .split(",")
                    .map((lang) => lang.trimStart());

                  setFormData((prev) => ({
                    ...prev,
                    languages: languageArray,
                  }));
                }}
                onBlur={() => {
                  setFormData((prev) => ({
                    ...prev,
                    languages: prev.languages
                      .map((lang) => lang.trim())
                      .filter(Boolean),
                  }));
                }}
                placeholder="e.g. English, Telugu, Hindi"
              />
              <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
                <IncreaseAndDecreaseField
                  value={formData.minSalary}
                  onChange={handleChange}
                  inputRef={fieldRefs.minSalary}
                  error={errors.minSalary}
                  min={50000} // 5 digits minimum
                  max={999999999} // 9 digits maximum
                  label="Min Salary (Annual)"
                  name="minSalary"
                  placeholder="Min Salary (Annual)"
                />
                <IncreaseAndDecreaseField
                  value={formData.maxSalary}
                  onChange={handleChange}
                  min={50000} // 5 digits minimum
                  max={999999999} // 9 digits maximum
                  inputRef={fieldRefs.maxSalary}
                  error={errors.maxSalary}
                  label="Max Salary (Annual)"
                  name="maxSalary"
                  placeholder="Max Salary (Annual)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <DropdownWithSearchField
                value={formData.noticePeriod}
                options={noticePeriodOptions}
                onChange={handleChange}
                name="noticePeriod"
                label="Notice Period"
                placeholder="Select Notice Period"
                containerRef={fieldRefs.noticePeriod}
                error={errors.noticePeriod}
              />

              {/* External ID */}
              <div>
                <div className="flex items-center gap-2 mb-1 relative">
                  <label className="text-sm font-medium text-gray-700">
                    External ID
                  </label>
                  <div className="relative tooltip-container">
                    <Info
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={() => setShowTooltip(!showTooltip)}
                    />
                    {showTooltip && (
                      <div className="absolute left-6 -top-1 z-10 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                        External System Reference Id
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                      </div>
                    )}
                  </div>
                </div>

                <InputField
                  value={formData.externalId}
                  onChange={handleChange}
                  inputRef={fieldRefs.externalId}
                  error={errors.externalId}
                  name="externalId"
                  placeholder="External System Reference Id"
                />
              </div>
            </div>
          </div>

          <div>
            <SkillsField
              ref={fieldRefs.skills}
              entries={entries}
              errors={errors}
              showValidation={showSkillValidation}
              onSkillsValidChange={(hasValidSkills) => {
                // Clear the skills error if at least one complete row exists
                if (hasValidSkills && errors.skills) {
                  setErrors((prevErrors) => {
                    const newErrors = { ...prevErrors };
                    delete newErrors.skills;
                    return newErrors;
                  });
                }
              }}
              onAddSkill={(setEditingIndexCallback) => {
                setEntries((prevEntries) => {
                  const newEntries = [
                    ...prevEntries,
                    { skill: "", experience: "", expertise: "" },
                  ];
                  // Only set editing index if callback is provided
                  if (
                    setEditingIndexCallback &&
                    typeof setEditingIndexCallback === "function"
                  ) {
                    setEditingIndexCallback(newEntries.length - 1);
                  }
                  return newEntries;
                });
                setSelectedSkill("");
                setSelectedExp("");
                setSelectedLevel("");
              }}
              onAddMultipleSkills={(newSkillEntries, skillsToRemove = []) => {
                setEntries((prevEntries) => {
                  let updatedEntries = [...prevEntries];

                  // First, handle skill removals
                  if (skillsToRemove.length > 0) {
                    // Count current skills with data
                    const currentFilledSkills = updatedEntries.filter(
                      (e) => e.skill,
                    ).length;
                    const remainingSkillsAfterRemoval =
                      currentFilledSkills - skillsToRemove.length;

                    // If we still have 3+ skills after removal, remove rows entirely
                    if (remainingSkillsAfterRemoval >= 3) {
                      updatedEntries = updatedEntries.filter(
                        (entry) => !skillsToRemove.includes(entry.skill),
                      );
                    } else {
                      // If we'd have less than 3, just clear the skill but keep rows
                      updatedEntries = updatedEntries.map((entry) => {
                        if (skillsToRemove.includes(entry.skill)) {
                          return {
                            skill: "",
                            experience: "",
                            expertise: "",
                          };
                        }
                        return entry;
                      });
                    }

                    // Ensure we always have at least 3 rows
                    while (updatedEntries.length < 3) {
                      updatedEntries.push({
                        skill: "",
                        experience: "",
                        expertise: "",
                      });
                    }
                  }

                  // Then, add new skills - fill empty rows first
                  let skillIndex = 0;
                  for (
                    let i = 0;
                    i < updatedEntries.length &&
                    skillIndex < newSkillEntries.length;
                    i++
                  ) {
                    if (!updatedEntries[i].skill) {
                      updatedEntries[i] = {
                        ...updatedEntries[i],
                        skill: newSkillEntries[skillIndex].skill,
                      };
                      skillIndex++;
                    }
                  }

                  // Add remaining skills as new rows
                  while (
                    skillIndex < newSkillEntries.length &&
                    updatedEntries.length < 10
                  ) {
                    updatedEntries.push(newSkillEntries[skillIndex]);
                    skillIndex++;
                  }

                  return updatedEntries;
                });
                // Update allSelectedSkills
                setAllSelectedSkills((prev) => {
                  let updated = prev.filter((s) => !skillsToRemove.includes(s));
                  return [...updated, ...newSkillEntries.map((e) => e.skill)];
                });
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
                  allSelectedSkills.filter((skill) => skill !== entry.skill),
                );
                setEntries(entries.filter((_, i) => i !== index));
              }}
              onUpdateEntry={(index, updatedEntry) => {
                const newEntries = [...entries];
                const oldSkill = newEntries[index]?.skill;
                newEntries[index] = updatedEntry;
                setEntries(newEntries);

                // Update allSelectedSkills if skill changed
                if (oldSkill !== updatedEntry.skill) {
                  const newSelectedSkills = newEntries
                    .map((e) => e.skill)
                    .filter(Boolean);
                  setAllSelectedSkills(newSelectedSkills);
                }

                // Update formData
                setFormData((prev) => ({ ...prev, skills: newEntries }));
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
              isNextEnabled={isNextEnabled}
              handleAddEntry={handleAddEntry}
              skillpopupcancelbutton={skillpopupcancelbutton}
              editingIndex={editingIndex}
              onOpenSkills={loadSkills}
            />
          </div>

          {/* Certifications Tags */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Certifications ({formData?.certifications?.length}/10)
            </label>

            {/* The Input Field */}
            <InputField
              name="text"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              placeholder={
                formData?.certifications?.length >= 10
                  ? "Limit reached"
                  : "Type certification and press Enter"
              }
              // IMPORTANT: Ensure your InputField component passes this to the internal <input>
              onKeyDown={handleCertKeyDown}
              disabled={formData?.certifications?.length >= 10}
            />

            {/* Tag Display Area */}
            <div className="flex flex-wrap gap-2 mb-2 mt-3">
              {formData.certifications?.map((cert, index) => (
                <div className="flex items-center justify-center gap-2 bg-custom-blue/10 text-custom-blue px-3 py-2 rounded-full border border-blue-200">
                  <p key={index} className="text-sm font-medium leading-none">
                    {cert}
                  </p>
                  <button
                    type="button"
                    className="flex items-center justify-center mt-[1px]"
                    onClick={() => removeCert(cert)}
                  >
                    <X className="w-3 h-3 cursor-pointer text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Work Experience Heading */}
          <p className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800">
            Work Experience
          </p>

          <div>
            {/* Professional Summary */}
            <div className="col-span-2 mb-4">
              <DescriptionField
                label="Professional Summary (one per line)"
                name="professionalSummary"
                value={formData.professionalSummary}
                onChange={handleChange}
                inputRef={fieldRefs.professionalSummary}
                error={errors.professionalSummary}
                // placeholder="Briefly describe your professional background..."
                placeholder="Experienced Full-Stack Developer with over 8 years of expertise in building scalable web applications.
                Proven track record of leading technical teams and delivering high-impact software solutions.
                Specialized in React, Node.js, and Cloud Infrastructure with a focus on performance.
                Committed to writing clean, maintainable code and implementing robust CI/CD pipelines.
                Adept at collaborating with stakeholders to translate business needs into technical roadmaps.
                Passionate about mentoring developers and staying at the forefront of emerging technologies."
                rows={6}
                minLength={200}
                maxLength={1500}
              />
            </div>

            {/* Work Experience Projects */}
            <div className="col-span-2 mb-4">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Project Details
                </label>
                <Button
                  type="button"
                  onClick={() => {
                    setEditingProjectIndex(null);
                    setIsProjectModalOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4 sm:hidden mr-1" /> Add Project
                </Button>
              </div>

              {/* Project Cards Display */}
              <div className="grid grid-cols-1 gap-4">
                {formData?.workExperience &&
                  formData.workExperience.length > 0 ? (
                  formData.workExperience.map((project, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-gray-50 relative group"
                    >
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit
                          title="Edit Project"
                          className="w-4 h-4 cursor-pointer text-custom-blue"
                          onClick={() => handleEditProject(index)}
                        />
                        <X
                          title="Delete Project"
                          className="w-4 h-4 cursor-pointer text-red-600"
                          onClick={() => handleDeleteProject(index)}
                        />
                      </div>
                      <h5
                        className="font-medium text-md text-gray-800 truncate max-w-[260px] mb-1"
                        title={project?.projectName}
                      >
                        {project?.projectName}
                      </h5>
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <Briefcase className="text-gray-700 h-4 w-4" />
                          <p className="text-xs text-gray-700 font-semibold truncate max-w-[260px]">
                            {project?.role}
                          </p>
                        </div>
                        <Dot className="w-4 h-4 text-gray-700" />
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-gray-700">
                            {project?.fromDate?.split("-")[0]}
                          </p>
                          -
                          <p className="text-xs text-gray-700">
                            {project?.toDate
                              ? project.toDate.split("-")[0]
                              : "Present"}
                          </p>
                        </div>
                      </div>
                      <ul className="list-disc list-inside mt-2 space-y-1 p-4">
                        {formatResponsibilitiesToList(
                          project?.responsibilities,
                        ).map((point, i) => (
                          <li
                            key={i}
                            className="text-sm text-gray-600 break-words leading-relaxed"
                          >
                            {point.replace(/^[•\s*-]+/, "")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  /* Empty State Card */
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-8 bg-gray-50/50">
                    <span className="bg-white p-3 rounded-full shadow-sm mb-3">
                      <FaPlus className="text-gray-400 w-5 h-5" />
                    </span>
                    <p className="text-sm font-medium text-gray-500">
                      No projects added yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click the "Add Project" to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Key Achievements */}
            <div className="col-span-2">
              <DescriptionField
                label="Key Achievements (one per line)"
                name="keyAchievements"
                value={formData.keyAchievements}
                onChange={handleChange}
                inputRef={fieldRefs.keyAchievements}
                error={errors.keyAchievements}
                // placeholder="List your major career milestones..."
                placeholder="Led a team to deliver a $2M digital transformation project.
                Optimized queries, reducing page load times by 40%.
                Implemented a new process that increased retention by 15%.
                Mentored 5 junior developers into full-stack roles.
                Migrated legacy architecture to cloud microservices.
                Awarded 'Employee of the Year' for project excellence."
                rows={6}
                minLength={150}
                maxLength={1000}
              />
            </div>
          </div>

          {/* v1.0.8 <----------------------------------- */}
          <div className="flex justify-end gap-3">
            {/* v1.0.8 <----------------------------------- */}
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={isMutationLoading}
              className={`text-custom-blue border border-custom-blue transition-colors ${isMutationLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              Cancel
            </Button>

            <LoadingButton
              onClick={(e) => {
                if (onSaveStart && isModal) onSaveStart();
                handleSubmit(e);
              }}
              isLoading={isMutationLoading && activeButton === "save"}
              loadingText={id ? "Updating..." : "Saving..."}
            >
              {id ? "Update" : "Save"}
            </LoadingButton>

            {!hideAddButton && !id && source !== "candidate-screening" && (
              <LoadingButton
                onClick={(e) => handleSubmit(e, true)}
                isLoading={isMutationLoading && activeButton === "add"}
                loadingText="Adding..."
                className="flex items-center"
              >
                <FaPlus className="w-4 h-4 sm:hidden mr-1" /> Add Candidate
              </LoadingButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  // ---------------------------------- Uniqueness checking ----------------------------------------
  return (
    <>
      {/* v1.0.2 <------------------------------------------------------------------ */}
      {/* v1.0.4 <----------------------------------------------------------------------------------- */}
      {/* <SidebarPopup
        title={id ? "Update Candidate" : "Add New Candidate"}
        onClose={handleClose}
      > */}
      {/* // newly added guide for CandidateForm component by Ranjith */}
      {/* <InfoGuide
          title="Candidate Profile Guidelines"
          items={[
            <>
              <span className="font-medium">Complete Profile:</span> Fill all
              required fields to create a comprehensive candidate profile
            </>,
            <>
              <span className="font-medium">Profile Photo:</span> Upload a
              professional headshot (max 100KB, 200×200 recommended)
            </>,
            <>
              <span className="font-medium">Resume Requirements:</span> PDF or
              Word documents only, maximum 4MB file size
            </>,
            <>
              <span className="font-medium">Contact Information:</span> Provide
              accurate email and phone number for communication
            </>,
            <>
              <span className="font-medium">Education Details:</span> Include
              highest qualification and university/college information
            </>,
            <>
              <span className="font-medium">Experience Tracking:</span> Specify
              both current and relevant experience in years
            </>,
            <>
              <span className="font-medium">Skill Assessment:</span> Add
              relevant skills with proficiency levels (Basic, Medium, Expert)
            </>,
            <>
              <span className="font-medium">Current Role:</span> Select the
              candidate's current job position from available options
            </>,
            <>
              <span className="font-medium">Data Validation:</span> All fields
              are validated in real-time with error highlighting
            </>,
            <>
              <span className="font-medium">Flexible Options:</span> Custom
              university entries available if not found in the list
            </>,
          ]}
        /> */}

      {/* v1.0.7 <--------------------------------------------------------------------- */}
      {/* <div className="p-4" ref={formRef}> */}
      {/* v1.0.8 <---------------------------------------------- */}

      {/* </SidebarPopup> */}

      {isModal ? (
        // When opened as modal/popup (from screening) → NO sidebar, just content
        <div className="h-full overflow-y-auto bg-white">{formContent}</div>
      ) : (
        // Normal page mode → show SidebarPopup
        // <SidebarPopup
        //   title={id ? "Update Candidate" : "Add New Candidate"}
        //   onClose={handleClose}
        // >
        <div className="fixed top-[62px] inset-x-0 bottom-0 z-40 overflow-y-auto bg-white px-4">
          <div className="relative flex flex-col min-h-full items-center justify-start pb-10 pt-4">
            <div className="w-full max-w-6xl mb-4">
              <button
                onClick={handleClose}
                type="button"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Candidates
              </button>
            </div>
            <div className="w-full max-w-6xl p-4 rounded-lg border bg-white shadow-md">
              {formContent}
            </div>
          </div>
        </div>
        // </SidebarPopup>
      )}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 m-4 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4">
              {editingProjectIndex !== null ? "Edit Project" : "Add Project"}
            </h3>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                <InputField
                  label="Project Name"
                  value={currentProject.projectName}
                  onChange={(e) =>
                    setCurrentProject({
                      ...currentProject,
                      projectName: e.target.value,
                    })
                  }
                  error={projectErrors.projectName}
                  required
                />
                <InputField
                  label="Role"
                  value={currentProject.role}
                  onChange={(e) =>
                    setCurrentProject({
                      ...currentProject,
                      role: e.target.value,
                    })
                  }
                  error={projectErrors.role}
                  required
                />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                <InputField
                  label="Duration From"
                  type="month"
                  value={currentProject.fromDate}
                  onChange={(e) =>
                    setCurrentProject({
                      ...currentProject,
                      fromDate: e.target.value,
                    })
                  }
                  error={projectErrors.fromDate}
                />
                <InputField
                  label="Duration To"
                  type="month"
                  value={currentProject.toDate}
                  onChange={(e) => {
                    const newToDate = e.target.value;
                    setCurrentProject({
                      ...currentProject,
                      toDate: newToDate,
                    });

                    if (
                      currentProject.fromDate &&
                      newToDate > currentProject.fromDate
                    ) {
                      setProjectErrors((prev) => {
                        const { toDate, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  error={projectErrors.toDate}
                />
              </div>
              <div>
                <DescriptionField
                  label="Responsibilities (one per line)"
                  value={currentProject.responsibilities}
                  onChange={(e) => {
                    const { value } = e.target;
                    setCurrentProject({
                      ...currentProject,
                      responsibilities: value,
                    });
                    if (projectErrors.responsibilities && value.length >= 200) {
                      setProjectErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.responsibilities;
                        return newErrors;
                      });
                    }
                  }}
                  // placeholder="Describe your role and impact in this project..."
                  placeholder="Developed UI components using React and Tailwind.
                  Collaborated with APIs to optimize data flow.
                  Led the migration of state management to Redux.
                  Fixed critical bugs to improve system stability.
                  Conducted code reviews for the development team.
                  Wrote technical docs to streamline onboarding"
                  error={projectErrors.responsibilities}
                  rows={6}
                  minLength={150}
                  maxLength={1000}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsProjectModalOpen(false);
                  setProjectErrors({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={saveProject}>Save Project</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddCandidateForm;
