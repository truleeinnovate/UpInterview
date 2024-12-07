
import { useState, useRef, useEffect, useCallback } from "react";
import EditAssesmentForm from "./EditAssessment";
import axios from "axios";
import React from "react";
import { fetchFilterData } from "../../../../utils/dataUtils.js";
import { usePermissions } from "../../../../PermissionsContext";
import { useMemo } from "react";
import Editassesmentquestion from "./EditAssessmentquestion.jsx";
import AddSection1 from "./AddSection1.jsx";
import AddQuestion1 from "./AddQuestion1.jsx";
import maleImage from "../../../Dashboard-Part/Images/man.png";
import femaleImage from "../../../Dashboard-Part/Images/woman.png";
import genderlessImage from "../../../Dashboard-Part/Images/transgender.png";
import Tooltip from "@mui/material/Tooltip";
import Notification from "../Notifications/Notification.jsx";
// import { IoArrowBack } from "react-icons/io5";

import { ReactComponent as IoIosArrowUp } from "../../../../icons/IoIosArrowUp.svg";
import { ReactComponent as IoIosArrowDown } from "../../../../icons/IoIosArrowDown.svg";
import { ReactComponent as HiArrowsUpDown } from "../../../../icons/HiArrowsUpDown.svg";
import { ReactComponent as SlPencil } from "../../../../icons/SlPencil.svg";
import { ReactComponent as FiMoreHorizontal } from "../../../../icons/FiMoreHorizontal.svg";
import { ReactComponent as IoMdSearch } from "../../../../icons/IoMdSearch.svg";
import { ReactComponent as HiOutlineExclamationCircle } from "../../../../icons/HiOutlineExclamationCircle.svg";
import { ReactComponent as FaTrash } from "../../../../icons/FaTrash.svg";
// import { MdOutlineContentCopy } from "react-icons/md";
import { ReactComponent as MdMoreVert } from "../../../../icons/MdMoreVert.svg";

