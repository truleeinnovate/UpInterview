/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useCallback } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import { TbLayoutGridRemove } from "react-icons/tb";
import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
//import Cookies from "js-cookie";
import { LuFilterX } from "react-icons/lu";
import { fetchMasterData } from '../../../../../utils/fetchMasterData.js';
import { FaSearch, FaList } from "react-icons/fa";
import TableView from "./TableView.jsx";
import KanbanView from "./KanbanView.jsx";
import UserProfileDetails from "./UserProfileDetails";
import Sidebar from "./UserForm";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import Loading from '../../../../../Components/Loading.js';


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
  //const organizationId = Cookies.get("organizationId");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  console.log("userData:", userData);
  
  const tenantId = Cookies.get("organizationId");
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/organization/${tenantId}`
      );
      const contactWithImages = response.data.map((contact) => {
        if (contact.imageData && contact.imageData.filename) {
          const imageUrl = `${process.env.REACT_APP_API_URL}/${contact.imageData.path.replace(/\\/g, '/')}`;
          return { ...contact, imageUrl };
        }
        return contact;
      });
      const reversedData = contactWithImages.reverse();

      setUserData(reversedData);

    } catch (error) {
      console.error("Error fetching users data:", error);
    }
    setLoading(false);
  }, [tenantId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleDataAdded = () => {
    fetchUserData();
  };




  // const handleclose = () => {
  //   setSelectedUser(false);
  //   setActionViewMore(false);
  //   setSidebarOpen(false);
  //   setUserToEdit(null);
  // };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // const [selectedFilters, setSelectedFilters] = useState({
  //   status: [],
  //   tech: [],
  //   experience: [],
  // });

  // const toggleAction = (id) => {
  //   setActionViewMore((prev) => (prev === id ? null : id));
  // };

  // eslint-disable-next-line no-unused-vars
  const handleFilterChange = useCallback((filters) => {
    //setSelectedFilters(filters);
  }, []);
  // const FilteredData = () => {
  //   if (!Array.isArray(userData)) return [];
  //   return userData.filter((users) => {
  //     const fieldsToSearch = [
  //       users.Firstname,
  //       users.UserId,
  //       users.Phone,
  //       users.Email,
  //       users.LinkedinUrl,
  //     ];

  //     return fieldsToSearch.some(
  //       (field) =>
  //         field !== undefined &&
  //         field.toString().toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   });
  // };

  // const [currentPage, setCurrentPage] = useState(0);
  // const rowsPerPage = 10;
  // const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  // const [activeArrow, setActiveArrow] = useState(null);

  // const nextPage = () => {
  //   if (currentPage < totalPages - 1) {
  //     setCurrentPage(currentPage + 1);
  //     setActiveArrow("next");
  //   }
  // };

  // const prevPage = () => {
  //   if (currentPage > 0) {
  //     setCurrentPage(currentPage - 1);
  //     setActiveArrow("prev");
  //   }
  // };

  // const startIndex = currentPage * rowsPerPage;
  // const endIndex = Math.min(startIndex + rowsPerPage, userData.length);
  // const currentFilteredRows = FilteredData()
  //   .slice(startIndex, endIndex)
  //   .reverse();

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

  const [actionViewMore, setActionViewMore] = useState(null);

  const handleMoreClick = (userId) => {
    setActionViewMore(prevId => prevId === userId ? null : userId);
  };

  const [viewMode, setViewMode] = useState("table");
  const handleListViewClick = () => {
    setViewMode("table");
  };

  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };

  // const [selectedCandidate, setSelectedCandidate] = useState(null);

  // const handleCandidateClick = (users) => {
  //   // setSelectedCandidate(users);

  //   setActionViewMore(false);
  // };
  // const handleCloseProfile = () => {
  //   setSelectedCandidate(null);
  // };

  // Detect screen size and set view mode to "kanban" for sm
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode("kanban");
      } else {
        setViewMode("table");
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



  const FilteredData = () => {
    if (!Array.isArray(userData)) return [];
    const sortedData = [...userData];

    return sortedData.filter((users) => {
      const fieldsToSearch = [
        users.firstName,
        users.phone,
        users.email,
        users.label,
      ];

      return fieldsToSearch.some(
        (field) =>
          field !== undefined &&
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  //const [activeArrow, setActiveArrow] = useState(null);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      //setActiveArrow("next");
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      //setActiveArrow("prev");
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  return (
    <div className="w-full bg-background">
      <main className="w-full mx-auto sm:px-6 lg:px-8 xl:px-8 2xl:px-2">
        <div className="sm:px-0">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">User Management</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Manage all users who can conduct interviews, including:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Create and manage interviewer accounts</li>
                        <li>Set user roles and permissions</li>
                        <li>Configure interview availability and expertise</li>
                        <li>Track interviewer performance and ratings</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </motion.div>
          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
                <div>
                  <span className="text-lg text-custom-blue font-semibold">Users</span>
                </div>

                <div onClick={() => { navigate('new') }} >
                  <span className="p-2 bg-custom-blue cursor-pointer text-md sm:text-sm md:text-sm text-white font-semibold border shadow rounded">
                    Add
                  </span>
                </div>
          </motion.div>
          <motion.div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end sm:float-end mb-4">
            <div className="flex items-center sm:hidden md:hidden">
              <Tooltip title="table" enterDelay={300} leaveDelay={100} arrow>
                <span onClick={handleListViewClick}>
                  <FaList
                    className={`text-xl cursor-pointer mr-4 ${viewMode === "table" ? "text-custom-blue" : ""
                      }`}
                  />
                </span>
              </Tooltip>
              <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                <span onClick={handleKanbanViewClick}>
                  <TbLayoutGridRemove
                    className={`text-xl cursor-pointer ${viewMode === "kanban" ? "text-custom-blue" : ""
                      }`}
                  />
                </span>
              </Tooltip>

            </div>
            <div className="flex items-center">
              <div className="relative flex-1 w-[300px] sm:w-full flex-grow">
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search by Firstname, Email, Phone."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-[100%] pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-custom-blue focus:border-transparent text-sm"
                />
              </div>

              <div>
                <span className="p-2 text-xl sm:text-md md:text-md">
                  {currentPage + 1}/{totalPages}
                </span>
              </div>
              <div className="flex">
                <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    className={`border p-2 mr-2 text-lg sm:text-md md:text-md rounded-md ${currentPage === 0 ? " cursor-not-allowed" : "cursor-pointer"}`}
                    onClick={prevPage}
                  >
                    <IoIosArrowBack className="text-custom-blue" />
                  </span>
                </Tooltip>

                <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    className={`border p-2 text-lg sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1 ? " cursor-not-allowed" : "cursor-pointer"}`}
                    onClick={nextPage}
                  >
                    <IoIosArrowForward className="text-custom-blue" />
                  </span>
                </Tooltip>
              </div>
              <div className="ml-2 text-lg sm:text-md md:text-md border rounded-md p-2">
                <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    onClick={handleFilterIconClick}
                    style={{
                      opacity: userData.length === 0 ? 0.2 : 1,
                      pointerEvents: userData.length === 0 ? "none" : "auto",
                    }}
                  >
                    {isFilterActive ? (
                      <LuFilterX className="text-custom-blue cursor-pointer" />
                    ) : (
                      <FiFilter className="text-custom-blue cursor-pointer" />
                    )}
                  </span>
                </Tooltip>
              </div>
            </div>
          </motion.div>
          {loading ? (
            <Loading />
          ) : (
            <motion.div className="bg-white">

              {viewMode === 'table' ?
                <div className="flex relative w-full overflow-hidden">
                  <div className={` transition-all duration-300 ${isMenuOpen ? 'mr-1 md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]' : 'w-full'
                    }`} >
                    <TableView
                      currentFilteredRows={currentFilteredRows}
                      toggleAction={handleMoreClick}
                      actionViewMore={actionViewMore}
                      loading={loading}
                      userData={userData}
                      toggleSidebar={toggleSidebar}
                    />
                  </div>
                  {isMenuOpen && (
                    <div className=" h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-44 bg-white border-l border-gray-200 shadow-lg z-30">
                      <OffcanvasMenu
                        isOpen={isMenuOpen}
                        closeOffcanvas={handleFilterIconClick}
                        onFilterChange={handleFilterChange}
                      />
                    </div>
                  )}
                </div>

                :
                <div className="flex relative w-full overflow-hidden">
                  <div className={` transition-all duration-300 ${isMenuOpen ? 'md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]' : 'w-full'
                    }`} >
                    <KanbanView
                      currentFilteredRows={currentFilteredRows}
                      loading={loading}
                      userData={userData}
                      toggleSidebar={toggleSidebar}
                    />
                  </div>
                  {isMenuOpen && (
                    <div className=" h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-44 bg-white border-l border-gray-200 shadow-lg z-30">
                      <OffcanvasMenu
                        isOpen={isMenuOpen}
                        closeOffcanvas={handleFilterIconClick}
                        onFilterChange={handleFilterChange}
                      />
                    </div>
                  )}
                </div>
              }
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;
