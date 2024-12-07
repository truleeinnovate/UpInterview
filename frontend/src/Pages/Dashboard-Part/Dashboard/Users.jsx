import { useState, useRef, useEffect, useCallback } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { IoMdSearch } from "react-icons/io";
import Tooltip from "@mui/material/Tooltip";
import { MdMoreHoriz } from "react-icons/md";
import UserProfileDetails from "./UserProfileDetails";
// import { useNavigate } from "react-router-dom";
import Sidebar from "./UserForm";
import Sidebar1 from "./EditUser";
import { CgInfo } from "react-icons/cg";
import axios from "axios";
import { TbLayoutGridRemove } from "react-icons/tb";
import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoMdMore } from "react-icons/io";
import EditUser from "./EditUser";
import Cookies from "js-cookie";
import { FaList } from "react-icons/fa6";
import maleImage from "../../Dashboard-Part/Images/man.png";
import femaleImage from "../../Dashboard-Part/Images/woman.png";
import genderlessImage from "../../Dashboard-Part/Images/transgender.png";
// {f} //
import { LuFilterX } from "react-icons/lu";
import { fetchMasterData } from '../../../utils/fetchMasterData.js';

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
    setMinExperience('');
    setMaxExperience('');
    onFilterChange({ status: [], tech: [], experience: { min: '', max: '' } });
  };
  useEffect(() => {
    if (!isStatusMainChecked) setSelectedStatusOptions([]);
    if (!isTechMainChecked) setSelectedTechOptions([]);
  }, [isStatusMainChecked, isTechMainChecked]);
  const handleStatusMainToggle = () => {
    const newStatusMainChecked = !isStatusMainChecked;
    setStatusMainChecked(newStatusMainChecked);
    const newSelectedStatus = newStatusMainChecked ? qualification.map(q => q.QualificationName) : [];
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
        const qualificationData = await fetchMasterData('qualification');
        setQualification(qualificationData);
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
      status: selectedStatusOptions,
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
                <span className="ml-3 font-bold">Higher Qualification</span>
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
                    checked={selectedStatusOptions.includes(option.QualificationName)}
                    onChange={() => handleStatusOptionToggle(option.QualificationName)}
                  />
                  <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option.QualificationName}</span>
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

