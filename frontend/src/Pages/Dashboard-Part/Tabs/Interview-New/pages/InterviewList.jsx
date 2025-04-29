import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useCustomContext } from "../../../../../Context/Contextfetch.js";
import Tooltip from "@mui/material/Tooltip";
import { ReactComponent as TbLayoutGridRemove } from '../../../../../icons/TbLayoutGridRemove.svg';
import { ReactComponent as FaList } from '../../../../../icons/FaList.svg';
import { ReactComponent as IoIosArrowBack } from '../../../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../../../icons/IoIosArrowForward.svg';
import { ReactComponent as LuFilterX } from '../../../../../icons/LuFilterX.svg';
import { ReactComponent as FiFilter } from '../../../../../icons/FiFilter.svg';
import InterviewTable from '../components/InterviewTable';
import KanbanBoard from '../components/KanbanBoard';
import { Button } from '../../CommonCode-AllTabs/ui/button.jsx';
import { motion } from 'framer-motion';
import Loading from '../../../../../Components/Loading.js';
// import CandidateDetails from '../../Candidate-Tab/CandidateDetails.jsx';
import PositionSlideDetails from '../../Position-Tab/PositionSlideDetails';
import { ChevronUp, ChevronDown } from 'lucide-react';

const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
  const {
    skills,
    qualification,
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
                <ChevronUp />
              ) : (
                <ChevronDown />
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
                <ChevronUp />
              ) : (
                <ChevronDown />
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

function InterviewList() {
  const {
    interviewData,
    loading,
  } = useCustomContext();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectPositionView, setSelectPositionView] = useState(false);
  const handleView = (candidate) => {
    if (!candidate) return; // Prevents error if candidate is undefined
    setSelectedCandidate(candidate);
    setSelectCandidateView(true);
  };
  const handleViewPosition = (position) => {
    setSelectedPosition(position);
    setSelectPositionView(true);
  };
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: { min: '', max: '' },
  });

  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(filters);
  }, []);

  const [viewMode, setViewMode] = useState("list");
  const handleListViewClick = () => {
    setViewMode("list");
  };
  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const FilteredData = () => {
    return interviewData.filter((interview) => {
      const fieldsToSearch = [
        interview.candidateId?.FirstName,
        interview.candidateId?.LastName,
        interview.candidateId?.Email,
        interview.positionId?.title,
        interview.positionId?.companyname,
        interview.interviewTitle,
        interview.interviewType,
        interview.status,
        interview.CreatedDate,
      ];
  
      const matchFound = fieldsToSearch.some((field) => {
        if (!field) return false; // Ensure field is not null or undefined
        return field.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });
  
      return matchFound;
    });
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
  const endIndex = Math.min(startIndex + rowsPerPage, interviewData.length);
  const currentFilteredRows = FilteredData()
    .slice(startIndex, endIndex)

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleFilterIconClick = () => {
    if (interviewData.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };

  return (
    <div className=" bg-background">
      <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 xl:px-8 2xl:px-8">
        <div className="sm:px-0">
          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-semibold text-custom-blue">Interviews</h1>

            <Link to="/interviews/new">
              <Button variant="default" size="sm" className="bg-custom-blue hover:bg-custom-blue/90">
                <Plus className="h-4 w-4 mr-1" />
                New Interview
              </Button>
            </Link>

          </motion.div>
          {/* 2 */}
          <motion.div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end sm:float-end mb-4">
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
              <div className=" sm:mt-0 flex justify-end w-full sm:w-auto">
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
                      placeholder="Search interviews..."
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
                    className={`border p-2 mr-2 text-xl sm:text-md md:text-md  rounded-md ${currentPage === 0 ? " cursor-not-allowed" : ""
                      } ${activeArrow === "prev" ? "text-custom-blue" : ""}`}
                    onClick={prevPage}
                    disabled={currentPage === 0}
                  >
                    <IoIosArrowBack className="text-custom-blue" />
                  </span>
                </Tooltip>

                <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    className={`border p-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1 ? " cursor-not-allowed" : ""
                      } ${activeArrow === "next" ? "text-custom-blue" : ""}`}
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
                      opacity: interviewData.length === 0 ? 0.2 : 1,
                      pointerEvents: interviewData.length === 0 ? "none" : "auto",
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

          {loading ? (
            <Loading />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {currentFilteredRows.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg shadow-sm border border-border">
                  {currentFilteredRows.length === 0 ? (
                    <p className="text-muted-foreground">No interviews match your search criteria.</p>
                  ) : (
                    <p className="text-muted-foreground">No interviews found. Create your first interview.</p>
                  )}
                </div>
              ) : (
                viewMode === 'kanban' ? (
                  <div className="flex relative w-full overflow-hidden">
                    <div className={` transition-all duration-300 ${isMenuOpen ? 'mr-1 md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]' : 'w-full'
                      }`} >
                      <KanbanBoard interviews={currentFilteredRows}
                        onView={handleView}
                        onViewPosition={handleViewPosition}


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

                ) : (
                  // <div className="bg-card shadow-sm overflow-hidden rounded-lg border border-border">
                  //   <InterviewTable
                  //     interviews={currentFilteredRows}
                  //     onView={handleView}
                  //     onViewPosition={handleViewPosition}

                  //   />

                  // </div>
                  <div className="flex relative w-full overflow-hidden">
                    <div className={` transition-all duration-300 ${isMenuOpen ? 'mr-1 md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]' : 'w-full'
                      }`} >
                      <InterviewTable
                        interviews={currentFilteredRows}
                        onView={handleView}
                        onViewPosition={handleViewPosition}

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

                )
              )}
            </motion.div>
          )}
        </div>
      </main>
      {/* {selectCandidateView === true && (
        <CandidateDetails
          candidate={selectedCandidate}
          onClose={() => setSelectCandidateView(null)}
        />
      )} */}
      {selectPositionView === true && (
        <PositionSlideDetails
          position={selectedPosition}
          onClose={() => setSelectPositionView(null)}
        />
      )}
    </div>
  );
}

export default InterviewList;