const AssessmentPopup = ({ assessment, onCloseprofile }) => {
  const [isEditSectionPopupOpen, setIsEditSectionPopupOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);
  const { sharingPermissionscontext } = usePermissions();
  const assessmentPermissions = useMemo(() => sharingPermissionscontext.assessment || {}, [sharingPermissionscontext]);
  const positionPermissions = useMemo(
    () => sharingPermissionscontext.position || {},
    [sharingPermissionscontext]
  );

  const [passScores, setPassScores] = useState({});
  const [toggleStates, setToggleStates] = useState([]);
  const [sidebarOpenAddQuestion, setSidebarOpenAddQuestion] = useState(false);
  const sidebarRefAddQuestion = useRef(null);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [checkedCount, setCheckedCount] = useState(0);
  const [questionsLimit, setQuestionsLimit] = useState(0);
  const [isLimitReachedPopupOpen, setIsLimitReachedPopupOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [editedSectionName, setEditedSectionName] = useState("");

  const toggleSidebarAddQuestion = (SectionName) => {
    if (checkedCount >= questionsLimit) {
      setIsLimitReachedPopupOpen(true);
      return;
    }
    setSidebarOpenAddQuestion(!sidebarOpenAddQuestion);
    setCurrentSectionName(SectionName);
  };

  const closeLimitReachedPopup = () => {
    setIsLimitReachedPopupOpen(false);
  };

  // const [assessment, setAssessmentData] = useState([]);

  // const fetchAssessmentData = useCallback(async () => {
  //   try {
  //     const filteredAssessments = await fetchFilterData(
  //       "assessment",
  //       assessmentPermissions
  //     );

  //     // Filter the assessments to find the one that matches assessmentmain._id
  //     const matchedAssessment = filteredAssessments.find(
  //       (assessment) => assessment._id === assessmentmain._id
  //     );

  //     // Set the matched assessment data
  //     setAssessmentData(matchedAssessment ? [matchedAssessment] : []);
  //     setCurrentPage(0);
  //   } catch (error) {
  //     console.error("Error fetching assessment data:", error);
  //   }
  // }, [assessmentPermissions, assessmentmain._id]);

  const [editingIndex, setEditingIndex] = useState(null);
  const handleEditSection = (index, currentSectionName) => {
    setEditingIndex(index);
    setEditedSectionName(currentSectionName);
    setIsEditSectionModalOpen(true);
  };

  useEffect(() => {
    document.title = "AssessmentProfileDetails";
  }, []);

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    AssessmentTitle: assessment.AssessmentTitle,
    AssessmentType: assessment.AssessmentType,
    Position: assessment.Position,
    Duration: assessment.Duration,
    DifficultyLevel: assessment.DifficultyLevel,
    NumberOfQuestions: assessment.NumberOfQuestions,
    ExpiryDate: assessment.ExpiryDate,
    Sections: assessment.Sections || [],
  });

  const [positions, setPositions] = useState([]);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);

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

  const handleEditClick = () => {
    setEditMode(!editMode);
  };

  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentSectionName, setCurrentSectionName] = useState(null);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState(assessment.AssessmentType || []);

  const handleQuestionEditClick = (question, sectionName) => {
    console.log("Selected Question ttt:", question);
    setSelectedQuestion(question);
    setCurrentSectionName(sectionName);
    setIsEditQuestionModalOpen(true);
    setActionViewMoreQuestion(null);
  };

  const handleQuestionSave = (updatedQuestion) => {
    setFormData((prevData) => {
      const updatedSections = prevData.Sections.map((section) => {
        if (section.SectionName === currentSectionName) {
          return {
            ...section,
            Questions: section.Questions.map((q) =>
              q._id === updatedQuestion._id ? updatedQuestion : q
            ),
          };
        }
        return section;
      });
      return { ...prevData, Sections: updatedSections };
    });
    setIsEditQuestionModalOpen(false);
  };

  const getSectionId = (sectionName) => {
    const section = assessment.Sections.find((sec) => {
      return sec.SectionName === sectionName;
    });
    return section ? section._id : null;
  };

  // const handleQuestionEditClick = (question) => {
  //   setSelectedQuestion(question);
  //   setIsEditQuestionModalOpen(true);
  //   setCurrentSectionName(question.SectionName);
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/assessment/${assessment._id}`,
        formData
      );
      if (response.status === 200) {
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating assessment:", error);
    }
  };

  const handlePositionSelect = (position) => {
    setFormData((prevData) => ({ ...prevData, Position: position.title }));
    setShowPositionDropdown(false);
  };

  const [showMainContent, setShowMainContent] = useState(true);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);

  const handleClose = () => {
    setShowMainContent(true);
    setShowNewCandidateContent(false);
  };

  const [activeTab, setActiveTab] = useState("assessment");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const selectedPosition = formData?.position;
  const [setPositionTitle] = useState("");

  const fetchPositionDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/${selectedPosition}`
      );
      const data = await response.json();
      setPositionTitle(data.title);
    } catch (error) {
      console.error("Error fetching position details:", error);
    }
  }, [selectedPosition, setPositionTitle]);

  useEffect(() => {
    if (selectedPosition) {
      fetchPositionDetails();
    }
  }, [selectedPosition, fetchPositionDetails]);

  const [arrowStates, setArrowStates] = useState([]);

  const toggleArrow = (index) => {
    setArrowStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = [
        {
          id: 1,
          question: "OOP",
          type: "MCQ",
          difficulty: "Easy",
          options: ["A", "B", "C"],
          answer: "A",
        },
      ];
      setArrowStates(new Array(data.length).fill(false));
    };

    fetchData();
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleOutsideClick = useCallback(
    (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    },
    [closeSidebar]
  );

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

  const [candidatesData, setCandidatesData] = useState([]);

  useEffect(() => {
    const fetchCandidatesData = async () => {
      try {
        const candidatePromises = assessment.CandidateIds.map((candidateId) =>
          axios.get(`${process.env.REACT_APP_API_URL}/candidate/${candidateId}`)
        );
        const candidatesResponses = await Promise.all(candidatePromises);
        const candidates = candidatesResponses.map((response) => response.data);
        setCandidatesData(candidates);
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      }
    };
    fetchCandidatesData();
  }, [assessment.CandidateIds]);

  const assessmentTypes = [
    "MCQ",
    "Programming Questions",
    "Short Text(Single line)",
    "Long Text(Paragraph)",
  ];


  const [
    isDeleteQuestionConfirmationOpen,
    setIsDeleteQuestionConfirmationOpen,
  ] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const handleDeleteQuestionClick = (sectionIndex, questionIndex) => {
    setQuestionToDelete({ sectionIndex, questionIndex });
    setIsDeleteQuestionConfirmationOpen(true);
    setActionViewMoreQuestion(null);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      const sectionId = formData.Sections[questionToDelete.sectionIndex]._id;
      const questionId =
        formData.Sections[questionToDelete.sectionIndex].Questions[
          questionToDelete.questionIndex
        ]._id;

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/assessment/${assessment._id}/section/${sectionId}/question/${questionId}`
      );

      setFormData((prevData) => {
        const updatedSections = prevData.Sections.map((section, sIndex) => {
          if (sIndex === questionToDelete.sectionIndex) {
            const updatedQuestions = section.Questions.filter(
              (_, qIndex) => qIndex !== questionToDelete.questionIndex
            );
            return { ...section, Questions: updatedQuestions };
          }
          return section;
        });
        return { ...prevData, Sections: updatedSections };
      });
    } catch (error) {
      console.error("Error deleting question:", error);
    } finally {
      setIsDeleteQuestionConfirmationOpen(false);
      setQuestionToDelete(null);
    }
  };

  const cancelDeleteQuestion = () => {
    setIsDeleteQuestionConfirmationOpen(false);
    setQuestionToDelete(null);
  };

  const handleDeleteQuestion = async (sectionIndex, questionIndex) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirmDelete) return;

    try {
      const sectionId = formData.Sections[sectionIndex]._id;
      const questionId =
        formData.Sections[sectionIndex].Questions[questionIndex]._id;

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/assessment/${assessment._id}/section/${sectionId}/question/${questionId}`
      );

      setFormData((prevData) => {
        const updatedSections = prevData.Sections.map((section, sIndex) => {
          if (sIndex === sectionIndex) {
            const updatedQuestions = section.Questions.filter(
              (_, qIndex) => qIndex !== questionIndex
            );
            return { ...section, Questions: updatedQuestions };
          }
          return section;
        });
        return { ...prevData, Sections: updatedSections };
      });
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const [isDeleteSectionConfirmationOpen, setIsDeleteSectionConfirmationOpen] =
    useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const handleDeleteSectionClick = (index, sectionId) => {
    setSectionToDelete({ index, sectionId });
    setIsDeleteSectionConfirmationOpen(true);
    setActionViewMoreSection(null);
  };

  const confirmDeleteSection = async () => {

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/assessment/${assessment._id}/section/${sectionToDelete.sectionId}`
      );

      setFormData((prevData) => {
        const updatedSections = prevData.Sections.filter(
          (_, i) => i !== sectionToDelete.index
        );
        return { ...prevData, Sections: updatedSections };
      });
    } catch (error) {
      console.error("Error deleting section:", error);
    } finally {
      setIsDeleteSectionConfirmationOpen(false);
      setSectionToDelete(null);
    }
  };

  const cancelDeleteSection = () => {
    setIsDeleteSectionConfirmationOpen(false);
    setSectionToDelete(null);
  };

  const [sidebarOpenForSection, setSidebarOpenForSection] = useState(false);
  const sidebarRefForSection = useRef(null);
  const [matchingSection, setMatchingSection] = useState([]);
  const [position, setPosition] = useState("");
  const [addedSections, setAddedSections] = useState([]);
  const [questionsBySection, setQuestionsBySection] = useState({});
  const [skillsForSelectedPosition, setSkillsForSelectedPosition] = useState(
    []
  );
  const [selectedSkills, setSelectedSkills] = useState([]);

  const toggleSidebarForSection = () => {
    setSidebarOpenForSection(!sidebarOpenForSection);
  };

  const handleSectionAdded = async (newSection) => {
    try {
      console.log("Attempting to add section:", newSection); // Log the section data being sent
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/assessment/${assessment._id}/section`,
        newSection
      );
      console.log("Response from server:", response.data); // Log the response from the server

      const savedSection = response.data;
      setFormData((prevData) => {
        console.log("Current formData.Sections:", prevData.Sections); // Log current sections
        const existingSectionNames = new Set(prevData.Sections.map(s => s.SectionName));
        console.log("Existing section names:", existingSectionNames); // Log existing section names

        if (!existingSectionNames.has(savedSection.SectionName)) {
          const updatedSections = [...prevData.Sections, savedSection];
          console.log("Updated sections:", updatedSections); // Log updated sections
          return {
            ...prevData,
            Sections: updatedSections,
          };
        }
        return prevData;
      });
      setCurrentSection(savedSection);
    } catch (error) {
      console.error("Error adding section:", error.response?.data || error.message);
    }
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

  // const handleQuestionAdded = (questionData) => {
  //   setQuestionsBySection((prevQuestions) => ({
  //     ...prevQuestions,
  //     [currentSectionName]: [
  //       ...(prevQuestions[currentSectionName] || []),
  //       questionData,
  //     ],
  //   }));
  // };

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

  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [sectionToDeleteFrom, setSectionToDeleteFrom] = useState("");
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  const handleDeleteIconClick = (questionIndex, sectionName) => {
    setQuestionToDelete(questionIndex);
    setSectionToDeleteFrom(sectionName);
    setIsBulkDelete(false);
    setIsDeleteConfirmationOpen(true);
  };

  const existingSectionNames = new Set(
    formData.Sections.map((section) => section.SectionName)
  );

  // Combine formData.Sections with addedSections, filtering out duplicates
  const combinedSections = [
    ...formData.Sections,
    ...addedSections
      .filter((sectionName) => !existingSectionNames.has(sectionName))
      .map((sectionName) => ({
        SectionName: sectionName, // Assuming sectionName is a string
        Questions: [], // Initialize Questions as an empty array
      })),
  ];

  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);

  const handleAddQuestionClick = (section) => {
    console.log("Adding question to section 111:", section);
    setCurrentSection(section);
    setIsAddQuestionOpen(true);
  };

  const handleQuestionAdded = async (newQuestion) => {
    console.log("currentSectionId 111:", currentSection._id);
    try {
      const sectionId = currentSection._id;
      if (!sectionId) {
        console.error("Section ID is undefined");
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/assessment/${assessment._id}/section/${sectionId}/question`,
        newQuestion
      );

      setFormData((prevData) => {
        const updatedSections = prevData.Sections.map((section) => {
          if (section._id === sectionId) {
            return {
              ...section,
              Questions: [...section.Questions, newQuestion],
            };
          }
          return section;
        });
        return { ...prevData, Sections: updatedSections };
      });
    } catch (error) {
      console.error("Error adding question:", error);
    } finally {
      setIsAddQuestionOpen(false);
    }
  };

  const [actionViewMoreQuestion, setActionViewMoreQuestion] = useState({});

  const toggleActionQuestion = (sectionName, questionIndex) => {
    setActionViewMoreQuestion((prev) =>
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

  const [actionViewMore, setActionViewMore] = useState({});

  const toggleAction = (sectionName, questionIndex) => {
    setActionViewMore((prev) =>
      prev && prev.sectionName === sectionName && prev.questionIndex === questionIndex
        ? null
        : { sectionName, questionIndex }
    );
  };

  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  // Function to handle delete button click
  const handleDeleteClick = (type, item) => {
    setDeleteType(type);
    setItemToDelete(item);
    setIsDeleteConfirmationOpen(true);
    setActionViewMore(null);
    setActionViewMoreSection(null);
  };

  const renderQuestions = (assessment, arrowStates, toggleArrow) => {

    return (
      <>
        <p
          className="float-end -mt-9 border rounded-sm p-2 bg-custom-blue text-white"
          onClick={toggleSidebarForSection}
        >
          Add Section
        </p>
        <AddSection1
          isOpen={sidebarOpenForSection}
          onClose={closeSidebarForSection}
          onOutsideClick={handleOutsideClickForSection}
          ref={sidebarRefForSection}
          position={position}
          onSectionAdded={handleSectionAdded}
          skills={skillsForSelectedPosition}
          selectedSkills={selectedSkills}
          setSelectedSkills={setSelectedSkills}
          addedSections={addedSections}
          assessmentId={assessment._id}
          isFromProfileDetails={true}
        />

        <div className="mt-10 border rounded-md mb-5">
          <div className="w-full text-left border rounded-md">
            <div className="bg-custom-blue rounded-t-md flex text-white">
              <p className="py-2 px-4 w-[200px] font-semibold">Section Name</p>
              <p className="py-2 px-4 w-[900px] font-semibold">Add Questions</p>
              <p className="py-2 px-4 font-semibold">Action</p>
            </div>
            {combinedSections.length === 0 ? (
              <p className="text-center text-gray-500 mt-4 min-h-[300px]">
                No sections added
              </p>
            ) : (
              combinedSections.map((section, index) => {
                const isDisabled =
                  !section.Questions || section.Questions.length === 0;
                return (
                  <React.Fragment key={index}>
                    <div className="my-5 bg-custom-blue bg-opacity-10 flex">
                      <p className="w-[250px] mt-[10px]">
                        <span className="bg-white px-2 py-1 rounded-sm mx-5">
                          {section.Questions.length}
                        </span>
                        <span>{section.SectionName}</span>
                      </p>
                      <p className="border-r-gray-600 border"></p>
                      <p
                        className="py-2 px-4 w-full ml-5 mt-[1px]"
                        onClick={() => handleAddQuestionClick(section)}
                      >
                        Add Questions
                      </p>
                      <p className="border-r-gray-600 border"></p>
                      <div className="relative mt-2 mx-3">
                        <button onClick={() => toggleActionSection(index)}>
                          <MdMoreVert className="text-3xl" />
                        </button>
                        {actionViewMoreSection &&
                          actionViewMoreSection.sectionIndex === index && (
                            <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-0 mt-2">
                              <div className="space-y-1">
                                <p
                                  className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                                  onClick={() =>
                                    handleEditSectionClick(section)
                                  }
                                >
                                  Edit
                                </p>
                                <p
                                  className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                                  onClick={() =>
                                    handleDeleteSectionClick(index, section._id)
                                  }
                                >
                                  Delete
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                      <p className="border-r-gray-600 border"></p>
                      <div className="w-[80px] mt-[6px]">
                        <div
                          className={`flex items-center justify-center text-3xl ${isDisabled
                            ? "opacity-20 cursor-not-allowed"
                            : "cursor-pointer"
                            }`}
                          onClick={() => !isDisabled && toggleArrow(index)}
                        >
                          {arrowStates[index] ? (
                            <IoIosArrowUp />
                          ) : (
                            <IoIosArrowDown />
                          )}
                        </div>
                      </div>
                    </div>
                    {arrowStates[index] && (
                      <div className="p-2">
                        {section.Questions.length === 0 ? (
                          <p className="text-center text-gray-500">
                            No questions added
                          </p>
                        ) : (
                          section.Questions.map((question, qIndex) => (
                            <div
                              key={question._id}
                              className="border sm:p-0 border-gray-300 mb-2 text-sm"
                            >
                              <div className="flex justify-between">
                                <div className="flex items-center gap-1">
                                  <div className="relative group mx-3">
                                    <hr
                                      className={`w-1 h-10 ${getDifficultyColorClass(
                                        question.DifficultyLevel
                                      )}`}
                                    />
                                    <span className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                                      {question.DifficultyLevel}
                                    </span>
                                  </div>
                                  {/* <input
                       type="checkbox"
                       checked={
                        checkedState[sectionName]?.[questionIndex] || false
                       }
                       onChange={() =>
                        handleQuestionSelection(sectionName, questionIndex)
                       }
                      /> */}
                                  <div className="sm:-mt-[2px]">
                                    {qIndex + 1}.
                                  </div>
                                  <div className="sm:-mt-[2px] sm:w-[40px] sm:overflow-hidden sm:text-ellipsis sm:whitespace-nowrap">
                                    {question.Question}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <p className="border-r-gray-600 border"></p>
                                  <div className="w-40 mt-2 sm:mt-[9px] relative group">
                                    {question.QuestionType}
                                    <span className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                                      Question Type
                                    </span>
                                  </div>
                                  <p className="border-r-gray-600 border"></p>

                                  {/* <div className="mt-2 w-5 sm:mt-[9px] relative group">
                                    {question.Score}
                                    <span className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                                      Score
                                    </span>
                                  </div> */}

                                  <div className="mt-2 w-5 sm:mt-[9px] relative group flex justify-center">
                                    {question.Score}
                                    <span className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                                      Score
                                    </span>
                                  </div>

                                  <p className="border-r-gray-600 border"></p>
                                  <div className="relative mr-2 ml-4 mt-2">
                                    <button
                                      onClick={() =>
                                        toggleActionQuestion(
                                          section.SectionName,
                                          qIndex
                                        )
                                      }
                                      className="focus:outline-none"
                                    >
                                      <MdMoreVert className="text-3xl" />
                                    </button>
                                    {actionViewMoreQuestion &&
                                      actionViewMoreQuestion.sectionName ===
                                      section.SectionName &&
                                      actionViewMoreQuestion.questionIndex ===
                                      qIndex && (
                                        <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-0 mt-2">
                                          <div className="space-y-1">
                                            <p
                                              className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                                              onClick={() =>
                                                handleQuestionEditClick(
                                                  question,
                                                  section.SectionName
                                                )
                                              }
                                            >
                                              Edit
                                            </p>
                                            <p
                                              className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                                              onClick={() =>
                                                handleDeleteQuestionClick(
                                                  index,
                                                  qIndex
                                                )
                                              }
                                            >
                                              Delete
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                                {/* {question.QuestionType ===
                              "Programming Questions" ? (
                              <div>
                                <p className="flex">
                                  <span className="text-sm font-semibold w-[120px]">
                                    Language:{" "}
                                  </span>
                                  <span className="opacity-75 text-sm text-gray-800">
                                    {question.ProgrammingDetails[0]?.language}
                                  </span>
                                </p>
                                <p className="flex">
                                  <span className="text-sm font-semibold w-[120px]">
                                    Code:{" "}
                                  </span>
                                  <span className="opacity-75 text-sm text-gray-800">
                                    <pre>
                                      {question.ProgrammingDetails[0]?.code}
                                    </pre>
                                  </span>
                                </p>
                                {question.ProgrammingDetails[0]?.testCases && (
                                  <div className="flex mb-2">
                                    <div className="font-medium w-[120px]">
                                      Test Cases:{" "}
                                    </div>
                                    <div className="opacity-75">
                                      <ul>
                                        {question.ProgrammingDetails[0].testCases.map(
                                          (testCase, idx) => (
                                            <li key={idx}>
                                              <strong>{testCase.name}:</strong>{" "}
                                              Input: {testCase.input}, Output:{" "}
                                              {testCase.output}, Marks:{" "}
                                              {testCase.marks}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p className="flex sm:mt-2">
                                  <span className="text-sm font-semibold w-[120px]">
                                    Answer:{" "}
                                  </span>
                                  <span className="opacity-75 text-sm text-gray-800">
                                    {question.Answer}
                                  </span>
                                </p>
                                {question.QuestionType === "MCQ" &&
                                  question.Options && (
                                    <div className="flex mb-2">
                                      <div className="font-medium w-[120px]">
                                        Options:{" "}
                                      </div>
                                      <div className="opacity-75">
                                        <ul>
                                          {question.Options.map(
                                            (option, idx) => (
                                              <li key={idx}>
                                                {optionLetters[idx]}. {option}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )} */}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    {/* Edit Section Popup */}
                    {isEditSectionPopupOpen && (
                      <div
                        style={{ zIndex: "9999" }}
                        className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
                      >
                        <div className="absolute top-0 bg-white p-8 rounded-lg shadow-lg mt-16">
                          <div className="text-center">
                            <h3 className="mb-5 text-lg font-normal text-gray-500">
                              Edit Section
                            </h3>
                            <input
                              type="text"
                              name="SectionName"
                              value={sectionToEdit.SectionName}
                              onChange={handleSectionChange}
                              className="mb-4 p-2 border rounded"
                            />
                            <div className="flex justify-center gap-4">
                              <button
                                className="text-gray-600 hover:bg-gray-500 hover:text-white border rounded p-2"
                                onClick={confirmEditSection}
                              >
                                Save
                              </button>
                              <button
                                className="text-gray-600 hover:bg-gray-500 border hover:text-white rounded p-2"
                                onClick={cancelEditSection}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isDeleteQuestionConfirmationOpen && (
                      <div
                        style={{ zIndex: "9999" }}
                        className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
                      >
                        <div className="absolute top-0 bg-white p-8 rounded-lg shadow-lg mt-16">
                          <div className="text-center">
                            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
                            <h3 className="mb-5 text-lg font-normal text-gray-500">
                              Are you sure you want to delete this question?
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

                    {isDeleteSectionConfirmationOpen && (
                      <div
                        style={{ zIndex: "9999" }}
                        className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
                      >
                        <div className="absolute top-0 bg-white p-8 rounded-lg shadow-lg mt-16">
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
                  </React.Fragment>
                );
              })
            )}
            {isAddQuestionOpen && (
              <AddQuestion1
                isOpen={isAddQuestionOpen}
                onClose={() => setIsAddQuestionOpen(false)}
                sectionName={currentSection?.SectionName}
                onQuestionAdded={handleQuestionAdded}
                selectedAssessmentType={assessment.AssessmentType}
                questionsLimit={10}
                checkedCount={currentSection?.Questions.length || 0}
                fromProfileDetails={true}
              />
            )}
          </div>
        </div>
      </>
    );
  };
  const [checkedState, setCheckedState] = useState({});

  const handleQuestionSelection = (sectionName, questionIndex) => {
    setCheckedState((prevState) => {
      const isChecked = !prevState[sectionName]?.[questionIndex];
      const newCheckedState = {
        ...prevState,
        [sectionName]: {
          ...prevState[sectionName],
          [questionIndex]: isChecked,
        },
      };

      const newCheckedCount = Object.values(newCheckedState).reduce(
        (count, section) => {
          return count + Object.values(section).filter(Boolean).length;
        },
        0
      );

      setCheckedCount(newCheckedCount);
      return newCheckedState;
    });
  };

  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleAssessmentTypeSelect = (type) => {
    setFormData((prevData) => {
      const updatedTypes = prevData.AssessmentType.includes(type)
        ? prevData.AssessmentType.filter((item) => item !== type)
        : [...prevData.AssessmentType, type];
      return { ...prevData, AssessmentType: updatedTypes };
    });
    setShowDropdown(false);
  };

  const difficultyLevels = ["Easy", "Medium", "Hard"];
  const [showDropdownDifficulty, setShowDropdownDifficulty] = useState(false);

  const toggleDropdownDifficulty = () => {
    if (editMode) {
      setShowDropdownDifficulty(!showDropdownDifficulty);
    }
  };

  const handleDifficultySelect = (level) => {
    setFormData((prevData) => ({
      ...prevData,
      DifficultyLevel: level,
    }));
    setShowDropdownDifficulty(false);
  };

  const durationOptions = ["30 minutes", "1 hour", "2 hours", "3 hours"];
  const [showDropdownDuration, setShowDropdownDuration] = useState(false);

  const toggleDropdownDuration = () => {
    if (editMode) {
      setShowDropdownDuration(!showDropdownDuration);
    }
  };

  const handleDurationSelect = (duration) => {
    setFormData((prevData) => ({
      ...prevData,
      Duration: duration,
    }));
    setShowDropdownDuration(false);
  };

  const handleEditSectionClick = (section) => {
    setSectionToEdit(section);
    setIsEditSectionPopupOpen(true);
    setActionViewMoreSection(null);
  };

  const handleSectionChange = (e) => {
    const { name, value } = e.target;
    setSectionToEdit((prevSection) => ({
      ...prevSection,
      [name]: value,
    }));
  };

  const confirmEditSection = async () => {
    if (!sectionToEdit) return;

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/assessment/${assessment._id}/section/${sectionToEdit._id}`,
        sectionToEdit
      );

      setFormData((prevData) => {
        const updatedSections = prevData.Sections.map((section) =>
          section._id === sectionToEdit._id ? sectionToEdit : section
        );
        return { ...prevData, Sections: updatedSections };
      });
    } catch (error) {
      console.error("Error updating section:", error);
    } finally {
      setIsEditSectionPopupOpen(false);
      setSectionToEdit(null);
    }
  };

  // const formReload = () => {
  //   fetchAssessmentData();

  // };

  const cancelEditSection = () => {
    setIsEditSectionPopupOpen(false);
    setSectionToEdit(null);
  };

  const [selectedCandidates, setSelectedCandidates] = useState({});

  const handleSelectClick = (candidateId) => {
    setSelectedCandidates((prevSelected) => {
      const updatedSelection = {
        ...prevSelected,
        [candidateId]: !prevSelected[candidateId],
      };
      // Check if any candidate is selected
      const isAnySelected = Object.values(updatedSelection).some(Boolean);
      setIsMainResendEnabled(isAnySelected);
      return updatedSelection;
    });
  };

  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      setIsLinkCopied(true);
      setShowLinkCopiedToast(true);
      setTimeout(() => setShowLinkCopiedToast(false), 2000);
    });
  };

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showLinkCopiedToast, setShowLinkCopiedToast] = useState(false);

  // const handleResend = async () => {
  //   if (Object.keys(selectedCandidates).length === 0) {
  //     setErrors({
  //       ...errors,
  //       Candidate: "Please select at least one candidate.",
  //     });
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const selectedCandidateIds = Object.keys(selectedCandidates).filter(
  //       (id) => selectedCandidates[id]
  //     );
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_API_URL}/send-assessment-link`,
  //       {
  //         candidateEmails: selectedCandidateIds
  //           .map((id) => {
  //             const candidate = candidatesData.find((c) => c._id === id);
  //             return candidate ? candidate.Email : null;
  //           })
  //           .filter((email) => email !== null),
  //         assessmentId: assessment._id,
  //       }
  //     );

  //     if (response.status === 200) {
  //       console.log("Emails sent successfully");
  //       // Show email sent success message
  //       setIsEmailSent(true);
  //       setTimeout(() => setIsEmailSent(false), 2000);
  //       // Clear selected candidates
  //       setSelectedCandidates({});
  //     }
  //   } catch (error) {
  //     console.error("Error sending emails:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleResend = async (candidateId = null) => {
    let candidateEmails = [];

    if (candidateId) {
      // Single candidate resend
      const candidate = candidatesData.find((c) => c._id === candidateId);
      if (!candidate) return;
      candidateEmails = [candidate.Email];
    } else {
      // Multiple candidates resend
      const selectedCandidateIds = Object.keys(selectedCandidates).filter(
        (id) => selectedCandidates[id]
      );

      if (selectedCandidateIds.length === 0) {
        setErrors({
          ...errors,
          Candidate: "Please select at least one candidate.",
        });
        return;
      }

      candidateEmails = selectedCandidateIds
        .map((id) => {
          const candidate = candidatesData.find((c) => c._id === id);
          return candidate ? candidate.Email : null;
        })
        .filter((email) => email !== null);
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/send-assessment-link`,
        {
          candidateEmails,
          assessmentId: assessment._id,
        }
      );

      if (response.status === 200) {
        console.log("Emails sent successfully");
        setIsEmailSent(true);
        setTimeout(() => setIsEmailSent(false), 2000);
        if (!candidateId) {
          // Clear selected candidates only if it's a bulk resend
          setSelectedCandidates({});
          setIsMainResendEnabled(false);
        }
      }
    } catch (error) {
      console.error("Error sending emails:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const [assessmentResults, setAssessmentResults] = useState([]);

  useEffect(() => {
    const fetchAssessmentResults = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/assessmenttest/results/${assessment._id}`
        );
        setAssessmentResults(response.data);
      } catch (error) {
        console.error("Error fetching assessment results:", error);
      }
    };

    if (assessment._id) {
      fetchAssessmentResults();
    }
  }, [assessment._id]);

  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const resizeTextarea = () => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      };

      resizeTextarea();

      textarea.addEventListener("input", resizeTextarea);
      return () => {
        textarea.removeEventListener("input", resizeTextarea);
      };
    }
  }, []);

  // Define the missing state and function for toggling the arrow
  const [isMainResendEnabled, setIsMainResendEnabled] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleCandidateClick = (candidate) => {
    console.log("candidate", candidate);
    setSelectedCandidate(candidate);
  };

  // Define missing state variables
  // const [isArrowUp2, setIsArrowUp2] = useState(false);
  const [isArrowUp2, setIsArrowUp2] = useState(combinedSections.map(() => false));
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [candidateData, setCandidateData] = useState([]);

  // Define missing functions
  // const toggleArrow2 = () => {
  //   setIsArrowUp2(!isArrowUp2);
  // };

  const toggleArrow2 = (sectionIndex) => {
    setIsArrowUp2((prevState) => {
      const newState = [...prevState];
      newState[sectionIndex] = !newState[sectionIndex];
      return newState;
    });
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    // Add logic to filter or search candidates
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFilterIconClick = () => {
    setIsFilterActive(!isFilterActive);
    // Add logic to apply or remove filters
  };


  // const getCandidateLastName = (candidateId) => {
  //   const candidate = candidatesData.find((c) => c._id === candidateId);
  //   return candidate ? candidate.LastName : candidateId;
  // };

  const getCandidateDetails = (candidateId) => {
    const candidate = candidatesData.find((c) => c._id === candidateId);
    return candidate || { LastName: "Name not found", Email: "Email not found" }; // Fallback to default messages if not found
  };

  return (
    <>
      <div>
        {showMainContent && (
          <div className="container mx-auto bg-white">
            <div className="mx-10">
              <div className="flex items-center">
                {isLoading && (
                  <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="flex flex-col items-center">
                      <svg
                        className="animate-spin h-8 w-8 text-white mb-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      <p className="text-white text-lg">Sending emails...</p>
                    </div>
                  </div>
                )}
                {/* <button
                  className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden"
                  onClick={onCloseprofile}
                >
                  <IoArrowBack className="text-2xl" />
                </button> */}
                <p className="text-xl flex items-center">
                  <span
                    className="text-custom-blue font-semibold cursor-pointer"
                    onClick={onCloseprofile}
                  >
                    Assessments /{" "}
                    <span className="text-gray-400">
                      {assessment.AssessmentTitle}
                    </span>
                  </span>
                </p>
                {/* <div className="ml-auto">
                  <button
                    className="bg-custom-blue text-white px-1 py-1 rounded-md"
                    onClick={handleEditClick}
                  >
                    Add Question
                  </button>
                </div> */}
              </div>
              {/* 3 */}
              <div>
                <div className="pt-5 pb-2 sm:hidden md:hidden">
                  <p className="text-xl space-x-10">
                    <span
                      className={`cursor-pointer ${activeTab === "assessment"
                        ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                        : "text-black"
                        }`}
                      onClick={() => handleTabClick("assessment")}
                    >
                      Assessment
                    </span>
                    <span
                      className={`cursor-pointer ${activeTab === "Questions"
                        ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                        : "text-black"
                        }`}
                      onClick={() => handleTabClick("Questions")}
                    >
                      Questions
                    </span>
                    <span
                      className={`cursor-pointer ${activeTab === "Candidates"
                        ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                        : "text-black"
                        }`}
                      onClick={() => handleTabClick("Candidates")}
                    >
                      Candidates
                    </span>
                    <span
                      className={`cursor-pointer ${activeTab === "Results"
                        ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                        : "text-black"
                        }`}
                      onClick={() => handleTabClick("Results")}
                    >
                      Results
                    </span>
                    <span
                      className={`cursor-pointer ${activeTab === "Notifications"
                        ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                        : "text-black"
                        }`}
                      onClick={() => handleTabClick("Notifications")}
                    >
                      Notifications
                    </span>
                  </p>
                </div>

                <div>
                  <select
                    className="w-52 p-2 text-custom-blue border focus:outline-custom-blue border-gray-300 rounded-md mt-5 ml-3 lg:hidden xl:hidden 2xl:hidden"
                    onChange={(e) => handleTabClick(e.target.value)}
                    value={activeTab}
                  >
                    <option value="assessment">Assessment</option>
                    <option value="Questions">Questions</option>
                    <option value="Candidates">Candidates</option>
                    <option value="Results">Results</option>
                    <option value="Notifications">Notifications</option>
                  </select>
                </div>
              </div>
              {activeTab === "assessment" && (
                <div className="mt-5">
                  <div>
                    <div className="rounded-lg p-4 border border-gray-300 mb-5">
                      <div className="flex justify-between">
                        <p className="font-semibold text-lg">
                          Assessment Details:
                        </p>
                        <button
                          className="bg-custom-blue text-white px-3 py-1 rounded-md"
                          onClick={editMode ? handleSave : handleEditClick}
                        >
                          {editMode ? "Save" : "Edit"}
                        </button>
                      </div>
                      <div className="flex mt-3 -mb-3">
                        <div className="w-1/4  sm:w-1/2">
                          <div className="">Assessment Name</div>
                        </div>
                        <div className="w-1/4  sm:w-1/2">
                          <input
                            name="AssessmentTitle"
                            type="text"
                            value={formData.AssessmentTitle}
                            onChange={handleChange}
                            className={` text-gray-500 focus:outline-none  ${editMode
                              ? "border-b border-gray-300"
                              : "border-none"
                              }`}
                            readOnly={!editMode}
                          />
                        </div>

                        <div className="w-1/4  sm:w-1/2">
                          <div className="">Assessment Type</div>
                        </div>
                        <div className="w-1/4 sm:w-1/2 relative">
                          <textarea
                            ref={textareaRef}
                            name="AssessmentType"
                            value={formData.AssessmentType.join(", ")}
                            onClick={() => {
                              if (editMode) {
                                toggleDropdown();
                              }
                            }}
                            className={`text-gray-500 focus:outline-none resize-none ${editMode
                              ? "border-b border-gray-300"
                              : "border-none"
                              }`}
                            readOnly
                          />
                          {showDropdown && editMode && (
                            <div className="absolute z-50 mt-1 w-[180px] bg-white shadow-lg text-sm rounded-sm border">
                              {assessmentTypes.map((type) => (
                                <div
                                  key={type}
                                  className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                  onClick={() =>
                                    handleAssessmentTypeSelect(type)
                                  }
                                >
                                  {type}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex mb-5">
                        <div className="w-1/4  sm:w-1/2">
                          <div>No.of Questions</div>
                        </div>
                        <div className="w-1/4  sm:w-1/2">
                          <input
                            name="Questions"
                            type="number"
                            min="1"
                            value={formData.NumberOfQuestions}
                            onChange={handleChange}
                            className={`text-gray-500 focus:outline-none  ${editMode
                              ? "border-b border-gray-300"
                              : "border-none"
                              }`}
                            readOnly={!editMode}
                          />
                        </div>
                      </div>

                      <p className="font-semibold text-lg">
                        Additional Details:
                      </p>

                      <div className="flex mb-5 mt-3">
                        <div className="w-1/4 sm:w-1/2">
                          <div className="">Position</div>
                        </div>

                        <div className="w-1/4 sm:w-1/2 relative">
                          <input
                            name="Position"
                            type="text"
                            value={formData.Position}
                            onClick={() => {
                              if (editMode) {
                                setShowPositionDropdown(!showPositionDropdown);
                              }
                            }}
                            className={`text-gray-500 focus:outline-none ${editMode
                              ? "border-b border-gray-300"
                              : "border-none"
                              }`}
                            readOnly
                          />
                          {showPositionDropdown && editMode && (
                            <div className="absolute z-50 mt-1 bg-white w-[180px] shadow-lg text-sm rounded-sm border overflow-y-auto max-h-[200px]">
                              {positions.map((position) => (
                                <div
                                  key={position._id}
                                  className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handlePositionSelect(position)}
                                >
                                  {position.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="w-1/4  sm:w-1/2">
                          <div className="">Difficulty Level</div>
                        </div>
                        <div className="relative">
                          <input
                            name="DifficultyLevel"
                            type="text"
                            value={formData.DifficultyLevel}
                            onClick={toggleDropdownDifficulty}
                            className={`text-gray-500 focus:outline-none ${editMode
                              ? "border-b border-gray-300"
                              : "border-none"
                              }`}
                            readOnly
                          />
                          {showDropdownDifficulty && (
                            <div className="absolute z-50 mt-1 w-full bg-white shadow-lg text-sm rounded-sm border">
                              {difficultyLevels.map((level) => (
                                <div
                                  key={level}
                                  className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleDifficultySelect(level)}
                                >
                                  {level}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex mb-5 mt-3">
                        <div className="w-1/4  sm:w-1/2">
                          <div className="">Duration</div>
                        </div>
                        <div className="w-1/4 sm:w-1/2 relative">
                          <input
                            name="Duration"
                            type="text"
                            value={formData.Duration}
                            onClick={toggleDropdownDuration}
                            className={`text-gray-500 focus:outline-none ${editMode
                              ? "border-b border-gray-300"
                              : "border-none"
                              }`}
                            readOnly
                          />
                          {showDropdownDuration && (
                            <div className="absolute z-50 mt-1 w-[180px] bg-white shadow-lg text-sm rounded-sm border">
                              {durationOptions.map((duration) => (
                                <div
                                  key={duration}
                                  className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleDurationSelect(duration)}
                                >
                                  {duration}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="w-1/4 sm:w-1/2">
                          <div className="">Expiry Date</div>
                        </div>
                        <div className="w-1/4 sm:w-1/2">
                          <div className="w-1/4 sm:w-1/2">
                            <input
                              name="ExpiryDate"
                              type="date"
                              value={
                                new Date(formData.ExpiryDate)
                                  .toISOString()
                                  .split("T")[0]
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  ExpiryDate: e.target.value,
                                })
                              }
                              className={`text-gray-500 focus:outline-none  ${editMode
                                ? "border-b border-gray-300"
                                : "border-none"
                                }`}
                              readOnly={!editMode}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="font-semibold text-lg">System Details:</p>

                      <div className="flex mb-5 mt-3">
                        <div className="w-1/4  sm:w-1/2">
                          <div className="">Created By</div>
                        </div>
                        <div className="w-1/4 sm:w-1/2">
                          <textarea
                            value={assessment.CreatedBy}
                            className="text-gray-500 border-none resize-none"
                            readOnly
                            rows={2}
                          />
                        </div>

                        <div className="w-1/4  sm:w-1/2">
                          <div className="">Modified By</div>
                        </div>
                        <div className="w-1/4 sm:w-1/2">
                          <input
                            type="text"
                            value={assessment.modifiedBY}
                            className="text-gray-500 border-none"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "Questions" && (
                <>{renderQuestions(assessment, arrowStates, toggleArrow)}</>
              )}
              {activeTab === "Candidates" && (
                <div className="mt-5">
                  <div>
                    <div className="rounded-lg p-3 border border-gray-300 min-h-[350px]">
                      {candidatesData.length > 0 ? (
                        <>
                          <div className="flex justify-between">
                            <p className="font-semibold text-lg">
                              Selected Candidates:
                            </p>
                            {showLinkCopiedToast && (
                              <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-2 rounded shadow-lg">
                                Link copied to clipboard!
                              </div>
                            )}
                            {isEmailSent && (
                              <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-2 rounded shadow-lg">
                                Email sent successfully!
                              </div>
                            )}

                            <div>
                              <button
                                onClick={() => handleResend()}
                                className={`ml-4 px-3 py-1 rounded-md ${isMainResendEnabled
                                  ? "bg-custom-blue text-white hover:bg-blue-700"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  }`}
                                disabled={!isMainResendEnabled}
                              >
                                Resend
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-6">
                            {candidatesData.map((candidate) => {
                              const link = `http://localhost:3000/assessmenttest?assessmentId=${assessment._id}&candidateId=${candidate._id}`;

                              return (
                                <div
                                  key={candidate._id}
                                  className="border border-custom-blue rounded-lg overflow-hidden mb-4 w-full shadow-md"
                                >
                                  {/* Header with expiry date and status */}
                                  <div className="bg-gray-50 p-2 flex justify-between items-center border-b border-gray-200">
                                    <span className="text-gray-700 text-sm font-medium">
                                      Exp.Date:{" "}
                                      {
                                        new Date(formData.ExpiryDate)
                                          .toISOString()
                                          .split("T")[0]
                                      }
                                    </span>
                                    <div className="gap-3">
                                      <span className="bg-gray-200 text-green-500 text-xs font-semibold border border-white px-2 py-1 rounded mr-4">
                                        Sent
                                      </span>
                                      <button
                                        className={`py-1 px-3 text-xs rounded ${selectedCandidates[candidate._id]
                                          ? "bg-teal-600 text-white"
                                          : "text-custom-blue border"
                                          }`}
                                        onClick={() =>
                                          handleSelectClick(candidate._id)
                                        }
                                      >
                                        {selectedCandidates[candidate._id]
                                          ? "Selected"
                                          : "Select"}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Grid layout for image, content, and button */}
                                  <div className="grid grid-cols-4 items-center p-2 gap-2">
                                    {/* Profile image */}
                                    {candidate.imageUrl ? (
                                      <img
                                        src={candidate.imageUrl}
                                        alt="Candidate"
                                        className="w-14 h-14 rounded"
                                      />
                                    ) : candidate.Gender === "Male" ? (
                                      <img
                                        src={maleImage}
                                        alt="Male Avatar"
                                        className="w-14 h-14 rounded"
                                      />
                                    ) : candidate.Gender === "Female" ? (
                                      <img
                                        src={femaleImage}
                                        alt="Female Avatar"
                                        className="w-14 h-14 rounded"
                                      />
                                    ) : (
                                      <img
                                        src={genderlessImage}
                                        alt="Other Avatar"
                                        className="w-20 h-20 rounded"
                                      />
                                    )}

                                    {/* Candidate information spanning 2 columns */}
                                    <div className="col-span-2">
                                      <h3 className="font-semibold text-xs mb-1">
                                        {candidate.LastName}
                                      </h3>
                                      <p className="text-xs text-gray-600 mb-1">
                                        {candidate.Email}
                                      </p>
                                      <p className="text-xs text-gray-600 mb-1">
                                        {candidate.Phone}
                                      </p>
                                      <p className="text-xs text-gray-600 mb-1">
                                        {candidate.Position}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 items-center p-2 gap-2">
                                    <div className="col-span-3 flex justify-end">
                                      <a
                                        href={link}
                                        className="text-custom-blue border p-2 rounded border-gray-300 text-sm underline truncate"
                                      >
                                        {link}
                                      </a>
                                    </div>
                                    <div className="col-span-1 flex justify-end items-center">
                                      {/* <MdOutlineContentCopy
                                        onClick={() => handleCopyLink(link)}
                                        className={`ml-1 cursor-pointer ${isLinkCopied
                                          ? "text-custom-blue"
                                          : "text-gray-500"
                                          }`}
                                      /> */}
                                      <p
                                        className="text-xs text-gray-500 ml-3 border p-1 rounded cursor-pointer hover:bg-gray-200"
                                        onClick={() =>
                                          handleResend(candidate._id)
                                        }
                                      >
                                        Resend
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <p className="text-center text-gray-500">
                          No data found
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Results" && (
                <div>
                  {selectedCandidate ? (
                    <>
                      <div className="sm:mx-5 mt-4 sm:mt-5 border rounded-lg w-full mb-7">
                        <div className="grid grid-cols-4 mb-14">
                          {/* left side */}
                          <div className="col-span-1 mt-2 ">
                            <div className="flex mb-2 mx-3">
                              <button
                                onClick={() => setSelectedCandidate(null)}
                                className="flex items-center"
                              >
                                {/* <IoArrowBack className="mr-2" /> */}
                              </button>
                              <p className="text-custom-blue font-semibold text-lg items-center">
                                Results
                              </p>
                            </div>
                            <div className="mx-3 border rounded-lg h-full">
                              <div className="text-center mt-3 border-b">
                                <div className="flex justify-center">
                                  {selectedCandidate.imageUrl ? (
                                    <img
                                      src={selectedCandidate.imageUrl}
                                      alt="Candidate"
                                      className="w-32 h-32 rounded"
                                    />
                                  ) : selectedCandidate.Gender === "Male" ? (
                                    <img
                                      src={maleImage}
                                      alt="Male Avatar"
                                      className="w-32 h-32 rounded"
                                    />
                                  ) : selectedCandidate.Gender === "Female" ? (
                                    <img
                                      src={femaleImage}
                                      alt="Female Avatar"
                                      className="w-32 h-32 rounded"
                                    />
                                  ) : (
                                    <img
                                      src={genderlessImage}
                                      alt="Other Avatar"
                                      className="w-32 h-32 rounded"
                                    />
                                  )}
                                </div>
                                <div className="mt-4 mb-5">
                                  <p className="text-lg font-semibold text-custom-blue">
                                    {" "}
                                    {
                                      getCandidateDetails(
                                        selectedCandidate.candidateId
                                      ).LastName
                                    }
                                  </p>
                                  <p className="text-base font-medium text-black">
                                    {
                                      getCandidateDetails(
                                        selectedCandidate.candidateId
                                      ).Email
                                    }
                                  </p>
                                  <p className="text-base font-medium text-black">
                                    Experience-1 year
                                  </p>
                                </div>
                              </div>
                              <div className="m-3 text-sm flex gap-2">
                                <div>
                                  <p className="text-gray-500 flex justify-between">
                                    Assessment Name :{" "}
                                  </p>
                                  <p className="text-gray-500 flex justify-between">
                                    Total Questions :{" "}
                                  </p>
                                  <p className="text-gray-500 flex justify-between">
                                    Answered Questions :{" "}
                                  </p>
                                  <p className="text-gray-500 flex justify-between">
                                    Total Score :{" "}
                                  </p>
                                  <p className="text-gray-500 flex justify-between">
                                    Overall Score :{" "}
                                  </p>
                                  <p className="text-gray-500 flex justify-between">
                                    Pass Score :{" "}
                                  </p>
                                  <p className="text-gray-500 flex justify-between">
                                    Status :{" "}
                                  </p>
                                  <p className="text-gray-500 flex justify-between">
                                    Completed/Duration :{" "}
                                  </p>
                                  <p className="text-gray-500 flex justify-between">
                                    Date & Time :{" "}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-black">
                                    {assessment.AssessmentTitle}
                                  </p>
                                  <p className="text-black">
                                    {selectedCandidate.totalQuestions}
                                  </p>
                                  <p className="text-black">
                                    {selectedCandidate.answeredQuestions}
                                  </p>
                                  <p className="text-black">
                                    {selectedCandidate.totalScore}
                                  </p>
                                  <p className="text-black">
                                    {selectedCandidate.answeredQuestionsScore}
                                  </p>
                                  <p className="text-black">
                                    {selectedCandidate.passScore}
                                  </p>
                                  <p className="text-black">
                                    {selectedCandidate.answeredQuestionsScore >= selectedCandidate.passScore ? "Pass" : "Fail"}
                                  </p>
                                  <p className="text-black">
                                    {selectedCandidate.timeSpent}/30:00 min
                                  </p>
                                  <p className="text-black">
                                    {new Date(
                                      selectedCandidate.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>

                              </div>
                            </div>
                          </div>
                          {/* Right side */}
                          <div className="col-span-3 mb-7">
                            <div className="mt-11 mr-3">
                              {/* {combinedSections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="mb-2 border rounded-lg">
                                  <div className="flex space-x-8 p-2 text-md justify-between items-center bg-custom-blue text-white font-semibold pr-5 cursor-pointer rounded-md">
                                    <p className="pr-4 ml-2 w-1/4">
                                      {section.SectionName}
                                    </p>
                                    <p className="px-2 ml-4 text-center text-xs">
                                      Answered Questions/Total Questions: {section.answeredQuestions}/{section.totalQuestions}
                                    </p>
                                    <p className="px-2 ml-4 text-center text-xs">
                                      Pass Score/Total Score: {section.passScore}/{section.totalScore}
                                    </p>
                                    <div
                                      className="flex items-center text-3xl ml-3 mr-3"
                                      onClick={() => toggleArrow2(sectionIndex)}
                                    >
                                      {isArrowUp2[sectionIndex] ? (
                                        <IoIosArrowUp />
                                      ) : (
                                        <IoIosArrowDown />
                                      )}
                                    </div>
                                  </div>
                                  {isArrowUp2[sectionIndex] && (
                                    <div className="bg-white">
                                      <div className="mb-4">
                                        <div className="font-medium text-xl mx-3 mt-3">
                                          Assessment Questions
                                        </div>
                                        <div className="">
                                          {section.Questions &&
                                            section.Questions.map(
                                              (question, index) => {
                                                // Ensure assessmentResults is defined and has questions
                                                const result =
                                                  assessmentResults?.find(
                                                    (res) =>
                                                      res.questions?.some(
                                                        (q) =>
                                                          q.questionId ===
                                                          question._id
                                                      )
                                                  );
                                                const questionResult =
                                                  result?.questions?.find(
                                                    (q) =>
                                                      q.questionId ===
                                                      question._id
                                                  );

                                                return (
                                                  <div
                                                    key={`${sectionIndex}-${index}`}
                                                  >
                                                    <div className="p-3">
                                                      <p className="font-semibold">
                                                        {index + 1}.{" "}
                                                        {question.Question}
                                                      </p>
                                                      {questionResult ? (
                                                        <>
                                                          <p className="text-gray-500">
                                                            Correct Answer:{" "}
                                                            <span className="text-black">
                                                              {
                                                                questionResult.correctAnswer
                                                              }
                                                            </span>
                                                          </p>
                                                          <p className="text-gray-500">
                                                            Answer:{" "}
                                                            <span className="text-black">
                                                              {
                                                                questionResult.givenAnswer
                                                              }
                                                            </span>
                                                          </p>
                                                          <p className="text-gray-500">
                                                            Marks:{" "}
                                                            <span className="text-black">
                                                              {
                                                                questionResult.marks
                                                              }
                                                            </span>
                                                          </p>
                                                          <p className="text-gray-500">
                                                            Score:{" "}
                                                            <span className="text-black">
                                                              {
                                                                questionResult.score
                                                              }
                                                            </span>
                                                          </p>
                                                        </>
                                                      ) : (
                                                        <p className="text-red-500">
                                                          No result found for
                                                          this question.
                                                        </p>
                                                      )}
                                                    </div>
                                                    {index <
                                                      section.Questions.length -
                                                      1 && (
                                                        <div className="border-b pb-4"></div>
                                                      )}
                                                  </div>
                                                );
                                              }
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))} */}
                              {combinedSections.map((section, sectionIndex) => {
                                // Find the corresponding section data from the assessment result
                                const resultSection = selectedCandidate?.sections?.find(
                                  s => s.sectionId.toString() === section._id.toString()
                                );
                                return (
                                  <div key={sectionIndex} className="mb-2 border rounded-lg">
                                    <div className="flex space-x-8 p-2 text-md justify-between items-center bg-custom-blue text-white font-semibold pr-5 cursor-pointer rounded-md">
                                      <p className="pr-4 ml-2 w-1/4">
                                        {section.SectionName}
                                      </p>
                                      <p className="px-2 ml-4 text-center text-xs">
                                        Answered Questions/Total Questions: {resultSection ? `${resultSection.answeredQuestions}/${resultSection.totalQuestions}` : '0/0'}
                                      </p>
                                      <p className="px-2 ml-4 text-center text-xs">
                                        Pass Score/Total Score: {resultSection ? `${resultSection.passScore}/${resultSection.totalScore}` : '0/0'}
                                      </p>
                                      <div
                                        className="flex items-center text-3xl ml-3 mr-3"
                                        onClick={() => toggleArrow2(sectionIndex)}
                                      >
                                        {isArrowUp2[sectionIndex] ? (
                                          <IoIosArrowUp />
                                        ) : (
                                          <IoIosArrowDown />
                                        )}
                                      </div>
                                    </div>
                                    {isArrowUp2[sectionIndex] && (
                                      <div className="bg-white">
                                        <div className="mb-4">
                                          <div className="font-medium text-xl mx-3 mt-3">
                                            Assessment Questions
                                          </div>
                                          <div className="">
                                            {section.Questions &&
                                              section.Questions.map(
                                                (question, index) => {
                                                  const result =
                                                    assessmentResults?.find(
                                                      (res) =>
                                                        res.questions?.some(
                                                          (q) =>
                                                            q.questionId ===
                                                            question._id
                                                        )
                                                    );
                                                  const questionResult =
                                                    result?.questions?.find(
                                                      (q) =>
                                                        q.questionId ===
                                                        question._id
                                                    );

                                                  return (
                                                    <div
                                                      key={`${sectionIndex}-${index}`}
                                                    >
                                                      <div className="p-3">
                                                        <p className="font-semibold">
                                                          {index + 1}.{" "}
                                                          {question.Question}
                                                        </p>
                                                        {questionResult ? (
                                                          <>
                                                            <p className="text-gray-500">
                                                              Correct Answer:{" "}
                                                              <span className="text-black">
                                                                {
                                                                  questionResult.correctAnswer
                                                                }
                                                              </span>
                                                            </p>
                                                            <p className="text-gray-500">
                                                              Answer:{" "}
                                                              <span className="text-black">
                                                                {
                                                                  questionResult.givenAnswer
                                                                }
                                                              </span>
                                                            </p>
                                                            <p className="text-gray-500">
                                                              Marks:{" "}
                                                              <span className="text-black">
                                                                {
                                                                  questionResult.marks
                                                                }
                                                              </span>
                                                            </p>
                                                            <p className="text-gray-500">
                                                              Score:{" "}
                                                              <span className="text-black">
                                                                {
                                                                  questionResult.score
                                                                }
                                                              </span>
                                                            </p>
                                                          </>
                                                        ) : (
                                                          <p className="text-red-500">
                                                            No result found for
                                                            this question.
                                                          </p>
                                                        )}
                                                      </div>
                                                      {index <
                                                        section.Questions.length -
                                                        1 && (
                                                          <div className="border-b pb-4"></div>
                                                        )}
                                                    </div>
                                                  );
                                                }
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <table className="text-left w-full border-collapse border-gray-300 mb-14 mt-5">
                      <thead className="bg-custom-bg sticky top-0 z-10 text-xs">
                        <tr>
                          <th scope="col" className="py-3 px-6">
                            Candidate Name
                          </th>
                          <th scope="col" className="py-3 px-6">
                            No.Of Answered Questions
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Duration
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Progress Score/Total Score
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Pass Score
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Test Date
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Status
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessmentResults.length > 0 ? (
                          assessmentResults.map((result, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-200 text-xs"
                            >
                              <td
                                className="py-3 px-6 cursor-pointer"
                                onClick={() => handleCandidateClick(result)}
                              >
                                {
                                  getCandidateDetails(result.candidateId)
                                    .LastName
                                }
                              </td>
                              <td className="py-3 px-6">
                                {result.answeredQuestions}/
                                {result.totalQuestions}
                              </td>
                              <td className="py-3 px-6">
                                {result.timeSpent}/30:00 min
                              </td>
                              <td className="py-3 px-6">
                                {result.answeredQuestionsScore}/
                                {result.totalScore}
                              </td>
                              <td className="py-3 px-6">{result.passScore}</td>
                              <td className="py-3 px-6">
                                {new Date(
                                  result.createdAt
                                ).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-6">
                                {result.answeredQuestionsScore >= result.passScore ? "Pass" : "Fail"}
                              </td>
                              <td className="py-2 px-6 relative">
                                <button>
                                  <FiMoreHorizontal className="text-3xl" />
                                </button>
                                {actionViewMore === result._id && (
                                  <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                    <div className="space-y-1">
                                      <p className="hover:bg-gray-200 p-1 rounded pl-3">
                                        View
                                      </p>
                                      <p className="hover:bg-gray-200 p-1 rounded pl-3">
                                        Edit
                                      </p>
                                      <p className="hover:bg-gray-200 p-1 rounded pl-3">
                                        Schedule
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center text-gray-500 py-3"
                            >
                              No data found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === "Notifications" && (
                <Notification isassesmentProfileDetails={true} />
              )}
            </div>
          </div>
        )}

        {/* {sidebarOpenAddQuestion && (
     <AddQuestion1
      isOpen={sidebarOpenAddQuestion}
      onClose={onCloseprofile}
      onSectionAdded={handleSectionAdded}
      addedSections={addedSections}
      assessmentId={assessment._id}
      fromProfileDetails={true}
     />
    )} */}

        {isEditQuestionModalOpen && (
          <Editassesmentquestion
            sectionName={currentSectionName}
            sectionId={getSectionId(currentSectionName)}
            isOpen={isEditQuestionModalOpen}
            selectedAssessmentType={selectedAssessmentType}
            onClose={() => setIsEditQuestionModalOpen(false)}
            selectedQuestion={selectedQuestion}
            onSave={handleQuestionSave}
            isFromProfileDetails={true}
            assessment={assessment}
          // formReload={formReload}
          />
        )}

        {showNewCandidateContent && (
          <EditAssesmentForm onClose={handleClose} candidate1={assessment} />
        )}
      </div>
    </>
  );
};

export default AssessmentPopup;
