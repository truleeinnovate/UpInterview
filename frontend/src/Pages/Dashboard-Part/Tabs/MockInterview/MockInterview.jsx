import { useState, useRef, useEffect, useCallback } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import MockProfileDetails from "./MockProfileDetails";
import Sidebar from "../MockInterview/MockSchedulelater";
import EditMoclnterview from "./Edit-Moclnterview.jsx";
import axios from "axios";
import { fetchFilterData, handleWebSocket } from "../../../../utils/dataUtils.js";
import { fetchMasterData } from '../../../../utils/fetchMasterData.js';

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
import { ReactComponent as WiTime4 } from '../../../../icons/WiTime4.svg';
import { ReactComponent as MdCancel } from '../../../../icons/MdCancel.svg';
import { ReactComponent as GrPowerReset } from '../../../../icons/GrPowerReset.svg';
import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';

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
const MockInterview = ({ sharingPermissions, objectPermissions }) => {
  useEffect(() => {
    document.title = "mockinterview Tab";
  }, []);
  const [notification, setNotification] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSchedulePopupVisible, setIsSchedulePopupVisible] = useState(false);
  const sidebarRef = useRef(null);
  const toggleSidebar = () => {
    setIsSchedulePopupVisible(!isSchedulePopupVisible);
  };

  const closeSidebar = () => {
    setIsSchedulePopupVisible(false);
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

  const [interviewDropdown, setinterviewDropdown] = useState(false);

  const interviewRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        interviewRef.current &&
        !interviewRef.current.contains(event.target)
      ) {
        setinterviewDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigate = useNavigate();
  const [selectedMockInterview] = useState(null);

  const handleMockInterviewClick = (mockinterview) => {
    navigate("/mock-profiledetails", { state: { mockinterview } });
  };

  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);

  const [mockinterviewData, setmockinterviewData] = useState([]);

  const fetchInterviewData = async () => {
    setLoading(true);
    try {
      const filteredInterviews = await fetchFilterData(
        "mockinterview",
        sharingPermissions
      );
      setmockinterviewData(filteredInterviews);
    } catch (error) {
      console.error("Error fetching InterviewData:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ws = handleWebSocket(
      "mockinterview",
      setmockinterviewData,
      setNotification
    );

    fetchInterviewData();

    return () => {
      ws.close();
    };
  }, [sharingPermissions]);

  const FilteredData = () => {
    return mockinterviewData.filter((user) => {
      const fieldsToSearch = [
        user.Title,
        user.Skills,
        user.DateTime,
        user.Duration,
        user.TeamMember,
      ];

      return fieldsToSearch.some(
        (field) =>
          field !== undefined &&
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
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
  const endIndex = Math.min(startIndex + rowsPerPage, mockinterviewData.length);

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

  const [actionViewMore, setActionViewMore] = useState({});

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };
  const [showPopup, setShowPopup] = useState(false);
  const [currentInterviewId, setCurrentInterviewId] = useState(null);

  const handleUpdate = (interviewId) => {
    setCurrentInterviewId(interviewId);
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setCurrentInterviewId(null);
  };

  const handlePopupConfirm = async (e, _id) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/mockinterview/${currentInterviewId}`,
        {
          _id: currentInterviewId,
          Status: "ScheduleCancel",
        }
      );

      const notificationResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/notification`,
        {
          Body: "Interview Cancelled successfully",
          Status: "ScheduleCancel",
        }
      );

      setShowPopup(false);
    } catch (error) {
      console.error(
        "Error updating interview status or posting notification:",
        error
      );
    }
  };

  const [selectedcandidate, setSelectedcandidate] = useState(null);
  const handleEditClick = (mockinterview) => {
    setSelectedcandidate(mockinterview);
  };

  const handleclose = () => {
    setSelectedcandidate(null);
    setActionViewMore(false);
  };

  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: [],
  });

  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(filters);
  }, []);

  const buttonRef = useRef(null);

  const handleClick = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/interview/reschedule`,
        {
          id: selectedcandidate._id,
        }
      );
      setActionViewMore(false);
    } catch (error) {
      console.error("Error updating interview status from me :", error);
    }
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
    if (mockinterviewData.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };

  return (
    <>
      <div className="fixed top-16 left-0 right-0 z-40">
        {" "}
        {/* Adjusted z-index */}
        <div className="flex justify-between p-4">
          <div>
            <span className="text-lg font-semibold">Mock Interviews</span>
          </div>

          <div>
            {notification && (
              <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
                {notification}
              </div>
            )}
          </div>

          <div
            className="relative z-50"
            onClick={() => setinterviewDropdown(!interviewDropdown)}
          >
            {objectPermissions.Create && (
              <span className="p-2 bg-custom-blue text-md sm:text-sm md:text-sm text-white font-semibold border shadow rounded">
                Add
              </span>
            )}

            {interviewDropdown && (
              <div className="absolute mt-5 right-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5">
                <div className="space-y-1">
                  <p
                    className="block px-4 py-1 hover:bg-gray-200 hover:text-gray-800 rounded-md"
                    onClick={() => {
                      setinterviewDropdown(false);
                      toggleSidebar();
                    }}
                  >
                    Schedule for Later
                  </p>
                  <p
                    className="block px-4 py-1 hover:bg-gray-200 hover:text-gray-800 rounded-md"
                    onClick={() => {
                      setinterviewDropdown(false);
                      toggleSidebar();
                    }}
                  >
                    Instant Interview
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 2 */}
      <div className="fixed top-28 left-0 right-0">
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
                  placeholder="Search by Candidate, Position."
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
                  disabled={currentPage === 0}
                >
                  <IoIosArrowBack className="text-custom-blue" />
                </span>
              </Tooltip>

              <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                <span
                  className={`border p-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1 ? " cursor-not-allowed" : ""
                    } ${activeArrow === "next" ? "text-blue-500" : ""}`}
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
                    opacity: mockinterviewData.length === 0 ? 0.2 : 1,
                    pointerEvents: mockinterviewData.length === 0 ? "none" : "auto",
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

      {/* 3 */}
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
                              Interview Title
                            </th>
                            <th scope="col" className="py-3 px-6">
                              SkillTechnology
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Date & Time
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Duration (hh:mm)
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Interviewer
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Created On
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan="5" className="py-28 text-center">
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
                          ) : mockinterviewData.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="py-10 text-center">
                                <div className="flex flex-col items-center justify-center p-5">
                                  <p className="text-9xl rotate-180 text-blue-500">
                                    <CgInfo />
                                  </p>
                                  <p className="text-center text-lg font-normal">
                                    You don't have mockinterview yet. Create new
                                    mockinterview.
                                  </p>
                                  <p
                                    onClick={toggleSidebar}
                                    className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
                                  >
                                    Add Schedule
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : mockinterviewData.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="py-10 text-center">
                                <p className="text-lg font-normal">
                                  No data found.
                                </p>
                              </td>
                            </tr>
                          ) : (
                            currentFilteredRows.map((mockinterview) => {
                              const [date, timeRange] =
                                mockinterview.DateTime.split(" ");
                              const startTime = timeRange.split(" - ")[0];
                              const formattedDateTime = `${date} ${startTime}`;
                              return (
                                <tr
                                  key={mockinterview._id}
                                  className="bg-white border-b cursor-pointer text-xs"
                                >
                                  <td className=" text-blue-400">
                                    <div className="flex items-center">
                                      {mockinterview.Status === "Scheduled" && (
                                        <>
                                          <span className="w-2 bg-yellow-300 h-12"></span>

                                          <Tooltip
                                            title="Scheduled"
                                            enterDelay={300}
                                            leaveDelay={100}
                                            arrow
                                          >
                                            <span>
                                              <WiTime4 className="text-xl ml-1 mr-1 text-yellow-300" />
                                            </span>
                                          </Tooltip>
                                        </>
                                      )}
                                      {mockinterview.Status ===
                                        "ScheduleCancel" && (
                                          <>
                                            <span className="w-2 bg-red-500 h-12"></span>

                                            <Tooltip
                                              title="Cancel"
                                              enterDelay={300}
                                              leaveDelay={100}
                                              arrow
                                            >
                                              <span>
                                                <MdCancel className="text-xl ml-1 mr-1 text-red-500" />
                                              </span>
                                            </Tooltip>
                                          </>
                                        )}
                                      {mockinterview.Status ===
                                        "ReSchedule" && (
                                          <>
                                            <span className="w-2 bg-violet-500 h-12"></span>
                                            <Tooltip
                                              title="Rescheduled"
                                              enterDelay={300}
                                              leaveDelay={100}
                                              arrow
                                            >
                                              <span>
                                                <GrPowerReset className="text-xl ml-1 mr-1 text-violet-500" />
                                              </span>
                                            </Tooltip>
                                          </>
                                        )}
                                      <div className="py-2 px-2 flex items-center gap-3 text-blue-400">
                                        <div
                                          onClick={() =>
                                            handleMockInterviewClick(
                                              mockinterview
                                            )
                                          }
                                        >
                                          {mockinterview.Title}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2 px-6">
                                    {mockinterview.Skills}
                                  </td>
                                  <td className="py-2 px-6">
                                    {formattedDateTime}
                                  </td>
                                  <td className="py-2 px-6">
                                    {mockinterview.Duration}
                                  </td>

                                  <td className="py-2 px-6"></td>
                                  <td className="py-2 px-6">
                                    {mockinterview.CreatedDate}
                                  </td>
                                  <td className="py-2 px-6">
                                    <div>
                                      <button
                                        onClick={() =>
                                          toggleAction(mockinterview._id)
                                        }
                                      >
                                        <FiMoreHorizontal className="text-3xl" />
                                      </button>
                                      {actionViewMore === mockinterview._id && (
                                        <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 -ml-28">
                                          <div className="space-y-1">
                                            <p
                                              className="hover:bg-gray-200 p-1 rounded pl-3"
                                              onClick={() =>
                                                handleMockInterviewClick(
                                                  mockinterview
                                                )
                                              }
                                            >
                                              View
                                            </p>
                                            <p
                                              className="hover:bg-gray-200 p-1 rounded pl-3"
                                              onClick={() =>
                                                handleEditClick(mockinterview)
                                              }
                                            >
                                              Reschedule
                                            </p>
                                            <p
                                              className="hover:bg-gray-200 p-1 rounded pl-3"
                                              onClick={() =>
                                                handleUpdate(mockinterview._id)
                                              }
                                            >
                                              Cancel
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
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
                      ) : mockinterviewData.length === 0 ? (
                        <div className="py-10 text-center">
                          <div className="flex flex-col items-center justify-center p-5">
                            <p className="text-9xl rotate-180 text-blue-500">
                              <CgInfo />
                            </p>
                            <p className="text-center text-lg font-normal">
                              You don't have mockinterview yet. Create new
                              mockinterview.
                            </p>
                            <p
                              onClick={toggleSidebar}
                              className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
                            >
                              Add Schedule
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
                        currentFilteredRows.map((mockinterview) => (
                          <div key={mockinterview._id} className="relative">
                            <div className="absolute right-0 top-0">
                              <button onClick={() => toggleAction(mockinterview._id)}>
                                <MdMoreVert className="text-3xl mt-1" />
                              </button>
                              {actionViewMore === mockinterview._id && (
                                <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
                                  <div className="space-y-1">
                                    <p
                                      className="hover:bg-gray-200 p-1 rounded pl-3"
                                      onClick={() =>
                                        handleMockInterviewClick(
                                          mockinterview
                                        )
                                      }
                                    >
                                      View
                                    </p>
                                    <p
                                      className="hover:bg-gray-200 p-1 rounded pl-3"
                                      onClick={() =>
                                        handleEditClick(mockinterview)
                                      }
                                    >
                                      Reschedule
                                    </p>
                                    <p
                                      className="hover:bg-gray-200 p-1 rounded pl-3"
                                      onClick={() =>
                                        handleUpdate(mockinterview._id)
                                      }
                                    >
                                      Cancel
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="bg-white border border-orange-500 cursor-pointer p-2 rounded shadow-lg">
                              <div className="flex">
                                <div className="flex flex-col justify-between  ml-2">
                                  <p
                                    className="text-blue-400 text-lg cursor-pointer break-words"
                                    onClick={() =>
                                      handleMockInterviewClick(mockinterview)
                                    }
                                  >
                                    {mockinterview.LastName}
                                  </p>
                                  <div className="text-xs grid grid-cols-2 gap-1  mt-5 items-start">
                                    <div className="text-gray-400">
                                      Skills/Technology
                                    </div>
                                    <div>{mockinterview.Skills}</div>

                                    <div className="text-gray-400">
                                      Date & Time
                                    </div>
                                    <div>{mockinterview.DateTime}</div>
                                    <div className="text-gray-400">
                                      Interviewer
                                    </div>
                                    <div className="text-blue-400">
                                      {mockinterview.Interviewer}
                                    </div>
                                    <div className="text-gray-400">
                                      Created On
                                    </div>
                                    <div>{mockinterview.CreatedDate}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute right-2 bottom-0 ">
                                {mockinterview.Status === "Scheduled" && (
                                  <>
                                    <Tooltip
                                      title="Scheduled"
                                      enterDelay={300}
                                      leaveDelay={100}
                                      arrow
                                    >
                                      <span>
                                        <WiTime4 className="text-3xl ml-1 mr-1 text-yellow-300" />
                                      </span>
                                    </Tooltip>
                                  </>
                                )}
                                {mockinterview.Status ===
                                  "ScheduleCancel" && (
                                    <>
                                      <Tooltip
                                        title="Cancel"
                                        enterDelay={300}
                                        leaveDelay={100}
                                        arrow
                                      >
                                        <span>
                                          <MdCancel className="text-3xl ml-1 mr-1 text-red-500" />
                                        </span>
                                      </Tooltip>
                                    </>
                                  )}
                                {mockinterview.Status === "ReSchedule" && (
                                  <>
                                    <Tooltip
                                      title="Reschedule"
                                      enterDelay={300}
                                      leaveDelay={100}
                                      arrow
                                    >
                                      <span>
                                        <GrPowerReset className="text-3xl ml-1 mr-1 text-violet-500" />
                                      </span>
                                    </Tooltip>
                                  </>
                                )}
                              </div>
                              {/* <div className="absolute right-2 bottom-2">
                                  <FcOk className="text-2xl" />
                                </div> */}
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
      {isSchedulePopupVisible && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          onOutsideClick={handleOutsideClick}
        />
      )}
      {selectedMockInterview && (
        <MockProfileDetails mockinterview={selectedMockInterview} />
      )}
      {selectedcandidate && (
        <EditMoclnterview
          onClose={handleclose}
          candidate1={selectedcandidate}
          ref={buttonRef}
          onClick={handleClick}
        />
      )}
      {showPopup && (
        <Popup
          onClose={handlePopupClose}
          onConfirm={(e) => handlePopupConfirm(e, currentInterviewId._id)}
        />
      )}
    </>
  );
};

const Popup = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-15">
      <div
        className="relative bg-white p-5 rounded-lg border shadow-lg h-48 text-center"
        style={{ width: "45%" }}
      >
        <div
          onClick={onClose}
          className="absolute top-2 right-2 cursor-pointer"
        >
          <FaTimes className="text-gray-500" size={20} />
        </div>
        <p className="mt-6 text-lg">
          Are You sure u want to cancel this Schedule
        </p>
        <div className="mt-10 flex justify-between">
          <button
            onClick={onConfirm}
            className="px-14 py-1 border bg-gray-300 rounded-md ml-10"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="px-14 py-1 border bg-gray-300 rounded-md mr-10"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
