
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { ReactComponent as IoIosArrowDown } from "../../../../icons/IoIosArrowDown.svg";
import { ReactComponent as IoIosArrowUp } from "../../../../icons/IoIosArrowUp.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import MyQuestionList from "./MyQuestionsListPopup.jsx";
import { ReactComponent as MdMoreVert } from "../../../../icons/MdMoreVert.svg";
import Editassesmentquestion from "./QuestionBank-Form.jsx";
import Sidebar from "../QuestionBank-Tab/QuestionBank-Form.jsx";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import toast from "react-hot-toast";
import Popup from "reactjs-popup";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { usePermissions } from "../../../../Context/PermissionsContext.js";
import Cookies from 'js-cookie';
import { FiPlus } from "react-icons/fi";

// const MyQuestionsList = ({ interviewQuestionsList, setInterviewQuestionsList, section, questionBankPopupVisibility }) => {
// changes made by shashank

const MyQuestionsList = ({
  assessmentId,
  sectionName,
  updateQuestionsInAddedSectionFromQuestionBank,
  interviewQuestionsList,
  setInterviewQuestionsList,
  section,
  questionBankPopupVisibility,
  addedSections,
  questionsLimit,
  checkedCount,

  // mansoor
  fromScheduleLater,
  onAddQuestion,
}) => {
  const { objectPermissionscontext } = usePermissions();
  const objectPermissions = useMemo(
    () => objectPermissionscontext.questionBank || {},
    [objectPermissionscontext]
  );
  const myQuestionsListRef = useRef(null);
  const sidebarRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterIsOpen, SetFilterIsOpen] = useState(false);
  const [isQuestionTypeFilterOpen, setIsQuestionTypeFilterOpen] =
    useState(false);
  const [isFilterByDifficultyOpen, setIsFilterByDifficultyOpen] =
    useState(false);
  const {
    interviewerSectionData,
    setInterviewerSectionData,
    myQuestionsList,
    setMyQuestionsList,
    fetchMyQuestionsData,
    getInterviewerQuestions,
  } = useCustomContext();
  const openListPopup = () => {
    if (myQuestionsListRef.current) {
      myQuestionsListRef.current.openPopup();
    }
  };

  const handleEdit = (labelId, labelName) => {
    if (myQuestionsListRef.current) {
      myQuestionsListRef.current.openPopup({
        isEditingMode: true,
        sectionId: labelId,
        label: labelName,
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

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
  const handleLabelChange = (label) => {
    setSelectedLabel(label);
    setIsDropdownOpen(false);
    Cookies.set("lastSelectedLabel", label);
  };
  // Load last selected label from localStorage on mount
  useEffect(() => {
    const savedLabel = Cookies.get("lastSelectedLabel");
    if (savedLabel) {
      setSelectedLabel(savedLabel);
    }
  }, []);


  const [loading, setLoading] = useState(true);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [actionViewMoreSection, setActionViewMoreSection] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);
  const [difficultyLevelFilterArray, setDifficultyLevelFilterArray] = useState([
    {
      level: "Easy",
      isChecked: false,
    },
    {
      level: "Medium",
      isChecked: false,
    },
    {
      level: "Hard",
      isChecked: false,
    },
  ]);
  const [questionTypeFilterArray, setQuestionTypeFilterArray] = useState([
    {
      type: "system",
      isChecked: false,
    },
    {
      type: "custom",
      isChecked: false,
    },
  ]);
  const [selectedQuestionTypeFilterItems, setSelectedQuestionTypeFilterItems] =
    useState([]);
  const [selectedDifficultyItemsToFilter, setSelectedDifficultyItemsToFilter] =
    useState([]);
  const [filteredMyQuestionsList, setFilteredMyQuestionsList] = useState({});

  //changes made by shashank - [09/01/2025]
  const [questionScore, setQuestionScore] = useState("");
  const [questionScoreError, setQuestionScoreError] = useState("");

  useEffect(() => {
    if (myQuestionsList && Object.keys(myQuestionsList).length > 0) {
      // const newMyQuestionsObj = {
      //   ...myQuestionsList,
      //   interviewQuestions: interviewQuestionsList,
      // };
      // console.log("new my questions ojb", newMyQuestionsObj);
      setMyQuestionsList(myQuestionsList);
      setFilteredMyQuestionsList(myQuestionsList);
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // setIsOpen({ ...myQuestionsList });
    setIsOpen({ ...myQuestionsList });
    setLoading(false);
  }, []);

  const filterQuestions = () => {
    if (!selectedDifficultyItemsToFilter || !selectedQuestionTypeFilterItems) {
      setFilteredMyQuestionsList(myQuestionsList);
      return;
    }
    const filtered = Object.keys(myQuestionsList).reduce((acc, key) => {
      acc[key] = myQuestionsList[key].filter((question) => {
        const matchesDifficulty =
          !selectedDifficultyItemsToFilter.length ||
          selectedDifficultyItemsToFilter.includes(
            question.difficultyLevel.toLowerCase()
          );
        const questionType = question.isCustom ? "custom" : "system";
        const matchesQuestionType =
          !selectedQuestionTypeFilterItems.length ||
          selectedQuestionTypeFilterItems.includes(questionType);

        return matchesDifficulty && matchesQuestionType;
      });
      return acc;
    }, {});
    setFilteredMyQuestionsList(filtered);
  };

  useEffect(() => {
    filterQuestions();
  }, [
    selectedQuestionTypeFilterItems,
    setSelectedQuestionTypeFilterItems,
    selectedDifficultyItemsToFilter,
    setSelectedDifficultyItemsToFilter,
    myQuestionsList,
  ]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState({});

  if (loading) {
    return (
      <div className=" fixed text-center top-60 right-0 left-0">Loading...</div>
    );
  }

  // Grouped questions fetched from the backend
  // const groupedQuestions = myQuestionsList;

  const toggleActionSection = (sectionIndex) => {
    // If the clicked section is already open, close it; otherwise, open the clicked section
    setActionViewMoreSection((prev) =>
      prev === sectionIndex ? null : sectionIndex
    );
  };
  const toggleSection = (listName) => {
    setIsOpen((prev) => ({
      ...prev,
      [listName]: !prev[listName],
    }));
  };
  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "border-white rounded-md px-2 py-1 bg-green-300";
      case "Medium":
        return "border-white rounded-md px-2 py-1 bg-orange-300";
      case "Hard":
        return "border-white rounded-md px-2 py-1 bg-red-300";
      default:
        return "";
    }
  };
  const toggleDropdown = (questionId) => {
    setDropdownOpen(dropdownOpen === questionId ? null : questionId);
  };

  const handleEditClick = (question) => {
    setShowNewCandidateContent(question);
    setDropdownOpen(null);
  };
  const handleclose = () => {
    setShowNewCandidateContent(false);
  };


  // added by shashank
  const onClickAddButton = async (question) => {
    console.log("question", question);
    // console.log(question)
    if (section === "assessment") {
      const isDuplicate = addedSections.some(section =>
        section.Questions.some(q => q.questionId === question._id)
      );

      if (isDuplicate) {
        toast.error('This question has already been added to the assessment');
        return;
      }


      if (checkedCount >= questionsLimit) {
        toast.error(`You've reached the maximum limit of ${questionsLimit} questions`);
        return;
      }
      if (question) {
        // Prepare the question data according to your schema
        const questionToAdd = {
          questionId: question._id,
          source: "system", // or "custom"
          snapshot: {
            autoAssessment: question.autoAssessment,
            correctAnswer: question.correctAnswer,
            difficultyLevel: question.difficultyLevel,
            hints: question.hints,
            isActive: question.isActive,
            isAdded: question.isAdded,
            isAutoAssessment: question.isAutoAssessment,
            isInterviewQuestionOnly: question.isInterviewQuestionOnly,
            options: question.options,
            programming: question.programming,
            questionNo: question.questionNo,
            questionText: question.questionText,
            questionType: question.questionType,
            skill: question.skill,
            tags: question.tags,
            technology: question.technology,
          },
          order: question.order || 0,
          customizations: null
        };

        updateQuestionsInAddedSectionFromQuestionBank(sectionName, questionToAdd);
        toast.success('Question added successfully!');

        // 4. Show remaining questions count
        const remaining = questionsLimit - (checkedCount + 1);
        if (remaining > 0) {
          toast.info(`${remaining} questions remaining to reach the limit`);
        } else {
          toast.success('You have reached the required number of questions!');
        }
      }
    }
    // else if (section === "interviewSection") {
    //   const requiredArray = myQuestionsList[listName];
    //   const requiredObj = requiredArray.map((item, index) =>
    //     index === indx ? { ...item, isAdded: true } : item
    //   );
    //   setMyQuestionsList((prev) => ({
    //     ...prev,
    //     [listName]: requiredObj,
    //   }));

    //   const url = `${process.env.REACT_APP_API_URL}/interview-questions/add-question`;

    //   const questionToAdd = {
    //     // id: interviewerSectionData.length + 1,
    //     tenantId: "tenantId1",
    //     ownerId: "ownerId1",
    //     questionId: question._id,
    //     source: "system",
    //     addedBy: "interviewer",
    //     snapshot: {
    //       questionText: question.questionText,
    //       correctAnswer: question.correctAnswer,
    //       options: question.options,
    //       skillTags: question.skill,
    //     },
    //   };
    //   const response = await axios.post(url, questionToAdd);
    //   if (response.data.success) {
    //     getInterviewerQuestions();
    //   }
    //   console.log("response from myquestions list question ", response);
    // }
  };

  const onClickRemoveQuestion = async (listName, question, indx) => {
    const requiredArray = myQuestionsList[listName];
    const requiredObj = requiredArray.map((item, index) =>
      index === indx ? { ...item, isAdded: false } : item
    );
    setMyQuestionsList((prev) => ({
      ...prev,
      [listName]: requiredObj,
    }));
    try {
      const url = `${process.env.REACT_APP_API_URL}/interview-questions/question/${question._id}`;
      const response = await axios.delete(url);
      alert(response.data.message);
      // getInterviewerQuestions()
      const addedQuestionUrl = `${process.env.REACT_APP_API_URL}/interview-questions/question/${question._id}`;
      const response2 = await axios.get(addedQuestionUrl);
      setInterviewerSectionData((prev) => [...prev, response2.data.question]);
    } catch (error) {
      console.log("error in deleting question", error);
    }
  };

  // const groupedQuestions = myQuestionsList;
  const groupedQuestions = filteredMyQuestionsList;

  // const handleDataAdded = () => {
  //   // fetchData();
  //   fetchMyQuestionsData();
  // };

  const onChangeCheckboxInDifficultyLevel = (e, index) => {
    const { checked, value } = e.target;

    // Update selected items
    const updatedFilters = checked
      ? [...selectedDifficultyItemsToFilter, value]
      : selectedDifficultyItemsToFilter.filter((item) => item !== value);

    setSelectedDifficultyItemsToFilter(updatedFilters);

    // Update difficulty level array
    setDifficultyLevelFilterArray((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, isChecked: checked } : item
      )
    );
  };

  const onChangeCheckboxInQuestionType = (e, indx) => {
    const { checked, value } = e.target;
    const updatedFilters = checked
      ? [...selectedQuestionTypeFilterItems, value]
      : selectedQuestionTypeFilterItems.filter((item) => item !== value);

    setSelectedQuestionTypeFilterItems(updatedFilters);
    setQuestionTypeFilterArray((prev) =>
      prev.map((each, index) =>
        index === indx ? { ...each, isChecked: checked } : each
      )
    );
  };

  const FilterSection = (closeFilter) => {
    return (
      <>
        <div className="flex justify-between items-center p-2 border-b-[1px] border-[gray]">
          <h3 className="font-medium">Filters</h3>
          <button onClick={() => closeFilter()}>
            <IoIosCloseCircleOutline />
          </button>
        </div>
        <div className="p-2">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() =>
              setIsFilterByDifficultyOpen(!isFilterByDifficultyOpen)
            }
          >
            <h3 className="font-medium">Difficulty Level</h3>
            <button>
              {isFilterByDifficultyOpen ? <FaAngleUp /> : <FaAngleDown />}
            </button>
          </div>
          <ul>
            {isFilterByDifficultyOpen &&
              difficultyLevelFilterArray.map((level, index) => (
                <li key={index} className="flex gap-2 cursor-pointer">
                  <input
                    checked={level.isChecked}
                    className="w-4 cursor-pointer"
                    value={level.level.toLowerCase()}
                    id={`difficulty-level-${level.level}`}
                    type="checkbox"
                    onChange={(e) =>
                      onChangeCheckboxInDifficultyLevel(e, index)
                    }
                  />
                  <label htmlFor={`difficulty-level-${level.level}`}>
                    {level.level}
                  </label>
                </li>
              ))}
          </ul>
        </div>
        <div className="p-2">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() =>
              setIsQuestionTypeFilterOpen(!isQuestionTypeFilterOpen)
            }
          >
            <h3 className="font-medium">Question Type</h3>
            <button>
              {isQuestionTypeFilterOpen ? <FaAngleUp /> : <FaAngleDown />}
            </button>
          </div>
          <ul>
            {isQuestionTypeFilterOpen &&
              questionTypeFilterArray.map((type, index) => (
                <li key={index} className="flex gap-2 cursor-pointer">
                  <input
                    checked={type.isChecked}
                    className="w-4 cursor-pointer"
                    value={type.type.toLowerCase()}
                    id={`question-type-${type.type}`}
                    type="checkbox"
                    onChange={(e) => onChangeCheckboxInQuestionType(e, index)}
                  />
                  <label htmlFor={`question-type-${type.type}`}>
                    {type.type}
                  </label>
                </li>
              ))}
          </ul>
        </div>
      </>
    );
  };


  // adding interview questions to parent form interview

  const onClickForSchedulelater = async (question) => {
    try {
      const questionToAdd = {
        questionId: question._id,
        source: "system",
        snapshot: question,
        order: "",
        customizations: "",
        // mandatory: mandatoryStatus[item._id] ? "true" : "false",
      };


      if (onAddQuestion) {
        onAddQuestion(questionToAdd,); // Pass the question and index to the parent
      }
      toast.success("Question added successfully");
      //   }
    } catch (error) {
      toast.error("Failed to add question");
      console.error("Error adding question:", error);
    }
  };

