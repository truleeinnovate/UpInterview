
// import React, { useCallback, useEffect, useState } from 'react';
// import { Plus, ChevronUp, ChevronDown } from "lucide-react";
// import { ReactComponent as FaList } from '../../../../icons/FaList.svg';
// import { ReactComponent as TbLayoutGridRemove } from '../../../../icons/TbLayoutGridRemove.svg';
// import Tooltip from "@mui/material/Tooltip";
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { useCustomContext } from '../../../../Context/Contextfetch';
// import PositionKanban from './PositionKanban';
// import PositionSlideDetails from './PositionSlideDetails';
// import PositionForm from './Position-Form';
// import PositionTable from './PositionTable';
// import { ReactComponent as IoIosArrowBack } from '../../../../icons/IoIosArrowBack.svg';
// import { ReactComponent as IoIosArrowForward } from '../../../../icons/IoIosArrowForward.svg';
// import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
// import { ReactComponent as LuFilterX } from '../../../../icons/LuFilterX.svg';
// import { ReactComponent as LuFilter } from '../../../../icons/LuFilter.svg';
// import { Button } from '../CommonCode-AllTabs/ui/button';
// import Loading from '../../../../Components/Loading';

// export const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
//   const {
//     skills,
//     qualification,

//   } = useCustomContext();
//   // const [skills, setSkills] = useState([]);
//   // const [qualification, setQualification] = useState([])
//   const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
//   const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
//   const [isStatusMainChecked, setStatusMainChecked] = useState(false);
//   const [isTechMainChecked, setTechMainChecked] = useState(false);
//   const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);
//   const [selectedTechOptions, setSelectedTechOptions] = useState([]);
//   const isAnyOptionSelected = selectedStatusOptions.length > 0 || selectedTechOptions.length > 0;
//   const handleUnselectAll = () => {
//     setSelectedStatusOptions([]);
//     setSelectedTechOptions([]);
//     setStatusMainChecked(false);
//     setTechMainChecked(false);
//     setMinExperience('');
//     setMaxExperience('');
//     onFilterChange({ status: [], tech: [], experience: { min: '', max: '' } });
//     closeOffcanvas();
//   };
//   useEffect(() => {
//     if (!isStatusMainChecked) setSelectedStatusOptions([]);
//     if (!isTechMainChecked) setSelectedTechOptions([]);
//   }, [isStatusMainChecked, isTechMainChecked]);
//   const handleStatusMainToggle = () => {
//     const newStatusMainChecked = !isStatusMainChecked;
//     setStatusMainChecked(newStatusMainChecked);
//     const newSelectedStatus = newStatusMainChecked ? qualification.map(q => q.QualificationName) : [];
//     setSelectedStatusOptions(newSelectedStatus);

//   };
//   const handleTechMainToggle = () => {
//     const newTechMainChecked = !isTechMainChecked;
//     setTechMainChecked(newTechMainChecked);
//     const newSelectedTech = newTechMainChecked ? skills?.map(s => s.SkillName) : [];
//     setSelectedTechOptions(newSelectedTech);

//   };
//   const handleStatusOptionToggle = (option) => {
//     const selectedIndex = selectedStatusOptions.indexOf(option);
//     const updatedOptions = selectedIndex === -1
//       ? [...selectedStatusOptions, option]
//       : selectedStatusOptions.filter((_, index) => index !== selectedIndex);

//     setSelectedStatusOptions(updatedOptions);
//   };
//   const handleTechOptionToggle = (option) => {
//     const selectedIndex = selectedTechOptions.indexOf(option);
//     const updatedOptions = selectedIndex === -1
//       ? [...selectedTechOptions, option]
//       : selectedTechOptions.filter((_, index) => index !== selectedIndex);

//     setSelectedTechOptions(updatedOptions);
//   };

//   const [minExperience, setMinExperience] = useState('');
//   const [maxExperience, setMaxExperience] = useState('');

