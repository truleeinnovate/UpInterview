import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Sidebar from "../QuestionBank-Tab/QuestionBank-Form.jsx";
import axios from "axios";
import { fetchFilterData } from "../../../../utils/dataUtils.js";
import Cookies from "js-cookie";
import Editassesmentquestion from "./QuestionBank-Form.jsx";

import { ReactComponent as IoIosArrowDown } from '../../../../icons/IoIosArrowDown.svg';
import { ReactComponent as IoIosArrowUpBlack } from '../../../../icons/IoIosArrowDownBlack.svg';
import { ReactComponent as IoIosArrowDownBlack } from '../../../../icons/IoIosArrowDownBlack.svg';
import { ReactComponent as IoIosArrowUp } from '../../../../icons/IoIosArrowUp.svg';
import { ReactComponent as IoIosAdd } from '../../../../icons/IoIosAdd.svg';
import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as FaArrowRight } from '../../../../icons/FaArrowRight.svg';
import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { ReactComponent as FaStar } from '../../../../icons/FaStar.svg';
import { ReactComponent as CiStar } from '../../../../icons/CiStar.svg';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as MdMoreVert } from '../../../../icons/MdMoreVert.svg';
import { ReactComponent as MdModeEditOutline } from '../../../../icons/MdModeEditOutline.svg';
import { ReactComponent as ContentAdd } from '../../../../icons/ContentAdd.svg';

