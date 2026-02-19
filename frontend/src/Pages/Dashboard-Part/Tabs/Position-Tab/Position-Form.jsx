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

import { useEffect, useState, useRef, useMemo } from "react";
import AssessmentDetails from "./AssessmentType";
import TechnicalType from "./TechnicalType";
import Cookies from "js-cookie";
import { validateForm } from "../../../../utils/PositionValidation.js";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import SkillsField from "../CommonCode-AllTabs/SkillsInput.jsx";
import {
  usePositions,
  usePositionById,
} from "../../../../apiHooks/usePositions";
import LoadingButton from "../../../../Components/LoadingButton";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import { useInterviewTemplates } from "../../../../apiHooks/useInterviewTemplates.js";
// v1.0.1 <----------------------------------------------------------------------------
import { scrollToFirstError } from "../../../../utils/ScrollToFirstError/scrollToFirstError.js";
import { notify } from "../../../../services/toastService.js";
import { ArrowLeft, Info } from "lucide-react";
import InfoGuide from "../CommonCode-AllTabs/InfoCards.jsx";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";
import IncreaseAndDecreaseField from "../../../../Components/FormFields/IncreaseAndDecreaseField";
import InputField from "../../../../Components/FormFields/InputField";
import DescriptionField from "../../../../Components/FormFields/DescriptionField";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect.jsx";
// v1.0.1 ---------------------------------------------------------------------------->
import { useCompanies } from "../../../../apiHooks/TenantCompany/useTenantCompanies.js"; // Add this import
import CompanyForm from "../Companies/CompanyForm.jsx";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock.js";
import { Button } from "../../../../Components/Buttons/Button";

