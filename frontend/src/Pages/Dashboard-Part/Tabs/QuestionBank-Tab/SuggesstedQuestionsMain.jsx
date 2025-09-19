/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// v1.0.0 ------ Venkatesh--- added loading state and skeleton loader
// v1.0.1 - Ashok - Improved loader animation from animate-pulse to shimmer (custom css styles)
// v1.0.2  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
// v1.0.3 ----Venkatesh---add questions lengthn for pagination
// v1.0.4 ----Venkatesh---add new filter like technology and category
// v1.0.5 - Ashok - Improved responsiveness
// v1.0.6 - Ashok - Fixed alignment issues
// v1.0.7 - Ashok - Fixed responsive issues

import React, { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Tooltip } from "@mui/material";
import { ChevronUp, ChevronDown, Search, X, Plus } from "lucide-react";
import { ReactComponent as IoIosArrowBack } from "../../../../icons/IoIosArrowBack.svg";
import { ReactComponent as IoIosArrowForward } from "../../../../icons/IoIosArrowForward.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect.jsx";
import { useQuestions } from "../../../../apiHooks/useQuestionBank.js";
import MyQuestionList from "./MyQuestionsListPopup.jsx";
// v1.0.5 <-------------------------------------------------------
// v1.0.5 ------------------------------------------------------->