const InterviewDetails = ({
  questionProfile,
  onCloseprofile,
  sharingPermissions,
}) => {
  const userId = Cookies.get("userId");
  const orgId = Cookies.get("organizationId");

  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [favoriteQuestions, setFavoriteQuestions] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isOpen, setIsOpen] = useState({
    interview: false,
    mcq: false,
    shortText: false,
    longText: false,
    programming: false,
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [filled, setFilled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const toggleDropdown = (questionId) => {
    setDropdownOpen(dropdownOpen === questionId ? null : questionId);
  };

  const fetchSuggestedQuestions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/suggestedquestions/${questionProfile.SkillName}`,
        {
          params: { userId },
        }
      );
      const questions = response.data;
      setSuggestedQuestions(questions);

      // const favoriteResponse = await axios.get(
      //   `${process.env.REACT_APP_API_URL}/favoritequestions/${userId}`
      // );
      // const favoriteQuestionIds = favoriteResponse.data.map((q) => q._id);
      // setFavoriteQuestions(favoriteQuestionIds);

      // console.log("Suggested Questions:", questions);
    } catch (error) {
      console.error("Error fetching suggested questions:", error);
    }
  };

  const fetchMyQuestions = async () => {
    try {
      const allQuestions = await fetchFilterData(
        "newquestion",
        sharingPermissions
      );

      const filteredQuestions = allQuestions.filter(
        (question) => question.Skill === questionProfile.SkillName
      );

      setMyInterviewQuestions(
        filteredQuestions.filter(
          (q) => q.QuestionType === "Interview Questions"
        )
      );
      setMyMCQQuestions(
        filteredQuestions.filter((q) => q.QuestionType === "MCQ")
      );
      setMyShortAnswerQuestions(
        filteredQuestions.filter(
          (q) => q.QuestionType === "Short Text(Single Line)"
        )
      );
      setMyLongAnswerQuestions(
        filteredQuestions.filter(
          (q) => q.QuestionType === "Long Text(Paragraph)"
        )
      );
      setMyProgrammingQuestions(
        filteredQuestions.filter((q) => q.QuestionType === "Programming")
      );
    } catch (error) {
      console.error("Error fetching my questions:", error);
    }
  };

  useEffect(() => {

    fetchSuggestedQuestions();
    fetchMyQuestions();
  }, [questionProfile.SkillName, userId]);


  const toggleSection = (section) => {
    setIsOpen((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

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
  // renderQuestions related to Suggested Question tab ans also in suggested there are related favorite also 
  // renderMyQUestions related to My Question tab


  const [newListName, setNewListName] = useState("");
  const [createdLists, setCreatedLists] = useState([]);
  const [selectedListIds, setSelectedListIds] = useState([]);
  const [showNewListPopup, setShowNewListPopup] = useState(false);
  const fetchLists = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/lists/${userId}`);
      setCreatedLists(response.data);
      console.log("Created Lists:", response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };
  useEffect(() => {
    fetchLists();
  }, [userId]);

  const [actionViewMoreSection, setActionViewMoreSection] = useState({});

  const toggleActionSection = (sectionIndex) => {
    // If the clicked section is already open, close it; otherwise, open the clicked section
    setActionViewMoreSection((prev) => (prev === sectionIndex ? null : sectionIndex));
  };

  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionName, setSectionName] = useState('');

  // Function to handle edit click
  const handleEditsection = (id, name) => {
    setEditingSectionId(id);
    setSectionName(name);
    setActionViewMoreSection(false);
  };

  // Function to save the edited section name
  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lists/${editingSectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: sectionName }),
      });
    } catch (error) {
      console.error('Error updating section name:', error);
    } finally {
      setEditingSectionId(null);
      setSectionName('');
      fetchLists();
    }
  };


  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [currentListId, setCurrentListId] = useState(null);


  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  // const [questionToDelete, setQuestionToDelete] = useState(null);
  const [listToDeleteFrom, setListToDeleteFrom] = useState(null);

  const deletefavquestion = async (questionId, listId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/lists/${listId}/remove-question`, {
        data: { questionId }
      });
      fetchLists(); // Refresh the lists after deletion
    } catch (error) {
      console.error('Error deleting favorite question:', error);
    }
  };

  const handleDeleteClickfav = (questionId, listId) => {
    setQuestionToDelete(questionId);
    setListToDeleteFrom(listId);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (questionToDelete && listToDeleteFrom) {
      deletefavquestion(questionToDelete, listToDeleteFrom);
    }
    setShowDeleteConfirmation(false);
    setQuestionToDelete(null);
    setListToDeleteFrom(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setQuestionToDelete(null);
    setListToDeleteFrom(null);
  };


  const [showDeleteListConfirmation, setShowDeleteListConfirmation] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);

  // Function to handle delete list click
  const handleDeleteListClick = (listId) => {
    setListToDelete(listId);
    setShowDeleteListConfirmation(true);
  };

  const cancelDeleteList = () => {
    setShowDeleteListConfirmation(false);
    setListToDelete(null);
  };

  const confirmDeleteList = async () => {
    if (listToDelete) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/lists/${listToDelete}`);
        fetchLists(); // Refresh the lists after deletion
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
    setShowDeleteListConfirmation(false);
    setListToDelete(null);
  };

  // for favarate list section
  const renderFavoriteQuestionsSections = () => {
    if (!createdLists.length || !suggestedQuestions.length) {
      return <p>No created lists or suggested questions available.</p>;
    }

    const suggestedQuestionsMap = suggestedQuestions.reduce((acc, question) => {
      acc[question._id] = question;
      return acc;
    }, {});

    return createdLists.map((list) => {
      const matchedQuestions = list.questions.map((questionId) => suggestedQuestionsMap[questionId]).filter(Boolean);

      return (
        <div key={list._id} className="mt-4">
          <div
            className={`flex space-x-8 p-2 text-md justify-between items-center bg-custom-blue text-white font-semibold pr-5 cursor-pointer ${isOpen[list._id] ? 'rounded-t-md' : 'rounded-md'}`}
          // onClick={() => toggleSection(list._id)}
          >
            <p className="pr-4 ml-2 w-1/4">{list.name}</p>
            <p className="rounded px-3 py-2 ml-4 text-white cursor-pointer text-center">
              No.of Questions &nbsp; ({matchedQuestions.length})
            </p>
            <div className="relative">
              <div className="flex items-center">
                <button onClick={() => toggleActionSection(list._id)}>
                  <MdMoreVert className="text-3xl" />
                </button>
                <div className={`flex items-center text-3xl ml-3 mr-3 text-white`} onClick={() => toggleSection(list._id)}>
                  {isOpen[list._id] ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </div>
              </div>
              {actionViewMoreSection === list._id && (
                <div className="absolute z-10 w-24 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 right-0 mt-2 text-sm">
                  <div>
                    <p className="hover:bg-gray-200 text-custom-blue p-1 rounded text-center cursor-pointer" onClick={() => handleEditsection(list._id, list.name)}>
                      Edit
                    </p>
                  </div>
                  <div >
                    <p className="hover:bg-gray-200 text-custom-blue p-1 rounded text-center cursor-pointer" onClick={() => handleDeleteListClick(list._id)}>Delete</p>
                  </div>
                </div>
              )}

            </div>
          </div>
          {isOpen[list._id] && (
            <div className={`p-4 bg-[#eaf7fa] ${isOpen[list._id] ? 'rounded-b-md' : 'rounded-md'} border-t border-custom-blue`}>
              {matchedQuestions.length > 0 ? (
                matchedQuestions.map((question, index) => (
                  <div key={question._id} className="border border-gray-300  mb-4 bg-white rounded-md">
                    <div className="flex justify-between items-center border-b pb-2 mb-2 p-2">
                      <p className="flex">
                        <span className="text-lg font-semibold ml-4" style={{ width: "120px" }}>
                          {index + 1} .
                        </span>
                        <span className="opacity-75 text-lg font-semibold -ml-24">
                          {question.Question}
                        </span>
                      </p>
                      <div className="flex items-center">
                        <div className="border-r border-gray-300 h-6 mx-2"></div>
                        <span className={`text-sm  w-20 text-center ${getDifficultyStyles(question.DifficultyLevel)} rounded-md`} title="Difficulty Level">
                          {question.DifficultyLevel}
                        </span>
                        <div className="border-r border-gray-300 h-6 mx-2"></div>
                        <span
                          className="text-sm font-semibold w-12 text-center rounded-md"
                          title="Score" >
                          {question.Score}
                        </span>
                        <div className="border-r border-gray-300 h-6 mx-2"></div>
                        <button className="ml-2" onClick={() => handleDeleteClickfav(question._id, list._id)}>
                          <FaTrash className="text-gray-500 hover:text-blue-500" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 ml-10">
                      {question.Options && question.Options.length > 0 && (
                        <ul className="list-none">
                          {(() => {
                            const isAnyOptionLong = question.Options.some((option) => option.length > 55);

                            return question.Options.map((option, idx) => (
                              <li
                                key={idx}
                                style={{
                                  display: isAnyOptionLong ? "block" : "inline-block",
                                  width: isAnyOptionLong ? "100%" : "50%",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                <span style={{ marginRight: "0.5rem" }}>{String.fromCharCode(97 + idx)})</span>
                                <span>{option}</span>
                              </li>
                            ));
                          })()}
                        </ul>
                      )}
                    </div>

                    <div className="mt-2 ml-10 mb-2">
                      <span className="text-sm font-semibold">Answer: </span>
                      <span className="opacity-75 text-sm  text-gray-800">
                        {question.QuestionType === "MCQ" && question.Options
                          ? `${String.fromCharCode(97 + question.Options.indexOf(question.Answer))}) `
                          : ""}
                        {question.Answer}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No questions to display yet.</p>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  const handleAddNewList = async () => {
    if (newListName.trim()) {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/lists`, {
          listName: newListName,
          OwnerId: userId,
          orgId: orgId
        });
        setCreatedLists([...createdLists, response.data]);
        setNewListName("");
        setShowNewListPopup(false);
      } catch (error) {
        console.error('Error creating new list:', error);
      }
    }
    fetchLists();
    setDropdownOpen(true)
  };

  const handleCreateNewList = () => {
    setShowNewListPopup(true);
    setDropdownOpen(false)
  };
  // suggested question tab
  const renderQuestions = (questions, title, section) => {
    const filteredQuestions = questions;

    const uniqueFavoriteQuestions = new Set();
    filteredQuestions.forEach((question) => {
      createdLists.forEach((list) => {
        if (list.questions.includes(question._id)) {
          uniqueFavoriteQuestions.add(question._id);
        }
      });
    });
    const favoriteCount = uniqueFavoriteQuestions.size;
    const isDisabled = filteredQuestions.length === 0;

    const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
    const indexOfFirstQuestion = (currentPage - 1) * questionsPerPage;
    const indexOfLastQuestion = Math.min(
      indexOfFirstQuestion + questionsPerPage,
      filteredQuestions.length
    );
    const currentQuestions = filteredQuestions.slice(
      indexOfFirstQuestion,
      indexOfLastQuestion
    );
    console.log("currentQuestions", currentQuestions)

    const handlePreviousPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };











    const handleAddToList = async (listIds, questionId) => {
      try {
        // Use the full API URL from the environment variable
        await axios.post(`${process.env.REACT_APP_API_URL}/api/lists/add-question`, { listIds, questionId });

        // Clear selected list IDs and close the dropdown
        setSelectedListIds([]); // Unselect all checkboxes
        setDropdownOpen(null); // Close the dropdown

        // Optionally, you can show a success message or update the UI
        console.log('Question added to selected lists successfully');
      } catch (error) {
        console.error('Error adding question to lists:', error);
      }
      fetchLists();
    };


    return (
      <div className="mt-2 text-sm">
        <div
          className={`flex space-x-8 p-2 text-md justify-between items-center bg-custom-blue text-white font-semibold pr-5 cursor-pointer ${isOpen[section] ? 'rounded-t-md' : 'rounded-md'}`}
          onClick={() => !isDisabled && toggleSection(section)}
        >
          <p className="pr-4 ml-2 w-1/4">{title}</p>
          {!showOnlyFavorites && (
            <p className="rounded px-3 py-2 ml-4 text-white cursor-pointer text-center">
              No.of Questions &nbsp; ({filteredQuestions.length})
            </p>
          )}
          <p className="rounded px-3 py-2 ml-4 text-white cursor-pointer text-center">
            No.of Favorite Questions &nbsp; ({favoriteCount})
          </p>
          <div
            className={`flex items-center text-3xl ml-3 mr-3 text-white ${isDisabled ? "opacity-20 cursor-not-allowed" : ""
              }`}
          >
            {isOpen[section] ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </div>
        </div>
        {isOpen[section] && (
          <div className={`p-4 bg-[#eaf7fa] ${isOpen[section] ? 'rounded-b-md' : 'rounded-md'} border-t border-custom-blue`}>
            {currentQuestions.map((question, index) => (
              <div
                key={question._id}
                className="border border-gray-300  mb-2 bg-white rounded-md"
              >
                <div className="flex justify-between items-center border-b pb-2 mb-2 p-2">
                  <p className="flex">
                    <span
                      className="text-lg font-semibold ml-4"
                      style={{ width: "120px" }}
                    >
                      {indexOfFirstQuestion + index + 1} .
                    </span>
                    <span className="opacity-75 text-lg font-semibold -ml-24">
                      {question.Question}
                    </span>
                  </p>
                  <div className="flex items-center">
                    <div className="border-r border-gray-300 h-6 mx-2"></div>
                    <span
                      className={`text-sm  w-20 text-center ${getDifficultyStyles(question.DifficultyLevel)} rounded-md`}
                      title="Difficulty Level"
                    >
                      {question.DifficultyLevel === "Difficult" ? "Hard" : question.DifficultyLevel}
                    </span>
                    <div className="border-r border-gray-300 h-6 mx-2"></div>
                    <span
                      className="text-sm font-semibold w-12 text-center rounded-md"
                      title="Score"
                    >
                      {question.Score}
                    </span>
                    <div className="border-r border-gray-300 h-6 mx-2"></div>
                    <div className="relative w-8 text-center">
                      <button
                        onClick={() => toggleDropdown(question._id)}
                        className={`border ${createdLists.some(list => list.questions && list.questions.includes(question._id)) ? 'border-custom-blue' : 'border-black'} rounded px-1 py-0`}
                      >
                        <span className={`text-lg ${createdLists.some(list => list.questions && list.questions.includes(question._id)) ? 'text-custom-blue' : 'text-black'}`}><IoIosAdd /></span>
                      </button>
                      {dropdownOpen === question._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                          <div className="absolute -top-2 right-4 transform translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-300"></div>
                          <div className="flex justify-between items-center mb-2 border-b p-1">
                            <p className="font-semibold">Select List</p>
                            <button onClick={() => toggleDropdown(null)} className="text-gray-500 text-lg font-semibold">
                              &times;
                            </button>
                          </div>
                          <div className="flex items-center cursor-pointer hover:bg-gray-200 p-1 -mt-2 rounded" onClick={handleCreateNewList}>
                            <span><IoIosAdd /></span>
                            <span className="ml-2">Create New List</span>
                          </div>

                          <div className="max-h-40 overflow-y-auto">
                            {createdLists.map((list) => (
                              <label key={list._id} className="flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={selectedListIds.includes(list._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedListIds((prev) => [...prev, list._id]); // Add selected list ID
                                    } else {
                                      setSelectedListIds((prev) => prev.filter(id => id !== list._id)); // Remove unselected list ID
                                    }
                                  }}
                                  disabled={list.questions && list.questions.includes(question._id)}
                                />
                                {list.name}
                              </label>
                            ))}
                          </div>
                          <div className="border-t mt-2 pt-2 flex justify-end p-2">
                            <button
                              className="bg-custom-blue text-white px-4 py-1 rounded mb-1"
                              onClick={() => {
                                handleAddToList(selectedListIds, question._id);
                                console.log("selectedListIds", selectedListIds)
                              }}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}



                    </div>
                  </div>
                </div>

                {question.QuestionType === "MCQ" && question.Options && (
                  <div className="mb-2 ml-10">
                    <div>
                      <ul className="list-none">
                        {(() => {
                          const isAnyOptionLong = question.Options.some((option) => option.length > 55);

                          return question.Options.map((option, idx) => (
                            <li
                              key={idx}
                              style={{
                                display: isAnyOptionLong ? "block" : "inline-block",
                                width: isAnyOptionLong ? "100%" : "50%",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <span style={{ marginRight: "0.5rem" }}>{String.fromCharCode(97 + idx)})</span>
                              <span>{option}</span>
                            </li>
                          ));
                        })()}
                      </ul>
                    </div>
                  </div>
                )}

                <p className="flex ml-10 mb-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ width: "120px" }}
                  >
                    Answer:{" "}
                  </span>
                  <span className="opacity-75 text-sm -ml-16 text-gray-800">
                    {question.QuestionType === "MCQ" && question.Options
                      ? `${String.fromCharCode(97 + question.Options.indexOf(question.Answer))}) `
                      : ""}
                    {question.Answer}
                  </span>
                </p>
              </div>
            ))}
            {filteredQuestions.length > questionsPerPage && (
              <div className="flex items-center justify-between mt-4">
                <div
                  className={`ml-3 ${currentPage === 1 ? "invisible" : "visible"
                    } cursor-pointer`}
                  onClick={currentPage > 1 ? handlePreviousPage : undefined}
                >
                  <IoArrowBack />
                </div>
                <div className="inline-block px-4 py-2 border border-sky-500 bg-sky-500 text-white rounded text-center">
                  <span>
                    {indexOfFirstQuestion + 1}-{indexOfLastQuestion}
                  </span>
                </div>
                <div
                  className={`mr-3 ${currentPage === totalPages ? "invisible" : "visible"
                    } cursor-pointer`}
                  onClick={
                    currentPage < totalPages ? handleNextPage : undefined
                  }
                >
                  <FaArrowRight />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // my question tab
  const renderMyQuestions = (questions, title, section) => {
    const isDisabled = questions.length === 0;

    const totalPages = Math.ceil(questions.length / questionsPerPage);
    const indexOfFirstQuestion = (currentPage - 1) * questionsPerPage;
    const indexOfLastQuestion = Math.min(
      indexOfFirstQuestion + questionsPerPage,
      questions.length
    );
    const currentQuestions = questions.slice(
      indexOfFirstQuestion,
      indexOfLastQuestion
    );

    const handlePreviousPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    return (
      <div className="mt-2 text-sm">
        <div
          className={`flex space-x-8 p-2 text-md justify-between items-center bg-custom-blue text-white font-semibold pr-5 cursor-pointer ${isOpen[section] ? 'rounded-t-md' : 'rounded-md'}`}
          onClick={() => !isDisabled && toggleSection(section)}
        >
          <p className="pr-4 ml-2 w-1/4">{title}</p>
          <p className="rounded px-3 py-2 ml-4 text-white cursor-pointer text-center">
            No.of Questions &nbsp; ({questions.length})
          </p>
          <div
            className={`flex items-center text-3xl ml-3 mr-3 text-white ${isDisabled ? "opacity-20 cursor-not-allowed" : ""
              }`}
          >
            {isOpen[section] ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </div>
        </div>
        {isOpen[section] && (
          <div className={`p-4 bg-[#eaf7fa] ${isOpen[section] ? 'rounded-b-md' : 'rounded-md'} border-t border-custom-blue`}>
            {questions.length === 0 ? (
              <p className="text-center">No questions added.</p>
            ) : (
              currentQuestions.map((question, index) => (
                <div
                  key={question._id}
                  className="border border-gray-300  mb-2 bg-white rounded-md"
                >
                  <div className="flex justify-between items-center border-b pb-2 mb-2 p-2">
                    <p className="flex">
                      <span
                        className="text-lg font-semibold ml-4"
                        style={{ width: "120px" }}
                      >
                        {indexOfFirstQuestion + index + 1} .
                      </span>
                      <span className="opacity-75 text-lg font-semibold -ml-24">
                        {question.Question}
                      </span>
                    </p>
                    <div className="flex items-center">
                      <div className="border-r border-gray-300 h-6 mx-2"></div>
                      <span
                        className={`text-sm  w-20 text-center ${getDifficultyStyles(question.DifficultyLevel)} rounded-md`}
                        title="Difficulty Level"
                      >
                        {question.DifficultyLevel === "Difficult" ? "Hard" : question.DifficultyLevel}
                      </span>
                      <div className="border-r border-gray-300 h-6 mx-2"></div>
                      <span
                        className="text-sm font-semibold w-12 text-center rounded-md"
                        title="Score"
                      >
                        {question.Score}
                      </span>
                      <div className="border-r border-gray-300 h-6 mx-2"></div>
                      <div className="relative w-8 text-center">
                        <button onClick={() => toggleDropdown(question._id)}>
                          <span className="text-xl"><MdMoreVert /></span>
                        </button>
                        {dropdownOpen === question._id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg">
                            <p
                              className="px-2 py-1 text-sm cursor-pointer hover:bg-gray-200"
                              onClick={() => handleEditClick(question)}
                            >
                              Edit
                            </p>
                            <p
                              className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-200"
                              onClick={() => handleDeleteClick(question._id)}
                            >
                              Delete
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {question.QuestionType === "MCQ" && question.Options && (
                    <div className="mb-2 ml-10">
                      <div>
                        <ul className="list-none">
                          {(() => {
                            const isAnyOptionLong = question.Options.some((option) => option.length > 55);

                            return question.Options.map((option, idx) => (
                              <li
                                key={idx}
                                style={{
                                  display: isAnyOptionLong ? "block" : "inline-block",
                                  width: isAnyOptionLong ? "100%" : "50%",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                <span style={{ marginRight: "0.5rem" }}>{String.fromCharCode(97 + idx)})</span>
                                <span>{option}</span>
                              </li>
                            ));
                          })()}
                        </ul>
                      </div>
                    </div>
                  )}

                  <p className="flex ml-10 mb-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ width: "120px" }}
                    >
                      Answer:{" "}
                    </span>
                    <span className="opacity-75 text-sm -ml-16 text-gray-800">
                      {question.QuestionType === "MCQ" && question.Options
                        ? `${String.fromCharCode(97 + question.Options.indexOf(question.Answer))}) `
                        : ""}
                      {question.Answer}
                    </span>
                  </p>
                </div>
              ))
            )}
            {questions.length > questionsPerPage && (
              <div className="flex items-center justify-between mt-4">
                <div
                  className={`ml-3 ${currentPage === 1 ? "invisible" : "visible"
                    } cursor-pointer`}
                  onClick={currentPage > 1 ? handlePreviousPage : undefined}
                >
                  <IoArrowBack />
                </div>
                <div className="inline-block px-4 py-2 border border-sky-500 bg-sky-500 text-white rounded text-center">
                  <span>
                    {indexOfFirstQuestion + 1}-{indexOfLastQuestion}
                  </span>
                </div>
                <div
                  className={`mr-3 ${currentPage === totalPages ? "invisible" : "visible"
                    } cursor-pointer`}
                  onClick={
                    currentPage < totalPages ? handleNextPage : undefined
                  }
                >
                  <FaArrowRight />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const [activeTab, setActiveTab] = useState("My Questions");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSuggestedDropdownOpen, setIsSuggestedDropdownOpen] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState("Interview Questions");
  const [selectedSuggestedQuestionType, setSelectedSuggestedQuestionType] = useState("Interview Questions");
  const [selectedFavoriteQuestionType, setSelectedFavoriteQuestionType] = useState();

  const handleTabClick = (tab, questionType = "Interview Questions") => {
    setActiveTab(tab);
    setSelectedQuestionType(questionType);
    setIsDropdownOpen((prev) => (tab === "My Questions" ? !prev : false));
    setIsSuggestedDropdownOpen(false);
  };

  const handleSuggestedTabClick = (questionType = "Interview Questions") => {
    setActiveTab("Suggested");
    setSelectedSuggestedQuestionType(questionType);
    setIsSuggestedDropdownOpen((prev) => !prev);
    setIsDropdownOpen(false);
  };

  const handleFavoriteTabClick = (questionType) => {
    setActiveTab("Favorite");
    setSelectedFavoriteQuestionType(questionType);
    setIsDropdownOpen(false);
    setIsSuggestedDropdownOpen(false);
  };


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

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

  const [showMainContent, setShowMainContent] = useState(true);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);

  const handleclose = () => {
    setShowMainContent(true);
    setShowNewCandidateContent(false);
  };

  const [totalSuggestedQuestions] = useState(0);

  const [myInterviewQuestions, setMyInterviewQuestions] = useState([]);
  const [myMCQQuestions, setMyMCQQuestions] = useState([]);
  const [myShortAnswerQuestions, setMyShortAnswerQuestions] = useState([]);
  const [myLongAnswerQuestions, setMyLongAnswerQuestions] = useState([]);
  const [myProgrammingQuestions, setMyProgrammingQuestions] = useState([]);

  const handleEditClick = (question) => {
    setShowNewCandidateContent(question);
    setDropdownOpen(null);
  };

  const handleDeleteClick = (questionId) => {
    setQuestionToDelete(questionId);
    setShowDeletePopup(true);
    setDropdownOpen(null);
  };

  const handleDeleteConfirm = async (confirm) => {
    if (confirm && questionToDelete) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/newquestion/${questionToDelete}`
        );
        setMyQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q._id !== questionToDelete)
        );
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
    setShowDeletePopup(false);
    setQuestionToDelete(null);
    fetchMyQuestions();
  };

  const handleDataAdded = () => {
    fetchSuggestedQuestions();
    fetchMyQuestions();
  };

  const dataAddedEdit = () => {
    fetchMyQuestions();
  };

  return (
    <>
      {showMainContent && (
        <>
          <div >
            <div className="overflow-auto mx-10">
              <div >
                <div className=" my-3 flex justify-between sm:justify-start items-center">
                  <p className="text-xl" onClick={onCloseprofile}>
                    <span className="text-custom-blue font-semibold cursor-pointer">
                      Question Bank
                    </span>{" "}
                    / {questionProfile.SkillName}
                  </p>
                  {/* // For Add Question button ,,this will get visible only when my Question tab is active */}
                  {activeTab === "My Questions" && (
                    <button
                      className="shadow rounded border p-2 text-md mr-5"
                      onClick={toggleSidebar}
                    >
                      <span className="text-custom-blue font-semibold">Add Question</span>
                    </button>
                  )}
                </div>
              </div>
              <div>
                <div className=" pt-5 pb-2 sm:hidden md:hidden">
                  <p className="text-xl space-x-10">
                    {/*  For My Question tab ,when My Question Tab Active this content is needed */}
                    <div className="relative inline-block">
                      <span className="flex items-center cursor-pointer">
                        <span
                          className={` ${activeTab === "My Questions" ? "text-black font-semibold pb-3 border-b-2 border-custom-blue" : "text-gray-500"}`}
                          onClick={() => {
                            setIsDropdownOpen((prev) => !prev);
                            setIsSuggestedDropdownOpen(false);
                          }}

                        >
                          My Questions
                        </span>
                        <span className="ml-2 cursor-pointer flex items-center" onClick={() => setIsDropdownOpen((prev) => !prev)}>
                          {isDropdownOpen || activeTab === "My Questions" ? <IoIosArrowUpBlack /> : <IoIosArrowDownBlack />}
                        </span>
                      </span>
                      {/* these dropdowns are realted My Questions tab */}
                      {isDropdownOpen && (
                        <div className="absolute mt-1  z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                          <div className="space-y-1 text-sm">
                            <p
                              className="px-3 py-1 cursor-pointer hover:bg-gray-200 hover:text-custom-blue rounded-md"
                              onClick={() => handleTabClick("My Questions", "Interview Questions")}
                            >
                              Interview Questions
                            </p>
                            <p
                              className="px-3 py-1 cursor-pointer hover:bg-gray-200 hover:text-custom-blue rounded-md"
                              onClick={() => handleTabClick("My Questions", "Assessment Questions")}
                            >
                              Assessment Questions
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/*  For Suggested Questions  tab  ,when Suggested Question Tab Active this content is needed */}
                    <div className="relative inline-block">
                      <span className="flex items-center cursor-pointer">
                        <span
                          className={` ${activeTab === "Suggested" ? "text-black font-semibold pb-3 border-b-2 border-custom-blue" : "text-gray-500"}`}
                          onClick={() => {
                            setIsSuggestedDropdownOpen((prev) => !prev);
                            setIsDropdownOpen(false);
                          }}
                        >
                          Suggested Questions
                        </span>
                        <span className="ml-2 cursor-pointer flex items-center">
                          {isSuggestedDropdownOpen ? <IoIosArrowUpBlack /> : <IoIosArrowDownBlack />}
                        </span>
                      </span>
                      {/* these dropdowns are realted Suggested Questions tab */}
                      {isSuggestedDropdownOpen && (
                        <div className="absolute ml-14 z-50 w-48 mt-1 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                          <div className="space-y-1 text-sm">
                            <p
                              className="px-3 py-1 cursor-pointer hover:bg-gray-200 hover:text-custom-blue rounded-md"
                              onClick={() => handleSuggestedTabClick("Interview Questions")}
                            >
                              Interview Questions
                            </p>
                            <p
                              className="px-3 py-1 cursor-pointer hover:bg-gray-200 hover:text-custom-blue rounded-md"
                              onClick={() => handleSuggestedTabClick("Assessment Questions")}
                            >
                              Assessment Questions
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/*  For Favorite Questions  tab  ,when Favorite Question Tab Active this content is needed */}
                    <div className="relative inline-block">
                      <span className="flex items-center cursor-pointer">
                        <span
                          className={` ${activeTab === "Favorite" ? "text-black font-semibold pb-3 border-b-2 border-custom-blue" : "text-gray-500"}`}
                          onClick={() => handleFavoriteTabClick()}
                        >
                          Favorite Questions List
                        </span>
                      </span>
                      {/* {renderFavoriteQuestionsSections()} */}

                    </div>
                  </p>
                </div>

                {/* when we selct any dropdown in any tab that name will displayed that related content */}
                <div className="mt-5">
                  {activeTab === "My Questions" && selectedQuestionType !== "All" && (
                    <h2 className="text-lg font-semibold">{selectedQuestionType}</h2>
                  )}
                  {activeTab === "Suggested" && selectedSuggestedQuestionType !== "All" && (
                    <h2 className="text-lg font-semibold">{selectedSuggestedQuestionType}</h2>
                  )}
                </div>
                {/* mobile view */}
                <div>
                  <select
                    className="p-2 text-custom-blue border focus:outline-custom-blue border-gray-300 rounded-md mt-5 ml-5 lg:hidden xl:hidden 2xl:hidden"
                    onChange={(e) => handleTabClick(e.target.value)}
                    value={activeTab}
                  >
                    <option value="My Questions">My Questions</option>
                    <option value="Suggested">Suggested</option>
                    <option value="Favorite">Favorite</option>
                  </select>
                </div>

                {/* when we select My Question tab this content will be displayed .....this is realted to sections of My Question tab */}
                {activeTab === "My Questions" && (
                  <div>

                    {selectedQuestionType === "All" || selectedQuestionType === "Interview Questions" ? (
                      renderMyQuestions(
                        myInterviewQuestions,
                        "Interview Questions",
                        "myInterviewQuestions"
                      )
                    ) : null}
                    {selectedQuestionType === "All" || selectedQuestionType === "Assessment Questions" ? (
                      <>
                        {renderMyQuestions(
                          myMCQQuestions,
                          "Multiple Choice Questions(MCQs)",
                          "myMCQQuestions"
                        )}
                        {renderMyQuestions(
                          myProgrammingQuestions,
                          "Programming Questions",
                          "myProgrammingQuestions"
                        )}
                        {renderMyQuestions(
                          myShortAnswerQuestions,
                          "Short Text (Single Line)",
                          "myShortAnswerQuestions"
                        )}
                        {renderMyQuestions(
                          myLongAnswerQuestions,
                          "Long Text (Paragraph)",
                          "myLongAnswerQuestions"
                        )}

                      </>
                    ) : null}
                  </div>
                )}

                {/* when we select Suggested Question tab this content will be displayed .....this is realted to sections of Suggested Question tab */}
                {activeTab === "Suggested" && (
                  <>
                    <div>
                      {selectedSuggestedQuestionType === "All" || selectedSuggestedQuestionType === "Interview Questions" ? (
                        renderQuestions(
                          suggestedQuestions.filter(
                            (q) => q.QuestionType === "Interview Questions"
                          ),
                          "Interview Questions",
                          "interview",
                          createdLists // Pass createdLists to renderQuestions
                        )
                      ) : null}
                      {selectedSuggestedQuestionType === "All" || selectedSuggestedQuestionType === "Assessment Questions" ? (
                        <>
                          {renderQuestions(
                            suggestedQuestions.filter(
                              (q) => q.QuestionType === "MCQ"
                            ),
                            "Multiple Choice Questions(MCQs)",
                            "mcq",
                            createdLists // Pass createdLists to renderQuestions
                          )}
                          {renderQuestions(
                            suggestedQuestions.filter(
                              (q) => q.QuestionType === "Programming"
                            ),
                            "Programming Questions",
                            "programming",
                            createdLists // Pass createdLists to renderQuestions
                          )}
                          {renderQuestions(
                            suggestedQuestions.filter(
                              (q) => q.QuestionType === "Short Text(Single Line)"
                            ),
                            "Short Text (Single Line)",
                            "shortText",
                            createdLists // Pass createdLists to renderQuestions
                          )}
                          {renderQuestions(
                            suggestedQuestions.filter(
                              (q) => q.QuestionType === "Long Text(Paragraph)"
                            ),
                            "Long Text (Paragraph)",
                            "longText",
                            createdLists // Pass createdLists to renderQuestions
                          )}
                        </>
                      ) : null}
                    </div>
                  </>
                )}

                {activeTab === "Favorite" && (
                  <div>
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">Favorite Questions</h2>
                      <ContentAdd className="inline mr-4 border border-gray-300 rounded p-1 cursor-pointer"
                        onClick={handleCreateNewList}
                      />
                    </div>
                    {renderFavoriteQuestionsSections()}
                  </div>
                )}



              </div>
            </div>
          </div>
        </>
      )}
      {showNewCandidateContent && (
        <Editassesmentquestion
          onClose={handleclose}
          question={showNewCandidateContent}
          isEdit={true}
          onDataAdded={dataAddedEdit}
        />
      )}

      {sidebarOpen && (
        <Sidebar
          onClose={closeSidebar}
          onOutsideClick={handleOutsideClick}
          questionProfile={questionProfile}
          hideSkillField={true}
          skilldefault={questionProfile.SkillName}
          onDataAdded={handleDataAdded}
        />
      )}

      {editingSectionId && (
        <div className="fixed inset-0  flex justify-center items-center z-50 shadow-md">
          <div className="bg-white  rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center border-b pb-2 mb-4 p-4">
              <h2 className="text-lg  font-semibold">Edit List Name</h2>
              <button onClick={() => setEditingSectionId(null)} className="text-xl font-bold">
                &times;
              </button>
            </div>
            <div className="mb-4 flex items-center gap-5">
              <label className="text-sm font-semibold ml-4">List Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className=" border-b p-2 w-48 focus:outline-none"
                placeholder="Enter list name"
              />
            </div>
            <div className="flex justify-end border-t p-2">
              <button
                onClick={handleSave}
                className="bg-custom-blue text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {
        showDeletePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-5 rounded shadow-lg">
              <p>Are you sure you want to delete this question?</p>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => handleDeleteConfirm(true)}
                >
                  Yes
                </button>
                <button
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => handleDeleteConfirm(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )
      }

      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-1/3 p-4">
            <h2 className="text-lg font-semibold">Confirm Deletion</h2>
            <p>Are you sure you want to delete this favorite question?</p>
            <div className="flex justify-end mt-4">
              <button className="bg-gray-300 px-4 py-2 rounded mr-2" onClick={cancelDelete}>
                No
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={confirmDelete}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewListPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-1/3 h-1/3 flex flex-col rounded-md"> {/* Ensure this is the outermost div */}
            <div className="border-b p-2 flex justify-between bg-custom-blue items-center rounded-t-md"> {/* Added rounded-t-md here */}
              <h2 className="text-lg text-white font-semibold">New List</h2>
              <button onClick={() => setShowNewListPopup(false)} className="text-xl font-bold text-white">
                &times;
              </button>
            </div>
            <div className="p-4 flex-grow">
              <div className="flex items-center mb-2 gap-5">
                <label className="text-sm font-semibold mr-2 mt-2">
                  List Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="border-b flex-grow p-2 mt-2 focus:outline-none"
                  placeholder="Enter list name"
                />
              </div>
            </div>
            <div className="flex justify-end border-t p-2 rounded-b-md"> {/* Added rounded-b-md here */}
              <button className="bg-gray-300 px-4 py-2 rounded mr-2" onClick={() => setShowNewListPopup(false)}>
                Cancel
              </button>
              <button className="bg-custom-blue text-white px-4 py-2 rounded" onClick={handleAddNewList}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded shadow-lg">
            <p>Are you sure you want to delete this section?</p>
            <div className="flex justify-end mt-4">
              <button className="bg-gray-300 px-4 py-2 rounded mr-2" onClick={cancelDelete}>
                No
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={confirmDelete}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteListConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded shadow-lg">
            <p>Are you sure you want to delete this list?</p>
            <div className="flex justify-end mt-4">
              <button className="bg-gray-300 px-4 py-2 rounded mr-2" onClick={cancelDeleteList}>
                No
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={confirmDeleteList}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default InterviewDetails;
