import React, { useState, useRef, useEffect, forwardRef, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import "react-phone-input-2/lib/style.css";
import AddSection1 from "./AddSection1.jsx";
import axios from "axios";
import Editassesmentquestion from "./EditAssessmentquestion.jsx";
// import AddPositionForm from "../Position-Tab/Position-Form.jsx";
// import { useLocation } from "react-router-dom";
import AddQuestion1 from './AddQuestion1.jsx';
import { fetchFilterData } from "../../../../utils/dataUtils.js";
import { usePermissions } from '../../../../Context/PermissionsContext.js';
import { useMemo } from 'react';

// import Cookies from 'js-cookie';

import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';
import { ReactComponent as IoIosArrowUp } from '../../../../icons/IoIosArrowUp.svg';
import { ReactComponent as IoIosArrowDown } from '../../../../icons/IoIosArrowDown.svg';
// import { ReactComponent as SlPencil } from '../../../../icons/SlPencil.svg';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as HiOutlineExclamationCircle } from '../../../../icons/HiOutlineExclamationCircle.svg';
import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';

const EditAssessment = ({ onClose, candidate1 }) => {
  const { sharingPermissionscontext } = usePermissions();
  const positionPermissions = useMemo(() => sharingPermissionscontext.position || {}, [sharingPermissionscontext]);
  // const [loading, setLoading] = useState(false);
  const updatedCandidate = candidate1;
  const [formData, setFormData] = useState({
    AssessmentTitle: updatedCandidate.AssessmentTitle || '',
    AssessmentType: updatedCandidate.AssessmentType || [],
    Position: updatedCandidate.Position || '',
    Duration: updatedCandidate.Duration || '',
    DifficultyLevel: updatedCandidate.DifficultyLevel || '',
    NumberOfQuestions: updatedCandidate.NumberOfQuestions || '',
    ExpiryDate: updatedCandidate.ExpiryDate ? new Date(updatedCandidate.ExpiryDate) : null,
  });
  const [sections, setSections] = useState(updatedCandidate.Sections || []);
  const [questionsBySection, setQuestionsBySection] = useState(
    updatedCandidate.Sections?.reduce((acc, section) => {
      acc[section.SectionName] = section.Questions;
      return acc;
    }, {}) || {}
  );
  const [selectedAssessmentType, setSelectedAssessmentType] = useState(updatedCandidate.AssessmentType || []);
  console.log(selectedAssessmentType, "selectedAssessmentType")
  const [startDate, setStartDate] = useState(updatedCandidate.ExpiryDate ? new Date(updatedCandidate.ExpiryDate) : null);
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [sectionToDeleteFrom, setSectionToDeleteFrom] = useState(null);
  const userId = localStorage.getItem("userId");
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/assessment/${updatedCandidate._id}`);
        const assessment = response.data;
        setFormData({
          AssessmentTitle: assessment.AssessmentTitle,
          AssessmentType: assessment.AssessmentType,
          Position: assessment.Position,
          Duration: assessment.Duration,
          DifficultyLevel: assessment.DifficultyLevel,
          NumberOfQuestions: assessment.NumberOfQuestions,
          ExpiryDate: new Date(assessment.ExpiryDate),
        });
        setSections(assessment.Sections);
        setQuestionsBySection(assessment.Sections.reduce((acc, section) => {
          acc[section.SectionName] = section.Questions;
          return acc;
        }, {}));
        setSelectedAssessmentType(assessment.AssessmentType);
        setSelectedPosition(assessment.Position);
        setStartDate(new Date(assessment.ExpiryDate));
      } catch (error) {
        console.error('Error fetching assessment:', error);
      }
    };

    fetchAssessment();
  }, [updatedCandidate._id]);


  useEffect(() => {
    const fetchSkillsData = async () => {
        // setLoading(true);
        try {
            const filteredPositions = await fetchFilterData('position', positionPermissions);
            setPositions(filteredPositions);
        } catch (error) {
            console.error('Error fetching position data:', error);
        } finally {
            // setLoading(false);
        }
    };
  
    fetchSkillsData();
  
  }, [positionPermissions]);

  const handleSaveAll = async (e) => {
    e.preventDefault();

    if (!updatedCandidate._id) {
      console.error('Assessment ID is undefined');
      return;
    }

    try {
      const updatedAssessment = {
        AssessmentTitle: formData.AssessmentTitle,
        AssessmentType: selectedAssessmentType,
        Position: formData.Position,
        Duration: formData.Duration,
        DifficultyLevel: formData.DifficultyLevel,
        NumberOfQuestions: formData.NumberOfQuestions,
        ExpiryDate: formData.ExpiryDate,
        Sections: sections.map(section => ({
          SectionName: section.SectionName,
          Position: selectedPosition,
          Questions: questionsBySection[section.SectionName] || []
        })),
        ModifiedBy: userId,
        ModifiedDate: new Date(),
      };

      const response = await axios.put(`${process.env.REACT_APP_API_URL}/assessment/${updatedCandidate._id}`, updatedAssessment);

      console.log(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating assessment:', error);
    }
  };

  const [checkedCount, setCheckedCount] = useState(0);

  const handleEditClick = (question) => {
    setSelectedQuestion(question);
    setIsEditQuestionModalOpen(true)
    setCurrentSectionName(question.SectionName);
  };

  const cancelDeleteQuestion = () => {
    setIsDeleteConfirmationOpen(false);
    setQuestionToDelete(null);
    setSectionToDeleteFrom(null);
  };

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedSectionName, setEditedSectionName] = useState("");
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false); // Added this state
  const [checkedState, setCheckedState] = useState({});
  const [matchingSection, setMatchingSection] = useState([]);

  // const [questionsBySection, setQuestionsBySection] = useState({});
  const [currentSectionName, setCurrentSectionName] = useState('');

  const handleEditSection = (index, currentSectionName) => {
    setEditingIndex(index);
    setEditedSectionName(currentSectionName);
    setIsEditSectionModalOpen(true);
  };

  const handleSaveSectionName = () => {
    if (editingIndex !== null && editedSectionName.trim() !== "") {
      const updatedSectionName = editedSectionName.trim();

      // Update section name in questions
      setQuestionsBySection((prevQuestions) => {
        const updatedQuestions = { ...prevQuestions };
        if (updatedQuestions[matchingSection[editingIndex]]) {
          updatedQuestions[updatedSectionName] = updatedQuestions[matchingSection[editingIndex]];
          delete updatedQuestions[matchingSection[editingIndex]];
        }
        return updatedQuestions;
      });

      // Update section name in matchingSection array
      setMatchingSection((prevSections) => {
        const updatedSections = [...prevSections];
        updatedSections[editingIndex] = updatedSectionName;
        return updatedSections;
      });

      // Assuming `sections` is the array that holds section data
      setSections((prevSections) => {
        const updatedSections = prevSections.map((section, idx) =>
          idx === editingIndex ? { ...section, SectionName: updatedSectionName } : section
        );
        return updatedSections;
      });

      setIsEditSectionModalOpen(false);
      setEditingIndex(null);
      setEditedSectionName("");
    }
  };


  const handleBulkDeleteClick = () => {
    setQuestionsBySection((prevQuestions) => {
      const updatedQuestions = { ...prevQuestions };
      Object.keys(checkedState).forEach((sectionName) => {
        updatedQuestions[sectionName] = updatedQuestions[sectionName].filter((_, index) => !checkedState[sectionName][index]);
      });
      return updatedQuestions;
    });
    setCheckedState({});
  };

  const [questionToEdit] = useState(null);





  // const [selectedAssessmentType, setSelectedAssessmentType] = useState(candidate1.AssessmentType || []);
  const [position] = useState("");
  // const userId = localStorage.getItem("userId");
  // const location = useLocation();

  // const [updatedCandidate] = useState(assessmentData);
  const [activeTab, setActiveTab] = useState("Basicdetails");
  // const [startDate, setStartDate] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(updatedCandidate.Position || '');
  console.log(selectedPosition, "selectedPosition")
  console.log(updatedCandidate.Position)


  const [positions, setPositions] = useState([]);
  // const [selectedPosition, setSelectedPosition] = useState(candidate1.Position || "");
  const [showDropdownPosition, setShowDropdownPosition] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        console.log(`Fetching positions for user ID: ${userId}`);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/position?CreatedBy=${userId}`);
        console.log('Fetched positions:', response.data);
        setPositions(response.data);
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    };

    fetchPositions();
  }, [userId]);

  useEffect(() => {
    if (updatedCandidate.Position) {
      const defaultPosition = positions.find(pos => pos.title === updatedCandidate.Position);
      if (defaultPosition) {
        const extractedSkills = defaultPosition.skills.map(skill => skill.skill);
        setSkillsForSelectedPosition(extractedSkills);
      }
    }
  }, [updatedCandidate.Position, positions]);

  const toggleDropdownPosition = () => {
    setShowDropdownPosition(!showDropdownPosition);
  };

  const handleAddNewPositionClick = () => {
    // Handle adding a new position
  };

  const handleIconClick = () => {
    setShowMessage(!showMessage);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = "";

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: errorMessage });
  };


  const handleCombinedSubmit = (e, path = null) => {
    e.preventDefault();

    // Validate form data
    const requiredFields = {
      AssessmentTitle: 'Assessment Title is required',
      AssessmentType: 'Assessment Type is required',
      Duration: 'Duration is required',
      DifficultyLevel: 'Difficulty Level is required',
      NumberOfQuestions: 'Number Of Questions is required',
      Position: 'Position is required',
      ExpiryDate: 'Expiry Date is required',
    };

    let formIsValid = true;
    const newErrors = {};

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        newErrors[field] = message;
        formIsValid = false;
      }
    });

    // Check if Position and AssessmentType are empty and set errors
    if (!selectedPosition) {
      newErrors.Position = 'Position is required';
      formIsValid = false;
    }

    if (selectedAssessmentType.length === 0) {
      newErrors.AssessmentType = 'Assessment Type is required';
      formIsValid = false;
    }

    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }

    if (path) {
      handleSaveAll(e);
    } else {
      setActiveTab((prevTab) => {
        if (prevTab === "Basicdetails") return "Questions";
        if (prevTab === "Questions") return "Candidates";
        return "Basicdetails";
      });
    }
  };

  const [showDropdownAssessment, setShowDropdownAssessment] = useState(false);
  const assessmentTypes = [
    "MCQ",
    "Programming Questions",
    "Short Text(Single line)",
    "Long Text(Paragraph)",
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
    setSelectedAssessmentType((prev) => prev.filter((t) => t !== type));
    setFormData((prev) => ({
      ...prev,
      AssessmentType: prev.AssessmentType.filter((t) => t !== type),
    }));
  };
  const [showDropdownDuration, setShowDropdownDuration] = useState(false);
  const [durations] = useState(["15 minutes", "30 minutes", "45 minutes", "60 minutes"]);

  const toggleDropdownDuration = () => {
    setShowDropdownDuration(!showDropdownDuration);
  };

  const handleDurationSelect = (duration) => {
    setFormData((prev) => ({
      ...prev,
      Duration: duration,
    }));
    setShowDropdownDuration(false);
  };

  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  const handleUpgrade = () => {
    setShowUpgradePopup(false);
  };

  const closePopup = () => {
    setShowUpgradePopup(false);
  };

  const [showDropdownDifficulty, setShowDropdownDifficulty] = useState(false);
  const difficultyLevels = ["Easy", "Medium", "Hard"];
  const toggleDropdownDifficulty = () => {
    setShowDropdownDifficulty(!showDropdownDifficulty);
  };
  const handleDifficultySelect = (level) => {
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

  const [sidebarOpenAddQuestion, setSidebarOpenAddQuestion] = useState(false);
  const sidebarRefAddQuestion = useRef(null);

  const toggleSidebarAddQuestion = (SectionName) => {
    setSidebarOpenAddQuestion(!sidebarOpenAddQuestion);
    setCurrentSectionName(SectionName);
  };


  const [sidebarOpenForSection, setSidebarOpenForSection] = useState(false);
  const sidebarRefForSection = useRef(null);

  const toggleSidebarForSection = () => {
    setSidebarOpenForSection(!sidebarOpenForSection);
  };

  const closeSidebarForSection = useCallback(() => {
    setSidebarOpenForSection(false);
  }, []);

  const handleOutsideClickForSection = useCallback((event) => {
    if (
      sidebarRefForSection.current &&
      !sidebarRefForSection.current.contains(event.target)
    ) {
      closeSidebarForSection();
    }
  }, [closeSidebarForSection]);

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

  const handleOutsideClickAddQuestion = useCallback((event) => {
    if (
      sidebarRefAddQuestion.current &&
      !sidebarRefAddQuestion.current.contains(event.target)
    ) {
      closeSidebarAddQuestion();
    }
  }, [closeSidebarAddQuestion]);
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

  const [selectedIcons, setSelectedIcons] = useState([]);
  const [selectedIcons2, setSelectedIcons2] = useState([]);

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/sections`);
        setSelectedIcons(response.data);
        const IconData = response.data.filter(
          (data) => data.Position === position
        );
        setSelectedIcons2(IconData);
      } catch (error) {
        console.error("Error fetching Sectionsdata:", error);
      }
    };
    fetchSectionData();
  }, [position]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupOpen2, setIsPopupOpen2] = useState(false);
  const popupRef = useRef(null);

  const confirmDelete2 = () => {
    try {
      setQuestionsBySection((prevQuestions) =>
        prevQuestions.filter((question) => !selectedQuestionsForDeletion.includes(question._id))
      );

      setIsPopupOpen2(false);
      setSelectedQuestionsForDeletion([]);
    } catch (error) {
      console.error("Error deleting questions:", error);
    }
  };

  const cancelDelete2 = () => {
    setIsPopupOpen2(false);
    setQuestionToDelete(null);
  };

  const confirmDelete = () => {
    try {
      setQuestionsBySection((prevQuestions) =>
        prevQuestions.filter((question) => question._id !== questionToDelete)
      );
      setIsPopupOpen(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const cancelDelete = () => {
    setIsPopupOpen(false);
    setQuestionToDelete(null);
  };

  const [selectedQuestionsForDeletion, setSelectedQuestionsForDeletion] = useState([]);

  const handleclose = () => {
    setShowMainContent(true);
    setShowNewPositionContent(false);
  };

  const [toggleStates, setToggleStates] = useState([]);

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
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  const [showNewPositionContent, setShowNewPositionContent] = useState(false);
  const [showMainContent, setShowMainContent] = useState(true);

  const handleQuestionAdded = (questionData) => {
    setQuestionsBySection((prevQuestions) => ({
      ...prevQuestions,
      [currentSectionName]: [...(prevQuestions[currentSectionName] || []), questionData]
    }));
  };

  // const [skillsForSelectedPosition] = useState([]);

  const handleSectionAdded = (newSection) => {
    setSections((prevSections) => [...prevSections, newSection]);
    setQuestionsBySection((prevQuestions) => ({
      ...prevQuestions,
      [newSection.SectionName]: [],
    }));
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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/newquestion`);
        setQuestionsBySection(response.data);

      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, []);

  // const handleDeleteConfirmation = () => {
  //   setMatchingSection((prevSections) =>
  //     prevSections.filter((section) => section !== sectionToDelete)
  //   );
  //   setQuestionsBySection((prevQuestions) => {
  //     const { [sectionToDelete]: _, ...rest } = prevQuestions;
  //     return rest;
  //   });
  //   setIsDeleteConfirmationOpen(false);
  // };

  const handleBackButtonClick = () => {
    setActiveTab('Basicdetails');
  };


  // const handleEditSectionName = (sectionName) => {
  //   setSectionToDelete(sectionName);
  //   setIsDeleteSectionConfirmationOpen(true);
  // };

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

  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <input
      type="text"
      readOnly
      className="focus:border-black focus:outline-none w-96"
      value={value}
      onClick={onClick}
      ref={ref}
    />
  ));





  const [isDeleteSectionConfirmationOpen, setIsDeleteSectionConfirmationOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [sectionIndexToDelete, setSectionIndexToDelete] = useState(null);

  const handleDeleteSectionClick = (index, sectionName) => {
    setSectionToDelete(sectionName);
    setSectionIndexToDelete(index);
    setIsDeleteSectionConfirmationOpen(true);
  };

  const confirmDeleteSection = () => {
    if (sectionToDelete !== null && sectionIndexToDelete !== null) {
      setMatchingSection((prevSections) => prevSections.filter((_, i) => i !== sectionIndexToDelete));
      setQuestionsBySection((prevQuestions) => {
        const updatedQuestions = { ...prevQuestions };
        delete updatedQuestions[sectionToDelete];
        return updatedQuestions;
      });
      setSections((prevSections) => prevSections.filter((_, i) => i !== sectionIndexToDelete)); // Update sections state
      setIsDeleteSectionConfirmationOpen(false);
      setSectionToDelete(null);
      setSectionIndexToDelete(null);
    }
  };

  const cancelDeleteSection = () => {
    setIsDeleteSectionConfirmationOpen(false);
    setSectionToDelete(null);
    setSectionIndexToDelete(null);
  };

  const [skillsForSelectedPosition, setSkillsForSelectedPosition] = useState([]);

  const handlePositionSelect = (position) => {
    setSelectedPosition(position.title);
    setShowDropdownPosition(false);
    setFormData((prevData) => ({
      ...prevData,
      Position: position.title,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      Position: "",
    }));
    const extractedSkills = position.skills.map(skill => skill.skill);
    console.log('Extracted Skills:', extractedSkills);
    setSkillsForSelectedPosition(extractedSkills);
  };;


  const handleQuestionSelection = (sectionName, questionIndex) => {
    setCheckedState(prevState => {
      const isChecked = !prevState[sectionName]?.[questionIndex];
      const newCheckedState = {
        ...prevState,
        [sectionName]: {
          ...prevState[sectionName],
          [questionIndex]: isChecked
        }
      };

      // Update the count of checked checkboxes
      const newCheckedCount = Object.values(newCheckedState).reduce((count, section) => {
        return count + Object.values(section).filter(Boolean).length;
      }, 0);

      setCheckedCount(newCheckedCount);
      return newCheckedState;
    });
  };



  const handleDeleteIconClick = (questionIndex, sectionName) => {
    setQuestionToDelete(questionIndex);
    setSectionToDeleteFrom(sectionName);
    setIsBulkDelete(false);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDeleteQuestion = () => {
    setQuestionsBySection((prevQuestions) => {
      const updatedQuestions = { ...prevQuestions };
      if (Array.isArray(updatedQuestions[sectionToDeleteFrom])) {
        updatedQuestions[sectionToDeleteFrom] = updatedQuestions[sectionToDeleteFrom].filter(
          (_, index) => index !== questionToDelete
        );
      }
      return updatedQuestions;
    });

    setIsDeleteConfirmationOpen(false);
    setQuestionToDelete(null);
    setSectionToDeleteFrom(null);
  };

  const handleSaveEditedQuestion = (updatedQuestion) => {
    setQuestionsBySection((prevQuestions) => {
      const updatedQuestions = { ...prevQuestions };
      if (Array.isArray(updatedQuestions[currentSectionName])) {
        updatedQuestions[currentSectionName] = updatedQuestions[currentSectionName].map((question) =>
          question._id === updatedQuestion._id ? updatedQuestion : question
        );
      }
      return updatedQuestions;
    });
    setIsEditQuestionModalOpen(false);
    setSelectedQuestion(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-15 z-50">
      <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform 'translate-x-0' : 'translate-x-full'">
        <div>
          {showMainContent ? (
            <div>
              {/* Header */}
              <div className="fixed top-0 w-full bg-white border-b z-0">
                <div className="flex justify-between items-center p-4">
                  <h2 className="text-lg font-bold">New Assessment</h2>
                  <button onClick={onClose} className="focus:outline-none">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="fixed top-16 bottom-16 overflow-auto w-full">
                <div>
                  <div className="container mx-auto">
                    <div>
                      {/* basic details tab content */}
                      {activeTab === "Basicdetails" && (
                        <>
                          <form className="group p-4">
                            {/* Assessment Name */}
                            <div className="flex gap-5 mb-5">
                              <div>
                                <label
                                  htmlFor="AssessmentTitle"
                                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                                >
                                  Assessment Name{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                              </div>
                              <div className="flex-grow">
                                <input
                                  type="text"
                                  name="AssessmentTitle"
                                  id="AssessmentTitle"
                                  value={formData.AssessmentTitle}
                                  onChange={handleChange}
                                  autoComplete="off"
                                  className={`border-b focus:outline-none mb-5 w-full ${errors.AssessmentTitle
                                    ? "border-red-500"
                                    : "border-gray-300 focus:border-black"
                                    }`}
                                />
                                {errors.AssessmentTitle && (
                                  <p className="text-red-500 text-sm -mt-4">
                                    {errors.AssessmentTitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Assessment Type */}
                            <div className="flex gap-5 mb-9">
                              <label
                                htmlFor="AssessmentType"
                                className="block text-sm font-medium leading-6 text-gray-900"
                                style={{ width: "143px" }}
                              >
                                Assessment Type
                                <span className="text-red-500">*</span>
                              </label>

                              <div className="flex-grow relative" style={{ width: "200px" }}>
                                <div
                                  className={`border-b ${errors.AssessmentType ? "border-red-500" : "border-gray-300"} focus:border-black focus:outline-none w-full flex items-center flex-wrap gap-2 py-3 cursor-pointer ${Array.isArray(selectedAssessmentType) && selectedAssessmentType.length > 0 ? "-mt-3" : ""}`}
                                  onClick={toggleDropdownAssessment}
                                >
                                  {Array.isArray(selectedAssessmentType) && selectedAssessmentType.map((type) => (
                                    <div key={type} className="flex items-center bg-gray-200 rounded px-2 py-1">
                                      {type}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveAssessmentType(type);
                                        }}
                                        className="ml-2 text-sm bg-slate-300 rounded px-2"
                                      >
                                        X
                                      </button>
                                    </div>
                                  ))}
                                  {Array.isArray(selectedAssessmentType) && selectedAssessmentType.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent parent click event
                                        setSelectedAssessmentType([]);
                                      }}
                                      className="absolute top-1 right-8 text-gray-500 text-lg cursor-pointer"
                                    >
                                      X
                                    </button>
                                  )}
                                  <MdArrowDropDown
                                    className="absolute right-0 top-1 text-gray-500 text-lg cursor-pointer"
                                  />
                                </div>

                                {/* Dropdown Options */}
                                {showDropdownAssessment && (
                                  <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-md">
                                    {assessmentTypes.map((questionType) => (
                                      <div
                                        key={questionType}
                                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                          handleAssessmentTypeSelect(questionType);
                                          setShowDropdownAssessment(false);
                                        }}
                                      >
                                        {questionType}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Validation Error */}
                                {errors.AssessmentType && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors.AssessmentType}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Position */}
                            <div className="flex gap-5 mb-5">
                              <div>
                                <label className="text-sm font-medium leading-6 text-gray-900 w-36 flex items-center">
                                  Position <span className="text-red-500">*</span>
                                  <div className="relative inline-block">
                                    <HiOutlineExclamationCircle
                                      className="ml-2 text-gray-500 cursor-pointer"
                                      onClick={handleIconClick}
                                    />
                                    {showMessage && (
                                      <div className="absolute bottom-full mb-2 left-0 w-max bg-white text-gray-700 border border-gray-300 rounded p-2 text-xs">
                                        Depending on the position, we can offer sections with tailored questions.
                                      </div>
                                    )}
                                  </div>
                                </label>
                              </div>
                              <div className="relative flex-grow">
                                <div className="relative">
                                  <div className="relative mb-5">
                                    {selectedPosition ? (
                                      <div className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full h-9 flex items-center">
                                        <div className="bg-slate-200 rounded px-2 py-1 inline-block mr-2">
                                          {selectedPosition}
                                          <button
                                            className="ml-2 bg-slate-300 rounded px-2"
                                            onClick={() =>
                                              setSelectedPosition("")
                                            }
                                          >
                                            X
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <input
                                        type="text"
                                        id="position"
                                        className={`border-b focus:outline-none w-full ${errors.Position
                                          ? "border-red-500"
                                          : "border-gray-300 focus:border-black"
                                          }`}
                                        // value={formData.Position}
                                        value={selectedPosition}
                                        onClick={toggleDropdownPosition}
                                        readOnly
                                      />
                                    )}
                                  </div>

                                  {errors.Position && (
                                    <p className="text-red-500 text-sm -mt-4">
                                      {errors.Position}
                                    </p>
                                  )}
                                  <MdArrowDropDown
                                    className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0"
                                    onClick={toggleDropdownPosition}
                                  />
                                  {showDropdownPosition && (
                                    <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                                      <p className="p-1 font-medium">
                                        Recent Positions
                                      </p>
                                      <ul>
                                        {positions.map((position) => (
                                          <div
                                            key={position._id}
                                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                            onClick={() =>
                                              handlePositionSelect(position)
                                            }
                                          >
                                            {position.title}
                                          </div>
                                        ))}
                                        <li
                                          className="flex cursor-pointer shadow-md border-b p-1 rounded"
                                          onClick={handleAddNewPositionClick}
                                        >
                                          <IoIosAddCircle className="text-2xl" />
                                          <span>Add New Position</span>
                                        </li>
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Duration */}
                            <div>
                              <div className="flex gap-5 mb-5">
                                <div>
                                  <label
                                    htmlFor="duration"
                                    className="block text-sm font-medium leading-6 text-gray-900 w-36"
                                  >
                                    Duration{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                </div>
                                <div className="relative flex-grow">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      id="duration"
                                      className="border-b focus:outline-none mb-5 w-full border-gray-300 focus:border-black"
                                      value={formData.Duration}
                                      onClick={toggleDropdownDuration}
                                      readOnly
                                    />
                                    <MdArrowDropDown
                                      className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0"
                                      onClick={toggleDropdownDuration}
                                    />
                                  </div>
                                  {showDropdownDuration && (
                                    <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                                      {durations.map((duration) => (
                                        <div
                                          key={duration}
                                          className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                          onClick={() =>
                                            handleDurationSelect(duration)
                                          }
                                        >
                                          {duration}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {showUpgradePopup && (
                                <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-75 z-50">
                                  <div
                                    className="relative bg-white p-5 rounded-lg shadow-lg"
                                    style={{ width: "80%" }}
                                  >
                                    <MdOutlineCancel
                                      className="absolute top-2 right-2 text-gray-500 cursor-pointer"
                                      onClick={closePopup}
                                    />
                                    <div className="flex justify-center">
                                      <div className="text-center">
                                        <p className="mb-4">
                                          {" "}
                                          Upgrade your plan to select a duration{" "}
                                          <br /> longer than 45 minutes.
                                        </p>
                                        <button
                                          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                                          onClick={handleUpgrade}
                                        >
                                          Upgrade
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>


                            {/* No. of Questions */}
                            <div className="flex gap-5 mb-5">
                              <div>
                                <label
                                  htmlFor="NumberOfQuestions"
                                  className="block text-sm font-medium leading-6 text-gray-900  w-36"
                                >
                                  No. of Questions{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                              </div>
                              <div className="flex-grow">
                                <input
                                  type="number"
                                  name="NumberOfQuestions"
                                  value={formData.NumberOfQuestions}
                                  onChange={handleChange}
                                  id="NumberOfQuestions"
                                  min="1"
                                  max="50"
                                  autoComplete="off"
                                  className={`border-b focus:outline-none mb-5 w-full ${errors.NumberOfQuestions
                                    ? "border-red-500"
                                    : "border-gray-300 focus:border-black"
                                    }`}
                                />
                                {errors.NumberOfQuestions && (
                                  <p className="text-red-500 text-sm -mt-4">
                                    {errors.NumberOfQuestions}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Difficulty Level */}
                            <div className="flex gap-5 mb-5">
                              <div>
                                <label
                                  htmlFor="difficulty"
                                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                                >
                                  Difficulty Level{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                              </div>
                              <div className="relative flex-grow">
                                <div className="relative">
                                  <input
                                    type="text"
                                    id="difficulty"
                                    className={`border-b focus:outline-none mb-5 w-full ${errors.DifficultyLevel
                                      ? "border-red-500"
                                      : "border-gray-300 focus:border-black"
                                      }`}
                                    value={formData.DifficultyLevel}
                                    onClick={toggleDropdownDifficulty}
                                    readOnly
                                  />
                                  {errors.DifficultyLevel && (
                                    <p className="text-red-500 text-sm -mt-4">
                                      {errors.DifficultyLevel}
                                    </p>
                                  )}

                                  <MdArrowDropDown
                                    className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0"
                                    onClick={toggleDropdownDifficulty}
                                  />
                                </div>
                                {showDropdownDifficulty && (
                                  <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                                    {difficultyLevels.map((level) => (
                                      <div
                                        key={level}
                                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                        onClick={() =>
                                          handleDifficultySelect(level)
                                        }
                                      >
                                        {level}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Expiry date */}
                            <div className="flex gap-5 mb-5">
                              <div>
                                <label
                                  htmlFor="expiry"
                                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                                >
                                  Expiry Date{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                              </div>
                              <div className="relative flex-grow">
                                <div className="relative">
                                  <div className="border-b border-gray-300 mb-5 w-full">
                                    <DatePicker
                                      selected={startDate}
                                      onChange={handleDateChange}
                                      dateFormat="dd-MM-yyyy"
                                      className="focus:border-black focus:outline-none w-full"
                                      placeholderText=""
                                      minDate={new Date()}
                                      customInput={<CustomInput />}
                                    />
                                  </div>
                                </div>
                                {errors.ExpiryDate && (
                                  <p className="text-red-500 text-sm -mt-4">
                                    {errors.ExpiryDate}
                                  </p>
                                )}
                              </div>
                            </div>


                            <div className="SaveAndScheduleButtons">
                              <button
                                type="submit"
                                onClick={(event) =>
                                  handleCombinedSubmit(event, "/assessment")
                                }
                                className="footer-button"
                              >
                                Save
                              </button>

                              <button type="submit" onClick={(event) => handleCombinedSubmit(event)} className="footer-button">
                                Save & Next
                              </button>
                            </div>
                          </form>
                        </>
                      )}

                      {activeTab === "Questions" && (
                        <div className="overflow-x-auto relative" style={{ overflowX: "auto" }}>
                          <div className="border p-2 flex justify-between bg-gray-200 items-center">
                            <p className="font-bold">Questions</p>
                            <button className="border rounded px-2 py-1 bg-sky-500 text-white text-md" onClick={toggleSidebarForSection}>
                              Add Section
                            </button>
                            <AddSection1
                              isOpen={sidebarOpenForSection}
                              onClose={closeSidebarForSection}
                              onOutsideClick={handleOutsideClickForSection}
                              ref={sidebarRefForSection}
                              position={selectedPosition}
                              onSectionAdded={handleSectionAdded}
                              skills={skillsForSelectedPosition}
                            />
                          </div>
                          {sections.map((section, index) => (
                            <div key={index} className="mt-3 text-md justify-between">
                              <div>
                                <div className="flex justify-between bg-gray-100 p-2">
                                  <div className="flex">
                                    <div className="flex items-center font-bold">
                                      <p className="w-36">{section.SectionName}</p>
                                    </div>
                                    <p className="border-r-gray-600 border"></p>
                                    <div className="flex items-center" onClick={() => { toggleSidebarAddQuestion(section.SectionName); }}>
                                      <p className="rounded px-2 ml-2 cursor-pointer text-blue-300">Add Questions</p>
                                    </div>
                                  </div>
                                  <div className="flex">
                                    <button
                                      type="button"
                                      className="text-xl text-black p-2"
                                      onClick={editingIndex === index ? handleSaveSectionName : () => handleEditSection(index, section.SectionName)}
                                    >
                                      {/* <SlPencil /> */}
                                    </button>
                                    {/* Edit section popup */}
                                    {isEditSectionModalOpen && (
                                      <div
                                        style={{ zIndex: "9999" }}
                                        className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
                                      >
                                        <div className="absolute bg-white p-8 rounded-lg shadow-lg flex justify-center items-center">
                                          <div className="text-center">
                                            <h3 className="mb-5 text-lg font-normal text-gray-500">Edit Section Name</h3>
                                            <input
                                              type="text"
                                              value={editedSectionName}
                                              onChange={(e) => setEditedSectionName(e.target.value)}
                                              className="border p-2 rounded w-full"
                                            />
                                            <div className="flex justify-center gap-4 mt-4">
                                              <button
                                                className="text-gray-600 hover:bg-gray-500 hover:text-white border rounded p-2"
                                                onClick={handleSaveSectionName}
                                              >
                                                Save
                                              </button>
                                              <button
                                                className="text-gray-600 hover:bg-gray-500 border hover:text-white rounded p-2"
                                                onClick={() => setIsEditSectionModalOpen(false)}
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <button type="button" className="text-xl text-black p-2" onClick={() => handleDeleteSectionClick(index, section.SectionName)}>
                                      {/* section delete */}
                                      <FaTrash />
                                    </button>
                                    {/* Delete section confirmation popup */}
                                    {isDeleteSectionConfirmationOpen && (
                                      <div
                                        style={{ zIndex: "9999" }}
                                        className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
                                      >
                                        <div className="absolute flex justify-center items-center bg-white p-8 rounded-lg shadow-lg">
                                          <div className="text-center">
                                            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
                                            <h3 className="mb-5 text-lg font-normal text-gray-500">
                                              Are you sure you want to delete this section?
                                            </h3>
                                            <div className="flex justify-center gap-4">
                                              <button
                                                className="text-gray-600 hover:bg-gray-500 hover:text-white border rounded p-2"
                                                onClick={confirmDeleteSection}
                                              >
                                                Yes, I'm sure
                                              </button>
                                              <button
                                                className="text-gray-600 hover:bg-gray-500 border hover:text-white rounded p-2"
                                                onClick={cancelDeleteSection}
                                              >
                                                No, cancel
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <p className="border-r-gray-600 border"></p>
                                    <div className="flex items-center text-3xl ml-3 mr-3 cursor-pointer" onClick={() => toggleArrow1(index)}>
                                      {toggleStates[index] ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                    </div>
                                  </div>
                                </div>

                                <AddQuestion1
                                  isOpen={sidebarOpenAddQuestion}
                                  onClose={closeSidebarAddQuestion}
                                  onOutsideClick={handleOutsideClickAddQuestion}
                                  ref={sidebarRefAddQuestion}
                                  sectionName={section.SectionName}
                                  onQuestionAdded={handleQuestionAdded}
                                  questionToEdit={questionToEdit}
                                  selectedAssessmentType={selectedAssessmentType}
                                />

                                <div className="p-2" style={{ display: toggleStates[index] ? "block" : "none" }}>
                                  {Array.isArray(questionsBySection[section.SectionName]) &&
                                    questionsBySection[section.SectionName].map((question, questionIndex) => (
                                      <div key={questionIndex} className="border p-2 border-gray-300 mb-2 text-sm">
                                        <div className="flex justify-between">
                                          <div className="flex items-center gap-2">
                                            <hr className={`w-1 h-10 ${getDifficultyColorClass(question.DifficultyLevel)}`} />
                                            <input
                                              type="checkbox"
                                              checked={checkedState[section.SectionName]?.[questionIndex] || false}
                                              onChange={() => handleQuestionSelection(section.SectionName, questionIndex)}
                                            />
                                            <div>{questionIndex + 1}.</div>
                                            <div>{question.Question}</div>
                                          </div>
                                          <div className="flex gap-2">
                                            <p className="border-r-gray-600 border"></p>
                                            <div className="w-40 mt-2">{question.QuestionType}</div>
                                            <p className="border-r-gray-600 border"></p>
                                            <div className="mt-2 w-10">{question.Score}</div>
                                            <button type="button" className="text-xl text-black p-2" onClick={() => handleEditClick(question)}>
                                              {/* <SlPencil /> */}
                                            </button>
                                            <button type="button" className="text-xl text-black p-2" onClick={() => handleDeleteIconClick(questionIndex, section.SectionName)}>
                                              <FaTrash />
                                            </button>
                                            {isDeleteConfirmationOpen && (
                                              <div
                                                style={{ zIndex: "9999" }}
                                                className="fixed top-0 left-0 w-full h-full bg-gray-400 bg-opacity-50 flex justify-center items-center"
                                              >
                                                <div className="absolute bg-white p-8 rounded-lg shadow-lg flex justify-center items-center">
                                                  <div className="text-center">
                                                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
                                                    <h3 className="mb-5 text-lg font-normal text-gray-500">
                                                      Are you sure you want to delete {isBulkDelete ? "the selected questions?" : "this question?"}
                                                    </h3>
                                                    <div className="flex justify-center gap-4">
                                                      <button
                                                        className="text-gray-600 hover:bg-gray-500 hover:text-white border rounded p-2"
                                                        onClick={confirmDeleteQuestion}
                                                      >
                                                        Yes, I'm sure
                                                      </button>
                                                      <button
                                                        className="text-gray-600 hover:bg-gray-500 border hover:text-white rounded p-2"
                                                        onClick={cancelDeleteQuestion}
                                                      >
                                                        No, cancel
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  }

                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="SaveAndScheduleButtons" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button type="button" className="footer-button" onClick={handleBackButtonClick}>
                              Back
                            </button>
                            {checkedCount > 1 && (
                              <button
                                className="text-gray-600 hover:bg-gray-500 hover:text-white border rounded p-2"
                                onClick={handleBulkDeleteClick}
                              >
                                Delete
                              </button>
                            )}
                            <button onClick={handleSaveAll} className="footer-button">
                              Save
                            </button>
                          </div>

                        </div>
                      )}

                    </div>
                  </div>

                  {/* Confirmation Popup */}
                  {isPopupOpen && (
                    <div
                      style={{ zIndex: "9999" }}
                      className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
                    >
                      <div
                        ref={popupRef}
                        className="absolute top-0  bg-white p-8 rounded-lg shadow-lg mt-16"
                      >
                        <div className="text-center">
                          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
                          <h3 className="mb-5 text-lg font-normal text-gray-500">
                            Are you sure you want to delete{" "}
                          </h3>
                          <div className="flex justify-center gap-4">
                            <button
                              className="text-gray-600 hover:bg-gray-500  hover:text-white border rounded p-2"
                              onClick={confirmDelete}
                            >
                              Yes, I'm sure
                            </button>
                            <button
                              className="text-gray-600 hover:bg-gray-500 border hover:text-white rounded p-2"
                              onClick={cancelDelete}
                            >
                              No, cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isPopupOpen2 && (
                    <div
                      style={{ zIndex: "9999" }}
                      className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
                    >
                      <div
                        ref={popupRef}
                        className="absolute top-0  bg-white p-8 rounded-lg shadow-lg mt-16"
                      >
                        <div className="text-center">
                          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete{" "}

                          </h3>
                          <div className="flex justify-center gap-4">
                            <button
                              className="text-gray-600 hover:bg-gray-500  hover:text-white border rounded p-2"
                              onClick={confirmDelete2}
                            >
                              Delete
                            </button>
                            <button
                              className="text-gray-600 hover:bg-gray-500 border hover:text-white rounded p-2"
                              onClick={cancelDelete2}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* {isEditModalOpen && (
                    <Editassesmentquestion
                      sectionName={currentSectionName}
                      isOpen={isEditModalOpen}
                      selectedAssessmentType={selectedAssessmentType}
                      onClose={() => setIsEditModalOpen(false)}
                      selectedQuestion={selectedQuestion}
                    />
                  )} */}

                  {isEditQuestionModalOpen && (
                    <Editassesmentquestion
                      sectionName={currentSectionName}
                      isOpen={isEditQuestionModalOpen}
                      selectedAssessmentType={selectedAssessmentType}
                      onClose={() => setIsEditQuestionModalOpen(false)}
                      selectedQuestion={selectedQuestion}
                      onSave={handleSaveEditedQuestion}
                    />
                  )}

                </div>
              </div>
            </div>
          ) : (
            <>
              {showNewPositionContent && (
                // <AddPositionForm onClose={handleclose} />
                <div></div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditAssessment;