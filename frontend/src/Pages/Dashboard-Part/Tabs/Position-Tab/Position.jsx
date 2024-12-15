import { useState, useRef, useEffect, useCallback } from "react";
import "../../../../index.css";
import React, { Suspense } from 'react';
import "../styles/tabs.scss";
import Tooltip from "@mui/material/Tooltip";
// import { useNavigate } from "react-router-dom";
import { fetchFilterData } from "../../../../utils/dataUtils.js";
import { fetchMasterData } from '../../../../utils/fetchMasterData.js';
import { usePermissions } from '../../../../PermissionsContext';
import { useMemo } from 'react';
import ErrorBoundary from '../../../../ErrorBoundary.jsx';

import { ReactComponent as IoIosArrowBack } from '../../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../../icons/IoIosArrowForward.svg';
import { ReactComponent as FaList } from '../../../../icons/FaList.svg';
import { ReactComponent as TbLayoutGridRemove } from '../../../../icons/TbLayoutGridRemove.svg';
import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
import { ReactComponent as MdMoreVert } from '../../../../icons/MdMoreVert.svg';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';
import { ReactComponent as FiFilter } from '../../../../icons/FiFilter.svg';
import { ReactComponent as MdKeyboardArrowUp } from '../../../../icons/MdKeyboardArrowUp.svg';
import { ReactComponent as MdKeyboardArrowDown } from '../../../../icons/MdKeyboardArrowDown.svg';
import { ReactComponent as CgInfo } from '../../../../icons/CgInfo.svg';
import { ReactComponent as LuFilterX } from '../../../../icons/LuFilterX.svg';

// const PositionProfileDetails = React.lazy(() => import('./PositionProfileDetails'));
const Sidebar = React.lazy(() => import('../Position-Tab/Position-Form.jsx'));
// const Editposition = React.lazy(() => import('./Editpositionform.jsx'));

const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
  const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
  const [isStatusMainChecked, setStatusMainChecked] = useState(false);
  const [isTechMainChecked, setTechMainChecked] = useState(false);
  const [selectedTechOptions, setSelectedTechOptions] = useState([]);
  const isAnyOptionSelected = selectedTechOptions.length > 0;
  const handleUnselectAll = () => {
    setSelectedTechOptions([]);
    setStatusMainChecked(false);
    setTechMainChecked(false);
    setMinExperience('');
    setMaxExperience('');
    onFilterChange({ tech: [], experience: { min: '', max: '' } });
  };
  useEffect(() => {
    if (!isTechMainChecked) setSelectedTechOptions([]);
  }, [isStatusMainChecked, isTechMainChecked]);

  const handleTechMainToggle = () => {
    const newTechMainChecked = !isTechMainChecked;
    setTechMainChecked(newTechMainChecked);
    const newSelectedTech = newTechMainChecked ? skills.map(s => s.SkillName) : [];
    setSelectedTechOptions(newSelectedTech);

  };

  const handleTechOptionToggle = (option) => {
    const selectedIndex = selectedTechOptions.indexOf(option);
    const updatedOptions = selectedIndex === -1
      ? [...selectedTechOptions, option]
      : selectedTechOptions.filter((_, index) => index !== selectedIndex);

    setSelectedTechOptions(updatedOptions);
  };
  const [skills, setSkills] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData('skills');
        setSkills(skillsData);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };
    fetchData();
  }, []);

  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');

  const handleExperienceChange = (e, type) => {
    const value = Math.max(0, Math.min(15, e.target.value));
    if (type === 'min') {
      setMinExperience(value);
    } else {
      setMaxExperience(value);
    }

  };
  const Apply = () => {
    onFilterChange({
      tech: selectedTechOptions,
      experience: { min: minExperience, max: maxExperience },
    });
    if (window.innerWidth < 1023) {
      closeOffcanvas();
    }
  }
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
            {(isAnyOptionSelected || minExperience || maxExperience) && (
              <div>
                <button onClick={handleUnselectAll} className="font-bold text-md">
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
                  <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option.SkillName}</span>
                </label>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-2 ml-5">
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <span className="ml-3 font-bold">Experience</span>
              </label>
            </div>
          </div>
          <div className="bg-white py-2 mt-1">
            <div className="flex items-center ml-10">
              <input
                type="number"
                placeholder="Min"
                value={minExperience}
                min="0"
                max="15"
                onChange={(e) => handleExperienceChange(e, 'min')}
                className="border-b form-input w-20"
              />
              <span className="mx-3">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxExperience}
                min="1"
                max="15"
                onChange={(e) => handleExperienceChange(e, 'max')}
                className="border-b form-input w-20"
              />
            </div>
          </div>
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

