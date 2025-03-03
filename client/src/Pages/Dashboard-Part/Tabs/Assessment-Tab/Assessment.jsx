import { useState, useRef, useEffect, useCallback } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import Tooltip from "@mui/material/Tooltip";
import Sidebar from "../Assessment-Tab/NewAssessment.jsx";
import axios from "axios";
import EditAssessment from "./EditAssessment.jsx";
import {
  fetchFilterData,
} from "../../../../utils/dataUtils.js";
import ShareAssessment from "./ShareAssessment.jsx";
import AssessmentProfileDetails from "./Assessmentprofiledetails.jsx";
import { fetchMasterData } from '../../../../utils/fetchMasterData.js';
import { usePermissions } from '../../../../Context/PermissionsContext.js';
import { useMemo } from 'react';

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

const Assessment = () => {
  const { sharingPermissionscontext, objectPermissionscontext } = usePermissions();
  const assessmentPermissions = useMemo(() => sharingPermissionscontext.assessment || {}, [sharingPermissionscontext]);
  const objectPermissions = useMemo(() => objectPermissionscontext.assessment || {}, [objectPermissionscontext]);

  useEffect(() => {
    document.title = "Assessment Tab";
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [assessmentData, setAssessmentData] = useState([]);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showAssessmentDetails, setShowAssessmentDetails] = useState(false);
  const [recipientEmail] = useState("");
   //shashank -[16/01/2025]
  const [showLinkExpiryDay,setShowLinkExpiryDays]=useState(false)
    const [linkExpiryDays,setLinkExpiryDays]=useState(3)
    

  //

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setShowAssessmentDetails(false);
    setShowMainContent(false);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setShowMainContent(true);
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

  const handleAssessmentClick = (assessment) => {
    // if (objectPermissions.View) {
      setShowAssessmentDetails(assessment);
    // }
    setActionViewMore(false);
  };

  const handleShareClick = async (assessment) => {

    setIsShareOpen(assessment);
    setActionViewMore(false);
  };

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");


  const fetchAssessmentData = useCallback(async () => {
    setLoading(true);
    try {
      const filteredAssessments = await fetchFilterData(
        "assessment",
        assessmentPermissions
      );
    // Reverse the data to show the most recent first
      const reversedData = filteredAssessments.reverse();
      console.log("assessment list",reversedData)
      setAssessmentData(reversedData);
      setCurrentPage(0);
    } catch (error) {
      console.error("Error fetching assessment data:", error);
    } finally {
      setLoading(false);
    }
  }, [assessmentPermissions]);

  useEffect(() => {
    fetchAssessmentData();
  }, [fetchAssessmentData]);

  const handleDataAdded = () => {
    fetchAssessmentData();
    // setAssessmentData((prevData) => [newData, ...prevData]);
    setCurrentPage(0);
  };

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: [],
  });

  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(filters);
  }, []);

  const FilteredData = () => {
    if (!Array.isArray(assessmentData)) return [];
    return assessmentData.filter((user) => {
      const fieldsToSearch = [user.AssessmentTitle, user.Position].filter(
        (field) => field !== null && field !== undefined
      );

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        matchesSearchQuery
        //  && matchesStatus && matchesTech && matchesExperience
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
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  const [tableVisible] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const handleListViewClick = () => {
    setViewMode("list");
  };
  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };

  const [actionViewMore, setActionViewMore] = useState({});

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  const [isMenuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleEditClick = (assessment) => {
    setSelectedAssessment(assessment);
    setActionViewMore(false);
  };

  const handleCloseProfile = () => {
    setShowAssessmentDetails(false);
  };
  const handleCloseShare = () => {
    setIsShareOpen(false);
  };

  const handleCloseEdit = () => {
    setSelectedAssessment(null);
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

    // Set initial view mode based on current window size
    handleResize();

    // Add event listener to handle window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [isFilterActive, setIsFilterActive] = useState(false);

  const handleFilterIconClick = () => {
    if (assessmentData.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };
  const [showMainContent, setShowMainContent] = useState(true);

  return (
    <>
      {showMainContent && !showAssessmentDetails && (
        <section>
          <div className="fixed top-16 sm:top-20 md:top-24 left-0 right-0">
            <div className="flex justify-between mt-5">
              <div>
                <span className="p-3 w-fit text-lg font-semibold">
                  My Assessments
                </span>
              </div>
              <div>
                {notification && (
                  <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
                    {notification}
                  </div>
                )}
              </div>
              {/* {objectPermissions.Create && ( */}
                <div onClick={toggleSidebar} className="mr-5">
                  <span className="p-2 bg-custom-blue text-md sm:text-sm md:text-sm text-white font-semibold border shadow rounded">
                    New
                  </span>
                </div>
              {/* )} */}
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
                  <div className="searchintabs relative">
                    <div className="absolute inset-y-0 left-0 flex items-center">
                      <button type="submit" className="p-2">
                        <IoMdSearch className="text-custom-blue" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by Assessment Name, Position."
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
                        opacity: assessmentData.length === 0 ? 0.2 : 1,
                        pointerEvents: assessmentData.length === 0 ? "none" : "auto",
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
                                  Assessment Name
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Assessment Type
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  No.of Questions
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Difficulty Level
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Total Score
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Pass Score (Number / %)
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Duration
                                </th>
                                {/* <th scope="col" className="py-3 px-6">
                                  Expiry Date
                                </th> */}
                                <th scope="col" className="py-3 px-6">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {loading ? (
                                <tr>
                                  <td colSpan="9" className="py-28 text-center">
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
                              ) : assessmentData.length === 0 ? (
                                <tr>
                                  <td colSpan="9" className="py-10 text-center">
                                    <div className="flex flex-col items-center justify-center p-5">
                                      <p className="text-9xl rotate-180 text-blue-500">
                                        <CgInfo />
                                      </p>
                                      <p className="text-center text-lg font-normal">
                                        You don't have assessment yet. Create new assessment.
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              ) : currentFilteredRows.length === 0 ? (
                                <tr>
                                  <td colSpan="9" className="py-10 text-center">
                                    <p className="text-lg font-normal">
                                      No data found.
                                    </p>
                                  </td>
                                </tr>
                              ) : (
                                currentFilteredRows.map((assessment) => (
                                  <tr
                                    key={assessment._id}
                                    className="bg-white border-b cursor-pointer text-xs"
                                  >
                                    <td className="py-2 px-6 text-custom-blue">
                                      <div
                                        className="flex items-center gap-3"
                                        onClick={() =>
                                          handleAssessmentClick(assessment)
                                        }
                                      >
                                        {assessment.AssessmentTitle}
                                      </div>
                                    </td>
                                    <td className="py-2 px-6">
                                      {Array.isArray(assessment.AssessmentType)
                                        ? assessment.AssessmentType.join(', ')
                                        : assessment.AssessmentType}
                                    </td>
                                    <td className="py-2 px-6">
                                      {assessment.NumberOfQuestions}
                                    </td>
                                    <td className="py-2 px-6">
                                      {assessment.DifficultyLevel}
                                    </td>
                                    <td className="py-2 px-6">
                                      {assessment.totalScore}
                                    </td>
                                    <td className="py-2 px-6">
                                      {assessment.passScore} {assessment.passScoreType ==="Percentage" ?"%":"Number"}
                                    </td>
                                    <td className="py-2 px-6">
                                      {assessment.Duration}
                                    </td>
                                    {/* <td className="py-2 px-6">
                                      {new Date(
                                        assessment.ExpiryDate
                                      ).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                      })}{" "}
                                    </td> */}
                                    <td className="py-2 px-6">
                                      <div>
                                        <button
                                          onClick={() =>
                                            toggleAction(assessment._id)
                                          }
                                        >
                                          <FiMoreHorizontal className="text-3xl" />
                                        </button>
                                        {actionViewMore === assessment._id && (
                                          <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
                                            <div className="space-y-1">
                                              <p
                                                className="hover:bg-gray-200 p-1 rounded pl-3"
                                                onClick={() =>
                                                  handleShareClick(assessment)
                                                }
                                              >
                                                Share
                                              </p>
                                              {objectPermissions.View && (
                                                <p
                                                  className="hover:bg-gray-200 p-1 rounded pl-3"
                                                  onClick={() =>
                                                    handleAssessmentClick(
                                                      assessment
                                                    )
                                                  }
                                                >
                                                  View
                                                </p>
                                              )}
                                              {objectPermissions.Edit && (
                                                <p
                                                  className="hover:bg-gray-200 p-1 rounded pl-3"
                                                  onClick={() =>
                                                    handleEditClick(assessment)
                                                  }
                                                >
                                                  Edit
                                                </p>
                                              )}
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
                          ) : assessmentData.length === 0 ? (
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
                            currentFilteredRows.map((assessment) => (
                              <div
                                key={assessment._id}
                                className="bg-white border border-custom-blue cursor-pointer rounded text-xs"
                              >
                                <div className="border-b p-2 flex justify-between">
                                  <p className="text-slate-400 font-medium text-[15px] mt-1">
                                    Exp.Date:{" "}
                                    <span className="text-gray-700">
                                      {new Date(assessment.ExpiryDate)
                                        .toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })
                                        .replace(/(\w{3}) (\d{4})/, "$1, $2")}
                                    </span>
                                    <span className="ml-[110px] text-gray-700">
                                      {assessment.Duration}
                                    </span>
                                  </p>{" "}
                                  <div className="relative">
                                    <div>
                                      <button
                                        onClick={() =>
                                          toggleAction(assessment._id)
                                        }
                                      >
                                        <MdMoreVert className="text-3xl" />
                                      </button>
                                      {actionViewMore === assessment._id && (
                                        <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
                                          <div className="space-y-1">
                                            <p
                                              className="hover:bg-gray-200 p-1 rounded pl-3"
                                              onClick={() =>
                                                handleShareClick(assessment)
                                              }
                                            >
                                              Share
                                            </p>
                                            {objectPermissions.View && (
                                              <p
                                                className="hover:bg-gray-200 p-1 rounded pl-3"
                                                onClick={() =>
                                                  handleAssessmentClick(
                                                    assessment
                                                  )
                                                }
                                              >
                                                View
                                              </p>
                                            )}
                                            {objectPermissions.Edit && (
                                              <p
                                                className="hover:bg-gray-200 p-1 rounded pl-3"
                                                onClick={() =>
                                                  handleEditClick(assessment)
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
                                </div>
                                <div className="flex justify-between p-2">
                                  <div className="flex">
                                    <div>
                                      <p
                                        className="text-custom-blue text-lg 80"
                                        onClick={() =>
                                          handleAssessmentClick(assessment)
                                        }
                                      >
                                        {assessment.AssessmentTitle}
                                      </p>
                                      <div className="text-gray-700 flex items-center">
                                        <p className="text-slate-400 w-32">
                                          Assessment Type
                                        </p>
                                        <p className="text-gray-700"> {Array.isArray(assessment.AssessmentType)
                                          ? assessment.AssessmentType.join(', ')
                                          : assessment.AssessmentType}</p>
                                      </div>
                                      <div className="text-gray-700 flex items-center">
                                        <p className="text-slate-400 w-32">
                                          No.of Questions
                                        </p>
                                        <p className="text-gray-700">{assessment.NumberOfQuestions}</p>
                                      </div>
                                      <div className="text-gray-700 flex items-center">
                                        <p className="text-slate-400 w-32">
                                          Difficulty Level
                                        </p>
                                        <p className="text-gray-700">{assessment.DifficultyLevel}</p>
                                      </div>
                                      {assessment.totalScore && (
                                        <div className="text-gray-700 flex items-center">
                                          <p className="text-slate-400 w-32">
                                            Total Score
                                          </p>
                                          <p className="text-gray-700">{assessment.totalScore}</p>
                                        </div>
                                      )}
                                      {(assessment.passScore !== null && assessment.passScore !== undefined && assessment.passScore > 0) && (
                                        <div className="text-gray-700 flex items-center">
                                          <p className="text-slate-400 w-32">
                                            Pass Score
                                          </p>
                                          <p className="text-gray-700">{assessment.passScore}</p>
                                        </div>
                                      )}
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
      {selectedAssessment && (
        <EditAssessment
          onClose={handleCloseEdit}
          candidate1={selectedAssessment}
        />
      )}
      {isShareOpen && (
        <ShareAssessment
          linkExpiryDays= {linkExpiryDays}
          isOpen={isShareOpen}
          onCloseshare={handleCloseShare}
          assessmentId={isShareOpen._id}
        />
      )}
      {showAssessmentDetails && (
        <AssessmentProfileDetails
        // assessmentId={}
        fetchAssessmentData={fetchAssessmentData}
        isOpen={isMenuOpen}
        onOutsideClick={handleOutsideClick}
        linkExpiryDays= {linkExpiryDays}
          assessment={showAssessmentDetails}
          onCloseprofile={handleCloseProfile}
        />
      )}

      {sidebarOpen && (
        <>
          <Sidebar
          fetchAssessmentData={fetchAssessmentData}
          showLinkExpiryDay={showLinkExpiryDay}
          setShowLinkExpiryDays={setShowLinkExpiryDays}
          linkExpiryDays={linkExpiryDays}
          setLinkExpiryDays={setLinkExpiryDays}
            onClose={closeSidebar}
            onOutsideClick={handleOutsideClick}
            onDataAdded={handleDataAdded}
          />
        </>
      )}
    </>
  );
};

export default Assessment;
