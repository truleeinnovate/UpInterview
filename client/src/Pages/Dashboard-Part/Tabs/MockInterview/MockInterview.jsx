import { useState, useRef, useEffect, useCallback } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import Tooltip from "@mui/material/Tooltip";
import MockProfileDetails from "./MockProfileDetails";
import Sidebar from "./MockInterviewForm.jsx";
import ReschedulePopup from "./ReschedulePopup.jsx";


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
import { usePermissions } from '../../../../Context/PermissionsContext.js';
import { useMemo } from 'react';
import CancelPopup from "./ScheduleCancelPopup.jsx";
import { useCustomContext } from "../../../../Context/Contextfetch.js";


const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
  const {
skills,
qualification
  } = useCustomContext();
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


const MockInterview = () => {
  const {
    mockinterviewData,
    loading,
  } = useCustomContext();
  const { objectPermissionscontext } = usePermissions();
  const objectPermissions = useMemo(() => objectPermissionscontext.mockInterviews || {}, [objectPermissionscontext]);
  useEffect(() => {
    document.title = "Mockinterview Tab";
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSchedulePopupVisible, setIsSchedulePopupVisible] = useState(false);
  const [interviewType, setInterviewType] = useState(null);
  const [actionViewMore, setActionViewMore] = useState({});

  const sidebarRef = useRef(null);
  const toggleSidebar = () => {
    setIsSchedulePopupVisible(!isSchedulePopupVisible);
  };

  const closeSidebar = () => {
    setIsSchedulePopupVisible(false);
    setEditform(false)
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



  const [searchQuery, setSearchQuery] = useState("");

  const [mockinterviewDataView, setmockinterviewDataView] = useState(false);




  const handleMockInterviewClick = (mockinterview) => {
    setmockinterviewDataView(mockinterview);
    setIsSchedulePopupVisible(false);
    setActionViewMore(false);


  };

  const FilteredData = () => {
    return mockinterviewData.filter((user) => {
      const fieldsToSearch = [
        user.title,
        user.skills,
        user.dateTime,
        user.duration,
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


  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  const handlecloseview = () => {
    setmockinterviewDataView(false);
  };

  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: [],
  });

  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(filters);
  }, []);




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


  // const dateTime = currentFilteredRows.dateTime
  // const [date, timeRange] = dateTime.split(" ");
  // const startTime = timeRange.split(" - ")[0];
  // const formattedDateTime = `${date} ${startTime}`;
  const [editform, setEditform] = useState(false);
  const [cancelSchedule, setcancelSchedule] = useState(false);
  const [reschedule, setReschedule] = useState(false);


  const onEditClick = (mockinterview) => {
    setEditform(mockinterview);
    setActionViewMore(false);
  }
  const onRescheduleClick = (mockinterview) => {
    setReschedule(mockinterview);
    setActionViewMore(false);
  }
  

  const closepopup = () => {
    setcancelSchedule(false);
  };
  const closeschedulepopup = () => {
    setReschedule(false);
  };
  

  const onCancelClick = () => {
    setcancelSchedule(true);
    setActionViewMore(false);
  };

  const ActionMoreMenu = ({
    mockInterview,
    actionViewMore,
    toggleAction,
    iconType,
  }) => {
    const Icon = iconType === "MdMoreVert" ? MdMoreVert : FiMoreHorizontal;

    return (
      <div className="relative">
        <button
          onClick={() => toggleAction(mockInterview._id)}
          aria-label="Toggle action menu"
          className="focus:outline-none"
        >
          <Icon className="text-3xl mt-1" />
        </button>

        {actionViewMore === mockInterview._id && (
          <div className="absolute text-xs z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 -ml-28">
            <div className="space-y-1">
              <p
                className="hover:bg-gray-200 cursor-pointer p-1 rounded pl-3"
                onClick={() => handleMockInterviewClick(mockInterview)}
              >
                View
              </p>
              {mockInterview.interviewType === "ScheduleforLater" && (
                <>
                <p
                className="hover:bg-gray-200 cursor-pointer p-1 rounded pl-3"
                onClick={() => onEditClick(mockInterview)}
              >
                Edit
              </p>
              <p
                className="hover:bg-gray-200 cursor-pointer p-1 rounded pl-3"
              onClick={() => onRescheduleClick(mockInterview)}
              >
                Reschedule
              </p>
              <p
                className="hover:bg-gray-200 cursor-pointer p-1 rounded pl-3"
                onClick={() => onCancelClick()}
              >
                Cancel
              </p>
              </>
              )}
              

            </div>
          </div>
        )}
      </div>
    );
  };
  return (
    <>
      {!isSchedulePopupVisible && !mockinterviewDataView && !editform && (
        <>
          <div className="fixed top-16 left-0 right-0 z-40">
            {" "}
            {/* Adjusted z-index */}
            <div className="flex justify-between p-4">
              <div>
                <span className="text-lg font-semibold">Mock Interviews</span>
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
                          setInterviewType('ScheduleforLater');
                          toggleSidebar();
                        }}
                      >
                        Schedule for Later
                      </p>
                      <p
                        className="block px-4 py-1 hover:bg-gray-200 hover:text-gray-800 rounded-md"
                        onClick={() => {
                          setinterviewDropdown(false);
                          setInterviewType('InstantInterview');
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
                                  Technology
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
                              ) : currentFilteredRows.length === 0 ? (
                                <tr>
                                  <td colSpan="7" className="py-10 text-center">
                                    <p className="text-lg font-normal">
                                      No data found.
                                    </p>
                                  </td>
                                </tr>
                              ) : (
                                currentFilteredRows.map((mockinterview) => {
                                  return (
                                    <tr
                                      key={mockinterview._id}
                                      className="bg-white border-b cursor-pointer text-xs"
                                    >
                                      <td className=" text-blue-400">
                                        <div className="flex items-center">
                                          {mockinterview.status === "Scheduled" && (
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
                                          {mockinterview.status ===
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
                                          {mockinterview.status ===
                                            "Reschedule" && (
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
                                              {mockinterview.title}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-2 px-6">
                                        {mockinterview.technology}
                                      </td>
                                      <td className="py-2 px-6">
                                        {mockinterview.dateTime}
                                      </td>
                                      <td className="py-2 px-6">
                                        {mockinterview.duration}
                                      </td>

                                      <td className="py-2 px-6"></td>
                                      <td className="py-2 px-6">
                                        {mockinterview.createdDate}
                                      </td>
                                      <td className="py-2 px-6">

                                        <ActionMoreMenu
                                          mockInterview={mockinterview}
                                          actionViewMore={actionViewMore}
                                          toggleAction={toggleAction}
                                          // onViewClick={handleMockInterviewClick}
                                        />
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
                                  <ActionMoreMenu
                                    mockInterview={mockinterview}
                                    actionViewMore={actionViewMore}
                                    toggleAction={toggleAction}
                                    // onViewClick={handleMockInterviewClick}
                                    iconType="MdMoreVert"
                                  />
                                </div>
                                <div className="bg-white border border-custom-blue cursor-pointer p-2 rounded shadow-lg">
                                  <div className="flex">
                                    <div className="flex flex-col justify-between  ml-2">
                                      <p
                                        className="text-custom-blue text-lg cursor-pointer break-words"
                                        onClick={() =>
                                          handleMockInterviewClick(mockinterview)
                                        }
                                      >
                                        {mockinterview.Title}
                                      </p>
                                      <div className="text-xs grid grid-cols-2 gap-1  mt-2 items-start">
                                        <div className="text-gray-400">
                                          Technology
                                        </div>
                                        <div>{mockinterview.technology}</div>

                                        <div className="text-gray-400">
                                          Date & Time
                                        </div>
                                        <div>
                                          {mockinterview.dateTime}
                                        </div>
                                        <div className="text-gray-400">
                                          Interviewer
                                        </div>
                                        <div className="text-blue-400">
                                          {mockinterview.interviewer}
                                        </div>
                                        <div className="text-gray-400">
                                          Created On
                                        </div>
                                        <div>{mockinterview.createdDate}</div>
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
        </>
      )}
      {isSchedulePopupVisible && (
        <Sidebar
          onClose={closeSidebar}
          onOutsideClick={handleOutsideClick}
          InterviewType={interviewType}
        />
      )}
      {editform && (
        <Sidebar
          onClose={closeSidebar}
          onOutsideClick={handleOutsideClick}
          InterviewType={interviewType}
          mockEdit={true}
          MockEditData={editform}
        />
      )}
      {mockinterviewDataView && (
        <MockProfileDetails mockinterviewId={mockinterviewDataView._id} onCloseprofile={handlecloseview} />
      )}
      {cancelSchedule && (
        <CancelPopup
          onClose={closepopup}
        />
      )}
      {reschedule && (
        <ReschedulePopup
          onClose={closeschedulepopup}
          MockEditData={reschedule}
        />
      )}
    </>
  );
};



export default MockInterview;
