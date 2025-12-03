/* eslint-disable react/prop-types */

// v1.0.0 - Venkatesh - added custom location
// v1.0.1 - Ashok - added scroll to error functionality
// v1.0.2 - Ashok - Improved responsiveness
// v1.0.3 - Ashok - Fixed issues at responsiveness
// v1.0.4 - Ashok - Fixed style issue
// v1.0.5 - Ranjith - rounds shown as horizontal stepper pathway
// v1.0.6 - Ashok - Reduced horizontal padding (style issue)
// v1.0.7 - Ashok - Improved scroll functionality
// v1.0.8 - Ashok - Fixed style issues

import { useEffect, useState, useRef } from "react";
import AssessmentDetails from "./AssessmentType";
import TechnicalType from "./TechnicalType";
import Cookies from "js-cookie";
import { validateForm } from "../../../../utils/PositionValidation.js";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Search,
  Users,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import SkillsField from "../CommonCode-AllTabs/SkillsInput.jsx";
import { usePositions } from "../../../../apiHooks/usePositions";
import LoadingButton from "../../../../Components/LoadingButton";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import { useInterviewTemplates } from "../../../../apiHooks/useInterviewTemplates.js";
// v1.0.1 <----------------------------------------------------------------------------
import { scrollToFirstError } from "../../../../utils/ScrollToFirstError/scrollToFirstError.js";
import { notify } from "../../../../services/toastService.js";
import InfoGuide from "../CommonCode-AllTabs/InfoCards.jsx";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";
import IncreaseAndDecreaseField from "../../../../Components/FormFields/IncreaseAndDecreaseField";
import InputField from "../../../../Components/FormFields/InputField";
import DescriptionField from "../../../../Components/FormFields/DescriptionField";
// v1.0.1 ---------------------------------------------------------------------------->

