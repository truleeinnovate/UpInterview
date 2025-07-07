// import React, { useCallback, useEffect, useState } from 'react'
// import Cookies from 'js-cookie';
// import Tooltip from "@mui/material/Tooltip";
// import { ReactComponent as FaList } from '../../icons/FaList.svg';
// import { ReactComponent as TbLayoutGridRemove } from '../../icons/TbLayoutGridRemove.svg';
// import { ReactComponent as IoMdSearch } from '../../icons/IoMdSearch.svg';
// import { ReactComponent as IoIosArrowBack } from '../../icons/IoIosArrowBack.svg';
// import { ReactComponent as IoIosArrowForward } from '../../icons/IoIosArrowForward.svg';
// import { fetchMasterData } from '../../utils/fetchMasterData.js';
// import { ReactComponent as MdKeyboardArrowUp } from '../../icons/MdKeyboardArrowUp.svg';
// import { ReactComponent as MdKeyboardArrowDown } from '../../icons/MdKeyboardArrowDown.svg';
// import { ReactComponent as FiFilter } from '../../icons/FiFilter.svg';
// import { ReactComponent as FiMoreHorizontal } from '../../icons/FiMoreHorizontal.svg';
// import { ReactComponent as LuFilterX } from '../../icons/LuFilterX.svg';
// import axios from 'axios';
// import { config } from '../../config.js';
// import { decodeJwt } from '../../utils/AuthCookieManager/jwtDecode.js';

// const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
//     const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
//     const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
//     const [isStatusMainChecked, setStatusMainChecked] = useState(false);
//     const [isTechMainChecked, setTechMainChecked] = useState(false);
//     const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);
//     const [selectedTechOptions, setSelectedTechOptions] = useState([]);
//     const isAnyOptionSelected = selectedStatusOptions.length > 0 || selectedTechOptions.length > 0;
//     const handleUnselectAll = () => {
//         setSelectedStatusOptions([]);
//         setSelectedTechOptions([]);
//         setStatusMainChecked(false);
//         setTechMainChecked(false);
//         onFilterChange({ status: [], tech: [] });
//     };
//     useEffect(() => {
//         if (!isStatusMainChecked) setSelectedStatusOptions([]);
//         if (!isTechMainChecked) setSelectedTechOptions([]);
//     }, [isStatusMainChecked, isTechMainChecked]);
//     const handleStatusMainToggle = () => {
//         const newStatusMainChecked = !isStatusMainChecked;
//         setStatusMainChecked(newStatusMainChecked);
//         const newSelectedStatus = newStatusMainChecked ? qualification.map(q => q.TechnologyMasterName) : [];
//         setSelectedStatusOptions(newSelectedStatus);

//     };
//     const handleTechMainToggle = () => {
//         const newTechMainChecked = !isTechMainChecked;
//         setTechMainChecked(newTechMainChecked);
//         const newSelectedTech = newTechMainChecked ? skills.map(s => s.SkillName) : [];
//         setSelectedTechOptions(newSelectedTech);

//     };
//     const handleStatusOptionToggle = (option) => {
//         const selectedIndex = selectedStatusOptions.indexOf(option);
//         const updatedOptions = selectedIndex === -1
//             ? [...selectedStatusOptions, option]
//             : selectedStatusOptions.filter((_, index) => index !== selectedIndex);

//         setSelectedStatusOptions(updatedOptions);
//     };
//     const handleTechOptionToggle = (option) => {
//         const selectedIndex = selectedTechOptions.indexOf(option);
//         const updatedOptions = selectedIndex === -1
//             ? [...selectedTechOptions, option]
//             : selectedTechOptions.filter((_, index) => index !== selectedIndex);

//         setSelectedTechOptions(updatedOptions);
//     };
//     const [skills, setSkills] = useState([]);
//     const [qualification, setQualification] = useState([]);
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const skillsData = await fetchMasterData('skills');
//                 setSkills(skillsData);
//                 const technologyData = await fetchMasterData('technology');
//                 setQualification(technologyData);
//             } catch (error) {
//                 console.error('Error fetching master data:', error);
//             }
//         };
//         fetchData();
//     }, []);

//     const Apply = () => {
//         onFilterChange({
//             status: selectedStatusOptions,
//             tech: selectedTechOptions,
//         });
//         if (window.innerWidth < 1023) {
//             closeOffcanvas();
//         }
//     }

