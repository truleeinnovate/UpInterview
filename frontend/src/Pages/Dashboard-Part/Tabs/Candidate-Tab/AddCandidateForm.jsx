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
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import InfoGuide from "../CommonCode-AllTabs/InfoCards";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";
import IncreaseAndDecreaseField from "../../../../Components/FormFields/IncreaseAndDecreaseField";
import InputField from "../../../../Components/FormFields/InputField";
import { logger } from "../../../../utils/logger";

// v1.0.3 ----------------------------------------------------------------->

// Main AddCandidateForm Component
const AddCandidateForm = ({
  mode,
  onClose,
  isModal = false,
  hideAddButton = false,
}) => {
  const pageType = "adminPortal";
  const {
    skills,
    colleges,
    qualifications,
    currentRoles,
    loadSkills,
    loadColleges,
    loadQualifications,
    loadCurrentRoles,
    isQualificationsFetching,
    isCollegesFetching,
    isCurrentRolesFetching,
    technologies,
    loadTechnologies,
    isTechnologiesFetching,
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
  const { id } = useParams();
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

  // Initialize with 3 default empty skill rows
  const [entries, setEntries] = useState([
    { skill: "", experience: "", expertise: "" },
    { skill: "", experience: "", expertise: "" },
    { skill: "", experience: "", expertise: "" },
  ]);
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
    Technology: useRef(null),
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
    Technology: "",
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

  useEffect(() => {
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
        Technology: selectedCandidate?.Technology || "",
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
        selectedCandidate.skills?.map((skill) => skill.skill) || []
      );
      // setAllSelectedExperiences(selectedCandidate.skills?.map(skill => skill.experience) || []);
      // setAllSelectedExpertises(selectedCandidate.skills?.map(skill => skill.expertise) || []);
    }
  }, [id, selectedCandidate]);

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
      (c?.University_CollegeName || "").trim().toLowerCase()
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
          : entry
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
  // -------------------------------------------------------------------------->
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Build next form data so cross-field validation can use the latest values
    const nextFormData = { ...formData, [name]: value };
    let errorMessage = getErrorMessage(name, value, nextFormData);

    if (name === "CurrentExperience" || name === "RelevantExperience") {
      if (!/^\d*$/.test(value)) {
        return;
      }
    }

    setFormData(nextFormData);
    // Update this field's error, and if CurrentExperience changed, also revalidate RelevantExperience
    setErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
      ...(name === "CurrentExperience" && formData.RelevantExperience
        ? {
            RelevantExperience: getErrorMessage(
              "RelevantExperience",
              formData.RelevantExperience,
              nextFormData
            ),
          }
        : {}),
    }));
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
      Technology: "",
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
        navigate(`/candidate/${id}`);
        break;
      default:
        navigate("/candidate");
    }
  };

  const handleSubmit = async (e, isAddCandidate = false) => {
    e.preventDefault();

    // Set which button was clicked
    setActiveButton(isAddCandidate ? "add" : "save");

    // Show skills validation when submit is attempted
    setShowSkillValidation(true);

    setErrors({});

    const { formIsValid, newErrors } = validateCandidateForm(
      formData,
      entries,
      {} // always start fresh
    );

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
      CurrentRole: formData.CurrentRole,
      Technology: formData.Technology,
      ownerId: userId,
      tenantId: orgId,
    };

    try {
      const response = await addOrUpdateCandidate({
        id,
        data,
        profilePicFile: selectedImage,
        resumeFile: selectedResume,
        isProfilePicRemoved,
        isResumeRemoved,
      });
      // console.log("response", response);
      // Send response
      // res.status(203).json({
      //   status: 'Updated successfully',
      //   message: 'Candidate updated successfully',
      //   data: updatedCandidate,
      // });
      // if (response.status === "success") {
      //   notify.success("Candidate added successfully");
      // } else if (response.status === "no_changes" || response.status === "Updated successfully") {
      //   notify.success("Candidate Updated successfully");
      // }

      // notify.success("Candidate added successfully");

      if (isAddCandidate) {
        if (response.status === "success") {
          notify.success("Candidate added successfully");
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
          onClose(response.data);
          if (response.status === "success") {
            notify.success("Candidate added successfully");
          } else if (
            response.status === "no_changes" ||
            response.status === "Updated successfully"
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
          case ("Edit" && response.status === "no_changes") ||
            response.status === "Updated successfully":
            navigate(-1); // /candidate
            notify.success("Candidate updated successfully");
            break;
          case "Candidate Edit":
            navigate(`/candidate/${id}`);
            notify.success("Candidate updated successfully");
            break;
          default:
            navigate("/candidate");
            if (response.status === "success") {
              notify.success("Candidate added successfully");
            } else if (
              response.status === "no_changes" ||
              response.status === "Updated successfully"
            ) {
              notify.success("Candidate updated successfully");
            }
        }
        // }, 1000); // Delay navigation to ensure loading state is visible
      } else {
        // For "Add Candidate" button, also close modal if in modal mode
        if (isModal && onClose) {
          // setTimeout(() => {
          onClose(response.data);
          // }, 1000);
        }
      }
    } catch (error) {
      console.error("Error adding candidate:", error);

      // Show error toast
      notify.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save candidate"
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
    []
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
    [qualifications]
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
    [colleges]
  );

  // const roleOptionsRS =
  //   currentRoles?.map((r) => ({ value: r?.RoleName, label: r?.RoleName })) || [];

  const roleOptionsRS = useMemo(
    () =>
      currentRoles?.map((r) => ({
        value: r?.roleName,
        label: r?.roleName,
      })) || [],
    [currentRoles]
  );

  return (
    <>
      {/* v1.0.2 <------------------------------------------------------------------ */}
      {/* v1.0.4 <----------------------------------------------------------------------------------- */}
      <SidebarPopup
        title={id ? "Update Candidate" : "Add New Candidate"}
        onClose={handleClose}
      >
        {/* // newly added guide for CandidateForm component by Ranjith */}
        <InfoGuide
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
        />

        {/* v1.0.7 <--------------------------------------------------------------------- */}
        {/* <div className="p-4" ref={formRef}> */}
        {/* v1.0.8 <---------------------------------------------- */}
        <div className="sm:p-0 p-4 mb-10" ref={formRef}>
          {/* v1.0.8 ----------------------------------------------> */}
          {/* v1.0.7 ---------------------------------------------------------------------> */}
          {/* v1.0.4 ----------------------------------------------------------------------------------> */}
          {/* v1.0.2 ------------------------------------------------------------------> */}
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
                </div>

                {/* v1.0.7 <-------------------------------------------------------------------------------------- */}
                {/* <p className="text-lg font-semibold col-span-2"> */}
                <p className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold col-span-2">
                  {/* v1.0.7 --------------------------------------------------------------------------------------> */}
                  Education Details
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
                <p className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold col-span-2">
                  {/* v1.0.7 -----------------------------------------------------------------------------------> */}
                  Experience Details
                </p>

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

                {/* Current Role */}

                <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                  <DropdownWithSearchField
                    value={formData.CurrentRole}
                    options={roleOptionsRS}
                    onChange={handleChange}
                    error={errors.CurrentRole}
                    containerRef={fieldRefs.CurrentRole}
                    label="Current Role"
                    name="CurrentRole"
                    required
                    onMenuOpen={loadCurrentRoles}
                    loading={isCurrentRolesFetching}
                  />

                  <DropdownWithSearchField
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
                  />
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
                  onEditSkill={(index) => {
                    const entry = entries[index];
                    setSelectedSkill(entry.skill || "");
                    setSelectedExp(entry.experience);
                    setSelectedLevel(entry.expertise);
                  }}
                  onDeleteSkill={(index) => {
                    const entry = entries[index];
                    setAllSelectedSkills(
                      allSelectedSkills.filter((skill) => skill !== entry.skill)
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

              {/* External ID Field - Only show for organization users */}
              {isOrganization && (
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                  <div className="-mt-2">
                    <InputField
                      value={formData.externalId}
                      onChange={handleChange}
                      inputRef={fieldRefs.externalId}
                      error={errors.externalId}
                      label="External ID"
                      name="externalId"
                      placeholder="external system identifier"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      external system reference id
                    </div>
                  </div>
                </div>
              )}

              {/* v1.0.8 <----------------------------------- */}
              <div className="flex justify-end gap-3">
                {/* v1.0.8 <----------------------------------- */}
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isMutationLoading}
                  className={`sm:px-2 sm:py-1 md:px-2 md:py-1 lg:px-6 lg:py-2 xl:px-6 xl:py-2 2xl:px-6 2xl:py-2 sm:text-sm text-custom-blue border border-custom-blue rounded-lg transition-colors ${
                    isMutationLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Cancel
                </button>

                <LoadingButton
                  onClick={handleSubmit}
                  isLoading={isMutationLoading && activeButton === "save"}
                  loadingText={id ? "Updating..." : "Saving..."}
                >
                  {id ? "Update" : "Save"}
                </LoadingButton>

                {!hideAddButton && !id && (
                  <LoadingButton
                    onClick={(e) => handleSubmit(e, true)}
                    isLoading={isMutationLoading && activeButton === "add"}
                    loadingText="Adding..."
                  >
                    <FaPlus className="w-5 h-5 mr-1 sm:hidden" /> Add Candidate
                  </LoadingButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarPopup>
    </>
  );
};

export default AddCandidateForm;