//   const handleExperienceChange = (e, type) => {
//     const value = Math.max(0, Math.min(15, e.target.value));
//     if (type === 'min') {
//       setMinExperience(value);
//     } else {
//       setMaxExperience(value);
//     }

//   };
//   const Apply = () => {
//     onFilterChange({
//       status: selectedStatusOptions,
//       tech: selectedTechOptions,
//       experience: { min: minExperience, max: maxExperience },
//     });
//     if (window.innerWidth < 1023) {
//       closeOffcanvas();
//     }
//   }



//   return (
//     <div
//       className="absolute w-72 sm:mt-5 md:w-full sm:w-full text-sm bg-white border right-0 z-30 h-[calc(100vh-200px)]"
//       style={{
//         visibility: isOpen ? "visible" : "hidden",
//         transform: isOpen ? "" : "translateX(50%)",
//         // transition: "transform 0.3s ease-in-out",
//       }}
//     >
//       <div className="relative h-full flex flex-col ">
//         <div className="absolute w-72 sm:w-full md:w-full  border-b flex justify-between p-2 items-center bg-white z-10">
//           <div>
//             <h2 className="text-lg font-bold ">Filters</h2>
//           </div>
//           {/* Unselect All Option */}
//           <div>
//             {/* {(isAnyOptionSelected || minExperience || maxExperience) && ( */}
//             <div>
//               <button onClick={handleUnselectAll} className="font-bold text-md">
//                 Clear Filters
//               </button>
//             </div>
//             {/* )} */}
//           </div>
//         </div>
//         <div className="p-4 flex-grow overflow-y-auto mb-20 mt-10">
//           {/* Higher Qualification */}
//           <div className="flex justify-between">
//             <div className="cursor-pointer">
//               <label className="inline-flex items-center">
//                 <input
//                   type="checkbox"
//                   className="form-checkbox h-4 w-4"
//                   checked={isStatusMainChecked}
//                   onChange={handleStatusMainToggle}
//                 />
//                 <span className="ml-3 font-bold">Higher Qualification</span>
//               </label>
//             </div>
//             <div
//               className="cursor-pointer mr-3 text-2xl"
//               onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
//             >
//               {isStatusDropdownOpen ? (
//                 <ChevronUp />
//               ) : (
//                 <ChevronDown />
//               )}
//             </div>
//           </div>
//           {isStatusDropdownOpen && (
//             <div className="bg-white py-2 mt-1">
//               {qualification.map((option, index) => (
//                 <label key={index} className="inline-flex items-center">
//                   <input
//                     type="checkbox"
//                     className="form-checkbox h-4 w-4"
//                     checked={selectedStatusOptions.includes(option.QualificationName)}
//                     onChange={() => handleStatusOptionToggle(option.QualificationName)}
//                   />
//                   <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option.QualificationName}</span>
//                 </label>
//               ))}
//             </div>
//           )}
//           {/* Skill/Technology */}
//           <div className="flex mt-2 justify-between">
//             <div className="cursor-pointer">
//               <label className="inline-flex items-center">
//                 <input
//                   type="checkbox"
//                   className="form-checkbox h-4 w-4"
//                   checked={isTechMainChecked}
//                   onChange={handleTechMainToggle}
//                 />
//                 <span className="ml-3 font-bold">Skill/Technology</span>
//               </label>
//             </div>
//             <div
//               className="cursor-pointer mr-3 text-2xl"
//               onClick={() => setTechDropdownOpen(!isTechDropdownOpen)}
//             >
//               {isTechDropdownOpen ? (
//                 <ChevronUp />
//               ) : (
//                 <ChevronDown />
//               )}
//             </div>
//           </div>
//           {isTechDropdownOpen && (
//             <div className="bg-white py-2 mt-1">
//               {skills?.map((option, index) => (
//                 <label key={index} className="inline-flex items-center">
//                   <input
//                     type="checkbox"
//                     className="form-checkbox h-4 w-4"
//                     checked={selectedTechOptions.includes(option.SkillName)}
//                     onChange={() => handleTechOptionToggle(option.SkillName)}
//                   />
//                   <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option.SkillName}</span>
//                 </label>
//               ))}
//             </div>
//           )}
//           <div className="flex justify-between mt-2 ml-5">
//             <div className="cursor-pointer">
//               <label className="inline-flex items-center">
//                 <span className="ml-3 font-bold">Experience</span>
//               </label>
//             </div>
//           </div>
//           <div className="bg-white py-2 mt-1">
//             <div className="flex items-center ml-10">
//               <input
//                 type="number"
//                 placeholder="Min"
//                 value={minExperience}
//                 min="0"
//                 max="15"
//                 onChange={(e) => handleExperienceChange(e, 'min')}
//                 className="border-b form-input w-20"
//               />
//               <span className="mx-3">to</span>
//               <input
//                 type="number"
//                 placeholder="Max"
//                 value={maxExperience}
//                 min="1"
//                 max="15"
//                 onChange={(e) => handleExperienceChange(e, 'max')}
//                 className="border-b form-input w-20"
//               />
//             </div>
//           </div>
//         </div>
//         {/* Footer */}
//         <div className="sticky  bottom-0 w-72  sm:w-full md:w-full bg-white space-x-3 flex justify-end border-t p-2">
//           <button
//             type="submit"
//             className="bg-custom-blue p-2 rounded-md text-white"
//             onClick={closeOffcanvas}
//           >
//             Close
//           </button>
//           <button
//             type="submit"
//             className="bg-custom-blue p-2 rounded-md text-white"
//             onClick={Apply}
//           >
//             Apply
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const PositionTab = () => {
//   const {
//     isPositionsLoading,
//     positions,
//     // fetchPositionsData
//   } = useCustomContext();
//   const navigate = useNavigate();
//   const [view, setView] = useState('table');
//   const [selectedPosition, setSelectedPosition] = useState(null);
//   const [selectPositionView, setSelectPositionView] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [editModeOn, setEditModeOn] = useState(false);

//   const [showAddForm, setShowAddForm] = useState(false);




//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 1024) {
//         setView("kanban");
//       } else {
//         setView("table");
//       }
//     };

//     // Set initial view mode based on current window size
//     handleResize();

//     // Add event listener to handle window resize
//     window.addEventListener("resize", handleResize);

//     // Cleanup event listener on component unmount
//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   // State for sorting configuration and filters
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
//   const [isFilterActive, setIsFilterActive] = useState(false);
//   const [isMenuOpen, setMenuOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [selectedFilters, setSelectedFilters] = useState({
//     status: [],
//     tech: [],
//     experience: { min: '', max: '' },
//   });



//   const handleFilterChange = useCallback((filters) => {
//     setSelectedFilters(filters);
//   }, []);


//   // const handleEdit = (position) => {
//   //   setSelectedPosition(position);
//   //   setEditModeOn(true);
//   //   setShowAddForm(true);
//   // };

//   const handleView = (position) => {
//     setSelectedPosition(position);
//     setSelectPositionView(true);
//   };

//   // useEffect(() => {
//   //   fetchPositionsData()
//   // }, [fetchPositionsData])



//   const toggleMenu = () => {
//     setMenuOpen(!isMenuOpen);
//   };



//   const FilteredData = () => {
//     if (!Array.isArray(positions)) return [];
//     return positions.filter((user) => {
//       const fieldsToSearch = [
//         user.title,
//         user.companyname,
//         user.Location,
//       ].filter(field => field !== null && field !== undefined);

//       const matchesStatus = selectedFilters.status.length === 0 || selectedFilters.status.includes(user.HigherQualification);
//       const matchesTech = selectedFilters.tech.length === 0 || user.skills?.some(skill => selectedFilters.tech.includes(skill.skill));
//       const matchesExperience = (selectedFilters.experience.min === '' || user.CurrentExperience >= selectedFilters.experience.min) &&
//         (selectedFilters.experience.max === '' || user.CurrentExperience <= selectedFilters.experience.max);

//       const matchesSearchQuery = fieldsToSearch.some(
//         (field) =>
//           field.toString().toLowerCase().includes(searchQuery.toLowerCase())
//       );

//       return matchesSearchQuery && matchesStatus && matchesTech && matchesExperience;
//     });
//   };

//   const handleFilterIconClick = () => {
//     if (positions.length !== 0) {
//       setIsFilterActive((prev) => !prev);
//       toggleMenu();
//     }
//   };




//   const rowsPerPage = 10;
//   const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
//   const nextPage = () => {
//     if ((currentPage + 1) * rowsPerPage < FilteredData().length) {
//       setCurrentPage((prevPage) => prevPage + 1);
//     }
//   };
//   const prevPage = () => {
//     if (currentPage > 0) {
//       setCurrentPage((prevPage) => prevPage - 1);
//     }
//   };

//   const startIndex = currentPage * rowsPerPage;
//   const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
//   const currentFilteredRows = FilteredData().slice(startIndex, endIndex);



//   const handleSearch = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   // const handleAddCandidate = (newCandidate) => {
//   //   setCandidatesData(prev => [...prev, newCandidate]);
//   // };





//   if (showAddForm) {
//     return (
//       <PositionForm
//         isOpen={showAddForm}
//         onClose={() => {
//           setShowAddForm(false);
//           setSelectedPosition(null);
//           setEditModeOn(false);
//           // fetchPositions(); // Uncomment if you want to refresh the positions list
//         }}
//         selectedPosition={selectedPosition}
//         isEdit={editModeOn}
//       />
//     );
//   }

//   return (
//     <div className="bg-background min-h-screen">
//       {/* <div className="w-full px-9 py-2 sm:px-2 sm:mt-20 md:mt-24"> */}

//       <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
//         <main className="px-6">
//           <div className="sm:px-0 ">
//             {/* Header */}
//             <motion.div
//               className="flex justify-between items-center py-4"
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <h1 className="text-2xl  font-semibold  text-custom-blue  ">
//                 Positions
//               </h1>
//               <Button
//                 onClick={() => navigate('/position/new-position')}
//                 size="sm" className="bg-custom-blue hover:bg-custom-blue/90 text-white"
//               >
//                 <Plus className="h-4 w-4 mr-1" />
//                 Add Position
//               </Button>
//             </motion.div>

//             {/* Toolbar */}
//             <motion.div className="lg:flex xl:flex   2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between mb-4">
//               <div className="flex items-center sm:hidden md:hidden">
//                 <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
//                   <span
//                     onClick={() => setView('table')}

//                   // className={`p-[1px] rounded-lg transition-colors ${view === 'table'
//                   //     ? ' text-custom-blue'
//                   //     : 'bg-white text-gray-600 hover:bg-gray-100'
//                   //   }`}
//                   >
//                     <FaList
//                       className={`text-xl mr-4 ${view === "table" ? "text-custom-blue" : ""}`}
//                     />
//                   </span>
//                 </Tooltip>
//                 <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
//                   <span
//                     onClick={() => setView('kanban')}
//                   // className={`p-1.5 rounded-lg transition-colors ${view === 'kanban'
//                   //     ? ' text-custom-blue'
//                   //     : 'bg-white text-gray-600 hover:bg-gray-100'
//                   //   }`}
//                   >
//                     <TbLayoutGridRemove
//                       className={`text-xl ${view === "kanban" ? "text-custom-blue" : ""}`}
//                     />
//                   </span>
//                 </Tooltip>
//               </div>

//               <div className="flex items-center  ">

//                 {/* // flex-1 order-1 sm:order-2 */}
//                 <div className="sm:mt-0   flex justify-end w-full sm:w-auto">
//                   <div className="max-w-lg w-full">
//                     <label htmlFor="search" className="sr-only">Search</label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <IoMdSearch className="h-5 w-5 text-muted-foreground" />
//                       </div>
//                       <input
//                         type="text"

//                         placeholder="Search positions..."
//                         value={searchQuery}
//                         onChange={handleSearch}
//                         className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
//                       // className="w-[100%] pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div >
//                   <span className="p-2 text-xl sm:text-sm md:text-sm">
//                     {currentPage + 1}/{totalPages}
//                   </span>
//                 </div>

//                 <div className="flex">
//                   <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
//                     <span
//                       className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === 0 ? " cursor-not-allowed" : ""}`}
//                       onClick={prevPage}
//                     >
//                       <IoIosArrowBack className="text-custom-blue" />
//                     </span>
//                   </Tooltip>

//                   <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
//                     <span
//                       className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md ${(currentPage + 1) * rowsPerPage >= FilteredData().length ? " cursor-not-allowed" : ""}`}
//                       onClick={nextPage}
//                     >
//                       <IoIosArrowForward className="text-custom-blue" />
//                     </span>
//                   </Tooltip>
//                 </div>

//                 <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
//                   <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
//                     <span
//                       onClick={handleFilterIconClick}
//                       style={{
//                         opacity: positions.length === 0 ? 0.2 : 1,
//                         pointerEvents: positions.length === 0 ? "none" : "auto",
//                       }}
//                     >
//                       {isFilterActive ? (
//                         <LuFilterX className="text-custom-blue" />
//                       ) : (
//                         <LuFilter className="text-custom-blue" />
//                       )}
//                     </span>
//                   </Tooltip>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </main>
//       </div>


//       {/* Main Content */}
//       <main className="fixed  top-52 2xl:top-48 xl:top-48 lg:top-48 left-0  right-0 bg-background">
//         <div className="sm:px-0">
//           {
//             isPositionsLoading ? (
//               <Loading />
//             ) : (
//               <motion.div className="bg-white">
//                 {view === 'table' ? (
//                   <div className="flex relative w-full overflow-hidden">
//                     <div
//                       className={`transition-all duration-300 ${isMenuOpen
//                         ? 'mr-1 md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]'
//                         : 'w-full'
//                         }`}
//                     >
//                       <PositionTable
//                         positions={currentFilteredRows}
//                         onView={handleView}
//                         // onEdit={handleEdit}
//                         isMenuOpen={isMenuOpen}
//                       // closeOffcanvas={handleFilterIconClick}
//                       // onFilterChange={handleFilterChange}
//                       />
//                     </div>
//                     {isMenuOpen && (
//                       <div className="h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-44 bg-white border-l border-gray-200 shadow-lg z-30">
//                         <OffcanvasMenu
//                           isOpen={isMenuOpen}
//                           closeOffcanvas={handleFilterIconClick}
//                           onFilterChange={handleFilterChange}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="flex relative w-full overflow-hidden">
//                     <div
//                       className={`transition-all duration-300 ${isMenuOpen
//                         ? 'md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]'
//                         : 'w-full'
//                         }`}
//                     >
//                       <PositionKanban
//                         positions={currentFilteredRows}
//                         onView={handleView}
//                       //  onEdit={handleEdit}
//                       />
//                     </div>
//                     {isMenuOpen && (
//                       <div className="h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-44 bg-white border-l border-gray-200 shadow-lg z-30">
//                         <OffcanvasMenu
//                           isOpen={isMenuOpen}
//                           closeOffcanvas={handleFilterIconClick}
//                           onFilterChange={handleFilterChange}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 )
//                 }
//               </motion.div>
//             )
//           }
//         </div>
//       </main>
//       {/* </div> */}

//       {selectPositionView === true && (
//         <PositionSlideDetails
//           position={selectedPosition}
//           onClose={() => setSelectPositionView(null)}
//         />
//       )}

//     </div>
//   );
// };

// export default PositionTab;













import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { useCustomContext } from '../../../../Context/Contextfetch';
import Header from '../../../../Components/Shared/Header/Header';
import Toolbar from '../../../../Components/Shared/Toolbar/Toolbar';
import TableView from '../../../../Components/Shared/Table/TableView';
import PositionKanban from './PositionKanban';
import PositionSlideDetails from './PositionSlideDetails';
import PositionForm from './Position-Form';
import { FilterPopup } from '../../../../Components/Shared/FilterPopup/FilterPopup';
import Loading from '../../../../Components/Loading';

const PositionTab = () => {
  const { isPositionsLoading, positions, skills } = useCustomContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('table');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectPositionView, setSelectPositionView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModeOn, setEditModeOn] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    location: [],
    tech: [],
    experience: { min: '', max: '' },
  });
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedTech, setSelectedTech] = useState([]);
  const [experience, setExperience] = useState({ min: '', max: '' });
  const filterIconRef = useRef(null);

  // Set view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setView('kanban');
      } else {
        setView('table');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedLocation(selectedFilters.location);
      setSelectedTech(selectedFilters.tech);
      setExperience(selectedFilters.experience);
      setIsLocationOpen(false);
      setIsSkillsOpen(false);
      setIsExperienceOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleLocationToggle = (location) => {
    setSelectedLocation((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleTechToggle = (tech) => {
    setSelectedTech((prev) =>
      prev.includes(tech)
        ? prev.filter((t) => t !== tech)
        : [...prev, tech]
    );
  };

  const handleExperienceChange = (e, type) => {
    const value = Math.max(0, Math.min(15, Number(e.target.value) || ''));
    setExperience((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleClearAll = () => {
    const clearedFilters = {
      location: [],
      tech: [],
      experience: { min: '', max: '' },
    };
    setSelectedLocation([]);
    setSelectedTech([]);
    setExperience({ min: '', max: '' });
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = {
      location: selectedLocation,
      tech: selectedTech,
      experience: {
        min: Number(experience.min) || 0,
        max: Number(experience.max) || 15,
      },
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.location.length > 0 ||
      filters.tech.length > 0 ||
      filters.experience.min ||
      filters.experience.max
    );
    setFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    if (positions?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  // Get unique locations for filter options
  const uniqueLocations = [
    ...new Set(positions?.map((position) => position.Location).filter(Boolean)),
  ];

  const FilteredData = () => {
    if (!Array.isArray(positions)) return [];
    return positions.filter((position) => {
      const fieldsToSearch = [
        position.title,
        position.companyname,
        position.Location,
      ].filter((field) => field !== null && field !== undefined);

      const matchesLocation =
        selectedFilters.location.length === 0 ||
        selectedFilters.location.includes(position.Location);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        position.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesExperience =
        (!selectedFilters.experience.min ||
          position.minexperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          position.maxexperience <= selectedFilters.experience.max);
      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesLocation && matchesTech && matchesExperience;
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

  const handleView = (position) => {
    navigate(`/position/view-details/${position._id}`, {
      state: { from: location.pathname },
    });
  };

  const handleEdit = (position) => {
    navigate(`/position/edit-position/${position._id}`);
  };

  // Table Columns Configuration
  const tableColumns = [
    {
      key: 'title',
      header: 'Position Title',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
              {row.title ? row.title.charAt(0) : '?'}
            </div>
          </div>
          <div className="ml-3">
            <div
              className="text-sm font-medium text-custom-blue cursor-pointer"
              onClick={() => handleView(row)}
            >
              {row.title || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    { key: 'companyname', header: 'Company', render: (value) => value || 'N/A' },
    { key: 'Location', header: 'Location', render: (value) => value || 'N/A' },
    {
      key: 'experience',
      header: 'Experience',
      render: (value, row) =>
        `${row.minexperience || 'N/A'} - ${row.maxexperience || 'N/A'} years`,
    },
    {
      key: 'rounds',
      header: 'Rounds',
      render: (value, row) => row.rounds?.length || 'N/A',
    },
    {
      key: 'skills',
      header: 'Skills/Technology',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-custom-bg text-custom-blue rounded-full text-xs"
            >
              {skill.skill || 'N/A'}
            </span>
          ))}
          {value.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{value.length - 2}
            </span>
          )}
        </div>
      ),
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => handleView(row),
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => handleEdit(row),
    },
  ];

  if (showAddForm) {
    return (
      <PositionForm
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setSelectedPosition(null);
          setEditModeOn(false);
        }}
        selectedPosition={selectedPosition}
        isEdit={editModeOn}
      />
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            <Header
              title="Positions"
              onAddClick={() => navigate('/position/new-position')}
              addButtonText="Add Position"
            />
            <Toolbar
              view={view}
              setView={setView}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onFilterClick={handleFilterIconClick}
              isFilterPopupOpen={isFilterPopupOpen}
              isFilterActive={isFilterActive}
              dataLength={positions?.length}
              searchPlaceholder="Search positions..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      <main className="fixed top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        <div className="sm:px-0">
          <motion.div className="bg-white">
            <div className="relative w-full">
              {view === 'table' ? (
                <div className="w-full">
                  <TableView
                    data={currentFilteredRows}
                    columns={tableColumns}
                    loading={isPositionsLoading}
                    actions={tableActions}
                    emptyState="No positions found."
                  />
                </div>
              ) : (
                <div className="w-full">
                  <PositionKanban
                    positions={currentFilteredRows}
                    onView={handleView}
                    onEdit={handleEdit}
                  />
                </div>
              )}
              <FilterPopup
                isOpen={isFilterPopupOpen}
                onClose={() => setFilterPopupOpen(false)}
                onApply={handleApplyFilters}
                onClearAll={handleClearAll}
                filterIconRef={filterIconRef}
              >
                <div className="space-y-3">
                  {/* Location Section */}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsLocationOpen(!isLocationOpen)}
                    >
                      <span className="font-medium text-gray-700">Location</span>
                      {isLocationOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isLocationOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {uniqueLocations.length > 0 ? (
                          uniqueLocations.map((location) => (
                            <label
                              key={location}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedLocation.includes(location)}
                                onChange={() => handleLocationToggle(location)}
                                className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                              />
                              <span className="text-sm">{location}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            No locations available
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Skills/Technology Section */}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsSkillsOpen(!isSkillsOpen)}
                    >
                      <span className="font-medium text-gray-700">Skills/Technology</span>
                      {isSkillsOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isSkillsOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {skills?.length > 0 ? (
                          skills.map((skill) => (
                            <label
                              key={skill.SkillName}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTech.includes(skill.SkillName)}
                                onChange={() => handleTechToggle(skill.SkillName)}
                                className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                              />
                              <span className="text-sm">{skill.SkillName}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No skills available</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Experience Section */}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsExperienceOpen(!isExperienceOpen)}
                    >
                      <span className="font-medium text-gray-700">Experience</span>
                      {isExperienceOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isExperienceOpen && (
                      <div className="mt-1 space-y-2 pl-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Min (years)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="15"
                              value={experience.min}
                              onChange={(e) => handleExperienceChange(e, 'min')}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Max (years)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="15"
                              value={experience.max}
                              onChange={(e) => handleExperienceChange(e, 'max')}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </FilterPopup>
            </div>
          </motion.div>
        </div>
      </main>
      {selectPositionView && (
        <PositionSlideDetails
          position={selectedPosition}
          onClose={() => setSelectPositionView(false)}
        />
      )}
    </div>
  );
};

export default PositionTab;