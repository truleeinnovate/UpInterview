import { useState, useRef, useEffect, useCallback } from "react";
import "../../../../index.css";
import React, { Suspense } from 'react';
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
// import Sidebar from "../Team-Tab/CreateTeams";
import axios from "axios";
// import Editteams from "./EditTeam";
// import TeamProfileDetails from "./TeamProfileDetails";
import maleImage from '../../../Dashboard-Part/Images/man.png';
import femaleImage from '../../../Dashboard-Part/Images/woman.png';
import genderlessImage from '../../../Dashboard-Part/Images/transgender.png';
import { fetchFilterData } from '../../../../utils/dataUtils.js';
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

const TeamProfileDetails = React.lazy(() => import('./TeamProfileDetails'));
const Sidebar = React.lazy(() => import('../Team-Tab/CreateTeams'));
const Editteams = React.lazy(() => import('./EditTeam'));

const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
  const [isStatusMainChecked, setStatusMainChecked] = useState(false);
  const [isTechMainChecked, setTechMainChecked] = useState(false);
  const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);
  const [selectedTechOptions, setSelectedTechOptions] = useState([]);
  const isAnyOptionSelected = selectedStatusOptions.length > 0 || selectedTechOptions.length > 0;
  const handleUnselectAll = () => {
    setSelectedStatusOptions([]);
    setSelectedTechOptions([]);
    setStatusMainChecked(false);
    setTechMainChecked(false);
    onFilterChange({ status: [], tech: [] });
  };
  useEffect(() => {
    if (!isStatusMainChecked) setSelectedStatusOptions([]);
    if (!isTechMainChecked) setSelectedTechOptions([]);
  }, [isStatusMainChecked, isTechMainChecked]);
  const handleStatusMainToggle = () => {
    const newStatusMainChecked = !isStatusMainChecked;
    setStatusMainChecked(newStatusMainChecked);
    const newSelectedStatus = newStatusMainChecked ? qualification.map(q => q.TechnologyMasterName) : [];
    setSelectedStatusOptions(newSelectedStatus);

  };
  const handleTechMainToggle = () => {
    const newTechMainChecked = !isTechMainChecked;
    setTechMainChecked(newTechMainChecked);
    const newSelectedTech = newTechMainChecked ? skills.map(s => s.SkillName) : [];
    setSelectedTechOptions(newSelectedTech);

  };
  const handleStatusOptionToggle = (option) => {
    const selectedIndex = selectedStatusOptions.indexOf(option);
    const updatedOptions = selectedIndex === -1
      ? [...selectedStatusOptions, option]
      : selectedStatusOptions.filter((_, index) => index !== selectedIndex);

    setSelectedStatusOptions(updatedOptions);
  };
  const handleTechOptionToggle = (option) => {
    const selectedIndex = selectedTechOptions.indexOf(option);
    const updatedOptions = selectedIndex === -1
      ? [...selectedTechOptions, option]
      : selectedTechOptions.filter((_, index) => index !== selectedIndex);

    setSelectedTechOptions(updatedOptions);
  };
  const [skills, setSkills] = useState([]);
  const [qualification, setQualification] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData('skills');
        setSkills(skillsData);
        const technologyData = await fetchMasterData('technology');
        setQualification(technologyData);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };
    fetchData();
  }, []);

  const Apply = () => {
    onFilterChange({
      status: selectedStatusOptions,
      tech: selectedTechOptions,
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
            {(isAnyOptionSelected) && (
              <div>
                <button onClick={handleUnselectAll} className="font-bold text-md">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 flex-grow overflow-y-auto mb-20 mt-10">
          {/* Higher Qualification */}
          <div className="flex justify-between">
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4"
                  checked={isStatusMainChecked}
                  onChange={handleStatusMainToggle}
                />
                <span className="ml-3 font-bold">Technology</span>
              </label>
            </div>
            <div
              className="cursor-pointer mr-3 text-2xl"
              onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              {isStatusDropdownOpen ? (
                <MdKeyboardArrowUp />
              ) : (
                <MdKeyboardArrowDown />
              )}
            </div>
          </div>
          {isStatusDropdownOpen && (
            <div className="bg-white py-2 mt-1">
              {qualification.map((option, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4"
                    checked={selectedStatusOptions.includes(option.TechnologyMasterName)}
                    onChange={() => handleStatusOptionToggle(option.TechnologyMasterName)}
                  />
                  <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option.TechnologyMasterName}</span>
                </label>
              ))}
            </div>
          )}
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
                <span className="ml-3 font-bold">Skill</span>
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



const Team = () => {
  const { sharingPermissionscontext, objectPermissionscontext } = usePermissions();
  const objectPermissions = useMemo(() => objectPermissionscontext.team || {}, [objectPermissionscontext]);
  const sharingPermissions = useMemo(() => sharingPermissionscontext.team || {}, [sharingPermissionscontext]);
  // sidebar code
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

  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleCandidateClick = async (teams) => {
    if (objectPermissions.View) {
      setSelectedTeam(teams);
    }
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/team/${teams._id}/availability`);
      const availabilityData = response.data;
      setSelectedTeam({ ...teams, availability: availabilityData.Availability });
    } catch (error) {
      console.error("Error fetching availability data:", error);
    }
    setActionViewMore(false);
  };

  const handleCloseProfile = () => {
    setSelectedTeam(null);
  };


  const [candidateData, setCandidateData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const userId = localStorage.getItem("userId");

  const fetchTeamsData = useCallback(async () => {
    setLoading(true);
    try {
      const filteredTeams = await fetchFilterData('team', sharingPermissions);
      const teamsWithImages = filteredTeams.map((team) => {
        if (team.ImageData && team.ImageData.filename) {
          const imageUrl = `${process.env.REACT_APP_API_URL}/${team.ImageData.path.replace(/\\/g, '/')}`;
          return { ...team, imageUrl };
        }
        return team;
      });
      setCandidateData(teamsWithImages);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }

  }, [sharingPermissions]);
  useEffect(() => {
    fetchTeamsData();
  }, [fetchTeamsData]);
  const handleDataAdded = () => {
    fetchTeamsData();
  };


  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
  });
  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
  };

  const FilteredData = () => {
    if (!Array.isArray(candidateData)) return [];
    return candidateData.filter((user) => {
      const fieldsToSearch = [
        user.LastName,
        user.Email,
        user.Phone,
      ].filter(field => field !== null && field !== undefined);
      const matchesStatus = selectedFilters.status.length === 0 || selectedFilters.status.includes(user.Technology);
      const matchesTech = selectedFilters.tech.length === 0 || user.skills.some(skill => selectedFilters.tech.includes(skill.skill));
      const matchesSearchQuery = fieldsToSearch.some(
        (field) =>
          field !== undefined &&
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus && matchesTech;
    });
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedFilters]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(0);
  };


  const Navigate = useNavigate();
  const scheduling = () => {
    Navigate("/scheduletype_save");
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
  const endIndex = Math.min(startIndex + rowsPerPage, candidateData.length);
  const currentFilteredRows = FilteredData()
    .slice(startIndex, endIndex)
    .reverse();

  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("list");

  const handleListViewClick = () => {
    setViewMode("list");
  };

  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };

  const [tableVisible] = useState(true);

  const [actionViewMore, setActionViewMore] = useState({});

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const [selectedcandidate, setSelectedcandidate] = useState(null);

  const handleEditClick = async (teams) => {
    console.log("Selected candidate for editing:", teams);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/team/${teams._id}/availability`);
      const availability = response.data.Availability;
      setSelectedcandidate({ ...teams, availability });
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
    setActionViewMore(false);
  };

  const handleclose = () => {
    setSelectedcandidate(null);
    setActionViewMore(false);
  };
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
    if (candidateData.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };



  const [showMainContent, setShowMainContent] = useState(true);
  return (
    <ErrorBoundary> 
      <div>

      {showMainContent && !selectedTeam && (
        <section>
          <div className="fixed top-16 sm:top-20 md:top-24 left-0 right-0">
            <div className="flex justify-between p-4">
              <div>
                <span className="text-lg font-semibold">My Team</span>
              </div>

              <div>
                {notification && (
                  <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
                    {notification}
                  </div>
                )}
              </div>

              {objectPermissions.Create && (
                <div onClick={toggleSidebar} >
                  <span className="p-2 bg-custom-blue text-md sm:text-sm md:text-sm text-white font-semibold border shadow rounded">
                    Add
                  </span>
                </div>
              )}
            </div>

          </div>


          <div className="fixed top-28 sm:top-32 md:top-36 left-0 right-0">
            <div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end sm:float-end p-4 ">
              <div className="flex items-center sm:hidden md:hidden">
                <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={handleListViewClick}>
                    <FaList
                      className={`text-xl mr-4 ${viewMode === "list" ? "text-custom-blue" : ""}`}
                    />
                  </span>
                </Tooltip>
                <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={handleKanbanViewClick}>
                    <TbLayoutGridRemove
                      className={`text-xl ${viewMode === "kanban" ? "text-custom-blue" : ""}`}
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
                      placeholder="Search by Name, Email, Phone."
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
                      className={`border p-2 mr-2 text-xl sm:text-md md:text-md ${currentPage === 0 ? "cursor-not-allowed" : ""} ${activeArrow === "prev" ? "text-custom-blue" : ""}`}
                      onClick={prevPage}
                      disabled={currentPage === 0}
                    >
                      <IoIosArrowBack className="text-custom-blue" />
                    </span>
                  </Tooltip>

                  <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      className={`border p-2 text-xl sm:text-md md:text-md ${currentPage === totalPages - 1 ? "cursor-not-allowed" : ""} ${activeArrow === "next" ? "text-custom-blue" : ""}`}
                      onClick={nextPage}
                      disabled={currentPage === totalPages - 1}
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
                        opacity: candidateData.length === 0 ? 0.2 : 1,
                        pointerEvents: candidateData.length === 0 ? "none" : "auto",
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
                            <thead className="bg-custom-bg  sticky top-0 z-10 text-xs">
                              <tr>
                                <th scope="col" className="py-3 px-6">
                                  Name
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Email
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Phone
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Technology
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Location
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Skills
                                </th>
                                <th scope="col" className="py-3 pl-10">
                                  Actions
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
                              ) : candidateData.length === 0 ? (
                                <tr>
                                  <td colSpan="8" className="py-10 text-center">
                                    <div className="flex flex-col items-center justify-center p-5">
                                      <p className="text-9xl rotate-180 text-custom-blue"><CgInfo /></p>
                                      <p className="text-center text-lg font-normal">You don't have team yet. Create new team.</p>
                                      <p onClick={toggleSidebar} className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md">Add team</p>
                                    </div>
                                  </td>
                                </tr>
                              ) : currentFilteredRows.length === 0 ? (
                                <tr>
                                  <td colSpan="7" className="py-10 text-center">
                                    <p className="text-lg font-normal">No data found.</p>
                                  </td>
                                </tr>
                              ) : (
                                currentFilteredRows.map((teams) => (
                                  <tr key={teams._id} className="bg-white border-b cursor-pointer text-xs">
                                    <td className="py-4 px-6 text-custom-blue">
                                      <div className="flex items-center gap-3" onClick={() => handleCandidateClick(teams)}>
                                        <img
                                          src={teams.imageUrl || (teams.Gender === "Male" ? maleImage : teams.Gender === "Female" ? femaleImage : genderlessImage)}
                                          alt="Candidate"
                                          className="w-7 h-7 rounded-full object-cover"
                                        />
                                        {teams.LastName}
                                      </div>
                                    </td>
                                    <td className="py-2 px-6">{teams.Email}</td>
                                    <td className="py-2 px-6">{teams.Phone}</td>
                                    <td className="py-2 px-6">{teams.Technology}</td>
                                    <td className="py-2 px-6">{teams.Location}</td>
                                    <td className="py-2 px-6">
                                      {teams.skills?.map((skillEntry, index) => (
                                        <div key={index}>
                                          {skillEntry.skill}
                                          {index < teams.skills.length - 1 && ", "}
                                        </div>
                                      ))}
                                    </td>
                                    <td className="py-2 px-6 relative">
                                      <div>
                                        <button onClick={() => toggleAction(teams._id)}>
                                          <FiMoreHorizontal className="text-3xl " />
                                        </button>
                                        {actionViewMore === teams._id && (
                                          <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                            <div className="space-y-1">
                                              {objectPermissions.View && (
                                                <p className="hover:bg-gray-200 p-1 rounded pl-3" onClick={() => handleCandidateClick(teams)}>
                                                  View
                                                </p>
                                              )}
                                              {objectPermissions.Edit && (
                                                <p className="hover:bg-gray-200 p-1 rounded pl-3" onClick={() => handleEditClick(teams)}>
                                                  Edit
                                                </p>
                                              )}
                                              <p className="hover:bg-gray-200 p-1 rounded pl-3" onClick={scheduling}>
                                                Schedule
                                              </p>
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
                    <div className="flex-grow"
                      style={{ marginRight: isMenuOpen ? "290px" : "0" }}>
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
                          ) : candidateData.length === 0 ? (
                            <div className="py-10 text-center">
                              <div className="flex flex-col items-center justify-center p-5">
                                <p className="text-9xl rotate-180 text-custom-blue"><CgInfo /></p>
                                <p className="text-center text-lg font-normal">You don't have team yet. Create new team.</p>
                                <p onClick={toggleSidebar} className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md">Add team</p>
                              </div>
                            </div>
                          ) : currentFilteredRows.length === 0 ? (
                            <div className="col-span-3 py-10 text-center">
                              <p className="text-lg font-normal">No data found.</p>
                            </div>
                          ) : (
                            currentFilteredRows.map((teams) => (
                              <div key={teams._id} className="bg-white border border-custom-blue shadow-md p-2 rounded">
                                <div className="relative">
                                  <div className="float-right">
                                    <button
                                      onClick={() => toggleAction(teams._id)}
                                    >
                                      <MdMoreVert className="text-3xl mt-1" />
                                    </button>
                                    {actionViewMore === teams._id && (
                                      <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                        <div className="space-y-1">
                                          {objectPermissions.View && (
                                            <p
                                              className="hover:bg-gray-200 p-1 rounded pl-3"
                                              onClick={() =>
                                                handleCandidateClick(teams)
                                              }
                                            >
                                              View
                                            </p>
                                          )}
                                          {objectPermissions.Edit && (
                                            <p
                                              className="hover:bg-gray-200 p-1 rounded pl-3"
                                              onClick={() =>
                                                handleEditClick(teams)
                                              }
                                            >
                                              Edit
                                            </p>
                                          )}
                                          <p
                                            className="hover:bg-gray-200 p-1 rounded pl-3"
                                            onClick={scheduling}
                                          >
                                            Schedule
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex">

                                  <div className="w-16 h-14 mt-3 ml-1 mr-3 overflow-hidden cursor-pointer">
                                    <img
                                      src={teams.imageUrl || (teams.Gender === "Male" ? maleImage : teams.Gender === "Female" ? femaleImage : genderlessImage)}
                                      alt="Candidate"
                                      className="w-16 h-16 rounded-full object-cover"
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <div
                                      className="text-custom-blue text-lg cursor-pointer break-words"
                                      onClick={() =>
                                        handleCandidateClick(teams)
                                      }
                                    >
                                      {teams.LastName}
                                    </div>
                                    <div className="text-xs grid grid-cols-2 gap-2 items-start">
                                      <div className="text-gray-400">
                                        Email
                                      </div>
                                      <div>{teams.Email}</div>
                                      <div className="text-gray-400">
                                        Phone
                                      </div>
                                      <div>{teams.Phone}</div>
                                      <div className="text-gray-400">
                                        Technology
                                      </div>
                                      <div>{teams.Technology}</div>
                                      <div className="text-gray-400">
                                        Location
                                      </div>
                                      <div>{teams.Location}</div>
                                      <div className="text-gray-400">
                                        Skills
                                      </div>
                                      <div >
                                        {teams.skills.map((skillEntry, index) => (
                                          <div key={index}>
                                            {skillEntry.skill}{index < teams.skills.length - 1 && ', '}
                                          </div>
                                        ))}
                                      </div>
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
        {selectedcandidate && (
          <Suspense fallback={<div>Loading...</div>}>
            <Editteams onClose={handleclose} candidate1={selectedcandidate} availability={selectedcandidate.availability} />
          </Suspense>
        )}

      {selectedTeam && (
        <Suspense fallback={<div>Loading...</div>}>
          <TeamProfileDetails candidate={selectedTeam} onCloseprofile={handleCloseProfile} />
        </Suspense>
      )}

      {sidebarOpen && (
        <>
          <div
            className={"fixed inset-0 bg-black bg-opacity-15 z-50"}
          >
            <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
              <Suspense fallback={<div>Loading...</div>}>
                <Sidebar
                  onClose={closeSidebar}
                  onOutsideClick={handleOutsideClick}
                  onDataAdded={handleDataAdded}
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

export default Team;
