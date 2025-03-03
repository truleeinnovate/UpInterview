
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useCallback,
} from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-input-2/lib/style.css";
import AddQuestion1 from "../Assessment-Tab/AddQuestion1.jsx";
import AddSection1 from "./AddSection1.jsx";
import Editassesmentquestion from "./EditAssessmentquestion.jsx";
// import AddPositionForm from "../Position-Tab/Position-Form.jsx";
import { fetchFilterData } from "../../../../utils/dataUtils.js";
import { validateAssessmentData } from "../../../../utils/assessmentValidation.js";
import Cookies from "js-cookie";
import Sidebar from "../Assessment-Tab/PassScore.jsx";
import { usePermissions } from "../../../../Context/PermissionsContext.js";
import { useMemo } from "react";
import { format } from "date-fns";
import ConfirmationPopup from "./ConfirmationPopup.jsx";
// import { handleShareClick as shareAssessment } from '../../../../utils/EmailShare';

 

import BasicDetailsTab from "./BasicDetailsTab.jsx";
import AssessmentTestDetailsTab from "./AssessmentTestDetailsTab.jsx";
import AssessmentQuestionsTab from "./AssessmentQuestionsTab.jsx";
import Candidate from '../Candidate-Tab/Candidate.jsx'
import toast from "react-hot-toast";