// MyQuestionListMain component (UI improvements only)
return (
  <div className="bg-white z-50 w-full px-4 py-2">
    {/* Add Question Button (UI improvement) */}
    <div
      className={`relative block ${section === "interviewerSection" ? "flex justify-end" : ""
        }`}
    >
      <button
        className="text-md absolute top-[-50px] right-0 bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        onClick={toggleSidebar}
      >
        <FiPlus /> Add Question
      </button>
    </div>

    <div
      className={`${section === "interviewerSection" || section === "Popup" ? "" : "mt-2"
        }`}
    >
      {/* List Selection and Filter Section (UI improvement) */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative inline-block w-48">
            <button
              className="px-4 py-2 border border-gray-300 text-sm rounded-md w-full text-left flex justify-between items-center hover:border-gray-400 transition-colors bg-white"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedLabel || "Select a label"}
              <svg
                className={`w-4 h-4 transform ${isDropdownOpen ? "rotate-180" : "rotate-0"
                  } text-gray-500 transition-transform`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-10">
                {Object.keys(groupedQuestions).map((listName, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${selectedLabel === listName
                        ? "bg-blue-50 text-custom-blue font-semibold"
                        : ""
                      }`}
                    onClick={() => handleLabelChange(listName)}
                  >
                    {listName}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="text-md hover:underline text-custom-blue font-semibold flex items-center gap-2"
            onClick={openListPopup}
          >
            <FiPlus size={14} /> Create New List
          </button>
        </div>
        <div className="relative">
          <Popup
            responsive={true}
            trigger={
              <button className="border border-gray-300 rounded-md p-2 hover:border-gray-400 transition-colors">
                {filterIsOpen ? (
                  <LuFilterX className="text-custom-blue" />
                ) : (
                  <FiFilter className="text-custom-blue" />
                )}
              </button>
            }
            onOpen={() => SetFilterIsOpen(true)}
            onClose={() => SetFilterIsOpen(false)}
          >
            {(closeFilter) => (
              <div className="absolute top-3 right-0 w-[300px] rounded-md bg-white border-2 border-gray-300 shadow-lg">
                {FilterSection(closeFilter)}
              </div>
            )}
          </Popup>
        </div>
      </div>

      {/* Empty State (UI improvement) */}
      {!selectedLabel && (
        <div className="flex justify-center items-center h-[calc(100vh-400px)]">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-500">
              Select a label to view questions
            </p>
          </div>
        </div>
      )}

      {/* Grouped Questions (UI improvement) */}
      {Object.entries(groupedQuestions || myQuestionsList).map(
        ([listName, items]) => {
          return (
            selectedLabel === listName && (
              <div key={listName} className="mt-4">
                {/* List Header (UI improvement) */}
                <div
                  className={`flex justify-between items-center bg-custom-blue text-white p-4 rounded-lg ${isOpen[listName] ? "rounded-b-none" : ""
                    }`}
                >
                  <div className="flex items-center w-3/4">
                    <p className="font-semibold truncate">{listName}</p>
                    <span className="ml-4 text-sm bg-blue-700 px-2 py-1 rounded-full">
                      {items.length} questions
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleActionSection(listName)}
                          className="hover:bg-blue-700 p-1 rounded-full transition-colors"
                        >
                          <MdMoreVert className="text-xl" />
                        </button>
                        <button
                          onClick={() => toggleSection(listName)}
                          className="hover:bg-blue-700 p-1 rounded-full ml-2 transition-colors"
                        >
                          {isOpen[listName] ? (
                            <IoIosArrowUp className="text-xl" />
                          ) : (
                            <IoIosArrowDown className="text-xl" />
                          )}
                        </button>
                      </div>
                      {actionViewMoreSection === listName && (
                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          <p
                            className="px-3 py-2 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer transition-colors"
                            onClick={() => {
                              items.forEach((item) => {
                                handleEdit(item.listId, item.label);
                              });
                            }}
                          >
                            Edit List
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Questions List (UI improvement) */}
                {isOpen[listName] && (
                  <div
                    className={`p-4 bg-blue-50 rounded-b-lg border border-t-0 border-gray-300 ${section === "interviewerSection"
                        ? "h-[62vh]"
                        : "h-[calc(100vh-310px)]"
                      } overflow-y-auto`}
                  >
                    {items.map((question, index) => (
                      <div
                        key={index}
                        className="border border-gray-300 mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center p-4 border-b border-gray-300">
                          <div className="flex items-start w-3/4">
                            <span className="font-semibold w-8">{index + 1}.</span>
                            <p className="text-gray-700">
                              {question.questionText}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-md ${question.isCustom
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                                }`}
                              title="Question Type"
                            >
                              {question.isCustom ? "Custom" : "System"}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-md ${getDifficultyStyles(
                                question.difficultyLevel
                              )}`}
                              title="Difficulty Level"
                            >
                              {question.difficultyLevel}
                            </span>

                            {/* Add/Remove buttons for different sections (UI improvement) */}
                            {(section === "Popup" ||
                              section === "interviewerSection") && (
                                <div>
                                  {question.isAdded ? (
                                    <button
                                      onClick={() =>
                                        onClickRemoveQuestion(
                                          listName,
                                          question,
                                          index
                                        )
                                      }
                                      className="rounded-md bg-gray-500 px-3 py-1 text-white text-sm hover:bg-gray-600 transition-colors"
                                    >
                                      Remove
                                    </button>
                                  ) : (
                                    <button
                                      className="bg-custom-blue px-3 py-1 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                      onClick={() =>
                                        onClickAddButton(
                                          listName,
                                          question,
                                          index
                                        )
                                      }
                                    >
                                      Add
                                    </button>
                                  )}
                                </div>
                              )}

                            {section === "assessment" && (
                              <div className="w-[8%] flex justify-center">
                                {addedSections.some(s => s.Questions.some(q => q.questionId === question._id)) ? (
                                  <span className="text-green-600 text-sm font-medium py-1 px-1">
                                    ✓ Added
                                  </span>
                                ) : (
                                  <button
                                    className={`bg-custom-blue w-[80%] py-1 px-1 text-white rounded-md hover:bg-blue-700 transition-colors ${addedSections.reduce((acc, s) => acc + s.Questions.length, 0) >= questionsLimit
                                      ? 'opacity-50 cursor-not-allowed'
                                      : ''
                                      }`}
                                    onClick={() => onClickAddButton(question)}
                                    disabled={
                                      addedSections.reduce((acc, s) => acc + s.Questions.length, 0) >= questionsLimit
                                    }
                                  >
                                    Add
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Add button for schedule later (UI improvement) */}
                            {fromScheduleLater && (
                              <button
                                type="button"
                                className="bg-custom-blue px-3 py-1 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                onClick={() =>
                                  onClickForSchedulelater(question, index)
                                }
                              >
                                Add
                              </button>
                            )}

                            {/* Edit button for custom questions (UI improvement) */}
                            {question.isCustom && (
                              <div className="relative">
                                <button
                                  onClick={() => toggleDropdown(question._id)}
                                  className="hover:bg-gray-100 p-1 rounded-full transition-colors"
                                >
                                  <MdMoreVert className="text-gray-600" />
                                </button>
                                {dropdownOpen === question._id && (
                                  <div className="absolute right-0 mt-1 w-24 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                    <p
                                      className="px-3 py-1 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer transition-colors"
                                      onClick={() => handleEditClick(question)}
                                    >
                                      Edit
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* MCQ Options (UI improvement) */}
                        {question.questionType === "MCQ" &&
                          question.options && (
                            <div className="mb-2 ml-12 mt-2">
                              <ul className="list-none">
                                {(() => {
                                  const isAnyOptionLong = question.options.some(
                                    (option) => option.length > 55
                                  );
                                  return question.options.map((option, idx) => (
                                    <li
                                      key={idx}
                                      className={`${isAnyOptionLong
                                          ? "block w-full"
                                          : "inline-block w-1/2"
                                        } mb-2`}
                                    >
                                      <span className="mr-2 text-gray-500">
                                        {String.fromCharCode(97 + idx)})
                                      </span>
                                      <span className="text-gray-700">
                                        {option}
                                      </span>
                                    </li>
                                  ));
                                })()}
                              </ul>
                            </div>
                          )}

                        {/* Answer (UI improvement) */}
                        <div className="p-4 pt-0">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">
                              Answer:{" "}
                            </span>
                            <span className="text-gray-600">
                              {question.questionType === "MCQ" && question.options
                                ? `${String.fromCharCode(
                                  97 +
                                  question.options.indexOf(
                                    question.correctAnswer
                                  )
                                )}) `
                                : ""}
                              {question.correctAnswer}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          );
        }
      )}
      <MyQuestionList
        ref={myQuestionsListRef}
        fromcreate={true}
        setSelectedLabelnew={setSelectedLabel}
      />
    </div>

    {/* Modals */}
    {showNewCandidateContent && (
      <Editassesmentquestion
        section={section}
        questionBankPopupVisibility={questionBankPopupVisibility}
        onClose={handleclose}
        question={showNewCandidateContent}
        isEdit={true}
      />
    )}

    {sidebarOpen && (
      <Sidebar
        sectionName={sectionName}
        assessmentId={assessmentId}
        updateQuestionsInAddedSectionFromQuestionBank={
          updateQuestionsInAddedSectionFromQuestionBank
        }
        section={section}
        questionBankPopupVisibility={questionBankPopupVisibility}
        onClose={closeSidebar}
        onOutsideClick={handleOutsideClick}
      />
    )}
  </div>
);
};

export default MyQuestionsList;
