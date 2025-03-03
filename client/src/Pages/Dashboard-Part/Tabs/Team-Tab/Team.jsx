import { useState, useRef, useEffect, useCallback } from "react";
import "../../../../index.css";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import Sidebar from "../Team-Tab/CreateTeams";
import axios from "axios";
import Cookies from "js-cookie";
import TeamProfileDetails from "./TeamProfileDetails";
import maleImage from '../../../Dashboard-Part/Images/man.png';
import femaleImage from '../../../Dashboard-Part/Images/woman.png';
import genderlessImage from '../../../Dashboard-Part/Images/transgender.png';
import { fetchFilterData } from '../../../../utils/dataUtils.js';
import { fetchMasterData } from '../../../../utils/fetchMasterData.js';
import { usePermissions } from '../../../../Context/PermissionsContext.js';
import { useMemo } from 'react';

import { ReactComponent as IoIosArrowBack } from '../../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
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
import { useCustomContext } from "../../../../Context/Contextfetch.js";

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
  const {
    teamsData,
    loading
  } = useCustomContext();
  const { objectPermissionscontext } = usePermissions();
  const objectPermissions = useMemo(() => objectPermissionscontext.team || {}, [objectPermissionscontext]);
  // sidebar code

  const [teamMembers, setTeamMembers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const toastMessageCall = () => {
    setToastMessage("Data updated successfully !");
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const toggleLookup = () => {
    setSidebarOpen(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleCandidateClick = async (teams) => {
    if (objectPermissions.View) {
      setSelectedTeam({ ...teams });
    }
    setActionViewMore(false);
  };

  const handleCloseProfile = () => {
    setSelectedTeam(null);
  };

  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
  });

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
  };

  const FilteredData = () => {
    if (!Array.isArray(teamMembers)) {
      console.warn("teamMembers is not an array:", teamMembers);
      return [];
    }
    const filteredResults = teamMembers.filter(user => {

      const fieldsToSearch = [
        user.name,
        user.email,
        user.phone
      ].filter(field => field !== null && field !== undefined);

      const matchesSearchQuery = fieldsToSearch.some(field =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesStatus =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(user.technology?.[0]);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        user.skills?.some(skill => selectedFilters.tech.includes(skill.skill));
      return matchesSearchQuery && matchesStatus && matchesTech;
    });
    return filteredResults;
  };

  // const FilteredData = () => {
  //   return teamsData.filter((user) => {
  //     const fields = [user.name, user.email, user.phone].filter(Boolean);
  //     const matchesSearch = fields.some((field) =>
  //       field.toString().toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //     const matchesStatus = !selectedFilters.status.length || selectedFilters.status.includes(user.technology?.[0]);
  //     const matchesTech = !selectedFilters.tech.length || user.skills?.some((skill) => selectedFilters.tech.includes(skill.skill));
  //     return matchesSearch && matchesStatus && matchesTech;
  //   });
  // };

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedFilters]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(0);
  };


  const Navigate = useNavigate();
  const scheduling = () => {
    Navigate("/scheduletype_save");
  };

  // const filteredResults = FilteredData();
  // const totalRows = filteredResults.length;
  // const startIndex = currentPage * rowsPerPage;
  // const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  // const currentFilteredRows = filteredResults.slice(startIndex, endIndex);

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  const [activeArrow, setActiveArrow] = useState(null);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, teamsData.length);
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

  const [actionViewMore, setActionViewMore] = useState({});

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };


  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleEditClick = (candidate) => {
    setSelectedCandidate(candidate);
    setShowNewCandidateContent(true);
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
    if (teamsData.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };

  const [showMainContent, setShowMainContent] = useState(true);
  const organizationId = Cookies.get("organizationId");
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/contacts/organization/${organizationId}`
      );
      const unaddedTeamUsers = response.data.filter(user => !user.isAddedTeam);
      setUserData(unaddedTeamUsers);
    } catch (error) {
      console.error("Error fetching users data:", error);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const filtered = userData.filter((user) =>
      user.Firstname?.includes(searchTerm)
    );
    setFilteredData(filtered);
  }, [searchTerm, userData]);

  const [error, setError] = useState(null);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/contacts`);
      const filteredMembers = response.data.filter(member => member.isAddedTeam === "added to team");
      setTeamMembers(filteredMembers);
      setError(null);
    } catch (err) {
      console.error('Error fetching team members:', err.message);
      setError(err.message);
    }
  };


  useEffect(() => {
    // console.log('Component mounted, fetching team members...');
    fetchTeamMembers();
  }, []);



  // if (loading) {
  //   return (
  //     <tr>
  //       <td colSpan="7" className="text-center py-4">
  //         Loading team members...
  //       </td>
  //     </tr>
  //   );
  // }

  // if (error) {
  //   return (
  //     <tr>
  //       <td colSpan="7" className="text-center py-4 text-red-500">
  //         Error loading team members: {error}
  //       </td>
  //     </tr>
  //   );
  // }



  return (
    <>

      {showMainContent && !selectedTeam && (
        <section>
          <div className="fixed top-16 sm:top-20 md:top-24 left-0 right-0">
            <div className="flex justify-between p-4">
              <div>
                <span className="text-lg font-semibold">My Team</span>
              </div>

              {objectPermissions.Create && (
                <div onClick={toggleLookup}>
                  <span className="p-2 bg-custom-blue cursor-pointer text-md sm:text-sm md:text-sm text-white font-semibold border shadow rounded">
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
                        opacity: teamsData.length === 0 ? 0.2 : 1,
                        pointerEvents: teamsData.length === 0 ? "none" : "auto",
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
                              ) : teamsData.length === 0 ? (
                                <tr>
                                  <td colSpan="8" className="py-10 text-center">
                                    <div className="flex flex-col items-center justify-center p-5">
                                      <p className="text-9xl rotate-180 text-custom-blue">
                                        <CgInfo />
                                      </p>
                                      <p className="text-center text-lg font-normal">
                                        No data available.
                                      </p>
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
                                          src={
                                            teams.imageData?.path ||
                                            (teams.gender === "Male"
                                              ? maleImage
                                              : teams.gender === "Female"
                                                ? femaleImage
                                                : genderlessImage)
                                          }
                                          alt="Contact"
                                          className="w-7 h-7 rounded-full object-cover"
                                        />
                                        {teams.name || "N/A"}
                                      </div>
                                    </td>
                                    <td className="py-2 px-6">{teams.email || "N/A"}</td>
                                    <td className="py-2 px-6">{teams.phone || "N/A"}</td>
                                    <td className="py-2 px-6">
                                      {teams.technology?.length > 0
                                        ? teams.technology.join(", ")
                                        : "No technology available"}
                                    </td>
                                    <td className="py-2 px-6">{teams.location || "No location available"}</td>
                                    <td className="py-2 px-6">
                                      {teams.skills?.length > 0
                                        ? teams.skills.map((skill) => skill.skill).join(", ")
                                        : "No skills available"}
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
                          ) : teamsData.length === 0 ? (
                            <div className="py-10 text-center">
                              <div className="flex flex-col items-center justify-center p-5">
                                <p className="text-9xl rotate-180 text-custom-blue">
                                  <CgInfo />
                                </p>
                                <p className="text-center text-lg font-normal">
                                  You don't have a team yet. Create a new team.
                                </p>
                                <p
                                  onClick={toggleSidebar}
                                  className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
                                >
                                  Add team
                                </p>
                              </div>
                            </div>
                          ) : currentFilteredRows.length === 0 ? (
                            <div className="col-span-3 py-10 text-center">
                              <p className="text-lg font-normal">No data found.</p>
                            </div>
                          ) : (
                            currentFilteredRows.map((teams) => (
                              <div
                                key={teams._id}
                                className="bg-white border border-custom-blue shadow-md p-4 rounded"
                              >
                                <div className="relative">
                                  <div className="float-right">
                                    <button onClick={() => toggleAction(teams._id)}>
                                      <MdMoreVert className="text-3xl mt-1" />
                                    </button>
                                    {actionViewMore === teams._id && (
                                      <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                        <div className="space-y-1">
                                          {objectPermissions.View && (
                                            <p
                                              className="hover:bg-gray-200 p-1 rounded pl-3"
                                              onClick={() => handleCandidateClick(teams)}
                                            >
                                              View
                                            </p>
                                          )}
                                          {objectPermissions.Edit && (
                                            <p
                                              className="hover:bg-gray-200 p-1 rounded pl-3"
                                              onClick={() => handleEditClick(teams)}
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
                                  <div className="w-16 h-16 mt-3 ml-1 mr-3 overflow-hidden cursor-pointer">
                                    <img
                                      src={
                                        teams.contactId?.imageData?.path ||
                                        (teams.contactId?.gender === "Male"
                                          ? maleImage
                                          : teams.contactId?.gender === "Female"
                                            ? femaleImage
                                            : genderlessImage)
                                      }
                                      alt="Candidate"
                                      className="w-16 h-16 rounded-full object-cover"
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <div
                                      className="text-custom-blue text-lg cursor-pointer break-words"
                                      onClick={() => handleCandidateClick(teams)}
                                    >
                                      {teams.contactId?.name || "N/A"}
                                    </div>
                                    <div className="text-xs grid grid-cols-2 gap-2 items-start">
                                      <div className="text-gray-400">Email</div>
                                      <div>{teams.contactId?.email || "N/A"}</div>
                                      <div className="text-gray-400">Phone</div>
                                      <div>{teams.contactId?.phone || "N/A"}</div>
                                      <div className="text-gray-400">Technology</div>
                                      <div>
                                        {teams.contactId?.technology?.length > 0
                                          ? teams.contactId.technology.join(", ")
                                          : "No technology available"}
                                      </div>
                                      <div className="text-gray-400">Location</div>
                                      <div>{teams.contactId?.location || "N/A"}</div>
                                      <div className="text-gray-400">Skills</div>
                                      <div>
                                        {teams.contactId?.skills?.length > 0
                                          ? teams.contactId.skills
                                            .map((skill) => skill.skill || skill)
                                            .join(", ")
                                          : "No skills available"}
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
      {/* {showNewCandidateContent && (
        <div className="fixed inset-0 bg-black bg-opacity-15 z-50">
          <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-500 transform">
            <Sidebar onClose={handleclose} candidate={selectedCandidate} forEditTeam={true} />
          </div>
        </div>
      )} */}

      {selectedTeam && (
        <TeamProfileDetails candidate={selectedTeam} onCloseprofile={handleCloseProfile} />
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-15 z-50">
          <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-500 transform">
            <Sidebar
              onClose={() => { setSidebarOpen(false) }}
              onOutsideClick={() => setSidebarOpen(false)}
              defaultData={selectedUser}
              onDataAdded={() => console.log("Data added")}
              fetchTeamMembers={() => { fetchTeamMembers() }}
              toastMessageCall={toastMessageCall}
              source="team"
              fromMainTeamFile={true}
            />
          </div>
        </div>
      )}

    </>
  );
};

export default Team;
