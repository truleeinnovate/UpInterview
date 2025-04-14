// Import necessary dependencies and icons
import React, { useCallback, useEffect, useState } from 'react';
// import { FaSearch, } from 'react-icons/fa';
import { ReactComponent as FaList } from '../../../../icons/FaList.svg';
import { ReactComponent as TbLayoutGridRemove } from '../../../../icons/TbLayoutGridRemove.svg';
// import { MdKeyboardArrowDown } from "react-icons/md";
// import { MdKeyboardArrowUp } from "react-icons/md";

import CandidateKanban from './CandidateKanban';

import Tooltip from "@mui/material/Tooltip";
// import { IoIosArrowBack } from "react-icons/io";
// import { IoIosArrowForward } from "react-icons/io";
// import { FiFilter } from "react-icons/fi";
// import { LuFilterX } from "react-icons/lu";
import AddCandidateForm from './AddCandidateForm';
import CandidateDetails from './CandidateDetails';

import { useCustomContext } from '../../../../Context/Contextfetch';
import CandidateTable from './CandidateTable';



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
      className="  w-[100%] h-[calc(80vh-80px)]  text-sm    flex flex-col"
      style={{
        visibility: isOpen ? "visible" : "hidden",
        transform: isOpen ? "" : "translateX(50%)",
        // transition: "transform 0.3s ease-in-out",
      }}
    >
      {/* relative h-full flex flex-col */}
      <div className=" h-full  flex flex-col ">
        <div className="   border-b flex justify-between p-2 items-center bg-white ">
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
        <div className="p-4 flex-grow overflow-y-auto   ">
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

