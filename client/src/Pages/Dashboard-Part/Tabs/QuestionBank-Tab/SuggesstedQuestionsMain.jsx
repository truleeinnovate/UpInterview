import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { IoIosCloseCircleOutline, IoMdClose } from "react-icons/io";
import { FaPlus, FaAngleDown, FaAngleUp } from "react-icons/fa6";
import Popup from "reactjs-popup";
import { FaSearch } from "react-icons/fa";
import MyQuestionList from "./MyQuestionsListPopup.jsx";
// import Tooltip from "@mui/material/Tooltip";
import { Tooltip } from "@mui/material";

import { ReactComponent as IoIosArrowBack } from "../../../../icons/IoIosArrowBack.svg";
import { ReactComponent as IoIosArrowForward } from "../../../../icons/IoIosArrowForward.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import { useCustomContext } from "../../../../Context/Contextfetch.js";

// const SuggestedQuestionsComponent = ({interviewQuestionsList,setInterviewQuestionsList,questionBankPopupVisibility,section}) => {
//change done by Shashank on -[08/01/2025]
const SuggestedQuestionsComponent = ({
    sectionName,
    updateQuestionsInAddedSectionFromQuestionBank,
    interviewQuestionsList,
    setInterviewQuestionsList,
    questionBankPopupVisibility,
    section,
    // <-- (mansoor) added fromScheduleLater
    fromScheduleLater,
    interviewId,
    onAddQuestion,
    currentRoundIndex 
    // -->
}) => {

    const [tab, setTab] = useState(1);
    const {
        getInterviewerQuestions,
        suggestedQuestions,
        setSuggestedQuestions,
        interviewerSectionData,
        setInterviewerSectionData,
        suggestedQuestionsFilteredData,
        setSuggestedQuestionsFilteredData,
    } = useCustomContext();
    // const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    // const [suggestedQuestionsFilteredData, setSuggestedQuestionsFilteredData] = useState([])
    const [skillInput, setSkillInput] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [filteredTags, setFilteredTags] = useState(["html"]);
    const [currentPage, setCurrentPage] = useState(1);
    const [dropdownOpen, setDropdownOpen] = useState(null);
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
            // options:["Easy","Medium","Hard"]
            options: [
                { level: "Easy", isChecked: false },
                { level: "Medium", isChecked: false },
                { level: "Hard", isChecked: false },
            ],
        },
        {
            id: 3,
            isOpen: false,
            filterType: "Experiences",
            options: { min: 0, max: 0 },
        },
    ]);
    const [experienceRange, setExperienceRange] = useState({
        min: "",
        max: "",
    });
    const [questionTypeFilterItems, setQuestionTypeFilterItems] = useState([]);
    const [difficultyLevelFilterItems, setDifficultyLevelFilterItems] = useState(
        []
    );
    const itemsPerPage = 10;
    const totalPages = Math.ceil(
        suggestedQuestionsFilteredData.length / itemsPerPage
    );

    // Added by Shashank on [02/01/2025]: Feature to handle add question to interviewer section when clicked on add button

    const onClickAddButton = async (item, closeScorePopup) => {
        if (section === "assessment") {
            if (questionScore !== "") {
                const updatedItem = { ...item, score: questionScore };
                updateQuestionsInAddedSectionFromQuestionBank(sectionName, updatedItem);
                closeScorePopup();
                setQuestionScore("");
            } else {
                setQuestionScoreError("score is required");
                // alert("Please enter score to add the question")
            }
        } else {

            setInterviewQuestionsList((prev) => [...prev, item]);

            const url = `${process.env.REACT_APP_API_URL}/interview-questions/add-question`;

            const questionToAdd = {
                tenantId: "ten1",
                ownerId: "own1",
                questionId: item._id,
                source: "system",
                addedBy: "interviewer",
                snapshot: {
                    questionText: item.questionText,
                    correctAnswer: item.correctAnswer,
                    options: item.options,
                    skillTags: item.skill,
                },
            };

            const response = await axios.post(url, questionToAdd);
            if (response.data.success) {
                // getInterviewerQuestions()
                const addedQuestionUrl = `${process.env.REACT_APP_API_URL}/interview-questions/question/${item._id}`;
                const response2 = await axios.get(addedQuestionUrl);
                const newQuestion = response2.data.question;
                const formattedQuestion = {
                    id: newQuestion._id,
                    question: newQuestion.snapshot.questionText,
                    answer: newQuestion.snapshot.correctAnswer,
                    note: "",
                    notesBool: false,
                    isLiked: false,
                };
                setInterviewerSectionData((prev) => [...prev, formattedQuestion]);
            }

            // Update suggestedQuestions with the "isAdded" flag set to true
            const newList = suggestedQuestionsFilteredData.map((question) =>
                question._id === item._id ? { ...question, isAdded: true } : question
            );
            setSuggestedQuestionsFilteredData(newList);
            setSuggestedQuestions(newList);
        }
    };

    //changes made by shashank - [09/01/2025]F
    const [questionScore, setQuestionScore] = useState("");
    const [questionScoreError, setQuestionScoreError] = useState("");

    useEffect(() => {
        if (skillInput) {
            setFilteredTags(filterTagsData());
        } else {
            setFilteredTags([]);
        }
    }, [skillInput]);

    useEffect(() => {
        filterQuestions();
    }, [selectedSkills, questionTypeFilterItems, difficultyLevelFilterItems]);

    const filterTagsData = () => {
        const allTags = new Set();
        suggestedQuestions.forEach((question) => {
            question.tags.forEach((tag) => {
                allTags.add(tag.toLowerCase());
            });
        });
        const filteredTags = [...allTags].filter((tag) =>
            tag.includes(skillInput.toLowerCase())
        );
        return filteredTags;
    };

    const filterQuestions = () => {
        const filtered = suggestedQuestions.filter((question) => {
            const matchesTags =
                selectedSkills.length === 0 ||
                question.tags.some((tag) =>
                    selectedSkills.some((skill) =>
                        tag.toLowerCase().includes(skill.toLowerCase())
                    )
                );
            const matchesType =
                questionTypeFilterItems.length === 0 ||
                questionTypeFilterItems.includes(question.questionType.toLowerCase());

            const matchesDifficultyLevel =
                difficultyLevelFilterItems.length === 0 ||
                difficultyLevelFilterItems.includes(
                    question.difficultyLevel.toLowerCase()
                );
            return matchesTags && matchesType && matchesDifficultyLevel;
        });
        setSuggestedQuestionsFilteredData(filtered);
    };

    const onClickDropdownSkill = (tag) => {
        if (!selectedSkills.includes(tag)) {
            setSelectedSkills((prev) => [...prev, tag]);
            setSkillInput("");
        } else {
            toast.error(`${tag} already selected`);
        }
    };

    const onClickCrossIcon = (skill) => {
        const filteredList = selectedSkills.filter(
            (eachSkill) => eachSkill !== skill
        );
        setSelectedSkills(filteredList);
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
            suggestedQuestionsFilteredData.slice(
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
        const { checked } = e.target;
        setFiltrationData((prev) =>
            prev.map((category) => {
                if (category.id === id) {
                    return {
                        ...category,
                        options: category.options.map((option, index) => {
                            const matchedObj =
                                index === indx ? { ...option, isChecked: checked } : option;
                            return matchedObj;
                        }),
                    };
                }
                return category;
            })
        );

        const value = e.target.value;
        if (checked) {
            setDifficultyLevelFilterItems((prev) =>
                prev.includes(value) ? prev : [...prev, value]
            );
        } else {
            setDifficultyLevelFilterItems((prev) =>
                prev.filter((item) => item !== value)
            );
        }
    };

    const onChangeCheckboxInQuestionType = (e, id, indx) => {
        const { value, checked } = e.target;
        setFiltrationData((prev) =>
            prev.map((category) => {
                if (category.id === id) {
                    return {
                        ...category,
                        options: category.options.map((option, index) => {
                            const matchedObj =
                                index === indx ? { ...option, isChecked: checked } : option;
                            return matchedObj;
                        }),
                    };
                }
                return category;
            })
        );

        if (checked) {
            setQuestionTypeFilterItems((prev) =>
                prev.includes(value) ? prev : [...prev, value]
            );
        } else {
            setQuestionTypeFilterItems((prev) =>
                prev.filter((item) => item !== value)
            );
        }
    };

    const onChangeMinExp = (e) => {
        setExperienceRange((prev) => ({
            ...prev,
            min: +e.target.value,
        }));
    };

    const onChangeMaxExp = (e) => {
        setExperienceRange((prev) => ({
            ...prev,
            max: +e.target.value,
        }));
    };

    const onClickRemoveSelectedFilterItem = (indx, item) => {
        if (questionTypeFilterItems.includes(item)) {
            setQuestionTypeFilterItems((prev) =>
                prev.filter((itm, index) => itm !== item)
            );
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

            setDifficultyLevelFilterItems((prev) =>
                prev.filter((itm, index) => itm !== item)
            );
        }
    };

    const onClickRemoveQuestion = async (id) => {
        // alert(${id})
        try {
            const url = `${process.env.REACT_APP_API_URL}/interview-questions/question/${id}`;
            const response = await axios.delete(url);
            // alert(response.data.message)
            getInterviewerQuestions();
            const newList = suggestedQuestionsFilteredData.map((question) =>
                question._id === id ? { ...question, isAdded: false } : question
            );
            setSuggestedQuestionsFilteredData(newList);
            setInterviewQuestionsList((prev) =>
                prev.filter((each) => each._id !== id)
            );
            setSuggestedQuestions(newList);
        } catch (error) {
            console.error("error in deleting question", error);
        }
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
                {/* filter by question type */}
                <div className="p-2">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => onClickFilterQuestionItem(1)}
                    >
                        <h3 className="font-medium">Question Type</h3>
                        <button>
                            {filtrationData[0].isOpen ? <FaAngleUp /> : <FaAngleDown />}
                        </button>
                    </div>
                    {filtrationData[0].isOpen && (
                        <div>
                            <ul className="flex flex-col gap-2 pt-2">
                                {filtrationData[0].options.map((type, index) => (
                                    <li key={index} className="flex gap-2 cursor-pointer">
                                        <input
                                            checked={type.isChecked}
                                            className="w-4 cursor-pointer"
                                            value={type.type.toLowerCase()}
                                            id={`question-type-${type.type}`}
                                            type="checkbox"
                                            onChange={(e) =>
                                                onChangeCheckboxInQuestionType(e, 1, index)
                                            }
                                        />
                                        <label htmlFor={`question-type-${type.type}`}>
                                            {type.type}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                {/* filter by difficulty level */}
                <div className="p-2">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => onClickFilterQuestionItem(2)}
                    >
                        <h3 className="font-medium">Difficulty Level</h3>
                        <button>
                            {filtrationData[1].isOpen ? <FaAngleUp /> : <FaAngleDown />}
                        </button>
                    </div>
                    {filtrationData[1].isOpen && (
                        <div>
                            <ul className="flex flex-col gap-2 pt-2">
                                {filtrationData[1].options.map((type, index) => (
                                    <li key={index} className="flex gap-2 cursor-pointer">
                                        <input
                                            checked={type.isChecked}
                                            className="w-4 cursor-pointer"
                                            value={type.level.toLowerCase()}
                                            id={`question-type-${type.level}`}
                                            type="checkbox"
                                            onChange={(e) =>
                                                onChangeCheckboxInDifficultyLevel(e, 2, index)
                                            }
                                        />
                                        <label htmlFor={`question-type-${type.level}`}>
                                            {type.level}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                {/* filter by experience */}
                <div className="p-2">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => onClickFilterQuestionItem(3)}
                    >
                        <h3 className="font-medium">Experiences</h3>
                        <button>
                            {filtrationData[2].isOpen ? <FaAngleUp /> : <FaAngleDown />}
                        </button>
                    </div>
                    {filtrationData[2].isOpen && (
                        <div className="flex gap-3 pt-2">
                            <div className="flex gap-3 items-center">
                                <label htmlFor="min-exp">Min</label>
                                <input
                                    value={experienceRange.min}
                                    id="min-exp"
                                    type="number"
                                    className="w-[80px]  border-b-[1px] border-[#808080b0] outline-none"
                                    onChange={onChangeMinExp}
                                />
                            </div>
                            <div className="flex gap-3 items-center">
                                <label id="max-exp">Max</label>
                                <input
                                    value={experienceRange.max}
                                    htmlFor="max-exp"
                                    type="number"
                                    className="w-[80px]  border-b-[1px] border-[#80808092] outline-none"
                                    onChange={onChangeMaxExp}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    };
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const ReturnSearchFilterSection = () => {
        return (
            <div className={` flex gap-4 justify-between items-center`}>
                {/* <div className={` ${section==="Popup"?"w-[50%]":"w-1/2"}`}> */}
                <div
                    className={` ${section === "Popup" && !questionBankPopupVisibility
                        ? "w-[35%] "
                        : "w-1/2"
                        } `}
                >
                    {/* <div className={`${section==="Popup"?"w-full":" w-[300px]"} relative flex items-center rounded-md   border-[1.5px] border-[gray]`}> */}
                    <div
                        className={` ${section === "Popup" && !questionBankPopupVisibility
                            ? "w-[240px]"
                            : "w-[300px]"
                            }  relative flex items-center rounded-md   border-[1.5px] border-[gray]`}
                    >
                        <span className="text-custom-blue p-2">
                            <FaSearch />
                        </span>
                        <input
                            onChange={(e) => setSkillInput(e.target.value)}
                            value={skillInput}
                            type="search"
                            placeholder="Search by skills"
                            className="w-[85%] p-2 pr-none  h- outline-none "
                        />
                    </div>
                </div>
                {/* <div className={` ${section==="Popup"?"w-[60%]":"w-1/2"}  flex items-center justify-between`}> */}
                <div
                    className={`${section === "Popup" && !questionBankPopupVisibility
                        ? "w-[75%]"
                        : "w-[50%]"
                        }  flex items-center justify-between`}
                >
                    {/* <div className={`${section==="Popup"?"w-[250px] text-sm":" w-[300px]"} relative flex items-center rounded-md   border-[1.5px] border-[gray]`}> */}
                    <div
                        className={`${section === "Popup" && !questionBankPopupVisibility
                            ? "w-[240px] "
                            : " w-[300px]"
                            } relative flex items-center rounded-md   border-[1.5px] border-[gray]`}
                    >
                        {/* <span className={`${(section==="Popup" && !questionBankPopupVisibility )?"p-1":"p-2"} text-[#227a8a]`}><FaSearch /></span> */}
                        <span className={`p-2 text-[#227a8a]`}>
                            <FaSearch />
                        </span>
                        {/* <input type="search" placeholder="Search by Question Text" className={` p-2 pr-none border-none  h- outline-none ${(section==="Popup"&& !questionBankPopupVisibility)?"w-full":"w-[85%]"}`} /> */}
                        <input
                            type="search"
                            placeholder="Search by Question Text"
                            className={` p-2 pr-none border-none  h- outline-none w-[85%] `}
                        />
                    </div>
                    <div className="flex items-center ml-2">
                        <p className="text-custom-blue">
                            {suggestedQuestionsFilteredData.length} Questions{" "}
                        </p>
                    </div>
                    {/* <p className="font-bold">.</p> */}
                    <div className="flex p-2 items-center">
                        <p>
                            {currentPage}/{totalPages}
                        </p>
                    </div>
                    <div className="flex items-center">
                        <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                            <span
                                className={`border ${section === "Popup" && !questionBankPopupVisibility
                                    ? "p-1 mr-1"
                                    : "p-2 mr-2"
                                    }  text-xl sm:text-md md:text-md rounded-md ${currentPage === 0 ? " cursor-not-allowed" : ""
                                    }`}
                                onClick={onClickLeftPaginationIcon}
                            >
                                <IoIosArrowBack className="text-custom-blue" />
                            </span>
                        </Tooltip>
                        <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                            <span
                                onClick={onClickRightPagination}
                                disabled={currentPage === totalPages}
                                className={`border ${section === "Popup" && !questionBankPopupVisibility
                                    ? "p-1 mr-1 text-sm"
                                    : "p-2 mr-2 text-xl sm:text-md md:text-md"
                                    }  rounded-md cursor-pointer ${currentPage === totalPages ? "cursor-not-allowed" : ""
                                    }`}
                            >
                                <IoIosArrowForward className="text-custom-blue" />
                            </span>
                        </Tooltip>
                    </div>
                    <div className="relative">
                        <Popup
                            responsive={true}
                            trigger={
                                <button
                                    className={`${section === "Popup" && !questionBankPopupVisibility
                                        ? "text-sm p-1"
                                        : "p-2 mr-2"
                                        }  cursor-pointer text-xl sm:text-md md:text-md border rounded-md`}
                                >
                                    {isPopupOpen ? (
                                        <LuFilterX className="text-custom-blue" />
                                    ) : (
                                        <FiFilter className="text-custom-blue" />
                                    )}
                                </button>
                            }
                            onOpen={() => setIsPopupOpen(true)} // Set popup open state
                            onClose={() => setIsPopupOpen(false)} // Set popup close state
                        >
                            {(closeFilter) => (
                                <div className="absolute top-3 right-0 w-[300px] rounded-md bg-white border-[2px] border-[#80808086]">
                                    {FilterSection(closeFilter)}
                                </div>
                            )}
                        </Popup>
                    </div>
                </div>
            </div>
        );
    };

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

    const ReturnSuggestedQuestionsData = () => {
        // <-- (mansoor)

        const [mandatoryStatus, setMandatoryStatus] = useState({});

        const handleToggle = (questionId) => {
            setMandatoryStatus((prev) => {
                const updatedStatus = {
                    ...prev,
                    [questionId]: !prev[questionId],
                };
                return updatedStatus;
            });
        };

        const onClickForSchedulelater = async (item) => {
            try {
              const questionToAdd = {
                interviewId,
                questionId: item._id,
                source: "system",
                snapshot: item,
                order: "",
                customizations: "",
                mandatory: mandatoryStatus[item._id] ? "true" : "false",
                currentRoundIndex: currentRoundIndex
              };
          
              const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/interview-questions/add-question`,
                questionToAdd,
                { headers: { 'Content-Type': 'application/json' } }
              );
          
              const simulatedResponse = {
                data: {
                  success: true,
                  recordId: `record-${item._id}`,
                },
              };
          
              if (simulatedResponse.data.success) {
          
                if (onAddQuestion) {
                  onAddQuestion(questionToAdd); // Pass the question and index to the parent
                }
          
                toast.success("Question added successfully");
              }
            } catch (error) {
              toast.error("Failed to add question");
              console.error("Error adding question:", error);
            }
          };
          
        // -->
        return (
            <div
                className={` ${(section === "interviewerSection" || section === "assessment") &&
                    "w-[95%]"
                    } ${section === "Popup" && "w-full"}  p-4 w-full "`}
            >
                {ReturnSearchFilterSection()}
                {/* tags dropdown */}
                <ul className="absolute bg-white flex flex-col cursor-pointer gap-3 h-max max-h-[200px] overflow-auto shadow-md w-[300px] ">
                    {filteredTags.map((tag, index) => (
                        <li
                            key={index}
                            className=" px-4"
                            onClick={() => onClickDropdownSkill(tag)}
                        >
                            {tag}
                        </li>
                    ))}
                </ul>
                {/* selected skills section */}
                {selectedSkills && (
                    <ul className="my-4 flex gap-4 flex-wrap">
                        {selectedSkills.map((skill, index) => (
                            // <li key={index}>{skill}</li>
                            <li
                                key={index}
                                className="flex gap-2 items-center border-[1px] rounded-sm border-custom-blue px-4 w-max text-custom-blue"
                            >
                                <button>{skill}</button>
                                <span
                                    className="cursor-pointer"
                                    onClick={() => onClickCrossIcon(skill)}
                                >
                                    <IoMdClose />
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                {/*applied filters section  */}
                {[...questionTypeFilterItems, ...difficultyLevelFilterItems].length >
                    0 && (
                        <div className="flex items-center gap-3 my-4">
                            <h3 className="font-medium">Filters applied - </h3>
                            <ul className="flex gap-4">
                                {[...questionTypeFilterItems, ...difficultyLevelFilterItems].map(
                                    (filterItem, index) => (
                                        <li
                                            key={index}
                                            className="mt-2 flex  items-center gap-2 w-max round-sm border-[1px] border-[#227a8a] px-2 text-[#227a8a] font-medium"
                                        >
                                            <p>{filterItem}</p>
                                            <button
                                                onClick={() =>
                                                    onClickRemoveSelectedFilterItem(index, filterItem)
                                                }
                                            >
                                                <IoMdClose />
                                            </button>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}

                {/* questions */}
                {/* <ul  className={` ${section==="interviewerSection"|| section==="Popup"?"h-[63vh]":"h-[calc(100vh-350px)]"} flex flex-col gap-4 my-2 overflow-y-scroll  overflow-hidden text-sm pr-2 `}> */}
                {/* <ul
                    className={` ${section === "interviewerSection" ||
                        section === "assessment" ||
                        section === "Popup"
                        ? "h-[calc(100vh-280px)]"
                        : "h-[calc(100vh-250px)]"
                        } flex flex-col gap-4 my-2 overflow-y-scroll overflow-hidden pr-2 ${section === "Popup" ? "text-sm" : "text-base"
                        }`}
                > */}
                {/* mansoor, added fromScheduleLater for height - [14-01-2025] */}
                <ul
                    className={`${section === "interviewerSection" || section === "assessment" || section === "Popup"
                        ? "h-[calc(100vh-280px)]"
                        : fromScheduleLater
                            ? "h-[calc(100vh-300px)]"
                            : "h-[calc(100vh-250px)]"
                        } flex flex-col gap-4 my-2 overflow-y-scroll overflow-hidden pr-2 ${section === "Popup" ? "text-sm" : "text-base"
                        }`}
                >
                    {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                            <li key={index} className="border-[1px] border-[gray] rounded-md">
                                <div className="flex justify-between  items-center border-b-[1px] border-[gray]">
                                    {/* <h2 className="pl-4 font-medium text-sm w-[85%] ">{(currentPage - 1) * itemsPerPage + 1 + index}. {item.questionText}</h2> */}
                                    <h2 className="pl-4 font-medium  w-[85%] ">
                                        {(currentPage - 1) * itemsPerPage + 1 + index}.{" "}
                                        {item.questionText}
                                    </h2>

                                    <div
                                        className={`flex justify-center text-center p-2 border-r border-l border-[gray] ${section === "Popup" && !questionBankPopupVisibility
                                            ? "w-[15%]"
                                            : "w-[10%]"
                                            }`}
                                    >
                                        <p
                                            className={`w-20 text-center ${getDifficultyStyles(
                                                item.difficultyLevel
                                            )} rounded-md`}
                                            title="Difficulty Level"
                                        >
                                            {item.difficultyLevel}
                                        </p>
                                    </div>

                                    {/* <-- (mansoor) adding mandatory fromScheduleLater */}
                                    {fromScheduleLater && (
                                        <div className={`flex justify-center text-center h-12 border-r border-[gray]`}>

                                            <div className="flex items-center w-14 justify-center">
                                                <button
                                                    onClick={() => {
                                                        handleToggle(item._id);
                                                    }}
                                                    className={`w-10 h-5 flex text-center rounded-full p-1 border-2 ${mandatoryStatus[item._id] ? "bg-blue-100 border-custom-blue" : "bg-gray-200 border-gray-300"
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-2 h-2 ${mandatoryStatus[item._id] ? "bg-custom-blue" : "bg-gray-300"
                                                            } rounded-full transform transition ${mandatoryStatus[item._id] ? "translate-x-5" : "translate-x-0"
                                                            }`}
                                                    />
                                                </button>
                                            </div>

                                        </div>
                                    )}
                                    {/* --> */}

                                    {/*Changes done by Shashank,  Adding the Add button based on section */}
                                    {/* {(section === "Popup" || section === "interviewerSection") && */}
                                    {/* {(section === "Popup" || section==="assessment" || section === "interviewerSection") && */}
                                    {(section === "Popup" || section === "interviewerSection") && (
                                        <div
                                            className={`${section === "Popup" && !questionBankPopupVisibility
                                                ? "w-[15%]"
                                                : "w-[8%] "
                                                }  p-1 flex justify-center`}
                                        >
                                            {item.isAdded ? (
                                                <button
                                                    onClick={() => onClickRemoveQuestion(item._id)}
                                                    className={`rounded-sm bg-[gray] w-[80%] px-2 py-1  text-md text-white`}
                                                >
                                                    {" "}
                                                    Remove{" "}
                                                </button>
                                            ) : (
                                                <button
                                                    className="bg-custom-blue  w-[80%] text-md  py-1 px-1 text-white rounded-sm"
                                                    onClick={() => onClickAddButton(item)}
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
                                                <div className="w-[8%] flex justify-center">
                                                    <button
                                                        className="bg-custom-blue  w-[80%] text-md  py-1 px-1 text-white rounded-sm"
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
                                                                    setQuestionScore(e.target.value);
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
                                                                    onClickAddButton(item, closeScorePopup)
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

                                    {/* <-- (mansoor) adding "add" button when come from the fromScheduleLater */}
                                    {fromScheduleLater && (
                                        <div className="flex justify-center mx-3">
                                            <button
                                                className="bg-custom-blue w-full text-md py-1 px-3 text-white _=rounded-md"
                                                onClick={() => onClickForSchedulelater(item, index)}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    )}
                                    {/* --> */}

                                    {!section && !fromScheduleLater && ( // <-- (mansoor) added fromScheduleLater -->
                                        <div className="w-[5%] flex justify-center flex-grow-1 relative">
                                            <button
                                                className="border-[1px] cursor-pointer rounded-sm p-1 font-bold border-custom-blue text-custom-blue"
                                                onClick={() => toggleDropdown(item._id)}
                                            >
                                                {<FaPlus />}
                                            </button>
                                            {dropdownOpen === item._id && (
                                                <MyQuestionList
                                                    question={item}
                                                    closeDropdown={closeDropdown}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Changes done by Shashank on -[09/01/2025] */}
                                    {/* {RenderAddButtonBasedOnSection()} */}
                                </div>
                                <p className="p-3 pl-4 text-[gray]">
                                    <span>Answer : </span>
                                    {item.correctAnswer}
                                </p>
                                <p className="px-3 pl-4 pb-2 font-medium">
                                    Tags : {item.tags.join(", ")}
                                </p>
                            </li>
                        ))
                    ) : (
                        <div className="h-auto flex flex-col gap-4 justify-center items-center">
                            <h2 className="text-custom-blue font-semibold">
                                No question found
                            </h2>
                            <p className="text-custom-blue">
                                Try again with different filter options...!
                            </p>
                        </div>
                    )}
                </ul>
            </div>
        );
    };

    const ReturnMyQuestionsListData = () => {
        return <h1 className="p-8">My Questions list</h1>;
    };

    const DisplayTabsData = () => {
        switch (tab) {
            case 1:
                return ReturnSuggestedQuestionsData();
            case 2:
                return ReturnMyQuestionsListData();
        }
    };
    return <div className={`flex flex-col gap-4`}>{DisplayTabsData()}</div>;
};

export default SuggestedQuestionsComponent;