const Users = () => {
  const organizationId = Cookies.get("organizationId");
  console.log(organizationId);
  const [notification] = useState("");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/organization/${organizationId}`
      );
      setUserData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching users data:", error);
    }
    setLoading(false);
  }, [organizationId]);
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleDataAdded = () => {
    fetchUserData();
  };


  // const [selectedUser, setSelectedUser] = useState(null);

  const handleUserClick = (users) => {

    setSelectedUser(users);

    setActionViewMore(false);
  };
  const handleCloseUsers = () => {
    setSelectedUser(null);
  };
  const [userToEdit, setUserToEdit] = useState(null);
  const handleEditClick = (users) => {
    setUserToEdit(users);
    setSidebarOpen1(true);
    setActionViewMore(null);
  };

  const handleclose = () => {
    setSelectedUser(false);
    setActionViewMore(false);
    setSidebarOpen(false);
    setSidebarOpen1(false);
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    console.log("Search query:", event.target.value);
  };

  // const [selectedFilters, setSelectedFilters] = useState({
  //   status: [],
  //   tech: [],
  //   experience: [],
  // });

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  const handleFilterChange = useCallback((filters) => {
    // setSelectedFilters(filters);
  }, []);
  const FilteredData = () => {
    if (!Array.isArray(userData)) return [];
    return userData.filter((users) => {
      const fieldsToSearch = [
        users.Firstname,
        users.UserId,
        users.Phone,
        users.Email,
        users.LinkedinUrl,
      ];

      return fieldsToSearch.some(
        (field) =>
          field !== undefined &&
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 5;
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
  const endIndex = Math.min(startIndex + rowsPerPage, userData.length);
  const currentFilteredRows = FilteredData()
    .slice(startIndex, endIndex)
    .reverse();

  const [isMenuOpen, setMenuOpen] = useState(false);
  // const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  // const openPopup = (users) => {
  //   setSelectedUser(users);
  //   setPopupOpen(true);
  // };

  // const closePopup = () => {
  //   setPopupOpen(false);
  //   setSelectedUser(null);
  // };

  useEffect(() => {
    document.title = "Users Tab";
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarOpen1, setSidebarOpen1] = useState(false);

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

  // const toggleSidebar1 = () => {
  //   setSidebarOpen(!sidebarOpen);
  // };

  const closeSidebar1 = () => {
    setSidebarOpen1(false);
  };
  const handleOutsideClickk = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar1();
    }
  }, []);
  const [actionViewMore, setActionViewMore] = useState(null);

  const handleMoreClick = (usersId) => {
    setActionViewMore(usersId === actionViewMore ? null : usersId);
  };

  const [tableVisible] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const handleListViewClick = () => {
    setViewMode("list");
  };

  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };

  // const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleCandidateClick = (users) => {
    // setSelectedCandidate(users);

    setActionViewMore(false);
  };
  // const handleCloseProfile = () => {
  //   setSelectedCandidate(null);
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
    if (userData.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };

  return (
    <>
      <div className="fixed top-24 left-0 right-0">
        <div className="flex justify-between p-4">
          <div>
            <span className="text-lg font-semibold">Users</span>
          </div>

          <div>
            {notification && (
              <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
                {notification}
              </div>
            )}
          </div>

          <div onClick={toggleSidebar} >
            <span className="p-2 bg-custom-blue text-md sm:text-sm md:text-sm text-white font-semibold border shadow rounded">
              Add
            </span>
          </div>
        </div>
      </div>
      <div className="fixed top-36 left-0 right-0">
        <div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end p-4 sm:float-end">
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
                  placeholder="Search by Firstname, Email, Phone."
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
                  className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === 0 ? " cursor-not-allowed" : ""}`}
                  onClick={prevPage}
                >
                  <IoIosArrowBack className="text-custom-blue" />
                </span>
              </Tooltip>

              <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                <span
                  className={`border p-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1 ? " cursor-not-allowed" : ""}`}
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
                      opacity: userData.length === 0 ? 0.2 : 1,
                      pointerEvents: userData.length === 0 ? "none" : "auto",
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
      <div className="fixed left-0 right-0 mx-auto z-10 sm:top-48 md:top-56 lg:top-56 xl:top-56 2xl:top-56">
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
                              Name
                            </th>
                            <th scope="col" className="py-3 px-6">
                              User ID
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Email
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Phone
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Linkedin URL
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan="6" className="py-28 text-center">
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
                          ) : userData.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-10 text-center">
                                <div className="flex flex-col items-center justify-center p-5">
                                  <p className="text-9xl rotate-180 text-blue-500">
                                    <CgInfo />
                                  </p>
                                  <p className="text-center text-lg font-normal">
                                    You don't have Users yet. Create new users.
                                  </p>
                                  <p
                                    onClick={toggleSidebar}
                                    className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
                                  >
                                    Add Users
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : currentFilteredRows.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-10 text-center">
                                <p className="text-lg font-normal">
                                  No data found.
                                </p>
                              </td>
                            </tr>
                          ) : (
                            currentFilteredRows.map((users, index) => (
                              <tr key={index} className="bg-white border-b cursor-pointer text-xs">
                                <td className="py-3 px-6 text-custom-blue">
                                  <div
                                    className="flex items-center gap-3"
                                    onClick={() => handleUserClick(users)}
                                  >
                                    <img
                                      src={users.imageUrl || (users.Gender === "Male" ? maleImage : users.Gender === "Female" ? femaleImage : genderlessImage)}
                                      alt="User"
                                      className="w-7 h-7 rounded-full object-cover"
                                    />
                                    {users.Firstname}
                                  </div>
                                </td>
                                <td className="py-3 px-6">{users.UserId}</td>
                                <td className="py-3 px-6">{users.Email}</td>
                                <td className="py-3 px-6">{users.Phone}</td>
                                <td className="py-3 px-6">
                                  <a
                                    href={users.LinkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {users.LinkedinUrl}
                                  </a>
                                </td>
                                <td className="py-3 px-6 relative">
                                  <button
                                    onClick={() =>
                                      handleMoreClick(users.UserId)
                                    }
                                  >
                                    <MdMoreHoriz className="text-3xl" />
                                  </button>
                                  {actionViewMore === users.UserId && (
                                    <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
                                      <div className="space-y-1">

                                        <p
                                          className="hover:bg-gray-200 p-1 rounded pl-3"
                                          onClick={() => handleUserClick(users)}
                                        >
                                          View
                                        </p>

                                        <p
                                          className="hover:bg-gray-200 p-1 rounded pl-3"
                                          onClick={() => handleEditClick(users)}
                                        >
                                          Edit
                                        </p>

                                      </div>
                                    </div>
                                  )}
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
                      ) : userData.length === 0 ? (
                        <div className="py-10 text-center">
                          <div className="flex flex-col items-center justify-center p-5">
                            <p className="text-9xl rotate-180 text-blue-500">
                              <CgInfo />
                            </p>
                            <p className="text-center text-lg font-normal">
                              You don't have candidates yet. Create new
                              candidate.
                            </p>
                            <p
                              onClick={toggleSidebar}
                              className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
                            >
                              Add Candidate
                            </p>
                          </div>
                        </div>
                      ) : currentFilteredRows.length === 0 ? (
                        <div className="col-span-3 py-10 text-center">
                          <p className="text-lg font-normal">
                            No data found.
                          </p>
                        </div>
                      ) : (
                        currentFilteredRows.map((users, index) => (
                          <div
                            key={users._id}
                            className="bg-white border border-custom-blue shadow-md p-2 rounded"
                          >
                            <div className="relative">
                              <div className="float-right">
                                <button
                                  onClick={() => toggleAction(users._id)}
                                >
                                  <IoMdMore className="text-3xl mt-1" />
                                </button>
                                {actionViewMore === users._id && (
                                  <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                    <div className="space-y-1">
                                      <p
                                        className="hover:bg-gray-200 p-1 rounded pl-3"
                                        onClick={() =>
                                          handleUserClick(users)
                                        }
                                      >
                                        View
                                      </p>
                                      <p
                                        className="hover:bg-gray-200 p-1 rounded pl-3"
                                        onClick={() =>
                                          handleEditClick(users)
                                        }
                                      >
                                        Edit
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex">
                              <div className="w-16 h-16 mt-3 ml-1 mr-3 overflow-hidden cursor-pointer">
                                <img
                                  src={users.imageUrl || (users.Gender === "Male" ? maleImage : users.Gender === "Female" ? femaleImage : genderlessImage)}
                                  alt="User"
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col">
                                <div
                                  className="text-custom-blue text-lg cursor-pointer break-words"
                                  onClick={() => handleUserClick(users)}
                                >
                                  {users.Firstname}
                                </div>
                                <div className="text-xs grid grid-cols-2 gap-2 items-start">
                                  <div className="text-gray-400">
                                    {" "}
                                    User ID
                                  </div>
                                  <div>{users.UserId}</div>
                                  <div className="text-gray-400">Email</div>
                                  <div>{users.Email}</div>
                                  <div className="text-gray-400">Phone</div>
                                  <div>{users.Phone}</div>
                                  <div className="text-gray-400">
                                    {" "}
                                    Linkedin URL
                                  </div>
                                  <div>{users.LinkedinUrl}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <OffcanvasMenu
                    isOpen={isMenuOpen}
                    closeOffcanvas={handleFilterIconClick}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {sidebarOpen && (
        <>
          <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"} >
            <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
              <Sidebar
                onClose={closeSidebar}
                onOutsideClick={handleOutsideClick}
                onDataAdded={handleDataAdded}
              />
            </div>
          </div>
        </>
      )}
      <Sidebar1
        isOpen={sidebarOpen1}
        onClose={closeSidebar1}
        onOutsideClick={handleOutsideClickk}
        ref={sidebarRef}
        user={userToEdit}
      />
      {selectedUser && <UserProfileDetails Users={selectedUser} onCloseUsers={handleCloseUsers} />}
      {selectedUser && <EditUser onClose={handleclose} users={selectedUser} />}
    </>
  );
};

export default Users; // {f} //