//     return (
//         <div
//             className="absolute w-72 sm:mt-5 md:w-full sm:w-full text-sm bg-white border right-0 z-30 h-[calc(100vh-200px)]"
//             style={{
//                 visibility: isOpen ? "visible" : "hidden",
//                 transform: isOpen ? "" : "translateX(50%)",
//             }}
//         >
//             <div className="relative h-full flex flex-col">
//                 <div className="absolute w-72 sm:w-full md:w-full border-b flex justify-between p-2 items-center bg-white z-10">
//                     <div>
//                         <h2 className="text-lg font-bold ">Filters</h2>
//                     </div>
//                     {/* Unselect All Option */}
//                     <div>
//                         {(isAnyOptionSelected) && (
//                             <div>
//                                 <button onClick={handleUnselectAll} className="font-bold text-md">
//                                     Clear Filters
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//                 <div className="p-4 flex-grow overflow-y-auto mb-20 mt-10">
//                     {/* Higher Qualification */}
//                     <div className="flex justify-between">
//                         <div className="cursor-pointer">
//                             <label className="inline-flex items-center">
//                                 <input
//                                     type="checkbox"
//                                     className="form-checkbox h-4 w-4"
//                                     checked={isStatusMainChecked}
//                                     onChange={handleStatusMainToggle}
//                                 />
//                                 <span className="ml-3 font-bold">Technology</span>
//                             </label>
//                         </div>
//                         <div
//                             className="cursor-pointer mr-3 text-2xl"
//                             onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
//                         >
//                             {isStatusDropdownOpen ? (
//                                 <MdKeyboardArrowUp />
//                             ) : (
//                                 <MdKeyboardArrowDown />
//                             )}
//                         </div>
//                     </div>
//                     {isStatusDropdownOpen && (
//                         <div className="bg-white py-2 mt-1">
//                             {qualification.map((option, index) => (
//                                 <label key={index} className="inline-flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         className="form-checkbox h-4 w-4"
//                                         checked={selectedStatusOptions.includes(option.TechnologyMasterName)}
//                                         onChange={() => handleStatusOptionToggle(option.TechnologyMasterName)}
//                                     />
//                                     <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option.TechnologyMasterName}</span>
//                                 </label>
//                             ))}
//                         </div>
//                     )}
//                     {/* Skill/Technology */}
//                     <div className="flex mt-2 justify-between">
//                         <div className="cursor-pointer">
//                             <label className="inline-flex items-center">
//                                 <input
//                                     type="checkbox"
//                                     className="form-checkbox h-4 w-4"
//                                     checked={isTechMainChecked}
//                                     onChange={handleTechMainToggle}
//                                 />
//                                 <span className="ml-3 font-bold">Skill</span>
//                             </label>
//                         </div>
//                         <div
//                             className="cursor-pointer mr-3 text-2xl"
//                             onClick={() => setTechDropdownOpen(!isTechDropdownOpen)}
//                         >
//                             {isTechDropdownOpen ? (
//                                 <MdKeyboardArrowUp />
//                             ) : (
//                                 <MdKeyboardArrowDown />
//                             )}
//                         </div>
//                     </div>
//                     {isTechDropdownOpen && (
//                         <div className="bg-white py-2 mt-1">
//                             {skills.map((option, index) => (
//                                 <label key={index} className="inline-flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         className="form-checkbox h-4 w-4"
//                                         checked={selectedTechOptions.includes(option.SkillName)}
//                                         onChange={() => handleTechOptionToggle(option.SkillName)}
//                                     />
//                                     <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option.SkillName}</span>
//                                 </label>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//                 {/* Footer */}
//                 <div className="fixed bottom-0 w-72 sm:w-full md:w-full bg-white space-x-3 flex justify-end border-t p-2">
//                     <button
//                         type="submit"
//                         className="bg-custom-blue p-2 rounded-md text-white"
//                         onClick={closeOffcanvas}
//                     >
//                         Close
//                     </button>
//                     <button
//                         type="submit"
//                         className="bg-custom-blue p-2 rounded-md text-white"
//                         onClick={Apply}
//                     >
//                         Apply
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const InternalRequest = () => {
//     const authToken = Cookies.get("authToken");
//     const tokenPayload = decodeJwt(authToken);
//     const ownerId = tokenPayload?.userId;
//     const tenantId = tokenPayload?.tenantId;
//     const Organization = tokenPayload?.organization;

//     const [searchQuery, setSearchQuery] = useState("");
//     const [teamsData, setTeamsData] = useState('');
//     const [loading] = useState('');

//     const fetchInterviewRequests = useCallback(async () => {
//         try {
//             const response = await axios.get(`${config.REACT_APP_API_URL}/interviewrequest`);
//             let filteredRequests = [];

//             if (Organization === "true") {
//                 filteredRequests = response.data.filter(request =>
//                     request.ownerId === ownerId && request.tenantId === tenantId
//                 );
//             } else {
//                 filteredRequests = response.data.filter(request =>
//                     request.interviewerIds.includes(ownerId)
//                 );
//             }

//             setTeamsData(filteredRequests.reverse());
//             console.log("Filtered Interview Requests:", filteredRequests);
//         } catch (error) {
//             console.error("Error fetching interview requests:", error);
//         }
//     }, [Organization, ownerId, tenantId]);

//     useEffect(() => {
//         fetchInterviewRequests();
//     }, [fetchInterviewRequests]);

//     const [viewMode, setViewMode] = useState("list");
//     const handleListViewClick = () => {
//         setViewMode("list");
//     };

//     const handleKanbanViewClick = () => {
//         setViewMode("kanban");
//     };

//     const [selectedFilters, setSelectedFilters] = useState({
//         status: [],
//         tech: [],
//     });

//     const handleFilterChange = (filters) => {
//         setSelectedFilters(filters);
//     };

//     const FilteredData = () => {
//         if (!Array.isArray(teamsData)) {
//             return [];
//         }

//         const filteredData = teamsData.filter((user) => {
//             const fieldsToSearch = [
//                 user.contactId?.name,
//                 user.contactId?.email,
//                 user.contactId?.phone,
//             ].filter(field => field !== null && field !== undefined);

//             const matchesSearchQuery = fieldsToSearch.some(
//                 (field) =>
//                     field &&
//                     field.toString().toLowerCase().includes(searchQuery.toLowerCase())
//             );

//             const matchesStatus =
//                 selectedFilters.status.length === 0 ||
//                 selectedFilters.status.includes(user.contactId?.technology?.[0]);

//             const matchesTech =
//                 selectedFilters.tech.length === 0 ||
//                 user.contactId?.skills?.some(skill =>
//                     selectedFilters.tech.includes(skill.skill)
//                 );

//             return matchesSearchQuery && matchesStatus && matchesTech;
//         });

//         return filteredData;
//     };
//     const nextPage = () => {
//         if (currentPage < totalPages - 1) {
//             setCurrentPage(currentPage + 1);
//             setActiveArrow("next");
//         }
//     };
//     const rowsPerPage = 10;

//     const [isMenuOpen, setMenuOpen] = useState(false);

//     const toggleMenu = () => {
//         setMenuOpen(!isMenuOpen);
//     };

//     const [isFilterActive, setIsFilterActive] = useState(false);

//     const handleFilterIconClick = () => {
//         if (teamsData.length !== 0) {
//             setIsFilterActive((prev) => !prev);
//             toggleMenu();
//         }
//     };
//     const [currentPage, setCurrentPage] = useState(0);
//     const totalPages = Math.ceil(FilteredData().length / rowsPerPage);

//     useEffect(() => {
//         setCurrentPage(0);
//     }, [selectedFilters]);

//     const handleSearchInputChange = (event) => {
//         setSearchQuery(event.target.value);
//         setCurrentPage(0);
//     };

//     const prevPage = () => {
//         if (currentPage > 0) {
//             setCurrentPage(currentPage - 1);
//             setActiveArrow("prev");
//         }
//     };

//     const [activeArrow, setActiveArrow] = useState(null);

//     const [tableVisible] = useState(true);

//     const [actionViewMore, setActionViewMore] = useState(null);

//     const handleStatusUpdate = async (id, newStatus, currentStatus) => {
//         if (currentStatus !== 'inprogress') {
//             console.log("Status can only be updated if it's 'inprogress'");
//             return;
//         }

//         try {
//             await axios.patch(`${config.REACT_APP_API_URL}/interviewrequest/${id}`, { status: newStatus });
//             console.log(`Request ${newStatus} successfully!`);
//             window.location.reload();
//         } catch (error) {
//             console.error("Error updating status:", error);
//         }
//     };

//     const toggleActionMenu = (id) => {
//         setActionViewMore(prevId => (prevId === id ? null : id));
//     };

//     return (
//         <React.Fragment>
//             <div className="fixed top-16 sm:top-20 md:top-24 left-0 right-0">
//                 <div className="flex justify-between p-4">
//                     <div>
//                         <span className="text-lg font-semibold">Interview Requests</span>
//                     </div>
//                 </div>
//             </div>
//             <div className="fixed top-28 sm:top-32 md:top-36 left-0 right-0">
//                 <div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end sm:float-end p-4 ">
//                     <div className="flex items-center sm:hidden md:hidden">
//                         <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
//                             <span onClick={handleListViewClick}>
//                                 <FaList className={`text-xl mr-4 ${viewMode === "list" ? "text-custom-blue" : ""}`} />
//                             </span>
//                         </Tooltip>
//                         <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
//                             <span onClick={handleKanbanViewClick}>
//                                 <TbLayoutGridRemove className={`text-xl ${viewMode === "kanban" ? "text-custom-blue" : ""}`} />
//                             </span>
//                         </Tooltip>
//                     </div>
//                     <div className="flex items-center">
//                         <div className="relative">
//                             <div className="searchintabs border rounded-md relative">
//                                 <div className="absolute inset-y-0 left-0 flex items-center">
//                                     <button type="submit" className="p-2">
//                                         <IoMdSearch className="text-custom-blue" />
//                                     </button>
//                                 </div>
//                                 <input
//                                     type="text"
//                                     placeholder="Search by Name, Email, Phone."
//                                     value={searchQuery}
//                                     onChange={handleSearchInputChange}
//                                     className="rounded-full border h-8"
//                                 />
//                             </div>
//                         </div>
//                         <div>
//                             <span className="p-2 text-xl sm:text-sm md:text-sm">
//                                 {currentPage + 1}/{totalPages}
//                             </span>
//                         </div>
//                         <div className="flex">
//                             <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
//                                 <span
//                                     className={`border p-2 mr-2 text-xl sm:text-md md:text-md ${currentPage === 0 ? "cursor-not-allowed" : ""} ${activeArrow === "prev" ? "text-custom-blue" : ""}`}
//                                     onClick={prevPage}
//                                     disabled={currentPage === 0}
//                                 >
//                                     <IoIosArrowBack className="text-custom-blue" />
//                                 </span>
//                             </Tooltip>

//                             <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
//                                 <span
//                                     className={`border p-2 text-xl sm:text-md md:text-md ${currentPage === totalPages - 1 ? "cursor-not-allowed" : ""} ${activeArrow === "next" ? "text-custom-blue" : ""}`}
//                                     onClick={nextPage}
//                                     disabled={currentPage === totalPages - 1}
//                                 >
//                                     <IoIosArrowForward className="text-custom-blue" />
//                                 </span>
//                             </Tooltip>
//                         </div>
//                         <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
//                             <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
//                                 <span
//                                     onClick={handleFilterIconClick}
//                                     style={{
//                                         opacity: teamsData.length === 0 ? 0.2 : 1,
//                                         pointerEvents: teamsData.length === 0 ? "none" : "auto",
//                                     }}
//                                 >
//                                     {isFilterActive ? (
//                                         <LuFilterX className="text-custom-blue" />
//                                     ) : (
//                                         <FiFilter className="text-custom-blue" />
//                                     )}
//                                 </span>
//                             </Tooltip>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="fixed left-0 right-0 mx-auto z-10 sm:top-44 md:top-52 lg:top-48 xl:top-48 2xl:top-48">
//                 {tableVisible && (
//                     <div>
//                         {viewMode === "list" ? (
//                             <div className="sm:hidden md:hidden lg:flex xl:flex 2xl:flex">
//                                 <div
//                                     className="flex-grow"
//                                     style={{ marginRight: isMenuOpen ? "290px" : "0" }}
//                                 >
//                                     <div className="relative h-[calc(100vh-200px)] flex flex-col">
//                                         <div className="flex-grow overflow-y-auto pb-4">
//                                             <table className="text-left w-full border-collapse border-gray-300 mb-14">
//                                                 <thead className="bg-custom-bg  sticky top-0 z-10 text-xs">
//                                                     <tr>
//                                                         {Organization === 'false' ? (
//                                                             <>
//                                                                 <th scope="col" className="py-3 px-6">
//                                                                     Position
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 px-6">
//                                                                     Skill set
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 px-6">
//                                                                     Date & Time
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 px-6">
//                                                                     Duration
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 px-6">
//                                                                     Status
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 pl-10">
//                                                                     Actions
//                                                                 </th>
//                                                             </>
//                                                         ) : (
//                                                             <>
//                                                                 <th scope="col" className="py-3 px-6">
//                                                                     Interview Id
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 px-6">
//                                                                     Interviewer Type
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 px-6">
//                                                                     Interviewer Name
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 px-6">
//                                                                     Position
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 px-6">
//                                                                     Status
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 pl-10">
//                                                                     Requested At
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 pl-10">
//                                                                     Responded At
//                                                                 </th>
//                                                                 <th scope="col" className="py-3 pl-10">
//                                                                     Action
//                                                                 </th>
//                                                             </>
//                                                         )}
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {loading ? (
//                                                         <tr>
//                                                             <td colSpan="7" className="py-28 text-center">
//                                                                 <div className="wrapper12">
//                                                                     <div className="circle12"></div>
//                                                                     <div className="circle12"></div>
//                                                                     <div className="circle12"></div>
//                                                                     <div className="shadow12"></div>
//                                                                     <div className="shadow12"></div>
//                                                                     <div className="shadow12"></div>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     ) : teamsData.length === 0 ? (
//                                                         <tr>
//                                                             <td colSpan="8" className="py-10 text-center">
//                                                                 <div className="flex flex-col items-center justify-center p-5">
//                                                                     <p className="text-9xl rotate-180 text-custom-blue"></p>
//                                                                     <p className="text-center text-lg font-normal">
//                                                                         You don't have team yet. Create new team.
//                                                                     </p>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     ) : (
//                                                         teamsData.map((teams) => (
//                                                             <tr key={teams._id} className="bg-white border-b cursor-pointer text-xs">

//                                                                 {Organization === 'false' ? (
//                                                                     <>
//                                                                         <td className='py-2 px-6'>
//                                                                             {teams.positionId?.title}
//                                                                             {/* {teams.positionId} */}
//                                                                         </td>
//                                                                         <td className='py-2 px-6'>
//                                                                             {teams.candidateId.skills.map(eachSkill=> eachSkill.skill).join(" ")}
//                                                                         </td>
//                                                                         <td className='py-2 px-6'>
//                                                                             {teams.dateTime}
//                                                                         </td>
//                                                                         <td className='py-2 px-6'>
//                                                                             {teams.duration}
//                                                                         </td>
//                                                                         <td className='py-2 px-6'>
//                                                                             {teams.status}
//                                                                         </td>
//                                                                         <td className="py-2 px-6 relative">
//                                                                             <button onClick={() => toggleActionMenu(teams._id)}>
//                                                                                 <FiMoreHorizontal className="text-3xl" />
//                                                                             </button>

//                                                                             {actionViewMore === teams._id && (
//                                                                                 <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
//                                                                                     <p
//                                                                                         className="hover:bg-green-200 p-1 rounded pl-3 cursor-pointer"
//                                                                                         onClick={() => handleStatusUpdate(teams._id, 'accepted', teams.status)}
//                                                                                     >
//                                                                                         Accept
//                                                                                     </p>
//                                                                                     <p
//                                                                                         className="hover:bg-red-200 p-1 rounded pl-3 cursor-pointer"
//                                                                                         onClick={() => handleStatusUpdate(teams._id, 'declined', teams.status)}
//                                                                                     >
//                                                                                         Decline
//                                                                                     </p>
//                                                                                 </div>
//                                                                             )}
//                                                                         </td>
//                                                                     </>
//                                                                 ) : (
//                                                                     <>
//                                                                         <td className="py-2 px-6">{teams.scheduledInterviewId}</td>
//                                                                         <td className="py-2 px-6">{teams.interviewerType}</td>
//                                                                         <td className="py-2 px-6">
//                                                                             {teams.interviewerIds.map((interviewer) => (
//                                                                                 <div key={interviewer._id}>
//                                                                                     {interviewer.name}
//                                                                                 </div>
//                                                                             ))}
//                                                                         </td>
//                                                                         <td className='py-2 px-6'>
//                                                                             {teams.positionId?.title}
//                                                                         </td>
//                                                                         <td className='py-2 px-6'>
//                                                                             {teams.status}
//                                                                         </td>
//                                                                         <td className="py-2 px-6">
//                                                                             {new Date(teams.requestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
//                                                                             {' '}
//                                                                             {new Date(teams.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
//                                                                         </td>
//                                                                         <td className='py-2 px-6'>

//                                                                         </td>
//                                                                         <td className="py-2 px-6">
//                                                                             <div>
//                                                                                 <button
//                                                                                 //   onClick={() =>
//                                                                                 //     toggleAction(interview._id)
//                                                                                 //   }
//                                                                                 >
//                                                                                     <FiMoreHorizontal className="text-3xl" />
//                                                                                 </button>
//                                                                                 {/* {actionViewMore === interview._id && (
//                                           <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
//                                             <div className="space-y-1">
//                                               {objectPermissions.View && (
//                                                 <p
//                                                   className="hover:bg-gray-200 p-1 rounded pl-3"
//                                                   onClick={() =>
//                                                     handleInterviewClick(
//                                                       interview._id
//                                                     )
//                                                   }
//                                                 >
//                                                   View
//                                                 </p>
//                                               )}

//                                               {interview.ScheduleType !==
//                                                 "instantinterview" && (
//                                                   <>
//                                                     {objectPermissions.Edit && (
//                                                       <p
//                                                         className="hover:bg-gray-200 p-1 rounded pl-3"
//                                                         onClick={() =>
//                                                           handleEditClick(interview)
//                                                         }
//                                                       >
//                                                         Reschedule
//                                                       </p>
//                                                     )}
//                                                     <p
//                                                       className="hover:bg-gray-200 p-1 rounded pl-3"
//                                                       onClick={() =>
//                                                         handleUpdate(
//                                                           interview._id,
//                                                           interview.ScheduleType
//                                                         )
//                                                       }
//                                                     >
//                                                       Cancel
//                                                     </p>
//                                                   </>
//                                                 )}
//                                             </div>
//                                           </div>
//                                         )} */}
//                                                                             </div>
//                                                                         </td>
//                                                                     </>
//                                                                 )}

//                                                             </tr>
//                                                         ))
//                                                     )}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <OffcanvasMenu
//                                     isOpen={isMenuOpen}
//                                     closeOffcanvas={handleFilterIconClick}
//                                     onFilterChange={handleFilterChange}
//                                 />
//                             </div>
//                         ) : (
//                             <div className="flex">
//                                 <div
//                                     className="flex-grow"
//                                     style={{ marginRight: isMenuOpen ? "290px" : "0" }}
//                                 >
//                                     <div className="flex-grow h-[calc(100vh-200px)] overflow-y-auto pb-10 right-0 sm:mt-10 md:mt-10">
//                                         <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 px-4">
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <OffcanvasMenu
//                                     isOpen={isMenuOpen}
//                                     closeOffcanvas={handleFilterIconClick}
//                                     onFilterChange={handleFilterChange}
//                                 />
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </React.Fragment>

//     )
// }

// export default InternalRequest

// import React, { useCallback, useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Tooltip from "@mui/material/Tooltip";
// import { ReactComponent as FaList } from "../../icons/FaList.svg";
// import { ReactComponent as TbLayoutGridRemove } from "../../icons/TbLayoutGridRemove.svg";
// import { ReactComponent as IoMdSearch } from "../../icons/IoMdSearch.svg";
// import { ReactComponent as IoIosArrowBack } from "../../icons/IoIosArrowBack.svg";
// import { ReactComponent as IoIosArrowForward } from "../../icons/IoIosArrowForward.svg";
// import { fetchMasterData } from "../../utils/fetchMasterData.js";
// import { ReactComponent as MdKeyboardArrowUp } from "../../icons/MdKeyboardArrowUp.svg";
// import { ReactComponent as MdKeyboardArrowDown } from "../../icons/MdKeyboardArrowDown.svg";
// import { ReactComponent as FiFilter } from "../../icons/FiFilter.svg";
// import { ReactComponent as FiMoreHorizontal } from "../../icons/FiMoreHorizontal.svg";
// import { ReactComponent as LuFilterX } from "../../icons/LuFilterX.svg";
// import axios from "axios";
// import { config } from "../../config.js";
// import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode.js";

// const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
//   const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
//   const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
//   const [isStatusMainChecked, setStatusMainChecked] = useState(false);
//   const [isTechMainChecked, setTechMainChecked] = useState(false);
//   const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);
//   const [selectedTechOptions, setSelectedTechOptions] = useState([]);
//   const isAnyOptionSelected =
//     selectedStatusOptions.length > 0 || selectedTechOptions.length > 0;
//   const handleUnselectAll = () => {
//     setSelectedStatusOptions([]);
//     setSelectedTechOptions([]);
//     setStatusMainChecked(false);
//     setTechMainChecked(false);
//     onFilterChange({ status: [], tech: [] });
//   };
//   useEffect(() => {
//     if (!isStatusMainChecked) setSelectedStatusOptions([]);
//     if (!isTechMainChecked) setSelectedTechOptions([]);
//   }, [isStatusMainChecked, isTechMainChecked]);
//   const handleStatusMainToggle = () => {
//     const newStatusMainChecked = !isStatusMainChecked;
//     setStatusMainChecked(newStatusMainChecked);
//     const newSelectedStatus = newStatusMainChecked
//       ? qualification.map((q) => q.TechnologyMasterName)
//       : [];
//     setSelectedStatusOptions(newSelectedStatus);
//   };
//   const handleTechMainToggle = () => {
//     const newTechMainChecked = !isTechMainChecked;
//     setTechMainChecked(newTechMainChecked);
//     const newSelectedTech = newTechMainChecked
//       ? skills.map((s) => s.SkillName)
//       : [];
//     setSelectedTechOptions(newSelectedTech);
//   };
//   const handleStatusOptionToggle = (option) => {
//     const selectedIndex = selectedStatusOptions.indexOf(option);
//     const updatedOptions =
//       selectedIndex === -1
//         ? [...selectedStatusOptions, option]
//         : selectedStatusOptions.filter((_, index) => index !== selectedIndex);

//     setSelectedStatusOptions(updatedOptions);
//   };
//   const handleTechOptionToggle = (option) => {
//     const selectedIndex = selectedTechOptions.indexOf(option);
//     const updatedOptions =
//       selectedIndex === -1
//         ? [...selectedTechOptions, option]
//         : selectedTechOptions.filter((_, index) => index !== selectedIndex);

//     setSelectedTechOptions(updatedOptions);
//   };
//   const [skills, setSkills] = useState([]);
//   const [qualification, setQualification] = useState([]);
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const skillsData = await fetchMasterData("skills");
//         setSkills(skillsData);
//         const technologyData = await fetchMasterData("technology");
//         setQualification(technologyData);
//       } catch (error) {
//         console.error("Error fetching master data:", error);
//       }
//     };
//     fetchData();
//   }, []);

//   const Apply = () => {
//     onFilterChange({
//       status: selectedStatusOptions,
//       tech: selectedTechOptions,
//     });
//     if (window.innerWidth < 1023) {
//       closeOffcanvas();
//     }
//   };

//   return (
//     <div
//       className="absolute w-72 sm:mt-5 md:w-full sm:w-full text-sm bg-white border right-0 z-30 h-[calc(100vh-200px)]"
//       style={{
//         visibility: isOpen ? "visible" : "hidden",
//         transform: isOpen ? "" : "translateX(50%)",
//       }}
//     >
//       <div className="relative h-full flex flex-col">
//         <div className="absolute w-72 sm:w-full md:w-full border-b flex justify-between p-2 items-center bg-white z-10">
//           <div>
//             <h2 className="text-lg font-bold ">Filters</h2>
//           </div>
//           {/* Unselect All Option */}
//           <div>
//             {isAnyOptionSelected && (
//               <div>
//                 <button
//                   onClick={handleUnselectAll}
//                   className="font-bold text-md"
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             )}
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
//                 <span className="ml-3 font-bold">Technology</span>
//               </label>
//             </div>
//             <div
//               className="cursor-pointer mr-3 text-2xl"
//               onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
//             >
//               {isStatusDropdownOpen ? (
//                 <MdKeyboardArrowUp />
//               ) : (
//                 <MdKeyboardArrowDown />
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
//                     checked={selectedStatusOptions.includes(
//                       option.TechnologyMasterName
//                     )}
//                     onChange={() =>
//                       handleStatusOptionToggle(option.TechnologyMasterName)
//                     }
//                   />
//                   <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">
//                     {option.TechnologyMasterName}
//                   </span>
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
//                 <span className="ml-3 font-bold">Skill</span>
//               </label>
//             </div>
//             <div
//               className="cursor-pointer mr-3 text-2xl"
//               onClick={() => setTechDropdownOpen(!isTechDropdownOpen)}
//             >
//               {isTechDropdownOpen ? (
//                 <MdKeyboardArrowUp />
//               ) : (
//                 <MdKeyboardArrowDown />
//               )}
//             </div>
//           </div>
//           {isTechDropdownOpen && (
//             <div className="bg-white py-2 mt-1">
//               {skills.map((option, index) => (
//                 <label key={index} className="inline-flex items-center">
//                   <input
//                     type="checkbox"
//                     className="form-checkbox h-4 w-4"
//                     checked={selectedTechOptions.includes(option.SkillName)}
//                     onChange={() => handleTechOptionToggle(option.SkillName)}
//                   />
//                   <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">
//                     {option.SkillName}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           )}
//         </div>
//         {/* Footer */}
//         <div className="fixed bottom-0 w-72 sm:w-full md:w-full bg-white space-x-3 flex justify-end border-t p-2">
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

// const InternalRequest = () => {
//   const authToken = Cookies.get("authToken");
//   const tokenPayload = decodeJwt(authToken);
//   const ownerId = tokenPayload?.userId;
//   const tenantId = tokenPayload?.tenantId;
//   const Organization = tokenPayload?.organization;

//   const [searchQuery, setSearchQuery] = useState("");
//   const [teamsData, setTeamsData] = useState("");
//   const [loading] = useState("");

//   const fetchInterviewRequests = useCallback(async () => {
//     try {
//       const response = await axios.get(
//         `${config.REACT_APP_API_URL}/interviewrequest`
//       );
//       let filteredRequests = [];

//       if (Organization === "true") {
//         filteredRequests = response.data.filter(
//           (request) =>
//             request.ownerId === ownerId && request.tenantId === tenantId
//         );
//       } else {
//         filteredRequests = response.data.filter((request) =>
//           request.interviewerIds.includes(ownerId)
//         );
//       }

//       setTeamsData(filteredRequests.reverse());
//       console.log("Filtered Interview Requests:", filteredRequests);
//     } catch (error) {
//       console.error("Error fetching interview requests:", error);
//     }
//   }, [Organization, ownerId, tenantId]);

//   useEffect(() => {
//     fetchInterviewRequests();
//   }, [fetchInterviewRequests]);

//   const [viewMode, setViewMode] = useState("list");
//   const handleListViewClick = () => {
//     setViewMode("list");
//   };

//   const handleKanbanViewClick = () => {
//     setViewMode("kanban");
//   };

//   const [selectedFilters, setSelectedFilters] = useState({
//     status: [],
//     tech: [],
//   });

//   const handleFilterChange = (filters) => {
//     setSelectedFilters(filters);
//   };

//   const FilteredData = () => {
//     if (!Array.isArray(teamsData)) {
//       return [];
//     }

//     const filteredData = teamsData.filter((user) => {
//       const fieldsToSearch = [
//         user.contactId?.name,
//         user.contactId?.email,
//         user.contactId?.phone,
//       ].filter((field) => field !== null && field !== undefined);

//       const matchesSearchQuery = fieldsToSearch.some(
//         (field) =>
//           field &&
//           field.toString().toLowerCase().includes(searchQuery.toLowerCase())
//       );

//       const matchesStatus =
//         selectedFilters.status.length === 0 ||
//         selectedFilters.status.includes(user.contactId?.technology?.[0]);

//       const matchesTech =
//         selectedFilters.tech.length === 0 ||
//         user.contactId?.skills?.some((skill) =>
//           selectedFilters.tech.includes(skill.skill)
//         );

//       return matchesSearchQuery && matchesStatus && matchesTech;
//     });

//     return filteredData;
//   };

//   const nextPage = () => {
//     if (currentPage < totalPages - 1) {
//       setCurrentPage(currentPage + 1);
//       setActiveArrow("next");
//     }
//   };

//   const rowsPerPage = 10;

//   const [isMenuOpen, setMenuOpen] = useState(false);

//   const toggleMenu = () => {
//     setMenuOpen(!isMenuOpen);
//   };

//   const [isFilterActive, setIsFilterActive] = useState(false);

//   const handleFilterIconClick = () => {
//     if (teamsData.length !== 0) {
//       setIsFilterActive((prev) => !prev);
//       toggleMenu();
//     }
//   };

//   const [currentPage, setCurrentPage] = useState(0);
//   const totalPages = Math.ceil(FilteredData().length / rowsPerPage);

//   useEffect(() => {
//     setCurrentPage(0);
//   }, [selectedFilters]);

//   const handleSearchInputChange = (event) => {
//     setSearchQuery(event.target.value);
//     setCurrentPage(0);
//   };

//   const prevPage = () => {
//     if (currentPage > 0) {
//       setCurrentPage(currentPage - 1);
//       setActiveArrow("prev");
//     }
//   };

//   const [activeArrow, setActiveArrow] = useState(null);

//   const [tableVisible] = useState(true);

//   const [actionViewMore, setActionViewMore] = useState(null);

//   const handleStatusUpdate = async (id, newStatus, currentStatus) => {
//     if (currentStatus !== "inprogress") {
//       console.log("Status can only be updated if it's 'inprogress'");
//       return;
//     }

//     try {
//       await axios.patch(`${config.REACT_APP_API_URL}/interviewrequest/${id}`, {
//         status: newStatus,
//       });
//       console.log(`Request ${newStatus} successfully!`);
//       window.location.reload();
//     } catch (error) {
//       console.error("Error updating status:", error);
//     }
//   };

//   const toggleActionMenu = (id) => {
//     setActionViewMore((prevId) => (prevId === id ? null : id));
//   };

//   return (
//     <React.Fragment>
//       <div className="fixed top-16 sm:top-20 md:top-24 left-0 right-0">
//         <div className="flex justify-between p-4">
//           <div>
//             <span className="text-lg font-semibold">Interview Requests</span>
//           </div>
//         </div>
//       </div>
//       <div className="fixed top-28 sm:top-32 md:top-36 left-0 right-0">
//         <div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end sm:float-end p-4 ">
//           <div className="flex items-center sm:hidden md:hidden">
//             <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
//               <span onClick={handleListViewClick}>
//                 <FaList
//                   className={`text-xl mr-4 ${
//                     viewMode === "list" ? "text-custom-blue" : ""
//                   }`}
//                 />
//               </span>
//             </Tooltip>
//             <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
//               <span onClick={handleKanbanViewClick}>
//                 <TbLayoutGridRemove
//                   className={`text-xl ${
//                     viewMode === "kanban" ? "text-custom-blue" : ""
//                   }`}
//                 />
//               </span>
//             </Tooltip>
//           </div>
//           <div className="flex items-center">
//             <div className="relative">
//               <div className="searchintabs border rounded-md relative">
//                 <div className="absolute inset-y-0 left-0 flex items-center">
//                   <button type="submit" className="p-2">
//                     <IoMdSearch className="text-custom-blue" />
//                   </button>
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search by Name, Email, Phone."
//                   value={searchQuery}
//                   onChange={handleSearchInputChange}
//                   className="rounded-full border h-8"
//                 />
//               </div>
//             </div>
//             <div>
//               <span className="p-2 text-xl sm:text-sm md:text-sm">
//                 {currentPage + 1}/{totalPages}
//               </span>
//             </div>
//             <div className="flex">
//               <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
//                 <span
//                   className={`border p-2 mr-2 text-xl sm:text-md md:text-md ${
//                     currentPage === 0 ? "cursor-not-allowed" : ""
//                   } ${activeArrow === "prev" ? "text-custom-blue" : ""}`}
//                   onClick={prevPage}
//                   disabled={currentPage === 0}
//                 >
//                   <IoIosArrowBack className="text-custom-blue" />
//                 </span>
//               </Tooltip>

//               <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
//                 <span
//                   className={`border p-2 text-xl sm:text-md md:text-md ${
//                     currentPage === totalPages - 1 ? "cursor-not-allowed" : ""
//                   } ${activeArrow === "next" ? "text-custom-blue" : ""}`}
//                   onClick={nextPage}
//                   disabled={currentPage === totalPages - 1}
//                 >
//                   <IoIosArrowForward className="text-custom-blue" />
//                 </span>
//               </Tooltip>
//             </div>
//             <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
//               <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
//                 <span
//                   onClick={handleFilterIconClick}
//                   style={{
//                     opacity: teamsData.length === 0 ? 0.2 : 1,
//                     pointerEvents: teamsData.length === 0 ? "none" : "auto",
//                   }}
//                 >
//                   {isFilterActive ? (
//                     <LuFilterX className="text-custom-blue" />
//                   ) : (
//                     <FiFilter className="text-custom-blue" />
//                   )}
//                 </span>
//               </Tooltip>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="fixed left-0 right-0 mx-auto z-10 sm:top-44 md:top-52 lg:top-48 xl:top-48 2xl:top-48">
//         {tableVisible && (
//           <div>
//             {viewMode === "list" ? (
//               <div className="sm:hidden md:hidden lg:flex xl:flex 2xl:flex">
//                 <div
//                   className="flex-grow"
//                   style={{ marginRight: isMenuOpen ? "290px" : "0" }}
//                 >
//                   <div className="relative h-[calc(100vh-200px)] flex flex-col">
//                     <div className="flex-grow overflow-y-auto pb-4">
//                       <table className="text-left w-full border-collapse border-gray-300 mb-14">
//                         <thead className="bg-custom-bg  sticky top-0 z-10 text-xs">
//                           <tr>
//                             {Organization === "false" ? (
//                               <>
//                                 <th scope="col" className="py-3 px-6">
//                                   Position
//                                 </th>
//                                 <th scope="col" className="py-3 px-6">
//                                   Skill set
//                                 </th>
//                                 <th scope="col" className="py-3 px-6">
//                                   Date & Time
//                                 </th>
//                                 <th scope="col" className="py-3 px-6">
//                                   Duration
//                                 </th>
//                                 <th scope="col" className="py-3 px-6">
//                                   Status
//                                 </th>
//                                 <th scope="col" className="py-3 pl-10">
//                                   Actions
//                                 </th>
//                               </>
//                             ) : (
//                               <>
//                                 <th scope="col" className="py-3 px-6">
//                                   Interview Id
//                                 </th>
//                                 <th scope="col" className="py-3 px-6">
//                                   Interviewer Type
//                                 </th>
//                                 <th scope="col" className="py-3 px-6">
//                                   Interviewer Name
//                                 </th>
//                                 <th scope="col" className="py-3 px-6">
//                                   Position
//                                 </th>
//                                 <th scope="col" className="py-3 px-6">
//                                   Status
//                                 </th>
//                                 <th scope="col" className="py-3 pl-10">
//                                   Requested At
//                                 </th>
//                                 <th scope="col" className="py-3 pl-10">
//                                   Responded At
//                                 </th>
//                                 <th scope="col" className="py-3 pl-10">
//                                   Action
//                                 </th>
//                               </>
//                             )}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {loading ? (
//                             <tr>
//                               <td colSpan="7" className="py-28 text-center">
//                                 <div className="wrapper12">
//                                   <div className="circle12"></div>
//                                   <div className="circle12"></div>
//                                   <div className="circle12"></div>
//                                   <div className="shadow12"></div>
//                                   <div className="shadow12"></div>
//                                   <div className="shadow12"></div>
//                                 </div>
//                               </td>
//                             </tr>
//                           ) : teamsData.length === 0 ? (
//                             <tr>
//                               <td colSpan="8" className="py-10 text-center">
//                                 <div className="flex flex-col items-center justify-center p-5">
//                                   <p className="text-9xl rotate-180 text-custom-blue"></p>
//                                   <p className="text-center text-lg font-normal">
//                                     You don't have team yet. Create new team.
//                                   </p>
//                                 </div>
//                               </td>
//                             </tr>
//                           ) : (
//                             teamsData.map((teams) => (
//                               <tr
//                                 key={teams._id}
//                                 className="bg-white border-b cursor-pointer text-xs"
//                               >
//                                 {Organization === "false" ? (
//                                   <>
//                                     <td className="py-2 px-6">
//                                       {teams.positionId?.title}
//                                       {/* {teams.positionId} */}
//                                     </td>
//                                     <td className="py-2 px-6">
//                                       {teams.candidateId.skills
//                                         .map((eachSkill) => eachSkill.skill)
//                                         .join(" ")}
//                                     </td>
//                                     <td className="py-2 px-6">
//                                       {teams.dateTime}
//                                     </td>
//                                     <td className="py-2 px-6">
//                                       {teams.duration}
//                                     </td>
//                                     <td className="py-2 px-6">
//                                       {teams.status}
//                                     </td>
//                                     <td className="py-2 px-6 relative">
//                                       <button
//                                         onClick={() =>
//                                           toggleActionMenu(teams._id)
//                                         }
//                                       >
//                                         <FiMoreHorizontal className="text-3xl" />
//                                       </button>

//                                       {actionViewMore === teams._id && (
//                                         <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
//                                           <p
//                                             className="hover:bg-green-200 p-1 rounded pl-3 cursor-pointer"
//                                             onClick={() =>
//                                               handleStatusUpdate(
//                                                 teams._id,
//                                                 "accepted",
//                                                 teams.status
//                                               )
//                                             }
//                                           >
//                                             Accept
//                                           </p>
//                                           <p
//                                             className="hover:bg-red-200 p-1 rounded pl-3 cursor-pointer"
//                                             onClick={() =>
//                                               handleStatusUpdate(
//                                                 teams._id,
//                                                 "declined",
//                                                 teams.status
//                                               )
//                                             }
//                                           >
//                                             Decline
//                                           </p>
//                                         </div>
//                                       )}
//                                     </td>
//                                   </>
//                                 ) : (
//                                   <>
//                                     <td className="py-2 px-6">
//                                       {teams.scheduledInterviewId}
//                                     </td>
//                                     <td className="py-2 px-6">
//                                       {teams.interviewerType}
//                                     </td>
//                                     <td className="py-2 px-6">
//                                       {teams.interviewerIds.map(
//                                         (interviewer) => (
//                                           <div key={interviewer._id}>
//                                             {interviewer.name}
//                                           </div>
//                                         )
//                                       )}
//                                     </td>
//                                     <td className="py-2 px-6">
//                                       {teams.positionId?.title}
//                                     </td>
//                                     <td className="py-2 px-6">
//                                       {teams.status}
//                                     </td>
//                                     <td className="py-2 px-6">
//                                       {new Date(
//                                         teams.requestedAt
//                                       ).toLocaleDateString("en-GB", {
//                                         day: "2-digit",
//                                         month: "2-digit",
//                                         year: "numeric",
//                                       })}{" "}
//                                       {new Date(
//                                         teams.requestedAt
//                                       ).toLocaleTimeString([], {
//                                         hour: "2-digit",
//                                         minute: "2-digit",
//                                         hour12: true,
//                                       })}
//                                     </td>
//                                     <td className="py-2 px-6"></td>
//                                     <td className="py-2 px-6">
//                                       <div>
//                                         <button
//                                         //   onClick={() =>
//                                         //     toggleAction(interview._id)
//                                         //   }
//                                         >
//                                           <FiMoreHorizontal className="text-3xl" />
//                                         </button>
//                                         {/* {actionViewMore === interview._id && (
//                                           <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
//                                             <div className="space-y-1">
//                                               {objectPermissions.View && (
//                                                 <p
//                                                   className="hover:bg-gray-200 p-1 rounded pl-3"
//                                                   onClick={() =>
//                                                     handleInterviewClick(
//                                                       interview._id
//                                                     )
//                                                   }
//                                                 >
//                                                   View
//                                                 </p>
//                                               )}

//                                               {interview.ScheduleType !==
//                                                 "instantinterview" && (
//                                                   <>
//                                                     {objectPermissions.Edit && (
//                                                       <p
//                                                         className="hover:bg-gray-200 p-1 rounded pl-3"
//                                                         onClick={() =>
//                                                           handleEditClick(interview)
//                                                         }
//                                                       >
//                                                         Reschedule
//                                                       </p>
//                                                     )}
//                                                     <p
//                                                       className="hover:bg-gray-200 p-1 rounded pl-3"
//                                                       onClick={() =>
//                                                         handleUpdate(
//                                                           interview._id,
//                                                           interview.ScheduleType
//                                                         )
//                                                       }
//                                                     >
//                                                       Cancel
//                                                     </p>
//                                                   </>
//                                                 )}
//                                             </div>
//                                           </div>
//                                         )} */}
//                                       </div>
//                                     </td>
//                                   </>
//                                 )}
//                               </tr>
//                             ))
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//                 <OffcanvasMenu
//                   isOpen={isMenuOpen}
//                   closeOffcanvas={handleFilterIconClick}
//                   onFilterChange={handleFilterChange}
//                 />
//               </div>
//             ) : (
//               <div className="flex">
//                 <div
//                   className="flex-grow"
//                   style={{ marginRight: isMenuOpen ? "290px" : "0" }}
//                 >
//                   <div className="flex-grow h-[calc(100vh-200px)] overflow-y-auto pb-10 right-0 sm:mt-10 md:mt-10">
//                     <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 px-4"></div>
//                   </div>
//                 </div>
//                 <OffcanvasMenu
//                   isOpen={isMenuOpen}
//                   closeOffcanvas={handleFilterIconClick}
//                   onFilterChange={handleFilterChange}
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </React.Fragment>
//   );
// };

// export default InternalRequest;

import { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useMediaQuery } from "react-responsive";
import Loading from "../../Components/SuperAdminComponents/Loading/Loading.jsx";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../Pages/Interview-Request/InterviewKanban.jsx";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";
import {
  Eye,
  // Mail,
  // UserCircle,
  Pencil,
  ChevronUp,
  ChevronDown,
  // Phone,
  // GraduationCap,
  // School,
  // ExternalLink,
  // X,
  Briefcase,
  // User,
  Calendar,
} from "lucide-react";
import { GiDuration } from "react-icons/gi";
import { CiSquareQuestion } from "react-icons/ci";
import { GrStatusGoodSmall } from "react-icons/gr";

import axios from "axios";
import { config } from "../../config.js";
import SidebarPopup from "../../Components/SuperAdminComponents/SidebarPopup/SidebarPopup.jsx";
import { usePermissions } from "../../Context/PermissionsContext.js";

const InternalRequest = () => {
  const { superAdminPermissions } = usePermissions();
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  // const [editModeOn, setEditModeOn] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    currentStatus: "",
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null); // Ref for filter icon
  const [isLoading, setIsLoading] = useState(false);

  const [interviewRequests, setInterviewRequests] = useState([]);

  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedCurrentStatus, setCurrentStatus] = useState("inProgress");

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCurrentStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setCurrentStatus(selectedFilters.currentStatus);
      setIsCurrentStatusOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      currentStatus: "",
    };
    setSelectedStatus([]);
    setCurrentStatus("");
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      currentStatus: selectedCurrentStatus,
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 || filters.currentStatus.length > 0
    );
    setFilterPopupOpen(false);
  };

  useEffect(() => {
    document.title = "Tenants | Admin Portal";
  }, []);

  // Setting view
  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  // Fetch interview requests
  useEffect(() => {
    const getInterviewRequests = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/interviewrequest`
        );
        setInterviewRequests(response.data);
      } catch (error) {
        console.error("Error fetching Interview requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInterviewRequests();
  }, []);

  // Fetch interview request
  useEffect(() => {
    const getInterviewRequests = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/interviewrequest/${selectedRequestId}`
        );
        setSelectedRequest(response.data);
      } catch (error) {
        console.error("Error fetching Interviewer request:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInterviewRequests();
  }, [selectedRequestId]);

  // get user by ID
  useEffect(() => {
    if (selectedRequestId && interviewRequests?.length) {
      const foundRequest = interviewRequests.find(
        (request) => request._id === selectedRequestId
      );
      setSelectedRequest(foundRequest || null);
    }
  }, [selectedRequestId, interviewRequests]);

  const dataToUse = interviewRequests;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((request) => {
      const fieldsToSearch = [
        request?.firstName,
        request?.lastName,
        request?.Email,
        request?.Phone,
        request?.company,
        request?.status,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(request.status);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus;
    });
  };

  // Pagination
  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData()?.length / rowsPerPage);
  const nextPage = () => {
    if ((currentPage + 1) * rowsPerPage < FilteredData()?.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData()?.length);

  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };

  // if (isLoading) {
  //   return <Loading />;
  // }

  // if (!interviewRequests || interviewRequests.length === 0) {
  //   return <div>No tenants found.</div>;
  // }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  // Table Columns
  const tableColumns = [
    ...(superAdminPermissions?.InterviewRequest?.View
      ? [
          {
            key: "interviewerId",
            header: "Interviewer ID",
            render: (vale, row) => (
              <span
                className="text-sm font-medium text-custom-blue cursor-pointer"
                onClick={() => {
                  setSelectedRequestId(row._id);
                  setIsPopupOpen(true);
                }}
              >
                {row?.interviewRequestCode ? row.interviewRequestCode : "N/A"}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "interviewerTyp",
      header: "Interviewer Type",
      render: (value, row) => <span>{row.interviewerType}</span>,
    },
    {
      key: "interviewerName",
      header: "Interviewer Name",
      render: (value, row) => (
        <span>{row.interviewerName ? row.interviewerName : "N/A"}</span>
      ),
    },
    {
      key: "position",
      header: "Position",
      render: (value, row) => (
        <span>{row.position ? row.position : "N/A"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge status={capitalizeFirstLetter(row.status)} />
      ),
    },
    {
      key: "requestedAt",
      header: " Requested At",
      render: (value, row) => (
        <span>{row ? formatDate(row?.requestedAt) : "N/A"}</span>
      ),
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    ...(superAdminPermissions?.InterviewRequest?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-blue-600" />,
            onClick: (row) => {
              setSelectedRequestId(row._id);
              setIsPopupOpen(true);
            },
          },
        ]
      : []),
    // {
    //   key: "360-view",
    //   label: "360° View",
    //   icon: <requestCircle className="w-4 h-4 text-purple-600" />,
    //   onClick: (row) => row?._id && navigate(`/tenants/${row._id}`),
    // },
    ...(superAdminPermissions?.InterviewRequest?.Edit
      ? [
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => navigate(`edit/${row._id}`),
          },
        ]
      : []),
    // {
    //   key: "resend-link",
    //   label: "Resend Link",
    //   icon: <Mail className="w-4 h-4 text-blue-600" />,
    //   disabled: (row) => row.status === "completed",
    // },
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [
    {
      key: "interviewerTyp",
      header: "Interviewer Type",
      render: (value, row) => (
        <div className="font-medium">{row.interviewerType || "N/A"}</div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge status={capitalizeFirstLetter(value)} />
      ),
    },
  ];

  // Shared Actions Configuration for Table and Kanban
  const actions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        setSelectedRequestId(row._id);
        setIsPopupOpen(true);
      },
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
    // {
    //   key: "login-as-user",
    //   label: "Login as User",
    //   icon: <AiOutlineUser className="w-4 h-4 text-blue-600" />,
    //   onClick: (row) => handleLoginAsUser(row._id),
    // },
  ];

  // Render Actions for Kanban
  const renderKanbanActions = (item) => (
    <div className="flex items-center gap-1">
      {actions.map((action) => (
        <button
          key={action.key}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item);
          }}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title={action.label}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );

  // Render Filter Content
  const renderFilterContent = () => {
    const statusOptions = ["accepted", "inprogress"];

    return (
      <div className="space-y-3">
        {/* Current Status Section */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsCurrentStatusOpen(!isCurrentStatusOpen)}
          >
            <span className="font-medium text-gray-700">Current Status</span>
            {isCurrentStatusOpen ? (
              <ChevronUp className="text-xl text-gray-700" />
            ) : (
              <ChevronDown className="text-xl text-gray-700" />
            )}
          </div>
          {isCurrentStatusOpen && (
            <div className="mt-1 space-y-2 pl-2">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="mt-2 border border-gray-200 rounded-md p-2 space-y-2">
                    {statusOptions.map((status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-2 cursor-pointer text-sm capitalize"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatus.includes(status)}
                          onChange={() => handleCurrentStatusToggle(status)}
                          className="accent-custom-blue"
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Popup content
  const renderPopupContent = (request) => {
    return (
      <div className="px-4">
        <div className="rounded-sm px-4 w-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div className="flex justify-center items-center  gap-4 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                    {request?.interviewRequestCode?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {request?.interviewRequestCode
                      ? request.interviewRequestCode
                      : "N/A"}
                  </h3>

                  <p className="text-gray-600 mt-1">
                    {formatDate(request?.dateTime ? request?.dateTime : "N/A")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Interview Details
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Requested Date
                            </p>
                            <p className="text-gray-700">
                              {formatDate(request?.requestedAt) || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Date of Expiry
                            </p>
                            <p className="text-gray-700">
                              {formatDate(request?.expiryDateTime) || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <GiDuration className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="text-gray-700">
                              {request?.duration || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-custom-bg rounded-lg">
                              <Briefcase className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Interviewer Type
                              </p>
                              <p className="text-gray-700">
                                {request?.interviewerType || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-custom-bg rounded-lg">
                              <GrStatusGoodSmall className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p className="text-gray-700 truncate">
                                {(
                                  <StatusBadge
                                    status={capitalizeFirstLetter(
                                      request?.status
                                    )}
                                  />
                                ) || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-custom-bg rounded-lg">
                              <CiSquareQuestion className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Request Message
                              </p>
                              <p className="text-gray-700 truncate">
                                {request?.requestMessage || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed top-12 sm:top-12 md:top-12 left-0 right-0">
        <div className="flex justify-between p-4">
          <div>
            <span className="text-lg font-semibold text-custom-blue">
              Interview Requests
            </span>
          </div>
        </div>
      </div>
      <div className="fixed top-28 sm:top-32 md:top-36 left-0 right-0 px-4">
        {/* Toolbar */}
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
          dataLength={dataToUse?.length}
          searchPlaceholder="Search requests..."
          filterIconRef={filterIconRef} // Pass ref to Toolbar
        />
      </div>

      <div className="fixed left-0 right-0 mx-auto z-10 sm:top-44 md:top-52 lg:top-48 xl:top-48 2xl:top-48">
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {view === "table" ? (
              <div className="w-full mb-8 bg-red">
                <TableView
                  data={currentFilteredRows}
                  columns={tableColumns}
                  loading={isLoading}
                  actions={tableActions}
                  emptyState="No Tenants found."
                />
              </div>
            ) : (
              <div className="w-full">
                <KanbanView
                  data={currentFilteredRows.map((interview) => ({
                    ...interview,
                    id: interview._id,
                    title: interview.interviewRequestCode || "N/A",
                    subtitle: formatDate(interview?.requestedAt) || "N/A",
                  }))}
                  columns={kanbanColumns}
                  loading={isLoading}
                  renderActions={renderKanbanActions}
                  emptyState="No interviewer requests found."
                />
              </div>
            )}

            {/* FilterPopup */}
            <FilterPopup
              isOpen={isFilterPopupOpen}
              onClose={() => setFilterPopupOpen(false)}
              onApply={handleApplyFilters}
              onClearAll={handleClearAll}
              filterIconRef={filterIconRef}
            >
              {renderFilterContent()}
            </FilterPopup>
          </motion.div>
        </div>
      </div>

      <div>
        {isPopupOpen && selectedRequest && (
          <SidebarPopup title="Interview" onClose={() => setIsPopupOpen(false)}>
            {renderPopupContent(selectedRequest)}
          </SidebarPopup>
        )}
      </div>
      <Outlet />
    </>
  );
};

export default InternalRequest;
