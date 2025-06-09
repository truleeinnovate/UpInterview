import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { XCircle, ChevronUp, ChevronDown, Plus, Pencil } from "lucide-react";
import { ReactComponent as IoIosArrowDown } from "../../../../icons/IoIosArrowDown.svg";
import { ReactComponent as IoIosArrowUp } from "../../../../icons/IoIosArrowUp.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import { ReactComponent as MdMoreVert } from "../../../../icons/MdMoreVert.svg";
import MyQuestionList from "./MyQuestionsListPopup.jsx";
import Editassesmentquestion from "./QuestionBank-Form.jsx";
import Sidebar from "../QuestionBank-Tab/QuestionBank-Form.jsx";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import Loading from "../../../../Components/Loading.js";
import { useQuestions } from "../../../../apiHooks/useQuestionBank.js";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";

const removeQuestionFromChild = (questionId, myQuestionsList) => {
  if (!myQuestionsList || typeof myQuestionsList !== "object") return myQuestionsList;
  return Object.keys(myQuestionsList).reduce((acc, key) => {
    acc[key] = myQuestionsList[key].map((question) =>
      question._id === questionId ? { ...question, isAdded: false } : question
    );
    return acc;
  }, {});
};

const MyQuestionsList = ({
  assessmentId,
  sectionName,
  updateQuestionsInAddedSectionFromQuestionBank,
  type,
  questionBankPopupVisibility,
  addedSections,
  questionsLimit,
  checkedCount,
  fromScheduleLater,
  interviewQuestionsLists,
  onAddQuestion,
  handleRemoveQuestion,
  removedQuestionIds = [],
  activeTab,
}) => {
  const { myQuestionsList, isLoading } = useQuestions();
  const myQuestionsListRef = useRef(null);
  const sidebarRef = useRef(null);
  const filterIconRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [actionViewMoreSection, setActionViewMoreSection] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState({});
  const [loading, setLoading] = useState(true);

  // Centralized filter data state
  const [filtrationData, setFiltrationData] = useState([
    {
      id: 1,
      filterType: "QuestionType",
      isOpen: false,
      options: [
        { type: "system", isChecked: false },
        { type: "custom", isChecked: false },
      ],
    },
    {
      id: 2,
      filterType: "Difficulty Level",
      isOpen: false,
      options: [
        { level: "Easy", isChecked: false },
        { level: "Medium", isChecked: false },
        { level: "Hard", isChecked: false },
      ],
    },
  ]);

  // Temporary filter states for popup
  const [tempFiltrationData, setTempFiltrationData] = useState(filtrationData);
  const [selectedQuestionTypeFilterItems, setSelectedQuestionTypeFilterItems] = useState([]);
  const [selectedDifficultyLevelFilterItems, setSelectedDifficultyLevelFilterItems] = useState([]);

  // Sync tempFiltrationData when filtrationData changes
  useEffect(() => {
    setTempFiltrationData(filtrationData);
  }, [filtrationData]);

  // Derive filtered questions using useMemo
  const filteredMyQuestionsList = useMemo(() => {
    if (!myQuestionsList || typeof myQuestionsList !== "object") {
      return {};
    }
    return Object.keys(myQuestionsList).reduce((acc, key) => {
      acc[key] = myQuestionsList[key].filter((question) => {
        const matchesDifficulty =
          !selectedDifficultyLevelFilterItems.length ||
          selectedDifficultyLevelFilterItems.includes(question.difficultyLevel.toLowerCase());
        const questionType = question.isCustom ? "custom" : "system";
        const matchesQuestionType =
          !selectedQuestionTypeFilterItems.length ||
          selectedQuestionTypeFilterItems.includes(questionType);
        return matchesDifficulty && matchesQuestionType;
      });
      return acc;
    }, {});
  }, [myQuestionsList, selectedDifficultyLevelFilterItems, selectedQuestionTypeFilterItems]);

  // Initialize loading and isOpen
  useEffect(() => {
    if (myQuestionsList && typeof myQuestionsList === "object" && Object.keys(myQuestionsList).length > 0) {
      setIsOpen(Object.keys(myQuestionsList).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      setLoading(false);
    } else {
      setIsOpen({});
      setLoading(false);
    }
  }, [myQuestionsList]);

  // Handle label selection from cookies
  useEffect(() => {
    const lastSelectedListId = Cookies.get("lastSelectedListId");
    if (lastSelectedListId && myQuestionsList && typeof myQuestionsList === "object") {
      const allQuestions = Object.values(myQuestionsList).flat();
      const matchingQuestion = allQuestions.find((q) => q.listId === lastSelectedListId);
      if (matchingQuestion) {
        setSelectedLabel(matchingQuestion.label);
      }
    }
  }, [myQuestionsList]);

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
      setActionViewMoreSection({});
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

  const handleLabelChange = (label) => {
    const allQuestions = Object.values(myQuestionsList || {}).flat();
    const matchingQuestion = allQuestions.find((q) => q.label === label);
    if (matchingQuestion) {
      Cookies.set("lastSelectedListId", matchingQuestion.listId);
    }
    setSelectedLabel(label);
    setIsDropdownOpen(false);
  };

  const toggleActionSection = (sectionIndex) => {
    setActionViewMoreSection((prev) => (prev === sectionIndex ? null : sectionIndex));
    setDropdownOpen(null);
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
    setActionViewMoreSection({});
  };

  const handleEditClick = (question) => {
    setShowNewCandidateContent(question);
    setDropdownOpen(null);
  };

  const handleclose = () => {
    setShowNewCandidateContent(false);
  };

  const onClickAddButton = async (question, listName, idx) => {
    // ... (unchanged, keep existing implementation)
  };

  const onClickRemoveQuestion = async (question, listName, idx) => {
    // ... (unchanged, keep existing implementation)
  };

  const onClickForSchedulelater = async (question) => {
    // ... (unchanged, keep existing implementation)
  };

  const toggleFilterSection = (filterId) => {
    setTempFiltrationData((prev) =>
      prev.map((filter) =>
        filter.id === filterId ? { ...filter, isOpen: !filter.isOpen } : { ...filter, isOpen: false }
      )
    );
  };

  const onChangeCheckbox = (filterId, optionIndex) => {
    setTempFiltrationData((prev) =>
      prev.map((filter) => {
        if (filter.id === filterId) {
          const updatedOptions = filter.options.map((option, idx) =>
            idx === optionIndex ? { ...option, isChecked: !option.isChecked } : option
          );
          return { ...filter, options: updatedOptions };
        }
        return filter;
      })
    );
  };

  const FilterSection = () => (
    <div className="p-2">
      {tempFiltrationData.map((filter) => (
        <div key={filter.id} className="p-2">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleFilterSection(filter.id)}
          >
            <h3 className="font-medium">{filter.filterType}</h3>
            <button>{filter.isOpen ? <ChevronUp /> : <ChevronDown />}</button>
          </div>
          {filter.isOpen && (
            <ul className="flex flex-col gap-2 pt-2">
              {filter.options.map((option, index) => (
                <li key={index} className="flex gap-2 cursor-pointer">
                  <input
                    checked={option.isChecked}
                    className="w-4 cursor-pointer"
                    value={
                      filter.filterType === "QuestionType"
                        ? option.type.toLowerCase()
                        : option.level.toLowerCase()
                    }
                    id={`${filter.filterType}-${option.type || option.level}`}
                    type="checkbox"
                    onChange={() => onChangeCheckbox(filter.id, index)}
                  />
                  <label htmlFor={`${filter.filterType}-${option.type || option.level}`}>
                    {option.type || option.level}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );

  const handleApplyFilters = () => {
    setFiltrationData(tempFiltrationData);
    const questionTypeItems = tempFiltrationData
      .find((f) => f.filterType === "QuestionType")
      .options.filter((o) => o.isChecked)
      .map((o) => o.type.toLowerCase());
    const difficultyItems = tempFiltrationData
      .find((f) => f.filterType === "Difficulty Level")
      .options.filter((o) => o.isChecked)
      .map((o) => o.level.toLowerCase());
    setSelectedQuestionTypeFilterItems(questionTypeItems);
    setSelectedDifficultyLevelFilterItems(difficultyItems);
    setIsPopupOpen(false);
  };

  const handleClearAll = () => {
    const clearedFiltrationData = filtrationData.map((filter) => ({
      ...filter,
      options: filter.options.map((option) => ({ ...option, isChecked: false })),
    }));
    setTempFiltrationData(clearedFiltrationData);
    setFiltrationData(clearedFiltrationData);
    setSelectedQuestionTypeFilterItems([]);
    setSelectedDifficultyLevelFilterItems([]);
    setIsPopupOpen(false);
  };

  const groupedQuestions = filteredMyQuestionsList;

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="w-full px-4 py-6 mt-8">
      {/* Question List Skeleton */}
      <div className="mt-[60px] space-y-4">
        <div className="bg-gray-200 h-12 rounded-t-lg animate-pulse"></div>
        <div className="p-4 bg-blue-50 rounded-b-lg border border-t-0 border-gray-200">
          {Array(3).fill().map((_, idx) => (
            <div key={idx} className="border border-gray-200 mb-4 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div className="flex items-center w-3/4">
                  <div className="h-6 w-6 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                  <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 py-2 mt-10 bg-white">
      <div className={`flex items-center justify-between fixed z-40 ${type === "interviewerSection" || type === "assessment" ? "left-12 right-12" : "left-7 right-7"}`}>
        <div className="flex items-center gap-2">
          <div className="relative inline-block w-48">
            <button
              className="px-4 py-2 border border-gray-300 text-sm rounded-md w-full text-left flex justify-between items-center hover:border-gray-400 transition-colors bg-white"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="truncate">{selectedLabel || "Select a label"}</span>
              <svg
                className={`w-4 h-4 ml-2 flex-shrink-0 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : "rotate-0"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-10">
                {Object.keys(groupedQuestions).map((listName, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${selectedLabel === listName
                      ? "bg-blue-50 text-custom-blue font-semibold"
                      : groupedQuestions[listName].length === 0
                        ? "text-gray-400"
                        : ""
                      }`}
                    onClick={() => handleLabelChange(listName)}
                    title={groupedQuestions[listName].length === 0 ? "This label has no questions" : ""}
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate">{listName}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${groupedQuestions[listName].length === 0 ? "text-gray-500 bg-gray-100" : "text-gray-500 bg-gray-100"
                          }`}
                      >
                        {groupedQuestions[listName].length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="text-md hover:underline text-custom-blue font-semibold flex items-center gap-2"
            onClick={openListPopup}
          >
            <Plus size={14} /> Create New List
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-md bg-custom-blue text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            onClick={toggleSidebar}
          >
            <Plus /> Add Question
          </button>
          <div
            ref={filterIconRef}
            onClick={() => setIsPopupOpen(!isPopupOpen)}
            className="border p-2 text-xl rounded-md cursor-pointer"
          >
            {isPopupOpen ? (
              <LuFilterX className="text-custom-blue" />
            ) : (
              <FiFilter className="text-custom-blue" />
            )}
          </div>

        </div>
      </div>

      <div className={`${type === "interviewerSection" || type === "assessment" || activeTab === "MyQuestionsList" ? "mt-[60px]" : ""}`}>
        {selectedLabel && groupedQuestions[selectedLabel]?.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Questions in {selectedLabel}</h3>
              <p className="text-gray-400">This label has no questions. Add questions to this list or select another label.</p>
            </div>
          </div>
        ) : !selectedLabel ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Label Selected</h3>
              <p className="text-gray-400">Please select a label from the dropdown to view questions</p>
            </div>
          </div>
        ) : null}
        {isLoading ? (
          <>
            <SkeletonLoader />
          </>
        ) : (!selectedLabel || groupedQuestions[selectedLabel]?.length > 0) && (
          <>
            {Object.entries(groupedQuestions).map(([listName, items]) => (
              selectedLabel === listName && (
                <div key={listName} className="mt-4">
                  <div
                    className={`flex justify-between items-center bg-custom-blue text-white p-2 rounded-lg ${isOpen[listName] && items.length > 0 ? "rounded-b-none" : ""
                      }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-semibold text-white truncate max-w-xs">{listName}</h3>
                      <span className="bg-white bg-opacity-20 rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {items.length} questions
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="flex items-center">
                          {isOpen[listName] && items.length > 0 && (
                            <button
                              onClick={() => toggleActionSection(listName)}
                              className="p-1 rounded-full transition-colors"
                            >
                              <MdMoreVert className="text-xl" />
                            </button>
                          )}
                          {items.length > 0 && (
                            <button
                              onClick={() => toggleSection(listName)}
                              className="p-1 rounded-full ml-2 transition-colors"
                            >
                              {isOpen[listName] ? (
                                <IoIosArrowUp className="text-xl" />
                              ) : (
                                <IoIosArrowDown className="text-xl" />
                              )}
                            </button>
                          )}
                        </div>
                        {actionViewMoreSection === listName && (
                          <div className="absolute right-10 w-24 bg-white hover:bg-gray-200 rounded-md shadow-lg border border-gray-200 z-10">
                            <p
                              className="px-2 py-1 flex items-center gap-2 text-sm text-gray-700 cursor-pointer transition-colors"
                              onClick={() => {
                                items.forEach((item) => {
                                  handleEdit(item.listId, item.label);
                                });
                              }}
                            >
                              <Pencil className="w-4 h-4 text-blue-600" /> Edit List
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isOpen[listName] && items.length > 0 && (
                    <div
                      className={`p-4 bg-blue-50 rounded-b-lg border border-t-0 border-gray-300 ${type === "interviewerSection" ? "h-[62vh]" : "h-[calc(100vh-250px)]"
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
                              <p className="text-gray-700">{question.questionText}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-md ${question.isCustom ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                                  }`}
                                title="Question Type"
                              >
                                {question.isCustom ? "Custom" : "System"}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-md ${getDifficultyStyles(question.difficultyLevel)}`}
                                title="Difficulty Level"
                              >
                                {question.difficultyLevel}
                              </span>
                              {type === "interviewerSection" && (
                                <div>
                                  {interviewQuestionsLists?.some((q) => q.questionId === question._id) ? (
                                    <button
                                      onClick={() => onClickRemoveQuestion(question, listName, index)}
                                      className="rounded-md bg-gray-500 px-3 py-1 text-white text-sm hover:bg-gray-600 transition-colors"
                                    >
                                      Remove
                                    </button>
                                  ) : (
                                    <button
                                      className="bg-custom-blue px-3 py-1 text-white text-sm rounded-md transition-colors"
                                      onClick={() => onClickAddButton(question, listName, index)}
                                    >
                                      Add
                                    </button>
                                  )}
                                </div>
                              )}
                              {type === "assessment" && (
                                <div>
                                  {addedSections.some((s) => s.Questions.some((q) => q.questionId === question._id)) ? (
                                    <span className="text-green-600 text-sm font-medium py-1 px-1">✓ Added</span>
                                  ) : (
                                    <button
                                      className={`bg-custom-blue px-3 py-1 text-white text-sm rounded-md transition-colors ${addedSections.reduce((acc, s) => acc + s.Questions.length, 0) >= questionsLimit
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                        }`}
                                      onClick={() => onClickAddButton(question, listName, index)}
                                      disabled={addedSections.reduce((acc, s) => acc + s.Questions.length, 0) >= questionsLimit}
                                    >
                                      Add
                                    </button>
                                  )}
                                </div>
                              )}
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
                                        className="px-3 flex items-center gap-2 py-1 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer transition-colors"
                                        onClick={() => handleEditClick(question)}
                                      >
                                        <Pencil className="w-4 h-4 text-blue-600" /> Edit
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          {question.questionType === "MCQ" && question.options && (
                            <div className="mb-2 ml-12 mt-2">
                              <ul className="list-none">
                                {(() => {
                                  const isAnyOptionLong = question.options.some((option) => option.length > 55);
                                  return question.options.map((option, idx) => (
                                    <li key={idx} className={`${isAnyOptionLong ? "block w-full" : "inline-block w-1/2"} mb-2`}>
                                      <span className="mr-2 text-gray-500">{String.fromCharCode(97 + idx)})</span>
                                      <span className="text-gray-700">{option}</span>
                                    </li>
                                  ));
                                })()}
                              </ul>
                            </div>
                          )}
                          <div className="p-4 pt-0">
                            <p className="text-sm break-words whitespace-pre-wrap">
                              <span className="font-medium text-gray-700">Answer: </span>
                              <span className="text-gray-600">
                                {question.questionType === "MCQ" && question.options
                                  ? `${String.fromCharCode(97 + question.options.indexOf(question.correctAnswer))}) `
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
            ))}
          </>
        )}
        <FilterPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onApply={handleApplyFilters}
          onClearAll={handleClearAll}
          filterIconRef={filterIconRef}
        >
          {FilterSection()}
        </FilterPopup>
        <MyQuestionList
          ref={myQuestionsListRef}
          fromcreate={true}
          setSelectedLabelnew={setSelectedLabel}
          setActionViewMoreSection={setActionViewMoreSection}
        />
        {showNewCandidateContent && (
          <Editassesmentquestion
            type={type}
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
            updateQuestionsInAddedSectionFromQuestionBank={updateQuestionsInAddedSectionFromQuestionBank}
            type={type}
            questionBankPopupVisibility={questionBankPopupVisibility}
            onClose={closeSidebar}
            onOutsideClick={handleOutsideClick}
          />
        )}
      </div>
    </div>
  );
};

export default MyQuestionsList;