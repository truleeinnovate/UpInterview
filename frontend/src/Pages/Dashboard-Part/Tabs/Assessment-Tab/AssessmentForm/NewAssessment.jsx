
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useCallback,
} from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-input-2/lib/style.css";
// import AddPositionForm from "../Position-Tab/Position-Form.jsx";
import { validateAssessmentData } from "../../../../../utils/assessmentValidation.js";
import Cookies from "js-cookie";
import { format } from "date-fns";
import ConfirmationPopup from "../ConfirmationPopup.jsx";
// import { handleShareClick as shareAssessment } from '../../../../utils/EmailShare';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomContext } from "../../../../../Context/Contextfetch.js";


import BasicDetailsTab from "./BasicDetailsTab.jsx";
import AssessmentTestDetailsTab from "./AssessmentTestDetailsTab.jsx";
import AssessmentQuestionsTab from "./AssessmentQuestionsTab.jsx";
import AssessmentsTab from '../AssessmentViewDetails/Assessment-View-AssessmentTab.jsx';
import PassScore from "./PassScore.jsx";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode.js";

const NewAssessment = () => {
  const tokenPayload = decodeJwt(Cookies.get('authToken'));
  const userId = tokenPayload?.userId;
  const organizationId = tokenPayload?.tenantId;

  const [showLinkExpiryDay, setShowLinkExpiryDays] = useState(false)
  const [linkExpiryDays, setLinkExpiryDays] = useState(3)
  const { positions, assessmentData, assessmentTypes } = useCustomContext();


  const { id } = useParams();

  const isEditing = !!id;
  const assessment = isEditing ? assessmentData.find(assessment => assessment._id === id) : null;

  const [activeTab, setActiveTab] = useState("Basicdetails");

  const [startDate, setStartDate] = useState(new Date());
  const [showMessage, setShowMessage] = useState(false);
  const [errors, setErrors] = useState("");
  const [selectedAssessmentType, setSelectedAssessmentType] = useState([]);
  const [showDropdownAssessment, setShowDropdownAssessment] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("60 minutes");
  const [showDropdownDuration, setShowDropdownDuration] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showDropdownDifficulty, setShowDropdownDifficulty] = useState(false);
  // //shashank-[16/01/2025]
  // const [showLinkExpiryDay,setShowLinkExpiryDays]=useState(false)//we need to check why we are using this
  // const [linkExpiryDays,setLinkExpiryDays]=useState(3)
  // //
  const [sidebarOpenForSection, setSidebarOpenForSection] = useState(false);
  const [sidebarOpenAddQuestion, setSidebarOpenAddQuestion] = useState(false);
  const sidebarRefAddQuestion = useRef(null);
  const [selectedIcons, setSelectedIcons] = useState([]);
  const [selectedIcons2, setSelectedIcons2] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupOpen2, setIsPopupOpen2] = useState(false);
  // const [currentSectionName, setCurrentSectionName] = useState(null);
  const [toggleStates, setToggleStates] = useState([]);
  // const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState("");

  const [value, setValue] = useState("");

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
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedSectionName, setEditedSectionName] = useState("");
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [checkedState, setCheckedState] = useState({});
  const [checkedCount, setCheckedCount] = useState(0);
  const [questionsBySection, setQuestionsBySection] = useState({});
  const [instructions, setInstructions] = useState(defaultInstructions);

  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [sectionToDeleteFrom, setSectionToDeleteFrom] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const sidebarRefForSection = useRef(null);
  const popupRef = useRef(null);
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
  const [preSelectedCandidates, setPreSelectedCandidates] = useState([]);
  const [formData, setFormData] = useState({
    AssessmentTitle: "",
    // AssessmentType: "",
    Position: "",
    Duration: "60 minutes",
    DifficultyLevel: "",
    NumberOfQuestions: "",
    ExpiryDate: new Date(),
    status: "Active",
    passScoreType: "",
    passScoreBy: "",
    passScore: ''
  });




  // Load basic assessment data
  useEffect(() => {
    if (isEditing && assessment) {
      const matchedPosition = positions.find((pos) => pos._id === assessment.Position);
      console.log("matchedPosition", matchedPosition);
      setFormData({
        AssessmentTitle: assessment.AssessmentTitle || "",
        Position: assessment.Position || "",
        DifficultyLevel: assessment.DifficultyLevel || "",
        Duration: assessment.Duration || "60 minutes",
        NumberOfQuestions: assessment.NumberOfQuestions || "",
        ExpiryDate: assessment.ExpiryDate ? new Date(assessment.ExpiryDate) : new Date(),
        status: assessment.status || "Active",
        passScoreType: assessment.passScoreType || "Number",
        passScoreBy: assessment.passScoreBy || "Overall",
        passScore: assessment.passScore || "",
      });
      setQuestionsLimit(assessment.NumberOfQuestions || "");
      setSelectedDifficulty(assessment.DifficultyLevel);
      setInstructions(assessment.Instructions || "");
      setAdditionalNotes(assessment.AdditionalNotes || "");
      setSelectedPosition(matchedPosition || null);

      // Set CandidateDetails fields if they exist
      if (assessment.CandidateDetails) {
        setIncludePhone(assessment.CandidateDetails.includePhone || false);
        setIncludePosition(assessment.CandidateDetails.includePosition || false);
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
  }, [isEditing, assessment, positions]);

  // Load assessment questions and section-specific scores
  useEffect(() => {
    if (isEditing && assessment && id) {
      console.log("Fetching assessment questions for ID:", id);
      axios
        .get(`${process.env.REACT_APP_API_URL}/assessment-questions/list/${id}`)
        .then((response) => {
          console.log("API Response:", response.data);
          if (response.data.success) {
            const data = response.data.data;
            console.log("Received assessment questions data:", data);

            // Transform the API data to match the addedSections structure
            const formattedSections = data.sections.map((section) => ({
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
              const sectionTotalScores = formattedSections.reduce((acc, section) => ({
                ...acc,
                [section.SectionName]: section.totalScore || "",
              }), {});
              const sectionPassScores = formattedSections.reduce((acc, section) => ({
                ...acc,
                [section.SectionName]: section.passScore || "",
              }), {});

              setTotalScores(sectionTotalScores);
              setPassScores(sectionPassScores);
              setTotalScore(""); // Reset overall totalScore
              setPassScore(""); // Reset overall passScore
              setOverallPassScore(0);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching assessment questions:", error);
          console.error("Error details:", error.response?.data || error.message);
        });
    }
  }, [id, isEditing, assessment]);

  //shashank - [10/01/2025]
  const [tabsSubmitStatus, setTabsSubmitStatus] = useState({
    responseId: "",
    responseData: "",
    Basicdetails: false,
    Details: false,
    Questions: false,
    Candidates: false
  })

  const handleIconClick = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setShowMessage(!showMessage);
  };

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [currentSectionName, setCurrentSectionName] = useState("");





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


  const [isQuestionLimitErrorPopupOpen, setIsQuestionLimitErrorPopupOpen] =
    useState(false);

  const validateAndPrepareData = (currentTab) => {
    let newErrors = {};

    // Validate data based on the current tab
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

    return { assessmentData };
  };

  const handleSave = async (event, currentTab, actionType) => {
    event.preventDefault();
    console.log(`🔹 Save triggered for tab: ${currentTab}, action: ${actionType}`);

    const { errors, assessmentData } = validateAndPrepareData(currentTab);

    if (errors) {
      console.warn("❗ Validation failed:", errors);
      setErrors(errors);
      return;
    }

    console.log("✅ Validation passed. Prepared assessment data:", assessmentData);

    try {
      let response;

      if (isEditing) {
        console.log("✏️ Editing mode. Sending PATCH request...");
        response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/assessments/update/${id}`,
          assessmentData
        );
        console.log("✅ Assessment updated successfully:", response.data);

        setTabsSubmitStatus((prev) => ({
          ...prev,
          [currentTab]: true,
        }));
      } else {
        if (!tabsSubmitStatus["Basicdetails"]) {
          console.log("🆕 Creating new assessment. Sending POST request...");
          response = await axios.post(
            `${process.env.REACT_APP_API_URL}/assessments/new-assessment`,
            assessmentData
          );
          console.log("✅ New assessment created:", response.data);

          setTabsSubmitStatus((prev) => ({
            ...prev,
            [currentTab]: true,
            responseId: response.data._id,
            responseData: response.data,
          }));
        } else {
          console.log("♻️ Updating existing assessment (after Basicdetails). Sending PATCH...");
          response = await axios.patch(
            `${process.env.REACT_APP_API_URL}/assessments/update/${tabsSubmitStatus.responseId}`,
            assessmentData
          );
          console.log("✅ Assessment updated successfully:", response.data);

          setTabsSubmitStatus((prev) => ({
            ...prev,
            [currentTab]: true,
          }));
        }
      }

      if (currentTab === "Questions") {
        const assessmentId = isEditing ? id : tabsSubmitStatus.responseId;
        const assessmentQuestionsData = prepareAssessmentQuestionsData(
          addedSections,
          assessmentId
        );

        console.log("📦 Prepared questions data:", assessmentQuestionsData);
        console.log("📤 Sending questions to API...");
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/assessment-questions/upsert`,
          assessmentQuestionsData
        );
        console.log("✅ Questions saved successfully:", response.data.message);
      }

      // 🧠 Action after save
      if (actionType === "close") {
        console.log("🛑 Closing form after save");
        navigate("/assessments");
      } else if (actionType === "next") {
        const tabOrder = ["Basicdetails", "Details", "Questions", "Candidates"];
        const currentIndex = tabOrder.indexOf(currentTab);
        const nextTab = tabOrder[currentIndex + 1];

        if (nextTab) {
          console.log(`➡️ Navigating to next tab: ${nextTab}`);
          setActiveTab(nextTab);
        } else {
          console.log("🚫 No next tab found");
        }
      }

    } catch (error) {
      console.error("❌ Error saving data:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
    }
  };

  // const handleSaveAndNext = async (event, currentTab, nextTab) => {

  // const { errors } = validateAndPrepareData(currentTab);

  // if (errors) {
  //   setErrors(errors);
  //   return;
  // }
  // };

  const gatherDataUpToCurrentTab = (currentTab) => {
    let assessmentData = {};

    // Basic details
    if (currentTab === "Basicdetails" || currentTab === "Details" ||
      currentTab === "Questions" || currentTab === "Candidates") {
      assessmentData = {
        ...assessmentData,
        ...(formData.AssessmentTitle && { AssessmentTitle: formData.AssessmentTitle }),
        ...(formData.Position && { Position: formData.Position }),
        ...(formData.Duration && { Duration: formData.Duration }),
        ...(formData.DifficultyLevel && { DifficultyLevel: formData.DifficultyLevel }),
        ...(formData.NumberOfQuestions && { NumberOfQuestions: formData.NumberOfQuestions }),
        ...(formData.ExpiryDate && { ExpiryDate: formData.ExpiryDate }),
        ...({ status: formData.status }),
        passScoreType: formData.passScoreType, // Always include
        passScoreBy: formData.passScoreBy, // Always include
        ...(formData.passScoreBy === "Overall" && { totalScore: totalScore }),
        ...(formData.passScoreBy === "Overall" && formData.passScore && { passScore: formData.passScore })
      };

      // Include pass score only if it's overall
      if (formData.passScoreBy === "Overall" && formData.passScore) {
        assessmentData.passScore = formData.passScore;
      }
    }

    // Other details (Instructions, CandidateDetails, etc.)
    if (currentTab === "Details" || currentTab === "Questions" || currentTab === "Candidates") {
      assessmentData = {
        ...assessmentData,
        ...(includePosition || includePhone ? {
          CandidateDetails: {
            ...(includePosition ? { includePosition } : {}),
            ...(includePhone ? { includePhone } : {}),
          },
        } : {}),
        ...(instructions ? { Instructions: instructions } : {}),
        ...(additionalNotes ? { AdditionalNotes: additionalNotes } : {}),
      };
    }

    // Questions and Candidates data remains the same
    if (currentTab === "Candidates") {
      assessmentData = {
        ...assessmentData,
        ...(selectedCandidates.length > 0 && { candidateIds: selectedCandidates }),
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
          source: question.source || 'system',
          snapshot: {
            ...question.snapshot,
          },
          score: question.Score || 1, // Ensure at least 1 score
          order: question.order || questionIndex + 1,
          customizations: question.customizations || null
        }))
      }))
    };
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: null, // 'section' or 'question' or 'bulk'
    data: null,
    sectionName: null
  });

  const [editSectionData, setEditSectionData] = useState({
    isOpen: false,
    index: null,
    name: ""
  });

  // Handle question selection for bulk delete
  const handleQuestionSelection = (sectionName, questionIndex) => {
    setCheckedState(prev => ({
      ...prev,
      [sectionName]: {
        ...prev[sectionName],
        [questionIndex]: !prev[sectionName]?.[questionIndex]
      }
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
      sectionName
    });
  };

  // Confirm deletion
  const confirmDelete = () => {
    const { type, data, sectionName } = deleteConfirmation;

    if (type === 'section') {
      // Delete entire section
      setAddedSections(prev => prev.filter((_, index) => index !== data));
    }
    else if (type === 'question') {
      // Delete single question
      setAddedSections(prev => prev.map(section => {
        if (section.SectionName === sectionName) {
          return {
            ...section,
            Questions: section.Questions.filter((_, idx) => idx !== data)
          };
        }
        return section;
      }));
    }
    else if (type === 'bulk') {
      // Bulk delete selected questions
      setAddedSections(prev => prev.map(section => {
        if (checkedState[section.SectionName]) {
          return {
            ...section,
            Questions: section.Questions.filter(
              (_, idx) => !checkedState[section.SectionName][idx]
            )
          };
        }
        return section;
      }));
      // Reset checked state
      setCheckedState(prev => ({
        ...prev,
        [sectionName]: {}
      }));
    }

    setDeleteConfirmation({ isOpen: false, type: null, data: null, sectionName: null });
  };

  // Cancel deletion
  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, type: null, data: null, sectionName: null });
  };

  // Open section edit modal
  const openEditSection = (index, currentName) => {
    setEditSectionData({
      isOpen: true,
      index,
      name: currentName
    });
  };

  // Save edited section name
  const saveSectionName = () => {
    const { index, name } = editSectionData;
    if (index !== null && name.trim()) {
      setAddedSections(prev => prev.map((section, idx) =>
        idx === index ? { ...section, SectionName: name.trim() } : section
      ));
      setEditSectionData({ isOpen: false, index: null, name: "" });
    }
  };


  const toggleDropdownAssessment = () => {
    setShowDropdownAssessment(!showDropdownAssessment);
  };

  // const handleShareClick = async (assessmentId, isEditing) => {
  //   try {
  //     const result = await shareAssessmentAPI({
  //       assessmentId,
  //       selectedCandidates,
  //       linkExpiryDays: 3,
  //       onClose: () => console.log('Modal closed'),
  //       setErrors,
  //       setIsLoading,
  //       organizationId,
  //       userId,
  //       isEditing,
  //       existingCandidateIds: preSelectedCandidates.map((c) => c._id.toString()),
  //     });

  //     if (result.success) {
  //       toast.success(result.message || 'Assessment shared successfully');
  //     }
  //   } catch (error) {
  //     console.error('Error sharing assessment:', error);
  //     toast.error('Failed to share assessment');
  //   }
  // };

  const handleAssessmentTypeSelect = (type) => {
    setSelectedAssessmentType((prevSelected) => {
      if (prevSelected.includes(type)) {
        setShowDropdownAssessment(false);
        return prevSelected;
      } else {
        return [...prevSelected, type];
      }
    });

    setFormData((prevData) => ({
      ...prevData,
      AssessmentType: selectedAssessmentType.includes(type)
        ? selectedAssessmentType.filter((item) => item !== type)
        : [...selectedAssessmentType, type],
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      AssessmentType: "",
    }));
  };

  // const handleRemoveAssessmentType = (type) => {
  //   setSelectedAssessmentType((prevSelected) => {
  //     const updatedSelected = prevSelected.filter((item) => item !== type);
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       AssessmentType: updatedSelected,
  //     }));
  //     return updatedSelected;
  //   });
  // };

  const durations = ["30 minutes", "45 minutes", "60 minutes", "90 minutes"];

  const toggleDropdownDuration = () => {
    setShowDropdownDuration(!showDropdownDuration);
  };

  const toggleLinkExpiryDropdown = () => {
    setShowLinkExpiryDays(!showLinkExpiryDay)
  }

  const handleDurationSelect = (duration) => {
    if (duration === "60 minutes" || duration === "90 minutes") {
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

  const handleLinkExpiryChange = (date) => {
    setLinkExpiryDays(date)
  }

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
  const toggleDropdownDifficulty = () => {
    setShowDropdownDifficulty(!showDropdownDifficulty);
  };
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

  // useEffect(() => {
  //   const fetchSectionData = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${process.env.REACT_APP_API_URL}/sections`
  //       );
  //       setSelectedIcons(response.data);
  //       const IconData = response.data.filter(
  //         (data) => data.Position === position
  //       );
  //       setSelectedIcons2(IconData);
  //     } catch (error) {
  //       console.error("Error fetching Sectionsdata:", error);
  //     }
  //   };
  //   fetchSectionData();
  // }, [position]);






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


  const toggleDropdownPosition = (e) => {
    e.stopPropagation();
    setShowDropdownPosition(!showDropdownPosition);
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
    // setShowMainContent(false);
    // setShowNewPositionContent(true);

    if (value.trim() !== "") {
      const newPosition = { _id: positions.length + 1, title: value };
      // setPositions([newPosition, ...positions]);
      setSelectedPosition(value);
      setValue("");
    }
  };


  // const [selectedSkills, setSelectedSkills] = useState([]);







  // const handleSectionAdded = (data) => {
  //   const { SectionName, Questions } = data;

  //   // Check if SectionName is not empty before adding
  //   if (SectionName) {
  //     setMatchingSection((prevSections) => {
  //       const uniqueSections = [...new Set([...prevSections, SectionName])];
  //       return uniqueSections;
  //     });

  //     // Add the section name to the addedSections state
  //     // setAddedSections((prevSections) => [...prevSections, SectionName]);
  //     setAddedSections((prevSections) => [...prevSections, data]);
  //     console.log("added sections", addedSections);

  //     // Initialize questions for the new section
  //     setQuestionsBySection((prevQuestions) => {
  //       const updatedQuestions = { ...prevQuestions };
  //       if (!updatedQuestions[SectionName]) {
  //         updatedQuestions[SectionName] = Questions || [];
  //       }
  //       return updatedQuestions;
  //     });
  //   }
  // };

  const handleSectionAdded = (data) => {
    const { SectionName, Questions } = data;

    if (SectionName) {
      setMatchingSection(prevSections => [...new Set([...prevSections, SectionName])]);

      setAddedSections(prevSections => {
        const newSections = [...prevSections, {
          ...data,
          passScore: 0 // Initialize pass score for new section
        }];
        return newSections;
      });

      setQuestionsBySection(prevQuestions => ({
        ...prevQuestions,
        [SectionName]: Questions || []
      }));

      // Initialize pass score for this section if using section-wise pass scores
      if (formData.passScoreBy === "Each Section") {
        setPassScores(prev => ({
          ...prev,
          [SectionName]: 0
        }));
      }
    }
  };
  const handleBackButtonClick = () => {
    setActiveTab("Details");
  };

  const handleBackButtonClickCandidate = () => {
    setActiveTab("Questions");
  };

  const handleEditSection = (index, currentSectionName) => {
    setEditingIndex(index);
    setEditedSectionName(currentSectionName);
    setIsEditSectionModalOpen(true);
    setActionViewMoreSection(null);
  };

  // const handleSaveSectionName = () => {
  //   if (editingIndex !== null && editedSectionName.trim() !== "") {
  //     const updatedSectionName = editedSectionName.trim();
  //     // alert(editedSectionName)
  //     setQuestionsBySection((prevQuestions) => {
  //       const updatedQuestions = { ...prevQuestions };
  //       if (updatedQuestions[matchingSection[editingIndex]]) {
  //         updatedQuestions[updatedSectionName] =
  //           updatedQuestions[matchingSection[editingIndex]];
  //         delete updatedQuestions[matchingSection[editingIndex]];
  //       }
  //       return updatedQuestions;
  //     });

  //     setMatchingSection((prevSections) => {
  //       const updatedSections = [...prevSections];
  //       updatedSections[editingIndex] = updatedSectionName;
  //       return updatedSections;
  //     });

  //     setAddedSections((prev) =>
  //       prev.map((section, index) =>
  //         index === editingIndex
  //           ? { ...section, SectionName: updatedSectionName }
  //           : section
  //       )
  //     );

  //     setIsEditSectionModalOpen(false);
  //     setEditingIndex(null);
  //   }
  // };





  const [isDeleteSectionConfirmationOpen, setIsDeleteSectionConfirmationOpen] =
    useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [sectionIndexToDelete, setSectionIndexToDelete] = useState(null);


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


  // Function to calculate total score
  // const calculateTotalScore = () => {
  //   let score = 0;
  //   addedSections.forEach(section => {
  //     section.Questions.forEach(question => {
  //       score += Number(question.score) || 0;
  //     });
  //   });
  //   setTotalScore(score);
  //   return score;
  // };
  // Effect to recalculate total score whenever questions change
  // useEffect(() => {
  //   calculateTotalScore();
  // }, [addedSections]);
  // const [totalScore, setTotalScore] = useState(0);
  // const [passScores, setPassScores] = useState({});
  // const [overallPassScore, setOverallPassScore] = useState(0);
  // const [isPassScoreSubmitted, setIsPassScoreSubmitted] = useState(false);

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
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  const [candidateEmails, setCandidateEmails] = useState([])

  const [isLoading, setIsLoading] = useState(false);

  const handleSelectCandidates = (candidates, emails) => {
    setSelectedCandidates(candidates);
    setCandidateEmails(emails)
  };

  // ashraf

  const calculateCheckedCount = () => {

    const count = addedSections.reduce((acc, section) => {
      return acc + section.Questions.length
    }, 0)

    return count
  };

  useEffect(() => {
    setCheckedCount(calculateCheckedCount());
    // }, [questionsBySection]);
  }, [addedSections]);

  const [isLimitReachedPopupOpen, setIsLimitReachedPopupOpen] = useState(false);


  const closeLimitReachedPopup = () => {
    setIsLimitReachedPopupOpen(false);
  };


  const [isSelectCandidatePopupOpen, setIsSelectCandidatePopupOpen] = useState(false);

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

  const handleExceedLimit = () => {
    setIsLimitReachedPopupOpen(true);
  };

  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  // Function to handle delete button click
  //shashank-[11/01/2025]
  // const handleDeleteClick = (type, item) => {
  const handleDeleteClick = (type, item, secName) => {
    console.log("item to delete", { ...item, secName })
    setDeleteType(type);
    setItemToDelete({ ...item, SectionName: secName });
    setIsDeleteConfirmationOpen(true);
    setActionViewMore(null);
    setActionViewMoreSection(null);
  };



  function deleteQuestion(sectionIndex, questionIndex) {
    setAddedSections((prevSections) => {
      const updatedSections = [...prevSections];

      // Remove the question from the target section
      updatedSections[sectionIndex].Questions.splice(questionIndex, 1);

      // Synchronize order across all sections
      return synchronizeOrder(updatedSections);
    });
  }


  const handleDeleteQuestion = (sectionName, questionIndex) => {
    setQuestionsBySection((prevQuestions) => {
      const updatedQuestions = { ...prevQuestions };
      if (Array.isArray(updatedQuestions[sectionName])) {
        updatedQuestions[sectionName] = updatedQuestions[sectionName].filter(
          (_, index) => index !== questionIndex
        );
      }
      return updatedQuestions;
    });
  };

  const [isBulkDeleteConfirmationOpen, setIsBulkDeleteConfirmationOpen] =
    useState(false);

  const handleBulkDeleteClick = () => {
    setIsBulkDeleteConfirmationOpen(true);
  };

  const confirmBulkDeleteQuestions = () => {
    setQuestionsBySection((prevState) => {
      const newQuestionsBySection = { ...prevState };

      Object.keys(checkedState).forEach((sectionName) => {
        newQuestionsBySection[sectionName] = newQuestionsBySection[
          sectionName
        ].filter(
          (_, questionIndex) => !checkedState[sectionName][questionIndex]
        );
      });

      return newQuestionsBySection;
    });

    setCheckedState({});
    setIsBulkDeleteConfirmationOpen(false);
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

  //changes made by shashank on [08/01/2025] addedSections onSectionAdded
  const [sectionName, setSectionName] = useState("");
  const handleAddSection = (closeAddSectionPopup) => {
    const validateErrors = {};
    if (!sectionName.trim()) {
      validateErrors.sectionName = "";

      setIsAlreadyExistingSection("section name is required*");
      return;
    }
    if (addedSections.map((each) => each.SectionName).includes(sectionName)) {
      setIsAlreadyExistingSection(`section ${sectionName} already exists`);

      return;
    }

    handleSectionAdded({
      SectionName: sectionName,
      Questions: [],
    });
    setSectionName("");
    closeAddSectionPopup();
  };



  function synchronizeOrder(addedSections) {
    let currentOrder = 1; // Start the order from 1
    return addedSections.map((section) => {
      section.Questions = section.Questions.map((question) => ({
        ...question,
        order: currentOrder++, // Assign and increment the order
      }));
      return section;
    });
  }


  function addQuestion(sectionIndex, newQuestion) {
    setAddedSections((prevSections) => {
      const updatedSections = [...prevSections];

      // Add the new question to the target section
      updatedSections[sectionIndex].Questions.push(newQuestion);

      // Synchronize order across all sections
      return synchronizeOrder(updatedSections);
    });
  }

  const updateQuestionsInAddedSectionFromQuestionBank = (sectionName, question) => {
    console.log("Updating questions in section:", sectionName);

    setAddedSections(prevSections => {
      return prevSections.map(section => {
        if (section.SectionName === sectionName) {
          return {
            ...section,
            Questions: [...(section.Questions || []), question]
          };
        }
        return section;
      });
    });
  };





  const navigate = useNavigate();

  const NavigateToAssessmentList = () => {
    navigate('/assessments');
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

    return (
      <div className="flex justify-between px-6 pt-6">
        {currentTab !== "Basicdetails" && (
          <button
            onClick={handleBack}
            className="inline-flex justify-center py-2 px-4 border border-custom-blue shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
            isPassScoreSubmitted ? (
              <>
                <button
                  type="button"
                  onClick={(e) => handleSave(e, "Questions")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSave(e, "Questions", "next")}
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-custom-blue hover:bg-custom-blue/90 transition-colors"
                >
                  {isEditing ? "Update & Next" : "Save & Create Assessment"}
                </button>
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
            )
          ) : (
            <>
              <button
                type="button"
                onClick={(e) => handleSave(e, currentTab, "close")}
                className="inline-flex justify-center py-2 px-4 border border-custom-blue shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {isEditing ? "Update" : "Save"}
              </button>

              {getNextTab() && (
                <button
                  type="button"
                  onClick={(e) => handleSave(e, currentTab, "next")}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/90"
                >
                  {isEditing ? "Update & Next" : "Save & Next"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };



  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-[90%] mx-auto py-6 sm:px-6 lg:px-8 md:px-8 xl:px-8 2xl:px-8">
          <div className="sm:px-0">
            {/* <Breadcrumb items={[
            { label: 'Interviews', path: '/interviewList' },
            ...(isEditing && interview
              ? [{ label: candidateData?.LastName || 'Interview', path: `/interviews/${id}`, status: interview.status },
              { label: 'Edit Interview', path: '' }]
              : [{ label: 'New Interview', path: '' }])
          ]} /> */}
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-12 py-4 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {isEditing ? 'Edit Assessment Template' : 'Add New Assessment Template'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {isEditing
                    ? 'Update the Assessment Template details'
                    : 'Fill in the details to add a new assessment template'}
                </p>
              </div>

              {isLoading && (
                // <div className="fixed inset-0 bg-gray-700 bg-opacity-70 flex items-center justify-center z-50">
                //   <div className="text-white text-2xl font-bold">Loading...</div>
                // </div>
                // <Loader />
                <></>
              )}

              {/* Content */}
              <div>
                <div className="border-t border-gray-200 py-5 sm:px-6">
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
                          // handleRemoveAssessmentType={handleRemoveAssessmentType}
                          setFormData={setFormData}
                          // showDropdownAssessment={showDropdownAssessment}
                          // assessmentTypes={assessmentTypes}
                          // handleAssessmentTypeSelect={handleAssessmentTypeSelect}
                          setShowDropdownAssessment={setShowDropdownAssessment}
                          handleChange={handleChange}
                          handleIconClick={handleIconClick}
                          showMessage={showMessage}
                          selectedPosition={selectedPosition}
                          // toggleDropdownPosition={toggleDropdownPosition}
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
                          // handleSaveAndNext={handleSaveAndNext}
                          // setSelectedAssessmentType={setSelectedAssessmentType}
                          // selectedAssessmentType={selectedAssessmentType}
                          showDropdownDifficulty={showDropdownDifficulty}
                          setSelectedPosition={setSelectedPosition}
                          handlePositionSelect={handlePositionSelect}
                          handleAddNewPositionClick={handleAddNewPositionClick}
                          selectedDifficulty={selectedDifficulty}
                          // toggleDropdownDifficulty={toggleDropdownDifficulty}
                          setShowDropdownDifficulty={setShowDropdownDifficulty}
                          setShowDropdownPosition={setShowDropdownPosition}
                          setShowDropdownDuration={setShowDropdownDuration}
                          positions={positions}
                          errors={errors}
                          isEditing={isEditing}
                          setActiveTab={setActiveTab}
                        />
                        <p className="flex justify-end">
                          <TabFooter currentTab="Basicdetails" />
                        </p>
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
                          setIsAlreadyExistingSection={setIsAlreadyExistingSection}
                          actionViewMore={actionViewMore}
                          setActionViewMore={setActionViewMore}
                          toggleAction={toggleAction}
                          passScores={passScores}
                          totalScores={totalScores} // Pass totalScores
                          passScoreType={formData.passScoreBy} // Pass passScoreType
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
                          currentSectionName={currentSectionName}
                          selectedAssessmentType={selectedAssessmentType}
                          checkedState={checkedState}
                          toggleStates={toggleStates}
                          toggleSidebarForSection={toggleSidebarForSection}
                          handleAddSection={handleAddSection}
                          handleEditSection={handleEditSection}
                          handleDeleteClick={handleDeleteClick}
                          handleQuestionSelection={handleQuestionSelection}
                          handleBackButtonClick={handleBackButtonClick}
                          handleSave={handleSave}
                          handleBulkDeleteClick={handleBulkDeleteClick}
                          updateQuestionsInAddedSectionFromQuestionBank={updateQuestionsInAddedSectionFromQuestionBank}
                          getDifficultyColorClass={getDifficultyColorClass}
                          getSelectedQuestionsCount={getSelectedQuestionsCount}
                          matchingSection={matchingSection}
                          openDeleteConfirmation={openDeleteConfirmation}
                          openEditSection={openEditSection}
                          isEditing={isEditing}
                          setSidebarOpen={setSidebarOpen}
                          isPassScoreSubmitted={isPassScoreSubmitted}
                          setIsQuestionLimitErrorPopupOpen={setIsQuestionLimitErrorPopupOpen}
                        />
                        <TabFooter currentTab="Questions" />
                      </>
                    )}

                    {activeTab === "Candidates" && (
                      <>
                        <div className="px-6">
                          <AssessmentsTab assessment={isEditing ? assessment : tabsSubmitStatus.responseData} />
                          {/* <div className="flex justify-between pt-6">
                            <button
                              onClick={handleBackButtonClickCandidate}
                              className="inline-flex justify-center py-2 px-4 border border-custom-blue shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Back
                            </button>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={NavigateToAssessmentList}
                                className="inline-flex justify-center py-2 px-4 border border-custom-blue shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Close
                              </button>
                            </div>
                          </div> */}
                          <TabFooter currentTab="Candidates" />
                        </div>
                      </>
                    )}
                  </div>
                </div>


                {/* Confirmation Popups */}
                <ConfirmationPopup
                  isOpen={deleteConfirmation.isOpen}
                  title={
                    deleteConfirmation.type === 'section' ? "Delete Section?" :
                      deleteConfirmation.type === 'bulk' ? "Delete Selected Questions?" :
                        "Delete Question?"
                  }
                  message={
                    deleteConfirmation.type === 'section' ?
                      "Are you sure you want to delete this section and all its questions?" :
                      deleteConfirmation.type === 'bulk' ?
                        `Are you sure you want to delete ${getSelectedQuestionsCount()} selected questions?` :
                        "Are you sure you want to delete this question?"
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
                      onChange={(e) => setEditSectionData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  }
                  onConfirm={saveSectionName}
                  onCancel={() => setEditSectionData({ isOpen: false, index: null, name: "" })}
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
                  <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"}>
                    <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
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
                  </div>
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
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default NewAssessment;