const PositionForm = ({ mode, onClose, isModal = false }) => {
  const { positionData, isMutationLoading, addOrUpdatePosition } =
    usePositions();

  const { templatesData, isQueryLoading: isTemplatesFetching } =
    useInterviewTemplates();
  const pageType = "adminPortal";

  const {
    companies,
    locations,
    skills,
    loadCompanies,
    loadLocations,
    loadSkills,
    isCompaniesFetching,
    isLocationsFetching,
  } = useMasterData({}, pageType);

  const { id } = useParams();
  const location = useLocation();
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const userId = tokenPayload?.userId;
  const orgId = tokenPayload?.tenantId;
  // Determine the correct path to return to based on current location and state
  // const fromPath =
  //   location.state?.from ||
  //   (location.pathname.includes("/position/new-position")
  //     ? "/position"
  //     : "/position");

  // v1.0.1 <----------------------------------------------------------------------
  const fieldRefs = {
    title: useRef(null),
    companyname: useRef(null),
    minexperience: useRef(null),
    maxexperience: useRef(null),
    minSalary: useRef(null),
    maxSalary: useRef(null),
    NoofPositions: useRef(null),
    location: useRef(null),
    jobDescription: useRef(null),
    skills: useRef(null),
    externalId: useRef(null),
    // Add more if needed
  };

  // v1.0.1 ---------------------------------------------------------------------->

  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    minexperience: "",
    maxexperience: "",
    maxSalary: "",
    minSalary: "",
    jobDescription: "",
    additionalNotes: "",
    skills: [],
    template: {},
    NoofPositions: "",
    Location: "",
    externalId: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [showSkillValidation, setShowSkillValidation] = useState(false); // Track if skills validation should show
  const [showDropdownCompany, setShowDropdownCompany] = useState(false);
  const [isCustomCompany, setIsCustomCompany] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const companyDropdownRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMovedToRounds, setHasMovedToRounds] = useState(false);
  const [currentStage, setCurrentStage] = useState("basic");
  const [allSelectedSkills, setAllSelectedSkills] = useState([]);

  // Handle click outside company dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target)
      ) {
        setShowDropdownCompany(false);
        setCompanySearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    setSearchTerm("");
  };

  const filteredCompanies = companies?.filter((company) =>
    company.CompanyName?.toString()
      .toLowerCase()
      .includes(companySearchTerm.toLowerCase())
  );

  useEffect(() => {
    if (currentStage !== "basic") {
      setHasMovedToRounds(true);
    }
  }, [currentStage]);

  useEffect(() => {
    if (id) {
      const selectedPosition = positionData.find((pos) => pos._id === id);
      setIsEdit(true);
      console.log("selectedPosition", selectedPosition);
      const matchingTemplate = templatesData.find(
        (template) => template?._id === selectedPosition?.templateId
      );
      //setPositionId(id);

      const companyName = selectedPosition?.companyname || "";

      // Check if the company name exists in the companies list
      // Guard: wait until companies are loaded before deciding custom mode
      if (companyName && Array.isArray(companies) && companies.length > 0) {
        const companyExists = companies.some(
          (company) => company.CompanyName === companyName
        );
        if (!companyExists) {
          setIsCustomCompany(true);
        } else {
          setIsCustomCompany(false);
        }
      } else if (
        companyName &&
        (!Array.isArray(companies) || companies.length === 0)
      ) {
        // Defer decision; will re-run when companies update
        setIsCustomCompany(true);
      }

      setFormData({
        title: selectedPosition?.title || "",
        companyName: companyName,
        minexperience: selectedPosition?.minexperience || 0,
        maxexperience: selectedPosition?.maxexperience || 0,
        minSalary: selectedPosition?.minSalary || "",
        maxSalary: selectedPosition?.maxSalary || "",
        jobDescription: selectedPosition?.jobDescription || "",
        additionalNotes: selectedPosition?.additionalNotes || "",
        NoofPositions: selectedPosition?.NoofPositions?.toString() || "",
        Location: selectedPosition?.Location || "",
        externalId: selectedPosition?.externalId || "",
        template: matchingTemplate || {},
        // template: matchingTemplate
        //   ? {
        //     ...matchingTemplate
        //   }
        //   : {},
      });

      console.log("selectedPosition template", formData?.template);

      const formattedSkills =
        selectedPosition?.skills?.map((skill) => ({
          skill: skill.skill || "",
          experience: skill.experience || "",
          expertise: skill.expertise || "",
          _id: skill._id || "",
        })) || [];

      setEntries(formattedSkills);
      // setAllSelectedSkills(formattedSkills)
      setAllSelectedSkills(
        selectedPosition?.skills?.map((skill) => skill.skill) || []
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionData, id, companies, templatesData]);

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

  // Mapped options for shared DropdownWithSearchField
  const companyOptionsRS = (companies || [])
    .map((c) => ({ value: c?.CompanyName, label: c?.CompanyName }))
    .concat([{ value: "__other__", label: "+ Others" }]);
  const locationOptionsRS = (locations || [])
    .map((l) => ({ value: l?.LocationName, label: l?.LocationName }))
    .concat([{ value: "__other__", label: "+ Others" }]);
  const templateOptions = (templatesData || [])
    .filter((t) => t?.rounds?.length > 0 && t?.status === "active")
    .map((t) => ({ value: t._id, label: t.title }));

  // Generic change handler for shared form fields + live cross-field validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const next = { ...prev };
      const keyMap = {
        // companyName: "companyname",
        minSalary: "minsalary",
        maxSalary: "maxsalary",
      };

      // Clear direct field error if it uses the same key
      if (next?.[name]) next[name] = "";
      if (keyMap[name] && next?.[keyMap[name]]) next[keyMap[name]] = "";

      // Live cross-field validation: Experience
      if (name === "minexperience" || name === "maxexperience") {
        const min =
          name === "minexperience"
            ? parseInt(value)
            : parseInt(formData.minexperience);
        const max =
          name === "maxexperience"
            ? parseInt(value)
            : parseInt(formData.maxexperience);
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
          if (min === max) {
            next.minexperience = "Min and Max Experience cannot be equal";
            next.maxexperience = "Max and Min Experience cannot be equal";
          } else if (min > max) {
            next.minexperience = "Min Experience cannot be greater than Max";
            next.maxexperience = "Max Experience cannot be less than Min";
          } else {
            next.minexperience = "";
            next.maxexperience = "";
          }
        } else {
          // If either is empty, clear cross-field errors
          if (
            next.minexperience ===
              "Min Experience cannot be greater than Max" ||
            next.minexperience === "Min and Max Experience cannot be equal"
          )
            next.minexperience = "";
          if (
            next.maxexperience === "Max Experience cannot be less than Min" ||
            next.maxexperience === "Max and Min Experience cannot be equal"
          )
            next.maxexperience = "";
        }
      }

      // Live cross-field validation: Salary (keys are minsalary/maxsalary in validation)
      if (name === "minSalary" || name === "maxSalary") {
        const minS =
          name === "minSalary" ? parseInt(value) : parseInt(formData.minSalary);
        const maxS =
          name === "maxSalary" ? parseInt(value) : parseInt(formData.maxSalary);

        // Negative checks
        if (name === "minSalary") {
          if (!Number.isNaN(minS) && minS < 0) {
            next.minsalary = "Minimum salary cannot be negative";
          } else if (
            next.minsalary &&
            next.minsalary.startsWith("Minimum salary")
          ) {
            next.minsalary = "";
          }
        }
        if (name === "maxSalary") {
          if (!Number.isNaN(maxS) && maxS < 0) {
            next.maxsalary = "Maximum salary cannot be negative";
          } else if (
            next.maxsalary &&
            next.maxsalary.startsWith("Maximum salary")
          ) {
            next.maxsalary = "";
          }
        }

        if (!Number.isNaN(minS) && !Number.isNaN(maxS)) {
          if (minS === maxS) {
            next.minsalary = "Minimum and Maximum Salary cannot be equal";
            next.maxsalary = "Maximum and Minimum Salary cannot be equal";
          } else if (minS > maxS) {
            next.minsalary = "Minimum Salary cannot be greater than Maximum";
            next.maxsalary = "Maximum Salary cannot be less than Minimum";
          } else {
            if (
              next.minsalary ===
                "Minimum Salary cannot be greater than Maximum" ||
              next.minsalary === "Minimum and Maximum Salary cannot be equal"
            )
              next.minsalary = "";
            if (
              next.maxsalary === "Maximum Salary cannot be less than Minimum" ||
              next.maxsalary === "Maximum and Minimum Salary cannot be equal"
            )
              next.maxsalary = "";
          }
        }
      }

      return next;
    });
  };

  // (Removed old toggle for manual Location dropdown; now using shared DropdownWithSearchField)

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
      experience: "",
      expertise: "",
    }));

    resetSkillForm();
  };

  const resetSkillForm = () => {
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
    setCurrentStep(0);
    setIsModalOpen(false);
    setShowSkillValidation(false); // Reset validation flag

    // setEditingIndex(null);
    // setAllSelectedSkills(entries.map(e => e.skill));
  };

  const handleSubmit = async (
    e,
    actionType = "",
    skipValidation = false,
    updatedData = null
  ) => {
    if (e) {
      e.preventDefault();
    }

    // Function to check if two objects are equal
    const isEqual = (obj1, obj2) => {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    };

    // Ensure updatedData is used correctly
    const shouldUseUpdatedData = updatedData && !isEqual(formData, updatedData);
    const shouldUseUpdatedDataForAction = [
      "RoundDetailsSave",
      "RoundDetailsSave&AddRound",
      "RoundDetailsSave&Next",
    ].includes(actionType);

    // Use updatedData when required
    const dataToSubmit =
      shouldUseUpdatedDataForAction && shouldUseUpdatedData
        ? updatedData
        : formData;

    // Show skills validation when submit is attempted
    if (!skipValidation) {
      setShowSkillValidation(true);
    }

    setErrors({});

    if (!skipValidation) {
      const { formIsValid, newErrors } = validateForm(
        dataToSubmit,
        entries || [],
        dataToSubmit.rounds || []
      );
      console.log("formIsValid", formIsValid);
      console.log("newErrors", newErrors);
      if (!formIsValid) {
        setErrors(newErrors);
        // v1.0.1 <------------------------------------------------------
        scrollToFirstError(newErrors, fieldRefs); // 🔥 Add this line
        // v1.0.1 ------------------------------------------------------>
        return;
      }
    }

    setErrors({});
    console.log("dataToSubmit", dataToSubmit);

    let basicdetails = {
      // ...dataToSubmit,
      Location: dataToSubmit.Location,
      title: dataToSubmit.title,
      NoofPositions: dataToSubmit?.NoofPositions
        ? parseInt(dataToSubmit?.NoofPositions)
        : null,
      companyname: dataToSubmit.companyName,
      ...(dataToSubmit.minexperience && {
        minexperience: parseInt(dataToSubmit.minexperience),
      }),
      ...(dataToSubmit.maxexperience && {
        maxexperience: parseInt(dataToSubmit.maxexperience),
      }),
      // ✅ salary must be string (backend requires it)
      minSalary: dataToSubmit.minSalary ? String(dataToSubmit.minSalary) : "",
      maxSalary: dataToSubmit.maxSalary ? String(dataToSubmit.maxSalary) : "",
      // minexperience: dataToSubmit.minexperience || "",
      // maxexperience: dataToSubmit.maxexperience || "",
      ownerId: userId,
      tenantId: orgId,
      externalId: dataToSubmit.externalId || undefined,
      // Filter out empty skill rows - only include rows where at least one field has a value
      skills: entries
        .filter((entry) => entry.skill || entry.experience || entry.expertise)
        .map((entry) => ({
          skill: entry.skill,
          experience: entry.experience,
          expertise: entry.expertise,
        })),
      additionalNotes: dataToSubmit.additionalNotes,
      jobDescription: dataToSubmit.jobDescription.trim(),
      // templateId: dataToSubmit.template,
      // ✅ fix naming mismatch (backend expects selectedTemplete)
      templateId: dataToSubmit.template?._id || null,
      rounds: dataToSubmit?.template?.rounds || [],
      type: dataToSubmit?.template?.type || "",
    };
    console.log("basicdetails", basicdetails);

    try {
      // let response;
      // if (isEdit && positionId) {
      //   response = await axios.patch(
      //     `${config.REACT_APP_API_URL}/position/${positionId}`,
      //     basicdetails
      //   );

      // } else {
      //   response = await axios.post(
      //     `${config.REACT_APP_API_URL}/position`,
      //     basicdetails
      //   );
      //   setPositionId(response.data.data._id);
      // }
      const response = await addOrUpdatePosition({
        id: id || null,
        data: basicdetails,
      });
      // Updated Successfully

      console.log("response", response);
      if (response.status === "success") {
        notify.success("Position added successfully");
      } else if (
        response.status === "no_changes" ||
        response.status === "Updated successfully"
      ) {
        notify.success("Position Updated successfully");
      } else {
        // Handle cases where the API returns a non-success status
        throw new Error(response.message || "Failed to save position");
      }

      if (
        response.status === "success" ||
        response.status === "Updated successfully" ||
        response.status === "no_changes"
      ) {
        // Handle navigation
        if (actionType === "BasicDetailsSave") {
          // If it's a modal, call the onClose function with the new position data
          if (isModal && onClose) {
            onClose(response.data);
            return;
          }

          // Check if we came from InterviewForm
          const fromPath = location.state?.from;
          const returnTo = location.state?.returnTo;

          if (fromPath === "/interviews/new" && returnTo) {
            navigate(returnTo);
          } else {
            // Navigate back to position main page
            // navigate("/position");
            navigate(-1);
          }
        }
        if (actionType === "BasicDetailsSave&AddRounds") {
          setIsRoundModalOpen(true);
        }
        if (actionType === "BasicDetailsSave&Next") {
          handleNextNavigation();
        }
        if (actionType === "RoundDetailsSave") {
          // onClose();
        }
        if (actionType === "RoundDetailsSave&AddRound") {
          setIsRoundModalOpen(true);
        }
        if (actionType === "RoundDetailsSave&Next") {
          handleNextNavigation();
        }
      }
    } catch (error) {
      // --- MAP BACKEND VALIDATION ERRORS TO FRONTEND ---
      console.log("error", error);
      // Show error toast
      notify.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save position"
      );

      if (error.response && error.response.status === 400) {
        const backendErrors = error.response.data.errors || {};
        console.log("backendErrors", backendErrors);
        setErrors(backendErrors);
        scrollToFirstError(backendErrors, fieldRefs);
      } else {
        console.error("Error saving position:", error);
      }
      // console.error("Error saving position:", error);
    }
  };

  // const handleClearField = (fieldName) => {
  //   setFormData(prev => ({ ...prev, [fieldName]: "" }));

  //   // Clear any related errors
  //   if (errors[fieldName]) {
  //     setErrors(prev => ({ ...prev, [fieldName]: "" }));
  //   }
  // };

  //v1.0.5 Ranjith <----------------------------------->
  const handleClearTemplate = () => {
    setFormData({
      ...formData,
      template: null,
    });
  };
  //v1.0.5 Ranjith <----------------------------------->

  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  // const [insertIndex, setInsertIndex] = useState(-1);
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState("");
  const [rounds, setRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(-1);
  // const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, roundIndex: -1 });
  // const [hoveredRound, setHoveredRound] = useState(-1);
  // const [hasRounds, setHasRounds] = useState(false);

  // if (!isOpen) return null;
  // const maxRounds = 5;
  // const handleSave = (e) => {
  //   e.preventDefault();
  //   // onSubmit();
  // };

  // const handleRoundNext = (interviewType, roundData) => {
  //   setHasRounds(true);
  //   setSelectedInterviewType(interviewType);

  //   if (insertIndex !== -1) {
  //     // Insert at specific position
  //     const newRounds = [...rounds];
  //     newRounds.splice(insertIndex, 0, roundData);

  //     // Update round numbers in the titles
  //     newRounds.forEach((round, idx) => {
  //       round.roundName = round.roundName.replace(/Round \d+/, `Round ${idx + 1}`);
  //     });

  //     setRounds(newRounds);
  //     setCurrentRoundIndex(insertIndex);
  //   } else {
  //     // Add at the end
  //     setRounds(prev => [...prev, roundData]);
  //     setCurrentRoundIndex(rounds.length);
  //   }

  //   setShowAssessment(true);
  //   setIsRoundModalOpen(false);
  //   setCurrentStage(insertIndex !== -1 ? `round${insertIndex + 1}` : `round${rounds.length + 1}`);
  //   setInsertIndex(-1);
  // };

  // const handleAddRoundAtIndex = (index) => {
  //   setInsertIndex(index);
  //   setIsRoundModalOpen(true);
  // };

  // const handleRoundDelete = (index) => {
  //   setDeleteConfirmation({ isOpen: true, roundIndex: index });
  // };

  // const confirmDelete = () => {
  //   if (deleteIndex !== null) {
  //     const updatedEntries = entries.filter((_, index) => index !== deleteIndex);
  //     setEntries(updatedEntries);
  //     setAllSelectedSkills(updatedEntries.map(e => e.skill));
  //     setDeleteIndex(null);
  //   }
  // };

  // const confirmDelete = () => {
  //   if (deleteIndex !== null) {
  //     const entry = entries[deleteIndex];
  //     setAllSelectedSkills(
  //       allSelectedSkills.filter((skill) => skill !== entry.skill)
  //     );
  //     setEntries(entries.filter((_, i) => i !== deleteIndex));
  //     setDeleteIndex(null);
  //   }
  // };

  const handlePreviousNavigation = (stage) => {
    if (stage === "basic") {
      setCurrentStage("basic");
      setShowAssessment(false);
      setSelectedInterviewType("");
      setCurrentRoundIndex(-1);
    } else {
      const roundNum = parseInt(stage.replace("round", ""));
      const prevIndex = roundNum - 1;
      setCurrentRoundIndex(prevIndex);
      setCurrentStage(`round${roundNum}`);
      setSelectedInterviewType(rounds[prevIndex].interviewType);
      setShowAssessment(true);
    }
  };

  const handleSaveRound = (roundData, actionType) => {
    setFormData((prevData) => {
      let updatedRounds = [...(prevData.rounds || [])];

      if (actionType === "RoundDetailsSave&AddRound") {
        updatedRounds.push(roundData);
      } else if (actionType === "RoundDetailsSave&Next") {
        updatedRounds[currentRoundIndex] = roundData;
      } else if (actionType === "RoundDetailsSave") {
        updatedRounds[currentRoundIndex] = roundData;
      }

      return {
        ...prevData,
        rounds: updatedRounds,
      };
    });

    // Call handleSubmit after the state has been updated
    setTimeout(() => {
      handleSubmit(null, actionType, true);
    }, 0);
  };

  const renderStageIndicator = () => {
    // Update flag when moving to rounds
    //const isBasicStage = currentStage === 'basic';
    // const currentRoundNumber = currentStage.startsWith('round') ? parseInt(currentStage.slice(5)) : 0;

    return (
      <div className="flex items-center justify-center mb-1 mt-1 w-full overflow-x-auto ">
        <div className="flex items-center px-2">
          {/* Basic Details */}
          {/* <div className="flex items-center">
            <span className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium sm:text-[12px] md:text-[14px] ${isBasicStage
              ? 'bg-orange-500 text-white'
              : 'bg-teal-600 text-white'
              }`}>
              Basic Details
            </span>
          </div> */}

          {/* Rounds Section */}
          {/* {!hasMovedToRounds && isBasicStage ? (
            // When in Basic Details: Show just Round 1
            <>
              <div className="flex items-center">
                <div className="h-[1px] w-10 bg-teal-200"></div>
              </div>
              <span className="whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium bg-teal-50 text-teal-600 border border-teal-100 sm:text-[12px] md:text-[14px]">
                Rounds
              </span>
              <div className="flex items-center">
                <div className="h-[1px] w-10 bg-teal-200"></div>
              </div>
            </>
          ) : ( */}
          {/* // When in Rounds: Show all rounds with plus icons */}
          {/* <>
              {rounds.map((_, index) => (
                <div key={index} className="flex items-center"> */}
          {/* Connector to Round with Plus Icon */}
          {/* <div className="flex items-center">
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                    <div
                      onClick={() => handleAddRoundAtIndex(index)}
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${index < currentRoundNumber
                        ? 'border-teal-600 bg-teal-600 hover:bg-teal-700'
                        : 'border-teal-200 bg-teal-50 hover:border-teal-600'
                        }`}
                    >
                      <FaPlus className={`h-3 w-3 ${index < currentRoundNumber ? 'text-white' : 'text-teal-600'
                        }`} />
                    </div>
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                  </div>

       
                  <div
                    className="relative group"
                    onMouseEnter={() => setHoveredRound(index)}
                    onMouseLeave={() => setHoveredRound(-1)}
                  >
                    <div
                    // <----------- i want this for future use ------------>
                    // onClick={() => handleRoundClick(index)}
                    >
                      <span className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium sm:text-[12px] md:text-[14px] ${currentStage === 'round' + (index + 1)
                        ? 'bg-orange-500 text-white'
                        : currentStage.startsWith('round') && parseInt(currentStage.slice(5)) > index + 1
                          ? 'bg-teal-600 text-white'
                          : 'bg-teal-50 text-teal-600 border border-teal-100'
                        }`}>
                        Round {index + 1}
                      </span>
                    </div>
                    {hoveredRound === index && (
                      <button
                        onClick={() => handleRoundDelete(index)}
                        className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                      >
                        <FaTrash className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))} */}

          {/* Plus icon to add round after current round  */}
          {/* <div className="flex items-center">
                <div className="h-[1px] w-10 bg-teal-200"></div>
                <div
                  onClick={() => handleAddRoundAtIndex(rounds.length)}
                  className="h-6 w-6 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center cursor-pointer hover:border-teal-600"
                >
                  <FaPlus className="h-3 w-3 text-teal-600" />
                </div>
                <div className="h-[1px] w-10 bg-teal-200"></div>
              </div> */}

          {/* Next Future Round */}
          {/* {rounds.length < maxRounds && (
                <div className="flex items-center">
                  <div className="flex items-center">
                    <span className="whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium bg-gray-50 text-gray-400 border border-gray-200 sm:text-[12px] md:text-[14px]">
                      Round {rounds.length + 1}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                    <div className="h-6 w-6 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center">
                      <FaPlus className="h-3 w-3 text-teal-600" />
                    </div>
                    <div className="h-[1px] w-12 bg-teal-200"></div>
                  </div>
                </div>
              )}
            </>
          )} */}

          {/* <div className="flex items-center">
            <div className="h-8 w-8 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center" >
              <div className="h-5 w-5 rounded-full border-2 border-teal-200"></div>
            </div>
          </div> */}
        </div>
      </div>
    );
  };

  const renderInterviewComponent = () => {
    const roundDetails = rounds[currentRoundIndex];
    if (selectedInterviewType === "Technical") {
      return (
        <TechnicalType
          roundDetails={roundDetails}
          onPrevious={(stage) => {
            if (stage) {
              handlePreviousNavigation(stage);
            } else {
              // onClose();
            }
          }}
          // onCancel={onClose}
          onSave={handleSaveRound}
          roundNumber={currentRoundIndex + 1}
          isLastRound={currentRoundIndex === rounds.length - 1}
        />
      );
    } else if (selectedInterviewType === "Assessment") {
      return (
        <AssessmentDetails
          roundDetails={roundDetails}
          onPrevious={(stage) => {
            if (stage) {
              handlePreviousNavigation(stage);
            } else {
              // onClose();
            }
          }}
          // onCancel={onClose}
          onSave={handleSaveRound}
          roundNumber={currentRoundIndex + 1}
          isLastRound={currentRoundIndex === rounds.length - 1}
        />
      );
    }
    return null;
  };

  const handleNextNavigation = () => {
    if (currentRoundIndex + 1 < rounds.length) {
      const nextIndex = currentRoundIndex + 1;
      setCurrentRoundIndex(nextIndex);
      setCurrentStage(`round${nextIndex + 1}`);
      setSelectedInterviewType(rounds[nextIndex].interviewType);
      setShowAssessment(true);
    }
  };

  // Location dropdown state - same pattern as company
  const [showDropdownLocation, setShowDropdownLocation] = useState(false);
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const locationDropdownRef = useRef(null);

  const handleLocationSelect = (location) => {
    if (location === "others") {
      setIsCustomLocation(true);
      setFormData((prev) => ({ ...prev, Location: "" }));
    } else {
      setIsCustomLocation(false);
      setFormData((prev) => ({ ...prev, Location: location.LocationName }));
    }
    setShowDropdownLocation(false);
    setLocationSearchTerm("");
    if (errors.Location) {
      setErrors((prevErrors) => ({ ...prevErrors, Location: "" }));
    }
  };

  // Handle click outside location dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target)
      ) {
        setShowDropdownLocation(false);
        setLocationSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredLocations = locations?.filter((location) =>
    location.LocationName?.toString()
      .toLowerCase()
      .includes(locationSearchTerm.toLowerCase())
  );

  return (
    <div className="flex items-center  justify-center w-full">
      {/* v1.0.4 <------------------------------------------------------- */}
      <div className="bg-white rounded-lg w-full flex flex-col mb-10">
        {/* v1.0.4 -------------------------------------------------------> */}
        {/* Modal Header */}
        <div className="mt-4">
          {/* v1.0.6 <----------------------------------------------------------------------------- */}
          <h2 className="text-2xl font-semibold px-[8%] sm:mt-5 sm:mb-2 sm:text-lg sm:px-[5%] md:mt-6 md:mb-2 md:text-xl md:px-[5%]">
            Position
          </h2>
          {/* v1.0.6 -----------------------------------------------------------------------------> */}
          {/* NAVIGATION - PATH */}
          {renderStageIndicator()}
        </div>

        {/* // Inside your PositionForm component */}
        {/* v1.0.3 <----------------------------------------------------------------------------------------- */}
        {/* <div className="px-[13%] sm:px-[5%] md:px-[5%]"> */}
        {/* v1.0.6 <----------------------------------------------------------------------------- */}
        <div className="px-[8%] sm:px-[5%] md:px-[5%] mb-4">
          {/* v1.0.6 <-----------------------------------------------------------------------------> */}
          {/* v1.0.3 -----------------------------------------------------------------------------------------> */}
          <InfoGuide
            title="Position Creation Guidelines"
            items={[
              <>
                <span className="font-medium">
                  Template Selection (Optional):
                </span>{" "}
                Choose a pre-defined interview template to standardize your
                hiring process
              </>,
              <>
                <span className="font-medium">Template Benefits:</span> Includes
                predefined rounds, questions, and evaluation criteria for
                consistency
              </>,
              <>
                <span className="font-medium">Custom Interview Path:</span> If
                you don't select a template, you can build custom interview
                rounds tailored specifically for this position
              </>,
              <>
                <span className="font-medium">Flexible Approach:</span> Create
                unique assessment stages that match your exact hiring needs
                without template constraints
              </>,
              <>
                <span className="font-medium">Availability:</span> Only active
                templates with configured rounds are displayed for selection
              </>,
              <>
                <span className="font-medium">Interview Structure:</span>{" "}
                Selected template determines the interview flow and assessment
                approach
              </>,
              <>
                <span className="font-medium">Assessment Types:</span> Templates
                may include technical interviews, coding challenges, and
                behavioral evaluations
              </>,
              <>
                <span className="font-medium">Flexibility:</span> Customize
                individual rounds after template selection to meet specific role
                requirements
              </>,
              <>
                <span className="font-medium">Role-Specific Positions:</span>{" "}
                Create multiple positions for different roles within the same
                hiring process
              </>,
              <>
                <span className="font-medium">Template-Free Option:</span> You
                can proceed without a template and build a custom interview
                process from scratch
              </>,
            ]}
          />
        </div>
        {/* v1.0.6 <----------------------------------------------------------------------------- */}
        <div className="px-[8%] sm:px-[5%] md:px-[5%]">
          {/* v1.0.6 -----------------------------------------------------------------------------> */}
          {showAssessment ? (
            <>{renderInterviewComponent()}</>
          ) : (
            <>
              {/* Modal Body */}
              <div className="bg-white rounded-lg shadow-md border">
                <div className="flex justify-between items-center px-5 pt-4">
                  <h2 className="text-lg font-semibold sm:text-md">
                    Position Details:
                  </h2>
                </div>

                <div className="px-6 pt-3">
                  <form className="space-y-5 mb-5">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                      <div>
                        <InputField
                          value={formData.title}
                          onChange={handleChange}
                          name="title"
                          inputRef={fieldRefs.title}
                          error={errors.title}
                          label="Title"
                          required
                          placeholder="UI/UX Designer"
                        />
                      </div>

                      {/* Company Name */}
                      <div>
                        <DropdownWithSearchField
                          value={formData.companyName}
                          options={companyOptionsRS}
                          onChange={handleChange}
                          // error={errors.companyname}
                          containerRef={fieldRefs.companyname}
                          label="Company Name"
                          name="companyName"
                          // required
                          isCustomName={isCustomCompany}
                          setIsCustomName={setIsCustomCompany}
                          onMenuOpen={loadCompanies}
                          loading={isCompaniesFetching}
                        />
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-1 lg:grid-cols-2">
                      <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
                        <IncreaseAndDecreaseField
                          value={formData.minexperience}
                          onChange={handleChange}
                          inputRef={fieldRefs.minexperience}
                          error={errors.minexperience}
                          label="Min Experience"
                          min={1}
                          max={15}
                          name="minexperience"
                          required
                        />
                        <IncreaseAndDecreaseField
                          value={formData.maxexperience}
                          onChange={handleChange}
                          inputRef={fieldRefs.maxexperience}
                          error={errors.maxexperience}
                          min={1}
                          max={15}
                          label="Max Experience"
                          name="maxexperience"
                          required
                        />
                      </div>

                      <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
                        <IncreaseAndDecreaseField
                          value={formData.minSalary}
                          onChange={handleChange}
                          inputRef={fieldRefs.minSalary}
                          error={errors.minsalary}
                          min={0}
                          max={1000000000}
                          label="Min Salary (Annual)"
                          name="minSalary"
                          // required={formData.maxSalary ? true : false}
                        />
                        <IncreaseAndDecreaseField
                          value={formData.maxSalary}
                          onChange={handleChange}
                          min={0}
                          max={1000000000}
                          inputRef={fieldRefs.maxSalary}
                          error={errors.maxsalary}
                          label="Max Salary (Annual)"
                          name="maxSalary"
                          // required={formData.minSalary ? true : false}
                        />
                      </div>
                    </div>

                    {/* location  and no of positions  */}

                    <div className="grid grid-cols-2 w-full sm:w-full md:w-full sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                      <IncreaseAndDecreaseField
                        value={formData.NoofPositions}
                        onChange={handleChange}
                        inputRef={fieldRefs.NoofPositions}
                        // error={errors.NoofPositions}
                        min={1}
                        max={100}
                        label="No. of Positions"
                        name="NoofPositions"
                        // required
                      />

                      <div>
                        <DropdownWithSearchField
                          value={formData.Location}
                          options={locationOptionsRS}
                          onChange={handleChange}
                          // error={errors.Location}
                          containerRef={fieldRefs.location}
                          label="Location"
                          name="Location"
                          // required
                          isCustomName={isCustomLocation}
                          setIsCustomName={setIsCustomLocation}
                          onMenuOpen={loadLocations}
                          loading={isLocationsFetching}
                        />
                      </div>
                      {/* -----v1.0.0-----> */}
                    </div>
                    {/* </div> */}

                    {/* Job Description */}
                    <DescriptionField
                      value={formData.jobDescription}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, jobDescription: value });
                        if (errors.jobDescription) {
                          setErrors((prev) => ({
                            ...prev,
                            jobDescription: "",
                          }));
                        }
                      }}
                      name="jobDescription"
                      inputRef={fieldRefs.jobDescription}
                      error={errors.jobDescription}
                      label="Job Description"
                      required
                      placeholder="This position is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."
                      rows={10}
                      minLength={50}
                      maxLength={1000}
                    />

                    {/* skills */}
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
                            allSelectedSkills.filter(
                              (skill) => skill !== entry.skill
                            )
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
                          setFormData((prev) => ({
                            ...prev,
                            skills: newEntries,
                          }));
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

                    {/* External ID Field */}
                    <div className="mt-4">
                      <InputField
                        value={formData.externalId}
                        onChange={handleChange}
                        inputRef={fieldRefs.externalId}
                        error={errors.externalId}
                        label="External ID"
                        name="externalId"
                        placeholder="Optional external system identifier"
                      />
                    </div>

                    {/* Select Template */}
                    <div className="grid sm:grid-cols-1 grid-cols-2">
                      <div className="relative">
                        <DropdownWithSearchField
                          value={formData.template?._id || ""}
                          options={templateOptions}
                          onChange={(e) => {
                            const selectedTemplate = templatesData.find(
                              (t) => t._id === e.target.value
                            );
                            setFormData({
                              ...formData,
                              template: selectedTemplate || {},
                            });
                          }}
                          error={errors?.template}
                          label="Template"
                          name="template"
                          required={false}
                          loading={isTemplatesFetching}
                        />
                        {/* //v1.0.5 Ranjith <-----------------------------------> */}
                        {formData.template?._id && (
                          <button
                            type="button"
                            onClick={handleClearTemplate}
                            className="absolute right-14 text-xl top-7 text-red-500 hover:text-red-600 z-10"
                            title="Clear template"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {/* //v1.0.5 Ranjith <-----------------------------------> */}
                    </div>
                    {/* v1.0.2 ---------------------------------------------------> */}
                    <DescriptionField
                      value={formData.additionalNotes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          additionalNotes: e.target.value,
                        })
                      }
                      name="additionalNotes"
                      error={errors?.additionalNotes}
                      label="Additional Notes"
                      placeholder="Type your notes here..."
                      rows={5}
                      maxLength={1000}
                    />
                  </form>
                  {/* v1.0.4 <---------------------------------------------------- */}
                  <div className="flex justify-end items-center px-0 py-4 gap-2">
                    {/* v1.0.4 ----------------------------------------------------> */}
                    <button
                      className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                      type="button"
                      onClick={() => {
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
                        } else {
                          // Navigate back to position main page
                          // navigate("/position");
                          navigate(-1);
                        }
                      }}
                    >
                      Cancel
                    </button>
                    <LoadingButton
                      onClick={(e) => handleSubmit(e, "BasicDetailsSave")}
                      isLoading={isMutationLoading}
                      loadingText={id ? "Updating..." : "Saving..."}
                    >
                      {isEdit ? "Update" : "Save"}
                    </LoadingButton>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionForm;
