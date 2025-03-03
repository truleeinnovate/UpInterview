
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
  const onClickAddButton = async (
    listName,
    question,
    indx,
    closeScorePopup
  ) => {
    // console.log(question)
    if (section === "assessment") {
      if (questionScore !== "") {
        const updatedItem = { ...question, score: questionScore };
        updateQuestionsInAddedSectionFromQuestionBank(sectionName, updatedItem);
        closeScorePopup();
        setQuestionScore("");
      } else {
        setQuestionScoreError("score is required");
        // alert("Please enter score to add the question")
      }
    } else if (section === "interviewSection") {
      const requiredArray = myQuestionsList[listName];
      const requiredObj = requiredArray.map((item, index) =>
        index === indx ? { ...item, isAdded: true } : item
      );
      setMyQuestionsList((prev) => ({
        ...prev,
        [listName]: requiredObj,
      }));

      const url = `${process.env.REACT_APP_API_URL}/interview-questions/add-question`;

      const questionToAdd = {
        // id: interviewerSectionData.length + 1,
        tenantId: "tenantId1",
        ownerId: "ownerId1",
        questionId: question._id,
        source: "system",
        addedBy: "interviewer",
        snapshot: {
          questionText: question.questionText,
          correctAnswer: question.correctAnswer,
          options: question.options,
          skillTags: question.skill,
        },
      };
      const response = await axios.post(url, questionToAdd);
      if (response.data.success) {
        getInterviewerQuestions();
      }
      console.log("response from myquestions list question ", response);
    }
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

  return (
    <>
      {/* <div className="bg-white z-50 w-full p-4 border-2"> */}
      <div className="bg-white z-50 w-full px-4 ">
        {/* {objectPermissions.Create && ( */}
        <div
          className={`relative d-block   ${section === "interviewerSection" ? "flex justify-end " : ""
            }`}
        >
          <button
            className="text-md absolute top-[-50px] right-0"
            onClick={toggleSidebar}
          >
            <span className="text-custom-blue font-semibold ">
              Add Question
            </span>
          </button>
        </div>
        {/* )} */}

        <div
          className={` ${section === "interviewerSection" || section === "Popup"
            ? ""
            : "mt-2"
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-5 items-center ">
              <div className="relative inline-block w-48">
                {/* Dropdown Button */}
                <button
                  className="px-4 py-2 border text-sm rounded-md w-full text-left flex justify-between items-center"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedLabel || "Select a label"}
                  <svg
                    className={`w-4 h-4 transform ${isDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
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
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute mt-2 w-full max-h-40 overflow-y-auto bg-white border rounded-md shadow-lg z-10">
                    {Object.keys(groupedQuestions).map((listName, idx) => (
                      <div
                        key={idx}
                        className={`px-4 py-2 text-xs hover:bg-gray-100 cursor-pointer ${selectedLabel === listName
                          ? "bg-gray-200 font-semibold"
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
              <div>
                <button className="text-md" onClick={openListPopup}>
                  <span className="text-custom-blue font-semibold ">
                    Create New List
                  </span>
                </button>
              </div>
            </div>
            {/* filter section */}
            <div className="relative">
              <Popup
                responsive={true}
                trigger={
                  <button className="border rounded-md p-2">
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
                  <div className="absolute top-3 right-0 w-[300px] rounded-md bg-white border-[2px] border-[#80808086]">
                    {FilterSection(closeFilter)}
                  </div>
                )}
              </Popup>
            </div>
          </div>
          {/* If no label is selected */}
          {!selectedLabel && (
            <div className="flex justify-center items-center h-[calc(100vh-400px)]">
              <p className="text-lg font-semibold">Select a label</p>
            </div>
          )}
          {/* Render grouped questions with toggle UI */}
          {Object.entries(groupedQuestions || myQuestionsList).map(
            //  {Object.entries(filteredMyQuestionsList).map(
            ([listName, items]) => {
              // const filteredItems ;
              //  const items = useCallback(()=>ItemsFilterFunction(questionsList),[difficultyLevelFilterArray])
              return (
                selectedLabel === listName && (
                  <div key={listName} className="mt-4">
                    <div
                      className={` text-white flex  space-x-8 p-2 text-base justify-between items-center bg-custom-blue  font-semibold pr-5 cursor-pointer ${isOpen[listName] ? "rounded-t-md" : "rounded-md"
                        }`}
                    >
                      <p className="pr-4 ml-2 w-1/4">{listName}</p>
                      <div className="flex items-center">
                        {/* <p className="rounded px-3 py-2 mr-28 text-white cursor-pointer text-center"> */}
                        <p className="rounded px-3 py-2 mr-28  cursor-pointer text-center">
                          No. of Questions &nbsp; ({items.length})
                        </p>
                        <div className="relative">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleActionSection(listName)}
                            >
                              <MdMoreVert className="text-3xl" />
                            </button>
                            <div className="flex items-center text-3xl text-white">
                              <button onClick={() => toggleSection(listName)}>
                                {isOpen[listName] ? (
                                  <IoIosArrowUp />
                                ) : (
                                  <IoIosArrowDown />
                                )}
                              </button>
                            </div>
                          </div>
                          {actionViewMoreSection === listName && (
                            <div className="absolute z-10 w-24 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 right-0 mt-2 text-sm">
                              <div>
                                <p
                                  className="hover:bg-gray-200 text-custom-blue p-1 rounded text-center cursor-pointer"
                                  onClick={() => {
                                    items.forEach((item) => {
                                      handleEdit(item.listId, item.label);
                                    });
                                  }}
                                >
                                  Edit
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {isOpen[listName] && (
                      <div
                        // className="p-4 bg-[#eaf7fa] rounded-b-md border-t border-custom-blue overflow-y-auto h-[calc(100vh-310px)]"
                        className={`p-4 bg-[#eaf7fa] rounded-b-md border-t border-custom-blue overflow-y-auto ${(section === "interviewerSection")
                          ? "h-[62vh]  "
                          : "h-[calc(100vh-310px)]"
                          }`}
                      // style={{
                      //   height:
                      //     section === "interviewerSection" ||
                      //       section === "Popup"
                      //       ? "62vh"
                      //       : "h-[calc(100vh-310px)]",
                      // }}
                      // className={` ${section==="interviewerSection"?"h-[63vh]":"h-[calc(100vh-350px)]"} flex flex-col gap-4 my-2 overflow-y-scroll  overflow-hidden text-sm"`}
                      >
                        {items.map((question, index) => (
                          <div
                            key={index}
                            className="border border-gray-300 mb-4 bg-white rounded-md"
                          >
                            <div className="flex justify-between items-center border-b pb-2 mb-2 p-2">
                              <p className="flex items-start">
                                <span
                                  // className={"text-lg font-semibold ml-1 w-32"}
                                  className={"w-[30px] font-semibold"}
                                >
                                  {index + 1} .
                                </span>
                                {/* <span className="opacity-75 font-medium -ml-24"> */}
                                <span className="opacity-75 font-medium whitespace-normal">
                                  {question.questionText}
                                </span>
                              </p>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm border-white px-2 py-1 ml-3 w-20 text-center rounded-md ${question.isCustom
                                    ? "bg-purple-300"
                                    : "bg-blue-200"
                                    }`}
                                  title="Difficulty Level"
                                >
                                  {question.isCustom ? "Custom" : "System"}
                                </span>

                                <span
                                  className={`w-20 text-center text-sm ${getDifficultyStyles(
                                    question.difficultyLevel
                                  )} rounded-md`}
                                  title="Difficulty Level"
                                >
                                  {question.difficultyLevel}
                                </span>
                                {/* // Added by Shashank on [02/01/2025]: Feature to handle add question to interviewer section when clicked on add button */}
                                {/* { (section==="Popup"||section==="interviewerSection")&& */}
                                {/* { (section==="Popup"||section==="interviewerSection" || section==="assessment")&& */}
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
                                          className={`  rounded-sm bg-[gray] w-[100%] px-2 py-1  text-md text-white `}
                                        >
                                          {" "}
                                          Remove{" "}
                                        </button>
                                      ) : (
                                        <button
                                          className="bg-custom-blue  w-[100%] text-md  py-1 px-1 text-white rounded-sm"
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
                                  <Popup
                                    onClose={() => setQuestionScoreError("")}
                                    offsetX={-50}
                                    trigger={
                                      <div className="w-[full] flex justify-center">
                                        <button
                                          className="bg-custom-blue  w-[full] text-md  py-1 px-1 text-white rounded-sm"
                                        //  onClick={() => onClickAddButton(item)}
                                        >
                                          Add
                                        </button>
                                      </div>
                                    }
                                  >
                                    {(closeScorePopup) => (
                                      <div className="">
                                        <div className=" bg-white flex flex-col gap-4 p-4 rounded-sm shadow-lg  ">
                                          <div className="flex flex-col gap-2">
                                            <label
                                              htmlFor="assessment-section-score"
                                              className="text-black"
                                            >
                                              Score
                                            </label>
                                            <input
                                              value={questionScore}
                                              id="assessment-section-score"
                                              type="number"
                                              placeholder="Score"
                                              className=" px-2 py-1 rounded-sm border-[2px] border-[#80808030]  outline-none"
                                              onChange={(e) => {
                                                setQuestionScore(
                                                  e.target.value
                                                );
                                                setQuestionScoreError("");
                                              }}
                                            />
                                            {questionScoreError && (
                                              <p className="text-[red] text-sm">
                                                score is required*
                                              </p>
                                            )}
                                          </div>
                                          <div className="self-end flex justify-end">
                                            <button
                                              className="bg-custom-blue rounded-sm px-2 py-[0.5] text-white "
                                              onClick={() =>
                                                onClickAddButton(
                                                  listName,
                                                  question,
                                                  index,
                                                  closeScorePopup
                                                )
                                              }
                                            >
                                              Add
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Popup>
                                )}

<div
  className={`relative text-center mt-1 ${
    question.isCustom ? "w-8 visible" : "hidden"
  }`}
>
  <button onClick={() => toggleDropdown(question._id)}>
    <span className="text-xl">
      <MdMoreVert />
    </span>
  </button>
  {dropdownOpen === question._id && (
    <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg">
      <p
        className="px-2 py-1 text-sm cursor-pointer hover:bg-gray-200"
        onClick={() => handleEditClick(question)}
      >
        Edit
      </p>
    </div>
  )}
</div>


                                {/* )} */}
                              </div>
                            </div>
                            {question.questionType === "MCQ" &&
                              question.options && (
                                <div className="mb-2 ml-10">
                                  <div>
                                    <ul className="list-none">
                                      {(() => {
                                        const isAnyOptionLong =
                                          question.options.some(
                                            (option) => option.length > 55
                                          );

                                        return question.options.map(
                                          (option, idx) => (
                                            <li
                                              key={idx}
                                              style={{
                                                display: isAnyOptionLong
                                                  ? "block"
                                                  : "inline-block",
                                                width: isAnyOptionLong
                                                  ? "100%"
                                                  : "50%",
                                                marginBottom: "0.5rem",
                                              }}
                                            >
                                              <span
                                                style={{
                                                  marginRight: "0.5rem",
                                                }}
                                              >
                                                {String.fromCharCode(97 + idx)})
                                              </span>
                                              <span>{option}</span>
                                            </li>
                                          )
                                        );
                                      })()}
                                    </ul>
                                  </div>
                                </div>
                              )}

                            <p className="flex gap-4 ml-2 mb-2">
                              <span
                                className="text-sm font-semibold"
                                style={{ width: "120px" }}
                              >
                                Answer:{" "}
                              </span>
                              <span className="opacity-75 text-sm -ml-16 text-gray-800">
                                {question.questionType === "MCQ" &&
                                  question.options
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
            // callmaindata={handleDataAdded}
            setSelectedLabelnew={setSelectedLabel}
          />
        </div>
      </div>
      {showNewCandidateContent && (
        <Editassesmentquestion
          section={section}
          questionBankPopupVisibility={questionBankPopupVisibility}
          onClose={handleclose}
          question={showNewCandidateContent}
          isEdit={true}
          // onDataAdded={handleDataAdded}
        />
      )}

      {sidebarOpen && (
        <Sidebar
          sectionName={sectionName}
          assessmentId={assessmentId}
          updateQuestionsInAddedSectionFromQuestionBank={updateQuestionsInAddedSectionFromQuestionBank}
          section={section}
          questionBankPopupVisibility={questionBankPopupVisibility}
          onClose={closeSidebar}
          onOutsideClick={handleOutsideClick}
          // onDataAdded={handleDataAdded}
        />
      )}
    </>
  );
};

export default MyQuestionsList;
