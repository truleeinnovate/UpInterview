import React, { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import Popup from "reactjs-popup";
import MyQuestionList from "./MyQuestionsListPopup.jsx";
import { Tooltip } from "@mui/material";
import { XCircle, ChevronUp, ChevronDown, Search, X, Plus } from "lucide-react";
import { ReactComponent as IoIosArrowBack } from "../../../../icons/IoIosArrowBack.svg";
import { ReactComponent as IoIosArrowForward } from "../../../../icons/IoIosArrowForward.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
import { useQuestions } from "../../../../apiHooks/useQuestionBank.js";


const SuggestedQuestionsComponent = ({
  sectionName,
  updateQuestionsInAddedSectionFromQuestionBank,
  setInterviewQuestionsList,
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
//   const { suggestedQuestions, setSuggestedQuestions } = useCustomContext();
    const { suggestedQuestions,isLoading } = useQuestions();
  const [tab, setTab] = useState(1);
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [questionInput, setQuestionInput] = useState("");
  const filterIconRef = useRef(null);
    const [filteredTags, setFilteredTags] = useState(["html"]);


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
      isOpen: false,
      id: 2,
      filterType: "Difficulty Level",
      options: [
        { level: "Easy", isChecked: false },
        { level: "Medium", isChecked: false },
        { level: "Hard", isChecked: false },
      ],
    },
  ]);

  const [experienceRange, setExperienceRange] = useState({ min: "", max: "" });
  const [questionTypeFilterItems, setQuestionTypeFilterItems] = useState([]);
  const [difficultyLevelFilterItems, setDifficultyLevelFilterItems] = useState([]);
  const itemsPerPage = 10;

  // Derive filtered questions using useMemo
  const suggestedQuestionsFilteredData = useMemo(() => {
    return suggestedQuestions?.filter((question) => {
      const matchesTags =
        selectedSkills.length === 0 ||
        question.tags.some((tag) =>
          selectedSkills.some((skill) =>
            tag.toLowerCase().includes(skill.toLowerCase())
          ) ||
          (skillInput && tag.toLowerCase().includes(skillInput.toLowerCase()))
        );

      const matchesQuestionText =
        !questionInput ||
        question.questionText.toLowerCase().includes(questionInput.toLowerCase());

      const matchesType =
        questionTypeFilterItems.length === 0 ||
        questionTypeFilterItems.includes(question.questionType.toLowerCase());

      const matchesDifficultyLevel =
        difficultyLevelFilterItems.length === 0 ||
        difficultyLevelFilterItems.includes(question.difficultyLevel.toLowerCase());

      return matchesTags && matchesQuestionText && matchesType && matchesDifficultyLevel;
    });
  }, [suggestedQuestions, selectedSkills, skillInput, questionTypeFilterItems, difficultyLevelFilterItems, questionInput]);

  const totalPages = Math.ceil(suggestedQuestionsFilteredData?.length / itemsPerPage);

  useEffect(() => {
    if (removedQuestionIds && removedQuestionIds.length > 0) {
      const newList = suggestedQuestions.map((question) => ({
        ...question,
        isAdded: removedQuestionIds.includes(question._id) ? false : question.isAdded,
      }));
    //   setSuggestedQuestions(newList);
    }
  }, [removedQuestionIds]);

  const [mandatoryStatus, setMandatoryStatus] = useState({});

  useEffect(() => {
    setMandatoryStatus((prev) => {
      const updatedStatus = { ...prev };
      (interviewQuestionsLists || interviewQuestionsList || []).forEach((question) => {
        updatedStatus[question.questionId || question.id] =
          question.snapshot?.mandatory === "true" || false;
      });
      return updatedStatus;
    });
  }, [interviewQuestionsList, interviewQuestionsLists]);

  const handleToggle = (questionId, item) => {
    setMandatoryStatus((prev) => {
      const newStatus = !prev[questionId];
      const updatedStatus = { ...prev, [questionId]: newStatus };
      toast.success(`Question marked as ${newStatus ? "mandatory" : "optional"}`);

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

      return updatedStatus;
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
        toast.error(`You've reached the maximum limit of ${questionsLimit} questions`);
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
      toast.success("Question added successfully!");

      const newList = suggestedQuestions.map((question) =>
        question._id === item._id ? { ...question, isAdded: true } : question
      );
    //   setSuggestedQuestions(newList);
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

        const newList = suggestedQuestions.map((question) =>
          question._id === item._id ? { ...question, isAdded: true } : question
        );
        // setSuggestedQuestions(newList);
        toast.success("Question added successfully!");
      } catch (error) {
        toast.error("Failed to add question");
        console.error("Error adding question:", error);
      }
    }
  };

  const filterTagsData = () => {
    const allTags = new Set();
    suggestedQuestions.forEach((question) => {
      question.tags.forEach((tag) => {
        allTags.add(tag.toLowerCase());
      });
    });
    return [...allTags].filter((tag) =>
      tag.includes(skillInput.toLowerCase())
    );
  };

  useEffect(() => {
    setFilteredTags(skillInput ? filterTagsData() : []);
  }, [skillInput, suggestedQuestions]);

  const onClickDropdownSkill = (tag) => {
    if (!selectedSkills.includes(tag)) {
      setSelectedSkills((prev) => [...prev, tag]);
      setSkillInput("");
    } else {
      toast.error(`${tag} already selected`);
    }
  };

  const onClickCrossIcon = (skill) => {
    setSelectedSkills((prev) => prev.filter((eachSkill) => eachSkill !== skill));
  };

  const onClickLeftPaginationIcon = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const onClickRightPagination = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const paginatedData = useMemo(
    () =>
      suggestedQuestionsFilteredData?.slice(
        (currentPage - 1) * itemsPerPage,
        itemsPerPage * currentPage
      ),
    [suggestedQuestionsFilteredData, currentPage]
  );

  const onClickFilterQuestionItem = (id) => {
    setFiltrationData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  const onChangeCheckboxInDifficultyLevel = (e, id, indx) => {
    const { checked, value } = e.target;
    setFiltrationData((prev) =>
      prev.map((category) => {
        if (category.id === id) {
          return {
            ...category,
            options: category.options.map((option, index) =>
              index === indx ? { ...option, isChecked: checked } : option
            ),
          };
        }
        return category;
      })
    );

    setDifficultyLevelFilterItems((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const onChangeCheckboxInQuestionType = (e, id, indx) => {
    const { value, checked } = e.target;
    setFiltrationData((prev) =>
      prev.map((category) => {
        if (category.id === id) {
          return {
            ...category,
            options: category.options.map((option, index) =>
              index === indx ? { ...option, isChecked: checked } : option
            ),
          };
        }
        return category;
      })
    );

    setQuestionTypeFilterItems((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const onClickRemoveSelectedFilterItem = (item) => {
    if (questionTypeFilterItems.includes(item)) {
      setQuestionTypeFilterItems((prev) => prev.filter((itm) => itm !== item));
      setFiltrationData((prev) =>
        prev.map((category) =>
          category.id === 1
            ? {
                ...category,
                options: category.options.map((option) =>
                  option.type.toLowerCase() === item.toLowerCase()
                    ? { ...option, isChecked: false }
                    : option
                ),
              }
            : category
        )
      );
    } else if (difficultyLevelFilterItems.includes(item)) {
      setDifficultyLevelFilterItems((prev) => prev.filter((itm) => itm !== item));
      setFiltrationData((prev) =>
        prev.map((category) =>
          category.id === 2
            ? {
                ...category,
                options: category.options.map((option) =>
                  option.level.toLowerCase() === item.toLowerCase()
                    ? { ...option, isChecked: false }
                    : option
                ),
              }
            : category
        )
      );
    }
  };

  const onClickRemoveQuestion = async (id) => {
    if (type === "interviewerSection") {
      if (handleRemoveQuestion) {
        handleRemoveQuestion(id);
        setMandatoryStatus((prev) => ({ ...prev, [id]: false }));

        const newList = suggestedQuestions.map((question) =>
          question._id === id ? { ...question, isAdded: false } : question
        );
        // setSuggestedQuestions(newList);
        toast.error("Question removed successfully!");
      }
    } else {
      console.error("Failed to remove");
    }
  };

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [tempQuestionTypeFilterItems, setTempQuestionTypeFilterItems] = useState([]);
  const [tempDifficultyLevelFilterItems, setTempDifficultyLevelFilterItems] = useState([]);
  const [tempSelectedSkills, setTempSelectedSkills] = useState([]);
  const [tempSkillInput, setTempSkillInput] = useState("");
  const [tempExperienceRange, setTempExperienceRange] = useState({ min: "", max: "" });
  const [tempFiltrationData, setTempFiltrationData] = useState(JSON.parse(JSON.stringify(filtrationData)));

  const openFilterPopup = () => {
    setTempQuestionTypeFilterItems(questionTypeFilterItems);
    setTempDifficultyLevelFilterItems(difficultyLevelFilterItems);
    setTempSelectedSkills(selectedSkills);
    setTempSkillInput(skillInput);
    setTempExperienceRange(experienceRange);
    setTempFiltrationData(JSON.parse(JSON.stringify(filtrationData)));
    setIsPopupOpen(true);
  };

  const FilterSection = (closeFilter) => (
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
          <button>
            {tempFiltrationData[0].isOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
        {tempFiltrationData[0].isOpen && (
          <div>
            <ul className="flex flex-col gap-2 pt-2">
              {tempFiltrationData[0].options.map((type, index) => (
                <li key={index} className="flex gap-2 cursor-pointer">
                  <input
                    checked={tempQuestionTypeFilterItems.includes(type.type.toLowerCase())}
                    className="w-4 cursor-pointer"
                    value={type.type.toLowerCase()}
                    id={`question-type-${type.type}`}
                    type="checkbox"
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
                  <label htmlFor={`question-type-${type.type}`}>{type.type}</label>
                </li>
              ))}
            </ul>
          </div>
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
          <button>
            {tempFiltrationData[1].isOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
        {tempFiltrationData[1].isOpen && (
          <div>
            <ul className="flex flex-col gap-2 pt-2">
              {tempFiltrationData[1].options.map((type, index) => (
                <li key={index} className="flex gap-2 cursor-pointer">
                  <input
                    checked={tempDifficultyLevelFilterItems.includes(type.level.toLowerCase())}
                    className="w-4 cursor-pointer"
                    value={type.level.toLowerCase()}
                    id={`question-type-${type.level}`}
                    type="checkbox"
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
                  <label htmlFor={`question-type-${type.level}`}>{type.level}</label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const ReturnSearchFilterSection = () => (
    <div className={`fixed flex items-center justify-between ${(type === "interviewerSection" || type === "assessment") ? "top-40 left-12 right-12" : "top-32 left-5 right-5"}`}>
      <div>
        <div className="relative flex items-center rounded-md border">
          <span className="text-custom-blue p-2">
            <Search className="w-5 h-5" />
          </span>
          <input
            onChange={(e) => setSkillInput(e.target.value)}
            value={skillInput}
            type="search"
            placeholder="Search by skills"
            className="w-[85%] rounded-md focus:outline-none pr-2"
          />
        </div>
      </div>
      <div className="flex gap-x-3">
        <div className="relative flex items-center rounded-md border">
          <span className="p-2 text-custom-blue">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="search"
            placeholder="Search by Questions"
            className="w-[85%] rounded-md focus:outline-none pr-2"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <p>
              {currentPage}/{totalPages}
            </p>
          </div>
          <div className="flex items-center">
            <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
              <span
                onClick={onClickLeftPaginationIcon}
                className={`border p-2 mr-2 text-xl rounded-md cursor-pointer ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
              >
                <IoIosArrowBack />
              </span>
            </Tooltip>
            <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
              <span
                onClick={onClickRightPagination}
                className={`border p-2 text-xl rounded-md cursor-pointer ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
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
            <FilterPopup
              isOpen={isPopupOpen}
              onClose={() => setIsPopupOpen(false)}
              onApply={() => {
                setQuestionTypeFilterItems(tempQuestionTypeFilterItems);
                setDifficultyLevelFilterItems(tempDifficultyLevelFilterItems);
                setSelectedSkills(tempSelectedSkills);
                setSkillInput(tempSkillInput);
                setExperienceRange(tempExperienceRange);
                setFiltrationData(tempFiltrationData);
                setIsPopupOpen(false);
              }}
              onClearAll={() => {
                setTempQuestionTypeFilterItems([]);
                setTempDifficultyLevelFilterItems([]);
                setTempSelectedSkills([]);
                setTempSkillInput("");
                setTempExperienceRange({ min: "", max: "" });
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
                    isOpen: false,
                    id: 2,
                    filterType: "Difficulty Level",
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
                setExperienceRange({ min: "", max: "" });
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
                    isOpen: false,
                    id: 2,
                    filterType: "Difficulty Level",
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
              {FilterSection(() => setIsPopupOpen(false))}
            </FilterPopup>
          </div>
        </div>
      </div>
    </div>
  );

  const toggleDropdown = (questionId) => {
    setDropdownOpen(dropdownOpen === questionId ? null : questionId);
  };

  const closeDropdown = () => {
    setDropdownOpen(null);
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

  const ReturnSuggestedQuestionsData = () => (
    <div>
      <div className="h-full flex flex-col">
        <div className="z-50">{ReturnSearchFilterSection()}</div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 mt-[110px]">
          {selectedSkills.length > 0 && (
            <ul className="flex gap-2 flex-wrap px-4 pt-2">
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
          {[...questionTypeFilterItems, ...difficultyLevelFilterItems].length > 0 && (
            <div className="flex items-center flex-wrap px-4 pt-2 mb-3">
              <h3 className="font-medium text-gray-700 text-sm">Filters applied:</h3>
              <ul className="flex gap-2 flex-wrap">
                {[...questionTypeFilterItems, ...difficultyLevelFilterItems].map((filterItem, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-1 rounded-full border border-custom-blue px-3 py-1 text-custom-blue font-medium bg-blue-50 text-sm"
                  >
                    <span>{filterItem}</span>
                    <button
                      className="hover:text-red-500 transition-colors"
                      onClick={() => onClickRemoveSelectedFilterItem(filterItem)}
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex-1 min-h-0">
            <ul className="flex flex-col gap-4 pr-2">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg h-full shadow-sm hover:shadow-md transition-shadow text-sm"
                  >
                    <div className="flex justify-between items-center border-b border-gray-200 px-4">
                      <h2 className="font-medium w-[85%] text-gray-800">
                        {(currentPage - 1) * itemsPerPage + 1 + index}. {item.questionText}
                      </h2>
                      <div
                        className={`flex justify-center text-center p-2 border-r border-l border-gray-200 ${
                          type === "interviewerSection" || type === "assessment" ? "w-[15%]" : "w-[10%]"
                        }`}
                      >
                        <p
                          className={`w-16 text-center ${getDifficultyStyles(item.difficultyLevel)} rounded-full py-1`}
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
                                if (interviewQuestionsLists?.some((q) => q.questionId === item._id)) {
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
                                  mandatoryStatus[item._id] ? "bg-custom-blue" : "bg-gray-400"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                      {type === "interviewerSection" && (
                        <div className="p-1 flex justify-center w-[8%]">
                          {interviewQuestionsLists?.some((q) => q.questionId === item._id) ? (
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
                          {addedSections.some((s) => s.Questions.some((q) => q.questionId === item._id)) ? (
                            <span className="text-green-600 font-medium py-1 px-1">✓ Added</span>
                          ) : (
                            <button
                              type="button"
                              className={`bg-custom-blue w-[80%] py-1 px-1 text-white rounded-md transition-colors ${
                                addedSections.reduce((acc, s) => acc + s.Questions.length, 0) >= questionsLimit
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              onClick={() => onClickAddButton(item)}
                              disabled={addedSections.reduce((acc, s) => acc + s.Questions.length, 0) >= questionsLimit}
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
                            <MyQuestionList question={item} closeDropdown={closeDropdown} />
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
                        Tags: <span className="text-gray-600">{item.tags.join(", ")}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col gap-4 justify-center items-center text-center">
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
                  <h2 className="text-gray-700 font-semibold text-lg">No questions found</h2>
                  <p className="text-gray-500">Try again with different filter options</p>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const ReturnMyQuestionsListData = () => <h1 className="">My Questions list</h1>;

  return (
    <div>
      {tab === 1 ? (
        ReturnSuggestedQuestionsData()
      ) : tab === 2 ? (
        ReturnMyQuestionsListData()
      ) : (
        <div className="p-8 text-gray-500">No data available for this tab.</div>
      )}
    </div>
  );
};

export default SuggestedQuestionsComponent;