const CandidateTab = ({ isAssessmentContext = false, onSelectCandidates }) => {//this props we will use in assessment form
  const {
    candidateData,
    loading,
    // fetchCandidates
  } = useCustomContext();
  console.log("candidateData ", candidateData)
  const [view, setView] = useState('table');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModeOn, setEditModeOn] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  // State for sorting configuration and filters
  // const [candidateData,setCandidatesData] = useState([]);
  // const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: { min: '', max: '' },
  });

  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(filters);
  }, []);
  // const  fetchCandidates = async() => {
  //   // setLoading(true)
  //   try {
  //     const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate`);

  //     const candidateresponse = response.data.reverse() || [];

  //     console.log("candidateresponse ", candidateresponse);

  //     setCandidatesData(candidateresponse); 
  //   } catch (err) {
  //     console.log("Failed to fetch candidates.",err);
  //   } 
  //   // finally {
  //   //   setLoading(false);
  //   // }
  // }



  // useEffect(() => {
  //   fetchCandidates();
  // }, []);


  const handleEdit = (candidate) => {
    setSelectedCandidate(candidate);
    setEditModeOn(true);
    setShowAddForm(true);
    // console.log('Edit candidate:', candidate);
  };

  const handleView = (candidate) => {
    setSelectedCandidate(candidate);
    setSelectCandidateView(true);
  };

  // console.log("candidateData table ", candidateData);



  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };



  const FilteredData = () => {
    if (!Array.isArray(candidateData)) return [];
    return candidateData.filter((user) => {
      const fieldsToSearch = [
        user.LastName,
        user.Email,
        user.Phone,
      ].filter(field => field !== null && field !== undefined);

      const matchesStatus = selectedFilters.status.length === 0 || selectedFilters.status.includes(user.HigherQualification);
      const matchesTech = selectedFilters.tech.length === 0 || user.skills?.some(skill => selectedFilters.tech.includes(skill.skill));
      const matchesExperience =
        (!selectedFilters.experience.min || user.CurrentExperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max || user.CurrentExperience <= selectedFilters.experience.max);

      const matchesSearchQuery = fieldsToSearch.some(
        (field) =>
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus && matchesTech && matchesExperience;
    });
  };

  const handleFilterIconClick = () => {
    if (candidateData.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
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

  // const handleAddCandidate = (newCandidate) => {
  //   setCandidatesData(prev => [...prev, newCandidate]);
  // };


  // Handle column sorting
  // const handleSort = (key) => {
  //   let direction = 'asc';
  //   if (sortConfig.key === key && sortConfig.direction === 'asc') {
  //     direction = 'desc';
  //   }
  //   setSortConfig({ key, direction });
  // };

  // Apply filters to candidates list
  // const filteredCandidates = candidates.filter(candidate => {
  //   if (filters.Status !== 'all' && candidate.Status !== filters.Status) return false;
  //   // if (filters.department !== 'all' && candidate.department !== filters.department) return false;
  //   return true;
  // });

  // Sort filtered candidates based on current sort configuration
  // const sortedCandidates = [...candidateData].sort((a, b) => {
  //   if (!sortConfig.key) return 0;

  //   if (a[sortConfig.key] < b[sortConfig.key]) {
  //     return sortConfig.direction === 'asc' ? -1 : 1;
  //   }
  //   if (a[sortConfig.key] > b[sortConfig.key]) {
  //     return sortConfig.direction === 'asc' ? 1 : -1;
  //   }
  //   return 0;
  // });

  if (loading) {
    return <p className='h-full w-full flex justify-center items-center'>loading....</p>
  }

  return (
    <main className="bg-background">
     <main className={isAssessmentContext ? '' : 'max-w-7xl mx-auto sm:px-6 lg:px-8 xl:px-8 2xl:px-8'}>


        <div className="mb-3">
          <div className="flex sm:flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row  justify-between items-start sm:items-center gap-2 mb-3">
          {!isAssessmentContext && (
            <h1 className="text-2xl   font-bold text-custom-blue">
              Candidates
            </h1>
          )}
            {!isAssessmentContext && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-full md:w-[25%] xl:w-[20%] lg:w-[15%] 2xl:w-[10%] px-3 py-2.5 bg-custom-blue text-white rounded-lg  text-base"
            >
              Add Candidate
            </button>
              )}
          </div>

          <div className="flex md:flex-row xl:w-row lg:w-row 2xl:w-row sm:flex-row items-stretch sm:items-center gap-2 justify-between">
          {isAssessmentContext ? (
              <p className='font-semibold text-lg float-start'>Candidates</p>
            ) : (
            <div className="flex items-center gap-1 order-1 sm:order-1">
              <button
                onClick={() => setView('table')}
                className={`p-[1px] rounded-lg transition-colors ${view === 'table'
                  ? 'text-custom-blue'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <FaList className='w-7 h-7' />
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`p-[2px] rounded-lg transition-colors ${view === 'kanban'
                  ? 'text-custom-blue'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <TbLayoutGridRemove className='w-6 h-6' />

              </button>
            </div>
                  )}

            <div className="flex order-2 sm:order-2  items-center ">

              {/* // flex-1 order-1 sm:order-2 */}
              <div className="relative flex-1 ">
                {/* <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" /> */}
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-[100%] pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-custom-blue focus:border-transparent text-sm"
                />
              </div>

      
              <div className="flex items-center ml-2 space-x-1">
                <span>{currentPage + 1} / {totalPages}</span>
                <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    className={`border py-1.5 pr-3 pl-2 mr-1 text-xl sm:text-md md:text-md rounded-md ${currentPage === 0 ? " cursor-not-allowed" : ""}`}
                    onClick={prevPage}
                  >
                    {/* <IoIosArrowBack className="text-custom-blue" /> */}
                  </span>
                </Tooltip>

                <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    className={`border py-1.5 pr-2 pl-2 text-xl sm:text-md md:text-md rounded-md ${(currentPage + 1) * rowsPerPage >= FilteredData().length ? " cursor-not-allowed" : ""}`}
                    onClick={nextPage}
                  >
                    {/* <IoIosArrowForward className="text-custom-blue" /> */}
                  </span>
                </Tooltip>
              </div>
              <div className="relative ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
                <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    onClick={handleFilterIconClick}
                    style={{
                      opacity: candidateData.length === 0 ? 0.2 : 1,
                      pointerEvents: candidateData.length === 0 ? "none" : "auto",
                    }}
                  >
                    {/* {isFilterActive ? (
                      <LuFilterX className="text-custom-blue" />
                    ) : (
                      <FiFilter className="text-custom-blue" />
                    )} */}
                  </span>
                </Tooltip>

              </div>

            </div>


          </div>
        </div>

        <div className="bg-white rounded-xl  border border-gray-100">

          {view === 'table' ?
            <div className="flex relative w-full overflow-hidden">
              <div className={` transition-all duration-300 ${isMenuOpen ? 'mr-1 md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]' : 'w-full'
                }`} >
                <CandidateTable
                  candidates={currentFilteredRows}
                  onView={handleView}
                  onEdit={handleEdit}
                  isAssessmentContext={isAssessmentContext}
                  onSelectCandidates={onSelectCandidates}
                // isMenuOpen={isMenuOpen}
                // closeOffcanvas={handleFilterIconClick}
                // onFilterChange={handleFilterChange}
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
                <CandidateKanban
                  candidates={currentFilteredRows}
                  onView={handleView}
                  onEdit={handleEdit}
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
        </div>
      </main>

      {selectCandidateView === true && (
        <CandidateDetails
          candidate={selectedCandidate}
          onClose={() => setSelectCandidateView(null)}
        />
      )}


      {showAddForm && <AddCandidateForm
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setSelectedCandidate(null);
          setEditModeOn(false);
          // fetchCandidates();
        }}
        selectedCandidate={selectedCandidate}
        isEdit={editModeOn}

      // onSave={handleAddCandidate}
      />}

    </main>
  );
};

export default CandidateTab;

