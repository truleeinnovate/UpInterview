import React, { useState, useEffect, useRef, useCallback, } from "react";
import axios from "axios";
import "../../../../index.css";
import "../styles/tabs.scss";
import Tooltip from "@mui/material/Tooltip";
// import Sidebar from "../QuestionBank-Tab/QuestionBank-Form.jsx";
// import QuestionBankProfileDetails from "./QuestionBankProfileDetails.jsx";
import { fetchMasterData } from "../../../../utils/fetchMasterData.js";
import { fetchFilterData } from "../../../../utils/dataUtils.js";
import Cookies from "js-cookie";
import { usePermissions } from '../../../../PermissionsContext';
import { useMemo } from 'react';

import { ReactComponent as IoIosArrowBack } from "../../../../icons/IoIosArrowBack.svg";
import { ReactComponent as IoIosArrowForward } from "../../../../icons/IoIosArrowForward.svg";
import { ReactComponent as FaList } from "../../../../icons/FaList.svg";
import { ReactComponent as TbLayoutGridRemove } from "../../../../icons/TbLayoutGridRemove.svg";
import { ReactComponent as IoMdSearch } from "../../../../icons/IoMdSearch.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import { ReactComponent as MdKeyboardArrowUp } from "../../../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../../../icons/MdKeyboardArrowDown.svg";
import { ReactComponent as CgInfo } from "../../../../icons/CgInfo.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";