// v1.0.5 <------------------------------------------------------------------
function HeaderBar({
  rangeLabel,
  searchInput,
  setSearchInput,
  dropdownValue,
  setDropdownValue,
  isPopupOpen,
  openFilterPopup,
  filterIconRef,
  currentPage,
  totalPages,
  onClickLeftPaginationIcon,
  onClickRightPagination,
}) {
  // Using DropdownSelect for interview type selection; no manual portal/open-state needed.

  return (
    <div className="flex items-center sm:justify-start justify-end px-4 py-3 marker:flex-shrink-0 overflow-x-auto">
      <div className="flex gap-x-3 min-w-max whitespace-nowrap">
        {/* Range Label */}
        <div className="flex items-center">
          <p>{rangeLabel}</p>
        </div>

        {/* Search */}
        <div className="relative flex items-center rounded-md border flex-shrink-0 w-64 bg-white">
          <span className="p-2 text-custom-blue">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="search"
            placeholder="Search by Skills & Questions"
            className="flex-1 rounded-md focus:outline-none pr-2"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Dropdown */}
        <div className="w-48 flex-shrink-0">
          <DropdownSelect
            isSearchable={false}
            value={
              dropdownValue
                ? { value: dropdownValue, label: dropdownValue }
                : null
            }
            onChange={(opt) => setDropdownValue(opt?.value || "")}
            options={[
              { value: "Interview Questions", label: "Interview Questions" },
              { value: "Assignment Questions", label: "Assignment Questions" },
            ]}
            placeholder="Select Question Type"
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </div>

        {/* Pagination + Filter */}
        <div className="flex items-center gap-3 flex-shrink-0">
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
  );
}
// v1.0.5 ------------------------------------------------------------------>

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
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const filterIconRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const itemsPerPage = 10;
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropdownValue, setDropdownValue] = useState("Interview Questions");

  // Map dropdown selection to backend-supported questionType filter
  const selectedQuestionType = useMemo(
    () =>
      dropdownValue === "Interview Questions" ? "Interview" : "Assignment",
    [dropdownValue]
  );
  const { suggestedQuestions, isLoading } = useQuestions({
    questionType: selectedQuestionType,
  });

  //<------v1.0.4--------
  // Show/hide Question Type filter based on dropdown selection
  const showQuestionTypeFilter = dropdownValue !== "Interview Questions";

  // Derive unique Category and Technology lists from data
  const uniqueCategories = useMemo(() => {
    if (!suggestedQuestions || suggestedQuestions.length === 0) return [];
    const set = new Set();
    suggestedQuestions.forEach((q) => {
      if (q?.category) set.add(String(q.category).trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [suggestedQuestions]);

  const uniqueTechnologies = useMemo(() => {
    if (!suggestedQuestions || suggestedQuestions.length === 0) return [];
    const set = new Set();
    console.log("suggestedQuestions", suggestedQuestions);
    suggestedQuestions.forEach((q) => {
      const techArr = Array.isArray(q?.technology) ? q.technology : [];
      techArr.forEach((t) => {
        if (t != null) set.add(String(t).trim());
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [suggestedQuestions]);

  // Build default filter section metadata
  const buildDefaultFiltrationData = () => {
    const sections = [];
    if (showQuestionTypeFilter) {
      sections.push({
        id: 1,
        filterType: "Question Type",
        isOpen: false,
        options: [
          { type: "MCQ", isChecked: false },
          { type: "Short Text", isChecked: false },
          { type: "Long Text", isChecked: false },
          { type: "Programming", isChecked: false },
          { type: "Number", isChecked: false },
          { type: "Boolean", isChecked: false },
        ],
      });
    }
    sections.push({
      id: 2,
      filterType: "Difficulty Level",
      isOpen: false,
      options: [
        { level: "Easy", isChecked: false },
        { level: "Medium", isChecked: false },
        { level: "Hard", isChecked: false },
      ],
    });
    sections.push({
      id: 3,
      filterType: "Category",
      isOpen: false,
      options: uniqueCategories.map((c) => ({ value: c, isChecked: false })),
    });
    sections.push({
      id: 4,
      filterType: "Technology",
      isOpen: false,
      options: uniqueTechnologies.map((t) => ({ value: t, isChecked: false })),
    });
    return sections;
  };
  //------v1.0.4-------->

  const [filtrationData, setFiltrationData] = useState([
    {
      id: 1,
      filterType: "QuestionType",
      isOpen: false,
      options: [
        { type: "MCQ", isChecked: false },
        { type: "Short Text", isChecked: false },
        { type: "Long Text", isChecked: false },
        { type: "Programming", isChecked: false },
        { type: "Number", isChecked: false },
        { type: "Boolean", isChecked: false },
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

  //<------v1.0.4--------
  // Keep filtration sections in sync with dropdown selection and available data
  useEffect(() => {
    setFiltrationData(buildDefaultFiltrationData());
  }, [showQuestionTypeFilter, uniqueCategories, uniqueTechnologies]);

  const [questionTypeFilterItems, setQuestionTypeFilterItems] = useState([]);
  const [difficultyLevelFilterItems, setDifficultyLevelFilterItems] = useState(
    []
  );
  const [categoryFilterItems, setCategoryFilterItems] = useState([]);
  const [technologyFilterItems, setTechnologyFilterItems] = useState([]);
  const [mandatoryStatus, setMandatoryStatus] = useState({});

  // Temporary states for filter popup
  const [tempQuestionTypeFilterItems, setTempQuestionTypeFilterItems] =
    useState([]);
  const [tempDifficultyLevelFilterItems, setTempDifficultyLevelFilterItems] =
    useState([]);
  const [tempCategoryFilterItems, setTempCategoryFilterItems] = useState([]);
  const [tempTechnologyFilterItems, setTempTechnologyFilterItems] = useState(
    []
  );
  const [tempSelectedSkills, setTempSelectedSkills] = useState([]);
  const [tempSkillInput, setTempSkillInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tempFiltrationData, setTempFiltrationData] = useState(
    JSON.parse(JSON.stringify(filtrationData))
  );

  // Keep popup temp state in sync when opening the popup or when base sections update
  useEffect(() => {
    if (isPopupOpen) {
      setTempFiltrationData(JSON.parse(JSON.stringify(filtrationData)));
      setTempQuestionTypeFilterItems(questionTypeFilterItems);
      setTempDifficultyLevelFilterItems(difficultyLevelFilterItems);
      setTempCategoryFilterItems(categoryFilterItems);
      setTempTechnologyFilterItems(technologyFilterItems);
      setTempSelectedSkills(selectedSkills);
      setTempSkillInput(skillInput);
    }
  }, [
    isPopupOpen,
    filtrationData,
    questionTypeFilterItems,
    difficultyLevelFilterItems,
    categoryFilterItems,
    technologyFilterItems,
    selectedSkills,
    skillInput,
  ]);
  //------v1.0.4-------->

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
        //<------v1.0.4--------
        !showQuestionTypeFilter ||
        questionTypeFilterItems.length === 0 ||
        questionTypeFilterItems.includes(
          (question.questionType || "").toLowerCase()
        );

      const matchesDifficultyLevel =
        difficultyLevelFilterItems.length === 0 ||
        difficultyLevelFilterItems.includes(
          question.difficultyLevel.toLowerCase()
        );

      const matchesCategory =
        categoryFilterItems.length === 0 ||
        (question.category &&
          categoryFilterItems.includes(
            String(question.category).toLowerCase()
          ));

      const matchesTechnology =
        technologyFilterItems.length === 0 ||
        (Array.isArray(question.technology) &&
          question.technology.some((t) =>
            technologyFilterItems.includes(String(t).toLowerCase())
          ));

      return (
        matchesSearch &&
        matchesType &&
        matchesDifficultyLevel &&
        matchesCategory &&
        matchesTechnology
      );
    });
  }, [
    suggestedQuestions,
    searchInput,
    questionTypeFilterItems,
    difficultyLevelFilterItems,
    categoryFilterItems,
    technologyFilterItems,
    showQuestionTypeFilter,
    //------v1.0.4------>
  ]);

  // Pagination
  //<-----v1.0.3-----
  const totalItems = suggestedQuestionsFilteredData.length;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
    //-----v1.0.3----->
  );
  const paginatedData = useMemo(
    () =>
      suggestedQuestionsFilteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [suggestedQuestionsFilteredData, currentPage, itemsPerPage]
  );
  //console.log("pagedata",paginatedData);

  //<-----v1.0.3-----
  const startIndex =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  const rangeLabel =
    totalItems === 0
      ? "0/0"
      : startIndex === endIndex
      ? `${endIndex}/${totalItems} ${totalItems > 1 ? "Questions" : "Question"}`
      : `${startIndex}-${endIndex}/${totalItems} ${
          totalItems > 1 ? "Questions" : "Question"
        }`;

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchInput,
    questionTypeFilterItems,
    difficultyLevelFilterItems,
    categoryFilterItems,
    technologyFilterItems,
    dropdownValue,
  ]);

  // Clamp page if out of range
  useEffect(() => {
    const tp = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    if (currentPage > tp) setCurrentPage(tp);
  }, [totalItems, itemsPerPage, currentPage]);
  //-----v1.0.3----->

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
      //<------v1.0.4--------
    } else if (categoryFilterItems.includes(item)) {
      setCategoryFilterItems((prev) => prev.filter((i) => i !== item));
      setFiltrationData((prev) =>
        prev.map((category) =>
          category.id === 3
            ? {
                ...category,
                options: category.options.map((opt) =>
                  String(opt.value).toLowerCase() === item
                    ? { ...opt, isChecked: false }
                    : opt
                ),
              }
            : category
        )
      );
    } else if (technologyFilterItems.includes(item)) {
      setTechnologyFilterItems((prev) => prev.filter((i) => i !== item));
      setFiltrationData((prev) =>
        prev.map((category) =>
          category.id === 4
            ? {
                ...category,
                options: category.options.map((opt) =>
                  String(opt.value).toLowerCase() === item
                    ? { ...opt, isChecked: false }
                    : opt
                ),
              }
            : category
        )
      );
      //------v1.0.4-------->
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

  // Safely render solutions which can be string | object | array of objects
  const renderSolutions = (solutions) => {
    if (!solutions) return "N/A";
    if (typeof solutions === "string") return solutions;

    // If it's an array of solution objects
    if (Array.isArray(solutions)) {
      return (
        <div className="space-y-2">
          {solutions.map((sol, idx) => (
            <div key={idx} className="border border-gray-200 rounded-md p-2">
              {sol?.language && (
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Language:</span> {sol.language}
                </div>
              )}
              {sol?.approach && (
                <div className="text-xs text-gray-700 mb-1">
                  <span className="font-medium">Approach:</span> {sol.approach}
                </div>
              )}
              {sol?.code && (
                <pre className="bg-gray-50 p-2 rounded-md overflow-x-auto text-xs text-gray-800">
                  <code>{sol.code}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      );
    }

    // If it's a single solution object
    if (typeof solutions === "object") {
      const sol = solutions;
      return (
        <div className="border border-gray-200 rounded-md p-2">
          {sol?.language && (
            <div className="text-xs text-gray-600 mb-1">
              <span className="font-medium">Language:</span> {sol.language}
            </div>
          )}
          {sol?.approach && (
            <div className="text-xs text-gray-700 mb-1">
              <span className="font-medium">Approach:</span> {sol.approach}
            </div>
          )}
          {sol?.code && (
            <pre className="bg-gray-50 p-2 rounded-md overflow-x-auto text-xs text-gray-800">
              <code>{sol.code}</code>
            </pre>
          )}
        </div>
      );
    }

    try {
      return String(solutions);
    } catch {
      return "N/A";
    }
  };

  const openFilterPopup = () => {
    setTempQuestionTypeFilterItems(questionTypeFilterItems);
    setTempDifficultyLevelFilterItems(difficultyLevelFilterItems);
    setTempCategoryFilterItems(categoryFilterItems);
    setTempTechnologyFilterItems(technologyFilterItems);
    setTempSelectedSkills(selectedSkills);
    setTempSkillInput(skillInput);
    setTempFiltrationData(
      JSON.parse(JSON.stringify(buildDefaultFiltrationData()))
    );
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
          {/* v1.0.5 <------------------------------------------------------------------- */}
          <div className="flex items-center gap-3">
            <div className="h-10 bg-gray-200 rounded-md w-28 shimmer"></div>
            <div className="h-10 bg-gray-200 rounded-md w-52 shimmer"></div>
            <div className="h-10 bg-gray-200 rounded-md w-40 shimmer"></div>
          </div>
          {/* v1.0.5 -------------------------------------------------------------------> */}

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
      {/* v1.0.5 <----------------------------------------------------------------- */}

      {/* <div
        className={`flex items-center justify-end px-4 py-3 bg-white flex-shrink-0 overflow-x-auto`}
      >
        <div className="flex gap-x-3 min-w-max whitespace-nowrap">
          <div className="flex items-center">
            <p>{rangeLabel}</p>
          </div>
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

          <div className="w-48">
            <DropdownSelect
              isSearchable={false}
              value={dropdownValue ? { value: dropdownValue, label: dropdownValue } : null}
              onChange={(opt) => setDropdownValue(opt?.value || "")}
              options={[
                { value: "Interview Questions", label: "Interview Questions" },
                { value: "Assignment Questions", label: "Assignment Questions" },
              ]}
              placeholder="Select Question Type"
            />
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
      </div> */}

      {/* It's Implemented to avoid responsive issues  */}
      <HeaderBar
        rangeLabel={rangeLabel}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        dropdownValue={dropdownValue}
        setDropdownValue={setDropdownValue}
        isPopupOpen={isPopupOpen}
        openFilterPopup={() => setIsPopupOpen((prev) => !prev)}
        filterIconRef={filterIconRef}
        currentPage={currentPage}
        totalPages={totalPages}
        onClickLeftPaginationIcon={onClickLeftPaginationIcon}
        onClickRightPagination={onClickRightPagination}
      />

      {/* v1.0.5 -----------------------------------------------------------------> */}
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Content */}
          {/* v1.0.5 <----------------------------------------------------------------- */}
          <div className="flex-1 overflow-y-auto sm:px-2 px-5 py-4">
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
            {[
              ...(showQuestionTypeFilter ? questionTypeFilterItems : []),
              ...difficultyLevelFilterItems,
              ...categoryFilterItems,
              ...technologyFilterItems,
            ].length > 0 && (
              // v1.0.6 <----------------------------------------------------------------------
              <div className="flex items-center flex-wrap px-4 pt-2 mb-3 gap-3">
                <h3 className="font-medium text-gray-700 text-sm">
                  Filters applied:
                </h3>
                <ul className="flex gap-2 flex-wrap">
                  {[
                    ...(showQuestionTypeFilter ? questionTypeFilterItems : []),
                    ...difficultyLevelFilterItems,
                    ...categoryFilterItems,
                    ...technologyFilterItems,
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
              // v1.0.6 ---------------------------------------------------------------------->
            )}
            <ul className="flex flex-col gap-4 pr-2">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg h-full shadow-sm hover:shadow-md transition-shadow text-sm"
                  >
                    <div className="flex justify-between items-center border-b border-gray-200 px-4">
                      {/* v1.0.6 <---------------------------------------------------------------------------- */}
                      <div className="flex items-start justify-start sm:w-[50%] md:w-[58%] w-[80%]">
                        <div className="flex items-center justify-center rounded-md bg-custom-blue/80 px-3 py-1 text-white text-sm transition-colors">
                          <p className="font-medium">{item.category}</p>
                        </div>
                      </div>
                      {/* v1.0.6 ----------------------------------------------------------------------------> */}
                      {/* v1.0.7 <----------------------------------------------------------------------------------- */}
                      <div
                        className={`flex justify-center text-center p-2 sm:border-0 border-r border-l border-gray-200 ${
                          type === "interviewerSection" ||
                          type === "feedback" ||
                          type === "assessment"
                            ? "w-[15%]"
                            : "sm:w-[28%] md:w-[20%] w-[10%]"
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
                      {/* v1.0.7 -----------------------------------------------------------------------------------> */}
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
                      {/* v1.0.7 <--------------------------------------------------------- */}
                      {type === "assessment" && (
                        <div className="w-[8%] flex justify-center">
                          {addedSections.some((s) =>
                            s.Questions.some((q) => q.questionId === item._id)
                          ) ? (
                            <span className="flex items-center sm:text-lg gap-2 text-green-600 font-medium py-1 px-1">
                              ✓ <span className="sm:hidden inline">Added</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={`bg-custom-blue py-1 sm:px-1 px-3 text-white rounded-md transition-colors ${
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
                              <span className="sm:hidden inline">Add</span>
                              <Plus className="inline md:hidden lg:hidden xl:hidden 2xl:hidden" />
                            </button>
                          )}
                        </div>
                      )}
                      {/* v1.0.7 ---------------------------------------------------------> */}

                      {!type && !fromScheduleLater && (
                        <div className="flex justify-center relative">
                          <button
                            type="button"
                            className="border cursor-pointer rounded-md px-2 py-1 border-custom-blue transition-colors"
                            onClick={() => toggleDropdown(item._id)}
                          >
                            Add{" "}
                            <span className="sm:hidden md:hidden inline">
                              to list
                            </span>
                          </button>
                          {dropdownOpen === item._id && (
                            <MyQuestionList
                              question={item}
                              closeDropdown={closeDropdown}
                              isInterviewType={
                                dropdownValue === "Interview Questions"
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-b">
                      <div className="flex items-start w-full pt-2 gap-2">
                        <span className="font-semibold">
                          {(currentPage - 1) * itemsPerPage + index + 1}.
                        </span>
                        <p className="text-gray-700 break-words w-full">
                          {item.questionText}
                        </p>
                      </div>
                      {item.questionType === "MCQ" && item.options && (
                        <div className="mb-2 ml-12 mt-2">
                          <ul className="list-none">
                            {(() => {
                              const isAnyOptionLong = item.options.some(
                                (option) => option.length > 55
                              );
                              return item.options.map((option, idx) => (
                                <li
                                  key={idx}
                                  className={`${
                                    isAnyOptionLong
                                      ? "block w-full"
                                      : "inline-block w-1/2"
                                  } mb-2`}
                                >
                                  <span className="text-gray-700">
                                    {option}
                                  </span>
                                </li>
                              ));
                            })()}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm break-words whitespace-pre-wrap">
                        <span className="font-medium text-gray-700">
                          Answer:{" "}
                        </span>
                        <span className="text-gray-600">
                          {item.questionType === "Programming"
                            ? renderSolutions(item.solutions)
                            : item.correctAnswer}
                        </span>
                      </p>
                      <p className="font-medium pt-2">
                        Tags:{" "}
                        <span className="text-sm text-gray-600">
                          {Array.isArray(item.tags)
                            ? item.tags.join(", ")
                            : String(item.tags || "")}
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
          {/* v1.0.5 -----------------------------------------------------------------> */}
        </>
      )}

      <FilterPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onApply={() => {
          setQuestionTypeFilterItems(tempQuestionTypeFilterItems);
          setDifficultyLevelFilterItems(tempDifficultyLevelFilterItems);
          setCategoryFilterItems(tempCategoryFilterItems);
          setTechnologyFilterItems(tempTechnologyFilterItems);
          setSelectedSkills(tempSelectedSkills);
          setSkillInput(tempSkillInput);
          setFiltrationData(tempFiltrationData);
          setIsPopupOpen(false);
        }}
        onClearAll={() => {
          setTempQuestionTypeFilterItems([]);
          setTempDifficultyLevelFilterItems([]);
          setTempCategoryFilterItems([]);
          setTempTechnologyFilterItems([]);
          setTempSelectedSkills([]);
          setTempSkillInput("");
          setTempFiltrationData(buildDefaultFiltrationData());
          setQuestionTypeFilterItems([]);
          setDifficultyLevelFilterItems([]);
          setCategoryFilterItems([]);
          setTechnologyFilterItems([]);
          setSelectedSkills([]);
          setSkillInput("");
          setFiltrationData(buildDefaultFiltrationData());
          setIsPopupOpen(false);
        }}
        filterIconRef={filterIconRef}
      >
        <div style={{ maxHeight: 340, minWidth: 260, overflowY: "auto" }}>
          {/*//<------v1.0.4-------- Question Type - only when allowed */}
          {(() => {
            const section = tempFiltrationData.find((s) => s.id === 1);
            if (!showQuestionTypeFilter || !section) return null;
            return (
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
                    {section.isOpen ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
                {section.isOpen && (
                  <ul className="flex flex-col gap-2 pt-2">
                    {section.options.map((type, index) => (
                      <li key={index} className="flex gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempQuestionTypeFilterItems.includes(
                            type.type.toLowerCase()
                          )}
                          className="w-4 cursor-pointer accent-custom-blue focus:ring-custom-blue"
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
            );
          })()}

          {/* Difficulty Level */}
          {(() => {
            const section = tempFiltrationData.find((s) => s.id === 2);
            if (!section) return null;
            return (
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
                    {section.isOpen ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
                {section.isOpen && (
                  <ul className="flex flex-col gap-2 pt-2">
                    {section.options.map((type, index) => (
                      <li key={index} className="flex gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempDifficultyLevelFilterItems.includes(
                            type.level.toLowerCase()
                          )}
                          className="w-4 cursor-pointer accent-custom-blue focus:ring-custom-blue"
                          value={type.level.toLowerCase()}
                          id={`difficulty-${type.level}`}
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
                        <label htmlFor={`difficulty-${type.level}`}>
                          {type.level}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()}

          {/* Category */}
          {(() => {
            const section = tempFiltrationData.find((s) => s.id === 3);
            if (!section || !section.options || section.options.length === 0)
              return null;
            return (
              <div className="p-2">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() =>
                    setTempFiltrationData((prev) =>
                      prev.map((item) =>
                        item.id === 3 ? { ...item, isOpen: !item.isOpen } : item
                      )
                    )
                  }
                >
                  <h3 className="font-medium">Category</h3>
                  <button type="button">
                    {section.isOpen ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
                {section.isOpen && (
                  <ul className="flex flex-col gap-2 pt-2">
                    {section.options.map((opt, index) => (
                      <li key={index} className="flex gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempCategoryFilterItems.includes(
                            String(opt.value).toLowerCase()
                          )}
                          className="w-4 cursor-pointer accent-custom-blue focus:ring-custom-blue"
                          value={String(opt.value).toLowerCase()}
                          id={`category-${opt.value}`}
                          onChange={(e) => {
                            const value = e.target.value;
                            const checked = e.target.checked;
                            setTempCategoryFilterItems((prev) =>
                              checked
                                ? prev.includes(value)
                                  ? prev
                                  : [...prev, value]
                                : prev.filter((item) => item !== value)
                            );
                          }}
                        />
                        <label htmlFor={`category-${opt.value}`}>
                          {opt.value}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()}

          {/* Technology */}
          {(() => {
            const section = tempFiltrationData.find((s) => s.id === 4);
            if (!section || !section.options || section.options.length === 0)
              return null;
            return (
              <div className="p-2">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() =>
                    setTempFiltrationData((prev) =>
                      prev.map((item) =>
                        item.id === 4 ? { ...item, isOpen: !item.isOpen } : item
                      )
                    )
                  }
                >
                  <h3 className="font-medium">Technology</h3>
                  <button type="button">
                    {section.isOpen ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
                {section.isOpen && (
                  <ul className="flex flex-col gap-2 pt-2">
                    {section.options.map((opt, index) => (
                      <li key={index} className="flex gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempTechnologyFilterItems.includes(
                            String(opt.value).toLowerCase()
                          )}
                          className="w-4 cursor-pointer accent-custom-blue focus:ring-custom-blue"
                          value={String(opt.value).toLowerCase()}
                          id={`technology-${opt.value}`}
                          onChange={(e) => {
                            const value = e.target.value;
                            const checked = e.target.checked;
                            setTempTechnologyFilterItems((prev) =>
                              checked
                                ? prev.includes(value)
                                  ? prev
                                  : [...prev, value]
                                : prev.filter((item) => item !== value)
                            );
                          }}
                        />
                        <label htmlFor={`technology-${opt.value}`}>
                          {opt.value}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()}
          {/*------v1.0.4-------->*/}
        </div>
      </FilterPopup>
    </div>
  );
};

export default SuggestedQuestionsComponent;
