import { useState, useRef, useEffect, useCallback } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import Tooltip from "@mui/material/Tooltip";
import { Plus, Search } from 'lucide-react';
import ShareAssessment from "./ShareAssessment.jsx";
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ReactComponent as IoIosArrowBack } from '../../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../../icons/IoIosArrowForward.svg';
import { ReactComponent as FaList } from '../../../../icons/FaList.svg';
import { ReactComponent as TbLayoutGridRemove } from '../../../../icons/TbLayoutGridRemove.svg';
import { ReactComponent as FiFilter } from '../../../../icons/FiFilter.svg';
import { ReactComponent as MdKeyboardArrowUp } from '../../../../icons/MdKeyboardArrowUp.svg';
import { ReactComponent as MdKeyboardArrowDown } from '../../../../icons/MdKeyboardArrowDown.svg';
import { ReactComponent as LuFilterX } from '../../../../icons/LuFilterX.svg';

import AssessmentTable from './AssessmentTable.jsx';
import AssessmentKanban from './AssessmentKanban.jsx';
import Loading from '../../../../Components/Loading.js';
import { Button } from '../CommonCode-AllTabs/ui/button.jsx';

const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
  const { skills, qualification } = useCustomContext();
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
  const [isStatusMainChecked, setStatusMainChecked] = useState(false);
  const [isTechMainChecked, setTechMainChecked] = useState(false);
  const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);
  const [selectedTechOptions, setSelectedTechOptions] = useState([]);
  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');

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
          <h2 className="text-lg font-bold">Filters</h2>
          {(isAnyOptionSelected || minExperience || maxExperience) && (
            <button onClick={handleUnselectAll} className="font-bold text-md">
              Clear Filters
            </button>
          )}
        </div>
        <div className="p-4 flex-grow overflow-y-auto mb-20 mt-10">
          <div className="flex justify-between">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4"
                checked={isStatusMainChecked}
                onChange={handleStatusMainToggle}
              />
              <span className="ml-3 font-bold">Higher Qualification</span>
            </label>
            <div
              className="cursor-pointer mr-3 text-2xl"
              onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              {isStatusDropdownOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
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
          <div className="flex mt-2 justify-between">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4"
                checked={isTechMainChecked}
                onChange={handleTechMainToggle}
              />
              <span className="ml-3 font-bold">Skill/Technology</span>
            </label>
            <div
              className="cursor-pointer mr-3 text-2xl"
              onClick={() => setTechDropdownOpen(!isTechDropdownOpen)}
            >
              {isTechDropdownOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
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
            <label className="inline-flex items-center cursor-pointer">
              <span className="ml-3 font-bold">Experience</span>
            </label>
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
  const { assessmentData, fetchAssessmentData, loading } = useCustomContext();
  const [assessmentSections, setAssessmentSections] = useState({});

  useEffect(() => {
    document.title = "Assessment Tab";
  }, []);

  // Fetch sections for current page's assessments
  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentAssessments = assessmentData?.slice(startIndex, endIndex) || [];

useEffect(() => {
  if (currentAssessments.length > 0) {
    const fetchSections = async () => {
      try {
        const sectionPromises = currentAssessments.map(async (assessment) => {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/assessment-questions/list/${assessment._id}`
          );
          
          // Handle both new and old response formats
          const sections = response.data.exists === false 
            ? 0 
            : response.data.data?.sections?.length || 0;
            
          return {
            id: assessment._id,
            sections
          };
        });

        const results = await Promise.all(sectionPromises);
        const newSections = results.reduce((acc, curr) => {
          acc[curr.id] = curr.sections;
          return acc;
        }, {});

        setAssessmentSections(prev => ({ ...prev, ...newSections }));
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    fetchSections();
  }
}, [currentAssessments]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: [],
  });
  const [viewMode, setViewMode] = useState("table");
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const navigate = useNavigate();

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

  const handleView = (assessment) => {
    navigate(`/assessment-details/${assessment._id}`);
  };

  const handleShareClick = async (assessment) => {
    if ((assessmentSections[assessment._id] ?? 0) === 0) {
      toast.error("No questions added to this assessment.");
      return;
    }
    setIsShareOpen(assessment);
  };

  const handleDataAdded = () => {
    fetchAssessmentData();
    setCurrentPage(0);
  };

  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(filters);
  }, []);

 const FilteredData = () => {
    if (!Array.isArray(assessmentData)) return null;
    const filtered = assessmentData.filter((user) => {
      const fieldsToSearch = [user.AssessmentTitle, user.Position].filter(
        (field) => field !== null && field !== undefined
      );
      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchesSearchQuery;
    });
    return filtered.length > 0 ? filtered : null;
  };
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };
   const totalPages = Math.max(1, Math.ceil((FilteredData()?.length || 0) / rowsPerPage));
  const currentFilteredRows = FilteredData()?.slice(startIndex, endIndex) || [];

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


  const handleListViewClick = () => {
    setViewMode("table");
  };

  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleEdit = (assessment) => {
    navigate(`/assessment/edit/${assessment._id}`);
  };

  const handleCloseShare = () => {
    setIsShareOpen(false);
  };

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

  const handleFilterIconClick = () => {
    if (assessmentData.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            <motion.div
              className="flex justify-between items-center py-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-semibold text-custom-blue">Assessment Templates</h1>
              <Link to="/assessment/new">
                <Button size="sm" className="bg-custom-blue hover:bg-custom-blue/90 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </Link>
            </motion.div>
            <motion.div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between mb-4">
              <div className="flex items-center sm:hidden md:hidden">
                <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={handleListViewClick}>
                    <FaList
                      className={`text-xl mr-4 ${viewMode === "table" ? "text-custom-blue" : ""}`}
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
                <div className="sm:mt-0 flex justify-end w-full sm:w-auto">
                  <div className="max-w-lg w-full">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        id="search"
                        name="search"
                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Search assessment..."
                        type="search"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                      />
                    </div>
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
                      className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === 0 ? "cursor-not-allowed" : ""} ${activeArrow === "prev" ? "text-custom-blue" : ""}`}
                      onClick={prevPage}
                      disabled={currentPage === 0}
                    >
                      <IoIosArrowBack className="text-custom-blue" />
                    </span>
                  </Tooltip>
                  <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      className={`border p-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1 ? "cursor-not-allowed" : ""} ${activeArrow === "next" ? "text-custom-blue" : ""}`}
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
            </motion.div>
          </div>
        </main>
      </div>

      <main className="fixed top-48 left-0 right-0 bg-background">
        <div className="sm:px-0">
          {loading ? (
            <Loading />
          ) : (
            <motion.div className="bg-white">
                   {FilteredData() === null ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 text-lg">No data found</p>
                </div>
              ) : viewMode === 'table' ? (
                <div className="flex relative w-full overflow-hidden">
                  <div
                    className={`transition-all duration-300 ${isMenuOpen
                        ? 'mr-1 md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]'
                        : 'w-full'
                      }`}
                  >
                    <AssessmentTable
                      assessments={currentFilteredRows}
                      onView={handleView}
                      onEdit={handleEdit}
                      onShare={handleShareClick}
                      assessmentSections={assessmentSections}
                    />
                  </div>
                  {isMenuOpen && (
                    <div className="h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-44 bg-white border-l border-gray-200 shadow-lg z-30">
                      <OffcanvasMenu
                        isOpen={isMenuOpen}
                        closeOffcanvas={handleFilterIconClick}
                        onFilterChange={handleFilterChange}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex relative w-full overflow-hidden">
                  <div
                    className={`transition-all duration-300 ${isMenuOpen
                        ? 'md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]'
                        : 'w-full'
                      }`}
                  >
                    <AssessmentKanban
                      assessments={currentFilteredRows}
                      onView={handleView}
                      onEdit={handleEdit}
                      onShare={handleShareClick}
                      assessmentSections={assessmentSections}
                    />
                  </div>
                  {isMenuOpen && (
                    <div className="h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-44 bg-white border-l border-gray-200 shadow-lg z-30">
                      <OffcanvasMenu
                        isOpen={isMenuOpen}
                        closeOffcanvas={handleFilterIconClick}
                        onFilterChange={handleFilterChange}
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {isShareOpen && (
        <ShareAssessment
          isOpen={isShareOpen}
          onCloseshare={handleCloseShare}
          assessment={isShareOpen}
        />
      )}
    </div>
  );
};

export default Assessment;