const NewAssessment = ({ fetchAssessmentData, onClose, onDataAdded, setLinkExpiryDays, linkExpiryDays, setShowLinkExpiryDays, showLinkExpiryDay }) => {
  const { sharingPermissionscontext } = usePermissions();
  const positionPermissions = useMemo(
    () => sharingPermissionscontext.position || {},
    [sharingPermissionscontext]
  );

  const organizationId = Cookies.get("organizationId");
  const [activeTab, setActiveTab] = useState("Basicdetails");
  // const [activeTab, setActiveTab] = useState("Details");
  // const [activeTab, setActiveTab] = useState("Questions");
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [showMessage, setShowMessage] = useState(false);
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
  const [errors, setErrors] = useState("");
  const [selectedAssessmentType, setSelectedAssessmentType] = useState([]);
  const [showDropdownAssessment, setShowDropdownAssessment] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("60 minutes");
  const [showDropdownDuration, setShowDropdownDuration] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showDropdownDifficulty, setShowDropdownDifficulty] = useState(false);
  // //shashank-[16/01/2025]
  // const [showLinkExpiryDay,setShowLinkExpiryDays]=useState(false)
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
  const [positions, setPositions] = useState("");
  const [value, setValue] = useState("");
  const [showNewPositionContent, setShowNewPositionContent] = useState(false);
  const [showMainContent, setShowMainContent] = useState(true);
  const [skillsForSelectedPosition, setSkillsForSelectedPosition] = useState(
    []
  );
  const [matchingSection, setMatchingSection] = useState([]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedSectionName, setEditedSectionName] = useState("");
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [checkedState, setCheckedState] = useState({});
  const [checkedCount, setCheckedCount] = useState(0);
  const [questionsBySection, setQuestionsBySection] = useState({});

  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [sectionToDeleteFrom, setSectionToDeleteFrom] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const sidebarRefForSection = useRef(null);
  const popupRef = useRef(null);
  const [isAlreadyExistingSection, setIsAlreadyExistingSection] = useState("");

  const [formData, setFormData] = useState({
    AssessmentTitle: "",
    AssessmentType: "",
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

  //shashank - [10/01/2025]
  const [tabsSubmitStatus, setTabsSubmitStatus] = useState({
    responseId: "",
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



  const resetActiveTab = () => {
    setActiveTab("Basicdetails");
  };

  const resetFormData = () => {
    setFormData({
      AssessmentTitle: "",
      AssessmentType: "",
      Skill_Technology: "",
      Position: "",
      Duration: "",
      DifficultyLevel: "",
      NumberOfQuestions: "",
      ExpiryDate: null,
    });
    setQuestionsBySection({});
    setSelectedAssessmentType("");
    setSelectedDuration("");
    setSelectedDifficulty("");
    setStartDate(null);
    setPosition("");
  };

  const handleClose = () => {
    resetActiveTab();
    resetFormData();
  };

  const [selectedPosition, setSelectedPosition] = useState("");
  const [showDropdownPosition, setShowDropdownPosition] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = "";

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: errorMessage });

    if (name === "NumberOfQuestions") {
      setQuestionsLimit(Number(value));
    }
  };

  const userName = Cookies.get("userName");
  const [isQuestionLimitErrorPopupOpen, setIsQuestionLimitErrorPopupOpen] =
    useState(false);

  const handleSaveAndNext = async (event, currentTab, nextTab) => {
    event.preventDefault();

    // Initialize an object to hold any validation errors
    let newErrors = {};

    // Perform validation based on the current tab
    switch (currentTab) {
      case "Basicdetails":
        newErrors = validateAssessmentData(formData);
        break;
      case "Details":
        if (instructionError) {
          newErrors.instructions = instructionError;
        }
        break;
      case "Questions":
        // const totalQuestions = Object.values(questionsBySection).reduce(
        //   (acc, questions) => acc + questions.length,
        //   0
        // );
        // const totalQuestions = addedSections.map(eachSection=> eachSection.Questions.length)
        const totalQuestions = addedSections.reduce((acc, eachSection) => acc + eachSection.Questions.length, 0)
        // alert(`${totalQuestions}`)
        if (totalQuestions !== questionsLimit) {
          newErrors.questions = `Please add exactly ${questionsLimit} questions.`;
          setIsQuestionLimitErrorPopupOpen(true); // Show popup
        } else {
          const isAnySectionPassScoreSet = Object.values(passScores).some(
            (score) => score > 0
          );
          if (!(overallPassScore > 0 || isAnySectionPassScoreSet)) {
            setSidebarOpen(true);
            return;
          }
        }
        break;
      case "Candidates":
        // Add validation logic for Candidates tab
        break;
      default:
        break;
    }
    // If there are any errors, set them and prevent tab switching
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    handleSave(event, currentTab)

    setActiveTab(nextTab);
  };



  const gatherDataUpToCurrentTab = (currentTab) => {
    let assessmentData = {};

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
        ...(formData.AssessmentType.length > 0 && {
          AssessmentType: formData.AssessmentType,
        }),
        ...(formData.Position && { Position: formData.Position }),
        ...(formData.Duration && { Duration: formData.Duration }),
        ...(formData.DifficultyLevel && {
          DifficultyLevel: formData.DifficultyLevel,
        }),
        ...(formData.NumberOfQuestions && {
          NumberOfQuestions: formData.NumberOfQuestions,
        }),
        ...(formData.ExpiryDate && { ExpiryDate: formData.ExpiryDate }),
        ...({ status: formData.status }),
        ...(formData.passScoreType && { passScoreType: formData.passScoreType }),
        ...(formData.passScoreBy && { passScoreBy: formData.passScoreBy }),
        ...(formData.passScoreBy === "overall" && { passScore: formData.passScore })
      };
    }

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
              // ...(includeSkills ? { includeSkills } : {}),
            },
          }
          : {}),
        ...(instructions ? { Instructions: instructions } : {}),
        ...(additionalNotes ? { AdditionalNotes: additionalNotes } : {}),
      };
    }

    if (currentTab === "Questions" || currentTab === "Candidates") {

      assessmentData = {
        ...assessmentData,
        Sections: addedSections.filter(eachSection => eachSection.Questions.length > 0)
          .map((sectionName) => ({
            SectionName: sectionName.SectionName,
            Questions: sectionName.Questions.map(each => each.qId),
            passScore: sectionName.passScore

          })),

        totalScore: totalScore,
        // passScore: eachSection.passScore,
        ...(formData.passScore && { passScore: formData.passScore })
      };
    }
    if (currentTab === "Candidates") {
      assessmentData = {
        ...assessmentData,
        ...(selectedCandidates.length > 0 && {
          candidateIds: selectedCandidates,
        }),
      };
    }

    return assessmentData;
  };


  const handleSave = async (event, currentTab) => {
    event.preventDefault();
    let newErrors = {};

    // Validate data based on the current tab
    switch (currentTab) {
      case "Basicdetails":
        newErrors = validateAssessmentData(formData);
        break;
      case "Details":
        if (instructionError) {
          newErrors.instructions = instructionError;
        }
        break;
      case "Questions":

        const totalQuestions = addedSections.reduce((acc, eachsection) => acc + eachsection.Questions.length, 0)

        if (totalQuestions !== questionsLimit) {
          newErrors.questions = `Please add exactly ${questionsLimit} questions.`;
          setIsQuestionLimitErrorPopupOpen(true);
        } else {
          const isAnySectionPassScoreSet = Object.values(passScores).some(
            (score) => score > 0
          );
          if (!(overallPassScore > 0 || isAnySectionPassScoreSet)) {
            setSidebarOpen(true);
            return;
          }
        }
        break;
      case "Candidates":
        // Add validation logic for Candidates tab
        break;
      default:
        break;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Gather data up to the current tab
    const assessmentData = gatherDataUpToCurrentTab(currentTab);

    // Add common fields
    const currentDateTime = format(new Date(), "dd MMM, yyyy - hh:mm a");
    assessmentData.CreatedBy = `${userName} at ${currentDateTime}`;
    assessmentData.LastModifiedById = userId;
    // assessmentData.OwnerId = userId;
    assessmentData.ownerId = userId;
    assessmentData.CreatedDate = new Date();

    if (organizationId) {
      // assessmentData.orgId = organizationId;
      assessmentData.tenantId = organizationId;
    }

    console.log("Assessment Data to be sent:", assessmentData);

    try {
      let response;
      if (!tabsSubmitStatus["Basicdetails"]) {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/assessment/new-assessment`,
          assessmentData
        );
        // alert("Saved successfully!");
        setTabsSubmitStatus(prev => ({
          ...prev,
          [currentTab]: true,
          responseId: response.data._id
        }));
      } else {
        // alert("update method")
        console.log("sections data", assessmentData.Sections)
        response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/assessment/update/${tabsSubmitStatus.responseId}`,
          // {...assessmentData,Sections:[{SectionName:"abc",Questions:["eijdiejoie",'jijeijeij']}]}
          assessmentData
        );
        // alert(response.data.message)

      }

      setTabsSubmitStatus(prev => ({
        ...prev,
        [currentTab]: true,
        //  responseId: response.data._id 
      }));

      if (currentTab === "Candidates") {
        setIsLoading(true);
        await handleShareClick(tabsSubmitStatus.responseId);
        setIsLoading(false);
      }
      // handleClose();
      // resetFormData()
      // onClose();
    } catch (error) {
      console.error("Error saving data to backend:", error);
    }
  };




  const handleShareClick = async (assessmentId) => {

    try {
      setIsLoading(true)
      if (!assessmentId) {
        console.error("Failed to save assessment or retrieve assessmentId", assessmentId);
        return;
      }
      if (selectedCandidates.length === 0) {
        setErrors({
          ...errors,
          Candidate: "Please select at least one candidate.",
        });
        return;
      }
      const reqBody = {
        assessmentId,
        organizationId: Cookies.get("organizationId"),
        expiryAt: new Date(new Date().setDate(new Date().getDate() + linkExpiryDays)),
        status: "scheduled",
        proctoringEnabled: true,
        createdBy: Cookies.get("userId"),
      }
      const scheduleAssessmentResponse = await axios.post(`${process.env.REACT_APP_API_URL}/schedule-assessment/schedule`, reqBody)
      if (scheduleAssessmentResponse.data.success) {

        const CandidateAssessmentsList = selectedCandidates.map(candidateId => ({
          scheduledAssessmentId: scheduleAssessmentResponse.data.assessment._id,
          candidateId,
          status: "pending",
          expiryAt: new Date(new Date().setDate(new Date().getDate() + linkExpiryDays)),
          isActive: true,
          assessmentLink: ""
          // assessmentLink:"http://truleeinnovative.com/asssessment/eedgewwf22342343"

        }))
        console.log("candidate assessment list", CandidateAssessmentsList)
        const CandidateAssessmentResponse = await axios.post(`${process.env.REACT_APP_API_URL}/candidate-assessment/create`, CandidateAssessmentsList)
        if (CandidateAssessmentResponse.data.success) {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/candidate-assessment/send-assessment-link`,
            { scheduledAssessmentId: scheduleAssessmentResponse.data.assessment._id, candidateEmails: candidateEmails })
          toast.success(`${response.data.message}`)
        }
        setIsLoading(false)
        setSelectedCandidates([])
        fetchAssessmentData()
        onClose()

      }
      toast.success(`Assessment Scheduled`)
    } catch (error) {

    }
  }

  const assessmentTypes = [
    "MCQ",
    "Programming Questions",
    "Short Text(Single line)",
    "Long Text(Paragraph)",
    "Number",
    "Boolean",
    "Mixed"
  ];

  const toggleDropdownAssessment = () => {
    setShowDropdownAssessment(!showDropdownAssessment);
  };

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

  const handleRemoveAssessmentType = (type) => {
    setSelectedAssessmentType((prevSelected) => {
      const updatedSelected = prevSelected.filter((item) => item !== type);
      setFormData((prevData) => ({
        ...prevData,
        AssessmentType: updatedSelected,
      }));
      return updatedSelected;
    });
  };

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

  const handleDeleteQuestionClick = (questionId, sectionName) => {
    setQuestionsBySection((prevQuestions) => {
      const updatedQuestions = { ...prevQuestions };
      if (Array.isArray(updatedQuestions[sectionName])) {
        updatedQuestions[sectionName] = updatedQuestions[sectionName].filter(
          (question) => question._id !== questionId
        );
      }
      return updatedQuestions;
    });
  };

  // const cancelDelete = () => {
  //   setIsPopupOpen(false);
  //   setQuestionToDelete(null);
  // };

  const handleclose = () => {
    setShowMainContent(true);
    setShowNewPositionContent(false);
  };

  const userId = Cookies.get("userId");

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
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const handleEditClick = (question, sectionName, questionIndex) => {
    setSelectedQuestion(question);
    setCurrentSectionName(sectionName);
    setSelectedQuestionIndex(questionIndex);
    setIsEditQuestionModalOpen(true);
    setActionViewMore(null);
  };

  useEffect(() => {
    const fetchSkillsData = async () => {
      // setLoading(true);
      try {
        const filteredPositions = await fetchFilterData(
          "position",
          positionPermissions
        );
        setPositions(filteredPositions);
      } catch (error) {
        console.error("Error fetching position data:", error);
      } finally {
        // setLoading(false);
      }
    };

    fetchSkillsData();
  }, [positionPermissions]);

  const toggleDropdownPosition = (e) => {
    e.stopPropagation();
    setShowDropdownPosition(!showDropdownPosition);
  };

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
    setShowDropdownPosition(false);
    setValue("");
    setFormData((prevData) => ({
      ...prevData,
      Position: position.title,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      Position: "",
    }));
    const extractedSkills = position.skills.map((skill) => skill.skill);
    setSkillsForSelectedPosition(extractedSkills);
  };

  const handleAddNewPositionClick = () => {
    setShowMainContent(false);
    setShowNewPositionContent(true);

    if (value.trim() !== "") {
      const newPosition = { _id: positions.length + 1, title: value };
      setPositions([newPosition, ...positions]);
      setSelectedPosition(value);
      setValue("");
    }
  };


  const [selectedSkills, setSelectedSkills] = useState([]);



  const [addedSections, setAddedSections] = useState([]);


  const handleSectionAdded = (data) => {
    const { SectionName, Questions } = data;

    // Check if SectionName is not empty before adding
    if (SectionName) {
      setMatchingSection((prevSections) => {
        const uniqueSections = [...new Set([...prevSections, SectionName])];
        return uniqueSections;
      });

      // Add the section name to the addedSections state
      // setAddedSections((prevSections) => [...prevSections, SectionName]);
      setAddedSections((prevSections) => [...prevSections, data]);
      console.log("added sections", addedSections);

      // Initialize questions for the new section
      setQuestionsBySection((prevQuestions) => {
        const updatedQuestions = { ...prevQuestions };
        if (!updatedQuestions[SectionName]) {
          updatedQuestions[SectionName] = Questions || [];
        }
        return updatedQuestions;
      });
    }
  };

  useEffect(() => {
    const sectionNames = selectedIcons
      .filter((section) => section.Position === position)
      .map((section) => section.SectionName);

    const uniqueSections = [
      ...new Set([
        ...selectedIcons2.map((icon) => icon.SectionName),
        ...sectionNames,
      ]),
    ];
    setMatchingSection(uniqueSections);
  }, [selectedIcons, selectedIcons2, position]);

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

  const handleSaveSectionName = () => {
    if (editingIndex !== null && editedSectionName.trim() !== "") {
      const updatedSectionName = editedSectionName.trim();
      // alert(editedSectionName)
      setQuestionsBySection((prevQuestions) => {
        const updatedQuestions = { ...prevQuestions };
        if (updatedQuestions[matchingSection[editingIndex]]) {
          updatedQuestions[updatedSectionName] =
            updatedQuestions[matchingSection[editingIndex]];
          delete updatedQuestions[matchingSection[editingIndex]];
        }
        return updatedQuestions;
      });

      setMatchingSection((prevSections) => {
        const updatedSections = [...prevSections];
        updatedSections[editingIndex] = updatedSectionName;
        return updatedSections;
      });

      setAddedSections((prev) =>
        prev.map((section, index) =>
          index === editingIndex
            ? { ...section, SectionName: updatedSectionName }
            : section
        )
      );

      setIsEditSectionModalOpen(false);
      setEditingIndex(null);
    }
  };


  const handleQuestionSelection = (sectionName, questionIndex) => {
    setCheckedState((prevState) => {
      const isChecked = !prevState[sectionName]?.[questionIndex];
      return {
        ...prevState,
        [sectionName]: {
          ...prevState[sectionName],
          [questionIndex]: isChecked,
        },
      };
    });
  };

  // Function to calculate the number of selected questions
  const getSelectedQuestionsCount = () => {
    return Object.values(checkedState).reduce((count, section) => {
      return count + Object.values(section).filter(Boolean).length;
    }, 0);
  };




  const [isDeleteSectionConfirmationOpen, setIsDeleteSectionConfirmationOpen] =
    useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [sectionIndexToDelete, setSectionIndexToDelete] = useState(null);


  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <input
      type="text"
      readOnly
      className="focus:border-black focus:outline-none"
      value={value}
      onClick={onClick}
      ref={ref}
    />
  ));

  // mansoor
  const [questionsLimit, setQuestionsLimit] = useState(null);

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

  const [totalScore, setTotalScore] = useState(0);

  // Function to calculate total score
  const calculateTotalScore = () => {
    let score = 0;

    addedSections.forEach(eachSection => {
      eachSection.Questions.forEach(eachQuestion => {
        score += Number(eachQuestion.score)
      })

    })
    setTotalScore(score);
  };

  // Effect to recalculate total score whenever questions change
  useEffect(() => {
    calculateTotalScore();
  }, [addedSections]);

  const [passScores, setPassScores] = useState({});
  const [overallPassScore, setOverallPassScore] = useState(0);

  // Initialize passScores for each section to 0
  useEffect(() => {
    const initialPassScores = {};
    matchingSection.forEach((sectionName) => {
      initialPassScores[sectionName] = 0;
    });
    setPassScores(initialPassScores);
  }, [matchingSection]);



  const handlePassScoreSave = (scores) => {
    setPassScores(scores);
    const totalPassScore = Object.values(scores).reduce(
      (acc, score) => acc + Number(score),
      0
    );
    setOverallPassScore(totalPassScore);
  };

  const [candidateData, setCandidateData] = useState([]);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/candidate`
        );
        setCandidateData(response.data);
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      }
    };

    fetchCandidateData();
  }, []);

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

  const handleDeleteSectionClick = (index, sectionName) => {
    setMatchingSection((prevSections) =>
      prevSections.filter((_, i) => i !== index)
    );
    setQuestionsBySection((prevQuestions) => {
      const updatedQuestions = { ...prevQuestions };
      delete updatedQuestions[sectionName];
      return updatedQuestions;
    });
    setAddedSections((prevSections) =>
      prevSections.filter((name) => name !== sectionName)
    );
  };

  const [isSelectCandidatePopupOpen, setIsSelectCandidatePopupOpen] =
    useState(false);

  const [includePhone, setIncludePhone] = useState(false);
  const [includePosition, setIncludePosition] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");

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



  const [instructions, setInstructions] = useState(defaultInstructions);
  const [instructionError, setInstructionError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleInstructionsChange = (e) => {

    const value = e.target.value;

    setInstructions(value);
    setIsEditing(true);

    if (value === defaultInstructions) {
      setInstructionError("");
      setIsEditing(false);
    } else if (value.length < 500) {
      setInstructionError("Instructions must be at least 500 characters.");
    } else if (value.length > 2000) {
      setInstructionError("Instructions cannot exceed 2000 characters.");
    } else {
      setInstructionError("");
    }
  };

  const handleBackToBasicDetails = () => {
    setActiveTab("Basicdetails");
  };

  const handleQuestionUpdated = (
    updatedQuestion,
    sectionName,
    questionIndex
  ) => {
    console.log(
      "Updating Question:",
      updatedQuestion,
      "Section:",
      sectionName,
      "Index:",
      questionIndex
    );
    setQuestionsBySection((prevQuestions) => {
      const updatedQuestions = { ...prevQuestions };
      const sectionQuestions = updatedQuestions[sectionName] || [];
      console.log("Before Update:", questionsBySection);
      console.log(
        "Updated Question at Index:",
        questionIndex,
        "Data:",
        updatedQuestion
      );
      console.log("After Update:", updatedQuestions);

      if (questionIndex !== -1 && sectionQuestions[questionIndex]) {
        // Update the specific question using the index
        sectionQuestions[questionIndex] = updatedQuestion;
      }

      updatedQuestions[sectionName] = sectionQuestions;
      return updatedQuestions;
    });
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


  const updateQuestionOrdersInBackend = async (questions) => {
    try {
      const payload = questions.map((q) => ({
        questionId: q._id,
        order: q.order,
      }));

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/assessment-questions`,
        payload
      );

      console.log("Orders updated successfully for questions:", payload);
    } catch (error) {
      console.error("Error updating question orders:", error);
      alert("Failed to update question orders in the backend. Please try again.");
    }
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




  const confirmDelete = async () => {
    try {
      if (deleteType === "section") {
        setAddedSections((prev) => {
          const filteredList = prev.filter(section => section.SectionName !== itemToDelete.SectionName);
          console.log("filtered list", filteredList);
          return filteredList;
        });

      } else if (deleteType === "question") {

        await axios.delete(
          `${process.env.REACT_APP_API_URL}/assessment-question/${itemToDelete.qId}`
        );
        const sectionIndex = addedSections.findIndex(section => section.SectionName === itemToDelete.SectionName)

        const questionIndex = addedSections.findIndex(section => section.Questions.some(question => question.qId === itemToDelete.qId))

        deleteQuestion(sectionIndex, questionIndex)
      }
      setIsDeleteConfirmationOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("An error occurred while deleting the item. Please try again.");
    }
  };







  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false);
    setItemToDelete(null);
  };

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
      // Category: category,
      Position: position,
      Skills: selectedSkills,
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

  const updateQuestionsInAddedSectionFromQuestionBank = async (secName, question) => {
    const sectionIndex = addedSections.findIndex(section => section.SectionName === secName)
    addQuestion(sectionIndex, question)
    // console.log("added sections",addedSections)
    const updatedQuestion = addedSections.find(section => section.SectionName === secName).Questions.find(q => q._id === question._id)
    console.log("updated question=", updatedQuestion)
    try {
      const reqBody = {
        assessmentId: tabsSubmitStatus.responseId,
        questionId: updatedQuestion._id,
        source: updatedQuestion.isCustom ? "custom" : "system",
        snapshot: {
          questionText: updatedQuestion.questionText,
          options: updatedQuestion.options,
          correctAnswer: updatedQuestion.correctAnswer,
          questionType: updatedQuestion.questionType,
          score: Number(updatedQuestion.score),
        },
        order: updatedQuestion.order,
        customizations: "customization",
      };
      if (updatedQuestion.questionType === "Short Text" || updatedQuestion.questionType === "Short Text(Single Line)" || updatedQuestion.questionType === "Long Text" || updatedQuestion.questionType === "Long Text") {

        reqBody.snapshot.autoAssessment = question.autoAssessment
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/assessment-questions`,
        reqBody
      );

      const finalSectionsUpdate = addedSections.map((section) =>
        section.SectionName === secName
          ? {
            ...section,
            Questions: section.Questions.map((each) =>
              each._id === updatedQuestion._id
                ? { ...updatedQuestion, qId: response.data.question._id }
                : each
            ),
          }
          : section
      );

      setAddedSections(finalSectionsUpdate);

    } catch (error) {
      console.error("Error pushing updated question to backend:", error);
    }
  }


  console.log('added sections', addedSections)
  return (
    <React.Fragment>
      <div>
        {showMainContent ? (
          <div className="bg-white">
            {isLoading && (
              <div className="fixed inset-0 bg-gray-700 bg-opacity-70 flex items-center justify-center z-50">
                <div className="text-white text-2xl font-bold">Loading...</div>
              </div>
            )}

            {/* Content */}
            <div className="mb-20 pt-1">
              <div>
                <div>
                  <div className="flex justify-center gap-3 mt-3">
                    <div
                      className={`rounded h-2 w-24 border ${activeTab === "Basicdetails"
                          ? "bg-[#F9CB7B]"
                          : "bg-blue-400"
                        }`}
                    ></div>
                    <div
                      className={`rounded h-2 w-24 border ${activeTab === "Details"
                          ? "bg-[#F9CB7B]"
                          : activeTab === "Questions"
                            ? "bg-blue-400"
                            : activeTab === "Candidates"
                              ? "bg-blue-400"
                              : "bg-gray-400"
                        }`}
                    ></div>
                    <div
                      className={`rounded h-2 w-24 border ${activeTab === "Questions"
                          ? "bg-[#F9CB7B]"
                          : activeTab === "Candidates"
                            ? "bg-blue-400"
                            : "bg-gray-400"
                        }`}
                    ></div>
                    <div
                      className={`rounded h-2 w-24 border ${activeTab === "Candidates"
                          ? "bg-[#F9CB7B]"
                          : "bg-gray-400"
                        }`}
                    ></div>
                  </div>
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
                          selectedAssessmentType={selectedAssessmentType}
                          handleRemoveAssessmentType={
                            handleRemoveAssessmentType
                          }
                          setFormData={setFormData}
                          showDropdownAssessment={showDropdownAssessment}
                          assessmentTypes={assessmentTypes}
                          handleAssessmentTypeSelect={
                            handleAssessmentTypeSelect
                          }
                          setShowDropdownAssessment={setShowDropdownAssessment}
                          handleChange={handleChange}
                          handleIconClick={handleIconClick}
                          showMessage={showMessage}
                          selectedPosition={selectedPosition}
                          toggleDropdownPosition={toggleDropdownPosition}
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
                          onClose={onClose}
                          handleSave={handleSave}
                          handleSaveAndNext={handleSaveAndNext}
                          setSelectedAssessmentType={setSelectedAssessmentType}
                          setSelectedPosition={setSelectedPosition}
                          positions={positions}
                          handlePositionSelect={handlePositionSelect}
                          handleAddNewPositionClick={handleAddNewPositionClick}
                          selectedDifficulty={selectedDifficulty}
                          toggleDropdownDifficulty={toggleDropdownDifficulty}
                          showDropdownDifficulty={showDropdownDifficulty}
                          errors={errors}
                          setErrors={setErrors}
                        />
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
                          isEditing={isEditing}
                          instructionError={instructionError}
                          additionalNotes={additionalNotes}
                          handleCheckboxChange={handleCheckboxChange}
                          handleInstructionsChange={handleInstructionsChange}
                          handleAdditionalNotesChange={
                            handleAdditionalNotesChange
                          }
                          handleBackToBasicDetails={handleBackToBasicDetails}
                          handleSave={handleSave}
                          handleSaveAndNext={handleSaveAndNext}
                          setIsEditing={setIsEditing}
                        />
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
                          handleEditClick={handleEditClick}
                          toggleAction={toggleAction}
                          passScores={passScores}
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
                          // handleQuestionAdded={handleQuestionAdded}
                          handleBackButtonClick={handleBackButtonClick}
                          handleSave={handleSave}
                          handleSaveAndNext={handleSaveAndNext}
                          handleBulkDeleteClick={handleBulkDeleteClick}
                          updateQuestionsInAddedSectionFromQuestionBank={
                            updateQuestionsInAddedSectionFromQuestionBank
                          }
                          getDifficultyColorClass={getDifficultyColorClass}
                          getSelectedQuestionsCount={getSelectedQuestionsCount}
                          matchingSection={matchingSection}
                        />
                      </>
                    )}

                    {activeTab === "Candidates" && (
                      <>
                        <Candidate isAssessmentContext={true} onSelectCandidates={handleSelectCandidates} />
                        <div className="customFooter z-50">
                          <div>
                            <p
                              className="cursor-pointer border border-custom-blue rounded p-2 ml-8 px-4"
                              onClick={handleBackButtonClickCandidate}
                            >
                              Back
                            </p>
                          </div>
                          <div className="mr-8">
                            <button
                              className="cursor-pointer border rounded p-2 mr-3"
                              // onClick={(e) => handleSave(e, "Questions")}
                              onClick={() => onClose()}
                            >
                              skip
                            </button>

                            <button
                              type="submit"
                              onClick={(e) => {
                                e.preventDefault();
                                if (selectedCandidates.length === 0) {
                                  setIsSelectCandidatePopupOpen(true);
                                } else {

                                  handleSave(e, "Candidates");
                                }
                              }}
                              className="footerButton bg-custom-blue mr-[10px]"
                            >
                              Share
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {isDeleteConfirmationOpen && (
                  <ConfirmationPopup
                    isOpen={isDeleteConfirmationOpen}
                    title={`Are you sure you want to delete this ${deleteType}?`}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                  />
                )}
                {isBulkDeleteConfirmationOpen && (
                  <ConfirmationPopup
                    isOpen={isBulkDeleteConfirmationOpen}
                    title="Are you sure you want to delete the selected questions?"
                    onConfirm={confirmBulkDeleteQuestions}
                    onCancel={() => setIsBulkDeleteConfirmationOpen(false)}
                  />
                )}

                {isEditSectionModalOpen && (
                  <ConfirmationPopup
                    isOpen={isEditSectionModalOpen}
                    title="Edit Section Name"
                    message={
                      <input
                        type="text"
                        value={editedSectionName}
                        onChange={(e) => setEditedSectionName(e.target.value)}
                        className="border p-2 rounded w-full"
                      />
                    }
                    onConfirm={handleSaveSectionName}
                    onCancel={() => setIsEditSectionModalOpen(false)}
                  />
                )}

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
                      <Sidebar
                        sections={matchingSection}
                        passScoreType={formData.passScoreType}
                        formData={formData}
                        setFormData={setFormData}
                        addedSections={addedSections}
                        setAddedSections={setAddedSections}
                        questionsBySection={questionsBySection}
                        onClose={() => setSidebarOpen(false)}
                        onSave={handlePassScoreSave}
                        onOutsideClick={handleOutsideClick}
                        ref={sidebarRef}
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
                {isEditQuestionModalOpen && (
                  <Editassesmentquestion
                    sectionName={currentSectionName}
                    isOpen={isEditQuestionModalOpen}
                    selectedAssessmentType={selectedAssessmentType}
                    onClose={() => setIsEditQuestionModalOpen(false)}
                    selectedQuestion={selectedQuestion}
                    onSave={handleQuestionUpdated}
                    selectedQuestionIndex={selectedQuestionIndex}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* {showNewPositionContent && <AddPositionForm onClose={handleclose} />} */}
          </>
        )}
      </div>
    </React.Fragment>
  );
};

export default NewAssessment;
