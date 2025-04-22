import { useState, useRef, useEffect, useCallback } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import Tooltip from "@mui/material/Tooltip";
import MockProfileDetails from "./MockProfileDetails";
import Sidebar from "./MockInterviewForm.jsx";
import ReschedulePopup from "./ReschedulePopup.jsx";
import { motion } from 'framer-motion';

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
import MockinterviewTable from "./MockinterviewTable.jsx";
// import { FaSearch } from 'react-icons/fa';
import MockInterviewKanban from "./MockInterviewKanban.jsx";
import { useNavigate } from "react-router-dom";
import { Button } from "../CommonCode-AllTabs/ui/button.jsx";

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

  const navigate = useNavigate();

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

  const [viewMode, setViewMode] = useState("table");
  // const handleListViewClick = () => {
  //   setViewMode("table");
  // };

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
    <div className=" bg-background">
      {!isSchedulePopupVisible && !mockinterviewDataView && !editform && (
        <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 xl:px-8 2xl:px-8">
         
            <div className="sm:px-0">


      

               <motion.div
                        className="flex justify-between items-center mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                  <h1 className="text-lg font-semibold">Mock Interviews</h1>


                    <Button
                      onClick={() => navigate('/mockinterview-create')}
                     className="bg-custom-blue hover:bg-custom-blue/90 text-white"
                    >
                      Add  interview

                      {/* {interviewDropdown && (
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
                )} */}
                    </Button>
               </motion.div>

                {/* 2 */}
                <motion.div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end sm:float-end mb-4">

                <div className="flex items-center sm:hidden md:hidden">

                   <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                                <span onClick={() => setViewMode('table')}>
                                  <FaList 
                                    className={`text-xl mr-4 ${viewMode === "table" ? "text-custom-blue" : ""
                                      }`}
                                  />
                                </span>
                              </Tooltip>

                    {/* <button onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "text-custom-blue" : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      <FaList className="w-4 h-4" />

                    </button> */}

                     <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                                  <span onClick={() => setViewMode('kanban')}>
                                    <TbLayoutGridRemove
                                      className={`text-xl ${viewMode === "kanban" ? "text-custom-blue" : ""
                                        }`}
                                    />
                                  </span>
                                </Tooltip>


                    {/* <button onClick={() => setViewMode('kanban')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === "kanban" ? "text-custom-blue" : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}>
                      <TbLayoutGridRemove className="w-4 h-4" />
                    </button> */}
                  </div>

                  <div className="flex order-2 sm:order-2  items-center ">

                    <div className="relative flex-1">

                      {/* <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" /> */}


                      <input
                        type="text"
                        placeholder="Search by Candidate, Position."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="w-[100%] pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-custom-blue focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="flex items-center ml-2 space-x-1">
                      <span  // className="p-2 text-xl sm:text-sm md:text-sm" 
                      >
                        {currentPage + 1}/{totalPages}
                      </span>


                      <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                        <span
                          className={`border py-1.5 pr-3 pl-2 mr-1 text-xl sm:text-md md:text-md rounded-md ${currentPage === 0 ? " cursor-not-allowed" : ""
                            } ${activeArrow === "prev" ? "text-blue-500" : ""}`}
                          onClick={prevPage}
                          disabled={currentPage === 0}
                        >
                          <IoIosArrowBack className="text-custom-blue" />
                        </span>
                      </Tooltip>

                      <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                        <span
                          className={`border py-1.5 pr-2 pl-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1 ? " cursor-not-allowed" : ""
                            } ${activeArrow === "next" ? "text-blue-500" : ""}`}
                          onClick={nextPage}
                          disabled={currentPage === totalPages - 1}
                        >
                          <IoIosArrowForward className="text-custom-blue" />
                        </span>
                      </Tooltip>
                    </div>

                    <div className="relative ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
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
                </motion.div>

            

              {/* 3 */}

              {loading ? (
                < h1>loading...</h1>
              ) : (

                <motion.div className="bg-white">
                  {viewMode === "table" ?


                    <div className="flex relative w-full overflow-hidden">
                      <div className={` transition-all duration-300 ${isMenuOpen ? 'mr-1 md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]' : 'w-full'
                        }`} >
                        <MockinterviewTable
                          mockinterviews={currentFilteredRows}
                          mockinterviewData={mockinterviewData}
                          loading={loading}
                          mockinterviewDataView={setmockinterviewDataView}
                          onRescheduleClick={onRescheduleClick}
                          onCancel={onCancelClick}
                        />
                      </div>

                      {isMenuOpen && (
                        <div className=" h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-44 bg-white border-l border-gray-200 shadow-lg z-30">
                          <OffcanvasMenu
                            isOpen={isMenuOpen}
                            closeOffcanvas={handleFilterIconClick}
                            onFilterChange={handleFilterChange}
                            isMenuOpen={isMenuOpen}
                          />
                        </div>
                      )}
                    </div>

                    :
                    // kanban view
                    <div className="flex relative w-full overflow-hidden">
                      <div className={` transition-all duration-300 ${isMenuOpen ? 'md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]' : 'w-full'
                        }`} >
                        <MockInterviewKanban
                          mockinterviews={currentFilteredRows}
                          mockinterviewData={mockinterviewData}
                          loading={loading}
                          mockinterviewDataView={setmockinterviewDataView}
                          onRescheduleClick={onRescheduleClick}
                          onCancel={onCancelClick}
                        //  onEdit={handleEdit}
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

    </div>
  );
};



export default MockInterview;
