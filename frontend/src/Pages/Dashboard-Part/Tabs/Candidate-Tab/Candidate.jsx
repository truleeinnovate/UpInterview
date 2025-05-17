// Import necessary dependencies and icons
import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from "lucide-react";
import { ReactComponent as FaList } from '../../../../icons/FaList.svg';
import { ReactComponent as TbLayoutGridRemove } from '../../../../icons/TbLayoutGridRemove.svg';
import CandidateKanban from './CandidateKanban';
import Tooltip from "@mui/material/Tooltip";
import AddCandidateForm from './AddCandidateForm';
import CandidateDetails from './CandidateViewDetails/CandidateDetails';
import { useMediaQuery } from 'react-responsive';
import { ReactComponent as IoIosArrowBack } from '../../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../../icons/IoIosArrowForward.svg';
import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
import { ReactComponent as LuFilter } from '../../../../icons/LuFilter.svg';
import { ReactComponent as LuFilterX } from '../../../../icons/LuFilterX.svg';

import { useCustomContext } from '../../../../Context/Contextfetch';
import CandidateTable from './CandidateTable';
import { Outlet, useNavigate } from 'react-router-dom';


import { motion } from 'framer-motion';
import { Button } from '../CommonCode-AllTabs/ui/button';
import Loading from '../../../../Components/Loading';

