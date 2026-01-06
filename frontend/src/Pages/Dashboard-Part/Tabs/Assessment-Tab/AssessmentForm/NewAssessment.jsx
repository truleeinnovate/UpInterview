// v1.0.0  -  Ashraf  -  assessment template id not getting issues,on save or save next 2 button loading issues.only load wich button u have clicked
// v1.0.1  -  Ashraf  -  assessment file name changed
// v1.0.2  -  Ashraf  -  assessment sections and question api using from useassessmentscommon code)
// v1.0.3  -  Ashok   -  Added scroll to first error functionality
// v1.0.4  -  Ashok   - Improved responsiveness
// v1.0.5  -  Ashok   - Fixed responsive issues
// v1.0.6  -  Ashok   - Fixed dropdown onchange handler

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import {
  getAssessmentQuestions,
  upsertAssessmentQuestions,
} from "../../../../../api";
import { config } from "../../../../../config";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-input-2/lib/style.css";
// import AddPositionForm from "../Position-Tab/Position-Form.jsx";
import { validateAssessmentData } from "../../../../../utils/assessmentValidation.js";
import Cookies from "js-cookie";
import { format } from "date-fns";
import ConfirmationPopup from "../ConfirmationPopup.jsx";
import axios from "axios";
import BasicDetailsTab from "./BasicDetailsTab.jsx";
import AssessmentTestDetailsTab from "./AssessmentTestDetailsTab.jsx";
import AssessmentQuestionsTab from "./AssessmentQuestionsTab.jsx";
// <---------------------- v1.0.1
import AssessmentsTab from "../AssessmentViewDetails/AssessmentViewAssessmentTab.jsx";
// <---------------------- v1.0.1 >
import PassScore from "./PassScore.jsx";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode.js";
import { useAssessments } from "../../../../../apiHooks/useAssessments.js";
import {
  usePositions,
  usePositionById,
} from "../../../../../apiHooks/usePositions";
import LoadingButton from "../../../../../Components/LoadingButton";
import { Button } from "@mui/material";
import { Trash2, X } from "lucide-react";
import { scrollToFirstError } from "../../../../../utils/ScrollToFirstError/scrollToFirstError.js";
import AssessmentListModal from "../AssessmentListModal/AssessmentListModal.jsx";

