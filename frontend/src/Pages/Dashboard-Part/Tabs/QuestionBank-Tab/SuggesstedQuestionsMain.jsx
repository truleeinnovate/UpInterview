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
// v1.0.7 - Ashok - Fixed suggested questions header
// v1.0.8 - Ashok - Fixed style issues
// v1.0.9 - Ashok - fixed filter popup container scroll issue
// v2.0.0 - Ashok - Added prop isMeetingSidePanel to handle styles according to meeting page

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { Tooltip } from "@mui/material";
import { ChevronUp, ChevronDown, Search, X, Plus } from "lucide-react";
import { ReactComponent as IoIosArrowBack } from "../../../../icons/IoIosArrowBack.svg";
import { ReactComponent as IoIosArrowForward } from "../../../../icons/IoIosArrowForward.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect.jsx";
import { useQuestions } from "../../../../apiHooks/useQuestionBank.js";
import MyQuestionList from "./MyQuestionsListPopup.jsx";
import { useNavigate } from "react-router-dom";
import { Lock, Unlock } from "lucide-react";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock.js";
import { notify } from "../../../../services/toastService.js";
// v1.0.5 <-------------------------------------------------------
// v1.0.5 ------------------------------------------------------->

// v1.0.5 <------------------------------------------------------------------
const FilterDropdown = ({ label, options, selectedItems, onChange, isRadio }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      <div
        className={`flex items-center justify-between px-3 py-[9px] border rounded-md cursor-pointer bg-white min-w-[160px] text-sm transition-colors ${isOpen ? 'border-custom-blue ring-1 ring-custom-blue' : 'border-gray-300 hover:border-custom-blue'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-700 whitespace-nowrap">
          {label} {selectedItems.length > 0 && `(${selectedItems.length})`}
        </span>
        <ChevronDown className={`w-4 h-4 ml-2 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
          <ul className="py-1 flex flex-col gap-1">
            <li
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded-sm mx-1 ${selectedItems.length === 0 ? 'bg-custom-blue text-white' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={() => { onChange([]); setIsOpen(false); }}
            >
              <span className="text-sm whitespace-nowrap">All</span>
            </li>
            {options.map((opt, idx) => {
              const valString = String(opt.value || opt.type || opt.level).toLowerCase();
              const displayString = String(opt.value || opt.type || opt.level);
              const isChecked = selectedItems.includes(valString);

              return (
                <li
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded-sm mx-1 ${isChecked ? 'bg-custom-blue text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                  onClick={(e) => {
                    if (isRadio) {
                      onChange([valString]);
                      setIsOpen(false);
                    } else {
                      const newItems = isChecked
                        ? selectedItems.filter(v => v !== valString)
                        : [...selectedItems, valString];
                      onChange(newItems);
                    }
                  }}
                >
                  <span className="text-sm whitespace-nowrap">{displayString}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function HeaderBar({
  rangeLabel,
  questionsPerPage,
  onChangeQuestionsPerPage,
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
  type,
  isMeetingSidePanel,
  onAddSearchTag,
}) {
  // Using DropdownSelect for interview type selection; no manual portal/open-state needed.

  return (
    <div
      className={`flex items-center px-4 py-2
        ${isMeetingSidePanel
          ? "justify-start overflow-auto"
          : "justify-between overflow-x-auto"
        }
      `}
    >
      {/* Left: Interview Type Dropdown */}
      <div className="flex items-center gap-x-3 whitespace-nowrap">
        {type !== "assessment" && type !== "interviewerSection" && (
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
                {
                  value: "Assessment Questions",
                  label: "Assessment Questions",
                },
              ]}
              placeholder="Select Question Type"
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>
        )}
      </div>

      {/* Right: Search, Range, Show/Page, Pagination, Filter */}
      <div className="flex gap-x-3 whitespace-nowrap items-center">
        {/* Search Bar */}
        <div className="relative flex items-center rounded-md border border-gray-300 bg-white hover:border-custom-blue transition-colors">
          <span className="p-[7px] text-custom-blue flex-shrink-0">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="search"
            placeholder="Search questions, tags..."
            className="w-54 px-2 py-2 pl-0 rounded-md focus:outline-none text-sm text-gray-700 bg-transparent"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchInput.trim()) {
                e.preventDefault();
                if (typeof onAddSearchTag === "function") {
                  onAddSearchTag(searchInput.trim());
                }
                setSearchInput("");
              }
            }}
          />
        </div>

        <div className="flex items-center">
          <p>{rangeLabel}</p>
        </div>

        {/* Questions per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">
            Show/Page:
          </span>
          <div className="flex items-center gap-1">
            <div className="w-28 flex-shrink-0">
              {(() => {
                const pageSizeOptions = [20, 30, 50, 100, 150, 200].map(
                  (size) => ({
                    value: size,
                    label: size,
                  }),
                );
                const selectedOption =
                  pageSizeOptions.find(
                    (opt) => opt.value === questionsPerPage,
                  ) || pageSizeOptions[0];
                return (
                  <DropdownSelect
                    isSearchable={false}
                    value={selectedOption}
                    onChange={(opt) =>
                      onChangeQuestionsPerPage(
                        opt?.value ? Number(opt.value) : 10,
                      )
                    }
                    options={pageSizeOptions}
                    placeholder="Per page"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                );
              })()}
            </div>
          </div>
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
                className={`border p-2 mr-2 text-xl rounded-md cursor-pointer ${currentPage === 1
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
                className={`border p-2 text-xl rounded-md cursor-pointer ${currentPage === totalPages || totalPages === 0
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
  isMeetingSidePanel,
  customHeight,
}) => {
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const filterIconRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropdownValue, setDropdownValue] = useState(
    type === "assessment" ? "Assessment Questions" : "Interview Questions",
  );

  // Map dropdown selection to backend-supported questionType filter
  const selectedQuestionType = useMemo(
    () =>
      dropdownValue === "Interview Questions" ? "Interview" : "Assignment",

    [dropdownValue],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [dropdownValue]);

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const [questionTypeFilterItems, setQuestionTypeFilterItems] = useState([]);
  const [difficultyLevelFilterItems, setDifficultyLevelFilterItems] = useState(
    [],
  );
  const [categoryFilterItems, setCategoryFilterItems] = useState([]);
  const [technologyFilterItems, setTechnologyFilterItems] = useState([]);
  const [areaFilterItems, setAreaFilterItems] = useState([]);
  const [mandatoryStatus, setMandatoryStatus] = useState({});

  // Temporary states for filter popup
  const [tempQuestionTypeFilterItems, setTempQuestionTypeFilterItems] =
    useState([]);
  const [tempDifficultyLevelFilterItems, setTempDifficultyLevelFilterItems] =
    useState([]);
  const [tempCategoryFilterItems, setTempCategoryFilterItems] = useState([]);
  const [tempTechnologyFilterItems, setTempTechnologyFilterItems] = useState(
    [],
  );
  const [tempAreaFilterItems, setTempAreaFilterItems] = useState([]);
  const [tempSelectedSkills, setTempSelectedSkills] = useState([]);
  const [tempSkillInput, setTempSkillInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tempSearchInput, setTempSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchInput,
    selectedSkills,
    difficultyLevelFilterItems,
    categoryFilterItems,
    technologyFilterItems,
    areaFilterItems,
    questionTypeFilterItems,
    selectedQuestionType,
  ]);

  // Handle adding search tag
  const handleAddSearchTag = (tag) => {
    if (tag && !selectedSkills.includes(tag)) {
      setSelectedSkills((prev) => [...prev, tag]);
    }
  };

  // Combine all filters for API call
  const apiFilters = useMemo(
    () => ({
      questionType: selectedQuestionType,
      page: currentPage,
      limit: itemsPerPage,
      // Search is combination of active search tags and current typed text
      search: [...selectedSkills, debouncedSearchInput].filter(Boolean),
      difficultyLevel: difficultyLevelFilterItems,
      category: categoryFilterItems,
      technology: technologyFilterItems,
      area: areaFilterItems,
      questionTypes: questionTypeFilterItems,
    }),
    [
      selectedQuestionType,
      currentPage,
      itemsPerPage,
      debouncedSearchInput,
      selectedSkills,
      difficultyLevelFilterItems,
      categoryFilterItems,
      technologyFilterItems,
      areaFilterItems,
      questionTypeFilterItems,
    ],
  );

  const {
    suggestedQuestions,
    questionBankUsageLimit,

    totalQuestions: totalQuestionsFromAPI,
    accessibleQuestions,
    lockedQuestions: lockedQuestionsCount,
    questionTypeFilter,
    typeBreakdown,
    isLoading,
    pagination,
  } = useQuestions(
    apiFilters,
    //   {
    //   questionType: selectedQuestionType,

    // }
  );

  useScrollLock(true);
  //<------v1.0.4--------
  // Show/hide Question Type filter based on dropdown selection
  const showQuestionTypeFilter = dropdownValue !== "Interview Questions";

  // Derive unique Category and Technology lists from data
  const uniqueCategories = useMemo(() => {
    if (!suggestedQuestions || suggestedQuestions.length === 0) return [];
    const set = new Set();
    suggestedQuestions.forEach((q) => {
      if (q?.category) {
        const categoryValue = String(q.category).trim();
        // Only add non-empty category values
        if (categoryValue) {
          set.add(categoryValue);
        }
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [suggestedQuestions]);

  const uniqueTechnologies = useMemo(() => {
    if (!suggestedQuestions || suggestedQuestions.length === 0) return [];
    const set = new Set();
    //console.log("suggestedQuestions", suggestedQuestions);
    suggestedQuestions.forEach((q) => {
      const techArr = Array.isArray(q?.technology) ? q.technology : [];
      techArr.forEach((t) => {
        if (t != null) {
          const techValue = String(t).trim();
          // Only add non-empty technology values
          if (techValue) {
            set.add(techValue);
          }
        }
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [suggestedQuestions]);

  const uniqueAreas = useMemo(() => {
    if (!suggestedQuestions || suggestedQuestions.length === 0) return [];
    const set = new Set();
    suggestedQuestions.forEach((q) => {
      if (q?.area) {
        const val = String(q.area).trim();
        if (val) set.add(val);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [suggestedQuestions]);

  const uniqueTopics = useMemo(() => {
    if (!suggestedQuestions || suggestedQuestions.length === 0) return [];
    const set = new Set();
    suggestedQuestions.forEach((q) => {
      if (q?.topic) {
        const val = String(q.topic).trim();
        if (val) set.add(val);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [suggestedQuestions]);

  // Build default filter section metadata
  const buildDefaultFiltrationData = useCallback(() => {
    const sections = [];
    if (showQuestionTypeFilter) {
      sections.push({
        id: 1,
        filterType: "Question Type",
        isOpen: false,
        options: [
          { type: "MCQ", isChecked: false },
          // Do not remove this commented code it needs to be used in the future.
          // { type: "Short", isChecked: false },
          // { type: "Long", isChecked: false },
          // { type: "Programming", isChecked: false },
          // { type: "Number", isChecked: false },
          { type: "Boolean", isChecked: false },
        ],
      });
    }
    const combinedCategories = Array.from(new Set([...uniqueCategories, ...categoryFilterItems, ...tempCategoryFilterItems]));
    sections.push({
      id: 2,
      filterType: "Category",
      isOpen: false,
      options: combinedCategories.map((c) => ({ value: c, isChecked: false })),
    });

    const combinedAreas = Array.from(new Set([...uniqueAreas, ...areaFilterItems, ...tempAreaFilterItems]));
    sections.push({
      id: 3,
      filterType: "Area",
      isOpen: false,
      options: combinedAreas.map((a) => ({ value: a, isChecked: false })),
    });

    const combinedTechs = Array.from(new Set([...uniqueTechnologies, ...technologyFilterItems, ...tempTechnologyFilterItems]));
    sections.push({
      id: 4,
      filterType: "Technology",
      isOpen: false,
      options: combinedTechs.map((t) => ({ value: t, isChecked: false })),
    });
    sections.push({
      id: 5,
      filterType: "Difficulty Level",
      isOpen: false,
      options: [
        { level: "Easy", isChecked: false },
        { level: "Medium", isChecked: false },
        { level: "Hard", isChecked: false },
      ],
    });
    return sections;
  }, [
    showQuestionTypeFilter,
    uniqueCategories,
    uniqueTechnologies,
    uniqueAreas,
    categoryFilterItems,
    tempCategoryFilterItems,
    areaFilterItems,
    tempAreaFilterItems,
    technologyFilterItems,
    tempTechnologyFilterItems,
  ]);
  //------v1.0.4-------->

  const [filtrationData, setFiltrationData] = useState([
    {
      id: 1,
      filterType: "QuestionType",
      isOpen: false,
      options: [
        { type: "MCQ", isChecked: false },
        // Do not remove this commented code it needs to be used in the future.
        // { type: "Short", isChecked: false },
        // { type: "Long", isChecked: false },
        // { type: "Programming", isChecked: false },
        // { type: "Number", isChecked: false },
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

  const [tempFiltrationData, setTempFiltrationData] = useState(
    JSON.parse(JSON.stringify(filtrationData)),
  );

  //<------v1.0.4--------
  // Keep filtration sections in sync with dropdown selection and available data
  useEffect(() => {
    const newFiltrationData = buildDefaultFiltrationData();
    setFiltrationData((prevData) => {
      // Only update if the data structure has actually changed
      if (JSON.stringify(prevData) !== JSON.stringify(newFiltrationData)) {
        return newFiltrationData;
      }
      return prevData;
    });
  }, [
    showQuestionTypeFilter,
    uniqueCategories.length,
    uniqueTechnologies.length,
    uniqueAreas.length,
    categoryFilterItems.length,
    tempCategoryFilterItems.length,
    areaFilterItems.length,
    tempAreaFilterItems.length,
    technologyFilterItems.length,
    tempTechnologyFilterItems.length,
  ]);

  // Keep popup temp state in sync when opening the popup
  useEffect(() => {
    if (isPopupOpen) {
      setTempFiltrationData(JSON.parse(JSON.stringify(filtrationData)));
      setTempQuestionTypeFilterItems(questionTypeFilterItems);
      setTempDifficultyLevelFilterItems(difficultyLevelFilterItems);
      setTempCategoryFilterItems(categoryFilterItems);
      setTempTechnologyFilterItems(technologyFilterItems);
      setTempAreaFilterItems(areaFilterItems);
      setTempSelectedSkills(selectedSkills);
      setTempSkillInput(skillInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPopupOpen]);

  const totalItems = suggestedQuestions.length;
  const totalPages = pagination?.totalPages || 1;

  // Respect plan limit: compute effective total pages based on accessibleQuestions
  const planAccessibleTotal =
    typeof accessibleQuestions === "number" ? accessibleQuestions : undefined;
  const accessibleTotalPages = planAccessibleTotal
    ? Math.max(1, Math.ceil(planAccessibleTotal / itemsPerPage))
    : totalPages;
  const effectiveTotalPages = Math.min(totalPages, accessibleTotalPages);

  const paginatedData = suggestedQuestions || [];

  // Determine locked items and prepare unlocked list for rendering
  const hasLockedOnPage = (paginatedData || []).some((q) => q?.isLocked);
  const unlockedPaginatedData = (paginatedData || []).filter(
    (q) => !q?.isLocked,
  );
  const lockedCount =
    typeof lockedQuestionsCount === "number"
      ? lockedQuestionsCount
      : (paginatedData || []).filter((q) => q?.isLocked).length;

  // Range label using accessible total (plan limit) when available
  const totalAvailable =
    planAccessibleTotal ?? pagination?.totalQuestions ?? totalItems;
  const startIndex =
    totalAvailable === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalAvailable);
  const beyondAccessible =
    typeof planAccessibleTotal === "number" &&
    currentPage > accessibleTotalPages;
  const rangeLabel =
    totalAvailable === 0
      ? "0/0"
      : beyondAccessible
        ? `${planAccessibleTotal}/${totalAvailable} ${totalAvailable > 1 ? "Questions" : "Question"
        }`
        : startIndex === endIndex
          ? `${endIndex}/${totalAvailable} ${totalAvailable > 1 ? "Questions" : "Question"
          }`
          : `${startIndex}-${endIndex}/${totalAvailable} ${totalAvailable > 1 ? "Questions" : "Question"
          }`;

  // Update mandatory status
  useEffect(() => {
    setMandatoryStatus((prev) => {
      const updatedStatus = { ...prev };
      (interviewQuestionsLists || interviewQuestionsList || []).forEach(
        (question) => {
          updatedStatus[question.questionId || question.id] =
            question.snapshot?.mandatory === "true" || false;
        },
      );
      return updatedStatus;
    });
  }, [interviewQuestionsList, interviewQuestionsLists]);

  // Handlers
  const handleToggle = (questionId, item) => {
    setMandatoryStatus((prev) => {
      const newStatus = !prev[questionId];
      notify.success(
        `Question marked as ${newStatus ? "mandatory" : "optional"}`,
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
    // Check if question is locked
    if (item.isLocked) {
      navigate("/account-settings/subscription");
      return;
    }

    if (type === "assessment") {
      const isDuplicate = addedSections.some((section) =>
        section.Questions.some((q) => q.questionId === item._id),
      );
      if (isDuplicate) {
        toast.error("This question has already been added to the assessment");
        return;
      }
      if (checkedCount >= questionsLimit) {
        toast.error(
          `You've reached the maximum limit of ${questionsLimit} questions`,
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
          // do not remove this line used in future
          // options: item.options.map(opt => ({
          //   optionText: opt.optionText || opt,
          //   isCorrect: opt.isCorrect || false
          // })),
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
      notify.success("Question Added Successfully!");
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
        notify.success("Question Added Successfully!");
      } catch (error) {
        toast.error("Failed to add question");
        console.error("Error adding question:", error);
      }
    }
  };

  const onClickCrossIcon = (skill) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const onClickLeftPaginationIcon = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const onClickRightPagination = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };



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
                  : opt,
              ),
            }
            : category,
        ),
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
                  : opt,
              ),
            }
            : category,
        ),
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
                  : opt,
              ),
            }
            : category,
        ),
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
                  : opt,
              ),
            }
            : category,
        ),
      );
      //------v1.0.4-------->
    }
  };



  const onClickRemoveQuestion = async (id) => {
    // console.log("item ID", id);
    if (type === "assessment") {
      // Remove question from assessment sections
      updateQuestionsInAddedSectionFromQuestionBank(sectionName, null, id);
      notify.success("Question removed successfully!");

      // console.log("addedSections", addedSections);
    } else if (
      type === "interviewerSection" ||
      (type === "feedback" && handleRemoveQuestion)
    ) {
      handleRemoveQuestion(id);
      setMandatoryStatus((prev) => ({ ...prev, [id]: false }));
      notify.success("Question removed successfully!");
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
    setTempSearchInput(searchInput);
    setTempFiltrationData(JSON.parse(JSON.stringify(filtrationData)));
    setIsPopupOpen(!isPopupOpen);
  };



  // SkeletonLoader.tsx
  const SkeletonLoader = () => {
    return (
      <div>
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



  // v1.0.8 <---------------------------------------------
  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);
  // v1.0.8 --------------------------------------------->

  return (
    <div className="h-full flex flex-col">

      {/* It's Implemented to avoid responsive issues  */}
      <HeaderBar
        rangeLabel={rangeLabel}
        questionsPerPage={itemsPerPage}
        onChangeQuestionsPerPage={(newSize) => setItemsPerPage(newSize)}
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
        type={type}
        isMeetingSidePanel={isMeetingSidePanel}
        onAddSearchTag={handleAddSearchTag}
      />

      {/* Active Filters - Shown outside when filter card is CLOSED */}
      {!isPopupOpen && (
        [...categoryFilterItems, ...areaFilterItems, ...technologyFilterItems, ...(showQuestionTypeFilter ? questionTypeFilterItems : []), ...difficultyLevelFilterItems, ...selectedSkills].length > 0 || searchInput
      ) && (
          <div className="flex flex-wrap items-center gap-2 px-6 py-2 flex-shrink-0">
            {categoryFilterItems.map(c => (
              <div key={`cat-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                <span className="font-medium">Category:</span> {capitalizeFirstLetter(c)}
                <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => { setCategoryFilterItems(prev => prev.filter(x => x !== c)); setTempCategoryFilterItems(prev => prev.filter(x => x !== c)); }} />
              </div>
            ))}
            {areaFilterItems.map(c => (
              <div key={`area-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                <span className="font-medium">Area:</span> {capitalizeFirstLetter(c)}
                <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => { setAreaFilterItems(prev => prev.filter(x => x !== c)); setTempAreaFilterItems(prev => prev.filter(x => x !== c)); }} />
              </div>
            ))}
            {technologyFilterItems.map(c => (
              <div key={`tech-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                <span className="font-medium">Technology:</span> {capitalizeFirstLetter(c)}
                <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => { setTechnologyFilterItems(prev => prev.filter(x => x !== c)); setTempTechnologyFilterItems(prev => prev.filter(x => x !== c)); }} />
              </div>
            ))}
            {showQuestionTypeFilter && questionTypeFilterItems.map(c => (
              <div key={`type-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                <span className="font-medium">Type:</span> {capitalizeFirstLetter(c)}
                <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => { setQuestionTypeFilterItems(prev => prev.filter(x => x !== c)); setTempQuestionTypeFilterItems(prev => prev.filter(x => x !== c)); }} />
              </div>
            ))}
            {difficultyLevelFilterItems.map(c => (
              <div key={`diff-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                <span className="font-medium">Difficulty:</span> {capitalizeFirstLetter(c)}
                <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => { setDifficultyLevelFilterItems(prev => prev.filter(x => x !== c)); setTempDifficultyLevelFilterItems(prev => prev.filter(x => x !== c)); }} />
              </div>
            ))}
            {selectedSkills.map(c => (
              <div key={`tag-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                <span className="font-medium">Tag:</span> {c}
                <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => { setSelectedSkills(prev => prev.filter(x => x !== c)); setTempSelectedSkills(prev => prev.filter(x => x !== c)); }} />
              </div>
            ))}
          </div>
        )}

      {/* Inline Filters Section */}
      {isPopupOpen && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm transition-shadow px-7 py-4 mx-4 mt-1 mb-4 z-10 relative">
          {/* Arrow pointing to filter icon */}
          <div
            className="absolute -top-2 right-[14px]"
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #e5e7eb',
            }}
          />
          <div
            className="absolute right-[14px]"
            style={{
              top: '-6px',
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderBottom: '7px solid white',
            }}
          />
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[16px] font-semibold text-gray-800">Filters</h2>

            {/* Action Buttons at the Top */}
            <div className="flex gap-3 items-center">
              <button
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium mr-2"
                onClick={() => {
                  setTempQuestionTypeFilterItems([]);
                  setTempDifficultyLevelFilterItems([]);
                  setTempCategoryFilterItems([]);
                  setTempTechnologyFilterItems([]);
                  setTempAreaFilterItems([]);
                  setTempSelectedSkills([]);
                  setTempSkillInput("");
                  setTempSearchInput("");
                  setTempFiltrationData(buildDefaultFiltrationData());

                  setQuestionTypeFilterItems([]);
                  setDifficultyLevelFilterItems([]);
                  setCategoryFilterItems([]);
                  setTechnologyFilterItems([]);
                  setAreaFilterItems([]);
                  setSelectedSkills([]);
                  setSkillInput("");
                  setSearchInput("");
                  setFiltrationData(buildDefaultFiltrationData());
                }}
              >
                Clear All
              </button>
              <button
                className="px-4 py-2 text-sm bg-custom-blue text-white rounded-md hover:bg-opacity-90 transition-colors font-medium"
                onClick={() => {
                  setQuestionTypeFilterItems(tempQuestionTypeFilterItems);
                  setDifficultyLevelFilterItems(tempDifficultyLevelFilterItems);
                  setCategoryFilterItems(tempCategoryFilterItems);
                  setTechnologyFilterItems(tempTechnologyFilterItems);
                  setAreaFilterItems(tempAreaFilterItems);
                  setSelectedSkills(tempSelectedSkills);
                  setSkillInput(tempSkillInput);
                  setSearchInput(tempSearchInput);
                  setFiltrationData(tempFiltrationData);
                }}
              >
                Apply
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* Row 1: Filter Dropdowns (no search bar) */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Render FilterDropdowns */}
              {tempFiltrationData.map((section) => {
                if (section.id === 1 && !showQuestionTypeFilter) return null;
                if (!section.options) return null;

                let activeItems = [];
                let setTempItems = () => { };
                let isRadio = false;

                switch (section.id) {
                  case 1:
                    activeItems = tempQuestionTypeFilterItems;
                    setTempItems = setTempQuestionTypeFilterItems;
                    break;
                  case 2:
                    activeItems = tempCategoryFilterItems;
                    setTempItems = setTempCategoryFilterItems;
                    isRadio = true;
                    break;
                  case 3:
                    activeItems = tempAreaFilterItems;
                    setTempItems = setTempAreaFilterItems;
                    isRadio = true;
                    break;
                  case 4:
                    activeItems = tempTechnologyFilterItems;
                    setTempItems = setTempTechnologyFilterItems;
                    break;
                  case 5:
                    activeItems = tempDifficultyLevelFilterItems;
                    setTempItems = setTempDifficultyLevelFilterItems;
                    isRadio = true;
                    break;
                  default:
                    break;
                }

                return (
                  <FilterDropdown
                    key={section.id}
                    label={section.filterType}
                    options={section.options}
                    selectedItems={activeItems}
                    onChange={setTempItems}
                    isRadio={isRadio}
                  />
                );
              })}
            </div>

            {/* Row 2: Active Filters */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider">Applied Filters:</h3>

              <div className="flex flex-wrap items-center gap-2 min-h-[28px]">
                {tempCategoryFilterItems.map(c => (
                  <div key={`cat-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                    <span className="font-medium">Category:</span> {capitalizeFirstLetter(c)}
                    <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => setTempCategoryFilterItems(prev => prev.filter(x => x !== c))} />
                  </div>
                ))}

                {tempAreaFilterItems.map(c => (
                  <div key={`area-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                    <span className="font-medium">Area:</span> {capitalizeFirstLetter(c)}
                    <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => setTempAreaFilterItems(prev => prev.filter(x => x !== c))} />
                  </div>
                ))}

                {tempTechnologyFilterItems.map(c => (
                  <div key={`tech-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                    <span className="font-medium">Technology:</span> {capitalizeFirstLetter(c)}
                    <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => setTempTechnologyFilterItems(prev => prev.filter(x => x !== c))} />
                  </div>
                ))}

                {showQuestionTypeFilter && tempQuestionTypeFilterItems.map(c => (
                  <div key={`type-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                    <span className="font-medium">Type:</span> {capitalizeFirstLetter(c)}
                    <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => setTempQuestionTypeFilterItems(prev => prev.filter(x => x !== c))} />
                  </div>
                ))}

                {tempDifficultyLevelFilterItems.map(c => (
                  <div key={`diff-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                    <span className="font-medium">Difficulty:</span> {capitalizeFirstLetter(c)}
                    <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => setTempDifficultyLevelFilterItems(prev => prev.filter(x => x !== c))} />
                  </div>
                ))}

                {tempSelectedSkills.map(c => (
                  <div key={`tag-${c}`} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                    <span className="font-medium">Tag:</span> {c}
                    <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => setTempSelectedSkills(prev => prev.filter(x => x !== c))} />
                  </div>
                ))}

                {tempSearchInput && (
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                    <span className="font-medium">Search:</span> "{tempSearchInput}"
                    <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => setTempSearchInput("")} />
                  </div>
                )}

                {[...tempCategoryFilterItems, ...tempAreaFilterItems, ...tempTechnologyFilterItems, ...(showQuestionTypeFilter ? tempQuestionTypeFilterItems : []), ...tempDifficultyLevelFilterItems, ...tempSelectedSkills].length === 0 && !tempSearchInput && (
                  <span className="text-sm text-gray-500 italic py-1">No filters currently applied.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )
      }

      {/* v1.0.5 -----------------------------------------------------------------> */}
      {
        isLoading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Content */}
            {/* v1.0.5 <----------------------------------------------------------------- */}
            {/* v1.0.7 <----------------------------------------------------------------------------------------- */}
            <div className="flex-1 min-h-0 flex flex-col sm:px-2 py-4">
              {/* Filters applied section moved to popup */}
              {/* v1.0.7 <----------------------------------------------------------------------- */}
              <ul
                // className="flex flex-col gap-4 pr-2 h-[calc(100vh-362px)] overflow-y-auto"
                className="flex flex-col flex-1 min-h-0 overflow-y-auto pb-8 px-4"
                style={customHeight ? { height: customHeight } : {}}
                onScroll={() => { if (isPopupOpen) setIsPopupOpen(false); }}
              >
                {/* Render only unlocked cards first */}
                {unlockedPaginatedData.length > 0
                  ? unlockedPaginatedData.map((item, index) => {
                    // Regular unlocked card
                    return (
                      <div
                        key={index}
                        className="border mb-4 rounded-lg h-full shadow-sm transition-shadow text-sm border-gray-200 hover:shadow-md"
                      >
                        <div className="flex justify-between items-center border-b border-gray-200 px-4">
                          {/* v1.0.6 <---------------------------------------------------------------------------- */}
                          <div className="flex items-start justify-start sm:w-[50%] md:w-[58%] w-[80%]">
                            <div className="flex items-center gap-2 justify-center rounded-md px-3 py-1 text-white text-sm transition-colors bg-custom-blue/80">
                              <p className="text-xs font-medium">
                                {item.technology[0]}
                              </p>
                            </div>
                          </div>
                          {/* v1.0.6 ----------------------------------------------------------------------------> */}
                          <div
                            className={`text-xs font-medium flex justify-center text-center p-2 sm:text-xs sm:border-0 border-r border-l border-gray-200 ${type === "interviewerSection" ||
                              type === "feedback" ||
                              type === "assessment"
                              ? "w-[15%]"
                              : "sm:w-[28%] md:w-[20%] w-[10%]"
                              } ${isMeetingSidePanel && "w-[20%] mx-4"}`}
                          >
                            <p
                              className={`w-16 text-center ${getDifficultyStyles(
                                item.difficultyLevel,
                              )} rounded-full py-1`}
                              title="Difficulty Level"
                            >
                              {item.difficultyLevel}
                            </p>
                          </div>
                          {fromScheduleLater && (
                            <div className="flex justify-center text-center h-12 sm:border-0 border-r border-gray-200">
                              <div className="flex items-center w-14 justify-center">
                                <button
                                  onClick={() => {
                                    if (
                                      interviewQuestionsLists?.some(
                                        (q) => q.questionId === item._id,
                                      )
                                    ) {
                                      handleToggle(item._id, item);
                                    }
                                  }}
                                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${mandatoryStatus[item._id]
                                    ? "bg-blue-100 border-custom-blue justify-end"
                                    : "bg-gray-200 border-gray-300 justify-start"
                                    }`}
                                  type="button"
                                >
                                  <span
                                    className={`w-3 h-3 rounded-full transition-colors ${mandatoryStatus[item._id]
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
                                {item.isLocked ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate("/account-settings/subscription")
                                    }
                                    className="text-xs font-medium sm:flex sm:items-center sm:justify-center bg-orange-500 py-1 px-2 text-white rounded-md transition-colors hover:bg-orange-600"
                                  >
                                    <Lock className="h-4 w-4 mr-1" />
                                    <span
                                      className={`${isMeetingSidePanel
                                        ? "hidden"
                                        : "sm:hidden inline"
                                        }`}
                                    >
                                      Upgrade
                                    </span>
                                  </button>
                                ) : interviewQuestionsLists?.some(
                                  (q) => q.questionId === item._id,
                                ) ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onClickRemoveQuestion(item?._id)
                                    }
                                    className="text-xs font-medium sm:flex sm:items-center sm:justify-center rounded-md md:ml-4 bg-gray-500 px-2 py-1 text-white hover:bg-gray-600 transition-colors"
                                  >
                                    <span
                                      className={`${isMeetingSidePanel
                                        ? "hidden"
                                        : "sm:hidden inline"
                                        }`}
                                    >
                                      Remove
                                    </span>
                                    <X className="h-4 w-4 inline md:hidden lg:hidden xl:hidden 2xl:hidden" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="text-xs font-medium sm:flex sm:items-center sm:justify-center bg-custom-blue py-1 px-2 text-white rounded-md transition-colors"
                                    onClick={() => onClickAddButton(item)}
                                  >
                                    <span
                                      className={`${isMeetingSidePanel
                                        ? "hidden"
                                        : "sm:hidden inline"
                                        }`}
                                    >
                                      Add
                                    </span>
                                    <Plus className="h-4 w-4 inline md:hidden lg:hidden xl:hidden 2xl:hidden" />
                                  </button>
                                )}
                              </div>
                            )}
                          {type === "assessment" && (
                            <div className="w-[8%] flex justify-center">
                              {addedSections.some((s) =>
                                s.Questions.some(
                                  (q) => q.questionId === item._id,
                                ),
                              ) ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onClickRemoveQuestion(item?._id)
                                  }
                                  className="text-xs font-medium sm:flex sm:items-center sm:justify-center rounded-md bg-red-500 px-2 py-1 text-white hover:bg-red-600 transition-colors"
                                >
                                  <span
                                    className={`${isMeetingSidePanel
                                      ? "hidden"
                                      : "sm:hidden inline"
                                      }`}
                                  >
                                    Remove
                                  </span>
                                  <X className="h-4 w-4 inline md:hidden lg:hidden xl:hidden 2xl:hidden" />
                                </button>
                              ) : (
                                // (
                                //   <span className="flex items-center sm:text-lg gap-2 text-green-600 font-medium py-1 px-1">
                                //     ✓ <span className="sm:hidden inline">Added</span>
                                //   </span>
                                // )
                                <button
                                  type="button"
                                  className={`text-xs font-medium sm:flex sm:items-center sm:justify-center bg-custom-blue py-1 sm:px-1 px-3 text-white rounded-md transition-colors ${addedSections.reduce(
                                    (acc, s) => acc + s.Questions.length,
                                    0,
                                  ) >= questionsLimit
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                    }`}
                                  onClick={() => onClickAddButton(item)}
                                  disabled={
                                    addedSections.reduce(
                                      (acc, s) => acc + s.Questions.length,
                                      0,
                                    ) >= questionsLimit
                                  }
                                >
                                  <span
                                    className={`${isMeetingSidePanel
                                      ? "hidden"
                                      : "sm:hidden inline"
                                      }`}
                                  >
                                    Add
                                  </span>
                                  <Plus className="h-4 w-4 inline md:hidden lg:hidden xl:hidden 2xl:hidden" />
                                </button>
                              )}
                            </div>
                          )}

                          {!type && !fromScheduleLater && (
                            <div className="flex justify-center relative">
                              <button
                                type="button"
                                className="text-xs font-medium border cursor-pointer rounded-md px-2 py-1 border-custom-blue transition-colors"
                                onClick={() => toggleDropdown(item._id)}
                              >
                                Add{" "}
                                <span
                                  className={`${isMeetingSidePanel
                                    ? "hidden"
                                    : "sm:hidden md:hidden inline"
                                    }`}
                                >
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
                        <div className="p-4 border-b relative">
                          <div className="flex items-start w-full pt-2 gap-2">
                            <span className="sm:text-sm font-semibold">
                              {(currentPage - 1) * itemsPerPage + index + 1}.
                            </span>
                            <p className="sm:text-sm text-gray-700 break-words w-full">
                              {item.questionText}
                            </p>
                          </div>
                          {/* {item.questionType === "MCQ" && item.options && (
                          <div className="mb-2 ml-12 mt-2">
                            <ul className="list-none">
                              {(() => {
                                const isAnyOptionLong = item.options.some(
                                  (option) => option.length > 55,
                                );
                                return item.options.map((option, idx) => (
                                  <li
                                    key={idx}
                                    className={`${isAnyOptionLong
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
                        )} */}
                          {item.questionType === "MCQ" && item.options && (
                            <div className="mb-2 ml-12 mt-2">
                              <ul className="list-none">
                                {(() => {
                                  const isAnyOptionLong = item.options.some(
                                    (option) =>
                                      (option?.optionText || option).length >
                                      55,
                                  );
                                  return item.options.map((option, idx) => (
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
                                      <span className="sm:text-sm text-gray-700">
                                        {/* 2. Access the text property of the object */}
                                        {typeof option === "object"
                                          ? option.optionText
                                          : option}
                                      </span>
                                    </li>
                                  ));
                                })()}
                              </ul>
                            </div>
                          )}
                          {/* do not remove this commented code used in future */}
                          {/* {item.questionType === "MCQ" && item.options && (
                          <div className="mb-2 ml-12 mt-2">
                            <ul className="list-none">
                              {(() => {
                                const isAnyOptionLong = item.options.some(
                                  (option) => (option?.optionText || option).length > 55
                                );

                                return item.options.map((option, idx) => (
                                  <li
                                    key={idx}
                                    className={`${
                                      isAnyOptionLong ? "block w-full" : "inline-block w-1/2"
                                    } mb-2`}
                                  >
                                    <span className="text-gray-700">
                                      {typeof option === 'object' ? option.optionText : option}
                                    </span>
                                  </li>
                                ));
                              })()}
                            </ul>
                          </div>
                        )} */}
                        </div>
                        <div className="p-4">
                          <p className="text-sm break-words whitespace-pre-wrap">
                            <span className="sm:text-sm font-medium text-gray-700">
                              Answer:{" "}
                            </span>
                            {/* <span className="sm:text-sm text-gray-600">
                            {item.questionType === "Programming"
                              ? renderSolutions(item.solutions)
                              : item.correctAnswer}
                          </span> */}
                            {/* do not remove this line used in future */}
                            <span className="text-gray-600">
                              {(() => {
                                if (item.questionType === "Programming") {
                                  return renderSolutions(item.solutions);
                                }

                                if (
                                  item.questionType === "MCQ" &&
                                  Array.isArray(item.options)
                                ) {
                                  const correctAnswers = item.options
                                    .map((opt, idx) => {
                                      const isObject = typeof opt === "object";
                                      const isCorrect = isObject
                                        ? opt.isCorrect === true
                                        : false;
                                      const text = isObject
                                        ? opt.optionText
                                        : opt;

                                      if (isCorrect) {
                                        // Use 97 for lowercase 'a', 98 for 'b', etc.
                                        // Use 65 for UPPERCASE 'A', 66 for 'B', etc.
                                        const letter = String.fromCharCode(
                                          97 + idx,
                                        );
                                        return `${letter}) ${text}`;
                                      }
                                      return null;
                                    })
                                    .filter(Boolean);

                                  return correctAnswers.length > 0
                                    ? correctAnswers.join(", ")
                                    : "No correct answer specified";
                                }

                                return item.correctAnswer || "N/A";
                              })()}
                            </span>
                          </p>
                          <p className="sm:text-sm font-medium pt-2">
                            Tags:{" "}
                            <span className="text-sm text-gray-600">
                              {Array.isArray(item.tags)
                                ? item.tags.join(", ")
                                : String(item.tags || "")}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })
                  : !hasLockedOnPage && (
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
                      <h2 className="sm:text-sm text-gray-700 font-semibold text-lg">
                        No Questions Found
                      </h2>
                      <p className="sm:text-sm text-gray-500">
                        Try again with different filter options
                      </p>
                    </div>
                  )}

                {/* Show a single lock banner at the end if any items are locked on this page */}
                {hasLockedOnPage && (
                  <div
                    key="locked-banner"
                    className="border rounded-lg shadow-sm transition-shadow text-sm border-gray-300 bg-gray-50"
                  >
                    <div className="relative min-h-[200px] flex items-center justify-center p-8">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Lock className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-700 font-medium text-lg mb-1">
                          You’ve reached your plan limit
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                          {planAccessibleTotal ?? accessibleQuestions ?? 0}{" "}
                          accessible •{" "}
                          {totalQuestionsFromAPI - accessibleQuestions ?? 0}{" "}
                          Questions available
                        </p>
                        <button
                          onClick={() =>
                            navigate("/account-settings/subscription")
                          }
                          className="px-6 py-2 bg-custom-blue text-white rounded-md hover:bg-custom-blue/90 transition-colors text-sm font-medium"
                        >
                          Upgrade to unlock
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </ul>
            </div>
          </>
        )
      }
    </div>
  );
};

export default SuggestedQuestionsComponent;