export const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
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
    closeOffcanvas();
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
    const newSelectedTech = newTechMainChecked ? skills?.map(s => s.SkillName) : [];
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
      experience: {
        min: Number(minExperience) || 0,
        max: Number(maxExperience) || 15
      },
    });
    // if (window.innerWidth < 1023) {
    closeOffcanvas();
    // }
  }
  return (
    <div
      // absolute w-72 sm:mt-5 md:w-full sm:w-full text-sm bg-white border right-0 z-30 h-[calc(100vh-200px)]
      className="absolute w-72 sm:mt-5 md:w-full sm:w-full text-sm bg-white border right-0 z-30 h-[calc(100vh-200px)]"
      style={{
        visibility: isOpen ? "visible" : "hidden",
        transform: isOpen ? "" : "translateX(50%)",
        // transition: "transform 0.3s ease-in-out",
      }}
    >
      {/* relative h-full flex flex-col */}
      <div className="relative h-full flex flex-col ">
        <div className="absolute w-72 sm:w-full md:w-full  border-b flex justify-between p-2 items-center bg-white z-10">
          <div>
            <h2 className="text-lg font-bold ">Filters</h2>
          </div>
          {/* Unselect All Option */}
          <div>
            {/* {(isAnyOptionSelected || minExperience || maxExperience) && ( */}
            <div>
              <button onClick={handleUnselectAll} className="font-bold text-md">
                Clear Filters
              </button>
            </div>
            {/* )} */}
          </div>
        </div>
        <div className="p-4 flex-grow overflow-y-auto mb-20 mt-10">
          {/* Higher Qualification */}
          <div className="flex justify-between">
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 rounded 
            focus:ring-0 
            checked:bg-custom-blue checked:border-custom-blue"
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
              {/* {isStatusDropdownOpen ? (
                <MdKeyboardArrowUp />
              ) : (
                <MdKeyboardArrowDown />
              )} */}
            </div>
          </div>
          {isStatusDropdownOpen && (
            <div className="bg-white  mt-1">
              {qualification.map((option, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 rounded 
            focus:ring-0 
            checked:bg-custom-blue checked:border-custom-blue"
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
              {/* {isTechDropdownOpen ? (
                <MdKeyboardArrowUp />
              ) : (
                <MdKeyboardArrowDown />
              )} */}
            </div>
          </div>
          {isTechDropdownOpen && (
            <div className="bg-white  mt-1">
              {skills?.map((option, index) => (
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
          <div className="bg-white py-2 mt-1 mb-28">
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
        <div className="sticky  bottom-0 w-72 sm:w-full md:w-full bg-white space-x-3 flex justify-end border-t p-2">
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



function Candidate({ candidates, onResendLink, isAssessmentView }) { // onResendLink, isAssessmentView - this things come from Assessment-view-AssessmentTab.jsx
  const { candidateData, loading } = useCustomContext(); // Fetch data from context when not in assessment view
  console.log('candidateData:-', candidateData);
  const [view, setView] = useState('table');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModeOn, setEditModeOn] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: { min: '', max: '' },
  });
  const navigate = useNavigate();

  // Determine which data to use based on isAssessmentView
  const dataToUse = isAssessmentView ? candidates : candidateData;

  // Automatically switch to Kanban view for tablet view (768px to 1024px)
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });

  useEffect(() => {
    if (isTablet) {
      setView('kanban');
    } else {
      setView('table');
    }
  }, [isTablet]);


    // useEffect(() => {
    //   const handleResize = () => {
    //     if (window.innerWidth < 1024) {
    //       setView("kanban");
    //     } else {
    //       setView("table");
    //     }
    //   };
  
    //   // Set initial view mode based on current window size
    //   handleResize();
  
    //   // Add event listener to handle window resize
    //   window.addEventListener("resize", handleResize);
  
    //   // Cleanup event listener on component unmount
    //   return () => {
    //     window.removeEventListener("resize", handleResize);
    //   };
    // }, []);
  

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
  };

  const handleEdit = (candidate) => {
    setSelectedCandidate(candidate);
    setEditModeOn(true);
    setShowAddForm(true);
  };

  const handleView = (candidate) => {
    setSelectedCandidate(candidate);
    setSelectCandidateView(true);
  };

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleFilterIconClick = () => {
    if (dataToUse.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((user) => {
      const fieldsToSearch = [
        user.LastName,
        user.Email,
        user.Phone,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(user.HigherQualification);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        user.skills?.some((skill) => selectedFilters.tech.includes(skill.skill));
      const matchesExperience =
        (!selectedFilters.experience.min ||
          user.CurrentExperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          user.CurrentExperience <= selectedFilters.experience.max);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus && matchesTech && matchesExperience;
    });
  };

  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  const nextPage = () => {
    if ((currentPage + 1) * rowsPerPage < FilteredData().length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading && !isAssessmentView) {
    return (
      <p className="h-full w-full flex justify-center items-center">loading....</p>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <main className={isAssessmentView ? "p-2" : "w-full px-9 py-2 sm:mt-20 md:mt-24  sm:px-2 lg:px-8 xl:px-8 2xl:px-8"} >
        {!isAssessmentView && (
          <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
            <main className="px-6">
              <div className="sm:px-0 ">
                {/* Header */}
                <motion.div
                  className="flex justify-between items-center py-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-2xl  font-semibold  text-custom-blue">Candidates</h1>
                  <Button
                    onClick={() => navigate('new')}
                    size="sm" className="bg-custom-blue hover:bg-custom-blue/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Candidate
                  </Button>
                </motion.div>

                {/* Toolbar */}
                <motion.div className="lg:flex xl:flex   2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between mb-4">
                  <div className="flex items-center sm:hidden md:hidden">
                    <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                      <span
                        onClick={() => setView('table')}
                      // className={`p-[1px] rounded-lg transition-colors ${view === 'table'
                      //   ? 'text-custom-blue'
                      //   : 'bg-white text-gray-600 hover:bg-gray-100'
                      //   }`}
                      >
                        <FaList className={`text-xl mr-4 ${view === "table" ? "text-custom-blue" : ""}`} />
                      </span>
                    </Tooltip>
                    <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                      <span
                        onClick={() => setView('kanban')}
                      // className={`p-[2px] rounded-lg transition-colors ${view === 'kanban'
                      //   ? 'text-custom-blue'
                      //   : 'bg-white text-gray-600 hover:bg-gray-100'
                      //   }`}
                      >
                        <TbLayoutGridRemove className={`text-xl ${view === "kanban" ? "text-custom-blue" : ""}`} />
                      </span>
                    </Tooltip>
                  </div>

                  <div className="flex items-center  ">
                    <div className="sm:mt-0   flex justify-end w-full sm:w-auto">
                      <div className="max-w-lg w-full">
                        <label htmlFor="search" className="sr-only">Search</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IoMdSearch className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search candidates..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
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
                          className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md  ${currentPage === 0 ? ' cursor-not-allowed' : ''
                            }`}
                          onClick={prevPage}
                        >
                          <IoIosArrowBack className="text-custom-blue" />
                        </span>
                      </Tooltip>

                      <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                        <span
                          className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md  ${(currentPage + 1) * rowsPerPage >= FilteredData().length
                            ? ' cursor-not-allowed'
                            : ''
                            }`}
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
                            opacity: dataToUse.length === 0 ? 0.2 : 1,
                            pointerEvents: dataToUse.length === 0 ? 'none' : 'auto',
                          }}
                        >
                          {isFilterActive ? (
                            <LuFilterX className="text-custom-blue" />
                          ) : (
                            <LuFilter className="text-custom-blue" />
                          )}
                        </span>
                      </Tooltip>
                    </div>
                  </div>

                </motion.div>
              </div>
            </main>
          </div>

        )}


      {/* Main Content */}
        <main className="fixed  top-52 2xl:top-48 xl:top-48 lg:top-48 left-0  right-0 bg-background">
          <div className="sm:px-0">

            {
              loading ? (
                 <Loading />
              ) : (
                  <motion.div className="bg-white">
                   {view === 'table' ? (
            <div className="flex relative w-full overflow-hidden">
              <div
                className={`transition-all duration-300 ${isMenuOpen
                        ? 'mr-1 md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]'
                        : 'w-full'
                        }`}
              >
                <CandidateTable
                  candidates={currentFilteredRows}
                  onView={handleView}
                  onEdit={handleEdit}
                  onResendLink={onResendLink}
                  isAssessmentView={isAssessmentView}
                  isMenuOpen={isMenuOpen}
                />
              </div>

              {!isAssessmentView && isMenuOpen && (
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
                <CandidateKanban
                  candidates={currentFilteredRows}
                  onView={handleView}
                  onEdit={handleEdit}
                  onResendLink={onResendLink}
                  isAssessmentView={isAssessmentView}
                />
              </div>
              {!isAssessmentView && isMenuOpen && (
                <div className="h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-44 bg-white border-l border-gray-200 shadow-lg z-30">
                  <OffcanvasMenu
                    isOpen={isMenuOpen}
                    closeOffcanvas={handleFilterIconClick}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              )}
            </div>
          )
        }
          </motion.div>
        )
            }
       
          </div>
        </main>
      </main>

      {
        selectCandidateView && (
          <CandidateDetails
            candidate={selectedCandidate}
            onClose={() => setSelectCandidateView(false)}
          />
        )
      }

      {
        !isAssessmentView && showAddForm && (
          <AddCandidateForm
            isOpen={showAddForm}
            onClose={() => {
              setShowAddForm(false);
              setSelectedCandidate(null);
              setEditModeOn(false);
            }}
            selectedCandidate={selectedCandidate}
            isEdit={editModeOn}
          />
        )
      }
      <Outlet />
    </div >
  );
}

export default Candidate;