const NewAssessment = () => {
  const formRef = useRef(null);
  const {
    useAssessmentById,
    // assessmentData,
    addOrUpdateAssessment,
    upsertAssessmentQuestions,
    isMutationLoading,
    fetchAssessmentQuestions,
    useAssessmentList,
    createAssessmentTemplateList,
  } = useAssessments();

  const { id } = useParams();
  const {
    assessmentById,
    isLoading: isAssessmentLoading,
    isError: isAssessmentError,
    error: assessmentError,
    refetch: refetchAssessment,
  } = useAssessmentById(id, {
    // Pass additional filters if needed
    includeTemplates: true,
  });

  const DROPDOWN_LIMIT = 50;
  const [positionLimit, setPositionLimit] = useState(DROPDOWN_LIMIT);
  const [positionSearch, setPositionSearch] = useState("");
  const [debouncedPositionSearch, setDebouncedPositionSearch] = useState("");

  const {
    positionData,
    total: totalPositions,
    isQueryLoading: positionsLoading,
  } = usePositions({
    page: 1,
    limit: positionLimit,
    ...(debouncedPositionSearch && { searchQuery: debouncedPositionSearch }),
  });

  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const userId = tokenPayload?.userId;
  const organizationId = tokenPayload?.tenantId;

  const [showLinkExpiryDay, setShowLinkExpiryDays] = useState(false);
  const [linkExpiryDays, setLinkExpiryDays] = useState(3);
  // console.log("assessmentById", assessmentById);
  // console.log("assessmentById", assessmentById);

  const [activeTab, setActiveTab] = useState("Basicdetails");
  // const [startDate, setStartDate] = useState(new Date());
  // Replace the current startDate initialization with:
  const [startDate, setStartDate] = useState(() => {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    return sixMonthsFromNow;
  });
  const [showMessage, setShowMessage] = useState(false);
  const [errors, setErrors] = useState("");
  const [showDropdownAssessment, setShowDropdownAssessment] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("60 Minutes");
  const [showDropdownDuration, setShowDropdownDuration] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showDropdownDifficulty, setShowDropdownDifficulty] = useState(false);
  const [sidebarOpenForSection, setSidebarOpenForSection] = useState(false);
  const [sidebarOpenAddQuestion, setSidebarOpenAddQuestion] = useState(false);
  const sidebarRefAddQuestion = useRef(null);
  const [toggleStates, setToggleStates] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  // console.log('selectedPosition----',selectedPosition);

  const [value, setValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPositionSearch(positionSearch.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [positionSearch]);

  useEffect(() => {
    setPositionLimit(DROPDOWN_LIMIT);
  }, [debouncedPositionSearch]);

  const [matchingSection, setMatchingSection] = useState([]);
  const defaultInstructions = `
  • Ensure your camera and microphone are functional and remain 'ON' throughout the assessment.
  • Maintain a stable and uninterrupted internet connection.
  • All questions are compulsory.
  • Click 'Submit' to complete the test.
  • If time runs out, the test will auto-submit your answers.
  • Avoid any malpractice, as it will result in disqualification.
  • Make sure to read each question carefully before answering.
  • You can review your answers before submitting.
  • Ensure you are in a quiet environment to avoid distractions.`;
  const [checkedState, setCheckedState] = useState({});
  const [checkedCount, setCheckedCount] = useState(0);
  const [questionsBySection, setQuestionsBySection] = useState({});
  const [instructions, setInstructions] = useState(defaultInstructions);
  const sidebarRefForSection = useRef(null);
  const [isAlreadyExistingSection, setIsAlreadyExistingSection] = useState("");
  const [includePhone, setIncludePhone] = useState(false);
  const [includePosition, setIncludePosition] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [questionsLimit, setQuestionsLimit] = useState(null);
  const [addedSections, setAddedSections] = useState([]);
  const [passScores, setPassScores] = useState({});
  const [totalScores, setTotalScores] = useState({});
  const [passScore, setPassScore] = useState("");
  const [totalScore, setTotalScore] = useState("");
  const [overallPassScore, setOverallPassScore] = useState(0);
  const [isPassScoreSubmitted, setIsPassScoreSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    AssessmentTitle: "",
    Position: null,
    Duration: "60 Minutes",
    DifficultyLevel: "",
    NumberOfQuestions: "",
    ExpiryDate: new Date(),
    status: "Active",
    passScoreType: "",
    passScoreBy: "",
    passScore: "",
    linkExpiryDays: 3,
    categoryOrTechnology: "",
    externalId: "",
  });

  const isEditing = !!id;
  const assessment = isEditing
    ? assessmentById
    : // assessmentData.find((assessment) => assessment._id === id)
    null;

  const selectedPositionId =
    (formData.Position && formData.Position) ||
    (isEditing && assessment?.Position) ||
    "";

  const { position: positionById } = usePositionById(
    selectedPositionId || null
  );

  useEffect(() => {
    if (positionById && positionById._id) {
      setSelectedPosition(positionById);
    } else if (!selectedPositionId) {
      setSelectedPosition("");
    }
  }, [positionById, selectedPositionId]);

  const filteredPositionData =
    positionData?.filter((position) => position.status === "opened") || [];

  const positionsForDropdown =
    selectedPosition &&
      selectedPosition._id &&
      !filteredPositionData.some((p) => p._id === selectedPosition._id)
      ? [selectedPosition, ...filteredPositionData]
      : filteredPositionData;

  const tenantId = tokenPayload?.tenantId;
  const ownerId = tokenPayload?.userId;

  const filters = { tenantId, ownerId };

  const hasViewPermission = true; // replace with your actual permission logic
  const { assessmentListData } = useAssessmentList(filters, hasViewPermission);

  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // 1) fetch categories on mount (and after create)
  const fetchCategories = async () => {
    try {
      const response = assessmentListData;

      setCategories(response || []);
    } catch (err) {
      console.error("fetchCategories error", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentListData]);

  // 2) when editing, ensure selectedCategory reflects formData value
  useEffect(() => {
    if (formData?.categoryOrTechnology) {
      setSelected(formData.categoryOrTechnology);
    }
  }, [formData?.categoryOrTechnology]);

  // 3) handler for user selecting category from dropdown
  const handleCategorySelect = (categoryId) => {
    setSelected(categoryId || "");
    setFormData((prev) => ({
      ...prev,
      categoryOrTechnology: categoryId || "",
    }));
  };

  // v1.0.3 <---------------------------------------------------------
  const fieldRefs = {
    AssessmentTitle: useRef(null),
    NumberOfQuestions: useRef(null),
    DifficultyLevel: useRef(null),
    externalId: useRef(null),
  };
  // v1.0.3 --------------------------------------------------------->

  // Initialize checkedState based on addedSections
  useEffect(() => {
    const initialCheckedState = addedSections.reduce((acc, section) => {
      acc[section.SectionName] = section.Questions.reduce((qAcc, _, index) => {
        qAcc[index] = false;
        return qAcc;
      }, {});
      return acc;
    }, {});
    setCheckedState(initialCheckedState);
  }, [addedSections]);

  // Load basic assessment data
  useEffect(() => {
    if (isEditing && assessment) {
      // Find category object using assessmentTemplateList ID
      const matchedCategory = assessmentListData.find(
        (item) => item._id === assessment?.assessmentTemplateList?._id
      );

      setFormData({
        AssessmentTitle: assessment.AssessmentTitle || "",
        // Position: assessment.Position || "",
        Position: assessment.Position?._id || assessment.Position || "",
        categoryOrTechnology: matchedCategory?.categoryOrTechnology || "",
        DifficultyLevel: assessment.DifficultyLevel || "",
        Duration: assessment.Duration || "60 Minutes",
        NumberOfQuestions: assessment.NumberOfQuestions || "",
        ExpiryDate: assessment.ExpiryDate
          ? new Date(assessment.ExpiryDate)
          : new Date(),
        status: assessment.status || "Active",
        passScoreType: assessment.passScoreType || "Number",
        passScoreBy: assessment.passScoreBy || "Overall",
        passScore: assessment.passScore || "",
        linkExpiryDays: assessment.linkExpiryDays || "",
        externalId: assessment.externalId || "",
      });
      setQuestionsLimit(assessment.NumberOfQuestions || "");
      setSelectedDifficulty(assessment.DifficultyLevel);
      setInstructions(assessment.Instructions || "");
      setAdditionalNotes(assessment.AdditionalNotes || "");
      setLinkExpiryDays(assessment.linkExpiryDays);
      // Preselect categoryOrTechnology
      if (matchedCategory) {
        setSelected(matchedCategory._id); // store id instead of name
        setFormData((prev) => ({
          ...prev,
          categoryOrTechnology: matchedCategory._id, // also store id
        }));
      }

      // Set CandidateDetails fields if they exist
      if (assessment.CandidateDetails) {
        setIncludePhone(assessment.CandidateDetails.includePhone || false);
        setIncludePosition(
          assessment.CandidateDetails.includePosition || false
        );
      } else {
        setIncludePhone(false);
        setIncludePosition(false);
      }

      // Set scores based on passScoreBy
      if (assessment.passScoreBy === "Overall") {
        setTotalScore(assessment.totalScore || "");
        setPassScore(assessment.passScore || "");
        setOverallPassScore(assessment.passScore || 0);
        setPassScores({}); // Reset section-specific scores
        setTotalScores({});
      }

      setIsPassScoreSubmitted(true); // Enable "Edit Pass Score" button when editing
    }
  }, [isEditing, assessment, assessmentListData]);

  // Load assessment questions and section-specific scores
  useEffect(() => {
    if (isEditing && assessment && id) {
      // console.log("Fetching assessment questions for ID:", id);
      // <---------------------- v1.0.2
      const loadAssessmentQuestions = async () => {
        try {
          const { data, error } = await fetchAssessmentQuestions(id);

          if (error) {
            console.error("Error fetching assessment questions:", error);
            return;
          }

          if (data && data.sections) {
            const responseData = data;
            // console.log("Received assessment questions data:", responseData);

            // Transform the API data to match the addedSections structure
            const formattedSections = responseData.sections.map((section) => ({
              SectionName: section.sectionName,
              passScore: section.passScore || 0, // Ensure passScore is set
              totalScore: section.totalScore || 0, // Ensure totalScore is set
              Questions: section.questions.map((question) => ({
                id: question.questionId,
                source: question.source,
                snapshot: question.snapshot,
                order: question.order,
                customizations: question.customizations,
              })),
            }));

            setAddedSections(formattedSections);

            // If passScoreBy is "Each Section", populate totalScores and passScores
            if (assessment.passScoreBy === "Each Section") {
              const sectionTotalScores = formattedSections.reduce(
                (acc, section) => ({
                  ...acc,
                  [section.SectionName]: section.totalScore || "",
                }),
                {}
              );
              const sectionPassScores = formattedSections.reduce(
                (acc, section) => ({
                  ...acc,
                  [section.SectionName]: section.passScore || "",
                }),
                {}
              );

              setTotalScores(sectionTotalScores);
              setPassScores(sectionPassScores);
              setTotalScore(""); // Reset overall totalScore
              setPassScore(""); // Reset overall passScore
              setOverallPassScore(0);
            }
          }
        } catch (error) {
          console.error("Error fetching assessment questions:", error);
          console.error(
            "Error details:",
            error.response?.data || error.message
          );
        }
      };

      loadAssessmentQuestions();
    }
  }, [id, isEditing, assessment]);
  // <---------------------- v1.0.2 >
  // shashank - [10/01/2025]
  const [tabsSubmitStatus, setTabsSubmitStatus] = useState({
    // <---------------------- v1.0.0
    responseId: null,
    responseData: null,
    // <---------------------- v1.0.0
    Basicdetails: false,
    Details: false,
    Questions: false,
    Candidates: false,
  });
  // <---------------------- v1.0.0
  const [isSaving, setIsSaving] = useState(false);
  // Add activeButton state to track which button was clicked
  const [activeButton, setActiveButton] = useState(null); // 'save', 'next', or null

  const handleIconClick = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setShowMessage(!showMessage);
  };

  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [showDropdownPosition, setShowDropdownPosition] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "NumberOfQuestions") {
      const number = Number(value);

      if (number >= 1 && number <= 100) {
        setFormData({ ...formData, [name]: number });
        setErrors({ ...errors, [name]: "" });
        setQuestionsLimit(number);
      }
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: "" });
    }
  };

  // const handleAssessmentListChange = (e) => {
  //   const value = e?.value;

  //   if (value === "__other__") {
  //     // open modal when user selects + Create List
  //     setIsCategoryModalOpen(true);
  //     return;
  //   }

  //   // Update selected and form data normally
  //   setSelected(value);
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     categoryOrTechnology: value,
  //   }));

  //   // Clear related error
  //   setErrors((prevErrors) => ({
  //     ...prevErrors,
  //     categoryOrTechnology: "",
  //   }));
  // };

  const handleAssessmentListChange = (e) => {
    const value = e?.value;

    if (value === "__other__") {
      // open modal when user selects + Create List
      setIsCategoryModalOpen(true);
      return;
    }

    // Update selected and form data normally
    setSelected(value);
    setFormData((prevData) => ({
      ...prevData,
      categoryOrTechnology: value,
    }));

    // Clear related error
    setErrors((prevErrors) => ({
      ...prevErrors,
      categoryOrTechnology: "",
    }));
  };

  const [isQuestionLimitErrorPopupOpen, setIsQuestionLimitErrorPopupOpen] =
    useState(false);

  const validateAndPrepareData = async (currentTab) => {
    let newErrors = {};

    // First do frontend validation
    switch (currentTab) {
      case "Basicdetails":
        newErrors = validateAssessmentData(formData, "Basicdetails");
        break;
      case "Details":
        newErrors = validateAssessmentData({ instructions: instructions });
        break;
      case "Questions":
        const totalQuestions = addedSections.reduce(
          (acc, eachSection) => acc + eachSection.Questions.length,
          0
        );
        if (totalQuestions !== questionsLimit) {
          newErrors.questions = `Please add exactly ${questionsLimit} questions.`;
          setIsQuestionLimitErrorPopupOpen(true);
        } else {
          const isAnySectionPassScoreSet = Object.values(passScores).some(
            (score) => score > 0
          );
          if (!(overallPassScore > 0 || isAnySectionPassScoreSet)) {
            setSidebarOpen(true);
            return { errors: { passScore: "Pass score is required" } };
          }
        }
        break;
      default:
        break;
    }

    if (Object.keys(newErrors).length > 0) {
      return { errors: newErrors };
    }

    // Gather data up to the current tab
    const assessmentData = gatherDataUpToCurrentTab(currentTab);

    // Add common fields
    const currentDateTime = format(new Date(), "dd MMM, yyyy - hh:mm a");
    assessmentData.CreatedBy = `${userId} at ${currentDateTime}`;
    assessmentData.LastModifiedById = userId;
    assessmentData.ownerId = userId;
    assessmentData.CreatedDate = new Date();

    if (organizationId) {
      assessmentData.tenantId = organizationId;
    }

    // Validate with backend before proceeding (optional - for enhanced validation)
    try {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/assessments/validate/${currentTab}`,
        assessmentData
      );

      if (!response.data.success) {
        return { errors: response.data.errors || newErrors };
      }
    } catch (error) {
      // If backend validation fails, use the errors from backend
      if (error.response?.data?.errors) {
        return { errors: error.response.data.errors };
      }
      // Fallback to frontend validation errors
      console.warn(
        "Backend validation unavailable, using frontend validation only"
      );
    }

    return { assessmentData };
  };

  const handleValidationErrors = (errors) => {
    setErrors(errors);
    setTimeout(() => {
      const firstErrorField = document.querySelector(".text-red-500");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  // const handleSave = async (event, currentTab, actionType) => {
  //   event.preventDefault();
  //   console.log(`🔹 Save triggered for tab: ${currentTab}, action: ${actionType}`);

  //   const { errors, assessmentData } = validateAndPrepareData(currentTab);

  //   if (errors) {
  //     console.warn("❗ Validation failed:", errors);
  //     setErrors(errors);
  //     return;
  //   }

  //   console.log("✅ Validation passed. Prepared assessment data:", assessmentData);

  //   try {
  //     // let response;

  //     const response = await useAddOrUpdateAssessment({
  //       isEditing,
  //       id: isEditing ? id : tabsSubmitStatus.responseId,
  //       assessmentData,
  //       tabsSubmitStatus
  //     });

  //     setTabsSubmitStatus((prev) => ({
  //       ...prev,
  //       [currentTab]: true,
  //       responseId: isEditing ? id : response?._id || prev.responseId,
  //       responseData: response
  //     }));

  //     if (currentTab === "Questions") {
  //       const assessmentId = isEditing ? id : tabsSubmitStatus.responseId;

  //       if (!assessmentId) {
  //         console.error("❌ Missing assessmentId before saving questions.");
  //         return;
  //       }

  //       const assessmentQuestionsData = prepareAssessmentQuestionsData(
  //         addedSections,
  //         assessmentId
  //       );

  //       console.log("📦 Prepared questions data:", assessmentQuestionsData);

  //       if (!assessmentQuestionsData.sections?.length) {
  //         console.error("❌ Sections array is empty. Cannot proceed.");
  //         return;
  //       }

  //       const questionsResponse = await useUpsertAssessmentQuestions(
  //         assessmentQuestionsData
  //       );

  //       console.log("✅ Questions saved successfully:", questionsResponse.message);
  //     }

  //     // 🧠 Action after save
  //     if (actionType === "close") {
  //       console.log("🛑 Closing form after save");
  //       navigate("/assessments");
  //     } else if (actionType === "next") {
  //       const tabOrder = ["Basicdetails", "Details", "Questions", "Candidates"];
  //       const currentIndex = tabOrder.indexOf(currentTab);
  //       const nextTab = tabOrder[currentIndex + 1];

  //       if (nextTab) {
  //         console.log(`➡️ Navigating to next tab: ${nextTab}`);
  //         setActiveTab(nextTab);
  //       } else {
  //         console.log("🚫 No next tab found");
  //       }
  //     }

  //   } catch (error) {
  //     console.error("❌ Error saving data:", {
  //       message: error.message,
  //       response: error.response?.data,
  //       stack: error.stack,
  //     });
  //   }
  // };

  // <---------------------- v1.0.0
  const handleSave = async (event, currentTab, actionType) => {
    event.preventDefault();

    // Prevent multiple simultaneous saves
    if (isSaving) {
      return;
    }

    // Set which button was clicked
    setActiveButton(actionType === "close" ? "save" : "next");
    setIsSaving(true);

    // Await the async validation function
    const { errors, assessmentData } = await validateAndPrepareData(currentTab);

    if (errors) {
      console.warn("❗ Validation failed:", errors);
      handleValidationErrors(errors);
      setActiveButton(null); // Reset active button on validation failure
      // v1.0.3 <--------------------------------------------------------------------
      scrollToFirstError(errors, fieldRefs);
      // v1.0.3 -------------------------------------------------------------------->
      setIsSaving(false);
      return;
    }

    try {
      // Determine if we should be in editing mode
      const hasExistingAssessment =
        tabsSubmitStatus.responseId &&
        tabsSubmitStatus.responseId !== null &&
        tabsSubmitStatus.responseId !== "";
      const shouldEdit = isEditing || hasExistingAssessment;

      // Get the correct assessment ID
      const assessmentId = isEditing
        ? id
        : hasExistingAssessment
          ? tabsSubmitStatus.responseId
          : null;

      // Validate that we have a valid ID when editing from URL
      if (isEditing && !id) {
        console.error("❌ Editing mode but no valid ID found");
        setErrors({ general: "Invalid assessment ID for editing" });
        setActiveButton(null);
        setIsSaving(false);
        return;
      }

      // Validate that we have a valid ID when updating existing assessment
      if (shouldEdit && !assessmentId) {
        console.error("❌ Should edit but no valid assessment ID found");
        setErrors({ general: "Invalid assessment ID for updating" });
        setActiveButton(null);
        setIsSaving(false);
        return;
      }

      const mutationParams = {
        isEditing: shouldEdit,
        id: assessmentId || null, // Use null for new assessments to be explicit
        assessmentData,
        tabsSubmitStatus,
      };

      const response = await addOrUpdateAssessment(mutationParams);

      // Extract the correct ID from response
      const newAssessmentId = shouldEdit
        ? isEditing
          ? id
          : assessmentId
        : response?.data?._id;

      // Update tabs submit status with the correct ID
      setTabsSubmitStatus((prev) => {
        const updated = {
          ...prev,
          [currentTab]: true,
          responseId: newAssessmentId,
          responseData: response?.data || response,
        };
        return updated;
      });

      if (currentTab === "Questions") {
        // Use the updated assessment ID for questions
        const questionsAssessmentId = shouldEdit
          ? isEditing
            ? id
            : assessmentId
          : newAssessmentId;

        if (!questionsAssessmentId) {
          console.error("❌ Missing assessmentId before saving questions.");
          return;
        }

        const assessmentQuestionsData = prepareAssessmentQuestionsData(
          addedSections,
          questionsAssessmentId
        );

        if (!assessmentQuestionsData.sections?.length) {
          console.error("❌ Sections array is empty. Cannot proceed.");
          return;
        }

        const questionsResponse = await upsertAssessmentQuestions(
          assessmentQuestionsData
        );
      }

      // 🧠 Action after save
      if (actionType === "close") {
        navigate("/assessment-templates");
      } else if (actionType === "next") {
        const tabOrder = ["Basicdetails", "Details", "Questions", "Candidates"];
        const currentIndex = tabOrder.indexOf(currentTab);
        const nextTab = tabOrder[currentIndex + 1];

        if (nextTab) {
          setActiveTab(nextTab);
        } else {
        }
      }
    } catch (error) {
      console.error("❌ Error saving data:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
    } finally {
      setIsSaving(false);
      setActiveButton(null); // Reset active button regardless of success or failure
    }
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // <---------------------- v1.0.0
  const gatherDataUpToCurrentTab = (currentTab) => {
    let assessmentData = {};

    // Basic details
    if (
      currentTab === "Basicdetails" ||
      currentTab === "Details" ||
      currentTab === "Questions" ||
      currentTab === "Candidates"
    ) {
      assessmentData = {
        ...assessmentData,
        ...(formData.AssessmentTitle && {
          AssessmentTitle: formData.AssessmentTitle,
        }),
        // ...(formData.Position && { Position: formData.Position }),
        Position:
          typeof formData.Position === "object"
            ? formData.Position?._id || null
            : formData.Position || null,

        ...(formData.Duration && { Duration: formData.Duration }),
        ...(formData.DifficultyLevel && {
          DifficultyLevel: formData.DifficultyLevel,
        }),
        ...(formData.NumberOfQuestions && {
          NumberOfQuestions: formData.NumberOfQuestions,
        }),
        ...(formData.ExpiryDate && { ExpiryDate: formData.ExpiryDate }),
        ...(formData.linkExpiryDays && {
          linkExpiryDays: formData.linkExpiryDays,
        }),
        ...(formData.categoryOrTechnology && {
          categoryOrTechnology: formData.categoryOrTechnology,
        }),
        ...(formData.externalId && { externalId: formData.externalId }),
        ...{ status: formData.status },
        // Only include passScoreType and passScoreBy if they have values
        ...(formData.passScoreType &&
          formData.passScoreType.trim() !== "" && {
          passScoreType: formData.passScoreType,
        }),
        ...(formData.passScoreBy &&
          formData.passScoreBy.trim() !== "" && {
          passScoreBy: formData.passScoreBy,
        }),
        ...(formData.passScoreBy === "Overall" && { totalScore: totalScore }),
        ...(formData.passScoreBy === "Overall" &&
          formData.passScore && { passScore: formData.passScore }),
      };

      // Include pass score only if it's overall
      if (formData.passScoreBy === "Overall" && formData.passScore) {
        assessmentData.passScore = formData.passScore;
      }
    }

    // Other details (Instructions, CandidateDetails, etc.)
    if (
      currentTab === "Details" ||
      currentTab === "Questions" ||
      currentTab === "Candidates"
    ) {
      assessmentData = {
        ...assessmentData,
        ...(includePosition || includePhone
          ? {
            CandidateDetails: {
              ...(includePosition ? { includePosition } : {}),
              ...(includePhone ? { includePhone } : {}),
            },
          }
          : {}),
        ...(instructions ? { Instructions: instructions } : {}),
        ...(additionalNotes ? { AdditionalNotes: additionalNotes } : {}),
      };
    }
    return assessmentData;
  };

  const prepareAssessmentQuestionsData = (addedSections, assessmentId) => {
    return {
      assessmentId: assessmentId,
      sections: addedSections.map((section, sectionIndex) => ({
        sectionName: section.SectionName,
        passScore: section.passScore || 0,
        totalScore: section.totalScore || 0,
        questions: section.Questions.map((question, questionIndex) => ({
          questionId: question.questionId || question._id,
          source: question.source || "system",
          snapshot: {
            ...question.snapshot,
          },
          score: question.Score || 1, // Ensure at least 1 score
          order: question.order || questionIndex + 1,
          customizations: question.customizations || null,
        })),
      })),
    };
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: null, // 'section' or 'question' or 'bulk'
    data: null,
    sectionName: null,
  });

  const [editSectionData, setEditSectionData] = useState({
    isOpen: false,
    index: null,
    name: "",
  });

  // Handle question selection for bulk delete
  const handleQuestionSelection = (sectionName, questionIndex) => {
    setCheckedState((prev) => ({
      ...prev,
      [sectionName]: {
        ...(prev[sectionName] || {}),
        [questionIndex]: !(prev[sectionName]?.[questionIndex] || false),
      },
    }));
  };

  // Count selected questions for bulk delete
  const getSelectedQuestionsCount = () => {
    return Object.values(checkedState).reduce((count, section) => {
      return count + Object.values(section).filter(Boolean).length;
    }, 0);
  };

  // Open delete confirmation
  const openDeleteConfirmation = (type, data, sectionName = null) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      data,
      sectionName,
    });
  };

  // Confirm deletion
  const confirmDelete = () => {
    const { type, data, sectionName } = deleteConfirmation;

    if (type === "section") {
      // Delete entire section
      setAddedSections((prev) => prev.filter((_, index) => index !== data));
    } else if (type === "question") {
      // Delete single question
      setAddedSections((prev) =>
        prev.map((section) => {
          if (section.SectionName === sectionName) {
            return {
              ...section,
              Questions: section.Questions.filter((_, idx) => idx !== data),
            };
          }
          return section;
        })
      );
    } else if (type === "bulk") {
      // Bulk delete selected questions
      setAddedSections((prev) =>
        prev.map((section) => {
          if (checkedState[section.SectionName]) {
            return {
              ...section,
              Questions: section.Questions.filter(
                (_, idx) => !checkedState[section.SectionName][idx]
              ),
            };
          }
          return section;
        })
      );
      setCheckedState({}); // Reset checked state
    }

    setDeleteConfirmation({
      isOpen: false,
      type: null,
      data: null,
      sectionName: null,
    });
  };

  // Cancel deletion
  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      type: null,
      data: null,
      sectionName: null,
    });
  };

  // Open section edit modal
  const openEditSection = (index, currentName) => {
    setEditSectionData({
      isOpen: true,
      index,
      name: currentName,
    });
  };

  // Save edited section name
  const saveSectionName = () => {
    const { index, name } = editSectionData;
    if (index !== null && name.trim()) {
      setAddedSections((prev) =>
        prev.map((section, idx) =>
          idx === index ? { ...section, SectionName: name.trim() } : section
        )
      );
      setEditSectionData({ isOpen: false, index: null, name: "" });
    }
  };

  const toggleDropdownAssessment = () => {
    setShowDropdownAssessment(!showDropdownAssessment);
  };

  const durations = ["30 Minutes", "45 Minutes", "60 Minutes", "90 Minutes"];

  const toggleDropdownDuration = () => {
    setShowDropdownDuration(!showDropdownDuration);
  };

  const toggleLinkExpiryDropdown = () => {
    setShowLinkExpiryDays(!showLinkExpiryDay);
  };

  const handleDurationSelect = (duration) => {
    if (duration === "60 Minutes" || duration === "90 Minutes") {
      setShowUpgradePopup(true);
      setShowDropdownDuration(false);
    } else {
      setSelectedDuration(duration);
      setShowDropdownDuration(false);
      setFormData((prevData) => ({
        ...prevData,
        Duration: duration,
      }));
      setErrors((prevErrors) => ({
        ...prevErrors,
        Duration: "",
      }));
    }
  };

  const handleDateChange = (date) => {
    setStartDate(date);
    setFormData((prevData) => ({
      ...prevData,
      ExpiryDate: date,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      ExpiryDate: "",
    }));
  };

  const handleUpgrade = () => {
    setShowUpgradePopup(false);
  };

  const closePopup = () => {
    setShowUpgradePopup(false);
  };

  const difficultyLevels = ["Easy", "Medium", "Hard"];
  const handleDifficultySelect = (level) => {
    setSelectedDifficulty(level);
    setShowDropdownDifficulty(false);
    setFormData((prevData) => ({
      ...prevData,
      DifficultyLevel: level,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      DifficultyLevel: "",
    }));
  };

  const toggleSidebarForSection = () => {
    setSidebarOpenForSection(!sidebarOpenForSection);
  };

  const closeSidebarForSection = useCallback(() => {
    setSidebarOpenForSection(false);
  }, []);

  const handleOutsideClickForSection = useCallback(
    (event) => {
      if (
        sidebarRefForSection.current &&
        !sidebarRefForSection.current.contains(event.target)
      ) {
        closeSidebarForSection();
      }
    },
    [closeSidebarForSection]
  );

  useEffect(() => {
    if (sidebarOpenForSection) {
      document.addEventListener("mousedown", handleOutsideClickForSection);
    } else {
      document.removeEventListener("mousedown", handleOutsideClickForSection);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClickForSection);
    };
  }, [sidebarOpenForSection, handleOutsideClickForSection]);

  const closeSidebarAddQuestion = useCallback(() => {
    setSidebarOpenAddQuestion(false);
  }, []);

  const handleOutsideClickAddQuestion = useCallback(
    (event) => {
      if (
        sidebarRefAddQuestion.current &&
        !sidebarRefAddQuestion.current.contains(event.target)
      ) {
        closeSidebarAddQuestion();
      }
    },
    [closeSidebarAddQuestion]
  );

  useEffect(() => {
    if (sidebarOpenAddQuestion) {
      document.addEventListener("mousedown", handleOutsideClickAddQuestion);
    } else {
      document.removeEventListener("mousedown", handleOutsideClickAddQuestion);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClickAddQuestion);
    };
  }, [sidebarOpenAddQuestion, handleOutsideClickAddQuestion]);

  const toggleArrow1 = (index) => {
    setToggleStates((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const getDifficultyColorClass = (difficultyLevel) => {
    switch (difficultyLevel) {
      case "Easy":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "Hard":
        return "bg-red-500";
      default:
        return "";
    }
  };

  const handlePositionMenuScrollToBottom = () => {
    if (positionsLoading) return;
    if (!totalPositions || positionLimit >= totalPositions) return;

    setPositionLimit((prev) => prev + DROPDOWN_LIMIT);
  };

  const handlePositionSearchChange = (inputValue, actionMeta) => {
    if (actionMeta?.action === "input-change") {
      setPositionSearch(inputValue || "");
    }
  };

  const handlePositionSelect = (position) => {
    if (!position?._id) {
      console.error("Invalid position selected");
      return;
    }
    setSelectedPosition(position);
    setShowDropdownPosition(false);
    setFormData((prevData) => ({
      ...prevData,
      Position: position._id,
    }));
  };

  const handleAddNewPositionClick = () => {
    if (value.trim() !== "") {
      const newPosition = { _id: positionData.length + 1, title: value };
      // setPositions([newPosition, ...positions]);
      setSelectedPosition(value);
      setValue("");
    }
  };

  const handleSectionAdded = (data) => {
    const { SectionName, Questions } = data;

    if (SectionName) {
      setMatchingSection((prevSections) => [
        ...new Set([...prevSections, SectionName]),
      ]);

      setAddedSections((prevSections) => {
        const newSections = [
          ...prevSections,
          {
            ...data,
            passScore: 0, // Initialize pass score for new section
          },
        ];
        return newSections;
      });

      setQuestionsBySection((prevQuestions) => ({
        ...prevQuestions,
        [SectionName]: Questions || [],
      }));

      // Initialize pass score for this section if using section-wise pass scores
      if (formData.passScoreBy === "Each Section") {
        setPassScores((prev) => ({
          ...prev,
          [SectionName]: 0,
        }));
      }
    }
  };

  const handleBackButtonClick = () => {
    setActiveTab("Details");
  };

  const handleEditSection = (index, currentSectionName) => {
    setActionViewMoreSection(null);
  };

  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <input
      type="text"
      readOnly
      className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:border-black focus:outline-none sm:text-sm"
      value={value}
      onClick={onClick}
      ref={ref}
      placeholder="Select date"
    />
  ));

  // mansoor
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

  const handlePassScoreSave = (scores) => {
    setFormData((prev) => ({
      ...prev,
      passScoreType: scores.passScoreType,
      passScoreBy: scores.passScoreBy,
      passScore: scores.overallPassScore,
      totalScore: scores.overallTotalScore,
    }));

    if (scores.passScoreBy === "Overall") {
      setOverallPassScore(scores.overallPassScore);
      setTotalScore(scores.overallTotalScore);
      setPassScores({});
      setTotalScores({});
    } else {
      setPassScores(scores.sectionPassScores);
      setTotalScores(scores.sectionTotalScores);
      setTotalScore("");
      setOverallPassScore("");
      setAddedSections((prevSections) =>
        prevSections.map((section) => ({
          ...section,
          passScore: scores.sectionPassScores[section.SectionName] || 0,
          totalScore: scores.sectionTotalScores[section.SectionName] || 0,
        }))
      );
    }
    setIsPassScoreSubmitted(true);
  };

  // ashraf
  const calculateCheckedCount = () => {
    const count = addedSections.reduce((acc, section) => {
      return acc + section.Questions.length;
    }, 0);
    return count;
  };

  useEffect(() => {
    setCheckedCount(calculateCheckedCount());
  }, [addedSections]);

  const [isLimitReachedPopupOpen, setIsLimitReachedPopupOpen] = useState(false);

  const closeLimitReachedPopup = () => {
    setIsLimitReachedPopupOpen(false);
  };

  const [isSelectCandidatePopupOpen, setIsSelectCandidatePopupOpen] =
    useState(false);

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === "includePhone") setIncludePhone(checked);
    if (name === "includePosition") setIncludePosition(checked);
  };

  // Handle additional notes change
  const handleAdditionalNotesChange = (e) => {
    const value = e.target.value;
    if (value.length <= 300) {
      setAdditionalNotes(value);
    }
  };

  const [instructionError, setInstructionError] = useState("");

  const handleInstructionsChange = (e) => {
    const value = e.target.value;
    setInstructions(value);

    // Validate instructions for UI feedback
    const errors = validateAssessmentData({ instructions: value });
    setInstructionError(errors.instructions || "");
  };

  const handleBackToBasicDetails = () => {
    setActiveTab("Basicdetails");
  };

  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  // Function to handle delete button click
  // shashank-[11/01/2025]
  const handleDeleteClick = (type, item, secName) => {
    setDeleteType(type);
    setItemToDelete({ ...item, SectionName: secName });
    setActionViewMore(null);
    setActionViewMoreSection(null);
  };

  const [actionViewMore, setActionViewMore] = useState({});

  const toggleAction = (sectionName, questionIndex) => {
    setActionViewMore((prev) =>
      prev &&
        prev.sectionName === sectionName &&
        prev.questionIndex === questionIndex
        ? null
        : { sectionName, questionIndex }
    );
  };

  const [actionViewMoreSection, setActionViewMoreSection] = useState({});

  const toggleActionSection = (sectionIndex) => {
    setActionViewMoreSection((prev) =>
      prev && prev.sectionIndex === sectionIndex ? null : { sectionIndex }
    );
  };

  const [assessmentTitleLimit] = useState(100);

  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: "",
    }));
  };

  // changes made by shashank on [08/01/2025] addedSections onSectionAdded
  const [sectionName, setSectionName] = useState("");

  //   const handleAddSection = (closeAddSectionPopup) => {
  //     // const validateErrors = {};
  //     // if (!sectionName.trim()) {
  //     //   validateErrors.sectionName = "";
  //     //   setIsAlreadyExistingSection("section name is required*");
  //     //   return;
  //     // }
  //     if (addedSections.map((each) => each.SectionName).includes(sectionName)) {
  //       setIsAlreadyExistingSection(`section ${sectionName} already exists`);
  //       return;
  //     }

  //     // Generate section name (Section1, Section2, etc.)
  //   const sectionNumber = addedSections.length + 1;
  //   const newSectionName = `Section ${sectionNumber}`;

  //   // Check if section name already exists (in case of deletions)
  //   let finalSectionName = newSectionName;
  //   let counter = 1;

  //   while (addedSections.map(each => each.SectionName).includes(finalSectionName)) {
  //     finalSectionName = `Section${sectionNumber + counter}`;
  //     counter++;
  //   }
  // console.log(finalSectionName);
  //     handleSectionAdded({
  //       SectionName: finalSectionName,
  //       Questions: [],
  //     });
  //     setSectionName("");
  //     // closeAddSectionPopup();
  //      // Close the popup if it exists
  //   if (closeAddSectionPopup) {
  //     closeAddSectionPopup();
  //   }
  //   };

  // Add this useEffect to automatically create default section when not in editing mode

  useEffect(() => {
    if (!isEditing && addedSections.length === 0) {
      // Auto-create default section when not in editing mode and no sections exist
      handleAddSection(null, true); // Pass true to indicate it's auto-creation
    }
  }, [isEditing, addedSections.length]);

  const handleAddSection = (closeAddSectionPopup, isAutoCreate = false) => {
    // If it's auto-creation in non-edit mode, use default naming
    if (isAutoCreate) {
      const defaultSectionName = "Section 1";

      handleSectionAdded({
        SectionName: defaultSectionName,
        Questions: [],
      });
      setSectionName("");
      return;
    }

    // Existing logic for manual section creation
    if (addedSections.map((each) => each.SectionName).includes(sectionName)) {
      setIsAlreadyExistingSection(`section ${sectionName} already exists`);
      return;
    }

    // Generate section name (Section1, Section2, etc.) - ONLY for manual creation
    const sectionNumber = addedSections.length + 1;
    const newSectionName = `Section ${sectionNumber}`;

    // Check if section name already exists (in case of deletions)
    let finalSectionName = newSectionName;
    let counter = 1;

    while (
      addedSections.map((each) => each.SectionName).includes(finalSectionName)
    ) {
      finalSectionName = `Section ${sectionNumber + counter}`;
      counter++;
    }

    handleSectionAdded({
      SectionName: finalSectionName,
      Questions: [],
    });
    setSectionName("");

    // Close the popup if it exists
    if (closeAddSectionPopup) {
      closeAddSectionPopup();
    }
  };

  // const updateQuestionsInAddedSectionFromQuestionBank = (
  //   sectionName,
  //   question
  // ) => {
  //   console.log("Updating questions in section:", sectionName);

  //   setAddedSections((prevSections) => {
  //     return prevSections.map((section) => {
  //       if (section.SectionName === sectionName) {
  //         return {
  //           ...section,
  //           Questions: [...(section.Questions || []), question],
  //         };
  //       }
  //       return section;
  //     });
  //   });
  // };

  const updateQuestionsInAddedSectionFromQuestionBank = (
    sectionName,
    question,
    questionIdToRemove = null
  ) => {
    setAddedSections((prevSections) => {
      const updatedSections = prevSections.map((section) => {
        if (section.SectionName === sectionName) {
          let updatedQuestions = [...(section.Questions || [])];

          if (questionIdToRemove) {
            // Remove the question
            const initialLength = updatedQuestions.length;
            updatedQuestions = updatedQuestions.filter((q) => {
              if (!q) return false;

              // Try multiple ID properties
              const id = q.questionId || q._id || q.id;
              if (!id) {
                console.warn("Question without ID found:", q);
                return false;
              }

              return id !== questionIdToRemove;
            });
          } else if (question) {
            // Add the question (with duplicate check)
            const existingQuestionId = question.questionId || question._id;
            const isDuplicate = updatedQuestions.some((q) => {
              if (!q) return false;
              const qId = q.questionId || q._id;
              return qId === existingQuestionId;
            });

            if (!isDuplicate) {
              updatedQuestions.push(question);
            } else {
              console.warn(
                `⚠️ Duplicate question ${existingQuestionId} not added`
              );
            }
          }

          return {
            ...section,
            Questions: updatedQuestions,
          };
        }
        return section;
      });

      return updatedSections;
    });
  };

  const navigate = useNavigate();

  const NavigateToAssessmentList = () => {
    navigate("/assessment-templates");
  };

  const TabFooter = ({ currentTab }) => {
    const handleBack = () => {
      if (currentTab === "Details") setActiveTab("Basicdetails");
      else if (currentTab === "Questions") setActiveTab("Details");
      else if (currentTab === "Candidates") setActiveTab("Questions");
    };

    const getNextTab = () => {
      if (currentTab === "Basicdetails") return "Details";
      if (currentTab === "Details") return "Questions";
      if (currentTab === "Questions") return "Candidates";
      return null;
    };

    const selectedCount = getSelectedQuestionsCount();

    return (
      // v1.0.4 <----------------------------------------------------------------------------
      // v1.0.5 <---------------------------------------------------------------------------
      <div className="flex justify-end sm:px-0 px-6 pt-6">
        {/* v1.0.5 --------------------------------------------------------------------------> */}
        {currentTab !== "Basicdetails" && (
          <button
            onClick={handleBack}
            className="inline-flex justify-center mr-4 py-2 sm:px-2 px-4 border border-custom-blue shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>
        )}

        <div className="flex gap-3">
          {currentTab === "Candidates" ? (
            <button
              type="button"
              onClick={NavigateToAssessmentList}
              className="inline-flex justify-center py-2 px-4 border border-custom-blue shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          ) : currentTab === "Questions" ? (
            <>
              {/* Always show Delete Selected if questions are selected */}
              {selectedCount > 0 && (
                // v1.0.5 <---------------------------------------------------------------------------
                <button
                  className="flex items-center truncate sm:text-sm sm:px-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => openDeleteConfirmation("bulk", null, null)}
                >
                  <Trash2 className="h-4 w-4 inline md:hidden lg:hidden xl:hidden 2xl:hidden text-red-500 mr-1" />
                  <span className="sm:hidden inline">Delete Selected</span> (
                  {selectedCount})
                </button>
                // v1.0.5 --------------------------------------------------------------------------->
              )}

              {isPassScoreSubmitted ? (
                <>
                  <LoadingButton
                    onClick={(e) => handleSave(e, "Questions", "close")}
                    // <---------------------- v1.0.0

                    isLoading={isMutationLoading && activeButton === "save"}
                    // ---------------------- v1.0.0 >
                    loadingText={id ? "Updating..." : "Saving..."}
                  >
                    {isEditing ? "Update" : "Save"}
                  </LoadingButton>

                  <LoadingButton
                    onClick={(e) => handleSave(e, "Questions", "next")}
                    // <---------------------- v1.0.0

                    isLoading={isMutationLoading && activeButton === "next"}
                    // ---------------------- v1.0.0 >
                    loadingText={id ? "Updating..." : "Saving..."}
                  >
                    {isEditing ? (
                      <span>
                        <span className="sm:hidden inline mr-1">Update &</span>
                        Next
                      </span>
                    ) : (
                      "Save & Create Assessment"
                    )}
                  </LoadingButton>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const totalQuestions = addedSections.reduce(
                      (acc, eachSection) => acc + eachSection.Questions.length,
                      0
                    );
                    if (totalQuestions !== questionsLimit) {
                      setIsQuestionLimitErrorPopupOpen(true);
                      return;
                    }
                    setSidebarOpen(true);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-custom-blue hover:bg-custom-blue/90 transition-colors"
                >
                  Add Score
                </button>
              )}
            </>
          ) : (
            <>
              <LoadingButton
                onClick={(e) => handleSave(e, currentTab, "close")}
                // <---------------------- v1.0.0

                isLoading={isMutationLoading && activeButton === "save"}
                loadingText={id ? "Updating..." : "Saving..."}
              >
                {isEditing ? "Update" : "Save"}
              </LoadingButton>

              {getNextTab() && (
                <LoadingButton
                  onClick={(e) => handleSave(e, currentTab, "next")}
                  isLoading={isMutationLoading && activeButton === "next"}
                  // <---------------------- v1.0.0
                  loadingText={id ? "Updating..." : "Saving..."}
                >
                  {isEditing ? (
                    <span>
                      <span className="sm:hidden inline mr-1">Update &</span>
                      Next
                    </span>
                  ) : (
                    "Save & Next"
                  )}
                </LoadingButton>
              )}
            </>
          )}
        </div>
      </div>
      // v1.0.4 ---------------------------------------------------------------------------->
    );
  };

  return (
    <div ref={formRef}>
      <div className="bg-gray-50">
        {/* v1.0.4 <------------------------------------------------------------------ */}
        <main className="mx-auto py-4 sm:px-3 lg:px-8 md:px-8 xl:px-8 2xl:px-8 mr-14 ml-14 pb-20">
          <div className="sm:px-0">
            <div className="mt-4 bg-white shadow overflow-hidden rounded-lg pb-16">
              <div className="flex justify-between px-12 py-6 sm:px-4">
                <div>
                  <h3 className="sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-xl leading-6 font-medium text-gray-900">
                    {isEditing
                      ? "Edit Assessment Template"
                      : "Add New Assessment Template"}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {isEditing
                      ? "Update the Assessment Template details"
                      : "Fill in the details to add a new assessment template"}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="py-5 sm:px-6">
                  <div>
                    {/* basic details tab content */}
                    {activeTab === "Basicdetails" && (
                      <>
                        <BasicDetailsTab
                          toggleLinkExpiryDropdown={toggleLinkExpiryDropdown}
                          linkExpiryDays={linkExpiryDays}
                          setLinkExpiryDays={setLinkExpiryDays}
                          showLinkExpiryDay={showLinkExpiryDay}
                          setShowLinkExpiryDays={setShowLinkExpiryDays}
                          assessmentTitleLimit={assessmentTitleLimit}
                          formData={formData}
                          handleInputChange={handleInputChange}
                          toggleDropdownAssessment={toggleDropdownAssessment}
                          setFormData={setFormData}
                          setShowDropdownAssessment={setShowDropdownAssessment}
                          handleChange={handleChange}
                          handleIconClick={handleIconClick}
                          showMessage={showMessage}
                          setShowMessage={setShowMessage}
                          selectedPosition={selectedPosition}
                          showDropdownPosition={showDropdownPosition}
                          difficultyLevels={difficultyLevels}
                          handleDifficultySelect={handleDifficultySelect}
                          selectedDuration={selectedDuration}
                          toggleDropdownDuration={toggleDropdownDuration}
                          showDropdownDuration={showDropdownDuration}
                          durations={durations}
                          handleDurationSelect={handleDurationSelect}
                          showUpgradePopup={showUpgradePopup}
                          closePopup={closePopup}
                          handleUpgrade={handleUpgrade}
                          startDate={startDate}
                          handleDateChange={handleDateChange}
                          CustomInput={CustomInput}
                          handleSave={handleSave}
                          showDropdownDifficulty={showDropdownDifficulty}
                          setSelectedPosition={setSelectedPosition}
                          handlePositionSelect={handlePositionSelect}
                          handleAddNewPositionClick={handleAddNewPositionClick}
                          selectedDifficulty={selectedDifficulty}
                          setShowDropdownDifficulty={setShowDropdownDifficulty}
                          setShowDropdownPosition={setShowDropdownPosition}
                          setShowDropdownDuration={setShowDropdownDuration}
                          positions={positionsForDropdown}
                          positionsLoading={positionsLoading}
                          onPositionMenuScrollToBottom={
                            handlePositionMenuScrollToBottom
                          }
                          onPositionInputChange={handlePositionSearchChange}
                          errors={errors}
                          isEditing={isEditing}
                          setActiveTab={setActiveTab}
                          fieldRefs={fieldRefs}
                          isCategoryModalOpen={isCategoryModalOpen}
                          openCategoryModal={() => setIsCategoryModalOpen(true)}
                          closeCategoryModal={() =>
                            setIsCategoryModalOpen(false)
                          }
                          categories={categories}
                          setCategories={setCategories}
                          handleAssessmentListChange={
                            handleAssessmentListChange
                          }
                          selected={selected}
                          setSelected={setSelected}
                          onCategorySelect={handleCategorySelect}
                          useAssessmentList={useAssessmentList}
                          createAssessmentTemplateList={
                            createAssessmentTemplateList
                          }
                          tenantId={tenantId}
                          ownerId={ownerId}
                        />
                        <div className="flex justify-end">
                          <TabFooter currentTab="Basicdetails" />
                        </div>
                      </>
                    )}

                    {/* details tab content */}
                    {activeTab === "Details" && (
                      <>
                        <AssessmentTestDetailsTab
                          includePhone={includePhone}
                          includePosition={includePosition}
                          selectedPosition={selectedPosition}
                          instructions={instructions}
                          instructionError={instructionError}
                          additionalNotes={additionalNotes}
                          handleCheckboxChange={handleCheckboxChange}
                          handleInstructionsChange={handleInstructionsChange}
                          handleAdditionalNotesChange={
                            handleAdditionalNotesChange
                          }
                          handleBackToBasicDetails={handleBackToBasicDetails}
                          handleSave={handleSave}
                          isEditing={isEditing}
                        />
                        <TabFooter currentTab="Details" />
                      </>
                    )}

                    {/* question tab content */}
                    {activeTab === "Questions" && (
                      <>
                        <AssessmentQuestionsTab
                          assessmentId={tabsSubmitStatus.responseId}
                          isAlreadyExistingSection={isAlreadyExistingSection}
                          setIsAlreadyExistingSection={
                            setIsAlreadyExistingSection
                          }
                          actionViewMore={actionViewMore}
                          setActionViewMore={setActionViewMore}
                          toggleAction={toggleAction}
                          passScores={passScores}
                          totalScores={totalScores}
                          passScoreType={formData.passScoreBy}
                          toggleActionSection={toggleActionSection}
                          actionViewMoreSection={actionViewMoreSection}
                          toggleArrow1={toggleArrow1}
                          checkedCount={checkedCount}
                          questionsLimit={questionsLimit}
                          totalScore={totalScore}
                          overallPassScore={overallPassScore}
                          sectionName={sectionName}
                          setSectionName={setSectionName}
                          questionsBySection={questionsBySection}
                          addedSections={addedSections}
                          isAddQuestionModalOpen={isAddQuestionModalOpen}
                          setIsAddQuestionModalOpen={setIsAddQuestionModalOpen}
                          checkedState={checkedState}
                          toggleStates={toggleStates}
                          toggleSidebarForSection={toggleSidebarForSection}
                          handleAddSection={handleAddSection}
                          handleEditSection={handleEditSection}
                          handleDeleteClick={handleDeleteClick}
                          handleQuestionSelection={handleQuestionSelection}
                          handleBackButtonClick={handleBackButtonClick}
                          handleSave={handleSave}
                          updateQuestionsInAddedSectionFromQuestionBank={
                            updateQuestionsInAddedSectionFromQuestionBank
                          }
                          getDifficultyColorClass={getDifficultyColorClass}
                          getSelectedQuestionsCount={getSelectedQuestionsCount}
                          matchingSection={matchingSection}
                          openDeleteConfirmation={openDeleteConfirmation}
                          openEditSection={openEditSection}
                          isEditing={isEditing}
                          setSidebarOpen={setSidebarOpen}
                          isPassScoreSubmitted={isPassScoreSubmitted}
                          setIsQuestionLimitErrorPopupOpen={
                            setIsQuestionLimitErrorPopupOpen
                          }
                        />
                        <TabFooter currentTab="Questions" />
                      </>
                    )}

                    {activeTab === "Candidates" && (
                      <>
                        {/* v1.0.4 <------------------------------------------------------- */}
                        <div className="sm:px-0 px-6 overflow-x-auto">
                          <AssessmentsTab
                            assessment={
                              isEditing
                                ? assessment
                                : tabsSubmitStatus.responseData
                            }
                          />
                          <TabFooter currentTab="Candidates" />
                        </div>
                        {/* v1.0.4 -------------------------------------------------------> */}
                      </>
                    )}
                  </div>
                </div>

                {/* Confirmation Popups */}
                <ConfirmationPopup
                  isOpen={deleteConfirmation.isOpen}
                  title={
                    deleteConfirmation.type === "section"
                      ? "Delete Section?"
                      : deleteConfirmation.type === "bulk"
                        ? "Delete Selected Questions?"
                        : "Delete Question?"
                  }
                  message={
                    deleteConfirmation.type === "section"
                      ? "Are you sure you want to delete this section and all its questions?"
                      : deleteConfirmation.type === "bulk"
                        ? `Are you sure you want to delete ${getSelectedQuestionsCount()} selected questions?`
                        : "Are you sure you want to delete this question?"
                  }
                  onConfirm={confirmDelete}
                  onCancel={cancelDelete}
                />

                <ConfirmationPopup
                  isOpen={editSectionData.isOpen}
                  title="Edit Section Name"
                  message={
                    <input
                      type="text"
                      value={editSectionData.name}
                      onChange={(e) =>
                        setEditSectionData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  }
                  onConfirm={saveSectionName}
                  onCancel={() =>
                    setEditSectionData({ isOpen: false, index: null, name: "" })
                  }
                />

                {isLimitReachedPopupOpen && (
                  <ConfirmationPopup
                    isOpen={isLimitReachedPopupOpen}
                    title="Question limit reached."
                    message="Please go back to the previous step to increase the number of questions."
                    singleButton
                    onSingleButtonClick={closeLimitReachedPopup}
                  />
                )}

                {isSelectCandidatePopupOpen && (
                  <ConfirmationPopup
                    isOpen={isSelectCandidatePopupOpen}
                    title="Please select at least one candidate to share the assessment."
                    singleButton
                    onSingleButtonClick={() =>
                      setIsSelectCandidatePopupOpen(false)
                    }
                  />
                )}
                {sidebarOpen && (
                  // v1.0.4 <----------------------------------------------------------------------
                  <div>
                    <PassScore
                      formData={formData}
                      setFormData={setFormData}
                      addedSections={addedSections}
                      setAddedSections={setAddedSections}
                      onClose={() => setSidebarOpen(false)}
                      onSave={handlePassScoreSave}
                      onOutsideClick={handleOutsideClick}
                      ref={sidebarRef}
                      totalScore={totalScore}
                      setTotalScore={setTotalScore}
                      totalScores={totalScores}
                      setTotalScores={setTotalScores}
                      passScores={passScores}
                      passScore={passScore}
                      setPassScores={setPassScores}
                      setPassScore={setPassScore}
                    />
                  </div>
                  // v1.0.4 -------------------------------------------------------------------------->
                )}
                {isQuestionLimitErrorPopupOpen && (
                  <ConfirmationPopup
                    isOpen={isQuestionLimitErrorPopupOpen}
                    title={`Please add exactly ${questionsLimit} questions.`}
                    singleButton
                    onSingleButtonClick={() =>
                      setIsQuestionLimitErrorPopupOpen(false)
                    }
                    singleButtonText="Close"
                  />
                )}
                {isSelectCandidatePopupOpen && (
                  <ConfirmationPopup
                    isOpen={isSelectCandidatePopupOpen}
                    title="Please select at least one candidate to share the assessment."
                    singleButton
                    onSingleButtonClick={() =>
                      setIsSelectCandidatePopupOpen(false)
                    }
                    singleButtonText="OK"
                  />
                )}
                {/* Render modal at parent level */}
                {isCategoryModalOpen && (
                  <AssessmentListModal
                    show={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    createAssessmentTemplateList={createAssessmentTemplateList}
                    useAssessmentList={useAssessmentList}
                    tenantId={tenantId}
                    ownerId={ownerId}
                    setOptions={setCategories}
                    setSelected={setSelected}
                    selectionType="id"
                    setErrors={setErrors}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
        {/* v1.0.4 ------------------------------------------------------------------> */}
      </div>
    </div>
  );
};

export default NewAssessment;