const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas, skills }) => {
  const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
  const [isTechMainChecked, setTechMainChecked] = useState(false);
  const [selectedTechOptions, setSelectedTechOptions] = useState([]);
  const isAnyOptionSelected = selectedTechOptions.length > 0;
  const handleUnselectAll = () => {
    setSelectedTechOptions([]);
    setTechMainChecked(false);
    onFilterChange({ tech: [] });
  };
  useEffect(() => {
    if (!isTechMainChecked) setSelectedTechOptions([]);
  }, [isTechMainChecked]);
  const handleTechMainToggle = () => {
    const newTechMainChecked = !isTechMainChecked;
    setTechMainChecked(newTechMainChecked);
    const newSelectedTech = newTechMainChecked
      ? skills.map((s) => s.SkillName)
      : [];
    setSelectedTechOptions(newSelectedTech);
  };
  const handleTechOptionToggle = (option) => {
    const selectedIndex = selectedTechOptions.indexOf(option);
    const updatedOptions =
      selectedIndex === -1
        ? [...selectedTechOptions, option]
        : selectedTechOptions.filter((_, index) => index !== selectedIndex);

    setSelectedTechOptions(updatedOptions);
  };

  const Apply = () => {
    onFilterChange({
      tech: selectedTechOptions,
    });
    if (window.innerWidth < 1023) {
      closeOffcanvas();
    }
  };
  return (
    <div
      className="absolute w-72 sm:mt-5 md:w-full sm:w-full text-sm bg-white border right-0 z-30 h-[calc(100vh-200px)]"
      style={{
        visibility: isOpen ? "visible" : "hidden",
        transform: isOpen ? "" : "translateX(50%)",
      }}
    >
      <div className="relative h-full flex flex-col">
        <div className="absolute w-72 sm:w-full md:w-full border-b flex justify-between p-2 items-center bg-white z-10">
          <div>
            <h2 className="text-lg font-bold ">Filters</h2>
          </div>
          {/* Unselect All Option */}
          <div>
            {isAnyOptionSelected && (
              <div>
                <button
                  onClick={handleUnselectAll}
                  className="font-bold text-md"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 flex-grow overflow-y-auto mb-20 mt-10">
          {/* Skill/Technology */}
          <div className="flex mt-2 justify-between">
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4"
                  checked={isTechMainChecked}
                  onChange={handleTechMainToggle}
                />
                <span className="ml-3 font-bold">Skill/Technology</span>
              </label>
            </div>
            <div
              className="cursor-pointer mr-3 text-2xl"
              onClick={() => setTechDropdownOpen(!isTechDropdownOpen)}
            >
              {isTechDropdownOpen ? (
                <MdKeyboardArrowUp />
              ) : (
                <MdKeyboardArrowDown />
              )}
            </div>
          </div>
          {isTechDropdownOpen && (
            <div className="bg-white py-2 mt-1">
              {skills.map((option, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4"
                    checked={selectedTechOptions.includes(option.SkillName)}
                    onChange={() => handleTechOptionToggle(option.SkillName)}
                  />
                  <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">
                    {option.SkillName}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="fixed bottom-0 w-72 sm:w-full md:w-full bg-white space-x-3 flex justify-end border-t p-2">
          <button
            type="submit"
            className="bg-custom-blue p-2 rounded-md text-white"
            onClick={closeOffcanvas}
          >
            Close
          </button>
          <button
            type="submit"
            className="bg-custom-blue p-2 rounded-md text-white"
            onClick={Apply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionBank = () => {
  const { sharingPermissionscontext, objectPermissionscontext } = usePermissions();
  const sharingPermissions = useMemo(() => sharingPermissionscontext.questionBank || {}, [sharingPermissionscontext]);
  const objectPermissions = useMemo(() => objectPermissionscontext.questionBank || {}, [objectPermissionscontext]);

  const [suggestedQuestionsCount, setSuggestedQuestionsCount] = useState({});
  const [favoriteQuestionsCount, setFavoriteQuestionsCount] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentRows, setCurrentRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const [notification, setNotification] = useState("");
  const fetchSuggestedQuestionsCount = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/suggestedquestions-count`
      );
      setSuggestedQuestionsCount(response.data);
    } catch (error) {
      console.error("Error fetching suggested questions count:", error);
    }
  }, []);

  const [questionCounts, setQuestionCounts] = useState({});
  const fetchQuestionCounts = useCallback(async () => {
    try {
      const allQuestions = await fetchFilterData("newquestion", sharingPermissions);
      const questionsArray = Array.isArray(allQuestions) ? allQuestions : [];
      
      const counts = questionsArray.reduce((acc, question) => {
        const skill = question.Skill;
        if (!acc[skill]) {
          acc[skill] = 0;
        }
        acc[skill]++;
        return acc;
      }, {});
      
      setQuestionCounts(counts);
    } catch (error) {
      console.error("Error fetching question counts:", error);
      setQuestionCounts({});
    }
  }, [sharingPermissions]);
  const userId = Cookies.get("userId");
  const [createdLists, setCreatedLists] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const countMatchedQuestions = useCallback(() => {
    if (!Array.isArray(suggestedQuestions) || !Array.isArray(createdLists) || 
        suggestedQuestions.length === 0 || createdLists.length === 0) {
      setMatchedQuestionsCount({});
      return;
    }

    const counts = {};
    suggestedQuestions.forEach((question) => {
      const skill = question.Skill;
      if (!counts[skill]) {
        counts[skill] = 0;
      }
      
      createdLists.forEach((list) => {
        if (Array.isArray(list.questions) && list.questions.includes(question._id)) {
          counts[skill]++;
        }
      });
    });
    
    setMatchedQuestionsCount(counts);
  }, [suggestedQuestions, createdLists]);

  useEffect(() => {
    const fetchSuggestedQuestions = async () => {
      setLoading(true);
      try {
        const skillsData = await fetchMasterData("suggestedquestions");
        setSuggestedQuestions(skillsData);
        countMatchedQuestions();
      } catch (error) {
        console.error("Error fetching SkillsData:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestedQuestions();
  }, [countMatchedQuestions]);

  const fetchLists = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/lists/${userId}`);
      setCreatedLists(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setCreatedLists([]);
    }
  }, [userId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  useEffect(() => {
    fetchQuestionCounts();
  }, [fetchQuestionCounts]);

  const getQuestionCountForSkill = (skillName) => {
    return questionCounts[skillName] || 0;
  };

  useEffect(() => {
    fetchSuggestedQuestionsCount();
    fetchQuestionCounts();
  }, [fetchSuggestedQuestionsCount, fetchQuestionCounts]);

  const handleDataAdded = () => {
    fetchSuggestedQuestionsCount();
    fetchQuestionCounts();
    countMatchedQuestions();
  };

  useEffect(() => {
    const fetchSkillsData = async () => {
      setLoading(true);
      try {
        const skillsData = await fetchMasterData("skills");
        setCurrentRows(skillsData);
      } catch (error) {
        console.error("Error fetching SkillsData:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkillsData();
  }, []);
  const [matchedQuestionsCount, setMatchedQuestionsCount] = useState({});

  const getMyQuestionCountForSkill = (skillName) => {
    return suggestedQuestionsCount[skillName] || 0;
  };

  const getFavoriteQuestionCountForSkill = (skillName) => {
    return favoriteQuestionsCount[skillName] || 0;
  };
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const handleCandidateClick = (row) => {
    if (objectPermissions.View) {
      // setQuestionProfile(row);
      setSelectedCandidate(row);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
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

  const [selectedFilters, setSelectedFilters] = useState({ tech: [] });

  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(filters);
  }, []);

  const FilteredData = () => {
    if (!Array.isArray(currentRows)) return [];
    return currentRows.filter((user) => {
      const fieldsToSearch = [user.SkillName].filter(
        (field) => field !== null && field !== undefined
      );

      const matchesTech =
        selectedFilters.tech.length === 0 ||
        selectedFilters.tech.includes(user.SkillName);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchesSearchQuery && matchesTech;
    });
  };

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);

  const [activeArrow, setActiveArrow] = useState(null);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setActiveArrow("next");
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setActiveArrow("prev");
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, currentRows.length);

  const currentFilteredRows = FilteredData()
    .slice(startIndex, endIndex)
    .reverse();

  const [tableVisible] = useState(true);

  const [viewMode, setViewMode] = useState("list");

  const handleListViewClick = () => {
    setViewMode("list");
  };

  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };


  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedFilters]);

  // Detect screen size and set view mode to "kanban" for sm
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode("kanban");
      } else {
        setViewMode("list");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [isFilterActive, setIsFilterActive] = useState(false);

  const handleFilterIconClick = () => {
    if (currentRows.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };

  const [showMainContent, setShowMainContent] = useState(true);

  const handleCloseProfile = () => {
    setSelectedCandidate(null);
  };


  return (
    <>
      {showMainContent && !selectedCandidate && (
        <>

          <div className="fixed top-16 sm:top-20 md:top-24 left-0 right-0">
            <div className="flex justify-between p-4">
              <div>
                <span className="text-lg font-semibold">Question Bank</span>
              </div>

              <div>
                {notification && (
                  <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
                    {notification}
                  </div>
                )}
              </div>
              {objectPermissions.Create && (
                <div onClick={toggleSidebar} className="">
                  <span className="p-2 bg-custom-blue text-white text-md font-semibold border shadow rounded">
                    Add
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="fixed top-28 sm:top-32 md:top-36 left-0 right-0">
            <div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end sm:float-end p-4">
              <div className="flex items-center sm:hidden md:hidden">
                <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={handleListViewClick}>
                    <FaList
                      className={`text-xl mr-4 ${viewMode === "list" ? "text-custom-blue" : ""
                        }`}
                    />
                  </span>
                </Tooltip>
                <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={handleKanbanViewClick}>
                    <TbLayoutGridRemove
                      className={`text-xl ${viewMode === "kanban" ? "text-custom-blue" : ""
                        }`}
                    />
                  </span>
                </Tooltip>
              </div>
              <div className="flex items-center">
                <div className="relative">
                  <div className="searchintabs border rounded-md relative">
                    <div className="absolute inset-y-0 left-0 flex items-center">
                      <button type="submit" className="p-2">
                        <IoMdSearch className="text-custom-blue" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by Skill/Technology."
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      className="rounded-full border h-8 "
                    />
                  </div>
                </div>

                <div>
                  <span className="p-2 text-xl sm:text-sm md:text-sm">
                    {currentPage + 1}/{totalPages}
                  </span>
                </div>
                <div className="flex">
                  <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === 0 ? " cursor-not-allowed" : ""
                        } ${activeArrow === "prev" ? "text-blue-500" : ""}`}
                      onClick={prevPage}
                    >
                      <IoIosArrowBack className="text-custom-blue" />
                    </span>
                  </Tooltip>

                  <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      className={`border p-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1 ? " cursor-not-allowed" : ""
                        } ${activeArrow === "next" ? "text-blue-500" : ""}`}
                      onClick={nextPage}
                    >
                      <IoIosArrowForward className="text-custom-blue" />
                    </span>
                  </Tooltip>
                </div>
                <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
                  <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      onClick={handleFilterIconClick}
                      style={{
                        opacity: currentRows.length === 0 ? 0.2 : 1,
                        pointerEvents: currentRows.length === 0 ? "none" : "auto",
                      }}
                    >
                      {isFilterActive ? (
                        <LuFilterX className="text-custom-blue" />
                      ) : (
                        <FiFilter className="text-custom-blue" />
                      )}
                    </span>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed left-0 right-0 mx-auto z-10 sm:top-44 md:top-52 lg:top-48 xl:top-48 2xl:top-48">
            {tableVisible && (
              <div>
                {viewMode === "list" ? (
                  <div className="sm:hidden md:hidden lg:flex xl:flex 2xl:flex">
                    <div
                      className="flex-grow"
                      style={{ marginRight: isMenuOpen ? "290px" : "0" }}
                    >
                      <div className="relative h-[calc(100vh-200px)] flex flex-col">
                        <div className="flex-grow overflow-y-auto pb-4">
                          <table className="text-left w-full border-collapse border-gray-300 mb-14">
                            <thead className="bg-custom-bg sticky top-0 z-10 text-xs">
                              <tr>
                                <th scope="col" className="py-3 px-6">
                                  Skill/Technology
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  My Questions
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Suggested Questions
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Number of Favorite Questions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {loading ? (
                                <tr>
                                  <td colSpan="7" className="py-28 text-center">
                                    <div className="wrapper12">
                                      <div className="circle12"></div>
                                      <div className="circle12"></div>
                                      <div className="circle12"></div>
                                      <div className="shadow12"></div>
                                      <div className="shadow12"></div>
                                      <div className="shadow12"></div>
                                    </div>
                                  </td>
                                </tr>
                              ) : currentRows.length === 0 ? (
                                <tr>
                                  <td colSpan="7" className="py-10 text-center">
                                    <div className="flex flex-col items-center justify-center p-5">
                                      <p className="text-9xl rotate-180 text-blue-500">
                                        <CgInfo />
                                      </p>
                                      <p className="text-center text-lg font-normal">
                                        You don't have question yet. Create new
                                        question.
                                      </p>
                                      <p
                                        onClick={toggleSidebar}
                                        className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
                                      >
                                        Add question
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              ) : currentFilteredRows.length === 0 ? (
                                <tr>
                                  <td colSpan="7" className="py-10 text-center">
                                    <p className="text-lg font-normal">
                                      No data found.
                                    </p>
                                  </td>
                                </tr>
                              ) : (
                                currentFilteredRows.map((row, index) => (
                                  <tr
                                    key={index}
                                    className="bg-white border-b text-xs cursor-pointer"
                                  >
                                    <td
                                      className="py-2 px-6 text-blue-300"
                                      onClick={() => handleCandidateClick(row)}
                                    >
                                      {row.SkillName}
                                    </td>
                                    <td className="py-2 px-6">

                                      {/* {getMyQuestionCountForSkill(row.SkillName)} */}
                                      {getQuestionCountForSkill(row.SkillName)}
                                    </td>
                                    <td className="py-2 px-6">
                                      {/* <p>
                                        {getSuggestedQuestionCountForSkill(
                                          row.SkillName
                                        )}
                                      </p> */}
                                      {getMyQuestionCountForSkill(row.SkillName)}
                                    </td>
                                    <td className="py-2 px-6">

                                    {matchedQuestionsCount[row.SkillName] || 0}

                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <OffcanvasMenu
                      isOpen={isMenuOpen}
                      closeOffcanvas={handleFilterIconClick}
                      onFilterChange={handleFilterChange}
                      skills={currentRows}
                    />
                  </div>
                ) : (
                  // kanban view

                  <div className="flex">
                    <div
                      className="flex-grow"
                      style={{ marginRight: isMenuOpen ? "290px" : "0" }}
                    >
                      <div className="flex-grow h-[calc(100vh-200px)] overflow-y-auto pb-10 right-0 sm:mt-10 md:mt-10">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 px-4">
                          {loading ? (
                            <div className="py-10 text-center">
                              <div className="wrapper12">
                                <div className="circle12"></div>
                                <div className="circle12"></div>
                                <div className="circle12"></div>
                                <div className="shadow12"></div>
                                <div className="shadow12"></div>
                                <div className="shadow12"></div>
                              </div>
                            </div>
                          ) : currentRows.length === 0 ? (
                            <div className="py-10 text-center">
                              <div className="flex flex-col items-center justify-center p-5">
                                <p className="text-9xl rotate-180 text-blue-500">
                                  <CgInfo />
                                </p>
                                <p className="text-center text-lg font-normal">
                                  You don't have question yet. Create new question.
                                </p>
                                <p
                                  onClick={toggleSidebar}
                                  className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
                                >
                                  Add question
                                </p>
                              </div>
                            </div>
                          ) : currentFilteredRows.length === 0 ? (
                            <div className="col-span-3 py-10 text-center">
                              <p className="text-lg font-normal">No data found.</p>
                            </div>
                          ) : (
                            currentFilteredRows.map((row, index) => (
                              <>
                                <div
                                  key={index}
                                  className="bg-white border border-custom-blue text-blue-500 cursor-pointer rounded "
                                >
                                  <p
                                    className="text-lg border-b p-2"
                                    onClick={() => handleCandidateClick(row)}
                                  >
                                    {row.SkillName}
                                  </p>

                                  <div className="grid grid-cols-2 text-sm p-2">
                                    <div className="p-1" style={{ width: "200px" }}>
                                      <p className="text-gray-700">
                                        <span className="text-slate-400">
                                          My Questions
                                        </span>
                                      </p>
                                      <p className="text-gray-700">
                                        <span className="text-slate-400">
                                          Suggested Questions
                                        </span>
                                      </p>
                                      <p className="text-gray-700">
                                        <span className="text-slate-400">
                                          Favorite Questions
                                        </span>
                                      </p>
                                    </div>
                                    <div className="p-1 ml-24">
                                      <p className="text-gray-700">
                                        {getQuestionCountForSkill(row.SkillName)}
                                      </p>
                                      <p className="text-gray-700">
                                        {getMyQuestionCountForSkill(row.SkillName)}
                                      </p>

                                      <p className="text-gray-700">
                                        {getFavoriteQuestionCountForSkill(
                                          row.SkillName
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <OffcanvasMenu
                      isOpen={isMenuOpen}
                      closeOffcanvas={handleFilterIconClick}
                      onFilterChange={handleFilterChange}
                      skills={currentRows}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* {selectedCandidate && (
        <QuestionBankProfileDetails
          questionProfile={selectedCandidate}
          onCloseprofile={handleCloseProfile}
          sharingPermissions={sharingPermissions}
        />
      )} */}

      {sidebarOpen && (
        <>
          {/* <Sidebar
            onClose={closeSidebar}
            onOutsideClick={handleOutsideClick}
            onDataAdded={handleDataAdded}
            hideSkillField={false} 
          /> */}
        </>
      )}


    </>
  );
};

export default QuestionBank;
