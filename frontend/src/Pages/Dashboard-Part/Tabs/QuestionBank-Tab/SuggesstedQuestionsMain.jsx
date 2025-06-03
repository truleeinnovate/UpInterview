import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
// import { toast } from 'react-toastify';
import toast from "react-hot-toast";
import Popup from "reactjs-popup";
import MyQuestionList from "./MyQuestionsListPopup.jsx";
import { Tooltip } from "@mui/material";
import { XCircle, ChevronUp, ChevronDown, Search, X, Plus } from 'lucide-react';

import { ReactComponent as IoIosArrowBack } from "../../../../icons/IoIosArrowBack.svg";
import { ReactComponent as IoIosArrowForward } from "../../../../icons/IoIosArrowForward.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { config } from "../../../../config.js";


const SuggestedQuestionsComponent = ({
    sectionName,
    updateQuestionsInAddedSectionFromQuestionBank,
    setInterviewQuestionsList,
    type,
    addedSections,
    questionsLimit,
    checkedCount,
    // <-- (mansoor) added fromScheduleLater
    fromScheduleLater,
    onAddQuestion,
    handleRemoveQuestion,
    handleToggleMandatory,
    interviewQuestionsList,
    interviewQuestionsLists,
    removedQuestionIds = []
    // -->
}) => {
    console.log("type:", type);

    console.log("removedQuestionIds", removedQuestionIds);


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


    useEffect(() => {

        setMandatoryStatus((prev) => {
            const updatedStatus = { ...prev };
            (interviewQuestionsLists ? interviewQuestionsLists : interviewQuestionsList).forEach((question) => {
                updatedStatus[question.questionId ? question.questionId : question.id] = question.mandatory === "true";
            });
            return updatedStatus;
        });
    }, [interviewQuestionsList, interviewQuestionsLists]);



    useEffect(() => {
        if (removedQuestionIds && removedQuestionIds.length > 0) {
            const newList = suggestedQuestionsFilteredData.map(question => ({
                ...question,
                isAdded: removedQuestionIds.includes(question._id) ? false : question.isAdded
            }));
            setSuggestedQuestionsFilteredData(newList);
            setSuggestedQuestions(newList);
        }
    }, [removedQuestionIds]);


    const [mandatoryStatus, setMandatoryStatus] = useState({});

    console.log("interviewQuestionsList", interviewQuestionsList);

    const handleToggle = (questionId, item) => {
        setMandatoryStatus((prev) => {
            const newStatus = !prev[questionId];
            const updatedStatus = {
                ...prev,
                [questionId]: newStatus,
            };
            toast.success(`Question marked as ${newStatus ? 'mandatory' : 'optional'}`);

            // Update the parent component with the new mandatory status
            if (handleToggleMandatory) {
                handleToggleMandatory(questionId, newStatus);
            }

            // If the question is already added, update its mandatory status in the parent
            if (interviewQuestionsLists.some((q) => q.questionId === questionId)) {
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
        console.log("item", item);

        if (type === "assessment") {

            const isDuplicate = addedSections.some(section =>
                section.Questions.some(q => q.questionId === item._id)
            );

            if (isDuplicate) {
                toast.error('This question has already been added to the assessment');
                return;
            }


            if (checkedCount >= questionsLimit) {
                toast.error(`You've reached the maximum limit of ${questionsLimit} questions`);
                return;
            }
            if (item) {
                // Prepare the question data according to your schema
                const questionToAdd = {
                    questionId: item._id,
                    source: "system", // or "custom"
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

                console.log("questionToAdd", questionToAdd);


                if (onAddQuestion) {
                    //   onAddQuestion(response.data.question); // Pass the question and index to the parent
                    onAddQuestion(questionToAdd,); // Pass the question and index to the parent
                }


                // setInterviewQuestionsList((prev) => ...prev, questionToAdd)
                // toast.success("Question added successfully");

                // setInterviewQuestionsList((prev) => [...prev, item]);
                // this logic is written by sashan but we no need to pass question to data base from here we need to work on this later(ashraf)
                // const url = `${config.REACT_APP_API_URL}/interview-questions/add-question`;

                // const questionToAdd = {
                //     tenantId: "ten1",
                //     ownerId: "own1",
                //     questionId: item._id,
                //     source: "system",
                //     addedBy: "interviewer",
                //     snapshot: {
                //         questionText: item.questionText,
                //         correctAnswer: item.correctAnswer,
                //         options: item.options,
                //         skillTags: item.skill,
                //     },
                // };

                // Update suggestedQuestions with the "isAdded" flag set to true
                const newList = suggestedQuestionsFilteredData.map((question) =>
                    question._id === item._id ? { ...question, isAdded: true } : question
                );
                setSuggestedQuestionsFilteredData(newList);
                setSuggestedQuestions(newList);
                toast.success("Question added successfully!");
            } catch (error) {
                toast.error("Failed to add question");
                console.error("Error adding question:", error);
            }
        }
    };

    //changes made by shashank - [09/01/2025]F

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
        if (type === 'interviewerSection') {
            if (handleRemoveQuestion) {
                handleRemoveQuestion(id)
                setMandatoryStatus(prev => ({
                    ...prev,
                    [id]: false
                }));



                const newList = (suggestedQuestionsFilteredData).map(question =>
                    question._id === id ? { ...question, isAdded: false } : question
                );
                setSuggestedQuestionsFilteredData(newList);
                setSuggestedQuestions(newList);

            }
            toast.success("Question removed successfully!");
        } else {


            try {
                const url = `${config.REACT_APP_API_URL}/interview-questions/question/${id}`;
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

        }
    };

    const FilterSection = (closeFilter) => {
        return (
            <>
                <div className="flex justify-between items-center p-2 border-b-[1px] border-[gray]">
                    <h3 className="font-medium">Filters</h3>
                    <button onClick={() => closeFilter()}>
                        <XCircle />
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
                            {filtrationData[0].isOpen ? <ChevronUp /> : <ChevronDown />}
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
                            {filtrationData[1].isOpen ? <ChevronUp /> : <ChevronDown />}
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
                            {filtrationData[2].isOpen ? <ChevronUp /> : <ChevronDown />}
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
            <div className={`flex sm:flex-col gap-4 justify-between items-center`}>
                <div
                    className={` ${type === "assessment" || type === "interviewerSection"
                        ? "w-[35%] sm:w-full"
                        : "w-full sm:w-full"
                        } `}
                >
                    <div
                        className={` ${type === "assessment" || type === "interviewerSection"
                            ? "w-[240px]"
                            : "w-[300px]"
                            }  relative flex items-center rounded-md border`}
                    // className="relative flex items-center rounded-md border w-[300px]"
                    >
                        <span className="text-custom-blue p-2">
                            <Search />
                        </span>
                        <input
                            onChange={(e) => setSkillInput(e.target.value)}
                            value={skillInput}
                            type="search"
                            placeholder="Search by skills"
                            className="w-[85%] p-2 pr-none  h-outline-none"
                        />
                    </div>
                </div>
                <div
                    className={`${type === "assessment" || type === "interviewerSection"
                        ? "w-[75%] sm:w-full"
                        : "w-1/2 sm:w-full"
                        }  flex items-center justify-end`}
                // className="flex items-center w-1/2 sm:w-full"
                >
                    <div
                        className={`${type === "assessment" || type === "interviewerSection"
                            ? "w-[240px]"
                            : "w-[200px] sm:w-full"
                            } relative flex items-center rounded-md border`}
                    >
                        <span className={`p-2 text-[#227a8a]`}>
                            <Search />
                        </span>
                        <input
                            type="search"
                            placeholder="Search by Question Text"
                            className={` p-2 pr-none border-none  h-outline-none w-[85%]`}
                        />
                    </div>
                    <div className="flex items-center ml-2 ">
                        <p className="text-custom-blue">
                            {suggestedQuestionsFilteredData.length} Questions{" "}
                        </p>
                    </div>
                    <div className="flex p-2 items-center">
                        <p>
                            {currentPage}/{totalPages}
                        </p>
                    </div>
                    <div className="flex items-center">
                        <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                            <span
                                className={`text-xl sm:text-md md:text-md rounded-md p-2 mr-2 ${currentPage === 0 ? " cursor-not-allowed" : ""
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
                                className={`rounded-md cursor-pointer ${currentPage === totalPages ? "cursor-not-allowed" : ""
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
                                    className="cursor-pointer text-xl sm:text-md md:text-md border rounded-md p-2 mr-2"
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
            </div >
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

        // const [mandatoryStatus, setMandatoryStatus] = useState({});

        // const handleToggle = (questionId) => {
        //     setMandatoryStatus((prev) => {
        //         const updatedStatus = {
        //             ...prev,
        //             [questionId]: !prev[questionId],
        //         };
        //         return updatedStatus;
        //     });
        // };

        // const onClickForSchedulelater = async (item) => {
        //     try {
        //         const questionToAdd = {
        //             questionId: item._id,
        //             source: "system",
        //             snapshot: item,
        //             order: "",
        //             customizations: "",
        //             mandatory: mandatoryStatus[item._id] ? "true" : "false",
        //         };

        //         //   const response = await axios.post(
        //         //     `${config.REACT_APP_API_URL}/interview-questions/add-question`,
        //         //     questionToAdd,
        //         //     { headers: { 'Content-Type': 'application/json' } }
        //         //   );

        //         //   const simulatedResponse = {
        //         //     data: {
        //         //       success: true,
        //         //       recordId: `record-${item._id}`,
        //         //     },
        //         //   };

        //         //   if (simulatedResponse.data.success) {

        //         if (onAddQuestion) {
        //             //   onAddQuestion(response.data.question); // Pass the question and index to the parent
        //             onAddQuestion(questionToAdd,); // Pass the question and index to the parent

        //         }
        //         toast.success("Question added successfully");
        //         //   }
        //     } catch (error) {
        //         toast.error("Failed to add question");
        //         console.error("Error adding question:", error);
        //     }
        // };

        // -->
        return (
            <div className={`p-4`}>
                {/* Search and Filter Section */}
                {ReturnSearchFilterSection()}

                {/* Selected skills section (UI improvement) */}
                {selectedSkills && (
                    <div className="my-4">
                        <ul className="flex gap-2 flex-wrap">
                            {selectedSkills.map((skill, index) => (
                                <li
                                    key={index}
                                    className="flex gap-2 items-center border border-custom-blue rounded-full px-3 py-1 text-custom-blue bg-blue-50 text-sm"
                                >
                                    <span>{skill}</span>
                                    <button
                                        className="cursor-pointer hover:text-red-500 transition-colors"
                                        onClick={() => onClickCrossIcon(skill)}
                                    >
                                        <X size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Applied filters section (UI improvement) */}
                {[...questionTypeFilterItems, ...difficultyLevelFilterItems].length > 0 && (
                    <div className="flex items-center gap-3 my-4 flex-wrap">
                        <h3 className="font-medium text-gray-700 text-sm">Filters applied:</h3>
                        <ul className="flex gap-2 flex-wrap">
                            {[...questionTypeFilterItems, ...difficultyLevelFilterItems].map(
                                (filterItem, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-1 rounded-full border border-[#227a8a] px-3 py-1 text-[#227a8a] font-medium bg-blue-50 text-sm"
                                    >
                                        <span>{filterItem}</span>
                                        <button
                                            className="hover:text-red-500 transition-colors"
                                            onClick={() =>
                                                onClickRemoveSelectedFilterItem(index, filterItem)
                                            }
                                        >
                                            <X size={14} />
                                        </button>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                )}

                {/* Questions list (UI improvement) */}
                <ul
                    className={`${type === "interviewerSection" ||
                        type === "assessment"
                        ? "h-[calc(100vh-280px)]"
                        : fromScheduleLater
                            ? "h-[calc(100vh-300px)]"
                            : "h-[calc(100vh-250px)]"
                        } flex flex-col gap-4 my-2 pr-2`}
                >
                    {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                            <li key={index} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center border-b border-gray-200 px-4">
                                    <h2 className="font-medium w-[85%] text-gray-800">
                                        {(currentPage - 1) * itemsPerPage + 1 + index}. {item.questionText}
                                    </h2>

                                    <div
                                        className={`flex justify-center text-center p-2 border-r border-l border-gray-200 ${(type === "interviewerSection" || type === "assessment") ? "w-[15%]" : "w-[10%]"}`}
                                    >
                                        <p
                                            className={`w-20 text-center text-sm ${getDifficultyStyles(
                                                item.difficultyLevel
                                            )} rounded-full px-2 py-1`}
                                            title="Difficulty Level"
                                        >
                                            {item.difficultyLevel}
                                        </p>
                                    </div>

                                    {/* Mandatory toggle for schedule later (UI improvement) */}
                                    {fromScheduleLater
                                        //  && item.isAdded && !removedQuestionIds.includes(item._id)
                                        && (
                                            <div className="flex justify-center text-center h-12 border-r border-gray-200">
                                                <div className="flex items-center w-14 justify-center">
                                                    <button
                                                        onClick={() => {
                                                            if (item.isAdded && !removedQuestionIds.includes(item._id)) {
                                                                handleToggle(item._id, item);
                                                            }
                                                            // handleToggle(item._id, item);
                                                        }}
                                                        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${mandatoryStatus[item._id]
                                                            ? "bg-blue-100 border-custom-blue justify-end"
                                                            : "bg-gray-200 border-gray-300 justify-start"
                                                            }`}
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

                                    {/* Add/Remove buttons for different sections (UI improvement) */}
                                    {(type === "interviewerSection") && (
                                        <div
                                            className="p-1 flex justify-center w-[8%]"
                                        >
                                            {item.isAdded && !removedQuestionIds.includes(item._id) ? (
                                                <button
                                                    onClick={() => onClickRemoveQuestion(item._id)}
                                                    className="rounded-md bg-gray-500 w-[80%] px-2 py-1 text-white hover:bg-gray-600 transition-colors text-sm"
                                                >
                                                    Remove
                                                </button>
                                            ) : (
                                                <button
                                                    className="bg-custom-blue w-[80%] py-1 px-1 text-white rounded-md transition-colors text-sm"
                                                    onClick={() => onClickAddButton(item)}
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {type === "assessment" && (
                                        <div className="w-[8%] flex justify-center">
                                            {addedSections.some(s => s.Questions.some(q => q.questionId === item._id)) ? (
                                                <span className="text-green-600 text-sm font-medium py-1 px-1">
                                                    ✓ Added
                                                </span>
                                            ) : (
                                                <button
                                                    className={`bg-custom-blue w-[80%] py-1 px-1 text-white rounded-md transition-colors text-sm ${addedSections.reduce((acc, s) => acc + s.Questions.length, 0) >= questionsLimit
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : ''
                                                        }`}
                                                    onClick={() => onClickAddButton(item)}
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


                                    {/* {fromScheduleLater && (
                                    <div className="flex justify-center mx-3">
                                        <button
                                            type="button"
                                            className="bg-custom-blue text-sm py-1 px-3 text-white rounded-md transition-colors"
                                            onClick={() => onClickForSchedulelater(item, index)}
                                        >
                                            Add
                                        </button>
                                    </div>
                                )} */}

                                    {/* Default dropdown for other sections (UI improvement) */}
                                    {!type && !fromScheduleLater && (
                                        <div className="w-[5%] flex justify-center relative">
                                            <button
                                                className="border cursor-pointer rounded-md p-1 font-bold border-custom-blue text-custom-blue transition-colors"
                                                onClick={() => toggleDropdown(item._id)}
                                            >
                                                <Plus />
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
                                        Tags: <span className="text-gray-600">{item.tags.join(", ")}</span>
                                    </p>
                                </div>
                            </li>
                        ))
                    ) : (
                        <div className="h-full flex flex-col gap-4 justify-center items-center text-center">
                            <div className="text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-gray-700 font-semibold text-lg">
                                No questions found
                            </h2>
                            <p className="text-gray-500">
                                Try again with different filter options
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
    return <div className={`flex flex-col`}>{DisplayTabsData()}</div>;
};

export default SuggestedQuestionsComponent;