const Position = () => {
  const { sharingPermissionscontext, objectPermissionscontext } = usePermissions();
  const sharingPermissions = useMemo(() => sharingPermissionscontext.position || {}, [sharingPermissionscontext]);
  const objectPermissions = useMemo(() => objectPermissionscontext.position || {}, [objectPermissionscontext]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleOutsideClick = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
  }, []);

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

  const [searchQuery, setSearchQuery] = useState("");

  // const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState(null);

  const handlePositionClick = (position) => {
    if (objectPermissions.View) {
      setSelectedPosition(position);
    }
    setActionViewMore(false);
  };
  // const handleCloseProfile = () => {
  //   setSelectedPosition(null);
  // };
  const [skillsData, setSkillsData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");

  const fetchSkillsData = useCallback(async () => {
    setLoading(true);
    try {
      const filteredPositions = await fetchFilterData(
        "position",
        sharingPermissions
      );
      setSkillsData(filteredPositions);
    } catch (error) {
      console.error("Error fetching position data:", error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissions]);

  useEffect(() => {
    fetchSkillsData();
  }, [fetchSkillsData]);

  // const handlePositionAdded = () => {
  //   fetchSkillsData();
  // };

  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: [],
  });

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
  };

  const FilteredData = () => {
    if (!Array.isArray(skillsData)) return [];
    return skillsData.filter((user) => {
      const fieldsToSearch = [user.title, user.companyname];

      const matchesTech =
        selectedFilters.tech.length === 0 ||
        user.skills.some((skill) => selectedFilters.tech.includes(skill.skill));

      // Parse experience values
      const minExp = parseInt(selectedFilters.experience.min, 10);
      const maxExp = parseInt(selectedFilters.experience.max, 10);
      const userMinExp = parseInt(user.minexperience, 10);
      const userMaxExp = parseInt(user.maxexperience, 10);

      // Experience matching logic
      const matchesExperience =
        (isNaN(minExp) && isNaN(maxExp)) ||
        (!isNaN(minExp) &&
          !isNaN(maxExp) &&
          userMinExp >= minExp &&
          userMaxExp <= maxExp) ||
        (!isNaN(minExp) && isNaN(maxExp) && userMinExp >= minExp) ||
        (isNaN(minExp) && !isNaN(maxExp) && userMaxExp <= maxExp);

      const matchesSearchQuery = fieldsToSearch.some(
        (field) =>
          field !== undefined &&
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesTech && matchesExperience;
    });
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedFilters]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(0);
  };

  const addLineBreaks = (text) => {
    const maxLength = 20;
    if (text.length > maxLength) {
      return text.match(new RegExp(`.{1,${maxLength}}`, "g")).join("<br>");
    }
    return text;
  };
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;
  const [activeArrow, setActiveArrow] = useState(null);

  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);

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
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
  const currentFilteredRows = FilteredData()
    .slice(startIndex, endIndex)
    .reverse();

  const [viewMode, setViewMode] = useState("list");

  const handleListViewClick = () => {
    setViewMode("list");
  };

  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };

  const [tableVisible] = useState(true);

  // const [selectedCandidate, setSelectedCandidate] = useState(null);

  // const closeModal = () => {
  //   setSelectedCandidate(null);
  // };

  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const [actionViewMore, setActionViewMore] = useState({});

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  // const [selectedcandidate, setSelectedcandidate] = useState(null);

  const handleEditClick = (position) => {
    // setSelectedcandidate(position);
    setActionViewMore(false);
  };

  // const handleclose = () => {
  //   setSelectedcandidate(null);
  //   setActionViewMore(false);
  // };
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
    if (skillsData.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };

  const [showMainContent, setShowMainContent] = useState(true);

  return (
    <ErrorBoundary>
      <div>
        {showMainContent && !selectedPosition && (
          <section>
            <div className="fixed top-16 sm:top-20 md:top-24 left-0 right-0">
              <div className="flex justify-between p-4">
                <div>
                  <span className="text-lg font-semibold">Positions</span>
                </div>

                <div>
                  {notification && (
                    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
                      {notification}
                    </div>
                  )}
                </div>

{/*                 {objectPermissions.Create && ( */}
                  <div onClick={toggleSidebar}>
                    <span className="p-2 bg-custom-blue text-md sm:text-sm md:text-sm text-white font-semibold border shadow rounded">
                      Add
                    </span>
                  </div>
{/*                 )} */}
              </div>
            </div>
            <div className="fixed top-28 sm:top-32 md:top-36 left-0 right-0">
              <div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end sm:float-end p-4 ">
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
                        placeholder="Search by Title, Company Name."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="rounded-full border h-8"
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
                        className={`border p-2 mr-2 text-xl sm:text-md md:text-md  rounded-md ${currentPage === 0 ? " cursor-not-allowed" : ""
                          } ${activeArrow === "prev" ? "text-blue-500" : ""}`}
                        onClick={prevPage}
                      >
                        <IoIosArrowBack className="text-custom-blue" />
                      </span>
                    </Tooltip>

                    <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                      <span
                        className={`border p-2 text-xl sm:text-md md:text-md  rounded-md ${currentPage === totalPages - 1 ? " cursor-not-allowed" : ""
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
                          opacity: skillsData.length === 0 ? 0.2 : 1,
                          pointerEvents: skillsData.length === 0 ? "none" : "auto",
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
                                    Title
                                  </th>
                                  <th scope="col" className="py-3 px-6">
                                    Company Name
                                  </th>
                                  <th scope="col" className="py-3 px-6">
                                    Job Description
                                  </th>
                                  <th scope="col" className="py-3 px-6">
                                    Experience
                                  </th>
                                  <th scope="col" className="py-3 px-6">
                                    Skills
                                  </th>
                                  <th scope="col" className="py-3 px-6">
                                    Rounds
                                  </th>
                                  <th scope="col" className="py-3 pl-6">
                                    Action
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
                                ) : skillsData.length === 0 ? (
                                  <tr>
                                    <td colSpan="8" className="py-10 text-center">
                                      <div className="flex flex-col items-center justify-center p-5">
                                        <p className="text-9xl rotate-180 text-blue-500">
                                          <CgInfo />
                                        </p>
                                        <p className="text-center text-lg font-normal">
                                          You don't have position yet. Create new
                                          position.
                                        </p>
                                        <p
                                          onClick={toggleSidebar}
                                          className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
                                        >
                                          Add position
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
                                  currentFilteredRows.map((position) => (
                                    <tr
                                      key={position._id}
                                      className="bg-white border-b cursor-pointer text-xs"
                                    >
                                      <td
                                        onClick={() => handlePositionClick(position)}
                                        className="py-2 px-6 text-custom-blue"
                                      >
                                        {position.title}
                                      </td>
                                      <td
                                        className="py-2 px-6"
                                        style={{ whiteSpace: "normal" }}
                                      >
                                        {position.companyname}
                                      </td>
                                      <td
                                        className="py-2 px-6"
                                        style={{
                                          whiteSpace: "normal",
                                          maxWidth: "200px",
                                        }}
                                        dangerouslySetInnerHTML={{
                                          __html: addLineBreaks(
                                            position.jobdescription
                                          ),
                                        }}
                                      ></td>
                                      <td
                                        className="py-2 px-6"
                                        style={{ whiteSpace: "normal" }}
                                      >
                                        {position.minexperience}-
                                        {position.maxexperience} years
                                      </td>
                                      <td
                                        className="py-2 px-6"
                                        style={{ whiteSpace: "normal" }}
                                      >
                                        {position.skills.map((skillEntry, index) => (
                                          <div key={index}>
                                            {skillEntry.skill}
                                            {index < position.skills.length - 1 &&
                                              ", "}
                                          </div>
                                        ))}
                                      </td>
                                      <td
                                        className="py-2 px-6"
                                        style={{ whiteSpace: "normal" }}
                                      >
                                        <Tooltip
                                          title={
                                            position.rounds &&
                                              position.rounds.length > 0
                                              ? position.rounds.map(
                                                (round, index) => (
                                                  <div key={index}>
                                                    {round.round}
                                                  </div>
                                                )
                                              )
                                              : "No rounds"
                                          }
                                          arrow
                                        >
                                          <span>
                                            {position.rounds &&
                                              position.rounds.length > 0
                                              ? `${position.rounds.length} rounds`
                                              : "No rounds"}
                                          </span>
                                        </Tooltip>
                                      </td>
                                      <td
                                        className="py-2 pl-6"
                                        style={{ whiteSpace: "normal" }}
                                      >
                                        <div>
                                          <button
                                            onClick={() => toggleAction(position._id)}
                                          >
                                            <FiMoreHorizontal className="text-3xl" />
                                          </button>
                                          {actionViewMore === position._id && (
                                            <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                              <div className="space-y-1">
                                                {objectPermissions.View && (
                                                  <p
                                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                                    onClick={() =>
                                                      handlePositionClick(position)
                                                    }
                                                  >
                                                    View
                                                  </p>
                                                )}
                                                {objectPermissions.Edit && (
                                                  <p
                                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                                    onClick={() =>
                                                      handleEditClick(position)
                                                    }
                                                  >
                                                    Edit
                                                  </p>
                                                )}{" "}
                                              </div>
                                            </div>
                                          )}
                                        </div>
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
                            ) : skillsData.length === 0 ? (
                              <div className="py-10 text-center">
                                <div className="flex flex-col items-center justify-center p-5">
                                  <p className="text-9xl rotate-180 text-blue-500">
                                    <CgInfo />
                                  </p>
                                  <p className="text-center text-lg font-normal">
                                    You don't have position yet. Create new position.
                                  </p>
                                  <button
                                    onClick={toggleSidebar}
                                    className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
                                  >
                                    Add Position
                                  </button>
                                </div>
                              </div>
                            ) : currentFilteredRows.length === 0 ? (
                              <div className="col-span-3 py-10 text-center">
                                <p className="text-lg font-normal">
                                  No data found.
                                </p>
                              </div>
                            ) : (
                              currentFilteredRows.map((position) => (
                                <div
                                  key={position._id}
                                  className="bg-white border border-custom-blue shadow-md cursor-pointer p-2 rounded"
                                >

                                  <div className="relative">
                                    <div className="float-right">
                                      <button
                                        onClick={() =>
                                          toggleAction(position._id)
                                        }
                                      >
                                        <MdMoreVert className="text-3xl mt-1" />
                                      </button>
                                      {actionViewMore === position._id && (
                                        <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                          <div className="space-y-1">
                                            {objectPermissions.View && (
                                              <p
                                                className="hover:bg-gray-200 p-1 rounded pl-3"
                                                onClick={() =>
                                                  handlePositionClick(position)
                                                }
                                              >
                                                View
                                              </p>
                                            )}
                                            {objectPermissions.Edit && (
                                              <p
                                                className="hover:bg-gray-200 p-1 rounded pl-3"
                                                onClick={() =>
                                                  handleEditClick(position)
                                                }
                                              >
                                                Edit
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>


                                  <div className="flex justify-between">
                                    <div className="flex">
                                      <div className="w-32 ml-2">
                                        <p
                                          className="text-custom-blue text-lg w-80"
                                          onClick={() =>
                                            handlePositionClick(position)
                                          }
                                        >
                                          {position.title}
                                        </p>
                                        <p className="text-gray-700">
                                          <span className="text-slate-400">
                                            Company
                                          </span>
                                        </p>
                                        <p className="text-gray-700">
                                          <span className="text-slate-400">
                                            Experience
                                          </span>
                                        </p>
                                        <p className="text-gray-700">
                                          <span className="text-slate-400">
                                            Skills
                                          </span>
                                        </p>
                                        <p className="text-gray-700">
                                          <span className="text-slate-400">
                                            Rounds
                                          </span>
                                        </p>
                                        <p className="text-gray-700">
                                          <span className="text-slate-400">
                                            Job Description
                                          </span>
                                        </p>
                                      </div>
                                      <div className="mt-7">
                                        <p className="text-gray-700">
                                          {position.companyname}
                                        </p>
                                        <p className="text-gray-700">
                                          {position.minexperience}-
                                          {position.maxexperience} years
                                        </p>
                                        <p className="text-gray-700">
                                          {position.skills.map(
                                            (skillEntry, index) => (
                                              <div key={index}>
                                                {skillEntry.skill}
                                                {index <
                                                  position.skills.length - 1 &&
                                                  ", "}
                                              </div>
                                            )
                                          )}
                                        </p>
                                        <p className="text-gray-7000">
                                          <Tooltip
                                            title={
                                              position.rounds &&
                                                position.rounds.length > 0
                                                ? position.rounds.map(
                                                  (round, index) => (
                                                    <div key={index}>
                                                      {round.round}
                                                    </div>
                                                  )
                                                )
                                                : "No rounds"
                                            }
                                            arrow
                                          >
                                            <span>
                                              {position.rounds &&
                                                position.rounds.length > 0
                                                ? `${position.rounds.length} rounds`
                                                : "No rounds"}
                                            </span>
                                          </Tooltip>
                                        </p>
                                        <p className="text-gray-700">
                                          {position.jobdescription}
                                        </p>
                                      </div>
                                    </div>

                                  </div>
                                </div>
                              ))
                            )}

                          </div>
                        </div>
                      </div>
                      <OffcanvasMenu
                        isOpen={isMenuOpen}
                        closeOffcanvas={handleFilterIconClick}
                        onFilterChange={handleFilterChange}
                      />
                    </div>

                  )}
                </div>
              )}
            </div>
          </section>
        )}
        {/* {selectedPosition && (
        <Suspense fallback={<div>Loading...</div>}>
        <PositionProfileDetails
          position={selectedPosition}
          onCloseprofile={handleCloseProfile}
        />
        </Suspense>
        )} */}
        {/* {selectedcandidate && (
        <Suspense fallback={<div>Loading...</div>}>
        <Editposition
          onClose={handleclose}
          candidate1={selectedcandidate}
          rounds={selectedcandidate.rounds}
        />
        </Suspense>
        )} */}
        {sidebarOpen && (
          <>
            <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"}>
              <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
                <Suspense fallback={<div>Loading...</div>}>
                  <Sidebar
                    onClose={closeSidebar}
                    onOutsideClick={handleOutsideClick}
                    onPositionAdded={handlePositionAdded}
                  />
                </Suspense>
              </div>
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Position;