const PositionForm = ({ mode, onClose, isModal = false }) => {
  // <---------------------------------------------------------------
  const { getAllCompanies, isLoading: isCompaniesFetchingAction } =
    useCompanies();
  const [companiesList, setCompaniesList] = useState([]);

  // const fetchCompaniesData = async () => {
  //   try {
  //     const data = await getAllCompanies();
  //     setCompaniesList(data || []);
  //   } catch (error) {
  //     console.error("Failed to fetch companies:", error);
  //   }
  // };
  const fetchCompaniesData = async () => {
    try {
      const response = await getAllCompanies({ limit: 1000 });
      // Handle both paginated response ({ data: [...] }) and direct array response
      const data = response?.data || response || [];
      setCompaniesList(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchCompaniesData();
  }, []);

  // Company Options: Purely from the new hook, no "Other"
  // Find this block and update it
  // const companyOptionsRS = useMemo(() => {
  //   return (companiesList || []).map((c) => ({
  //     value: c?._id, // Store the MongoDB ID as the value
  //     label: c?.name, // Show the Name as the label in the UI
  //   }));
  // }, [companiesList]);

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isCustomCompany, setIsCustomCompany] = useState(false);
  useScrollLock(isCompanyModalOpen);

  const companyOptionsRS = useMemo(() => {
    // const options = (companiesList || []).map((c) => ({
    //   value: c?._id,
    //   label: c?.name,
    // }));
    const options = (companiesList || [])
      .filter((c) => c?.status === "active")
      .map((c) => ({
        value: c?._id,
        label: c?.name,
      }));

    // Add the "Other" trigger which is supported by your Dropdown component
    return [...options, { value: "__other__", label: "+ Create New Company" }];
  }, [companiesList]);

  // const handleIsCustomCompany = (val) => {
  //   if (val === true) {
  //     setIsCompanyModalOpen(true);
  //     // We reset this so the dropdown doesn't stay in "Other" mode
  //     // if the user cancels the company creation.
  //     setIsCustomCompany(false);
  //   } else {
  //     setIsCustomCompany(false);
  //   }
  // };

  const handleIsCustomCompany = (val) => {
    // If val is true, it means the "Other" option was selected
    // or the custom state was triggered by the dropdown
    if (val === true) {
      setIsCompanyModalOpen(true);
      // Don't immediately set this to false here if you rely on it
      // to keep the dropdown in a specific state.
      // However, for opening a modal, just the setter above is enough.
    }
    setIsCustomCompany(val);
  };

  // --------------------------------------------------------------->
  const { isMutationLoading, addOrUpdatePosition } = usePositions({
    limit: 1,
  });

  const TEMPLATE_DROPDOWN_LIMIT = 50;
  const [templateLimit, setTemplateLimit] = useState(TEMPLATE_DROPDOWN_LIMIT);
  const [templateSearch, setTemplateSearch] = useState("");
  const [debouncedTemplateSearch, setDebouncedTemplateSearch] = useState("");

  // State for tooltip visibility
  const [showTooltip, setShowTooltip] = useState(false);

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

  const {
    templatesData,
    totalCount: totalTemplates,
    isQueryLoading: isTemplatesFetching,
    useInterviewtemplateDetails,
  } = useInterviewTemplates({
    type: "interviewtemplates",
    page: 1,
    limit: templateLimit,
    ...(debouncedTemplateSearch && { search: debouncedTemplateSearch }),
  });
  const pageType = "adminPortal";

  const {
    // companies,
    locations,
    skills,
    // loadCompanies,
    loadLocations,
    loadSkills,
    // isCompaniesFetching,
    isLocationsFetching,
  } = useMasterData({}, pageType);

  const { id } = useParams();
  const { position: selectedPosition, isLoading: isPositionLoading } =
    usePositionById(id);

  // Fetch the position's linked interview template by id instead of
  // relying on the paginated/filtered templatesData list.
  const { data: selectedTemplate, isLoading: isTemplateLoading } =
    useInterviewtemplateDetails(
      selectedPosition?.templateId?._id || selectedPosition?.templateId,
    );
  const location = useLocation();
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const userId = tokenPayload?.userId;
  const orgId = tokenPayload?.tenantId;
  const isOrganization = tokenPayload?.organization === true;
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

  const hasInitializedFormRef = useRef(false);

  const [formData, setFormData] = useState({
    title: "",
    companyName: null,
    minexperience: "",
    maxexperience: "",
    maxSalary: "",
    minSalary: "",
    jobDescription: "",
    requirements: "",
    additionalNotes: "",
    skills: [],
    template: {},
    NoofPositions: 1,
    Location: "",
    externalId: "",
    status: "opened",
    employmentType: "full_time",
  });
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [showSkillValidation, setShowSkillValidation] = useState(false); // Track if skills validation should show
  // const [showDropdownCompany, setShowDropdownCompany] = useState(false);
  // const [isCustomCompany, setIsCustomCompany] = useState(false);
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
  const STATUS_OPTIONS = ["opened", "closed", "hold"];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTemplateSearch(templateSearch.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [templateSearch]);

  useEffect(() => {
    // Reset template limit when search query changes
    setTemplateLimit(TEMPLATE_DROPDOWN_LIMIT);
  }, [debouncedTemplateSearch]);

  // Handle click outside company dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target)
      ) {
        // setShowDropdownCompany(false);
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

  // const filteredCompanies = companies?.filter((company) =>
  //   company.CompanyName?.toString()
  //     .toLowerCase()
  //     .includes(companySearchTerm.toLowerCase())
  // );

  useEffect(() => {
    if (currentStage !== "basic") {
      setHasMovedToRounds(true);
    }
  }, [currentStage]);

  // useEffect(() => {
  //   if (!id || !selectedPosition) {
  //     return;
  //   }

  //   const companyName = selectedPosition?.companyname || "";

  //   if (companyName && Array.isArray(companies) && companies.length > 0) {
  //     const companyExists = companies.some(
  //       (company) => company.CompanyName === companyName
  //     );
  //     if (!companyExists) {
  //       setIsCustomCompany(true);
  //     } else {
  //       setIsCustomCompany(false);
  //     }
  //   } else if (
  //     companyName &&
  //     (!Array.isArray(companies) || companies.length === 0)
  //   ) {
  //     setIsCustomCompany(true);
  //   }

  //   if (hasInitializedFormRef.current) {
  //     return;
  //   }

  //   setIsEdit(true);

  //   setFormData({
  //     title: selectedPosition?.title || "",
  //     companyName: companyName,
  //     minexperience: selectedPosition?.minexperience || 0,
  //     maxexperience: selectedPosition?.maxexperience || 0,
  //     minSalary: selectedPosition?.minSalary || "",
  //     maxSalary: selectedPosition?.maxSalary || "",
  //     jobDescription: selectedPosition?.jobDescription || "",
  //     additionalNotes: selectedPosition?.additionalNotes || "",
  //     NoofPositions: selectedPosition?.NoofPositions?.toString() || "",
  //     Location: selectedPosition?.Location || "",
  //     externalId: selectedPosition?.externalId || "",
  //     template: selectedTemplate || {},
  //     status: selectedPosition?.status || "",
  //   });

  //   const formattedSkills =
  //     selectedPosition?.skills?.map((skill) => ({
  //       skill: skill.skill || "",
  //       experience: skill.experience || "",
  //       expertise: skill.expertise || "",
  //       _id: skill._id || "",
  //     })) || [];

  //   setEntries(formattedSkills);
  //   setAllSelectedSkills(
  //     selectedPosition?.skills?.map((skill) => skill.skill) || []
  //   );

  //   hasInitializedFormRef.current = true;

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [id, selectedPosition, companies, selectedTemplate]);

  useEffect(() => {
    // 1. Guard clauses
    if (isPositionLoading) return;
    if (!id || !selectedPosition) return;

    // Wait for template to load if a template ID exists
    const templateId =
      selectedPosition?.templateId?._id || selectedPosition?.templateId;
    if (templateId && isTemplateLoading) return;

    if (hasInitializedFormRef.current) return;

    setIsEdit(true);

    // 2. Map existing data to formData state
    // Ensure the keys match exactly what your form fields use (e.g., formData.companyName)
    setFormData({
      title: selectedPosition?.title || "",
      // companyName: selectedPosition?.companyname || "", // Match backend field 'companyname'
      companyName:
        selectedPosition?.companyname?._id ||
        selectedPosition?.companyname?.name ||
        "",
      minexperience: selectedPosition?.minexperience || 0,
      maxexperience: selectedPosition?.maxexperience || 0,
      minSalary: selectedPosition?.minSalary || "",
      maxSalary: selectedPosition?.maxSalary || "",
      jobDescription: selectedPosition?.jobDescription || "",
      requirements: selectedPosition?.requirements || "",
      additionalNotes: selectedPosition?.additionalNotes || "",
      NoofPositions: selectedPosition?.NoofPositions?.toString() || "",
      Location: selectedPosition?.Location || "",
      externalId: selectedPosition?.externalId || "",
      template: selectedTemplate || {},
      status: selectedPosition?.status || "opened",
      employmentType: selectedPosition?.employmentType || "",
    });

    // 3. Map Skills
    const formattedSkills =
      selectedPosition?.skills?.map((skill) => ({
        skill: skill.skill || "",
        experience: skill.experience || "",
        expertise: skill.expertise || "",
        requirement_level: skill.requirement_level || "REQUIRED",
        _id: skill._id || "",
      })) || [];

    setEntries(formattedSkills);
    setAllSelectedSkills(
      selectedPosition?.skills?.map((skill) => skill.skill) || [],
    );

    // 4. Mark as initialized so it doesn't overwrite user changes on re-renders
    hasInitializedFormRef.current = true;
  }, [id, selectedPosition, selectedTemplate]);

  const statusOptions = STATUS_OPTIONS.map((s) => ({
    value: s,
    label: capitalizeFirstLetter(s),
  }));
  function formatEmploymentType(type) {
    if (!type) return "";

    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Employment type options (usually put this outside the component)
  const employmentTypeOptions = ["full_time", "part_time", "contract"].map(
    (value) => ({
      value: value,
      label: formatEmploymentType(value),
    }),
  );

  // const openStatusModal = (row) => {
  //   setStatusTargetRow(row);
  //   setStatusValue(row?.status);
  //   setIsStatusModalOpen(true);
  // };

  // const closeStatusModal = () => {
  //   setIsStatusModalOpen(false);
  //   setStatusTargetRow(null);
  // };

  // const confirmStatusUpdate = async () => {
  //   // if (!statusTargetRow) return;
  //   // await handleStatusChange(statusTargetRow, statusValue);
  //   // closeStatusModal();
  //   formData.status = statusValue;
  //   // closeStatusModal();
  // };

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
  // const companyOptionsRS = (companies || [])
  //   .map((c) => ({ value: c?.CompanyName, label: c?.CompanyName }))
  //   .concat([{ value: "__other__", label: "+ Others" }]);
  // const locationOptionsRS = (locations || [])
  //   .map((l) => ({ value: l?.LocationName, label: l?.LocationName }))
  //   .concat([{ value: "__other__", label: "+ Others" }]);
  const locationOptionsRS = (locations || [])
    .map((l) => ({ value: l?.LocationName, label: l?.LocationName }))
    .concat([{ value: "__other__", label: "+ Others" }]);

  const templateOptions = useMemo(() => {
    const baseOptions = (templatesData || [])
      .filter((t) => t?.rounds?.length > 0 && t?.status === "active")
      .sort((a, b) => {
        // custom first, standard after
        if (a.type === "custom" && b.type === "standard") return -1;
        if (a.type === "standard" && b.type === "custom") return 1;
        return 0;
      })
      .map((t) => {
        const titleLabel = t.title
          ? t.title.charAt(0).toUpperCase() + t.title.slice(1)
          : t.type
            ? t.type.charAt(0).toUpperCase() + t.type.slice(1)
            : "Unnamed Template";

        return {
          value: t._id,
          label: (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "98%",
              }}
            >
              <span>{titleLabel}</span>
              <span
                className={
                  "text-md " +
                  (t.type === "custom" ? "text-custom-blue" : "text-green-600")
                }
              >
                {t.type ? t.type.charAt(0).toUpperCase() + t.type.slice(1) : ""}
              </span>
            </div>
          ),
          searchLabel: titleLabel,
        };
      });

    // Ensure the edit-mode selected template is always present in options,
    // even if it's not in the current templatesData page.
    if (selectedTemplate && selectedTemplate._id) {
      const exists = baseOptions.some(
        (opt) => opt.value === selectedTemplate._id,
      );
      if (!exists) {
        const selectedTitleLabel = selectedTemplate.title
          ? selectedTemplate.title.charAt(0).toUpperCase() +
          selectedTemplate.title.slice(1)
          : selectedTemplate.type
            ? selectedTemplate.type.charAt(0).toUpperCase() +
            selectedTemplate.type.slice(1)
            : "Unnamed Template";

        baseOptions.push({
          value: selectedTemplate._id,
          label: (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "98%",
              }}
            >
              <span>{selectedTitleLabel}</span>
              <span
                className={
                  "text-md " +
                  (selectedTemplate.type === "custom"
                    ? "text-custom-blue"
                    : "text-green-600")
                }
              >
                {selectedTemplate.type
                  ? selectedTemplate.type.charAt(0).toUpperCase() +
                  selectedTemplate.type.slice(1)
                  : ""}
              </span>
            </div>
          ),
          searchLabel: selectedTitleLabel,
        });
      }
    }

    return baseOptions;
  }, [templatesData, selectedTemplate]);

  const handleTemplateMenuScrollToBottom = () => {
    if (isTemplatesFetching) return;
    if (!totalTemplates || templateLimit >= totalTemplates) return;

    setTemplateLimit((prev) => prev + TEMPLATE_DROPDOWN_LIMIT);
  };

  // Generic change handler for shared form fields + live cross-field validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    // SPECIFIC FIX FOR COMPANY MODAL TRIGGER
    if (name === "companyName" && value === "__other__") {
      setIsCompanyModalOpen(true);
      return; // Stop execution so "__other__" isn't saved as the actual name
    }

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
    updatedData = null,
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
        dataToSubmit.rounds || [],
      );

      if (!formIsValid) {
        setErrors(newErrors);
        // v1.0.1 <------------------------------------------------------
        scrollToFirstError(newErrors, fieldRefs); // 🔥 Add this line
        // v1.0.1 ------------------------------------------------------>
        return;
      }
    }

    setErrors({});

    let basicdetails = {
      // ...dataToSubmit,
      Location: dataToSubmit.Location,
      title: dataToSubmit.title,
      NoofPositions: dataToSubmit?.NoofPositions
        ? parseInt(dataToSubmit?.NoofPositions)
        : null,
      // companyname: dataToSubmit.companyName,
      companyname: dataToSubmit.companyName || null,
      companyName: dataToSubmit.companyName,
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
        .filter((entry) => entry.skill || entry.experience)
        .map((entry) => ({
          skill: entry.skill,
          experience: entry.experience,
          requirement_level: entry.requirement_level || "REQUIRED",
        })),
      additionalNotes: dataToSubmit.additionalNotes,
      jobDescription: dataToSubmit.jobDescription.trim(),
      requirements: dataToSubmit.requirements?.trim() || "",
      // templateId: dataToSubmit.template,
      // ✅ fix naming mismatch (backend expects selectedTemplete)
      templateId: dataToSubmit.template?._id || null,
      rounds: dataToSubmit?.template?.rounds || [],
      type: dataToSubmit?.template?.type || "",
      status: dataToSubmit?.status || "",
      employmentType: dataToSubmit?.employmentType || "",
      // rounds: dataToSubmit.rounds || [],
      // rounds: dataToSubmit?.template?.rounds || [],
    };

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

      // Show error toast
      notify.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to save position",
      );

      if (error.response && error.response.status === 400) {
        const backendErrors = error.response.data.errors || {};

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
      .includes(locationSearchTerm.toLowerCase()),
  );

  return (
    <div className="flex items-center  justify-center w-full">
      {/* v1.0.4 <------------------------------------------------------- */}
      <div className="bg-white w-full flex flex-col pb-20">
        {/* v1.0.4 -------------------------------------------------------> */}
        {/* Modal Header */}
        <div className="mt-4">
          {/* v1.0.6 <----------------------------------------------------------------------------- */}
          {/* <h2 className="text-2xl font-semibold px-[8%] sm:mt-5 sm:mb-2 sm:text-lg sm:px-[5%] md:mt-6 md:mb-2 md:text-xl md:px-[5%]">
            Position
          </h2> */}
          <div className="px-[8%] sm:px-[5%] mt-4 mb-2 md:px-[5%]">
            <button
              onClick={() => {
                if (isModal && onClose) {
                  onClose();
                  return;
                }
                const fromPath = location.state?.from;
                const returnTo = location.state?.returnTo;

                if (fromPath === "/interviews/new" && returnTo) {
                  navigate(returnTo);
                } else {
                  navigate(-1);
                }
              }}
              type="button"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" /> Back to Positions
            </button>
          </div>
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

                <div className="px-6 pt-3 pb-4">
                  <form className="space-y-8 mb-2">
                    {/* SECTION 1: BASIC INFORMATION */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                        {/* Row 1: Title & Company Name */}
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

                        <div>
                          <DropdownWithSearchField
                            value={formData.companyName}
                            options={companyOptionsRS}
                            onChange={handleChange}
                            containerRef={fieldRefs.companyname}
                            label="Company Name"
                            name="companyName"
                            isCustomName={isCustomCompany}
                            setIsCustomName={handleIsCustomCompany} // Custom toggle handler
                            onMenuOpen={fetchCompaniesData}
                            loading={isCompaniesFetchingAction}
                            placeholder="Select Company"
                          />
                        </div>

                        {/* Row 2: Employment Type & Location */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-1">
                            Employment Type
                          </h3>
                          <div>
                            <DropdownSelect
                              value={employmentTypeOptions.find(
                                (opt) => opt.value === formData.employmentType,
                              )}
                              onChange={(selected) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  employmentType: selected?.value || "",
                                }));
                              }}
                              options={employmentTypeOptions}

                            />
                          </div>
                        </div>

                        <div>

                          <DropdownWithSearchField
                            value={formData.Location}
                            options={locationOptionsRS}
                            onChange={handleChange}
                            error={errors.Location}
                            containerRef={fieldRefs.location}
                            label="Location"
                            name="Location"
                            required
                            isCustomName={isCustomLocation}
                            setIsCustomName={setIsCustomLocation}
                            onMenuOpen={loadLocations}
                            loading={isLocationsFetching}
                          />
                        </div>

                        {/* Row 3: No. of Positions & Status */}
                        <div>
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
                        </div>

                        <div>
                          <div>
                            <h3 className="text-sm text-gray-700 font-semibold mb-1">
                              Status
                            </h3>
                            <DropdownSelect
                              value={statusOptions.find(
                                (opt) => opt.value === formData.status,
                              )} // match current selection
                              onChange={(selected) => {
                                formData.status = selected.value;
                                setFormData({ ...formData });
                              }} // update state with value
                              options={statusOptions.map((option) => ({
                                ...option,
                                label: capitalizeFirstLetter(option.label),
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: EXPERIENCE & COMPENSATION */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Experience & Compensation
                      </h3>
                      <div className="grid grid-cols-4 gap-4 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
                        {/* Row 4: Min Exp, Max Exp, Min Salary, Max Salary */}
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

                        <IncreaseAndDecreaseField
                          value={formData.minSalary}
                          onChange={handleChange}
                          inputRef={fieldRefs.minSalary}
                          error={errors.minsalary}
                          min={50000} // 5 digits minimum
                          max={999999999} // 9 digits maximum
                          label="Min Salary (Annual)"
                          name="minSalary"
                          placeholder="Min Salary (Annual)"
                          showCurrencyIcon={true}
                        // required={formData.maxSalary ? true : false}
                        />
                        <IncreaseAndDecreaseField
                          value={formData.maxSalary}
                          onChange={handleChange}
                          min={50000} // 5 digits minimum
                          max={999999999} // 9 digits maximum
                          inputRef={fieldRefs.maxSalary}
                          error={errors.maxsalary}
                          label="Max Salary (Annual)"
                          name="maxSalary"
                          placeholder="Max Salary (Annual)"
                          showCurrencyIcon={true}
                        // required={formData.minSalary ? true : false}
                        />
                      </div>
                    </div>

                    {/* location  and no of positions  */}

                    {/* SECTION 3: INTERVIEW SETUP */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Interview Setup
                      </h3>
                      {/* Select Template */}
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                        {/* Row 5: Template & External ID */}
                        <div className="relative">
                          <DropdownWithSearchField
                            value={formData.template?._id || ""}
                            options={templateOptions}
                            onInputChange={(inputValue, actionMeta) => {
                              if (actionMeta?.action === "input-change") {
                                setTemplateSearch(inputValue || "");
                              }
                            }}
                            // Try adding this prop if it exists
                            formatOptionLabel={(option) => {
                              // If option.label is already JSX, return it
                              if (option.label) {
                                return option.label;
                              }

                              // Otherwise create a styled version
                              const template = templatesData?.find(
                                (t) => t._id === option.value,
                              );
                              if (!template) return option.label;

                              return (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <span>{option.label}</span>
                                  <span
                                    className={
                                      "text-xs font-medium " +
                                      (template.type === "custom"
                                        ? "text-blue-600"
                                        : "text-green-600")
                                    }
                                  >
                                    {template.type === "custom"
                                      ? "Custom"
                                      : "Standard"}
                                  </span>
                                </div>
                              );
                            }}
                            onChange={(e) => {
                              const templateId = e.target.value;

                              const fromList = (templatesData || []).find(
                                (t) => t._id === templateId,
                              );

                              const resolvedTemplate =
                                fromList ||
                                (selectedTemplate &&
                                  selectedTemplate._id === templateId
                                  ? selectedTemplate
                                  : null);

                              setFormData({
                                ...formData,
                                template: resolvedTemplate || {},
                              });
                            }}
                            error={errors?.template}
                            label="Interview Template"
                            name="template"
                            required={false}
                            loading={isTemplatesFetching}
                            onMenuScrollToBottom={
                              handleTemplateMenuScrollToBottom
                            }
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

                        {/* External ID Field - Only show for organization users */
                          /* {isOrganization && ( */
                        }
                        {true && (
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
                                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <InputField
                              value={formData.externalId}
                              onChange={handleChange}
                              inputRef={fieldRefs.externalId}
                              error={errors.externalId}
                              label=""
                              name="externalId"
                              placeholder="External System Reference Id"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 4: JOB DETAILS */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Job Details
                      </h3>
                      <div className="space-y-4">
                        {/* Row 6: Job Description */}
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

                        {/* Row 7: Requirements */}
                        <DescriptionField
                          value={formData.requirements}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, requirements: value });
                            if (errors.requirements) {
                              setErrors((prev) => ({
                                ...prev,
                                requirements: "",
                              }));
                            }
                          }}
                          name="requirements"
                          inputRef={fieldRefs.requirements}
                          error={errors.requirements}
                          label="Requirements (One Per Line)"
                          required
placeholder="4+ years of professional experience as a Full Stack Developer&#10;Strong proficiency in modern JavaScript (ES6+) and TypeScript&#10;Expertise in React.js (or Next.js) with hooks, context, and state management (Redux / Zustand / TanStack Query)&#10;Solid experience building responsive UIs with HTML5, CSS3, Tailwind CSS / Material UI / Chakra UI&#10;Proven backend experience with Node.js + Express.js (or NestJS)"
                          rows={6}
                          maxLength={2000}
                        />

                        {/* Row 8: Skills Details */}
                        <div>
                          <SkillsField
                            ref={fieldRefs.skills}
                            entries={entries}
                            errors={errors}
                            showValidation={showSkillValidation}
                            showRequirementLevel={true}
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
                                  {
                                    skill: "",
                                    experience: "",
                                    expertise: "",
                                    requirement_level: "REQUIRED",
                                  },
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
                            onAddMultipleSkills={(
                              newSkillEntries,
                              skillsToRemove = [],
                            ) => {
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
                                      (entry) =>
                                        !skillsToRemove.includes(entry.skill),
                                    );
                                  } else {
                                    // If we'd have less than 3, just clear the skill but keep rows
                                    updatedEntries = updatedEntries.map((entry) => {
                                      if (skillsToRemove.includes(entry.skill)) {
                                        return {
                                          skill: "",
                                          experience: "",
                                          expertise: "",
                                          requirement_level: "REQUIRED",
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
                                      requirement_level: "REQUIRED",
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
                                      requirement_level:
                                        newSkillEntries[skillIndex]
                                          .requirement_level || "REQUIRED",
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
                                let updated = prev.filter(
                                  (s) => !skillsToRemove.includes(s),
                                );
                                return [
                                  ...updated,
                                  ...newSkillEntries.map((e) => e.skill),
                                ];
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
                                allSelectedSkills.filter(
                                  (skill) => skill !== entry.skill,
                                ),
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

                        {/* Row 9: Additional Notes */}
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

                      </div>
                    </div>

                  </form>
                  {/* v1.0.4 <---------------------------------------------------- */}
                  <div className="flex justify-end items-center px-0 py-4 gap-2">
                    {/* v1.0.4 ----------------------------------------------------> */}
                    <Button
                      variant="outline"
                      className="text-custom-blue border border-custom-blue"
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
                    </Button>
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
      {isCompanyModalOpen && (
        <CompanyForm
          mode="Create"
          onClose={() => {
            setIsCompanyModalOpen(false);
            setIsCustomCompany(false); // Reset the "Other" state on close
          }}
          onSuccess={async () => {
            const updatedList = await fetchCompaniesData();
            if (updatedList && updatedList.length > 0) {
              // Find the newest company (assuming it's the first or filter by name)
              const newCompany = updatedList[0];
              setFormData((prev) => ({
                ...prev,
                companyName: newCompany._id,
              }));
            }
            setIsCompanyModalOpen(false);
            setIsCustomCompany(false);
          }}
        />
      )}
    </div>
  );
};

export default PositionForm;
