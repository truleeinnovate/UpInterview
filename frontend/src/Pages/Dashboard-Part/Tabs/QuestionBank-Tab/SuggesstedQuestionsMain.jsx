// v1.0.0 ------ Venkatesh--- added loading state and skeleton loader
// v1.0.1 - Ashok - Improved loader animation from animate-pulse to shimmer (custom css styles)

import React, { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Tooltip } from "@mui/material";
import { ChevronUp, ChevronDown, Search, X } from "lucide-react";
import { ReactComponent as IoIosArrowBack } from "../../../../icons/IoIosArrowBack.svg";
import { ReactComponent as IoIosArrowForward } from "../../../../icons/IoIosArrowForward.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
import { useQuestions } from "../../../../apiHooks/useQuestionBank.js";
import MyQuestionList from "./MyQuestionsListPopup.jsx";

const SuggestedQuestionsComponent = ({
  sectionName,
  updateQuestionsInAddedSectionFromQuestionBank,
  type,
  addedSections,
  questionsLimit,
  checkedCount,
  fromScheduleLater,
  onAddQuestion,
  handleRemoveQuestion,
  handleToggleMandatory,
  interviewQuestionsList,
  interviewQuestionsLists,
  removedQuestionIds = [],
}) => {
  const { suggestedQuestions, isLoading } = useQuestions();
  console.log("suggestedQuestions", suggestedQuestions)
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionInput, setQuestionInput] = useState("");
  const filterIconRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const itemsPerPage = 10;
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropdownValue, setDropdownValue] = useState("Interview Questions");
  const [isInterviewTypeOpen, setIsInterviewTypeOpen] = useState(false);


  const [filtrationData, setFiltrationData] = useState([
    {
      id: 1,
      filterType: "QuestionType",
      isOpen: false,
      options: [
        { type: "Interview Question", isChecked: false },
        { type: "MCQ", isChecked: false },
        { type: "Short Text", isChecked: false },
        { type: "Long Text", isChecked: false },
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

  const [questionTypeFilterItems, setQuestionTypeFilterItems] = useState([]);
  const [difficultyLevelFilterItems, setDifficultyLevelFilterItems] = useState(
    []
  );
  const [mandatoryStatus, setMandatoryStatus] = useState({});

  // Temporary states for filter popup
  const [tempQuestionTypeFilterItems, setTempQuestionTypeFilterItems] =
    useState([]);
  const [tempDifficultyLevelFilterItems, setTempDifficultyLevelFilterItems] =
    useState([]);
  const [tempSelectedSkills, setTempSelectedSkills] = useState([]);
  const [tempSkillInput, setTempSkillInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tempFiltrationData, setTempFiltrationData] = useState(
    JSON.parse(JSON.stringify(filtrationData))
  );

  // Filter questions
  const suggestedQuestionsFilteredData = useMemo(() => {
    if (!suggestedQuestions || suggestedQuestions.length === 0) return [];
    return suggestedQuestions.filter((question) => {
      // Unified search: check both question text and tags
      const matchesSearch =
        !searchInput ||
        question.questionText
          .toLowerCase()
          .includes(searchInput.toLowerCase()) ||
        question.tags.some((tag) =>
          tag.toLowerCase().includes(searchInput.toLowerCase())
        );

      const matchesType =
        questionTypeFilterItems.length === 0 ||
        questionTypeFilterItems.includes(question.questionType.toLowerCase());

      const matchesDifficultyLevel =
        difficultyLevelFilterItems.length === 0 ||
        difficultyLevelFilterItems.includes(
          question.difficultyLevel.toLowerCase()
        );

      //<----v1.0.2-----Venkatesh---- Filter by Interview vs Assignment selection
      // "Interview Questions" => show only questions where isInterviewQuestionOnly === true
      // "Assignment Questions" => show only questions where isInterviewQuestionOnly === false
      const matchesInterviewOnly =
        dropdownValue === "Interview Questions"
          ? question.isInterviewQuestionOnly === true
          : question.isInterviewQuestionOnly === false;

      return matchesSearch && matchesType && matchesDifficultyLevel && matchesInterviewOnly;
      //----v1.0.2----->
    });
  }, [
    suggestedQuestions,
    searchInput,
    questionTypeFilterItems,
    difficultyLevelFilterItems,
    dropdownValue,
  ]);

  // Pagination
  const totalPages = Math.ceil(
    suggestedQuestionsFilteredData.length / itemsPerPage
  );
  const paginatedData = useMemo(
    () =>
      suggestedQuestionsFilteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [suggestedQuestionsFilteredData, currentPage]
  );

  // Update mandatory status
  useEffect(() => {
    setMandatoryStatus((prev) => {
      const updatedStatus = { ...prev };
      (interviewQuestionsLists || interviewQuestionsList || []).forEach(
        (question) => {
          updatedStatus[question.questionId || question.id] =
            question.snapshot?.mandatory === "true" || false;
        }
      );
      return updatedStatus;
    });
  }, [interviewQuestionsList, interviewQuestionsLists]);

  // // Filter tags for skill dropdown
  // const filteredTags = useMemo(() => {
  //     if (!skillInput || !suggestedQuestions) return [];
  //     const allTags = new Set();
  //     suggestedQuestions.forEach((question) => {
  //         question.tags.forEach((tag) => allTags.add(tag.toLowerCase()));
  //     });
  //     return [...allTags].filter((tag) => tag.includes(skillInput.toLowerCase()));
  // }, [skillInput, suggestedQuestions]);

  // Handlers
  const handleToggle = (questionId, item) => {
    setMandatoryStatus((prev) => {
      const newStatus = !prev[questionId];
      toast.success(
        `Question marked as ${newStatus ? "mandatory" : "optional"}`
      );
      if (handleToggleMandatory) {
        handleToggleMandatory(questionId);
      }
      if (interviewQuestionsLists?.some((q) => q.questionId === questionId)) {
        onAddQuestion({
          questionId: item._id,
          source: "system",
          snapshot: item,
          order: "",
          customizations: "",
          mandatory: newStatus ? "true" : "false",
        });
      }
      return { ...prev, [questionId]: newStatus };
    });
  };

  const onClickAddButton = async (item) => {
    if (type === "assessment") {
      const isDuplicate = addedSections.some((section) =>
        section.Questions.some((q) => q.questionId === item._id)
      );
      if (isDuplicate) {
        toast.error("This question has already been added to the assessment");
        return;
      }
      if (checkedCount >= questionsLimit) {
        toast.error(
          `You've reached the maximum limit of ${questionsLimit} questions`
        );
        return;
      }
      const questionToAdd = {
        questionId: item._id,
        source: "system",
        snapshot: {
          autoAssessment: item.autoAssessment,
          correctAnswer: item.correctAnswer,
          difficultyLevel: item.difficultyLevel,
          hints: item.hints,
          isActive: item.isActive,
          isAdded: item.isAdded,
          isAutoAssessment: item.isAutoAssessment,
          isInterviewQuestionOnly: item.isInterviewQuestionOnly,
          options: item.options,
          programming: item.programming,
          questionNo: item.questionNo,
          questionText: item.questionText,
          questionType: item.questionType,
          skill: item.skill,
          tags: item.tags,
          technology: item.technology,
        },
        order: item.order || 0,
        customizations: null,
      };
      updateQuestionsInAddedSectionFromQuestionBank(sectionName, questionToAdd);
      toast.success("Question Added Successfully!");
    } else {
      try {
        const questionToAdd = {
          questionId: item._id,
          source: "system",
          snapshot: item,
          order: "",
          customizations: "",
          mandatory: mandatoryStatus[item._id] ? "true" : "false",
        };
        if (onAddQuestion) {
          onAddQuestion(questionToAdd);
        }
        toast.success("Question Added Successfully!");
      } catch (error) {
        toast.error("Failed to add question");
        console.error("Error adding question:", error);
      }
    }
  };

  // const onClickDropdownSkill = (tag) => {
  //     if (!selectedSkills.includes(tag)) {
  //         setSelectedSkills((prev) => [...prev, tag]);
  //         setSkillInput("");
  //     } else {
  //         toast.error(`${tag} already selected`);
  //     }
  // };

  const onClickCrossIcon = (skill) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const onClickLeftPaginationIcon = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const onClickRightPagination = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // const onChangeCheckboxInQuestionType = (e, id, index) => {
  //     const { value, checked } = e.target;
  //     setFiltrationData((prev) =>
  //         prev.map((category) =>
  //             category.id === id
  //                 ? {
  //                     ...category,
  //                     options: category.options.map((opt, i) =>
  //                         i === index ? { ...opt, isChecked: checked } : opt
  //                     ),
  //                 }
  //                 : category
  //         )
  //     );
  //     setQuestionTypeFilterItems((prev) =>
  //         checked ? [...prev, value] : prev.filter((item) => item !== value)
  //     );
  // };

  // const onChangeCheckboxInDifficultyLevel = (e, id, index) => {
  //     const { value, checked } = e.target;
  //     setFiltrationData((prev) =>
  //         prev.map((category) =>
  //             category.id === id
  //                 ? {
  //                     ...category,
  //                     options: category.options.map((opt, i) =>
  //                         i === index ? { ...opt, isChecked: checked } : opt
  //                     ),
  //                 }
  //                 : category
  //         )
  //     );
  //     setDifficultyLevelFilterItems((prev) =>
  //         checked ? [...prev, value] : prev.filter((item) => item !== value)
  //     );
  // };

  const onClickRemoveSelectedFilterItem = (item) => {
    if (questionTypeFilterItems.includes(item)) {
      setQuestionTypeFilterItems((prev) => prev.filter((i) => i !== item));
      setFiltrationData((prev) =>
        prev.map((category) =>
          category.id === 1
            ? {
                ...category,
                options: category.options.map((opt) =>
                  opt.type.toLowerCase() === item
                    ? { ...opt, isChecked: false }
                    : opt
                ),
              }
            : category
        )
      );
    } else if (difficultyLevelFilterItems.includes(item)) {
      setDifficultyLevelFilterItems((prev) => prev.filter((i) => i !== item));
      setFiltrationData((prev) =>
        prev.map((category) =>
          category.id === 2
            ? {
                ...category,
                options: category.options.map((opt) =>
                  opt.level.toLowerCase() === item
                    ? { ...opt, isChecked: false }
                    : opt
                ),
              }
            : category
        )
      );
    }
  };

  const onClickRemoveQuestion = async (id) => {
    if (
      type === "interviewerSection" ||
      (type === "feedback" && handleRemoveQuestion)
    ) {
      handleRemoveQuestion(id);
      setMandatoryStatus((prev) => ({ ...prev, [id]: false }));
      toast.error("Question removed successfully!");
    } else {
      console.error("Failed to remove");
    }
  };

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "border-white rounded-md px-2 py-1 bg-[#81C784]";
      case "Medium":
        return "border-white rounded-md px-2 py-1 bg-[#FFD54F]";
      case "Hard":
        return "border-white rounded-md px-2 py-1 bg-[#E57373]";
      default:
        return "";
    }
  };
  const toggleDropdown = (questionId) => {
    setDropdownOpen(dropdownOpen === questionId ? null : questionId);
  };
  const closeDropdown = () => {
    setDropdownOpen(null);
  };

  const openFilterPopup = () => {
    setTempQuestionTypeFilterItems(questionTypeFilterItems);
    setTempDifficultyLevelFilterItems(difficultyLevelFilterItems);
    setTempSelectedSkills(selectedSkills);
    setTempSkillInput(skillInput);
    setTempFiltrationData(JSON.parse(JSON.stringify(filtrationData)));
    setIsPopupOpen(!isPopupOpen);
  };

  // Skeleton Loader
  //   v1.0.1 <--------------------------------------------------------
  //   const SkeletonLoader = () => (
  //     <div className="w-full px-5">
  //       <div
  //         className={`fixed flex items-center justify-between ${
  //           type === "interviewerSection" ||
  //           type === "feedback" ||
  //           type === "assessment"
  //             ? "top-40 left-40 right-40"
  //             : "top-32 left-5 right-5"
  //         }`}
  //       >
  //         <div className="flex items-center gap-3">
  //           <div className="h-10 w-64 bg-gray-200 rounded-md animate-pulse"></div>
  //           <div className="h-10 w-64 bg-gray-200 rounded-md animate-pulse"></div>
  //         </div>
  //         <div className="flex items-center gap-3">
  //           <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
  //           <div className="flex gap-2">
  //             <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
  //             <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
  //           </div>
  //           <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
  //         </div>
  //       </div>
  //       <div className="mt-[110px] space-y-4">
  //         {Array(3)
  //           .fill()
  //           .map((_, idx) => (
  //             <div
  //               key={idx}
  //               className="border border-gray-200 rounded-lg shadow-sm"
  //             >
  //               <div className="flex justify-between items-center border-b border-gray-200 px-4 py-2">
  //                 <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
  //                 <div className="flex items-center gap-2">
  //                   <div className="h-6 w-16 bg-gray-200 rounded-md animate-pulse"></div>
  //                   <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse"></div>
  //                 </div>
  //               </div>
  //               <div className="px-4 py-2">
  //                 <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-2"></div>
  //                 <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
  //               </div>
  //             </div>
  //           ))}
  //       </div>
  //     </div>
  //   );

  // SkeletonLoader.tsx
  const SkeletonLoader = () => {
    return (
      <div>
        <div className="flex items-end justify-end gap-x-3 w-full px-5 py-4">
          {/* Search box skeleton */}
          <div>
            <div className="h-10 bg-gray-200 rounded-md w-52 shimmer"></div>
          </div>

          {/* Pagination skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded shimmer"></div>
            <div className="h-10 w-10 bg-gray-200 rounded shimmer"></div>
            <div className="h-10 w-10 bg-gray-200 rounded shimmer"></div>
          </div>

          {/* Filter button skeleton */}
          <div className="h-10 w-10 bg-gray-200 rounded-md shimmer"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="flex flex-col gap-4 pr-2">
            {Array(4)
              .fill(0)
              .map((_, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg h-full shadow-sm"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-gray-200 px-4 py-2">
                    <div className="h-5 w-3/4 shimmer rounded"></div>
                    <div className="flex items-center gap-14">
                      <div className="h-7 w-16 shimmer rounded"></div>
                      <div className="h-7 w-16 shimmer rounded"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-4 py-2">
                    <div className="h-4 w-1/2 shimmer rounded mb-2"></div>
                    <div className="h-4 w-1/3 shimmer rounded"></div>
                  </div>
                </div>
              ))}
          </ul>
        </div>
      </div>
    );
  };

  //   v1.0.1 -------------------------------------------------------->

  // <-------v1.0.0 -----
  if (isLoading) return <SkeletonLoader />;
  // ------v1.0.0 ----->

  if (!suggestedQuestions || suggestedQuestions.length === 0) {
    return (
      <div className="h-full flex flex-col gap-4 justify-center items-center text-center p-8 mt-24">
        <div className="text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-gray-700 font-semibold text-lg">
          No Questions Available
        </h2>
        <p className="text-gray-500">
          Please try again later or check your data source.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search/Filter Bar */}
      <div
        className={`flex items-center justify-end px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0`}
      >
        <div className="flex gap-x-3">
          <div className="relative flex items-center rounded-md border">
            <span className="p-2 text-custom-blue">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="search"
              placeholder="Search by Skills & Questions"
              className="w-[85%] rounded-md focus:outline-none pr-2"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          <div className="relative inline-block w-48">
              <button
                className="px-4 py-2 border border-gray-300 text-sm rounded-md w-full text-left flex justify-between items-center hover:border-gray-400 transition-colors bg-white"
                onClick={() => setIsInterviewTypeOpen(!isInterviewTypeOpen)}
              >
                <span className="truncate">{dropdownValue || "Select Question Type"}</span>
                <svg
                  className={`w-4 h-4 ml-2 flex-shrink-0 text-gray-500 transition-transform ${isInterviewTypeOpen ? "rotate-180" : "rotate-0"}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isInterviewTypeOpen && (
                <div className="absolute mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div
                    className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${dropdownValue === "Interview Questions" ? "bg-blue-50 text-custom-blue font-semibold" : ""}`}
                    onClick={() => {setDropdownValue("Interview Questions"); setIsInterviewTypeOpen(false);}}
                  >
                    Interview Questions
                  </div>
                  <div
                    className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${dropdownValue === "Assignment Questions" ? "bg-blue-50 text-custom-blue font-semibold" : ""}`}
                    onClick={() => {setDropdownValue("Assignment Questions"); setIsInterviewTypeOpen(false);}}
                  >
                    Assignment Questions
                  </div>
                  
                </div>
              )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <p>
                {currentPage}/{totalPages || 1}
              </p>
            </div>
            <div className="flex items-center">
              <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                <span
                  onClick={onClickLeftPaginationIcon}
                  className={`border p-2 mr-2 text-xl rounded-md cursor-pointer ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <IoIosArrowBack />
                </span>
              </Tooltip>
              <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                <span
                  onClick={onClickRightPagination}
                  className={`border p-2 text-xl rounded-md cursor-pointer ${
                    currentPage === totalPages || totalPages === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <IoIosArrowForward />
                </span>
              </Tooltip>
            </div>
            <div>
              <div
                ref={filterIconRef}
                onClick={openFilterPopup}
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
        </div>
      </div>
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {selectedSkills.length > 0 && (
              <ul className="flex gap-2 flex-wrap px-4 pb-2">
                {selectedSkills.map((skill, index) => (
                  <li
                    key={index}
                    className="flex gap-2 items-center border border-custom-blue rounded-full px-3 py-1 text-custom-blue bg-blue-50 text-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      className="cursor-pointer hover:text-red-500 transition-colors"
                      onClick={() => onClickCrossIcon(skill)}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {[...questionTypeFilterItems, ...difficultyLevelFilterItems]
              .length > 0 && (
              <div className="flex items-center flex-wrap px-4 pt-2 mb-3">
                <h3 className="font-medium text-gray-700 text-sm">
                  Filters applied:
                </h3>
                <ul className="flex gap-2 flex-wrap">
                  {[
                    ...questionTypeFilterItems,
                    ...difficultyLevelFilterItems,
                  ].map((filterItem, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-1 rounded-full border border-custom-blue px-3 py-1 text-custom-blue font-medium bg-blue-50 text-sm"
                    >
                      <span>{filterItem}</span>
                      <button
                        className="hover:text-red-500 transition-colors"
                        onClick={() =>
                          onClickRemoveSelectedFilterItem(filterItem)
                        }
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ul className="flex flex-col gap-4 pr-2">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg h-full shadow-sm hover:shadow-md transition-shadow text-sm"
                  >
                    <div className="flex justify-between items-center border-b border-gray-200 px-4">
                      <h2 className="font-medium w-[85%] text-gray-800">
                        {(currentPage - 1) * itemsPerPage + 1 + index}.{" "}
                        {item.questionText}
                      </h2>
                      <div
                        className={`flex justify-center text-center p-2 border-r border-l border-gray-200 ${
                          type === "interviewerSection" ||
                          type === "feedback" ||
                          type === "assessment"
                            ? "w-[15%]"
                            : "w-[10%]"
                        }`}
                      >
                        <p
                          className={`w-16 text-center ${getDifficultyStyles(
                            item.difficultyLevel
                          )} rounded-full py-1`}
                          title="Difficulty Level"
                        >
                          {item.difficultyLevel}
                        </p>
                      </div>
                      {fromScheduleLater && (
                        <div className="flex justify-center text-center h-12 border-r border-gray-200">
                          <div className="flex items-center w-14 justify-center">
                            <button
                              onClick={() => {
                                if (
                                  interviewQuestionsLists?.some(
                                    (q) => q.questionId === item._id
                                  )
                                ) {
                                  handleToggle(item._id, item);
                                }
                              }}
                              className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                                mandatoryStatus[item._id]
                                  ? "bg-blue-100 border-custom-blue justify-end"
                                  : "bg-gray-200 border-gray-300 justify-start"
                              }`}
                              type="button"
                            >
                              <span
                                className={`w-3 h-3 rounded-full transition-colors ${
                                  mandatoryStatus[item._id]
                                    ? "bg-custom-blue"
                                    : "bg-gray-400"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                      {(type === "interviewerSection" ||
                        type === "feedback") && (
                        <div className="p-1 flex justify-center w-[8%]">
                          {interviewQuestionsLists?.some(
                            (q) => q.questionId === item._id
                          ) ? (
                            <button
                              type="button"
                              onClick={() => onClickRemoveQuestion(item._id)}
                              className="rounded-md md:ml-4 bg-gray-500 px-2 py-1 text-white hover:bg-gray-600 transition-colors"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="bg-custom-blue py-1 px-2 text-white rounded-md transition-colors"
                              onClick={() => onClickAddButton(item)}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      )}
                      {type === "assessment" && (
                        <div className="w-[8%] flex justify-center">
                          {addedSections.some((s) =>
                            s.Questions.some((q) => q.questionId === item._id)
                          ) ? (
                            <span className="text-green-600 font-medium py-1 px-1">
                              ✓ Added
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={`bg-custom-blue w-[80%] py-1 px-1 text-white rounded-md transition-colors ${
                                addedSections.reduce(
                                  (acc, s) => acc + s.Questions.length,
                                  0
                                ) >= questionsLimit
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              onClick={() => onClickAddButton(item)}
                              disabled={
                                addedSections.reduce(
                                  (acc, s) => acc + s.Questions.length,
                                  0
                                ) >= questionsLimit
                              }
                            >
                              Add
                            </button>
                          )}
                        </div>
                      )}

                      {!type && !fromScheduleLater && (
                        <div className="w-[10%] flex justify-center relative">
                          <button
                            type="button"
                            className="border cursor-pointer rounded-md px-2 py-1 border-custom-blue transition-colors"
                            onClick={() => toggleDropdown(item._id)}
                          >
                            Add to list
                          </button>
                          {dropdownOpen === item._id && (
                            <MyQuestionList
                              question={item}
                              closeDropdown={closeDropdown}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-2">
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Answer: </span>
                        {item.correctAnswer}
                      </p>
                      <p className="font-medium">
                        Tags:{" "}
                        <span className="text-gray-600">
                          {item.tags.join(", ")}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col gap-4 justify-center items-center text-center mt-24">
                  <div className="text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-gray-700 font-semibold text-lg">
                    No Questions Found
                  </h2>
                  <p className="text-gray-500">
                    Try again with different filter options
                  </p>
                </div>
              )}
            </ul>
          </div>
        </>
      )}

      <FilterPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onApply={() => {
          setQuestionTypeFilterItems(tempQuestionTypeFilterItems);
          setDifficultyLevelFilterItems(tempDifficultyLevelFilterItems);
          setSelectedSkills(tempSelectedSkills);
          setSkillInput(tempSkillInput);
          setFiltrationData(tempFiltrationData);
          setIsPopupOpen(false);
        }}
        onClearAll={() => {
          setTempQuestionTypeFilterItems([]);
          setTempDifficultyLevelFilterItems([]);
          setTempSelectedSkills([]);
          setTempSkillInput("");
          setTempFiltrationData([
            {
              id: 1,
              filterType: "QuestionType",
              isOpen: false,
              options: [
                { type: "Interview Question", isChecked: false },
                { type: "MCQ", isChecked: false },
                { type: "Short Text", isChecked: false },
                { type: "Long Text", isChecked: false },
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
          setQuestionTypeFilterItems([]);
          setDifficultyLevelFilterItems([]);
          setSelectedSkills([]);
          setSkillInput("");
          setFiltrationData([
            {
              id: 1,
              filterType: "QuestionType",
              isOpen: false,
              options: [
                { type: "Interview Question", isChecked: false },
                { type: "MCQ", isChecked: false },
                { type: "Short Text", isChecked: false },
                { type: "Long Text", isChecked: false },
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
          setIsPopupOpen(false);
        }}
        filterIconRef={filterIconRef}
      >
        <div style={{ maxHeight: 340, minWidth: 260, overflowY: "auto" }}>
          <div className="p-2">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() =>
                setTempFiltrationData((prev) =>
                  prev.map((item) =>
                    item.id === 1 ? { ...item, isOpen: !item.isOpen } : item
                  )
                )
              }
            >
              <h3 className="font-medium">Question Type</h3>
              <button type="button">
                {tempFiltrationData[0].isOpen ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {tempFiltrationData[0].isOpen && (
              <ul className="flex flex-col gap-2 pt-2">
                {tempFiltrationData[0].options.map((type, index) => (
                  <li key={index} className="flex gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempQuestionTypeFilterItems.includes(
                        type.type.toLowerCase()
                      )}
                      className="w-4 cursor-pointer"
                      value={type.type.toLowerCase()}
                      id={`question-type-${type.type}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        const checked = e.target.checked;
                        setTempQuestionTypeFilterItems((prev) =>
                          checked
                            ? prev.includes(value)
                              ? prev
                              : [...prev, value]
                            : prev.filter((item) => item !== value)
                        );
                      }}
                    />
                    <label htmlFor={`question-type-${type.type}`}>
                      {type.type}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-2">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() =>
                setTempFiltrationData((prev) =>
                  prev.map((item) =>
                    item.id === 2 ? { ...item, isOpen: !item.isOpen } : item
                  )
                )
              }
            >
              <h3 className="font-medium">Difficulty Level</h3>
              <button type="button">
                {tempFiltrationData[1].isOpen ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {tempFiltrationData[1].isOpen && (
              <ul className="flex flex-col gap-2 pt-2">
                {tempFiltrationData[1].options.map((type, index) => (
                  <li key={index} className="flex gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempDifficultyLevelFilterItems.includes(
                        type.level.toLowerCase()
                      )}
                      className="w-4 cursor-pointer"
                      value={type.level.toLowerCase()}
                      id={`question-type-${type.level}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        const checked = e.target.checked;
                        setTempDifficultyLevelFilterItems((prev) =>
                          checked
                            ? prev.includes(value)
                              ? prev
                              : [...prev, value]
                            : prev.filter((item) => item !== value)
                        );
                      }}
                    />
                    <label htmlFor={`question-type-${type.level}`}>
                      {type.level}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </FilterPopup>
    </div>
  );
};

export default SuggestedQuestionsComponent;
